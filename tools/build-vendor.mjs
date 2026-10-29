#!/usr/bin/env node
// Turns the vendored three.js ES modules into one classic script (`vendor/three.bundle.js`) that sets
// `globalThis.THREE`. A classic <script src> loads under file:// where ES-module imports of local files fail.
//
//   node tools/build-vendor.mjs
//
// Inputs (copied unmodified from the npm package three@0.160.1, MIT, see vendor/three-0.160.1/LICENSE):
//   three.module.min.js, GLTFLoader.js (examples/jsm/loaders), BufferGeometryUtils.js and SkeletonUtils.js
//   (examples/jsm/utils)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, '..', 'vendor', 'three-0.160.1');
const out = path.join(here, '..', 'vendor', 'three.bundle.js');
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');

// core: replace the trailing `export{a as B,...};` with an object literal
let core = read('three.module.min.js');
const m = core.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
if (!m) throw new Error('three.module.min.js: export list not found');
const pairs = m[1].split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
  const [a, b] = s.split(/\s+as\s+/);
  return `${b || a}:${a}`;
});
core = core.slice(0, m.index) + `\nreturn {${pairs.join(',')}};`;

// addons: `import {..} from 'three'` → destructure from THREE; drop local imports and `export`
function addon(src) {
  return src
    .replace(/import\s*\{([^}]*)\}\s*from\s*['"]three['"];?/g, (s, names) => `const {${names.replace(/\s+as\s+/g, ': ')}} = THREE;`)
    .replace(/import\s*\{[^}]*\}\s*from\s*['"]\.\.\/utils\/BufferGeometryUtils\.js['"];?/g, '')
    .replace(/^export\s*\{[^}]*\};?\s*$/gm, '')
    .replace(/^export\s+(function|class|const)/gm, '$1');
}
const utils = addon(read('BufferGeometryUtils.js'));
const gltf = addon(read('GLTFLoader.js'));

const banner = '/* three.js r160.1 (MIT, Copyright 2010-2023 Three.js Authors) bundled for file:// by tools/build-vendor.mjs. Do not edit. */\n';
const code = `${banner}globalThis.THREE = (function(){\n${core}\n})();\n`
  + `globalThis.THREE = Object.assign({}, globalThis.THREE);\n`
  + `(function(){\n${utils}\nTHREE.toTrianglesDrawMode = toTrianglesDrawMode; THREE.mergeGeometries = mergeGeometries;\n})();\n`
  + `(function(){\nconst { toTrianglesDrawMode } = THREE;\n${gltf}\nTHREE.GLTFLoader = GLTFLoader;\n})();\n`
  + `(function(){\n${addon(read('SkeletonUtils.js'))}\nTHREE.SkeletonUtils = { clone };\n})();\n`;
fs.writeFileSync(out, code);
console.log(`wrote ${path.relative(process.cwd(), out)} (${(code.length / 1024).toFixed(0)} KB)`);
