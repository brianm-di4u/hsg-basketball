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
