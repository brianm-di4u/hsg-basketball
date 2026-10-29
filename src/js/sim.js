// Match rules engine. Pure (no DOM): a plain JSON match object stepped at a fixed 1/60 s.
// Rules here are game rules; only the 35-second shot clock is a sourced fact (see research/town-content.md).
import { rnd, gauss, clamp } from './util.js';
import { COURT, G, rimFor, distToRim, isThree, inBounds } from './court.js';
import { decide, nearestDef, bestPassTarget, spots } from './ai.js';
import { DIFF, TEAM_AI, meterTime, meterQuality, contestFactor, shotChance, ftChance, SWEET } from './rules.js';

export const DT = 1 / 60;
const BALL_R = 0.4;
const STAT0 = () => ({ pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, reb: 0, ast: 0, stl: 0, blk: 0, to: 0, pf: 0, sec: 0 });

// opts: {mode, home, away (team objects with roster, kit), rules:{qLen, shotClock}, seed, user (0|1|-1), difficulty, assist, crowd (team idx or -1), venue}
export function createMatch(opts) {
  const rules = { qLen: 120, shotClock: 35, otLen: 60, bonusAt: 5, foulOut: 5, ...opts.rules };
  rules.otLen = Math.max(60, Math.round(rules.qLen / 2));
  const mkTeam = (src, isUser) => ({
    key: src.key, name: src.name, short: src.short, abbr: src.abbr, mascot: src.mascot, crest: src.crest, colors: src.colors,
    fictional: !!src.fictional, kit: src.kit, program: opts.program,
    roster: src.roster.map((r) => ({ ...r, st: STAT0(), energy: 1, out: false })),
    onCourt: [0, 1, 2, 3, 4], score: 0, tf: [0, 0, 0, 0], isUser,
  });
  const m = {
    v: 1, mode: opts.mode || 'exhibition', rs: (opts.seed | 0) || 1, seed: opts.seed | 0, rules, program: opts.program,
    difficulty: opts.difficulty ?? 1, assist: !!opts.assist, venue: opts.venue || 'home', crowdTeam: opts.crowd ?? -1, crowd: 0.3,
    teams: [mkTeam(opts.home, opts.user === 0), mkTeam(opts.away, opts.user === 1)],
    p: [], ball: { x: 47, y: 4, z: 25, vx: 0, vy: 0, vz: 0, state: 'dead', holder: -1, lastTouch: 0, passTo: -1, lastPasser: -1, passAt: -9, shot: null, land: null, tried: [] },
    poss: 0, possAt: 0, dir: [1, -1], arrow: 0, help: [-1, -1],
    clock: { q: 1, t: rules.qLen, shot: rules.shotClock, shotOff: !rules.shotClock, running: false },
    phase: 'tipoff', phaseT: 0, time: 0, pend: null, ft: null, inb: null, tip: null,
    user: { team: opts.user ?? -1, ctrl: -1, lock: 0, lastSwitch: 0, idle: 0, auto: false, meterLabel: null, meterLabelT: 0 },
    input: { mx: 0, mz: 0, shoot: false, shootP: false, shootR: false, passP: false, switchP: false },
    autoBreak: !!opts.autoBreak, breakReady: false, winner: -1, ev: [], log: [], buzzerPending: false, run: { team: -1, pts: 0 },
    noFouls: !!opts.noFouls, scenario: opts.scenario || null, scVio: [0, 0],
  };
  for (let t = 0; t < 2; t++) for (let s = 0; s < 5; s++) {
    m.p.push({ idx: t * 5 + s, t, slot: s, r: s, x: 47, z: 25, y: 0, vx: 0, vz: 0, vy: 0, face: t ? -1 : 1, act: 'idle', actT: 0, tx: 47, tz: 25, want: 1, aiT: 0, cool: 0, holdT: 0, drive: 0, cut: 0, meter: 0, relAt: 0, stype: '', run: 0 });
  }
  setupTipoff(m);
  return m;
}

const R = (m, i) => m.teams[m.p[i].t].roster[m.p[i].r];
const hFt = (m, i) => R(m, i).height / 12;
const reach = (m, i) => hFt(m, i) * 1.3 + m.p[i].y + 0.3;
const aiOf = (m, t) => (m.teams[t].isUser ? TEAM_AI : DIFF[m.difficulty] || DIFF[1]);
const say = (m, k, o = {}) => { m.ev.push({ k, ...o }); if (m.ev.length > 60) m.ev.shift(); };
function log(m, s) { m.log.push(`Q${m.clock.q} ${m.clock.t.toFixed(1)} ${s}`); if (m.log.length > 50) m.log.shift(); }

// ---------------------------------------------------------------- phase setups
function place(m, i, x, z) { const p = m.p[i]; p.x = p.tx = x; p.z = p.tz = z; p.vx = p.vz = 0; p.y = 0; p.vy = 0; p.act = 'idle'; p.drive = 0; }

export function setupTipoff(m) {
  m.phase = 'tipoff'; m.phaseT = 0; m.clock.running = false;
  for (let t = 0; t < 2; t++) {
    const d = m.dir[t];
    const sp = [[47 - d * 10, 25], [47 - d * 4, 14], [47 - d * 4, 36], [47 + d * 3, 16], [47 - d * 1.6, 25]];
    for (let s = 0; s < 5; s++) place(m, t * 5 + s, sp[s][0], sp[s][1]);
  }
  Object.assign(m.ball, { x: 47, y: 5, z: 25, vx: 0, vy: 0, vz: 0, state: 'dead', holder: -1 });
  m.tip = { userT: -1, done: false };
}

function setupInbound(m, team, kind, x = 47) {
  if (kind !== 'base') doSubs(m);
  const d = m.dir[team];
  let ix, iz;
  if (kind === 'base') { ix = d > 0 ? -1.5 : COURT.L + 1.5; iz = 19; }
  else { ix = clamp(x, 12, COURT.L - 12); iz = COURT.W + 1.6; }
  const by = team * 5 + (kind === 'base' ? 3 : 2);
  const recv = team * 5;
  m.inb = { team, kind, x: ix, z: iz, by, recv, t: 0, ready: false };
  for (const q of m.p) if (q.act === 'shoot' || q.act === 'layup') { q.act = 'idle'; q.meter = 0; }
  m.phase = 'inbound'; m.phaseT = 0;
  setPoss(m, team);
  m.ball.state = 'held'; m.ball.holder = by; m.ball.passTo = -1;
  if (kind !== 'base') {
    m.clock.running = false;
    // dead ball: everyone resets to shape around the ball
    const sp = spots(d);
    for (let s = 0; s < 5; s++) {
      const i = team * 5 + s;
      if (i === by) continue;
      const tx = clamp(ix + (sp[s][0] - 47) * 0.45 + d * 4, 3, COURT.L - 3);
      place(m, i, tx, clamp(sp[s][1] + 4, 4, 46));
    }
    for (let s = 0; s < 5; s++) {
      const i = (1 - team) * 5 + s, man = m.p[team * 5 + s];
      place(m, i, man.x + d * 3, man.z - 1.5);
    }
    place(m, by, ix, iz);
    m.inb.ready = true;
  } else {
    m.p[by].tx = ix; m.p[by].tz = iz;
  }
}

