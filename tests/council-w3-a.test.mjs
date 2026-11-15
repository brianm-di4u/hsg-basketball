import { exhibition } from './helpers.mjs';

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
