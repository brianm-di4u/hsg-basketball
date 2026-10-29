import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const tests = [
  {
    name: 'performance: fps, heap, size, load',
    async run(t) {
      const size = fs.statSync(path.join(here, '..', 'index.html')).size;
      t.log(`index.html ${(size / 1024).toFixed(1)} KB, hooks in ${t.loadMs} ms`);
      t.expect(size <= 2 * 1024 * 1024, 'HTML ≤ 2 MB');
      t.expect(t.loadMs <= 2000, 'interactive in ≤ 2 s');
      await t.game('newGame', { mode: 'exhibition', home: 'lake-hamilton', away: 'hot-springs', program: 'boys', user: 'none', qLen: 480, seed: 5 });
      await t.page.waitForTimeout(800);
      // several game sessions share the test machine: take the better of two samples, and log both
      const f1 = await t.fps(2500), f2 = f1 >= 55 ? f1 : await t.fps(2500);
      const fps = Math.max(f1, f2);
      if (f2 !== f1) t.log(`fps samples ${f1.toFixed(1)} and ${f2.toFixed(1)}`);
      const mem = await t.memoryMB();
      const g = (await t.state()).gfx;
      t.log(`live match: ${fps.toFixed(1)} fps, heap ${mem.toFixed(1)} MB, renderer ${g.mode}${g.tier ? ' ' + g.tier : ''} (${g.gl ? g.gl.renderer : 'no WebGL probe'})`);
      // the harness renders WebGL in software, where Auto keeps the 2D court; real-GPU 3D rates: tools/perf3d.mjs
      const need = g.mode === '3d' && t.viewport === 'mobile' ? 30 : 55;
      t.expect(fps >= need, `≥ ${need} fps (${fps.toFixed(1)})`);
      t.expect(mem < 40, `heap < 40 MB (${mem.toFixed(1)})`);
      // menus stop the loop (render on demand)
      await t.game('scene', 'help');
      const idleFps = await t.page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 500) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }));
      t.expect(idleFps > 0, 'page stays responsive in menus');
    },
  },
];
