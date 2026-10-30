# Spa City Hoops: adversarial visual review, M1 (three.js 3D build, capture `m1b`)

Reviewer stance: independent and deliberately harsh. The comparison is against shipped commercial and acclaimed indie basketball games, not against browser prototypes. I have not seen the developer's own assessment.

Inputs reviewed:
- New contact sheets `screenshots/m1b/sheets/desktop-01..03.png` and `mobile-01..02.png`.
- Full-size new frames. Desktop: `v01-title`, `v02-tipoff`, `v03-live`, `v10-close-handler`, `v11-close-center`, `v12-head`, `v20-gather`, `v21-release`, `v22-flight`, `v30-replay`, `v40-arena`, `v41-arena-wide`, `v50-select`, `v51-shootout`. Mobile: `v03-live`, `v21-release`, `v22-flight`, `v30-replay`, `v40-arena`, `v51-shootout`. I also made enlarged crops of the tip-off feet, the meter, the scorer's table, the far hoop and the Hot Streak HUD.
- The previous version: `screenshots/visual-before/sheets/desktop-03..05`, `mobile-02`, and `screenshots/review/visual-before-review.md`.
- Benchmarks: `hoopland-1/2`, `playgrounds2-1/2/3`, `bbclassics-1/3/4`, `nba2k25-1/2`, `nba2k26-1/2`. The rest are covered by `benchmarks/SOURCES.md`.
- `screenshots/m1b/report.json`.

**Capture caveat (important):** every 3D frame was rendered by **SwiftShader at `tier low`** (report.json: "ANGLE ... SwiftShader", "tier low", 46k tris, 89 draw calls). Effects reserved for a higher tier, such as floor gloss, reflections, shadows or post-processing, do not appear in any frame, so I cannot credit them. Phones will often run that low tier, though, so **the low tier is the product for a large share of players** and has to look finished on its own. Before the next review, capture one set on a real GPU at the highest tier as well.

Animation and game feel are inferred from still frames.

---

## 1. Verdict in one paragraph

The 3D rebuild is a real step up in **place**. There is a packed, stepped bleacher crowd, cinderblock gym walls with painted mascot lettering (`v01` LIONS, `v11` WOLVES), a cheer squad and a pep band with sousaphones (`v10`), a stanchion with a shot clock and net, an in-gym vintage scoreboard (`v30`), and a two-tier finals bowl (`v41`). From a distance it finally reads as "a high school gym on game night".

It has paid for that by giving up most of what made the 2D version **playable to look at**:
- The gameplay camera routinely leaves the basket you are shooting at off-screen (`v20`, mobile `v21`/`v22`). It shows neither hoop at the tip (`v02`) and spends 40-50% of the frame on empty near-court wood.
- Players float with no contact shadow.
- Jersey numbers that used to be the game's best readability asset are now specks.
- The ball in flight disappears into the crowd.
- Lighting is uniform. The crowd is as bright as the floor, and dark skin tones crush to silhouettes.
- Up close (`v10`, `v12`) the players are faceless mannequins with mitten hands and helmet hair. They sit next to near-photographic crowd sprites, a jarring style clash that replays will expose.
- The replay camera loses the shooter entirely on mobile (`v30`).
- Menus and title are unchanged.

Net result: atmosphere is up, readability and mobile are down, and the overall score is roughly level. **The single highest-leverage fix is the camera, not more art.**

---

## 2. Scores (1-10)

