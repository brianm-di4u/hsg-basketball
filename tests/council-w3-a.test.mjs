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
