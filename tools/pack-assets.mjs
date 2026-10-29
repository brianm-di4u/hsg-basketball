#!/usr/bin/env node
// Packs the 3D assets into classic scripts that load under file:// (WebGL refuses file:// images, so every
// texture travels as a data URI and the GLB as base64):
//   assets/players.js  ← art-src/players.glb (Blender, art-src/blender/build_players.py)
//   assets/tex.js      ← art-src/floor-maple.png, wall-block.png (seamless tiles, WebP)
//                        art-src/crowd-*.png, band.png, cheer.png (Codex sprite sheets → one WebP atlas)
//
//   node tools/pack-assets.mjs
//
// Sprite sheets are rows of figures on flat white. The packer keys the white out, splits figures at empty
// columns, trims each one and bottom-aligns it in a 128×192 atlas cell. Uses the test harness's Chromium.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const game = path.join(here, '..');
const root = path.join(game);
const src = path.join(game, 'art-src');
const out = path.join(game, 'assets');
fs.mkdirSync(out, { recursive: true });
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);

const dataURL = (f) => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`;
const has = (f) => fs.existsSync(path.join(src, f));

// sprite groups, in atlas order
const SHEETS = [
  ['crowd-pilot.png', 'seat'], ['crowd-2.png', 'seat'], ['crowd-3.png', 'seat'], ['crowd-4.png', 'seat'],
  ['crowd-5.png', 'stand'], ['crowd-6.png', 'stand'], ['band.png', 'band'], ['cheer.png', 'cheer', 5],
].filter(([f]) => has(f));
const TILES = [['floor', 'floor-maple.png', 1024], ['wall', 'wall-block.png', 512]].filter(([, f]) => has(f));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><body></body>');

const tex = {};
for (const [name, f, size] of TILES) {
  tex[name] = await page.evaluate(async ({ url, size }) => {
    const img = new Image(); img.src = url; await img.decode();
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    cv.getContext('2d').drawImage(img, 0, 0, size, size);
    return cv.toDataURL('image/webp', 0.86);
  }, { url: dataURL(path.join(src, f)), size });
}

if (SHEETS.length) {
  const res = await page.evaluate(async ({ sheets, CW, CH }) => {
    const figs = [];
    for (const [url, group, expect] of sheets) {
      const img = new Image(); img.src = url; await img.decode();
      const W = img.naturalWidth, H = img.naturalHeight;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, W, H), p = d.data;
      // key out near-white connected to the border, then feather one pixel
      const lim = 236, seen = new Uint8Array(W * H), stack = [];
      const white = (i) => p[i * 4] >= lim && p[i * 4 + 1] >= lim && p[i * 4 + 2] >= lim;
      for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x);
      for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1);
      while (stack.length) {
        const i = stack.pop(); if (seen[i] || !white(i)) continue; seen[i] = 1;
        const x = i % W, y = (i / W) | 0;
        if (x > 0) stack.push(i - 1); if (x < W - 1) stack.push(i + 1); if (y > 0) stack.push(i - W); if (y < H - 1) stack.push(i + W);
      }
      for (let i = 0; i < W * H; i++) if (seen[i]) p[i * 4 + 3] = 0;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (!seen[i] && (seen[i - 1] || seen[i + 1] || seen[i - W] || seen[i + W])) p[i * 4 + 3] = 140;
      }
      g.putImageData(d, 0, 0);
      // split at empty columns
      const col = new Uint32Array(W);
      for (let x = 0; x < W; x++) { let n = 0; for (let y = 0; y < H; y++) if (p[(y * W + x) * 4 + 3] > 40) n++; col[x] = n; }
      const runs = [];
      let x = 0;
      while (x < W) {
        while (x < W && col[x] < 2) x++;
        const x0 = x;
        while (x < W && col[x] >= 2) x++;
        if (x - x0 >= 40) runs.push([x0, x]);
      }
      // neighbours joined by a pom-pom or an instrument: split wide runs at their thinnest columns
      const med = runs.reduce((n, [a, b]) => n + b - a, 0) / expect; // expected width of one figure
      const parts = [];
      for (const [a, b] of runs) {
        const n = Math.max(1, Math.round((b - a) / med));
        let start = a;
        for (let k = 1; k < n; k++) {
          const c = a + ((b - a) * k) / n, lo = Math.round(c - med * 0.25), hi = Math.round(c + med * 0.25);
          let best = lo; for (let xx = lo; xx < hi; xx++) if (col[xx] < col[best]) best = xx;
          parts.push([start, best]); start = best;
        }
        parts.push([start, b]);
      }
      for (const [x0, x1] of parts) {
        let y0 = H, y1 = 0;
        for (let yy = 0; yy < H; yy++) for (let xx = x0; xx < x1; xx++) if (p[(yy * W + xx) * 4 + 3] > 40) { if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
        if (y1 - y0 < 80) continue;
        figs.push({ cv, group, x0, y0, w: x1 - x0, h: y1 - y0 + 1 });
      }
    }
    const cols = 8, rows = Math.ceil(figs.length / cols);
    const at = document.createElement('canvas'); at.width = cols * CW; at.height = rows * CH;
    const a = at.getContext('2d');
    // one scale for the whole set so people keep their relative sizes
    const maxH = Math.max(...figs.map((f) => f.h)), maxW = Math.max(...figs.map((f) => f.w));
    const k = Math.min((CH - 4) / maxH, (CW - 4) / maxW);
    const sprites = figs.map((f, i) => {
      const cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH;
      const w = f.w * k, h = f.h * k;
      a.drawImage(f.cv, f.x0, f.y0, f.w, f.h, cx + (CW - w) / 2, cy + CH - 2 - h, w, h);
      return { g: f.group, w: +(w / CW).toFixed(3), h: +(h / CH).toFixed(3) };
    });
    return { src: at.toDataURL('image/webp', 0.84), cols, rows, cw: CW, ch: CH, sprites, sheet: at.toDataURL('image/png') };
  }, { sheets: SHEETS.map(([f, g, n]) => [dataURL(path.join(src, f)), g, n || 6]), CW: 128, CH: 192 });
  fs.writeFileSync(path.join(src, 'atlas-sheet.png'), Buffer.from(res.sheet.split(',')[1], 'base64'));
  delete res.sheet;
  tex.crowd = res;
  console.log(`crowd atlas: ${res.sprites.length} figures (${Object.entries(res.sprites.reduce((o, s) => ((o[s.g] = (o[s.g] || 0) + 1), o), {})).map((e) => e.join(' ')).join(', ')})`);
}
await browser.close();

const head = '/* Generated by tools/pack-assets.mjs. Do not edit. */\n(window.HOOPS_ASSETS = window.HOOPS_ASSETS || {})';
fs.writeFileSync(path.join(out, 'tex.js'), `${head}.tex = ${JSON.stringify(tex)};\n`);
const glb = path.join(src, 'players.glb');
fs.writeFileSync(path.join(out, 'players.js'), `${head}.players = "${fs.readFileSync(glb).toString('base64')}";\n`);
for (const f of ['tex.js', 'players.js']) console.log(`assets/${f}: ${(fs.statSync(path.join(out, f)).size / 1024).toFixed(0)} KB`);
