// Boot, fixed-step loop, scenes, season and challenge flow, saves, and the window.__game test hooks.
import { COUNTY, team, kitFor, banners, FACTS_LIST, FINALS } from './data.js';
import { makeRoster, fullName } from './roster.js';
import { COURT, rimFor } from './court.js';
import { DT, createMatch, tick, startNextPeriod, summary, forceShot, give, commitFoul, topPerformer, startAt } from './sim.js';
import { createSeason, teamFor, nextGame, recordResult, simCurrent } from './season.js';
import { createShootout, shootoutTick, forceShootoutShot, SPOTS } from './shootout.js';
import { challenge } from './challenges.js';
import { R, initRender, resize, draw, pop, burst, shake, netHit, rimHit, confetti } from './render.js';
import { CREST_KEYS, crestURL } from './art.js';
import { I, initInput, initTouch, setEnabled, drain } from './input.js';
import { AU, unlock, play, setVolume, setOn } from './audio.js';
import { DIFF, meterQuality } from './rules.js';
import { loadSave, writeSave, store, fmtClock, hash } from './util.js';
import * as UI from './ui.js';

const $ = (s) => document.querySelector(s);
const DEFAULTS = { sound: true, vol: 0.5, motion: 'auto', text: 100, theme: 'auto', difficulty: 1, qLen: 120, shotClock: 35, assist: false, touch: 'auto' };
const state = {
  scene: 'title', stack: [], settings: { ...DEFAULTS }, season: null,
  save: { trophies: [], unlocks: { throwback: false }, best: { shootout: 0 }, challenges: {} },
  mode: null, match: null, so: null, demo: null, paused: false, showBox: false, helpTab: 'controls', seed: 0,
  pick: { program: 'girls', home: 'hot-springs', away: 'lakeside', side: 'home', school: 'hot-springs', length: 'short', throwback: false },
  chal: null, lastOpts: null, rosterView: null, busy: 0, factSeed: 1, finalShown: false,
};
const IN_PLAY = new Set(['game', 'shootout']);
const OVER_GAME = new Set(['game', 'pause', 'break', 'final', 'shootout', 'shootoutEnd', 'champion']);

// ---------------------------------------------------------------- saves
function persist() {
  writeSave({ v: 1, settings: state.settings, season: state.season, trophies: state.save.trophies, unlocks: state.save.unlocks, best: state.save.best, challenges: state.save.challenges });
}
function restore() {
  const s = loadSave();
  if (!s || s.v !== 1) return;
  Object.assign(state.settings, s.settings || {});
  state.season = s.season || null;
  state.save.trophies = s.trophies || [];
  state.save.unlocks = { throwback: false, ...(s.unlocks || {}) };
  state.save.best = { shootout: 0, ...(s.best || {}) };
  state.save.challenges = s.challenges || {};
  if (state.season) { state.pick.school = state.season.school; state.pick.program = state.season.program; }
}

// ---------------------------------------------------------------- settings application
const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
const reducedMotion = () => state.settings.motion === 'on' || (state.settings.motion === 'auto' && mq('(prefers-reduced-motion: reduce)'));
const touchOn = () => state.settings.touch === 'on' || (state.settings.touch === 'auto' && (mq('(pointer: coarse)') || (navigator.maxTouchPoints || 0) > 0));
function applySettings() {
  const s = state.settings;
  document.documentElement.style.fontSize = `${s.text}%`;
  const dark = s.theme === 'dark' || (s.theme === 'auto' && mq('(prefers-color-scheme: dark)'));
  document.body.classList.toggle('theme-dark', dark);
  document.body.classList.toggle('theme-light', !dark);
  document.body.classList.toggle('reduced', reducedMotion());
  R.reduced = reducedMotion();
  setOn(s.sound); setVolume(s.vol);
}

// ---------------------------------------------------------------- match setup
function makeSide(key, program, cls, side, throwback, seed) {
  const t = teamFor(key, program, cls, seed);
  return { ...t, kit: kitFor(t, side, throwback) };
}
function startMatch(o) {
  const program = o.program || 'boys';
  const seed = o.seed ?? (state.seed || (Date.now() & 0xffff));
  const rosterSeed = o.rosterSeed ?? 1;
  const home = makeSide(o.home, program, o.cls, 'home', !!o.throwHome, rosterSeed);
  const away = makeSide(o.away, program, o.cls, 'away', !!o.throwAway, rosterSeed);
  if (home.kit.light === away.kit.light) { // throwback clash: the other team flips
    if (o.throwHome) away.kit = { ...kitFor(away, 'home'), light: true };
    else home.kit = { ...kitFor(home, 'away'), light: false };
  }
  const user = o.user === 'away' ? 1 : o.user === 'none' ? -1 : 0;
  const venue = o.venue || 'home';
  const crowd = venue === 'arena' && user >= 0 && !(user === 0 ? home.fictional : away.fictional) ? user : -1;
  const m = createMatch({
    mode: o.mode, home, away, program, seed, user, venue, crowd,
    rules: { qLen: o.qLen ?? state.settings.qLen, shotClock: o.shotClock ?? state.settings.shotClock },
    difficulty: o.difficulty ?? state.settings.difficulty, assist: state.settings.assist, autoBreak: !!o.autoBreak,
  });
  if (o.start) startAt(m, { ...o.start, poss: o.start.poss === 'user' ? Math.max(0, user) : o.start.poss === 'opp' ? 1 - Math.max(0, user) : o.start.poss });
  m.venueInfo = { kind: venue, homeKey: o.home, awayKey: o.away, pennants: venue === 'home' ? banners(o.home, program) : [] };
  m.maxAllowed = o.maxAllowed ?? null;
  R.snap = true;
  return m;
}
function venueOf(m) {
  return { kind: m.venueInfo.kind, home: m.teams[0], away: m.teams[1], pennants: m.venueInfo.pennants };
}