export function setupFT(m, shooter, n) {
  doSubs(m, shooter);
  const p = m.p[shooter], t = p.t, d = m.dir[t];
  m.phase = 'ft'; m.phaseT = 0; m.clock.running = false;
  m.ft = { by: shooter, team: t, left: n, total: n, made: 0, mv: 0, md: 1, state: 'aim', t: 0, label: null };
  const rx = rimFor(d);
  place(m, shooter, rx - d * (COURT.ftDist + 0.6), 25); p.face = d;
  const lane = [[4, 18], [4, 32], [7.5, 18], [7.5, 32], [11, 18], [11, 32]];
  let li = 0;
  for (let k = 0; k < 10; k++) {
    if (k === shooter) continue;
    const q = m.p[k];
    if (li < 6 && (q.slot >= 2 || li < 2)) { place(m, k, rx - d * lane[li][0], lane[li][1] + (lane[li][1] < 25 ? -1.4 : 1.4)); li++; }
    else place(m, k, rx - d * 24, q.t === t ? 14 + q.slot * 4 : 16 + q.slot * 4);
    m.p[k].face = d;
  }
  setPoss(m, t);
  Object.assign(m.ball, { state: 'held', holder: shooter, passTo: -1 });
}

function setPoss(m, t) {
  if (m.poss !== t || m.possAt === 0) { m.poss = t; m.possAt = m.time; resetShot(m); m.help = [-1, -1]; for (const p of m.p) { p.drive = 0; p.cut = 0; } }
}
function resetShot(m) {
  m.clock.shot = m.rules.shotClock;
  m.clock.shotOff = !m.rules.shotClock || m.clock.t < m.rules.shotClock;
}

function toQEnd(m) {
  m.buzzerPending = false; m.clock.running = false; m.pend = null;
  const [a, b] = [m.teams[0].score, m.teams[1].score];
  if (m.clock.q >= 4 && a !== b) {
    m.phase = 'final'; m.phaseT = 0; m.winner = a > b ? 0 : 1;
    for (const p of m.p) { p.act = p.t === m.winner ? 'celebrate' : 'idle'; p.actT = 0; }
    say(m, 'final', { winner: m.winner }); log(m, `FINAL ${a}-${b}`);
    m.ball.state = 'dead'; m.ball.holder = -1;
    return;
  }
  m.phase = 'qend'; m.phaseT = 0; m.breakReady = false;
  say(m, 'qend', { q: m.clock.q });
}

export function startNextPeriod(m) {
  if (m.phase !== 'qend') return;
  m.clock.q++;
  if (m.clock.q === 3) m.dir = [-m.dir[0], -m.dir[1]];
  m.clock.t = m.clock.q <= 4 ? m.rules.qLen : m.rules.otLen;
  for (const T of m.teams) for (const r of T.roster) r.energy = Math.min(1, r.energy + (m.clock.q === 3 ? 0.5 : 0.25));
  const team = m.arrow; m.arrow = 1 - team;
  m.possAt = 0; // force a fresh possession
  setupInbound(m, team, 'side', 47);
  m.breakReady = false;
  say(m, 'period', { q: m.clock.q });
}

// ---------------------------------------------------------------- substitutions
function doSubs(m, keep = -1) {
  for (let t = 0; t < 2; t++) {
    const T = m.teams[t];
    for (let s = 0; s < 5; s++) {
      if (t * 5 + s === keep) continue;
      const cur = T.roster[T.onCourt[s]];
      if (!cur.out && cur.energy > 0.55) continue;
      let best = -1, bs = -1;
      for (let r = 0; r < T.roster.length; r++) {
        if (T.onCourt.includes(r)) continue;
        const c = T.roster[r];
        if (c.out || c.energy < 0.72) continue;
        const sc = c.ovr + (c.pos === cur.pos ? 12 : 0) + c.energy * 10;
        if (sc > bs) { bs = sc; best = r; }
      }
      if (best >= 0) {
        T.onCourt[s] = best; m.p[t * 5 + s].r = best;
        say(m, 'sub', { t, num: T.roster[best].num }); log(m, `${T.abbr} sub #${T.roster[best].num} for #${cur.num}`);
      }
    }
  }
}

// ---------------------------------------------------------------- actions (used by AI and the user)
export function startShot(m, i) {
  const p = m.p[i];
  if (m.ball.holder !== i || p.act === 'shoot' || p.act === 'layup') return false;
  if (m.phase !== 'live') return false;
  const d = m.dir[p.t];
  const dist = distToRim(p.x, p.z, d);
  const r = R(m, i);
  const reachIn = r.height + (r.jmp * 14);
  p.stype = dist < 4.6 ? (reachIn >= 86 && Math.hypot(p.vx, p.vz) > 6 ? 'dunk' : 'layup') : 'jumper';
  p.act = p.stype === 'jumper' ? 'shoot' : 'layup';
  p.actT = 0; p.meter = 0;
  if (p.stype === 'jumper') { p.vy = 10 + 4 * r.jmp; p.vx *= 0.2; p.vz *= 0.2; }
  else p.vy = 11 + 4 * r.jmp;
  const ai = aiOf(m, p.t);
  if (!(m.user.team === p.t && m.user.ctrl === i && !m.user.auto)) {
    const sd = ai.sd * (1.25 - 0.5 * (p.stype === 'jumper' ? r.sht : r.ins));
    p.relAt = clamp(SWEET + gauss(m) * sd, 0.45, 1.12);
  } else p.relAt = 99;
  say(m, 'gather', { i });
  // AI defenders react with a contest jump
  for (let k = (1 - p.t) * 5; k < (1 - p.t) * 5 + 5; k++) {
    const q = m.p[k];
    if (Math.hypot(q.x - p.x, q.z - p.z) < 4.5 && q.y === 0) q.jumpIn = aiOf(m, q.t).react + rnd(m) * 0.12;
  }
  return true;
}

