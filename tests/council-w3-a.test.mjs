import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition, hqSettled, ready3d, shotFromInPage } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Wave 3, batch A: saves, lifecycle and robustness.

export const tests = [
  {
    name: 'P-N02: a new match starts with no replay cooldown, no queued replay and no old frames',
    viewports: ['desktop'],
    async run(t) {
      await exhibition(t, { seed: 11 });
      await t.game('step', 120);
      let s = await t.state();
      t.equal(s.replayGate.pending, false, 'nothing is queued at the start');
      t.expect(s.replayGate.frames >= 100, `the recorder holds the first game's frames (${s.replayGate.frames})`);
      t.equal(await t.game('act', 'replay', 'THREE', 1), true, 'a replay starts in game one');
      await t.game('act', 'endReplay');
      s = await t.state();
      t.expect(s.replayGate.at != null && s.replayGate.at > 0, `the cooldown is stamped with game one's clock (${s.replayGate.at})`);
      t.equal(await t.game('act', 'queueReplay', 'DUNK'), false, 'inside the cooldown a new replay is not queued');
      // a game quit with a replay still queued, after a replay that stamped late in the match
      await t.game('act', 'finishGame');
      await exhibition(t, { seed: 12 });
      s = await t.state();
      t.equal(s.replayGate.at, null, 'game two has no cooldown from game one');
      t.equal(s.replayGate.pending, false, 'game two has no queued replay');
      t.equal(s.replayGate.frames, 0, 'game two does not hold game one\'s frames');
      t.equal(await t.game('act', 'queueReplay', 'THREE'), true, 'an early three in game two can be queued for a replay');
      await exhibition(t, { seed: 13 });
      s = await t.state();
      t.equal(s.replayGate.pending, false, 'a replay queued in a game that was left is gone from the next one');
    },
  },
];

// A context whose state the test can set, standing in for Safari's 'interrupted' (after a call or the lock screen).
const fakeAudio = () => {
  const Native = window.AudioContext;
  window.__ac = { resumes: 0, fake: null, reject: false };
  window.AudioContext = class extends Native {
    get state() { return window.__ac.fake || super.state; }
    resume() { window.__ac.resumes++; if (window.__ac.reject) return Promise.reject(new Error('refused')); window.__ac.fake = null; return super.resume(); }
  };
};
const gesture = async (t) => { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(100); };
const ac = (t) => t.page.evaluate(() => ({ ...window.__ac, state: window.__game.getState().audio.state }));

tests.push({
  name: 'S6-10: audio that iOS left in the interrupted state is resumed by the next gesture, and a refused resume is not an error',
  viewports: ['desktop'],
  initScript: fakeAudio,
  async run(t) {
    await gesture(t);
    t.equal((await ac(t)).state, 'running', 'the first gesture starts the audio');
    await t.page.evaluate(() => { window.__ac.fake = 'interrupted'; });
    t.equal((await ac(t)).state, 'interrupted', 'the context is interrupted');
    const before = (await ac(t)).resumes;
    await t.page.evaluate(() => { window.__ac.reject = true; });
    await gesture(t);
    let a = await ac(t);
    t.expect(a.resumes > before, `a gesture asks an interrupted context to resume (${before} -> ${a.resumes})`);
    t.equal(a.state, 'interrupted', 'a refused resume leaves it interrupted, with no error');
    await t.page.evaluate(() => { window.__ac.reject = false; });
    await gesture(t);
    a = await ac(t);
    t.equal(a.state, 'running', 'the next gesture brings it back');
    t.equal((await t.page.evaluate(() => { const g = window.__game; return g.getState().audio.on; })), true, 'sound is still on');
  },
});

const SHOTS = '../_council/hsg-basketball/wave-3/shots';

