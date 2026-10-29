// Frame composition: camera, cached floor and venue layers, depth-sorted players, hoops, ball, effects, meters.
import { COURT, makeView, sx, sy, clampCam } from './court.js';
import { buildFloor, buildBackdrop, drawPlayer, ARENA_FLOOR } from './art.js';
import { rnd, clamp, shade } from './util.js';
import { SWEET } from './rules.js';

const TAU = Math.PI * 2;
export const R = {
  cv: null, c: null, dpr: 1, v: null, floor: null, back: null, key: '', fx: { pops: [], parts: [], shake: 0, net: [0, 0], rim: [0, 0] },
  cosmo: { rs: 7 }, frozen: false, reduced: false, snap: true,
};

export function initRender(cv) { R.cv = cv; R.c = cv.getContext('2d'); }

export function resize(w, h) {
  R.dpr = Math.min(2, window.devicePixelRatio || 1);
  R.cv.width = Math.round(w * R.dpr); R.cv.height = Math.round(h * R.dpr);
  R.cv.style.width = w + 'px'; R.cv.style.height = h + 'px';
  const cam = R.v ? R.v.camX : COURT.L / 2;
  R.v = makeView(w, h, h > w * 1.05);
  R.v.camX = cam;
  R.key = '';
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
  ensureLayers(scene.venue);
  stepFx(scene.dt || 0);
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
  const m = scene.m;
  const players = scene.players || [];
  // shadows
  for (const it of players) shadow(c, v, it.pl.x, it.pl.z, 1.1, 0.35 - Math.min(0.2, (it.pl.y || 0) * 0.04));
  if (scene.ball) shadow(c, v, scene.ball.x, scene.ball.z, 0.45, 0.3 - Math.min(0.2, scene.ball.y * 0.015));
  // floor rings: solid for home, dashed for away; a chevron for the user's player
  for (const it of players) ring(c, v, it);
  for (const it of players) items.push({ z: it.pl.z, f: () => drawPlayer(c, sx(v, it.pl.x), sy(v, it.pl.z), v.s, it.pl, it.r, it.kit) });
  for (const side of [0, 1]) {
    items.push({ z: 24.98, f: () => hoopBack(c, v, side, scene.venue) });
    items.push({ z: 25.02, f: () => hoopFront(c, v, side) });
  }
  if (scene.ball) items.push({ z: scene.ball.z + 0.001, f: () => drawBall(c, v, scene.ball) });
  items.sort((a, b) => a.z - b.z);
  for (const it of items) it.f();
  for (const it of players) if (it.user) chevron(c, v, it);
  // particles and pops
  for (const p of R.fx.parts) {
    const X = sx(v, p.x), Y = sy(v, p.z, p.y);
    if (p.kind === 'conf') { c.fillStyle = p.c; c.save(); c.translate(X, Y); c.rotate(p.t * 5 + p.r * 6); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
    else if (p.kind === 'steam') { c.fillStyle = `rgba(255,255,255,${0.16 * (1 - p.t / p.life)})`; c.beginPath(); c.arc(X + Math.cos(p.r * 9) * v.s * 0.8, Y - p.t * v.s, v.s * (0.3 + p.t * 0.6), 0, TAU); c.fill(); }
    else { c.fillStyle = p.c; c.globalAlpha = 1 - p.t / p.life; c.beginPath(); c.arc(X, Y, Math.max(1.5, v.s * 0.12), 0, TAU); c.fill(); c.globalAlpha = 1; }
  }
  for (const p of R.fx.pops) {
    const X = sx(v, p.x), Y = sy(v, p.z, p.y) - p.t * v.s * 2.2;
    const size = Math.round(Math.max(13, v.s * (p.big ? 1.25 : 0.85)));
    c.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.globalAlpha = Math.min(1, 2.2 - p.t * 1.7);
    c.lineWidth = Math.max(3, size * 0.18); c.strokeStyle = '#14121F'; c.strokeText(p.text, X, Y);
    c.fillStyle = p.color; c.fillText(p.text, X, Y);
    c.globalAlpha = 1;
  }
  if (scene.meter) drawMeter(c, v, scene.meter);
  if (scene.ftMeter) drawFTMeter(c, v, scene.ftMeter);
  if (scene.offscreen) offscreenArrow(c, v, scene.offscreen);
  c.restore();
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
function chevron(c, v, it) {
  const X = sx(v, it.pl.x), Y = sy(v, it.pl.z);
  {
    const H = (it.r.height / 12) * v.s, top = Y - H - (it.pl.y || 0) * v.s - v.s * 0.6;
    c.fillStyle = '#FFD84D'; c.strokeStyle = '#14121F'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(X - v.s * 0.5, top - v.s * 0.55); c.lineTo(X + v.s * 0.5, top - v.s * 0.55); c.lineTo(X, top); c.closePath(); c.fill(); c.stroke();
    const fs = Math.round(Math.max(10, v.s * 0.55));
    c.font = `800 ${fs}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'bottom';
    c.lineWidth = 3; c.strokeText('YOU', X, top - v.s * 0.6); c.fillStyle = '#FFD84D'; c.fillText('YOU', X, top - v.s * 0.6);
  }
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
function drawMeter(c, v, mt) {
  const X = sx(v, mt.x) + v.s * 1.3, top = sy(v, mt.z, mt.y + mt.h + 0.4), h = Math.max(46, v.s * 2.6), w = Math.max(10, v.s * 0.5);
  c.fillStyle = 'rgba(20,18,31,0.85)'; c.fillRect(X - 2, top - 2, w + 4, h + 4);
  const sweetY = top + h * (1 - SWEET / 1.18), bandH = h * (mt.win * 2 / 1.18);
  c.fillStyle = '#2E6A3C'; c.fillRect(X, sweetY - bandH * 1.5, w, bandH * 3);
  c.fillStyle = '#5FD38A'; c.fillRect(X, sweetY - bandH / 2, w, bandH);
  const f = clamp(mt.v / 1.18, 0, 1);
  c.fillStyle = 'rgba(255,216,77,0.9)'; c.fillRect(X + w * 0.25, top + h * (1 - f), w * 0.5, h * f);
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(X - 5, top + h * (1 - f)); c.lineTo(X, top + h * (1 - f) - 4); c.lineTo(X, top + h * (1 - f) + 4); c.closePath(); c.fill();
  if (mt.label) label(c, X + w + 6, top + h * 0.35, mt.label, v, 'left');
}

function drawFTMeter(c, v, ft) {
  const w = Math.max(120, v.s * 7), h = Math.max(14, v.s * 0.6);
  const X = clamp(sx(v, ft.x) - w / 2, 8, v.W - w - 8), Y = clamp(sy(v, ft.z, ft.y) - h - v.s * 0.6, 8, v.H - h - 8);
  c.fillStyle = 'rgba(20,18,31,0.88)'; c.fillRect(X - 3, Y - 3, w + 6, h + 6);
  const band = 0.08 * ft.scale;
  c.fillStyle = '#2E6A3C'; c.fillRect(X + w * (0.5 - band * 2.2), Y, w * band * 4.4, h);
  c.fillStyle = '#5FD38A'; c.fillRect(X + w * (0.5 - band), Y, w * band * 2, h);
  const mx = X + w * ft.mv;
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.moveTo(mx, Y - 1); c.lineTo(mx - 6, Y - 9); c.lineTo(mx + 6, Y - 9); c.closePath(); c.fill();
  c.fillRect(mx - 1.5, Y, 3, h);
  const size = Math.round(Math.max(12, v.s * 0.6));
  c.font = `800 ${size}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'bottom';
  const txt = ft.label || (ft.user ? `FREE THROW ${ft.n} OF ${ft.total}` : `FREE THROW ${ft.n} OF ${ft.total}`);
  c.lineWidth = 4; c.strokeStyle = '#14121F'; c.strokeText(txt, X + w / 2, Y - 11); c.fillStyle = '#FFF6E0'; c.fillText(txt, X + w / 2, Y - 11);
}

function label(c, x, y, txt, v, align = 'center') {
  const size = Math.round(Math.max(12, v.s * 0.62));
  c.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`; c.textAlign = align; c.textBaseline = 'middle';
  c.lineWidth = 4; c.strokeStyle = '#14121F'; c.strokeText(txt, x, y);
  c.fillStyle = txt === 'PERFECT' ? '#5FD38A' : txt === 'GOOD' ? '#FFF6E0' : '#FFB4A8'; c.fillText(txt, x, y);
}

function offscreenArrow(c, v, o) {
  const X = sx(v, o.x);
  if (X > 0 && X < v.W) return;
  const left = X <= 0, y = clamp(sy(v, o.z, 3), 30, v.H - 30), x = left ? 16 : v.W - 16;
  c.fillStyle = '#FFD84D'; c.strokeStyle = '#14121F'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(x + (left ? -10 : 10), y); c.lineTo(x + (left ? 6 : -6), y - 10); c.lineTo(x + (left ? 6 : -6), y + 10); c.closePath(); c.fill(); c.stroke();
}
