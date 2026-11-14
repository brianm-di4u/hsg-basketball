// Team AI: offense spots and cuts, a utility-scored ball handler, man-to-man defense with help,
// and rebound crashing. Decisions set steering targets; sim.js integrates movement.
// Actions are passed in (A) so this module does not import sim.js.
import { rnd, gauss, clamp, segDist } from './util.js';
import { COURT, rimFor, distToRim, isThree } from './court.js';
import { shotChance, contestFactor, STYLE_NEUTRAL } from './rules.js';

// Team styles and late-game awareness (S3-03). Every number the styles and the late game move is named here.
const THREE_VALUE = 2.6, THREE_LEAN = 0.5; // what a three is worth to the AI's shot choice (2 for a two), and how far a style's `three` moves it
const LATE_SECS = 90, HACK_SECS = 24, HACK_MARGIN = 6, HACK_ODDS = 0.5; // the late window of a fourth quarter or overtime, when a team behind fouls on purpose, how far behind, how often it tries
const TRAIL_MAX = 12, LEAD_MAX = 10; // a game further apart than this is decided and nobody changes their play
const PRESS_TIGHT = 2.2, PRESS_OVERPLAY = 0.45, PRESS_STEAL = 2.5, TRAP_REACH = 16; // gap of the man on the ball, how much closer the others play at full press, extra steal tries at full press, how far the trapper may come from
const PACE_POWER = 1.5; // how strongly a pace number changes how soon the AI shoots and drives
const LATE0 = { u: 0, margin: 0, t: 99 };
const styleOf = (m, t) => m.teams[t].style || STYLE_NEUTRAL;
// How late and how close it is for team t: u climbs 0 to 1 through the late window, margin is t's lead.
function lateGame(m, t) {
  const c = m.clock;
  if (c.q < 4 || m.phase === 'final') return LATE0;
  const span = Math.min(LATE_SECS, m.rules.qLen * 0.75);
  if (c.t >= span) return LATE0;
  return { u: 1 - c.t / span, margin: m.teams[t].score - m.teams[1 - t].score, t: c.t };
}
const trailing = (s) => (s.margin < 0 && s.margin >= -TRAIL_MAX ? s.u : 0);
const leading = (s) => (s.margin > 0 && s.margin <= LEAD_MAX ? s.u : 0);

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
  const sit = lateGame(m, t);
  let three = THREE_VALUE + THREE_LEAN * styleOf(m, t).three, two = 2; // AI shot selection leans away from threes (a style moves that)
  if (trailing(sit) > 0.5 && sit.margin <= -3) { three = 3.3; two = 1.6; } // behind by a three or more, late: it needs them
  else if (leading(sit) > 0) three = Math.min(three, 2.1); // ahead late: no threes, run the clock
  return pr * (isThree(x, z, d) ? three : two);
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

// Sprint (P-N01): the AI runs flat out when it has a long way to go and the legs for it, the same boost and cost as the user's.
const SPRINT_DIST = 9, SPRINT_ENERGY = 0.6, SPRINT_ODDS = 0.8; // ft to the target before it is worth it, energy it keeps in hand, chance it chooses to
const FAKE_ODDS = 0.4, CROSS_ODDS = 0.7; // chance a contested shooter pumps instead of shooting, and a driver crosses over a defender in his way
function sprintPlan(m, i) {
  const p = m.p[i], r = m.teams[p.t].roster[p.r];
  const st = styleOf(m, p.t), odds = SPRINT_ODDS * clamp(st.pace * (1 + 0.2 * st.press), 0.7, 1.2); // quick and pressing teams run more
  p.sprint = m.phase === 'live' && r.energy > SPRINT_ENERGY && Math.hypot(p.tx - p.x, p.tz - p.z) > SPRINT_DIST && rnd(m) < odds;
}

