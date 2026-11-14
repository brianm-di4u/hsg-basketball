// The growth layer (S3-01): career totals, achievements, cosmetic unlocks and the daily game's history.
// Pure data and rules with no imports, so the save code can use it. Everything here is read from an untrusted record
// (a damaged field becomes zero or empty), and every function that changes a record returns it.
const MAXN = 1e7;
const n0 = (v) => (Number.isFinite(v) ? Math.max(0, Math.min(MAXN, Math.floor(v))) : 0);
const obj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const KEY_OK = (k) => typeof k === 'string' && k.length > 0 && k.length <= 40;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------- career totals
export const BEST_KEYS = ['margin', 'pts', 'threes', 'steals', 'blocks'];
export const emptyCareer = () => ({ games: 0, wins: 0, losses: 0, pts: 0, threes: 0, steals: 0, blocks: 0, reb: 0, ast: 0, streak: 0, bestStreak: 0, best: { margin: 0, pts: 0, threes: 0, steals: 0, blocks: 0 }, bySchool: {}, byDiff: {}, byMode: {}, champs: {} });
const wl = (x) => ({ g: n0(x && x.g), w: n0(x && x.w) });
function wlMap(raw, keep) {
  const out = {};
  if (obj(raw)) for (const k of Object.keys(raw)) if (KEY_OK(k) && (!keep || keep(k)) && obj(raw[k])) out[k] = { ...wl(raw[k]), pts: n0(raw[k].pts) };
  return out;
}
export function cleanCareer(raw) {
  const c = emptyCareer(), r = obj(raw) ? raw : {};
  for (const k of ['games', 'wins', 'losses', 'pts', 'threes', 'steals', 'blocks', 'reb', 'ast', 'streak', 'bestStreak']) c[k] = n0(r[k]);
  for (const k of BEST_KEYS) c.best[k] = n0(obj(r.best) ? r.best[k] : 0);
  c.bySchool = wlMap(r.bySchool);
  c.byDiff = wlMap(r.byDiff, (k) => ['0', '1', '2'].includes(k));
  c.byMode = wlMap(r.byMode, (k) => ['exhibition', 'season', 'challenge', 'daily'].includes(k));
  if (obj(r.champs)) for (const k of Object.keys(r.champs)) if (KEY_OK(k)) c.champs[k] = n0(r.champs[k]);
  return c;
}
// One finished game of the user's team. rec: { mode, school, diff, win, pts, oppPts, threes, steals, blocks, reb, ast, champion }
export function applyGame(career, rec) {
  const c = career, win = !!rec.win;
  c.games++; if (win) { c.wins++; c.streak++; c.bestStreak = Math.max(c.bestStreak, c.streak); } else { c.losses++; c.streak = 0; }
  const scored = n0(rec.scored != null ? rec.scored : rec.pts); // points the team scored itself (a game that starts mid-way carries a head-start score in pts)
  c.pts = n0(c.pts + scored);
  for (const k of ['threes', 'steals', 'blocks', 'reb', 'ast']) c[k] = n0(c[k] + n0(rec[k]));
  const margin = n0(n0(rec.pts) - n0(rec.oppPts));
  const best = { margin: win ? margin : 0, pts: scored, threes: n0(rec.threes), steals: n0(rec.steals), blocks: n0(rec.blocks) };
  for (const k of BEST_KEYS) c.best[k] = Math.max(c.best[k], best[k]);
  const bump = (map, key) => { if (!KEY_OK(key)) return; const x = map[key] || (map[key] = { g: 0, w: 0, pts: 0 }); x.g++; if (win) x.w++; x.pts = n0(x.pts + scored); };
  bump(c.bySchool, rec.school); bump(c.byDiff, String(rec.diff)); bump(c.byMode, rec.mode);
  if (rec.champion && KEY_OK(rec.school)) c.champs[rec.school] = n0((c.champs[rec.school] || 0) + 1);
  return c;
}
// Which personal bests this game beat (not on the very first game: everything is a record then).
export function newBests(before, rec) {
  if (!before || before.games < 1) return [];
  const margin = rec.win ? n0(rec.pts) - n0(rec.oppPts) : 0;
  const now = { margin, pts: n0(rec.scored != null ? rec.scored : rec.pts), threes: n0(rec.threes), steals: n0(rec.steals), blocks: n0(rec.blocks) };
  const names = { margin: 'winning margin', pts: 'points', threes: 'threes', steals: 'steals', blocks: 'blocks' };
  return BEST_KEYS.filter((k) => now[k] > before.best[k] && now[k] > 0).map((k) => ({ k, name: names[k], value: now[k], was: before.best[k] }));
}

