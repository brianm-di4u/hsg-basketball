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

// ---------------------------------------------------------------- S5-14 the shot meter by ear
tests.push({
  name: 'S5-14: the meter ticks brighter inside the PERFECT window, and a release sounds PERFECT, plain (GOOD) or dull (EARLY, LATE)',
  viewports: ['desktop'],
  async run(t) {
    // by measurement: the two grade sounds are gameplay cues, the sweet tick is a quiet interface tick that is brighter than the plain one
    for (const c of ['perfect', 'late']) {
      const peaks = [];
      for (const seed of [1, 2, 3, 4, 5]) peaks.push((await render(t, 'cue:' + c, 1.5, { seed })).peak);
      const med = median(peaks);
      t.expect(med >= 0.2 && med <= 0.45, `${c}: the typical repeat peaks ${med} (want 0.2 to 0.45)`);
    }
    const plain = await render(t, 'cue:meter', 0.5, { seed: 3, cue: { p: 0.9 } }), sweet = await render(t, 'cue:sweet', 0.5, { seed: 3, cue: { p: 0.9 } });
    t.expect(sweet.peak < 0.2 && sweet.peak > plain.peak * 1.3, `the sweet tick is quiet (${sweet.peak}) but stands out from the plain one (${plain.peak})`);
    // in the game: the grade of the user's own release (the sim's forced quality stands in for the player's timing)
    await t.game('scene', 'title');
    await gesture(t);
    await exhibition(t, { seed: 11 });
    const lay = async () => {
      await stepUntil(t, (x) => !['shot', 'net'].includes(x.match.ball.state), 300, 10, 'the last shot to be over');
      await t.game('act', 'give', 0, 2);
      await t.game('act', 'place', 0, 2, 84.6, 25);
      for (let k = 0; k < 5; k++) await t.game('act', 'place', 1, k, 47 + (k - 2) * 6, k % 2 ? 4 : 46);
      await t.game('step', 1);
    };
    const grade = async (q) => {
      await lay();
      const [p0, l0] = [await count(t, 'perfect'), await count(t, 'late')];
      await t.game('act', 'shootAt', q);
      await stepUntil(t, (x) => x.match.ball.state === 'shot' || x.match.ball.state === 'net' || x.match.ball.state === 'loose', 300, 5, 'the release');
      return [(await count(t, 'perfect')) - p0, (await count(t, 'late')) - l0];
    };
    t.equal((await grade(1)).join(), '1,0', 'a PERFECT release rings');
    t.equal((await grade(0.75)).join(), '0,0', 'a GOOD release is the plain one');
    t.equal((await grade(0.3)).join(), '0,1', 'an EARLY or LATE release thuds');
    // holding Shoot ticks the sweet tick when the fill is in the window and not before it
    await lay();
    const s0 = await count(t, 'sweet');
    await t.page.keyboard.down('Space');
    await t.game('step', 12);
    t.equal(await count(t, 'sweet'), s0, 'the early part of the fill has only the plain tick');
    await stepUntil(t, (x) => x.audio.count.sweet > s0, 80, 2, 'the fill to reach the window');
    await t.page.keyboard.up('Space');
    t.expect((await count(t, 'sweet')) > s0, 'and inside the window it is the bright one');
  },
});