| Category | Before (2D) | **Now (3D, m1b)** | Best benchmark (reference) | Why |
|---|---|---|---|---|
| Art: players, court, venue | 4 | **5** | 10 NBA 2K26 (stylized: Hoop Land 8, Playgrounds 2 9) | The venue is much better: bleachers, walls, cheer, band, stanchions, bowl. The players are featureless low-poly mannequins, and the crowd's style does not match them. |
| Lighting & materials | 2 | **3** | 10 NBA 2K25 (stylized: Playgrounds 2 8, BB Classics 6) | Players now have form shading, but the floor, crowd and walls are all lit the same. No pools, no house dimming, no gloss and no contact shadows. Dark skin goes black. |
| Animation & game feel (from frames) | 3 | **4** | 10 NBA 2K25/26 (arcade: Playgrounds 2 9, BB Classics 8) | Better poses: a jumper with a leg kick, runs, a defensive stance. A replay system now exists. Arms clip through bodies, no ball trail is visible, and the shot payoff is still small. |
| UI / HUD | 4 | **5** | 8 Hoop Land / 2K25 menus | The score bug is consolidated and centered, with crests, foul pips, and red clock / blue shot clock. The meter is still small, the Hot Streak rack reads as "000000", and the menus are unchanged. |
| Typography | 4 | **5** | 8 Hoop Land | A condensed display face now carries the HUD, the grade word and the replay plate. Menus are still a generic web sans, the Hot Streak HUD uses a third, slab-serif face, and labels are about 9 px. |
| Readability (teams, ball, you, meter) | 6 | **4** ▼ | 9 Hoop Land | **Regression.** Numbers are unreadable at play distance, the ball is lost against the crowd, the hoop is off-screen, the YOU ring sits on a gold crest, and dark skin turns into silhouettes. |
| Mobile (390x844 portrait) | 5 | **4** ▼ | ~8 (no portrait title in set) | The dead band is gone, which is good. The camera is still a cropped landscape broadcast view: no hoop during the shot, and the replay shows a wall and no shooter. |
| Authenticity of setting | 5 | **6** | 10 NBA 2K26 (place identity: Playgrounds 2 9, Hoop Land 8) | The cinderblock gym, folding chairs, pep band, mascot wall lettering and in-gym scoreboard are real HS-gym signals. The real title-year banners are gone from the play view, and the finals arena looks like the home gym from the play camera. |
| **Overall (unweighted)** | **4.1** | **4.5** | ~9 | +0.4. Atmosphere gains are mostly cancelled by readability and mobile losses. |

---

## 3. Regressions vs the 2D version (fix these first; they are self-inflicted)

1. **The target hoop is off-screen during shots on desktop.** In 2D desktop `11c-shot-meter`, `12-three` and `12b-score` the rim was always visible. In 3D `v20-gather` it is not on screen, and in `v21`/`v22` it is clipped at the right edge.
2. **Jersey numbers are unreadable at gameplay distance.** In 2D they were big and white-plated (`10-tipoff`, `11c`). In 3D `v03`, `v21`, `v22` and `v40` they are 4-6 px or absent, and there are no back numbers at all.
3. **No contact shadows.** 2D had (ugly) bases; 3D has nothing, so players float (`v02` crop, `v10`, `v03`).
4. **The ball against the background.** In 2D the in-flight ball crossed the wood and had a floor shadow. In 3D it flies across the crowd band and vanishes (`v21` at about x855 y135, `v22` at about x905 y128, mobile `v21`/`v22`).
5. **Title-year banners are gone from the gameplay view.** They were the strongest local-identity asset ("1932 / 1996 / 1998" in 2D `11c`; still present in the 2D fallback `v60`). None are visible in any 3D gameplay frame.
6. **Mobile replay framing.** Mobile `v30-replay` shows a brick wall, a cheer squad and half a rim, with no shooter visible.

---

## 4. Ranked gap list (most impactful first)

Each item gives what is wrong (with the frame), what the benchmarks do, and a concrete fix. Constraints honored: original art only, offline, 60 fps laptop / 30+ fps phone, rules and meter logic unchanged.