// ---------------------------------------------------------------- the daily game's record
export const DAILY_KEEP = 60; // days kept
export const emptyDaily = () => ({ last: '', streak: 0, bestStreak: 0, days: {} });
export function cleanDaily(raw) {
  const d = emptyDaily(), r = obj(raw) ? raw : {};
  d.last = typeof r.last === 'string' && DATE_RE.test(r.last) ? r.last : '';
  d.streak = n0(r.streak); d.bestStreak = Math.max(n0(r.bestStreak), d.streak);
  if (obj(r.days)) for (const k of Object.keys(r.days).filter((x) => DATE_RE.test(x)).sort().slice(-DAILY_KEEP)) {
    const e = r.days[k]; if (!obj(e)) continue;
    d.days[k] = { m: Number.isFinite(e.m) ? Math.max(-999, Math.min(999, Math.round(e.m))) : 0, w: e.w ? 1 : 0 };
  }
  return d;
}
const toDay = (k) => Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / 864e5;
export const addDays = (k, n) => { const d = new Date((toDay(k) + n) * 864e5); return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; };
// A finished daily game: { d: 'YYYY-MM-DD', margin, win }. The best margin of the day is kept; the streak counts days in a row.
export function applyDaily(daily, rec) {
  if (!obj(rec) || !DATE_RE.test(rec.d || '')) return daily;
  const m = Math.max(-999, Math.min(999, Math.round(rec.margin || 0)));
  const old = daily.days[rec.d];
  daily.days[rec.d] = old ? { m: Math.max(old.m, m), w: old.w || rec.win ? 1 : 0 } : { m, w: rec.win ? 1 : 0 };
  if (!daily.last) daily.streak = 1;
  else if (rec.d > daily.last) daily.streak = addDays(daily.last, 1) === rec.d ? daily.streak + 1 : 1; // an earlier date (a changed clock) leaves the streak alone
  if (!daily.last || rec.d > daily.last) daily.last = rec.d;
  daily.bestStreak = Math.max(daily.bestStreak, daily.streak);
  const keys = Object.keys(daily.days).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - DAILY_KEEP))) delete daily.days[k];
  return daily;
}
// The streak as the player sees it on a given day: still alive today or yesterday, otherwise broken.
export const liveStreak = (daily, today) => (daily.last && (daily.last === today || addDays(daily.last, 1) === today) ? daily.streak : 0);

// ---------------------------------------------------------------- achievements
// Each is checked against ctx = { rec (the game just played, or null), career, daily, trophies (played titles), challenges, shootout (a Hot Streak score or null), schools }.
// rec.maxDef = the most points the user's team trailed by, rec.perfect = the longest run of PERFECT releases, rec.shutQ = the opponent had a scoreless quarter.
const won = (c) => !!(c.rec && c.rec.win);
export const ACHIEVEMENTS = [
  { id: 'opening-tip', name: 'Opening Tip', how: 'Play a whole game.', test: (c) => !!c.rec },
  { id: 'home-court', name: 'Home Court', how: 'Win a game.', test: won },
  { id: 'steam-heat', name: 'Steam Heat', how: 'Make 3 threes in one game.', test: (c) => !!c.rec && c.rec.threes >= 3 },
  { id: 'lockdown', name: 'Lockdown', how: 'Get 5 steals in one game.', test: (c) => !!c.rec && c.rec.steals >= 5 },
  { id: 'rim-protector', name: 'Rim Protector', how: 'Block 3 shots in one game.', test: (c) => !!c.rec && c.rec.blocks >= 3 },
  { id: 'out-of-reach', name: 'Out of Reach', how: 'Win by 20 or more.', test: (c) => won(c) && c.rec.pts - c.rec.oppPts >= 20 },
  { id: 'closed-door', name: 'Closed Door', how: 'Hold the other team scoreless for a whole quarter.', test: (c) => !!c.rec && !!c.rec.shutQ },
  { id: 'in-the-green', name: 'In the Green', how: 'Release 5 shots in a row at PERFECT.', test: (c) => !!c.rec && c.rec.perfect >= 5 },
  { id: 'never-cold', name: 'Never Cold', how: 'Win after trailing by 10 or more.', test: (c) => won(c) && c.rec.maxDef >= 10 },
  { id: 'top-division', name: 'Top Division', how: 'Win a game on All-State difficulty.', test: (c) => won(c) && c.rec.diff === 2 },
  { id: 'hot-spring', name: 'Hot Spring', how: 'Score 40 points in Hot Streak.', test: (c) => c.shootout != null && c.shootout >= 40 },
  { id: 'daily-week', name: 'Week at the Springs', how: 'Play the daily game 7 days in a row.', test: (c) => c.daily.bestStreak >= 7 },
  { id: 'ten-wins', name: 'Ten Wins', how: 'Win 10 games.', test: (c) => c.career.wins >= 10 },
  { id: 'state-champs', name: 'State Champions', how: 'Win a state final.', test: (c) => c.trophies.length > 0 || !!(c.rec && c.rec.champion) },
  { id: 'seven-banners', name: 'Seven Banners', how: 'Win a state final with every one of the seven county schools.', test: (c) => c.schools.length > 0 && c.schools.every((k) => c.trophies.includes(k) || (c.rec && c.rec.champion && c.rec.school === k)) },
];

