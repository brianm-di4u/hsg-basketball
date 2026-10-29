// Team AI: offense spots and cuts, a utility-scored ball handler, man-to-man defense with help,
// and rebound crashing. Decisions set steering targets; sim.js integrates movement.
// Actions are passed in (A) so this module does not import sim.js.
import { rnd, gauss, clamp, segDist } from './util.js';
import { COURT, rimFor, distToRim, isThree } from './court.js';
import { shotChance, contestFactor } from './rules.js';

export const spots = (d) => {
  const rx = rimFor(d);
  return [[rx - d * 21.5, 25], [rx - d * 12, 11], [rx - d * 12, 39], [rx - d * 7.5, 16], [rx - d * 7.5, 34]];
};

export function nearestDef(m, x, z, team) {
  let best = -1, bd = 1e9;
  for (let k = 0; k < 10; k++) {
    const q = m.p[k];
    if (q.t === team) continue;
    const dd = Math.hypot(q.x - x, q.z - z);
    if (dd < bd) { bd = dd; best = k; }
  }
  return { idx: best, d: bd };
}

// Expected points of a shot from (x, z) for player i right now.
export function shotValue(m, i, x = m.p[i].x, z = m.p[i].z) {
  const p = m.p[i], t = p.t, d = m.dir[t];
  const dist = distToRim(x, z, d);
  if (dist > 27) return 0;
  const R = m.teams[t].roster[p.r];
  const nd = nearestDef(m, x, z, t);
  const type = dist < 4.5 ? 'layup' : 'jumper';
  const pr = shotChance({ dist, type, sht: R.sht, ins: R.ins, contest: contestFactor(nd.d, false), quality: 0.8 });
  return pr * (isThree(x, z, d) ? 2.6 : 2); // AI shot selection leans away from threes
}

function laneSafety(m, i, j) {
  const a = m.p[i], b = m.p[j];
  let worst = 9;
  for (let k = 0; k < 10; k++) {
    const q = m.p[k];
    if (q.t === a.t) continue;
    worst = Math.min(worst, segDist(q.x, q.z, a.x, a.z, b.x, b.z));
  }
  return worst > 3.5 ? 1 : worst > 2 ? 0.6 : 0.2;
}

export function bestPassTarget(m, i, dirx = 0, dirz = 0) {
  const p = m.p[i];
  let best = -1, bs = -1e9;
  for (let k = p.t * 5; k < p.t * 5 + 5; k++) {
    if (k === i) continue;
    const q = m.p[k];
    const dx = q.x - p.x, dz = q.z - p.z, dd = Math.hypot(dx, dz) || 1;
    let s;
    if (dirx || dirz) {
      const ml = Math.hypot(dirx, dirz);
      s = (dx * dirx + dz * dirz) / (dd * ml) * 2 - dd * 0.01 + laneSafety(m, i, k) * 0.3;
    } else {
      s = shotValue(m, k) + laneSafety(m, i, k) * 0.8 + nearestDef(m, q.x, q.z, q.t).d * 0.05 - dd * 0.01;
    }
    if (s > bs) { bs = s; best = k; }
  }
  return best;
}

function setTarget(p, x, z, want = 1) {
  p.tx = clamp(x, 0.8, COURT.L - 0.8); p.tz = clamp(z, 0.8, COURT.W - 0.8); p.want = want;
}

