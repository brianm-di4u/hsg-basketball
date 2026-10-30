// 3D venues: the home gym (wood bleachers, painted block walls, steel trusses, wall scoreboard, title pennants)
// and the finals arena (two-tier royal-blue bowl with one short end, LED ribbon, end video board, house lights
// down). Arena details follow research/venues.md: only confirmed ones (two tiers, royal-blue chairs, one end
// without an upper deck) are modeled; everything else is generic. World units are feet; the court centre is the
// origin, +x toward the right basket, +z toward the camera side.
/* global THREE */
import { COURT } from '../court.js';
import { drawCrest } from '../art.js';
import { contrast } from '../util.js';
import { boxProject } from './probe3d.js';
import { netGeometry, makeNetSim } from './net3d.js';
import { GLOW } from './post.js';
import { addShell } from './venue-hq.js';
// emitters are brighter than white so the bloom pass picks them out (and only them)
const glow = (k = 1) => new THREE.Color(GLOW * k, GLOW * k, GLOW * k);

const TAU = Math.PI * 2;
const HL = COURT.L / 2, HW = COURT.W / 2;
const C = (hex) => new THREE.Color(hex).convertSRGBToLinear();
// crowd and bench shirt tints: a single sRGB-to-linear conversion (new Color does it), so school colors read true
// (C converts twice; the venue's surfaces were tuned with it and keep it)
const CL = (hex) => new THREE.Color(hex);
export const LAYER_REFLECT = 1;

let white = null;
const whiteTex = () => white || (white = Object.assign(new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1), { needsUpdate: true }));
function canvas(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function texOf(cv, o = {}) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = o.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = o.aniso || 4;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}
const reflect = (o) => { o.traverse((c) => c.layers.enable(LAYER_REFLECT)); return o; };