tests.push({
  name: 'S2-04: Hot Streak has a Paused card with Resume and Quit, and the run is frozen behind it',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(5);
    await t.game('newGame', { mode: 'shootout' });
    const touch = t.viewport === 'mobile';
    if (touch) await t.page.tap('#b-pause'); else await t.page.keyboard.press('KeyP');
    let s = await t.state();
    t.equal(s.scene, 'soPause', 'the pause control opens the pause card');
    t.equal(s.paused, true, 'the run is paused');
    const txt = await t.page.evaluate(() => ({ shown: !document.querySelector('#screen').hidden, text: document.querySelector('#screen').innerText, acts: [...document.querySelectorAll('#screen [data-act]')].map((b) => b.dataset.act) }));
    t.expect(txt.shown && /Paused/.test(txt.text), 'a PAUSED card is on screen');
    t.expect(txt.acts.includes('resume') && txt.acts.includes('quit'), 'it offers Resume and Quit');
    const t0 = s.shootout.t;
    await t.waitFrames(8);
    t.equal((await t.state()).shootout.t, t0, 'the clock does not run behind the card');
    await t.shot('s2-04-hot-streak-paused', { allowBlank: false });
    await t.page.screenshot({ path: `${SHOTS}/S2-04-hot-streak-paused-${t.viewport}.png` });
    await t.checkLayout();
    // Resume (and P / Escape do the same)
    await t.page.click('[data-act="resume"]');
    s = await t.state();
    t.equal(s.scene, 'shootout', 'Resume returns to the run');
    t.equal(s.paused, false, 'and unpauses it');
    await t.game('pause');
    await t.page.keyboard.press('Escape');
    s = await t.state();
    t.equal(s.scene, 'soPause', 'Escape pauses');
    await t.page.keyboard.press('Escape');
    t.equal((await t.state()).scene, 'shootout', 'Escape resumes');
    // a tab switch or blur pauses with the card, as in a match
    await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
    t.equal((await t.state()).scene, 'soPause', 'losing focus opens the card');
    // Quit asks first, then goes to the menu
    await t.page.click('[data-act="quit"]');
    s = await t.state();
    t.equal(s.scene, 'soPause', 'the first Quit press only asks');
    t.expect(/lost/.test(await t.page.innerText('#screen')), 'the card says the run will be lost');
    await t.page.click('[data-act="quit"]');
    s = await t.state();
    t.equal(s.scene, 'title', 'the second Quit press leaves');
    t.equal(s.shootout, null, 'the run is gone');
    t.equal(s.paused, false, 'and nothing stays paused');
  },
});

const rect = (t, sel) => t.page.evaluate((s) => { const e = document.querySelector(s); if (!e || e.hidden || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, sel);
const apart = (a, b) => a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y;

tests.push({
  name: 'S2-25, S5-10: a speaker button beside Pause mutes in play, and the pause cards have a Sound row; both are the saved Sound setting',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t, { seed: 4 });
    const mute = await rect(t, '#b-mute'), pause = await rect(t, '#b-pause');
    t.expect(mute && pause, 'the speaker and pause buttons are both on screen in play');
    t.expect(mute.w >= 44 && mute.h >= 44, `the speaker is at least 44 px (${mute.w}x${mute.h})`);
    t.expect(apart(mute, pause), 'the speaker does not overlap the pause button');
    const stage = await rect(t, '#stage');
    t.expect(mute.x >= stage.x && mute.x + mute.w <= stage.x + stage.w && mute.y >= stage.y && mute.y + mute.h <= stage.y + stage.h, 'and sits inside the stage');
    t.equal(await t.page.getAttribute('#b-mute', 'aria-pressed'), 'true', 'Sound is on at the start, and the button says so');
    await t.shot('s2-25-speaker-in-play');
    await t.page.screenshot({ path: `${SHOTS}/S2-25-speaker-in-play-${t.viewport}.png` });
    if (t.viewport === 'mobile') await t.page.tap('#b-mute'); else await t.page.click('#b-mute');
    let s = await t.state();
    t.equal(s.settings.sound, false, 'one press turns sound off');
    t.equal(s.audio.on, false, 'the audio is off');
    t.equal(await t.page.getAttribute('#b-mute', 'aria-pressed'), 'false', 'the button shows it is off');
    t.equal(s.scene, 'game', 'and play carries on (no card opens)');
    await t.shot('s2-25-speaker-off');
    await t.page.screenshot({ path: `${SHOTS}/S2-25-speaker-off-${t.viewport}.png` });
    await t.page.keyboard.press('KeyM');
    t.equal((await t.state()).settings.sound, true, 'the M key still toggles the same setting');
    await t.page.click('#b-mute');
    await t.reload();
    t.equal((await t.state()).settings.sound, false, 'the choice is saved with the settings');
    // the pause card
    await t.game('scene', 'pause');
    t.expect(/Sound: Off/.test(await t.page.innerText('#screen')), 'the pause card says Sound: Off');
    await t.page.click('[data-act="toggleSound"]');
    s = await t.state();
    t.equal(s.settings.sound, true, 'its Sound button turns sound back on');
    t.expect(/Sound: On/.test(await t.page.innerText('#screen')), 'and the card now says Sound: On');
    await t.shot('s2-25-pause-card');
    await t.page.screenshot({ path: `${SHOTS}/S2-25-pause-card-${t.viewport}.png` });
    await t.checkLayout();
    // Hot Streak has the same two
    await t.game('newGame', { mode: 'shootout' });
    t.expect(!!(await rect(t, '#b-mute')), 'the speaker is there in Hot Streak');
    await t.game('scene', 'soPause');
    t.expect(/Sound: On/.test(await t.page.innerText('#screen')), 'and so is the Sound row on its pause card');
    await t.game('scene', 'title');
    t.equal(await rect(t, '#b-mute'), null, 'the speaker is not on the title');
  },
});

