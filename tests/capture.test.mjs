// The visual review record: the same named stills, frame bursts and a short video every milestone, on the
// machine's real GPU, so review rounds compare like with like (sheets.mjs --compare pairs shots by name).
//
//   node shared/test-harness/run.mjs . --gpu --file capture --milestone v3-m0-r1
//   node tools/probe.mjs v3-m0-r1          → region metrics and annotated crops
//   node tools/review-pack.mjs v3-m0-r1    → the reviewers' packet
//
// Without --gpu (software WebGL) only the first still is taken, to keep `npm test` fast.
import fs from 'node:fs';
import path from 'node:path';
import { FORCE_3D, ready3d, SEEDS, shotFromInPage, cshot, meta, saveMeta, burst } from './helpers.mjs';

const G = (t, fn, ...a) => t.page.evaluate(fn, a);

// a paused exhibition stepped until play is live
async function liveGame(t, o) {
  await G(t, ([o]) => {
    const g = window.__game; g.seed(o.seed);
    g.newGame({ mode: 'exhibition', program: 'boys', user: 'home', paused: true, ...o });
    for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
  }, o);
}
// a jumper from the right wing: ball to the user's guard, placed, meter held
async function setJumper(t) {
  await liveGame(t, { seed: 5, home: 'lakeside', away: 'fountain-lake', program: 'girls' });
  await G(t, () => { const g = window.__game; g.act('give', 0, 0); g.act('place', 0, 0, 70, 14); g.step(1); g.act('input', { shoot: true }); });
}
async function forcedShot(t, seed, q, want) {
  const pts = await G(t, ([a]) => window.__shotFrom(a), [seed, q]);
  t.equal(pts, want, `seed ${seed} forced shot q=${q} scores ${want} (re-run tools/find-seeds.mjs if the sim changed)`);
}
const installShotFrom = (t) => t.page.evaluate(`window.__shotFrom = ${shotFromInPage.toString()}`);
// a close camera aimed at a player's chest (court feet): from `side` (+1 near sideline) at distance d
async function closeOn(t, i, { d = 9, h = 5.2, side = 1, fov = 28 } = {}) {
  const s = await t.state(), p = s.match.players.find((q) => q.i === i);
  await t.game('act', 'cam', { p: [p.x - 2, h, p.z + side * d], t: [p.x, 4.6, p.z], fov });
}