function release(m, i) {
  const p = m.p[i], t = p.t, d = m.dir[t], r = R(m, i);
  const T = m.teams[t];
  const type = p.stype;
  const mt = meterTime(type === 'jumper' ? 'jumper' : 'layup');
  const v = p.actT / mt;
  const userShot = m.user.team === t && m.user.ctrl === i && !m.user.auto;
  let scale = userShot ? (DIFF[m.difficulty] || DIFF[1]).win * (m.assist ? 1.5 : 1) : 1;
  if (userShot && m.crowdTeam === t && m.crowd > 0.6) scale *= 1.3;
  const mq = meterQuality(v, scale, type === 'jumper' ? 'jumper' : 'layup');
  if (userShot) { m.user.meterLabel = mq.label; m.user.meterLabelT = 1.2; }
  const forced = p.forceQ;
  const quality = forced != null ? forced : mq.q;
  if (forced != null) { mq.label = forced >= 1 ? 'PERFECT' : forced >= 0.75 ? 'GOOD' : 'EARLY'; if (userShot) m.user.meterLabel = mq.label; }
  p.forceQ = null;
  const dist = distToRim(p.x, p.z, d);
  const three = type === 'jumper' && isThree(p.x, p.z, d);
  const nd = nearestDef(m, p.x, p.z, t);
  const jumping = nd.idx >= 0 && m.p[nd.idx].y > 0.5;
  const contest = contestFactor(nd.d, jumping);
  const bonus = m.crowdTeam === t && m.crowd > 0.6 ? 1.05 : 1;
  const prob = shotChance({ dist, type, sht: r.sht, ins: r.ins, contest, quality, energy: r.energy, bonus });
  const make = rnd(m) < prob;
  let foul = null;
  if (!m.noFouls && nd.idx >= 0 && nd.d < 3.2) {
    const pf = 0.04 + (nd.d < 2 ? 0.05 : 0) + (jumping ? 0.04 : 0);
    if (rnd(m) < pf) foul = { by: nd.idx, fts: three ? 3 : 2 };
  }
  // trajectory
  const x0 = p.x + d * 0.5, z0 = p.z, y0 = hFt(m, i) + p.y + 0.7;
  const rx = rimFor(d), rz = COURT.rimZ;
  let tx = rx, tz = rz, ty = COURT.rimY, airball = false;
  if (!make) {
    if (quality < 0.12 && dist > 12) { airball = true; tx = rx - d * 2.2; ty = 8.2; }
    else {
      const ang = Math.atan2(rz - z0, rx - x0) + (rnd(m) - 0.5) * 1.4;
      const off = rnd(m) < 0.55 ? -1 : 1; // front or back rim
      tx = rx + Math.cos(ang) * 0.8 * off; tz = rz + Math.sin(ang) * 0.8 * off; ty = 10.15;
    }
  }
  const Tf = type === 'dunk' ? 0.22 : type === 'layup' ? 0.5 : 0.72 + dist * 0.021;
  Object.assign(m.ball, {
    state: 'shot', holder: -1, x: x0, y: y0, z: z0, lastTouch: t, tried: [],
    vx: (tx - x0) / Tf, vz: (tz - z0) / Tf, vy: (ty - y0 + 0.5 * G * Tf * Tf) / Tf,
    shot: { by: i, team: t, type, three, make, airball, T: Tf, t: 0, x0, y0, z0, foul, q: quality, label: mq.label, buzzer: m.clock.t <= 0, pts: three ? 3 : 2, prob },
  });
  m.ball.land = null;
  r.st.fga++; if (three) r.st.tpa++;
  say(m, 'shot', { i, three, type });
  p.holdT = 0;
}

export function doPass(m, i, j) {
  const p = m.p[i], q = m.p[j];
  if (m.ball.holder !== i || i === j) return false;
  if (p.act === 'shoot' || p.act === 'layup') return false;
  const dd = Math.hypot(q.x - p.x, q.z - p.z);
  const Tp = clamp(dd / 38, 0.18, 1.0);
  const lx = clamp(q.x + q.vx * Tp * 0.6, 0.5, COURT.L - 0.5), lz = clamp(q.z + q.vz * Tp * 0.6, 0.5, COURT.W - 0.5);
  Object.assign(m.ball, {
    state: 'pass', holder: -1, passTo: j, lastTouch: p.t, lastPasser: i, passAt: m.time, tried: [],
    px0: m.ball.x, py0: m.ball.y, pz0: m.ball.z, px1: lx, pz1: lz, pt: 0, pT: Tp, inb: m.phase === 'inbound',
  });
  q.tx = lx; q.tz = lz;
  p.act = 'pass'; p.actT = 0; p.holdT = 0; p.drive = 0;
  say(m, 'pass', { i, j });
  return true;
}

export function trySteal(m, i) {
  const p = m.p[i];
  if (p.cool > 0 || m.phase !== 'live') return false;
  p.cool = 0.8; p.act = 'steal'; p.actT = 0;
  const h = m.ball.holder;
  if (h < 0 || m.p[h].t === p.t) return false;
  const hp = m.p[h];
  if (Math.hypot(hp.x - p.x, hp.z - p.z) > 3.6 || hp.act === 'shoot' || hp.act === 'layup') return false;
  const rs = R(m, i), rh = R(m, h);
  const chance = clamp(0.1 + 0.32 * (rs.def - rh.hnd * 0.7), 0.04, 0.38);
  const roll = rnd(m);
  if (roll < chance) {
    rs.st.stl++; rh.st.to++;
    gainBall(m, i, 'steal');
    say(m, 'steal', { i }); log(m, `${m.teams[p.t].abbr} steal #${rs.num}`);
    return true;
  }
  if (!m.noFouls && roll > 1 - 0.1) { foulCall(m, i, h, 'reach'); }
  return false;
}

export function jump(m, i) {
  const p = m.p[i];
  if (p.y > 0 || p.act === 'shoot' || p.act === 'layup') return false;
  p.vy = 12 + 4 * R(m, i).jmp; p.act = 'jump'; p.actT = 0;
  return true;
}

const A = { startShot, doPass, trySteal, jump };

function gainBall(m, i, how) {
  const p = m.p[i];
  const prev = m.ball.lastTouch;
  Object.assign(m.ball, { state: 'held', holder: i, passTo: -1, lastTouch: p.t, land: null });
  p.holdT = 0; p.drive = 0;
  if (p.act === 'shoot' || p.act === 'layup') { p.act = 'idle'; p.meter = 0; }
  if (how === 'reb') { R(m, i).st.reb++; say(m, 'reb', { i }); }
  if (m.poss !== p.t) setPoss(m, p.t);
  if (m.user.team === p.t) m.user.ctrl = i; // control moves with the catch, not a tick later
  if (how === 'catch' && m.phase === 'inbound') { m.phase = 'live'; m.phaseT = 0; m.clock.running = m.clock.t > 0; m.inb = null; }
  if (how !== 'catch' && m.phase === 'live' && prev !== p.t) m.run.lastChange = m.time;
}

// ---------------------------------------------------------------- fouls and scoring
function foulCall(m, defIdx, offIdx, kind) {
  const d = m.p[defIdx], T = m.teams[d.t];
  const rd = R(m, defIdx);
  rd.st.pf++;
  const qi = Math.min(m.clock.q, 4) - 1;
  T.tf[qi]++;
  if (rd.st.pf >= m.rules.foulOut) { rd.out = true; say(m, 'fouledout', { t: d.t, num: rd.num }); log(m, `${T.abbr} #${rd.num} fouls out`); }
  say(m, 'whistle', { why: kind, i: defIdx }); log(m, `foul ${T.abbr} #${rd.num} (${kind})`);
  if (kind === 'reach') {
    m.clock.running = false;
    const offTeam = m.p[offIdx].t;
    if (T.tf[qi] >= m.rules.bonusAt) { m.pend = { k: 'ft', i: offIdx, n: 2, delay: 0.8 }; m.ball.state = 'dead'; m.ball.holder = -1; m.phase = 'dead'; }
    else { m.pend = { k: 'inbound', team: offTeam, kind: 'side', x: m.p[offIdx].x, delay: 0.8 }; m.ball.state = 'dead'; m.ball.holder = -1; m.phase = 'dead'; }
  }
}

