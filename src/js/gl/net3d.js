// A cloth net: a ring of particles per row, the top row pinned to the rim, integrated with Verlet steps and
// distance constraints. It drives the vertices of the open cone mesh that carries the diamond-mesh texture, so
// the look is unchanged at rest and the net swishes, bulges around the ball and sways back after a make.
/* global THREE */
import { COURT } from '../court.js';

const AROUND = 16, ROWS = 5, LEN = 1.5; // matches the cone in venue3d.js makeHoop()
const R0 = COURT.rimR * 0.97, R1 = COURT.rimR * 0.55;
const GRAV = -32, DAMP = 0.985, ITER = 4;

// A cylinder geometry laid out as (ROWS + 1) rings of (AROUND + 1) vertices, as THREE.CylinderGeometry makes it.
export function netGeometry() {
  const g = new THREE.CylinderGeometry(R0, R1, LEN, AROUND, ROWS, true);
  g.translate(0, -LEN / 2, 0);
  g.attributes.position.setUsage(THREE.DynamicDrawUsage);
  return g;
}

// rest position of particle (row, k) in the net's local frame (origin at the rim centre)
const rest = (row, k) => {
  const f = row / ROWS, r = R0 + (R1 - R0) * f, a = (k / AROUND) * Math.PI * 2;
  return [Math.sin(a) * r, -LEN * f, Math.cos(a) * r];
};

export function makeNetSim(mesh) {
  const n = (ROWS + 1) * AROUND;
  const p = new Float32Array(n * 3), q = new Float32Array(n * 3), r0 = new Float32Array(n * 3);
  for (let row = 0; row <= ROWS; row++) for (let k = 0; k < AROUND; k++) { const i = (row * AROUND + k) * 3, v = rest(row, k); r0.set(v, i); p.set(v, i); q.set(v, i); }
  // constraints: down each column, around each ring, and the two diagonals (the diamond mesh)
  const cons = [];
  const idx = (row, k) => row * AROUND + ((k + AROUND) % AROUND);
  const len = (a, b) => Math.hypot(r0[a * 3] - r0[b * 3], r0[a * 3 + 1] - r0[b * 3 + 1], r0[a * 3 + 2] - r0[b * 3 + 2]);
  for (let row = 0; row <= ROWS; row++) for (let k = 0; k < AROUND; k++) {
    const a = idx(row, k);
    // [a, b, rest, stretch per unit of the make spring]: the cords lengthen toward the hem, the rings flare
    const f = (row + 1) / ROWS;
    cons.push([a, idx(row, k + 1), 0, 0.55 * (row / ROWS) ** 1.5]); // the hem flares most
    if (row < ROWS) { cons.push([a, idx(row + 1, k), 0, 0.5 * f]); cons.push([a, idx(row + 1, k + 1), 0, 0.5 * f]); cons.push([a, idx(row + 1, k - 1), 0, 0.5 * f]); }
  }
  for (const c of cons) c[2] = len(c[0], c[1]);
  const pos = mesh.geometry.attributes.position;
  let acc = 0, energy = 0;
  // a make drives a damped spring (about 2.5 Hz, light damping): the net stretches, recoils past rest, settles
  let sp = 0, sv = 0;

  function substep(h, ball) {
    for (let i = AROUND; i < n; i++) { // the top ring is pinned
      const j = i * 3;
      for (let a = 0; a < 3; a++) {
        const v = (p[j + a] - q[j + a]) * DAMP;
        q[j + a] = p[j + a];
        p[j + a] += v + (a === 1 ? GRAV * h * h : 0);
      }
      // a gentle pull back to the rest shape keeps the cone from collapsing under gravity
      for (let a = 0; a < 3; a++) p[j + a] += (r0[j + a] - p[j + a]) * (0.06 - 0.05 * Math.min(1, Math.abs(sp)));
      if (ball) { // push particles out of the ball
        const dx = p[j] - ball[0], dy = p[j + 1] - ball[1], dz = p[j + 2] - ball[2], d = Math.hypot(dx, dy, dz), rr = 0.46;
        if (d < rr && d > 1e-4) { const s = (rr - d) / d; p[j] += dx * s; p[j + 1] += dy * s * 0.5; p[j + 2] += dz * s; }
      }
    }
    for (let it = 0; it < ITER; it++) for (const [a, b, L0, k] of cons) {
      const L = L0 * (1 + k * sp);
      const ja = a * 3, jb = b * 3;
      const dx = p[jb] - p[ja], dy = p[jb + 1] - p[ja + 1], dz = p[jb + 2] - p[ja + 2];
      const d = Math.hypot(dx, dy, dz) || 1e-6, diff = (d - L) / d;
      const wa = a < AROUND ? 0 : 0.5, wb = b < AROUND ? 0 : 0.5, w = wa + wb || 1;
      p[ja] += dx * diff * (wa / w); p[ja + 1] += dy * diff * (wa / w); p[ja + 2] += dz * diff * (wa / w);
      p[jb] -= dx * diff * (wb / w); p[jb + 1] -= dy * diff * (wb / w); p[jb + 2] -= dz * diff * (wb / w);
    }
  }

  return {
    // impulse: a swish snaps the lower rows down and in; a rim hit shakes the top rows sideways
    kick(strength = 1, side = 0) {
      for (let i = AROUND; i < n; i++) {
        const row = Math.floor(i / AROUND), f = row / ROWS, j = i * 3;
        q[j + 1] += strength * 0.09 * f;                                // velocity down (Verlet: move the old point up)
        q[j] += r0[j] * 0.10 * strength * f; q[j + 2] += r0[j + 2] * 0.10 * strength * f; // and inward
        if (side) q[j] -= side * 0.05 * strength * (1 - f);
      }
      energy = Math.max(energy, strength);
      if (!side) sv += 12 * strength; // a swish: the stretch spring
    },
    // dt in seconds; ballLocal = the ball centre in the net's frame, or null
    update(dt, ballLocal) {
      const near = ballLocal && Math.hypot(ballLocal[0], ballLocal[2]) < R0 + 0.5 && ballLocal[1] < 0.6 && ballLocal[1] > -LEN - 0.6;
      if (near) energy = 1;
      if (energy < 0.002 && !near && Math.abs(sp) < 0.003 && Math.abs(sv) < 0.01) return false; // at rest: leave the buffer alone
      acc += Math.min(dt, 0.25);
      const h = 1 / 120;
      let steps = 0;
      while (acc >= h && steps < 30) {
        const w = 2 * Math.PI * 2.5;
        sv += (-w * w * sp - 2 * 0.3 * w * sv) * h; sp += sv * h;
        substep(h, near ? ballLocal : null); acc -= h; steps++;
      }
      energy *= Math.pow(0.4, dt);
      // write the particle rings into the cone's vertex rings (the seam column repeats column 0)
      for (let row = 0; row <= ROWS; row++) for (let k = 0; k <= AROUND; k++) {
        const j = (row * AROUND + (k % AROUND)) * 3, vi = row * (AROUND + 1) + k;
        pos.setXYZ(vi, p[j], p[j + 1], p[j + 2]);
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
      return true;
    },
  };
}