function newExhibition(o = {}) {
  const p = state.pick;
  const opts = {
    mode: 'exhibition', home: o.home || p.home, away: o.away || p.away, program: o.program || p.program, user: o.user || p.side,
    qLen: o.qLen, shotClock: o.shotClock, difficulty: o.difficulty, venue: o.venue || 'home', seed: o.seed,
    throwHome: (o.home || p.home) === 'hot-springs' && (o.throwback ?? p.throwback) && state.save.unlocks.throwback,
    throwAway: (o.away || p.away) === 'hot-springs' && (o.throwback ?? p.throwback) && state.save.unlocks.throwback,
  };
  state.lastOpts = opts;
  state.mode = 'exhibition';
  state.match = startMatch(opts);
  enterGame();
}

function enterGame() {
  state.paused = false; state.finalShown = false; state.showBox = false;
  state.factSeed = (state.match.seed || 1) + 3;
  go('game', false);
}

// ---------------------------------------------------------------- season flow
function startSeason(o = {}) {
  const p = state.pick;
  state.season = createSeason({ school: o.school || p.school, program: o.program || p.program, length: o.length || p.length, seed: o.seed ?? (state.seed || (Date.now() & 0xfff)) });
  persist();
  go('hub', false);
}
function playSeasonGame(o = {}) {
  const S = state.season, g = nextGame(S);
  if (!g) return;
  const homeKey = g.home ? S.school : g.opp, awayKey = g.home ? g.opp : S.school;
  const tb = state.save.unlocks.throwback && state.pick.throwback && S.school === 'hot-springs';
  state.mode = 'season';
  state.match = startMatch({ mode: 'season', home: homeKey, away: awayKey, program: S.program, cls: S.cls, user: g.home ? 'home' : 'away', venue: g.arena ? 'arena' : 'home', rosterSeed: S.seed, seed: o.seed ?? hash(`${S.school}${S.w}${S.l}${S.seed}`), throwHome: tb && g.home, throwAway: tb && !g.home });
  enterGame();
}
function finishSeasonGame() {
  const m = state.match, S = state.season, ut = m.user.team;
  const wasFinal = S.phase === 'bracket' && S.bracket.round === 2;
  recordResult(S, m.teams[ut].score, m.teams[1 - ut].score);
  if (S.champion && wasFinal) {
    state.save.trophies.push({ school: S.school, program: S.program, cls: S.cls, label: `Season ${state.save.trophies.length + 1} state champions`, record: `${S.w}-${S.l}` });
  }
  persist();
}

// ---------------------------------------------------------------- challenges
function startChallenge(id, program, stepIdx = 0) {
  const c = challenge(id);
  const step = c.steps[stepIdx];
  const prog = step.program || program || c.program || 'boys';
  state.chal = { id, program: prog, step: stepIdx };
  state.mode = 'challenge';
  state.match = startMatch({
    mode: 'challenge', home: c.school, away: step.opp, program: prog, cls: team(c.school).cls, user: 'home', venue: c.venue, qLen: c.qLen, shotClock: c.shotClock ?? 35,
    start: step.start, throwHome: !!step.throwback, maxAllowed: step.maxAllowed, seed: state.seed || hash(id + stepIdx),
  });
  enterGame();
}
function challengeResult() {
  const m = state.match, c = challenge(state.chal.id), step = c.steps[state.chal.step];
  const ut = m.user.team;
  let ok = m.winner === ut;
  let note = '';
  if (ok && step.maxAllowed != null) {
    const allowed = m.teams[1 - ut].score - (m.startScore ? m.startScore[1 - ut] : 0);
    ok = allowed <= step.maxAllowed;
    note = `You allowed ${allowed} point${allowed === 1 ? '' : 's'} (goal: ${step.maxAllowed} or fewer).`;
  }
  const more = ok && state.chal.step + 1 < c.steps.length;
  if (ok && !more) {
    state.save.challenges[c.id] = true;
    if (c.unlock) state.save.unlocks[c.unlock] = true;
    persist();
  }
  return { ok, more, note, c };
}

// ---------------------------------------------------------------- shootout
function startShootout(o = {}) {
  const p = state.pick;
  const key = o.school || p.school, program = o.program || p.program;
  const t = teamFor(key, program, null, 1);
  state.mode = 'shootout';
  state.so = createShootout({ team: t, roster: t.roster, kit: kitFor(t, 'home'), seed: o.seed ?? (state.seed || (Date.now() & 0xffff)), difficulty: state.settings.difficulty, assist: state.settings.assist });
  state.paused = false;
  go('shootout', false);
}

// ---------------------------------------------------------------- scenes
function go(name, push = true) {
  if (push && state.scene !== name) state.stack.push(state.scene);
  state.scene = name;
  render();
}
function back() {
  const prev = state.stack.pop() || 'title';
  state.scene = prev;
  render();
}

