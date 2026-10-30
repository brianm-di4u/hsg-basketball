# v3-m6-r1: Prosecutor A (art, lighting, setting)

Round: v3-m6-r1 (milestone 6, round 1: a 3D crowd, bench players and coaches, apron dressing, and carried animation fixes). Milestone 6 targets: Authenticity 8.0 or better, Art 8.0 or better, overall 8.2 or better. Before/after pairs compare with v3-m5-r2.

**What I read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m5-r2.md`, `probe/probe.json`, `benchmarks/SOURCES.md`.

**What I opened:**
- **Sheets:** desktop -01 to -04, mobile -01 to -03.
- **Full-size stills:**
  - desktop c02, c06, c08, c09, c12, c14, c15, c16, c17, c18, c21
  - mobile c06, c15, c16, c21
- **Before/after:** desktop -01 to -11, mobile -01 and -02.
- **Bursts:** desktop make-wide, net-close, dunk, open-play.
- **Benchmarks:** -01, -02, -03.

**My crops (scratch only, nearest-neighbour):**
- c15: the bench at 0-720, 180-600 and the official and crowd at 640-1280, 80-480 (1.6x)
- c16: the far bench at 560-1040, 180-360 (2.2x) and the home bench at 0-400, 80-350 (2.4x)
- c06: the cheer trio at 600-900, 300-480 (3x)
- c12: the side stand at 0-180, 100-380 and the baseline fans at 220-600, 80-240 (2.5x)
- c18: the fan at 700-920, 300-640 (2.2x) and the baseline fans at 140-580, 140-480 (1.8x)
- c21: the far-end fans at 880-1120, 420-640 (2.5x) and #53's armhole at 300-860, 380-700 (1.6x)
- c17: #2's shoulders at 660-920, 440-640 (3x) and the lower-left corner at 0-300, 440-720 (2x)
- c19: the stands at 0-640, 120-420 (1.6x)
- c10 and c11: bench rows (1.2x)
- mobile c21: YOU's face at 300-560, 480-820 (2x)
- net-close: all 12 frames, net region at 2x

**My measurements (box medians, sRGB 0-255):**
- c08 far wall (900-1200, 120-300) = (29,16,3)
- c15 official's face (872-890, 140-158) = (122,51,5)
- c18 official's face (425-450, 405-430) = (214,162,90)
- c17 official's face (170-200, 465-490) = (182,133,66)
- c02 YOU's face (665-680, 420-435) = (151,85,57)
- c14 top-left (0-600, 0-120) = (5,5,10)
- **Mobile c06 luma column scans** at x 550-580, y 960-1010:
  - The card edge is at y 998.
  - The white of #0's shoe ends at about y 963 at x 570.
  - The cast shadow ends at about y 986.

The webm and sound are not reviewed.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| **Art: players, court, venue** | **6.5** | **Gained:**<br>- The venue now has bodies on every side: filled benches (c02 580-830, 290-360; c09 420-560, 250-315), standing coaches, cheer groups, and baseline fans (c12, c18).<br>- That meets the 7 anchor's "depth on all sides" clause.<br>**Lost:**<br>- The new crowd geometry brings a new class of artifact that is visible at gameplay distance, not only in close cameras:<br>  - waist-and-hip tears on every standing figure (c06 700-850, 385-410)<br>  - skin-coloured chest rectangles and zig-zag collars on the fans (c15 1009,86; 777,105)<br>  - claw hands and faceted heads at close range (mobile c15 270-460, 290-420)<br>- The piping is still off the body (c21, c17), and the two c21 faces still share one head mesh.<br>- The net change is zero. That is far from the 8 target. |
| **Lighting & materials** | **6.5** | **Up:**<br>- The house is now clearly dimmer than the court: desktop `floorCrowd` is 3.18-4.08 and `crowdY` 0.017-0.036.<br>- Ball contrast has recovered: c04 4.29 → 6.01, c05 4.17 → 5.43, jumper minimum 2.39 → 3.0.<br>**Against:**<br>- The c14 void is worse: `voidPct` 15 → 18.5 on desktop and 5.1 → 6.2 on mobile; the top-left is (5,5,10).<br>- The c08 far wall is unchanged at (29,16,3).<br>- `clippedPct` is 0 in every still: no bloom on the ribbons or the boards.<br>- The officials' skin is (122,51,5) in c15 and (214,162,90) in c18.<br>- The crowd is one even dim value with no light pools.<br>- Mobile `floorCrowd` is still 1.96-2.2 in gameplay. |
| **Animation & game feel** | **7** | Outside my lens.<br>**Crowd answers a make:** arms go up in c16 (top rows 900-1280, 0-60), c06, and make-wide f00-f13.<br>**Replay:** the c17 replay beat is now correct (the ball above the shoulder in both hands, 805-865, 485-550).<br>**Against:**<br>- The bench rows clap in lockstep (c16 740-990, 260-340; c15 bench).<br>- The c12 spectators stand in a bind-like pose (220-1050, 85-230).<br>- The dunk and net tests are left to B. |
| **UI / HUD** | **7** | Out of my lens; I see no change against r2 (sheets desktop-01 to -04). |
| **Typography** | **6.5** | Out of scope (milestone 7). There is no change on c13, c20 or c22 (`desktop-07`, `desktop-10`, `desktop-11` lower pairs). |
| **Readability** | **7** | **Up:**<br>- The darker crowd separates the players from the stands better (c02, c10, c19 against their `desktop-01`, `desktop-05` and `desktop-10` BEFOREs).<br>**Against:**<br>- The standing sideline groups add clutter at the apron (c06 690-860, 340-470).<br>- The official stands in front of the shooter in mobile c06 (170-260, 700-850). |
| **Mobile portrait** | **7** | Held.<br>**Against:**<br>- Mobile c15 is the worst close shot in the packet: faceted heads, claw hands, and torn trousers on the coach (300-470, 290-980).<br>- Mobile c21 still has pale z-fight patches on YOU's nose and cheek (340-390, 575-670).<br>- The end wall is one row of standing fans against a bare orange band (mobile c16 0-690, 270-400). |
| **Authenticity of setting** | **7** | **Up (+0.5):** the 7 anchor's list is now present: benches with players, standing coaches, a scorer's table with HOME/GUEST, cheer groups, a student section behind the baseline (c18), and confetti over the finals bowl (c14).<br>**Not 8:**<br>- The home bench wears a different kit from the home team on the floor in four gyms (defect 3).<br>- The cheerleaders lost their pom-poms (`desktop-03` lower pair, `desktop-04` upper pair).<br>- The officials' kit and the c15 pose are unchanged (`desktop-08` upper pair).<br>- The shootout gallery stands like mannequins (c12).<br>- The banners disagree with the hub's own fact (defect 10). |
| **Overall** | **6.9** | (6.5 + 6.5 + 7 + 7 + 6.5 + 7 + 7 + 7) / 8 = 55.5 / 8 = 6.94.<br>That is +0.125 over r2's 6.8. **All three milestone-6 targets are missed:** Authenticity 7 against 8, Art 6.5 against 8, and overall 6.9 against 8.2. |

---

## 2. Defects, ranked by how often a player sees them

### 1. Waist and hip tears on every standing crowd, bench and coach figure (new)
- **Evidence:**
  - **c06 (my 3x crop):** the three standing figures in black at about 700-727, 760-787 and 827-850, all at y 387-410. Jagged triangles of skin and trouser colour cut through the shirt hem at the hips, on every made basket from this end (`desktop-03` lower AFTER).
  - **c18 (my crops):**
    - The white-dressed fan at 760-880, 340-620 has brown and skin shards from the belly to mid-thigh (about 790-830, 390-500).
    - The black-clad fans at 250-340, 280-420 tear the same way.
  - **c12:** about 352-396, 172-200 in the baseline gallery.
  - **c21:** about 952-980, 532-556 in the far-end group.
  - **c15:** the coach's khaki trousers carry dark streaks from hip to knee (about 594-690, 336-555; median (56,33,14)).
  - **Mobile c15:** the coach at 330-440, 560-680 shows shards the size of a hand.
- **Why it ranks first:**
  - It appears at gameplay distance, not only in close cameras.
  - Every gym has standing groups at the apron or the baseline.
  - The net-close burst shows it in all 12 frames (my 2x grid, the white fan at the right of every tile).
- **Fix:**
  - The shirt and trouser shells z-fight or skin apart at the hip ring. Weight the hem ring of both shells identically, 100% to the pelvis and spine-0.
  - Or merge the shirt and trousers into one skinned mesh with a texture split.
  - Delete the trouser faces hidden under the shirt.
  - In the crowd LOD, use one material-split body mesh, not layered garments.

### 2. Chest rectangles and zig-zag collars on the fans (new)
- **Evidence:**
  - **c15 (my crop):** a skin-coloured rectangular patch sits below the neck on most seated fans, for example at about (1009,86), (777,105), (946,149) and (696,152).
  - **c15 bench players:** a white and gold zig-zag "necklace" outline at about (187,267), (319,267) and (469,286).
  - **c06:** at about 717-728, 303-310 and 805-813, 340-345.
  - **c18:** the white fan's chest rectangle at about 780-800, 385-395.
  - **Mobile c15:** at about 270-310, 560-580.
- **Fix:** paint the neckline into the shirt texture instead of cutting a geometry opening, or close the opening with body-colour faces. Remove the duplicated collar edge loop that renders as a jagged outline.

### 3. The home bench wears a different kit from the home team on the floor (new)
- **Evidence:** in every case the visitors' bench matches its team; only the home bench is wrong.

  | Shot | On the floor | Home bench |
  |---|---|---|
  | c02 (desktop-01 lower AFTER) | HSHS in white | black tops and gold shorts (about 580-830, 290-360) |
  | c16 | HSHS in white | black and gold (0-200, 280-340) |
  | c09 | HSHS in white | black and gold (420-560, 250-315) |
  | c10 (my crop) | JHS in white | purple tops and gold shorts (about 575-830, 255-330) |

  - **Visitors matching:** the blue Lakeside bench in c06 (140-460, 340-460) and c16 (740-990, 260-340).
- **Why it matters:** a player reads the bench as a third team. It undercuts the authenticity gain that the benches were meant to deliver.
- **Fix:** bench players inherit the kit the team is wearing tonight (home whites at home), and the warm-up shirt if you want variety.

### 4. Repetition and lockstep: one clap pose per bench, and bind-pose galleries (new)
- **Evidence:**
  - **c16 (my 2.2x crop):** all seven Lakeside bench players hold the same palms-out pose at the same phase (740-990, 260-340).
  - **c15:** six of seven seated home players hold the same open-palm clap (crop 0-720, 180-600).
  - **c10:** the bench row is identical (my crop).
  - **c12 (my crop):** about 25 spectators behind the baseline (230-560 and 715-1050, 85-230) stand in the same arms-down, arms-apart rest pose. BEFORE had varied, cheering cards (`desktop-06` lower pair).
  - **c11 (my crop):** the stands are dominated by one seated hands-out pose.
- **Fix:**
  - At least 4-6 pose and clip variants per role.
  - A random phase offset and a mirror per instance, and ±10% playback rate.
  - A real "watching" idle for the shootout gallery, with weight shifts and a hand on the hip.
  - Head-turn look-at toward the ball for the front rows.

### 5. The close cameras still fail (carried Blockers 3 and 5, plus the new crowd)
- **Evidence:**
  - **c21 (my 1.6x crop):**
    - #53's right armhole: the gold piping stands off the torso, with crowd background visible between the piping and the arm (about 818-838, 561-605).
    - The two faces (YOU at about 470-560, 230-360 and #53 at about 570-740, 170-440) still share one head mesh: the same brow ridge, nose and ear.
  - **c17 (my 3x crop):** thin green piping slivers stick out horizontally beyond both shoulder silhouettes (about 710-730, 577-580 and 847-863, 580-583).
  - **Mobile c21 (my 2x crop):**
    - pale z-fight patches on YOU's nose and cheek (about 340-390, 575-670) and neck (about 390-415, 750-805)
    - a yellow piping sliver poking through the skin (about 375-380, 780-800)
    - #53's face is cut in half by the left frame edge (0-200, 420-760)
  - **Mobile c15:** the faceted low-poly head (330-400, 290-370) and claw hands (270-310, 340-420; 410-460, 330-400) of the standing coach fill the frame.
  - **c15 official:** the same arms-out pose and scoop-neck, off-shoulder kit as BEFORE (`desktop-08` upper pair; my crop 830-880, 195-225 shows bare shoulder above the sleeve).
- **Fix:**
  - Bake the piping into the jersey texture, and cap the inner faces.
  - Apply a polygon offset to the skin, or separate the two c21 bodies by 5-10 cm.
  - Use 2-3 head variants.
  - For the coach and bench LOD in c15, swap to the player-grade rig and hands, or frame the close camera so that crowd-LOD bodies are not in the foreground.
  - Run the net-close officials' idle on the c15 official.

### 6. A floating, in-focus hand in the replay (new)
- **Evidence:**
  - **c08:** a disembodied forearm and hand reach up from the bottom-left (about 20-170, 600-745). BEFORE had none (`desktop-04` lower pair).
  - **c17 (my 2x crop):** the same arm at about 0-120, 530-700. It is sharp, while the official behind it at 140-270 is blurred and haloed by the depth of field, so the hand reads as pasted on.
- **Fix:**
  - Cull crowd instances inside the replay camera's near volume (within about 1.5 m).
  - Or include them in the depth-of-field blur.

### 7. The cheerleaders lost their identity (regression)
- **Evidence:**
  - `desktop-03` lower pair: BEFORE c06 shows a cheer trio with white pom-poms (about 350-430, 610-670 in the pair). AFTER shows three people in black tops and trousers with no props (c06 690-860, 340-470), torn at the hips (defect 1).
  - `desktop-04` upper pair (c07) is the same.
  - The c19 cheer group (325-462, 264-364) holds one shared pose.
- **Fix:** a cheer uniform (shell top and skirt in school colours), pom-pom meshes on the hand bones, and a 2-3 clip routine triggered on a make.

### 8. The c14 void is worse (carried Blocker 5, regressed)
- **Evidence:**
  - `voidPct` is 18.5 on desktop (r2: 15) and 6.2 on mobile (r2: 5.1).
  - The top-left (0-600, 0-120) is (5,5,10).
  - The bowl is still there and now has confetti (about 230, 240; 300, 240) and raised arms (920-1280, 100-500). But the upper third of the frame is an unlit black void (`desktop-07` lower pair).
- **Fix:** add 2-3 lamp pools and a dim truss or catwalk to the far bowl, or tilt the camera so the lit court and bowl fill the top-left.

### 9. Lighting stays short of the 7 anchor's "no artifacts" and the 9 anchor's pools and bloom
- **Evidence:**
  - `clippedPct` is 0 in all 44 stills. The STATE FINALS ribbons in c09 (40-260, 240-260; 760-965, 240-260) and the c21 scoreboard (960-1250, 0-110) do not bloom.
  - The c08 far wall is (29,16,3), unchanged: a flat brown field above the crowd (570-1280, 60-330).
  - The crowd is one uniform dim value (`crowdY` 0.017-0.036) with no falloff, no spill from the court lamps, and no rim light on the front rows. In nba2k25-1 (benchmarks-02) the crowd is lit in graded pools.
  - The officials' skin is two different off-ramp colours: (122,51,5) saturated orange in c15 and (214,162,90) yellow-pale in c18.
  - Mobile `floorCrowd` is 1.96 (c06), 2.08 (c16) and 2.2 (c02, c19), against 3.2-4.1 on desktop.
- **Fix:**
  - A bloom pass thresholded on the emissive ribbons and boards.
  - A spill term on the first 3-4 crowd rows from the court key.
  - Light the c08 wall.
  - Use the player skin ramp for the officials.
  - Darken the mobile end-wall crowd by about 30%.

### 10. Venue gaps and a setting inconsistency
- **Evidence:**
  - **Mobile c16 and c06:** the baseline end is one row of standing fans against a bare orange band and brick (0-690, 270-400 in c16; 0-780, 320-480 in c06). There are no bleachers, and this is the view a mobile player sees all game.
  - **c18:** the stanchion base is a plain orange slab (850-1280, 490-800) with no pad seams or logo. Fans stand right against it (760-880, 340-620).
  - **c09:** the bench heads cut through the "STATE FINALS" ribbon text, which reads "ST TE INA S" (450-560, 240-260).
  - **The banners against the hub:**
    - The c21 banners read "1996 BOYS STATE CHAMPS" and "1998 BOYS STATE CHAMPS" (780-1005, 150-290).
    - The c20 hub says the girls won in 1997 and 1998 and the boys in 1998.
    - The 1996 boys banner is not supported by the game's own fact, and the girls' 1997-98 titles are not visible on the c21 wall. I can't verify the real history, so I'm flagging the inconsistency, not the fact.
- **Fix:**
  - Give the baseline end a short bleacher or a student-section riser on mobile.
  - Add pad seams and a school wordmark to the stanchion base.
  - Lift the ribbon or seat the bench lower.
  - Reconcile the banners with the sourced fact.

---

## 3. Regressions and status of the previous verdict's blockers (my lens)

### Regressions since v3-m5-r2
1. **c14 void:** 15 → 18.5 on desktop and 5.1 → 6.2 on mobile (probe).
2. **Cheerleaders:** the pom-pom cheer squads are now props-less figures (`desktop-03` lower pair, `desktop-04` upper pair).
3. **Shootout gallery:** varied, cheering fans have become a near-uniform rest pose (`desktop-06` lower pair; c12 crop).
4. **Floating hand:** new in c08 and c17.
5. **Close-range crowd quality:** the BEFORE c15 crowd had legible faces and expressions (`desktop-08` upper BEFORE). The AFTER crowd is mannequins with chest rectangles and collar artifacts. The 3D crowd integrates better at gameplay distance, so this is a regression only in the close cameras.

### Rulings on the v3-m5-r2 blockers' pass tests
| Item | My status | Evidence |
|---|---|---|
| **Blocker 1:** the dunk | Not ruled (B's lens) | dunk f14-f15 show "SLAM DUNK" with the score at 2. I don't judge the landing at tile scale. |
| **Blocker 2:** the net | Partly (my reading; B to rule) | **Rest frame:** net-close f00 already has the ball inside the mesh with the rim flash (my 2x grid), so the "start one or two frames before the ball enters" clause is **not met**.<br>**Length:** by eye at 2x, the hem at f00-f02 sits about 80 tile px below the rim, against about 70 at f08-f10. That is roughly +14-19%, near the 15% line.<br>**Flare:** no visible flare at the hem.<br>**Rim flash:** kept (f00-f03). |
| **Blocker 3:** piping in the close cameras | **Open** | c21 at about 818-838, 561-605. c17 at about 710-730, 577-580 and 847-863, 580-583. Mobile c21 at about 375-380, 780-800 (defect 5). |
| **Blocker 4:** the replay beat | **Closed** | c17 desktop: the ball above the right shoulder with both hands on it (805-865, 485-550). Mobile c17 (sheet mobile-03, tile 1) is the same. The focus is kept: #2's number is sharp and the crowd is blurred.<br>New defect 6 (the floating hand) is outside the test. |
| **Blocker 5:** the showcase cameras | **Open, partly regressed** | c21 desktop: three-quarter faces with no visible z-fight on skin, but the piping fails (Blocker 3). Mobile c21: z-fight patches on the nose, cheek and neck. c14 `voidPct` is 18.5 on desktop and 6.2 on mobile, against under 5. |
| **Carried r2 Blocker 1:** skin | **Open** | c02 YOU (151,85,57), unchanged. c15 official (122,51,5). c18 official (214,162,90). |
| **Carried r2 Blocker 3:** officials' kit | **Open** | `desktop-08` upper pair: the official is identical BEFORE and AFTER (scoop neck, sleeves off the shoulder cap, shorts over tights). |
| **Carried r2 Blocker 4:** the mobile card margin | Improved (B to rule) | My scan of mobile c06: about 35 device px from the white of #0's shoe (x 570, y 963) to the card edge (y 998), but only about 12 px from the cast shadow (y 986). |
| **Carried:** crowd exposure | **Largely met** | c04 ball contrast 4.29 → 6.01 (test 4.5). Jumper minimum 2.39 → 3.0 (test 2.6). c16 `floorCrowd` 3.01 → 3.35. The 3D crowd is now properly dimmer than the floor on desktop. Mobile is still 1.96-2.2. |
| **Carried:** mobile Select footer | **Open** | Sheet mobile-02, c13: "Cutter-" and "Jessieville" still show below BACK and TIP OFF. |

### Probes that measure the wrong thing
- **c15 `floorCrowd` 0.78 and `floorY` 0.0049:** the floor samples land on the dark apron and the scorer's table, not on the court.
- **c18 `voidPct` 10.3:** this counts the black stanchion arm and base, which are dark geometry, not a void.
- **c06 and c07 `ballContrast` 1.46 and 1.27:** these sample the ball inside the net and on the floor next to orange.

### Keep (do not lose)
- The house is dimmer than the court on desktop, and the ball contrast has recovered (c04 6.01, jumper minimum 3.0).
- Filled benches and standing coaches on every sideline, and a scorer's table with HOME/GUEST and the school wordmark (c02, c09, c10, c16).
- The crowd's arms-up reaction to a make (c16, c06, make-wide), and the confetti over the c14 bowl.
- The c17 replay beat and its focus.
- The visitors' bench in its team colours (c06, c16).
