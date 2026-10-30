// Clip animation for the 3D players: CMU motion capture retargeted in Blender (art-src/blender/anim/retarget_cmu.py)
// and clips keyed by hand (art-src/anim/keyed.mjs), streamed in the HQ "anims" package (tools/build-anims.mjs).
//
// A clip stores, per bone and frame, the same rotation players3d.js applyPose takes: a turn in the character's own
// frame (x = its left, y = up, z = forward) on top of the rest pose, composed down the hierarchy. So one clip
// drives the HQ bodies and the lite mannequins alike, and blends with the procedural poses.
//
// Per player and frame (mix): a locomotion base (stance ↔ jog ↔ run by speed with one shared stride phase, or the
// defensive slide), an upper-body layer (the dribble, synced to the sim's bounce), then one-shots (jumper timed by
// the shot meter, layup or dunk by the sim's shot type, pass, steal, block, celebrations) crossfaded in and out.
// Display only: nothing here feeds back into the rules.
/* global THREE */

export const MASKS = {};
export const BONES19 = ['hips', 'spine', 'chest', 'neck', 'head', 'clavicle_L', 'clavicle_R', 'upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R',
  'hand_L', 'hand_R', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'foot_L', 'foot_R'];
const MIRROR = Object.fromEntries(BONES19.map((n) => [n, n.endsWith('_L') ? n.slice(0, -1) + 'R' : n.endsWith('_R') ? n.slice(0, -1) + 'L' : n]));
const UPPER = { spine: 0.5, chest: 1, neck: 0.6, head: 0.4, clavicle_L: 1, clavicle_R: 1, upperarm_L: 1, upperarm_R: 1, forearm_L: 1, forearm_R: 1, hand_L: 1, hand_R: 1 };
const ARM_R = { clavicle_R: 1, upperarm_R: 1, forearm_R: 1, hand_R: 1, chest: 0.35, spine: 0.2 };
const LOWER = { hips: 1, thigh_L: 1, thigh_R: 1, shin_L: 1, shin_R: 1, foot_L: 1, foot_R: 1 };
const ALL = Object.fromEntries(BONES19.map((n) => [n, 1]));

export const A = { clips: null, mode: 'mixer', lab: null, seen: new Set(), stats: { players: 0, ms: 0 } };

// pkg: { 'anims.json': header, 'anims.bin': ArrayBuffer } → clips { name: { n, fps, dur, loop, speed, q: {bone: Float32Array}, dy, c, marks } }
export function loadAnims(pkg) {
  const head = pkg['anims.json'], bin = pkg['anims.bin'];
  const i16 = new Int16Array(bin);
  const clips = {};
  for (const [name, h] of Object.entries(head.clips)) {
    const q = {};
    for (const [bone, off] of Object.entries(h.q)) {
      const a = new Float32Array(h.n * 4);
      for (let k = 0; k < a.length; k++) a[k] = i16[off + k] / 32767;
      q[bone] = a;
    }
    clips[name] = { name, n: h.n, fps: h.fps, dur: h.n / h.fps, loop: h.loop, speed: h.speed || 0, q, dy: h.dy ? Float32Array.from(h.dy) : null, c: h.c || null, marks: h.marks || {} };
  }
  A.clips = clips;
  return clips;
}
export const animsReady = () => !!A.clips && A.mode === 'mixer';

