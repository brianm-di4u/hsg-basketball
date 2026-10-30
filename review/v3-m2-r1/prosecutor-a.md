# v3-m2-r1: Prosecutor A (art, lighting, setting)

**Stance:** harsh. The yardstick is the benchmark sheets (`benchmarks-01` Hoop Land / Basketball Classics, `benchmarks-04` Playgrounds 2 and 2K27), not "good for a browser game".

**What I read:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, and `{PREV}` = `review/v3-m0-r1.md`
- All 7 contact sheets
- Full-size desktop stills: c01, c02, c05, c06, c07, c08, c09, c10, c11, c12, c13, c14, c15, c16, c18, c21, c22. Full-size mobile stills: c02, c06, c09, c11, c18, c21.
- Bursts: desktop jumper, drive, make-wide, net-close and open-play; mobile make-wide and drive
- `probe/probe.json`
- Benchmark sheets 01 and 04
- My own 2-4x zooms of c02 (paint, bench, crowd, reference/table), c05 (ball), c06 (rim, players), c08 (scoreboard, crowd edge), c16 (YOU group, ball group), c18 (rim), mobile c02 and c11, make-wide f05, and open-play f13/f14. I also measured mean HSV per tile on open-play.

**Packet limit:** the tool returned only `before-after/mobile-08.png` (c22 pause) as an image. The other 18 before/after pairs did not render for me. So I judge change against the coordinates and descriptions in `{PREV}`, not against side-by-side pairs. The webm video and sound are not reviewed or scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **6** | **Better:** the enclosure. The stanchion pads are now school-colour orange with a lit top (c18 x 850-1280, y 490-800; c07 x 985-1170, y 440-590). The replay wall now has brick, a scoreboard and a COBRAS banner instead of a void (c08). The arena apron is purple with a STATE FINALS table (c09 x 560-1260, y 270-315). **Unchanged, and this is the core 7-anchor miss:** the athletes are still mannequins. c21 has a dot eye, a brow, no nose, a mitten paddle hand (x 1050-1130, y 640-770) and tube arms. Near-plane clipping is still there (the blurry sausage limb at c21 x 0-300, y 160-430). **New:** a white jersey shard with "53" pokes through the arm (c21 x 405-520, y 385-570; mobile c21 x 55-200, y 690-1050). The photographic crowd now fills about 45% of every desktop gameplay frame (c02 y 0-380, c11 y 0-400) and shows obvious repeats (see defect 2). |
| Lighting & materials | **6.5** | **Credit:** the floor-reflection wisps are gone. I found none in 2x zooms of c02 (x 140-820, y 370-740) or c16 (x 920-1280, y 320-760), or under the white jerseys in mobile c02. Emissive bloom now shows on the scoreboard and shot clocks (c08 x 440-780, y 85-245; c06 "34" at x 1025-1055, y 290-320). There is a corner vignette (c02, c16), and the glass now reads as glass (c06 x 975-1055, y 285-540). The hierarchy holds: `floorCrowd` 3.06-3.64 on desktop gameplay. **Against:** still no key or rim light on the players; c02 players are flat-shaded tubes (zoom of x 140-820, y 370-740). The ghost disc survives as a pale halo around the ball in the net (c18 x 570-710, y 240-380, about 140 px of disc for a 109 px ball; mobile c18 x 290-490, y 485-685). A dark radial smudge follows the ball across the wood (make-wide f03-f06). The grade drops visibly in one frame (open-play f13 to f14). Skin, cloth and wood still share one material response (c21). |
| Animation & game feel | **6** | **Credit:** the rim now flashes cream on the make (net-close f00-f03, then back to red from f04; c18 rim x 525-755, y 185-225), and the ball visibly exits the net (net-close f04-f11). **Against:** the c07 airball still draws a raised-arms baseline crowd (x 1000-1250, y 230-480). The jumper is the same stiff release (jumper f08-f17, the shooter barely changes silhouette). Not my lens; I defer to B on detail. |
| UI / HUD | **6.5** | **Better:** the front end is now navy-and-gold panels with gold primary buttons (c01, c13, c22; before-after mobile-08 confirms cream to navy). The "+3" now floats above the board on both viewports (c06 x 915-1000, y 185-245, board top about 285; mobile c06 x 365-455, y 287-350, board from y 365). **Against:** c13 still cuts off the Quarters row at the bottom edge (y 770-800). The c14 champion card sits under a stale live bug reading "Q1 1:58, 0-0, HSHS v LHHS" (x 360-920, y 10-85) for a state-final win. The slam crosses players as play resumes (make-wide f09-f12). |
| Typography | **6** | **Better:** the menus now use the condensed display face for headings and buttons (c01 "HOOPS", c22 "PAUSED", button labels). **Against:** the desktop bug "FOULS" is still about 8-9 px cap height (c02 x 413-457, y 60-70). The in-world scoreboard collides "FOULS" into "BONUS" and truncates team names to "FOUNTAIN L" / "MOUNTAIN P" (c08 x 460-780, y 95-215). The c13 card meta ("black & gold", "game colors") is small. |
| Readability | **6.5** | **Closed:** ball contrast. The airborne ball has a dark outline (c05 zoom of x 610-740, y 100-190), and `ballContrast` reads 5.02 at c04/c05 (was 1.10/1.16); the desktop jumper burst minimum is 4.23. Desktop `emptyFgPct` is 9-12.5 on c02, c05, c06 and c09 (was 44-51). **Open:** paint clumps still merge (c02 x 160-420, y 400-720; mobile c02 x 230-560, y 870-1220). The c16 ball group merges two blue players and the ball (x 540-650, y 410-620). Desktop drive `handlerInBandPct` is 40. |
| Mobile portrait | **7** | **Closed:** the near-hoop box is gone (mobile c02 shows clean paint). `playerPx` is 80-88 on c02-c07 (was 47-58). The "+3" clears the rim. **Against:** the mobile drive leaves the shooter in the top third with bare wood below (burst `emptyFgMean` 36.8; drive f06-f15). c11 is still 53.5 px and c16 is 68.7 px with `emptyFgPct` 37. Mobile renders with visible pixel stair-steps (zoom of mobile c11 x 300-500, y 800-1110: the ring, ball outline and chevron edges; mobile c21 head and arm edges). |
| Authenticity of setting | **6.5** | **Better:** a STATE FINALS scorer's table and purple apron in the arena (c09; mobile c09 sideline "STATE FINALS" x 0-60, y 560-700). Mobile banners hold ("BOYS STATE CHAMPS", mobile c06 x 0-235, y 140-225). Stanchion pads are in team colour. Per-school floors and wordmarks remain (c10 JESSIEVILLE, c11 MOUNTAIN PINE). **Still missing:** no title banner in any desktop gameplay still (c02, c05, c06, c07, c09, c10, c11, c16). The benches hold street-clothes spectators on chairs, not a team or coach (c02 x 505-840, y 295-355; c15 x 20-420, y 300-470). The Hot Springs crowd still reads orange and black, not gold (c02 crowd). The Jessieville crowd reads navy, not purple (c10). |
| **Overall** | **6.4** | (6 + 6.5 + 6 + 6.5 + 6 + 6.5 + 7 + 6.5) / 8 = 51 / 8 = 6.375 |