// ---------------------------------------------------------------- floor markings (transparent canvas over the wood)
const FLOOR_X = 57, FLOOR_Z = 33; // hardwood half extents
function markings(home, arena, px) {
  const W = Math.round(FLOOR_X * 2 * px), H = Math.round(FLOOR_Z * 2 * px);
  const cv = canvas(W, H), c = cv.getContext('2d');
  const X = (x) => (x + FLOOR_X - HL) * px, Z = (z) => (z + FLOOR_Z - HW) * px; // court coords (feet from the left/far corner)
  const p = home.colors.primary, s = home.colors.secondary;
  const paint = arena ? '#1E3F8A' : p;
  const border = arena ? '#22346A' : p;
  // out-of-bounds band and apron paint
  c.fillStyle = border; c.globalAlpha = 0.92;
  c.fillRect(0, 0, W, Z(-0.2)); c.fillRect(0, Z(COURT.W + 0.2), W, H - Z(COURT.W + 0.2));
  c.fillRect(0, 0, X(-0.2), H); c.fillRect(X(COURT.L + 0.2), 0, W - X(COURT.L + 0.2), H);
  c.globalAlpha = 1;
  // keys (stained paint lets the grain show)
  c.globalAlpha = 0.86; c.fillStyle = paint;
  c.fillRect(X(0), Z(COURT.keyZ0), COURT.ftDist * px + 0.5 * px, (COURT.keyZ1 - COURT.keyZ0) * px);
  c.fillRect(X(COURT.L - COURT.ftDist - 0.5), Z(COURT.keyZ0), (COURT.ftDist + 0.5) * px, (COURT.keyZ1 - COURT.keyZ0) * px);
  c.globalAlpha = 1;
  // center circle: crest (home) or a Deco sunburst (finals)
  c.save(); c.translate(X(HL), Z(HW));
  if (arena) {
    c.fillStyle = '#16213D'; c.beginPath(); c.arc(0, 0, COURT.centerR * px, 0, TAU); c.fill();
    c.fillStyle = '#D4AF37';
    for (let k = 0; k < 16; k++) { c.save(); c.rotate((k / 16) * TAU); c.beginPath(); c.moveTo(-0.5 * px, -1.2 * px); c.lineTo(0, -(k % 2 ? 4.2 : 5.4) * px); c.lineTo(0.5 * px, -1.2 * px); c.closePath(); c.fill(); c.restore(); }
    c.beginPath(); c.arc(0, 0, 1.4 * px, 0, TAU); c.fill();
  } else {
    c.globalAlpha = 0.9; c.fillStyle = p; c.beginPath(); c.arc(0, 0, COURT.centerR * px, 0, TAU); c.fill(); c.globalAlpha = 1;
    drawCrest(c, home, 0, 0, COURT.centerR * px * 0.78);
  }
  c.restore();
  // lines
  c.strokeStyle = arena ? '#F4F1EA' : '#FAF7F0'; c.lineWidth = Math.max(2, px * 0.17);
  c.strokeRect(X(0), Z(0), COURT.L * px, COURT.W * px);
  c.beginPath(); c.moveTo(X(HL), Z(0)); c.lineTo(X(HL), Z(COURT.W)); c.stroke();
  c.beginPath(); c.arc(X(HL), Z(HW), COURT.centerR * px, 0, TAU); c.stroke();
  for (const side of [0, 1]) {
    const rx = COURT.rimX[side], dir = side ? -1 : 1, base = side ? COURT.L : 0;
    c.strokeRect(X(side ? COURT.L - COURT.ftDist - 0.5 : 0), Z(COURT.keyZ0), (COURT.ftDist + 0.5) * px, (COURT.keyZ1 - COURT.keyZ0) * px);
    const ftx = base + dir * (COURT.ftDist + 0.5);
    c.beginPath(); c.arc(X(ftx), Z(HW), COURT.ftR * px, side ? Math.PI / 2 : -Math.PI / 2, side ? -Math.PI / 2 : Math.PI / 2); c.stroke();
    c.setLineDash([px * 1.2, px * 0.9]);
    c.beginPath(); c.arc(X(ftx), Z(HW), COURT.ftR * px, side ? -Math.PI / 2 : Math.PI / 2, side ? Math.PI / 2 : Math.PI * 1.5); c.stroke();
    c.setLineDash([]);
    // three-point line: corner straights + arc
    const r = COURT.threeR, zc = Math.sqrt(Math.max(0, r * r - 0)) ;
    const a0 = Math.asin(Math.min(1, (HW - 3) / r));
    const xc = rx + dir * Math.cos(a0) * r;
    c.beginPath();
    c.moveTo(X(base), Z(3)); c.lineTo(X(xc), Z(3));
    c.arc(X(rx), Z(HW), r * px, side ? Math.PI + a0 : -a0, side ? Math.PI - a0 : a0, !!side);
    c.lineTo(X(base), Z(COURT.W - 3));
    c.stroke();
    void zc;
    // restricted-area arc and lane hashes
    c.beginPath(); c.arc(X(rx), Z(HW), 4 * px, side ? Math.PI / 2 : -Math.PI / 2, side ? -Math.PI / 2 : Math.PI / 2, !!side); c.stroke();
    for (const hz of [COURT.keyZ0, COURT.keyZ1]) for (const d of [7, 8, 11, 14]) {
      const hx = base + dir * d;
      c.beginPath(); c.moveTo(X(hx), Z(hz)); c.lineTo(X(hx), Z(hz + (hz === COURT.keyZ0 ? -0.7 : 0.7))); c.stroke();
    }
  }
  // wordmarks in the baseline bands and the far sideline band
  const word = (txt, x, z, rot, size, color) => {
    c.save(); c.translate(X(x), Z(z)); c.rotate(rot);
    c.font = `900 ${size * px}px "Arial Black", Impact, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = color; c.fillText(txt, 0, 0); c.restore();
  };
  const ink = arena ? '#D4AF37' : [s, home.colors.accent, '#FFFFFF'].find((x) => contrast(x, p) >= 2.5);
  if (arena) {
    word('STATE FINALS', -1.7, HW, -Math.PI / 2, 2.5, ink); word('STATE FINALS', COURT.L + 1.7, HW, Math.PI / 2, 2.5, ink);
    // short wordmarks repeated along the near apron, so any broadcast crop shows whole words
    for (const x of [HL - 30, HL, HL + 30]) word(x === HL ? 'HOT SPRINGS' : 'STATE FINALS', x, COURT.W + 4.2, 0, 2.4, x === HL ? '#F4F1EA' : ink);
  } else {
    const m = home.mascot.toUpperCase();
    word(m, -1.7, HW, -Math.PI / 2, 2.6, ink); word(m, COURT.L + 1.7, HW, Math.PI / 2, 2.6, ink);
    word(home.name.toUpperCase().replace(' HIGH SCHOOL', ''), HL, COURT.W + 4.2, 0, 2.7, ink);
  }
  return cv;
}

// procedural maple strips (used until/unless the painted tile loads)
function mapleFallback() {
  const cv = canvas(512, 512), c = cv.getContext('2d');
  let seed = 7; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let x = 0; x < 512; x += 21) {
    let y = -r() * 200;
    while (y < 512) {
      const len = 120 + r() * 220, l = 0.9 + r() * 0.14;
      c.fillStyle = `rgb(${Math.round(222 * l)},${Math.round(176 * l)},${Math.round(118 * l)})`;
      c.fillRect(x, y, 21, len); c.fillStyle = 'rgba(90,50,20,0.35)'; c.fillRect(x, y, 1, len); c.fillRect(x, y, 21, 1);
      y += len;
    }
  }
  return cv;
}

// ---------------------------------------------------------------- varnished floor
// Maple under a clear coat. Its sheen comes from the venue's own reflection probe (probe3d.js), box-projected
// so the bleachers and lamps reflect where they stand; there is no mirror pass, so nothing ghosts.
function makeFloor(home, arena, opts) {
  const px = opts.floorPx;
  const markTex = texOf(markings(home, arena, px), { aniso: 8 });
  const woodSrc = opts.images.floor || mapleFallback();
  const wood = texOf(woodSrc, { repeat: true, aniso: 8 });
  wood.rotation = Math.PI / 2;
  const geo = new THREE.PlaneGeometry(FLOOR_X * 2, FLOOR_Z * 2);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshPhysicalMaterial({ map: markTex, roughness: 0.62, metalness: 0, clearcoat: 0.75, clearcoatRoughness: 0.16, envMapIntensity: arena ? 0.7 : 0.6 });
  // tLM/uLM: the HQ venue's baked floor light (venue-hq.js), applied as a multiplier; off (uLM 0) on the lite floor
  const u = { tWood: { value: wood }, uWoodTint: { value: arena ? C('#F0E4D4') : C('#F7EEE2') }, tLM: { value: whiteTex() }, uLM: { value: 0 } };
  mat.userData.u = u;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    // the markings' UVs come from position, so any floor mesh works: the lite plane or the HQ shell's floor
    sh.vertexShader = 'attribute vec2 uv1; varying vec2 vWoodUv; varying vec2 vMarkUv; varying vec2 vLMUv;\n' + sh.vertexShader
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        vWoodUv = position.xz / 4.6; vLMUv = uv1;
        vMarkUv = vec2((position.x + ${FLOOR_X.toFixed(1)}) / ${(FLOOR_X * 2).toFixed(1)}, (${FLOOR_Z.toFixed(1)} - position.z) / ${(FLOOR_Z * 2).toFixed(1)});`);
    sh.fragmentShader = 'uniform sampler2D tWood; uniform vec3 uWoodTint; uniform sampler2D tLM; uniform float uLM; varying vec2 vWoodUv; varying vec2 vMarkUv; varying vec2 vLMUv;\n' + sh.fragmentShader
      .replace('#include <map_fragment>', `
        vec4 mk = texture2D(map, vMarkUv);
        vec3 wd = texture2D(tWood, vec2(vWoodUv.y, vWoodUv.x)).rgb * uWoodTint;
        diffuseColor.rgb = mix(wd, mk.rgb, mk.a);
        { vec2 q = vWoodUv * 4.6; // court-centred feet: a lit court, pools under the lamp rows, the keys a touch brighter
          float pool = exp(-pow(q.x / 46.0, 4.0) - pow(q.y / 27.0, 4.0));
          float lamps = 0.0;
          for (int i = -3; i <= 3; i++) for (int j = -1; j <= 1; j++) { vec2 d = q - vec2(float(i) * 15.0, float(j) * 20.0); lamps += exp(-dot(d, d) / 70.0); }
          float keys = exp(-dot(q - vec2(41.0, 0.0), q - vec2(41.0, 0.0)) / 260.0) + exp(-dot(q + vec2(41.0, 0.0), q + vec2(41.0, 0.0)) / 260.0);
          if (uLM > 0.0) diffuseColor.rgb *= texture2D(tLM, vLMUv).rgb * uLM; // the baked light replaces the painted pools
          else diffuseColor.rgb *= 0.56 + 0.34 * pool + 0.12 * min(lamps, 1.0) * pool + 0.08 * keys; }`);
  };
  mat.customProgramCacheKey = () => 'floor3';
  if (opts.probe) boxProject(mat, opts.room, opts.probe);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  // surround (painted concrete / rubber)
  const sur = new THREE.Mesh(new THREE.PlaneGeometry(400, 300).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: arena ? C('#262A3A') : C('#B89A7A'), roughness: 0.85, emissive: arena ? C('#1A1E2C') : C('#7A6046') })); // with a little bounce where the stands shade it
  sur.position.y = -0.03; sur.receiveShadow = true;
  return { mesh, sur, mat };
}

