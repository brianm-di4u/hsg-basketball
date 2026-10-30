// The 3D crowd, benches and coaches: low-poly bodies (art-src/blender/crowd/build_fans.py, streamed in the HQ
// "crowd" package) drawn as one instanced mesh per body build and level of detail, animated on the GPU.
//
// The crowd clips (crowd-clips.js) are baked once into a bone texture: one row per frame, four texels (a matrix)
// per bone. Each fan's vertex shader picks its row from its kind (seated fan, standing fan, cheer squad, bench
// player, coach), its phase and the last make: the scoring side stands and cheers in a ripple out from the
// basket, then sits again; some of the other side hold their heads. Shirt, trousers or shorts, sleeves, skin,
// hair and shoes are painted per pixel from each vertex's body part and rest-pose position, per fan.
// Replaces the photo billboards when the package is in; the billboards stay as the fallback.
/* global THREE */
import { CROWD_CLIPS, CROWD_FPS } from './crowd-clips.js';

const BONES = ['hips', 'spine', 'chest', 'neck', 'head', 'clavicle_L', 'clavicle_R', 'upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R',
  'hand_L', 'hand_R', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'foot_L', 'foot_R'];
export const C3 = { bodies: null, clipTable: null };

// ---------------------------------------------------------------- baking
const smooth = (t) => t * t * (3 - 2 * t);
function clipFrames(clip) { return Math.round(clip.dur * CROWD_FPS) + (clip.loop ? 0 : 1); }
function samplePose(clip, t, outQ) {
  const ks = clip.keys;
  let i = 0; while (i < ks.length - 2 && ks[i + 1][0] <= t) i++;
  const A = ks[i], B = ks[Math.min(ks.length - 1, i + 1)];
  const u = B[0] > A[0] ? smooth(Math.max(0, Math.min(1, (t - A[0]) / (B[0] - A[0])))) : 0;
  const e = new THREE.Euler(), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  for (const n of BONES) {
    const a = A[1][n], b = B[1][n];
    qa.identity(); qb.identity();
    if (a) qa.setFromEuler(e.set(a[0], a[1], a[2], 'YXZ'));
    if (b) qb.setFromEuler(e.set(b[0], b[1], b[2], 'YXZ'));
    outQ[n] = (outQ[n] || new THREE.Quaternion()).copy(qa).slerp(qb, u);
  }
  return (A[2] || 0) + ((B[2] || 0) - (A[2] || 0)) * u;
}