// Main per-player decision. ai = difficulty params for this team.
export function decide(m, i, A, ai) {
  const p = m.p[i], t = p.t, d = m.dir[t], ball = m.ball;
  const rx = rimFor(d);
  const own = rimFor(-d); // the rim this team defends
  p.aiT = 0.24 + rnd(m) * 0.16;

  if (m.phase === 'ft') return; // positions set by the free-throw setup
  if (m.phase === 'tipoff') return;

  // Loose ball or a shot in the air: crash the boards (two nearest per team), others hold shape.
  if (ball.state === 'loose' || ball.state === 'shot') {
    const lx = ball.land ? ball.land.x : ball.x, lz = ball.land ? ball.land.z : ball.z;
    let rank = 0;
    const myD = Math.hypot(p.x - lx, p.z - lz);
    for (let k = t * 5; k < t * 5 + 5; k++) if (k !== i && Math.hypot(m.p[k].x - lx, m.p[k].z - lz) < myD) rank++;
    if (ball.state === 'loose' || ball.shot && ball.shot.type !== 'ft') {
      if (rank < 2 || myD < 9) { setTarget(p, lx, lz, 1); return; }
    }
    if (ball.state === 'shot' && m.poss !== t) { // defense: stay near assignment but sink to the rim
      const man = m.p[(1 - t) * 5 + p.slot];
      setTarget(p, (man.x + own) / 2, (man.z + 25) / 2, 0.9); return;
    }
    const sp = spots(m.poss === t ? d : -d)[p.slot];
    setTarget(p, sp[0], sp[1], 0.7); return;
  }

  const offense = m.poss === t;
  if (offense) {
    if (ball.holder === i) { handler(m, i, A, ai); return; }
    // inbound receiver gets open toward the inbounder
    if (m.phase === 'inbound' && m.inb && m.inb.recv === i) {
      const ix = m.inb.x, iz = clamp(m.inb.z, 4, 46);
      const off = Math.sin(m.time * 1.7 + i) * 4;
      setTarget(p, ix + off + (ix < 47 ? 8 : -8), iz + (iz > 25 ? -8 : 8), 0.8); return;
    }
    if (m.phase === 'inbound' && m.inb && m.inb.by === i) return;
    offBall(m, i, ai);
    return;
  }
  defend(m, i, A, ai);
}

function offBall(m, i) {
  const p = m.p[i], t = p.t, d = m.dir[t], rx = rimFor(d);
  const h = m.ball.holder >= 0 ? m.p[m.ball.holder] : null;
  // cutting to the rim now and then
  p.cut = (p.cut || 0) - p.aiT;
  if (p.cut > 0) { setTarget(p, rx - d * 5, 25 + ((p.slot % 2) ? 4 : -4), 1); return; }
  if (p.cut < -3 && rnd(m) < 0.18 && h && Math.abs(h.x - rx) < 30) { p.cut = 1.4; return; }
  let [sx, sz] = spots(d)[p.slot];
  if (h && Math.hypot(h.x - sx, h.z - sz) < 7) { sx = rx - d * 3; sz = p.slot % 2 ? 4 : 46; }
  setTarget(p, sx + Math.sin(m.time * 0.6 + i) * 1.5, sz + Math.cos(m.time * 0.5 + i) * 1.5, 0.85);
}

