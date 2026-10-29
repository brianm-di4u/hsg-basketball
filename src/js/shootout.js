// Hot Streak: an original 60-second shooting mini-mode. Seven floor spots worth 2 or 3; a made-shot
// streak fills a steam gauge (x2 from 3 straight, x3 from 6 straight). Same meter as the main game.
import { rnd, clamp } from './util.js';
import { COURT, G, distToRim, isThree } from './court.js';
import { meterQuality, meterTime, shotChance, DIFF } from './rules.js';

const DT = 1 / 60;
const RX = COURT.rimX[1];
export const SPOTS = [[RX - 22.5, 25], [RX - 15, 31], [RX - 14, 37.5], [RX - 2, 45.8], [RX - 2, 4.6], [RX - 14, 12.5], [RX - 15, 19]].map(([x, z]) => ({ x, z, pts: isThree(x, z, 1) ? 3 : 2 }));

export function createShootout({ team, roster, kit, seed = 1, difficulty = 1, assist = false, length = 60 }) {
  const r = roster.slice(0, 5).sort((a, b) => b.sht - a.sht)[0];
  const sp = SPOTS[0];
  return {
    v: 1, rs: seed | 0 || 1, team, r, kit, difficulty, assist, length,
    t: length, score: 0, streak: 0, mult: 1, made: 0, att: 0, spot: 0, phase: 'ready', phaseT: 0,
    sh: { idx: 0, t: 0, x: sp.x, z: sp.z, y: 0, vx: 0, vz: 0, vy: 0, face: 1, act: 'idle', actT: 0, run: 0, meter: 0 },
    ball: { x: sp.x + 0.9, y: 3.5, z: sp.z + 0.3, vx: 0, vy: 0, vz: 0, state: 'held', t: 0, T: 0, make: false },
    label: null, labelT: 0, moveT: 0, ev: [], input: { mx: 0, mz: 0, shoot: false, shootP: false, shootR: false, passP: false, switchP: false },
  };
}

const say = (so, k, o = {}) => so.ev.push({ k, ...o });

