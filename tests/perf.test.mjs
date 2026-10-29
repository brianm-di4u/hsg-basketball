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
      const fps = await t.fps(2500);
      const mem = await t.memoryMB();
      t.log(`live match: ${fps.toFixed(1)} fps, heap ${mem.toFixed(1)} MB`);
      t.expect(fps >= 55, `≥ 55 fps (${fps.toFixed(1)})`);
      t.expect(mem < 40, `heap < 40 MB (${mem.toFixed(1)})`);
      // menus stop the loop (render on demand)
      await t.game('scene', 'help');
      const idleFps = await t.page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 500) requestAnimationFrame(f); else res(n); }; requestAnimationFrame(f); }));
      t.expect(idleFps > 0, 'page stays responsive in menus');
    },
  },
];