function score(m, t, pts, shooterIdx) {
  m.teams[t].score += pts;
  const r = R(m, shooterIdx);
  r.st.pts += pts;
  if (m.run.team === t) m.run.pts += pts; else m.run = { team: t, pts };
  if (m.crowdTeam >= 0) m.crowd = clamp(m.crowd + (m.crowdTeam === t ? pts * 0.07 : -pts * 0.04), 0, 1);
  say(m, 'score', { t, pts, i: shooterIdx });
  log(m, `${m.teams[t].abbr} +${pts} #${r.num} (${m.teams[0].score}-${m.teams[1].score})`);
}

// ---------------------------------------------------------------- main tick
export function tick(m) {
  m.time += DT; m.phaseT += DT;
  const inp = m.input;
  if (m.phase === 'final') { animate(m); clearEdges(inp); return; }
  if (m.phase === 'qend') {
    animate(m); integrate(m);
    if (m.phaseT > 1.6) { m.breakReady = true; if (m.autoBreak) startNextPeriod(m); }
    clearEdges(inp); return;
  }
  if (m.pend) {
    m.pend.delay -= DT;
    if (m.pend.delay <= 0) {
      const pd = m.pend; m.pend = null;
      if (pd.k === 'inbound') setupInbound(m, pd.team, pd.kind, pd.x);
      else if (pd.k === 'ft') setupFT(m, pd.i, pd.n);
      else if (pd.k === 'qend') toQEnd(m);
      else if (pd.k === 'ftnext' && m.ft) {
        const ft = m.ft;
        ft.state = 'aim'; ft.t = 0; ft.label = null;
        Object.assign(m.ball, { state: 'held', holder: ft.by });
        m.p[ft.by].act = 'idle';
      }
    }
  }
  if (m.phase === 'tipoff') tipoffTick(m);
  controlTick(m);
  for (let i = 0; i < 10; i++) {
    const p = m.p[i];
    p.cool = Math.max(0, p.cool - DT);
    p.holdT += DT;
    if (p.drive > 0) p.drive -= DT;
    if (isUserCtrl(m, i)) continue;
    if (p.drive > 0 && m.ball.holder === i && distToRim(p.x, p.z, m.dir[p.t]) < 4.2) startShot(m, i);
    p.aiT -= DT;
    if (p.aiT <= 0) decide(m, i, A, aiOf(m, p.t));
    if (p.jumpIn != null) { p.jumpIn -= DT; if (p.jumpIn <= 0) { p.jumpIn = null; if (m.ball.state === 'shot' || (m.ball.holder >= 0 && (m.p[m.ball.holder].act === 'shoot' || m.p[m.ball.holder].act === 'layup'))) jump(m, i); } }
  }
  shooterTick(m);
  if (m.phase === 'inbound') inboundTick(m);
  if (m.phase === 'ft') ftTick(m);
  integrate(m);
  ballTick(m);
  clockTick(m);
  animate(m);
  if (m.user.meterLabelT > 0) m.user.meterLabelT -= DT;
  clearEdges(inp);
}
function clearEdges(inp) { inp.shootP = inp.shootR = inp.passP = inp.switchP = false; }

const isUserCtrl = (m, i) => m.user.team >= 0 && !m.user.auto && m.user.ctrl === i;

function tipoffTick(m) {
  const t = m.phaseT;
  m.ball.x = 47; m.ball.z = 25; m.ball.y = 5.5 + 18 * t - 16 * t * t; // peak ~10.5 ft at 0.56 s
  const ut = m.user.team;
  const c0 = 4, c1 = 9;
  if (ut >= 0 && !m.user.auto && m.input.shootP && m.tip.userT < 0) { m.tip.userT = t; jump(m, ut * 5 + 4); }
  if (t > 0.3 && m.p[c0].y === 0 && !(ut === 0 && !m.user.auto)) jump(m, c0);
  if (t > 0.32 && m.p[c1].y === 0 && !(ut === 1 && !m.user.auto)) jump(m, c1);
  if (t >= 0.62 && !m.tip.done) {
    m.tip.done = true;
    let p0 = 0.5 + (R(m, c0).jmp + R(m, c0).height / 100 - R(m, c1).jmp - R(m, c1).height / 100) * 0.6;
    if (ut >= 0 && !m.user.auto) {
      const good = m.tip.userT >= 0.3 && m.tip.userT <= 0.6;
      const adj = m.tip.userT < 0 ? -0.15 : good ? 0.25 : -0.1;
      p0 += ut === 0 ? adj : -adj;
    }
    const win = rnd(m) < clamp(p0, 0.1, 0.9) ? 0 : 1;
    m.arrow = 1 - win;
    m.phase = 'live'; m.phaseT = 0; m.clock.running = true;
    m.ball.y = 10; m.ball.holder = win * 5 + 4;
    m.ball.state = 'held';
    m.possAt = 0; setPoss(m, win);
    doPass(m, win * 5 + 4, win * 5 + 0);
    say(m, 'tip', { t: win }); log(m, `tip won by ${m.teams[win].abbr}`);
  }
}

