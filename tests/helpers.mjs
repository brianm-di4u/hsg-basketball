// Shared helpers for the Spa City Hoops tests (imported by *.test.mjs; not a test file itself).

export async function waitFor(t, pred, ms = 8000, label = 'condition') {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const s = await t.state();
    if (pred(s)) return s;
    await t.page.waitForTimeout(50);
  }
  t.fail(`timed out waiting for ${label}`);
  return t.state();
}

// Step the paused simulation until pred(state) or n ticks.
export async function stepUntil(t, pred, maxTicks = 3600, chunk = 30, label = 'condition') {
  for (let k = 0; k < maxTicks; k += chunk) {
    await t.game('step', chunk);
    const s = await t.state();
    if (pred(s)) return s;
  }
  t.fail(`stepUntil timed out: ${label}`);
  return t.state();
}

// A paused exhibition with the user's team at home.
export async function exhibition(t, o = {}) {
  await t.seed(o.seed ?? 7);
  await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1, paused: true, ...o });
  return t.state();
}

// Click a [data-act] button (optionally with data-arg).
export async function click(t, act, arg) {
  const sel = arg != null ? `[data-act="${act}"][data-arg="${arg}"]` : `[data-act="${act}"]`;
  await t.page.click(sel);
  await t.page.waitForTimeout(30);
}

// WCAG contrast of every visible text element against its nearest opaque background.
export async function contrastReport(page) {
  return page.evaluate(() => {
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map((x) => parseFloat(x)); return { r: v[0], g: v[1], b: v[2], a: v[3] == null ? 1 : v[3] }; };
    const lum = ({ r, g, b }) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
    const bgOf = (el) => {
      const stack = [];
      for (let e = el; e; e = e.parentElement) {
        const cs = getComputedStyle(e);
        const c = parse(cs.backgroundColor);
        if (cs.backgroundImage && cs.backgroundImage !== 'none' && e.id === 'sb') { stack.push({ r: 124, g: 90, b: 46, a: 1 }); break; }
        if (c && c.a > 0) { stack.push(c); if (c.a >= 0.99) break; }
      }
      let bg = { r: 20, g: 18, b: 31, a: 1 };
      for (let i = stack.length - 1; i >= 0; i--) bg = blend(stack[i], bg);
      return bg;
    };
    const out = [];
    const els = [...document.querySelectorAll('#screen *, #sb *, #pad *')].filter((e) => {
      if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') return false;
      return [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    });
    for (const e of els) {
      const cs = getComputedStyle(e);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      let fg = parse(cs.color); if (!fg) continue;
      const bg = bgOf(e);
      let op = 1; for (let x = e; x; x = x.parentElement) op *= +getComputedStyle(x).opacity;
      fg = blend({ ...fg, a: fg.a * op }, bg);
      const L1 = lum(fg), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      if (ratio < need) out.push({ text: e.textContent.trim().slice(0, 40), ratio: +ratio.toFixed(2), need, cls: e.className, tag: e.tagName });
    }
    return { checked: els.length, fails: out };
  });
}

// ---------------------------------------------------------------- 3D capture (capture.test.mjs, tools/probe.mjs)
import fs from 'node:fs';
import path from 'node:path';

// "Graphics: 3D gym" through saved settings: the harness's software GL would otherwise keep the 2D court.
export const FORCE_3D = () => { try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { graphics: '3d' } })); } catch (e) { /* storage blocked */ } };

export async function ready3d(t) {
  await t.page.waitForFunction(() => {
    const g = window.__game && window.__game.getState().gfx;
    return g && ['ready', 'failed', 'unsupported'].includes(g.state);
  }, null, { timeout: 30000 });
  const s = await t.state();
  t.equal(s.gfx.state, 'ready', `3D renderer ready ${s.gfx.err || ''}`);
  return s;
}

// Seeds whose forced shot has a known result (the sim is seeded and frozen, so these never change unless the
// sim does; tools/find-seeds.mjs finds new ones). The capture asserts the result instead of searching.
export const SEEDS = { make3: 23, miss: 41 };

// In the page: a paused exhibition, the user's point guard set up for a three from the right wing with the
// defense pulled away, then a forced release of quality q. Returns the points scored.
export function shotFromInPage([seed, q, home = 'hot-springs', away = 'lakeside']) {
  const g = window.__game; g.seed(seed);
  g.newGame({ mode: 'exhibition', home, away, program: 'boys', user: 'home', paused: true });
  for (let k = 0; k < 40 && g.getState().match.phase !== 'live'; k++) g.step(30);
  g.act('give', 0, 0); g.act('place', 0, 0, 68, 13);
  for (let s = 0; s < 5; s++) g.act('place', 1, s, 30, 5 + s * 10);
  g.step(1);
  g.act('shootAt', q);
  let st = g.getState();
  const s0 = st.match.score[0];
  for (let k = 0; k < 200 && (st.match.ball.state === 'held' || st.match.ball.state === 'shot') && st.match.score[0] === s0; k++) { g.step(2); st = g.getState(); }
  return st.match.score[0] - s0;
}