// ---------------------------------------------------------------- hoops
function netTexture() {
  const cv = canvas(128, 128), c = cv.getContext('2d');
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 5;
  for (let k = -8; k < 16; k++) { c.beginPath(); c.moveTo(k * 16, 0); c.lineTo(k * 16 + 128, 128); c.stroke(); c.beginPath(); c.moveTo(k * 16 + 128, 0); c.lineTo(k * 16, 128); c.stroke(); }
  return texOf(cv, { repeat: true });
}
function digitsTexture() { const cv = canvas(128, 64); return { cv, tex: texOf(cv), last: null }; }
function makeHoop(side, padColor, capColor) {
  const g = new THREE.Group();
  const dir = side ? -1 : 1;
  const rimX = COURT.rimX[side] - HL, boardX = COURT.boardX[side] - HL;
  const steel = new THREE.MeshStandardMaterial({ color: C('#2A2C33'), roughness: 0.45, metalness: 0.6 });
  const pad = new THREE.MeshStandardMaterial({ color: C(padColor), roughness: 0.8 });
  // stanchion: padded base out of bounds, pole, arm to the board
  const baseX = -dir * (HL + 5.5);
  const base = new THREE.Mesh(new THREE.BoxGeometry(5, 3.6, 4.2), pad); base.position.set(baseX, 1.8, 0); base.castShadow = true; g.add(base);
  // a light-colored top bevel and a court-facing stripe, so a dark school color still reads as a padded base
  const capM = new THREE.MeshStandardMaterial({ color: C(capColor), roughness: 0.7 });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 4.4), capM); cap.position.set(baseX, 3.62, 0); g.add(cap);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 4.25), capM); strip.position.set(baseX + dir * 2.52, 2.6, 0); g.add(strip);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(1.0, 9, 1.0), pad); pole.position.set(baseX + dir * 0.6, 7.6, 0); g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(boardX - baseX), 0.5, 0.5), steel); arm.position.set((boardX + baseX) / 2, 11.7, 0); arm.castShadow = true; g.add(arm);
  const brace = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, Math.hypot(Math.abs(boardX - baseX) * 0.6, 3.2)), steel);
  brace.position.set(baseX + dir * Math.abs(boardX - baseX) * 0.35, 10.3, 0); brace.rotation.z = dir * 0.55; brace.rotation.y = Math.PI / 2; g.add(brace);
  // glass board with a white frame and shooter's square
  const bw = COURT.boardZ1 - COURT.boardZ0, bh = COURT.boardY1 - COURT.boardY0;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.12, bh, bw), new THREE.MeshPhysicalMaterial({ color: C('#CFE9F2'), roughness: 0.04, metalness: 0, transparent: true, opacity: 0.3, depthWrite: false, clearcoat: 1, envMapIntensity: 1.6 }));
  glass.position.set(boardX, (COURT.boardY0 + COURT.boardY1) / 2, 0); g.add(glass);
  const lineM = new THREE.MeshStandardMaterial({ color: C('#F7F7F2'), roughness: 0.5 });
  const fr = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), lineM); m.position.set(x, y, z); g.add(m); };
  const T = 0.16;
  fr(0.16, T, bw, boardX, COURT.boardY1, 0); fr(0.16, T, bw, boardX, COURT.boardY0, 0);
  fr(0.16, bh, T, boardX, (COURT.boardY0 + COURT.boardY1) / 2, bw / 2); fr(0.16, bh, T, boardX, (COURT.boardY0 + COURT.boardY1) / 2, -bw / 2);
  const sq0 = COURT.boardY0 + 0.5, sq1 = sq0 + 1.5;
  fr(0.14, 0.12, 2, boardX + dir * 0.02, sq1, 0); fr(0.14, 0.12, 2, boardX + dir * 0.02, sq0, 0);
  fr(0.14, 1.5, 0.12, boardX + dir * 0.02, (sq0 + sq1) / 2, 1); fr(0.14, 1.5, 0.12, boardX + dir * 0.02, (sq0 + sq1) / 2, -1);
  const bpad = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, bw + 0.3), pad); bpad.position.set(boardX, COURT.boardY0 - 0.2, 0); g.add(bpad);
  // shot clock on top of the board
  const dg = digitsTexture();
  const dgM = new THREE.MeshBasicMaterial({ map: dg.tex, color: glow(0.55) });
  const sc = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 1.9), [steel, steel, steel, steel, dgM, dgM]);
  sc.position.set(boardX - dir * 0.2, COURT.boardY1 + 0.62, 0); sc.rotation.y = Math.PI / 2 * 0; g.add(sc);
  // rim + connector
  const rimM = new THREE.MeshStandardMaterial({ color: C('#E8562A'), roughness: 0.4, metalness: 0.3, emissive: C('#3A1004') });
  rimM.userData.baseEmissive = rimM.emissive.clone();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(COURT.rimR, 0.06, 8, 32), rimM);
  rim.rotation.x = Math.PI / 2; rim.position.set(rimX, COURT.rimY, 0); rim.castShadow = true; rim.userData.dyn = true; g.add(rim);
  const con = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(rimX - boardX) - COURT.rimR + 0.1, 0.12, 0.5), rim.material); con.position.set(boardX + dir * (Math.abs(rimX - boardX) - COURT.rimR) / 2, COURT.rimY, 0); g.add(con);
  // net: an open cone with a diamond-mesh texture, its vertices driven by a cloth sim (net3d.js)
  const net = new THREE.Mesh(netGeometry(), new THREE.MeshStandardMaterial({ map: netTexture(), alphaTest: 0.45, transparent: false, side: THREE.DoubleSide, roughness: 0.9, color: C('#FFFFFF') }));
  net.material.map.repeat.set(3, 1.4);
  net.position.set(rimX, COURT.rimY, 0); net.userData.dyn = true; net.frustumCulled = false; g.add(net);
  const netSim = makeNetSim(net);
  reflect(g);
  // materials that fade when this hoop stands between the portrait camera and the play
  const fade = [];
  g.traverse((o) => { for (const m of [].concat(o.material || [])) if (!fade.includes(m)) fade.push(m); });
  for (const m of fade) { m.transparent = true; m.userData.baseOpacity = m.opacity; }
  return { g, rim, net, netSim, rimX, dg, rimBaseY: COURT.rimY, fade, faded: false, flash: 0, shake: 0, lastNet: 0, lastRim: 0 };
}

// ---------------------------------------------------------------- crowd (instanced billboards from the painted atlas)
const CROWD_VERT = `
attribute vec4 aCell; attribute vec3 aTint; attribute vec2 aSize; attribute float aPhase; attribute float aStand; attribute float aTeam;
uniform vec3 uRight; uniform float uTime, uCheer, uCheerTeam;
varying vec2 vUv; varying vec3 vTint; varying float vShade;
void main() {
  vec4 o = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  // a make lifts the scoring side (uCheerTeam 0 or 1); the other side barely stirs; -1 lifts everyone
  float side = uCheerTeam < 0.0 || abs(aTeam - uCheerTeam) < 0.5 ? 1.0 : 0.15;
  float bob = uCheer * side * (0.25 + 0.75 * aStand) * max(0.0, sin(uTime * 7.0 + aPhase * 6.28)) * 0.7 + sin(uTime * 1.3 + aPhase * 20.0) * 0.04;
  vec3 wp = o.xyz + uRight * (position.x * aSize.x) + vec3(0.0, (position.y + 0.5) * aSize.y + bob, 0.0);
  float fx = fract(aPhase * 7.31) < 0.5 ? (position.x + 0.5) : (0.5 - position.x);
  vUv = vec2(aCell.x + fx * aCell.z, aCell.y + (position.y + 0.5) * aCell.w);
  vTint = aTint; vShade = 0.86 + 0.14 * fract(aPhase * 13.7);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}`;
