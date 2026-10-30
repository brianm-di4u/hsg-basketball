// Frame composition: camera, cached floor and venue layers, depth-sorted players, hoops, ball, effects, meters.
import { COURT, makeView, sx, sy, clampCam } from './court.js';
import { buildFloor, buildBackdrop, drawPlayer, ARENA_FLOOR } from './art.js';
import { rnd, clamp, shade } from './util.js';
import { SWEET } from './rules.js';
import { G3, draw3d, resize3d } from './gl/scene3d.js';

const TAU = Math.PI * 2;
export const R = {
  cv: null, c: null, dpr: 1, v: null, floor: null, back: null, key: '', fx: { pops: [], parts: [], shake: 0, net: [0, 0], rim: [0, 0] },
  cosmo: { rs: 7 }, frozen: false, reduced: false, snap: true, use3d: true,
};
export const is3d = () => R.use3d && G3.state === 'ready';

export function initRender(cv) { R.cv = cv; R.c = cv.getContext('2d'); }

export function resize(w, h) {
  R.dpr = Math.min(2, window.devicePixelRatio || 1);
  R.cv.width = Math.round(w * R.dpr); R.cv.height = Math.round(h * R.dpr);
  R.cv.style.width = w + 'px'; R.cv.style.height = h + 'px';
  const cam = R.v ? R.v.camX : COURT.L / 2;
  R.v = makeView(w, h, h > w * 1.05);
  R.v.camX = cam;
  R.key = '';
  resize3d(w, h, window.devicePixelRatio || 1);
}

// venue: {kind:'home'|'arena', home, away, pennants}
function ensureLayers(venue) {
  const k = `${R.v.W}x${R.v.H}|${R.dpr}|${venue.kind}|${venue.home.key}|${venue.away.key}|${venue.pennants.map((p) => p.year).join(',')}`;
  if (k === R.key) return;
  R.key = k;
  R.floor = buildFloor(R.v, venue.kind === 'arena' ? ARENA_FLOOR : venue.home, R.dpr);
  R.back = buildBackdrop(R.v, venue.kind, venue.home, venue.away, venue.pennants, R.dpr);
}

// ---------------------------------------------------------------- effects
export function pop(text, x, y, z, color = '#FFF6E0', big = false) {
  R.fx.pops.push({ text, x, y, z, t: 0, color, big });
}
export function burst(kind, x, y, z, n = 24, colors = ['#D4AF37', '#F4F1EA']) {
  if (R.reduced) return;
  for (let k = 0; k < n; k++) {
    const a = rnd(R.cosmo) * TAU, sp = 4 + rnd(R.cosmo) * 10;
    R.fx.parts.push({ kind, x, y, z, vx: Math.cos(a) * sp, vy: 4 + rnd(R.cosmo) * 10, vz: Math.sin(a) * sp * 0.6, t: 0, life: kind === 'steam' ? 1.4 : 2.2, c: colors[k % colors.length], r: rnd(R.cosmo) });
  }
}
export function shake(a) { if (!R.reduced) R.fx.shake = Math.max(R.fx.shake, a); }
export function netHit(side) { R.fx.net[side] = 1; }
export function rimHit(side) { R.fx.rim[side] = 1; }
export function confetti(colors) {
  if (R.reduced) return;
  for (let k = 0; k < 140; k++) R.fx.parts.push({ kind: 'conf', x: R.v.camX + (rnd(R.cosmo) - 0.5) * (R.v.W / R.v.s), y: 18 + rnd(R.cosmo) * 10, z: rnd(R.cosmo) * 50, vx: (rnd(R.cosmo) - 0.5) * 4, vy: -rnd(R.cosmo) * 3, vz: 0, t: 0, life: 6, c: colors[k % colors.length], r: rnd(R.cosmo) });
}
export function fxIdle() { return R.fx.pops.length === 0 && R.fx.parts.length === 0; }

