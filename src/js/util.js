// Small shared helpers: seeded RNG, math, hashing and guarded storage.

// mulberry32 stepped on a plain object ({rs}) so the RNG state lives inside JSON game state.
export function rnd(o) {
  o.rs = (o.rs + 0x6D2B79F5) | 0;
  let t = o.rs;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rint = (o, a, b) => a + Math.floor(rnd(o) * (b - a + 1));
export const pick = (o, arr) => arr[Math.floor(rnd(o) * arr.length)];
export function gauss(o) { return (rnd(o) + rnd(o) + rnd(o) - 1.5) / 0.5; } // ~N(0,1), bounded
export function shuffle(o, arr) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd(o) * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

// FNV-1a over a string, for deterministic per-school seeds.
export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
// distance from point p to segment a→b (2D, floor plane)
export function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const L = dx * dx + dz * dz || 1e-6;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / L, 0, 1);
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

export const fmtClock = (sec) => {
  const s = Math.max(0, sec);
  if (s < 60) return s.toFixed(1);
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
};

// ---- storage (always guarded: private mode, blocked cookies, quota) ----
const KEY = 'hsg-hoops-v1';
export const store = { ok: true };
export function loadSave() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { store.ok = false; return null; }
}
export function writeSave(obj) {
  try { window.localStorage.setItem(KEY, JSON.stringify(obj)); store.ok = true; return true; }
  catch (e) { store.ok = false; return false; }
}

// WCAG relative luminance and contrast, for picking jersey number colors.
export function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
export function shade(hex, f) { // f<0 darker, f>0 lighter
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('');
}