// one body build: its rig, both detail levels, a bone texture per detail level (their skins may order joints differently)
function bakeBody(gltf, id) {
  const rig = gltf.scene.getObjectByName('FanRig' + id);
  if (!rig) throw new Error('fans.glb: missing FanRig' + id);
  rig.removeFromParent(); rig.position.set(0, 0, 0); rig.quaternion.identity(); rig.scale.set(1, 1, 1);
  rig.traverse((o) => { const m = o.name.match(/^(.*)_(\d+)$/); if (m && BONES.includes(m[1])) o.name = m[1]; });
  rig.updateMatrixWorld(true);
  const rigQInv = rig.getWorldQuaternion(new THREE.Quaternion()).invert();
  const B = {};
  for (const n of BONES) {
    const b = rig.getObjectByName(n);
    const model = b.getWorldQuaternion(new THREE.Quaternion()).premultiply(rigQInv);
    B[n] = { b, rest: b.quaternion.clone(), model, inv: model.clone().invert() };
  }
  const hb = B.hips.b, hipRest = hb.position.clone();
  const toParent = new THREE.Matrix4().copy(hb.parent.matrixWorld).invert().multiply(rig.matrixWorld);
  const hipUp = new THREE.Vector3(0, 1, 0).transformDirection(toParent).multiplyScalar(1 / new THREE.Vector3().setFromMatrixScale(toParent).x);
  const meshes = [];
  rig.traverse((o) => { if (o.isSkinnedMesh) meshes.push(o); });
  let meta = null; try { meta = rig.userData.hsg ? JSON.parse(rig.userData.hsg) : null; } catch (e) { meta = null; }
  const lods = [];
  for (const lod of [0, 1, 2]) {
    const mesh = meshes.find((m) => m.name.startsWith(`Fan${id}${lod}`)) || meshes[lod];
    const sk = mesh.skeleton, nb = sk.bones.length;
    const rows = CROWD_CLIPS.reduce((n, c) => n + clipFrames(c), 0);
    const data = new Float32Array(nb * 4 * rows * 4);
    const q = {}, tq = new THREE.Quaternion(), m4 = new THREE.Matrix4();
    let row = 0;
    for (const clip of CROWD_CLIPS) {
      const nf = clipFrames(clip);
      for (let f = 0; f < nf; f++, row++) {
        const dy = samplePose(clip, f / CROWD_FPS, q);
        for (const n of BONES) { const b = B[n]; tq.copy(q[n]).premultiply(b.inv).multiply(b.model); b.b.quaternion.copy(b.rest).multiply(tq); }
        hb.position.copy(hipRest).addScaledVector(hipUp, dy);
        rig.updateMatrixWorld(true);
        for (let i = 0; i < nb; i++) {
          m4.multiplyMatrices(sk.bones[i].matrixWorld, sk.boneInverses[i]);
          m4.premultiply(mesh.bindMatrixInverse).multiply(mesh.bindMatrix);
          data.set(m4.elements, (row * nb * 4 + i * 4) * 4);
        }
      }
    }
    const tex = new THREE.DataTexture(data, nb * 4, rows, THREE.RGBAFormat, THREE.FloatType);
    tex.needsUpdate = true; tex.userData.keep = true;
    // where the hands are, for props (the cheer squad's pom-poms): bone index and the point in bind space
    const hands = {};
    for (const side of ['L', 'R']) {
      const name = 'middle_01_' + side.toLowerCase(), bi = sk.bones.findIndex((b) => b.name === name || b.name === 'hand_' + side);
      const bk = sk.bones.findIndex((b) => b.name === name) >= 0 ? sk.bones.findIndex((b) => b.name === name) : bi;
      if (bk >= 0) hands[side] = { i: bk, rest: null };
    }
    lods.push({ geo: mesh.geometry, tex, nb, data, hands, mesh });
  }
  for (const n of BONES) B[n].b.quaternion.copy(B[n].rest);
  hb.position.copy(hipRest);
  rig.updateMatrixWorld(true);
  for (const L of lods) for (const h of Object.values(L.hands)) {
    h.rest = new THREE.Vector3().setFromMatrixPosition(L.mesh.skeleton.bones[h.i].matrixWorld).applyMatrix4(L.mesh.bindMatrixInverse);
  }
  return { lods, meta };
}

export function initCrowd3d(gltf) {
  C3.bodies = { M: bakeBody(gltf, 'M'), F: bakeBody(gltf, 'F') };
  let row = 0;
  C3.clipTable = CROWD_CLIPS.map((c) => { const n = clipFrames(c), v = new THREE.Vector3(row, n, c.loop ? 1 : 0); row += n; return v; });
}
export const crowd3dReady = () => !!C3.bodies;