function screenHTML() {
  const st = { ...state, settings: state.settings, save: state.save, mode: state.mode };
  const m = state.match;
  switch (state.scene) {
    case 'title': return UI.titleScreen(st);
    case 'select': return UI.selectScreen(st);
    case 'seasonSetup': return UI.seasonSetupScreen(st);
    case 'hub': return state.season ? UI.hubScreen(st, UI.pickFact(state.season.w * 3 + state.season.l * 7 + state.season.seed)) : UI.titleScreen(st);
    case 'roster': { const rv = state.rosterView; return UI.rosterScreen(st, rv.key, rv.program, makeRoster(rv.key, rv.program, rv.cls, rv.seed)); }
    case 'bracket': return state.season && state.season.bracket ? UI.bracketScreen(st) : '';
    case 'pause': return m ? UI.pauseScreen(st, m, state.showBox) : '';
    case 'break': return m ? UI.breakScreen(m, UI.pickFact(state.factSeed + m.clock.q)) : '';
    case 'final': return m ? finalHTML(st) : '';
    case 'champion': return UI.championScreen(st);
    case 'shootoutSetup': return UI.shootoutSetupScreen(st);
    case 'shootoutEnd': return UI.shootoutEndScreen(st, state.so, state.so && state.so.newBest);
    case 'challenges': return UI.challengesScreen(st);
    case 'trophies': return UI.trophiesScreen(st);
    case 'help': return UI.helpScreen(st, state.helpTab);
    case 'settings': return UI.settingsScreen(st, store.ok);
    default: return '';
  }
}
function finalHTML(st) {
  const m = state.match;
  const tops = [0, 1].map((t) => { const r = topPerformer(m, t); return { team: m.teams[t].short, num: r.num, name: fullName(r), pts: r.st.pts, reb: r.st.reb, ast: r.st.ast }; });
  let extra = '';
  if (state.mode === 'challenge' && state.chalResult) {
    const cr = state.chalResult;
    extra = `<section class="card ${cr.ok ? 'ok' : 'bad'}"><h3>${cr.ok ? (cr.more ? 'Step complete' : 'Challenge complete!') : 'Challenge not completed'}</h3><p>${UI.esc(cr.note || (cr.ok ? (cr.more ? 'One down. The next final is up.' : cr.c.unlock ? 'You unlocked the 1912-style throwback kit.' : 'Saved to your Trophy Room.') : 'Give it another try.'))}</p></section>`;
  }
  if (state.mode === 'season' && state.season) {
    const S = state.season;
    extra = `<p class="fine">Season record now ${S.w}-${S.l}.</p>`;
  }
  return UI.finalScreen(st, m, tops, extra);
}

function render() {
  const sc = state.scene;
  document.body.dataset.scene = sc;
  const scr = $('#screen');
  const html = screenHTML();
  const overlay = !IN_PLAY.has(sc);
  scr.hidden = !overlay;
  if (overlay) {
    scr.innerHTML = html;
    scr.classList.remove('enter'); void scr.offsetWidth; scr.classList.add('enter');
    state.busy = reducedMotion() ? 0 : performance.now() + 220;
    const f = scr.querySelector('.btn.primary:not([disabled])') || scr.querySelector('button');
    if (f) f.focus({ preventScroll: true });
    scr.scrollTop = 0;
  }
  const showSB = OVER_GAME.has(sc) && (state.match || state.so);
  $('#sb').hidden = !showSB;
  $('#b-pause').hidden = !IN_PLAY.has(sc);
  $('#pad').hidden = !(IN_PLAY.has(sc) && touchOn());
  $('#pad').classList.toggle('so', sc === 'shootout');
  setEnabled(IN_PLAY.has(sc));
  if (sc === 'title') ensureDemo();
  layout();
  if (sc === 'champion' && !state.confettiShown) { state.confettiShown = true; play('win'); confetti(['#D4A017', '#F4F1EA', team(state.season.school).colors.primary, team(state.season.school).colors.secondary]); }
  if (sc !== 'champion') state.confettiShown = false;
  updateScoreboard(true);
  wantLoop();
}

// ---------------------------------------------------------------- loop
let raf = 0, last = 0, acc = 0;
function loopNeeded() {
  if (IN_PLAY.has(state.scene) && !state.paused) return true;
  if (state.scene === 'title' && state.demo && !reducedMotion()) return true;
  if (state.scene === 'champion' && !reducedMotion()) return true;
  return false;
}
function wantLoop() {
  if (loopNeeded()) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  else drawFrame(0);
}
function frame(ts) {
  raf = 0;
  const dt = Math.min(0.25, Math.max(0, (ts - last) / 1000)); last = ts;
  if (!state.paused) { acc += dt; let n = 0; while (acc >= DT && n < 30) { stepOnce(); acc -= DT; n++; } if (n >= 30) acc = 0; }
  drawFrame(dt);
  if (loopNeeded()) raf = requestAnimationFrame(frame);
}

function activeMatch() { return state.scene === 'title' ? state.demo : state.match; }

