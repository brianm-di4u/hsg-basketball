#!/usr/bin/env node
// Packs the high-quality art into assets/hq/ and writes assets/hq/manifest.json (read by src/js/gl/hq.js).
//
//   node tools/build-hq.mjs [--bake] [--samples 1024]
//
// --bake first runs the Blender builds (art-src/blender/venue/build_gym.py ...) headless on the GPU.
// Every file is content-hashed (served immutable by the site); files no package lists are deleted.
//
// Packages:
//   venue-gym   the shared home-gym shell (GLB) and its two lightmaps, UASTC 2048 for high, ETC1S 1024 for medium
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { GAME, hash8, SCHEMA } from './hashed.mjs';
import { encodeKTX2 } from './ktx.mjs';

const args = process.argv.slice(2);
const BLENDER = 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const ART = path.join(GAME, 'art-src');
const HQ = path.join(GAME, 'assets', 'hq');
fs.mkdirSync(HQ, { recursive: true });

if (args.includes('--bake')) {
  const samples = args.includes('--samples') ? args[args.indexOf('--samples') + 1] : '1024';
  for (const script of ['venue/build_gym.py']) {
    console.log(`blender: ${script}`);
    execFileSync(BLENDER, ['-b', '--factory-startup', '--python', path.join(ART, 'blender', script), '--', '--samples', samples], { stdio: 'inherit' });
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
// ---- venue-gym
{
  const dir = path.join(ART, 'venue');
  const lm = JSON.parse(fs.readFileSync(path.join(dir, 'gym-lm.json'), 'utf8'));
  const glb = put('gym', '.glb', fs.readFileSync(path.join(dir, 'gym.glb')));
  const high = [glb], medium = [glb], scales = {};
  for (const tag of ['floor', 'shell']) {
    const { size, scale } = lm[tag];
    const rgba = new Uint8Array(fs.readFileSync(path.join(dir, `gym-lm-${tag}.rgba`)));
    console.log(`ktx2: gym-lm-${tag} ${size}² UASTC + ${size / 2}² ETC1S`);
    high.push(put(`gym-lm-${tag}-h`, '.ktx2', await encodeKTX2(rgba, size, size, { mode: 'uastc', srgb: true })));
    medium.push(put(`gym-lm-${tag}-m`, '.ktx2', await encodeKTX2(halve(rgba, size), size / 2, size / 2, { mode: 'etc1s', srgb: true, quality: 200 })));
    scales[tag] = scale;
  }
  packages['venue-gym'] = { prio: 1, tiers: { high, medium }, lmScale: scales };
}

// delete orphans, write the manifest
for (const f of fs.readdirSync(HQ)) if (f !== 'manifest.json' && !files[f]) fs.rmSync(path.join(HQ, f));
const manifest = { schema: SCHEMA, build: new Date().toISOString(), packages, files };
fs.writeFileSync(path.join(HQ, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
const total = Object.values(files).reduce((n, f) => n + f.bytes, 0);
console.log(`assets/hq: ${Object.keys(files).length} files, ${(total / 1048576).toFixed(2)} MB; packages: ${Object.keys(packages).join(', ')}`);