const blockStorage = () => {
  for (const f of ['getItem', 'setItem', 'removeItem']) Storage.prototype[f] = () => { throw new Error('storage blocked'); };
};
const warns = (t) => t.page.evaluate(() => [...document.querySelectorAll('#screen .warn')].map((e) => e.textContent.trim()));

tests.push({
  name: 'S2-28: with storage blocked the title says progress will not be kept, once',
  viewports: ['desktop', 'mobile'],
  initScript: blockStorage,
  async run(t) {
    await t.game('scene', 'title');
    const w = await warns(t);
    t.equal(w.length, 1, `one warning on the title (${w.length})`);
    t.expect(/Saving is unavailable/.test(w[0] || '') && /close the page/.test(w[0] || ''), `it says saving is unavailable: "${w[0]}"`);
    t.equal(await t.page.getAttribute('#screen .warn', 'role'), 'status', 'it is announced as a status');
    await t.shot('s2-28-title-storage-blocked');
    await t.page.screenshot({ path: `${SHOTS}/S2-28-title-storage-blocked-${t.viewport}.png` });
    await t.checkLayout();
    // a change that tries to save raises the usual notice: the title must not say it twice
    await t.game('setState', { settings: { sound: false } });
    await t.game('scene', 'settings');
    await t.game('scene', 'title');
    t.equal((await warns(t)).length, 1, 'still one warning after a save attempt fails');
  },
});
tests.push({
  name: 'S2-28: the title has no saving warning when storage works',
  viewports: ['desktop'],
  async run(t) {
    await t.game('scene', 'title');
    t.equal((await warns(t)).length, 0, 'no warning');
    t.expect(!/Saving is unavailable/.test(await t.page.innerText('#screen')), 'and no mention of saving');
  },
});

const KEY = 'hsg-hoops-v1';
const TRO = (school, program, n) => ({ school, program, cls: '5A', label: `Season ${n} state champions`, record: '10-1' });

