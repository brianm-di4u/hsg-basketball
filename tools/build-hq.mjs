#!/usr/bin/env node
// Packs the high-quality art into assets/hq/ and writes assets/hq/manifest.json (read by src/js/gl/hq.js).
//
//   node tools/build-hq.mjs [--bake] [--samples 1024]
//
// --bake first runs the Blender builds (art-src/blender/venue/build_gym.py ...) headless on the GPU.
// Every file is content-hashed (served immutable by the site); files no package lists are deleted.
//
// Packages:
//   venue-gym     the shared home-gym shell (GLB) and its two lightmaps, WebP 2048 for high, 1024 for medium
//   venue-arena   the state-finals bowl, the same way
//   players-hq    the MPFB-based player bodies (art-src/blender/players/build_bodies_hq.py), one GLB for both tiers
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GAME, hash8, SCHEMA } from './hashed.mjs';
import { pathToFileURL } from 'node:url';

// lightmaps are smooth: lossy WebP keeps them small and decodes everywhere (KTX2 sampled black on ANGLE D3D11)
const { chromium } = await import(pathToFileURL(path.join(GAME, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage();
async function webp(rgba, size, quality) {
  const b64 = await page.evaluate(([d, size, q]) => { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); const bytes = Uint8ClampedArray.from(atob(d), (ch) => ch.charCodeAt(0)); g.putImageData(new ImageData(bytes, size, size), 0, 0); return c.toDataURL('image/webp', q).split(',')[1]; }, [Buffer.from(rgba).toString('base64'), size, quality]);
  return Buffer.from(b64, 'base64');
}

const args = process.argv.slice(2);
const BLENDER = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const ART = path.join(GAME, 'art-src');
const HQ = path.join(GAME, 'assets', 'hq');
fs.mkdirSync(HQ, { recursive: true });

if (args.includes('--bake')) {
  const samples = args.includes('--samples') ? args[args.indexOf('--samples') + 1] : '1024';
  for (const kind of ['gym', 'arena']) {
    console.log(`blender: venue ${kind}`);
    execFileSync(BLENDER, ['-b', '--factory-startup', '--python', path.join(ART, 'blender', 'venue', 'build_gym.py'), '--', '--kind', kind, '--samples', samples], { stdio: 'inherit' });
  }
}

const files = {};
function put(base, ext, bytes) {
  const buf = Buffer.from(bytes);
  const name = `${base}.${hash8(buf)}${ext}`;
  fs.writeFileSync(path.join(HQ, name), buf);
  files[name] = { bytes: buf.length };
  return name;
}
function halve(rgba, size) {
  const n = size >> 1, out = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) for (let c = 0; c < 4; c++) {
    const a = (yy, xx) => rgba[(yy * size + xx) * 4 + c];
    out[(y * n + x) * 4 + c] = (a(2 * y, 2 * x) + a(2 * y, 2 * x + 1) + a(2 * y + 1, 2 * x) + a(2 * y + 1, 2 * x + 1) + 2) >> 2;
  }
  return out;
}

const packages = {};
// ---- venue-gym, venue-arena
for (const kind of ['gym', 'arena']) {
  const dir = path.join(ART, 'venue');
  const lm = JSON.parse(fs.readFileSync(path.join(dir, `${kind}-lm.json`), 'utf8'));
  const glb = put(kind, '.glb', fs.readFileSync(path.join(dir, `${kind}.glb`)));
  const high = [glb], medium = [glb], scales = {};
  for (const tag of ['floor', 'shell']) {
    const { size, scale } = lm[tag];
    const rgba = new Uint8Array(fs.readFileSync(path.join(dir, `${kind}-lm-${tag}.rgba`)));
    console.log(`webp: ${kind}-lm-${tag} ${size}² + ${size / 2}²`);
    high.push(put(`${kind}-lm-${tag}-h`, '.webp', await webp(rgba, size, 0.9)));
    medium.push(put(`${kind}-lm-${tag}-m`, '.webp', await webp(halve(rgba, size), size / 2, 0.88)));
    scales[tag] = scale;
  }
  packages[`venue-${kind}`] = { prio: kind === 'gym' ? 1 : 2, tiers: { high, medium }, lmScale: scales };
}

// ---- players-hq
{
  if (args.includes('--bake')) execFileSync(BLENDER, ['-b', '--factory-startup', '--python', path.join(ART, 'blender', 'players', 'build_bodies_hq.py')], { stdio: 'inherit' });
  const glb = put('players-hq', '.glb', fs.readFileSync(path.join(ART, 'players-hq.glb')));
  packages['players-hq'] = { prio: 3, tiers: { high: [glb], medium: [glb] } };
}

await browser.close();
// delete orphans, write the manifest
for (const f of fs.readdirSync(HQ)) if (f !== 'manifest.json' && !files[f]) fs.rmSync(path.join(HQ, f));
const manifest = { schema: SCHEMA, build: new Date().toISOString(), packages, files };
fs.writeFileSync(path.join(HQ, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
const total = Object.values(files).reduce((n, f) => n + f.bytes, 0);
console.log(`assets/hq: ${Object.keys(files).length} files, ${(total / 1048576).toFixed(2)} MB; packages: ${Object.keys(packages).join(', ')}`);