function controlTick(m) {
  const u = m.user, ut = u.team;
  if (ut < 0 || u.auto) return;
  const inp = m.input;
  const b = m.ball;
  u.lock = Math.max(0, u.lock - DT);
  const mine = (i) => i >= ut * 5 && i < ut * 5 + 5;
  if (b.holder >= 0 && mine(b.holder)) u.ctrl = b.holder;
  else if (m.phase === 'inbound' && m.inb && m.inb.team === ut) u.ctrl = m.inb.recv;
  else if (b.state === 'pass' && mine(b.passTo)) { /* keep the passer until the catch */ }
  else if (m.phase === 'tipoff') u.ctrl = ut * 5 + 4;
  else {
    const bx = b.land && b.state === 'loose' ? b.land.x : b.x, bz = b.land && b.state === 'loose' ? b.land.z : b.z;
    const dOf = (i) => Math.hypot(m.p[i].x - bx, m.p[i].z - bz);
    let best = ut * 5, bd = 1e9;
    for (let i = ut * 5; i < ut * 5 + 5; i++) { const dd = dOf(i); if (dd < bd) { bd = dd; best = i; } }
    if (inp.switchP) {
      const order = [0, 1, 2, 3, 4].map((s) => ut * 5 + s).filter((i) => i !== u.ctrl).sort((a, c) => dOf(a) - dOf(c));
      u.ctrl = order[0]; u.lock = 1.5; u.lastSwitch = m.time;
    } else if (u.ctrl < 0 || !mine(u.ctrl)) u.ctrl = best;
    else if (u.lock <= 0 && best !== u.ctrl && dOf(u.ctrl) - bd > 3 && m.time - u.lastSwitch > 0.8) { u.ctrl = best; u.lastSwitch = m.time; }
  }
  const i = u.ctrl;
  if (i < 0) return;
  const p = m.p[i];
  const r = R(m, i);
  const mag = Math.hypot(inp.mx, inp.mz);
  u.idle = mag < 0.1 ? u.idle + DT : 0;
  // movement intent
  const spd = (14 + 6 * r.spd) * (0.85 + 0.15 * r.energy) * (b.holder === i ? 0.92 : 1);
  if (m.phase === 'ft' || m.phase === 'tipoff' || (m.phase === 'inbound' && m.inb && m.inb.by === i)) { p.tx = p.x; p.tz = p.z; p.want = 0; }
  else if (mag > 0.1) { p.tx = p.x + inp.mx / mag * spd; p.tz = p.z + inp.mz / mag * spd * 0.8; p.want = Math.min(1, mag); }
  else if (b.holder !== i && m.poss !== ut && u.idle > 0.6) { decide(m, i, A, TEAM_AI); }
  else { p.tx = p.x; p.tz = p.z; p.want = 0; }
  if (m.phase === 'ft' || m.phase === 'tipoff') return;
  // buttons
  if (b.holder === i) {
    if (inp.shootP && m.phase === 'live') startShot(m, i);
    if (inp.passP) {
      if (m.phase === 'inbound') { const j = m.inb.recv; if (j !== i) doPass(m, i, j); }
      else { const j = bestPassTarget(m, i, inp.mx, inp.mz); if (j >= 0) doPass(m, i, j); }
    }
  } else {
    if (inp.passP) trySteal(m, i);
    if (inp.shootP) jump(m, i);
  }
}

// shooting gathers: AI releases at relAt; the user's shooter releases on button-up or overflow
function shooterTick(m) {
  if (m.phase !== 'live') return;
  for (let i = 0; i < 10; i++) {
    const p = m.p[i];
    if ((p.act !== 'shoot' && p.act !== 'layup') || m.ball.holder !== i) continue;
    p.actT += DT;
    const mt = meterTime(p.stype === 'jumper' ? 'jumper' : 'layup');
    p.meter = p.actT / mt;
    const user = isUserCtrl(m, i);
    if (p.stype !== 'jumper') { // keep driving at the rim
      const d = m.dir[p.t];
      p.tx = rimFor(d) - d * 1.5; p.tz = 25; p.want = 0.6;
    }
    if (p.forceQ != null && p.meter >= SWEET) { release(m, i); continue; }
    if (user ? (m.input.shootR || !m.input.shoot || p.meter >= 1.18) && p.actT > 0.06 : p.meter >= p.relAt) release(m, i);
  }
}

function inboundTick(m) {
  const inb = m.inb;
  if (!inb) return;
  const by = m.p[inb.by];
  if (!inb.ready) {
    // walking to the spot after a made basket (the clock keeps running)
    by.tx = inb.x; by.tz = inb.z; by.want = 1;
    if (Math.hypot(by.x - inb.x, by.z - inb.z) < 1.2 || m.phaseT > 2.5) { place(m, inb.by, inb.x, inb.z); inb.ready = true; inb.t = 0; }
    m.ball.holder = inb.by;
    return;
  }
  inb.t += DT;
  const userTeam = m.user.team === inb.team && !m.user.auto;
  const go = userTeam ? inb.t > 1.6 : inb.t > 0.7 + (m.rs & 7) * 0.05;
  if (m.ball.state === 'held' && m.ball.holder === inb.by && go) {
    let j = inb.recv;
    if (!userTeam) { const b = bestPassTarget(m, inb.by); if (b >= 0) j = b; }
    doPass(m, inb.by, j);
  }
  if (inb.t > 5 && m.ball.state === 'held') { // 5-second violation
    say(m, 'whistle', { why: '5sec' }); log(m, '5-second violation');
    R(m, inb.by).st.to++;
    m.pend = { k: 'inbound', team: 1 - inb.team, kind: 'side', x: inb.x, delay: 0.6 }; m.phase = 'dead';
  }
}

function ftTick(m) {
  const ft = m.ft;
  if (!ft) return;
  ft.t += DT;
  if (ft.state === 'aim') {
    const user = m.user.team === ft.team && !m.user.auto;
    const sp = 1.25 * (m.assist ? 0.75 : 1) * (user ? (DIFF[m.difficulty] || DIFF[1]).win ** -0.5 : 1);
    ft.mv += ft.md * DT * sp;
    if (ft.mv > 1) { ft.mv = 2 - ft.mv; ft.md = -1; } else if (ft.mv < 0) { ft.mv = -ft.mv; ft.md = 1; }
    let q = null;
    if (ft.force != null) { q = ft.force; ft.force = null; }
    else if (user && ft.t > 0.35 && m.input.shootP) {
      const off = Math.abs(ft.mv - 0.5), band = 0.08 * (m.assist ? 1.5 : 1);
      q = off <= band ? 1 : clamp(1 - (off - band) * 2.4, 0, 1);
      ft.label = q >= 1 ? 'PERFECT' : q > 0.6 ? 'GOOD' : ft.mv < 0.5 ? 'EARLY' : 'LATE';
    } else if (!user && ft.t > 1.1) q = clamp(0.5 + R(m, ft.by).ft * 0.45 + gauss(m) * 0.25, 0, 1);
    if (q != null) {
      const r = R(m, ft.by);
      const make = rnd(m) < ftChance(r.ft, q);
      const p = m.p[ft.by], d = m.dir[p.t];
      const x0 = p.x + d * 0.5, y0 = hFt(m, ft.by) + 0.6, z0 = p.z;
      const rx = rimFor(d);
      const tx = make ? rx : rx + (rnd(m) < 0.5 ? -d : d) * 0.8, tz = make ? 25 : 25 + (rnd(m) - 0.5) * 0.8, ty = make ? 10 : 10.15;
      const Tf = 0.95;
      r.st.fta++;
      Object.assign(m.ball, { state: 'shot', holder: -1, x: x0, y: y0, z: z0, lastTouch: p.t, vx: (tx - x0) / Tf, vz: (tz - z0) / Tf, vy: (ty - y0 + 0.5 * G * Tf * Tf) / Tf,
        shot: { by: ft.by, team: p.t, type: 'ft', three: false, make, airball: false, T: Tf, t: 0, foul: null, q, pts: 1, last: ft.left === 1 } });
      p.act = 'shoot'; p.actT = 0;
      ft.state = 'flight';
      say(m, 'shot', { i: ft.by, type: 'ft' });
    }
  }
}

