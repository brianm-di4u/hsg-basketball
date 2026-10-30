#!/usr/bin/env node
// Pixel probes for the visual review: measures the captured frames at the screen points recorded with them
// (tests/helpers.mjs frameMetaInPage), so lighting, readability and framing claims rest on numbers.
//
//   node tools/probe.mjs <milestone>    → screenshots/<milestone>/probe/probe.json
//                                          screenshots/<milestone>/probe/<viewport>/<shot>.png (annotated)
//
// Per still: luma mean, near-black % (luma < 16), clipped % (> 250), floor and crowd median luminance and
// their ratio, ball-vs-surround contrast, empty foreground below the lowest player, the ball handler's
// screen x, median player height (CSS px), void share (32 px tiles that are nearly all near-black).
// Per burst: the same, aggregated over frames.
// Luminance is relative luminance (linear, 0-1); contrast ratios are WCAG-style (L1 + 0.05) / (L2 + 0.05).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ms = process.argv[2];
if (!ms) { console.error('usage: node tools/probe.mjs <milestone>'); process.exit(2); }
const base = path.join(root, 'screenshots', ms);
const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage();

// runs in the page: decode the PNG, sample it at the meta points, and draw the annotated copy
function measure([b64, meta, annotate]) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const k = img.width / meta.W; // device pixels per CSS px
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const Y = (i) => 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
      const at = (x, y) => (Math.round(y * k) * c.width + Math.round(x * k)) * 4;
      const patch = (x, y, r = 3) => { const v = []; for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) { const X = x + dx, Yy = y + dy; if (X >= 0 && Yy >= 0 && X < meta.W && Yy < meta.H) v.push(Y(at(X, Yy))); } return v; };
      const median = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };
      const mean = (a) => (a.length ? a.reduce((p, q) => p + q, 0) / a.length : null);
      // whole frame
      let sum = 0, black = 0, clip = 0, n = 0;
      for (let i = 0; i < d.length; i += 4 * 7) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; sum += l; n++; if (l < 16) black++; if (l > 250) clip++; }
      const out = { luma: +(sum / n).toFixed(1), nearBlackPct: +(100 * black / n).toFixed(1), clippedPct: +(100 * clip / n).toFixed(2) };
      // voids: 32-css-px tiles that are almost all near-black (a dark area with nothing in it, not dark clothes)
      { const T = Math.round(32 * k); let tiles = 0, voids = 0;
        for (let ty = 0; ty + T <= c.height; ty += T) for (let tx = 0; tx + T <= c.width; tx += T) {
          let dark = 0, m = 0;
          for (let y = ty; y < ty + T; y += 4) for (let x = tx; x < tx + T; x += 4) { const i = (y * c.width + x) * 4; m++; if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 16) dark++; }
          const sb = meta.sb, inSb = sb && tx / k < sb.x + sb.w && (tx + T) / k > sb.x && ty / k < sb.y + sb.h && (ty + T) / k > sb.y;
          const sl = meta.hud && meta.hud.slamBox, inSlam = sl && tx / k < sl.x + sl.w && (tx + T) / k > sl.x && ty / k < sl.y + sl.h && (ty + T) / k > sl.y;
          if (inSb || inSlam) continue; // the score bug and the slam card are dark panels by design, not empty parts of the scene
          tiles++; if (dark / m > 0.92) voids++;
        }
        out.voidPct = +(100 * voids / tiles).toFixed(1); }
      if (meta.floor && meta.floor.length) out.floorY = +median(meta.floor.flatMap(([x, y]) => patch(x, y))).toFixed(4);
      // the crowd is people and the dark gaps between rows: the mean over a wide patch, then the median of those
      if (meta.crowd && meta.crowd.length) out.crowdY = +median(meta.crowd.map(([x, y]) => mean(patch(x, y, 10)))).toFixed(4);
      if (out.floorY != null && out.crowdY != null) out.floorCrowd = +((out.floorY + 0.05) / (out.crowdY + 0.05)).toFixed(2);
      const b = meta.ball;
      if (b && b.on && b.state !== 'held') {
        const disc = [], ring = [];
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          for (const f of [0, 0.35, 0.6]) disc.push(...patch(b.x + Math.cos(a) * b.r * f, b.y + Math.sin(a) * b.r * f, 0));
          for (const f of [1.7, 2.2, 2.8]) ring.push(...patch(b.x + Math.cos(a) * b.r * f, b.y + Math.sin(a) * b.r * f, 0));
        }
        const L1 = mean(disc), L2 = mean(ring);
        out.ballContrast = +((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2);
        out.ballPx = +(b.r * 2).toFixed(1);
      }
      const st = meta.stage || { x: 0, y: 0, w: meta.W, h: meta.H };
      const ps = (meta.players || []).filter((p) => p.on && p.foot > st.y && p.foot < st.y + st.h + 40);
      if (ps.length) {
        const low = Math.max(...ps.map((p) => p.foot));
        out.emptyFgPct = +(100 * Math.max(0, st.y + st.h - low) / st.h).toFixed(1);
        out.playerPx = +median(ps.map((p) => p.px)).toFixed(1);
        const h = ps.find((p) => p.holder);
        if (h) { out.handlerX = +((h.x - st.x) / st.w).toFixed(3); out.handlerY = +((h.foot - st.y) / st.h).toFixed(3); }
      }
      if (!annotate) return resolve({ out });
      g.lineWidth = 2 * k;
      g.fillStyle = 'rgba(0,255,90,.85)'; for (const [x, y] of meta.floor || []) g.fillRect(x * k - 2 * k, y * k - 2 * k, 4 * k, 4 * k);
      g.fillStyle = 'rgba(255,40,80,.85)'; for (const [x, y] of meta.crowd || []) g.fillRect(x * k - 2 * k, y * k - 2 * k, 4 * k, 4 * k);
      g.strokeStyle = '#0ff'; for (const p of ps) g.strokeRect((p.x - p.px * 0.25) * k, p.head * k, p.px * 0.5 * k, (p.foot - p.head) * k);
      if (b && b.on) { g.strokeStyle = '#ff0'; g.beginPath(); g.arc(b.x * k, b.y * k, b.r * 2.8 * k, 0, 7); g.stroke(); }
      g.strokeStyle = '#f0f'; for (const r of meta.rims || []) if (r.on) g.strokeRect(r.x * k - 14 * k, r.y * k - 8 * k, 28 * k, 16 * k);
      g.font = `${13 * k}px monospace`; g.fillStyle = 'rgba(0,0,0,.7)'; g.fillRect(0, c.height - 22 * k, c.width, 22 * k);
      g.fillStyle = '#fff'; g.fillText(Object.entries(out).map(([q, v]) => `${q} ${v}`).join('  '), 6 * k, c.height - 7 * k);
      resolve({ out, png: c.toDataURL('image/png').split(',')[1] });
    };
    img.src = 'data:image/png;base64,' + b64;
  });
}

