# VISUAL-REPORT: Spa City Hoops visual overhaul

**Result:** the game now plays in a 3D high-school gym (three.js r160.1) with rigged players, a painted crowd, a lit
state-finals arena, a broadcast camera, highlight replays and a big-play payoff. The original 2D court remains as the
fallback. Rules, AI, the shot meter, the season and the bracket are unchanged: `sim.js`, `ai.js`, `rules.js` and
`season.js` have no diff.

The independent review scores went from **4.1 to 6.1** out of 10. That is a large step, but it is **still short of the
campaign goal**: the best benchmarks score about 9 (stylized: Hoop Land about 8, NBA 2K Playgrounds 2 about 9). The
remaining gaps are named below.

Plan: `VISUAL-PLAN.md`. Reviews: `screenshots/review/` (`visual-before-review.md`, `m1-review.md`, `m2-review.md`,
`m3-review.md`, `final-review.md`). Screenshots: `screenshots/visual-before/`, `screenshots/visual-final/` (harness),
`screenshots/visual-final/gpu/` (real GPU), `screenshots/visual-final/before-after/`.

## What changed

**Direction:** full 3D court and players, DOM menus, and a 2D canvas HUD drawn over the 3D view.
- The reviewer's first-round advice was 3D court plus sprite players.
- We chose rigged 3D players instead. Replays and close cameras need them, kit colors become a shader uniform instead
  of a sprite matrix, and both bodies fit in one 236 KB GLB.

### Players
- Two Blender bodies, M and F builds (`art-src/blender/build_players.py`, Blender 5.2, run headless).
  - Built from a skin-modifier mannequin, with a 19-bone named rig and clavicles.
  - Deterministic distance-to-bone weights.
  - Baggy shorts, ears, nose.
  - About 3.9k triangles each.
- A **kit shader** colors skin, jersey, trim, shorts with side stripes, socks and shoes from the rest-pose position, so
  kit lines stay crisp on any mesh.
  - Also in the shader: painted hair with real hairlines, eyes, brows, headbands, and the officials' stripes.
  - Hair volume is added only where needed (buns, puffs, ponytails, braids, high-tops).
- Jersey numbers front and back, on canvas textures attached to the chest bone.
- Heights come from the roster.
- A soft rim light keeps dark skin modelled.
- **Procedural animation** comes from the sim's own actions:
  - a run cycle matched to ground speed
  - a defensive slide
  - a right-hand dribble whose hand rides the ball
  - a jump shot in phases (gather, set point, release with a wrist flick)
  - layups, blocks, steals, passes, celebrations
  - a head turn toward the ball
- **Two officials** (display only) trail the play.

### Venues
- **Home gym, per school:**
  - wood bleachers with a painted crowd (instanced, one draw call)
  - a visitors' section in the away colors
  - the pep band and cheer squad
  - a student section three deep behind each baseline
  - painted block walls with a school-color wainscot and stripe, and mascot lettering
  - a wall scoreboard plus two end scoreboards that show the live score
  - spirit banners and exit signs
  - a steel-truss ceiling with high-bay lamps
  - a lettered scorer's table, team chairs with substitutes
  - **title-year pennants, only for real title years** (unchanged rule), on the back wall and both end walls
- **Floor:**
  - a painted maple tile
  - a markings canvas: lines, stained paint, a center crest, mascot and school wordmarks
  - baked light pools
  - a planar reflection: a render target with a blur, set low so it reads as gloss
- **Hoops:** glass board with frame and shooter's square, padded stanchion, rim, a mesh net that stretches on a swish,
  and a working shot clock on top.
- **State finals arena:**
  - a two-tier bowl of royal-blue chairs with one short end (the published seating chart; see Research)
  - house lights down, a spotlit floor
  - LED ribbons, an end video board
  - a navy "STATE FINALS" floor border and a sunburst center

