#!/usr/bin/env node
// Builds the reviewers' packet for one capture round: everything a blind reviewer needs, nothing from the
// developer. Run after the capture test; it re-runs sheets.mjs (and --compare with --prev) and tools/probe.mjs
// itself, so the packet never mixes stills from different captures.
//
//   node tools/review-pack.mjs <milestone> [--prev <earlier milestone>]
//
// screenshots/<milestone>/review-packet/
//   sheets/            contact sheets of the stills (copied from sheets.mjs output)
//   before-after/      same-named pairs against --prev (sheets.mjs --compare output, when present)
//   bursts/<vp>-<name>.png   one strip sheet per motion burst, frames in order
//   probe/             annotated probe frames and probe.json
//   benchmarks/        benchmark contact sheets (from benchmarks/, git-ignored, review only)
//   video/             real-time video, when captured
//   stills/<vp>/       full-size stills
//   PACKET.md          index: what each file is, the shot list and the probe glossary
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const ms = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--prev');
const prev = args.includes('--prev') ? args[args.indexOf('--prev') + 1] : null;
if (!ms) { console.error('usage: node tools/review-pack.mjs <milestone> [--prev <milestone>]'); process.exit(2); }
const base = path.join(root, 'screenshots', ms);
const run = (...a) => execFileSync(process.execPath, a, { cwd: root, stdio: 'inherit' });
run('shared/test-harness/sheets.mjs', '.', '--milestone', ms);
if (prev) run('shared/test-harness/sheets.mjs', '.', '--milestone', ms, '--compare', prev);
run('tools/probe.mjs', ms);
const out = path.join(base, 'review-packet');
fs.rmSync(out, { recursive: true, force: true });
const copyDir = (from, to) => { if (fs.existsSync(from)) fs.cpSync(from, to, { recursive: true }); };

const { chromium } = await import(pathToFileURL(path.join(root, 'shared/test-harness/node_modules/playwright/index.mjs')).href);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const uri = (f) => `data:image/${f.endsWith('.jpg') ? 'jpeg' : 'png'};base64,` + fs.readFileSync(f).toString('base64');
async function tile(files, cols, cellW, file, caption = (f) => path.basename(f)) {
  await page.setContent(`<!doctype html><style>body{margin:0;background:#222;font:600 14px system-ui;color:#fff}
    main{display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:6px;padding:6px;width:max-content}
    figure{margin:0;background:#000}img{display:block;width:100%}figcaption{padding:3px 6px;background:#333}</style>
    <main>${files.map((f) => `<figure><img src="${uri(f)}"><figcaption>${caption(f)}</figcaption></figure>`).join('')}</main>`);
  await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode())));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.locator('main').screenshot({ path: file });
}

copyDir(path.join(base, 'sheets'), path.join(out, 'sheets'));
copyDir(path.join(base, 'before-after'), path.join(out, 'before-after'));
copyDir(path.join(base, 'probe'), path.join(out, 'probe'));
const shotList = {};
for (const vp of ['desktop', 'mobile']) {
  const dir = path.join(base, vp);
  if (!fs.existsSync(dir)) continue;
  const stills = fs.readdirSync(dir).filter((f) => f.endsWith('.png')).sort();
  shotList[vp] = stills;
  fs.mkdirSync(path.join(out, 'stills', vp), { recursive: true });
  for (const f of stills) fs.copyFileSync(path.join(dir, f), path.join(out, 'stills', vp, f));
  const bdir = path.join(dir, 'bursts');
  if (fs.existsSync(bdir)) for (const name of fs.readdirSync(bdir).sort()) {
    const frames = fs.readdirSync(path.join(bdir, name)).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(bdir, name, f));
    if (frames.length) await tile(frames, vp === 'mobile' ? 6 : 4, vp === 'mobile' ? 240 : 420, path.join(out, 'bursts', `${vp}-${name}.png`), (f) => `${name} ${path.basename(f, '.png')}`);
  }
  copyDir(path.join(dir, 'video'), path.join(out, 'video'));
}
const bench = path.join(root, 'benchmarks');
if (fs.existsSync(bench)) {
  const imgs = fs.readdirSync(bench).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort().map((f) => path.join(bench, f));
  for (let i = 0; i < imgs.length; i += 6) await tile(imgs.slice(i, i + 6), 2, 760, path.join(out, 'benchmarks', `benchmarks-${String(i / 6 + 1).padStart(2, '0')}.png`));
  fs.copyFileSync(path.join(bench, 'SOURCES.md'), path.join(out, 'benchmarks', 'SOURCES.md'));
}
await browser.close();

