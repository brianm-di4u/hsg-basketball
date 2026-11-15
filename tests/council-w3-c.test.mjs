import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { click, waitFor } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Wave 3, batch C: difficulty, progression and records.

const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};

export const tests = [];

tests.push({
  name: 'S3-08: an open three is worth nearly as much as a layup, and a dunk no longer pays more than a layup would (node)',
  node: true,
  async run(t) {
    const R = await load('rules.js');
    const ev = (type, dist, pts, o = {}) => pts * R.shotChance({ dist, type, sht: 0.65, ins: 0.65, ...o });
    t.equal(R.BASE_THREE, 0.36, 'the three-point base is 0.36 (was 0.33)');
    t.equal(R.BASE_DUNK, 0.82, 'the dunk base is 0.82 (was 0.9)');
    // The AI's PERFECT open shots at rating .65: the finding measured three 1.46 against layup 1.94.
    const three = ev('jumper', 24, 3, { quality: 1 }), layup = ev('layup', 3, 2, { quality: 1 });
    t.expect(three / layup >= 0.8, `an open PERFECT three is at least 80% of a layup (${three.toFixed(2)} against ${layup.toFixed(2)}; it was 75%)`);
    t.expect(ev('jumper', 28, 3, { quality: 1 }) >= 0.95, 'a deep three still pays, at least 0.95 points a shot (was 0.84)');
    t.expect(ev('dunk', 3, 2, { quality: 0.75 }) <= 1.8, 'a GOOD open dunk is at most 1.8 points (was 1.94)');
    // Nothing else moved: mid-range and the layup are as they were.
    t.expect(Math.abs(ev('jumper', 15, 2, { quality: 1 }) - 1.29) < 0.01 && Math.abs(ev('layup', 3, 2, { quality: 1 }) - 1.94) < 0.01, 'mid-range and layup numbers are unchanged');
    // Contested, the finding's second number: layup 1.31 against three 0.90.
    const gap = ev('layup', 3, 2, { quality: 1, contest: 0.62 }) - ev('jumper', 24, 3, { quality: 1, contest: 0.62 });
    t.expect(gap < 0.41, `a contested layup beats a contested three by less than 0.41 points (${gap.toFixed(2)}; it was 0.41)`);
  },
});

tests.push({
  name: 'S6-08: a double click on Start season or Sim game counts once; a second, separate click still counts',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(5);
    await click(t, 'seasonSetup');
    await t.page.dblclick('[data-act="startSeason"]');
    let s = await waitFor(t, (x) => x.scene === 'hub', 4000, 'the season hub');
    t.equal(s.season.w + s.season.l, 0, 'a double click on Start season did not also play a game on the hub that replaced it');
    await t.page.waitForFunction(() => window.__game.isIdle(), null, { timeout: 8000 });
    await t.page.dblclick('[data-act="simSeason"]');
    s = await t.state();
    t.equal(s.season.w + s.season.l, 1, 'a double click on Sim game recorded one game (it recorded two)');
    t.equal(s.season.idx, 1, 'and moved the schedule on by one');
    await t.page.waitForTimeout(450); // past the window of a double click: this is a second, deliberate click
    await click(t, 'simSeason');
    s = await t.state();
    t.equal(s.season.w + s.season.l, 2, 'a separate click a moment later still sims the next game');
  },
});
