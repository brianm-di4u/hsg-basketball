// M6 crowd gates (GPU: the 3D crowd streams with the HQ art): the low-poly fans replace the photo cards, stay
// within a few draw calls, and a make visibly moves the scoring side (stand, cheer) far more than idle motion.
import { FORCE_3D, ready3d, hqSettled, SEEDS, shotFromInPage } from './helpers.mjs';

const G = (t, fn, ...a) => t.page.evaluate(fn, a);

// mean absolute luma difference between two same-size screenshots (0-255), decoded in the page
async function diff(t, a, b) {
  return t.page.evaluate(async ([a, b]) => {
    const load = async (s) => { const im = new Image(); im.src = 'data:image/png;base64,' + s; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const A = await load(a), B = await load(b);
    let s = 0, n = 0;
    for (let i = 0; i < A.length; i += 4) { s += Math.abs((0.299 * A[i] + 0.587 * A[i + 1] + 0.114 * A[i + 2]) - (0.299 * B[i] + 0.587 * B[i + 1] + 0.114 * B[i + 2])); n++; }
    return s / n;
  }, [a.toString('base64'), b.toString('base64')]);
}

export const tests = [
  {
    name: 'crowd: 3D fans, draw calls, reaction to a make',
    viewports: ['desktop'],
    initScript: FORCE_3D,
    async run(t) {
      if (!t.gpu) { t.log('software GL: the 3D crowd streams with the HQ art (run with --gpu)'); return; }
      await ready3d(t);
      await hqSettled(t);
      await G(t, () => {
        const g = window.__game; g.seed(11);
        g.newGame({ mode: 'exhibition', program: 'boys', paused: true, home: 'hot-springs', away: 'lake-hamilton', user: 'none' });
        for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
        g.step(2);
      });
      const s = await t.state();
      t.expect(s.gfx.crowd3d > 400, `3D fans seated (${s.gfx.crowd3d})`);
      const calls = await G(t, () => { let n = 0; window.__G3.venue.crowd3d.g.traverse((o) => { if (o.isInstancedMesh) n++; }); return n; });
      t.expect(calls <= 8, `crowd draw calls ${calls} ≤ 8`);
      // a made three by the home team (a known seed), watched on the far stands from a fixed camera
      await t.page.evaluate(`window.__shotFrom = ${shotFromInPage.toString()}`);
      const pts = await G(t, ([a]) => window.__shotFrom(a), [SEEDS.make3, 1]);
      t.equal(pts, 3, 'the home team made a three');
      await t.game('act', 'cam', { p: [47, 14, 30], t: [47, 9, -30], fov: 50 });
      const clip = { x: 0, y: 0, width: 1280, height: 420 };
      const shot = () => t.page.screenshot({ clip });
      const i1 = await shot();
      await t.game('step', 60); const i2 = await shot();
      const react = await diff(t, i1, i2);
      // and the same second of stands once the reaction is over
      await t.game('step', 420); const i3 = await shot();
      await t.game('step', 60); const i4 = await shot();
      const idle = await diff(t, i3, i4);
      t.log(`stands change: idle ${idle.toFixed(2)}, after a make ${react.toFixed(2)} (×${(react / Math.max(0.01, idle)).toFixed(1)})`);
      t.expect(react >= 1.5 * idle, `a make moves the stands at least 1.5× idle (${react.toFixed(2)} vs ${idle.toFixed(2)})`);
      await t.game('act', 'cam', null);
    },
  },
];
