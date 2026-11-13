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
  {
    name: 'S1-22: a mouse-and-keyboard machine with a touch screen has no pad until the first touch',
    viewports: ['desktop'],
    initScript: () => { Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => 5 }); },
    async run(t) {
      await exhibition(t, { seed: 19 });
      const padHidden = () => t.page.evaluate(() => document.querySelector('#pad').hidden);
      t.equal(await t.page.evaluate(() => navigator.maxTouchPoints), 5, 'the machine reports a touch screen');
      t.equal(await t.page.evaluate(() => matchMedia('(pointer: coarse)').matches), false, 'its main pointer is fine');
      t.equal(await padHidden(), true, 'no pad while playing with the keyboard');
      t.equal((await t.game('act', 'layout')).stick, null, 'the court keeps the whole screen');
      await t.page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true })));
      t.equal(await padHidden(), false, 'the first real touch shows the pad');
      await t.page.keyboard.press('c');
      t.equal(await padHidden(), true, 'a key press hides it again');
      await t.game('setState', { settings: { touch: 'on' } });
      t.equal((await t.state()).touch, true, 'the Always setting still forces it on');
    },
  },
  {
    name: 'S2-12: the title menu fits a landscape phone without scrolling',
    viewports: ['desktop'],
    async run(t) {
      for (const [w, h] of [[844, 390], [667, 375]]) {
        await t.page.setViewportSize({ width: w, height: h });
        await t.game('scene', 'title');
        await t.page.waitForTimeout(400);
        const r = await t.page.evaluate(() => {
          const sc = document.querySelector('#screen');
          return { H: innerHeight, scroll: sc.scrollHeight - sc.clientHeight, out: [...sc.querySelectorAll('.menu .btn')].filter((b) => b.getBoundingClientRect().bottom > innerHeight + 1).map((b) => b.textContent.trim()) };
        });
        t.equal(r.out.length, 0, `${w}x${h}: every menu button is inside the viewport (outside: ${r.out.join(', ')})`);
        await t.shot(`s2-12-title-${w}x${h}`);
      }
      await t.page.setViewportSize({ width: 1280, height: 800 });
    },
  },
];