### Camera and presentation
- **Broadcast sideline camera:**
  - it leads toward the basket being attacked
  - it rides the ball's depth
  - it keeps the attacked rim in frame in the frontcourt and through every shot (tested by projecting the rim)
  - a small push-in on big plays
- **Portrait phones** look down the court toward the basket your team attacks.
  - The stick is rotated to match.
  - The near hoop fades when it stands between the camera and the play.
- **Hot Streak:** a behind-the-shooter camera.
- **Title:** a slow attract sweep around the gym.
- **Champion:** a sweep of the finals arena with the crowd on its feet.
- **Highlight replays** after a three, a dunk or a buzzer-beater:
  - 4 s at half speed, from over the shooter's shoulder
  - letterboxed, with the HUD and touch controls hidden
  - any button skips; Settings can turn them off
  - never during reduced motion
- **Payoff:**
  - a ball trail (gold on a PERFECT release)
  - a slanted "3 POINTS", "SLAM DUNK" or "BUZZER BEATER" plate in the scoring team's color
  - crowd energy (the instanced crowd bobs)
  - the net stretches
  - callouts sit on solid plates
- **Ball readability:** an outline, contact shadows under every player and the ball, and a double YOU ring.
- **HUD:**
  - a larger shot meter that collapses to the grade word on release
  - a floating score bug on wide screens: vintage-board lamp digits, foul lamps, a possession arrow
  - a cleaner Hot Streak bar ("STREAK" lamps)
  - off-screen arrows on every edge
  - a broadcast vignette
- **Typography:** Bebas Neue (OFL), a condensed display face, for headings, buttons, the score bug and callouts.

### Fallback and settings
- **Settings → Graphics:** Auto, 3D gym or Classic 2D.
- **Auto** keeps the classic court on software WebGL (SwiftShader and similar), where 3D can't hold a frame rate.
- `?gl=0` forces 2D.
- **Adaptive quality** steps high → medium → low if frames run slow.
- A lost WebGL context falls back to 2D.
- **Settings → Highlight replays:** On or Off.

## Review scores (independent adversarial reviewer, same benchmarks each round)

| Category | 2D original | M1 | M2 | M3 | **Final** | Best benchmark |
|---|---|---|---|---|---|---|
| Art (players, court, venue) | 4 | 5 | 6 | 6 | **6.5** | 10 NBA 2K26 (stylized: Playgrounds 2 9, Hoop Land 8) |
| Lighting & materials | 2 | 3 | 5 | 5 | **5** | 10 NBA 2K25 (stylized: Playgrounds 2 8) |
| Animation & game feel | 3 | 4 | 4.5 | 4.5 | **5.5** | 10 2K (arcade: Playgrounds 2 9) |
| UI / HUD | 4 | 5 | 5.5 | 6 | **6** | 8 Hoop Land / 2K25 menus |
| Typography | 4 | 5 | 5 | 5.5 | **5.5** | 8 Hoop Land |
| Readability | 6 | 4 | 6 | 6.5 | **6.5** | 9 Hoop Land |
| Mobile portrait | 5 | 4 | 6 | 6.5 | **7** | ~8 (no portrait title in the set) |
| Authenticity of setting | 5 | 6 | 6.5 | 6.5 | **6.5** | 10 2K26 (Playgrounds 2 9, Hoop Land 8) |
| **Overall** | **4.1** | **4.5** | **5.6** | **5.8** | **6.1** | ~9 |

The final review flagged three regressions in the new slam callout. All three were fixed after it, and the fixes
were checked in `screenshots/visual-final/gpu` (g13 and g14):
- a stale plate over a later miss
- the plate covering the rim on phones
- speed streaks reading as a glitch on phones

The final scores do not include these fixes.

Benchmarks: 17 official Steam store screenshots of NBA 2K25, NBA 2K26, NBA 2K Playgrounds 2, Hoop Land and Basketball
Classics, in `benchmarks/` (git-ignored, review only), listed in `benchmarks/SOURCES.md`. No benchmark art, UI layout
or code was copied.

## Tests