function stepFx(dt) {
  if (R.frozen) return;
  const f = R.fx;
  f.shake = Math.max(0, f.shake - dt * 3);
  f.net = f.net.map((n) => Math.max(0, n - dt * 2.2));
  f.rim = f.rim.map((n) => Math.max(0, n - dt * 4));
  f.pops = f.pops.filter((p) => (p.t += dt) < 1.3);
  f.parts = f.parts.filter((p) => {
    p.t += dt;
    if (p.kind === 'conf') { p.vy -= 6 * dt; p.vx += Math.sin(p.t * 4 + p.r * 9) * dt * 3; p.y += p.vy * dt; p.x += p.vx * dt; return p.t < p.life && p.y > 0; }
    if (p.kind === 'steam') { p.y += (2 + p.r * 2) * dt; p.x += Math.sin(p.t * 3 + p.r * 6) * dt; return p.t < p.life; }
    p.vy -= 32 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.y < 0) { p.y = 0; p.vy *= -0.4; p.vx *= 0.7; }
    return p.t < p.life;
  });
}

// ---------------------------------------------------------------- frame
// scene: { m (match) | so (shootout), venue, dt, userTeam, showMeter }
export function draw(scene) {
  const { c, dpr } = R;
  const v = R.v;
  if (!v) return;
  stepFx(scene.dt || 0);
  if (is3d()) {
    G3.canvas.style.visibility = 'visible';
    draw3d({ ...scene, reduced: R.reduced || R.snap }, R.fx);
    R.snap = false;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, v.W, v.H);
    vignette(c, v, scene.venue.kind === 'arena' ? 0.62 : 0.45);
    drawHud(c, v, G3.P, scene);
    return;
  }
  if (G3.canvas) G3.canvas.style.visibility = 'hidden';
  ensureLayers(scene.venue);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  // camera
  const tgt = scene.camX ?? COURT.L / 2;
  const goal = clampCam(v, tgt);
  if (R.snap || R.reduced) { v.camX = goal; R.snap = false; } else v.camX += (goal - v.camX) * Math.min(1, (scene.dt || 0.016) * 4.5);
  const shk = R.fx.shake > 0 ? (rnd(R.cosmo) - 0.5) * R.fx.shake * 6 : 0;
  c.save(); c.translate(shk, shk * 0.5);
  // background fill below and above
  c.fillStyle = scene.venue.kind === 'arena' ? '#14121F' : '#3B2A1E'; c.fillRect(-10, -10, v.W + 20, v.H + 20);
  // backdrop and floor
  const bx = sx(v, -R.back.mx);
  c.drawImage(R.back.cv, bx, 0, R.back.w, R.back.h);
  const fx0 = sx(v, -R.floor.mx), fy0 = sy(v, -R.floor.mz);
  c.drawImage(R.floor.cv, fx0, fy0, R.floor.w, R.floor.h);
  // near-side apron fade
  const nearY = sy(v, COURT.W + R.floor.mz);
  if (nearY < v.H) { c.fillStyle = scene.venue.kind === 'arena' ? '#1F1C2E' : '#4A3324'; c.fillRect(0, nearY - 1, v.W, v.H - nearY + 2); }
  const items = [];
  const players = scene.players || [];
  // shadows
  for (const it of players) shadow(c, v, it.pl.x, it.pl.z, 1.1, 0.35 - Math.min(0.2, (it.pl.y || 0) * 0.04));
  if (scene.ball) shadow(c, v, scene.ball.x, scene.ball.z, 0.45, 0.3 - Math.min(0.2, scene.ball.y * 0.015));
  // floor rings: solid for home, dashed for away
  for (const it of players) ring(c, v, it);
  for (const it of players) items.push({ z: it.pl.z, f: () => drawPlayer(c, sx(v, it.pl.x), sy(v, it.pl.z), v.s, it.pl, it.r, it.kit) });
  for (const side of [0, 1]) {
    items.push({ z: 24.98, f: () => hoopBack(c, v, side, scene.venue) });
    items.push({ z: 25.02, f: () => hoopFront(c, v, side) });
  }
  if (scene.ball) items.push({ z: scene.ball.z + 0.001, f: () => drawBall(c, v, scene.ball) });
  items.sort((a, b) => a.z - b.z);
  for (const it of items) it.f();
  drawHud(c, v, P2, scene);
  c.restore();
}