export function shootoutTick(so) {
  const inp = so.input, sh = so.sh, b = so.ball;
  so.phaseT += DT;
  if (so.labelT > 0) so.labelT -= DT;
  if (so.phase === 'end') { clear(inp); return; }
  if (so.phase === 'ready') {
    if (inp.shootP) { so.phase = 'live'; so.phaseT = 0; say(so, 'start'); }
    else { clear(inp); return; }
  }
  if (so.t > 0) so.t = Math.max(0, so.t - DT);
  // jump physics
  if (sh.y > 0 || sh.vy > 0) { sh.vy -= G * DT; sh.y += sh.vy * DT; if (sh.y <= 0) { sh.y = 0; sh.vy = 0; if (b.state !== 'held') sh.act = 'idle'; } }
  // walking to the next spot
  if (so.moveT > 0) {
    so.moveT -= DT;
    const sp = SPOTS[so.spot];
    sh.vx = (sp.x - sh.x) * 6; sh.vz = (sp.z - sh.z) * 6;
    sh.x += sh.vx * DT; sh.z += sh.vz * DT; sh.run += Math.hypot(sh.vx, sh.vz) * DT * 0.55;
    if (so.moveT <= 0) { sh.x = sp.x; sh.z = sp.z; sh.vx = sh.vz = 0; Object.assign(b, { state: 'held' }); }
  }
  if (b.state === 'held') {
    b.x = sh.x + 0.9; b.z = sh.z + 0.3; b.y = sh.act === 'shoot' ? so.r.height / 12 + sh.y + 0.6 : 3.4;
    if (so.t <= 0 && sh.act !== 'shoot') { end(so); clear(inp); return; }
    if (sh.act !== 'shoot' && inp.shootP && so.moveT <= 0) {
      sh.act = 'shoot'; sh.actT = 0; sh.meter = 0; sh.vy = 10 + 4 * so.r.jmp; say(so, 'gather');
    } else if (sh.act === 'shoot') {
      sh.actT += DT; sh.meter = sh.actT / meterTime('jumper');
      if (sh.forceQ != null ? sh.meter >= 0.9 : ((inp.shootR || !inp.shoot || sh.meter >= 1.18) && sh.actT > 0.06)) release(so);
    }
  } else if (b.state === 'shot') {
    b.t += DT; b.vy -= G * DT; b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
    if (b.t >= b.T) {
      const sp = SPOTS[so.spot];
      if (b.make) {
        so.streak++; so.made++;
        so.mult = so.streak >= 6 ? 3 : so.streak >= 3 ? 2 : 1;
        const pts = sp.pts * so.mult; so.score += pts;
        say(so, 'make', { pts, mult: so.mult, x: RX, z: 25 });
        b.state = 'drop'; b.vx = 0; b.vz = 0; b.vy = -6; b.x = RX; b.z = 25; b.y = 9.6;
      } else {
        so.streak = 0; so.mult = 1;
        say(so, 'miss', {});
        b.state = 'drop'; b.vx = (rnd(so) - 0.5) * 8 - 4; b.vz = (rnd(so) - 0.5) * 8; b.vy = 7;
      }
      b.t = 0;
    }
  } else if (b.state === 'drop') {
    b.t += DT; b.vy -= G * DT; b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
    if (b.y < 0.4) { b.y = 0.4; b.vy = -b.vy * 0.5; b.vx *= 0.8; b.vz *= 0.8; }
    if (b.t > 0.55) {
      if (so.t <= 0) { end(so); clear(inp); return; }
      so.spot = (so.spot + 1) % SPOTS.length; so.moveT = 0.45; b.state = 'moving'; sh.act = 'idle';
    }
  } else if (b.state === 'moving') {
    b.x = sh.x + 0.9; b.z = sh.z + 0.3; b.y = 3.4;
  }
  clear(inp);
}
function clear(inp) { inp.shootP = inp.shootR = inp.passP = inp.switchP = false; }

function release(so) {
  const sh = so.sh, b = so.ball, sp = SPOTS[so.spot];
  const scale = (DIFF[so.difficulty] || DIFF[1]).win * (so.assist ? 1.5 : 1);
  const mq = meterQuality(sh.meter, scale, 'jumper');
  const q = sh.forceQ != null ? sh.forceQ : mq.q;
  sh.forceQ = null;
  so.label = mq.label; so.labelT = 1.1;
  const dist = distToRim(sh.x, sh.z, 1);
  const make = rnd(so) < clamp(shotChance({ dist, type: 'jumper', sht: so.r.sht, ins: so.r.ins, contest: 1, quality: q }) * 1.15, 0.02, 0.97);
  const x0 = sh.x + 0.5, y0 = so.r.height / 12 + sh.y + 0.7, z0 = sh.z;
  let tx = RX, tz = 25, ty = COURT.rimY;
  if (!make) { const off = rnd(so) < 0.5 ? -0.8 : 0.8; tx = RX + off; tz = 25 + (rnd(so) - 0.5) * 0.8; ty = 10.15; }
  const T = 0.72 + dist * 0.021;
  Object.assign(b, { state: 'shot', x: x0, y: y0, z: z0, t: 0, T, make, vx: (tx - x0) / T, vz: (tz - z0) / T, vy: (ty - y0 + 0.5 * G * T * T) / T });
  so.att++;
  say(so, 'shot', { label: mq.label });
}

function end(so) {
  if (so.phase === 'end') return;
  so.phase = 'end'; so.phaseT = 0;
  say(so, 'end', { score: so.score });
}

export function forceShootoutShot(so, q) {
  if (so.phase === 'ready') { so.phase = 'live'; }
  if (so.ball.state !== 'held' || so.moveT > 0) return false;
  so.sh.forceQ = q; so.input.shootP = true; so.input.shoot = true;
  return true;
}
