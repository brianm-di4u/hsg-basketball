// Boot, fixed-step loop, scenes, season and challenge flow, saves, and the window.__game test hooks.
import { COUNTY, team, kitFor, banners, FACTS_LIST, FINALS } from './data.js';
import { makeRoster, fullName } from './roster.js';
import { COURT, rimFor, sx, sy } from './court.js';
import { DT, createMatch, tick, startNextPeriod, summary, forceShot, give, commitFoul, topPerformer, startAt, cancelShot } from './sim.js';
import { createSeason, teamFor, nextGame, recordResult, simCurrent } from './season.js';
import { createShootout, shootoutTick, forceShootoutShot, cancelShootoutShot, SPOTS } from './shootout.js';
import { challenge } from './challenges.js';
import { R, initRender, resize, draw, pop, burst, shake, netHit, rimHit, confetti, is3d, setLook } from './render.js';
import { G3, load3d, pickTier, info3d, glProbe, resize3d, setTier, animCtl } from './gl/scene3d.js';
import { startHQ, hqInfo } from './gl/hq.js';
import { CREST_KEYS, crestURL } from './art.js';
import { I, initInput, initTouch, setEnabled, drain, cancelHeld } from './input.js';
import { AU, unlock, play, setVolume, setOn, setAmbience, setMusic, setMusicTrack, setScene, setPaused, setCrowd, setTension, duck, suspendAudio, audioList, audioRender } from './audio.js';
import { DIFF, meterQuality, SWEET } from './rules.js';
import { writeSave, readSaveSnapshot, resetSave, store, fmtClock, hash } from './util.js';
import { mergeSave, seasonText } from './save-policy.js';
import { ACHIEVEMENTS, BALLS, FLOORS, ballSkin, floorFinish, unlockKey, kitKey, hasAlt, cleanCareer, cleanDaily, cleanAchievements, applyGame, applyDaily, emptyCareer, newBests, earnedAchievements, earnedCosmetics, liveStreak, addDays } from './career.js';
import { dailyDeal, localDate } from './daily.js';
import * as UI from './ui.js';

const $ = (s) => document.querySelector(s);
const DEFAULTS = { sound: true, vol: 0.5, motion: 'auto', text: 100, theme: 'auto', difficulty: 1, qLen: 120, shotClock: 35, assist: false, touch: 'auto', graphics: 'auto', replays: true, ambience: true, music: true, ball: 'classic', floor: 'natural', tipsSeen: false };
const state = {
  scene: 'title', stack: [], settings: { ...DEFAULTS }, season: null,
  save: { trophies: [], unlocks: { throwback: false }, best: { shootout: 0 }, challenges: {}, career: emptyCareer(), daily: cleanDaily(null), achievements: {} },
  mode: null, match: null, so: null, demo: null, paused: false, showBox: false, helpTab: 'controls', seed: 0,
  pick: { program: 'girls', home: 'hot-springs', away: 'lakeside', side: 'home', school: 'hot-springs', length: 'short', throwback: false },
  chal: null, lastOpts: null, rosterView: null, busy: 0, factSeed: 1, finalShown: false, quitArmed: false,
};
const IN_PLAY = new Set(['game', 'shootout']);
const OVER_GAME = new Set(['game', 'pause', 'break', 'final', 'shootout', 'shootoutEnd', 'champion']);

// ---------------------------------------------------------------- saves
let seasonBase = seasonText(null), setupSeasonBase = null, setupSeason = null, saveNotice = '';
const pendingSave = { settings: {}, score: null, challenges: [], unlocks: [], trophies: [], games: [], daily: [], achievements: [], season: null };
const copy = x => JSON.parse(JSON.stringify(x));
const currentSnapshot = r => r.kind === 'current' || r.kind === 'absent';
function persist(intent = {}) {
  Object.assign(pendingSave.settings, intent.settings || {});
  if (Number.isFinite(intent.score) && intent.score >= 0) pendingSave.score = Math.max(pendingSave.score ?? 0, intent.score);
  for (const k of ['challenges', 'unlocks', 'trophies', 'games', 'daily', 'achievements']) if (intent[k]) pendingSave[k].push(...intent[k]);
  if (intent.season) pendingSave.season = { ...intent.season, value: copy(intent.season.value) };
  const read = readSaveSnapshot();
  if (!currentSnapshot(read)) {
    saveNotice = read.kind === 'invalid' ? 'The saved data could not be read safely and was left unchanged. Progress is in this tab only.' + (read.newer ? '' : ' You can reset it in Settings.') : 'Saving is unavailable. Progress is in this tab only.';
    return { saved: false, seasonConflict: false, previousBest: null };
  }
  const previousBest = read.value?.best?.shootout || 0;
  const result = mergeSave(read.value, mergeDefaults(read.value), pendingSave);
  if (!writeSave(result.value)) {
    // This new award passed the fresh whole-season check; retain it if durability fails.
    if (result.seasonAccepted) for (const award of pendingSave.season.trophies || []) {
      if (!pendingSave.trophies.some(old => seasonText(old) === seasonText(award))) pendingSave.trophies.push(copy(award));
    }
    saveNotice = 'Saving is unavailable. Progress is in this tab only.';
    return { saved: false, seasonConflict: false, previousBest };
  }
  // Failed read/write does not consume an earned intent or advance this tab's season base.
  state.settings = cleanSettings(result.value.settings);
  applySettings();
  state.save.trophies = cleanTrophies(result.value.trophies);
  state.save.unlocks = { throwback: false, ...(result.value.unlocks || {}) };
  state.save.best = { shootout: 0, ...(result.value.best || {}) };
  state.save.challenges = result.value.challenges || {};
  mirrorGrowth(result.value);
  setLook(lookOf());
  pendingSave.settings = {}; pendingSave.score = null;
  pendingSave.challenges = []; pendingSave.unlocks = []; pendingSave.trophies = [];
  pendingSave.games = []; pendingSave.daily = []; pendingSave.achievements = [];
  if (result.seasonAccepted) {
    seasonBase = seasonText(result.value.season);
    pendingSave.season = null;
  }
  if (result.seasonConflict) {
    pendingSave.season.blocked = true;
    saveNotice = 'This season changed in another tab. Its saved progress was kept. Reload to continue that season.';
  } else saveNotice = '';
  return { saved: true, seasonConflict: result.seasonConflict, seasonAccepted: result.seasonAccepted, previousBest };
}
// The career, daily record and achievements as the save holds them (a damaged field reads as empty).
function mirrorGrowth(v) {
  state.save.career = cleanCareer(v.career); state.save.daily = cleanDaily(v.daily); state.save.achievements = cleanAchievements(v.achievements);
}
// A stored save with no tipsSeen is from before the first-game tips: its next write must say seen, not take the new-player default.
function mergeDefaults(stored) {
  return stored && !(stored.settings && 'tipsSeen' in stored.settings) ? { ...DEFAULTS, tipsSeen: true } : DEFAULTS;
}
function prepareSeasonSetup() {
  const read = readSaveSnapshot();
  setupSeason = currentSnapshot(read) ? read.value?.season || null : state.season;
  setupSeasonBase = currentSnapshot(read) ? seasonText(setupSeason) : null;
}
function seasonWritable() {
  const read = readSaveSnapshot();
  const expected = pendingSave.season ? pendingSave.season.base : seasonBase;
  if (pendingSave.season?.blocked || (currentSnapshot(read) && seasonText(read.value?.season) !== expected)) {
    if (pendingSave.season) pendingSave.season.blocked = true;
    saveNotice = 'This season changed in another tab. Its saved progress was kept. Reload to continue that season.';
    render(); return false;
  }
  return true; // Memory play remains available; persist refuses any unsafe write.
}
function advanceSeason(change, awardKind) {
  if (!seasonWritable()) return false;
  const before = copy(state.season);
  change();
  const S = state.season, awards = [];
  if (S.champion && (awardKind === 'played' || (awardKind === 'sim' && !state.save.trophies.some(t => t.seasonSeed === S.seed && t.school === S.school)))) {
    const award = { school: S.school, program: S.program, cls: S.cls, label: 'Season ' + (state.save.trophies.length + 1) + ' state champions', record: S.w + '-' + S.l };
    if (awardKind === 'sim') award.seasonSeed = S.seed;
    awards.push(award); state.save.trophies.push(award);
  }
  const result = persist({ season: { base: pendingSave.season ? pendingSave.season.base : seasonBase, value: S, trophies: awards } });
  if (result.seasonConflict) { state.season = before; return false; }
  return true;
}
// Stored records are untrusted: take only values the game itself can produce, drop what it cannot use.
const SETTING_OK = {
  sound: (v) => typeof v === 'boolean', vol: (v) => [0.25, 0.5, 0.8].includes(v), motion: (v) => ['auto', 'on', 'off'].includes(v),
  text: (v) => [100, 115, 130].includes(v), theme: (v) => ['auto', 'light', 'dark'].includes(v), difficulty: (v) => [0, 1, 2].includes(v),
  qLen: (v) => [120, 240, 480].includes(v), shotClock: (v) => [0, 35].includes(v), assist: (v) => typeof v === 'boolean',
  touch: (v) => ['auto', 'on', 'off'].includes(v), graphics: (v) => ['auto', '3d', '2d'].includes(v), replays: (v) => typeof v === 'boolean', ambience: (v) => typeof v === 'boolean', music: (v) => typeof v === 'boolean',
  ball: (v) => BALLS.some((b) => b.id === v), floor: (v) => FLOORS.some((f) => f.id === v), tipsSeen: (v) => typeof v === 'boolean',
};
function cleanSettings(raw) {
  const s = raw && typeof raw === 'object' ? raw : {}, out = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (SETTING_OK[k](s[k])) out[k] = s[k];
  return out;
}
const cleanTrophies = (list) => (Array.isArray(list) ? list : []).filter((x) => x && typeof x === 'object' && typeof x.school === 'string' && team(x.school));
function goodSeason(S) {
  const known = (k) => typeof k === 'string' && !!team(k), obj = (x) => !!x && typeof x === 'object' && !Array.isArray(x), num = Number.isFinite;
  if (!obj(S) || !known(S.school) || !['boys', 'girls'].includes(S.program) || typeof S.cls !== 'string' || !['short', 'full'].includes(S.length)) return false;
  if (!['regular', 'bracket', 'done'].includes(S.phase) || ![S.seed, S.idx, S.w, S.l].every(num)) return false;
  if (!Array.isArray(S.games) || !S.games.length || S.idx < 0 || S.idx > S.games.length) return false;
  if (!S.games.every((g) => obj(g) && known(g.opp) && typeof g.month === 'string' && (g.result == null || (obj(g.result) && num(g.result.us) && num(g.result.them))))) return false;
  if (!Array.isArray(S.fictPool) || !S.fictPool.every(known)) return false;
  const B = S.bracket;
  if (B == null) return S.phase !== 'bracket';
  if (!obj(B) || !Number.isInteger(B.round) || B.round < 0 || B.round > 2 || !Array.isArray(B.seeds) || !B.seeds.every(known)) return false;
  if (!Array.isArray(B.rounds) || B.rounds.length <= B.round) return false;
  return B.rounds.every((r) => Array.isArray(r) && r.every((x) => obj(x) && known(x.a) && known(x.b) && (x.winner == null || known(x.winner))));
}
function restore() {
  try {
    const read = readSaveSnapshot();
    if (read.kind !== 'current') return;
    const s = read.value;
    const season = goodSeason(s.season) ? s.season : null; // an unusable season stays in storage untouched
    Object.assign(state.settings, cleanSettings(s.settings));
    state.season = season;
    seasonBase = seasonText(state.season);
    state.save.trophies = cleanTrophies(s.trophies);
    state.save.unlocks = { throwback: false, ...(s.unlocks || {}) };
    state.save.best = { shootout: 0, ...(s.best || {}) };
    state.save.challenges = s.challenges || {};
    mirrorGrowth(s);
    if (!(s.settings && 'tipsSeen' in s.settings)) state.settings.tipsSeen = true; // a save from before the first-game tips: not a newcomer (mergeDefaults keeps it so when it is next written)
    if (state.season) { state.pick.school = state.season.school; state.pick.program = state.season.program; }
  } catch (e) { /* unreadable record: boot with defaults */ }
}