// ---------------------------------------------------------------- shading
const VERT_HEAD = `
attribute vec4 color; attribute vec4 skinIndex; attribute vec4 skinWeight;
attribute vec4 aMix; attribute vec3 aShirt; attribute vec3 aPants; attribute vec3 aSkin; attribute vec3 aHair; attribute vec4 aStyle;
uniform sampler2D tBones; uniform vec3 uClip[${CROWD_CLIPS.length}];
uniform float uTime, uCheerT, uCheerTeam, uExcite, uBasketX;
varying vec3 vRest; varying vec3 vPart; varying vec3 vShirt; varying vec3 vPants; varying vec3 vSkin; varying vec3 vHair; varying vec4 vStyle;
mat4 boneAt(float row, float i) {
  ivec2 b = ivec2(int(i + 0.5) * 4, int(row + 0.5));
  return mat4(texelFetch(tBones, b, 0), texelFetch(tBones, b + ivec2(1, 0), 0), texelFetch(tBones, b + ivec2(2, 0), 0), texelFetch(tBones, b + ivec2(3, 0), 0));
}
float clipRow(int c, float t) {
  vec3 k = uClip[c];
  float f = floor(max(t, 0.0) * ${CROWD_FPS.toFixed(1)});
  f = k.z > 0.5 ? mod(f, k.y) : min(f, k.y - 1.0);
  return k.x + f;
}
// kinds: 0 seated fan, 1 standing fan, 2 cheer squad, 3 bench player, 4 coach
float pickRow() {
  float kind = aMix.x, ph = aMix.y, team = aMix.z;
  float t = uTime * (0.88 + 0.24 * fract(ph * 5.31)) + ph * 7.0; // each fan their own tempo: no row in lockstep
  bool mine = uCheerTeam < -0.5 || abs(team - uCheerTeam) < 0.5;
  // a make ripples out from the basket: the nearest fans are up first
  float e = uCheerT - (abs(instanceMatrix[3].x - uBasketX) * 0.012 + ph * 0.3);
  float L = 2.4 + ph * 1.6;
  if (kind < 0.5 || (kind > 2.5 && kind < 3.5)) {
    if (e >= 0.0 && e < L + 0.5 && mine && (kind > 2.5 || ph < 0.85)) {
      if (e < 0.5) return clipRow(2, e);
      if (e < L) return clipRow(3, e - 0.5 + ph);
      return clipRow(4, e - L);
    }
    if (e >= 0.0 && e < 2.6 && !mine && ph > 0.55) return clipRow(5, e + ph);
    if (uExcite > 0.45 && fract(ph * 3.7) < 0.5) return clipRow(1, t);
    return clipRow(0, t);
  }
  if (kind < 1.5) {
    if (e >= 0.0 && e < L && mine) return clipRow(3, e + ph);
    if (uExcite > 0.45 && ph < 0.5) return clipRow(7, t);
    // standing idle: weight shifts, arms folded, or a slow clap
    float v = fract(ph * 9.17);
    if (v < 0.3) return clipRow(9, t);
    if (v < 0.45) return clipRow(7, t * 0.6);
    return clipRow(6, t);
  }
  if (kind < 2.5) return clipRow(8, t * (e >= 0.0 && e < L ? 1.4 : 1.0));
  if (e >= 0.0 && e < 2.2 && mine) return clipRow(7, e);
  return clipRow(9, t);
}
`;
const VERT_SKIN = `
  float row = pickRow();
  mat4 skm = skinWeight.x * boneAt(row, skinIndex.x) + skinWeight.y * boneAt(row, skinIndex.y) + skinWeight.z * boneAt(row, skinIndex.z) + skinWeight.w * boneAt(row, skinIndex.w);
  vec3 objectNormal = normalize((skm * vec4(normal, 0.0)).xyz);
  vRest = position; vPart = color.rgb; vShirt = aShirt; vPants = aPants; vSkin = aSkin; vHair = aHair; vStyle = aStyle;
`;
const FRAG_HEAD = `
uniform vec3 uHeadC, uEye; uniform float uDim;
varying vec3 vRest; varying vec3 vPart; varying vec3 vShirt; varying vec3 vPants; varying vec3 vSkin; varying vec3 vHair; varying vec4 vStyle;
// style: x sleeves (0 vest, 1 tee, 2 long), y legs (0 shorts, 1 trousers), z hair (0 short, 1 long, 2 bald, 3 cap), w shoes (0 dark, 1 white)
// vPart: arm, leg, head flags (blended across a triangle; each cut at 0.5). Clothes are cut by rest-pose height.
vec3 fanColor(vec3 p) {
  float h = p.y, ax = abs(p.x);
  bool head = vPart.b > 0.5 && vPart.b >= max(vPart.r, vPart.g), arm = !head && vPart.r > 0.5, leg = !head && !arm && vPart.g > 0.5;
  if (leg && h > 0.97) leg = false; // the hips belong to the shirt's hem line, cut level all the way round
  // a round collar: higher at the back and sides, a scoop at the front
  float collar = uHeadC.y - 0.2 - 0.075 * smoothstep(0.0, 0.09, p.z) * (1.0 - smoothstep(0.045, 0.085, ax));
  if (head || (!arm && !leg && h > collar)) {
    if (h < collar) return vStyle.x < 0.5 ? vSkin : vShirt;           // the shirt's collar on the neck
    vec3 d = p - uHeadC;
    float back = clamp((0.04 - d.z) / 0.12, 0.0, 1.0);
    float line = 0.048 - 0.11 * back - 0.012 * smoothstep(0.05, 0.08, abs(d.x)) * (1.0 - back);
    float st = vStyle.z;
    if (st > 2.5) { if (d.y > 0.035 - 0.03 * back) return vShirt * 0.8; }
    else if (st < 1.5 && length(d) < 0.2) {
      bool ear = abs(d.x) > 0.07 && d.y < 0.02 && back < 0.75;
      if (d.y > line && !ear) return vHair;
      if (st > 0.5 && back > 0.45 && d.y > -0.16) return vHair; // long hair down the back
    }
    vec2 e = vec2(ax - uEye.x, h - uEye.y);
    if (p.z > uEye.z - 0.02 && dot(e, e) < 0.00011) return vec3(0.03);
    return vSkin;
  }
  if (arm) return (vStyle.x > 1.5 && h > 1.06) || (vStyle.x > 0.5 && vStyle.x < 1.5 && h > 1.33) ? vShirt : vSkin;
  if (leg) {
    if (h < 0.11) return vStyle.w > 0.5 ? vec3(0.82) : vec3(0.06);  // shoes
    if (vStyle.y > 0.5 || h > 0.6) return vPants;                    // trousers, or shorts to the knee
    return h < 0.26 ? vec3(0.85) : vSkin;                             // socks, bare shins
  }
  if (h < 0.97) return vPants;
  if (vStyle.x < 0.5 && ax > 0.15 && h > 1.36) return vSkin;          // a vest: bare shoulders
  return vShirt;
}
`;
function fanMaterial(body, lod, U) {
  // two-sided: the holes the stripped clothing shells leave at the neck and armholes show the shirt's inside
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
  const meta = body.meta || {};
  const u = { tBones: { value: body.lods[lod].tex }, uClip: { value: C3.clipTable }, uHeadC: { value: new THREE.Vector3(...(meta.headCenter || [0, 1.74, 0.03])) },
    uEye: { value: new THREE.Vector3(...(meta.eye || [0.032, 1.74, 0.1])) }, ...U };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = VERT_HEAD + sh.vertexShader
      .replace('#include <beginnormal_vertex>', VERT_SKIN)
      .replace('#include <begin_vertex>', 'vec3 transformed = (skm * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = FRAG_HEAD + sh.fragmentShader
      // (never a fan at the lens: a replay camera can sit right behind a bench)
      .replace('#include <color_fragment>', '#include <color_fragment>\n if (length(vViewPosition) < 6.0) discard;\n diffuseColor.rgb = fanColor(vRest) * uDim;');
  };
  mat.customProgramCacheKey = () => 'fan3d';
  return mat;
}

