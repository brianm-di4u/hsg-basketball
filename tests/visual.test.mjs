// 3D renderer: boot, fallback, venues, player close-ups, the shot payoff and replays. The shots here are the
// visual review record. "Graphics: 3D gym" is forced through the saved settings, because the harness's
// headless Chromium renders WebGL in software, where the game's Auto setting keeps the classic 2D court.
// Download budgets live in budget.test.mjs; real-GPU frame rates in perf-gpu.test.mjs (run with --gpu).
import { exhibition } from './helpers.mjs';

const FORCE_3D = () => { try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { graphics: '3d' } })); } catch (e) { /* storage blocked */ } };

async function ready3d(t) {
  await t.page.waitForFunction(() => {
    const g = window.__game && window.__game.getState().gfx;
    return g && ['ready', 'failed', 'unsupported'].includes(g.state);
  }, null, { timeout: 30000 });
  const s = await t.state();
  t.equal(s.gfx.state, 'ready', `3D renderer ready ${s.gfx.err || ''}`);
  t.equal(s.gfx.mode, '3d', '3D mode active');
  return s;
}

// the user's shooter at a spot, ball in hand, paused
async function setShooter(t, x, z) {
  const s = await t.state();
  const me = s.match.players.find((p) => p.t === 0 && p.slot === 0);
  await t.game('act', 'give', 0, me.slot);
  await t.game('act', 'place', 0, me.slot, x, z);
  await t.game('step', 1);
  return me;
}

export const tests = [
  {
    name: '3D: boots and draws the home gym, tip-off and live play',
    initScript: FORCE_3D,
    async run(t) {
      const s0 = await ready3d(t);
      t.log(`renderer: ${s0.gfx.gl && s0.gfx.gl.renderer}`);
      await t.shot('v01-title');
      await exhibition(t, { home: 'hot-springs', away: 'lakeside' });
      await t.game('step', 2);
      await t.shot('v02-tipoff');
      await t.game('step', 200);
      await t.shot('v03-live');
      const s = await t.state();
      t.expect(s.gfx.calls > 20 && s.gfx.calls < 400, `draw calls in budget (${s.gfx.calls})`);
      t.log(`gfx calls ${s.gfx.calls}, tris ${s.gfx.tris}, textures ${s.gfx.texs}, tier ${s.gfx.tier}`);
    },
  },
  {
    name: '3D: close camera on players and faces',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await exhibition(t, { home: 'lake-hamilton', away: 'jessieville', program: 'girls' });
      await t.game('step', 260);
      const s = await t.state();
      const h = s.match.players.find((p) => p.i === s.match.ball.holder) || s.match.players[0];
      await t.game('act', 'cam', { p: [h.x + 9, 6, h.z + 12], t: [h.x, 3.2, h.z], fov: 34 });
      await t.shot('v10-close-handler');
      await t.game('act', 'cam', { p: [47, 7, 25 + 26], t: [47, 3, 25], fov: 40 });
      await t.shot('v11-close-center');
      const p0 = s.match.players[2];
      await t.game('act', 'cam', { p: [p0.x - 1.5, 6.2, p0.z + 5], t: [p0.x, 5.5, p0.z], fov: 30 });
      await t.shot('v12-head');
      await t.game('act', 'cam', null);
    },
  },
  {
    name: '3D: jump shot with the meter, trail and swish',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await exhibition(t, { home: 'hot-springs', away: 'lakeside', seed: 11 });
      await t.stepUntil((s) => s.match.phase === 'live', { max: 900, chunk: 30, label: 'live' });
      await setShooter(t, 70, 14);
      await t.game('act', 'input', { shoot: true });
      await t.game('step', 22);
      await t.shot('v20-gather');
      await t.game('act', 'input', { shoot: false });
      await t.game('step', 14);
      await t.shot('v21-release');
      const inFrame = async (label) => {
        const r = await t.game('act', 'project', 88.75, 25, 10);
        t.expect(r.x > 0 && r.x < r.W && r.y > 0 && r.y < r.H, `${label}: the attacked rim is on screen (${r.x}, ${r.y} in ${r.W}×${r.H})`);
      };
      await inFrame('release');
      await t.game('step', 26);
      await t.shot('v22-flight');
      await inFrame('flight');
    },
  },
  {
    name: '3D: highlight replay',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await exhibition(t, { home: 'fountain-lake', away: 'mountain-pine', seed: 3 });
      await t.stepUntil((s) => s.match.phase === 'live', { max: 900, chunk: 30, label: 'live' });
      await setShooter(t, 80, 6);
      await t.game('act', 'shootAt', 1);
      await t.game('step', 90);
      t.expect(await t.game('act', 'replay', 'THREE', 1, 0.62), 'replay starts from the buffer');
      await t.game('act', 'freeze', true);
      const s = await t.state();
      t.expect(s.replay && s.replay.n > 60, 'replay has frames');
      await t.shot('v30-replay', { wait: false });
      await t.game('act', 'freeze', false);
      await t.page.keyboard.press('Space');
      await t.page.waitForTimeout(50);
      t.equal((await t.state()).replay, null, 'a key skips the replay');
    },
  },
  {
    name: '3D: state finals arena',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await t.seed(4);
      await t.game('newGame', { mode: 'challenge', challenge: 'lady-trojans-five', program: 'girls', paused: true });
      await t.game('step', 60);
      await t.shot('v40-arena');
      await t.game('act', 'cam', { p: [10, 30, 25 + 70], t: [47, 8, 0], fov: 50 });
      await t.shot('v41-arena-wide');
      await t.game('act', 'cam', null);
    },
  },
  {
    name: '3D: shootout and menus over the gym',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await t.game('scene', 'select');
      await t.shot('v50-select');
      await t.seed(2);
      await t.game('newGame', { mode: 'shootout', paused: true });
      await t.game('step', 40);
      await t.shot('v51-shootout');
      await t.checkLayout();
    },
  },
  {
    name: '3D: quality tier changes keep drawing (adaptive governor)',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await exhibition(t, { seed: 9 });
      await t.game('step', 200); // one long frame: must not count as a slow frame
      t.equal((await t.state()).gfx.tier, t.viewport === 'mobile' ? 'medium' : 'high', 'step(n) hooks do not trip the governor');
      for (const tier of ['medium', 'low']) {
        await t.game('act', 'gfx', {}, tier);
        await t.game('step', 2);
        const s = await t.state();
        t.equal(s.gfx.tier, tier, `tier ${tier} applied`);
        const shot = await t.shot(`v55-tier-${tier}`);
        t.expect(shot.stats.stddev > 25, `tier ${tier}: the court is drawn (stddev ${shot.stats.stddev.toFixed(1)})`);
      }
    },
  },
  {
    name: 'fallback: ?gl=0 keeps the classic 2D court',
    url: 'index.html?gl=0',
    async run(t) {
      await t.page.waitForTimeout(300);
      const s = await t.state();
      t.equal(s.gfx.mode, '2d', 'classic renderer');
      t.equal(s.gfx.state, 'off', 'three.js never loaded');
      t.expect(!(await t.page.evaluate(() => !!window.THREE)), 'no three.js on the page');
      await exhibition(t);
      await t.game('step', 120);
      await t.shot('v60-fallback-2d');
    },
  },
];
