import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { click, stepUntil, waitFor } from './helpers.mjs';

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

tests.push({
  name: 'S6-08: two quick clicks that each report a click count of 1 (a double tap on some phones) still sim one game',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(5);
    await click(t, 'seasonSetup');
    await click(t, 'startSeason');
    await waitFor(t, (x) => x.scene === 'hub', 4000, 'the season hub');
    await t.page.waitForFunction(() => window.__game.isIdle(), null, { timeout: 8000 });
    await t.page.evaluate(() => { // two separate clicks, 60 ms apart, each with a click count of 1
      const b = () => document.querySelector('[data-act="simSeason"]');
      const fire = () => b().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
      fire();
      return new Promise((r) => setTimeout(() => { fire(); r(); }, 60));
    });
    let s = await t.state();
    t.equal(s.season.w + s.season.l, 1, 'two quick count-1 clicks on Sim game recorded one game (they recorded two)');
    await t.page.waitForTimeout(450);
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

// ---------------------------------------------------------------- S3-06 stars and S3-04 records by difficulty
tests.push({
  name: 'S3-06 and S3-04: star masks, best-by-difficulty, saving that never lowers them, and old and damaged saves (node)',
  node: true,
  async run(t) {
    const C = await load('career.js'), P = await load('save-policy.js');
    t.equal(C.starMask({ ok: false, margin: 30, skill: true }), 0, 'a lost challenge earns nothing');
    t.equal(C.starMask({ ok: true, margin: 2, skill: false }), 1, 'a win is one star');
    t.equal(C.starMask({ ok: true, margin: 5, skill: false }), 3, 'a win by 5 is two');
    t.equal(C.starMask({ ok: true, margin: 4, skill: true }), 5, 'a win by 4 on Varsity without the assist is the first and third');
    t.equal(C.starMask({ ok: true, margin: 9, skill: true }), 7, 'all three');
    t.equal(C.starCount(7) + C.starCount(5) + C.starCount(0), 5, 'counting');
    t.equal(C.goalsMet({ challenges: { a: true }, stars: {} }, 'a'), 1, 'an old save with a win and no stars entry holds one star');
    t.equal(C.goalsMet({ challenges: {}, stars: { a: { g: 6, m: 8 } } }, 'a'), 6, 'a stars entry is read as it is');
    t.equal(C.goalsMet({ challenges: {}, stars: { a: { g: 6 } } }, 'b'), 0, 'an unknown challenge holds none');
    t.equal(JSON.stringify(C.cleanStars({ a: { g: 99, m: -4 }, b: 'x', c: [1], '': { g: 1 } })), '{"a":{"g":3,"m":0}}', 'a damaged stars record is cleaned (only the low three bits, no negative margin, no junk keys)');
    t.equal(JSON.stringify(C.cleanStars('no')), '{}', 'and a non-object reads as empty');
    let s = C.applyStar({}, { id: 'a', g: 5, m: 4 });
    s = C.applyStar(s, { id: 'a', g: 2, m: 3 });
    t.equal(JSON.stringify(s), '{"a":{"g":7,"m":4}}', 'goals are added and the margin only improves');
    s = C.applyStar(s, { id: 'a', g: 0, m: 0 });
    t.equal(JSON.stringify(s), '{"a":{"g":7,"m":4}}', 'a worse result lowers nothing');
    t.equal(C.tierKey(2, true), '2a', 'assist is its own key');
    t.equal(C.tierKey(7, false), '1', 'an unknown difficulty reads as Varsity');
    t.equal(JSON.stringify(C.cleanTiers({ 0: 30, '1a': 55.7, '2': -1, '3': 9, x: 1, '1': 'no' })), '{"0":30,"1a":55}', 'damaged tiers are cleaned');
    let tr = C.applyTier({ 1: 40 }, '1', 30);
    t.equal(tr['1'], 40, 'a lower score keeps the tier best');
    tr = C.applyTier(tr, '2', 33);
    t.equal(JSON.stringify(tr), '{"1":40,"2":33}', 'a new tier is added');
    // Saved through the save policy: added to what is stored now, never lowering; old saves read.
    const defaults = { sound: true };
    const old = { v: 1, settings: {}, trophies: [], unlocks: {}, best: { shootout: 55 }, challenges: { '2a7-showdown': true } };
    let v = P.mergeSave(old, defaults, { score: 30, tiers: [{ k: '2', s: 30 }], stars: [{ id: '2a7-showdown', g: 3, m: 6 }] }).value;
    t.expect(v.best.shootout === 55 && v.best.tiers['2'] === 30, 'an old save keeps its best and gets its first tier');
    t.expect(v.stars['2a7-showdown'].g === 3 && v.challenges['2a7-showdown'] === true, 'and its challenge gets stars while staying marked done');
    v = P.mergeSave(v, defaults, { tiers: [{ k: '2', s: 12 }], stars: [{ id: '2a7-showdown', g: 1, m: 1 }] }).value;
    t.expect(v.best.tiers['2'] === 30 && v.stars['2a7-showdown'].g === 3 && v.stars['2a7-showdown'].m === 6, 'a worse run later lowers nothing');
    const broken = { ...old, best: { shootout: 55, tiers: 'x' }, stars: 5 };
    t.expect(P.validSave(broken), 'damaged tiers and stars never make the save unreadable');
    v = P.mergeSave(broken, defaults, { tiers: [{ k: '1', s: 20 }], stars: [{ id: 'a', g: 1, m: 2 }] }).value;
    t.expect(v.best.tiers['1'] === 20 && v.stars.a.g === 1, 'and the next save starts them again');
    v = P.mergeSave(old, defaults, { settings: { sound: false } }).value;
    t.expect(v.stars === undefined && v.best.tiers === undefined, 'a settings save adds neither');
  },
});

const challengeStars = (t) => t.state().then((s) => s.stars || {});
const finishChallenge = async (t, id, { score, program } = {}) => {
  await t.game('newGame', { mode: 'challenge', challenge: id, paused: true, ...(program ? { program } : {}) });
  const s = await t.state();
  if (score) await t.game('setState', { match: { score } });
  await t.game('act', 'finishGame', { winner: s.match.user.team });
  return waitFor(t, (x) => x.scene === 'final', 8000, 'the final screen');
};
const shot = (t, name) => t.shot(name, { wait: false, allowBlank: true }); // saved in the repo's own screenshots folder, by viewport (C4-07)

tests.push({
  name: 'S3-06: each Banner Challenge has three star goals; they are earned and saved by how it is won, and an old win holds one star',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(4);
    await t.game('setState', { settings: { difficulty: 1, assist: false } });
    await click(t, 'challenges');
    let txt = await t.page.innerText('#screen');
    t.equal((txt.match(/Win by 5 or more\./g) || []).length, 6, 'all six cards list the margin goal');
    t.equal((txt.match(/Win on Varsity or All-State with the meter assist off\./g) || []).length, 6, 'and the skill goal');
    t.equal(await t.page.locator('.stars .star-row[aria-label="0 of 3 stars"]').count(), 6, 'a new player has no stars');
    // A close win on Varsity with the assist off: the win and the skill goal, the margin goal still open.
    await finishChallenge(t, '2a7-showdown', { score: [0, 40] });
    let st = await challengeStars(t);
    t.equal(st['2a7-showdown'] && st['2a7-showdown'].g, 5, 'a close win on Varsity, assist off: stars for the win and the skill goal (mask 5)');
    txt = await t.page.innerText('#screen');
    t.expect(/Stars: ★★☆ \(2 new\) Next: Win by 5 or more\./.test(txt), `the result card says what it earned and what is next (${txt.replace(/\n+/g, ' | ').slice(txt.indexOf('Challenge complete'), txt.indexOf('Challenge complete') + 160)})`);
    await shot(t, 'S3-06-challenge-result-stars');
    // Replayed with a big lead the margin star joins them; replayed on Rookie with the assist on, nothing is lost.
    await finishChallenge(t, '2a7-showdown', { score: [40, 0] });
    st = await challengeStars(t);
    t.equal(st['2a7-showdown'].g, 7, 'a replay won by more than 5 earns the third star');
    t.expect(/All three earned\./.test(await t.page.innerText('#screen')), 'and the card says all three are earned');
    await t.game('setState', { settings: { difficulty: 0, assist: true } });
    await finishChallenge(t, '2a7-showdown');
    st = await challengeStars(t);
    t.equal(st['2a7-showdown'].g, 7, 'an easier replay (Rookie, assist on) lowers nothing');
    // A challenge not won before, on Rookie with the assist on: the win but not the skill star.
    await finishChallenge(t, 'bookend-banners', { program: 'boys' });
    st = await challengeStars(t);
    t.equal(st['bookend-banners'].g & 4, 0, 'a win on Rookie with the assist on does not earn the skill star');
    // A two-part challenge counts every final: a narrow first final keeps the margin star away even when the second is a rout.
    await t.game('setState', { settings: { difficulty: 1, assist: false } });
    await finishChallenge(t, 'double-crown', { score: [0, 40] });
    t.equal((await t.state()).chalResult.more, true, 'the first final of Double Crown is a step');
    await click(t, 'afterChallenge');
    await t.game('pause');
    await t.game('setState', { match: { score: [40, 0] } });
    const s2 = await t.state();
    await t.game('act', 'finishGame', { winner: s2.match.user.team });
    await waitFor(t, (x) => x.scene === 'final', 8000, 'the second final');
    st = await challengeStars(t);
    t.equal(st['double-crown'].g, 5, 'Double Crown: both finals won on Varsity, the first by 2: the win and skill stars only');
    await t.page.reload();
    await waitFor(t, (s) => s.scene === 'title', 10000, 'reloaded');
    t.equal((await challengeStars(t))['2a7-showdown'].g, 7, 'the stars are still there after a reload');
    await click(t, 'challenges');
    t.equal(await t.page.locator('.stars .star-row[aria-label="3 of 3 stars"]').count(), 1, 'the card shows three stars');
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S3-06-challenges-stars');
    await click(t, 'title');
    await click(t, 'trophies');
    txt = await t.page.innerText('#screen');
    t.expect(/Challenge stars: \d+ of 18/.test(txt), `the Trophy Room sums the stars (${(txt.match(/Challenge stars: [^\n]*/) || [''])[0]})`);
  },
});

tests.push({
  name: 'S3-06: a save from before stars (challenge done, no stars entry) shows one star and nothing is lost',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.page.evaluate(() => localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { tipsSeen: true }, trophies: [], unlocks: { throwback: true }, best: { shootout: 41 }, challenges: { '1912-colors': true, 'lady-trojans-five': true } })));
    await t.reload();
    await waitFor(t, (s) => s.scene === 'title', 10000, 'reloaded');
    await click(t, 'challenges');
    t.equal(await t.page.locator('.stars .star-row[aria-label="1 of 3 stars"]').count(), 2, 'each of the two old wins shows one star');
    t.equal(await t.page.locator('.stars .star-row[aria-label="0 of 3 stars"]').count(), 4, 'the rest show none');
    await click(t, 'title');
    await click(t, 'trophies');
    t.expect(/Challenge stars: 2 of 18/.test(await t.page.innerText('#screen')), 'the Trophy Room counts them: 2 of 18');
    const s = await t.state();
    t.expect(s.unlocks.throwback === true && s.best.shootout === 41 && s.challenges['1912-colors'] === true, 'the unlock, the best and the wins are untouched');
  },
});