function handler(m, i, A, ai) {
  const p = m.p[i], t = p.t, d = m.dir[t], rx = rimFor(d);
  const R = m.teams[t].roster[p.r];
  if (p.act === 'shoot' || p.act === 'layup') return;
  p.holdT = (p.holdT || 0);
  if (p.holdT < 0.35) return; // a beat after the catch
  const back = d * (p.x - 47) < -2;
  const late = m.rules.shotClock && !m.clock.shotOff && m.clock.shot < 5;
  const endQ = m.clock.t < 4 && (m.clock.shotOff || m.clock.t < m.clock.shot);
  if (back && !late && !endQ) {
    const sp = spots(d)[0];
    setTarget(p, sp[0], sp[1] + (p.z - 25) * 0.4, 1);
    const nd = nearestDef(m, p.x, p.z, t);
    if (nd.d < 2.2 && rnd(m) < 0.25) { const j = bestPassTarget(m, i); if (j >= 0 && laneSafety(m, i, j) > 0.5) A.doPass(m, i, j); }
    return;
  }
  // driving: finish at the rim
  if (p.drive > 0) {
    const dist = distToRim(p.x, p.z, d);
    if (dist < 4.2) { A.startShot(m, i); return; }
    setTarget(p, rx - d * 2.5, 25, 1);
    return;
  }
  const dist = distToRim(p.x, p.z, d);
  const possT = m.time - m.possAt;
  const open = nearestDef(m, p.x, p.z, t).d > 7;
  let shoot = shotValue(m, i) * (possT < 9 && dist > 5 && !open ? 0.55 : 1) * (late ? 1.8 : 1) * (endQ ? 3 : 1);
  if (dist > 26 && !late && !endQ) shoot = 0;
  // lane to the rim
  let laneBlocked = 0;
  for (let k = 0; k < 10; k++) {
    const q = m.p[k];
    if (q.t === t) continue;
    if (Math.abs(q.x - rx) < Math.abs(p.x - rx) + 1 && segDist(q.x, q.z, p.x, p.z, rx - d * 3, 25) < 3) laneBlocked++;
  }
  const drive = dist < 25 && laneBlocked === 0 && (possT > 3 || late) ? 2 * (0.5 + 0.3 * R.ins) * 0.8 : 0;
  let pass = 0, pj = -1;
  for (let k = t * 5; k < t * 5 + 5; k++) {
    if (k === i) continue;
    const v = shotValue(m, k) * laneSafety(m, i, k) * 0.92 - (m.ball.lastPasser === k ? 0.12 : 0);
    if (v > pass) { pass = v; pj = k; }
  }
  const hold = Math.max(0.2, 1.3 - 0.04 * possT); // patient offense: possessions run about 15 s
  const n = () => gauss(m) * ai.noise * 0.5;
  const opts = [['shoot', shoot + n()], ['drive', drive + n()], ['pass', pass + n()], ['hold', hold + n()]];
  opts.sort((a, b) => b[1] - a[1]);
  const pickO = opts[0][0];
  if (pickO === 'shoot' && shoot > 0) A.startShot(m, i);
  else if (pickO === 'drive') { p.drive = 1.6; setTarget(p, rx - d * 2.5, 25, 1); }
  else if (pickO === 'pass' && pj >= 0) A.doPass(m, i, pj);
  else {
    const sp = spots(d)[p.slot];
    const wig = (rnd(m) - 0.5) * 10;
    setTarget(p, (sp[0] + p.x) / 2 + wig * 0.3, (sp[1] + p.z) / 2 + wig, 0.75);
  }
}

function defend(m, i, A, ai) {
  const p = m.p[i], t = p.t;
  const od = m.dir[1 - t];
  const rim = rimFor(od); // the rim the offense attacks
  const man = m.p[(1 - t) * 5 + p.slot];
  const ball = m.ball;
  const h = ball.holder >= 0 ? m.p[ball.holder] : null;
  // help defense on drives
  if (h && h.t !== t && h !== man) {
    const hd = Math.hypot(h.x - rim, h.z - 25);
    const hisDef = m.p[t * 5 + h.slot];
    const beaten = Math.hypot(hisDef.x - rim, hisDef.z - 25) > hd + 1;
    if (hd < 14 && beaten && m.help[t] === -1) m.help[t] = i;
    if (m.help[t] === i) {
      if (!(hd < 16 && beaten)) m.help[t] = -1;
      else {
        const ux = (rim - h.x) / (hd || 1), uz = (25 - h.z) / (hd || 1);
        setTarget(p, h.x + ux * 2.6, h.z + uz * 2.6, 1); return;
      }
    }
  } else if (m.help[t] === i) m.help[t] = -1;
  const md = Math.hypot(man.x - rim, man.z - 25) || 1;
  const onBall = ball.holder === man.idx;
  const bd = Math.hypot(man.x - ball.x, man.z - ball.z);
  const gap = onBall ? 3.4 : clamp(4.5 + bd * 0.18, 4.5, 10);
  let gx = man.x + (rim - man.x) / md * gap, gz = man.z + (25 - man.z) / md * gap;
  if (!onBall) { gx += (ball.x - gx) * 0.12; gz += (ball.z - gz) * 0.12; }
  setTarget(p, gx, gz, 1);
  if (onBall && bd < 3.4 && p.cool <= 0 && rnd(m) < 0.035 * ai.steal * (0.6 + m.teams[t].roster[p.r].def)) A.trySteal(m, i);
}