// ---------------------------------------------------------------- poses
// A pose: one quaternion per bone (identity = rest), a hips height change (model metres) and foot contacts.
export function makePose() {
  const q = {};
  for (const n of BONES19) q[n] = new THREE.Quaternion();
  return { q, dy: 0, c: 0 };
}
function readQ(clip, bone, f, out) {
  const a = clip.q[bone];
  if (!a) { out.x = out.y = out.z = 0; out.w = 1; return out; }
  const k = f * 4;
  out.x = a[k]; out.y = a[k + 1]; out.z = a[k + 2]; out.w = a[k + 3];
  return out;
}
const _q0 = { x: 0, y: 0, z: 0, w: 1 }, _q1 = { x: 0, y: 0, z: 0, w: 1 };
let _qb = null;
let _e = null;
// sample a clip at time t (seconds) into pose; mirror swaps sides and reflects the turns across the body's midline
export function sampleClip(clip, t, pose, mirror = false) {
  let u = t * clip.fps;
  const n = clip.n;
  if (!_qb) { _qb = new THREE.Quaternion(); _e = new THREE.Euler(); }
  if (clip.loop) { u %= n; if (u < 0) u += n; } else u = Math.max(0, Math.min(n - 1, u));
  const f0 = Math.floor(u), f1 = clip.loop ? (f0 + 1) % n : Math.min(n - 1, f0 + 1), w = u - f0;
  for (const n2 of BONES19) {
    const src = mirror ? MIRROR[n2] : n2;
    readQ(clip, src, f0, _q0); readQ(clip, src, f1, _q1);
    const o = pose.q[n2];
    o.set(_q0.x, _q0.y, _q0.z, _q0.w);
    _qb.set(_q1.x, _q1.y, _q1.z, _q1.w);
    o.slerp(_qb, w);
    if (mirror) { o.y = -o.y; o.z = -o.z; }
  }
  pose.dy = clip.dy ? clip.dy[f0] + (clip.dy[f1] - clip.dy[f0]) * w : 0;
  let c = clip.c ? clip.c[w < 0.5 ? f0 : f1] : 0;
  if (mirror) c = ((c & 1) << 1) | ((c >> 1) & 1);
  pose.c = c;
  return pose;
}
// out ← out blended toward src by w (per-bone mask weights, 1 when no mask)
export function blendPose(out, src, w, mask = ALL) {
  if (w <= 0) return out;
  for (const n of BONES19) {
    const m = mask[n]; if (!m) continue;
    out.q[n].slerp(src.q[n], Math.min(1, w * m));
  }
  const ml = mask === UPPER || mask === ARM_R ? 0 : 1;
  out.dy += (src.dy - out.dy) * Math.min(1, w * ml);
  if (w * ml >= 0.5) out.c = src.c;
  return out;
}
export function copyPose(out, src) { for (const n of BONES19) out.q[n].copy(src.q[n]); out.dy = src.dy; out.c = src.c; return out; }

// an extra turn (model-frame Euler, YXZ) on top of a bone's clip turn
function addTurn(q, x, y, z) { _e.set(x, y, z, 'YXZ'); _qb.setFromEuler(_e); q.premultiply(_qb); }