// ---------------------------------------------------------------- settings application
const mq = (q) => { try { return window.matchMedia(q).matches; } catch (e) { return false; } };
const reducedMotion = () => state.settings.motion === 'on' || (state.settings.motion === 'auto' && mq('(prefers-reduced-motion: reduce)'));
// Auto: a touch-first device always shows the pad; a laptop with a touch screen shows it after a real touch and drops it on the next key press
let touchSeen = false;
const touchOn = () => state.settings.touch === 'on' || (state.settings.touch === 'auto' && (mq('(pointer: coarse)') || touchSeen));
function setTouchSeen(v) { if (touchSeen === v) return; touchSeen = v; $('#pad').hidden = !(IN_PLAY.has(state.scene) && touchOn()); layout(); }
function applySettings() {
  const s = state.settings;
  document.documentElement.style.fontSize = `${s.text}%`;
  const dark = s.theme !== 'light'; // the broadcast night look is the default; Day is a choice in Settings
  document.body.classList.toggle('theme-dark', dark);
  document.body.classList.toggle('theme-light', !dark);
  document.body.classList.toggle('reduced', reducedMotion());
  R.reduced = reducedMotion();
  R.use3d = s.graphics !== '2d' && !NO_GL;
  setOn(s.sound); setVolume(s.vol); setAmbience(s.ambience !== false); setMusic(s.music !== false);
  setLook(lookOf());
}
// The ball skin and court finish in use: what Settings holds, if it is unlocked (a hand-edited save pointing at a locked one gets the default).
function lookOf() {
  const s = state.settings, open = (kind, it) => !it.unlock || !!state.save.unlocks[unlockKey(kind, it.id)];
  const b = ballSkin(s.ball), f = floorFinish(s.floor);
  return { ball: open('ball', b) ? b : BALLS[0], floor: open('floor', f) ? f : FLOORS[0] };
}
const NO_GL = /[?&]gl=0\b/.test(location.search);

// The 3D view loads after the first paint: menus work at once on the classic court, then the gym fades in.
function start3d() {
  if (!R.use3d || G3.state !== 'off') return;
  const probe = glProbe();
  state.gl = { renderer: probe.renderer, software: probe.software };
  if (probe.software && state.settings.graphics !== '3d') return; // Auto: keep the classic court on software GL
  const st = $('#stage').getBoundingClientRect();
  state.busy3d = true;
  G3.onLost = () => { document.body.classList.remove('gl'); R.snap = true; R.key = ''; layout(); drawFrame(0); };
  // a restored context starts the 3D view over on a fresh canvas, after a short delay
  G3.onRestored = () => setTimeout(() => {
    if (G3.state !== 'lost') return;
    try { G3.renderer.dispose(); } catch (e) { /* already gone */ }
    if (G3.canvas) G3.canvas.remove();
    G3.state = 'off';
    start3d();
  }, 300);
  load3d($('#stage'), pickTier(st.width, st.height)).then(() => {
    state.busy3d = false;
    if (G3.state === 'ready') {
      document.body.classList.toggle('gl', is3d()); layout(); if (R.v) resize3d(R.v.W, R.v.H, window.devicePixelRatio || 1); R.snap = true;
      startHQ(G3.renderer, { tier: G3.tier, software: probe.software && state.settings.graphics !== '3d' }); // high-quality art streams in behind the lite gym
    }
    wantLoop(); drawFrame(0);
  }).catch(() => { state.busy3d = false; R.use3d = false; document.body.classList.remove('gl'); wantLoop(); drawFrame(0); }); // any 3D start-up fault leaves the classic court
}



// ---------------------------------------------------------------- first-run tips (S2-01)
// Three one-line prompts in a new player's first game, each at the moment it matters and each gone when the player does the thing
// it says (or after a few seconds). Nothing here takes input: only the Skip button and a tap on the line itself are clickable.
// tipsSeen (saved with the settings) is set when all three are done, on Skip, or when the first game ends. A save from before
// the tips existed is never a newcomer's (restore() sets it). Settings > First-game tips shows them again.
const COACH = {
  tipoff: { key: 'Press Space when the ball reaches its peak.', touch: 'Tap SHOOT when the ball reaches its peak.', secs: 6 },
  shoot: { key: 'Score more than them. Hold Space, release in the green.', touch: 'Score more than them. Hold SHOOT, release in the green.', secs: 9 },
  defend: { key: 'On defense: X steals, C switches player.', touch: 'On defense: STEAL grabs it, SWITCH changes player.', secs: 8 },
  practice: { key: 'Hold Space, release in the green.', touch: 'Hold SHOOT, release in the green.', secs: 9 }, // Hot Streak practice
};
const newCoach = () => ({ done: {}, cur: null, t: 0, practice: false });
function coachFinish(id) { const c = state.coach; if (!c || c.done[id]) return; c.done[id] = true; if (c.cur === id) setCoach(null); if (!c.practice && ['tipoff', 'shoot', 'defend'].every((k) => c.done[k])) coachSeen(); }
function coachSeen() {
  setCoach(null);
  if (state.settings.tipsSeen) return;
  state.settings.tipsSeen = true; persist({ settings: { tipsSeen: true } });
}
function setCoach(id) {
  const c = state.coach, el = $('#coach');
  if (!c || !el) return;
  if (c.cur === id) return;
  c.cur = id; c.t = 0;
  if (!id) { el.hidden = true; return; }
  const text = touchOn() ? COACH[id].touch : COACH[id].key;
  $('#coach-t').textContent = text; el.hidden = false; el.dataset.tip = id;
  announce(text);
}
function coachTick(m) {
  const c = state.coach;
  if (!c || (state.settings.tipsSeen && !c.practice) || !m || m.user.team < 0) return;
  const ut = m.user.team, held = m.ball.holder >= 0 ? m.p[m.ball.holder] : null;
  if (m.phase !== 'tipoff') coachFinish('tipoff');
  let want = null;
  if (m.phase === 'tipoff') want = 'tipoff';
  else if (m.phase === 'live' && held && held.t === ut && m.user.ctrl === held.idx && !m.user.auto) want = 'shoot';
  else if (m.phase === 'live' && held && held.t !== ut) want = 'defend';
  if (want && c.done[want]) want = null;
  if (c.cur !== want) setCoach(want); // the moment came, or it passed (the possession changed)
  if (c.cur) { c.t += DT; if (c.t >= COACH[c.cur].secs) coachFinish(c.cur); }
}
function coachInput() {
  const c = state.coach; if (!c || !c.cur) return;
  if (c.cur === 'tipoff' && I.shootP) coachFinish('tipoff');
  if (c.cur === 'shoot' && I.shootR) coachFinish('shoot');
  if (c.cur === 'defend' && (I.passP || I.switchP)) coachFinish('defend');
}
// Hot Streak practice: the shot tip until the first shot.
function coachShootout(so) {
  const c = state.coach; if (!c || !so.practice) return;
  if (!c.done.practice) { if (c.cur !== 'practice') setCoach('practice'); c.t += DT; if (so.sh.act === 'shoot' || c.t >= COACH.practice.secs) coachFinish('practice'); }
}