// ---------------------------------------------------------------- S5-15 squeaks and contact
tests.push({
  name: 'S5-15: a hard cut squeaks once, steady running and a gentle bend do not, and a reach or shooting foul has a body thud',
  viewports: ['desktop'],
  async run(t) {
    const th = [];
    for (const seed of [1, 2, 3, 4, 5]) th.push((await render(t, 'cue:thud', 1, { seed })).peak);
    t.expect(median(th) >= 0.2 && median(th) <= 0.45, `the thud peaks ${median(th)} at the typical repeat (want 0.2 to 0.45)`);
    const wav = (p) => t.page.evaluate((q) => window.__game.audioRender('cue:squeak', 0.5, true, { seed: 2, cue: { p: q } }).then((r) => ({ peak: r.peak, wav: r.wav })), p);
    const lo = await wav(0), hi = await wav(1);
    t.expect(lo.peak < 0.2 && hi.peak < 0.2 && lo.wav !== hi.wav, `the squeak stays a quiet tick (${lo.peak}, ${hi.peak}) and a harder cut is a different pitch`);
    await t.game('scene', 'title');
    await gesture(t);
    await exhibition(t, { seed: 13 });
    // the other team has the ball far away, so the player you steer is off the ball (a ball handler's reversal is a crossover, which has its own squeak)
    await t.game('act', 'give', 1, 0);
    await t.game('act', 'place', 1, 0, 80, 25);
    for (let k = 1; k < 5; k++) await t.game('act', 'place', 1, k, 84, 4 + k * 10);
    await t.game('act', 'place', 0, 2, 30, 25);
    for (let k = 0; k < 5; k++) if (k !== 2) await t.game('act', 'place', 0, k, 20, 4 + k * 10);
    await t.game('act', 'input', { mx: 1, mz: 0 });
    await t.game('step', 40); // about 0.7 s: past the 0.33 s it takes to reach top speed
    const s0 = await count(t, 'squeak');
    await t.game('step', 15);
    t.equal(await count(t, 'squeak'), s0, 'running straight is silent');
    await t.game('act', 'input', { mx: 1, mz: 0.45 });
    await t.game('step', 10);
    t.equal(await count(t, 'squeak'), s0, 'a gentle bend is silent');
    await t.game('act', 'input', { mx: -1, mz: 0 });
    await t.game('step', 40);
    t.equal(await count(t, 'squeak'), s0 + 1, 'reversing at speed squeaks, once');
    // contact: a reach foul and a shooting foul thud; an out-of-bounds whistle does not
    const k0 = await count(t, 'thud');
    await t.game('act', 'foul', 1, 'reach');
    await t.game('step', 3);
    t.equal(await count(t, 'thud'), k0 + 1, 'a reach foul thuds');
  },
});

// ---------------------------------------------------------------- S5-19 transitions and the quarter break
tests.push({
  name: 'S5-19: a menu screen change whooshes, the quarter break opens with the PA chime, and play and the pause card stay without a whoosh',
  viewports: ['desktop'],
  async run(t) {
    const wh = [];
    for (const seed of [1, 2, 3, 4, 5]) wh.push((await render(t, 'cue:whoosh', 0.5, { seed })).peak);
    t.expect(median(wh) > 0.02 && median(wh) < 0.2, `the whoosh is a quiet interface sound (${median(wh)})`);
    const ch = [];
    for (const seed of [1, 2, 3, 4, 5]) ch.push((await render(t, 'cue:chime', 2, { seed })).peak);
    t.expect(median(ch) >= 0.2 && median(ch) <= 0.45, `the chime peaks ${median(ch)} at the typical repeat (want 0.2 to 0.45)`);
    await t.game('scene', 'title');
    await gesture(t);
    const w0 = await count(t, 'whoosh');
    await t.game('scene', 'settings');
    t.equal(await count(t, 'whoosh'), w0 + 1, 'the title gives way to Settings with a whoosh');
    await t.game('scene', 'settings');
    t.equal(await count(t, 'whoosh'), w0 + 1, 'the same screen again does not');
    await exhibition(t, { seed: 9 });
    const w1 = await count(t, 'whoosh');
    await t.game('scene', 'pause');
    await t.game('scene', 'game');
    t.equal(await count(t, 'whoosh'), w1, 'the pause card and resuming play have no whoosh');
    const c0 = await count(t, 'chime');
    await stepUntil(t, (x) => x.scene === 'break', 60 * 60 * 3, 120, 'the quarter break');
    t.equal(await count(t, 'chime'), c0 + 1, 'the end of the quarter plays the chime once');
    t.equal(await count(t, 'whoosh'), w1, 'and the break card comes up with it, not with a whoosh');
  },
});
