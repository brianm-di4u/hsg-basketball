import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};

// Wave 4, batch A: saves, lifecycle and robustness; controls, rules and play.

export const tests = [];

const KEY = 'hsg-hoops-v1';
const put = (t, v) => t.page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === 'string' ? s : JSON.stringify(s)), [KEY, v]);
const rawSave = (t) => t.page.evaluate((k) => localStorage.getItem(k), KEY);
async function loadWith(t, v) { await put(t, v); await t.reload(); }

tests.push({
  name: 'C4-01: a save from a newer version is told on the title and is byte-for-byte the same after a full visit',
  async run(t) {
    const newer = JSON.stringify({ v: 2, settings: { text: 130, sound: false }, best: { shootout: 99 }, future: { a: [1, 2, 3] }, season: { shape: 'from the future' } });
    await loadWith(t, newer);
    t.expect(/newer version of the game/i.test(await t.page.textContent('#screen')), 'the title says the saved data is from a newer version');
    t.expect(/this visit is not being saved/i.test(await t.page.textContent('#screen')), 'the title says this visit is not being saved');
    t.equal((await t.state()).settings.text, 100, 'the game plays from defaults, not the newer save');
    await t.checkLayout();
    await t.shot('C4-01-newer-title');
    // A visit that would normally save: settings, a finished exhibition, a season started and simmed, a Hot Streak run.
    await t.page.click('[data-act="settings"]');
    await t.page.click('[data-act="setText"][data-arg="115"]');
    await t.page.click('[data-act="setSound"][data-arg="0"]');
    t.equal((await t.state()).settings.text, 115, 'the setting still takes effect in this tab');
    await exhibition(t, { seed: 5 });
    await t.game('act', 'finishGame');
    await t.game('newGame', { mode: 'season', seed: 3 });
    await t.game('act', 'sim');
    await t.game('newGame', { mode: 'shootout', seed: 4 });
    t.equal(await rawSave(t), newer, 'the stored record is byte-for-byte the same');
    await t.game('scene', 'settings');
    t.expect(/newer version of the game/i.test(await t.page.textContent('#screen')), 'Settings says so too');
    t.expect(!(await t.page.$('[data-act="resetSave"]')), 'there is no reset button for a newer save');
    t.equal(await rawSave(t), newer, 'still the same after Settings');
  },
});

tests.push({
  name: 'C4-01: a damaged save still says it is unreadable and offers a reset; a good save shows no notice',
  viewports: ['desktop'],
  async run(t) {
    await loadWith(t, '{"v":1,"best":{"shoot');
    await t.page.click('[data-act="settings"]');
    t.expect(/unreadable/i.test(await t.page.textContent('#screen')), 'a damaged save says it is unreadable');
    t.expect(!!(await t.page.$('[data-act="resetSave"]')), 'and has the reset button');
    await loadWith(t, { v: 1, settings: { text: 115 } });
    t.expect(!/newer version|unreadable|not being saved/i.test(await t.page.textContent('#screen')), 'a good save shows no notice');
  },
});