// ---------------------------------------------------------------- movement
function integrate(m) {
  for (let i = 0; i < 10; i++) {
    const p = m.p[i];
    const r = R(m, i);
    const onGround = p.y <= 0 && p.vy <= 0;
    if (onGround) {
      let dvx = 0, dvz = 0;
      const frozen = p.act === 'shoot' || (m.phase === 'ft') || (m.phase === 'tipoff');
      if (!frozen) {
        const dx = p.tx - p.x, dz = p.tz - p.z, dd = Math.hypot(dx, dz);
        const max = (14 + 6 * r.spd) * (0.85 + 0.15 * r.energy) * (m.ball.holder === i ? 0.92 : 1) * (p.want ?? 1);
        if (dd > 0.25) { const sp = Math.min(max, dd * 3.2); dvx = dx / dd * sp; dvz = dz / dd * sp; }
      }
      const acc = 46 * DT;
      const ax = clamp(dvx - p.vx, -acc, acc), az = clamp(dvz - p.vz, -acc, acc);
      p.vx += ax; p.vz += az;
      if (frozen && m.phase !== 'live') { p.vx = p.vz = 0; }
    }
    p.x += p.vx * DT; p.z += p.vz * DT;
    if (p.y > 0 || p.vy > 0) {
      p.vy -= G * DT; p.y += p.vy * DT;
      if (p.y <= 0) { p.y = 0; p.vy = 0; if (p.act === 'jump' || p.act === 'shoot' || p.act === 'layup') { if (m.ball.holder !== i) { p.act = 'idle'; } } }
    }
    const holder = m.ball.holder === i && m.phase !== 'inbound';
    const lo = holder ? 0.4 : -2.5, hiX = holder ? COURT.L - 0.4 : COURT.L + 2.5, hiZ = holder ? COURT.W - 0.4 : COURT.W + 2.8;
    p.x = clamp(p.x, lo, hiX); p.z = clamp(p.z, holder ? 0.4 : -1.5, hiZ);
    // energy and minutes
    const moving = Math.hypot(p.vx, p.vz);
    // energy is paced to the quarter length so subs come about once a quarter at any setting
    const k = 0.5 / m.rules.qLen;
    if (m.clock.running) { r.energy = Math.max(0.2, r.energy - DT * k * (0.5 + 0.5 * Math.min(1, moving / 15))); r.st.sec += DT; }
  }
  // bench recovery
  if (m.clock.running) { const k = 1.4 / m.rules.qLen; for (const T of m.teams) T.roster.forEach((r, j) => { if (!T.onCourt.includes(j)) r.energy = Math.min(1, r.energy + DT * k); }); }
  // keep bodies apart
  for (let a = 0; a < 10; a++) for (let b = a + 1; b < 10; b++) {
    const P = m.p[a], Q = m.p[b];
    const dx = Q.x - P.x, dz = (Q.z - P.z) * 1.4, dd = Math.hypot(dx, dz);
    if (dd < 1.5 && dd > 1e-4) {
      const push = (1.5 - dd) * 0.5;
      P.x -= dx / dd * push; P.z -= dz / dd * push / 1.4; Q.x += dx / dd * push; Q.z += dz / dd * push / 1.4;
    }
  }
  for (const p of m.p) {
    if (m.ball.holder === p.idx) p.face = m.dir[p.t];
    else if (Math.abs(p.vx) > 2) p.face = Math.sign(p.vx);
    else p.face = m.ball.x >= p.x ? 1 : -1;
  }
}

function animate(m) {
  for (const p of m.p) {
    p.actT += p.act === 'shoot' || p.act === 'layup' ? 0 : DT;
    if ((p.act === 'pass' || p.act === 'steal') && p.actT > 0.25) p.act = 'idle';
    p.run = (p.run + Math.hypot(p.vx, p.vz) * DT * 0.55) % (Math.PI * 2);
  }
}

// ---------------------------------------------------------------- ball
function predictLand(b) {
  // where the ball will be when it next falls through ~4 ft
  let x = b.x, y = b.y, z = b.z, vx = b.vx, vy = b.vy, vz = b.vz;
  for (let k = 0; k < 180; k++) {
    vy -= G * DT; x += vx * DT; y += vy * DT; z += vz * DT;
    if (vy < 0 && y < 4) break;
  }
  return { x: clamp(x, 1, COURT.L - 1), z: clamp(z, 1, COURT.W - 1) };
}