**Probe notes:**
- `floorCrowd` on c08, c17 and c15 (0.69-1.0) measures replay or close-camera framing, not hierarchy. Ignore it.
- Mobile c08/c17 `ballContrast` 1.0 is the ball cropped into the letterbox, not a flight measurement.
- Desktop c11 `playerPx` 207.1 is a two-player close framing (8 players off screen); it does not show the camera holds 10 players at that size.

---

## 2. Defects, ranked by how often a player sees them

### 1. The photographic crowd fills almost half of every desktop gameplay frame and clashes with the toon athletes
- **Seen:** in every desktop live frame.
- **Evidence:**
  - The crowd band runs y 0-380 in c02, y 0-450 in c06, y 0-400 in c11 and y 0-260 in c09.
  - Photo-real faces sit beside unlit, noseless tube players (c21: crowd at x 900-1280, y 90-290, next to the #12 face at x 670-800, y 100-280). The same clash is in c15.
  - The lower camera fixed the empty foreground by tilting more of this crowd into view. That amplifies the style clash `{PREV}` upheld.
- **Benchmark gap:** in Playgrounds 2 and Hoop Land the crowd shares the players' rendering (`benchmarks-04` playgrounds2-2; `benchmarks-01` hoopland-1/2).
- **Fix:**
  - Posterize the crowd sprites to 4-5 tones with a 1-2 px dark outline, and desaturate them 20-30% so they sit behind the court.
  - Or replace them with toon-rendered billboards from the player rig.
  - Cap the crowd at 35% of frame height on the desktop live camera.

### 2. Repeated crowd sprites
- **Seen:** in every frame with crowd.
- **Evidence:**
  - In my 2x zoom of c02 x 380-1000, y 90-300, the same blonde woman in an orange top, clapping in the same pose, appears at least 6 times, twice in adjacent seats.
  - The same raised-fist man in a black tee repeats across rows.
  - The same pattern shows in c06, c11 and c16.
- **Fix:** a seeded shuffle that forbids the same sprite within 3 seats in a row or column. Add per-instance hue and value jitter (±8%) and a horizontal mirror on half the instances.

### 3. The athletes are still mannequins
- **Seen:** in every frame; dominant in c15, c16, c18 and c21.
- **Evidence:**
  - **Hands:** the c21 hands are paddles (x 1050-1130, y 640-770).
  - **Faces:** a dot eye, a brow and no nose (c21 x 430-560, y 160-290; mobile c21 x 90-300, y 300-500). Gameplay faces are blank at 140-180 px (c02 zoom: #3 x 255-300, y 500-530; c16 zoom: #12 and #14).
  - **Limbs:** tube arms with no elbow or wrist read (c06 zoom of x 0-360, y 430-760; c16 zoom).
- **Benchmark gap:** `benchmarks-04` playgrounds2-1/2. Distinct heads, shoes and hands read at gameplay size.
- **Fix:** as `{PREV}` fix 3:
  - **Hands:** 3-segment hands with a thumb.
  - **Faces:** a nose and mouth in the face decal.
  - **Limbs and kit:** tapered limbs with elbow and knee breaks, and shoes with a contrasting sole.
  - **Hair:** 6-8 hair meshes.
  - **Close cameras:** until that lands, keep them at waist-up or wider (c21 is a hip-up two-shot and exposes everything).

### 4. Body and cloth interpenetration, and near-plane clipping
- **Seen:** in close cameras and clumps.
- **Evidence:**
  - A white jersey shard carrying "53" pokes out through the #53 arm (c21 x 405-520, y 385-570; mobile c21 x 55-200, y 690-1050).
  - The out-of-focus foreground limb fills the left third (c21 x 0-300, y 160-430).
  - Clumped bodies merge into one mass (c02 x 160-420, y 400-720; mobile c02 x 380-560, y 1020-1220).
- **Fix:**
  - **Jersey:** draw the number decal on the torso shader, not a separate quad, or bind it to the chest bone.
  - **Near plane:** hide any mesh within 0.4 m of the camera.
  - **Close cameras:** add capsule separation (about 0.35 m) for players in the close-camera selection.

### 5. Ghost disc and dark smudge around the ball on the make
- **Seen:** on every make.
- **Evidence:**
  - **Ghost disc:** a pale halo disc wider than the ball sits inside the net (c18 x 570-710, y 240-380; mobile c18 x 290-490, y 485-685; net-close f00-f03). It is one disc now, not the 4-5 that `{PREV}` saw. **Blocker 2 is partly fixed.**
  - **Smudge:** the screen-space dim meant for the crowd behind the ball also paints a dark radial blob on the wood around the rolling ball (make-wide f03-f06; zoom of f05 shows about a 60 px dark smudge on the floor).
- **Fix:**
  - **Disc:** remove the remaining trail or halo sprite once the ball is below the rim plane.
  - **Smudge:** only apply the dim when the ball's screen position sits over the crowd mask (above the projected court edge), and fade it out over 100 ms when the ball goes below the rim.

### 6. A grade or quality pop mid-play
- **Seen:** in open play, once per occurrence.
- **Evidence:**
  - Between open-play f13 and f14 (4 ticks apart), my measurement of the tile's mean saturation falls 175 to 154 and its value 104 to 94. Lower-half luma falls 110 to 96, and both hold through f15.
  - The f14 crowd is visibly softer (my 4x zoom of the f13/f14 crowd strip).
  - It reads as a tier or post-processing switch, not a camera move.
  - The packet cannot show the cause.
- **Fix:**
  - If an adaptive quality tier is stepping down, cross-fade grade and bloom over 0.5 s, or switch tiers only at dead balls.
  - Lock the colour grade across tiers so that only resolution changes.

### 7. Mobile aliasing and sub-native resolution
- **Seen:** in every mobile frame.
- **Evidence:**
  - Pixel stair-steps on the YOU ring, ball outline and chevron (mobile c11 zoom of x 300-500, y 800-1110).
  - Jagged head, jersey and arm edges (mobile c21 x 100-300, y 300-400; x 340-480, y 560-700).
  - Crowd alpha edges are hard and stepped (mobile c18).
- **Fix:**
  - Render at 1.5x DPR minimum on capable phones, with FXAA or SMAA after tonemapping.
  - Use alpha-to-coverage, or premultiplied alpha with 1 px dilation, on crowd sprites.

### 8. Crowd sprite alpha fringes
- **Seen:** in close and replay cameras.
- **Evidence:** jagged pale fringes trace the cut-out people (c08 zoom of x 380-640, y 590-750, around the black-hoodie fan and raised arms). There are dark halos around the cheerleaders in c02 (x 260-400, y 280-370).
- **Fix:** same as defect 7 (premultiplied alpha plus edge dilation), and mip-biased sampling on the crowd atlas.

### 9. No team benches and no desktop title banners: the set still reads generic
- **Seen:** in every desktop live frame.
- **Evidence:**
  - **Benches:** street-clothes spectators sit on the bench chairs (c02 x 505-840, y 295-355; c10 x 510-830, y 280-335; c15 x 20-420, y 300-470), and the remaining chairs are empty (c15 x 420-650, y 305-520; c09 x 360-560, y 258-310).
  - **Banners:** there is no title banner in any desktop live still. The only hints are a cropped red band at the top-right edge (c06 x 1165-1280, y 25-70) and on the right wall in c07 (x 1030-1280, y 30-150).
- **Fix:**
  - **Benches:** 5 seated players in warm-ups plus a standing coach per team, in school colours, in the chair rows.
  - **Banners:** hang 3-5 title banners on the far wall above the top visible row of the desktop live camera, as mobile already does.

### 10. School palettes are off
- **Seen:** in every home-gym frame.
- **Evidence:** the Hot Springs (black and gold, per c13) crowd is orange and black (c02 crowd). The Jessieville (purple and gold) crowd is navy and ochre (c10).
- **Fix:** map crowd shirt tints from the same palette table the select screen uses, gold as #D4A017-ish, not orange. Purple must read purple at crowd luminance (raise saturation for the dim house).

### 11. In-world scoreboard and replay framing
- **Seen:** on every replay.
- **Evidence:**
  - "FOULS" runs into "BONUS" on both sides, and the names truncate to "FOUNTAIN L" / "MOUNTAIN P" (c08 x 460-780, y 95-215).
  - The ball is cut in half by the top letterbox (c08 x 395-460, y 55-80).
- **Fix:**
  - **Scoreboard:** use school abbreviations (FL / MP) or a condensed face sized to the panel, and move BONUS below FOULS.
  - **Replay ball:** frame the replay so the ball stays at least 40 px inside the letterbox.

### 12. Stale bug on the champion screen
- **Seen:** at the end of every season win.
- **Evidence:** c14 shows "Q1 1:58, HSHS 0, LHHS 0" (x 360-920, y 10-85) above the "State Champions" card that cites a state final.
- **Fix:** hide the live bug on the champion and summary screens, or show the final score.

---

## 3. Regressions and status of `{PREV}` items

**Regressions (new since v3-m0-r1):**
1. **Crowd share of the live frame grew** (defect 1). The fix for empty foreground pitched the camera so the photo crowd now takes about 45% of the frame (c02 y 0-380). `{PREV}` keep item 6 (player size) is honoured (`playerPx` 141-207), but the style clash is now larger on screen.
2. **Floor smudge around the ball** (defect 5; make-wide f03-f06). It is new with the ball-dim feature.
3. **Grade pop in open play** (defect 6; open-play f13 to f14). It was not present in `{PREV}`'s evidence.
4. **Jersey shard clipping in c21** (defect 4). `{PREV}` did not list it; it may be pose-dependent.

**`{PREV}` blockers:**

| Blocker | Status | Evidence |
|---|---|---|
| 1. Floor-reflection wisps | **Closed** | None found in 2x zooms of c02, c16 and mobile c02, or on the c09 apron (now purple). |
| 2. Ghost discs over the rim | **Partly** | One pale halo disc remains around the ball in the net (c18 x 570-710, y 240-380; mobile c18; net-close f00-f03). It was 4-5 discs. |
| 3. Mobile near-hoop box | **Closed** | Mobile c02 paint is clean (x 260-760, y 1010-1300). |
| 4. Callouts on the rim or ball, orphaned "+3" | **Mostly closed** | The "+3" sits above the board (c06, mobile c06); c16 has no orphan. The slam still crosses players in make-wide f09-f12 (B's lens). |

**`{PREV}` ranked fixes (my lens in detail; others briefly):**

| Fix | Status | Evidence |
|---|---|---|
| 1. Render artifacts | **Partly** | See blockers 1-3. New smudge (defect 5). |
| 2. Desktop camera | **Mostly closed** | `emptyFgPct` 9-12.5 (c02, c05, c06, c09), down from 44-51. The c03/c04 gather and release still sit at 26.9, and the drive burst `handlerInBandPct` is 40. |
| 3. Character models, one art style | **Open** | c21 unchanged in kind. The crowd is not posterized. |
| 4. Lighting beyond hierarchy | **Partly** | **Done:** bloom on boards (c08, c06), vignette (c02, c16), glass (c06). **Not done:** no player rim or key light (c02 zoom), no distinct skin or cloth specular (c21), no visible floor light pools. |
| 5. Ball in flight, make payoff | **Partly** | **Done:** the ball outline (`ballContrast` 5.02) and the rim flash (net-close f00-f03). **Not done:** the airball crowd still cheers (c07 x 1000-1250, y 230-480). |
| 6. Callouts and HUD polish | **Partly** | The "+3" is fixed. "FOULS" is still about 8-9 px (c02). |
| 7. Front end | **Partly** | The navy/gold restyle landed (c01, c13, c22). c13 still overflows at y 770-800. |
| 8. Portrait rig | **Partly** | `playerPx` 80-88, but c11 is 53.5 and the drive `emptyFgMean` is 36.8. |
| 9. Fill the enclosure | **Partly** | **Done:** the stanchion pads (c18, c07), the replay wall (c08) and the arena apron (c09). **Not done:** benches still have no team (c15), and the Hot Streak crowd still stands on a black riser with no bleacher (c12 x 210-1060, y 200-245). |
| 10. Desktop place identity, arena | **Partly** | **Done:** the arena STATE FINALS table (c09). **Not done:** no desktop banners, no arena ribbon on the fascia, and the palettes are still off (c02, c10). |