// In the page: screen-space facts about the current frame for tools/probe.mjs (ball, rims, players, court
// and crowd sample points), all in CSS px. Points off screen are dropped.
export function frameMetaInPage() {
  const g = window.__game, s = g.getState(), m = s.match;
  // project() gives stage pixels; the stage sits below the score strip on phones, so shift to page pixels
  const stage = g.act('layout').stage || { x: 0, y: 0 };
  const P = (x, z, y = 0) => { const q = g.act('project', x, z, y); return { x: q.x + stage.x, y: q.y + stage.y }; };
  const W = innerWidth, H = innerHeight, on = (q) => q && q.x >= 0 && q.x < W && q.y >= 0 && q.y < H;
  const out = { W, H, scene: s.scene, tier: s.gfx.tier, cam: s.gfx.cam, replay: !!s.replay, hud: s.hud, stage, sb: g.act('layout').sb };
  if (out.hud && out.hud.slamBox) out.hud.slamBox = { ...out.hud.slamBox, x: out.hud.slamBox.x + stage.x, y: out.hud.slamBox.y + stage.y };
  if (!m || s.gfx.mode !== '3d') return out;
  const b = m.ball, bc = P(b.x, b.z, b.y), bt = P(b.x, b.z, b.y + 0.4);
  out.ball = { x: bc.x, y: bc.y, r: Math.max(1, Math.abs(bt.y - bc.y)), state: b.state, on: on(bc) };
  out.rims = [P(5.25, 25, 10), P(88.75, 25, 10)].map((q) => ({ x: q.x, y: q.y, on: on(q) }));
  out.players = m.players.map((p) => {
    const f = P(p.x, p.z, p.y), h = P(p.x, p.z, p.y + 6.2);
    return { i: p.i, t: p.t, x: f.x, foot: f.y, head: h.y, px: Math.abs(f.y - h.y), on: on(f) || on(h), holder: b.holder === p.i };
  });
  const near = (x, z) => out.players.some((p) => p.on && Math.hypot(p.x - x, (p.foot + p.head) / 2 - z) < Math.max(18, p.px * 0.7));
  out.floor = [];
  for (let x = 3; x <= 91; x += 5) for (let z = 3; z <= 47; z += 4) { const q = P(x, z, 0); if (on(q) && !near(q.x, q.y)) out.floor.push([q.x, q.y]); }
  out.crowd = [];
  const sb = g.act('layout').sb, inSb = (q) => sb && q.x > sb.x && q.x < sb.x + sb.w && q.y > sb.y && q.y < sb.y + sb.h;
  const addC = (q) => { if (on(q) && !inSb(q)) out.crowd.push([q.x, q.y]); };
  for (let x = -6; x <= 100; x += 4) for (let r = 0; r < 9; r++) addC(P(x, -9 - r * 2.3, 1.6 + r * 1.55)); // far-side bleachers
  for (const e of [-1, 1]) for (let z = 3; z <= 47; z += 4) for (let r = 0; r < 3; r++) addC(P(47 + e * (56.5 + r * 1.6), z, 4 + r * 0.9)); // baseline students
  const ns = [P(30, 50, 0), P(47, 50, 0), P(64, 50, 0)];
  out.nearSidelineY = Math.min(...ns.map((q) => q.y));
  return out;
}

// Record frame meta for a shot; saveMeta writes screenshots/<milestone>/<viewport>/meta.json.
export async function meta(t, name) {
  t._meta = t._meta || {};
  t._meta[name] = await t.page.evaluate(frameMetaInPage);
}
export function saveMeta(t, file = 'meta.json') {
  if (!t._meta) return;
  const f = path.join(t.shotDir, file);
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* first write */ }
  fs.mkdirSync(t.shotDir, { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ ...prev, ...t._meta }, null, 1));
}

// A still that also records its frame meta.
export async function cshot(t, name, opts = {}) {
  const r = await t.shot(name, { timeout: 15000, ...opts });
  await meta(t, name);
  return r;
}

// A frame burst: `frames` screenshots `every` sim ticks apart (step(n) draws one frame each time), saved as
// screenshots/<milestone>/<viewport>/bursts/<name>/fNN.png, plus that burst's frame meta.
export async function burst(t, name, { frames = 16, every = 3, onFrame = null } = {}) {
  const dir = path.join(t.shotDir, 'bursts', name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const metas = [];
  for (let k = 0; k < frames; k++) {
    if (k) await t.game('step', every);
    if (onFrame) await onFrame(k);
    await t.page.screenshot({ path: path.join(dir, `f${String(k).padStart(2, '0')}.png`) });
    metas.push(await t.page.evaluate(frameMetaInPage));
  }
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(metas));
  t.log(`burst ${name}: ${frames} frames, every ${every} ticks`);
  return metas;
}
