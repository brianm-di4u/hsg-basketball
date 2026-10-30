// Builds the HQ "anims" package: the retargeted CMU clips (art-src/anim/cmu-clips.json, written by
// art-src/blender/anim/retarget_cmu.py) and the hand-keyed clips (art-src/anim/keyed.mjs) baked at 30 fps, as
// assets/hq/anims.<hash>.json (clip headers) + anims.<hash>.bin (int16 quaternions), and updates the manifest.
//
//   node tools/build-anims.mjs            (tools/build-hq.mjs also runs it)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HQ = path.join(ROOT, 'assets', 'hq');
const FPS = 30;
const BONES = ['hips', 'spine', 'chest', 'neck', 'head', 'clavicle_L', 'clavicle_R', 'upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R',
  'hand_L', 'hand_R', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'foot_L', 'foot_R'];
// where the retargeted one-shots start (the sim lifts the body at once) and release, in clip seconds
const CMU_MARKS = { jumper: { start: 0.45, release: 0.8 }, jump: { start: 0.38 } };

// ---- quaternion helpers ([x, y, z, w])
function fromEuler([x, y, z]) { // order YXZ, as THREE.Euler(x, y, z, 'YXZ')
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 - s1 * s2 * c3, c1 * c2 * c3 + s1 * s2 * s3];
}
function slerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  const bb = d < 0 ? (d = -d, b.map((v) => -v)) : b;
  if (d > 0.9995) { const r = a.map((v, i) => v + (bb[i] - v) * t), l = Math.hypot(...r); return r.map((v) => v / l); }
  const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
  return a.map((v, i) => v * wa + bb[i] * wb);
}
const smooth = (t) => t * t * (3 - 2 * t);

function bakeKeyed(name, k, cmu) {
  const base = k.from ? cmu[k.from] : null;
  if (k.from && !base) throw new Error(`${name}: from ${k.from} missing`);
  const n = base ? base.n : Math.round(k.dur * FPS) + (k.loop ? 0 : 1);
  const keys = k.keys.map(([t, pose, dy = 0, c = 3]) => ({ t, q: Object.fromEntries(BONES.map((b) => [b, pose[b] ? fromEuler(pose[b]) : [0, 0, 0, 1]])), named: new Set(Object.keys(pose)), dy, c }));
  const named = new Set(keys.flatMap((kk) => [...kk.named]));
  const q = Object.fromEntries(BONES.map((b) => [b, []])), dy = [], c = [];
  for (let f = 0; f < n; f++) {
    const t = f / FPS;
    let i = 0; while (i < keys.length - 2 && keys[i + 1].t <= t) i++;
    const A = keys[i], B = keys[Math.min(keys.length - 1, i + 1)];
    const u = B.t > A.t ? smooth(Math.max(0, Math.min(1, (t - A.t) / (B.t - A.t)))) : 0;
    for (const b of BONES) {
      if (base && !named.has(b)) { q[b].push(base.q[b].slice(f * 4, f * 4 + 4)); continue; }
      q[b].push(slerp(A.q[b], B.q[b], u));
    }
    dy.push(base ? base.dy[f] : A.dy + (B.dy - A.dy) * u);
    c.push(base ? base.c[f] : (u < 0.5 ? A.c : B.c));
  }
  return { n, fps: FPS, loop: !!k.loop, speed: base ? base.speed : 0, dy, c, marks: k.marks || {}, mask: k.mask, q };
}

export async function buildAnims({ quiet = false } = {}) {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'art-src', 'anim', 'cmu-clips.json'), 'utf8'));
  const { KEYED } = await import(pathToFileURL(path.join(ROOT, 'art-src', 'anim', 'keyed.mjs')).href + '?t=' + Date.now());
  const cmu = {};
  for (const [name, c] of Object.entries(raw)) {
    const q = Object.fromEntries(BONES.map((b) => [b, c.q[b]]));
    cmu[name] = { n: c.n, fps: c.fps, loop: c.loop, speed: c.speed, dy: c.dy, c: c.c, marks: CMU_MARKS[name] || {}, q: Object.fromEntries(BONES.map((b) => [b, Array.from({ length: c.n }, (_, f) => q[b].slice(f * 4, f * 4 + 4))])) };
  }
  const flat = (cl) => ({ ...cl, q: Object.fromEntries(BONES.map((b) => [b, cl.q[b].flat ? cl.q[b].flat() : cl.q[b]])) });
  const clips = {};
  for (const [name, c] of Object.entries(cmu)) clips[name] = c;
  const cmuFlat = Object.fromEntries(Object.entries(cmu).map(([k, v]) => [k, flat(v)]));
  for (const [name, k] of Object.entries(KEYED)) clips[name] = bakeKeyed(name, k, cmuFlat);
  // pack: int16 per component; each track kept on one hemisphere
  const parts = [], head = { fps: FPS, clips: {} };
  let off = 0;
  for (const [name, cl] of Object.entries(clips)) {
    const h = { n: cl.n, fps: cl.fps, loop: cl.loop, speed: +(+cl.speed).toFixed(3), dy: cl.dy.map((v) => +v.toFixed(4)), c: cl.c, marks: cl.marks, q: {} };
    if (cl.mask) h.mask = cl.mask;
    for (const b of BONES) {
      const arr = new Int16Array(cl.n * 4);
      let prev = null;
      for (let f = 0; f < cl.n; f++) {
        let v = cl.q[b][f];
        if (prev && v[0] * prev[0] + v[1] * prev[1] + v[2] * prev[2] + v[3] * prev[3] < 0) v = v.map((x) => -x);
        prev = v;
        for (let j = 0; j < 4; j++) arr[f * 4 + j] = Math.round(Math.max(-1, Math.min(1, v[j])) * 32767);
      }
      h.q[b] = off; off += arr.length; parts.push(arr);
    }
    head.clips[name] = h;
  }
  const bin = Buffer.concat(parts.map((a) => Buffer.from(a.buffer)));
  const json = Buffer.from(JSON.stringify(head));
  const h8 = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 8);
  const fj = `anims.${h8(json)}.json`, fb = `anims.${h8(bin)}.bin`;
  if (!quiet) console.log(`anims: ${Object.keys(clips).length} clips (${Object.keys(cmu).length} CMU, ${Object.keys(KEYED).length} keyed), ${(bin.length / 1024).toFixed(0)} KB + ${(json.length / 1024).toFixed(0)} KB header`);
  return { files: { [fj]: json, [fb]: bin }, list: [fj, fb] };
}

// standalone: write the files and patch the manifest in place
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const man = JSON.parse(fs.readFileSync(path.join(HQ, 'manifest.json'), 'utf8'));
  const old = man.packages.anims ? man.packages.anims.tiers.high : [];
  const { files, list } = await buildAnims();
  for (const f of old) { delete man.files[f]; if (!list.includes(f)) fs.rmSync(path.join(HQ, f), { force: true }); }
  for (const [f, b] of Object.entries(files)) { fs.writeFileSync(path.join(HQ, f), b); man.files[f] = { bytes: b.length }; }
  man.packages.anims = { prio: 4, tiers: { high: list, medium: list } };
  fs.writeFileSync(path.join(HQ, 'manifest.json'), JSON.stringify(man, null, 1) + '\n');
}
