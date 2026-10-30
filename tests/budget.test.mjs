// Download budgets and safety nets for the streamed art: a small core that boots fast, HQ packages that load
// after it and fall back cleanly, hashed file names, and frozen gameplay files.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FORCE_3D, ready3d } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MB = 1024 * 1024;
const CORE_RAW = 3.0 * MB, CORE_GZIP = 1.3 * MB;
const HQ = { high: 40 * MB, medium: 18 * MB, union: 50 * MB, file: 8 * MB };
const coreFiles = () => {
  const src = fs.readFileSync(path.join(game, 'src/js/gl/build-info.js'), 'utf8');
  const core = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));
  return ['index.html', core.three, core.players, core.tex]; // vendor/basis/* is fetched only by the HQ path
};
const manifest = () => JSON.parse(fs.readFileSync(path.join(game, 'assets/hq/manifest.json'), 'utf8'));
const waitHQ = (t) => t.page.waitForFunction(() => { const h = window.__game.getState().gfx.hq; return h && !['off', 'loading'].includes(h.state); }, null, { timeout: 60000 });

export const tests = [
  {
    name: 'budget: core files',
    node: true,
    async run(t) {
      let raw = 0, gz = 0;
      for (const f of coreFiles()) {
        const p = path.join(game, f);
        t.expect(fs.existsSync(p), `core file exists: ${f}`);
        if (!fs.existsSync(p)) continue;
        const b = fs.readFileSync(p);
        raw += b.length; gz += zlib.gzipSync(b, { level: 9 }).length;
      }
      t.log(`core: ${(raw / MB).toFixed(2)} MB raw, ${(gz / MB).toFixed(2)} MB gzip`);
      t.expect(raw <= CORE_RAW, `core ≤ ${CORE_RAW / MB} MB raw (${(raw / MB).toFixed(2)})`);
      t.expect(gz <= CORE_GZIP, `core ≤ ${CORE_GZIP / MB} MB gzip (${(gz / MB).toFixed(2)})`);
      for (const [dir, base] of [['vendor', 'three'], ['assets', 'players'], ['assets', 'tex']]) {
        const n = fs.readdirSync(path.join(game, dir)).filter((f) => new RegExp(`^${base}\\.[0-9a-f]{8}\\.js$`).test(f));
        t.equal(n.length, 1, `exactly one hashed ${dir}/${base}.<hash>.js`);
      }
      for (const stale of ['vendor/three.bundle.js', 'assets/players.js', 'assets/tex.js']) t.expect(!fs.existsSync(path.join(game, stale)), `no unhashed ${stale}`);
    },
  },
  {
    name: 'budget: HQ packages',
    node: true,
    async run(t) {
      const man = manifest(), dir = path.join(game, 'assets/hq');
      t.equal(typeof man.schema, 'number', 'manifest has a schema');
      const listed = new Set();
      const tierBytes = { high: 0, medium: 0 };
      for (const [name, p] of Object.entries(man.packages || {})) {
        for (const [tier, files] of Object.entries(p.tiers || {})) for (const f of files) {
          listed.add(f);
          const abs = path.join(dir, f);
          if (!fs.existsSync(abs)) { t.fail(`${name}/${tier}: missing ${f}`); continue; }
          const b = fs.readFileSync(abs);
          const h = (f.match(/\.([0-9a-f]{8})\.\w+$/) || [])[1];
          t.expect(h === crypto.createHash('sha256').update(b).digest('hex').slice(0, 8), `${f}: name hash matches content`);
          t.expect(b.length <= HQ.file, `${f} ≤ 8 MB`);
          if (tier in tierBytes) tierBytes[tier] += b.length;
        }
      }
      const onDisk = fs.readdirSync(dir).filter((f) => f !== 'manifest.json' && f !== 'LICENSES.txt' && !fs.statSync(path.join(dir, f)).isDirectory());
      for (const f of onDisk) t.expect(listed.has(f), `no orphan HQ file: ${f}`);
      const union = onDisk.reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
      t.log(`HQ: high ${(tierBytes.high / MB).toFixed(1)} MB, medium ${(tierBytes.medium / MB).toFixed(1)} MB, on disk ${(union / MB).toFixed(1)} MB, ${Object.keys(man.packages || {}).length} packages`);
      t.expect(tierBytes.high <= HQ.high, 'HQ high tier ≤ 40 MB');
      t.expect(tierBytes.medium <= HQ.medium, 'HQ medium tier ≤ 18 MB');
      t.expect(union <= HQ.union, 'HQ on disk ≤ 50 MB');
    },
  },
  {
    name: 'gameplay files are frozen',
    node: true,
    async run(t) {
      const want = JSON.parse(fs.readFileSync(path.join(game, 'tests/frozen.json'), 'utf8')).files;
      for (const [f, h] of Object.entries(want)) t.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(game, f))).digest('hex'), h, `${f} unchanged`);
    },
  },
  {
    name: 'budget: bytes downloaded before the 3D gym is ready',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      // the page has loaded by now; reload to count every response from the start
      let bytes = 0; const seen = [];
      t.page.on('response', async (r) => {
        const u = r.url();
        if (u.startsWith('data:') || u.includes('/assets/hq/')) return;
        try { const b = await r.body(); bytes += b.length; seen.push(u.replace(t.origin, '')); } catch { /* redirects */ }
      });
      await t.reload();
      await ready3d(t);
      await t.page.waitForTimeout(300);
      t.log(`before ready: ${(bytes / MB).toFixed(2)} MB in ${seen.length} responses`);
      t.expect(bytes <= CORE_RAW, `≤ ${CORE_RAW / MB} MB before ready (${(bytes / MB).toFixed(2)})`);
    },
  },
  {
    name: 'HQ: a failed download keeps the lite gym, with no errors',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    // the browser itself logs "Failed to load resource" for the blocked request; anything else still fails
    allowConsoleErrors: true,
    async run(t) {
      const errors = [];
      t.page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
      t.page.on('pageerror', (e) => errors.push(e.message));
      await t.page.route('**/assets/hq/**', (r) => r.abort());
      await t.reload();
      await ready3d(t);
      await waitHQ(t);
      const s = await t.state();
      t.equal(s.gfx.hq.state, 'failed', `HQ failed cleanly (${s.gfx.hq.reason})`);
      await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', paused: true });
      await t.game('step', 60);
      const shot = await t.shot('b01-hq-failed', { timeout: 15000 });
      t.expect(shot.stats.stddev > 25, `the lite gym draws (stddev ${shot.stats.stddev})`);
      for (const e of errors) t.fail('console error: ' + e);
    },
  },
  {
    name: 'HQ: an empty or current manifest settles',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await waitHQ(t);
      const h = (await t.state()).gfx.hq;
      t.expect(['ready', 'partial'].includes(h.state), `HQ settles (${h.state} ${h.reason})`);
      t.log(`HQ ${h.state}, tier ${h.tier}, ${h.loaded.length} packages, ${(h.bytes / MB).toFixed(1)} MB`);
    },
  },
  {
    name: 'file://: the core boots offline and HQ stays off',
    viewports: ['desktop'],
    fileUrl: true,
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      const h = (await t.state()).gfx.hq;
      t.equal(h.state, 'unavailable', 'HQ is off under file://');
      t.equal(h.reason, 'file://', 'reason');
    },
  },
];