tests.push({
  name: 'S3-04: Hot Streak keeps a best for each difficulty, the meter assist apart, and says which one a run beat',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    const finish = async (score) => {
      await t.game('newGame', { mode: 'shootout', paused: true });
      await t.game('setState', { shootout: { phase: 'live', score, t: 0.05 } });
      await t.game('pause', false);
      return stepUntil(t, (x) => x.scene === 'shootoutEnd', 400, 10, 'the end');
    };
    await t.game('setState', { settings: { difficulty: 2, assist: true } });
    await finish(55);
    await t.game('setState', { settings: { difficulty: 2, assist: false } });
    await finish(31);
    let txt = await t.page.innerText('#screen');
    t.expect(/Best: 55/.test(txt), 'the overall best is still the assisted 55');
    t.expect(/Best on All-State: 31/.test(txt) && /with the meter assist: 55/.test(txt), `the result shows All-State 31 and the assisted 55 apart (${txt.replace(/\n+/g, ' | ').slice(txt.indexOf('Best:'), txt.indexOf('Best:') + 120)})`);
    t.expect(!/New best on/.test(txt), 'the first run in a tier is not announced as a tier record');
    await finish(36);
    txt = await t.page.innerText('#screen');
    t.expect(/New best on All-State!/.test(txt) && /Best on All-State: 36/.test(txt), 'a better run on the same difficulty is a new best there');
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S3-04-hot-streak-tiers');
    await finish(20);
    txt = await t.page.innerText('#screen');
    t.expect(!/New best on/.test(txt) && /Best on All-State: 36/.test(txt), 'a worse run keeps it');
    await t.game('setState', { settings: { difficulty: 0, assist: false } });
    await finish(44);
    t.equal(JSON.stringify((await t.state()).best.tiers), JSON.stringify({ 0: 44, 2: 36, '2a': 55 }), 'each tier is stored on its own');
    await t.page.reload();
    await waitFor(t, (s) => s.scene === 'title', 10000, 'reloaded');
    t.equal(JSON.stringify((await t.state()).best.tiers), JSON.stringify({ 0: 44, 2: 36, '2a': 55 }), 'and survives a reload');
    await t.game('setState', { settings: { difficulty: 2 } });
    await click(t, 'shootoutSetup');
    txt = await t.page.innerText('#screen');
    t.expect(/Best on All-State: 36 · with the meter assist: 55/.test(txt), `the setup card shows the tier bests (${(txt.match(/Best on[^\n]*/) || [''])[0]})`);
    await shot(t, 'S3-04-hot-streak-setup');
  },
});