// ---------------------------------------------------------------- the crowd
const lin = (hex) => new THREE.Color(hex);
const SKINS = ['#E9C3A6', '#C99B7E', '#9E6E54', '#7A513C', '#5A3A2B', '#432A1F'];
const HAIRS = ['#1A1410', '#2B1D14', '#4A3222', '#7A5A3A', '#B89A62', '#8A8A88', '#6B2F1A'];
const PANTS = ['#2F3E58', '#3B4E6B', '#1C1D22', '#8C7A5C', '#55585E', '#2F3E58'];
function rngOf(seed) { let s = seed % 2147483647 || 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

// seats: [{ f: [x, y, z, rot], k: kind, team, tint, row, shirt?, pants?, style? }]; opts: { tier, palette, girls, seed }
export function buildCrowd3d(seats, opts) {
  const rng = rngOf(opts.seed || 11);
  const U = { uTime: { value: 0 }, uCheerT: { value: -99 }, uCheerTeam: { value: -1 }, uExcite: { value: 0 }, uBasketX: { value: 0 }, uDim: { value: opts.dim ?? 0.6 } };
  const medium = opts.tier !== 'high';
  const groups = {};
  for (const st of seats) {
    if (!st.f) continue;
    const kind = st.k ?? 0;
    // phones: every other spectator (benches, coaches and the cheer squad always)
    // (and the arena's high tiers, far and dim, thinner still)
    if (medium && kind < 2 && rng() < (st.f[1] > 25 ? 0.65 : 0.4)) continue;
    const build = kind === 2 ? 'F' : kind >= 3 ? (opts.girls && !(kind === 4 && rng() < 0.5) ? 'F' : 'M') : rng() < 0.5 ? 'M' : 'F';
    // detail by distance: the first rows and the courtside people full, the middle rows lighter, the far rows and
    // upper tiers lightest
    const far = Math.hypot(st.f[0] * 0.5, st.f[2], st.f[1] * 2);
    const lod = kind >= 2 ? (medium ? 1 : 0) : far > (medium ? 28 : 55) ? 2 : medium || far > 36 ? 1 : 0;
    const key = build + lod;
    (groups[key] || (groups[key] = { build, lod, list: [] })).list.push(st);
  }
  const g = new THREE.Group();
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), P = new THREE.Vector3();
  let count = 0;
  const cheer = []; // the cheer squad, for their pom-poms
  for (const grp of Object.values(groups)) {
    const body = C3.bodies[grp.build], n = grp.list.length;
    const geo = new THREE.BufferGeometry();
    const src = body.lods[grp.lod].geo;
    for (const a of ['position', 'normal', 'skinIndex', 'skinWeight', 'color']) if (src.attributes[a]) geo.setAttribute(a, src.attributes[a]);
    geo.setIndex(src.index);
    const mix = new Float32Array(n * 4), sty = new Float32Array(n * 4), sh = new Float32Array(n * 3), pa = new Float32Array(n * 3), sk = new Float32Array(n * 3), ha = new Float32Array(n * 3);
    const mesh = new THREE.InstancedMesh(geo, fanMaterial(body, grp.lod, U), n);
    grp.list.forEach((st, i) => {
      const kind = st.k ?? 0, female = grp.build === 'F';
      const ht = kind === 3 ? 6.0 + rng() * 0.6 : kind === 2 ? 5.3 + rng() * 0.3 : (female ? 5.1 : 5.5) + rng() * 0.7;
      const sc = ht / 1.86;
      P.set(st.f[0], st.f[1], st.f[2]); q.setFromAxisAngle(Y, st.f[3] + (rng() - 0.5) * (kind < 2 ? 0.35 : 0.1)); s.setScalar(sc);
      mesh.setMatrixAt(i, m.compose(P, q, s));
      mix.set([kind, rng(), st.team ?? 0, 0], i * 4);
      if (kind === 2) cheer.push({ m: m.clone(), ph: mix[i * 4 + 1], body, lod: grp.lod, color: st.tint || new THREE.Color('#D4AF37') });
      const shirt = st.shirt || st.tint || opts.palette[Math.floor(rng() * opts.palette.length)];
      const j = 0.9 + rng() * 0.2;
      sh.set([shirt.r * j, shirt.g * j, shirt.b * j], i * 3);
      const pants = st.pants || lin(PANTS[Math.floor(rng() * PANTS.length)]);
      pa.set([pants.r, pants.g, pants.b], i * 3);
      const skin = lin(SKINS[Math.floor(rng() * SKINS.length)]); sk.set([skin.r, skin.g, skin.b], i * 3);
      const hair = lin(HAIRS[Math.floor(rng() * (kind >= 2 ? 5 : HAIRS.length))]); ha.set([hair.r, hair.g, hair.b], i * 3);
      const style = st.style || [rng() < 0.12 ? 0 : rng() < 0.65 ? 1 : 2, rng() < 0.85 ? 1 : 0, female ? (rng() < 0.7 ? 1 : rng() < 0.6 ? 0 : 3) : (rng() < 0.65 ? 0 : rng() < 0.6 ? 3 : 2), rng() < 0.5 ? 1 : 0];
      sty.set(style, i * 4);
    });
    geo.setAttribute('aMix', new THREE.InstancedBufferAttribute(mix, 4));
    geo.setAttribute('aStyle', new THREE.InstancedBufferAttribute(sty, 4));
    geo.setAttribute('aShirt', new THREE.InstancedBufferAttribute(sh, 3));
    geo.setAttribute('aPants', new THREE.InstancedBufferAttribute(pa, 3));
    geo.setAttribute('aSkin', new THREE.InstancedBufferAttribute(sk, 3));
    geo.setAttribute('aHair', new THREE.InstancedBufferAttribute(ha, 3));
    mesh.frustumCulled = false; mesh.receiveShadow = true;
    mesh.userData.dyn = true;
    g.add(mesh);
    count += n;
  }
  // pom-poms: one sphere per hand, in the squad's colour, a little metallic
  let poms = null;
  if (cheer.length) {
    poms = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.34, 0), new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.35, flatShading: true }), cheer.length * 2);
    // (a near-black school colour shakes gold poms: black ones vanish against the crowd)
    const gold = new THREE.Color('#D4AF37');
    cheer.forEach((c, i) => { const col = c.color.r + c.color.g + c.color.b < 0.12 ? gold : c.color; poms.setColorAt(i * 2, col); poms.setColorAt(i * 2 + 1, col); });
    poms.frustumCulled = false; poms.userData.dyn = true; g.add(poms);
  }
  const clipRow = (c, t) => { const k = C3.clipTable[c], f = Math.floor(Math.max(t, 0) * CROWD_FPS); return k.x + (k.z > 0.5 ? ((f % k.y) + k.y) % k.y : Math.min(f, k.y - 1)); };
  const v = new THREE.Vector3(), sm = new THREE.Matrix4(), pm4 = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1), qI = new THREE.Quaternion();
  return {
    g, count, U,
    // cheerAt: seconds since the last make (or null), team: the scoring team (-1: everyone), basketX: its rim (world x)
    update(time, cheerAge, team, excite, basketX) {
      U.uTime.value = time; U.uCheerT.value = cheerAge == null ? -99 : cheerAge; U.uCheerTeam.value = team; U.uExcite.value = excite; U.uBasketX.value = basketX;
      if (!poms) return;
      // the same row the vertex shader picks for the cheer squad (kind 2)
      cheer.forEach((c, i) => {
        const ph = c.ph, t = time * (0.88 + 0.24 * ((ph * 5.31) % 1)) + ph * 7.0;
        const e = (cheerAge == null ? -99 : cheerAge) - (Math.abs(c.m.elements[12] - basketX) * 0.012 + ph * 0.3), L = 2.4 + ph * 1.6;
        const row = clipRow(8, t * (e >= 0 && e < L ? 1.4 : 1.0));
        const lod = c.body.lods[c.lod];
        ['L', 'R'].forEach((side, k) => {
          const h = lod.hands[side];
          if (!h || !h.rest) { poms.setMatrixAt(i * 2 + k, pm4.makeScale(0, 0, 0)); return; }
          sm.fromArray(lod.data, (row * lod.nb * 4 + h.i * 4) * 4);
          v.copy(h.rest).applyMatrix4(sm).applyMatrix4(c.m);
          poms.setMatrixAt(i * 2 + k, pm4.compose(v, qI, one));
        });
      });
      poms.instanceMatrix.needsUpdate = true;
    },
  };
}