tests.push({
  name: 'S3-17: the banners you win hang with the real ones, marked and numbered, for your school and program only (node)',
  node: true,
  async run(t) {
    globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
    globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
    const { banners } = await import(pathToFileURL(path.join(game, 'src/js/data.js')).href);
    const real = banners('hot-springs', 'girls').map((p) => p.year);
    t.equal(JSON.stringify(real), JSON.stringify([1990, 1997, 1998, 2015, 2018]), 'with no list the real titles are unchanged');
    t.expect(banners('hot-springs', 'girls').every((p) => !p.mine), 'and none is marked as yours');
    const tro = [TRO('hot-springs', 'girls', 1), TRO('lakeside', 'boys', 2), TRO('hot-springs', 'girls', 3), TRO('hot-springs', 'boys', 4)];
    const girls = banners('hot-springs', 'girls', tro);
    t.equal(girls.length, 7, 'Hot Springs girls: five real banners and two of yours');
    t.equal(JSON.stringify(girls.filter((p) => p.mine).map((p) => p.year)), JSON.stringify([1, 3]), 'yours carry the Trophy Room season numbers');
    t.equal(JSON.stringify(girls.slice(0, 5).map((p) => p.year)), JSON.stringify(real), 'the real years come first and are untouched');
    t.expect(girls.filter((p) => p.mine).every((p) => p.label === 'YOUR SEASON'), 'yours say YOUR SEASON');
    t.equal(banners('hot-springs', 'boys', tro).filter((p) => p.mine).map((p) => p.year).join(), '4', 'the boys gym shows only the boys season');
    t.equal(banners('lakeside', 'girls', tro).filter((p) => p.mine).length, 0, 'a title won in the boys program does not hang in the girls gym');
    t.equal(banners('lakeside', 'boys', tro).filter((p) => p.mine).map((p) => p.year).join(), '2', 'another school\'s gym shows its own season');
    t.equal(banners('jessieville', 'boys', tro).length, 0, 'a school you never won with stays bare');
    const many = Array.from({ length: 9 }, (_, i) => TRO('jessieville', 'boys', i + 1));
    t.equal(banners('jessieville', 'boys', many).map((p) => p.year).join(), '7,8,9', 'only the latest three hang, so the wall never overflows');
    t.equal(banners('thistledown', 'boys', [TRO('thistledown', 'boys', 1)]).length, 1, 'a fictional school you won with hangs your banner (and no real ones)');
    t.expect(banners('hot-springs', 'girls', [null, { school: 5 }, 7]).length === 5, 'damaged list entries are ignored');
  },
});
tests.push({
  name: 'S3-17: a saved season title hangs in the gym you play in, in 3D and in the classic court',
  viewports: ['desktop', 'mobile'],
  initScript: () => { try { if (!localStorage.getItem('hsg-hoops-v1')) localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { graphics: '3d' }, trophies: [{ school: 'hot-springs', program: 'girls', cls: '5A', label: 'Season 1 state champions', record: '10-1' }, { school: 'lakeside', program: 'boys', cls: '5A', label: 'Season 2 state champions', record: '9-2' }], unlocks: { throwback: false }, best: { shootout: 0 }, challenges: {} })); } catch (e) { /* blocked */ } },
  async run(t) {
    await ready3d(t);
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'girls', user: 'home', seed: 3, paused: true });
    let pens = await t.game('act', 'pennants');
    t.equal(pens.filter((p) => p.mine).length, 1, 'the girls gym at Hot Springs has your banner');
    t.equal(pens.filter((p) => !p.mine).length, 5, 'beside the five real ones');
    await t.game('step', 10);
    await hqSettled(t);
    await t.game('act', 'cam', { p: [0, 22, 70], t: [0, 14, -22], fov: 50 });
    await t.shot('s3-17-end-wall-3d');
    await t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/S3-17-your-banner-3d-${t.viewport}.png` });
    await t.game('act', 'cam', null);
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 3, paused: true });
    pens = await t.game('act', 'pennants');
    t.equal(pens.filter((p) => p.mine).length, 0, 'the boys gym at Hot Springs has none of yours');
    await t.game('newGame', { mode: 'exhibition', home: 'lakeside', away: 'hot-springs', program: 'boys', user: 'home', seed: 3, paused: true });
    pens = await t.game('act', 'pennants');
    t.equal(pens.filter((p) => p.mine).map((p) => p.year).join(), '2', 'Lakeside\'s gym hangs your Lakeside season');
    await t.game('newGame', { mode: 'exhibition', home: 'lakeside', away: 'hot-springs', program: 'boys', user: 'away', seed: 3, paused: true, venue: 'arena' });
    pens = await t.game('act', 'pennants');
    t.equal(pens.length, 0, 'the finals arena hangs no gym pennants');
    await t.game('setState', { settings: { graphics: '2d' } });
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'girls', user: 'home', seed: 3, paused: true });
    await t.game('step', 5);
    await t.shot('s3-17-classic-court');
    await t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/S3-17-your-banner-classic-${t.viewport}.png` });
  },
});