tests.push({
  name: 'S3-04: a state-title banner records the difficulty and the assist it was played on, and a simulated one says it was simulated',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(4);
    await t.game('setState', { settings: { difficulty: 2, assist: true } });
    await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 9 });
    for (let k = 0; k < 3; k++) await t.game('act', 'seasonResult', 50, 40);
    await t.game('act', 'seasonResult', 48, 41);
    await t.game('act', 'seasonResult', 52, 49);
    await click(t, 'playSeason');
    await t.game('pause');
    const s = await t.state();
    await t.game('act', 'finishGame', { winner: s.match.user.team });
    await waitFor(t, (x) => x.scene === 'final', 8000, 'the final screen');
    await click(t, 'afterSeasonGame');
    const played = (await t.state()).trophies;
    t.expect(played.length === 1 && played[0].diff === 2 && played[0].assist === true && played[0].seasonSeed == null, `a played title is saved with All-State and the assist (${JSON.stringify(played[0])})`);
    // Another season, simulated from the hub until one wins the title (about one in six does): marked as simulated and given no difficulty.
    for (let seed = 1; seed <= 60 && (await t.state()).trophies.length < 2; seed++) {
      await t.game('newGame', { mode: 'season', school: 'lakeside', program: 'boys', length: 'short', seed });
      for (let g = 0; g < 12 && !(await t.state()).season.done; g++) await t.game('act', 'sim');
    }
    const all = (await t.state()).trophies;
    t.expect(all.length === 2 && all[1].seasonSeed != null && all[1].diff === undefined, `a simulated title carries its season seed and no difficulty (${JSON.stringify(all[1])})`);
    await t.game('scene', 'trophies');
    const txt = await t.page.innerText('#screen');
    t.expect(/All-State with meter assist/.test(txt), 'the Trophy Room says the played banner was All-State with the meter assist');
    t.expect(/simulated/.test(txt), 'and the other one was simulated');
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S3-04-trophy-room-tags');
  },
});

