import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Wave 3, batch B: controls, rules and play; difficulty, progression and records.

const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};
// A seeded match with the user's ball handler alone on the court (everyone else parked far away), as the council's feel probe did.
async function soloMatch() {
  const sim = await load('sim.js'), rost = await load('roster.js');
  const mk = (k) => ({ key: k, name: k, short: k, abbr: k.slice(0, 3), mascot: 'x', crest: null, colors: { primary: '#fff', secondary: '#000' }, kit: {}, roster: rost.makeRoster(k, 'boys', 5, 1) });
  const m = sim.createMatch({ mode: 'exhibition', home: mk('aaa'), away: mk('bbb'), seed: 7, user: 0, difficulty: 1, rules: { qLen: 240, shotClock: 35 } });
  sim.give(m, 0);
  const park = () => { for (let i = 1; i < 10; i++) { m.p[i].x = 70 + i; m.p[i].z = 5; m.p[i].tx = m.p[i].x; m.p[i].tz = m.p[i].z; m.p[i].vx = m.p[i].vz = 0; } };
  park();
  Object.assign(m.p[0], { x: 20, z: 25, tx: 20, tz: 25 });
  return { sim, m, step: () => { sim.tick(m); park(); } };
}

export const tests = [];

tests.push({
  name: 'S1-01: a player reaches top speed, stops and slides much sooner than before (node)',
  node: true,
  async run(t) {
    const { m, step } = await soloMatch();
    const trace = [];
    m.input.mx = 1; m.input.mz = 0;
    for (let k = 0; k < 60; k++) { step(); trace.push(m.p[0].vx); }
    const top = Math.max(...trace);
    const to90 = trace.findIndex((v) => v >= 0.9 * top) + 1;
    t.expect(top > 16.5 && top < 17.3, `top speed is unchanged (${top.toFixed(2)} ft/s)`);
    t.expect(to90 <= 14, `90% of top speed within 14 ticks (${to90}; it was 20)`);
    const x0 = m.p[0].x; m.input.mx = 0;
    let stop = 0; while (Math.abs(m.p[0].vx) > 0.5 && stop < 120) { step(); stop++; }
    t.expect(stop <= 12, `stopped within 12 ticks of letting go (${stop}; it was 22)`);
    t.expect(m.p[0].x - x0 <= 1.5, `and slid at most 1.5 ft (${(m.p[0].x - x0).toFixed(2)}; it was 3 ft)`);
  },
});
