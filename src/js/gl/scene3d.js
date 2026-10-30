// The 3D renderer: loads three.js and the packed assets with classic <script> tags (file://-safe), builds the
// venue, poses the players, and draws the frame from a broadcast camera. render.js calls draw3d() and then
// draws the HUD on the 2D canvas through G3.P, which projects court feet to screen pixels.
/* global THREE */
import { COURT, rimFor } from '../court.js';
import { initPlayers, makePlayer, dressPlayer, updatePlayer } from './players3d.js';
// (HQ player bodies swap in through swapPlayersHQ below)
import { buildVenue, loadImages, drawScoreboard, LAYER_REFLECT } from './venue3d.js';
import { makeProbe } from './probe3d.js';
import { makeTrail } from './trail3d.js';
import { HQ } from './hq.js';
import { fmtClock } from '../util.js';
import { CORE } from './build-info.js';
import { makePost } from './post.js';
import { A as ANIM, loadAnims } from './anim-mixer.js';
import { IK } from './ik.js';
import { initCrowd3d, crowd3dReady, buildCrowd3d, C3 } from './crowd3d.js';

const HL = COURT.L / 2, HW = COURT.W / 2;
export const G3 = {
  state: 'off', // off | loading | ready | failed | unsupported
  tier: 'high', renderer: null, scene: null, camera: null, venue: null, venueKey: '', players: new Map(), pool: { M: [], F: [] },
  ball: null, ballSpin: 0, images: {}, probe: null, W: 0, H: 0, dpr: 1, camX: HL, camZ: 0, snap: true, sun: null, time: 0,
  canvas: null, userRing: null, err: '', P: null, frames: 0, cheer: 0, camOverride: null, punch: 0, refs: [{ x: 40, z: -1.6, vx: 0, vz: 0, act: 'idle', y: 0, t: 0 }, { x: 96, z: 34, vx: 0, vz: 0, act: 'idle', y: 0, t: 1 }], flags: { env: true, sun: true },
};
const V = () => new THREE.Vector3();
// officials (display only; the rules have no referees)
const REF_KIT = { ref: true, jersey: '#F4F1EA', trim: '#111111', shorts: '#111111', num: '#111111', band: '#111111', light: false };
const REF_LOOK = [
  { id: 'ref-1', num: '', height: 71, look: { skin: '#8D5524', hair: 'buzz', hairC: '#1B1B1F', band: false } },
  { id: 'ref-2', num: '', height: 69, look: { skin: '#E0AC69', hair: 'short', hairC: '#6B6B6B', band: false } },
];

// ---------------------------------------------------------------- loading
function script(src) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = () => res(); s.onerror = () => rej(new Error('could not load ' + src));
    document.head.appendChild(s);
  });
}
// What WebGL this device offers (three.js needs WebGL 2). Software renderers (SwiftShader, llvmpipe) can't hold
// a frame rate in 3D, so the game's "Auto" graphics setting keeps the classic 2D court on them.
export function glProbe() {
  try {
    const cv = document.createElement('canvas');
    const g = cv.getContext('webgl2');
    if (!g) return { ok: false, renderer: '', software: false };
    const ext = g.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER));
    const lose = g.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return { ok: true, renderer, software: /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) };
  } catch (e) { return { ok: false, renderer: '', software: false }; }
}
export function pickTier(w, h) {
  const phone = Math.min(w, h) < 600 || (navigator.maxTouchPoints > 1 && Math.max(w, h) < 1100);
  return phone ? 'medium' : 'high';
}
export async function load3d(stage, tier) {
  if (G3.state !== 'off') return G3.state;
  if (!glProbe().ok) { G3.state = 'unsupported'; return G3.state; }
  G3.state = 'loading'; G3.tier = tier;
  try {
    if (!globalThis.THREE) await script(CORE.three);
    const A = globalThis.HOOPS_ASSETS || {};
    if (!A.players) await script(CORE.players);
    if (!A.tex) await script(CORE.tex);
    const assets = globalThis.HOOPS_ASSETS;
    const bin = Uint8Array.from(atob(assets.players), (ch) => ch.charCodeAt(0)).buffer;
    const gltf = await new Promise((res, rej) => new THREE.GLTFLoader().parse(bin, '', res, rej));
    initPlayers(gltf);
    try { await document.fonts.load('40px "Bebas Neue"'); } catch (e) { /* canvas text falls back */ }
    G3.images = await loadImages(assets.tex);
    init(stage);
    G3.state = 'ready';
  } catch (e) {
    G3.err = String(e && e.message || e);
    G3.state = 'failed';
  }
  return G3.state;
}