const list = (d) => (fs.existsSync(path.join(out, d)) ? fs.readdirSync(path.join(out, d)).filter((f) => !fs.statSync(path.join(out, d, f)).isDirectory()).sort() : []);
const md = `# Review packet: ${ms}

Captured on a real GPU (ANGLE D3D11, RTX 5060) from the game's own build. Desktop is 1280×800; mobile is
390×844 at 2× (portrait phone). Every still is named for what it shows and keeps its name across rounds.
${prev ? `Before/after pairs compare with round \`${prev}\`.` : 'This is a baseline round: there are no before/after pairs.'}

## Files
- \`sheets/\`: contact sheets of every still (${list('sheets').join(', ')})
- \`stills/<viewport>/\`: full-size stills. Open these for detail; cite them by name.
- \`bursts/\`: motion strips, frames in order (${list('bursts').join(', ')}). Each burst steps the game a fixed number of
  sim ticks per frame (1 tick = 1/60 s): jumper 3, drive 3, open-play 4, make-wide 5, net-close 2.
- \`video/\`: a real-time recording of open play (webm), when present.
- \`probe/\`: \`probe.json\` and annotated frames. Green dots are floor samples, red dots crowd samples, cyan boxes
  players (feet to 6.2 ft), the yellow ring the ball surround, magenta boxes the rims.
- \`before-after/\`: BEFORE/AFTER pairs, when present.
- \`benchmarks/\`: official store screenshots of NBA 2K27, 2K26, 2K25, NBA 2K Playgrounds 2, Hoop Land and Basketball
  Classics, with \`SOURCES.md\` describing each.

## Stills
${Object.entries(shotList).map(([vp, s]) => `- ${vp}: ${s.map((f) => f.replace('.png', '')).join(', ')}`).join('\n')}

Shot key: c01 title menu over the attract camera · c02 live half-court play · c03-c05 a jumper (gather, release,
flight) · c06 a made three (+1 frame) · c16 the same make 0.8 s later (crowd reaction) · c18 the net from a close
camera right after a make · c07 an airball · c08/c17 highlight replay (late and mid) · c09 state-finals arena ·
c10/c11 two other home gyms · c15 bench and scorer's table close camera · c21 a player's face and hands close camera ·
c19 a later live frame · c12 Hot Streak shootout · c13 team select · c20 season hub · c22 pause menu · c14 champion screen.

## Probe glossary
- \`luma\`: mean 0-255 luma of the frame. \`nearBlackPct\` / \`clippedPct\`: share of pixels under 16 / over 250.
- \`floorY\`, \`crowdY\`: median relative luminance (linear 0-1) of the floor and crowd samples; \`floorCrowd\` is
  (floorY + 0.05) / (crowdY + 0.05).
- \`ballContrast\`: (L1 + 0.05) / (L2 + 0.05) between the ball and a ring around it; only while the ball is loose.
- \`emptyFgPct\`: share of the play area's height below the lowest player's feet.
- \`handlerX\`: the ball handler's x as a fraction of the play area width. \`playerPx\`: median player height, CSS px.
`;
fs.writeFileSync(path.join(out, 'PACKET.md'), md);
console.log(`packet in ${path.relative(root, out)}`);