const CROWD_FRAG = `
uniform sampler2D tAtlas; uniform float uLight;
varying vec2 vUv; varying vec3 vTint; varying float vShade;
void main() {
  vec4 c = texture2D(tAtlas, vUv);
  if (c.a < 0.5) discard;
  c.rgb *= smoothstep(0.5, 0.95, c.a) * 0.6 + 0.4; // a soft dark edge where the white key left a fringe
  float mag = smoothstep(0.03, 0.12, min(c.r, c.b) - c.g);
  float lum = max(c.r, c.b);
  vec3 shirt = vTint * (0.45 + lum * 0.75);
  gl_FragColor = vec4(mix(c.rgb, shirt, mag) * uLight * vShade, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function makeCrowd(seats, atlas, palette, rng) {
  const n = seats.length;
  const geo = new THREE.PlaneGeometry(1, 1);
  const inst = new THREE.InstancedBufferGeometry();
  inst.index = geo.index; inst.attributes.position = geo.attributes.position; inst.attributes.uv = geo.attributes.uv;
  const cell = new Float32Array(n * 4), tint = new Float32Array(n * 3), size = new Float32Array(n * 2), phase = new Float32Array(n), stand = new Float32Array(n), team = new Float32Array(n);
  const groups = {};
  atlas.meta.sprites.forEach((s, i) => (groups[s.g] || (groups[s.g] = [])).push(i));
  const cols = atlas.meta.cols, rows = atlas.meta.rows;
  const mesh = new THREE.InstancedMesh(inst, null, n);
  const m = new THREE.Matrix4();
  const recent = [];
  seats.forEach((st, i) => {
    const pool = groups[st.g] || groups.seat;
    // no face repeats within three neighbouring seats
    let k = pool[Math.floor(rng() * pool.length)];
    for (let tries = 0; tries < 6 && recent.includes(k) && pool.length > 3; tries++) k = pool[Math.floor(rng() * pool.length)];
    recent.push(k); if (recent.length > 3) recent.shift();
    const sp = atlas.meta.sprites[k];
    const cx = (k % cols) / cols, cy = 1 - (Math.floor(k / cols) + 1) / rows;
    cell.set([cx, cy, 1 / cols, 1 / rows], i * 4);
    const ht = (st.g === 'stand' || st.g === 'cheer' ? 5.6 : 4.4) * (0.94 + rng() * 0.1);
    size.set([ht * (atlas.meta.cw / atlas.meta.ch) * (1 / sp.h) * sp.h, ht / sp.h * sp.h], i * 2);
    // cell art is bottom-aligned; the visible figure fills sp.h of the cell height
    size[i * 2] = ht / sp.h * (atlas.meta.cw / atlas.meta.ch); size[i * 2 + 1] = ht / sp.h;
    const col = st.tint || palette[Math.floor(rng() * palette.length)], j = 0.92 + rng() * 0.16; // ±8% so neighbours differ
    tint.set([col.r * j, col.g * j, col.b * j], i * 3);
    phase[i] = rng(); stand[i] = st.g === 'stand' || st.g === 'cheer' ? 1 : 0; team[i] = st.team ?? 0;
    m.makeTranslation(st.x, st.y, st.z);
    mesh.setMatrixAt(i, m);
  });
  inst.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 4));
  inst.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 3));
  inst.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 2));
  inst.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
  inst.setAttribute('aStand', new THREE.InstancedBufferAttribute(stand, 1));
  inst.setAttribute('aTeam', new THREE.InstancedBufferAttribute(team, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { tAtlas: { value: atlas.tex }, uRight: { value: new THREE.Vector3(1, 0, 0) }, uTime: { value: 0 }, uCheer: { value: 0 }, uCheerTeam: { value: -1 }, uLight: { value: 1 } },
    vertexShader: CROWD_VERT, fragmentShader: CROWD_FRAG,
  });
  mesh.material = mat;
  mesh.frustumCulled = false;
  return mesh;
}

// procedural stand-in atlas when the painted one is missing: simple seated silhouettes with magenta shirts
function fallbackAtlas() {
  const cw = 64, ch = 96, cols = 4, rows = 1;
  const cv = canvas(cw * cols, ch * rows), c = cv.getContext('2d');
  const skins = ['#8D5524', '#C68642', '#E0AC69', '#F1C27D'];
  for (let k = 0; k < cols; k++) {
    const x = k * cw + cw / 2;
    c.fillStyle = '#2F3A55'; c.fillRect(x - 14, 58, 28, 30);
    c.fillStyle = '#FF00FF'; c.beginPath(); c.roundRect(x - 17, 30, 34, 32, 8); c.fill();
    c.fillStyle = skins[k]; c.beginPath(); c.arc(x, 20, 10, 0, TAU); c.fill();
    c.fillStyle = '#2B1D14'; c.beginPath(); c.arc(x, 16, 10, Math.PI, 0); c.fill();
  }
  return { tex: texOf(cv), meta: { cols, rows, cw, ch, sprites: Array.from({ length: cols }, () => ({ g: 'seat', w: 0.6, h: 0.95 })) } };
}

// ---------------------------------------------------------------- wall scoreboard
export function scoreboardCanvas() { return canvas(512, 256); }
export function drawScoreboard(cv, sb, homeName, awayName) {
  const c = cv.getContext('2d');
  c.fillStyle = '#0D0C12'; c.fillRect(0, 0, 512, 256);
  c.strokeStyle = '#3B3546'; c.lineWidth = 8; c.strokeRect(4, 4, 504, 248);
  const lamp = (txt, x, y, size, color) => {
    c.font = `700 ${size}px "Courier New", ui-monospace, monospace`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = color; c.shadowColor = color; c.shadowBlur = 12; c.fillText(txt, x, y); c.shadowBlur = 0;
  };
  c.textAlign = 'center'; c.fillStyle = '#F4F1EA';
  // whole school names, shrunk to fit their half (no cut-off words)
  for (const [name, x] of [[homeName, 110], [awayName, 402]]) { let px = 26; do { c.font = `800 ${px}px system-ui, sans-serif`; px--; } while (c.measureText(name).width > 196 && px > 12); c.fillText(name, x, 34); }
  lamp(String(sb.h).padStart(2, ' '), 110, 106, 92, '#FFC83D'); lamp(String(sb.a).padStart(2, ' '), 402, 106, 92, '#FFC83D');
  lamp(sb.clock, 256, 74, 58, '#FF4A3A');
  c.font = '800 20px system-ui, sans-serif'; c.fillStyle = '#F4F1EA'; c.fillText('PERIOD', 256, 136);
  lamp(sb.q, 256, 168, 40, '#FFC83D');
  c.fillText('FOULS', 110, 190); c.fillText('FOULS', 402, 190);
  lamp(String(sb.fh), 110, 222, 34, '#FF4A3A'); lamp(String(sb.fa), 402, 222, 34, '#FF4A3A');
  c.font = '800 16px system-ui, sans-serif'; c.fillStyle = '#F4F1EA';
  c.fillText('HOME', 34, 150); c.fillText('GUEST', 474, 150);
  // the bonus lamps sit under the clock, labelled below, clear of the FOULS captions
  for (const [on, x] of [[sb.bh, 214], [sb.ba, 298]]) { c.fillStyle = on ? '#FFC83D' : '#2A2533'; c.beginPath(); c.arc(x, 214, 9, 0, TAU); c.fill(); }
  c.fillStyle = '#F4F1EA'; c.font = '700 14px system-ui, sans-serif'; c.fillText('BONUS', 256, 240);
}

// ---------------------------------------------------------------- wall signage (generic game art)
function spiritBanner(team) {
  const cv = canvas(128, 320), c = cv.getContext('2d');
  const p = team.colors.primary, s2 = team.colors.secondary.toLowerCase() === p.toLowerCase() ? '#FFFFFF' : team.colors.secondary;
  c.fillStyle = p; c.fillRect(0, 0, 128, 320);
  c.fillStyle = s2; c.fillRect(0, 0, 128, 10); c.fillRect(0, 300, 128, 20);
  for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(k * 22, 320); c.lineTo(k * 22 + 11, 300); c.lineTo(k * 22 + 22, 320); c.fillStyle = p; c.fill(); }
  drawCrest(c, team, 64, 70, 44);
  c.save(); c.translate(64, 205); c.rotate(-Math.PI / 2);
  c.font = '900 40px "Arial Black", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = s2;
  const word = team.mascot.toUpperCase();
  const w = c.measureText(word).width; if (w > 170) c.scale(170 / w, 1);
  c.fillText(word, 0, 0); c.restore();
  return cv;
}
function exitSign() {
  const cv = canvas(128, 48), c = cv.getContext('2d');
  c.fillStyle = '#1B1012'; c.fillRect(0, 0, 128, 48);
  c.font = '900 34px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#FF3B30'; c.shadowColor = '#FF3B30'; c.shadowBlur = 8; c.fillText('EXIT', 64, 26);
  return cv;
}

// ---------------------------------------------------------------- pennants
function pennantCanvas(p, team) {
  const cv = canvas(160, 220), c = cv.getContext('2d');
  const col = team.colors.primary, ink = team.colors.secondary;
  c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.lineTo(160, 0); c.lineTo(160, 170); c.lineTo(80, 220); c.lineTo(0, 170); c.closePath(); c.fill();
  c.strokeStyle = ink; c.lineWidth = 6; c.stroke();
  c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '900 46px "Arial Black", Impact, sans-serif'; c.fillText(String(p.year), 80, 62);
  // the label from data.js: "BOYS STATE CHAMPS", "GIRLS STATE CHAMPS" or "STATE CHAMPIONS" (program not recorded)
  const words = (p.label || 'STATE CHAMPIONS').toUpperCase().split(' ');
  const lines = words.length > 2 ? [words[0], words.slice(1).join(' ')] : [words.join(' ')];
  c.font = '800 21px system-ui, sans-serif';
  lines.forEach((ln, k) => { const w = c.measureText(ln).width; c.save(); c.translate(80, 112 + k * 26); if (w > 140) c.scale(140 / w, 1); c.fillText(ln, 0, 0); c.restore(); });
  return cv;
}


// ---------------------------------------------------------------- courtside furniture
function scorerTable(len, home, away, arena) {
  const g = new THREE.Group();
  const cv = canvas(1024, 112), c = cv.getContext('2d');
  const base = arena ? '#10131C' : '#17151C';
  c.fillStyle = base; c.fillRect(0, 0, 1024, 112);
  const band = arena ? '#1E3F8A' : home.colors.primary;
  c.fillStyle = band; c.fillRect(0, 0, 1024, 14); c.fillRect(0, 98, 1024, 14);
  c.font = '900 52px "Arial Black", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const ink = arena ? '#D4AF37' : [home.colors.secondary, home.colors.accent, '#FFFFFF'].find((x) => contrast(x, base) >= 3);
  c.fillStyle = ink;
  c.fillText(arena ? 'STATE FINALS' : home.name.toUpperCase().replace(' HIGH SCHOOL', ''), 512, 58);
  c.font = '800 26px system-ui, sans-serif'; c.fillStyle = '#F4F1EA';
  c.fillText('HOME', 90, 58); c.fillText('GUEST', 934, 58);
  const front = new THREE.MeshStandardMaterial({ map: texOf(cv), roughness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: C(base), roughness: 0.55 });
  const top = new THREE.MeshStandardMaterial({ color: C('#2A2730'), roughness: 0.35 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, 2.5, 2.2), [dark, dark, top, dark, front, dark]);
  body.position.set(0, 1.25, -(HW + 4.8)); body.castShadow = true;
  g.add(body);
  return g;
}
const chairGeo = (() => {
  let g = null;
  return () => {
    if (g) return g;
    const parts = [new THREE.BoxGeometry(1.4, 0.18, 1.3).translate(0, 1.5, 0), new THREE.BoxGeometry(1.4, 1.3, 0.16).translate(0, 2.2, -0.62)];
    for (const x of [-0.6, 0.6]) for (const z of [-0.55, 0.55]) parts.push(new THREE.BoxGeometry(0.1, 1.5, 0.1).translate(x, 0.75, z));
    g = mergeGeometries(parts);
    return g;
  };
})();
function mergeGeometries(list) {
  const pos = [], nor = [], idx = [];
  let o = 0;
  for (const geo of list) {
    const ng = geo.toNonIndexed ? geo : geo;
    const P = ng.attributes.position.array, N = ng.attributes.normal.array, I = ng.index ? ng.index.array : null;
    for (let k = 0; k < P.length; k++) { pos.push(P[k]); nor.push(N[k]); }
    if (I) for (let k = 0; k < I.length; k++) idx.push(I[k] + o);
    o += P.length / 3;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  m.setIndex(idx);
  return m;
}
function chairRow(team, side, n) {
  // a near-black school color would turn the bench into a void: those schools sit on their second color
  const col = contrast(team.colors.primary, '#111111') < 2.2 ? team.colors.secondary : team.colors.primary;
  const mesh = new THREE.InstancedMesh(chairGeo(), new THREE.MeshStandardMaterial({ color: C(col), roughness: 0.6 }), n);
  const m = new THREE.Matrix4();
  for (let k = 0; k < n; k++) { m.makeTranslation(side * (15 + k * 2.0), 0, -(HW + 5.6)); mesh.setMatrixAt(k, m); }
  mesh.castShadow = true;
  return mesh;
}

// ---------------------------------------------------------------- static batching
// The venue is built from a few hundred boxes and planes. Merge every static, single-material mesh into one
// mesh per (material, layers, shadow flags), so the main, shadow and reflection passes each walk a handful of
// objects instead of hundreds.
function mergeStatic(root) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const victims = [];
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.dyn || Array.isArray(o.material)) return;
    for (let p = o.parent; p && p !== root; p = p.parent) if (p.userData.dyn) return;
    const geo = o.geometry;
    if (!geo.index || !geo.attributes.normal || !geo.attributes.uv) return;
    const k = `${o.material.uuid}|${o.layers.mask}|${o.castShadow}|${o.receiveShadow}|${o.renderOrder}`;
    if (!groups.has(k)) groups.set(k, { mat: o.material, layers: o.layers.mask, cast: o.castShadow, recv: o.receiveShadow, ro: o.renderOrder, geos: [] });
    const g = geo.clone();
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name);
    g.applyMatrix4(o.matrixWorld);
    groups.get(k).geos.push(g);
    victims.push(o);
  });
  for (const o of victims) { o.parent.remove(o); o.geometry.dispose(); }
  for (const gr of groups.values()) {
    const geo = THREE.mergeGeometries(gr.geos, false);
    for (const g of gr.geos) g.dispose();
    if (!geo) continue;
    const m = new THREE.Mesh(geo, gr.mat);
    m.layers.mask = gr.layers; m.castShadow = gr.cast; m.receiveShadow = gr.recv; m.renderOrder = gr.ro;
    root.add(m);
  }
}

// ---------------------------------------------------------------- the camera side (reverse angles only)
function nearSide(arena, home, away, atlas, palette, rng) {
  const g = new THREE.Group(), seats = [];
  const stepM = new THREE.MeshStandardMaterial({ color: arena ? C('#23252F') : C('#8E6640'), roughness: 0.6 });
  const riserM = new THREE.MeshStandardMaterial({ color: arena ? C('#1F4FB8') : C('#6B4A2E'), roughness: 0.8 });
  const rows = arena ? 16 : 12, rd = arena ? 2.6 : 2.3, rh = arena ? 1.5 : 1.3, z0 = HW + (arena ? 12 : 9.5), len = arena ? 132 : 126;
  for (let r = 0; r < rows; r++) {
    const z = z0 + r * rd, y = r * rh;
    const step = new THREE.Mesh(new THREE.BoxGeometry(len, 0.35, rd), stepM); step.position.set(0, y + rh - 0.17, z + rd / 2 - 0.05); g.add(step);
    const riser = new THREE.Mesh(new THREE.BoxGeometry(len, rh, 0.2), riserM); riser.position.set(0, y + rh / 2, z); g.add(riser);
    for (let x = -len / 2 + 1.2; x < len / 2 - 1; x += 1.75 + rng() * 0.5) if (rng() > 0.18) { const gr = rng() < 0.15 ? 'stand' : 'seat'; seats.push({ x, y: y + rh * 0.55 - 1.0, z: z + 0.9, g: gr, row: r, f: gr === 'stand' ? [x, y + rh, z + rd / 2, Math.PI] : [x, y, z + rd / 2 + 0.1, Math.PI], k: gr === 'stand' ? 1 : 0, team: arena ? 0 : x > len / 2 - 26 ? 1 : 0, tint: !arena && x > len / 2 - 26 ? CL(away.colors.primary) : null }); }
  }
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshStandardMaterial({ color: arena ? C('#1A1E2C') : C('#9A8E7C'), roughness: 0.8 })); // darker than the floor, so a replay keeps the court brightest
  wall.position.set(0, 45, z0 + rows * rd + 1); wall.rotation.y = Math.PI; g.add(wall);
  mergeStatic(g);
  const crowd = makeCrowd(seats, atlas, palette, rng);
  crowd.material.uniforms.uLight.value = arena ? 0.36 : 0.54;
  g.add(crowd);
  return { g, crowd, seats };
}

// ---------------------------------------------------------------- textures from the painted pack
export function loadImages(tex) {
  const out = {};
  const jobs = [];
  for (const k of ['floor', 'wall']) if (tex && tex[k]) { const img = new Image(); img.src = tex[k]; out[k] = img; jobs.push(img.decode()); }
  if (tex && tex.crowd) { const img = new Image(); img.src = tex.crowd.src; out.crowd = img; out.crowdMeta = tex.crowd; jobs.push(img.decode()); }
  return Promise.all(jobs).then(() => out);
}

function rngOf(seed) { let s = seed % 2147483647 || 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function hashStr(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }

// ---------------------------------------------------------------- build a venue
// v: { kind, home, away, pennants }, opts: { images, reflect, floorPx, shadows }
export function buildVenue(v, opts) {
  const arena = v.kind === 'arena';
  const home = v.home, away = v.away;
  const g = new THREE.Group();
  // the HQ home-gym shell (venue-hq.js) replaces the procedural architecture: A() adds a piece only without it
  const shell = opts.shell || null;
  const A = (o) => { if (!shell) g.add(o); return o; };
  const rng = rngOf(hashStr(v.kind + home.key + away.key));
  // the room the probe sees, for box-projected reflections (walls, roof; the camera side is open, so far away)
  const room = arena ? { min: new THREE.Vector3(-112, 0, -96), max: new THREE.Vector3(112, 82, 96) } : { min: new THREE.Vector3(-66, 0, -64), max: new THREE.Vector3(66, 82, 70) };
  const floor = makeFloor(home, arena, { ...opts, room });
  if (!shell) g.add(floor.mesh, floor.sur);
  const padCap = arena ? '#D4AF37' : contrast(home.colors.primary, '#111111') < 2.2 ? home.colors.secondary : '#F4F1EA';
  const hoops = [0, 1].map((s) => makeHoop(s, arena ? '#1E3F8A' : home.colors.primary, padCap));
  for (const h of hoops) g.add(h.g);
  const seats = [];
  const wallImg = opts.images.wall;
  const wallTex = wallImg ? texOf(wallImg, { repeat: true }) : null;
  const sbCanvas = scoreboardCanvas();
  const sbTex = texOf(sbCanvas);
  let ribbon = null;
  const pal = (hexes) => hexes.map(CL);
  if (!arena) {
    // ---- home gym
    const woodMat = new THREE.MeshStandardMaterial({ color: C('#8E6640'), roughness: 0.55 });
    const riserMat = new THREE.MeshStandardMaterial({ color: C('#8A6440'), roughness: 0.8, emissive: C('#9A7650') }); // bounce on the shadowed riser fronts (C squares the value: this is about 0.1)
    const ROWS = 8, RD = 2.3, RH = 1.3, Z0 = -(HW + 9.5), LEN = 126; // keep in step with art-src/blender/venue/build_gym.py
    for (let r = 0; r < ROWS; r++) {
      const z = Z0 - r * RD, y = r * RH;
      const step = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.35, RD), woodMat); step.position.set(0, y + RH - 0.17, z - RD / 2 + 0.05); step.receiveShadow = true; A(step);
      const riser = new THREE.Mesh(new THREE.BoxGeometry(LEN, RH, 0.2), riserMat); riser.position.set(0, y + RH / 2, z); A(riser);
      for (let x = -LEN / 2 + 1.2; x < LEN / 2 - 1; x += 1.75 + rng() * 0.5) {
        if (rng() < 0.16) continue;
        // a pep-band block on the left end of the first rows
        const band = r < 3 && x < -LEN / 2 + 14;
        // the visitors' section sits at the far right end; everyone else wears home colors or plain clothes
        const visitors = x > LEN / 2 - 26;
        const gr = band ? 'band' : (r > 5 && rng() < 0.35 ? 'stand' : 'seat'), xx = x + (rng() - 0.5) * 0.3;
        // (3D crowd: f = [x, y of the floor under the feet, z, facing], k = kind; a seated body's origin is its seat)
        seats.push({ x: xx, y: y + RH * 0.55 - 1.0, z: z - 0.9, g: gr, row: r, f: gr === 'stand' ? [xx, y + RH, z - 1.15, 0] : [xx, y, z - 1.15, 0], k: gr === 'stand' ? 1 : 0,
          style: band ? [1, 1, 3, 1] : null,
          tint: band ? CL(home.colors.primary) : visitors ? CL(rng() < 0.6 ? away.colors.primary : rng() < 0.5 ? away.colors.secondary : '#3A3F4A') : null, team: visitors ? 1 : 0 });
      }
    }
    const backZ = Z0 - ROWS * RD - 1;
    // walls: padded wainscot in school color, painted block above, a school-color stripe band
    // the block tile is 4 × 8 blocks of 16 × 8 in, i.e. 5.33 ft square
    const wallM = new THREE.MeshStandardMaterial({ color: C('#E4DED0'), roughness: 0.55, map: wallTex });
    if (wallTex) wallTex.repeat.set(150 / 5.33, 84 / 5.33);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(150, 84), wallM); back.position.set(0, 42, backZ); A(back);
    const endM = wallM.clone(); if (wallTex) { endM.map = wallTex.clone(); endM.map.needsUpdate = true; endM.map.repeat.set(130 / 5.33, 84 / 5.33); }
    for (const s of [-1, 1]) {
      const end = new THREE.Mesh(new THREE.PlaneGeometry(130, 84), endM); end.position.set(s * 66, 42, -10); end.rotation.y = -s * Math.PI / 2; A(end);
      const wain = new THREE.Mesh(new THREE.PlaneGeometry(130, 7), new THREE.MeshStandardMaterial({ color: C(padCap === home.colors.secondary ? home.colors.secondary : home.colors.primary), roughness: 0.9 })); wain.position.set(s * 65.9, 3.5, -10); wain.rotation.y = -s * Math.PI / 2; A(wain); // a near-black school color would read as a void: those schools get their second color
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(130, 2.2), new THREE.MeshStandardMaterial({ color: C(home.colors.secondary), roughness: 0.7 })); stripe.position.set(s * 65.85, 13, -10); stripe.rotation.y = -s * Math.PI / 2; A(stripe);
    }
    // end walls: a scoreboard over each baseline, two spirit banners and lit exit signs
    const boxM = new THREE.MeshStandardMaterial({ color: C('#1A181F'), roughness: 0.6 });
    const sbScreen = new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false, color: glow(0.5) });
    const spirit = texOf(spiritBanner(home));
    const exitT = texOf(exitSign());
    for (const s of [-1, 1]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 0.8), [boxM, boxM, boxM, boxM, sbScreen, boxM]);
      sb.position.set(s * 65.4, 25, -4); sb.rotation.y = -s * Math.PI / 2; g.add(sb);
      for (const z of [-30, 22]) {
        const b = new THREE.Mesh(new THREE.PlaneGeometry(6, 15), new THREE.MeshStandardMaterial({ map: spirit, roughness: 0.85 }));
        b.position.set(s * 65.7, 30, z); b.rotation.y = -s * Math.PI / 2; g.add(b);
      }
      const ex = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshBasicMaterial({ map: exitT, toneMapped: false, color: glow(0.6) }));
      ex.position.set(s * 65.7, 10.5, 34); ex.rotation.y = -s * Math.PI / 2; g.add(ex);
    }
    const bandM = new THREE.MeshStandardMaterial({ color: C(home.colors.primary), roughness: 0.7 });
    const topBand = new THREE.Mesh(new THREE.PlaneGeometry(150, 3.2), bandM); topBand.position.set(0, ROWS * RH + 4.6, backZ + 0.05); A(topBand);
    // wall lettering above the bleachers: "<MASCOT>" in the school's second color
    const lc = canvas(1024, 96), l = lc.getContext('2d');
    l.font = '900 74px "Arial Black", Impact, sans-serif'; l.textAlign = 'center'; l.textBaseline = 'middle';
    l.fillStyle = contrast(home.colors.secondary, '#E4DED0') >= 2 ? home.colors.secondary : home.colors.primary; l.fillText(home.mascot.toUpperCase(), 512, 52);
    const letters = new THREE.Mesh(new THREE.PlaneGeometry(60, 5.6), new THREE.MeshStandardMaterial({ map: texOf(lc), transparent: true, roughness: 0.6 }));
    letters.position.set(0, ROWS * RH + 15.5, backZ + 0.1); g.add(letters);
    // wall scoreboard
    const sbBox = new THREE.Mesh(new THREE.BoxGeometry(17, 8.5, 0.8), [riserMat, riserMat, riserMat, riserMat, new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false, color: glow(0.5) }), riserMat]);
    sbBox.position.set(0, ROWS * RH + 24, backZ + 0.6); g.add(sbBox);
    // title pennants (real title years only) along the back wall
    const pens = v.pennants || [];
    // the same real title years also hang on the end walls, where the game camera sees them
    for (const s of [-1, 1]) pens.forEach((p, i) => {
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6), new THREE.MeshStandardMaterial({ map: texOf(pennantCanvas(p, home)), transparent: true, roughness: 0.85 }));
      pm.position.set(s * 65.6, 17, -22 + i * 5.4); pm.rotation.y = -s * Math.PI / 2; g.add(pm);
    });
    pens.forEach((p, i) => {
      // title banners in a row just above the stands, where the broadcast camera sees them
      const pm = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 7.6), new THREE.MeshStandardMaterial({ map: texOf(pennantCanvas(p, home)), transparent: true, roughness: 0.85, side: THREE.DoubleSide }));
      const x = (i - (pens.length - 1) / 2) * 7.2;
      pm.position.set(x + (x >= 0 ? 12 : -12), ROWS * RH + 9.2, backZ + 0.4); g.add(pm);
    });
    // scorer's table (lettered front panel) and team chairs between the court and the stands
    g.add(reflect(scorerTable(22, home, away, false)));
    for (const s of [-1, 1]) g.add(chairRow(s < 0 ? home : away, s, 9));
    // students stand three deep behind each baseline (clear of the stanchion)
    for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let z = -HW + 2; z <= HW - 2; z += 1.9 + rng() * 0.4) {
      if (Math.abs(z) < 5.5 || rng() < 0.12) continue;
      const zz = z + (rng() - 0.5) * 0.5;
      seats.push({ x: s * (HL + 9.5 + r * 1.6), y: r * 0.9, z: zz, g: 'stand', row: r, f: [s * (HL + 9.5 + r * 1.6), r * 0.9, zz, -s * Math.PI / 2], k: 1 });
    }
    const riserEnd = new THREE.MeshStandardMaterial({ color: C('#8E6640'), roughness: 0.6 }); // wood, like the bleachers: the students stand on steps, not a dark ledge
    for (const s of [-1, 1]) for (let r = 1; r < 3; r++) { const st = new THREE.Mesh(new THREE.BoxGeometry(1.6, r * 0.9, HW * 2 - 2), riserEnd); st.position.set(s * (HL + 9.5 + r * 1.6), r * 0.45, 0); A(st); }
    // team benches: substitutes in team colors
    // (the team chairs stay empty until the benches get real players; spectators in them read wrong)
    // cheer squad on the baseline corners (standing sprites)
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) seats.push({ x: s * (HL - 9 + k * 2.4), y: 0, z: -(HW + 2.6) - (k % 2) * 0.6, g: 'cheer', tint: CL(home.colors.primary), pants: CL(home.colors.secondary), f: [s * (HL - 9 + k * 2.4), 0, -(HW + 2.6) - (k % 2) * 0.6, 0], k: 2, style: [0, 0, 1, 1] });
    // ceiling: dark deck, steel trusses and round high-bay lamps
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(160, 140), new THREE.MeshStandardMaterial({ color: C('#2B2A2E'), roughness: 0.95 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 82; A(ceil);
    const trussM = new THREE.MeshStandardMaterial({ color: C('#3C3F47'), roughness: 0.5, metalness: 0.5 });
    for (let x = -60; x <= 60; x += 15) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.6, 140), trussM); t.position.set(x, 80, -10); A(t); }
    const lampM = new THREE.MeshBasicMaterial({ color: C('#FFF4DC').multiplyScalar(GLOW * 1.4) });
    for (let x = -45; x <= 45; x += 15) for (const z of [-20, 0, 20]) {
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 0.6, 16), lampM); lamp.position.set(x, 46, z); A(lamp);
    }
  } else {
    // ---- finals arena: two-tier bowl of royal-blue chairs; the +x end has only a short lower block
    const seatM = new THREE.MeshStandardMaterial({ color: C('#1F4FB8'), roughness: 0.6 });
    const stepM = new THREE.MeshStandardMaterial({ color: C('#23252F'), roughness: 0.85 });
    const SIDE = 132; // the side tiers run into the corners, so no dark gap opens between them and the ends
    const sideRows = (zSign, tierY, tierZ, rows) => {
      for (let r = 0; r < rows; r++) {
        const y = tierY + r * 1.5, d = tierZ + r * 2.6;
        const step = new THREE.Mesh(new THREE.BoxGeometry(SIDE, 1.5, 2.6), stepM); step.position.set(0, y + 0.75, zSign * d); A(step);
        const chairs = new THREE.Mesh(new THREE.BoxGeometry(SIDE, 1.1, 0.7), seatM); chairs.position.set(0, y + 2.0, zSign * (d + 0.6)); A(chairs);
        for (let x = -SIDE / 2 + 2; x < SIDE / 2 - 2; x += 1.8 + rng() * 0.3) if (rng() < 0.82) { const gr = rng() < 0.12 ? 'stand' : 'seat'; seats.push({ x, y: y + 1.5, z: zSign * (d - 0.2), g: gr, row: r, f: gr === 'stand' ? [x, y + 1.5, zSign * (d + 0.1), zSign < 0 ? 0 : Math.PI] : [x, y + 1.0, zSign * (d + 1.2), zSign < 0 ? 0 : Math.PI], k: gr === 'stand' ? 1 : 0 }); }
      }
    };
    const endRows = (xSign, tierY, tierX, rows, width) => {
      for (let r = 0; r < rows; r++) {
        const y = tierY + r * 1.5, d = tierX + r * 2.6;
        const step = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, width), stepM); step.position.set(xSign * d, y + 0.75, 0); A(step);
        const chairs = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, width), seatM); chairs.position.set(xSign * (d + 0.6), y + 2.0, 0); A(chairs);
        for (let z = -width / 2 + 1; z < width / 2 - 1; z += 1.8 + rng() * 0.3) if (rng() < 0.8) seats.push({ x: xSign * (d - 0.2), y: y + 1.5, z, g: 'seat', row: r, f: [xSign * (d + 1.2), y + 1.0, z, -xSign * Math.PI / 2], k: 0 });
      }
    };
    sideRows(-1, 0, HW + 12, 16); // far side lower tier
    sideRows(-1, 30, HW + 12 + 16 * 2.6 + 8, 12); // far side upper tier
    endRows(-1, 0, HL + 14, 14, 70); endRows(-1, 28, HL + 14 + 14 * 2.6 + 8, 10, 80);
    endRows(1, 0, HL + 14, 6, 34); // the short end: a small lower block, no upper deck
    // LED ribbon on the upper-tier fascia (far side)
    const rc = canvas(2048, 64), rcx = rc.getContext('2d');
    rcx.fillStyle = '#0C1838'; rcx.fillRect(0, 0, 2048, 64); // a lit navy LED panel, not a black strip
    rcx.font = '900 40px "Arial Black", Impact, sans-serif'; rcx.textBaseline = 'middle'; rcx.textAlign = 'center';
    // two phrases per tile, each in its own 1024 px half, so the text never overlaps itself as it scrolls
    for (let k = 0; k < 2; k++) { rcx.fillStyle = k ? '#D4AF37' : '#4FC3FF'; rcx.fillText(k ? 'HOT SPRINGS, ARKANSAS' : 'STATE FINALS', k * 1024 + 512, 34); }
    const rt = texOf(rc, { repeat: true }); rt.repeat.set(2, 1);
    ribbon = new THREE.Mesh(new THREE.PlaneGeometry(120, 3.2), new THREE.MeshBasicMaterial({ map: rt, toneMapped: false, color: glow(0.6) }));
    ribbon.position.set(0, 28, -(HW + 12 + 16 * 2.6 + 6)); ribbon.userData.dyn = true; g.add(ribbon);
    // a second ribbon on the lower-bowl fascia, in the game camera's view
    const rt2 = rt.clone(); rt2.needsUpdate = true; rt2.repeat.set(3, 1);
    const ribbon2 = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, 2.6), new THREE.MeshBasicMaterial({ map: rt2, toneMapped: false, color: glow(0.6) }));
    ribbon2.position.set(0, 2.2, -(HW + 11.6)); ribbon2.userData.dyn = true; g.add(ribbon2);
    // a lit navy kick board from the floor to the ribbon (the step face under it read as a black band)
    const kick = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, 0.95), new THREE.MeshBasicMaterial({ color: C('#1E2C5C') }));
    kick.position.set(0, 0.46, -(HW + 11.55)); kick.userData.dyn = true; g.add(kick);
    ribbon.userData.twin = ribbon2;
    // the far-side apron between the court and the stands: painted navy, lit by the court's spill (it read as a
    // black band behind the benches)
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, 9.6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: C('#33406A'), roughness: 0.7, emissive: C('#1C2440') }));
    apron.position.set(0, 0.03, -(HW + 6.8)); apron.receiveShadow = true; apron.userData.dyn = true; g.add(apron);
    // house lights down, court lit: a pool of light over the floor
    const spot = new THREE.SpotLight(0xfff4e2, 900, 160, 0.62, 0.55, 1.6);
    spot.position.set(0, 95, 0); spot.target.position.set(0, 0, 0);
    g.add(spot, spot.target);
    // end video board above the -x upper tier
    const sbBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 24), [new THREE.MeshBasicMaterial({ map: sbTex, toneMapped: false, color: glow(0.5) }), stepM, stepM, stepM, stepM, stepM]);
    sbBox.position.set(-(HL + 14 + 14 * 2.6 + 8 + 10 * 2.6 + 2), 58, 0); g.add(sbBox);
    // dark roof with a lighting truss over the court
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(400, 300), new THREE.MeshStandardMaterial({ color: C('#262B3E'), roughness: 1 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 82; A(ceil);
    const lampM = new THREE.MeshBasicMaterial({ color: C('#FFFFFF').multiplyScalar(GLOW * 1.4) });
    for (let x = -36; x <= 36; x += 12) for (const z of [-16, 0, 16]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.5, 12), lampM); l.position.set(x, 70, z); A(l); }
    const trussM = new THREE.MeshStandardMaterial({ color: C('#1C1E26'), roughness: 0.6, metalness: 0.4 });
    for (const z of [-16, 0, 16]) { const t = new THREE.Mesh(new THREE.BoxGeometry(84, 1.2, 1.2), trussM); t.position.set(0, 71, z); A(t); }
    // courtside: a long table on the far side, team chairs either side
    g.add(reflect(scorerTable(40, home, away, true)));
    for (const s of [-1, 1]) g.add(chairRow(s < 0 ? home : away, s, 9));
  }
  // benches (3D crowd only): five substitutes on each team's chairs, a seated assistant, the head coach standing
  const bench = [];
  for (const s of [-1, 1]) {
    const team = s < 0 ? home : away, ti = s < 0 ? 0 : 1;
    const jc = CL(team.colors.primary), sc2 = CL(contrast(team.colors.primary, '#111111') < 2.2 ? team.colors.secondary : team.colors.primary);
    for (let k = 1; k <= 6; k++) bench.push({ f: [s * (15 + k * 2.0), 0, -(HW + 5.6), 0], k: 3, team: ti, shirt: jc, pants: sc2, style: [0, 0, rng() < 0.5 ? 0 : 2, 1], row: 0 });
    bench.push({ f: [s * 15, 0, -(HW + 5.6), 0], k: 3, team: ti, shirt: CL('#2B2F3A'), pants: CL('#1C1D22'), style: [1, 1, 2, 0], row: 0 });
    bench.push({ f: [s * 12.6, 0, -(HW + 3.6), 0.25 * s], k: 4, team: ti, shirt: jc, pants: CL(rng() < 0.5 ? '#8C7A5C' : '#1C1D22'), style: [1, 1, rng() < 0.5 ? 0 : 2, 0], row: 0 });
  }
  // crowd
  const atlas = opts.images.crowd ? { tex: texOf(opts.images.crowd), meta: opts.images.crowdMeta } : fallbackAtlas();
  const palette = arena
    ? pal([home.colors.primary, home.colors.secondary, away.colors.primary, away.colors.secondary, '#3A3F4A', '#2B3A5C', '#F4F1EA', '#555B66', '#7A8494', '#1F4E9C', '#8C2A2A', '#2E5E3A'])
    : pal([home.colors.primary, home.colors.primary, home.colors.secondary, '#F4F1EA', home.colors.primary, '#3A3F4A', '#2B3A5C', away.colors.primary]);
  if (shell) addShell(g, shell, home, floor.mat, wallTex, C);
  const crowd = makeCrowd(seats, atlas, palette, rng);
  crowd.material.uniforms.uLight.value = arena ? 0.32 : 0.4; // the house sits darker than the floor
  g.add(crowd);
  mergeStatic(g);
  // the camera side: stands, crowd and a back wall that only reverse angles see (replays, close-ups, the title
  // sweep). The broadcast camera sits where these stands would be, so they are shown only for those cameras.
  const near = nearSide(arena, home, away, atlas, palette, rng);
  near.g.visible = false; g.add(near.g);
  return { g, floor, hoops, crowd, near, sbCanvas, sbTex, ribbon, arena, room, hq: !!shell, sbLast: '', seats, bench, palette };
}
