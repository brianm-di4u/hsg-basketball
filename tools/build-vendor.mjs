#!/usr/bin/env node
// Bundles three.js r186 with the addons and post-processing libraries in tools/three-entry.js into one
// classic script that sets globalThis.THREE (a classic <script> also loads from file://). Copies the Basis
// transcoder for KTX2 textures next to it.
//
//   cd tools/dev && npm install      (once; build-time only, never shipped)
//   node tools/build-vendor.mjs      → vendor/three.<hash>.js, vendor/basis/*, src/js/gl/build-info.js
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GAME, writeHashed, writeBuildInfo } from './hashed.mjs';

const dev = path.join(GAME, 'tools', 'dev');
const require = createRequire(path.join(dev, 'package.json'));
const esbuild = require('esbuild');
const ver = (p) => JSON.parse(fs.readFileSync(path.join(dev, 'node_modules', p, 'package.json'), 'utf8')).version;

const res = await esbuild.build({
  entryPoints: [path.join(GAME, 'tools', 'three-entry.js')], nodePaths: [path.join(dev, 'node_modules')],
  bundle: true, minify: true, format: 'iife', globalName: 'THREE', write: false, target: 'es2020', legalComments: 'none',
  // KTX2Loader builds default transcoder URLs from import.meta.url at load time; the game always calls
  // setTranscoderPath('vendor/basis/'), so any valid base works
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.url': '"https://transcoder.invalid/jsm/loaders/"' },
});
const banner = `/* three.js r${ver('three').split('.')[1]} (MIT, Copyright 2010-2026 Three.js Authors), postprocessing ${ver('postprocessing')} (Zlib, Raoul van Rüschen), `
  + `n8ao ${ver('n8ao')} (ISC, N8python). Bundled by tools/build-vendor.mjs. Do not edit. */\n`;
const file = writeHashed('vendor', 'three', '.js', banner + res.outputFiles[0].text.replace(/^var THREE\s*=/, 'globalThis.THREE='));

const basis = path.join(dev, 'node_modules', 'three', 'examples', 'jsm', 'libs', 'basis');
fs.mkdirSync(path.join(GAME, 'vendor', 'basis'), { recursive: true });
for (const f of ['basis_transcoder.js', 'basis_transcoder.wasm']) fs.copyFileSync(path.join(basis, f), path.join(GAME, 'vendor', 'basis', f));

// licenses travel with the bundle
const lic = path.join(GAME, 'vendor', 'LICENSES');
fs.mkdirSync(lic, { recursive: true });
for (const p of ['three', 'postprocessing', 'n8ao']) {
  const dir = path.join(dev, 'node_modules', p);
  const f = fs.readdirSync(dir).find((x) => /^licen[cs]e/i.test(x));
  if (f) fs.copyFileSync(path.join(dir, f), path.join(lic, `${p}-${ver(p)}.txt`));
}
const core = writeBuildInfo();
console.log(`${file} (${(fs.statSync(path.join(GAME, file)).size / 1024).toFixed(0)} KB); build-info: ${JSON.stringify(core)}`);