// ---------------------------------------------------------------- cosmetics (colour and finish variants drawn in code)
// kind 'ball' | 'floor' | 'kit'. Locked for everyone until earned; `test` reads the career. A kit is a school's "Heritage" strip.
export const BALLS = [
  { id: 'classic', name: 'Classic', base: '#D9662A', seam: '#1C120C' },
  { id: 'steam', name: 'Steam White', base: '#EFE6CF', seam: '#8A5A12', unlock: 'Play your first game.', test: (c) => c.career.games >= 1 },
  { id: 'midnight', name: 'Midnight', base: '#1F2B54', seam: '#E2BE48', unlock: 'Win 10 games.', test: (c) => c.career.wins >= 10 },
];
export const FLOORS = [
  { id: 'natural', name: 'Natural maple', wood: '#C9965A', tint: null },
  { id: 'amber', name: 'Bathhouse amber', wood: '#D9A04A', tint: '#FFD79A', unlock: 'Win your first game.', test: (c) => c.career.wins >= 1 },
  { id: 'slate', name: 'Slate ash', wood: '#A9A59A', tint: '#C5C9D2', unlock: 'Win a state final.', test: (c) => c.trophies.length > 0 || Object.keys(c.career.champs).length > 0 },
];
export const KIT_WINS = 3; // wins with a school for its Heritage kit
export const ballSkin = (id) => BALLS.find((b) => b.id === id) || BALLS[0];
export const floorFinish = (id) => FLOORS.find((f) => f.id === id) || FLOORS[0];
// The unlock key a cosmetic is stored under in save.unlocks.
export const unlockKey = (kind, id) => `${kind}:${id}`;
export const kitKey = (school) => unlockKey('kit', school);
// Everything whose condition is met by this career, as unlock keys (the caller keeps only the new ones).
export function earnedCosmetics(ctx, schools) {
  const out = [];
  for (const b of BALLS) if (b.test && b.test(ctx)) out.push(unlockKey('ball', b.id));
  for (const f of FLOORS) if (f.test && f.test(ctx)) out.push(unlockKey('floor', f.id));
  for (const k of schools) if (k !== 'hot-springs' && ctx.career.bySchool[k] && ctx.career.bySchool[k].w >= KIT_WINS) out.push(kitKey(k));
  return out;
}
export const earnedAchievements = (ctx, have) => ACHIEVEMENTS.filter((a) => !have[a.id] && a.test(ctx)).map((a) => a.id);
export function cleanAchievements(raw) {
  const out = {};
  if (obj(raw)) for (const a of ACHIEVEMENTS) if (typeof raw[a.id] === 'string' && DATE_RE.test(raw[a.id])) out[a.id] = raw[a.id];
  return out;
}
// Does this school have an alternate strip the player has earned? Hot Springs' is the 1912-style throwback (a Banner Challenge); the others are Heritage kits.
export const hasAlt = (unlocks, key) => !!(unlocks && (key === 'hot-springs' ? unlocks.throwback : unlocks[kitKey(key)]));
