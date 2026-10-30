// High-quality art streaming. The core (lite 3D) is ready first; then this fetches assets/hq/manifest.json and
// downloads the packages for the device's tier in priority order, two at a time. Each finished package is
// queued in HQ.ready; scene3d.js swaps it in at a dead ball. Any failure leaves the lite art in place and is
// logged with console.info, never as an error. Off for file:// (no fetch of local files), ?hq=0, Graphics: Lite,
// data-saver, slow connections and software GL.
/* global THREE */
import { CORE } from './build-info.js';

const BASE = 'assets/hq/';
export const HQ = {
  state: 'off', // off | unavailable | loading | ready | partial | failed | skipped
  tier: null, reason: '', manifest: null, bytes: 0, loaded: [], failed: [], ready: [], packages: {},
};

const info = (...a) => console.info('[hq]', ...a);

// Which tier of HQ art this device should get, or null for none.
export function hqTier(renderer, tier3d) {
  if (tier3d === 'low') return null;
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))) return null;
  const gl = renderer.getContext();
  const big = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096;
  const mem = navigator.deviceMemory || 8;
  return tier3d === 'high' && big && mem >= 4 ? 'high' : 'medium';
}

function skipReason(o) {
  if (location.protocol === 'file:') return 'file://';
  if (/[?&]hq=0\b/.test(location.search)) return '?hq=0';
  if (o.lite) return 'graphics: lite';
  if (o.software) return 'software GL';
  return '';
}

let loaders = null;
function getLoaders(renderer) {
  if (loaders) return loaders;
  const ktx2 = new THREE.KTX2Loader().setTranscoderPath('vendor/basis/').detectSupport(renderer);
  if (/[?&]ktxraw=1/.test(location.search)) for (const k of Object.keys(ktx2.workerConfig)) ktx2.workerConfig[k] = false; // debug: uncompressed RGBA
  const gltf = new THREE.GLTFLoader().setKTX2Loader(ktx2).setMeshoptDecoder(THREE.MeshoptDecoder);
  loaders = { ktx2, gltf };
  return loaders;
}

async function fetchBuf(file, signal) {
  const r = await fetch(BASE + file, { signal });
  if (!r.ok) throw new Error(`${file}: HTTP ${r.status}`);
  return r.arrayBuffer();
}
async function decode(file, buf, L) {
  if (file.endsWith('.glb')) return new Promise((res, rej) => L.gltf.parse(buf, BASE, res, rej));
  if (file.endsWith('.ktx2')) return new Promise((res, rej) => L.ktx2.parse(buf, res, rej));
  if (/\.(webp|png|jpe?g)$/.test(file)) {
    const bmp = await createImageBitmap(new Blob([buf]), { imageOrientation: 'none' });
    const t = new THREE.Texture(bmp); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.needsUpdate = true;
    return t;
  }
  if (file.endsWith('.json')) return JSON.parse(new TextDecoder().decode(buf));
  return buf; // .bin and anything raw
}

async function loadPackage(name, files, L) {
  const out = {};
  for (const f of files) {
    let tries = 0;
    for (;;) {
      const ac = new AbortController(), timer = setTimeout(() => ac.abort(), 60000);
      try {
        const buf = await fetchBuf(f, ac.signal);
        HQ.bytes += buf.byteLength;
        out[f.replace(/\.[0-9a-f]{8}(\.\w+)$/, '$1')] = await decode(f, buf, L);
        break;
      } catch (e) {
        if (++tries > 1) throw e;
      } finally { clearTimeout(timer); }
    }
  }
  return out;
}

// Start streaming (called once the lite renderer is ready). Resolves when every package settles.
export async function startHQ(renderer, o = {}) {
  if (HQ.state !== 'off') return HQ.state;
  const why = skipReason(o);
  if (why) { HQ.state = 'unavailable'; HQ.reason = why; return HQ.state; }
  HQ.tier = hqTier(renderer, o.tier);
  if (!HQ.tier) { HQ.state = 'unavailable'; HQ.reason = 'device tier'; return HQ.state; }
  HQ.state = 'loading';
  let man;
  try {
    const r = await fetch(BASE + 'manifest.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('manifest HTTP ' + r.status);
    man = await r.json();
  } catch (e) { HQ.state = 'failed'; HQ.reason = String(e.message || e); info('manifest unavailable:', HQ.reason); return HQ.state; }
  HQ.manifest = man;
  if (man.schema !== CORE.schema) { HQ.state = 'skipped'; HQ.reason = `schema ${man.schema} ≠ ${CORE.schema}`; info(HQ.reason); return HQ.state; }
  const todo = Object.entries(man.packages || {})
    .map(([name, p]) => ({ name, prio: p.prio ?? 9, files: (p.tiers && (p.tiers[HQ.tier] || p.tiers.high)) || [] }))
    .filter((p) => p.files.length).sort((a, b) => a.prio - b.prio);
  if (!todo.length) { HQ.state = 'ready'; return HQ.state; }
  const L = getLoaders(renderer);
  const worker = async () => {
    for (let p; (p = todo.shift());) {
      try {
        HQ.packages[p.name] = await loadPackage(p.name, p.files, L);
        HQ.loaded.push(p.name); HQ.ready.push(p.name);
      } catch (e) { HQ.failed.push(p.name); info(`package ${p.name} failed:`, String(e.message || e)); }
    }
  };
  await Promise.all([worker(), worker()]);
  HQ.state = HQ.failed.length ? (HQ.loaded.length ? 'partial' : 'failed') : 'ready';
  return HQ.state;
}

export function hqInfo() {
  return { state: HQ.state, tier: HQ.tier, reason: HQ.reason, loaded: HQ.loaded.slice(), failed: HQ.failed.slice(), bytes: HQ.bytes };
}
