import { exhibition, stepUntil } from './helpers.mjs';

// Wave 1, batch A: stability, saves and lifecycle regressions.

// A live paused game where the user's ball handler (player 0) passes to player 1 and the ball is in the air.
async function passInFlight(t) {
  await exhibition(t, { difficulty: 0, seed: 17 });
  await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
  await t.game('act', 'give', 0, 0);
  await t.game('act', 'place', 0, 0, 50, 25);
  await t.game('act', 'place', 0, 1, 62, 14);
  for (let s = 2; s < 5; s++) await t.game('act', 'place', 0, s, 8, 5 + s * 8);
  for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 12, 4 + s * 10);
  await t.game('act', 'input', { pass: true });
  await t.game('step', 2);
  const s = await t.state();
  t.equal(s.match.ball.state, 'pass', 'the pass is in the air');
  return s;
}

export const tests = [
  {
    name: 'S1-03: a shoot press made while a pass is in flight shoots on the catch and does not jump',
    viewports: ['desktop'],
    async run(t) {
      await passInFlight(t);
      await t.game('act', 'input', { shoot: true }); // pressed and held during the flight
      let s = await t.state(), jumped = false, caught = null;
      for (let k = 0; k < 90 && caught == null; k++) {
        await t.game('step', 1);
        s = await t.state();
        if (s.match.players[0].act === 'jump' || s.match.players[0].y > 0) jumped = true;
        if (s.match.ball.state === 'held') caught = s.match.ball.holder;
      }
      t.expect(!jumped, 'the passer does not leap');
      t.expect(caught != null && caught > 0 && caught < 5, `a teammate caught the pass (holder ${caught})`);
      await t.game('step', 2);
      s = await t.state();
      const c = s.match.players[caught];
      t.expect(c && (c.act === 'shoot' || c.act === 'layup' || s.match.ball.state === 'shot'), `the catcher is shooting (act ${c && c.act}, ball ${s.match.ball.state})`);
    },
  },
  {
    name: 'S1-03: a stale shoot tap before the catch does not start a shot',
    viewports: ['desktop'],
    async run(t) {
      await passInFlight(t);
      await t.game('act', 'input', { shoot: true });
      await t.game('step', 1);
      await t.game('act', 'input', { shoot: false });
      let s = await t.state(), ticks = 1, caught = null;
      for (let k = 0; k < 90 && caught == null; k++) {
        await t.game('step', 1); ticks++;
        s = await t.state();
        if (s.match.ball.state === 'held') caught = s.match.ball.holder;
      }
      t.expect(ticks > 12, `the catch came more than 0.15 s after the tap (${ticks} ticks)`);
      t.expect(caught != null && s.match.players[caught].act !== 'shoot' && s.match.players[caught].act !== 'layup', 'no shot was started from the old tap');
    },
  },
];

export const quitTests = [
  {
    name: 'S2-05: Quit needs a second press and says the game will be lost',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await exhibition(t, { seed: 71 });
      await t.game('scene', 'pause');
      await t.page.click('[data-act="quit"]');
      let s = await t.state();
      t.equal(s.scene, 'pause', 'one press does not quit');
      t.expect(s.match != null, 'the match is still there after one press');
      const text = await t.page.textContent('#screen');
      t.expect(/lost/i.test(text), 'the screen says the game will be lost');
      await t.page.click('[data-act="resume"]');
      await t.game('scene', 'pause');
      t.expect(!/lost/i.test(await t.page.textContent('#screen')), 'the warning does not carry over after Resume');
      await t.page.click('[data-act="quit"]');
      s = await t.state();
      t.equal(s.scene, 'pause', 'the first press after Resume asks again');
      await t.page.click('[data-act="quit"]');
      s = await t.state();
      t.equal(s.scene, 'title', 'second press quits to the menu');
      t.equal(s.match, null, 'the match is discarded');
    },
  },
];
tests.push(...quitTests);