### 1. The gameplay camera frames the wrong things
- **Ours:**
  - `v02-tipoff` shows neither basket.
  - `v20-gather`: the shooter is pinned against the crowd line, the rim is fully off-screen to the right, and the bottom ~45% of the frame (y 500-800) is empty wood.
  - `v21`/`v22`: the rim is a clipped sliver at the right edge.
  - `v40-arena`: the ball handler's feet are cut off by the bottom edge.
  - `v51-shootout`: the shooter is mid-left, the rim is in the top-right corner and the lower half is empty.
  - Overall the camera reads as a fixed-height sideline camera aimed too far toward the near side, with a narrow FOV and a pitch that compresses the play into a thin strip under the crowd.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` always keep the attacking basket roughly a quarter of the way in from the frame edge, with the play spread over the full height. `bbclassics-1.jpg` frames the handler and the rim together. `playgrounds2-1.jpg` and `playgrounds2-2.jpg` frame the shooter and the rim as a pair.
- **Fix (camera composer, presentation only):**
  - Aim the look-at at a weighted target: about 0.45 ball, 0.35 attacking rim, 0.20 centroid of the ten players.
  - Add hard constraints. When the offense is past half court, the attacking rim's screen projection must sit within x 10-90% and y 18-65% of the viewport. The ball must stay inside a 10% safe margin.
  - Lower the pitch to about 28-34° and dolly toward the near sideline so the near sideline line sits on, or just below, the bottom edge, and the far sideline sits about 25% down.
  - Use a vertical FOV of about 38-42° with a critically damped spring and a dead zone.
  - During the shot (gather to make or miss), ease toward the midpoint of the shooter and the rim, with a 10-15% push-in.
  - At the tip, pull wide enough to show the circle with both free-throw lines.
  - Add an automated test: in `visual.test.mjs`, project the ball, the user and the attacking rim for every gameplay shot, and fail if any of them falls outside the safe area. Without this test the problem will come back.

### 2. Portrait mobile is still a cropped landscape broadcast camera
- **Ours:**
  - Mobile `v21-release` and `v22-flight`: no basket on screen during the shot, and the ball is visible only as an orange dot among the folding chairs.
  - Mobile `v03-live`: everything happens in the top 40% of the court view, and y 900-1250 (device px) is bare wood.
  - Mobile `v51-shootout`: the rim is clipped at the right edge.
  - Players are about 65 css px tall.
- **Benchmarks:** none of the set is portrait, but every benchmark keeps the shooter and the target in frame (`hoopland-1`, `bbclassics-1`, `playgrounds2-3`).
- **Fix:** give portrait its own rig. The best use of a tall screen is to put the camera behind the attacking half's top-of-key line, looking toward the basket, so the attack runs *up* the screen with the rim in the top third. This is a camera transform only; the simulation stays the same. Keep the gap-1 safe-area rule (rim inside x 12-88%, y 15-45%). Add an edge arrow toward the rim whenever it is off-screen. The removed dead band is good; use the extra height for this deeper view.

### 3. The shot moment and the ball still have no visual payoff
- **Ours:**
  - Meter: in `v21` it measures about 22x80 css px. It is a dark pill drawn over the dark chairs and bleacher shadow, so it nearly disappears. Its fill is barely visible, and its tick is a small white triangle.
  - Grade word: "EARLY" in pink sits directly on the crowd.
  - Ball in flight: no trail is visible in any frame, even though the test is named "meter, trail and swish". The ball has no outline and is lost against the crowd (desktop `v21`/`v22`, mobile `v21`/`v22`).
  - Makes: no make, net, crowd or camera reaction appears in any frame.
- **Benchmarks:** `playgrounds2-2.jpg` uses a large arc meter on a solid plate, readable at a glance. `playgrounds2-3.jpg` gives the ball a bright glowing trail against a dark sky. `bbclassics-4.jpg` shows a full-width "3 POINTS" slam with a speed streak.
- **Fix:**
  - **Meter:** make it 2x (about 44x150 css desktop, 36x120 mobile). Put it on a light-bordered plate with a drop shadow. Clamp its screen position so it always sits over the floor, never over the crowd band. Show the fill in a bright color and keep the green window lit.
  - **Grade word:** use the display face on a solid plate (team color or neutral dark), 28-36 px.
  - **Ball:** draw it in a final pass with depth test off while in flight or loose. Add an inverted-hull dark outline (about 1.5 px) and a small emissive lift. Add a ribbon trail of 8-10 segments, additive, white to team color, about 0.25 s long. Raise the ball's floor shadow to 0.5 alpha.
  - **Makes:** animate the net, add a rim wobble on misses, a 3-frame crowd "stand" swap, a 120 ms camera punch-in, and a callout plate ("3!", "AND-ONE"). Everything must respect Reduced motion.

### 4. Lighting is flat, and dark skin is crushed
- **Ours:**
  - The floor, crowd, walls and players all sit at the same exposure (`v03`, `v21`, `v40`).
  - No light pools, no house falloff, no vignette.
  - The finals arena (`v41`) is a lit box floating in pure black.
  - Dark skin tones render as near-black silhouettes with no form: defender #53 in `v10`, the foreground head in `v12`, #35 in `v40`, several players in mobile `v40`.
- **Benchmarks:**
  - `nba2k25-2.jpg` and `nba2k26-1.jpg`: a dim house, a hot floor, and strong rim light on skin and jersey, so the eye lands on the player.
  - `nba2k26-2.jpg`: dark skin is readable because of specular and rim light, not raised albedo alone.
  - `bbclassics-1.jpg`: in 2D, it gets most of that effect with bloom and an edge vignette.
- **Fix (all cheap):**
  - **Player shader:** in the toon or Lambert player shader, add a view-space fresnel rim term (warm white, 0.35) and a wrap-diffuse term. Clamp the darkest skin albedo to about sRGB 0.16 luminance so it never reaches black.
  - **Crowd and walls:** multiply the crowd by about 0.6-0.7 in gyms and 0.45 in the arena.
  - **Floor:** bake 3-6 radial light pools into a floor lightmap or a multiply decal under the fixtures.
  - **Gloss:** for the low tier, bake a faint vertical "reflection streak" of the stands into the floor texture so the gloss exists without a planar pass. Use a real reflection only on the high tier.
  - Add a screen vignette on all tiers.

### 5. Players have no contact shadows and float
- **Ours:** no shadow under any player. In the `v02` crop, all ten players stand on clean wood, and the same is true in `v03`, `v10` and `v40`. The yellow user ring is the only thing touching the floor.
- **Benchmarks:** `hoopland-2.jpg` gives every sprite a soft drop shadow. In `playgrounds2-1.jpg`, the shadows anchor the dunker in space.
- **Fix:**
  - Render one InstancedMesh of 11 soft radial-gradient quads (10 players plus the ball), each 0.30-0.40 alpha.
  - Scale each shadow by the player's height above the floor, so it shrinks on jumps. That is a strong depth cue on jump shots.
  - Stretch them slightly away from the key light.
  - Cost: one draw call, all tiers.

### 6. Player identity: numbers, YOU marker and team read
- **Ours:**
  - Numbers are unreadable at gameplay distance (`v03`, `v21`, `v22`) and backs are blank (`v12`).
  - The YOU ring is yellow on Hot Springs' gold-on-black crest (`v02` crop) and nearly vanishes.
  - The YOU chevron overlaps #42's chest (`v02` crop).
  - Teams still separate by white vs navy, which is good, but individual players do not.
- **Benchmarks:** `bbclassics-1.jpg` uses a big numbered pin over the controlled player. `playgrounds2-1.jpg` shows the controlled player's name in the HUD. `nba2k25-1.jpg` puts numbers front and back at high contrast.
- **Fix:**
  - Make the chest and back numbers fill about 55-60% of torso height, in a contrasting trim color, with a 1-texel outline in the jersey atlas.
  - Put the user's number inside the chevron instead of "YOU", and collision-offset it so it never covers another player.
  - Draw the user ring as a white inner and team-color outer double ring, so it reads on any crest.
  - Add a small name plate for the ball handler in the HUD.
  - Add a 1 px team-dark inverted-hull outline on all players, which also separates players in clumps.

### 7. The player models are featureless mannequins, and their style clashes with the crowd
- **Ours:**
  - `v10-close-handler`: the head has no eyes, nose or mouth. Hands are blobs. Limbs are thin uniform cylinders. The defender's hand passes through the handler's arm.
  - `v12-head`: the hair is a flat black disc like a hat brim, wider than the shoulders.
  - The crowd directly behind is semi-photographic painted portraits with detailed faces (`v10`, `v11`, `v30`), so the eye reads the players as placeholders in a real crowd.
  - The gameplay camera hides most of this. Replays (`v30`), celebrations and any future close-ups will not.
- **Benchmarks:** `playgrounds2-1.jpg` and `playgrounds2-2.jpg` keep players and fans in one stylized family: big heads, simple but present faces, chunky hands. `hoopland-2.jpg` uses one pixel style for players, refs, crew and crowd.
- **Fix:** pick one art direction and make both layers obey it.
  - The cheaper path is to **stylize the crowd down**: posterize the atlas to 5-6 tones per sprite, flatten facial detail, and add a 1 px dark outline.
  - At the same time, **lift the players up**:
    - A painted face decal (eyes, brows, nose and mouth shapes; one 128 px atlas cell per skin tone and expression).
    - 6-8 hair meshes with real volume (short, fade, twists, afro, braids, ponytail, bun) replacing the disc.
    - 3-segment mitten-plus-thumb hands.
    - Limbs about 20% thicker with a slight taper.
    - Shoe and sock color variation.
    - A simple arm-vs-body push-out in the IK so hands stop clipping.
  - Keep the head about 10% oversized for readability, following Playgrounds' cue.

### 8. The replay camera loses the subject
- **Ours:**
  - Desktop `v30-replay`: the shooter is a tiny figure at the bottom-left, merged into the crowd. About half the frame is a bare cinderblock wall, and the rim sits right of center.
  - Mobile `v30`: no shooter at all, with the rim half off the right edge.
  - The live score bug and the touch controls stay on screen, so it does not read as a replay.
- **Benchmarks:** `nba2k25-1.jpg` is the reference replay framing: behind and over the shooter's shoulder, shooter in the left third, crowd as a soft backdrop. `playgrounds2-3.jpg` frames the shooter and the ball's arc together.
- **Fix:**
  - Use a scripted 3-shot replay rig:
    - (a) Behind the shooter over the shoulder at release (shooter left third, rim right third).
    - (b) The ball tracked along the arc at 0.5x.
    - (c) Close on the rim and net at the make.
  - Assert in tests that the shooter and the rim both project inside the frame at (a).
  - Add letterbox bars, hide the live HUD and the touch controls, and keep the "REPLAY · THREE" plate (it is good).
  - Portrait version: the camera sits behind the shooter on the shot line, so the shooter is at the bottom and the rim at the top.

### 9. The enclosure still has holes (near side, baselines, black voids)
- **Ours:**
  - At the gameplay camera there is nothing on the near sideline, so the bottom of the frame is just floor (`v03`, `v21`, `v40`).
  - The baseline ends are black: the right side of `v21`/`v22` behind the cheer squad, the right third of `v51` around a huge black stanchion block, and the left of `v10`.
  - The finals arena is a box in black space (`v41`).
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` wrap the floor on all four sides with benches, a scorer's table, camera crew and fans. `nba2k25-1.jpg` has no void anywhere.
- **Fix:**
  - Add a near-side foreground layer, cropped by the bottom edge: the team benches with seated players and coach, the scorer's table backs, a photographer, and a few heads of the front-row crowd. This also fills the empty bottom band from gap 1.
  - Build baseline walls with wall pads, an exit sign and doors, and a lit painted mascot or a "HOME OF THE …" mural.
  - Pad the stanchion base in team color, not black.
  - Arena: add a roof truss with lit fixtures and a center-hung scoreboard, and never render the clear color.

