#!/usr/bin/env node
// Plays N full AI-vs-AI games with the real rules engine in Node and reports score and stat sanity.
// Fails (exit 1) if any game does not finish, a team is held scoreless, or totals are implausible.
//   node tools/balance.mjs [games=50] [qLenSeconds=120]
//   node tools/balance.mjs --diff [games=60] [qLenSeconds=120]
// --diff plays the player's side on auto against each difficulty at three levels of timing skill, then each Banner Challenge, and checks the
// results against TARGETS below: Rookie easier than Varsity, Varsity easier than All-State, win rates inside a band for each tier, and no
// challenge a certain win or a certain loss. Exit 1 if a target is missed. Seeded, so a rerun gives the same numbers.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = path.resolve(here, '..');
globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
const imp = (f) => import(pathToFileURL(path.join(game, 'src/js', f)).href);
const { COUNTY, kitFor, team: teamByKey } = await imp('data.js');
const { makeRoster } = await imp('roster.js');
const { createMatch, tick, boxScore, startAt } = await imp('sim.js');
const { teamFor } = await imp('season.js');
const rules = await imp('rules.js');
const { CHALLENGES } = await imp('challenges.js');

const args = process.argv.slice(2), sweep = args.includes('--diff');
const nums = args.filter((a) => !a.startsWith('--'));
const N = +(nums[0] || (sweep ? 60 : 50)), qLen = +(nums[1] || 120);
// What each difficulty is meant to deliver (S3-11). A "steady" player's timing spread is 58 ms (0.08 of the meter), a "casual" one's 101 ms and a
// "sharp" one's 25 ms. Bands are the win percent for the player's side; they are wide enough for the noise of the games played, so the ordering
// check (a harder tier costs the same player margin) is the one that matters if a tier is retuned.
const SKILL = { sharp: 0.035, steady: 0.08, casual: 0.14 };
const TARGETS = {
  steady: { Rookie: [62, 95], Varsity: [45, 85], 'All-State': [15, 55] },
  casual: { Rookie: [50, 90], Varsity: [28, 65], 'All-State': [10, 45] },
  ladder: 0.5, // a harder tier must cost the same player at least this many points of mean margin
  challenge: [1, 95], // a challenge for a steady player on Varsity: won now and then, never a gift. The auto side does not foul or chase threes, so Lady Trojans Five (down 6 with 2:00 left) reads low for it
};
const sideOf = (key, program, cls, side) => { const t = teamFor(key, program, cls, 1); return { ...t, kit: kitFor(t, side) }; };
function playerGame(g, diff, sd, o) {
  rules.TEAM_AI.sd = sd / (rules.DIFF[diff].win * (rules.HUMAN_WINDOW || 1)); // the auto side shoots with the spread a human of that skill has through this tier's window (and the player's own window factor, S1-02)
  const m = createMatch({ mode: 'demo', home: sideOf(o.home, o.program, o.cls, 'home'), away: sideOf(o.away, o.program, o.cls, 'away'), program: o.program, rules: { qLen, shotClock: o.shotClock ?? 35 }, seed: 5000 + g, user: 0, difficulty: diff, autoBreak: true });
  m.user.auto = true;
  if (o.start) startAt(m, { ...o.start, poss: o.start.poss === 'user' ? 0 : o.start.poss === 'opp' ? 1 : o.start.poss });
  const before = m.teams[1].score;
  let ticks = 0;
  while (m.phase !== 'final' && ticks < 60 * (qLen * 4 + 900) * 3) { tick(m); ticks++; m.ev.length = 0; }
  const us = m.teams[0].score, them = m.teams[1].score;
  return { win: us > them && (o.maxAllowed == null || them - before <= o.maxAllowed), margin: us - them, done: m.phase === 'final' };
}
const cell = (rows) => ({ win: Math.round(100 * rows.filter((r) => r.win).length / rows.length), margin: +(rows.reduce((x, r) => x + r.margin, 0) / rows.length).toFixed(1), unfinished: rows.filter((r) => !r.done).length });
if (sweep) {
  const t0 = Date.now(), bad = [], margins = {};
  const keys = COUNTY.map((t) => t.key);
  const pair = (g) => ({ home: keys[0], away: keys[(g % 6) + 1], program: g % 2 ? 'girls' : 'boys', cls: COUNTY[0].cls });
  for (const [skill, sd] of Object.entries(SKILL)) {
    for (let d = 0; d < 3; d++) {
      const name = rules.DIFF[d].name, c = cell(Array.from({ length: N }, (_, g) => playerGame(g, d, sd, pair(g))));
      margins[skill + d] = c.margin;
      const band = TARGETS[skill] && TARGETS[skill][name];
      const miss = c.unfinished || (band && (c.win < band[0] || c.win > band[1]));
      console.log(`${skill.padEnd(7)} ${name.padEnd(9)} win ${String(c.win).padStart(3)}%  margin ${String(c.margin).padStart(5)}  (${N} games)${band ? `  target ${band[0]}-${band[1]}%` : ''}${miss ? '  MISSED' : ''}`);
      if (miss) bad.push(`${skill} ${name}`);
    }
  }
  for (const skill of Object.keys(SKILL)) {
    const [r, v, a] = [0, 1, 2].map((d) => margins[skill + d]);
    const ok = r - v >= TARGETS.ladder && v - a >= TARGETS.ladder;
    console.log(`${skill}: mean margin Rookie ${r}, Varsity ${v}, All-State ${a}${ok ? '' : '  MISSED: a harder tier should cost the same player margin'}`);
    if (!ok) bad.push(`${skill} tiers out of order`);
  }
  console.log('Banner Challenges, a steady player on Varsity (each final of a two-part challenge on its own):');
  for (const c of CHALLENGES) for (const [si, step] of c.steps.entries()) for (const program of step.program ? [step.program] : (c.programs || [c.program])) {
    const o = { home: c.school, away: step.opp, program, cls: teamByKey(c.school).cls, shotClock: c.shotClock ?? 35, start: step.start, maxAllowed: step.maxAllowed };
    const r = cell(Array.from({ length: N }, (_, g) => playerGame(g, 1, SKILL.steady, o)));
    const miss = r.unfinished || r.win < TARGETS.challenge[0] || r.win > TARGETS.challenge[1];
    console.log(`  ${(c.id + (c.steps.length > 1 ? ' ' + (si + 1) : '') + ' ' + program).padEnd(28)} win ${String(r.win).padStart(3)}%  margin ${String(r.margin).padStart(5)}${miss ? `  MISSED (target ${TARGETS.challenge[0]}-${TARGETS.challenge[1]}%)` : ''}`);
    if (miss) bad.push(`challenge ${c.id} ${program}`);
  }
  console.log(`${N} games a cell, quarter ${qLen}s, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (bad.length) { console.log(`missed: ${bad.join(', ')}`); process.exit(1); }
  process.exit(0);
}
const res = [];
let fail = 0;
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const a = COUNTY[g % 7], b = COUNTY[(g * 3 + 1) % 7 === g % 7 ? (g + 1) % 7 : (g * 3 + 1) % 7];
  const program = g % 2 ? 'girls' : 'boys';
  const team = (t, side) => ({ ...t, roster: makeRoster(t.key, program, t.cls, 1), kit: kitFor(t, side) });
  const m = createMatch({ mode: 'demo', home: team(a, 'home'), away: team(b, 'away'), program, rules: { qLen, shotClock: g % 5 === 4 ? 0 : 35 }, seed: 1000 + g, user: -1, difficulty: 1, autoBreak: true });
  let ticks = 0;
  const cap = 60 * (qLen * 4 + 900) * 3;
  while (m.phase !== 'final' && ticks < cap) { tick(m); ticks++; m.ev.length = 0; }
  const box = boxScore(m);
  const sum = (t, k) => box[t].reduce((x, p) => x + p[k], 0);
  const row = { g, a: a.abbr, b: b.abbr, program, score: [m.teams[0].score, m.teams[1].score], q: m.clock.q, finished: m.phase === 'final', ticks,
    fg: [0, 1].map((t) => `${sum(t, 'fgm')}/${sum(t, 'fga')}`), tp: [0, 1].map((t) => `${sum(t, 'tpm')}/${sum(t, 'tpa')}`), ft: [0, 1].map((t) => `${sum(t, 'ftm')}/${sum(t, 'fta')}`),
    reb: sum(0, 'reb') + sum(1, 'reb'), stl: sum(0, 'stl') + sum(1, 'stl'), blk: sum(0, 'blk') + sum(1, 'blk'), to: sum(0, 'to') + sum(1, 'to'), pf: sum(0, 'pf') + sum(1, 'pf'), ast: sum(0, 'ast') + sum(1, 'ast'), scv: m.scVio[0] + m.scVio[1] };
  res.push(row);
  const bad = !row.finished || row.score[0] === 0 || row.score[1] === 0;
  if (bad) { fail++; console.log('BAD', JSON.stringify(row), m.log.slice(-8)); }
}
const avg = (f) => (res.reduce((x, r) => x + f(r), 0) / res.length).toFixed(1);
console.log(`games ${N}, quarter ${qLen}s, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(`avg points/team ${avg((r) => (r.score[0] + r.score[1]) / 2)}  min ${Math.min(...res.flatMap((r) => r.score))}  max ${Math.max(...res.flatMap((r) => r.score))}`);
console.log(`avg reb ${avg((r) => r.reb)} stl ${avg((r) => r.stl)} blk ${avg((r) => r.blk)} to ${avg((r) => r.to)} pf ${avg((r) => r.pf)} ast ${avg((r) => r.ast)} shot-clock vio ${avg((r) => r.scv)}  OT games ${res.filter((r) => r.q > 4).length}`);
const tot = (k) => res.reduce((x, r) => { r[k].forEach((s) => { const [a, b] = s.split('/').map(Number); x[0] += a; x[1] += b; }); return x; }, [0, 0]);
for (const k of ['fg', 'tp', 'ft']) { const [a, b] = tot(k); console.log(`${k} ${a}/${b} = ${(100 * a / b).toFixed(1)}%`); }
console.log(res.slice(0, 8).map((r) => `${r.a} ${r.score[0]}-${r.score[1]} ${r.b} (${r.program}${r.q > 4 ? ', OT' : ''})`).join('\n'));
const homeWins = res.filter((r) => r.score[0] > r.score[1]).length;
console.log(`home wins ${homeWins}/${N}`);
if (fail) { console.log(`${fail} bad games`); process.exit(1); }
