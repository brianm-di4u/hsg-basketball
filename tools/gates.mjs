#!/usr/bin/env node
// The automated half of a milestone gate: checks a round's probe numbers (tools/probe.mjs) and frame meta
// against the milestone's thresholds before any review panel is spent on it.
//
//   node tools/gates.mjs <round> <milestone>     e.g. node tools/gates.mjs v3-m2-r1 m2
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [round, ms] = process.argv.slice(2);
if (!round || !ms) { console.error('usage: node tools/gates.mjs <round> <m2|m3|...>'); process.exit(2); }
const base = path.join(root, 'screenshots', round);
const probe = JSON.parse(fs.readFileSync(path.join(base, 'probe', 'probe.json'), 'utf8'));
const meta = (vp) => { try { return JSON.parse(fs.readFileSync(path.join(base, vp, 'meta.json'), 'utf8')); } catch { return {}; } };
const S = (vp, shot) => (probe.stills[vp] || {})[shot] || {};
const B = (vp, name) => (probe.bursts[vp] || {})[name] || {};
const results = [];
const check = (label, value, ok) => results.push({ label, value, ok: !!ok });
const LIVE = ['c02-live', 'c03-gather', 'c04-release', 'c05-flight', 'c06-make', 'c07-miss', 'c10-jessieville', 'c11-mountain-pine', 'c16-crowd-reaction', 'c19-handler'];
const boxHit = (a, b) => a && b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const GATES = {
  m2() {
    for (const s of ['c02-live', 'c10-jessieville', 'c11-mountain-pine']) check(`floor/crowd ${s} ≥ 4.8`, S('desktop', s).floorCrowd, S('desktop', s).floorCrowd >= 4.8);
    for (const vp of ['desktop', 'mobile']) {
      const b = B(vp, 'jumper');
      check(`${vp} ball contrast in flight (jumper mean) ≥ 2.0`, b.ballContrastMean, b.ballContrastMean >= 2.0);
    }
    for (const s of LIVE) { const v = S('desktop', s).emptyFgPct; if (v != null) check(`desktop empty foreground ${s} ≤ 15%`, v, v <= 15); }
    for (const n of ['open-play', 'drive', 'jumper']) { const v = B('desktop', n).handlerInBandPct; if (v != null) check(`desktop handler in [0.18, 0.82] (${n}) ≥ 95%`, v, v >= 95); }
    const pp = ['c02-live', 'c10-jessieville', 'c19-handler'].map((s) => S('mobile', s).playerPx).filter((v) => v != null);
    const med = pp.sort((a, b) => a - b)[pp.length >> 1];
    check('mobile median player height ≥ 65 px', med, med >= 65);
    for (const vp of ['desktop', 'mobile']) {
      const m = meta(vp)['c06-make'] || {};
      const slam = m.hud && m.hud.slamBox, rims = (m.rims || []).filter((r) => r.on).map((r) => ({ x: r.x - 30, y: r.y - 40, w: 60, h: 70 }));
      check(`${vp} slam card clear of the rim (c06)`, slam ? 'placed' : 'no box', slam && !rims.some((r) => boxHit(slam, r)));
      const miss = meta(vp)['c07-miss'] || {};
      check(`${vp} no slam card on the miss (c07)`, miss.hud && miss.hud.slam ? miss.hud.slam.text : 'none', !(miss.hud && miss.hud.slam));
    }
    for (const s of LIVE) { const v = S('desktop', s).nearBlackPct; if (v != null) check(`desktop near-black ${s} ≤ 12%`, v, v <= 12); }
  },
};
if (!GATES[ms]) { console.error(`no gates for ${ms}`); process.exit(2); }
GATES[ms]();
const failed = results.filter((r) => !r.ok);
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.label}  (${r.value})`);
console.log(`\n${results.length - failed.length}/${results.length} gates pass`);
fs.writeFileSync(path.join(base, 'gates.json'), JSON.stringify({ round, milestone: ms, results }, null, 1));
process.exit(failed.length ? 1 : 0);
