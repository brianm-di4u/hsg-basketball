#!/usr/bin/env node
// Before/after review sheets: pairs a baseline screenshot with the matching final one, side by side.
//
//   node games/basketball/tools/before-after.mjs
//
// Pairs come from screenshots/visual-before (the 2D original) and screenshots/visual-final (harness, menus and flow)
// or screenshots/visual-final/gpu (the 3D view on a real GPU, from tools/gpu-shots.mjs visual-final).
// Writes screenshots/visual-final/before-after/{desktop,mobile}-NN.png.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.join(here, '..', 'screenshots');
const { chromium } = await import(pathToFileURL(path.join(here, '..', '..', '..', 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const PAIRS = [
  ['01-title', 'gpu/g01-title', 'Title'],
  ['10-tipoff', 'gpu/g02-live', 'Live play'],
  ['11c-shot-meter', 'gpu/g03-gather', 'Shot meter'],
  ['12b-score', 'gpu/g13-make', 'A made three'],
  ['23-arena-final', 'gpu/g07-arena', 'State final'],
  ['27-shootout', 'gpu/g10-shootout', 'Hot Streak'],
  ['04-select', 'gpu/g11-select', 'Team select'],
  ['24-champion', 'gpu/g12-champion', 'Champion'],
];
const out = path.join(shots, 'visual-final', 'before-after');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const url = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
for (const vp of ['desktop', 'mobile']) {
  const rows = [];
  for (const [a, b, label] of PAIRS) {
    const fa = path.join(shots, 'visual-before', vp, a + '.png');
    const fb = b.startsWith('gpu/') ? path.join(shots, 'visual-final', 'gpu', vp, b.slice(4) + '.png') : path.join(shots, 'visual-final', vp, b + '.png');
    if (fs.existsSync(fa) && fs.existsSync(fb)) rows.push({ a: url(fa), b: url(fb), label });
    else console.log(`skip ${vp} ${label}: ${fs.existsSync(fa) ? '' : fa} ${fs.existsSync(fb) ? '' : fb}`);
  }
  const per = vp === 'desktop' ? 2 : 2;
  for (let k = 0; k < rows.length; k += per) {
    const set = rows.slice(k, k + per);
    const W = vp === 'desktop' ? 640 : 300;
    const html = `<body style="margin:0;background:#1d1b24;font:600 15px system-ui;color:#eee">${set.map((r) => `
      <div style="display:flex;gap:10px;padding:10px;align-items:flex-start">
        <div><div style="padding:4px 0">${r.label}: before (2D)</div><img src="${r.a}" style="width:${W}px"></div>
        <div><div style="padding:4px 0">${r.label}: after (3D)</div><img src="${r.b}" style="width:${W}px"></div>
      </div>`).join('')}</body>`;
    await page.setViewportSize({ width: W * 2 + 30, height: 600 });
    await page.setContent(html);
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
    const name = `${vp}-${String(k / per + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(out, name), fullPage: true });
    console.log('wrote', path.relative(shots, path.join(out, name)));
  }
}
await browser.close();