// ---------------------------------------------------------------- S3-02 difficulty changes the opponent's roster
const mkTeam = async (k, q = 1) => {
  const rost = await load('roster.js');
  return { key: k, name: k, short: k, abbr: k.slice(0, 3), mascot: 'x', crest: null, colors: { primary: '#fff', secondary: '#000' }, kit: {}, roster: rost.makeRoster(k, 'boys', 5, q) };
};

tests.push({
  name: 'S3-02: the opponent is a better team on All-State and a weaker one on Rookie; the player\'s team, Varsity and a demo game are untouched (node)',
  node: true,
  async run(t) {
    const sim = await load('sim.js'), R = await load('rules.js');
    const home = await mkTeam('aaa'), away = await mkTeam('bbb');
    const KEYS = ['sht', 'ins', 'def', 'reb'], OTHER = ['pas', 'hnd', 'spd', 'blk', 'ft', 'jmp'];
    const make = (difficulty, user) => sim.createMatch({ mode: 'exhibition', home, away, seed: 7, user, difficulty, rules: { qLen: 120, shotClock: 35 } });
    const avg = (T, k) => T.roster.reduce((a, r) => a + r[k], 0) / T.roster.length;
    const base = Object.fromEntries(KEYS.map((k) => [k, avg(away, k)]));
    t.expect(R.EDGE_ALLSTATE === 0.05 && R.EDGE_ROOKIE === 0.08, 'the edges are named constants: +0.05 on All-State, -0.08 on Rookie');
    t.expect(R.DIFF[0].edge === -R.EDGE_ROOKIE && R.DIFF[1].edge === 0 && R.DIFF[2].edge === R.EDGE_ALLSTATE, 'Rookie loses it, Varsity is as before, All-State gains it');
    for (const [d, edge] of [[2, R.EDGE_ALLSTATE], [1, 0], [0, -R.EDGE_ROOKIE]]) {
      const m = make(d, 0);
      for (const k of KEYS) {
        const diff = avg(m.teams[1], k) - base[k];
        t.expect(Math.abs(diff - edge) < 0.012, `difficulty ${d}: the opponent's ${k} moves by ${edge} (${diff.toFixed(3)}; a few players sit at the 0.97 cap)`);
      }
      t.expect(OTHER.every((k) => avg(m.teams[1], k) === avg(away, k)), `difficulty ${d}: passing, handling, speed, blocks, free throws and jumping are not touched`);
      t.expect(KEYS.every((k) => avg(m.teams[0], k) === avg(home, k)), `difficulty ${d}: the player's own team is not touched`);
    }
    const mine = make(2, 1);
    t.expect(KEYS.every((k) => Math.abs(avg(mine.teams[0], k) - avg(home, k) - R.EDGE_ALLSTATE) < 0.012) && KEYS.every((k) => avg(mine.teams[1], k) === avg(away, k)), 'with the player on the away side it is the home team that gets the edge');
    const demo = make(2, -1);
    t.expect(KEYS.every((k) => avg(demo.teams[0], k) === avg(home, k) && avg(demo.teams[1], k) === avg(away, k)), 'a demo game with no player gives neither team an edge');
    t.expect(KEYS.every((k) => avg(away, k) === base[k]), 'the roster the game keeps for the school is not changed');
    t.expect(make(2, 0).teams[1].roster.every((r) => KEYS.every((k) => r[k] <= 0.97 && r[k] >= 0.1)), 'no rating leaves the 0.1 to 0.97 range');
  },
});


