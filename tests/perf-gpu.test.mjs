// 3D frame cost on the machine's real GPU (replaces tools/perf3d.mjs). Runs only with --gpu; add --uncapped to
// measure headroom past vsync. Logs per-scene fps, main-thread ms per frame, draw calls and triangles, and
// writes screenshots/<milestone>/<viewport>/perf.json for the review packet.
//
//   node shared/test-harness/run.mjs . --gpu --uncapped --file perf-gpu --milestone v3-m0-r1
import fs from 'node:fs';
import path from 'node:path';
import { FORCE_3D, ready3d } from './helpers.mjs';

// Gates per tier, in uncapped mode on the RTX 5060 (plan: Performance budget). Capped runs only check ≥ 55/30.
const GATE = {
  high: { fps: 180, taskMs: 6, calls: 250 },
  medium: { fps: 300, taskMs: 14, calls: 150 },
};

async function scene(t, label, setup, ms = 2500) {
  await t.page.evaluate(setup);
  await t.page.waitForTimeout(700);
  const cost = await t.frameCost(ms);
  const g = (await t.state()).gfx;
  return { label, tier: g.tier, fps: cost.fps, taskMs: cost.taskMs, scriptMs: cost.scriptMs, calls: g.calls, tris: g.tris, heapMB: await t.memoryMB() };
}

export const tests = [
  {
    name: 'perf: real-GPU frame cost per scene',
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) return;
      const s0 = await ready3d(t);
      const rows = [];
      rows.push(await scene(t, 'title', () => {}));
      rows.push(await scene(t, 'match', () => window.__game.newGame({ mode: 'exhibition', home: 'lake-hamilton', away: 'hot-springs', program: 'boys', user: 'none', qLen: 480, seed: 5 }), 3000));
      rows.push(await scene(t, 'arena', () => { window.__game.newGame({ mode: 'challenge', challenge: 'lady-trojans-five', program: 'girls' }); window.__game.act('autoplay', true); }, 3000));
      await t.cpuThrottle(4);
      rows.push(await scene(t, 'match-cpu4x', () => window.__game.newGame({ mode: 'exhibition', home: 'lake-hamilton', away: 'hot-springs', program: 'boys', user: 'none', qLen: 480, seed: 5 }), 3000));
      await t.cpuThrottle(1);
      const out = { renderer: s0.gfx.gl && s0.gfx.gl.renderer, uncapped: !!t.uncapped, rows };
      fs.mkdirSync(t.shotDir, { recursive: true });
      fs.writeFileSync(path.join(t.shotDir, 'perf.json'), JSON.stringify(out, null, 1));
      for (const r of rows) t.log(`${r.label.padEnd(12)} ${r.tier} ${r.fps} fps, task ${r.taskMs} ms, script ${r.scriptMs} ms, ${r.calls} calls, ${r.tris} tris, heap ${r.heapMB} MB`);
      // gates: capped runs check the frame rate floor; uncapped runs check headroom and budgets
      for (const r of rows.filter((x) => !x.label.includes('cpu'))) {
        const gate = GATE[r.tier] || GATE.medium;
        if (t.uncapped) {
          t.expect(r.fps >= gate.fps, `${r.label}: ≥ ${gate.fps} fps uncapped (${r.fps})`);
          t.expect(r.calls <= gate.calls, `${r.label}: ≤ ${gate.calls} draw calls (${r.calls})`);
        } else t.expect(r.fps >= (t.viewport === 'mobile' ? 30 : 55), `${r.label}: frame rate floor (${r.fps})`);
        t.expect(r.taskMs <= gate.taskMs, `${r.label}: main thread ≤ ${gate.taskMs} ms per frame (${r.taskMs})`);
      }
    },
  },
];
