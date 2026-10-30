# Visual v3 campaign log

The plan is `C:\Users\brian\.claude\plans\design-and-implement-a-shiny-leaf.md`, mirrored in the commit history.
Each review round is: capture → probe → packet → panel (Prosecutor A, Prosecutor B, Defender, then the Arbiter)
→ fix. Binding verdicts are in `review/<round>.md`; score history is in `review/scores.json`.

**Stop rule:** overall ≥ 8.5 with no category under 7, or two rounds in a row gaining < 0.2.

## Commands
- Capture: `node shared/test-harness/run.mjs . --gpu --file capture --milestone <round>`
- Perf: `node shared/test-harness/run.mjs . --gpu --uncapped --file perf-gpu --milestone <round>`
- Then: `node shared/test-harness/sheets.mjs . --milestone <round>`,
  `node shared/test-harness/sheets.mjs . --milestone <round> --compare <prev>`, `node tools/probe.mjs <round>`,
  `node tools/review-pack.mjs <round> --prev <prev>`

## Panel seats
- **Prosecutor A:** a Claude subagent.
- **Prosecutor B:** Codex (gpt-6.1-sol, `--effort medium`). A one-time check on 2026-10-29 confirmed it reads the
  PNGs accurately.
- **Defender:** a Claude subagent.
- **Arbiter:** a fresh Claude subagent.

## M0 (2026-10-29)
- **Capture:** `tests/capture.test.mjs` takes 22 stills per viewport, 5 bursts per viewport and a 7 s video. Make
  and miss are deterministic (seeds 23 and 41).
- **Tools:** `tools/probe.mjs`, `tools/review-pack.mjs`, `tools/find-seeds.mjs`; `tests/perf-gpu.test.mjs`. The
  harness gained `--uncapped`, the new MIME types and `t.browser`.
- **Removed:** `tools/gpu-shots.mjs`, `perf3d.mjs` and `before-after.mjs`, now superseded.
- **Benchmarks:** NBA 2K27 added (7 official store shots). No portrait-mobile benchmark was found.
- **Baseline probe:**
  - **Floor/crowd ratio is already about 3.2** (desktop c02/c10/c11/c19). The plan's M2 gate of ≥ 1.7 is
    meaningless, so it becomes **≥ 4.8 (1.5× baseline)** on c02/c10/c11.
  - Desktop: empty foreground 22–51%, handler X 0.66–0.94, ball contrast in flight 1.1–1.3.
  - Mobile: player height ~57 px.
- **Baseline perf** (uncapped, RTX 5060):
  - desktop high: title 411, match 487, arena 387 fps; task ~2 ms per frame; 75–81 draw calls; 57k triangles
  - mobile medium: 578–865 fps
  - 4× CPU throttle: match 65 fps (desktop), 88 fps (mobile)
- **Baseline panel (v3-m0-r1):** A 5.8 · B (Codex) 6.2 · D 6.4 → **Arbiter 6.1, with 4 blockers**:
  1. floor-reflection ghosts
  2. ghost discs over the rim (old sphere trail)
  3. the gray near-hoop box on mobile
  4. callouts on the rim or ball, and an orphaned "+3"

  Ranked fixes 1-10 are in `review/v3-m0-r1.md`.
- **Crowd provenance:** the sprites came from Codex-generated sprite sheets (see `tools/pack-assets.mjs` and
  `art-src/`), so they're original. The Arbiter flagged it because the packet can't show provenance. M4/M6 should
  still unify the style (fix 3).
- **Packet process fix:** `review-pack.mjs` now re-runs `sheets.mjs` and `probe.mjs` itself, after Prosecutor A
  found a stale c17 thumbnail.

## M1 (2026-10-29): platform
- **three.js r186:** bundled by esbuild (`tools/build-vendor.mjs`, `tools/three-entry.js`, `tools/dev`) together with
  pmndrs postprocessing 6.39.5 and N8AO 2.0.1. `import.meta.url` is defined for the IIFE build, for KTX2Loader.
- **Hashed core:** `vendor/three.<h>.js`, `assets/players.<h>.js`, `assets/tex.<h>.js` (`tools/hashed.mjs`, which
  writes `src/js/gl/build-info.js`). The Basis transcoder is in `vendor/basis/`.
- **Post-processing:** `src/js/gl/post.js`. High uses MSAA 4×, medium FXAA, both with ACES tone mapping in the
  effect pass; low renders directly.
- **HQ loader:** `src/js/gl/hq.js`, with an empty `assets/hq/manifest.json` and `gfx.hq` in the hooks. It's off
  for file://, `?hq=0` and Auto on software GL.
- **Tests:** `tests/budget.test.mjs` replaces the 2.5 MB test. It covers:
  - core 2.31 MB raw / 0.95 MB gzip
  - the HQ manifest
  - the frozen-gameplay hashes (`tests/frozen.json`)
  - bytes before ready (2.31 MB)
  - the HQ-failure fallback
  - the file:// smoke test
- **Title attract match:** deterministic under `__TEST__` (seed 1).
- **Site repo:** local branch `basketball-v3-hosting` (commit eef9593, not pushed) adds immutable caching for hashed
  `/g/*` files and a cover `ready()` wait.
- **Parity:** luma within ±2% and floor/crowd regions within ±5% on all c-shots against v3-m0-r1; c10's crowd
  is -9.7%, from crowd animation phase. Before/after sheets inspected. No full panel for this invisible milestone:
  M2's panel reviews the combined M1+M2 build.
