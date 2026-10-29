// Season: a county schedule (plus fictional league foes), then an 8-team state bracket for the school's class.
// Months are [inferred] from schools.json `seasons` (Nov–Mar, finals mid-March); no exact AAA dates are shown.
import { COUNTY, FICTIONAL, team, rivalry, CLASS_RANK } from './data.js';
import { makeRoster, teamRating } from './roster.js';
import { rnd, shuffle, hash } from './util.js';
import { simScore } from './rules.js';

const MONTHS = ['November', 'December', 'December', 'January', 'January', 'February', 'February', 'February'];
export const ROUNDS = ['Quarterfinal', 'Semifinal', 'State final'];
const ROUND_WHEN = ['Early March', 'March', 'Mid-March'];

// Fictional teams take the class of the bracket or league they are dropped into.
export function teamFor(key, program, cls, seed) {
  const t = team(key);
  const c = t.cls || cls;
  return { ...t, cls: c, roster: makeRoster(key, program, c, seed) };
}

export function createSeason({ school, program, length = 'short', seed = 1 }) {
  const me = team(school);
  const o = { rs: hash(`${school}|${program}|${seed}`) | 0 };
  const others = COUNTY.filter((t) => t.key !== school);
  // rivals first, then by class closeness
  others.sort((a, b) => (rivalry(school, b.key) ? 1 : 0) - (rivalry(school, a.key) ? 1 : 0) || Math.abs(CLASS_RANK[a.cls] - CLASS_RANK[me.cls]) - Math.abs(CLASS_RANK[b.cls] - CLASS_RANK[me.cls]));
  let opps = length === 'full' ? others.map((t) => t.key) : others.slice(0, 3).map((t) => t.key);
  const fict = shuffle(o, FICTIONAL.slice());
  if (length === 'full') opps = [...opps, fict[0].key, fict[1].key];
  opps = shuffle(o, opps);
  const games = opps.map((k, i) => ({
    opp: k, home: i % 2 === 0, month: length === 'full' ? MONTHS[i] : ['December', 'January', 'February'][i],
    rival: rivalry(school, k) ? rivalry(school, k).label : null, result: null,
  }));
  return { v: 1, school, program, cls: me.cls, length, seed, games, idx: 0, w: 0, l: 0, phase: 'regular', bracket: null, champion: false, done: false, fictPool: fict.slice(2).map((t) => t.key) };
}

export const nextGame = (S) => (S.phase === 'regular' ? S.games[S.idx] : S.phase === 'bracket' ? bracketGame(S) : null);

function bracketGame(S) {
  const B = S.bracket, r = B.round;
  const g = B.rounds[r].find((x) => x.a === S.school || x.b === S.school);
  if (!g || g.winner) return null;
  const opp = g.a === S.school ? g.b : g.a;
  return { opp, home: g.a === S.school, month: ROUND_WHEN[r], round: ROUNDS[r], arena: r === 2, rival: rivalry(S.school, opp) ? rivalry(S.school, opp).label : null, result: null };
}

function rating(S, key) { return teamRating(teamFor(key, S.program, S.cls, S.seed).roster); }

// Record the user's result for the current game (us/them points) and advance.
export function recordResult(S, us, them) {
  const won = us > them;
  if (S.phase === 'regular') {
    const g = S.games[S.idx];
    g.result = { us, them };
    won ? S.w++ : S.l++;
    S.idx++;
    if (S.idx >= S.games.length) startBracket(S);
    return;
  }
  if (S.phase === 'bracket') {
    const B = S.bracket, r = B.round;
    const g = B.rounds[r].find((x) => x.a === S.school || x.b === S.school);
    const aUs = g.a === S.school;
    g.score = aUs ? [us, them] : [them, us];
    g.winner = won ? S.school : (aUs ? g.b : g.a);
    won ? S.w++ : S.l++;
    // sim the rest of the round
    const o = { rs: hash(`${S.school}|${S.seed}|r${r}`) | 0 };
    for (const x of B.rounds[r]) {
      if (x.winner) continue;
      const sc = simScore(rating(S, x.a), rating(S, x.b), o, rnd);
      x.score = sc; x.winner = sc[0] > sc[1] ? x.a : x.b;
    }
    if (!won) { S.done = true; S.phase = 'done'; S.eliminated = ROUNDS[r]; return; }
    if (r === 2) { S.champion = true; S.done = true; S.phase = 'done'; return; }
    const winners = B.rounds[r].map((x) => x.winner);
    B.rounds[r + 1] = [];
    for (let k = 0; k < winners.length; k += 2) B.rounds[r + 1].push({ a: winners[k], b: winners[k + 1], score: null, winner: null });
    B.round = r + 1;
  }
}

function startBracket(S) {
  const sameClass = COUNTY.filter((t) => t.cls === S.cls).map((t) => t.key);
  const field = [...sameClass];
  for (const k of S.fictPool) { if (field.length >= 8) break; if (!field.includes(k)) field.push(k); }
  // seeding: the user's seed follows their record; the rest by rating
  const pct = S.w / Math.max(1, S.w + S.l);
  const others = field.filter((k) => k !== S.school).sort((a, b) => rating(S, b) - rating(S, a));
  const mySeed = Math.max(1, Math.min(8, Math.round(1 + (1 - pct) * 6)));
  const seeds = others.slice();
  seeds.splice(mySeed - 1, 0, S.school);
  const order = [[0, 7], [3, 4], [2, 5], [1, 6]];
  S.bracket = { round: 0, seeds, rounds: [order.map(([a, b]) => ({ a: seeds[a], b: seeds[b], seedA: a + 1, seedB: b + 1, score: null, winner: null }))] };
  S.phase = 'bracket';
}

// Sim the user's current game (returns [us, them]).
export function simCurrent(S) {
  const g = nextGame(S);
  const o = { rs: hash(`${S.school}|${S.seed}|sim|${S.w + S.l}`) | 0 };
  const mine = rating(S, S.school) + (g.home ? 1.5 : 0) + (g.arena ? 1 : 0);
  const sc = simScore(mine, rating(S, g.opp), o, rnd);
  recordResult(S, sc[0], sc[1]);
  return sc;
}
