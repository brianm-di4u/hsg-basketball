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

## Player art direction (user, 2026-10-29)
The user named TurboSquid 1926052, "3D Basketball Player", as the quality target for the HQ players:
https://www.turbosquid.com/3d-models/3d-basketball-player-3d-model-1926052

It's a paid asset: reference only, not bought, downloaded or copied. What it shows is a stylized,
animated-film athlete:
- large expressive eyes with catchlights; a defined nose, ears and brows
- smooth skin with a soft sheen; hair sculpted in clumps
- fully modeled five-finger hands
- a jersey and shorts with piped collar and armholes and side-panel stripes; wristbands; detailed sneakers

M4 builds originals toward that from MPFB2 bases, and the panel's M4 Art judgement uses this description.

## M2 result: closed on the plateau rule
| Round | Overall | Blockers |
|---|---|---|
| r1 | 6.5 | 4 |
| r2 | 6.6 | 3 |
| r3 | 6.6 (+0.06) | 4 |

r3's gain was under 0.2, so M2 closed by the stop rule.
- **Met:** Lighting 6.5, UI 7.0, Animation 6.5.
- **Missed:** overall (6.6 vs 7.0) and Readability (7.0 vs 7.5).
- **Carried forward:** shot-camera and portrait framing for Readability, Hot Streak dressing, desktop title
  banners (the HQ venue's walls), and net strand shading.

r3's four blockers are fixed in the next round, v3-m3-r1:
1. the mobile card margin (top-band first, 30 px pad)
2. mobile Select (pinned footer with a "More options below" cue)
3. the early replay beat (0.5)
4. dark skin rendering as black silhouettes

The fourth was a real bug: `players3d.js col()` converted sRGB to linear twice (`Color.set()` already
linearizes in r186), crushing dark skin to black and darkening every kit color. The same bug was in the crowd
tints, fixed earlier.

Also found and fixed: an M2r1 edit had commented out the end-wall wainscot mid-line, so it never rendered.

## M3 (in progress): HQ baked venue
- **Blender** (`art-src/blender/venue/build_gym.py`): the shared gym shell is built, its lightmaps baked with
  Cycles OptiX on the RTX 5060 (1024 samples, 2048², about 2 min), and exported as a GLB with `LM` → `uv1`.
- **`tools/build-hq.mjs`:** hashed, written to `assets/hq` with the manifest. Lightmaps ship as WebP (0.78 MB
  total, high and medium tiers).
  - KTX2 encoding works (`tools/ktx.mjs`, libktx wasm), but BC7 sampled black in early tests.
  - The real cause turned out to be `mergeStatic()` stripping `uv1`; KTX2 can come back for detail textures.
- **Runtime:**
  - `venue-hq.js` dresses the shell per school: MeshBasic materials with school tints × lightmap; the floor
    keeps its live material with the baked light as a multiplier.
  - Exposure is calibrated by probe: floorY about 0.27, against 0.21 lite.
  - `scene3d.ensureVenue` swaps lite → HQ at a dead ball.
- **Perf** (v3-m3-r1, uncapped): desktop 552-632 fps, mobile 920 fps.

## M3 round 1 → round 2 (2026-10-30)
- **v3-m3-r1 Arbiter: 6.7, 4 blockers.**
  1. the mobile card margin and the desktop "+3"
  2. menu footers
  3. replay beats
  4. appearance mix: the color fix changed the look of players' skin and hair families

  None of the M3 targets was met (Lighting 7.0/7.5, Art 6.5/7.2, Authenticity 6.5/7.2, overall 6.7/7.4).
- **Round 2:**
  - **Venue:** 8 bleacher rows, so the banner wall shows in desktop play; banners just above the stands.
  - **Light:** lamps on drops at 46 ft give the bake real pools; neutral light; paint keeps every channel.
  - **Walls:** the wall texture is back on the shell; the arena is baked too (`--kind arena`); double-sided
    enclosing planes.
  - **Players:** skin and hair keep their families (half-way tone mapping); the faint rim light is back.
  - **Replay:** occluders between the camera and the shooter are culled.
  - **Card:** shrinks and re-places itself when no slot is clear.
  - **Menus:** opaque setup footer; the cue only on setup screens.
  - **Glass:** clearcoat.
- **Gates 51/52.** The remaining miss is mobile c09 voids at 5.4%: the arena's dark apron beyond the far
  baseline, house lights down by design. Left for the panel.
- **M4 prep:** MPFB 2.0.18 (GPL tool, CC0 output) was downloaded from extensions.blender.org; the sha256
  matches. It's in `tools/dev/mpfb` (ignored). It loads headless as a session-only extension repo
  (`tools/dev/mpfb/test_load.py`), and nothing is saved to the user's Blender prefs. It bundles `base.obj`,
  1,258 targets and the game_engine rig; eyes, hair and clothes will be our own meshes (stylized, toward the
  user's reference).

## M3 result: closed on the plateau rule (r1 6.7, r2 6.5, a -0.19 change)
Most of r2's loss was two regressions, both fixed after the verdict:
- **Skin:** `colLook` read `new THREE.Color(hex)` components, which are already linear, and converted them again.
  It now reads the sRGB components (`getRGB(..., SRGBColorSpace)`). Skin takes its true tone; hair goes half way
  toward the old look, so black hair stays black. Player fill rose 0.18 → 0.3. Verified on the c15 referee:
  features visible, warm brown.
- **Crowd exposure:** gyms 0.54 → 0.46, arena 0.36 → 0.34. Floor/crowd is back to 2.8-3.4.

**Carried forward from M3** (the M3 verdicts list them with pass tests):
- light pools that read as pools, not a vignette, and bloom on emitters
- an arena roof with a lamp ring and a brighter court
- the wall over at least 15% of the live frame; girls'-program banners
- replay walls; blue-channel clipping on saturated paint (ACES)
- the mobile card margin (7.5 px of 16) and the mobile Select footer
- replay beats: c17 fires late; c08 draws the ball in front of the rim

**Where the campaign stands after M0-M3:**
| Point | Overall |
|---|---|
| Baseline | 6.1 |
| M2 best | 6.6 |
| M3 r1 | 6.7 |

Every verdict ranks the same gap as the largest: the players (mannequins) and their animation, then the photo
crowd's style clash. Those are M4-M6.

## M4 result: closed on the plateau rule (r1 6.6, r2 6.6)
- **Built:** HQ players from MPFB 2 / MakeHuman (CC0 output). `art-src/blender/players/build_bodies_hq.py` makes M
  and F athletes:
  - stylized, larger head and eyes; modelled nose, ears and lips; five-finger hands
  - a game_engine rig renamed to the runtime's 19 bones, with the A-pose applied as rest
  - garment shells; procedural sneakers per foot (MakeHuman's toes are separate tubes no shell can cover)
  - a hair cap

  The `players-hq` package (2.3 MB) streams in and swaps every player at a dead ball.
- **Shader (`kit3`)** cuts every visible edge per pixel as a smooth curve: neckline, armholes, hems with
  piping, shorts side panels, wristbands, socks, the sole and midsole, the hairline and headband. It also
  draws:
  - per-character brows, lids, lips
  - eyes with iris ring, pupil and catchlight
  - officials in striped sleeves, slacks and black socks
- **Skin:** a 3D tone ramp keeps the roster's tone classes and gives dark skin real blue.
- **Panel:** every reviewer credits real characters (faces, hands, piping). The scores held at 6.6, held down by
  procedural animation (M5), the photo crowd's style clash (M6) and the venue gaps carried from M3.
- **Fixed after the r2 verdict:** sneakers (no toe ridges; smooth toe box, sole, collar); socks painted per
  pixel; officials' socks black.
- **Carried forward:**
  - skin: the tone of the player you control and the referees' hue
  - hair: tapered sculpted styles in place of the primitive buns and cylinders
  - eyes: the "expressive eyes" scale
  - officials: a body preset, so no shorts silhouette over slacks
  - the close-camera foreground hand; the mobile card margin (12 of 32 device px)
  - spacing in player clumps

## M5: animation
- **Sources:** 20 CMU mocap takes (BVH, Hahne 2010 conversion; free for any use, credited in
  `art-src/anim/SOURCES.md`), fetched into the ignored `art-src/anim/cmu/`.
- **Retarget** (`art-src/blender/anim/retarget_cmu.py`, Blender headless on `players-hq.blend`): per bone and
  frame, the performer's world change with the take's smoothed heading removed, corrected from their T-pose to our
  A-pose rest direction, then made local (Δ = T(parent)⁻¹ · T(bone)). Stored in the runtime's own pose space (turns
  in the character frame on top of rest), so the same data drives the HQ bodies and the lite mannequins. Loops are
  closed by spreading the seam error over the cycle. Hips height and foot contacts come with each clip.
- **Clips:** CMU jog, run, defensive slide (legs), dribble and crossover (upper body), jump shot (legs, trunk,
  timing), jump (block base). Keyed (`art-src/anim/keyed.mjs`): idle, defensive stance, layup, one- and two-hand
  dunks, chest pass, steal, block arms, jump-shot arms (the CMU performer shot a set shot from the chin),
  3 celebrations. 20 clips, 98 KB in the streamed `anims` package.
- **Runtime:** `anim-mixer.js` (stance ↔ jog ↔ run by speed with one stride phase, slide mirrored by direction,
  dribble layer timed to the sim's bounce, crossover on cut-backs, one-shots timed by the shot meter to the release
  then real time, crossfades 0.12-0.15 s); procedural layers kept for defensive hands, the two-hand hold and the
  head turned to the ball; finger curl and grip on HQ hands; the ball seated in the right palm. `ik.js`: two-bone
  leg IK holds planted feet (horizontal lock, the clip's heel height) and keeps feet out of the floor.
- **Replays:** snapshots now carry `actT`, `stype` and the bounce phase; replays and close-ups get depth of field
  focused on the shooter, a camera-motion blur rebuilt from depth (high, cut-aware) and a vignette.
- **Gates** (`tests/anim.test.mjs`, GPU): clips load and drive players; foot-lock residual 0 cm (< 4); ball in
  the palm < 6 cm; a drive plays a layup or dunk clip; the procedural fallback renders; mixer 0.67 ms per frame for
  12 players at 4× CPU throttle (≤ 1.5).
- **Tools:** `tools/build-anims.mjs` (also run by build-hq), `tests/animlab.test.mjs` (pose sheets per clip),
  `tools/strip.mjs` (burst strips cropped to one player).

## M5 result: closed on the plateau rule (r1 6.8, +0.125; r2 6.8, +0.06)
- **r1** (verdict `review/v3-m5-r1.md`): Animation 6.5 → 7, the first category move since M2. The jumper (gather,
  set point, release, held follow-through, landing) and the run cycle with a floor dribble cleared the 7 anchor.
  10 blockers, mostly new: the dunk through the rim, a rigid net, officials in a bind pose, the dribble hiding
  the ball, shoulder piping wings, floating buns, replay blur on the subject, c14/c21 cameras, a SLAM DUNK
  callout on a three, the mobile dunk camera.
- **r2** (verdict `review/v3-m5-r2.md`): five blockers closed (dribble, officials, buns, callout, mobile dunk
  camera); Readability 6.5 → 7. Found and fixed in the round: the mocap heading was read from the hip bone's
  own axis (up), so the clips turned the whole body (c21 showed backs of heads); replay IK kept old foot locks
  across cuts (a shooter drawn sitting).
- **After the r2 verdict (not yet scored):** the net's stretch spring raised (+33% impulse) with a hem flare.
- **Carried forward** (the r2 verdict has the pass tests):
  - the dunk: the ball hovers above the ring 3 frames; a rim hang and a landing in the burst
  - the net stretch at 15% with a hem flare (raised after the verdict, unverified)
  - piping off the body in close cameras (c21, c17, mobile c21)
  - the c17 beat (now at the gather, wanted 3-4 ticks before release); c14 voidPct 15 (< 5)
  - the jumper's ground load and a landing compression; follow-through holds 18-24 ticks
  - lockstep off-ball defenders (c19); YOU's hand on the handler's forehead (c19)
  - the mobile c06 card margin (now about 4 device px); mobile jumper ball contrast 1.99 (gate 2.0)
  - all M4 and M3 carried items
- **Perf:** desktop live about 305 fps uncapped (was about 570 before M5; the mixer and IK cost about 1 ms of
  script per frame), mobile 475; inside the budgets (≥ 180 / ≥ 300). Mixer 0.75 ms per frame for 12 players
  at 4× CPU throttle.

| Point | Overall |
|---|---|
| Baseline | 6.1 |
| M2 best | 6.6 |
| M3 r1 | 6.7 |
| M4 | 6.6 |
| M5 | 6.8 |
