#!/usr/bin/env node
// Crop and enlarge part of a screenshot for close inspection (CSS-px coordinates; mobile shots are 2×).
//
//   node tools/crop.mjs <png> <x> <y> <w> <h> [scale=2] [out.png]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [file, x, y, w, h, scale = '2', outArg] = process.argv.slice(2);
if (!h) { console.error('usage: node tools/crop.mjs <png> <x> <y> <w> <h> [scale] [out]'); process.exit(2); }
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage();
const b64 = await page.evaluate(async ([src, x, y, w, h, k]) => {
  const img = new Image(); img.src = src; await img.decode();
  const c = document.createElement('canvas'); c.width = w * k; c.height = h * k;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(img, x, y, w, h, 0, 0, w * k, h * k);
  return c.toDataURL('image/png').split(',')[1];
}, ['data:image/png;base64,' + fs.readFileSync(file).toString('base64'), +x, +y, +w, +h, +scale]);
await browser.close();
const out = outArg || file.replace(/\.png$/, `-crop-${x}-${y}.png`);
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log(out);