function stepOnce() {
  const sc = state.scene;
  if (sc === 'title' && state.demo) {
    const d = state.demo;
    tick(d); d.ev.length = 0;
    if (d.phase === 'final' && d.phaseT > 3) state.demo = null, ensureDemo();
    return;
  }
  if (sc === 'shootout' && state.so) {
    drain(state.so.input);
    shootoutTick(state.so);
    soEvents(state.so);
    if (state.so.phase === 'end' && state.so.phaseT > 0.8) endShootout();
    return;
  }
  const m = state.match;
  if (!m || sc !== 'game') return;
  drain(m.input);
  tick(m);
  matchEvents(m);
  if (m.phase === 'qend' && m.breakReady && !m.autoBreak) { state.paused = true; go('break', false); }
  else if (m.phase === 'final' && m.phaseT > 1.4 && !state.finalShown) onFinal();
}

function onFinal() {
  const m = state.match;
  state.finalShown = true; state.paused = true;
  const ut = m.user.team;
  if (ut >= 0) play(m.winner === ut ? 'win' : 'groan');
  announce(`Final: ${m.teams[0].short} ${m.teams[0].score}, ${m.teams[1].short} ${m.teams[1].score}.`);
  if (state.mode === 'season') finishSeasonGame();
  if (state.mode === 'challenge') state.chalResult = challengeResult();
  go('final', false);
}

function endShootout() {
  const so = state.so;
  if (state.scene !== 'shootout') return;
  so.newBest = so.score > (state.save.best.shootout || 0);
  if (so.newBest) { state.save.best.shootout = so.score; persist(); }
  play(so.newBest ? 'win' : 'buzzer');
  announce(`Time. ${so.score} points.`);
  go('shootoutEnd', false);
}

// ---------------------------------------------------------------- events → sound, effects, announcements
function rimSide(x) { return x > COURT.L / 2 ? 1 : 0; }
const WHY = { shotclock: 'SHOT CLOCK', oob: 'OUT OF BOUNDS', reach: 'FOUL', shoot: 'SHOOTING FOUL', '5sec': '5 SECONDS' };
function matchEvents(m) {
  for (const e of m.ev) {
    switch (e.k) {
      case 'score': {
        const side = rimSide(rimFor(m.dir[e.t]));
        pop(`+${e.pts}`, COURT.rimX[side], 11.5, 25, '#FFF6E0', e.pts === 3);
        if (e.pts === 3) burst('steam', COURT.rimX[side], 10, 25, 10, ['#fff']);
        play('cheer', { big: e.pts === 3 || m.teams[e.t].isUser });
        announce(`${m.teams[e.t].short} scores ${e.pts}. ${m.teams[0].short} ${m.teams[0].score}, ${m.teams[1].short} ${m.teams[1].score}.`);
        break;
      }
      case 'swish': netHit(rimSide(m.ball.x)); play('swish'); if (e.type === 'dunk') shake(0.6); break;
      case 'rim': rimHit(rimSide(m.ball.x)); play('rim', e); break;
      case 'bounce': play('bounce'); break;
      case 'floor': play('floor'); break;
      case 'whistle': play('whistle'); if (WHY[e.why]) pop(WHY[e.why], m.ball.x, 8, m.ball.z, '#FFB4A8'); if (e.why === 'shotclock') announce('Shot-clock violation.'); break;
      case 'buzzer': play('buzzer'); break;
      case 'steal': pop('STEAL!', m.p[e.i].x, 7, m.p[e.i].z, '#FFD84D'); play('steal'); break;
      case 'block': pop('BLOCKED!', m.p[e.i].x, 9, m.p[e.i].z, '#FFD84D'); play('block'); shake(0.4); break;
      case 'andone': pop('AND ONE!', m.p[e.i].x, 8, m.p[e.i].z, '#5FD38A', true); break;
      case 'fouledout': pop('FOULED OUT', m.ball.x, 8, m.ball.z, '#FFB4A8'); announce('A player has fouled out.'); break;
      case 'tip': play('squeak'); break;
      case 'airball': pop('AIRBALL', m.ball.x, 6, m.ball.z, '#FFB4A8'); break;
      case 'qend': announce(m.clock.q === 2 ? 'Halftime.' : `End of quarter ${m.clock.q}.`); break;
      case 'period': announce(m.clock.q > 4 ? 'Overtime.' : `Quarter ${m.clock.q}.`); break;
      default: break;
    }
  }
  m.ev.length = 0;
}
function soEvents(so) {
  for (const e of so.ev) {
    if (e.k === 'make') { pop(e.mult > 1 ? `+${e.pts} x${e.mult}` : `+${e.pts}`, e.x, 11.5, e.z, e.mult > 1 ? '#FFD84D' : '#FFF6E0', e.mult > 1); netHit(1); play('swish'); if (e.mult > 1) burst('steam', e.x, 10, e.z, 8, ['#fff']); }
    if (e.k === 'miss') { rimHit(1); play('rim'); }
    if (e.k === 'start') play('buzzer');
  }
  so.ev.length = 0;
}

const live = () => $('#live');
let lastAnnounce = '';
function announce(t) { if (t === lastAnnounce) t += ' '; lastAnnounce = t; const el = live(); if (el) el.textContent = t; }

// ---------------------------------------------------------------- drawing
function drawFrame(dt) {
  const sc = state.scene;
  if (state.so && (sc === 'shootout' || sc === 'shootoutEnd')) return drawShootout(dt);
  const m = activeMatch();
  if (m && (OVER_GAME.has(sc) || sc === 'title')) return drawMatch(m, dt);
  // menus: a quiet court of the relevant school behind the panel
  const key = state.season && (sc === 'hub' || sc === 'bracket' || sc === 'roster') ? state.season.school : state.pick.home || 'hot-springs';
  const t = team(key);
  const venue = { kind: sc === 'bracket' ? 'arena' : 'home', home: t, away: team(state.pick.away === key ? 'lakeside' : state.pick.away), pennants: banners(key, (state.season && state.season.program) || state.pick.program) };
  draw({ venue, dt, camX: 47, players: [] });
  updateScoreboard();
}

