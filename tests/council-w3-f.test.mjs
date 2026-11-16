import { stepUntil } from './helpers.mjs';

// Wave 3, batch F: sound, layout and accessibility (CL-01, S4-05, S5-09, S5-14, S5-15, S5-19, S1-04, S2-08, S1-02, S2-16).
// Sound cannot be heard by a test run, so it is checked by measurement: audioRender() renders on an OfflineAudioContext through the same
// master gain and limiter the player hears. Every render here is seeded, so the same numbers come back every run.

const render = (t, name, seconds, opt = {}) => t.page.evaluate(([n, s, o]) => window.__game.audioRender(n, s, false, o), [name, seconds, opt]);
const shot = (t, name) => t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/${name}-${t.viewport}.png` });
const exhibition = async (t, o = {}) => {
  await t.seed(o.seed ?? 7);
  await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1, paused: true, ...o });
  await t.waitForStable();
  return t.state();
};

export const tests = [];

// ---------------------------------------------------------------- CL-01 the loudest moment at the maximum volume
tests.push({
  name: 'CL-01: the busiest moment with the volume at its maximum stays under 0.95',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.page.evaluate(() => window.__game.audioList());
    // Volume is the only level a player can raise (Music and Ambience are on or off). 1 is above the highest step the menu offers (High, 0.8), so this is stricter than any player can be.
    // The busiest bed: the arena crowd at full with the tension hum and heartbeat; under it the loudest piece; on top, one cue at a time, struck as big as it goes.
    let worst = 0, worstName = '';
    for (const cue of list.cues) {
      for (const music of ['pepBand', 'fanfare']) {
        const r = await render(t, 'arena', 4, { vol: 1, crowd: 1, tension: 1, music, mixCue: cue, seed: 21, cue: { big: true, mine: true, hard: true, three: true, p: 1 } });
        if (r.peak > worst) { worst = r.peak; worstName = `${cue} over ${music}`; }
      }
    }
    t.log(`busiest moment: peak ${worst} (${worstName})`);
    t.expect(worst < 0.95, `no cue over the loudest piece and the full arena bed reaches 0.95 at maximum volume (worst ${worst}, ${worstName})`);
    // The same for each cue by itself, 6 seeds, since a cue alone is what a player hears most often.
    let alone = 0, aloneName = '';
    for (const cue of list.cues) {
      for (let seed = 1; seed <= 6; seed++) {
        const r = await render(t, 'cue:' + cue, 2.5, { vol: 1, seed, cue: { big: true, mine: true, hard: true, three: true, p: 1 } });
        if (r.peak > alone) { alone = r.peak; aloneName = cue; }
      }
    }
    t.expect(alone < 0.95, `no cue by itself reaches 0.95 at maximum volume (worst ${alone}, ${aloneName})`);
  },
});

// ---------------------------------------------------------------- S4-05 rivalries
tests.push({
  name: 'S4-05: a rivalry game is named by the PA after the starting fives, and the home crowd cheers a little louder; other games are not',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t);
    await t.game('step', 2);
    let s = await t.state();
    t.expect(s.pa && /^Welcome/.test(s.pa.kicker), `the welcome comes first (${s.pa && s.pa.kicker})`);
    s = await stepUntil(t, (x) => !!x.pa && x.pa.kicker === 'Rivalry game', 900, 30, 'the rivalry line');
    t.equal(s.pa.text, '5A South rivals.', 'it says what the data says the rivalry is');
    await shot(t, 'S4-05-rivalry-line');
    // a game between schools that are not rivals never says it
    await exhibition(t, { away: 'lake-hamilton' });
    let said = false;
    for (let k = 0; k < 20; k++) { await t.game('step', 30); const x = await t.state(); if (x.pa && x.pa.kicker === 'Rivalry game') said = true; }
    t.expect(!said, 'Hot Springs against Lake Hamilton is not called a rivalry');
    // the louder cheer: the same seeded render with and without the rivalry flag; +2 dB is a factor of 1.26 on the cheer's own level
    for (const cue of ['cheer', 'roar']) {
      const plain = await render(t, 'cue:' + cue, 3, { seed: 5, cue: { big: true, mine: true } });
      const riv = await render(t, 'cue:' + cue, 3, { seed: 5, cue: { big: true, mine: true, rival: true } });
      const ratio = riv.rms / plain.rms;
      t.expect(ratio > 1.15 && ratio < 1.36, `${cue} in a rivalry game is about 2 dB louder (rms ratio ${ratio.toFixed(2)})`);
    }
  },
});

// ---------------------------------------------------------------- S5-09 a Hot Streak best has its own sting
const gesture = async (t) => { await t.page.mouse.click(4, 4); await t.page.waitForTimeout(150); };
const count = async (t, name) => ((await t.state()).audio.count[name] || 0);
const median = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
tests.push({
  name: 'S5-09: a new Hot Streak best plays its own sting, not the win cue, and the dead jingle cue is gone',
  viewports: ['desktop'],
  async run(t) {
    const list = await t.page.evaluate(() => window.__game.audioList());
    t.expect(list.cues.includes('record') && !list.cues.includes('jingle'), 'the record sting is a cue and the unused jingle is not');
    // by measurement: it peaks inside the gameplay range at the typical repeat and is not the same sound as the win cue or the other stings
    const peaks = [], rms = {};
    for (const seed of [1, 2, 3, 4, 5]) peaks.push((await render(t, 'cue:record', 2.5, { seed })).peak);
    const med = median(peaks);
    t.expect(med >= 0.2 && med <= 0.45, `the typical repeat peaks ${med} (want 0.2 to 0.45)`);
    for (const c of ['record', 'win', 'challenge', 'trophy']) rms[c] = (await render(t, 'cue:' + c, 3, { seed: 3 })).rms;
    t.expect(new Set(Object.values(rms)).size === 4, `the four stings measure differently (${JSON.stringify(rms)})`);
    // in the game: finishing a Hot Streak with a score on a fresh profile is a best
    await t.game('scene', 'title');
    await gesture(t);
    await t.game('newGame', { mode: 'shootout', seed: 5, paused: true });
    const [r0, w0] = [await count(t, 'record'), await count(t, 'win')];
    await t.game('setState', { shootout: { phase: 'live', score: 9, t: 0.02 } });
    await stepUntil(t, (x) => x.scene === 'shootoutEnd', 600, 20, 'the Hot Streak result');
    t.equal(await count(t, 'record'), r0 + 1, 'a new best plays the record sting');
    t.equal(await count(t, 'win'), w0, 'and not the game-win cue');
  },
});
