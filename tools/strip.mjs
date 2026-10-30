#!/usr/bin/env node
// A burst as one strip, each frame cropped around one player (the ball handler by default), for judging motion
// at a readable size.
//
//   node tools/strip.mjs <milestone> <burst> [--player i] [--vp desktop] [--cols 8] [--out file.png]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const [ms, name] = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!name) { console.error('usage: node tools/strip.mjs <milestone> <burst> [--player i] [--vp desktop] [--cols 8]'); process.exit(2); }
const vp = opt('--vp', 'desktop'), cols = +opt('--cols', 8), want = opt('--player', null);
const dir = path.join(root, 'screenshots', ms, vp, 'bursts', name);
const metas = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
const frames = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
const dpr = vp === 'mobile' ? 2 : 1;
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const cells = frames.map((f, k) => {
  const m = metas[k] || {}, ps = m.players || [];
  const p = (want != null ? ps.find((q) => q.i === +want) : ps.find((q) => q.holder)) || ps.find((q) => q.on) || { x: m.W / 2, foot: m.H * 0.6, px: 140 };
  const h = Math.max(120, p.px * 1.7), w = h * 0.62;
  return { f, x: (p.x - w / 2) * dpr, y: (p.foot - h * 0.86) * dpr, w: w * dpr, h: h * dpr };
});
const uri = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(dir, f)).toString('base64');
await page.setContent(`<!doctype html><style>body{margin:0;background:#111;font:600 13px system-ui;color:#eee}
  main{display:grid;grid-template-columns:repeat(${cols},190px);gap:4px;padding:4px;width:max-content}
  .c{width:190px;height:306px;overflow:hidden;position:relative;background:#000}.c img{position:absolute;transform-origin:0 0}
  .c b{position:absolute;left:3px;top:2px;text-shadow:0 0 3px #000}</style>
  <main>${cells.map((c) => { const s = 190 / c.w; return `<div class="c"><img src="${uri(c.f)}" style="left:${-c.x * s}px;top:${-c.y * s}px;transform:scale(${s})"><b>${c.f.replace('.png', '')}</b></div>`; }).join('')}</main>`);
await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode())));
const out = opt('--out', path.join(root, 'screenshots', ms, `strip-${vp}-${name}${want != null ? '-p' + want : ''}.png`));
await page.locator('main').screenshot({ path: out });
await browser.close();
console.log(path.relative(root, out));
