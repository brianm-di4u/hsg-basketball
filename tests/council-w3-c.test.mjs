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

tests.push({
  name: 'S3-10: a simulated game scores like a played one: points a team, win chance by rating gap, margin per rating point, and the quarter length (node)',
  node: true,
  async run(t) {
    const R = await load('rules.js'), U = await load('util.js'), S = await load('season.js');
    // simScore draws from a seeded stream, so these numbers are the same every run (no chance of a failure by luck).
    const run = (gap, qLen, N = 3000) => {
      const o = { rs: 4242 }; let w = 0, m = 0, pts = 0;
      for (let i = 0; i < N; i++) { const [a, b] = R.simScore(60 + gap, 60, o, U.rnd, qLen); if (a > b) w++; m += a - b; pts += (a + b) / 2; }
      return { win: w / N, margin: m / N, pts: pts / N };
    };
    // Played games, 42 county pairings at 2-minute quarters (batch C report): 21 points a team, 48% + 1.4% a rating point, 0.28 margin a rating point.
    const even = run(0), six = run(15.7), back = run(-15.7);
    t.expect(even.pts >= 18 && even.pts <= 25, `a simulated game at the default quarter scores about what a played one does (${even.pts.toFixed(1)} a team; it was 55)`);
    t.expect(Math.abs(even.win - 0.5) < 0.04, `equal teams win about half (${even.win.toFixed(3)})`);
    t.expect(six.win >= 0.62 && six.win <= 0.78, `a 6A team over a 2A team wins about 70%, as in played games (${six.win.toFixed(3)}; it was 98%)`);
    t.expect(back.win >= 0.22 && back.win <= 0.38, `and the 2A team still wins about 30% (${back.win.toFixed(3)})`);
    const slope = six.margin / 15.7;
    t.expect(slope >= 0.2 && slope <= 0.4, `margin grows 0.2 to 0.4 points per rating point (${slope.toFixed(2)}; it was 1.5)`);
    const long = run(0, 4);
    t.expect(long.pts / even.pts >= 1.8 && long.pts / even.pts <= 2.2, `twice the quarter gives about twice the points (${(long.pts / even.pts).toFixed(2)}x)`);
    // The season passes the player's quarter length through: a season of sims at 8-minute quarters out-scores one at 2-minute quarters.
    const total = (qSecs) => { let sum = 0; for (let seed = 1; seed <= 20; seed++) { const se = S.createSeason({ school: 'hot-springs', program: 'boys', length: 'short', seed }); const sc = S.simCurrent(se, qSecs); sum += sc[0] + sc[1]; } return sum; };
    t.expect(total(480) > 3 * total(120), `Sim game takes the player's quarter length (${total(120)} points in 20 games at 2 minutes, ${total(480)} at 8)`);
  },
});

// ---------------------------------------------------------------- S5-17 stings (audio is checked by measurement: audioRender builds a cue on an OfflineAudioContext at Medium volume)
const render = (t, name, seconds, opt = {}) => t.page.evaluate(([n, s, o]) => window.__game.audioRender(n, s, false, o), [name, seconds, opt]);
const gesture = async (t) => { await t.page.mouse.click(4, 4); await t.page.waitForFunction(() => window.__game.getState().audio.state === 'running', null, { timeout: 8000 }); };
const count = async (t, name) => ((await t.state()).audio.count[name] || 0);

tests.push({
  name: 'S5-17: the challenge and trophy stings are inside the cue range, never clip under the busiest moment, and differ from the win and achievement cues',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.page.evaluate(() => window.__game.audioList());
    for (const c of ['challenge', 'trophy']) {
      t.expect(list.cues.includes(c), `${c} is a listed cue`);
      const peaks = [];
      for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) peaks.push((await render(t, 'cue:' + c, 3, { seed })).peak);
      peaks.sort((a, b) => a - b);
      const median = peaks[Math.floor(peaks.length / 2)];
      t.expect(median >= 0.2 && median <= 0.45, `${c}: the median repeat peaks ${median} (want 0.2 to 0.45)`);
      t.expect(peaks[0] >= 0.17 && peaks[peaks.length - 1] <= 0.5, `${c}: no repeat is more than 1.5 dB outside the range (${peaks[0]} to ${peaks[peaks.length - 1]})`);
      // The busiest moment: the arena crowd roaring, the fanfare music under it, every volume at its High step.
      for (const seed of [1, 2, 3, 4, 5]) {
        const r = await render(t, 'arena', 4, { crowd: 1, vol: 0.8, music: 'fanfare', mixCue: c, seed, cue: { big: true, mine: true } });
        t.expect(r.peak < 0.95, `${c} + arena crowd + fanfare at High, seed ${seed}: peak ${r.peak} is under 0.95`);
      }
    }
    const rms = async (c) => (await render(t, 'cue:' + c, 3, { seed: 3 })).rms;
    const [a, b, w, ach] = [await rms('challenge'), await rms('trophy'), await rms('win'), await rms('achieve')];
    t.expect(new Set([a, b, w, ach]).size === 4, `challenge, trophy, win and achieve are four different sounds (${a}, ${b}, ${w}, ${ach})`);
  },
});

