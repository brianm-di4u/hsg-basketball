// Pose lab: every animation clip as a contact strip on the real player models (GPU only), for checking the
// retargeted and keyed clips by eye. One sheet per view: screenshots/<milestone>/desktop/anim-<view>.png
//
//   node shared/test-harness/run.mjs . --gpu --file animlab --viewport desktop --milestone anim
import fs from 'node:fs';
import path from 'node:path';
import { FORCE_3D, ready3d } from './helpers.mjs';

const G = (t, fn, ...a) => t.page.evaluate(fn, a);
const PER = 8;

export const tests = [
  {
    name: 'anim lab: clip strips',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) { t.log('software GL: skipped (run with --gpu)'); return; }
      await ready3d(t);
      await t.page.waitForFunction(() => { const g = window.__game.getState().gfx; return g.hq && !['off', 'loading'].includes(g.hq.state) && g.anim && g.anim.clips > 0; }, null, { timeout: 60000 });
      await G(t, () => {
        const g = window.__game; g.seed(5);
        g.newGame({ mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', paused: true });
        for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
        g.act('give', 0, 0); g.act('place', 0, 0, 47, 25);
        for (let i = 1; i < 5; i++) g.act('place', 0, i, 4 + i * 2, 2);
        for (let i = 0; i < 5; i++) g.act('place', 1, i, 90 - i * 2, 48);
        g.step(1);
      });
      const clips = (await t.game('act', 'anim', null)).clips;
      const views = { side: { p: [47, 4.0, 37], t: [47, 3.7, 25], fov: 34 }, front: { p: [59, 4.0, 25.5], t: [47, 3.7, 25], fov: 34 } };
      const only = process.env.ANIM_CLIPS ? process.env.ANIM_CLIPS.split(',') : null;
      for (const [view, cam] of Object.entries(views)) {
        await t.game('act', 'cam', cam);
        const rows = [];
        for (const [clip, dur] of Object.entries(clips)) {
          if (only && !only.includes(clip)) continue;
          const cells = [];
          for (let k = 0; k < PER; k++) {
            const t0 = +(process.env.ANIM_T0 || 0), t1 = process.env.ANIM_T1 ? +process.env.ANIM_T1 : dur;
            await t.game('act', 'anim', { clip, t: t0 + (t1 - t0) * k / (PER - 1) });
            const vp = t.page.viewportSize();
            const buf = await t.page.screenshot({ clip: { x: vp.width * 0.39, y: vp.height * 0.04, width: vp.width * 0.22, height: vp.height * 0.92 } });
            cells.push(buf.toString('base64'));
          }
          rows.push({ clip, cells });
        }
        await t.game('act', 'anim', null);
        // compose the sheet in a blank page
        fs.mkdirSync(t.shotDir, { recursive: true });
        for (let g = 0; g * 4 < rows.length; g++) {
          const part = rows.slice(g * 4, g * 4 + 4);
          const sheet = await t.browser.newPage({ viewport: { width: 1500, height: 200 } });
          await sheet.setContent(`<body style="margin:0;background:#111;color:#ddd;font:16px sans-serif">${part.map((r) => `<div style="display:flex;align-items:center"><div style="width:90px;padding:4px">${r.clip}</div>${r.cells.map((c) => `<img src="data:image/png;base64,${c}" style="height:330px">`).join('')}</div>`).join('')}</body>`);
          await sheet.screenshot({ path: path.join(t.shotDir, `anim-${view}-${g}.png`), fullPage: true });
          await sheet.close();
        }
        t.log(`anim-${view}: ${rows.length} clips × ${PER}`);
      }
      await t.game('act', 'cam', null);
    },
  },
];