function drawMatch(m, dt) {
  const ut = m.user.team;
  const players = m.p.map((pl) => {
    const T = m.teams[pl.t];
    const r = T.roster[pl.r];
    pl.hasBall = m.ball.holder === pl.idx; pl.defending = m.poss !== pl.t && m.phase === 'live';
    return { pl, r, kit: T.kit, home: pl.t === 0, user: ut >= 0 && !m.user.auto && m.user.ctrl === pl.idx && state.scene !== 'title' };
  });
  let camX = m.ball.x + (m.phase === 'live' ? m.dir[m.poss] * 5 : 0);
  if (m.ball.state === 'shot' && m.ball.shot) { const d = m.dir[m.ball.shot.team]; camX = (m.ball.x + rimFor(d) - d * 6) / 2; }
  if (m.phase === 'ft' && m.ft) camX = rimFor(m.dir[m.ft.team]) - m.dir[m.ft.team] * 10;
  if (m.phase === 'tipoff') camX = 47;
  let meter = null, ftMeter = null, offscreen = null;
  if (ut >= 0 && !m.user.auto && state.scene !== 'title') {
    const c = m.p[m.user.ctrl];
    if (c) {
      const r = m.teams[c.t].roster[c.r];
      const shooting = (c.act === 'shoot' || c.act === 'layup') && m.ball.holder === c.idx;
      const scale = (DIFF[m.difficulty] || DIFF[1]).win * (m.assist ? 1.5 : 1) * (m.crowdTeam === ut && m.crowd > 0.6 ? 1.3 : 1);
      if (shooting || m.user.meterLabelT > 0) meter = { x: c.x, z: c.z, y: c.y, h: r.height / 12, v: shooting ? c.meter : 0, win: 0.05 * scale * (c.stype === 'jumper' ? 1 : 1.6), label: m.user.meterLabelT > 0 ? m.user.meterLabel : null };
      offscreen = { x: c.x, z: c.z };
    }
    if (m.phase === 'ft' && m.ft && m.ft.state === 'aim') {
      const s = m.p[m.ft.by];
      ftMeter = { x: s.x, z: s.z, y: 9, mv: m.ft.mv, scale: m.assist ? 1.5 : 1, label: m.ft.label, n: m.ft.total - m.ft.left + 1, total: m.ft.total, user: m.ft.team === ut };
    }
  }
  draw({ m, venue: venueOf(m), dt, camX, players, ball: m.ball, meter, ftMeter, offscreen });
  updateScoreboard();
}

function drawShootout(dt) {
  const so = state.so;
  const players = [{ pl: so.sh, r: so.r, kit: so.kit, home: true, user: true }];
  const scale = (DIFF[so.difficulty] || DIFF[1]).win * (so.assist ? 1.5 : 1);
  const meter = so.sh.act === 'shoot' && so.ball.state === 'held' ? { x: so.sh.x, z: so.sh.z, y: so.sh.y, h: so.r.height / 12, v: so.sh.meter, win: 0.05 * scale, label: null }
    : so.labelT > 0 ? { x: so.sh.x, z: so.sh.z, y: so.sh.y, h: so.r.height / 12, v: 0, win: 0.05 * scale, label: so.label } : null;
  const venue = { kind: 'home', home: so.team, away: so.team, pennants: banners(so.team.key, so.r.id.includes('girls') ? 'girls' : 'boys') };
  draw({ venue, dt, camX: R.v && R.v.portrait ? (so.sh.x + COURT.rimX[1]) / 2 - 2 : COURT.rimX[1] - 14, players, ball: so.ball, meter });
  updateScoreboard();
}

