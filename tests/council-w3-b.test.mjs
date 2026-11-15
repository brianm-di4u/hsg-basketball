import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition, stepUntil } from './helpers.mjs';

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

tests.push({
  name: 'S1-06: a jump shooter is at the top of his jump at the meter\'s sweet spot, at the same height as before (node)',
  node: true,
  async run(t) {
    const rules = await load('rules.js');
    const sweetMs = rules.SWEET * rules.meterTime('jumper') * 1000;
    for (const jmp of [0, 0.5, 1]) {
      const { m, sim, step } = await soloMatch();
      const p = m.p[0];
      m.teams[0].roster[p.r].jmp = jmp;
      Object.assign(p, { x: 70, z: 25, tx: 70, tz: 25 });
      m.input.shoot = true; m.input.shootP = true; step(); m.input.shootP = false;
      let apex = 0, apexAt = 0, released = 0, releaseY = 0;
      for (let n = 1; n < 300 && !(released && p.y <= 0); n++) {
        if (m.ball.state === 'held' && p.actT >= rules.SWEET * rules.meterTime('jumper')) { m.input.shoot = false; m.input.shootR = true; }
        step(); m.input.shootR = false;
        if (p.y > apex) { apex = p.y; apexAt = n; }
        if (!released && m.ball.state !== 'held') { released = n; releaseY = p.y; }
      }
      const oldApex = (10 + 4 * jmp) ** 2 / 64;
      t.expect(Math.abs(apexAt * 1000 / 60 - sweetMs) <= 50, `jump rating ${jmp}: the top of the jump (${Math.round(apexAt * 1000 / 60)} ms) is within 50 ms of the sweet spot (${Math.round(sweetMs)} ms); it was ${Math.round((10 + 4 * jmp) / 32 * 1000)} ms`);
      t.expect(releaseY >= 0.9 * apex, `jump rating ${jmp}: a PERFECT release leaves from the top (${releaseY.toFixed(2)} of ${apex.toFixed(2)} ft), not from the floor`);
      t.expect(Math.abs(apex - oldApex) <= 0.1, `jump rating ${jmp}: the jump is as high as before (${apex.toFixed(2)} ft against ${oldApex.toFixed(2)})`);
    }
  },
});

tests.push({
  name: 'S1-08: a replay plays at the speed of play, about 2 s, and the press that skips it still reaches the game',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t, { seed: 5 });
    await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
    await t.game('step', 150);
    t.expect(await t.game('act', 'replay', 'THREE', 1), 'a replay starts from the recorded frames');
    let s = await t.state();
    t.expect(s.replay && s.replay.speed >= 1, `it plays at normal speed or faster (${s.replay && s.replay.speed}); it was half speed`);
    const secs = s.replay.n / 60 / s.replay.speed;
    t.expect(secs <= 2.6 && secs >= 1, `and lasts about 2 s (${secs.toFixed(1)} s); it was 4.3 s`);
    await t.page.keyboard.down('Space');
    s = await t.state();
    t.equal(s.replay, null, 'a key skips the replay');
    t.expect(s.input.shoot, 'and that same press is not swallowed: Shoot is held');
    await t.page.keyboard.up('Space');
  },
});
