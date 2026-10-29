import { click, stepUntil, waitFor } from './helpers.mjs';

export const tests = [
  {
    name: 'exhibition: girls, team picker and settings',
    async run(t) {
      await click(t, 'select');
      await click(t, 'pickProgram', 'girls');
      await click(t, 'pickHome', 'fountain-lake');
      await click(t, 'pickAway', 'mountain-pine');
      await click(t, 'pickSide', 'away');
      await click(t, 'setQ', '240');
      await click(t, 'setClock', '0');
      await click(t, 'setDiff', '2');
      await t.shot('04b-select-girls');
      await t.checkLayout();
      await click(t, 'startExhibition');
      const s = await t.state();
      t.equal(s.match.program, 'girls', 'girls');
      t.equal(s.match.teams[0].key, 'fountain-lake', 'home');
      t.equal(s.match.teams[1].key, 'mountain-pine', 'away');
      t.equal(s.match.user.team, 1, 'user is away');
      t.equal(s.match.rules.qLen, 240, '4-minute quarters');
      t.equal(s.match.rules.shotClock, 0, 'classic');
      t.equal(s.match.difficulty, 2, 'All-State');
      t.equal(s.match.teams[0].kit.light, true, 'home in light jerseys');
      t.equal(s.match.teams[1].kit.light, false, 'away in dark jerseys');
      await t.game('pause');
      await t.game('step', 200);
      await t.shot('26-exhibition-girls');
    },
  },
  {
    name: 'hot streak shootout',
    async run(t) {
      await click(t, 'shootoutSetup');
      await click(t, 'pickSchool', 'lake-hamilton');
      await click(t, 'pickProgram', 'boys');
      await click(t, 'startShootout');
      await t.game('pause');
      let s = await t.state();
      t.equal(s.scene, 'shootout', 'shootout scene');
      t.equal(s.shootout.phase, 'ready', 'waits for the first shot');
      const spots = await t.game('act', 'spots');
      t.equal(spots.length, 7, 'seven spots');
      t.expect(spots.some((p) => p.pts === 3) && spots.some((p) => p.pts === 2), 'spots worth 2 and 3');
      // a real held shot with the keyboard
      await t.page.keyboard.down('Space');
      await t.game('step', 28);
      await t.shot('27-shootout');
      await t.page.keyboard.up('Space');
      await t.game('step', 4);
      s = await t.state();
      t.equal(s.shootout.phase, 'live', 'clock started');
      t.equal(s.shootout.ball, 'shot', 'shot released');
      let maxMult = 1, streakSeen = 0;
      for (let k = 0; k < 24; k++) {
        await stepUntil(t, (x) => x.shootout.ball === 'held', 300, 6, 'ball back');
        await t.game('act', 'shootoutShot', 1);
        await t.game('step', 6);
        s = await stepUntil(t, (x) => x.shootout.ball !== 'shot' && x.shootout.ball !== 'held', 200, 4, 'resolved');
        maxMult = Math.max(maxMult, s.shootout.mult); streakSeen = Math.max(streakSeen, s.shootout.streak);
        if (s.shootout.streak >= 3) t.equal(s.shootout.mult, 2, 'x2 from three straight');
        if (maxMult >= 2) break;
      }
      t.log(`streak ${streakSeen}, mult ${maxMult}, score ${s.shootout.score}`);
      t.expect(s.shootout.att >= 2 && s.shootout.score > 0, 'shots count and score');
      t.expect(maxMult >= 2, 'the steam gauge multiplier kicks in');
      await t.game('setState', { shootout: { t: 0.05 } });
      s = await stepUntil(t, (x) => x.scene === 'shootoutEnd', 400, 10, 'end');
      t.expect(s.best.shootout === s.shootout.score, 'best saved');
      await t.shot('27b-shootout-end');
      await t.checkLayout();
    },
  },
  {
    name: 'banner challenges',
    async run(t) {
      await click(t, 'challenges');
      const txt = await t.page.textContent('#screen');
      for (const w of ['Double Crown', 'Lady Trojans Five', 'Bookend Banners', '1912 Colors', '6A Trial Run', '2A-7 Showdown', 'game scenario, not a recreation', 'Source:']) t.expect(txt.includes(w), `lists ${w}`);
      t.equal(await t.page.locator('.chal').count(), 6, 'six challenges');
      await t.shot('28-challenges');
      await t.checkLayout();
      await click(t, 'playChallenge', 'lady-trojans-five|girls');
      await t.game('pause');
      let s = await t.state();
      t.equal(s.match.q, 4, 'starts in Q4');
      t.expect(Math.abs(s.match.t - 120) < 0.1, '2:00 left');
      t.equal(s.match.score[0] - s.match.score[1], -6, 'down 6');
      t.equal(s.match.venue, 'arena', 'state final at the arena');
      await t.game('step', 90);
      await t.shot('28b-challenge-play');
      await t.game('act', 'finishGame', { winner: 0 });
      await waitFor(t, (x) => x.scene === 'final', 4000, 'final');
      t.expect((await t.page.textContent('#screen')).includes('Challenge complete'), 'complete');
      await click(t, 'afterChallenge');
      s = await t.state();
      t.equal(s.challenges['lady-trojans-five'], true, 'completion saved');
      t.expect((await t.page.textContent('#screen')).includes('Completed'), 'list shows completion');
      // 1912 colors unlocks the throwback
      t.equal(s.unlocks.throwback, false, 'kit locked at first');
      await click(t, 'playChallenge', '1912-colors|boys');
      await t.game('pause');
      s = await t.state();
      t.equal(s.match.teams[0].kit.throwback, true, 'Hot Springs in the throwback kit');
      t.equal(s.match.teams[1].kit.light, true, 'Lakeside switches to light jerseys against it');
      t.equal(s.match.rules.shotClock, 0, 'classic rules');
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('step', 60);
      await t.shot('28c-throwback');
      await t.game('act', 'finishGame', { winner: 0 });
      await waitFor(t, (x) => x.scene === 'final', 4000, 'final');
      await click(t, 'afterChallenge');
      s = await t.state();
      t.equal(s.unlocks.throwback, true, 'throwback unlocked');
      // multi-step: double crown needs two wins
      await click(t, 'playChallenge', 'double-crown|boys');
      await t.game('act', 'finishGame', { winner: 0 });
      await waitFor(t, (x) => x.scene === 'final', 4000, 'final');
      t.expect((await t.page.textContent('#screen')).includes('Step complete'), 'first step');
      await click(t, 'afterChallenge');
      s = await t.state();
      t.equal(s.match.program, 'girls', 'second final is the girls game');
      t.equal(s.challenge.step, 1, 'step 2');
    },
  },
  {
    name: 'trophy room',
    async run(t) {
      await t.game('newGame', { mode: 'season', school: 'lakeside', program: 'boys', length: 'short', seed: 12 });
      for (let k = 0; k < 6; k++) await t.game('act', 'seasonResult', 50, 40);
      await t.game('scene', 'trophies');
      const txt = await t.page.textContent('#screen');
      t.expect(txt.includes('Lakeside') && txt.includes('Season 1 state champions'), 'earned banner');
      t.expect(txt.includes('1932, 1996, 1998') && txt.includes('1990, 1997, 1998, 2015, 2018') && txt.includes('1945 and 2000'), 'real title years');
      t.expect(txt.includes('Hot Streak best') && txt.includes('throwback'), 'records and unlocks');
      await t.shot('29-trophies');
      await t.checkLayout();
    },
  },
];
