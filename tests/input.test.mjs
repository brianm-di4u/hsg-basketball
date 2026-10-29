import { exhibition, stepUntil } from './helpers.mjs';

const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];

export const tests = [
  {
    name: 'touch controls: stick, pass, shoot, switch',
    viewports: ['mobile'],
    async run(t) {
      await exhibition(t, { difficulty: 0, seed: 17 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      const L = await t.game('act', 'layout');
      for (const k of ['stick', 'shoot', 'pass', 'sw', 'pause']) {
        t.expect(L[k] && L[k].w >= 44 && L[k].h >= 44, `${k} is at least 44 px (${L[k] && L[k].w}x${L[k] && L[k].h})`);
        t.expect(L[k] && L[k].y + L[k].h <= t.vp.height && L[k].x >= 0 && L[k].x + L[k].w <= t.vp.width, `${k} on screen`);
      }
      t.expect(L.stick.y >= L.stage.y + L.stage.h - 1, 'controls sit below the court, not over it');
      await t.game('act', 'give', 0, 0);
      await t.game('act', 'place', 0, 0, 40, 25);
      for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 15, 5 + s * 10);
      let s = await t.state();
      // portrait phones turn input to the camera, so measure where the player goes on screen
      const p0 = { ...s.match.players[0] };
      // hold the stick to the right while the sim steps
      // hold the stick right with raw CDP touch points while the sim steps (t.touchDrag lifts at the end)
      const [cx, cy] = center(L.stick);
      const cdp = await t.page.context().newCDPSession(t.page);
      const pt = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(cx, cy) });
      for (let k = 1; k <= 5; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(cx + k * 10, cy) });
      await t.game('step', 30);
      await t.shot('11d-touch');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.detach();
      s = await t.state();
      const p1 = s.match.players[0];
      // both ends through the same (final) camera, which follows the ball
      const x0 = (await t.game('act', 'project', p0.x, p0.z)).x, x1 = (await t.game('act', 'project', p1.x, p1.z)).x;
      t.expect(x1 > x0 + 20, `stick moves the player right on screen (${x0} → ${x1} px)`);
      t.log(`stick: ${x0} → ${x1} px`);
      await t.tap(center(L.pass));
      await t.game('step', 4);
      s = await t.state();
      t.expect(s.match.ball.state === 'pass' || (s.match.ball.holder > 0 && s.match.ball.holder < 5), 'PASS button passes to a teammate');
      s = await stepUntil(t, (x) => x.match.ball.state === 'held', 120, 4, 'catch');
      await t.tap(center(L.shoot));
      await t.game('step', 3);
      s = await t.state();
      t.expect(s.match.ball.state === 'shot' || ['shoot', 'layup'].includes(s.match.players[s.match.user.ctrl].act), 'SHOOT button shoots');
      // switch on defense
      await stepUntil(t, (x) => x.match.ball.state !== 'shot', 200, 5, 'shot resolves');
      await t.game('act', 'give', 1, 0);
      await t.game('step', 2);
      const c0 = (await t.state()).match.user.ctrl;
      await t.tap(center(L.sw));
      await t.game('step', 2);
      t.expect((await t.state()).match.user.ctrl !== c0, 'SWITCH changes the controlled defender');
      await t.tap(center(L.pause));
      t.equal((await t.state()).scene, 'pause', 'pause button');
    },
  },
  {
    name: 'desktop hides touch controls; keyboard switch and steal',
    viewports: ['desktop'],
    async run(t) {
      await exhibition(t, { seed: 19 });
      const L = await t.game('act', 'layout');
      t.equal(L.stick, null, 'no touch pad on desktop');
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('act', 'give', 1, 0);
      await t.game('step', 2);
      const c0 = (await t.state()).match.user.ctrl;
      await t.page.keyboard.press('c');
      await t.game('step', 2);
      t.expect((await t.state()).match.user.ctrl !== c0, 'C switches defender');
      await t.page.keyboard.press('x');
      await t.game('step', 2);
      const s = await t.state();
      t.expect(s.match.players[s.match.user.ctrl].act === 'steal' || s.match.ball.holder !== 5 || s.match.phase !== 'live', 'X attempts a steal');
    },
  },
];