const KEY = 'hsg-hoops-v1';
const put = (t, v) => t.page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === 'string' ? s : JSON.stringify(s)), [KEY, v]);
const rawSave = (t) => t.page.evaluate((k) => localStorage.getItem(k), KEY);
async function loadWith(t, v) { await put(t, v); await t.reload(); }

export const hostileSaveTests = [
  {
    name: 'S6-01: a season with an unknown school boots to the title and is not loaded',
    viewports: ['desktop'],
    async run(t) {
      const bad = JSON.stringify({ v: 1, season: { school: 'nope', seed: 1, games: [{}] } });
      await loadWith(t, bad);
      const s = await t.state();
      t.equal(s.scene, 'title', 'the title appears');
      t.equal(s.season, null, 'the unusable season is not loaded');
      t.equal(await rawSave(t), bad, 'the stored record is left untouched');
      await t.page.click('[data-act="settings"]');
      t.equal((await t.state()).scene, 'settings', 'menus still work');
    },
  },
  {
    name: 'S6-01: a season with a bad schedule entry or bracket is not loaded',
    viewports: ['desktop'],
    async run(t) {
      const ok = await (async () => { await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 5 }); return (await t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)).season, KEY)); })();
      t.expect(ok && ok.games.length > 0, 'a real season was saved to start from');
      const variants = {
        'game without opponent': { ...ok, games: [{}] },
        'unknown opponent': { ...ok, games: ok.games.map((g) => ({ ...g, opp: 'nowhere' })) },
        'bad phase': { ...ok, phase: 7 },
        'bracket phase without a bracket': { ...ok, phase: 'bracket', bracket: null },
        'bad program': { ...ok, program: 'dogs' },
      };
      for (const [name, season] of Object.entries(variants)) {
        await loadWith(t, { v: 1, season });
        const s = await t.state();
        t.equal(s.scene, 'title', `${name}: title appears`);
        t.equal(s.season, null, `${name}: season dropped`);
      }
      await loadWith(t, { v: 1, season: ok });
      t.equal((await t.state()).season && (await t.state()).season.school, 'hot-springs', 'a good season still loads');
    },
  },
  {
    name: 'S6-01: wrong-typed settings fall back to defaults and a match still plays',
    viewports: ['desktop'],
    async run(t) {
      await loadWith(t, { v: 1, settings: { vol: 'loud', shotClock: 'x', text: 'big', difficulty: 9, qLen: {}, sound: 'yes', touch: 3, assist: 'no', theme: null, motion: 5, graphics: [], replays: 1 } });
      let s = await t.state();
      t.equal(s.settings.vol, 0.5, 'volume back to default');
      t.equal(s.settings.shotClock, 35, 'shot clock back to default');
      t.equal(s.settings.text, 100, 'text size back to default');
      t.equal(s.settings.difficulty, 1, 'difficulty back to default');
      t.equal(s.settings.qLen, 120, 'quarter length back to default');
      t.equal(s.settings.sound, true, 'sound back to default');
      await t.page.click('[data-act="select"]'); // a click unlocks audio, which used to throw on the NaN volume
      await t.game('newGame', { mode: 'exhibition', seed: 3, paused: true });
      await t.game('step', 30);
      s = await t.state();
      t.expect(Number.isFinite(s.match.shot), 'the shot clock is a number');
      await t.game('setState', { settings: { sound: false } });
      s = await t.state();
      t.equal(s.settings.vol, 0.5, 'a later settings save does not bring the bad value back');
    },
  },
  {
    name: 'S6-01: trophies without a valid school do not crash the Trophy Room',
    viewports: ['desktop'],
    async run(t) {
      await loadWith(t, { v: 1, trophies: [{ label: 'x' }, { school: 'hot-springs', program: 'girls', cls: '5A', label: 'Legacy', record: '6-0' }, { school: 'nowhere' }] });
      await t.game('scene', 'trophies');
      const s = await t.state();
      t.equal(s.scene, 'trophies', 'the Trophy Room opens');
      t.expect((await t.page.textContent('#screen')).includes('Legacy'), 'the good banner is listed');
      await t.game('setState', { settings: { sound: false } });
      await t.game('scene', 'trophies');
      t.equal((await t.state()).scene, 'trophies', 'still opens after a later save');
    },
  },
];
tests.push(...hostileSaveTests);