### 10. The title-year banners are missing from play
- **Ours:** none are visible in any 3D gameplay frame (`v03`, `v21`, `v40`), and `v30` shows only a generic "COBRAS" pennant. The sourced banners (1932 / 1996 / 1998, and girls' 1990-2018) were the most authentic thing in the 2D game. They now survive only in the fallback (`v60`).
- **Benchmarks:** `hoopland-2.jpg` puts the team name and logo where the camera always sees them. 2K arenas hang championship banners in every wide shot.
- **Fix:**
  - Hang the real title-year banners on the far wall directly above the top bleacher row, inside the gameplay camera's view after the gap-1 change.
  - Also hang them on the baseline end walls, where replays (`v30`) will show them.
  - Light them with a small spotlight cone decal.
  - Add a test that at least one banner is on-screen in `v03`.

### 11. The state final at Bank OZK Arena still reads as a recolored gym in play
- **Ours:** at the gameplay camera, `v40-arena` is the same crowd strip, the same scorer's table (now reading "STATE FINALS"), and the same wood as `v03`. The only signal is a navy sunburst at center. `v41` shows a promising two-tier bowl and an LED ribbon, but it is unlit, sits in black, and the ribbon is a thin, dim text line.
- **Benchmarks:** `nba2k26-2.jpg` and `nba2k25-2.jpg`: a dark house, a bright LED ribbon, a shot-clock tower, a floor pool of light. `playgrounds2-3.jpg`: lighting palette alone makes a venue feel special.
- **Fix:**
  - **Arena lighting:** house at about 0.45 exposure, the floor under a spotlight pool, the emissive LED ribbon twice as tall with slow scrolling generic copy ("STATE CHAMPIONSHIPS · CLASS 5A · 2026").
  - **Camera:** a slightly higher, wider arena gameplay camera so the upper deck and a center-hung scoreboard silhouette show at the top edge.
  - **Floor and courtside:** a different floor stain, both schools' names on the baselines, and a media row with photographers under each basket.
  - **Finals presentation:** a "STATE FINALS" plate in the score bug.
  - Keep the venue art generic, since the real interior is unconfirmed.

### 12. Text clipping and z-fighting on the scorer's table and apron
- **Ours:**
  - `v03` and the mobile `v03`/`v21`: the apron wordmark is half-hidden behind the "HOT SPRINGS" scorer's table, and fragments of letters peek out below it.
  - `v40` crop: "HOT SPRINGS · ARKANSAS" shows as a sliced band of letter tops above and below the "STATE FINALS" table.
  - `v11`: the "WOLVES" wall lettering is cut by the HUD bar.
- **Benchmarks:** `hoopland-1.jpg` keeps the baseline and apron wordmarks in clear, unobstructed bands.
- **Fix:**
  - Move the far-sideline apron wordmark to the baselines (where `v41` already shows "STATE FINALS"), or pull the table forward so its footprint fully covers the text.
  - Use `polygonOffset` on floor decals.
  - Lower the wall lettering or tighten the HUD (gap 14) so it is never sliced.

### 13. The Hot Streak HUD has unreadable glyphs and truncation
- **Ours:** `v51-shootout` (crop) shows the rack indicator as six hollow rounded boxes that read as "000000" or missing-glyph tofu, next to an unexplained "STEAM". On mobile it truncates to "STE…". "HOT STREAK READY ×1" is set in a slab-serif that matches nothing else.
- **Benchmarks:** `playgrounds2-3.jpg` uses ball icons for rounds (filled vs hollow) and big circular counters. `bbclassics-4.jpg` uses one consistent HUD font.
- **Fix:**
  - Draw the rack as one ball SVG icon per rack slot (six here) (filled when made, hollow when pending, red X when missed).
  - Give the label room, or use a deliberate short form ("STEAM ×2").
  - Use the HUD display face throughout.
  - Add a test that the HUD text contains no "…" at 390 px.

### 14. The score bug is better, but generic and too wide
- **Ours:** the bug is centered, has crests, foul pips, possession arrows, red clock / blue shot clock and a Q4 progress bar (`v40`). These are real improvements. But it is still about 800 px wide on a 1280 desktop, on an opaque full-width dark bar about 80 px tall (10% of the screen). That bar crops wall lettering (`v11`, `v01`). The "FOULS" label is about 9 px, and the bug looks like a generic broadcast bug rather than the vintage gym scoreboard that `v30` already models *in world*.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` use a single compact bug of about 45% width with team-color blocks. `playgrounds2-1.jpg` uses a translucent bar so the scene shows through.
- **Fix:**
  - Shrink the bug to about 520-560 px.
  - Remove the full-width backing bar and float the bug with a soft shadow.
  - Reskin it to match the in-gym scoreboard from `v30`: steel housing, amber bulb digits, team-color name plates.
  - Raise labels to 12 px or more and light a BONUS lamp.
  - This turns a UI bar into a local-identity asset.

### 15. Menus and the title are unchanged web cards
- **Ours:**
  - `v01-title` is the same cream modal as the 2D version, now over a 3D gym.
  - `v50-select` is a dense grid of small bordered cards with 30 px crests and "game colors" pills. The page runs off the bottom of the screen at 1280x800, so the Quarters row is cut.
- **Benchmarks:** `hoopland-4.jpg` uses big color-identity rows with portraits. `nba2k25-4.jpg` uses bold condensed headers on a dark kit.
- **Fix:**
  - Use the 3D scene as the title backdrop: a slow orbit around center court with depth-of-field blur and the home band and cheer squad visible. Move the menu to a dark navy and gold side rail (the dark theme from the earlier review) instead of a centered cream card.
  - Team select: render each school's jersey on the actual 3D model as a turntable thumbnail, use a large crest, and add a two-step flow (Home, then Away) so the screen fits without scrolling.

### 16. The crowd is dense but generic: repetition, wrong colors, everyone at the same brightness
- **Ours:** at 1280 px the same sprites repeat visibly, for example the clapping blonde woman and the man in the orange hoodie (`v11`, `v03`). Shirt colors do not follow the schools. `v03` is Hot Springs (black and gold) against Lakeside (blue and gold), but the crowd is full of hot pink and orange. In `v10`/`v11`, a Lake Hamilton (maroon) home game has a black-and-pink crowd. Every sprite faces the camera at the same scale per row.
- **Benchmarks:** `nba2k25-1.jpg` shows home-color jerseys dominating the stands. `hoopland-2.jpg` tints the student section to the home school's colors.
- **Fix:**
  - Split the stands into home, away and neutral sections.
  - Tint shirt pixels through a mask channel in the atlas, using per-section palettes from the school data.
  - Add per-instance horizontal flip, ±6% scale jitter and ±0.08 luminance jitter to break repetition.
  - Fill the front 3 rows behind the home bench with a student section in home colors (some with painted faces).

### 17. Cheer squad and props are misplaced
- **Ours:** `v22` (crop of the far hoop): the cheer squad stands on the baseline directly behind the backboard and is visible through the glass, which competes with the rim at the most important moment. They stand against a black void. `v51` shows them stacked behind the stanchion.
- **Benchmarks:** `hoopland-1.jpg` places camera crews and fans clear of the hoop silhouette.
- **Fix:** place the cheer squad at the baseline corners, outside the lane extension and at least 2 m behind the end line, and never inside the backboard's screen-space box. The band in the corner (`v10`) is placed correctly; keep it.

### 18. Ball scale is inconsistent at close range
- **Ours:** in `v10` the ball is about 85 px against a head of about 45 px, nearly twice the head width. A real ball is about 1.2x head width. That reads as a beach ball in replays.
- **Benchmarks:** `nba2k26-1.jpg` and `nba2k25-1.jpg` keep true proportions; readability comes from contrast, not scale.
- **Fix:** keep a slight oversize at gameplay distance for readability, and scale the ball down with camera distance (clamped from 1.0x near to about 1.35x far). Let the outline and trail from gap 3 provide the readability instead.

---

## 5. What is now good and must be kept

1. **A dense, stepped 3D crowd** (`v03`, `v11`, `v30`, `v41`). For the first time the gym looks full and loud. Fix its tint and repetition; do not thin it.
2. **Cinderblock walls with a painted stripe and mascot lettering** (`v01` LIONS, `v10`, `v11` WOLVES). This is real Arkansas HS gym DNA.
3. **The pep band with sousaphones and the pom-pom cheer squad** (`v10`, `v12`, `v30`). These are high-authenticity, cheap sprites. Reposition them; keep them.
4. **The in-gym vintage scoreboard** (`v30`: "FOUNTAIN L…", amber digits, FOULS, BONUS, PERIOD). This is the right look; promote it into the HUD (gap 14). Fix its name truncation.
5. **The stanchion with a shot-clock box, a framed glass board and a real net** (`v30`, `v22`). The hoop is finally a landmark object when it is on screen.
6. **The consolidated score bug:** crests, foul pips, possession arrows, red game clock and blue shot clock, the Q4 progress bar (`v40`), and the condensed display face.
7. **The "REPLAY · THREE" plate and the existence of a replay system** (`v30`). The framing is broken; the feature is right.
8. **Per-school floor identity:** center logos, team-color paint (maroon in `v10`/`v11`, black in `v21`) and the "TROJANS" baseline wordmark (`v51`).
9. **The two-tier finals bowl, the ribbon and the "HOT SPRINGS · ARKANSAS" apron** (`v41`). The geometry is a good start; it needs lighting.
10. **Diverse players**, including girls' programs with ponytails and buns (`v40`), and the strong home-white vs dark-away contrast.
11. **Mobile:** the dead band between court and controls is gone (mobile `v03`), and the control cluster (big yellow SHOOT, PASS/STEAL, SWITCH, joystick) and the context reduction in Hot Streak (SHOOT only) are still excellent.
12. **The 2D fallback (`?gl=0`, `v60`)** is intact and still carries the banners. Keep it as the safety net.
13. **Budget discipline:** 1.64 MB download, about 46k tris and 73-89 draw calls even under SwiftShader. Every fix above (blob shadows, outline pass, baked pools, trail ribbon, camera composer) fits inside this budget.

---

## 6. Suggested order of work

1. **Camera composer and portrait rig, with safe-area tests** (gaps 1, 2, 8). This fixes three regressions and most of the mobile score at near-zero art cost.
2. **Contact shadows, ball outline and trail, bigger meter on a plate** (gaps 3, 5).
3. **Lighting pass: fresnel rim, skin floor, crowd dimming, baked pools, vignette** (gap 4).
4. **Numbers, user ring and outline; banners back in view** (gaps 6, 10).
5. **Art-direction unification of players and crowd** (gap 7), then the arena lighting (gap 11) and the enclosure (gap 9).
6. **UI reskin: score bug, Hot Streak, menus** (gaps 13-15).

If items 1-4 land well, I would expect roughly: Readability 7, Mobile 6-7, Lighting 5, Art 6, for an overall of about 6. The cap after that is the character art (gap 7) and the animation vocabulary, which still cannot be judged properly from stills.