tests.push({
  name: 'S5-17: finishing a Banner Challenge plays its sting, a step of a two-part one and a plain game do not, the 1912 kit unlock is toasted, and a state title plays the trophy sting',
  viewports: ['desktop'],
  async run(t) {
    await t.seed(4);
    await gesture(t);
    await t.page.evaluate(() => { window.__toasts = []; new MutationObserver(() => { const e = document.querySelector('#toast'); if (e && !e.hidden) window.__toasts.push(e.textContent); }).observe(document.querySelector('#toast'), { childList: true, attributes: true, subtree: true }); });
    const finish = async (opts) => {
      await t.game('newGame', { ...opts, paused: true });
      const s = await t.state();
      await t.game('act', 'finishGame', { winner: s.match.user.team });
      await waitFor(t, (x) => x.scene === 'final', 6000, 'the final screen');
    };
    let c = await count(t, 'challenge');
    let w = await count(t, 'win');
    await finish({ mode: 'challenge', challenge: '1912-colors' });
    t.equal(await count(t, 'challenge'), c + 1, '1912 Colors plays the challenge sting');
    t.expect((await t.state()).unlocks.throwback === true, 'and unlocks the throwback kit');
    const toasted = await t.page.waitForFunction(() => window.__toasts.some((x) => /1912 throwback kit/.test(x)), null, { timeout: 8000 }).then(() => true, () => false);
    t.expect(toasted, 'a toast says the 1912 throwback kit is unlocked');
    w = await count(t, 'win'); c = await count(t, 'challenge');
    await finish({ mode: 'challenge', challenge: '2a7-showdown' });
    t.equal(await count(t, 'challenge'), c + 1, 'a completed challenge plays the challenge sting');
    t.equal(await count(t, 'win'), w, 'and not the plain win cue as well');
    w = await count(t, 'win'); c = await count(t, 'challenge');
    await finish({ mode: 'challenge', challenge: 'double-crown' });
    t.equal(await count(t, 'challenge'), c, 'the first final of Double Crown is a step, not a finished challenge: no challenge sting');
    t.equal(await count(t, 'win'), w + 1, 'it plays the plain win cue');
    w = await count(t, 'win'); c = await count(t, 'challenge');
    await finish({ mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1 });
    t.equal(await count(t, 'win'), w + 1, 'a plain exhibition win still plays the win cue');
    t.equal(await count(t, 'challenge'), c, 'and no challenge sting');
  },
});

tests.push({
  name: 'S5-17: winning a state title plays the trophy sting on the champion screen',
  viewports: ['desktop'],
  async run(t) {
    await t.seed(4);
    await gesture(t);
    await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 9 });
    for (let k = 0; k < 3; k++) await t.game('act', 'seasonResult', 50, 40);
    await t.game('act', 'seasonResult', 48, 41);
    await t.game('act', 'seasonResult', 52, 49);
    await click(t, 'playSeason');
    await t.game('pause');
    const s = await t.state();
    const before = await count(t, 'trophy');
    await t.game('act', 'finishGame', { winner: s.match.user.team });
    await waitFor(t, (x) => x.scene === 'final', 6000, 'the final screen');
    t.equal(await count(t, 'trophy'), before, 'the final screen of the title game does not play it yet');
    await click(t, 'afterSeasonGame');
    t.equal((await t.state()).scene, 'champion', 'champion screen');
    t.equal(await count(t, 'trophy'), before + 1, 'the champion screen plays the trophy sting once');
  },
});