| Suite | Result |
|---|---|
| `node shared/test-harness/run.mjs games/basketball --milestone visual-final` | **74/77 in the last full run.** The 3 failures were timing checks: 2D-match fps, and hooks-ready under 2 s on desktop title. They failed while other sessions held the CPU at 70–86%. **All 3 passed on two isolated re-runs** (`screenshots/perf-recheck`): 60.1–60.4 fps, hooks in 387–481 ms. The previous full run on this build line passed 76/77, with one contrast-timing flake since fixed. There were zero console errors and zero external requests in every run |
| New `tests/visual.test.mjs` (16 runs, 8 tests) | 3D boot; home gym, tip-off and live play; close cameras; jump shot with the rim kept in frame at release and in flight; highlight replay (starts, key skips); finals arena; shootout and menus over the gym; quality-tier changes keep drawing; `?gl=0` fallback never loads three.js; total download under 2.5 MB |
| Existing 8 files (61 runs) | unchanged and passing. `perf.test.mjs` now logs which renderer it measured; `a11y.test.mjs` waits for panels to finish fading before measuring contrast |
| `tools/perf3d.mjs` (real GPU, file://) | see Performance |
| `tools/gpu-shots.mjs visual-final` | 14 real-GPU frames per viewport from file://, 0 console errors |
| `tools/balance.mjs 20 120`, `tools/check-facts.mjs` | 20/20 games finish; 14/14 facts verified (sim untouched) |

**Every screenshot was inspected.** That covers 18 harness contact sheets, 5 real-GPU sheets and 8 before/after
sheets, plus full-size checks of the gameplay, arena, replay, make and miss frames at both viewports.

Why the harness and the GPU are split:
- The harness's headless Chromium renders WebGL with SwiftShader (software), at 3–5 fps in 3D. On it, "Auto" keeps the
  2D court, so the 61 existing flow tests exercise the fallback renderer.
- The 16 visual tests force "3D gym" through saved settings, so 3D runs on SwiftShader too (slowly, but correctly).
- Real-GPU frame rates and the file:// path are measured by `tools/perf3d.mjs` and `tools/gpu-shots.mjs`, which launch
  the same Playwright Chromium on the machine's GPU (ANGLE D3D11, RTX 5060). The harness blocks file:// URLs as external.

## Performance

`node games/basketball/tools/perf3d.mjs [--throttle 4]` opens `index.html` from file:// and measures the title demo, a
live 10-player match and the arena final.

Real GPU (RTX 5060, ANGLE D3D11), vsync off, so rates above 60 are headroom.

| Viewport, tier | Title demo | Live 10-player match | Arena final | Heap | Draw calls / tris | 3D ready |
|---|---|---|---|---|---|---|
| Desktop 1280×800, high | 30–166 (median 105) | 124–151 | 30–75 | 17–18 MB | 75 / 59k | 2.8–3.8 s |
| Mobile 390×844 @2×, medium | 78–351 | 57–146 (median 91) | 113–223 | 16–20 MB | 71 / 60k | 2.2–2.7 s |
| Desktop, 4× CPU throttle | 11 | 33 | 5 (governor stepped to medium) | 14 MB | 75 | 4.2 s |
| Mobile, 4× CPU throttle (phone stand-in) | 31 | 20–35 | 61 | 15 MB | 54 (low tier) | 4.4 s |

Three unthrottled runs per row; ranges are the spread. The low readings line up with the other sessions' peak load
(the desktop arena fell to 7 fps once while the CPU sat at 86%), so the best runs are closer to an idle machine.

- **Fixes the performance pass delivered:** the throttled phone-tier match went from 13.6 to 34.8 fps.
- **Not measured:** a real phone, and an idle machine.
- **Throttled desktop arena:** 5 fps is a real concern. It is mostly the reflection pass plus the arena's large crowd
  under a 4× CPU penalty.
  - The governor stepped down as designed.
  - A further step could drop the arena crowd to fewer instances on the low tier.

- **Download:** 1.86 MB in total (the harness counts 1.78 MiB).
  - `index.html` 351 KB: game, 2D renderer, HUD and font.
  - `vendor/three.bundle.js` 818 KB.
  - `assets/players.js` 314 KB.
  - `assets/tex.js` 371 KB.
- **First paint:** menus render at once on the classic court. three.js and the assets load next through `<script>`
  tags, and the 3D gym fades in (0.6–3.7 s on the GPU).
- **Optimizations:**
  - shadow map rendered once per frame
  - about 120 static venue meshes merged per material (draw calls about 160 → 75)
  - real-time shadows only on the high tier; blob shadows elsewhere
  - reflection at 0.5× (high) or 0.33× (medium) resolution
  - DPR capped at 2, 1.5 or 1 by tier
  - the crowd as one instanced mesh
  - menus render on demand
- **Profiling at 4× CPU throttle, phone tier:**
  - Frame cost went from 74 ms to 22 ms (13.6 → 34.8 fps) after the shadow and batching fixes.
  - On this run the adaptive governor dropped to the low tier.
  - The remaining cost is mostly the reflection pass and three.js scene traversal.
- **Fallbacks:**
  - no WebGL, or software WebGL → the 2D court
  - a lost context → the 2D court
  - slow frames → tier drop
- **Caveat:** several sessions shared this machine (CPU at 70–96% during measurement). Throttled numbers in particular
  varied between runs.

## Known gaps (from `screenshots/review/final-review.md`, ranked)

1. **MAJOR – lighting hierarchy.**
   - The crowd still reads nearly as bright as the floor.
   - Floor reflections of white jerseys still show as faint wisps.
   - Next: dim the house further, fade reflections by height, stronger floor pools.
2. **MAJOR – ball flight and in-world payoff.**
   - The trail is too subtle at broadcast distance.
   - There is no net snap or rim flash on a make.
   - The slam plate was moved off the rim and is now bound to one match and moment (it appeared over a later miss in
     the review captures).
3. **MAJOR – desktop camera composition.**
   - About 40% of a typical frame is empty near-side floor.
   - The ball handler can reach the frame edge.
   - Next: a lower, near-biased camera with a dead zone, and extend the safe-area test to live frames.
4. **MAJOR – menus.** Title, team select (which overflows at 1280×800) and the other panels are still the cream web
   cards over the live 3D gym. The 3D work did not reach the DOM menus beyond type and trim.
5. **MAJOR – enclosure.**
   - Bench chairs still hold sprite substitutes rather than seated players.
   - Stanchion bases are dark boxes.
   - Nothing on the near sideline; the arena's near apron is dark.
6. **MAJOR (mobile) – portrait framing.** The portrait camera shows most of the court length, so players are about
   45–65 css px tall.
7. **minor – characters.** Up close the players are smooth mannequins (no modelled hands or face geometry), and bodies
   can overlap in clumps. At gameplay distance they read fine.
8. **minor:**
   - Hot Streak staging is still sparse.
   - Desktop play shows title pennants only on the end walls.
   - Crowd sprites repeat.
   - The score bug is wide, with 10 px labels.
9. **Not checked by a person:** nobody has played the 3D build by hand, listened to it, or used it with a screen reader.
   Animation was judged from frozen frames and short real-time runs only.

## Research added (sources in `research/venues.md`)

Research added in `research/venues.md`, with sources:
- **Bank OZK Arena:**
  - Opened Dec. 6, 2003 as Summit Arena, then Bank of the Ozarks Arena (2014), then Bank OZK Arena (2018). Sources:
    Sentinel-Record 2018, KAIT 2012.
  - 134 Convention Blvd; 6,300 headline capacity (Visit Hot Springs).
  - Two seating tiers (lower 201–217, upper 300–315); one end has only a small lower block (official seating chart).
  - Royal-blue chair-back seats (two photos).
  - Hot Springs has hosted the AAA finals every year except 2013, under a contract through 2032 (KATV, June 2026).
  - Fans may not bring signs or flags to the finals (Visit Hot Springs 2026 release).
- **County gym names** are now sourced (Sentinel-Record and districts):
  - Trojan Arena (2,200 seats, 2020)
  - Wolf Arena (2,280, 2015–16)
  - Lakeside Athletic Complex (news usage)
  - Irvin J. Bass Gymnasium
  - Eagle Arena
  - Jessieville Sports Arena
  - Red Devil Fieldhouse
- **How the game uses this:**
  - Shown as real: only the arena's tiers, seat color and short end.
  - Generic, labelled as such in How to Play: everything else in the arena (ribbons, video board, floor).
  - Gyms are generic and unnamed while `shared/data/schools.json` marks every venue `venueConfirmed: false`.

## Requests for the coordinator

**Shared data (`shared/data/schools.json`):**
1. Consider the sourced gym names above. If accepted, flip `venueConfirmed` for those schools, and the game can name
   the home gyms. Lakeside's official gym name is still unconfirmed.
2. `venues.basketballFinals`: add the former names (Summit Arena 2003–2014, Bank of the Ozarks Arena 2014–2018) and
   the 6,300 capacity. The research's "Summit Arena unconfirmed" note is now resolved.
3. Facts worth adding to the shared `research/`:
   - the finals hosting history (every year since at least 2009 except 2013) and the contract through 2032
   - the no-signs rule

**Harness (`shared/test-harness/`):**
1. Add an option to launch Chromium on the GPU, e.g. `--gpu`, which adds `--use-angle=d3d11 --ignore-gpu-blocklist`
   (or the platform equivalent). 3D games could then be measured and shot inside the harness instead of with
   game-local tools. `--headed` currently fails here with `spawn UNKNOWN`.
2. Allow a file:// smoke test (an allow-list for the game's own folder), so the offline path can be a harness test.
3. A built-in before/after sheet (`sheets.mjs --compare before:after`). Basketball's `tools/before-after.mjs` is a
   small version of this.

**Lessons for `shared/LESSONS.md`:**
- **Test hooks distort runtime governors.** `step(n)` draws one long frame, so a frame-time governor must ignore
  frames longer than about 0.2 s.
- **A canvas resize clears it.** Apply resolution or tier changes before a render, never after the last one.
- **Classic scripts work offline.** `three.module.min.js` can become a classic script by rewriting its trailing
  `export{…}`, and addons by turning `import … from 'three'` into destructuring
  (`games/basketball/tools/build-vendor.mjs`). That works under file://, unlike ES-module imports.
- **WebGL textures under file:// travel as data URIs** (the Image/decode lesson still holds). GLBs travel as base64
  through `GLTFLoader.parse`.
- **Duplicate bone names across rigs:** `GLTFLoader` renames them (`hand_L_1`), so normalize names after load.

## Assets and licenses

| Asset | Origin | License |
|---|---|---|
| three.js r160.1 core, GLTFLoader, BufferGeometryUtils, SkeletonUtils | npm `three@0.160.1` (`vendor/three-0.160.1/`) | MIT |
| Bebas Neue 400 latin | npm `@fontsource/bebas-neue@5.2.5` (`vendor/bebas-neue-5.2.5/`) | SIL OFL 1.1 |
| Player bodies | `art-src/blender/build_players.py` (original) | MIT (repo) |
| Crowd (5 sheets), pep band, cheer squad, maple tile, block-wall tile | OpenAI image generation through Codex. The prompts asked for original, logo-free figures in flat magenta shirts (recolored per school in a shader) and for seamless tiles. Raw PNGs in `art-src/` are git-ignored; packed WebP in `assets/tex.js` | MIT (repo) |

Rebuild: `node games/basketball/tools/build-vendor.mjs` (only after changing vendored three.js), the Blender script,
then `node games/basketball/tools/pack-assets.mjs`, then `node shared/tools/inline.mjs games/basketball`.