function ballTick(m) {
  const b = m.ball;
  if (b.state === 'held') {
    const p = m.p[b.holder];
    if (!p) return;
    const shooting = p.act === 'shoot' || p.act === 'layup';
    const moving = Math.hypot(p.vx, p.vz) > 1.5;
    b.x = p.x + p.face * 0.9; b.z = p.z + 0.3;
    if (shooting) { b.y = hFt(m, b.holder) + p.y + 0.6; b.x = p.x + p.face * 0.35; }
    else if (m.phase === 'inbound' || m.phase === 'ft' || m.phase === 'dead') b.y = hFt(m, b.holder) * 0.55;
    else if (moving || p.holdT > 0.5) {
      b.dp = (b.dp || 0) + DT * 8.5;
      const s = Math.abs(Math.sin(b.dp));
      const n = Math.floor(b.dp / Math.PI);
      if (n !== b.dn) { b.dn = n; say(m, 'bounce', { i: b.holder }); }
      b.y = BALL_R + s * (hFt(m, b.holder) * 0.5);
    } else b.y = hFt(m, b.holder) * 0.6;
    return;
  }
  if (b.state === 'pass') {
    b.pt += DT;
    const f = b.pt / b.pT;
    const fx = Math.min(f, 1.3);
    b.x = b.px0 + (b.px1 - b.px0) * fx; b.z = b.pz0 + (b.pz1 - b.pz0) * fx;
    b.y = Math.max(BALL_R, b.py0 + (4.2 - b.py0) * Math.min(fx, 1) + 1.2 * 4 * fx * (1 - fx));
    const pt = m.p[b.lastPasser]?.t ?? b.lastTouch;
    // interceptions: a defender whose hands reach the ball's path gets one try
    for (let k = (1 - pt) * 5; k < (1 - pt) * 5 + 5; k++) {
      if (b.tried.includes(k) || f < 0.15) continue;
      const q = m.p[k];
      if (Math.hypot(q.x - b.x, q.z - b.z) < 1.7 && b.y < reach(m, k)) {
        b.tried.push(k);
        const ai = aiOf(m, q.t);
        const ch = (0.12 + 0.35 * R(m, k).def) * (ai.steal ?? 1) * (b.inb ? 0.4 : 1);
        if (rnd(m) < ch) {
          R(m, k).st.stl++; R(m, b.lastPasser).st.to++;
          if (m.phase === 'inbound') { m.phase = 'live'; m.clock.running = m.clock.t > 0; m.inb = null; }
          gainBall(m, k, 'steal'); say(m, 'steal', { i: k }); log(m, `${m.teams[q.t].abbr} intercept #${R(m, k).num}`);
          return;
        }
      }
    }
    for (let k = pt * 5; k < pt * 5 + 5; k++) {
      if (k === b.lastPasser) continue;
      const q = m.p[k];
      if (Math.hypot(q.x - b.x, q.z - b.z) < (k === b.passTo ? 2.3 : 1.4) && f > 0.3) { gainBall(m, k, 'catch'); return; }
    }
    if (f >= 1.3) {
      b.state = 'loose'; b.vx = (b.px1 - b.px0) / b.pT * 0.5; b.vz = (b.pz1 - b.pz0) / b.pT * 0.5; b.vy = 0;
      if (m.phase === 'inbound') { m.phase = 'live'; m.clock.running = m.clock.t > 0; m.inb = null; }
      b.land = predictLand(b);
    }
    return;
  }
  if (b.state === 'shot') {
    const s = b.shot;
    s.t += DT;
    b.vy -= G * DT; b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
    // blocks: early in the flight, a jumping defender's hands
    if (s.type !== 'ft' && s.t < s.T * 0.45) {
      for (let k = (1 - s.team) * 5; k < (1 - s.team) * 5 + 5; k++) {
        if (b.tried.includes(k)) continue;
        const q = m.p[k];
        if (q.y > 0.4 && Math.hypot(q.x - b.x, q.z - b.z) < 1.9 && reach(m, k) >= b.y) {
          b.tried.push(k);
          const ch = 0.02 + 0.1 * R(m, k).blk - (s.type === 'dunk' ? 0.015 : 0);
          if (rnd(m) < ch) {
            R(m, k).st.blk++;
            b.state = 'loose'; b.vx = -b.vx * 0.35 + (rnd(m) - 0.5) * 8; b.vz = (rnd(m) - 0.5) * 10; b.vy = 4 + rnd(m) * 5;
            b.shot = null; b.lastTouch = q.t; b.land = predictLand(b); b.noPick = m.time + 0.2; b.fromShot = true;
            say(m, 'block', { i: k }); log(m, `${m.teams[q.t].abbr} block #${R(m, k).num}`);
            if (m.buzzerPending) m.pend = { k: 'qend', delay: 0.8 };
            return;
          }
        }
      }
    }
    if (s.t >= s.T) resolveShot(m);
    return;
  }
  if (b.state === 'net') {
    b.vy -= G * 0.6 * DT; b.y += b.vy * DT; b.netT = (b.netT || 0) + DT;
    if (b.y < BALL_R) { b.y = BALL_R; b.vy = 0; b.state = 'dead'; }
    return;
  }
  if (b.state === 'loose') {
    b.vy -= G * DT; b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
    if (b.y < BALL_R) {
      b.y = BALL_R;
      if (Math.abs(b.vy) > 3) { b.vy = -b.vy * 0.58; say(m, 'floor', {}); } else b.vy = 0;
      b.vx *= 0.86; b.vz *= 0.86;
    }
    if (!inBounds(b.x, b.z) && b.y < 4) { outOfBounds(m); return; }
    if (b.noPick && m.time < b.noPick) return;
    const cands = [];
    for (let k = 0; k < 10; k++) {
      const q = m.p[k];
      if (Math.hypot(q.x - b.x, q.z - b.z) < 2.0 && b.y < reach(m, k)) cands.push(k);
    }
    if (cands.length) {
      let tot = 0; const w = cands.map((k) => { const v = R(m, k).reb + 0.35 + (m.p[k].y > 0.3 ? 0.4 : 0); tot += v; return v; });
      let x = rnd(m) * tot, k = 0;
      while (x > w[k]) { x -= w[k]; k++; }
      const who = cands[Math.min(k, cands.length - 1)];
      const fromShot = b.fromShot;
      b.fromShot = false;
      gainBall(m, who, fromShot ? 'reb' : 'loose');
      if (m.phase === 'ft') { m.phase = 'live'; m.ft = null; }
    }
  }
}

function resolveShot(m) {
  const b = m.ball, s = b.shot, t = s.team;
  const shooter = s.by, r = R(m, shooter);
  if (s.make) {
    score(m, t, s.pts, shooter);
    if (s.type === 'ft') r.st.ftm++;
    else {
      r.st.fgm++; if (s.three) r.st.tpm++;
      if (b.lastPasser >= 0 && m.p[b.lastPasser].t === t && b.lastPasser !== shooter && m.time - b.passAt < 4.5) R(m, b.lastPasser).st.ast++;
    }
    say(m, 'swish', { three: s.three, type: s.type, t });
    b.state = 'net'; b.vx = b.vz = 0; b.vy = -6; b.x = rimFor(m.dir[t]); b.z = 25; b.y = 9.6; b.netT = 0;
    b.lastTouch = t;
    m.ball.shot = null;
    if (s.type === 'ft') return afterFT(m, true, s.last);
    m.clock.shotOff = m.clock.shotOff; // unchanged
    if (s.foul) { foulCall(m, s.foul.by, shooter, 'shoot'); m.pend = { k: 'ft', i: shooter, n: 1, delay: 1.0 }; m.phase = 'dead'; say(m, 'andone', { i: shooter }); return; }
    if (m.buzzerPending) { m.pend = { k: 'qend', delay: 0.9 }; return; }
    m.pend = { k: 'inbound', team: 1 - t, kind: 'base', delay: 0.55 };
    return;
  }
  // miss
  b.shot = null;
  if (s.type === 'ft') {
    say(m, 'rim', {});
    if (!s.last) { b.state = 'net'; b.vy = 5; return afterFT(m, false, false); }
  }
  if (s.airball) {
    b.state = 'loose'; b.fromShot = true; b.land = predictLand(b);
    say(m, 'airball', {});
  } else {
    const away = Math.atan2(b.z - 25, b.x - rimFor(m.dir[t]));
    const ang = away + (rnd(m) - 0.5) * 2.2;
    const sp = 5 + rnd(m) * 8;
    b.vx = Math.cos(ang) * sp; b.vz = Math.sin(ang) * sp * 1.4; b.vy = 6 + rnd(m) * 7;
    b.state = 'loose'; b.fromShot = true; b.noPick = m.time + 0.12; b.land = predictLand(b);
    say(m, 'rim', { hard: sp > 9 });
    if (m.poss === t) resetShot(m); // rim hit resets the shot clock
  }
  if (s.type === 'ft') { // last free throw missed: ball is live
    m.phase = 'live'; m.ft = null; m.clock.running = m.clock.t > 0;
    if (m.clock.t <= 0) { m.phase = 'dead'; m.pend = { k: 'qend', delay: 0.9 }; }
    return;
  }
  if (s.foul) { foulCall(m, s.foul.by, shooter, 'shoot'); b.state = 'dead'; m.pend = { k: 'ft', i: shooter, n: s.foul.fts, delay: 0.9 }; m.phase = 'dead'; return; }
  if (m.buzzerPending) { m.pend = { k: 'qend', delay: 0.9 }; }
}

function afterFT(m, made, wasLast) {
  const ft = m.ft;
  if (!ft) return;
  if (made) ft.made++;
  ft.left--;
  if (ft.left > 0) { m.pend = { k: 'ftnext', delay: 0.8 }; return; }
  // last one made: other team inbounds from the baseline
  m.ft = null;
  if (m.clock.t <= 0) { m.pend = { k: 'qend', delay: 0.8 }; return; }
  m.pend = { k: 'inbound', team: 1 - ft.team, kind: 'base', delay: 0.6 };
}