function init(stage) {
  const cv = document.createElement('canvas');
  cv.id = 'gl'; cv.setAttribute('aria-hidden', 'true');
  stage.insertBefore(cv, stage.firstChild);
  G3.canvas = cv;
  // no canvas MSAA: post.js renders into its own (multisampled on high) target
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
  r.info.autoReset = false; // the composer renders several passes a frame; draw3d resets the counters once
  // a lost context (driver reset, memory pressure on a phone) drops back to the classic 2D court
  cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); G3.state = 'lost'; G3.err = 'WebGL context lost'; cv.style.visibility = 'hidden'; if (G3.onLost) G3.onLost(); });
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.97;
  r.shadowMap.enabled = G3.tier === 'high';
  r.shadowMap.autoUpdate = false; // updated once per frame before the main pass, never for the reflection
  r.shadowMap.type = THREE.PCFShadowMap;
  G3.renderer = r;
  G3.scene = new THREE.Scene();
  G3.camera = new THREE.PerspectiveCamera(30, 1, 2, 900);
  G3.camera.layers.enable(LAYER_REFLECT);
  // light: warm sky fill + an overhead key that casts the players' shadows
  const hemi = new THREE.HemisphereLight(0xf7f4ef, 0x6b4a2e, 1.35);
  G3.scene.add(hemi); G3.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff7ec, 1.7);
  sun.position.set(-12, 70, 30); sun.castShadow = G3.tier === 'high';
  const sz = G3.tier === 'high' ? 2048 : 1024;
  sun.shadow.mapSize.set(sz, sz);
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 36, bottom: -36, near: 10, far: 160 });
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  G3.scene.add(sun, sun.target); G3.sun = sun;
  sun.layers.enable(LAYER_REFLECT); hemi.layers.enable(LAYER_REFLECT);
  // a cool fill from the camera side (its glint reflects away from the lens)
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5); fill.position.set(10, 45, 90); G3.scene.add(fill); fill.layers.enable(LAYER_REFLECT);
  // ball
  G3.ball = new THREE.Mesh(new THREE.SphereGeometry(0.4, 28, 18), new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.62 }));
  G3.ball.castShadow = true; G3.ball.layers.enable(LAYER_REFLECT);
  G3.ball.scale.setScalar(1.12); // a touch larger than life so it reads at broadcast distance
  G3.scene.add(G3.ball);
  // a dark outline shell (inverted hull) keeps the ball readable against the floor and the crowd
  const hull = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 14), new THREE.MeshBasicMaterial({ color: 0x120a06, side: THREE.BackSide }));
  hull.scale.setScalar(1.14); G3.ball.add(hull);
  // soft contact shadows under players and the ball (one instanced draw)
  const sc = document.createElement('canvas'); sc.width = sc.height = 64;
  const sg = sc.getContext('2d'), gr = sg.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, 'rgba(0,0,0,0.55)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64);
  const st = new THREE.CanvasTexture(sc);
  G3.blobs = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false, toneMapped: false }), 14);
  G3.blobs.renderOrder = 1; G3.blobs.frustumCulled = false;
  G3.scene.add(G3.blobs);
  // shot trail: one glowing ribbon behind the ball in flight (trail3d.js)
  G3.trailFx = makeTrail(); G3.scene.add(G3.trailFx.mesh);
  // user marker: a bright ring under your player
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.55, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.95, depthWrite: false, toneMapped: false }));
  ring.add(new THREE.Mesh(new THREE.RingGeometry(1.62, 1.74, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x14121f, transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false })));
  ring.position.y = 0.03; ring.visible = false; ring.renderOrder = 2;
  G3.scene.add(ring); G3.userRing = ring;
  G3.probe = makeProbe(r, G3.tier === 'high' ? 256 : G3.tier === 'medium' ? 128 : 64);
  G3.post = makePost(r, G3.scene, G3.camera, G3.tier);
  G3.P = project;
  if (window.__TEST__) { window.__G3 = G3; window.__ANIM = ANIM; window.__C3 = C3; } // test and debug access
}