// ---------------------------------------------------------------- scoreboard
let sbCache = '';
function updateScoreboard(force) {
  const sb = $('#sb');
  if (sb.hidden) return;
  const sc = state.scene;
  let html;
  if (state.so && (sc === 'shootout' || sc === 'shootoutEnd')) {
    const so = state.so;
    const gauge = Math.min(6, so.streak);
    html = `<div class="sb-team"><span class="sb-name">${UI.esc(so.team.abbr)}</span><span class="sb-score" aria-label="Score">${so.score}</span></div>
      <div class="sb-mid"><span class="sb-q">HOT STREAK</span><span class="sb-clock">${so.phase === 'ready' ? 'READY' : so.t.toFixed(1)}</span><span class="sb-shot">x${so.mult}</span></div>
      <div class="sb-team"><span class="sb-name">STEAM</span><span class="gauge" role="img" aria-label="Streak ${so.streak}">${Array.from({ length: 6 }, (_, k) => `<i class="${k < gauge ? 'on' : ''}"></i>`).join('')}</span></div>`;
  } else {
    const m = state.match;
    if (!m) return;
    const q = m.clock.q <= 4 ? `Q${m.clock.q}` : m.clock.q === 5 ? 'OT' : `${m.clock.q - 4}OT`;
    const qi = Math.min(m.clock.q, 4) - 1;
    const bonus = (t) => m.teams[1 - t].tf[qi] >= m.rules.bonusAt;
    const side = (t) => {
      const T = m.teams[t];
      return `<div class="sb-team${m.poss === t && m.phase !== 'final' ? ' poss' : ''}"><img class="crest" src="${crestSrc(T)}" width="28" height="28" alt=""><span class="sb-name">${UI.esc(T.abbr)}</span><span class="sb-score">${T.score}</span>
        <span class="sb-fouls">F ${T.tf[qi]}${bonus(t) ? ' <b>BONUS</b>' : ''}</span></div>`;
    };
    const shotTxt = !m.rules.shotClock ? '' : m.clock.shotOff ? '--' : Math.ceil(Math.max(0, m.clock.shot - 0.001));
    const crowd = m.crowdTeam >= 0 ? `<span class="sb-crowd" role="img" aria-label="Home crowd ${Math.round(m.crowd * 100)} percent"><i style="width:${Math.round(m.crowd * 100)}%"></i></span>` : '';
    html = `${side(0)}<div class="sb-mid"><span class="sb-q">${q}</span><span class="sb-clock">${fmtClock(m.clock.t)}</span>${m.rules.shotClock ? `<span class="sb-shot" title="Shot clock">${shotTxt}</span>` : '<span class="sb-shot off">CLASSIC</span>'}${crowd}</div>${side(1)}`;
  }
  if (html !== sbCache || force) { sbCache = html; sb.innerHTML = html; }
}
const crestSrc = (T) => crestURL(T, 56);

// ---------------------------------------------------------------- title demo
function ensureDemo() {
  if (state.demo) return;
  const k = (Date.now() / 1000) | 0;
  const a = COUNTY[k % 7], b = COUNTY[(k + 3) % 7];
  state.demo = startMatch({ mode: 'demo', home: a.key, away: b.key, program: k % 2 ? 'girls' : 'boys', user: 'none', qLen: 60, shotClock: 35, autoBreak: true, seed: k & 0xffff, venue: 'home' });
  for (let i = 0; i < 90; i++) tick(state.demo);
  state.demo.ev.length = 0;
}

// ---------------------------------------------------------------- layout
function layout() {
  const stage = $('#stage');
  const r = stage.getBoundingClientRect();
  const w = Math.max(200, Math.floor(r.width)), h = Math.max(160, Math.floor(r.height));
  if (!R.v || R.v.W !== w || R.v.H !== h) resize(w, h);
}

// ---------------------------------------------------------------- actions
const ACT = {
  title: () => { state.stack = []; state.match = null; state.so = null; state.paused = false; go('title', false); },
  back,
  hub: () => { state.stack = []; go('hub', false); },
  select: () => go('select'),
  seasonSetup: () => go('seasonSetup'),
  continueSeason: () => { state.stack = ['title']; go('hub', false); },
  shootoutSetup: () => go('shootoutSetup'),
  challenges: () => go('challenges'),
  trophies: () => go('trophies'),
  help: () => go('help'),
  settings: () => go('settings'),
  helpTab: (a) => { state.helpTab = a; render(); },
  roster: () => { const S = state.season; state.rosterView = { key: S.school, program: S.program, cls: S.cls, seed: S.seed }; go('roster'); },
  bracket: () => go('bracket'),
  pickProgram: (a) => { state.pick.program = a; render(); },
  pickHome: (a) => { state.pick.home = a; render(); },
  pickAway: (a) => { state.pick.away = a; render(); },
  pickSide: (a) => { state.pick.side = a; render(); },
  pickSchool: (a) => { state.pick.school = a; render(); },
  pickLength: (a) => { state.pick.length = a; render(); },
  setThrow: (a) => { state.pick.throwback = a === '1'; render(); },
  setQ: (a) => setSetting('qLen', +a),
  setClock: (a) => setSetting('shotClock', +a),
  setDiff: (a) => setSetting('difficulty', +a),
  setSound: (a) => setSetting('sound', a === '1'),
  setVol: (a) => setSetting('vol', +a),
  setMotion: (a) => setSetting('motion', a),
  setText: (a) => setSetting('text', +a),
  setTheme: (a) => setSetting('theme', a),
  setAssist: (a) => setSetting('assist', a === '1'),
  setTouch: (a) => setSetting('touch', a),
  startExhibition: () => { if (state.pick.home !== state.pick.away) newExhibition(); },
  rematch: () => { state.match = startMatch({ ...state.lastOpts, seed: undefined }); enterGame(); },
  startSeason: () => startSeason(),
  playSeason: () => playSeasonGame(),
  simSeason: () => { simCurrent(state.season); persist(); if (state.season.champion) { addSimTrophy(); go('champion', false); } else render(); },
  afterSeasonGame: () => { state.match = null; if (state.season.champion && state.season.done) go('champion', false); else { state.stack = ['title']; go('hub', false); } },
  playChallenge: (a) => { const [id, prog] = a.split('|'); startChallenge(id, prog); },
  afterChallenge: () => { const cr = state.chalResult; state.chalResult = null; if (cr && cr.more) startChallenge(state.chal.id, state.chal.program, state.chal.step + 1); else { state.match = null; state.stack = ['title']; go('challenges', false); } },
  startShootout: () => startShootout(),
  resume: () => { state.paused = false; go('game', false); },
  pause: () => pauseGame(),
  toggleBox: () => { state.showBox = !state.showBox; render(); },
  quit: () => { state.match = null; state.paused = false; if (state.mode === 'season') { state.stack = ['title']; go('hub', false); } else ACT.title(); },
  continueGame: () => { const m = state.match; startNextPeriod(m); state.paused = false; go('game', false); },
};
function addSimTrophy() {
  const S = state.season;
  if (!state.save.trophies.some((t) => t.seasonSeed === S.seed && t.school === S.school)) {
    state.save.trophies.push({ school: S.school, program: S.program, cls: S.cls, label: `Season ${state.save.trophies.length + 1} state champions`, record: `${S.w}-${S.l}`, seasonSeed: S.seed });
    persist();
  }
}
function setSetting(k, v) { state.settings[k] = v; applySettings(); persist(); render(); }
function pauseGame() {
  if (state.scene === 'game') { state.paused = true; go('pause', false); }
  else if (state.scene === 'shootout') { state.paused = !state.paused; wantLoop(); }
}

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  unlock();
  play('click');
  const f = ACT[b.dataset.act];
  if (f) f(b.dataset.arg);
}