// ---------------------------------------------------------------- S1-05 steals reward position, blocks reward timing
async function soloDefence() {
  const sim = await load('sim.js');
  const home = await mkTeam('aaa'), away = await mkTeam('bbb');
  const mk = (seed) => {
    const m = sim.createMatch({ mode: 'exhibition', home, away, seed, user: 0, difficulty: 1, rules: { qLen: 240, shotClock: 35 } });
    for (const T of m.teams) for (const r of T.roster) { r.def = 0.65; r.hnd = 0.65; r.blk = 1; }
    m.phase = 'live'; m.clock.running = true;
    return m;
  };
  return { sim, mk };
}

tests.push({
  name: 'S1-05: a steal from in front of the ball handler works more often than from beside him, and from behind least (node)',
  node: true,
  async run(t) {
    const { sim, mk } = await soloDefence();
    // The handler (team 0, slot 0) faces +x. The defender (team 1, slot 0) stands dx feet in front of him (+) or behind him (-), 2 feet to the side.
    const rate = (dx, N = 600) => {
      let won = 0;
      for (let seed = 1; seed <= N; seed++) {
        const m = mk(seed);
        sim.give(m, 0);
        const h = m.p[0], d = m.p[5];
        for (let i = 1; i < 10; i++) if (i !== 5) { m.p[i].x = 80 + i; m.p[i].z = 5; }
        Object.assign(h, { x: 40, z: 25, face: 1 });
        Object.assign(d, { x: 40 + dx, z: 27, cool: 0, stun: 0 });
        if (sim.trySteal(m, 5) && m.ball.holder === 5) won++;
      }
      return won / N;
    };
    const front = rate(2), side = rate(0), behind = rate(-2);
    // These use the sim's own seeded stream, so the numbers are the same every run.
    t.expect(front > side * 1.15 && side > behind * 1.6, `front ${front.toFixed(3)} beats side ${side.toFixed(3)} beats behind ${behind.toFixed(3)}`);
    t.expect(side > 0.12 && side < 0.22, `the old rate for a mid-rated defender (${side.toFixed(3)}) is what the side position gives, about 0.16`);
  },
});