// ---------------------------------------------------------------- career, achievements, daily game (S3-01)
// What the user's team did in this game, tracked from the sim's events (the box score gives the totals).
const today = () => state.dateOverride || localDate();
function newTrack(m) {
  const ut = m.user.team;
  return { perfectRun: 0, perfectBest: 0, maxDef: ut >= 0 ? Math.max(0, m.teams[1 - ut].score - m.teams[ut].score) : 0, qPts: {}, skipQ: m.startScore && m.clock.t < m.rules.qLen - 0.5 ? m.clock.q : 0, bad: false };
}
function trackEvent(m, e) {
  const tr = state.track; if (!tr || m.user.team < 0) return;
  if (e.k === 'score') { const q = m.clock.q; (tr.qPts[q] || (tr.qPts[q] = [0, 0]))[e.t] += e.pts; }
  else if (e.k === 'shot' && isUserBall(m, e.i) && !m.user.auto) { tr.perfectRun = m.user.meterLabel === 'PERFECT' ? tr.perfectRun + 1 : 0; tr.perfectBest = Math.max(tr.perfectBest, tr.perfectRun); }
}
function trackScore(m) {
  const tr = state.track, ut = m.user.team; if (!tr || ut < 0) return;
  tr.maxDef = Math.max(tr.maxDef, m.teams[1 - ut].score - m.teams[ut].score);
}
function gameRecord(m, mode) {
  const ut = m.user.team, T = m.teams[ut], O = m.teams[1 - ut], tr = state.track || newTrack(m);
  const sum = (k) => T.roster.reduce((a, r) => a + r.st[k], 0);
  let shutQ = false;
  if (!tr.bad) for (let q = Math.max(1, tr.skipQ + 1); q <= Math.min(4, m.clock.q); q++) if (((tr.qPts[q] || [0, 0])[1 - ut]) === 0) shutQ = true; // a regulation quarter the other team never scored in
  return { mode, school: T.key, opp: O.key, diff: m.difficulty, win: m.winner === ut, pts: T.score, oppPts: O.score, scored: sum('pts'), threes: sum('tpm'), steals: sum('stl'), blocks: sum('blk'), reb: sum('reb'), ast: sum('ast'),
    perfect: tr.bad ? 0 : tr.perfectBest, maxDef: tr.maxDef, shutQ, champion: false };
}
// Achievements and cosmetic unlocks the save now earns, saved and shown as toasts. Returns { ach, cos, bests }.
function award(extra) {
  const sv = state.save, d = today();
  const ctx = { rec: extra.rec || null, shootout: extra.shootout ?? null, career: cleanCareer(sv.career), daily: cleanDaily(sv.daily), trophies: sv.trophies.filter((t) => !t.seasonSeed).map((t) => t.school), challenges: sv.challenges, schools: COUNTY.map((t) => t.key) };
  const ach = earnedAchievements(ctx, sv.achievements), cos = earnedCosmetics(ctx, ctx.schools).filter((k) => !sv.unlocks[k]);
  if (ach.length || cos.length) {
    for (const id of ach) sv.achievements[id] = d;
    for (const k of cos) sv.unlocks[k] = true;
    persist({ achievements: ach.map((id) => ({ id, d })), unlocks: cos });
    for (const id of ach) { const a = ACHIEVEMENTS.find((x) => x.id === id); toast('Achievement', a.name, a.how); }
    for (const k of cos) toast('Unlocked', UI.cosmeticName(k), '');
  }
  return { ach, cos, bests: [] };
}
function recordGrowth(m, champion) {
  const ut = m.user.team; if (ut < 0) return null;
  const rec = gameRecord(m, state.mode === 'daily' ? 'daily' : state.mode === 'season' ? 'season' : state.mode === 'challenge' ? 'challenge' : 'exhibition');
  rec.champion = !!champion;
  const before = cleanCareer(state.save.career), intent = { games: [rec] };
  state.save.career = cleanCareer(state.save.career); applyGame(state.save.career, rec);
  if (rec.mode === 'daily' && state.daily) {
    const d = { d: state.daily.date, margin: rec.pts - rec.oppPts, win: rec.win };
    state.save.daily = cleanDaily(state.save.daily); applyDaily(state.save.daily, d); intent.daily = [d];
  }
  persist(intent);
  const aw = award({ rec });
  aw.bests = newBests(before, rec);
  return aw;
}
// A short banner at the foot of the screen, one at a time; it never takes focus or input. The live region says it too.
const toasts = []; let toastOn = false;
function toast(kind, title, text) {
  toasts.push({ kind, title, text }); announce(`${kind}: ${title}. ${text || ''}`.trim());
  if (!toastOn) nextToast();
}
function nextToast() {
  const el = $('#toast'), t = toasts.shift();
  if (!el || !t) { toastOn = false; if (el) el.hidden = true; return; }
  toastOn = true;
  el.innerHTML = `<small>${UI.esc(t.kind)}</small><b>${UI.esc(t.title)}</b>${t.text ? `<span>${UI.esc(t.text)}</span>` : ''}`;
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
  play('achieve');
  setTimeout(() => { el.hidden = true; setTimeout(nextToast, 250); }, 3800);
}
function dailyView() {
  const date = today(), rec = cleanDaily(state.save.daily), cells = [];
  for (let i = 13; i >= 0; i--) { const d = addDays(date, -i); cells.push({ d, e: rec.days[d] || null }); }
  return { date, deal: dailyDeal(date), rec, today: rec.days[date] || null, cells };
}
function playDaily() {
  const date = today(), D = dailyDeal(date);
  state.daily = { date };
  const opts = { mode: 'exhibition', home: D.home, away: D.away, program: D.program, user: 'home', qLen: D.qLen, shotClock: 35, difficulty: D.diff, venue: 'home', seed: D.seed,
    start: D.deficit ? { q: 1, t: D.qLen, score: [0, D.deficit], poss: 'user' } : undefined };
  state.lastOpts = opts; state.mode = 'daily';
  state.match = startMatch(opts);
  enterGame();
}
function lockedLook(kind, list, id) {
  const it = list.find((x) => x.id === id);
  if (it && it.unlock && !state.save.unlocks[unlockKey(kind, id)]) { announce(`${it.name} is locked. ${it.unlock}`); return true; }
  return false;
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
  m.teams[0].gym = home.gym; m.teams[1].gym = away.gym; // the confirmed home-gym names (S4-01); the sim does not carry them
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
    throwHome: !!((o.throwback ?? p.throwback) && hasAlt(state.save.unlocks, o.home || p.home)),
    throwAway: !!((o.throwback ?? p.throwback) && hasAlt(state.save.unlocks, o.away || p.away)),
  };
  state.lastOpts = opts;
  state.mode = 'exhibition';
  state.match = startMatch(opts);
  enterGame();
}

function enterGame() {
  state.paused = false; state.finalShown = false; state.showBox = false;
  state.factSeed = (state.match.seed || 1) + 3;
  state.track = newTrack(state.match); state.awards = null;
  state.coach = state.settings.tipsSeen ? null : newCoach();
  go('game', false);
}

// ---------------------------------------------------------------- season flow
function startSeason(o = {}) {
  const read = readSaveSnapshot(), inSetup = state.scene === 'seasonSetup';
  const stored = currentSnapshot(read) ? read.value?.season || null : null;
  const actualBase = currentSnapshot(read) ? seasonText(stored) : null;
  if (inSetup && currentSnapshot(read) && ((setupSeasonBase !== null && setupSeasonBase !== actualBase) || (setupSeasonBase === null && stored !== null))) {
    setupSeason = stored; setupSeasonBase = actualBase;
    saveNotice = 'The season changed in another tab while setup was open. Review the current-season warning, then Start season again only if you want to replace it.';
    render(); return false;
  }
  const p = state.pick, before = state.season;
  state.season = createSeason({ school: o.school || p.school, program: o.program || p.program, length: o.length || p.length, seed: o.seed ?? (state.seed || (Date.now() & 0xfff)) });
  const result = persist({ season: { base: actualBase, value: state.season } });
  if (result.seasonConflict) {
    state.season = before;
    prepareSeasonSetup(); go('seasonSetup', false); return false;
  }
  go('hub', false); return true;
}
function playSeasonGame(o = {}) {
  const S = state.season, g = nextGame(S);
  if (!g) return;
  const homeKey = g.home ? S.school : g.opp, awayKey = g.home ? g.opp : S.school;
  const tb = state.pick.throwback && hasAlt(state.save.unlocks, S.school);
  state.mode = 'season';
  state.match = startMatch({ mode: 'season', home: homeKey, away: awayKey, program: S.program, cls: S.cls, user: g.home ? 'home' : 'away', venue: g.arena ? 'arena' : 'home', rosterSeed: S.seed, seed: o.seed ?? hash(`${S.school}${S.w}${S.l}${S.seed}`), throwHome: tb && g.home, throwAway: tb && !g.home });
  enterGame();
}
function finishSeasonGame() {
  const m = state.match, S = state.season, ut = m.user.team;
  const wasFinal = S.phase === 'bracket' && S.bracket.round === 2;
  advanceSeason(() => recordResult(state.season, m.teams[ut].score, m.teams[1 - ut].score), wasFinal ? 'played' : null);
  return wasFinal && !!state.season.champion;
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
    persist({ challenges: [c.id], unlocks: c.unlock ? [c.unlock] : [] });
  }
  return { ok, more, note, c };
}

// ---------------------------------------------------------------- shootout
function startShootout(o = {}) {
  state.coach = o.practice ? { ...newCoach(), practice: true } : null; state.awards = null;
  const p = state.pick;
  const key = o.school || p.school, program = o.program || p.program;
  const t = teamFor(key, program, null, 1);
  state.mode = 'shootout';
  state.so = createShootout({ team: t, roster: t.roster, kit: kitFor(t, 'home'), seed: o.seed ?? (state.seed || (Date.now() & 0xffff)), difficulty: state.settings.difficulty, assist: state.settings.assist, length: o.practice ? 30 : 60 });
  state.so.practice = !!o.practice;
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
  const st = { ...state, settings: state.settings, save: state.save, mode: state.mode, dailyStreak: liveStreak(state.save.daily, today()) };
  const m = state.match;
  switch (state.scene) {
    case 'title': return UI.titleScreen(st);
    case 'select': return UI.selectScreen(st);
    case 'seasonSetup': return UI.seasonSetupScreen({ ...st, season: setupSeason });
    case 'hub': return state.season ? UI.hubScreen(st, UI.pickFact(state.season.w * 3 + state.season.l * 7 + state.season.seed)) : UI.titleScreen(st);
    case 'roster': { const rv = state.rosterView; return UI.rosterScreen(st, rv.key, rv.program, makeRoster(rv.key, rv.program, rv.cls, rv.seed)); }
    case 'bracket': return state.season && state.season.bracket ? UI.bracketScreen(st) : '';
    case 'pause': return m ? UI.pauseScreen(st, m, state.showBox) : '';
    case 'break': return m ? UI.breakScreen(m, UI.pickFact(state.factSeed + m.clock.q)) : '';
    case 'final': return m ? finalHTML(st) : '';
    case 'champion': return UI.championScreen(st);
    case 'shootoutSetup': return UI.shootoutSetupScreen(st);
    case 'shootoutEnd': return UI.shootoutEndScreen(st, state.so, state.so && state.so.newBest, UI.awardsCard(state.awards));
    case 'challenges': return UI.challengesScreen(st);
    case 'daily': return UI.dailyScreen(st, dailyView());
    case 'trophies': return UI.trophiesScreen(st);
    case 'help': return UI.helpScreen(st, state.helpTab);
    case 'settings': return UI.settingsScreen(st, saveStatus());
    default: return '';
  }
}
// What the Settings screen says about saving: ok, unavailable (storage blocked or failing), unreadable (corrupt record) or newer (a later version's record).
function saveStatus() {
  const read = readSaveSnapshot();
  if (read.kind === 'invalid') return read.newer ? 'newer' : 'unreadable';
  return read.kind === 'unavailable' || !store.ok ? 'unavailable' : 'ok';
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
  if (state.mode === 'daily' && state.daily) {
    const e = state.save.daily.days[state.daily.date], s = liveStreak(state.save.daily, state.daily.date);
    extra = `<section class="card"><h3>Daily game</h3><p>${UI.dayLabel(state.daily.date)}: ${e && e.w ? 'won' : 'lost'}, margin ${e && e.m > 0 ? '+' : ''}${e ? e.m : 0}. Streak: <b>${s}</b> day${s === 1 ? '' : 's'}.</p></section>`;
  }
  return UI.finalScreen(st, m, tops, extra + UI.awardsCard(state.awards));
}