export const resetTests = [
  {
    name: 'S6-02: an unreadable save says so, and Reset saved data keeps a copy and unlocks saving',
    viewports: ['desktop'],
    async run(t) {
      const bads = ['{"v":1,"best":{"shoot', 'null', '[]', JSON.stringify({ v: 1, best: { shootout: '33' } })];
      for (const bad of bads) {
        await loadWith(t, bad);
        await t.page.click('[data-act="settings"]');
        await t.page.click('[data-act="setText"][data-arg="115"]'); // a refused write
        const text = await t.page.textContent('#screen');
        t.expect(/unreadable/i.test(text), `says the data is unreadable (${bad.slice(0, 16)})`);
        t.expect(!/unavailable in this browser/i.test(text), 'does not claim the browser cannot save');
        t.equal(await rawSave(t), bad, 'the unreadable record is untouched until the player resets');
        await t.page.click('[data-act="resetSave"]');
        const fresh = JSON.parse(await rawSave(t));
        t.equal(fresh.v, 1, 'a fresh record was written');
        t.equal(fresh.settings.text, 115, 'the setting made in this tab is in it');
        t.equal(await t.page.evaluate(() => localStorage.getItem('hsg-hoops-v1.bak')), bad, 'the old string was copied to the .bak key');
        t.expect(!(await t.page.$('[data-act="resetSave"]')), 'the reset button is gone');
        await t.page.click('[data-act="setText"][data-arg="130"]');
        t.equal(JSON.parse(await rawSave(t)).settings.text, 130, 'saving works again');
        await t.page.evaluate(() => localStorage.removeItem('hsg-hoops-v1.bak'));
      }
    },
  },
  {
    name: 'S6-02: a save from a newer version is kept and has no reset',
    viewports: ['desktop'],
    async run(t) {
      const newer = JSON.stringify({ v: 2, best: { shootout: 99 } });
      await loadWith(t, newer);
      await t.page.click('[data-act="settings"]');
      await t.page.click('[data-act="setText"][data-arg="115"]');
      t.expect(/newer version/i.test(await t.page.textContent('#screen')), 'says the data is from a newer version');
      t.expect(!(await t.page.$('[data-act="resetSave"]')), 'no reset button');
      await t.game('act', 'storage');
      t.equal(await rawSave(t), newer, 'the newer record is untouched');
    },
  },
];
tests.push(...resetTests);

const oops = (t) => t.page.evaluate(() => !!document.querySelector('[data-act="recover"]') && !document.querySelector('#screen').hidden);

