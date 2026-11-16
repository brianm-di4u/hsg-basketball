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