// the pinned footer says when more of the panel sits below it (phones, long setup screens)
function moreCue(scr) {
  const set = () => scr.classList.toggle('more', scr.scrollHeight - scr.clientHeight - scr.scrollTop > 24);
  if (!scr.dataset.cue) { scr.dataset.cue = 1; scr.addEventListener('scroll', set, { passive: true }); window.addEventListener('resize', set); }
  set();
}
function render() {
  const sc = state.scene;
  document.body.dataset.scene = sc;
  if (sc !== 'pause') state.quitArmed = false;
  const scr = $('#screen');
  const html = screenHTML();
  const overlay = !IN_PLAY.has(sc);
  scr.hidden = !overlay;
  if (overlay) {
    const notice = saveNotice ? '<p class="warn" role="status">' + UI.esc(saveNotice) + '</p>' : '';
    scr.innerHTML = notice ? html.replace(/(<div class="panel[^"]*">)/, '$1' + notice) : html;
    scr.classList.remove('enter'); void scr.offsetWidth; scr.classList.add('enter');
    moreCue(scr);
    state.busy = reducedMotion() ? 0 : performance.now() + 220;
    const f = scr.querySelector('.btn.primary:not([disabled])') || scr.querySelector('button');
    if (f) f.focus({ preventScroll: true });
    scr.scrollTop = 0;
  }
  if (!IN_PLAY.has(sc) || state.paused) { const cc = $('#coach'); if (cc) cc.hidden = true; if (state.coach) { state.coach.cur = null; state.coach.t = 0; } }
  const showSB = OVER_GAME.has(sc) && (state.match || state.so);
  syncAudio();
  $('#sb').hidden = !showSB;
  $('#b-pause').hidden = !IN_PLAY.has(sc);
  $('#pad').hidden = !(IN_PLAY.has(sc) && touchOn());
  $('#pad').classList.toggle('so', sc === 'shootout');
  setEnabled(IN_PLAY.has(sc));
  if (sc === 'title') ensureDemo();
  document.body.classList.toggle('gl', is3d());
  layout();
  if (sc === 'champion' && !state.confettiShown) { state.confettiShown = true; play('win'); duck(6, 1200); confetti(['#D4A017', '#F4F1EA', team(state.season.school).colors.primary, team(state.season.school).colors.secondary]); }
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
  try {
    const dt = Math.min(0.25, Math.max(0, (ts - last) / 1000)); last = ts;
    if (state.replay) stepReplay(dt);
    else if (!state.paused) {
      acc += dt; let n = 0; while (acc >= DT && n < 30 && !state.replay) { stepOnce(); acc -= DT; n++; } if (n >= 30) acc = 0;
      if (state.replayPending && state.match && state.match.time - state.replayPending.at > 0.7 && state.scene === 'game') startReplay();
    }
    drawFrame(dt);
  } catch (e) {
    state.paused = true; if (state.scene === 'title') state.demo = null; // stop stepping whatever failed
    fail(e);
  }
  if (loopNeeded()) raf = requestAnimationFrame(frame);
}

// A thrown error never leaves a frozen or half-switched screen: log it once and offer a way back to the menu.
let failed = false;
function fail(e) {
  if (!failed) { failed = true; try { console.error('Spa City Hoops error:', e); } catch (x) { /* no console */ } }
  const scr = $('#screen');
  if (!scr) return;
  scr.hidden = false;
  scr.innerHTML = '<div class="panel" role="alert"><h2>Something went wrong</h2><p>The game hit an unexpected problem. Your saved data is not affected.</p><nav class="menu"><button class="btn primary" data-act="recover">Return to menu</button></nav></div>';
  const b = scr.querySelector('button');
  if (b) b.focus({ preventScroll: true });
}
function onFault(ev) {
  const e = ev.reason !== undefined ? ev.reason : ev.error || ev.message;
  if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return; // media and fullscreen refusals are not game faults
  if (typeof e === 'string' && /ResizeObserver/.test(e)) return;
  fail(e);
}

// Portrait phones in 3D look down the court toward the basket the user's team attacks (it flips at halftime).
function verticalDir(m) {
  if (!m || !is3d() || !R.v || !R.v.portrait || state.scene === 'title') return 0;
  const t = m.user && m.user.team >= 0 ? m.user.team : 0;
  return m.dir[t] || 1;
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
    coachInput();
    drain(state.so.input);
    shootoutTick(state.so);
    coachShootout(state.so);
    soEvents(state.so);
    streakTension(state.so);
    crowdBed(CROWD_REST + 0.1 * ((state.so.mult || 1) - 1));
    if (state.so.phase === 'end' && state.so.phaseT > 0.8) endShootout();
    return;
  }
  const m = state.match;
  if (!m || sc !== 'game') return;
  coachInput();
  drain(m.input);
  const vd = verticalDir(m);
  if (vd) { const { mx, mz } = m.input; m.input.mx = -mz * vd; m.input.mz = mx * vd; } // screen up = toward the attacked basket
  tick(m);
  record(m);
  matchEvents(m);
  trackScore(m);
  coachTick(m);
  meterTick(m);
  tickClock(m);
  crowdBed(CROWD_REST + CROWD_HOME * (m.crowdTeam >= 0 ? m.crowd : 0.3) + CROWD_CLOSE * matchTension(m));
  if (m.phase === 'qend' && m.breakReady && !m.autoBreak) { state.paused = true; go('break', false); }
  else if (m.phase === 'final' && m.phaseT > 1.4 && !state.finalShown) onFinal();
}

function onFinal() {
  const m = state.match;
  state.finalShown = true; state.paused = true;
  if (state.coach) { coachSeen(); state.coach = null; }
  const ut = m.user.team;
  if (ut >= 0) { play(m.winner === ut ? 'win' : 'groan'); if (m.winner === ut) duck(6, 1200); }
  announce(`Final: ${m.teams[0].short} ${m.teams[0].score}, ${m.teams[1].short} ${m.teams[1].score}.`);
  let champion = false;
  if (state.mode === 'season') champion = finishSeasonGame();
  if (state.mode === 'challenge') state.chalResult = challengeResult();
  state.awards = recordGrowth(m, champion);
  go('final', false);
}

function endShootout() {
  const so = state.so;
  if (state.scene !== 'shootout') return;
  if (so.practice) { play('buzzer'); announce(`Time. ${so.made} of ${so.att} made.`); setCoach(null); go('shootoutEnd', false); return; } // practice is not scored or saved
  const memoryBest = state.save.best.shootout || 0;
  state.save.best.shootout = Math.max(memoryBest, so.score);
  const saved = persist({ score: so.score });
  so.newBest = so.score > (saved.previousBest ?? memoryBest);
  state.awards = award({ shootout: so.score });
  play(so.newBest ? 'win' : 'buzzer'); duck(6, 1200);
  announce(`Time. ${so.score} points.`);
  go('shootoutEnd', false);
}


// ---------------------------------------------------------------- replays
// The last 4 s of play are kept as light snapshots. After a three, a dunk or a buzzer-beater the sim waits
// while a half-speed replay plays from a low baseline camera. Any button skips it. Replays never start from
// the test hook step(n), only from the real-time loop.
const REC = { buf: [], max: 240 };
function record(m) {
  REC.buf.push({
    b: [m.ball.x, m.ball.y, m.ball.z, m.ball.state, m.ball.holder, m.ball.dp],
    p: m.p.map((q) => [q.x, q.z, q.y, q.vx, q.vz, q.act, q.meter, q.face, q.run, q.actT, q.stype]),
    poss: m.poss, phase: m.phase,
  });
  if (REC.buf.length > REC.max) REC.buf.shift();
}
function queueReplay(m, kind, side) {
  if (!state.settings.replays || state.mode === 'demo' || reducedMotion()) return;
  if (state.lastReplayAt != null && m.time - state.lastReplayAt < 25) return;
  state.replayPending = { at: m.time, kind, side };
}
function startReplay(speed = 0.5) {
  const m = state.match, pend = state.replayPending || { kind: 'REPLAY', side: rimSide(m.ball.x) };
  state.replayPending = null;
  if (REC.buf.length < 60) return false;
  state.lastReplayAt = m.time;
  document.body.classList.add('replay'); layout(); // the touch deck steps aside: the replay takes the full height
  state.replay = { frames: REC.buf.slice(-130), f: 0, speed, kind: pend.kind, side: pend.side }; // about 4 s at half speed
  R.snap = true;
  announce(`Replay: ${pend.kind.toLowerCase()}.`);
  return true;
}
function stepReplay(dt) {
  const rp = state.replay;
  if (I.shootP || I.passP || I.switchP) { I.shootP = I.passP = I.switchP = false; I.shootR = false; return endReplay(); }
  if (!R.frozen) rp.f += dt * 60 * rp.speed;
  if (rp.f >= rp.frames.length - 1) endReplay();
}
function endReplay() {
  state.replay = null;
  document.body.classList.remove('replay'); layout();
  G3.camOverride = null; R.snap = true; acc = 0;
}
function replayScene(m) {
  const rp = state.replay;
  const fr = rp.frames[Math.min(rp.frames.length - 1, Math.floor(rp.f))];
  const ball = { x: fr.b[0], y: fr.b[1], z: fr.b[2], state: fr.b[3], holder: fr.b[4], dp: fr.b[5] };
  const players = m.p.map((q, i) => {
    const d = fr.p[i];
    const pl = { idx: q.idx, t: q.t, x: d[0], z: d[1], y: d[2], vx: d[3], vz: d[4], act: d[5], meter: d[6], face: d[7], run: d[8], actT: d[9], stype: d[10] };
    pl.hasBall = ball.holder === q.idx; pl.defending = fr.poss !== q.t && fr.phase === 'live';
    const T = m.teams[q.t];
    return { pl, r: T.roster[q.r], kit: T.kit, home: q.t === 0, user: false };
  });
  // over the shooter's shoulder, then riding the ball to the rim
  const rx = COURT.rimX[rp.side];
  if (!rp.shooter) {
    let k = rp.frames.length - 1;
    while (k > 0 && rp.frames[k].b[3] !== 'held') k--;
    const h = rp.frames[k].b[4], sp = h >= 0 ? rp.frames[k].p[h] : [ball.x, ball.z];
    rp.shooter = { x: sp[0], z: sp[1] };
  }
  const sx0 = rp.shooter.x, sz0 = rp.shooter.z;
  const ux = sx0 - rx, uz = sz0 - 25, ul = Math.hypot(ux, uz) || 1;
  const back = 13, side = 4;
  const px = sx0 + ux / ul * back - uz / ul * side, pz = sz0 + uz / ul * back + ux / ul * side;
  const tx = ball.x * 0.3 + rx * 0.5 + sx0 * 0.2, ty = Math.max(5.5, ball.y * 0.5 + 3.5), tz = ball.z * 0.3 + 25 * 0.5 + sz0 * 0.2;
  G3.camOverride = { p: [px, 6, pz], t: [tx, ty, tz], fov: R.v && R.v.portrait ? 56 : 40, focus: [sx0, sz0] };
  return { players, ball, camX: ball.x };
}

