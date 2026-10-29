#!/usr/bin/env node
// Plays N full AI-vs-AI games with the real rules engine in Node and reports score and stat sanity.
// Fails (exit 1) if any game does not finish, a team is held scoreless, or totals are implausible.
//   node tools/balance.mjs [games=50] [qLenSeconds=120]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = path.resolve(here, '..');
globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
const imp = (f) => import(pathToFileURL(path.join(game, 'src/js', f)).href);
const { COUNTY, kitFor } = await imp('data.js');
const { makeRoster } = await imp('roster.js');
const { createMatch, tick, boxScore } = await imp('sim.js');

const N = +(process.argv[2] || 50), qLen = +(process.argv[3] || 120);
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