export const faultTests = [
  {
    name: 'S6-03: an error in the frame loop shows a recovery panel that returns to the menu',
    viewports: ['desktop'],
    allowConsoleErrors: true,
    async run(t) {
      await exhibition(t, { seed: 9 });
      await t.game('resume');
      await t.page.evaluate(() => window.__game.act('input', { mx: { valueOf() { throw new Error('boom'); } } }));
      await t.page.waitForFunction(() => !!document.querySelector('[data-act="recover"]'), null, { timeout: 5000 }).catch(() => {});
      t.expect(await oops(t), 'the recovery panel is showing');
      t.expect(/went wrong/i.test(await t.page.textContent('#screen')), 'it says something went wrong');
      t.equal((await t.state()).paused, true, 'the failed match is stopped');
      await t.page.click('[data-act="recover"]');
      const s = await t.state();
      t.equal(s.scene, 'title', 'Return to menu reaches the title');
      t.equal(s.match, null, 'the match is cleared');
      t.expect(await t.page.evaluate(() => !!document.querySelector('[data-act="select"]')), 'the title menu is back');
    },
  },
  {
    name: 'S6-03: an error in a click handler shows the panel instead of a half-switched screen',
    viewports: ['desktop'],
    allowConsoleErrors: true,
    async run(t) {
      await t.page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<button id="bad" data-act="playChallenge" data-arg="nope|girls">x</button>'));
      await t.page.evaluate(() => document.querySelector('#bad').click());
      t.expect(await oops(t), 'the recovery panel is showing');
      await t.page.click('[data-act="recover"]');
      t.equal((await t.state()).scene, 'title', 'back at the title');
    },
  },
  {
    name: 'S6-03: an uncaught error or rejected promise shows the panel',
    viewports: ['desktop'],
    allowConsoleErrors: true,
    async run(t) {
      await t.page.evaluate(() => { setTimeout(() => { throw new Error('late boom'); }, 0); });
      await t.page.waitForTimeout(200);
      t.expect(await oops(t), 'an uncaught error shows the panel');
      await t.page.click('[data-act="recover"]');
      await t.page.evaluate(() => { Promise.reject(new Error('rejected')); });
      await t.page.waitForTimeout(200);
      t.expect(await oops(t), 'an unhandled rejection shows the panel');
    },
  },
];
tests.push(...faultTests);

const hide = (t) => t.page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
const show = (t) => t.page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });

export const lifecycleTests = [
  {
    name: 'S6-04: a hidden tab, a blur or a pagehide pauses a live game',
    viewports: ['desktop'],
    async run(t) {
      for (const how of ['hidden', 'blur', 'pagehide']) {
        await exhibition(t, { seed: 21 });
        await t.game('resume');
        await t.page.waitForTimeout(300);
        t.equal((await t.state()).scene, 'game', `${how}: playing before`);
        if (how === 'hidden') await hide(t);
        else await t.page.evaluate((e) => window.dispatchEvent(new Event(e)), how);
        const s = await t.state();
        t.equal(s.scene, 'pause', `${how}: the game is paused`);
        t.equal(s.paused, true, `${how}: the clock is stopped`);
        await show(t);
        t.equal((await t.state()).scene, 'pause', `${how}: coming back does not resume by itself`);
      }
    },
  },
  {
    name: 'S6-04: a blur cancels a held shot instead of releasing it',
    viewports: ['desktop'],
    async run(t) {
      await exhibition(t, { difficulty: 0, seed: 17 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('act', 'give', 0, 0);
      await t.game('act', 'place', 0, 0, 62, 25);
      for (let s = 1; s < 5; s++) await t.game('act', 'place', 0, s, 8, 5 + s * 8);
      for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 12, 4 + s * 10);
      await t.game('act', 'input', { shoot: true });
      await t.game('step', 8);
      let s = await t.state();
      t.equal(s.match.players[0].act, 'shoot', 'the shot is gathering');
      await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
      t.equal((await t.state()).scene, 'pause', 'paused by the blur');
      await t.page.click('[data-act="resume"]');
      await t.game('step', 25);
      s = await t.state();
      t.equal(s.match.ball.state, 'held', 'no shot was taken');
      t.equal(s.match.ball.holder, 0, 'the player still has the ball');
      t.expect(s.match.players[0].act !== 'shoot', 'the gather was cancelled');
    },
  },
  {
    name: 'S6-04: hidden and blur together pause Hot Streak once and do not unpause it',
    viewports: ['desktop'],
    async run(t) {
      await t.game('newGame', { mode: 'shootout', seed: 7 });
      await t.game('step', 5);
      t.equal((await t.state()).paused, false, 'running before');
      await hide(t);
      await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
      t.equal((await t.state()).paused, true, 'paused, not toggled back');
    },
  },
];
tests.push(...lifecycleTests);
