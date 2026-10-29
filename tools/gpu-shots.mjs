#!/usr/bin/env node
// Screenshots of the 3D renderer on the machine's real GPU (the test harness renders WebGL in software),
// for visual review. Loads index.html from file://, so it also proves the offline path.
//
//   node games/basketball/tools/gpu-shots.mjs [milestone]   → screenshots/<milestone>/gpu/{desktop,mobile}/*.png
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = path.join(here, '..');
const { chromium } = await import(pathToFileURL(path.join(game, '..', '..', 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const milestone = process.argv[2] || 'gpu';
const url = pathToFileURL(path.join(game, 'index.html')).href;
const VPS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
let errors = 0;
for (const [vp, o] of Object.entries(VPS)) {
  const dir = path.join(game, 'screenshots', milestone, 'gpu', vp);
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext(o);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log(`[${vp}] console error: ${m.text()}`); } });
  page.on('pageerror', (e) => { errors++; console.log(`[${vp}] page error: ${e}`); });
  await page.goto(url);
  await page.waitForFunction(() => window.__game && window.__game.getState().gfx.state === 'ready', null, { timeout: 30000 });
  const G = (fn, ...a) => page.evaluate(fn, a);
  const shot = async (name, ms = 350) => { await page.waitForTimeout(ms); await page.screenshot({ path: path.join(dir, name + '.png') }); };
  await shot('g01-title', 1200);
  // live home-gym play
  await G(() => { window.__game.seed(11); window.__game.newGame({ mode: 'exhibition', home: 'hot-springs', away: 'lake-hamilton', program: 'boys', user: 'home', paused: true }); window.__game.step(300); });
  await shot('g02-live');
  // a jump shot: gather, release, flight
  await G(() => {
    const g = window.__game; g.seed(5); g.newGame({ mode: 'exhibition', home: 'lakeside', away: 'fountain-lake', program: 'girls', user: 'home', paused: true });
    for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
    g.act('give', 0, 0); g.act('place', 0, 0, 70, 14); g.step(1);
    g.act('input', { shoot: true }); g.step(22);
  });
  await shot('g03-gather');
  await G(() => { window.__game.act('input', { shoot: false }); window.__game.step(14); });
  await shot('g04-release');
  await G(() => window.__game.step(24));
  await shot('g05-flight');
  // a made three (callout, net, crowd) and a miss off the rim
  const shotFrom = (seed, q) => G(([seed, q]) => {
    const g = window.__game; g.seed(seed); g.newGame({ mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', paused: true });
    for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
    g.act('give', 0, 0); g.act('place', 0, 0, 68, 13); for (let s = 0; s < 5; s++) g.act('place', 1, s, 30, 5 + s * 10); g.step(1);
    g.act('shootAt', q);
    let st = g.getState();
    const s0 = st.match.score[0];
    for (let k = 0; k < 200 && (st.match.ball.state === 'held' || st.match.ball.state === 'shot') && st.match.score[0] === s0; k++) { g.step(2); st = g.getState(); }
    return st.match.score[0] - s0;
  }, seed, q);
  let made = 0;
  for (let seed = 21; seed < 40 && !made; seed++) made = await shotFrom(seed, 1);
  await G(() => window.__game.step(6));
  await shot('g13-make', 0);
  for (let seed = 41, sc = 1; seed < 60 && sc; seed++) sc = await shotFrom(seed, 0.08);
  await shot('g14-miss', 0);
  // replay of a made three
  await G(() => {
    const g = window.__game; g.seed(3); g.newGame({ mode: 'exhibition', home: 'fountain-lake', away: 'mountain-pine', program: 'boys', user: 'home', paused: true });
    for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
    g.act('give', 0, 0); g.act('place', 0, 0, 80, 6); g.step(1); g.act('shootAt', 1); g.step(90);
    g.act('replay', 'THREE', 1, 0.6); g.act('freeze', true);
  });
  await shot('g06-replay');
  await G(() => { window.__game.act('freeze', false); window.__game.act('endReplay'); });
  // state finals arena
  await G(() => { const g = window.__game; g.seed(4); g.newGame({ mode: 'challenge', challenge: 'lady-trojans-five', program: 'girls', paused: true }); g.step(200); });
  await shot('g07-arena');
  // other gyms
  await G(() => { const g = window.__game; g.seed(8); g.newGame({ mode: 'exhibition', home: 'jessieville', away: 'cutter-morning-star', program: 'girls', user: 'home', paused: true }); g.step(420); });
  await shot('g08-jessieville');
  await G(() => { const g = window.__game; g.seed(9); g.newGame({ mode: 'exhibition', home: 'mountain-pine', away: 'lake-hamilton', program: 'boys', user: 'away', paused: true }); g.step(500); });
  await shot('g09-mountain-pine');
  // Hot Streak
  await G(() => { const g = window.__game; g.seed(2); g.newGame({ mode: 'shootout', paused: true }); g.step(40); });
  await shot('g10-shootout');
  // menus over the gym, and the champion moment in the arena
  await G(() => window.__game.scene('select'));
  await shot('g11-select');
  await G(() => { const g = window.__game; g.newGame({ mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 3 }); });
  await G(() => { const g = window.__game; for (let k = 0; k < 6 && !g.getState().season.done; k++) g.act('seasonResult', 60, 40); });
  await G(() => window.__game.scene('champion'));
  await shot('g12-champion', 1500);
  await ctx.close();
}
await browser.close();
console.log(`gpu shots in screenshots/${milestone}/gpu (${errors} console errors)`);
process.exit(errors ? 1 : 0);
