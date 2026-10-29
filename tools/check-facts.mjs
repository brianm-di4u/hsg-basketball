#!/usr/bin/env node
// Checks data/facts.json against the audited trivia bank: every id exists, is `confirmed`,
// and cites the same source. Run from the repo root or the game folder.
//   node games/basketball/tools/check-facts.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = path.resolve(here, '..');
const facts = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8')).facts;
const bank = JSON.parse(fs.readFileSync(path.join(game, '../trivia/data/questions.json'), 'utf8')).questions;

let bad = 0;
for (const f of facts) {
  const q = bank.find((x) => x.id === f.id);
  const problems = [];
  if (!q) problems.push('id not in audited bank');
  else {
    if (q.confidence !== 'confirmed') problems.push(`confidence is ${q.confidence}`);
    if (q.source !== f.source) problems.push(`source differs: bank "${q.source}"`);
  }
  if (problems.length) { bad++; console.log(`FAIL ${f.id}: ${problems.join('; ')}`); }
  else console.log(`ok   ${f.id}  ${q.answer}`);
}
console.log(`\n${facts.length - bad}/${facts.length} facts verified`);
process.exit(bad ? 1 : 0);
