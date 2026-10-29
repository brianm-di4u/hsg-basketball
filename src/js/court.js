// Court geometry (feet) and the oblique 2.5D projection. Dimensions are game geometry, not sourced claims.
export const COURT = {
  L: 94, W: 50,
  rimX: [5.25, 88.75], rimZ: 25, rimY: 10, rimR: 0.75,
  boardX: [4, 90], boardY0: 9.5, boardY1: 13, boardZ0: 22, boardZ1: 28,
  threeR: 19.75, ftDist: 13.75, keyZ0: 19, keyZ1: 31, ftR: 6, centerR: 6,
};
export const K = 0.5; // default depth compression (z → screen y); portrait views use a deeper 0.62
export const G = 32; // gravity, ft/s²

// Rim x for a team attacking in direction d (+1 = right).
export const rimFor = (d) => (d > 0 ? COURT.rimX[1] : COURT.rimX[0]);
export const distToRim = (x, z, d) => Math.hypot(x - rimFor(d), z - COURT.rimZ);
export const isThree = (x, z, d) => distToRim(x, z, d) > COURT.threeR;
export const inBounds = (x, z) => x >= 0 && x <= COURT.L && z >= 0 && z <= COURT.W;

// View: { W, H, s, y0, camX }. Fits the court depth in H and shows `span` feet of length.
export function makeView(W, H, portrait) {
  const span = portrait ? 31 : 56;
  const k = portrait ? 0.62 : K;
  const s = Math.max(4, Math.min(H / (COURT.W * k + 9), W / span));
  const courtH = COURT.W * k * s;
  // y0 = screen y of the far sideline; leave headroom for a player standing on it, the backboard and crowd.
  const y0 = Math.max(7.2 * s, (H - courtH) * 0.5);
  return { W, H, s, y0, K: k, camX: COURT.L / 2, portrait };
}
export const sx = (v, x) => (x - v.camX) * v.s + v.W / 2;
export const sy = (v, z, y = 0) => v.y0 + z * v.K * v.s - y * v.s;
export function clampCam(v, x) {
  const half = v.W / 2 / v.s;
  const lo = half - 6, hi = COURT.L - half + 6;
  return lo > hi ? COURT.L / 2 : Math.min(hi, Math.max(lo, x));
}
