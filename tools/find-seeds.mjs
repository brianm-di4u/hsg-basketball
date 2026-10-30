#!/usr/bin/env node
// Finds seeds whose forced three (tests/helpers.mjs shotFromInPage) is a make or a miss, for the
// deterministic make and miss captures. Runs the classic 2D renderer (?gl=0): only the sim matters.
//
//   node tools/find-seeds.mjs        → prints { make3, miss }; copy them into SEEDS in tests/helpers.mjs
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { shotFromInPage } from '../tests/helpers.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + '?gl=0');
await page.waitForFunction(() => !!window.__game);
const find = async (q, want, from) => {
  for (let seed = from; seed < from + 200; seed++) if ((await page.evaluate(shotFromInPage, [seed, q])) === want) return seed;
  return null;
};
const out = { make3: await find(1, 3, 21), miss: await find(0.08, 0, 41) };
await browser.close();
console.log(JSON.stringify(out));
