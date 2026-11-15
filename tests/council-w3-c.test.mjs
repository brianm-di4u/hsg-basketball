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

// A phone with a notch reports its insets through env(safe-area-inset-*), which no desktop browser can set. The stylesheet reads them through
// four custom properties on :root (--sa-t, --sa-r, --sa-b, --sa-l), so the test sets those to a notch's size and measures what moves.
const rects = (t) => t.page.evaluate(() => {
  const r = (s) => { const q = document.querySelector(s); if (!q || q.hidden || !q.getClientRects().length) return null; const b = q.getBoundingClientRect(); return { x: b.x, y: b.y, r: b.right, b: b.bottom }; };
  return { stick: r('#stick'), shoot: r('#b-shoot'), pause: r('#b-pause'), mute: r('#b-mute'), sb: r('#sb'), sbPad: parseFloat(getComputedStyle(document.querySelector('#sb')).paddingTop), W: innerWidth };
});
const inset = (t, top, side) => t.page.evaluate(([a, b]) => { const s = document.documentElement.style; s.setProperty('--sa-t', a + 'px'); s.setProperty('--sa-l', b + 'px'); s.setProperty('--sa-r', b + 'px'); window.dispatchEvent(new Event('resize')); }, [top, side]); // a real phone has its insets from the first layout; the resize makes the page measure again

tests.push({
  name: 'S6-09: with a notch, the scoreboard clears the top inset in portrait and the stick, buttons and pause button clear the side insets in landscape',
  viewports: ['mobile'],
  async run(t) {
    await t.seed(7);
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1, paused: true });
    await t.waitForStable();
    const none = await rects(t);
    t.expect(!!none.stick && !!none.shoot && !!none.pause, 'the touch pad and the pause button are showing');
    await inset(t, 47, 0); // an upright notch phone: the sensor housing is at the top
    const p = await rects(t);
    t.expect(p.sbPad - none.sbPad >= 46, `portrait: the scoreboard starts below the top inset (${(p.sbPad - none.sbPad).toFixed(0)} px of 47)`);
    await t.shot('S6-09-portrait-inset');
    await inset(t, 0, 0);
    await t.page.setViewportSize({ width: 844, height: 390 });
    await t.waitForStable();
    const lone = await rects(t);
    await inset(t, 0, 47); // on its side the housing is at one end and the rounded corners at both
    const l = await rects(t);
    t.expect(l.stick.x - lone.stick.x >= 46, `landscape: the stick moves in by the left inset (${(l.stick.x - lone.stick.x).toFixed(0)} px of 47)`);
    t.expect(lone.shoot.r - l.shoot.r >= 46, `and the Shoot button by the right inset (${(lone.shoot.r - l.shoot.r).toFixed(0)} px)`);
    t.expect(lone.pause.r - l.pause.r >= 46 && lone.mute.r - l.mute.r >= 46, 'and so do the pause and sound buttons');
    t.expect(l.sb.x >= 0 && l.sb.r <= l.W, 'the scoreboard stays on the screen');
    await t.shot('S6-09-landscape-inset');
    await t.page.setViewportSize({ width: 390, height: 844 });
  },
});
