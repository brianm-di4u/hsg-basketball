// M5 animation gates: the streamed clips drive the players (mocap locomotion, keyed one-shots), planted feet
// don't skate, the ball sits in the palm, the procedural poses still work as the fallback, and the mixer stays
// cheap on a slow CPU. The clips stream with the HQ art, which software GL never loads, so the clip checks run
// with --gpu; the fallback check runs everywhere.
import { FORCE_3D, ready3d, hqSettled } from './helpers.mjs';

const G = (t, fn, ...a) => t.page.evaluate(fn, a);
const anim = async (t) => (await t.state()).gfx.anim;
async function live(t, o) {
  await G(t, ([o]) => {
    const g = window.__game; g.seed(o.seed);
    g.newGame({ mode: 'exhibition', program: 'boys', paused: true, home: 'hot-springs', away: 'lakeside', user: 'none', ...o });
    for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
  }, o);
}

export const tests = [
  {
    name: 'anim: procedural fallback renders',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await live(t, { seed: 14 });
      await t.game('act', 'anim', 'proc');
      await t.game('step', 60);
      const s = await t.state();
      t.equal(s.gfx.state, 'ready', 'renderer still ready with procedural poses');
      t.expect(s.gfx.frames > 0, 'frames drawn');
      await t.game('act', 'anim', 'mixer');
    },
  },
  {
    name: 'anim: clips, foot lock, ball seat, cost',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) { t.log('software GL: the clips stream with the HQ art (run with --gpu)'); return; }
      await ready3d(t);
      await hqSettled(t);
      let a = await anim(t);
      t.expect(a.clips >= 19, `animation clips loaded (${a.clips})`);
      t.equal(a.mode, 'mixer', 'the mixer drives the players');

      // open play: feet stay planted while the clip says so
      await live(t, { seed: 14 });
      await t.game('act', 'anim', 'reset');
      for (let k = 0; k < 120; k++) await t.game('step', 2);
      a = await anim(t);
      t.expect(a.locked > 200, `planted-foot frames observed (${a.locked})`);
      t.expect(a.footResidCm < 4, `foot-lock residual ${a.footResidCm} cm < 4 cm`);
      t.expect(a.ballErrCm < 6, `ball within ${a.ballErrCm} cm of the palm while held < 6 cm`);
      t.log(`one-shots seen in open play: ${a.seen.join(', ')}; slips ${a.slips} worst ${JSON.stringify(a.worst)}`);

      // a dunk: a fast drive from just outside the restricted area
      await live(t, { seed: 12, user: 'home' });
      await t.game('act', 'anim', 'reset');
      const kinds = await G(t, () => {
        const g = window.__game, out = new Set();
        for (let tries = 0; tries < 6 && ![...out].some((k) => k.startsWith('dunk')); tries++) {
          g.act('give', 0, 4); g.act('place', 0, 4, 84.5 - tries * 0.6, 25);
          for (let s = 0; s < 5; s++) g.act('place', 1, s, 30, 5 + s * 10);
          g.step(2);
          g.act('shootAt', 1);
          for (let k = 0; k < 30; k++) { g.step(2); for (const n of g.getState().gfx.anim.seen) out.add(n); }
        }
        return [...out];
      });
      t.expect(kinds.some((k) => k.startsWith('dunk') || k === 'layup'), `a drive plays a dunk or layup clip (${kinds.join(', ')})`);

      // cost: the whole mixer per frame, ten players and two officials, at 4× CPU throttle
      await live(t, { seed: 14 });
      await t.cpuThrottle(4);
      await t.game('act', 'anim', 'reset');
      for (let k = 0; k < 60; k++) await t.game('step', 1);
      a = await anim(t);
      await t.cpuThrottle(1);
      const perFrame = a.msPer * 12;
      t.log(`mixer ${a.msPer} ms per player, ~${perFrame.toFixed(3)} ms per frame at 4× throttle`);
      t.expect(perFrame <= 1.5, `mixer ≤ 1.5 ms per frame at 4× throttle (${perFrame.toFixed(3)})`);
    },
  },
];