tests.push({
  name: 'S4-08: a replay on a phone is not smeared by depth of field; on the big screen it keeps its cinema look',
  viewports: ['desktop', 'mobile'],
  initScript: () => { try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { graphics: '3d' } })); } catch (e) { /* blocked */ } },
  async run(t) {
    await ready3d(t);
    await exhibition(t, { seed: 6, home: 'hot-springs', away: 'lakeside', program: 'girls' });
    await t.game('step', 200);
    await hqSettled(t);
    let g = (await t.state()).gfx;
    t.equal(g.post.cinema, false, 'live play has no cinema effects');
    t.equal(await t.game('act', 'replay', 'THREE', 1, 0.5), true, 'a replay starts');
    await t.waitFrames(4);
    g = (await t.state()).gfx;
    t.equal(g.post.cinema, true, 'the replay camera is in cinema mode');
    t.equal(g.tier, t.viewport === 'mobile' ? 'medium' : 'high', 'the tier is the one this screen gets');
    t.equal(g.post.dof, t.viewport === 'desktop', t.viewport === 'mobile' ? 'no depth of field on the phone tier' : 'depth of field stays on the high tier');
    await t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/S4-08-replay-${t.viewport}.png` });
    await t.game('act', 'endReplay');
    t.equal((await t.state()).gfx.post.cinema, false, 'and the effects are off again after it');
  },
});

// Vibration: navigator.vibrate is replaced by a recorder.
const recordVibrate = () => { window.__vib = []; Object.defineProperty(navigator, 'vibrate', { value: (p) => { window.__vib.push(p); return true; }, configurable: true, writable: true }); };
const vib = (t) => t.page.evaluate(() => window.__vib.slice());
const clearVib = (t) => t.page.evaluate(() => { window.__vib.length = 0; });
const has = (list, p) => list.some((x) => JSON.stringify(x) === JSON.stringify(p));

tests.push({
  name: 'S5-07: a shot release, a rim hit, a basket and the buzzer vibrate a touch player, and nothing else does',
  viewports: ['desktop', 'mobile'],
  initScript: recordVibrate,
  async run(t) {
    await t.game('setState', { settings: { touch: 'on', haptics: true, motion: 'off' } });
    // a forced perfect shot, seed by seed, until one drops
    let made = null;
    for (let seed = 1; seed <= 8 && !made; seed++) {
      await clearVib(t);
      const pts = await t.page.evaluate(shotFromInPage, [seed, 1]);
      if (pts > 0) made = await vib(t);
    }
    t.expect(made, 'a forced perfect release scored for one of the first eight seeds');
    t.equal(JSON.stringify(made && made[0]), JSON.stringify(10), 'the first pulse is the release: 10 ms');
    t.expect(made && has(made, [15, 30, 15]), 'the basket gives the three-part pulse');
    t.expect(made && made.every((p) => p === 10 || p === 20 || has([p], [15, 30, 15])), `and nothing else (${JSON.stringify(made)})`);
    // a rim hit on your own shot: 20 ms
    let rim = null;
    for (let seed = 1; seed <= 12 && !rim; seed++) {
      await clearVib(t);
      await t.page.evaluate(shotFromInPage, [seed, 0.35]);
      const v = await vib(t);
      if (v.includes(20)) rim = v;
    }
    t.expect(rim, 'a mistimed release hit the rim for one of the first twelve seeds');
    // the buzzer
    await exhibition(t, { seed: 3 });
    await t.game('step', 60);
    await clearVib(t);
    await t.game('setState', { match: { t: 0.3 } });
    await t.stepUntil((s) => s.scene === 'break', { max: 900, chunk: 10, label: 'the end of the quarter' });
    t.expect((await vib(t)).includes(40), 'the buzzer at the end of a quarter gives 40 ms');
    // Hot Streak: release, make or miss, start
    await t.game('newGame', { mode: 'shootout', seed: 4 });
    await clearVib(t);
    await t.game('act', 'input', { shoot: true }); await t.game('step', 3);
    await t.game('act', 'input', { shoot: false });
    await t.game('act', 'shootoutShot', 1); await t.game('step', 150);
    const so = await vib(t);
    t.expect(so.includes(40), 'the start buzzer vibrates');
    t.expect(so.includes(10), 'the release vibrates');
    t.expect(has(so, [15, 30, 15]) || so.includes(20), 'and so does the result, a basket or a rim');
  },
});
tests.push({
  name: 'S5-07: no vibration with the setting off, with touch controls off, or under reduced motion; the setting is saved',
  viewports: ['mobile'],
  initScript: recordVibrate,
  async run(t) {
    const shot = async () => { await clearVib(t); await t.page.evaluate(shotFromInPage, [2, 1]); return vib(t); };
    await t.game('setState', { settings: { touch: 'on', haptics: true, motion: 'off' } });
    t.expect((await shot()).length > 0, 'the baseline: pulses when everything is on');
    await t.game('setState', { settings: { haptics: false } });
    t.equal((await shot()).length, 0, 'Vibration off: silent');
    await t.game('setState', { settings: { haptics: true, touch: 'off' } });
    t.equal((await shot()).length, 0, 'touch controls off: silent');
    await t.game('setState', { settings: { touch: 'on', motion: 'on' } });
    t.equal((await shot()).length, 0, 'reduced motion: silent');
    await t.game('setState', { settings: { motion: 'off' } });
    // the Settings row
    await t.game('scene', 'settings');
    t.expect(/Vibration/.test(await t.page.innerText('#screen')), 'Settings has a Vibration switch');
    await t.page.locator('[aria-label="Vibration"]').scrollIntoViewIfNeeded();
    await t.shot('s5-07-settings-vibration');
    await t.page.screenshot({ path: `${SHOTS}/S5-07-settings-vibration-${t.viewport}.png` });
    await clearVib(t);
    await t.page.click('[data-act="setHaptics"][data-arg="0"]');
    t.equal((await t.state()).settings.haptics, false, 'Off is chosen');
    t.equal((await vib(t)).length, 0, 'and gives no pulse');
    await t.reload();
    t.equal((await t.state()).settings.haptics, false, 'it is saved');
    await t.game('scene', 'settings');
    await clearVib(t);
    await t.page.click('[data-act="setHaptics"][data-arg="1"]');
    t.equal(JSON.stringify(await vib(t)), JSON.stringify([[15, 30, 15]]), 'switching it on gives one pulse to feel');
    await t.checkLayout({ allowScrollY: true });
  },
});
tests.push({
  name: 'S5-07: an old save, or a damaged value, gets Vibration on; a browser that cannot vibrate does not show the switch',
  viewports: ['desktop'],
  initScript: () => { delete Navigator.prototype.vibrate; try { delete navigator.vibrate; } catch (e) { /* none */ } },
  async run(t) {
    await t.page.evaluate(([k]) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: { sound: false, haptics: 'yes' }, trophies: [], unlocks: { throwback: false }, best: { shootout: 0 }, challenges: {} })), [KEY]);
    await t.reload();
    const s = await t.state();
    t.equal(s.settings.haptics, true, 'a damaged value reads as the default, on');
    t.equal(s.settings.sound, false, 'and the rest of the old save is as it was');
    await t.game('scene', 'settings');
    t.expect(!/Vibration/.test(await t.page.innerText('#screen')), 'no Vibration switch where the browser cannot vibrate');
    await t.game('setState', { settings: { touch: 'on' } }); // a shot with no vibrate function must not throw (the harness fails the test on any page error)
    await t.page.evaluate(shotFromInPage, [2, 1]);
  },
});

// A game pad the test controls: navigator.getGamepads() returns window.__pad.
const fakePad = () => {
  window.__pad = null;
  Object.defineProperty(navigator, 'getGamepads', { value: () => [window.__pad], configurable: true, writable: true });
};
const pad = (t, axes = [0, 0], down = []) => t.page.evaluate(([a, d]) => {
  window.__pad = { connected: true, id: 'test pad', index: 0, mapping: 'standard', axes: a, buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: d.includes(i), value: d.includes(i) ? 1 : 0 })) };
  window.dispatchEvent(new Event('gamepadconnected'));
}, [axes, down]);
const release = async (t) => { await pad(t, [0, 0], []); await t.waitFrames(3); }; // a press counts once the poll has seen the button up
const tap = async (t, b) => { await pad(t, [0, 0], [b]); await t.waitFrames(2); await release(t); };
const A = 0, B = 1, X = 2, Y = 3, RB = 5, START = 9, UP = 12, DOWN = 13;
const inputIs = (t, f, label) => t.page.waitForFunction(`(${f})(window.__game.getState().input)`, null, { timeout: 5000 }).catch(() => t.fail(`timed out waiting for ${label}`));

tests.push({
  name: 'S2-15: a game pad plays the game: stick moves, A shoots (hold and release), X passes, Y switches, a bumper sprints',
  viewports: ['desktop'],
  initScript: fakePad,
  async run(t) {
    await exhibition(t, { seed: 4 });
    await pad(t, [0.1, -0.1]);
    await t.waitFrames(4);
    let s = (await t.state()).input;
    t.expect(s.mx === 0 && s.mz === 0, 'a stick inside the dead zone does nothing');
    await pad(t, [1, -1]);
    await inputIs(t, (i) => i.mx === 1 && i.mz === -1, 'the stick at full tilt to move');
    await pad(t, [0.6, 0]);
    await inputIs(t, (i) => Math.abs(i.mx - 0.5) < 0.01 && i.mz === 0, 'a half tilt to move at half strength');
    await pad(t, [0, 0], [UP]);
    await inputIs(t, (i) => i.mx === 0 && i.mz === -1, 'the D-pad up to move away from the screen');
    await pad(t, [0, 0], [RB]);
    await inputIs(t, (i) => i.sprint === true && i.mx === 0, 'the bumper to sprint');
    await release(t);
    await inputIs(t, (i) => i.sprint === false, 'letting go of the bumper');
    await pad(t, [0, 0], [A]);
    await inputIs(t, (i) => i.shoot && i.shootP, 'A to start a shot');
    await t.game('step', 1); // the step consumes the press edge
    await release(t);
    await inputIs(t, (i) => !i.shoot && i.shootR, 'letting go of A to release it');
    await t.game('step', 1);
    await pad(t, [0, 0], [X]);
    await inputIs(t, (i) => i.passP, 'X to pass');
    await t.game('step', 1);
    await pad(t, [0, 0], [Y]);
    await inputIs(t, (i) => i.switchP, 'Y to switch');
    await t.game('step', 1);
    await release(t);
    // Start pauses and resumes
    await pad(t, [0, 0], [START]);
    await t.page.waitForFunction(() => window.__game.getState().scene === 'pause', null, { timeout: 5000 });
    await release(t);
    await pad(t, [0, 0], [START]);
    await t.page.waitForFunction(() => window.__game.getState().scene === 'game', null, { timeout: 5000 });
    await release(t);
    // unplugged while A is held: the shot is released, the movement stops
    await pad(t, [1, 0], [A]);
    await inputIs(t, (i) => i.shoot && i.mx === 1, 'a held shot and a held stick');
    await t.page.evaluate(() => { window.__pad = null; });
    await inputIs(t, (i) => !i.shoot && i.mx === 0, 'the pad unplugged: nothing stays held');
  },
});
tests.push({
  name: 'S2-15: a game pad moves through the menus (D-pad, A, B) and Start presses the main button',
  viewports: ['desktop', 'mobile'],
  initScript: fakePad,
  async run(t) {
    await t.game('scene', 'title');
    const focus = async () => (await t.state()).ui.focus;
    t.equal(await focus(), 'seasonSetup', 'the first button has the focus');
    await tap(t, DOWN);
    await t.page.waitForFunction(() => window.__game.getState().ui.focus !== 'seasonSetup', null, { timeout: 5000 }).catch(() => t.fail('D-pad down did not move the focus'));
    const at = await focus(); // a pad held down repeats; a tap moves one step, but A presses wherever the focus is
    t.expect(at && at !== 'seasonSetup', `the focus moved down the menu (${at})`);
    await tap(t, A);
    await t.page.waitForFunction((f) => window.__game.getState().scene === f, at, { timeout: 5000 }).catch(() => t.fail(`A did not press the focused button (${at})`));
    await tap(t, B);
    await t.page.waitForFunction(() => window.__game.getState().scene === 'title', null, { timeout: 5000 }).catch(() => t.fail('B did not go back'));
    await tap(t, START);
    await t.page.waitForFunction(() => window.__game.getState().scene === 'seasonSetup', null, { timeout: 5000 }).catch(() => t.fail('Start did not press the main button'));
    await t.game('scene', 'title');
    // a pad in the title keeps the touch deck away and does not shoot
    const s = (await t.state()).input;
    t.expect(!s.shootP && !s.passP, 'menu presses are not game presses');
    // the Help screen lists the pad
    await t.game('scene', 'help');
    const txt = await t.page.innerText('#screen');
    t.expect(/Game pad/.test(txt) && /Start/.test(txt), 'How to play lists the game pad');
    await t.page.locator('#screen h3', { hasText: 'Game pad' }).scrollIntoViewIfNeeded();
    await t.shot('s2-15-help-game-pad');
    await t.page.screenshot({ path: `${SHOTS}/S2-15-help-game-pad-${t.viewport}.png` });
    await t.checkLayout({ allowScrollY: true });
  },
});