// ---------------------------------------------------------------- C4-06
// The title loop is driven here with a clock of the test's own: the page's requestAnimationFrame is swapped for a queue and the
// frame callback is called by hand at a stated screen rate, so the count is exact and does not depend on how busy the machine is.
// With frame() no longer calling its gate, every frame draws (240 at 120 Hz in 2 s) and the bound fails.
async function titleFramesDrawn(t, hz, seconds) {
  return t.page.evaluate(([rate, secs]) => {
    const g = window.__game, q = [];
    const real = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
    return new Promise((resolve) => {
      const wait = () => {
        if (!q.length) { setTimeout(wait, 5); return; } // the loop's next request is picked up as soon as it is made
        const f0 = g.getState().title.frames, t0 = Math.max(performance.now(), window.__fakeNow || 0), step = 1000 / rate, n = Math.round(rate * secs);
        let calls = 0;
        for (let i = 1; i <= n; i++) { const cb = q.shift(); if (!cb) break; calls++; cb(t0 + i * step); }
        window.__fakeNow = t0 + n * step;
        const drawn = g.getState().title.frames - f0;
        window.requestAnimationFrame = real;
        const next = q.shift(); if (next) real.call(window, next); // hand the loop back to the real clock
        resolve({ drawn, calls });
      };
      wait();
    });
  }, [hz, seconds]);
}
tests.push({
  name: 'C4-06: the title draws about 30 frames a second on a 60 and a 120 Hz screen, counted with a clock of the test\'s own',
  async run(t) {
    await t.page.waitForFunction(() => { const s = window.__game.getState(); return s.scene === 'title' && s.title && s.title.running; }, null, { timeout: 15000 });
    await t.game('act', 'titleIdleAfter', 600000);
    for (const hz of [60, 120]) {
      const r = await titleFramesDrawn(t, hz, 2);
      t.expect(r.calls === hz * 2, `${hz} Hz: the loop took every frame the test offered (${r.calls})`);
      t.expect(r.drawn >= 56 && r.drawn <= 64, `${hz} Hz: ${r.drawn} frames drawn in 2 s (about 60, which is 30 a second)`);
      await t.page.evaluate(() => { window.__game.act('titleIdleAfter', 600000); });
      await t.page.waitForFunction(() => window.__game.getState().title.running, null, { timeout: 5000 }).catch(() => {});
    }
  },
});

// ---------------------------------------------------------------- S1-09
// A seeded match with the user's ball handler alone on the court (everyone else parked far away), as council-w3-b does.
async function soloMatch() {
  const sim = await load('sim.js'), rost = await load('roster.js');
  const mk = (k) => ({ key: k, name: k, short: k, abbr: k.slice(0, 3), mascot: 'x', crest: null, colors: { primary: '#fff', secondary: '#000' }, kit: {}, roster: rost.makeRoster(k, 'boys', 5, 1) });
  const m = sim.createMatch({ mode: 'exhibition', home: mk('aaa'), away: mk('bbb'), seed: 7, user: 0, difficulty: 1, rules: { qLen: 240, shotClock: 35 } });
  sim.give(m, 0);
  const park = () => { for (let i = 1; i < 10; i++) { m.p[i].x = 70 + i; m.p[i].z = 5; m.p[i].tx = m.p[i].x; m.p[i].tz = m.p[i].z; m.p[i].vx = m.p[i].vz = 0; } };
  park();
  Object.assign(m.p[0], { x: 40, z: 25, tx: 40, tz: 25 });
  return { sim, m, step: () => { sim.tick(m); park(); } };
}
tests.push({
  name: 'S1-09: a player runs the way the stick points, on the diagonals too, at the same speed (node)',
  node: true,
  async run(t) {
    const run = async (mx, mz) => {
      const { m, step } = await soloMatch();
      m.input.mx = mx; m.input.mz = mz;
      for (let k = 0; k < 30; k++) step();
      const p = m.p[0];
      return { deg: Math.atan2(p.vz, p.vx) * 180 / Math.PI, speed: Math.hypot(p.vx, p.vz) };
    };
    const east = await run(1, 0), south = await run(0, 1);
    for (const [mx, mz] of [[1, 1], [1, -1], [-1, 1], [2, 1], [1, 2]]) {
      const r = await run(mx, mz), want = Math.atan2(mz, mx) * 180 / Math.PI;
      t.expect(Math.abs(r.deg - want) <= 1.5, `stick (${mx}, ${mz}): runs at ${r.deg.toFixed(1)} degrees, the stick points at ${want.toFixed(1)}`);
      t.expect(Math.abs(r.speed - east.speed) <= 0.05 * east.speed, `and at the same speed as straight along the court (${r.speed.toFixed(2)} against ${east.speed.toFixed(2)} ft/s)`);
    }
    t.expect(Math.abs(south.speed - east.speed) <= 0.05 * east.speed, `straight across the court is as quick as straight along it (${south.speed.toFixed(2)} against ${east.speed.toFixed(2)} ft/s)`);
  },
});
