import { exhibition, stepUntil } from './helpers.mjs';

// Wave 1, batch B: input, rules and play regressions.

const FORCE_3D = () => { try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { graphics: '3d' } })); } catch (e) { /* storage blocked */ } };

async function ready3d(t) {
  await t.page.waitForFunction(() => {
    const g = window.__game && window.__game.getState().gfx;
    return g && ['ready', 'failed', 'unsupported'].includes(g.state);
  }, null, { timeout: 30000 });
  t.equal((await t.state()).gfx.state, 'ready', '3D renderer ready');
}

export const tests = [
  {
    name: 'S6-05: frames longer than 200 ms count as slow, so the governor steps down on a very slow CPU',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) { t.log('software GL already runs at the lowest step it reaches; run with --gpu'); return; }
      await ready3d(t);
      await exhibition(t, { seed: 9, paused: false });
      await t.cpuThrottle(20); // most frames now take well over 200 ms
      await t.page.waitForFunction(() => (window.__game.getState().gfx.gov || []).length >= 2, null, { timeout: 18000 }).catch(() => {});
      await t.cpuThrottle(1);
      const gov = (await t.state()).gfx.gov || [];
      t.log('governor steps: ' + gov.join(' → '));
      t.expect(gov.length >= 2, `the governor stepped down twice (${gov.join(', ')})`);
    },
  },
  {
    name: 'S6-05: one long frame among normal ones does not step quality down',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) { t.log('run with --gpu'); return; }
      await ready3d(t);
      await exhibition(t, { seed: 9, paused: false });
      await t.page.waitForTimeout(1500);
      const before = (await t.state()).gfx.gov.length;
      await t.page.evaluate(() => { const e = performance.now() + 600; while (performance.now() < e) { /* one hitch */ } });
      await t.page.waitForTimeout(3500);
      const gov = (await t.state()).gfx.gov;
      t.equal(gov.length, before, `a single 600 ms hitch is outvoted (${gov.join(', ')})`);
    },
  },
];