// Main per-player decision. ai = difficulty params for this team.
export function decide(m, i, A, ai) {
  decideMove(m, i, A, ai);
  sprintPlan(m, i);
}
function decideMove(m, i, A, ai) {
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
  const sit = lateGame(m, t), st = styleOf(m, t);
  const pace = clamp((st.pace * (1 + 0.6 * trailing(sit)) / (1 + 0.8 * leading(sit))) ** PACE_POWER, 0.6, 1.8); // a quick style, or a team behind late, shoots sooner; one ahead late runs the clock
  let crowd = 0; // two defenders on him: a trap
  for (let k = 0; k < 10; k++) if (m.p[k].t !== t && Math.hypot(m.p[k].x - p.x, m.p[k].z - p.z) < 5) crowd++;
  if (crowd >= 2) pass *= 1.8;
  const hold = Math.max(0.2, 1.3 - 0.04 * possT) / pace; // patient offense: possessions run about 15 s
  const n = () => gauss(m) * ai.noise * 0.5;
  const opts = [['shoot', shoot * clamp(pace, 0.85, 1.3) + n()], ['drive', drive * pace + n()], ['pass', pass + n()], ['hold', hold + n()]];
  opts.sort((a, b) => b[1] - a[1]);
  const pickO = opts[0][0];
  const near = nearestDef(m, p.x, p.z, t);
  if (pickO === 'shoot' && shoot > 0) {
    if (near.d < 3.6 && p.pumpCd <= 0 && dist > 5 && rnd(m) < FAKE_ODDS) { A.pump(m, i); p.holdT = 0.1; } // a contested jumper: pump first
    else A.startShot(m, i);
  }
  else if (pickO === 'drive') {
    p.drive = 1.6; setTarget(p, rx - d * 2.5, 25, 1);
    if (near.idx >= 0 && near.d < 5 && p.crossCd <= 0 && rnd(m) < CROSS_ODDS) { // cross him over, away from his side
      const q = m.p[near.idx];
      A.cross(m, i, d * 0.8, q.z > p.z ? -0.6 : 0.6);
    }
  }
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
  const st = styleOf(m, t), sit = lateGame(m, t);
  const pressing = st.press > 0 && ball.state === 'held' && h && h.t !== t && od * (h.x - 47) < 4; // the ball has not got well past half court
  let gap = onBall ? 3.4 : clamp(4.5 + bd * 0.18, 4.5, 10);
  if (pressing) gap = onBall ? PRESS_TIGHT : gap * (1 - PRESS_OVERPLAY * st.press);
  if (pressing && st.press >= 0.5 && !onBall && Math.abs(h.x - 47) < 14) { // the nearest teammate of the man on the ball comes to trap him
    const onIdx = t * 5 + h.slot;
    let near = -1, nd = 1e9;
    for (let k = t * 5; k < t * 5 + 5; k++) { if (k === onIdx) continue; const dd = Math.hypot(m.p[k].x - h.x, m.p[k].z - h.z); if (dd < nd) { nd = dd; near = k; } }
    if (near === i && nd < TRAP_REACH) { setTarget(p, h.x, h.z + (h.z > 25 ? 2.2 : -2.2), 1); return; }
  }
  let gx = man.x + (rim - man.x) / md * gap, gz = man.z + (25 - man.z) / md * gap;
  if (!onBall) { gx += (ball.x - gx) * 0.12; gz += (ball.z - gz) * 0.12; }
  setTarget(p, gx, gz, 1);
  if (onBall && bd < 3.4 && p.cool <= 0 && A.foul && !m.teams[t].isUser && sit.u > 0 && sit.margin < 0 && sit.margin >= -HACK_MARGIN
    && m.clock.t < Math.min(HACK_SECS, m.rules.qLen * 0.2) && m.teams[t].roster[p.r].st.pf < m.rules.foulOut - 1 && rnd(m) < HACK_ODDS) { A.foul(m, i, h.idx); return; } // behind late: stop the clock with a foul
  if (onBall && bd < 3.4 && p.cool <= 0 && rnd(m) < 0.035 * ai.steal * (0.6 + m.teams[t].roster[p.r].def) * (1 + PRESS_STEAL * (pressing ? st.press : 0))) A.trySteal(m, i);
}
