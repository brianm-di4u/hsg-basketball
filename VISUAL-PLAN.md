# VISUAL-PLAN: Spa City Hoops visual overhaul

Baseline: `screenshots/visual-before/` (61/61 tests passed, all 103 shots inspected). The independent review
(`screenshots/review/visual-before-review.md`) scored the game **4.1/10** against about 9 for the benchmarks
(NBA 2K25/2K26, NBA 2K Playgrounds 2, Hoop Land, Basketball Classics; files in `benchmarks/`, git-ignored).

## Direction: full 3D court and players (three.js r160.1), DOM menus, 2D canvas HUD on top

- **3D:** the venue (floor, stands, walls, hoops, scoreboard, lights), the players and the ball, with a broadcast
  camera. The review's top gaps (a strip instead of a room, no lighting, a hairline hoop, tabletop players,
  mush in clumps, no arena identity) all come from the flat oblique projection. A real camera fixes them.
- **Rigged players, not sprites.** The review suggested camera-facing sprites in 4–8 directions as the safer
  choice. We use rigged 3D players anyway, for these reasons:
  - Replays and highlight cameras need true 3D.
  - Team colors are a uniform in a shader, not 7 schools × 2 kits × 8 directions × N poses of recolor masks.
  - The download stays small: one 236 KB GLB holds two body builds.

  The risk it names, rough animation, is handled by procedural, blended poses driven directly by the sim's
  actions (run cycle from speed, dribble, a jump shot in phases, a defensive stance, celebrations), checked in
  frozen-frame screenshots.
- **The 2D canvas stays:**
  - It becomes the HUD layer: shot meter, callouts, YOU marker, off-screen arrows. Shapes are projected from the
    3D camera.
  - It stays the whole renderer as the **fallback** when WebGL is missing or `?gl=0` is set.
  - Rules, AI, sim, saves and tests are unchanged.
- **DOM menus are kept and restyled:**
  - The live 3D gym shows behind them.
  - The scoreboard becomes a vintage-gym board with lamp digits.
  - Callouts move to solid plates.

## Assets

| Asset | Tool | Notes |
|---|---|---|
| Player bodies M and F (19-bone rig, ~4k tris each) | Blender 5.2, `art-src/blender/build_players.py` | Skin-modifier mannequin, distance-based skin weights, baggy shorts, ears and nose. Exported to `art-src/players.glb` and packed as base64 into `assets/players.js` |
| Kit coloring | shader (`onBeforeCompile`) | Skin, jersey, trim, shorts, side stripes, socks and shoes from the rest-pose position: crisp lines, one draw call per player |
| Hair (6 styles), jersey numbers (front and back) | three.js primitives and canvas textures | Numbers parented to the chest bone |
| Ball | three.js sphere and canvas seam texture | Trail on shots |
| Hoop: glass board, rim, padded stanchion, animated net, shot-clock box | three.js | Net vertices swing on a swish |
| Floor | Codex seamless maple tile + canvas lines, paint, center crest, mascot wordmarks | Planar reflection (render target, players and hoops only) plus a roughness blur |
| Crowd and band | Codex painted sprite sheets (magenta shirts recolored per school in the shader) | Instanced quads, one draw call, bob on cheers |
| Home gym | three.js: wood bleachers, painted block walls, steel truss ceiling, light fixtures, title pennants, wall scoreboard | Pennants only for real title years (unchanged rule) |
| Finals arena | three.js: two-tier bowl, center-hung board, LED ribbon, house lights down | Generic modern arena; only facts confirmed in `research/venues.md` are shown |
| Wall texture | Codex seamless painted block tile | |

## Research additions

`research/venues.md`: Bank OZK Arena and county gyms, each fact with a source and a confidence level. The
arena stays generic unless a detail is confirmed. Gym names stay unnamed while `venueConfirmed` is false.

## Performance plan

- **Targets:** 60 fps on a mid laptop at 1280×800, 30+ fps on phones.
- **Quality tiers** (auto-selected from the viewport and GPU, overridable in Settings → Graphics):
  - **High:** DPR ≤ 2, reflection at 0.5×, 1024 px shadow map.
  - **Medium (phones):** DPR ≤ 1.5, reflection at 0.33×, blob shadows.
  - **Low:** no reflection, no real-time shadows.
  - **2D:** the classic renderer.
- **Draw calls:**
  - The crowd is one instanced mesh.
  - Static venue geometry is merged per material.
  - There are 10 skinned players.
- **Render on demand:** menus render one frame per change (the title keeps its slow camera drift).
- **Progressive loading:**
  - `index.html` (game and 2D renderer, ~250 KB) paints the menus at once.
  - `vendor/three.bundle.js` (799 KB) and `assets/*.js` (models and textures as base64) load next with
    `<script>` tags. This works under file://.
  - The 3D view fades in when ready. `isIdle()` stays false while loading, so shots never catch the switch.
- **Download target:** under 2.5 MB total.

## Test plan

- **Existing suite:** all 61 tests keep passing at both viewports (in 3D mode by default).
- **New `visual.test.mjs`:**
  - 3D boot (renderer `webgl` and assets ready).
  - No external requests.
  - The fallback `?gl=0` renders the 2D court.
  - Screenshots of the home gym, the arena final, close camera frames of players in each action pose, a frozen
    shot with meter and trail, a replay frame, and title, menus and bracket at both viewports.
- **Perf test:** fps in a live 10-player match at both viewports, heap, total download size.
- **file:// check:** a test loads `file:///.../index.html` and asserts the 3D renderer started.
- **Review:** after each milestone, a fresh adversarial review on new screenshots against the same benchmarks.

## Milestones

1. **M1:** three.js boot and fallback; the home gym; players with the kit shader and procedural animation; ball
   and hoops; the broadcast camera at both aspect ratios; HUD projection.
2. **M2:** reflections and shadows; the crowd sprites and band; the arena final; the scoreboard and callout
   restyle; the shot payoff (trail, net, crowd pop, big grade words).
3. **M3:** replays and highlight camera (dunks, threes, buzzer-beaters); menu and title polish; champion sequence.
4. **M4:** performance pass, quality tiers, fallback test; close-out.