function ballTexture() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = '#D9662A'; c.fillRect(0, 0, 512, 256);
  for (let k = 0; k < 9000; k++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,220,180,0.07)'; c.fillRect(Math.random() * 512, Math.random() * 256, 2, 2); }
  c.strokeStyle = '#1C120C'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(0, 128); c.lineTo(512, 128); c.stroke();
  for (const x of [128, 384]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 256); c.stroke(); }
  for (const x0 of [0, 256]) { c.beginPath(); for (let y = 0; y <= 256; y += 4) { const x = x0 + 128 + Math.sin((y / 256) * Math.PI) * 70 * (x0 ? -1 : 1); y ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------- sizing and camera
export function resize3d(w, h, dpr) {
  if (G3.state !== 'ready') return;
  const cap = G3.tier === 'high' ? 2 : G3.tier === 'medium' ? 1.5 : 1;
  G3.dpr = Math.min(cap, dpr);
  G3.W = w; G3.H = h;
  G3.renderer.setPixelRatio(G3.dpr);
  G3.renderer.setSize(w, h, true);
  if (G3.post) G3.post.setSize(w, h);
  G3.camera.aspect = w / h; G3.camera.updateProjectionMatrix();
  G3.snap = true;
}

// Broadcast framing: a sideline camera. Wide screens show ~52 ft of court at the look-at depth; narrow ones
// look down more steeply and show less, so the far sideline and the basket stay in frame.
function frame(W, H) {
  const asp = W / H;
  const t = Math.max(0, Math.min(1, (1.25 - asp) / 0.65)); // 0 = landscape, 1 = portrait
  const fov = 30 + t * 14, pitch = (17.5 + t * 18) * Math.PI / 180, span = 52 - t * 30;
  const hf = 2 * Math.atan(Math.tan((fov * Math.PI / 180) / 2) * asp);
  let D = (span / 2) / Math.tan(hf / 2);
  // the court depth must fit vertically too
  D = Math.max(D, 56 - t * 22);
  return { fov, pitch, span, D, t };
}
export function clampCam3(x) {
  const f = frame(G3.W || 1280, G3.H || 720);
  const half = f.span / 2;
  const lo = half - 19, hi = COURT.L - half + 19; // far enough past the baselines that a drive to the rim stays in frame
  return lo > hi ? HL : Math.min(hi, Math.max(lo, x));
}
function placeCamera(dt, scene) {
  const cam = G3.camera, f = frame(G3.W, G3.H);
  const o = G3.camOverride;
  if (o) {
    // court-feet coordinates: p = camera position, t = look-at point
    if (cam.fov !== (o.fov || 30)) { cam.fov = o.fov || 30; cam.updateProjectionMatrix(); }
    cam.position.set(o.p[0] - HL, o.p[1], o.p[2] - HW); cam.lookAt(o.t[0] - HL, o.t[1], o.t[2] - HW); cam.updateMatrixWorld();
    G3.camX = o.t[0]; G3.snap = true;
    return;
  }
  const vert = scene.vertical || 0;
  // phones: a layup or dunk pulls the camera in toward the rim (the play is never a speck at the far end)
  G3.rimZoom = (G3.rimZoom || 0) + ((scene.rimPlay ? 1 : 0) - (G3.rimZoom || 0)) * Math.min(1, dt * (scene.rimPlay ? 6 : 2));
  const edgeV = 24 - 11 * (G3.rimZoom || 0);
  let goal = vert ? Math.max(edgeV, Math.min(COURT.L - edgeV, scene.camX ?? HL)) : clampCam3(scene.camX ?? HL);
  // a horizontal dead zone: small moves of the play leave the camera still, so the frame stops swimming
  if (!vert && !G3.snap) { const dz = f.span * 0.06, c = G3.camGoal ?? goal; goal = goal > c + dz ? goal - dz : goal < c - dz ? goal + dz : c; }
  G3.camGoal = goal;
  const zGoal = (scene.camZ ?? HW) - HW;
  if (G3.snap || scene.reduced) { G3.camX = goal; G3.camZ = zGoal; G3.nearZ = scene.nearZ; G3.snap = false; }
  else {
    // if the ball is near either edge of the frame, catch up quickly instead of easing
    const bq = scene.ballX != null ? project(scene.ballX, scene.ballZ, 0) : null, edge = bq && (bq.X < G3.W * 0.24 || bq.X > G3.W * 0.76);
    const k = Math.min(1, dt * (edge ? 9 : scene.fast ? 5.5 : 3.2)); G3.camX += (goal - G3.camX) * k; G3.camZ += (zGoal - G3.camZ) * k;
    if (scene.nearZ != null) G3.nearZ = G3.nearZ == null ? scene.nearZ : G3.nearZ + (scene.nearZ - G3.nearZ) * Math.min(1, dt * 3);
  }
  if (vert) {
    // portrait phones: the court runs up the screen toward the basket your team attacks; the full width fits
    const portrait = G3.H > G3.W;
    const fov = portrait ? 50 : 40;
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    const pitch = (portrait ? 32 : 26) * Math.PI / 180, hf = 2 * Math.atan(Math.tan((fov * Math.PI / 180) / 2) * (G3.W / G3.H));
    const D = (portrait ? 14.5 : 22) / Math.tan(hf / 2) * (1 - 0.3 * (G3.rimZoom || 0));
    const tx = G3.camX - HL + vert * (portrait ? 3 : 4), tz = G3.camZ * (portrait ? 0.85 : 0.5);
    const sh = scene.shake ? (Math.random() - 0.5) * scene.shake * 0.5 : 0;
    cam.position.set(tx - vert * Math.cos(pitch) * D + sh, 3 + Math.sin(pitch) * D, tz + sh);
    cam.up.set(0, 1, 0);
    cam.lookAt(tx, 3, tz);
    cam.updateMatrixWorld();
    return;
  }
  const fovNow = f.fov * (1 - 0.07 * G3.punch);
  if (cam.fov !== fovNow) { cam.fov = fovNow; cam.updateProjectionMatrix(); }
  // look-at depth: the frame's bottom edge sits a few feet below the nearest player's feet, so the play fills
  // the frame instead of bare wood; never past the near sideline
  const pitch = f.pitch + (scene.fast ? 2.5 * Math.PI / 180 : 0); // a shot tips the camera down a touch: the shooter's head clears the crowd line
  const camY = 3 + Math.sin(pitch) * f.D, bottomAng = pitch + (fovNow * Math.PI / 180) / 2;
  const zNear = Math.min(HW + 4, (G3.nearZ ?? HW) - HW + 3.5);
  let tz = zNear - Math.cos(pitch) * f.D + camY / Math.tan(bottomAng);
  tz = Math.max(tz, -HW - 6); // (the top edge sits near the horizon, so the far sideline stays in frame anyway)
  const tx = G3.camX - HL;
  const sh = scene.shake ? (Math.random() - 0.5) * scene.shake * 0.5 : 0;
  cam.position.set(tx + sh, camY + sh, tz + Math.cos(pitch) * f.D);
  cam.lookAt(tx, 3, tz);
  cam.updateMatrixWorld();
}

// court feet → screen px (and px per foot at that depth), for the HUD layer
const _p = { X: 0, Y: 0, s: 1, vis: true };
let _v1, _v2;
function project(x, z, y = 0) {
  if (!_v1) { _v1 = V(); _v2 = V(); }
  _v1.set(x - HL, y, z - HW).project(G3.camera);
  _v2.set(x - HL, y + 1, z - HW).project(G3.camera);
  _p.X = (_v1.x + 1) / 2 * G3.W; _p.Y = (1 - _v1.y) / 2 * G3.H;
  _p.s = Math.abs(_v2.y - _v1.y) / 2 * G3.H;
  _p.vis = _v1.z < 1;
  return _p;
}

// ---------------------------------------------------------------- venue and players
function venueKey(v, hq) { return `${v.kind}|${v.home.key}|${v.away.key}|${(v.pennants || []).map((p) => p.year + p.label).join(',')}|${hq ? 'hq' : 'lite'}`; }
// an HQ venue shell once its package has streamed in (hq.js): the GLB scene, both lightmaps, their scales
G3.shells = {};
function venueShell(kind) {
  const pkg = HQ.packages[`venue-${kind}`];
  if (!pkg || !pkg[`${kind}.glb`]) return null;
  if (G3.shells[kind]) return G3.shells[kind];
  const lm = (tag) => pkg[`${kind}-lm-${tag}-h.webp`] || pkg[`${kind}-lm-${tag}-m.webp`];
  if (!lm('floor') || !lm('shell')) return null;
  const sh = G3.shells[kind] = { kind, scene: pkg[`${kind}.glb`].scene, lm: { floor: lm('floor'), shell: lm('shell') }, lmScale: HQ.manifest.packages[`venue-${kind}`].lmScale };
  for (const t of Object.values(sh.lm)) t.userData.keep = true; // shared across venue rebuilds
  return sh;
}
function ensureVenue(v, canSwap) {
  const shell = venueShell(v.kind === 'arena' ? 'arena' : 'gym');
  const k = venueKey(v, !!shell);
  if (k === G3.venueKey) return;
  // the lite gym turning into the HQ one waits for a dead ball, so nothing pops mid-play
  if (G3.venue && shell && G3.venueKey === venueKey(v, false) && !canSwap) return;
  if (G3.venue) { G3.scene.remove(G3.venue.g); disposeTree(G3.venue.g); }
  G3.venueKey = k;
  G3.venue = buildVenue(v, { images: G3.images, floorPx: G3.tier === 'high' ? 18 : 13, probe: G3.probe.pos, shell });
  G3.scene.add(G3.venue.g);
  const arena = v.kind === 'arena';
  G3.hemi.intensity = arena ? 0.5 : 0.8;
  G3.sun.intensity = arena ? 1.1 : 1.0;
  G3.scene.background = new THREE.Color(arena ? 0x1c2134 : 0x1b1714);
  G3.scene.fog = arena ? new THREE.Fog(0x161b2b, 130, 300) : null;
  captureProbe();
}
// the room's own light for players, the ball and the floor's clear coat; people and effects stay out of it
function attachCrowd3d(v) {
  const V = G3.venue, girls = !!(v && v.home && v.home.roster && String(v.home.roster[0] && v.home.roster[0].id).includes('girls'));
  const o = { tier: G3.tier, palette: V.palette, girls, dim: V.arena ? 0.58 : 0.62 };
  V.crowd3d = buildCrowd3d([...V.seats, ...(V.bench || [])], { ...o, seed: 11 });
  V.g.add(V.crowd3d.g); V.crowd.visible = false;
  if (V.near && V.near.seats) { V.near3d = buildCrowd3d(V.near.seats, { ...o, seed: 23 }); V.near.g.add(V.near3d.g); V.near.crowd.visible = false; }
}
function captureProbe() {
  const hide = [G3.ball, G3.blobs, G3.userRing, G3.trailFx.mesh, ...[...G3.players.values()].map((pm) => pm.root)];
  G3.envTex = G3.probe.capture(G3.scene, hide);
}
function disposeTree(o) {
  o.traverse((c) => {
    if (c.geometry) c.geometry.dispose();
    const ms = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    for (const m of ms) { for (const key of ['map']) if (m[key] && !m[key].userData.keep) m[key].dispose(); m.dispose(); }
  });
}
// Rebuild every player on the HQ MPFB bodies (the lite rigs go; the pools refill from the new builds).
function swapPlayersHQ() {
  G3.hqPlayers = true;
  try { initPlayers(HQ.packages['players-hq']['players-hq.glb'], true); } catch (e) { console.info('[hq] players:', e.message); return; }
  for (const pm of G3.players.values()) G3.scene.remove(pm.root);
  G3.players.clear(); G3.pool = { M: [], F: [] };
}
function playerFor(idx, build) {
  let pm = G3.players.get(idx);
  if (pm && pm.build === build) return pm;
  if (pm) { G3.scene.remove(pm.root); G3.pool[pm.build].push(pm); }
  pm = G3.pool[build].pop() || makePlayer(build);
  pm.root.traverse((c) => c.layers.enable(LAYER_REFLECT));
  G3.players.set(idx, pm);
  G3.scene.add(pm.root);
  pm.key = ''; pm.st = null;
  return pm;
}

// ---------------------------------------------------------------- frame
export function draw3d(scene, fx) {
  if (G3.pendingTier) { const t = G3.pendingTier; G3.pendingTier = null; setTier(t); }
  const t0 = performance.now();
  const dt = Math.min(0.5, scene.dt || 0); // a step(n) hook draws once for n ticks; let the camera catch up
  G3.time += dt; G3.frames++;
  const canSwap = !scene.m || scene.m.phase !== 'live' || !!G3.camOverride || !!scene.reduced;
  ensureVenue(scene.venue, canSwap);
  if (ANIM.clips) ANIM.stats.frames = (ANIM.stats.frames || 0) + 1;
  // the 3D crowd: bake once when its package is in, then seat it in the venue at a dead ball
  if (!crowd3dReady() && HQ.packages.crowd && HQ.packages.crowd['fans.glb']) { try { initCrowd3d(HQ.packages.crowd['fans.glb']); } catch (e) { console.info('[hq] crowd:', e.message); HQ.packages.crowd = null; } }
  if (crowd3dReady() && G3.venue && !G3.venue.crowd3d && canSwap && G3.venue.seats) attachCrowd3d(scene.venue);
  if (!ANIM.clips && HQ.packages.anims && HQ.packages.anims['anims.json']) { try { loadAnims(HQ.packages.anims); } catch (e) { console.info('[hq] anims:', e.message); HQ.packages.anims = null; } }
  if (canSwap && !G3.hqPlayers && HQ.packages['players-hq'] && HQ.packages['players-hq']['players-hq.glb']) swapPlayersHQ();
  // the nearest player to the camera sets the bottom of the broadcast frame (no empty wood under the play)
  // (only players inside the frame horizontally count, judged from the last frame's camera)
  let nearZ = -Infinity;
  const shotX = scene.ball && scene.ball.state === 'shot' && scene.ball.shot ? scene.ball.x : null;
  for (const it of scene.players || []) {
    if (shotX != null && Math.abs(it.pl.x - shotX) > 22) continue; // a shot frames the shooter's neighbourhood
    const q = project(it.pl.x, it.pl.z, 0); if (G3.snap || (q.X > -30 && q.X < G3.W + 30)) nearZ = Math.max(nearZ, it.pl.z);
  }
  placeCamera(dt, { camX: scene.camX, camZ: scene.camZ, ballX: scene.ball ? scene.ball.x : null, ballZ: scene.ball ? scene.ball.z : null, nearZ: isFinite(nearZ) ? nearZ : null, reduced: scene.reduced, shake: fx.shake, fast: scene.ball && scene.ball.state === 'shot', vertical: scene.vertical, rimPlay: (scene.players || []).some((it) => it.pl.act === 'layup') || !!(scene.ball && scene.ball.state === 'shot' && scene.ball.shot && /layup|dunk/.test(scene.ball.shot.type)) });
  G3.vertical = scene.vertical || 0;
  const m = scene.m;
  // players
  const seen = new Set();
  const ball = scene.ball;
  let handPos = null, handScale = 0;
  for (const it of scene.players || []) {
    const pl = it.pl;
    const idx = pl.idx ?? 0;
    const build = it.r.id && String(it.r.id).includes('girls') ? 'F' : 'M';
    const pm = playerFor(idx, build);
    seen.add(idx);
    dressPlayer(pm, it.r, it.kit);
    pm.root.visible = true;
    const hasBall = !!(ball && ball.state === 'held' && pl.hasBall);
    const atk = m ? rimFor(m.dir[pl.t]) : COURT.rimX[1];
    let faceX = ball ? ball.x : HL, faceZ = ball ? ball.z : HW;
    if (hasBall || pl.act === 'shoot' || pl.act === 'layup') { faceX = atk; faceZ = COURT.rimZ; }
    if (m && m.phase === 'ft' && m.ft) { faceX = rimFor(m.dir[m.ft.team]); faceZ = COURT.rimZ; }
    const chasing = it.pl.defending && Math.hypot(pl.vx || 0, pl.vz || 0) > 10;
    const ctx = {
      pl, r: it.r, dt, snap: G3.snap, hasBall, defending: !!pl.defending, chasing, faceX, faceZ,
      ballX: ball ? ball.x : HL, ballZ: ball ? ball.z : HW, meterF: Math.min(1, (pl.meter || 0) / 1.0), released: !hasBall,
      dribbleY: hasBall ? Math.max(0, Math.min(1, (ball.y - 0.4) / ((it.r.height / 12) * 0.5))) : 0,
      holdBall: hasBall && m && (m.phase === 'inbound' || m.phase === 'ft' || m.phase === 'dead'),
      // the sim's bounce: ball height = |sin(dp)|; 0 on the floor, 0.5 at the top (in the hand)
      dribblePhase: hasBall && ball.dp != null ? (ball.dp / Math.PI) % 1 : null,
      ballY: ball ? ball.y : 0, ballTop: (it.r.height / 12) * 0.5 + 0.4, rimX: atk,
      camX: G3.camera.position.x + HL, camZ: G3.camera.position.z + HW,
    };
    // an airborne body near the rim is drawn in front of it (never through the ring or the board); the offset
    // eases in and out so nothing pops
    {
      const off = G3.rimOff || (G3.rimOff = new Map());
      const dir = atk > HL ? 1 : -1, front = (atk - pl.x) * dir; // feet in front of the rim's centre
      let want = 0;
      if ((pl.y || 0) > 0.2 && front < 2.4 && Math.abs(COURT.rimZ - pl.z) < 2.6) want = 2.4 - front;
      const cur = off.get(idx) || 0, nv = cur + (want - cur) * Math.min(1, dt / (want > cur ? 0.05 : 0.5));
      off.set(idx, nv);
      if (nv > 0.01) ctx.pl = { ...pl, x: pl.x - dir * nv };
    }
    ctx.dribbling = hasBall && !ctx.holdBall && !/shoot|layup|pass/.test(pl.act) && ball.y <= ctx.ballTop * 1.02;
    const hp = updatePlayer(pm, ctx);
    if (hasBall) { handPos = hp.clone(); handScale = pm.root.scale.x; }
    if (pl.act === 'layup' && pl.stype === 'dunk') G3.dunkHand = { p: hp.clone(), at: G3.time };
    if (it.user) { G3.userRing.visible = true; G3.userRing.position.x = pl.x - HL; G3.userRing.position.z = pl.z - HW; }
  }
  if (!(scene.players || []).some((it) => it.user)) G3.userRing.visible = false;
  if (G3.refSignal > 0) G3.refSignal -= dt;
  // two officials: the trail on the far sideline behind the ball, the lead on the baseline being attacked
  if (m && ball && m.phase !== 'final' && scene.players && scene.players.length >= 10) {
    const d = m.poss >= 0 ? m.dir[m.poss] : 1;
    const goals = [[ball.x - d * 9, -1.6], [d > 0 ? COURT.L + 2.2 : -2.2, HW + (ball.z > HW ? 9 : -9)]];
    goals.forEach(([gx, gz], k) => {
      const ref = G3.refs[k];
      const nx = Math.max(-3, Math.min(COURT.L + 3, gx));
      const vx = (nx - ref.x) * Math.min(1, dt * 2.2) / Math.max(dt, 1e-3), vz = (gz - ref.z) * Math.min(1, dt * 2.2) / Math.max(dt, 1e-3);
      const sp = Math.hypot(vx, vz), cap = 16, f = sp > cap ? cap / sp : 1;
      ref.vx = vx * f; ref.vz = vz * f; ref.x += ref.vx * dt; ref.z += ref.vz * dt;
      if (G3.snap) { ref.x = nx; ref.z = gz; ref.vx = ref.vz = 0; }
      const pm = playerFor(200 + k, 'M');
      seen.add(200 + k);
      dressPlayer(pm, REF_LOOK[k], REF_KIT);
      pm.root.visible = true;
      // the officials signal a made three
      ref.act = G3.refSignal > 0 ? 'ref3' : 'idle';
      updatePlayer(pm, { pl: ref, r: REF_LOOK[k], dt, snap: G3.snap, hasBall: false, defending: false, chasing: false, faceX: ball.x, faceZ: ball.z, ballX: ball.x, ballZ: ball.z, meterF: 0, released: true, dribbleY: 0, holdBall: false });
    });
  }
  for (const [idx, pm] of G3.players) if (!seen.has(idx)) pm.root.visible = false;
  // a cinematic camera never looks through someone standing at the lens (an official walking into the replay)
  if (G3.camOverride && !G3.camOverride.attract) {
    const f = G3.camOverride.focus, c = G3.camera.position;
    for (const pm of G3.players.values()) {
      if (!pm.root.visible) continue;
      const p = pm.root.position;
      if (p.distanceTo(c) < 7) { pm.root.visible = false; continue; }
      if (!f) continue;
      // and nobody stands between the camera and the subject (the shooter) to cover them
      const fx = f[0] - HL - c.x, fz = f[1] - HW - c.z, L = Math.hypot(fx, fz) || 1, px = p.x - c.x, pz = p.z - c.z;
      const along = (px * fx + pz * fz) / L, across = Math.abs(px * fz - pz * fx) / L;
      if (along > 0 && along < L - 2.5 && across < 3.2) pm.root.visible = false;
    }
  }
  G3.ball.scale.setScalar(G3.camOverride && !G3.camOverride.attract ? 0.95 : 1.12);
  // ball: in the hand when held (the sim keeps its own carry point for the rules)
  const B = G3.ball;
  if (ball) {
    B.visible = true;
    const prev = B.position.clone();
    if (handPos && ball.state === 'held') {
      const pl = (scene.players || []).find((it) => it.pl.hasBall);
      const shooting = pl && (pl.pl.act === 'shoot' || pl.pl.act === 'layup');
      // handPos is the ball's seat in the palm; on the dribble the ball drops away below the hand
      B.position.copy(handPos);
      if (!shooting && !ctx0(m)) B.position.y = Math.min(handPos.y, ball.y);
      // the ball sits in the palm whenever it isn't dropping away on the dribble (model metres, for the tests)
      else if (handScale) G3.ballErr = Math.max(G3.ballErr || 0, B.position.distanceTo(handPos) / handScale);
      if (B.position.y < 0.4) B.position.y = 0.4;
    } else B.position.set(ball.x - HL, Math.max(0.4, ball.y), ball.z - HW);
    // a dunk's ball stays in the hand until it is through the ring
    const sh = ball.state === 'shot' && ball.shot;
    // a dunk: from the hand straight down through the ring over the sim's flight time (no arc over the rim)
    if (sh && sh.type === 'dunk' && G3.dunkHand && G3.time - G3.dunkHand.at < 0.3) {
      const u = Math.min(1, sh.t / sh.T), rx = rimFor(m.dir[sh.team]) - HL, rz = COURT.rimZ - HW;
      G3._rt = G3._rt || new THREE.Vector3();
      if (u < 0.4) B.position.lerpVectors(G3.dunkHand.p, G3._rt.set(rx, Math.max(10.55, G3.dunkHand.p.y - 0.1), rz), u / 0.4);
      else B.position.set(rx, 10.55 + (9.3 - 10.55) * ((u - 0.4) / 0.6), rz);
    }
    const d = B.position.distanceTo(prev);
    if (d < 6) { G3.ballSpin += d / 0.4; B.rotation.set(G3.ballSpin * 0.7, 0, -G3.ballSpin); }
  } else B.visible = false;
  // contact shadows: shrink and fade as players and the ball leave the floor
  {
    const mtx = new THREE.Matrix4(); let n = 0;
    const put = (x, z, y, r) => { const k = Math.max(0.35, 1 - y * 0.08); mtx.makeScale(r * k, 1, r * k); mtx.setPosition(x - HL, 0.02, z - HW); G3.blobs.setMatrixAt(n++, mtx); };
    for (const it of scene.players || []) put(it.pl.x, it.pl.z, it.pl.y || 0, 2.6);
    if (ball && B.visible) put(B.position.x + HL, B.position.z + HW, B.position.y, 1.3);
    for (const k of [0, 1]) if (G3.players.get(200 + k) && G3.players.get(200 + k).root.visible) put(G3.refs[k].x, G3.refs[k].z, 0, 2.4);
    G3.blobs.count = n; G3.blobs.instanceMatrix.needsUpdate = true;
  }
  B.material.emissive.setRGB(0.32, 0.1, 0.02).multiplyScalar(ball && ball.state !== 'held' && ball.state !== 'dead' && ball.y > 1.2 ? 1 : 0);
  // trail while the ball is a shot in flight, cleared once it drops below the rim (no ghosts over the hoop)
  const inShot = ball && ball.state === 'shot' && !scene.reduced && !(ball.y < COURT.rimY - 0.4 && ball.vy < 0);
  // (a close camera would see the ribbon end-on, as a pale disc around the ball)
  if (inShot && G3.camera.position.distanceTo(B.position) > 22) G3.trailFx.update(B.position, G3.camera, scene.perfect ? 0xffc23a : 0xfff0d8, 0.5);
  else G3.trailFx.clear();
  // the ball's dark outline keeps about 1.5 px on screen at any distance
  if (ball && B.visible) { const q = project(B.position.x + HL, B.position.z + HW, B.position.y); const rpx = Math.max(1, q.s * 0.4 * B.scale.x); B.children[0].scale.setScalar(1 + 1.6 / rpx); }
  // hoops: cloth net, rim flash and board shake on a make, rim shake on iron, shot clocks
  const V3 = G3.venue;
  // looking down the court, the near hoop stands between the camera and the play: ghost it
  for (const side of [0, 1]) {
    const h = V3.hoops[side];
    // looking down the court on a phone the near hoop would sit in front of the play: leave it out
    const fade = !!scene.vertical && side === (scene.vertical > 0 ? 0 : 1) && !G3.camOverride;
    // (its static parts are merged into the venue mesh, so hide its materials rather than its group)
    if (fade !== h.faded) { h.faded = fade; for (const m of h.fade) m.visible = !fade; }
  }
  for (const side of [0, 1]) {
    const h = V3.hoops[side];
    const st = fx.net[side] || 0, rs = fx.rim[side] || 0;
    if (st > h.lastNet + 0.3) { h.netSim.kick(1); h.flash = 1; h.shake = Math.max(h.shake, 0.6); }
    if (rs > h.lastRim + 0.3) { h.netSim.kick(0.45, side ? -1 : 1); h.shake = Math.max(h.shake, 1); }
    h.lastNet = st; h.lastRim = rs;
    const bl = ball && B.visible ? [B.position.x - h.rimX, B.position.y - COURT.rimY, B.position.z] : null;
    h.netSim.update(dt, bl);
    h.flash = Math.max(0, h.flash - dt * 6); h.shake = Math.max(0, h.shake - dt * 2.5);
    const rm = h.rim.material; rm.emissive.copy(rm.userData.baseEmissive).lerp(new THREE.Color(3.4, 1.4, 0.5), h.flash);
    h.rim.position.y = h.rimBaseY + Math.sin(G3.time * 42) * h.shake * 0.07;
    h.g.position.z = Math.sin(G3.time * 31) * h.shake * 0.05;
    const sc = m && m.rules && m.rules.shotClock ? (m.clock.shotOff ? '--' : String(Math.ceil(Math.max(0, m.clock.shot - 0.001)))) : '';
    drawShotClock3(h.dg, sc);
  }
  // scoreboard
  if (m) {
    const qi = Math.min(m.clock.q, 4) - 1;
    const sb = { h: m.teams[0].score, a: m.teams[1].score, clock: fmtClock(m.clock.t), q: m.clock.q <= 4 ? String(m.clock.q) : 'OT', fh: m.teams[0].tf[qi], fa: m.teams[1].tf[qi],
      bh: m.teams[1].tf[qi] >= m.rules.bonusAt, ba: m.teams[0].tf[qi] >= m.rules.bonusAt };
    const key = JSON.stringify(sb);
    if (key !== V3.sbLast) { V3.sbLast = key; drawScoreboard(V3.sbCanvas, sb, m.teams[0].short.toUpperCase(), m.teams[1].short.toUpperCase()); V3.sbTex.needsUpdate = true; }
  } else if (!V3.sbLast) { V3.sbLast = 'idle'; drawScoreboard(V3.sbCanvas, { h: 0, a: 0, clock: '8:00', q: '1', fh: 0, fa: 0, bh: false, ba: false }, scene.venue.home.short.toUpperCase(), 'GUEST'); V3.sbTex.needsUpdate = true; }
  if (V3.ribbon) { V3.ribbon.material.map.offset.x = (G3.time * 0.03) % 1; V3.ribbon.userData.twin.material.map.offset.x = (-G3.time * 0.04) % 1; }
  // crowd: energy from the match plus bursts on big plays
  G3.cheer = Math.max(0, G3.cheer - dt * 0.6);
  if (scene.cheer) { G3.cheer = Math.max(G3.cheer, scene.cheer); if (!scene.reduced && scene.m) G3.punch = 1; }
  G3.punch = Math.max(0, G3.punch - dt * 2.2);
  // the camera-side stands exist only for reverse angles
  if (V3.near) V3.near.g.visible = !!G3.camOverride && !G3.camOverride.attract; // replays and close-ups (an orbit passes through them)
  const cu = V3.crowd.material.uniforms;
  if (scene.cheer) cu.uCheerTeam.value = V3.arena || scene.cheerTeam == null ? -1 : scene.cheerTeam;
  cu.uTime.value = G3.time; cu.uCheer.value = scene.reduced ? 0 : Math.min(1, G3.cheer + (m ? (m.crowd || 0) * 0.25 : 0));
  // a make (the cheer jumps): the 3D crowd's stand-and-cheer starts now, rippling from the nearer basket
  if ((scene.cheer || 0) > (G3.lastCheer || 0) + 0.3) { G3.cheerAt = G3.time; G3.cheerX = (scene.ball && scene.ball.x < HL ? COURT.rimX[0] : COURT.rimX[1]) - HL; }
  G3.lastCheer = scene.cheer || 0;
  // (a match passes the sim time since the make, exact under the test hooks; menus fall back to the render clock)
  const age = scene.cheerAge !== undefined ? scene.cheerAge : G3.cheerAt == null ? null : G3.time - G3.cheerAt;
  const bx = scene.cheerX != null ? scene.cheerX - HL : G3.cheerX || 0;
  for (const c3 of [V3.crowd3d, V3.near3d]) if (c3) c3.update(G3.time, scene.reduced ? null : age, scene.cheerAge !== undefined ? (V3.arena || scene.cheerTeam == null ? -1 : scene.cheerTeam) : cu.uCheerTeam.value, cu.uCheer.value, bx);
  cu.uRight.value.setFromMatrixColumn(G3.camera.matrixWorld, 0);
  if (V3.near && V3.near.g.visible) { const nu = V3.near.crowd.material.uniforms; nu.uTime.value = cu.uTime.value; nu.uCheer.value = cu.uCheer.value; nu.uCheerTeam.value = cu.uCheerTeam.value; nu.uRight.value.copy(cu.uRight.value); }
  // shadow camera follows the action
  // overhead key, slightly behind the court, so its glint on the floor falls outside the broadcast view
  G3.sun.position.set(G3.camX - HL - 4, 90, -18); G3.sun.target.position.set(G3.camX - HL, 0, 0); G3.sun.target.updateMatrixWorld();
  // render: reflection pass, then the frame
  const r = G3.renderer;
  G3.scene.environment = G3.flags.env ? G3.envTex : null;
  G3.sun.visible = G3.flags.sun;
  r.info.reset();
  const t1 = performance.now();
  const t2 = performance.now();
  r.shadowMap.needsUpdate = true;
  if (G3.post) {
    const co = G3.camOverride, cinema = !!(co && !co.attract && co.focus);
    if (cinema) G3.post.setCinema(true, (G3._focus || (G3._focus = new THREE.Vector3())).set(co.focus[0] - HL, 4.5, co.focus[1] - HW)); else G3.post.setCinema(false);
    G3.post.render(dt);
  } else r.render(G3.scene, G3.camera);
  const t3 = performance.now();
  const pf = G3.prof || (G3.prof = { n: 0, js: 0, refl: 0, main: 0 });
  pf.n++; pf.js += t1 - t0; pf.refl += t2 - t1; pf.main += t3 - t2;
  govern(t3 - t0, scene.dt);
}
function ctx0(m) { return m && (m.phase === 'inbound' || m.phase === 'ft' || m.phase === 'dead'); }
function drawShotClock3(dg, txt) {
  if (dg.last === txt) return; dg.last = txt;
  const c = dg.cv.getContext('2d');
  c.fillStyle = '#0B0B10'; c.fillRect(0, 0, 128, 64);
  if (txt) {
    c.font = '700 54px "Courier New", ui-monospace, monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#FF4A3A'; c.shadowColor = '#FF4A3A'; c.shadowBlur = 10; c.fillText(txt, 64, 35); c.shadowBlur = 0;
  }
  dg.tex.needsUpdate = true;
}

// Adaptive quality: if frames run slow for a couple of seconds of play, step down a tier
// (high → medium drops real-time shadows; medium → low drops the floor reflection). Never steps back up.
const GOV = { t: 0, slow: 0, frames: 0 };
function govern(ms, dt) {
  // test hooks (step(n)) draw frames whose dt is not a frame time at all
  if (!dt || dt > 0.2 || G3.hooked || G3.tier === 'low' || G3.camOverride) return;
  GOV.t += dt; GOV.frames++;
  if (dt > 1 / 40) GOV.slow++;
  if (GOV.t < 2.5) return;
  const slowShare = GOV.slow / GOV.frames;
  GOV.t = GOV.slow = GOV.frames = 0;
  if (slowShare < 0.5) return;
  G3.pendingTier = G3.tier === 'high' ? 'medium' : 'low'; // applied before the next frame renders (a resize clears the canvas)
}
export function setTier(t) {
  if (G3.state !== 'ready') return;
  G3.tier = t;
  const r = G3.renderer;
  r.shadowMap.enabled = t === 'high'; G3.sun.castShadow = t === 'high';
  if (G3.post) G3.post.dispose();
  G3.post = makePost(r, G3.scene, G3.camera, t);
  r.getContext(); // materials pick up shadow changes on their next compile
  G3.scene.traverse((o) => { if (o.material) for (const m of [].concat(o.material)) m.needsUpdate = true; });
  resize3d(G3.W, G3.H, window.devicePixelRatio || 1);
}

export function animCtl(o) {
  if (o === 'reset') { ANIM.stats = { players: 0, ms: 0, frames: 0 }; ANIM.seen.clear(); IK.maxResid = 0; IK.slips = 0; IK.locked = 0; G3.ballErr = 0; }
  else if (o === 'proc' || o === 'mixer') ANIM.mode = o; else ANIM.lab = o || null; return { mode: ANIM.mode, lab: ANIM.lab, clips: ANIM.clips ? Object.fromEntries(Object.entries(ANIM.clips).map(([k, c]) => [k, +c.dur.toFixed(3)])) : {} }; }
export function info3d() {
  if (G3.state !== 'ready') return { state: G3.state, err: G3.err };
  const i = G3.renderer.info;
  return { state: G3.state, tier: G3.tier, prof: G3.prof ? { ...G3.prof } : null, calls: i.render.calls, tris: i.render.triangles, geos: i.memory.geometries, texs: i.memory.textures, venue: G3.venueKey, frames: G3.frames,
    hqVenue: !!(G3.venue && G3.venue.hq), hqPlayers: !!G3.hqPlayers, crowd3d: G3.venue && G3.venue.crowd3d ? G3.venue.crowd3d.count : 0,
    anim: { mode: ANIM.clips ? ANIM.mode : 'proc', clips: ANIM.clips ? Object.keys(ANIM.clips).length : 0, msPer: ANIM.stats.players ? +(ANIM.stats.ms / ANIM.stats.players).toFixed(4) : 0, footResidCm: +(IK.maxResid * 100).toFixed(2), slips: IK.slips, locked: IK.locked, worst: IK.worst, seen: [...ANIM.seen], ballErrCm: +((G3.ballErr || 0) * 100).toFixed(2), frames: ANIM.stats.frames || 0 },
    cam: { x: +G3.camera.position.x.toFixed(1), y: +G3.camera.position.y.toFixed(1), z: +G3.camera.position.z.toFixed(1), fov: G3.camera.fov } };
}