function onKey(e) {
  unlock();
  const sc = state.scene;
  if (e.code === 'KeyM' && !e.repeat) { setSetting('sound', !state.settings.sound); return true; }
  if ((e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) {
    if (sc === 'game' || sc === 'shootout') { pauseGame(); return true; }
    if (sc === 'pause') { ACT.resume(); return true; }
    if (e.code === 'Escape' && ['help', 'settings', 'roster', 'bracket'].includes(sc)) { back(); return true; }
    if (e.code === 'Escape' && ['select', 'seasonSetup', 'shootoutSetup', 'challenges', 'trophies'].includes(sc)) { ACT.title(); return true; }
  }
  return false;
}

// ---------------------------------------------------------------- boot
function boot() {
  restore();
  applySettings();
  initRender($('#cv'));
  initInput(onKey);
  initTouch($('#stick'), $('#knob'), { shoot: $('#b-shoot'), pass: $('#b-pass'), sw: $('#b-switch') });
  document.addEventListener('click', onClick);
  document.addEventListener('pointerdown', () => unlock(), { passive: true });
  $('#b-pause').addEventListener('click', () => pauseGame());
  window.addEventListener('resize', () => { layout(); wantLoop(); });
  for (const q of ['(prefers-color-scheme: dark)', '(prefers-reduced-motion: reduce)']) {
    try { window.matchMedia(q).addEventListener('change', () => { applySettings(); render(); }); } catch (e) { /* old browsers */ }
  }
  render();
  window.__game = HOOKS;
}

// ---------------------------------------------------------------- test hooks
function sumState() {
  const S = state.season;
  return {
    scene: state.scene, mode: state.mode, paused: state.paused, settings: { ...state.settings }, storageOk: store.ok,
    match: state.match ? summary(state.match) : null,
    season: S ? { school: S.school, program: S.program, cls: S.cls, length: S.length, w: S.w, l: S.l, idx: S.idx, phase: S.phase, champion: S.champion, done: S.done, eliminated: S.eliminated || null,
      games: S.games.map((g) => ({ opp: g.opp, home: g.home, month: g.month, rival: g.rival, result: g.result })), next: nextGame(S), bracket: S.bracket } : null,
    shootout: state.so ? { t: +state.so.t.toFixed(2), score: state.so.score, streak: state.so.streak, mult: state.so.mult, made: state.so.made, att: state.so.att, spot: state.so.spot, phase: state.so.phase, ball: state.so.ball.state, shooter: fullName(state.so.r) } : null,
    challenge: state.chal, chalResult: state.chalResult ? { ok: state.chalResult.ok, more: state.chalResult.more, note: state.chalResult.note } : null,
    trophies: state.save.trophies, unlocks: state.save.unlocks, best: state.save.best, challenges: state.save.challenges,
    pick: { ...state.pick }, audio: { ctx: !!AU.ctx, on: AU.on }, reduced: R.reduced, touch: touchOn(), fx: R.fx.parts.length, loop: !!raf,
    view: R.v ? { W: R.v.W, H: R.v.H, s: +R.v.s.toFixed(2), camX: +R.v.camX.toFixed(2) } : null,
    ui: { focus: document.activeElement ? (document.activeElement.dataset.act || document.activeElement.id || document.activeElement.tagName) : null },
  };
}

function stepN(n) {
  for (let i = 0; i < n; i++) stepOnce();
  drawFrame(n * DT);
  return state.match ? state.match.phase : state.so ? state.so.phase : null;
}

const HOOKS = {
  seed(n) { state.seed = n | 0; return n; },
  getState: sumState,
  setState(s) {
    if (s.settings) { Object.assign(state.settings, s.settings); applySettings(); persist(); }
    if (s.pick) Object.assign(state.pick, s.pick);
    if (s.unlocks) Object.assign(state.save.unlocks, s.unlocks);
    const m = state.match;
    if (m && s.match) {
      const x = s.match;
      if (x.q != null) m.clock.q = x.q;
      if (x.t != null) m.clock.t = x.t;
      if (x.shot != null) { m.clock.shot = x.shot; m.clock.shotOff = false; }
      if (x.score) { m.teams[0].score = x.score[0]; m.teams[1].score = x.score[1]; }
      if (x.teamFouls) { const qi = Math.min(m.clock.q, 4) - 1; m.teams[0].tf[qi] = x.teamFouls[0]; m.teams[1].tf[qi] = x.teamFouls[1]; }
      if (x.crowd != null) m.crowd = x.crowd;
      if (x.energy != null) for (const T of m.teams) for (const r of T.roster) r.energy = x.energy;
    }
    if (state.so && s.shootout) Object.assign(state.so, s.shootout);
    render();
    return true;
  },
  isIdle() { return performance.now() > state.busy; },
  step(n = 1) { return stepN(n); },
  pause() { state.paused = true; return true; },
  resume() { state.paused = false; wantLoop(); return true; },
  scene(name) {
    if (['game', 'pause', 'break', 'final'].includes(name) && !state.match) newExhibition({ seed: state.seed || 1 });
    if (name === 'hub' && !state.season) startSeason({ seed: state.seed || 1 });
    if (name === 'roster' && state.season) { const S = state.season; state.rosterView = { key: S.school, program: S.program, cls: S.cls, seed: S.seed }; }
    if (name === 'shootout' && !state.so) startShootout({ seed: state.seed || 1 });
    if (name === 'champion' && !state.season) return false;
    if (name === 'pause') state.paused = true;
    state.stack = name === 'title' ? [] : ['title'];
    go(name, false);
    return state.scene;
  },
  newGame(o = {}) {
    const mode = o.mode || 'exhibition';
    if (o.seed != null) state.seed = o.seed;
    if (mode === 'exhibition') newExhibition(o);
    else if (mode === 'season') { startSeason(o); if (o.play) playSeasonGame(); }
    else if (mode === 'challenge') startChallenge(o.challenge, o.program);
    else if (mode === 'shootout') startShootout(o);
    if (o.paused) state.paused = true;
    return sumState();
  },
  act(name, ...a) {
    const m = state.match;
    switch (name) {
      case 'autoplay': if (m) m.user.auto = !!a[0]; return true;
      case 'input': { const x = a[0] || {}; I.mx = x.mx || 0; I.mz = x.mz || 0; if (x.shoot != null) { if (x.shoot && !I.shoot) I.shootP = true; if (!x.shoot && I.shoot) I.shootR = true; I.shoot = !!x.shoot; } if (x.pass) I.passP = true; if (x.switch) I.switchP = true; return true; }
      case 'shootAt': { if (!m) return false; const h = m.ball.holder; if (h < 0) return false; return forceShot(m, h, a[0]); }
      case 'give': if (!m) return false; give(m, a[0] * 5 + a[1]); return true;
      case 'place': { if (!m) return false; const p = m.p[a[0] * 5 + a[1]]; p.x = p.tx = a[2]; p.z = p.tz = a[3]; p.vx = p.vz = 0; return true; }
      case 'foul': if (!m) return false; commitFoul(m, a[0], a[1] || 'reach'); return true;
      case 'ftStop': if (!m || !m.ft) return false; m.ft.force = a[0]; return true;
      case 'sim': if (!state.season) return false; ACT.simSeason(); return sumState().season;
      case 'finishGame': {
        if (!m) return false;
        m.user.auto = true; m.autoBreak = true;
        if (m.phase === 'qend') startNextPeriod(m);
        let n = 0;
        while (m.phase !== 'final' && n < 60 * 60 * 60) { tick(m); m.ev.length = 0; n++; }
        if (a[0] && a[0].winner != null && m.winner !== a[0].winner) { // force a result for flow tests
          const w = a[0].winner; m.teams[w].score = m.teams[1 - w].score + 2; m.winner = w;
        }
        m.user.auto = false; m.phaseT = 2;
        if (state.scene !== 'game') { state.scene = 'game'; }
        state.paused = false; stepOnce(); render();
        return summary(m);
      }
      case 'continue': if (state.scene === 'break') ACT.continueGame(); return state.scene;
      case 'shootoutShot': return state.so ? forceShootoutShot(state.so, a[0]) : false;
      case 'facts': return FACTS_LIST;
      case 'crests': return { keys: CREST_KEYS, teams: COUNTY.map((t) => ({ key: t.key, crest: t.crest, colorsConfirmed: t.colorsConfirmed, cls: t.cls, mascot: t.mascot, name: t.name, colors: t.colors })) };
      case 'banners': return banners(a[0], a[1]);
      case 'layout': {
        const rect = (s) => { const el = $(s); if (!el || el.hidden || !el.getClientRects().length) return null; const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
        return { stick: rect('#stick'), shoot: rect('#b-shoot'), pass: rect('#b-pass'), sw: rect('#b-switch'), pause: rect('#b-pause'), stage: rect('#stage'), sb: rect('#sb') };
      }
      case 'freeze': R.frozen = !!a[0]; return true;
      case 'roster': return makeRoster(a[0], a[1], a[2] || team(a[0]).cls, a[3] || 1);
      case 'storage': return store.ok;
      case 'seasonResult': if (!state.season) return false; recordResult(state.season, a[0], a[1]); if (state.season.champion) addSimTrophy(); persist(); render(); return sumState().season;
      case 'confetti': confetti(['#D4A017', '#F4F1EA', '#1F4E9C']); return true;
      case 'spots': return SPOTS;
      case 'meterQuality': return meterQuality(a[0], a[1] || 1, a[2] || 'jumper');
      default: return null;
    }
  },
};

boot();
