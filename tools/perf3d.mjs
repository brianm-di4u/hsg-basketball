#!/usr/bin/env node
// Measures the 3D renderer on the machine's real GPU and checks the file:// path, outside the test harness
// (the harness renders WebGL in software and blocks file:// URLs).
//
//   node tools/perf3d.mjs [--throttle 4]
//
// For each viewport it opens index.html from file://, waits for the 3D gym, then measures frames per second in
// the title demo, a live 10-player match and the state finals arena, plus load time and JS heap.
// --throttle N slows the CPU N× through DevTools (a rough phone stand-in; the GPU is not throttled).
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const args = process.argv.slice(2);
const throttle = args.includes('--throttle') ? +args[args.indexOf('--throttle') + 1] : 1;
const url = pathToFileURL(path.join(here, '..', 'index.html')).href;

const VPS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
const fps = (page, ms) => page.evaluate((ms) => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(n * 1000 / (performance.now() - t0)); }; requestAnimationFrame(f); }), ms);
const out = [];
for (const [name, o] of Object.entries(VPS)) {
  const ctx = await browser.newContext(o);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  if (throttle > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle }); }
  const t0 = Date.now();
  await page.goto(url);
  await page.waitForFunction(() => window.__game, null, { timeout: 20000 });
  const hooks = Date.now() - t0;
  await page.waitForFunction(() => { const g = window.__game.getState().gfx; return g && ['ready', 'failed', 'unsupported', 'off'].includes(g.state) && g.state !== 'off' || (g && g.gl && g.gl.software); }, null, { timeout: 30000 });
  const ready = Date.now() - t0;
  const s0 = await page.evaluate(() => window.__game.getState());
  await page.waitForTimeout(600);
  const title = await fps(page, 2000);
  await page.evaluate(() => window.__game.newGame({ mode: 'exhibition', home: 'lake-hamilton', away: 'hot-springs', program: 'boys', user: 'none', qLen: 480, seed: 5 }));
  await page.waitForTimeout(800);
  const match = await fps(page, 3000);
  const heap = await page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0));
  await page.evaluate(() => window.__game.newGame({ mode: 'challenge', challenge: 'lady-trojans-five', program: 'girls' }));
  await page.evaluate(() => window.__game.act('autoplay', true));
  await page.waitForTimeout(800);
  const arena = await fps(page, 3000);
  const s1 = await page.evaluate(() => window.__game.getState().gfx);
  out.push({ viewport: name, throttle, renderer: s0.gfx.gl && s0.gfx.gl.renderer, mode: s1.mode, tier: s1.tier, hooksMs: hooks, ready3dMs: ready,
    fps: { title: +title.toFixed(1), match: +match.toFixed(1), arena: +arena.toFixed(1) }, heapMB: +heap.toFixed(1), calls: s1.calls, tris: s1.tris, errors });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
