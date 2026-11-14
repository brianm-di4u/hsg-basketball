import { exhibition } from './helpers.mjs';

// Wave 2, batch A: sound. S5-03 action cues, S5-04 cue variation and mix, S5-02 the crowd bed.
// Nothing here can be heard by the test run, so sound is checked by measurement: audioRender() renders a cue or a
// scene on an OfflineAudioContext at Medium volume, exactly as the game builds them.

const KEY = 'hsg-hoops-v1';
const render = (t, name, seconds, opt = {}) => t.page.evaluate(([n, s, o]) => window.__game.audioRender(n, s, false, o), [name, seconds, opt]);
const put = (t, v) => t.page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === 'string' ? s : JSON.stringify(s)), [KEY, v]);
const audio = async (t) => (await t.state()).audio;
const gesture = async (t) => { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(150); };
const QUIET = new Set(['meter', 'squeak', 'click']); // interface ticks, not gameplay cues

export const tests = [
  {
    name: 'S5-04: every gameplay cue peaks between 0.2 and 0.45 at Medium volume, whatever the jitter',
    viewports: ['desktop'],
    async run(t) {
      const list = await t.page.evaluate(() => window.__game.audioList());
      t.expect(list.cues.length >= 20, `the cue list is long (${list.cues.length})`);
      for (const c of list.cues) {
        let lo = 9, hi = 0;
        for (const seed of [1, 2, 3, 4, 5, 6]) {
          const r = await render(t, 'cue:' + c, 2, { seed, cue: { three: true, big: true, mine: true, hard: true, p: 0.6 } });
          lo = Math.min(lo, r.peak); hi = Math.max(hi, r.peak);
        }
        if (QUIET.has(c)) t.expect(hi < 0.2 && lo > 0.02, `${c} is a quiet interface tick (${lo}..${hi})`);
        else t.expect(lo >= 0.2 && hi <= 0.45, `${c} peaks ${lo}..${hi} (want 0.2 to 0.45)`);
      }
    },
  },
  {
    name: 'S5-04: repeats of a cue differ (pitch, gain and noise start are jittered)',
    viewports: ['desktop'],
    async run(t) {
      for (const c of ['swish', 'bounce', 'steal', 'pass', 'catch', 'release', 'rim', 'whistle', 'cheer']) {
        const seen = new Set();
        for (const seed of [1, 2, 3, 4, 5]) { const r = await render(t, 'cue:' + c, 2, { seed }); seen.add(`${r.peak}/${r.rms}`); }
        t.expect(seen.size >= 4, `${c}: five plays gave ${seen.size} different levels`);
      }
    },
  },
  {
    name: 'S5-04: each rim ring and each team cheer is its own sound',
    viewports: ['desktop'],
    async run(t) {
      const rms = new Set();
      for (const v of [0, 1, 2]) rms.add((await render(t, 'cue:rim', 1, { seed: 3, cue: { v } })).rms);
      t.equal(rms.size, 3, 'three rim variants measure differently');
      const mine = await render(t, 'cue:cheer', 2.5, { seed: 3, cue: { mine: true, big: false } });
      const theirs = await render(t, 'cue:cheer', 2.5, { seed: 3, cue: { mine: false } });
      t.expect(mine.rms > theirs.rms * 1.5, `your basket is louder than theirs (${mine.rms} vs ${theirs.rms})`);
      const panned = await render(t, 'cue:swish', 1, { seed: 3, cue: { pan: -0.7 } });
      t.expect(panned.stereo > 0.5, `a panned cue sits to one side (side/mid ${panned.stereo})`);
      const centred = await render(t, 'cue:swish', 1, { seed: 3, cue: {} });
      t.expect(centred.stereo < 0.2, `an unpanned cue is centred (side/mid ${centred.stereo})`);
    },
  },
  {
    name: 'S5-02: each crowd bed renders 30 s inside the ambience limits, never silent, and louder as the crowd rises',
    viewports: ['desktop'],
    async run(t) {
      const list = await t.page.evaluate(() => window.__game.audioList());
      t.equal(list.ambience.join(','), 'gym,arena', 'a bed for the home gym and one for the arena');
      t.equal(list.music.join(','), 'pepBand,breakRoom,fanfare', 'the three pieces of music are listed apart from the beds (batch B)');
      for (const name of list.ambience) {
        const lvl = {};
        for (const crowd of [0, 0.5, 1]) {
          const r = await render(t, name, 30, { crowd });
          lvl[crowd] = r.rmsDb;
          t.expect(r.peak < 0.07, `${name} at crowd ${crowd}: peak ${r.peak} is under 0.07`);
          t.expect(r.rmsDb >= -52 && r.rmsDb <= -38, `${name} at crowd ${crowd}: RMS ${r.rmsDb} dBFS is inside -52 to -38`);
          t.expect(r.longestSilence === 0, `${name} at crowd ${crowd}: no silent second`);
        }
        t.expect(lvl[1] - lvl[0] >= 6, `${name}: a roaring crowd is at least 6 dB above a quiet one (${lvl[0]} to ${lvl[1]})`);
      }
    },
  },
  {
    name: 'S5-02: the bed is not a loop (its second-by-second level keeps moving)',
    viewports: ['desktop'],
    async run(t) {
      const r = await render(t, 'gym', 40, { crowd: 0.6 });
      const s = r.secs, mean = s.reduce((a, b) => a + b, 0) / s.length, sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / s.length);
      t.expect(sd / mean > 0.03, `the level drifts (spread ${(sd / mean * 100).toFixed(1)} percent)`);
      const a = await render(t, 'gym', 20, { crowd: 0.6, seed: 5 }), b = await render(t, 'gym', 20, { crowd: 0.6, seed: 9 });
      t.expect(a.rms !== b.rms, 'two runs of the same bed are not sample-identical');
    },
  },
  {
    name: 'S5-04: the loudest cue on top of a roaring crowd on High volume never clips',
    viewports: ['desktop'],
    async run(t) {
      for (const cue of ['roar', 'block', 'buzzer', 'win', 'cheer']) {
        const r = await render(t, 'arena', 4, { crowd: 1, vol: 0.8, mixCue: cue, cue: { big: true, mine: true, hard: true } });
        t.expect(r.peak < 0.95, `${cue} + arena crowd at High: peak ${r.peak} is under 0.95`);
      }
    },
  },
  {
    name: 'S5-02: the bed follows the screen; the pause card holds it; Sound and Ambience each silence it',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      let a = await audio(t);
      t.expect(a.ctx && a.state === 'running', `audio started on the first gesture (${a.state})`);
      t.equal(a.bed, '', 'the title has no crowd bed');
      await exhibition(t, { seed: 9 });
      a = await audio(t);
      t.equal(a.bed, 'gym', 'a home-gym game has the gym bed');
      t.equal(a.held, false, 'and it is not held');
      await t.game('scene', 'pause');
      a = await audio(t);
      t.equal(a.held, true, 'the pause card holds the bed');
      await t.game('step', 60);
      await t.game('scene', 'game');
      a = await audio(t);
      t.equal(a.held, false, 'resuming releases it');
      t.equal(a.bed, 'gym', 'and the bed is still the gym');
      await t.game('setState', { settings: { ambience: false } });
      a = await audio(t);
      t.equal(a.bed, '', 'Ambience Off takes the bed away');
      t.equal(a.ambience, false, 'the setting reads Off');
      await t.game('setState', { settings: { ambience: true } });
      t.equal((await audio(t)).bed, 'gym', 'Ambience On brings it back');
      await t.game('setState', { settings: { sound: false } });
      a = await audio(t);
      t.expect(a.bed === '' && a.held, 'Sound Off silences the bed and holds the kit');
      await t.game('setState', { settings: { sound: true } });
      a = await audio(t);
      t.expect(a.bed === 'gym' && !a.held, 'Sound On restores it');
      await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', venue: 'arena', paused: true });
      t.equal((await audio(t)).bed, 'arena', 'the state-final arena has its own bed');
      await t.game('scene', 'title');
      t.equal((await audio(t)).bed, '', 'back at the title the bed fades out');
    },
  },
  {
    name: 'S5-02: the crowd level follows the game (a basket lifts it, then it settles)',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 21 });
      await t.game('step', 30);
      const quiet = (await audio(t)).crowd;
      let s = await t.state(), k = 0;
      while (s.match.score[0] === 0 && k++ < 12) {
        await t.game('act', 'give', 0, 0); await t.game('act', 'place', 0, 0, 80, 6); await t.game('step', 1);
        await t.game('act', 'shootAt', 1); await t.game('step', 90); s = await t.state();
      }
      t.expect(s.match.score[0] > 0, 'a forced basket went in');
      await t.page.waitForTimeout(150);
      await t.game('step', 1);
      const hot = (await audio(t)).crowd;
      t.expect(hot > quiet + 0.2, `the crowd level rose after the basket (${quiet} to ${hot})`);
      await t.page.waitForTimeout(150);
      await t.game('step', 60 * 8);
      await t.page.waitForTimeout(150);
      await t.game('step', 1);
      const later = (await audio(t)).crowd;
      t.expect(later < hot - 0.15, `and settled back (${hot} to ${later})`);
    },
  },
  {
    name: 'S5-03: the player verbs ask for their cues (release, pass, catch, bounce, rebound, meter, jump)',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 33 });
      await t.game('act', 'autoplay', true);
      for (let k = 0; k < 40; k++) await t.game('step', 90);
      const c = (await audio(t)).count;
      for (const n of ['release', 'pass', 'catch', 'bounce', 'swish', 'cheer']) t.expect(c[n] > 0, `${n} was requested (${c[n] || 0})`);
      t.expect((c.reb || 0) + (c.rim || 0) > 0, `a rebound or a rim hit was heard (reb ${c.reb || 0}, rim ${c.rim || 0})`);
      await t.game('act', 'autoplay', false);
      const before = (await audio(t)).count;
      await t.game('act', 'give', 0, 0);
      await t.game('act', 'input', { shoot: true });
      await t.game('step', 40);
      await t.game('act', 'input', { shoot: false });
      await t.game('step', 3);
      const after = (await audio(t)).count;
      t.expect((after.meter || 0) - (before.meter || 0) >= 4, `the meter ticked while the shot was held (${(after.meter || 0) - (before.meter || 0)} ticks)`);
      t.expect((after.release || 0) > (before.release || 0), 'releasing the shot has a cue');
      await t.game('act', 'give', 1, 0);
      await t.game('step', 20);
      const b2 = (await audio(t)).count;
      await t.game('act', 'input', { shoot: true });
      await t.game('step', 2);
      await t.game('act', 'input', { shoot: false });
      await t.game('step', 2);
      t.expect(((await audio(t)).count.jump || 0) > (b2.jump || 0), 'jumping on defence has a cue');
    },
  },
  {
    name: 'S5-03: a substitution has a cue (the sim says sub, the game asks for it)',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 4, qLen: 240 });
      await t.game('setState', { match: { energy: 0.3 } });
      await t.game('act', 'autoplay', true);
      let n = 0;
      for (let k = 0; k < 120 && !n; k++) { await t.game('step', 60); n = (await audio(t)).count.sub || 0; }
      t.expect(n > 0, `a sub cue was requested (${n})`);
    },
  },
  {
    name: 'S5-02: nothing sounds while the page is hidden and the context comes back on the next gesture',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 9 });
      t.equal((await audio(t)).state, 'running', 'running during play');
      await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
      await t.page.waitForTimeout(200);
      const a = await audio(t);
      t.expect(a.state === 'suspended', `the context is suspended when focus is lost (${a.state})`);
      t.equal((await t.state()).scene, 'pause', 'and the game is on the pause card');
      t.equal(a.held, true, 'with the bed held');
      await gesture(t);
      for (let k = 0; k < 20 && (await audio(t)).state !== 'running'; k++) { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(150); } // resume() takes a moment on a busy machine
      t.equal((await audio(t)).state, 'running', 'a gesture resumes it');
    },
  },
  {
    name: 'S5-02: the Ambience setting is saved, reloads, and old saves keep working',
    viewports: ['desktop'],
    async run(t) {
      await t.game('scene', 'settings');
      await t.page.click('[data-act="setAmbience"][data-arg="0"]');
      t.equal(JSON.parse(await t.page.evaluate((k) => localStorage.getItem(k), KEY)).settings.ambience, false, 'Off is written to the save');
      await t.reload();
      t.equal((await audio(t)).ambience, false, 'Off survives a reload');
      await put(t, { v: 1, settings: { sound: true, vol: 0.5, difficulty: 2 }, unlocks: { throwback: true }, best: { shootout: 40 }, trophies: [], challenges: {} });
      await t.reload();
      let s = await t.state();
      t.equal(s.audio.ambience, true, 'a pre-wave save with no ambience field gets Ambience On');
      t.equal(s.settings.difficulty, 2, 'and keeps its other settings');
      t.equal(s.best.shootout, 40, 'and its records');
      await put(t, { v: 1, settings: { sound: false, vol: 0.5 } });
      await t.reload();
      await t.game('scene', 'title');
      await gesture(t);
      await exhibition(t, { seed: 9 });
      s = await t.state();
      t.expect(s.audio.bed === '' && s.audio.held, 'a save with Sound Off stays silent: no bed');
      await put(t, { v: 1, settings: { ambience: 'loud' } });
      await t.reload();
      t.equal((await audio(t)).ambience, true, 'a damaged ambience value falls back to On');
      await t.page.evaluate((k) => localStorage.removeItem(k), KEY);
    },
  },
  {
    name: 'S5-02: the Ambience control in Settings (screenshot)',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.game('scene', 'settings');
      const row = await t.page.evaluate(() => { const b = document.querySelector('[data-act="setAmbience"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { h: r.height, w: r.width, label: (b.closest('.seg, .row, div') || b).textContent }; });
      t.expect(row && row.h >= 44, `the control is there and at least 44 px tall (${row && row.h})`);
      t.expect(/Crowd ambience/.test(await t.page.textContent('#screen')), 'it is labelled Crowd ambience');
      await t.checkLayout({ allowScrollY: true });
      await t.page.evaluate(() => document.querySelector('[data-act="setAmbience"]').scrollIntoView({ block: 'center' }));
      await t.shot('S5-02-settings-ambience');
    },
  },
];
