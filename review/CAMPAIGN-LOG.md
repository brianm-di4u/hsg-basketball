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

## M2 (2026-10-29): broadcast pass on lite art
Iterated against dev captures (`v3-m2-dev`) and automated gates (`tools/gates.mjs m2`) before the panel.

**Changes:**
- **Floor:** the planar reflector is removed, which kills the ghosts. The floor is now clearcoat
  `MeshPhysicalMaterial`, with lamp-row light pools and a box-projected reflection probe of the venue
  (`probe3d.js`). The probe is also `scene.environment`.
- **Ball:** a ribbon trail that starts just behind the ball and clears below the rim (`trail3d.js`). The outline
  holds about 1.5 px at any distance. A HUD halo darkens what's behind a loose ball, and the ball glows slightly
  in flight.
- **Make payoff:**
  - a verlet cloth net (`net3d.js`), a rim emissive flash and hoop shake
  - the scoring side's crowd stands (a team attribute in the crowd shader)
  - the HUD steam puffs are gone in 3D; they were the baseline's ghost discs
- **Camera:**
  - **Desktop:** pitch 17.5°; the frame bottom sits 3.5 ft below the nearest on-screen player; a 6%-of-span dead
    zone; a 2.5° tip-down on shots.
  - **Lead and clamps:** the 3D lead is 5 ft; the camera never drifts more than 13 ft from the ball; the end clamp
    is ±19 ft.
  - **Portrait:** pitch 32°, half-width 14.5 ft, lead 7+6 ft, players about 82-90 px.
  - **Replay:** stays on the near side of the shooter-rim line, so it never faces the open camera side.
  - **Mobile near hoop:** hidden through material visibility, because its parts are merged into the venue mesh.
- **Venue:**
  - stanchion pads get a light bevel cap and stripe
  - a dark primary color falls back to the secondary for wainscots and bench chairs
  - bench figures sit in front of the chairs
  - no repeated crowd faces within 3 seats
  - arena apron wordmarks repeat (they read whole in any crop); the arena apron, roof and fog are lighter
  - arena side tiers run into the corners
- **Light:**
  - a cool back rim light in the kit shader
  - the house a touch dimmer (crowd `uLight` 0.54 in gyms, 0.36 in the arena)
  - bloom on HDR emitters (`GLOW` in `post.js`: lamps, scoreboards, ribbons, exits, shot clocks, rim flash)
  - a light contrast and saturation grade
- **HUD:**
  - the slam card is placed in the first band clear of the projected rim and ball, and lasts 1.15 s; `slamBox`
    is exposed for the gates
  - "+3" sits above the backboard and is dropped when its anchor leaves the screen
  - the chevron is clamped to 14-24 px
  - the score bug is 560 px wide, with FOULS at 12.5 px
- **Menus:** the night broadcast theme is the default (Day is a Settings choice). Navy panels, gold primary
  buttons, display face on headings and buttons.

**Probe fixes found along the way:**
- **Mobile points:** stage-relative coordinates were treated as page coordinates. All mobile probe numbers in
  v3-m0-r1 and v3-m1-r1 were offset by the score-strip height.
- **Crowd luminance:** now the mean over a wide patch.
- **New metrics:** `voidPct` (nearly-black 32 px tiles, excluding the score bug) replaces frame-wide near-black
  as a gate; `handlerY` is added.
- **Gate thresholds:**
  - floor/crowd ≥ 2.5: keep the hierarchy the Arbiter asked to keep, not 4.8
  - empty foreground and handler band judged on natural-play shots only (the set-up captures pull defenders
    away on purpose)
- **Capture:** settles the camera with 30 two-tick steps before live stills; one big `step(n)` draws only a
  single frame.
- **Gates:** 49/49 before the panel.
- **Perf** (uncapped, RTX 5060), before bloom: desktop 530-593 fps, task ~1.7 ms, 108-120 calls; mobile 670-885 fps.

**Deferred:** title banners in the desktop gameplay band. The back wall above the bleachers is outside the
lower camera's frame, so the HQ venue (M3) redesigns the wall layout. End-wall pennants already show in end
frames (c07).