tests.push({
  name: 'S1-05: a block is likelier with the hands well above the ball and close to the shooter (node)',
  node: true,
  async run(t) {
    const { sim, mk } = await soloDefence();
    // A shot is in the air; the defender (`height` inches tall, in the air `y` feet) is `dist` feet from the ball.
    const blocks = (dist, height, y, N = 500) => {
      let n = 0;
      for (let seed = 1; seed <= N; seed++) {
        const m = mk(seed);
        sim.give(m, 0);
        m.teams[1].roster[m.p[5].r].height = height;
        for (let i = 1; i < 10; i++) if (i !== 5) { m.p[i].x = 80 + i; m.p[i].z = 5; }
        Object.assign(m.p[0], { x: 70, z: 25, tx: 70, tz: 25 });
        sim.forceShot(m, 0, 1);
        for (let k = 0; k < 120 && m.ball.state === 'held'; k++) sim.tick(m);
        if (m.ball.state !== 'shot') continue;
        const q = m.p[5];
        for (let k = 0; k < 60 && m.ball.state === 'shot'; k++) {
          Object.assign(q, { x: m.ball.x + dist, z: m.ball.z, y, vy: 0, stun: 0 });
          sim.tick(m);
          if (m.ev.some((e) => e.k === 'block')) { n++; break; }
          m.ev.length = 0;
        }
      }
      return n / N;
    };
    const good = blocks(0.3, 80, 1.5), poor = blocks(1.7, 66, 0.41);
    t.expect(good > poor * 1.8, `a tall defender close to the shooter and well off the floor blocks ${good.toFixed(3)} against ${poor.toFixed(3)} for a short one at arm's length, hands just over the ball`);
    t.expect(good < 0.35, `and a block is still never a sure thing (${good.toFixed(3)})`);
  },
});

tests.push({
  name: 'S3-08: the AI takes the same share of threes as before (it makes more of them, it does not shoot more of them) (node)',
  node: true,
  async run(t) {
    const sim = await load('sim.js'), rost = await load('roster.js'), D = await load('data.js');
    const mk = (key, side, program) => { const tm = D.team(key); return { ...tm, roster: rost.makeRoster(tm.key, program, tm.cls, 1), kit: D.kitFor(tm, side) }; };
    const keys = D.COUNTY.map((c) => c.key);
    let fga = 0, tpa = 0, tpm = 0;
    for (let g = 0; g < 30; g++) {
      // Seeded demo games between county teams, two AI sides: the sim's stream is fixed, so these counts are the same every run.
      const a = keys[g % 7], b = keys[(g * 3 + 1) % 7 === g % 7 ? (g + 1) % 7 : (g * 3 + 1) % 7], program = g % 2 ? 'girls' : 'boys';
      const m = sim.createMatch({ mode: 'demo', home: mk(a, 'home', program), away: mk(b, 'away', program), program, rules: { qLen: 60, shotClock: 35 }, seed: 2000 + g, user: -1, difficulty: 1, autoBreak: true });
      for (let k = 0; k < 60 * 4000 && m.phase !== 'final'; k++) { sim.tick(m); m.ev.length = 0; }
      for (const row of sim.boxScore(m)) for (const p of row) { fga += p.fga; tpa += p.tpa; tpm += p.tpm; }
    }
    // Measured over these 30 games: threes were 44.0% of shots and 32.0% made before S3-08; 51.1% and 37.7% with the new base and the AI valuing a three as before; 44.6% and 37.6% now.
    const share = tpa / fga;
    t.expect(share >= 0.40 && share <= 0.48, `threes are ${(share * 100).toFixed(1)}% of the AI's shots (44% before S3-08, 51% if the AI valued a three as it did)`);
    t.expect(tpm / tpa >= 0.35, `and it makes ${(100 * tpm / tpa).toFixed(1)}% of them (32% before)`);
  },
});
