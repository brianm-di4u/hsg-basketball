import { exhibition, stepUntil, click } from './helpers.mjs';

// Wave 2, batch C: P-N01 the move set (sprint, pump fake, crossover) and S3-03 opponent styles and score-aware play.

const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];
const input = (t, o) => t.game('act', 'input', o);
const player = (s, i) => s.match.players[i];
const fga = (s, team = 0) => s.match.stats[team].reduce((a, p) => a + p.fga, 0);

// A live game, the user (team 0, player 0) holding the ball at (x, z) with the other nine parked far away.
async function stage(t, x = 12, z = 25, seed = 31) {
  await exhibition(t, { seed });
  await stepUntil(t, (s) => s.match.phase === 'live', 900, 10, 'live');
  await t.game('act', 'autoplay', false);
  await park(t, x, z);
}
async function park(t, x, z) {
  await t.game('act', 'give', 0, 0);
  for (let i = 1; i < 5; i++) await t.game('act', 'place', 0, i, 20, 6 * i);
  for (let i = 0; i < 5; i++) await t.game('act', 'place', 1, i, 80, 6 + 9 * i);
  await t.game('act', 'place', 0, 0, x, z);
}

export const tests = [
  {
    name: 'P-N01: holding Sprint runs faster and costs energy; spent legs cut the boost out',
    viewports: ['desktop'],
    async run(t) {
      const run = async (sprint, energy) => {
        await stage(t, 10, 25);
        if (energy != null) await t.game('act', 'tire', 0, 0, energy);
        const s0 = await t.state();
        await input(t, { mx: 1, sprint });
        await t.game('step', 100);
        const s = await t.state();
        await input(t, { mx: 0, sprint: false });
        return { dx: player(s, 0).x - player(s0, 0).x, de: player(s0, 0).energy - player(s, 0).energy };
      };
      const walk = await run(false), sprint = await run(true);
      t.log(`walk ${walk.dx.toFixed(1)} ft, sprint ${sprint.dx.toFixed(1)} ft, energy ${walk.de.toFixed(3)} vs ${sprint.de.toFixed(3)}`);
      t.expect(sprint.dx > walk.dx * 1.15, `sprint covers more ground (${sprint.dx.toFixed(1)} vs ${walk.dx.toFixed(1)})`);
      t.expect(sprint.de > walk.de * 1.8, `sprint drains more energy (${sprint.de.toFixed(3)} vs ${walk.de.toFixed(3)})`);
      const tired = await run(true, 0.25);
      t.expect(tired.dx < walk.dx * 1.08, `no boost when the legs are spent (${tired.dx.toFixed(1)} vs walk ${walk.dx.toFixed(1)})`);
    },
  },
  {
    name: 'P-N01: the Shift key is Sprint (real key presses)',
    viewports: ['desktop'],
    async run(t) {
      const go = async (shift) => {
        await stage(t, 10, 25);
        const x0 = player(await t.state(), 0).x;
        await t.page.keyboard.down('ArrowRight');
        if (shift) await t.page.keyboard.down('Shift');
        await t.game('step', 90);
        const x1 = player(await t.state(), 0).x;
        if (shift) await t.page.keyboard.up('Shift');
        await t.page.keyboard.up('ArrowRight');
        return x1 - x0;
      };
      const a = await go(false), b = await go(true);
      t.expect(b > a * 1.12, `Shift makes the run longer (${b.toFixed(1)} vs ${a.toFixed(1)})`);
      const fx = (await t.state()).match.fx;
      t.expect(fx.sprint[0] > 0.5, `the sim counted sprint time (${fx.sprint[0].toFixed(2)} s)`);
    },
  },
  {
    name: 'P-N01: a quick Shoot tap is a pump fake; holding it still shoots',
    viewports: ['desktop'],
    async run(t) {
      let jumped = 0, fakes = 0;
      for (let k = 0; k < 14; k++) {
        if (k === 0) await stage(t, 62, 25, 33); else await park(t, 62, 25);
        await t.game('act', 'place', 1, 0, 64.2, 25);
        const before = fga(await t.state());
        await input(t, { shoot: true });
        await t.game('step', 4);
        await input(t, { shoot: false });
        await t.game('step', 1);
        let s = await t.state();
        t.equal(player(s, 0).act, 'pump', 'the tap became a pump fake');
        t.equal(s.match.ball.state, 'held', 'the ball is still in his hands');
        fakes++;
        let seen = false;
        for (let n = 0; n < 8; n++) { await t.game('step', 1); s = await t.state(); if (player(s, 5).y > 0 || player(s, 5).act === 'jump') seen = true; }
        if (seen) jumped++;
        t.equal(fga(await t.state()), before, 'a fake is not an attempt');
        await t.game('step', 60);
      }
      t.expect(jumped >= 2, `the defender bit on ${jumped} of ${fakes} fakes`);
      t.expect(jumped < fakes, `and did not bite every time (${jumped} of ${fakes})`);
      await park(t, 62, 25);
      await input(t, { shoot: true });
      await t.game('step', 22);
      await input(t, { shoot: false });
      await t.game('step', 2);
      const s = await t.state();
      t.equal(s.match.ball.state, 'shot', 'a held button releases a real shot');
    },
  },
  {
    name: 'P-N01: flipping the stick while dribbling is a crossover; a pause between does not count',
    viewports: ['desktop'],
    async run(t) {
      await stage(t, 30, 25, 35);
      await input(t, { mx: 1 });
      await t.game('step', 24);
      let s = await t.state();
      const xf = player(s, 0).x;
      await input(t, { mx: -1 });
      await t.game('step', 1);
      s = await t.state();
      t.equal(player(s, 0).act, 'cross', 'the flip starts a crossover');
      t.equal(s.match.fx.cross[0], 1, 'counted once');
      await t.game('step', 12);
      s = await t.state();
      t.expect(player(s, 0).x < xf, `he is heading back the other way (${xf.toFixed(1)} to ${player(s, 0).x.toFixed(1)})`);
      await input(t, { mx: 0 });
      await t.game('step', 90);
      await park(t, 30, 25);
      await input(t, { mx: 1 });
      await t.game('step', 24);
      await input(t, { mx: 0 });
      await t.game('step', 30);
      await input(t, { mx: -1 });
      await t.game('step', 10);
      s = await t.state();
      t.equal(s.match.fx.cross[0], 1, 'stopping first is not a crossover');
      await input(t, { mx: 0 });
      // it can leave a defender behind, and the one beaten is slowed
      let slowed = 0;
      for (let k = 0; k < 12; k++) {
        await park(t, 30, 25);
        await t.game('act', 'place', 1, 0, 33, 28);
        await input(t, { mx: 1 });
        await t.game('step', 24);
        await t.game('act', 'place', 1, 0, 36, 27);
        await input(t, { mx: -1 });
        await t.game('step', 2);
        s = await t.state();
        if (player(s, 5).stun > 0) slowed++;
        await input(t, { mx: 0 });
        await t.game('step', 70);
      }
      t.expect(slowed >= 2 && slowed < 12, `a close defender was left behind ${slowed} of 12 times`);
    },
  },
  {
    name: 'P-N01: both teams use the move set in a whole game',
    viewports: ['desktop'],
    async run(t) {
      await exhibition(t, { seed: 41, qLen: 120 });
      await t.game('act', 'finishGame');
      const fx = (await t.state()).match.fx;
      t.log(`sprint s ${fx.sprint.map((x) => x.toFixed(0))}, fakes ${fx.pump}, crossovers ${fx.cross}`);
      t.expect(fx.sprint[0] > 10 && fx.sprint[1] > 10, 'both sides sprint');
      t.expect(fx.pump[0] + fx.pump[1] >= 1, 'the AI pumps');
      t.expect(fx.cross[0] + fx.cross[1] >= 1, 'the AI crosses over');
    },
  },
  {
    name: 'P-N01: Sprint is on the touch pad (44 px, on screen, nothing overlaps) and runs farther',
    viewports: ['mobile'],
    async run(t) {
      await stage(t, 10, 25, 37);
      const L = await t.game('act', 'layout');
      for (const k of ['stick', 'shoot', 'pass', 'sw', 'sprint']) {
        t.expect(L[k] && L[k].w >= 44 && L[k].h >= 44, `${k} is at least 44 px (${L[k] && L[k].w}x${L[k] && L[k].h})`);
        t.expect(L[k] && L[k].y + L[k].h <= t.vp.height && L[k].x >= 0 && L[k].x + L[k].w <= t.vp.width, `${k} on screen`);
      }
      const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      const names = ['stick', 'sprint', 'sw', 'pass', 'shoot'];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) t.expect(!hit(L[names[i]], L[names[j]]), `${names[i]} does not overlap ${names[j]}`);
      await t.shot('P-N01-pad');
      const cdp = await t.page.context().newCDPSession(t.page);
      const pt = (id, x, y) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 });
      const [sx, sy] = center(L.stick), [bx, by] = center(L.sprint);
      const run = async (withBtn) => {
        await park(t, 10, 25);
        const p0 = player(await t.state(), 0);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: withBtn ? [pt(1, sx, sy), pt(2, bx, by)] : [pt(1, sx, sy)] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: withBtn ? [pt(1, sx + 50, sy), pt(2, bx, by)] : [pt(1, sx + 50, sy)] });
        await t.game('step', 60); // short: the run stays inside the sideline
        const p1 = player(await t.state(), 0);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await t.game('step', 60);
        return Math.hypot(p1.x - p0.x, p1.z - p0.z);
      };
      const a = await run(false), b = await run(true);
      await cdp.detach();
      t.expect(b > a * 1.1, `holding SPRINT runs farther (${b.toFixed(1)} vs ${a.toFixed(1)} ft)`);
    },
  },
  {
    name: 'P-N01: Help lists Sprint, the pump fake and the crossover',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.game('scene', 'help');
      let txt = await t.page.evaluate(() => document.getElementById('screen').innerText);
      for (const w of ['Sprint', 'Pump fake', 'Crossover']) t.expect(txt.includes(w), `the Controls tab mentions ${w}`);
      await click(t, 'helpTab', 'play');
      txt = await t.page.evaluate(() => document.getElementById('screen').innerText);
      t.expect(/sprint, fakes and crossovers/i.test(txt), 'the Playing tab explains them');
      await t.shot('P-N01-help');
    },
  },
];