// broadcast vignette over the 3D frame (cached per size)
let vig = null;
function vignette(c, v, a) {
  const k = `${v.W}x${v.H}|${a}`;
  if (!vig || vig.k !== k) {
    const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(v.W / 4)); cv.height = Math.max(1, Math.round(v.H / 4));
    const g = cv.getContext('2d'), r = Math.hypot(cv.width, cv.height) / 2;
    const gr = g.createRadialGradient(cv.width / 2, cv.height * 0.55, r * 0.45, cv.width / 2, cv.height * 0.55, r * 1.05);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
    g.fillStyle = gr; g.fillRect(0, 0, cv.width, cv.height);
    vig = { k, cv };
  }
  c.drawImage(vig.cv, 0, 0, v.W, v.H);
}

// 2D projector: court feet to screen px, and px per foot
const _p2 = { X: 0, Y: 0, s: 1, vis: true };
function P2(x, z, y = 0) { const v = R.v; _p2.X = sx(v, x); _p2.Y = sy(v, z, y); _p2.s = v.s; return _p2; }

// The HUD layer, shared by both renderers: YOU marker, particles, callouts, meters, off-screen arrow.
function drawHud(c, v, P, scene) {
  if (is3d()) ballHalo(c, P, scene.ball);
  for (const it of scene.players || []) if (it.user) chevron(c, v, P, it);
  for (const p of R.fx.parts) {
    const q = P(p.x, p.z, p.y), X = q.X, Y = q.Y, s = q.s;
    if (p.kind === 'conf') { c.fillStyle = p.c; c.save(); c.translate(X, Y); c.rotate(p.t * 5 + p.r * 6); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
    else if (p.kind === 'steam') {
      if (is3d()) continue; // in 3D the rim flash and the cloth net carry the make; flat puffs read as ghost discs
      c.fillStyle = `rgba(255,255,255,${0.16 * (1 - p.t / p.life)})`; c.beginPath(); c.arc(X + Math.cos(p.r * 9) * s * 0.8, Y - p.t * s, s * (0.3 + p.t * 0.6), 0, TAU); c.fill(); }
    else { c.fillStyle = p.c; c.globalAlpha = 1 - p.t / p.life; c.beginPath(); c.arc(X, Y, Math.max(1.5, s * 0.12), 0, TAU); c.fill(); c.globalAlpha = 1; }
  }
  for (const p of R.fx.pops) {
    const q = P(p.x, p.z, p.y);
    if (q.X < 0 || q.X > v.W || q.Y < 0 || q.Y > v.H || q.vis === false) continue; // its rim or player is off screen
    const X = clamp(q.X, 70, v.W - 70), Y = clamp(q.Y - p.t * q.s * 2.2, 40, v.H - 30);
    const size = Math.round(clamp(q.s * (p.big ? 1.6 : 1.05), p.big ? 26 : 17, p.big ? 54 : 34));
    c.font = `400 ${Math.round(size * 1.25)}px "Bebas Neue", "Arial Black", Impact, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.globalAlpha = Math.min(1, 2.2 - p.t * 1.7);
    const w = c.measureText(p.text).width;
    // a solid plate behind every callout so it reads on any floor
    c.fillStyle = 'rgba(14,12,22,0.82)';
    c.beginPath(); c.roundRect(X - w / 2 - size * 0.4, Y - size * 0.66, w + size * 0.8, size * 1.3, size * 0.3); c.fill();
    c.fillStyle = p.color; c.fillText(p.text, X, Y + 1);
    c.globalAlpha = 1;
  }
  if (scene.meter) drawMeter(c, v, P, scene.meter);
  if (scene.ftMeter) drawFTMeter(c, v, P, scene.ftMeter);
  if (scene.offscreen) offscreenArrow(c, v, P, scene.offscreen);
  if (scene.letterbox) { const h = Math.round(v.H * 0.07); c.fillStyle = '#000'; c.fillRect(0, 0, v.W, h); c.fillRect(0, v.H - h, v.W, h); }
  if (scene.banner) banner(c, v, scene.banner);
  R.slamBox = null;
  // a cinematic close camera (replays, close-ups) carries the moment itself: no card over the ball
  if (scene.slam && !(is3d() && G3.camOverride && !G3.camOverride.attract)) slamCallout(c, v, P, scene);
}

// A loose ball in 3D gets a soft dark halo, so it reads against the crowd and the floor alike (the ball itself
// stays clear: the halo starts outside its edge).
function ballHalo(c, P, b) {
  if (!b || b.state === 'held' || b.state === 'dead' || b.y < 1.2) return;
  const q = P(b.x, b.z, b.y), r = Math.max(4, q.s * 0.45);
  const g = c.createRadialGradient(q.X, q.Y, r * 1.12, q.X, q.Y, r * 5);
  g.addColorStop(0, 'rgba(8,6,12,0.72)'); g.addColorStop(0.4, 'rgba(8,6,12,0.45)'); g.addColorStop(1, 'rgba(8,6,12,0)');
  c.fillStyle = g; c.beginPath(); c.arc(q.X, q.Y, r * 5, 0, TAU); c.arc(q.X, q.Y, r * 1.12, 0, TAU, true); c.fill();
}

// big-play callout: a slanted plate in the scoring team's color with speed streaks; slides in, holds, fades
function slamCallout(c, v, P, scene) {
  const s = scene.slam;
  const t = s.t, inT = Math.min(1, t / 0.14), out = t > 0.75 ? 1 - (t - 0.75) / 0.25 : 1;
  const size = Math.round(clamp(v.W * 0.085, 40, 92));
  // keep clear of the rim it went through and of the ball: try a few bands, take the first one free of both
  const keep = [];
  if (s.side != null) { const r = P(COURT.rimX[s.side], COURT.rimZ, COURT.rimY); keep.push({ x: r.X - 3 * r.s, y: r.Y - 4.5 * r.s, w: 6 * r.s, h: 9 * r.s }); }
  if (scene.ball) { const b = P(scene.ball.x, scene.ball.z, Math.max(0.4, scene.ball.y)); keep.push({ x: b.X - 2 * b.s - 10, y: b.Y - 2 * b.s - 10, w: 4 * b.s + 20, h: 4 * b.s + 20 }); }
  const hPx = size * 1.15 + 12 + size * 0.5, wPx = Math.min(v.W, size * 5.4);
  const bands = v.portrait ? [0.62, 0.8, 0.4] : [0.72, 0.5, 0.86];
  const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  let y = v.H * bands[0];
  for (const f of bands) { const box = { x: v.W / 2 - wPx / 2, y: v.H * f - hPx / 2, w: wPx, h: hPx }; if (!keep.some((k) => hit(box, k))) { y = v.H * f; break; } }
  R.slamBox = { x: Math.round(v.W / 2 - wPx / 2), y: Math.round(y - hPx / 2), w: Math.round(wPx), h: Math.round(hPx) };
  const slide = R.reduced ? 0 : (1 - inT) * v.W * 0.4;
  c.save();
  c.globalAlpha = Math.max(0, out);
  c.translate(v.W / 2 + slide, y);
  c.font = `400 ${size}px "Bebas Neue", "Arial Black", Impact, sans-serif`;
  const w = c.measureText(s.text).width + size * 1.2, h = size * 1.15;
  c.transform(1, 0, -0.18, 1, 0, 0);
  c.fillStyle = 'rgba(10,9,16,0.9)'; c.fillRect(-w / 2 - 8, -h / 2 - 6, w + 16, h + 12);
  c.fillStyle = s.color; c.fillRect(-w / 2, -h / 2, w, h);
  c.fillStyle = '#D4AF37'; c.fillRect(-w / 2, h / 2 - 5, w, 5);
  if (!R.reduced && !v.portrait) { c.fillStyle = 'rgba(255,255,255,0.35)'; for (let k = 0; k < 5; k++) c.fillRect(-w / 2 - 30 - k * 26 - (1 - inT) * 120, -h / 3 + k * h / 7, 18 + k * 6, 3); }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = Math.max(4, size * 0.08); c.strokeStyle = '#0B0A10'; c.strokeText(s.text, 0, 3);
  c.fillStyle = '#FFF6E0'; c.fillText(s.text, 0, 3);
  if (s.sub) { c.font = `400 ${Math.round(size * 0.34)}px "Bebas Neue", "Arial Black", sans-serif`; c.fillStyle = '#FFF6E0'; c.fillText(s.sub, 0, h / 2 + size * 0.32); }
  c.restore();
}

// "REPLAY" bug: a broadcast-style plate in the top-left corner
function banner(c, v, b) {
  const big = clamp(v.W * 0.03, 16, 26);
  c.font = `400 ${Math.round(big * 1.3)}px "Bebas Neue", "Arial Black", Impact, sans-serif`;
  const w = c.measureText(b.text).width + big * 1.6;
  const x = 12, y = 12, h = big * 1.7;
  c.fillStyle = 'rgba(14,12,22,0.88)'; c.beginPath(); c.roundRect(x, y, w, h, 6); c.fill();
  c.fillStyle = '#D4AF37'; c.fillRect(x, y, 6, h);
  c.fillStyle = '#FF4A3A'; c.beginPath(); c.arc(x + big * 0.75, y + h / 2, big * 0.22, 0, TAU); c.fill();
  c.fillStyle = '#FFF6E0'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(b.text, x + big * 1.15, y + h / 2 + 1);
  if (b.sub) {
    c.font = `700 ${Math.round(big * 0.6)}px system-ui, sans-serif`;
    const sw = c.measureText(b.sub).width + 16;
    c.fillStyle = 'rgba(14,12,22,0.75)'; c.beginPath(); c.roundRect(x, y + h + 6, sw, big * 1.1, 5); c.fill();
    c.fillStyle = '#E9E2D2'; c.fillText(b.sub, x + 8, y + h + 6 + big * 0.56);
  }
}

function shadow(c, v, x, z, r, a) {
  c.fillStyle = `rgba(20,10,0,${Math.max(0.08, a)})`;
  c.beginPath(); c.ellipse(sx(v, x), sy(v, z), r * v.s, r * v.s * v.K * 0.9, 0, 0, TAU); c.fill();
}

function ring(c, v, it) {
  const X = sx(v, it.pl.x), Y = sy(v, it.pl.z);
  c.save();
  c.lineWidth = Math.max(1.5, v.s * 0.1);
  c.strokeStyle = it.kit.light ? it.kit.trim : it.kit.band || it.kit.trim;
  if (!it.home) c.setLineDash([v.s * 0.35, v.s * 0.25]);
  c.beginPath(); c.ellipse(X, Y, v.s * 1.05, v.s * 1.05 * v.K, 0, 0, TAU); c.stroke();
  c.restore();
}
function chevron(c, v, P, it) {
  const q = P(it.pl.x, it.pl.z, (it.pl.y || 0) + it.r.height / 12 + 0.7);
  const s = clamp(q.s, 14, 24), X = q.X, top = is3d() && v.W >= 760 ? Math.max(q.Y, 96 + s) : q.Y; // clear of the floating score bug
  c.fillStyle = '#FFD84D'; c.strokeStyle = '#14121F'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(X - s * 0.5, top - s * 0.55); c.lineTo(X + s * 0.5, top - s * 0.55); c.lineTo(X, top); c.closePath(); c.fill(); c.stroke();
  const fs = Math.round(clamp(s * 0.6, 11, 18));
  c.font = `800 ${fs}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'bottom';
  c.lineWidth = 3; c.strokeText('YOU', X, top - s * 0.6); c.fillStyle = '#FFD84D'; c.fillText('YOU', X, top - s * 0.6);
}

function hoopBack(c, v, side, venue) {
  const bxw = COURT.boardX[side], rx = COURT.rimX[side], dir = side ? -1 : 1;
  const padC = venue.home.colors.primary;
  // stanchion behind the baseline
  const px = side ? COURT.L + 4 : -4;
  c.fillStyle = '#2B2B30';
  c.fillRect(sx(v, px) - v.s * 0.35, sy(v, 25, 11.5), v.s * 0.7, sy(v, 25) - sy(v, 25, 11.5));
  c.fillStyle = padC; c.fillRect(sx(v, px) - v.s * 0.6, sy(v, 25, 6), v.s * 1.2, sy(v, 25) - sy(v, 25, 6));
  c.strokeStyle = '#2B2B30'; c.lineWidth = v.s * 0.35; c.beginPath(); c.moveTo(sx(v, px), sy(v, 25, 11.2)); c.lineTo(sx(v, bxw), sy(v, 25, 11.2)); c.stroke();
  // board seen edge-on, with a hint of glass
  const X = sx(v, bxw);
  c.fillStyle = 'rgba(210,235,245,0.55)'; c.fillRect(X - v.s * 0.18, sy(v, 25, COURT.boardY1) - v.s * 1.4, v.s * 0.36, (COURT.boardY1 - COURT.boardY0) * v.s + v.s * 1.4);
  c.strokeStyle = '#F4F1EA'; c.lineWidth = Math.max(1, v.s * 0.08); c.strokeRect(X - v.s * 0.18, sy(v, 25, COURT.boardY1) - v.s * 1.4, v.s * 0.36, (COURT.boardY1 - COURT.boardY0) * v.s + v.s * 1.4);
  // back half of the rim
  const shakeY = R.fx.rim[side] ? Math.sin(R.fx.rim[side] * 30) * v.s * 0.08 : 0;
  c.strokeStyle = '#D9561E'; c.lineWidth = Math.max(1.5, v.s * 0.12);
  c.beginPath(); c.ellipse(sx(v, rx), sy(v, 25, COURT.rimY) + shakeY, COURT.rimR * v.s, COURT.rimR * v.s * v.K, 0, Math.PI, TAU); c.stroke();
  c.beginPath(); c.moveTo(X, sy(v, 25, COURT.rimY)); c.lineTo(sx(v, rx - dir * COURT.rimR), sy(v, 25, COURT.rimY)); c.stroke();
}

function hoopFront(c, v, side) {
  const rx = COURT.rimX[side];
  const X = sx(v, rx), Y = sy(v, 25, COURT.rimY) + (R.fx.rim[side] ? Math.sin(R.fx.rim[side] * 30) * v.s * 0.08 : 0);
  const r = COURT.rimR * v.s;
  // net: a trapezoid of strings; it stretches after a swish
  const st = R.fx.net[side];
  const nb = v.s * (1.5 + st * 0.6), nw = r * (0.55 - st * 0.1);
  c.strokeStyle = 'rgba(250,250,250,0.85)'; c.lineWidth = 1;
  for (let k = 0; k <= 6; k++) {
    const f = k / 6;
    const x0 = X - r + f * 2 * r, x1 = X - nw + f * 2 * nw + Math.sin(st * 20 + k) * st * 2;
    c.beginPath(); c.moveTo(x0, Y); c.lineTo(x1, Y + nb); c.stroke();
  }
  for (let k = 1; k <= 3; k++) { const f = k / 3.4, w = r + (nw - r) * f; c.beginPath(); c.ellipse(X, Y + nb * f, w, w * v.K * 0.6, 0, 0, Math.PI); c.stroke(); }
  c.strokeStyle = '#E8642A'; c.lineWidth = Math.max(1.5, v.s * 0.12);
  c.beginPath(); c.ellipse(X, Y, r, r * v.K, 0, 0, Math.PI); c.stroke();
}

function drawBall(c, v, b) {
  const X = sx(v, b.x), Y = sy(v, b.z, b.y), r = Math.max(3, 0.45 * v.s);
  const g = c.createRadialGradient(X - r * 0.35, Y - r * 0.35, r * 0.1, X, Y, r);
  g.addColorStop(0, '#F08A4B'); g.addColorStop(1, '#B4501F');
  c.fillStyle = g; c.beginPath(); c.arc(X, Y, r, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(40,20,10,0.75)'; c.lineWidth = Math.max(0.8, r * 0.12);
  const spin = (b.x + b.y) * 0.8;
  c.beginPath(); c.moveTo(X - r, Y); c.lineTo(X + r, Y); c.stroke();
  c.beginPath(); c.ellipse(X, Y, r * Math.abs(Math.cos(spin)), r, 0, 0, TAU); c.stroke();
}

// Shot meter: a vertical bar beside the shooter. Marker shape + text label, not color alone.
function drawMeter(c, v, P, mt) {
  const q = P(mt.x, mt.z, mt.y + mt.h + 0.4);
  const h = clamp(q.s * 4.6, 110, 170), w = clamp(q.s * 1.0, 22, 32);
  const X = clamp(q.X + Math.max(q.s * 1.4, 26), 8, v.W - w - 120), top = clamp(q.Y - h * 0.25, 12, v.H - h - 12);
  if (!mt.v && mt.label) { label(c, X, top + h * 0.35, mt.label, v, 'left'); return; } // after release: just the grade
  c.fillStyle = 'rgba(20,18,31,0.88)'; c.beginPath(); c.roundRect(X - 3, top - 3, w + 6, h + 6, 5); c.fill();
  c.strokeStyle = '#FFF6E0'; c.lineWidth = 1.5; c.stroke();
  const sweetY = top + h * (1 - SWEET / 1.18), bandH = h * (mt.win * 2 / 1.18);
  c.fillStyle = '#2E6A3C'; c.fillRect(X, sweetY - bandH * 1.5, w, bandH * 3);
  c.fillStyle = '#5FD38A'; c.fillRect(X, sweetY - bandH / 2, w, bandH);
  const f = clamp(mt.v / 1.18, 0, 1);
  c.fillStyle = 'rgba(255,216,77,0.92)'; c.fillRect(X + w * 0.2, top + h * (1 - f), w * 0.6, h * f);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(X - 8, top + h * (1 - f)); c.lineTo(X - 1, top + h * (1 - f) - 6); c.lineTo(X - 1, top + h * (1 - f) + 6); c.closePath(); c.fill();
  if (mt.label) label(c, X + w + 8, top + h * 0.35, mt.label, v, 'left');
}

function drawFTMeter(c, v, P, ft) {
  const q = P(ft.x, ft.z, ft.y);
  const w = clamp(q.s * 7, 150, 260), h = clamp(q.s * 0.6, 16, 22);
  const X = clamp(q.X - w / 2, 8, v.W - w - 8), Y = clamp(q.Y - h - q.s * 0.6, 30, v.H - h - 8);
  c.fillStyle = 'rgba(20,18,31,0.88)'; c.fillRect(X - 3, Y - 3, w + 6, h + 6);
  const band = 0.08 * ft.scale;
  c.fillStyle = '#2E6A3C'; c.fillRect(X + w * (0.5 - band * 2.2), Y, w * band * 4.4, h);
  c.fillStyle = '#5FD38A'; c.fillRect(X + w * (0.5 - band), Y, w * band * 2, h);
  const mx = X + w * ft.mv;
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(mx, Y - 1); c.lineTo(mx - 6, Y - 9); c.lineTo(mx + 6, Y - 9); c.closePath(); c.fill();
  c.fillRect(mx - 1.5, Y, 3, h);
  const size = Math.round(clamp(q.s * 0.6, 13, 18));
  c.font = `800 ${size}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'bottom';
  const txt = ft.label || `FREE THROW ${ft.n} OF ${ft.total}`;
  c.lineWidth = 4; c.strokeStyle = '#14121F'; c.strokeText(txt, X + w / 2, Y - 11); c.fillStyle = '#FFF6E0'; c.fillText(txt, X + w / 2, Y - 11);
}

function label(c, x, y, txt, v, align = 'center') {
  const size = Math.round(clamp(v.s * 1.15, 24, 38));
  c.font = `400 ${size}px "Bebas Neue", "Arial Black", Impact, sans-serif`; c.textAlign = align; c.textBaseline = 'middle';
  const w = c.measureText(txt).width, x0 = align === 'left' ? x - 6 : x - w / 2 - 6;
  c.fillStyle = 'rgba(14,12,22,0.86)'; c.beginPath(); c.roundRect(x0, y - size * 0.62, w + 12, size * 1.2, 5); c.fill();
  c.lineWidth = 4; c.strokeStyle = '#14121F'; c.strokeText(txt, x, y);
  c.fillStyle = txt === 'PERFECT' ? '#5FD38A' : txt === 'GOOD' ? '#FFF6E0' : '#FFB4A8'; c.fillText(txt, x, y);
}

function offscreenArrow(c, v, P, o) {
  const q = P(o.x, o.z, 3);
  const m = 18;
  if (q.X > 0 && q.X < v.W && q.Y > 0 && q.Y < v.H) return;
  const x = clamp(q.X, m, v.W - m), y = clamp(q.Y, m + 8, v.H - m);
  const a = Math.atan2(q.Y - y, q.X - x) || (q.X < 0 ? Math.PI : 0);
  c.save(); c.translate(x, y); c.rotate(a);
  c.fillStyle = '#FFD84D'; c.strokeStyle = '#14121F'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(11, 0); c.lineTo(-7, -11); c.lineTo(-7, 11); c.closePath(); c.fill(); c.stroke();
  c.restore();
}