const report = { milestone: ms, made: new Date().toISOString(), stills: {}, bursts: {} };
for (const vp of ['desktop', 'mobile']) {
  const dir = path.join(base, vp);
  let metas = {};
  try { metas = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch { continue; }
  const outDir = path.join(base, 'probe', vp);
  fs.mkdirSync(outDir, { recursive: true });
  report.stills[vp] = {};
  for (const [shot, meta] of Object.entries(metas)) {
    const f = path.join(dir, shot + '.png');
    if (!fs.existsSync(f)) continue;
    const { out, png } = await page.evaluate(measure, [fs.readFileSync(f).toString('base64'), meta, true]);
    report.stills[vp][shot] = out;
    fs.writeFileSync(path.join(outDir, shot + '.png'), Buffer.from(png, 'base64'));
  }
  const bdir = path.join(dir, 'bursts');
  report.bursts[vp] = {};
  if (fs.existsSync(bdir)) for (const name of fs.readdirSync(bdir)) {
    let bm; try { bm = JSON.parse(fs.readFileSync(path.join(bdir, name, 'meta.json'), 'utf8')); } catch { continue; }
    const frames = [];
    for (let i = 0; i < bm.length; i++) {
      const f = path.join(bdir, name, `f${String(i).padStart(2, '0')}.png`);
      if (fs.existsSync(f)) frames.push((await page.evaluate(measure, [fs.readFileSync(f).toString('base64'), bm[i], false])).out);
    }
    const vals = (k) => frames.map((x) => x[k]).filter((v) => v != null);
    const agg = (k, fn) => { const v = vals(k); return v.length ? +fn(v).toFixed(3) : null; };
    const avg = (v) => v.reduce((p, q) => p + q, 0) / v.length;
    const hx = vals('handlerX');
    report.bursts[vp][name] = {
      frames: frames.length,
      ballContrastMean: agg('ballContrast', avg), ballContrastMin: agg('ballContrast', (v) => Math.min(...v)),
      floorCrowdMean: agg('floorCrowd', avg), emptyFgMean: agg('emptyFgPct', avg), playerPxMedian: agg('playerPx', (v) => [...v].sort((p, q) => p - q)[v.length >> 1]),
      handlerInBandPct: hx.length ? +(100 * hx.filter((x) => x >= 0.18 && x <= 0.82).length / hx.length).toFixed(0) : null,
    };
  }
}
await browser.close();
fs.mkdirSync(path.join(base, 'probe'), { recursive: true });
fs.writeFileSync(path.join(base, 'probe', 'probe.json'), JSON.stringify(report, null, 1));
for (const vp of Object.keys(report.stills)) {
  console.log(`\n${vp}`);
  for (const [s, o] of Object.entries(report.stills[vp])) console.log(`  ${s.padEnd(20)} ${Object.entries(o).map(([k, v]) => `${k}=${v}`).join(' ')}`);
  for (const [s, o] of Object.entries(report.bursts[vp] || {})) console.log(`  burst ${s.padEnd(14)} ${Object.entries(o).map(([k, v]) => `${k}=${v}`).join(' ')}`);
}