export const tests = [
  {
    name: 'capture: stills',
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await installShotFrom(t);
      await t.page.waitForTimeout(1200); // the title's attract camera settles in real time
      await cshot(t, 'c01-title');
      if (!t.gpu) { t.log('software GL: first still only; run with --gpu for the full capture'); return; }

      await liveGame(t, { seed: 11, home: 'hot-springs', away: 'lake-hamilton' });
      await t.game('step', 300);
      await cshot(t, 'c02-live');

      await setJumper(t);
      await t.game('step', 22); await cshot(t, 'c03-gather');
      await t.game('act', 'input', { shoot: false }); await t.game('step', 14); await cshot(t, 'c04-release');
      await t.game('step', 24); await cshot(t, 'c05-flight');

      await forcedShot(t, SEEDS.make3, 1, 3);
      await t.game('step', 6); await cshot(t, 'c06-make', { wait: false });
      await t.game('step', 42); await cshot(t, 'c16-crowd-reaction', { wait: false });
      await forcedShot(t, SEEDS.make3, 1, 3);
      await t.game('act', 'cam', { p: [80, 11.5, 31], t: [88.75, 8.6, 25], fov: 30 });
      await t.game('step', 2); await cshot(t, 'c18-net-close', { wait: false });
      await t.game('act', 'cam', null);
      await forcedShot(t, SEEDS.miss, 0.08, 0);
      await cshot(t, 'c07-miss', { wait: false });

      await liveGame(t, { seed: 3, home: 'fountain-lake', away: 'mountain-pine' });
      await G(t, () => { const g = window.__game; g.act('give', 0, 0); g.act('place', 0, 0, 80, 6); g.step(1); g.act('shootAt', 1); g.step(90); g.act('replay', 'THREE', 1, 0.6); g.act('freeze', true); });
      await cshot(t, 'c08-replay');
      await G(t, () => { const g = window.__game; g.act('replay', 'THREE', 1, 0.45); g.act('freeze', true); });
      await cshot(t, 'c17-replay-early');
      await G(t, () => { const g = window.__game; g.act('freeze', false); g.act('endReplay'); });

      await G(t, () => { const g = window.__game; g.seed(4); g.newGame({ mode: 'challenge', challenge: 'lady-trojans-five', program: 'girls', paused: true }); g.step(200); });
      await cshot(t, 'c09-arena');
      await liveGame(t, { seed: 8, home: 'jessieville', away: 'cutter-morning-star', program: 'girls' });
      await t.game('step', 380); await cshot(t, 'c10-jessieville');
      await liveGame(t, { seed: 9, home: 'mountain-pine', away: 'lake-hamilton', user: 'away' });
      await t.game('step', 460); await cshot(t, 'c11-mountain-pine');

      // close-ups: the bench and scorer's table, a player's face and hands
      await liveGame(t, { seed: 11, home: 'hot-springs', away: 'lake-hamilton' });
      await t.game('step', 120);
      await t.game('act', 'cam', { p: [44, 5, 9], t: [33, 1.8, -5.5], fov: 36 });
      await cshot(t, 'c15-bench-close');
      await closeOn(t, 5, { d: 7, h: 5.6, fov: 24 }); // an opponent: the user's YOU chevron would cover the face
      await cshot(t, 'c21-face-close');
      await t.game('act', 'cam', null);
      await t.game('step', 260);
      await cshot(t, 'c19-handler');

      await G(t, () => { const g = window.__game; g.seed(2); g.newGame({ mode: 'shootout', paused: true }); g.step(40); });
      await cshot(t, 'c12-shootout');
      await t.game('scene', 'select');
      await cshot(t, 'c13-select', { animations: true });
      await G(t, () => window.__game.newGame({ mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 3 }));
      await t.game('scene', 'hub');
      await cshot(t, 'c20-hub', { animations: true });
      await liveGame(t, { seed: 11, home: 'hot-springs', away: 'lake-hamilton' });
      await t.game('step', 60);
      await t.game('scene', 'pause');
      await cshot(t, 'c22-pause', { animations: true });
      await G(t, () => window.__game.newGame({ mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 3 }));
      await G(t, () => { const g = window.__game; for (let k = 0; k < 6 && !g.getState().season.done; k++) g.act('seasonResult', 60, 40); });
      await t.game('scene', 'champion');
      await t.page.waitForTimeout(1500);
      await cshot(t, 'c14-champion');
      saveMeta(t);
    },
  },
  {
    name: 'capture: motion bursts',
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) return;
      await ready3d(t);
      await installShotFrom(t);
      // the jumper: gather → set point → release → flight → rim
      await setJumper(t);
      await burst(t, 'jumper', { frames: 18, every: 3, onFrame: (k) => k === 7 && t.game('act', 'input', { shoot: false }) });
      // a drive to the rim (layup or dunk, whichever the sim picks)
      await liveGame(t, { seed: 12, home: 'hot-springs', away: 'lakeside' });
      await G(t, () => { const g = window.__game; g.act('give', 0, 0); g.act('place', 0, 0, 80, 22); for (let s = 0; s < 5; s++) g.act('place', 1, s, 40, 5 + s * 10); g.step(1); g.act('input', { mx: 1, mz: 0.3 }); });
      await burst(t, 'drive', { frames: 16, every: 3, onFrame: (k) => k === 4 && G(t, () => { window.__game.act('input', { mx: 0, mz: 0 }); window.__game.act('shootAt', 1); }) });
      // open play: running, dribbling, defensive slides
      await liveGame(t, { seed: 14, home: 'lake-hamilton', away: 'hot-springs', user: 'none' });
      await t.game('step', 240);
      await burst(t, 'open-play', { frames: 16, every: 4 });
      // a made three: net and crowd from the broadcast camera, then the net up close
      await forcedShot(t, SEEDS.make3, 1, 3);
      await burst(t, 'make-wide', { frames: 14, every: 5 });
      await G(t, ([a]) => { window.__game.seed(a[0]); }, [SEEDS.make3]);
      await G(t, ([a]) => window.__shotFrom(a), [SEEDS.make3, 1]);
      await t.game('act', 'cam', { p: [80, 11.5, 31], t: [88.75, 8.6, 25], fov: 30 });
      await burst(t, 'net-close', { frames: 12, every: 2 });
      await t.game('act', 'cam', null);
    },
  },
  {
    name: 'capture: real-time video',
    viewports: ['desktop'],
    async run(t) {
      if (!t.gpu) return;
      const dir = path.join(t.shotDir, 'video');
      fs.mkdirSync(dir, { recursive: true });
      const ctx = await t.browser.newContext({ viewport: t.vp.isMobile ? undefined : { width: t.vp.width, height: t.vp.height }, recordVideo: { dir, size: { width: t.vp.width, height: t.vp.height } } });
      await ctx.addInitScript(FORCE_3D);
      const page = await ctx.newPage();
      await page.goto(t.page.url());
      await page.waitForFunction(() => window.__game && window.__game.getState().gfx.state === 'ready', null, { timeout: 30000 });
      await page.evaluate(() => { const g = window.__game; g.seed(14); g.newGame({ mode: 'exhibition', home: 'hot-springs', away: 'lake-hamilton', program: 'boys', user: 'none', qLen: 480 }); });
      await page.waitForTimeout(7000);
      const v = page.video();
      await ctx.close();
      const out = path.join(dir, 'open-play.webm');
      try { fs.rmSync(out, { force: true }); fs.renameSync(await v.path(), out); } catch (e) { t.fail('video not saved: ' + e.message); }
      t.log('video: ' + path.relative(t.shotDir, out));
    },
  },
];
