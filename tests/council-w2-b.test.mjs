import { exhibition, stepUntil } from './helpers.mjs';

// Wave 2, batch B: sound. S5-01 music (title and menus, quarter break, win), S5-06 tension (shot clock, last minute, Hot Streak).
// Music and the tension layers cannot be heard by the test run, so they are checked by measurement: audioRender() renders a
// piece or a bed on an OfflineAudioContext at Medium volume, exactly as the game builds it.

const KEY = 'hsg-hoops-v1';
const render = (t, name, seconds, opt = {}) => t.page.evaluate(([n, s, o]) => window.__game.audioRender(n, s, false, o), [name, seconds, opt]);
const put = (t, v) => t.page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === 'string' ? s : JSON.stringify(s)), [KEY, v]);
const audio = async (t) => (await t.state()).audio;
const gesture = async (t) => { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(150); };

export const tests = [
  {
    name: 'S5-01: each piece of music runs at least 45 s before it repeats, varies, and sits inside the music mix limits',
    viewports: ['desktop'],
    async run(t) {
      const list = await t.page.evaluate(() => window.__game.audioList());
      t.equal(list.music.join(','), 'pepBand,breakRoom,fanfare', 'a pep band, a quiet break piece and a fanfare');
      const tempi = new Set();
      for (const name of list.music) {
        const r = await render(t, name, 60);
        t.expect(r.peak >= 0.06 && r.peak <= 0.16, `${name}: peak ${r.peak} is inside 0.06 to 0.16`);
        t.expect(r.rmsDb >= -40 && r.rmsDb <= -28, `${name}: RMS ${r.rmsDb} dBFS is inside -40 to -28`);
        t.expect(r.longestSilence === 0, `${name}: no silent second`);
        t.expect(r.built.formSeconds >= 45, `${name}: the form is ${r.built.formSeconds} s before it repeats`);
        t.expect(r.built.distinctBars >= 6, `${name}: ${r.built.distinctBars} distinct melody bars`);
        t.expect(r.built.pitches >= 6, `${name}: ${r.built.pitches} different pitches`);
        tempi.add(r.built.bpm);
      }
      t.equal(tempi.size, 3, 'each piece has its own tempo');
      const calm = await render(t, 'breakRoom', 60), pep = await render(t, 'pepBand', 60);
      t.expect(calm.rmsDb < pep.rmsDb, `the quarter-break arrangement is quieter than the pep band (${calm.rmsDb} vs ${pep.rmsDb})`);
    },
  },
  {
    name: 'S5-01: music never clips with the crowd bed and the loudest cue on top, and is a different performance each seed',
    viewports: ['desktop'],
    async run(t) {
      for (const music of ['pepBand', 'breakRoom', 'fanfare']) {
        for (const cue of ['win', 'buzzer', 'roar']) {
          const r = await render(t, 'arena', 4, { crowd: 1, vol: 0.8, music, mixCue: cue, cue: { big: true, mine: true } });
          t.expect(r.peak < 0.95, `${music} + arena + ${cue} at High: peak ${r.peak} is under 0.95`);
        }
      }
      const a = await render(t, 'pepBand', 30, { seed: 3 }), b = await render(t, 'pepBand', 30, { seed: 8 });
      t.expect(a.rms !== b.rms, 'two seeds do not render the same melody');
    },
  },
  {
    name: 'S5-06: the tension hum and heartbeat stay inside the ambience limits and rise with tension',
    viewports: ['desktop'],
    async run(t) {
      for (const name of ['gym', 'arena']) {
        const lvl = {};
        for (const tension of [0, 0.5, 1]) {
          const r = await render(t, name, 30, { crowd: 0.6, tension });
          lvl[tension] = r.rmsDb;
          t.expect(r.peak < 0.07, `${name} at tension ${tension}: peak ${r.peak} is under 0.07`);
          t.expect(r.rmsDb >= -52 && r.rmsDb <= -38, `${name} at tension ${tension}: RMS ${r.rmsDb} dBFS is inside -52 to -38`);
          t.expect(r.longestSilence === 0, `${name} at tension ${tension}: no silent second`);
        }
        t.expect(lvl[1] - lvl[0] >= 1, `${name}: full tension is heard above none (${lvl[0]} to ${lvl[1]} dBFS)`);
      }
    },
  },
  {
    name: 'S5-06: the shot-clock tick and the Hot Streak riser are inside the cue limits, and the tick changes as the clock runs down',
    viewports: ['desktop'],
    async run(t) {
      const list = await t.page.evaluate(() => window.__game.audioList());
      t.expect(list.cues.includes('tick') && list.cues.includes('streak'), 'both cues are listed');
      for (const c of ['tick', 'streak']) {
        let lo = 9, hi = 0;
        for (const seed of [1, 2, 3, 4, 5, 6]) for (const p of [0, 1]) { const r = await render(t, 'cue:' + c, 2, { seed, cue: { p } }); lo = Math.min(lo, r.peak); hi = Math.max(hi, r.peak); }
        t.expect(lo >= 0.2 && hi <= 0.45, `${c} peaks ${lo}..${hi} (want 0.2 to 0.45)`);
      }
      const wav = (p) => t.page.evaluate((q) => window.__game.audioRender('cue:tick', 1, true, { seed: 2, cue: { p: q } }).then((r) => r.wav), p);
      t.expect((await wav(0)) !== (await wav(1)), 'the tick at one second left is not the tick at five');
    },
  },
  {
    name: 'S5-01: the music follows the screen (menus, quarter break, win, loss), and Sound, Music and the pause card control it',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      let a = await audio(t);
      t.equal(a.ctx, false, 'nothing is built before the first gesture');
      await gesture(t);
      a = await audio(t);
      t.expect(a.state === 'running' && a.track === 'pepBand', `the title plays the pep band (${a.track})`);
      await t.game('scene', 'settings');
      t.equal((await audio(t)).track, 'pepBand', 'and it carries on through Settings without restarting');
      await exhibition(t, { seed: 9 });
      a = await audio(t);
      t.equal(a.track, '', 'live play has no tune');
      t.equal(a.bed, 'gym', 'the crowd bed carries it');
      await t.game('scene', 'pause');
      a = await audio(t);
      t.expect(a.held && a.track === '', 'the pause card holds everything');
      await t.game('scene', 'game');
      await t.game('act', 'finishGame', { winner: 0 });
      await t.game('step', 3);
      a = await audio(t);
      t.equal((await t.state()).scene, 'final', 'the game ended');
      t.equal(a.track, 'fanfare', 'a win plays the fanfare');
      await exhibition(t, { seed: 10 });
      await t.game('act', 'finishGame', { winner: 1 });
      await t.game('step', 3);
      t.equal((await audio(t)).track, 'breakRoom', 'a loss plays the quiet arrangement');
      await exhibition(t, { seed: 11, qLen: 120 });
      await t.game('act', 'autoplay', true);
      await stepUntil(t, (x) => x.scene === 'break', 60 * 60 * 3, 120, 'quarter break');
      t.equal((await audio(t)).track, 'breakRoom', 'a quarter break plays the quiet arrangement');
      await t.game('act', 'autoplay', false);
      await t.game('act', 'continue');
      t.equal((await audio(t)).track, '', 'and it fades out when play resumes');
      await t.game('scene', 'title');
      await t.game('setState', { settings: { music: false } });
      a = await audio(t);
      t.expect(a.track === '' && a.music === false, 'Music Off takes the piece away');
      await t.game('setState', { settings: { music: true } });
      t.equal((await audio(t)).track, 'pepBand', 'Music On brings it back');
      await t.game('setState', { settings: { sound: false } });
      a = await audio(t);
      t.expect(a.track === '' && a.held, 'Sound Off silences the music and holds the kit');
      await t.game('setState', { settings: { sound: true } });
      t.equal((await audio(t)).track, 'pepBand', 'Sound On restores it');
    },
  },
  {
    name: 'S5-01: the Music setting is saved and reloads; old saves get Music On; Sound Off stays silent; a suspended context plays nothing',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'settings');
      await t.page.click('[data-act="setMusic"][data-arg="0"]');
      t.equal(JSON.parse(await t.page.evaluate((k) => localStorage.getItem(k), KEY)).settings.music, false, 'Off is written to the save');
      await t.reload();
      t.equal((await audio(t)).music, false, 'Off survives a reload');
      await t.game('scene', 'title');
      await gesture(t);
      t.equal((await audio(t)).track, '', 'and a reloaded game with Music Off stays quiet at the title');
      await put(t, { v: 1, settings: { sound: true, vol: 0.5, difficulty: 2, ambience: false }, unlocks: { throwback: true }, best: { shootout: 40 }, trophies: [], challenges: {} });
      await t.reload();
      let s = await t.state();
      t.equal(s.audio.music, true, 'a pre-wave save with no music field gets Music On');
      t.expect(s.settings.difficulty === 2 && s.audio.ambience === false && s.best.shootout === 40, 'and keeps its settings and records');
      await put(t, { v: 1, settings: { sound: false } });
      await t.reload();
      await t.game('scene', 'title');
      await gesture(t);
      s = await t.state();
      t.expect(s.audio.track === '' && s.audio.held, 'a save with Sound Off stays silent');
      await put(t, { v: 1, settings: { music: 'loud' } });
      await t.reload();
      t.equal((await audio(t)).music, true, 'a damaged music value falls back to On');
      await t.page.evaluate((k) => localStorage.removeItem(k), KEY);
      await t.reload();
      await t.game('scene', 'title');
      await gesture(t);
      await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await t.page.waitForTimeout(200);
      t.equal((await audio(t)).state, 'suspended', 'a blurred page suspends the context, so nothing is scheduled');
      await gesture(t);
      for (let k = 0; k < 20 && (await audio(t)).state !== 'running'; k++) { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(150); }
      const x = await audio(t);
      t.expect(x.state === 'running' && x.track === 'pepBand', `a gesture brings the music back (${x.state}, ${x.track})`);
    },
  },
  {
    name: 'S5-06: the shot clock ticks in its last five seconds, and tension builds in a close last minute but not a blowout',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 21 });
      await t.game('act', 'autoplay', true);
      await t.game('step', 300);
      t.equal((await audio(t)).tension, 0, 'no tension early in the game');
      const before = (await audio(t)).count.tick || 0;
      await t.game('setState', { match: { shot: 5 } });
      await t.game('step', 6 * 60);
      const ticks = ((await audio(t)).count.tick || 0) - before;
      t.expect(ticks >= 3 && ticks <= 8, `the shot clock ticked as it ran down (${ticks} ticks)`);
      await t.game('setState', { match: { q: 4, t: 50, score: [60, 60], shot: 30 } });
      await t.game('step', 20);
      const mid = (await audio(t)).tension;
      await t.game('setState', { match: { t: 8, score: [60, 61], shot: 30 } });
      await t.game('step', 20);
      const late = (await audio(t)).tension;
      t.expect(mid > 0.3 && late > mid && late >= 0.5, `a tied last minute builds (${mid} at 50 s, ${late} at 8 s): the heartbeat starts at 0.5`);
      await t.game('setState', { match: { score: [90, 55] } });
      await t.game('step', 20);
      const blow = (await audio(t)).tension;
      t.expect(blow < late - 0.3, `a blowout stays calm (${blow})`);
      await t.game('setState', { match: { q: 2, t: 30, score: [60, 60] } });
      await t.game('step', 20);
      t.equal((await audio(t)).tension, 0, 'a close second quarter has none');
    },
  },
  {
    name: 'S5-06: Hot Streak rises with the multiplier and the clock',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await t.game('newGame', { mode: 'shootout', seed: 5 });
      await t.game('pause');
      await t.page.keyboard.down('Space'); await t.game('step', 28); await t.page.keyboard.up('Space'); await t.game('step', 4);
      let s = await t.state(), mult = 1, k = 0;
      while (mult < 2 && k++ < 30) {
        await stepUntil(t, (x) => x.shootout.ball === 'held', 300, 6, 'ball back');
        await t.game('act', 'shootoutShot', 1);
        await t.game('step', 6);
        s = await stepUntil(t, (x) => x.shootout.ball !== 'shot' && x.shootout.ball !== 'held', 200, 4, 'resolved');
        mult = s.shootout.mult;
      }
      t.expect(mult >= 2, 'the multiplier kicked in');
      await t.game('step', 2);
      const a = await audio(t);
      t.expect((a.count.streak || 0) >= 1, `the riser played (${a.count.streak || 0})`);
      t.expect(a.tension >= 0.25, `the hum follows the multiplier (${a.tension})`);
      const c0 = a.count.tick || 0;
      await t.game('setState', { shootout: { t: 5.5 } });
      await t.game('step', 60 * 5);
      t.expect(((await audio(t)).count.tick || 0) - c0 >= 3, 'the last five seconds tick');
    },
  },
  {
    name: 'S5-01: the Music control in Settings (screenshot)',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.game('scene', 'settings');
      const row = await t.page.evaluate(() => { const b = document.querySelector('[data-act="setMusic"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { h: r.height, w: r.width }; });
      t.expect(row && row.h >= 44, `the control is there and at least 44 px tall (${row && row.h})`);
      t.expect(/Music/.test(await t.page.textContent('#screen')), 'it is labelled Music');
      await t.checkLayout({ allowScrollY: true });
      await t.page.evaluate(() => document.querySelector('[data-act="setMusic"]').scrollIntoView({ block: 'center' }));
      await t.shot('S5-01-settings-music');
    },
  },
];