// ---------------------------------------------------------------- the per-player blend tree
const smooth = (t) => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function angDiff(a, b) { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

// the one-shot a sim action asks for (null: none)
function shotFor(ctx) {
  const pl = ctx.pl, act = pl.act;
  if (act === 'shoot') return 'jumper';
  if (act === 'layup') return pl.stype === 'dunk' ? (ctx.hash & 1 ? 'dunk2' : 'dunk1') : 'layup';
  if (act === 'jump') return 'block';
  if (act === 'pass') return 'pass';
  if (act === 'steal') return 'steal';
  if (act === 'celebrate') return ['celebrate1', 'celebrate2', 'celebrate3'][ctx.hash % 3];
  return null;
}

// st: the player's animation state (created on first use). Returns the pose for this frame, or null when the clips
// aren't loaded (the caller keeps the procedural pose).
export function mix(st, ctx, scale) {
  if (!animsReady()) return null;
  const C = A.clips;
  const t0 = performance.now();
  if (!st.mx) st.mx = { phase: Math.random(), base: makePose(), tmp: makePose(), up: makePose(), oneW: 0, oneName: '', oneTime: 0, relT: null, prevLat: 0, xo: false, xoT: 0 };
  const M = st.mx, pl = ctx.pl, dt = ctx.dt;
  // velocity in the body frame (forward along the heading, lateral to its left)
  const vx = pl.vx || 0, vz = pl.vz || 0, sp = Math.hypot(vx, vz);
  const fwd = vx * Math.sin(st.head) + vz * Math.cos(st.head), lat = vx * Math.cos(st.head) - vz * Math.sin(st.head);
  // game feet → model metres for this player
  const spM = sp / scale;
  const air = (pl.y || 0) > 0.05;
  const base = M.base, tmp = M.tmp;
  // the pose lab (tools/anim-lab.mjs): every player holds one clip frame
  if (A.lab && C[A.lab.clip]) { sampleClip(C[A.lab.clip], A.lab.t, base, !!A.lab.mirror); if (air) base.dy = Math.min(0, base.dy); return base; }
  // ---- locomotion
  const slide = ctx.defending && !ctx.chasing && Math.abs(lat) > Math.abs(fwd) * 0.8;
  if (slide && C.slide) {
    const s = C.slide, rate = clamp(Math.abs(lat) / scale / Math.max(0.3, s.speed), 0, 2.2);
    M.phase += rate * dt / s.dur;
    // the take's performer steps to their right (mirror for a slide to the left)
    sampleClip(s, M.phase * s.dur, base, lat > 0);
    sampleClip(C.dstance || C.stance, st.t, tmp);
    blendPose(base, tmp, 1 - smooth(clamp(Math.abs(lat) / 4, 0, 1)), LOWER);
  } else {
    const jog = C.jog, run = C.run;
    const wRun = smooth(clamp((spM - jog.speed) / Math.max(0.1, run.speed - jog.speed), 0, 1));
    // one shared phase, advanced by ground covered per stride of the blended clip
    const stride = (jog.speed * jog.dur) * (1 - wRun) + (run.speed * run.dur) * wRun;
    const dir = fwd < -2 && !ctx.hasBall ? -1 : 1; // backpedal: the jog runs backwards
    M.phase += dir * spM * dt / Math.max(0.5, stride);
    sampleClip(jog, M.phase * jog.dur, base);
    if (wRun > 0) { sampleClip(run, M.phase * run.dur, tmp); blendPose(base, tmp, wRun); }
    const wStand = 1 - smooth(clamp((spM - 0.25) / 1.2, 0, 1));
    // standing: the keyed idle, or the defender's low stance
    const still = ctx.defending && !ctx.chasing && C.dstance ? C.dstance : C.idle || C.stance;
    if (wStand > 0) { sampleClip(still, st.t, tmp); blendPose(base, tmp, wStand); }
  }
  // ---- the dribble, on the upper body, in time with the ball's bounce (sim: ball height = |sin(dp)|)
  if (ctx.hasBall && !ctx.holdBall && C.dribble) {
    const ph = ctx.dribblePhase != null ? ctx.dribblePhase : (st.t * 1.35) % 1;
    // the clip's hand top is its first frame; the ball tops out at phase 0.5
    sampleClip(C.dribble, ((ph + 0.5) % 1) * C.dribble.dur, tmp);
    // the performer bounced it in front of the belly: the dribbling arm moves out to the side
    _e.set(-0.12, 0, -0.5, 'YXZ'); _qb.setFromEuler(_e); tmp.q.upperarm_R.premultiply(_qb);
    _e.set(0, 0.35, 0, 'YXZ'); _qb.setFromEuler(_e); tmp.q.forearm_R.premultiply(_qb);
    blendPose(base, tmp, 1, UPPER);
    // a crossover when the handler cuts back across the body
    if (C.crossover && Math.sign(lat) !== Math.sign(M.prevLat) && Math.abs(lat) > 6 && Math.abs(M.prevLat) > 6 && M.xoT <= 0) { M.xoT = C.crossover.dur / 1.6; M.xo = lat > 0; }
  }
  if (Math.abs(lat) > 2) M.prevLat = lat;
  if (M.xoT > 0 && ctx.hasBall && C.crossover) {
    M.xoT -= dt;
    const T = C.crossover.dur / 1.6, u = 1 - M.xoT / T, w = smooth(clamp(Math.min(u, 1 - u) * 6, 0, 1));
    sampleClip(C.crossover, u * C.crossover.dur, tmp, !!M.xo);
    blendPose(base, tmp, w, UPPER);
  } else M.xoT = 0;
  // ---- one-shots
  const want = shotFor(ctx);
  if (want && C[want]) {
    if (want !== M.oneName) { M.oneName = want; M.oneTime = 0; M.relT = null; A.seen.add(want); }
    M.oneW = Math.min(1, M.oneW + dt / 0.12);
  } else {
    M.oneW = Math.max(0, M.oneW - dt / 0.15);
    if (M.oneW === 0) M.oneName = '';
  }
  if (M.oneW > 0 && M.oneName) {
    const clip = C[M.oneName], mk = clip.marks;
    M.oneTime += dt;
    let t;
    if (M.oneName === 'jumper' || M.oneName === 'layup' || M.oneName.startsWith('dunk')) {
      // up to the release the shot meter sets the clip time; after it, real time to the landing
      const a = mk.start || 0, r = mk.release != null ? mk.release : clip.dur * 0.6;
      if (!ctx.released && want) { t = a + (r - a) * clamp(ctx.meterF, 0, 1); M.relT = t; M.post = 0; }
      else {
        // the follow-through holds: a tenth of a second at speed, then a third of speed down to the landing
        if (M.relT == null) { M.relT = r; M.post = 0; }
        M.post += dt;
        // an early release still reaches the set point (in 0.08 s) before the follow-through
        const rr = Math.max(M.relT, r), q = Math.min(1, M.post / 0.08);
        t = q < 1 ? M.relT + (rr - M.relT) * q : rr + Math.min(M.post - 0.08, 0.1) + Math.max(0, M.post - 0.18) * 0.3;
      }
    } else t = (mk.start || 0) + M.oneTime;
    sampleClip(clip, t, tmp);
    // the sim flies the body (pl.y); the clip only crouches it
    if (air || mk.noLift) tmp.dy = Math.min(0, tmp.dy);
    const mask = clip.mask === 'upper' ? UPPER : clip.mask === 'armR' ? ARM_R : ALL;
    blendPose(base, tmp, smooth(M.oneW), mask);
  }
  if (air && !M.oneName) base.dy = Math.min(0, base.dy);
  A.stats.ms += performance.now() - t0; A.stats.players++;
  return base;
}
Object.assign(MASKS, { UPPER, LOWER, ARM_R, ALL });
