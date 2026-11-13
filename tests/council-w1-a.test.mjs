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
