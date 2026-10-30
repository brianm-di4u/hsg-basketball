// KTX2 / Basis Universal encoding in Node with the official KTX-Software WebAssembly build (no install needed):
//   tools/dev/ktx/libktx.{js,wasm} from KTX-Software-4.4.2-Web-libktx.zip (Apache-2.0), fetched by
//   tools/build-hq.mjs on first use and checked against the release's SHA-1.
//
//   import { encodeKTX2 } from './ktx.mjs';
//   const bytes = await encodeKTX2(rgba, width, height, { mode: 'uastc' | 'etc1s', srgb: true, mips: true });
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { GAME } from './hashed.mjs';

const DIR = path.join(GAME, 'tools', 'dev', 'ktx');
let ktx = null;

async function load() {
  if (ktx) return ktx;
  const src = fs.readFileSync(path.join(DIR, 'libktx.js'), 'utf8');
  const make = new Function('require', 'module', '__dirname', '__filename', `${src}\nreturn createKtxModule;`)(createRequire(import.meta.url), {}, DIR, path.join(DIR, 'libktx.js'));
  ktx = await make({ wasmBinary: fs.readFileSync(path.join(DIR, 'libktx.wasm')) });
  return ktx;
}

// rgba: Uint8Array (width × height × 4), top row first. Returns a Uint8Array with the .ktx2 file.
export async function encodeKTX2(rgba, width, height, { mode = 'etc1s', srgb = true, mips = true, quality = 128 } = {}) {
  const K = await load();
  const levels = mips ? Math.floor(Math.log2(Math.max(width, height))) + 1 : 1;
  const ci = new K.textureCreateInfo();
  ci.baseWidth = width; ci.baseHeight = height; ci.baseDepth = 1;
  ci.numDimensions = 2; ci.numLevels = levels; ci.numLayers = 1; ci.numFaces = 1;
  ci.isArray = false; ci.generateMipmaps = false;
  ci.vkFormat = srgb ? K.VkFormat.R8G8B8A8_SRGB : K.VkFormat.R8G8B8A8_UNORM;
  const tex = new K.texture(ci, K.TextureCreateStorageEnum.ALLOC_STORAGE);
  // a box-filtered mip chain
  let w = width, h = height, cur = rgba;
  for (let l = 0; l < levels; l++) {
    const r = tex.setImageFromMemory(l, 0, 0, cur);
    if (r !== K.ErrorCode.SUCCESS) throw new Error(`libktx setImageFromMemory level ${l}: ${r.value ?? r}`);
    if (l === levels - 1) break;
    const nw = Math.max(1, w >> 1), nh = Math.max(1, h >> 1), next = new Uint8Array(nw * nh * 4);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) for (let c = 0; c < 4; c++) {
      const a = (yy, xx) => cur[((Math.min(h - 1, yy) * w) + Math.min(w - 1, xx)) * 4 + c];
      next[(y * nw + x) * 4 + c] = (a(2 * y, 2 * x) + a(2 * y, 2 * x + 1) + a(2 * y + 1, 2 * x) + a(2 * y + 1, 2 * x + 1) + 2) >> 2;
    }
    cur = next; w = nw; h = nh;
  }
  const bp = new K.basisParams();
  bp.uastc = mode === 'uastc';
  bp.noSSE = true;
  bp.verbose = false;
  if (bp.uastc) { bp.uastcFlags = K.pack_uastc_flag_bits.LEVEL_DEFAULT ?? K.pack_uastc_flag_bits.KTX_PACK_UASTC_LEVEL_DEFAULT; bp.uastcRDO = true; bp.uastcRDOQualityScalar = 1.0; }
  else { bp.compressionLevel = 2; bp.qualityLevel = quality; bp.normalMap = false; }
  const cr = tex.compressBasis(bp);
  if (cr !== K.ErrorCode.SUCCESS) throw new Error(`libktx compressBasis: ${cr.value ?? cr}`);
  if (bp.uastc) { const z = tex.deflateZstd(18); if (z !== K.ErrorCode.SUCCESS) throw new Error('libktx deflateZstd failed'); }
  const out = tex.writeToMemory();
  const bytes = new Uint8Array(out); // copy out of the wasm heap
  tex.delete(); ci.delete(); bp.delete();
  return bytes;
}