// ---------------------------------------------------------------- events → sound, effects, announcements
function rimSide(x) { return x > COURT.L / 2 ? 1 : 0; }
// Sound follows the screen: left of the court pans left. In the portrait 3D view the court runs up the screen, so cues stay centred.
const panAt = (m, x) => (verticalDir(m) ? 0 : Math.max(-0.7, Math.min(0.7, (x / COURT.L - 0.5) * 1.4)));
const isUserBall = (m, i) => m.user.team === m.p[i].t && m.user.ctrl === i;
const mineSide = (m, t) => m.user.team < 0 || m.user.team === t;
// Crowd excitement 0..1: bumped by what happens, it settles back over a few seconds. It drives the ambience bed.
let excite = 0, meterAcc = 0.1;
const CROWD_REST = 0.22, CROWD_HOME = 0.3, CROWD_RISE = 0.55, EXCITE_TAU = 2.5; // resting level, weight of the home-crowd meter, weight of excitement, seconds to settle
const bump = (x) => { excite = Math.min(1, excite + x); };
function crowdBed(level) { excite *= Math.exp(-DT / EXCITE_TAU); setCrowd(Math.min(1, level + excite * CROWD_RISE)); }
// Which ambience bed sounds for this screen, and whether it is held (the pause card).
function syncAudio() {
  const sc = state.scene, m = state.match;
  const inMatch = m && (sc === 'game' || sc === 'pause' || sc === 'break' || sc === 'final');
  setScene(inMatch ? (m.venue === 'arena' ? 'arena' : 'gym') : sc === 'shootout' || sc === 'shootoutEnd' ? 'gym' : '');
  setPaused(sc === 'pause' || (sc === 'shootout' && state.paused));
  if (sc === 'break') { excite = 0; setCrowd(CROWD_REST + CROWD_HOME * 0.3); }
  if (!(sc === 'game' || sc === 'pause' || sc === 'shootout')) { setTension(0); tickSec = 0; }
  setMusicTrack(musicFor(sc, m));
}
// Which piece of music (music.js) goes with this screen. Live play has none: the crowd bed and the tension layers carry it.
// A won game, the champion screen and a new Hot Streak best get the fanfare; a quarter break or a lost game, the quiet arrangement.
function musicFor(sc, m) {
  if (sc === 'game' || sc === 'pause' || (sc === 'shootout' && state.so && state.so.phase !== 'end')) return '';
  if (sc === 'break') return 'breakRoom';
  if (sc === 'final') return m && (m.user.team < 0 || m.winner === m.user.team) ? 'fanfare' : 'breakRoom';
  if (sc === 'champion') return 'fanfare';
  if (sc === 'shootout') return '';
  if (sc === 'shootoutEnd') return state.so && state.so.newBest ? 'fanfare' : 'breakRoom';
  return 'pepBand';
}
// The meter ticks while the user holds a shot, faster and higher toward the top of the jump.
function meterTick(m) {
  const u = m.user, p = u.team >= 0 && u.ctrl >= 0 ? m.p[u.ctrl] : null;
  if (p && (p.act === 'shoot' || p.act === 'layup') && m.ball.holder === p.idx && !u.auto) {
    const v = Math.max(0, Math.min(1, p.meter / SWEET));
    meterAcc += DT;
    if (meterAcc >= 0.17 - 0.11 * v) { meterAcc = 0; play('meter', { p: v }); }
  } else meterAcc = 0.1;
}
// Tension. The shot clock ticks in its last five seconds (once a second, higher as it runs down); in the last minute of the
// fourth quarter or overtime a low hum rises as the clock runs down, more so the closer the score, and from 0.5 up a heartbeat
// starts. The crowd bed also lifts a little in a close late game. The Hot Streak does the same with its multiplier and its last seconds.
const TENSE_SECS = 60, TENSE_BASE = 0.15, TENSE_LATE = 0.35, CLOSE_FULL = 2, CLOSE_NONE = 10, CROWD_CLOSE = 0.2; // seconds of the late window, tension floor in a late game, extra at the start of the window, a margin this small is full closeness, one this big none, crowd lift
let tickSec = 0;
function tensionOf(m) {
  const c = m.clock;
  if (c.q < 4 || m.phase === 'final' || m.phase === 'tipoff') return 0;
  const close = Math.max(0, Math.min(1, 1 - (Math.abs(m.teams[0].score - m.teams[1].score) - CLOSE_FULL) / (CLOSE_NONE - CLOSE_FULL)));
  const late = Math.max(0, Math.min(1, 1 - c.t / TENSE_SECS));
  return (c.t < TENSE_SECS ? TENSE_LATE + (1 - TENSE_LATE) * late : TENSE_BASE) * (0.3 + 0.7 * close);
}
function tickClock(m) {
  const c = m.clock, secs = m.rules.shotClock && !c.shotOff && c.running && m.phase === 'live' ? Math.ceil(c.shot - 0.001) : 0;
  if (secs < 1 || secs > 5) { tickSec = 0; return; }
  if (secs !== tickSec) { tickSec = secs; play('tick', { p: (5 - secs) / 4, far: m.poss !== m.user.team }); }
}
function matchTension(m) {
  const T = tensionOf(m);
  setTension(T);
  return T;
}
const WHY = { shotclock: 'SHOT CLOCK', oob: 'OUT OF BOUNDS', reach: 'FOUL', shoot: 'SHOOTING FOUL', '5sec': '5 SECONDS' };
function matchEvents(m) {
  for (const e of m.ev) {
    trackEvent(m, e);
    switch (e.k) {
      case 'score': {
        const side = rimSide(rimFor(m.dir[e.t]));
        pop(`+${e.pts}`, COURT.rimX[side], 14.8, 25, '#FFF6E0', e.pts === 3); // above the backboard, never on the rim
        if (e.pts === 3) { burst('steam', COURT.rimX[side], 10, 25, 10, ['#fff']); G3.refSignal = 1.4; }
        { // your basket gets the full roar, theirs a polite murmur and a groan from your crowd; taking the lead brings the house down
          const mine = mineSide(m, e.t), pan = panAt(m, COURT.rimX[side]), diff = m.teams[0].score - m.teams[1].score, before = diff - (e.t === 0 ? e.pts : -e.pts);
          play('cheer', { big: e.pts === 3 || m.teams[e.t].isUser, mine, pan });
          if (!mine) play('groan', { pan: -pan * 0.5 });
          if (mine && before * diff < 0) play('roar', { pan: 0 });
          bump(mine ? (e.pts === 3 ? 0.8 : 0.55) : 0.3);
        }
        state.cheer = e.pts === 3 ? 1 : 0.75; state.cheerTeam = e.t; state.cheerAt = { m, t: m.time, x: rimFor(m.dir[e.t]) };
        // the sim says 'score' before 'swish' in the same tick: the shot type comes from this tick's swish
        { const sw = m.ev.find((x) => x.k === 'swish' && x.t === e.t); const lm = { ...(state.lastMake || {}), dunk: sw ? sw.type === 'dunk' : false, side: sw ? rimSide(rimFor(m.dir[e.t])) : (state.lastMake || {}).side }; if (e.pts === 3 || lm.dunk || lm.buzzer) { state.slam = { m, text: lm.buzzer ? 'BUZZER BEATER' : lm.dunk ? 'SLAM DUNK' : '3 POINTS', color: m.teams[e.t].colors.primary, sub: m.teams[e.t].short.toUpperCase(), at: m.time, side }; } if (e.pts === 3 || lm.dunk || lm.buzzer) queueReplay(m, lm.dunk ? 'DUNK' : lm.buzzer ? 'BUZZER BEATER' : 'THREE', lm.side ?? rimSide(m.ball.x)); state.lastMake = null; }
        announce(`${m.teams[e.t].short} scores ${e.pts}. ${m.teams[0].short} ${m.teams[0].score}, ${m.teams[1].short} ${m.teams[1].score}.`);
        break;
      }
      case 'swish': netHit(rimSide(m.ball.x)); play('swish', { pan: panAt(m, m.ball.x) }); if (e.type === 'dunk') shake(0.6); state.lastMake = { dunk: e.type === 'dunk', buzzer: !!(m.ball.shot && m.ball.shot.buzzer), side: rimSide(m.ball.x) }; break;
      case 'rim': rimHit(rimSide(m.ball.x)); play('rim', { hard: e.hard, v: m.ball.z < COURT.rimZ - 0.2 ? 0 : m.ball.z > COURT.rimZ + 0.2 ? 1 : 2, pan: panAt(m, m.ball.x) }); if (state.lastShot && m.time - state.lastShot < 2.5) { play('ooh', { pan: panAt(m, m.ball.x) }); bump(0.2); } break;
      case 'bounce': play('bounce', { pan: panAt(m, m.ball.x), far: e.i == null || !isUserBall(m, e.i) }); break;
      case 'floor': play('floor', { pan: panAt(m, m.ball.x) }); break;
      case 'whistle': play('whistle'); duck(5, 700); if (WHY[e.why]) pop(WHY[e.why], m.ball.x, 8, m.ball.z, '#FFB4A8'); if (e.why === 'shotclock') announce('Shot-clock violation.'); break;
      case 'buzzer': play('buzzer'); duck(6, 1000); break;
      case 'steal': pop('STEAL!', m.p[e.i].x, 7, m.p[e.i].z, '#FFD84D'); play('steal', { pan: panAt(m, m.p[e.i].x) }); bump(0.15); break;
      case 'block': pop('BLOCKED!', m.p[e.i].x, 9, m.p[e.i].z, '#FFD84D'); play('block', { pan: panAt(m, m.p[e.i].x) }); bump(0.3); shake(0.4); state.cheer = 0.6; state.cheerTeam = m.p[e.i].t; break;
      case 'andone': pop('AND ONE!', m.p[e.i].x, 8, m.p[e.i].z, '#5FD38A', true); break;
      case 'fouledout': pop('FOULED OUT', m.ball.x, 8, m.ball.z, '#FFB4A8'); announce('A player has fouled out.'); break;
      case 'tip': play('squeak'); break;
      case 'airball': pop('AIRBALL', m.ball.x, 6, m.ball.z, '#FFB4A8'); play('sigh', { pan: panAt(m, m.ball.x) }); state.lastShot = 0; break;
      case 'gather': if (isUserBall(m, e.i)) { play('meter', { p: 0 }); meterAcc = 0; } break;
      case 'shot': state.lastShot = e.three ? m.time : 0; play('release', { three: e.three, pan: panAt(m, m.p[e.i].x), far: !isUserBall(m, e.i) }); if (e.three) bump(0.25); break;
      case 'pass': play('pass', { pan: panAt(m, m.p[e.i].x), far: m.p[e.i].t !== m.user.team }); break;
      case 'catch': play('catch', { pan: panAt(m, m.p[e.i].x), far: m.p[e.i].t !== m.user.team }); break;
      case 'pump': play('fake', { pan: panAt(m, m.p[e.i].x), far: !isUserBall(m, e.i) }); break;
      case 'cross': play('cross', { pan: panAt(m, m.p[e.i].x), far: !isUserBall(m, e.i) }); if (e.fooled && isUserBall(m, e.i)) pop('CROSSED!', m.p[e.i].x, 7, m.p[e.i].z, '#8FD6C8'); break;
      case 'sprint': play('sprint', { pan: panAt(m, m.p[e.i].x) }); break;
      case 'jump': if (isUserBall(m, e.i)) play('jump', { pan: panAt(m, m.p[e.i].x) }); break;
      case 'reb': play('reb', { pan: panAt(m, m.p[e.i].x), far: m.p[e.i].t !== m.user.team }); bump(0.1); break;
      case 'sub': play('sub', { far: e.t !== m.user.team }); break;
      case 'qend': announce(m.clock.q === 2 ? 'Halftime.' : `End of quarter ${m.clock.q}.`); break;
      case 'period': announce(m.clock.q > 4 ? 'Overtime.' : `Quarter ${m.clock.q}.`); break;
      default: break;
    }
  }
  m.ev.length = 0;
}
// Hot Streak: the hum follows the multiplier (x2 a little, x3 a lot) and the last ten seconds; the clock ticks in the last five.
function streakTension(so) {
  const left = so.phase === 'end' ? 0 : so.t, secs = left > 0 && left <= 5 ? Math.ceil(left) : 0;
  if (secs && secs !== tickSec) play('tick', { p: (5 - secs) / 4 });
  tickSec = secs;
  setTension(Math.max(((so.mult || 1) - 1) * 0.3, left > 0 && left <= 10 ? 0.35 : 0) + (so.mult >= 3 && left <= 10 ? 0.15 : 0));
}
function soEvents(so) {
  for (const e of so.ev) {
    if (e.k === 'make' && e.mult > 1 && e.mult > (so.lastMult || 1)) play('streak', { p: (e.mult - 2) / 1 });
    if (e.k === 'make') so.lastMult = e.mult;
    if (e.k === 'make') { pop(e.mult > 1 ? `+${e.pts} x${e.mult}` : `+${e.pts}`, e.x, 11.5, e.z, e.mult > 1 ? '#FFD84D' : '#FFF6E0', e.mult > 1); netHit(1); play('swish', { p: Math.min(1, ((e.mult || 1) - 1) / 2) }); bump(0.3); if (e.mult > 1) burst('steam', e.x, 10, e.z, 8, ['#fff']); }
    if (e.k === 'miss') { rimHit(1); play('rim'); play('ooh'); }
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
  if (m && (OVER_GAME.has(sc) || sc === 'title') && sc !== 'champion') return drawMatch(m, dt);
  // menus: a quiet court of the relevant school behind the panel
  const key = state.season && (sc === 'hub' || sc === 'bracket' || sc === 'roster' || sc === 'champion') ? state.season.school : state.pick.home || 'hot-springs';
  const t = team(key);
  const finals = sc === 'bracket' || sc === 'champion';
  const venue = { kind: finals ? 'arena' : 'home', home: t, away: team(state.pick.away === key ? 'lakeside' : state.pick.away), pennants: banners(key, (state.season && state.season.program) || state.pick.program) };
  if (sc === 'champion' && !R.reduced) {
    // the title moment: a slow sweep of the finals arena with the crowd on its feet
    const tt = performance.now() / 1000, ang = Math.sin(tt * 0.08) * 0.7, port = R.v && R.v.portrait;
    G3.camOverride = { attract: true, p: [47 + Math.sin(ang) * (port ? 48 : 60), port ? 26 : 22, 25 + Math.cos(ang) * (port ? 48 : 60)], t: [47, port ? 3 : 5, 4], fov: port ? 62 : 40 };
  } else if (G3.camOverride && G3.camOverride.attract) { G3.camOverride = null; R.snap = true; }
  const heroes = menuHeroes(sc, key);
  draw({ venue, dt, camX: 47, camZ: 25, players: heroes, cheer: sc === 'champion' ? 1 : 0 });
  updateScoreboard();
}

// Menus on a wide screen: a fixed camera at centre court and two players in their kits either side of the panel
// (on Select: the home pick left, the away pick right, so the choice shows; at the title: champions celebrating).
// Phones keep the empty court: the panel fills the width there.
const HERO_ROSTERS = new Map();
function heroRoster(key, program) {
  const k = key + '|' + program;
  if (!HERO_ROSTERS.has(k)) HERO_ROSTERS.set(k, makeRoster(key, program, team(key).cls, 1));
  return HERO_ROSTERS.get(k);
}
function menuHeroes(sc, key) {
  if (!is3d() || R.reduced || (R.v && R.v.portrait) || !['select', 'hub', 'roster', 'champion', 'seasonSetup', 'challenges', 'trophies'].includes(sc)) return [];
  const program = (state.season && state.season.program) || state.pick.program || 'boys';
  const sides = sc === 'select' ? [[state.pick.home || key, 'home'], [state.pick.away || 'lakeside', 'away']] : [[key, 'home'], [key, 'home']];
  // (the title moment looks a little up, so the arena's standing crowd fills the frame behind the champions)
  const cam = sc === 'champion' ? { p: [47, 8.5, 43], t: [47, 4.8, 22], fov: 46 } : { p: [47, 5.4, 41.5], t: [47, 4.6, 25], fov: 40 };
  G3.camOverride = { attract: true, ...cam };
  const out = [];
  sides.forEach(([k, side], i) => {
    const T = team(k), roster = heroRoster(k, program), r = roster[i === 0 ? 0 : 2] || roster[0];
    const x = 47 + (i === 0 ? -7.6 : 7.6), z = 26.5;
    out.push({ pl: { idx: 300 + i, t: i, x, z, y: 0, vx: 0, vz: 0, act: sc === 'champion' ? 'celebrate' : i === 0 ? 'fold' : 'idle', actT: 0, meter: 0, lookAt: [47 + (i === 0 ? 2 : -2), 41.5] },
      r, kit: kitFor(T, side), home: side === 'home', user: false });
  });
  return out;
}

function drawMatch(m, dt) {
  const ut = m.user.team;
  const players = m.p.map((pl) => {
    const T = m.teams[pl.t];
    const r = T.roster[pl.r];
    pl.hasBall = m.ball.holder === pl.idx; pl.defending = m.poss !== pl.t && m.phase === 'live';
    return { pl, r, kit: T.kit, home: pl.t === 0, user: ut >= 0 && !m.user.auto && m.user.ctrl === pl.idx && state.scene !== 'title' };
  });
  // lead toward the basket being attacked; portrait phones lead further so that basket stays in frame
  let camX = m.ball.x + (m.phase === 'live' ? m.dir[m.poss] * (R.v && R.v.portrait ? 4 : is3d() ? 5 : 8) : 0); // the 3D frame sits closer to the play, so a smaller lead
  if (m.ball.state === 'shot' && m.ball.shot) { const d = m.dir[m.ball.shot.team]; camX = (m.ball.x + rimFor(d) - d * 6) / 2; }
  // in the frontcourt (and while a shot flies), keep the basket being attacked inside the frame
  if (!verticalDir(m) && (m.phase === 'live' || m.ball.state === 'shot') && m.poss >= 0) {
    const d = m.ball.state === 'shot' && m.ball.shot ? m.dir[m.ball.shot.team] : m.dir[m.poss], rim = rimFor(d);
    const reach = is3d() ? (R.v && R.v.portrait ? 9 : 14) : (R.v && R.v.portrait ? 9 : 20);
    if ((m.ball.x - COURT.L / 2) * d > 0 || m.ball.state === 'shot') camX = d > 0 ? Math.max(camX, rim - reach) : Math.min(camX, rim + reach);
  }
  // the ball outranks the rim: the 3D frame is close to the play, so never let the camera drift more than
  // 13 ft from the ball (about a third of the frame at the players' depth)
  if (is3d() && !verticalDir(m)) camX = Math.max(m.ball.x - 13, Math.min(m.ball.x + 13, camX));
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
  const cheer = state.cheer || 0; state.cheer = 0;
  if (state.replay && state.scene === 'game') {
    const rs = replayScene(m);
    draw({ m, venue: venueOf(m), dt, camX: rs.camX, camZ: rs.ball.z, players: rs.players, ball: rs.ball, cheer: 0.6, letterbox: true, banner: { text: `REPLAY · ${state.replay.kind}`, sub: touchOn() ? 'Tap a button to skip' : 'Press Space to skip' } });
    updateScoreboard();
    return;
  }
  const perfect = m.ball.state === 'shot' && m.ball.shot && m.ball.shot.label === 'PERFECT';
  const slamT = state.slam && state.slam.m === m ? (m.time - state.slam.at) / SLAM_S : -1;
  // the card fades from the moment the inbound puts the ball back in play and is gone 0.3 s later
  if (state.slam && state.slam.m === m && m.phase === 'live' && state.slam.liveAt == null && slamT > 0.05) state.slam.liveAt = m.time;
  const liveFade = state.slam && state.slam.liveAt != null ? 1 - (m.time - state.slam.liveAt) / 0.3 : 1;
  const slam = slamT >= 0 && slamT < 1 && liveFade > 0 && state.scene !== 'title' && m.ball.state !== 'shot' ? { ...state.slam, t: slamT, fade: Math.max(0, liveFade), ref: state.slam } : null;
  // title attract mode: a slow sweep around the gym (the 3D view only; reduced motion keeps the game camera)
  if (state.scene === 'title' && !R.reduced) {
    const tt = performance.now() / 1000, ang = Math.sin(tt * 0.05) * 0.85;
    G3.camOverride = { attract: true, p: [47 + Math.sin(ang) * 40, 21 + Math.sin(tt * 0.07) * 3, 25 + Math.cos(ang) * 40], t: [m.ball.x * 0.5 + 23.5, 5, 18], fov: 42 };
  } else if (G3.camOverride && G3.camOverride.attract) { G3.camOverride = null; R.snap = true; }
  draw({ m, venue: venueOf(m), dt, camX, camZ: m.ball.z, players, ball: m.ball, meter, ftMeter, offscreen, cheer, cheerTeam: state.cheerTeam, cheerAge: state.cheerAt && state.cheerAt.m === m ? m.time - state.cheerAt.t : null, cheerX: state.cheerAt ? state.cheerAt.x : null, perfect, slam, vertical: verticalDir(m) });
  updateScoreboard();
}

function drawShootout(dt) {
  const so = state.so;
  if (G3.camOverride && G3.camOverride.attract) { G3.camOverride = null; R.snap = true; }
  const players = [{ pl: so.sh, r: so.r, kit: so.kit, home: true, user: true }];
  const scale = (DIFF[so.difficulty] || DIFF[1]).win * (so.assist ? 1.5 : 1);
  const meter = so.sh.act === 'shoot' && so.ball.state === 'held' ? { x: so.sh.x, z: so.sh.z, y: so.sh.y, h: so.r.height / 12, v: so.sh.meter, win: 0.05 * scale, label: null }
    : so.labelT > 0 ? { x: so.sh.x, z: so.sh.z, y: so.sh.y, h: so.r.height / 12, v: 0, win: 0.05 * scale, label: so.label } : null;
  const venue = { kind: 'home', home: so.team, away: so.team, pennants: banners(so.team.key, so.r.id.includes('girls') ? 'girls' : 'boys') };
  const vert = is3d() ? 1 : 0; // the 3D Hot Streak camera stands behind the shooter, looking at the basket
  draw({ venue, dt, camX: vert ? (so.sh.x + COURT.rimX[1]) / 2 - 4 : R.v && R.v.portrait ? (so.sh.x + COURT.rimX[1]) / 2 - 2 : COURT.rimX[1] - 14, camZ: (so.sh.z + 25) / 2, players, ball: so.ball, meter, vertical: vert });
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
      <div class="sb-mid"><span class="sb-q">${so.practice ? 'PRACTICE' : 'HOT STREAK'}</span><span class="sb-clock">${so.phase === 'ready' ? 'READY' : so.t.toFixed(1)}</span><span class="sb-shot">x${so.mult}</span></div>
      <div class="sb-team"><span class="sb-name sb-steam">STREAK</span><span class="gauge" role="img" aria-label="Streak ${so.streak}">${Array.from({ length: 6 }, (_, k) => `<i class="${k < gauge ? 'on' : ''}"></i>`).join('')}</span></div>`;
  } else {
    const m = state.match;
    if (!m) return;
    const q = m.clock.q <= 4 ? `Q${m.clock.q}` : m.clock.q === 5 ? 'OT' : `${m.clock.q - 4}OT`;
    const qi = Math.min(m.clock.q, 4) - 1;
    const bonus = (t) => m.teams[1 - t].tf[qi] >= m.rules.bonusAt;
    const side = (t) => {
      const T = m.teams[t];
      const n = T.tf[qi];
      const lamps = Array.from({ length: 5 }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('');
      return `<div class="sb-team${m.poss === t && m.phase !== 'final' ? ' poss' : ''}"><img class="crest" src="${crestSrc(T)}" width="28" height="28" alt=""><span class="sb-name">${UI.esc(T.abbr)}</span><span class="sb-arrow" aria-hidden="true"></span><span class="sb-score">${T.score}</span>
        <span class="sb-fouls" aria-label="Team fouls ${n}"><span class="fl">FOULS</span> <span class="lamps" aria-hidden="true">${lamps}</span>${bonus(t) ? ' <b>BONUS</b>' : ''}</span></div>`;
    };
    const shotTxt = !m.rules.shotClock ? '' : m.clock.shotOff ? '--' : Math.ceil(Math.max(0, m.clock.shot - 0.001));
    const crowd = m.crowdTeam >= 0 ? `<span class="sb-crowd" role="img" aria-label="Home crowd ${Math.round(m.crowd * 100)} percent"><i style="width:${Math.round(m.crowd * 100)}%"></i></span>` : '';
    html = `${side(0)}<div class="sb-mid"><span class="sb-q">${q}</span><span class="sb-clock">${fmtClock(m.clock.t)}</span>${m.rules.shotClock ? `<span class="sb-shot" title="Shot clock">${shotTxt}</span>` : '<span class="sb-shot off">CLASSIC</span>'}${crowd}</div>${side(1)}`;
  }
  if (html !== sbCache || force) { sbCache = html; sb.innerHTML = html; sb.classList.toggle('so', !!(state.so && (sc === 'shootout' || sc === 'shootoutEnd'))); }
}
const crestSrc = (T) => crestURL(T, 56);

// ---------------------------------------------------------------- title demo
function ensureDemo() {
  if (state.demo) return;
  const k = window.__TEST__ ? state.seed || 1 : (Date.now() / 1000) | 0; // tests capture the same title every run
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
  recover: () => { try { ACT.title(); } catch (e) { location.reload(); } },
  title: () => { state.stack = []; state.match = null; state.so = null; state.paused = false; go('title', false); },
  back,
  hub: () => { state.stack = []; go('hub', false); },
  select: () => go('select'),
  seasonSetup: () => { prepareSeasonSetup(); go('seasonSetup'); },
  continueSeason: () => { state.stack = ['title']; go('hub', false); },
  shootoutSetup: () => go('shootoutSetup'),
  challenges: () => go('challenges'),
  trophies: () => go('trophies'),
  daily: () => go('daily'),
  playDaily: () => playDaily(),
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
  resetSave: () => {
    const read = readSaveSnapshot();
    if (read.kind !== 'invalid' || read.newer) return;
    if (!resetSave()) { saveNotice = 'The unreadable data could not be backed up, so it was left as it is.'; render(); return; }
    persist();
    if (saveNotice === '') saveNotice = 'Saved data was reset. A copy of the old data was kept as hsg-hoops-v1.bak.';
    render();
  },
  setSound: (a) => setSetting('sound', a === '1'),
  setVol: (a) => setSetting('vol', +a),
  setAmbience: (a) => setSetting('ambience', a === '1'),
  setMusic: (a) => setSetting('music', a === '1'),
  setBall: (a) => { if (!lockedLook('ball', BALLS, a)) setSetting('ball', a); },
  setFloor: (a) => { if (!lockedLook('floor', FLOORS, a)) setSetting('floor', a); },
  setMotion: (a) => setSetting('motion', a),
  setText: (a) => setSetting('text', +a),
  setTheme: (a) => setSetting('theme', a),
  setAssist: (a) => setSetting('assist', a === '1'),
  setTouch: (a) => setSetting('touch', a),
  setReplays: (a) => setSetting('replays', a === '1'),
  setGraphics: (a) => { setSetting('graphics', a); if (a !== '2d') start3d(); R.snap = true; drawFrame(0); },
  startExhibition: () => { if (state.pick.home !== state.pick.away) newExhibition(); },
  rematch: () => { state.match = startMatch(state.mode === 'daily' ? state.lastOpts : { ...state.lastOpts, seed: undefined }); enterGame(); }, // the daily game is the same game each time
  startSeason: () => startSeason(),
  playSeason: () => playSeasonGame(),
  simSeason: () => { if (!advanceSeason(() => simCurrent(state.season), 'sim')) return; if (state.season.champion) go('champion', false); else render(); },
  afterSeasonGame: () => { state.match = null; if (state.season.champion && state.season.done) go('champion', false); else { state.stack = ['title']; go('hub', false); } },
  playChallenge: (a) => { const [id, prog] = a.split('|'); startChallenge(id, prog); },
  afterChallenge: () => { const cr = state.chalResult; state.chalResult = null; if (cr && cr.more) startChallenge(state.chal.id, state.chal.program, state.chal.step + 1); else { state.match = null; state.stack = ['title']; go('challenges', false); } },
  startShootout: () => startShootout(),
  startPractice: () => startShootout({ practice: true }),
  setTips: (a) => { state.coach = null; setSetting('tipsSeen', a === '0'); },
  skipTips: () => { coachSeen(); state.coach = null; },
  tapTip: () => { if (state.coach && state.coach.cur) coachFinish(state.coach.cur); },
  resume: () => { state.quitArmed = false; state.paused = false; go('game', false); },
  pause: () => pauseGame(),
  toggleBox: () => { state.showBox = !state.showBox; render(); },
  quit: () => { if (!state.quitArmed) { state.quitArmed = true; render(); return; } state.quitArmed = false; state.match = null; state.paused = false; if (state.mode === 'season') { state.stack = ['title']; go('hub', false); } else ACT.title(); },
  continueGame: () => { const m = state.match; startNextPeriod(m); state.paused = false; go('game', false); },
};
function setSetting(k, v) { state.settings[k] = v; persist({ settings: { [k]: v } }); applySettings(); render(); }
function pauseGame() {
  if (state.replay) endReplay();
  if (state.scene === 'game') { state.paused = true; go('pause', false); }
  else if (state.scene === 'shootout') { state.paused = !state.paused; syncAudio(); wantLoop(); }
}

// Tab hidden, window blurred or page leaving: stop play, drop a held shot (never fire it) and quiet the audio.
function interrupt() {
  cancelHeld();
  suspendAudio();
  const sc = state.scene;
  if (sc === 'game' && state.match) { cancelShot(state.match); pauseGame(); }
  else if (sc === 'shootout' && state.so) { cancelShootoutShot(state.so); if (!state.paused) pauseGame(); }
}

function onClick(e) {
  const b = e.target.closest('[data-act]');
  if (!b || b.disabled) return;
  unlock();
  play('click');
  const f = ACT[b.dataset.act];
  try { if (f) f(b.dataset.arg); } catch (err) { fail(err); }
}

function onKey(e) {
  unlock();
  const sc = state.scene;
  if (state.replay && !e.repeat && e.code !== 'KeyM') { endReplay(); I.shootP = I.passP = I.switchP = false; return true; }
  if (e.code === 'KeyM' && !e.repeat) { setSetting('sound', !state.settings.sound); return true; }
  if ((e.code === 'KeyP' || e.code === 'Escape') && !e.repeat) {
    if (sc === 'game' || sc === 'shootout') { pauseGame(); return true; }
    if (sc === 'pause') { ACT.resume(); return true; }
    if (e.code === 'Escape' && ['help', 'settings', 'roster', 'bracket'].includes(sc)) { back(); return true; }
    if (e.code === 'Escape' && ['select', 'seasonSetup', 'shootoutSetup', 'challenges', 'trophies', 'daily'].includes(sc)) { ACT.title(); return true; }
  }
  return false;
}

// ---------------------------------------------------------------- boot
function boot() {
  restore();
  applySettings();
  initRender($('#cv'));
  initInput(onKey);
  initTouch($('#stick'), $('#knob'), { shoot: $('#b-shoot'), pass: $('#b-pass'), sw: $('#b-switch'), sprint: $('#b-sprint') });
  document.addEventListener('click', onClick);
  document.addEventListener('pointerdown', () => unlock(), { passive: true });
  $('#b-pause').addEventListener('click', () => pauseGame());
  window.addEventListener('resize', () => { layout(); wantLoop(); });
  window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') setTouchSeen(true); }, { capture: true, passive: true });
  window.addEventListener('keydown', () => setTouchSeen(false), { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
  window.addEventListener('blur', interrupt);
  window.addEventListener('pagehide', interrupt);
  window.addEventListener('error', onFault);
  window.addEventListener('unhandledrejection', onFault);
  for (const q of ['(prefers-color-scheme: dark)', '(prefers-reduced-motion: reduce)']) {
    try { window.matchMedia(q).addEventListener('change', () => { applySettings(); render(); }); } catch (e) { /* old browsers */ }
  }
  render();
  window.__game = HOOKS;
  requestAnimationFrame(() => {
    try { start3d(); } catch (e) { state.busy3d = false; R.use3d = false; document.body.classList.remove('gl'); drawFrame(0); } // the classic court stays if 3D start-up throws
  });
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
    career: state.save.career, daily: state.save.daily, achievements: state.save.achievements, awards: state.awards || null, date: today(), look: { ball: R.look.ball.id || ballSkin(state.settings.ball).id, floor: R.look.floor.id },
    replay: state.replay ? { kind: state.replay.kind, f: Math.floor(state.replay.f), n: state.replay.frames.length } : null,
    coach: state.coach ? { cur: state.coach.cur, done: { ...state.coach.done }, text: state.coach.cur ? $('#coach-t').textContent : '', practice: state.coach.practice } : null, pick: { ...state.pick }, audio: { ctx: !!AU.ctx, on: AU.on, ambience: AU.ambOn, music: AU.musOn, track: AU.kit && AU.kit.music.score && AU.music ? AU.music : '', tension: AU.tension, bed: AU.kit && AU.kit.amb.scene && AU.scene ? AU.scene : '', held: !!(AU.kit && AU.kit.held), state: AU.ctx ? AU.ctx.state : null, crowd: AU.crowd ?? null, count: { ...AU.count } }, reduced: R.reduced, touch: touchOn(), fx: R.fx.parts.length, loop: !!raf,
    view: R.v ? { W: R.v.W, H: R.v.H, s: +R.v.s.toFixed(2), camX: +R.v.camX.toFixed(2) } : null,
    gfx: { mode: is3d() ? '3d' : '2d', gl: state.gl || null, ...info3d(), hq: hqInfo() },
    hud: hudState(),
    ui: { focus: document.activeElement ? (document.activeElement.dataset.act || document.activeElement.id || document.activeElement.tagName) : null },
  };
}

// how long the big-play card stays up (s): gone before play resumes at the other end
const SLAM_S = 1.0;
// on-screen callouts, for the capture and review tests (same visibility rule as drawMatch)
function hudState() {
  const m = state.match, sl = state.slam;
  const age = sl && m && sl.m === m ? m.time - sl.at : -1;
  const live = age >= 0 && age < SLAM_S && !(sl.liveAt != null && m.time - sl.liveAt >= 0.3) && state.scene !== 'title' && m.ball.state !== 'shot';
  return { slam: live ? { text: sl.text, age: +age.toFixed(2) } : null, slamBox: live && R.slamBox ? { ...R.slamBox } : null, pops: R.fx.pops.map((p) => ({ text: p.text, age: +p.t.toFixed(2) })) };
}

function stepN(n) {
  if (state.replay) endReplay();
  for (let i = 0; i < n; i++) stepOnce();
  state.replayPending = null;
  G3.hooked = true; drawFrame(n * DT); G3.hooked = false;
  return state.match ? state.match.phase : state.so ? state.so.phase : null;
}

const HOOKS = {
  seed(n) { state.seed = n | 0; return n; },
  setDate(d) { state.dateOverride = d || null; return today(); }, // tests: pretend it is another day
  unlockAll() { // tests: every ball, court finish and kit, as an earned save would hold them
    const keys = ['throwback', ...BALLS.filter((b) => b.unlock).map((b) => unlockKey('ball', b.id)), ...FLOORS.filter((f) => f.unlock).map((f) => unlockKey('floor', f.id)), ...COUNTY.filter((t) => t.key !== 'hot-springs').map((t) => kitKey(t.key))];
    for (const k of keys) state.save.unlocks[k] = true;
    persist({ unlocks: keys }); return keys.length;
  },
  audioList,
  audioRender,
  getState: sumState,
  setState(s) {
    if (s.settings) { Object.assign(state.settings, s.settings); persist({ settings: s.settings }); applySettings(); }
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
  isIdle() {
    // also wait for any finite CSS animation (panel entries can lag behind the timer on slow devices)
    const anim = document.getAnimations ? document.getAnimations().some((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations !== Infinity) : false;
    return performance.now() > state.busy && !state.busy3d && !anim;
  },
  step(n = 1) { return stepN(n); },
  pause() { state.paused = true; return true; },
  resume() { state.paused = false; wantLoop(); return true; },
  scene(name) {
    if (name === 'seasonSetup') prepareSeasonSetup();
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
      case 'input': { const x = a[0] || {}; I.mx = x.mx || 0; I.mz = x.mz || 0; if (x.shoot != null) { if (x.shoot && !I.shoot) I.shootP = true; if (!x.shoot && I.shoot) I.shootR = true; I.shoot = !!x.shoot; } if (x.pass) I.passP = true; if (x.switch) I.switchP = true; if (x.sprint != null) { I.sprintBtn = !!x.sprint; I.sprint = !!x.sprint; } return true; }
      case 'shootAt': { if (!m) return false; const h = m.ball.holder; if (h < 0) return false; return forceShot(m, h, a[0]); }
      case 'tire': { if (!m) return false; const p = m.p[a[0] * 5 + a[1]]; m.teams[p.t].roster[p.r].energy = a[2]; return true; } // test: set a player's energy
      case 'give': if (!m) return false; give(m, a[0] * 5 + a[1]); return true;
      case 'push': { if (!m) return false; const p = m.p[a[0] * 5 + a[1]]; p.vx = a[2]; p.vz = a[3]; return true; } // test: give a placed player speed
      case 'place': { if (!m) return false; const p = m.p[a[0] * 5 + a[1]]; p.x = p.tx = a[2]; p.z = p.tz = a[3]; p.vx = p.vz = 0; return true; }
      case 'foul': if (!m) return false; commitFoul(m, a[0], a[1] || 'reach'); return true;
      case 'ftStop': if (!m || !m.ft) return false; m.ft.force = a[0]; return true;
      case 'sim': if (!state.season) return false; ACT.simSeason(); return sumState().season;
      case 'finishGame': {
        if (!m) return false;
        m.user.auto = true; m.autoBreak = true;
        if (state.track) state.track.bad = true; // events are not tracked while the hook plays the game out
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
        return { stick: rect('#stick'), shoot: rect('#b-shoot'), pass: rect('#b-pass'), sw: rect('#b-switch'), sprint: rect('#b-sprint'), pause: rect('#b-pause'), stage: rect('#stage'), sb: rect('#sb') };
      }
      case 'freeze': R.frozen = !!a[0]; return true;
      case 'project': { // court feet → stage pixels in the current view (camera-framing tests)
        const [x, z, y = 0] = a;
        if (is3d()) { const q = G3.P(x, z, y); return { x: +q.X.toFixed(1), y: +q.Y.toFixed(1), W: R.v.W, H: R.v.H }; }
        return { x: +sx(R.v, x).toFixed(1), y: +sy(R.v, z, y).toFixed(1), W: R.v.W, H: R.v.H };
      }
      case 'gfx': Object.assign(G3.flags, a[0] || {}); if (a[1]) setTier(a[1]); drawFrame(0); return { ...G3.flags, tier: G3.tier };
      case 'cam': G3.camOverride = a[0] || null; R.snap = true; drawFrame(0); return true;
      case 'anim': { const r = animCtl(a[0]); drawFrame(0); return r; } // 'proc' | 'mixer' | a lab pose { clip, t, mirror } | null
      case 'replay': { // a[2]: a fraction of the clip, or { release: n } = n ticks after the release (negative: before)
        if (!m) return false; state.replayPending = { kind: a[0] || 'THREE', side: a[1] ?? rimSide(m.ball.x) }; const ok = startReplay();
        if (ok && a[2] != null && typeof a[2] === 'object') { const fr = state.replay.frames; let k = fr.length - 1; while (k > 0 && fr[k].b[3] !== 'shot') k--; while (k > 0 && fr[k].b[3] !== 'held') k--; let k0 = k; while (k0 > 0 && fr[k0 - 1].b[3] === 'held' && fr[k0 - 1].b[4] === fr[k].b[4]) k0--; state.replay.f = Math.max(k0, Math.min(fr.length - 1, k + (a[2].release || 0))); } // never before the shooter had it
        else if (ok && a[2] != null) state.replay.f = a[2] * (state.replay.frames.length - 1);
        drawFrame(0); return ok; }
      case 'endReplay': if (state.replay) endReplay(); drawFrame(0); return true;
      case 'roster': return makeRoster(a[0], a[1], a[2] || team(a[0]).cls, a[3] || 1);
      case 'storage': return store.ok;
      case 'seasonResult': if (!state.season) return false; advanceSeason(() => recordResult(state.season, a[0], a[1]), 'sim'); render(); return sumState().season;
      case 'confetti': confetti(['#D4A017', '#F4F1EA', '#1F4E9C']); return true;
      case 'spots': return SPOTS;
      case 'meterQuality': return meterQuality(a[0], a[1] || 1, a[2] || 'jumper');
      default: return null;
    }
  },
};

try { boot(); } catch (e) { fail(e); }