function outOfBounds(m) {
  const b = m.ball;
  const team = 1 - b.lastTouch;
  say(m, 'whistle', { why: 'oob' }); log(m, `out of bounds, ${m.teams[team].abbr} ball`);
  b.state = 'dead'; b.holder = -1;
  m.clock.running = false; m.phase = 'dead';
  if (m.buzzerPending || m.clock.t <= 0) { m.pend = { k: 'qend', delay: 0.8 }; return; }
  m.pend = { k: 'inbound', team, kind: 'side', x: b.x, delay: 0.7 };
}

function clockTick(m) {
  const c = m.clock;
  // safety net: time is up and nothing is pending (e.g. a loose ball after the horn)
  if (c.t <= 0 && !m.pend && !m.buzzerPending && m.ball.state !== 'shot' && !['qend', 'final', 'tipoff', 'ft'].includes(m.phase)) {
    c.running = false; m.phase = 'dead'; m.pend = { k: 'qend', delay: 0.4 }; return;
  }
  if (!c.running || m.phase === 'final' || m.phase === 'qend') return;
  c.t -= DT;
  if (!c.shotOff) {
    if (c.t < c.shot) c.shotOff = true;
    else c.shot -= DT;
  }
  if (c.t <= 0) {
    c.t = 0; c.running = false;
    say(m, 'buzzer', {}); log(m, `end of Q${c.q}`);
    if (m.ball.state === 'shot') { m.buzzerPending = true; return; } // a shot in the air still counts
    if (m.phase === 'ft' || (m.pend && m.pend.k === 'ft')) { m.buzzerPending = true; return; } // fouled at the horn: shoot them
    m.phase = 'dead';
    m.pend = { k: 'qend', delay: 0.4 };
    return;
  }
  if (!c.shotOff && c.shot <= 0 && m.phase === 'live') {
    c.shot = 0;
    if (!['held', 'pass', 'loose'].includes(m.ball.state)) return; // a shot in the air is judged at the rim
    say(m, 'whistle', { why: 'shotclock' }); log(m, `shot-clock violation ${m.teams[m.poss].abbr}`);
    m.scVio[m.poss]++;
    const h = m.ball.holder;
    if (h >= 0) R(m, h).st.to++;
    m.clock.running = false; m.phase = 'dead';
    m.pend = { k: 'inbound', team: 1 - m.poss, kind: 'side', x: m.ball.x, delay: 0.7 };
    m.ball.state = 'dead'; m.ball.holder = -1;
  }
}

// Jump into a game situation (challenges): quarter, clock, score and who inbounds.
export function startAt(m, { q, t, score, poss }) {
  m.clock.q = q; m.clock.t = t;
  m.teams[0].score = score[0]; m.teams[1].score = score[1];
  if (q >= 3) m.dir = [-1, 1];
  m.arrow = 1 - poss; m.possAt = 0;
  m.startScore = score.slice();
  setupInbound(m, poss, 'side', 47);
}

// ---------------------------------------------------------------- helpers for hooks and tests
export function forceShot(m, i, q) {
  const p = m.p[i];
  p.forceQ = q;
  if (!startShot(m, i)) { p.forceQ = null; return false; }
  p.relAt = SWEET;
  return true;
}
export function give(m, i) {
  m.phase = 'live'; m.pend = null; m.ft = null; m.inb = null;
  gainBall(m, i, 'give');
  if (m.user.team === m.p[i].t) m.user.ctrl = i;
  m.clock.running = m.clock.t > 0;
}
export function commitFoul(m, defTeam, kind = 'reach') {
  const h = m.ball.holder;
  const off = h >= 0 ? h : (1 - defTeam) * 5;
  const nd = nearestDef(m, m.p[off].x, m.p[off].z, m.p[off].t);
  foulCall(m, nd.idx, off, kind);
  if (kind === 'shoot') { m.pend = { k: 'ft', i: off, n: 2, delay: 0.5 }; m.phase = 'dead'; m.ball.state = 'dead'; m.ball.holder = -1; }
}
export function boxScore(m) {
  return m.teams.map((T) => T.roster.map((r) => ({ num: r.num, name: `${r.first} ${r.last}`, pos: r.pos, ...r.st, min: Math.round(r.st.sec / 60 * 10) / 10 })));
}
export function topPerformer(m, t) {
  const T = m.teams[t];
  let best = T.roster[0], bs = -1;
  for (const r of T.roster) { const s = r.st.pts + r.st.reb * 0.8 + r.st.ast * 0.9 + r.st.stl + r.st.blk; if (s > bs) { bs = s; best = r; } }
  return best;
}
export function summary(m) {
  return {
    mode: m.mode, phase: m.phase, q: m.clock.q, t: +m.clock.t.toFixed(2), shot: +m.clock.shot.toFixed(2), shotOff: m.clock.shotOff, running: m.clock.running,
    poss: m.poss, score: [m.teams[0].score, m.teams[1].score], winner: m.winner, dir: m.dir, arrow: m.arrow, venue: m.venue, crowd: +m.crowd.toFixed(2), crowdTeam: m.crowdTeam,
    rules: m.rules, difficulty: m.difficulty, breakReady: m.breakReady, program: m.program,
    teams: m.teams.map((T) => ({ key: T.key, name: T.name, abbr: T.abbr, isUser: T.isUser, tf: T.tf, kit: T.kit, onCourt: T.onCourt.slice(), fictional: T.fictional })),
    ball: { state: m.ball.state, holder: m.ball.holder, x: +m.ball.x.toFixed(2), y: +m.ball.y.toFixed(2), z: +m.ball.z.toFixed(2), shot: m.ball.shot ? { type: m.ball.shot.type, make: m.ball.shot.make, three: m.ball.shot.three, q: m.ball.shot.q, label: m.ball.shot.label } : null },
    user: { team: m.user.team, ctrl: m.user.ctrl, auto: m.user.auto, meterLabel: m.user.meterLabel },
    players: m.p.map((p) => { const r = m.teams[p.t].roster[p.r]; return { i: p.idx, t: p.t, slot: p.slot, num: r.num, name: `${r.first} ${r.last}`, x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), act: p.act, pf: r.st.pf, energy: +r.energy.toFixed(2), meter: +(p.meter || 0).toFixed(3) }; }),
    ft: m.ft ? { by: m.ft.by, team: m.ft.team, left: m.ft.left, total: m.ft.total, made: m.ft.made, state: m.ft.state, mv: +m.ft.mv.toFixed(3), label: m.ft.label } : null,
    inb: m.inb ? { team: m.inb.team, kind: m.inb.kind, by: m.inb.by, recv: m.inb.recv, ready: m.inb.ready } : null,
    stats: boxScore(m), log: m.log.slice(-25), scVio: m.scVio, pend: m.pend ? m.pend.k : null,
  };
}
