# v3-m5-r2: Prosecutor A (art, lighting, setting)

Round v3-m5-r2 (milestone 5, round 2: animation). I compare against `review/v3-m5-r1.md` and the benchmarks in `benchmarks/` (sheet `-04`: 2K27 portraits and Playgrounds 2).

**What I opened:**
- **Sheets:** desktop `-01` to `-04` and mobile `-01` to `-03`
- **Before/after:** desktop `-01` to `-11`
- **Full-size stills:** desktop c02, c09, c14, c15, c17, c18, c19, c21; mobile c21
- **Bursts:** desktop dunk, dunk-close, net-close, jumper-close, drive, drive-close, open-play, open-play-close, make-wide
- **Benchmarks:** `-04`, plus `SOURCES.md`
- **Probe:** `probe/probe.json`, all stills and bursts

**My crops** (scratch only, full-still pixel coordinates):
- c02 #53 (620-810, 395-580) at 4x; c02 clump (150-430, 375-720) at 2.6x
- c19 handler (760-960, 430-620) at 4x; c19 clump (270-530, 340-600) at 3x
- c21 faces (440-800, 100-460) at 2.5x; c21 right armhole (780-960, 500-680) at 4x
- c17 #2 (690-910, 360-730) at 2.5x; c17 referee (140-300, 370-630) at 2.5x
- c15 referee (780-1000, 80-420) at 2x
- c06 players (0-420, 470-800) at 1.8x; c10 #13 (700-920, 370-600) at 3x
- c09 left group (10-180, 360-630) at 3x
- c16 two groups at 1.6x
- mobile c21 (200-780, 380-1000) at 1.3x
- the rim area of dunk f04-f15 at 2x; the net in net-close f00-f07 at 2.2x
- jumper-close upper bodies f03-f12 at 2.6x, and f06 shoulder at 5x

**My measurements** (box medians, sRGB 0-255, Rec.601 luma): c15 referee face (872-890, 140-158); c18 referee face (420-445, 400-425); c21 #53 face (600-760, 300-420); c02 YOU face (675-680, 425-435); c08 far wall (900-1200, 120-300); c14 bottom band (0-1280, 650-800).

The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| **Art: players, court, venue** | **6.5** | **Real recoveries:** the buns are back on the heads (c19 crop: all three sit on their skulls), c21 shows two faces again, c14 shows the bowl again, and the gameplay-distance armholes are clean on c06 and c10 (crops).<br>**Still below the 7 anchor:**<br>- **Faces:** the two c21 faces are one head mesh (same nose, jaw and brow shapes; my crop) with painted brows, no lip colour and no catchlight.<br>- **Shoes:** every player wears a flat slipper slab with a single black line (c02 YOU, c19 YOU, c06; crops).<br>- **Hair:** #3's stovepipe (c02 256-283, 502-529; c19 433-457, 503-527) and #21's gold bucket (c19 460-483, 467-490) are unchanged.<br>- **Piping:** still detached in every close view (c21, c17, jumper-close f05-f07).<br>- **Venue:** empty chairs and primitive black-box stanchions (c18). It does not have "depth on all sides".<br>Playgrounds 2 (`-04` lower row) has authored, distinct characters. This doesn't. |
| **Lighting & materials** | **6.5** | **Up:**<br>- The c17 subject is sharp again: #2's number edges are crisp, and only the crowd and wall blur.<br>- The c14 bottom band is now (65,41,20), luma 45.6, against r1's 7.5.<br>**Against:**<br>- `clippedPct` is 0 in every desktop still. There is no bloom on any lamp or board.<br>- The c08 far wall is still (29,16,3), luma 18.4, identical to r1.<br>- The ball-contrast keeps slid: c04 4.47 → **4.29**, c05 4.29 → **4.17**, jumper minimum 2.44 → **2.39**.<br>- The mobile hierarchy is weak: `floorCrowd` is 2.17 in mobile c02 against 3.58 on desktop.<br>- Official skin is off-ramp: c15 is (122,52,7), B/R 0.06; c18 is (215,164,92).<br>- c17 has a depth-of-field halo on #2's shoulder silhouettes (about 730-760, 450-480 and 860-900, 460-520). |
| **Animation & game feel** | **7** | **Up:**<br>- The dunker now stays in front of the rim and board (dunk f04-f15, my rim crops). The ball goes over the rim at f10-f12, through it at f13, and the rim flashes at f14.<br>- The officials animate: arms down at f00, a shrug at f01, both arms up (the three-point signal) from f03 (net-close).<br>- The ball is back under the hand in c02, c10 and c19.<br>**Not 7.5:**<br>- The net barely moves. The hem drops a few percent at f02-f03 (my net crop), against the 15% test, and the net otherwise holds its wastebasket cone.<br>- The c17 replay still shows the ball at the hip, not the release.<br>- The six-player paint clump persists through open-play f00-f15.<br>- The c15 official is still in the bind pose. |
| **UI / HUD** | **7** | Out of lens.<br>- The desktop make-wide now reads "3 POINTS" with "+3" (f00-f06), which is correct.<br>- The bug and the meter hold.<br>- The mobile "+3" still sits over the backboard in c16 (sheet `mobile-02`, about 1245-1290, 905-940 on the sheet). |
| **Typography** | **6.5** | Out of scope, and unchanged (sheets `desktop-03` and `-04`). |
| **Readability** | **6.5** | **Up:** the ball is visible again in c02 (784, 502) and c10 (my crop).<br>**Against:**<br>- the six-player paint clump through open-play f00-f15<br>- the c19 white defenders as a conga line sharing one forward lean (270-420, 400-620)<br>- two purple c09 defenders stacked in the same lean (55-150, 380-510)<br>- the ball-contrast slide noted under Lighting |
| **Mobile portrait** | **7** | Out of lens.<br>- `playerPx` 82.5-87.5 holds in c02-c05.<br>- Mobile c21 now shows YOU's face.<br>- Mobile c21 has new z-fighting patches (see defect 6).<br>- Mobile c14 `voidPct` is 5.1. |
| **Authenticity of setting** | **6.5** | **Plus:**<br>- c21 frames real-looking "1998 BOYS STATE CHAMPS" banners (desktop 755-850, 150-290; mobile 165-630, 140-390).<br>- c14 shows the STATE FINALS bowl and the "HOT SPRINGS, ARKANSAS" ribbon again (935-1120, 460-495).<br>**Minus:**<br>- The officials' kit is unchanged: a bare-shoulder tank neckline, sleeves hung below the shoulder cap, swirling stripes on the far sleeve (c15 935-990, 225-300), and knee shorts over tights.<br>- The benches are empty (c02 505-835, 295-355; c09 365-560, 258-310; c15).<br>- Photographic fan cards stand behind toon players (c15, c18).<br>- The c15 scorer's table is a black slab with a cropped "E" (940-960, 500-540). |
| **Overall** | **6.8** | (6.5 + 6.5 + 7 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 54 / 8 = **6.75**.<br>That is flat against r1's 6.75. This round repaired r1's regressions back to the r2 baseline and added nothing above it in my lens.<br>Both milestone targets are missed (Animation 7 against 7.5; overall 6.8 against 8.0). |

---

## 2. Defects, ranked by how often a player sees them

#### 1. Slipper shoes on every player, in every gameplay frame
- **Evidence:**
  - c02 #12 YOU: a flat white slab with one black line (my 4x crop, about 630-680, 535-575)
  - c19 YOU: the same at 773-830, 560-610
  - c06 #45: the same at 185-205, 690-705
  - c16 #14: grey soles (my crop)
  - The officials' rounded toe box (c15) holds, but player shoes have no sole and upper split, no laces and no colour accent.
- **Benchmark:** the Playgrounds 2 shoes (`-04` upper right and lower left) read as sneakers.
- **Fix:**
  - Give the shoe mesh a separate midsole band (1.5-2 cm), a darker upper and a lace panel.
  - Add a team-colour heel tab.
  - Bake a toe-crease normal map.

#### 2. Clumps and cloned poses
- **Evidence:**
  - **Open play:** six players overlap in the paint in all 16 frames (open-play f00-f15).
  - **c19:** four white defenders share one forward lean with their feet staggered the same way, like a conga line (my crop, 270-420, 400-620). Two of the four arms point right at the same angle (about 380-460, 430-470 and 410-500, 450-500).
  - **c09:** the two purple defenders at 55-150, 380-510 are the same pose stacked one behind the other (my 3x crop).
  - This partly loses r1 Keep 3 ("four distinct defender arm angles in c19"); compare `desktop-10`, upper pair.
- **Fix:**
  - Phase-offset and mirror the defensive-stance clip per player, and randomise the lean ±8°.
  - Add a 1.0-1.2 m separation force between teammates off the ball.

#### 3. Hair: the stovepipe, the bucket and the skullcap fringe
- **Evidence:**
  - #3's black cylinder: c02 256-283, 502-529 (my 2.6x crop); c19 433-457, 503-527
  - #21's gold bucket: c19 460-483, 467-490
  - c21: #53's cap has a hard, stair-stepped fringe (about 595-640, 225-250)
  - c21: YOU's black skullcap has a thin flick that sticks off the back (about 610-625, 150-170)
  - mobile c21: a vertical grey seam line at YOU's temple (about 505-515, 395-465)
- **Fix:**
  - Use tapered hair shells with a scalp-matched underlayer and no flat tops.
  - Cap the stovepipe at about 6 cm of volume.
  - Use alpha-tested edge cards on the fringe instead of a hard mesh edge.

#### 4. Armhole piping is still detached in every close camera (Blocker 5 not met)
- **Evidence:**
  - **c21 #53's right armhole:** a gold strip hangs free in the gap between torso and arm, with background on both sides and a thin grey-blue edge line down its left side (838-905, 548-625; my 4x crop). That is a backface or edge artifact.
  - **c17 #2:** a green flap stands off the left shoulder (752-762, 470-490), and a green band floats on the right upper arm, separated from the jersey by skin (856-874, 484-512).
  - **jumper-close f05-f07:** with the arms raised, the jersey's right shoulder stretches into a white web across the armpit (f06 about 1273-1289, 149-156; my 5x crop).
  - **c02 #53:** a small gold flick is left on the left shoulder (739-745, 439-445).
  - c06 and c10 are clean (crops).
- **Fix:**
  - Bake the piping into the jersey texture, or weight the piping verts 100% to chest and spine.
  - Clamp the armhole ring with a corrective blend shape driven by shoulder abduction above 70°.

#### 5. Officials: kit, skin and the c15 bind pose (carried r2 Blockers 1 and 3)
- **Evidence:**
  - **The kit (c15 2x crop):** a scoop tank neckline with both shoulders bare, sleeves hanging off the shoulder cap, the far-sleeve stripes swirling (935-990, 225-300), and knee shorts over black tights. It is identical BEFORE and AFTER in `desktop-08`, upper pair.
  - **The skin:** c15 face (122,52,7), B/R 0.06; c18 face (215,164,92); the c17 referee is a saturated yellow-orange (my crop).
  - **The pose:** the c15 official keeps the arms-out, palms-out pose, unchanged in `desktop-08`.
- **Fix:**
  - A yoke-shouldered shirt with UV-straight 2.5 cm stripes, and full-length black trousers.
  - Put the officials on the player skin ramp.
  - Drive the c15 official from the same idle clip that now runs in net-close.

#### 6. Faces and body intersections at the close cameras
- **Evidence:**
  - **One head mesh:** the two c21 faces share the same nose, jaw, philtrum and brow shapes (my 2.5x crop). The brows are flat painted bars, there is no lip colour, and there is no catchlight. The 2K27 portraits (`-04`) and Playgrounds 2's big-head characters both carry the eyes with a specular point.
  - **Mobile c21:** a pale, ragged patch sits on YOU's nose and left cheek (about 285-355, 450-495), and another on the shoulder where it meets #53's arm (about 230-340, 600-680; my crop). These read as z-fighting or body intersection between the two players. There is also a dark spot at the deltoid pole (about 275-295, 676-690).
  - **c19:** YOU's hand rests on the handler's forehead (845-860, 459-464; my 4x crop).
  - **c10 #13:** a white bar crosses the eye line (about 783-792, 410-417, 3x crop). It may be a headband sitting too low.
- **Fix:**
  - Add 2-3 head variants, with morph targets for nose, jaw and brow per roster slot.
  - Add a lip tint and an eye specular dot.
  - Add a capsule separation between players during close-camera shots.
  - Push headbands 1.5 cm up the forehead.

#### 7. Lighting: no highlights, the replay wall void and a ball-contrast slide
- **Evidence:**
  - `clippedPct` is 0 in every desktop still. No lamp, board or ribbon blooms (c09 ribbon 0-1280, 230-265; c21 scoreboard 810-1135, 0-110).
  - **c08 far wall:** (29,16,3), luma 18.4, unchanged since r1 (`desktop-04` lower pair; the area above the crowd is a brown-black void).
  - **Ball contrast:** c04 4.29, c05 4.17, jumper minimum 2.39, all below r1. `floorCrowd` in c02 is 3.58 against r1's 3.60.
  - **Mobile:** the mobile `floorCrowd` values are 2.09-2.45 (c02-c06), so the house is almost as bright as the floor on a phone.
- **Fix:**
  - A 1.2-1.5 threshold bloom on emissive ribbons and boards.
  - Raise the court key by about 10% on mobile, or drop crowd albedo by 15%.
  - Give the c08 and c17 replay far wall a baked ceiling, trusses and lamp pools.

#### 8. Venue geometry at the ends and benches
- **Evidence:**
  - **c18:** the stanchion base and the backboard arm are untextured black boxes with orange slabs (850-1280, 480-800; 870-1100, 75-150). The backboard "glass" shows crowd cards with no tint or reflection (440-860, 90-290).
  - **Crowd cards:** photographic fans stand on the floor behind the basket (180-900, 150-610), which clashes with the toon players.
  - **Empty chairs:** c02 505-835, 295-355; c09 365-560, 258-310; c15 20-650, 280-520.
  - **c15 scorer's table:** a black slab with a cropped "E" (940-960, 500-540).
- **Benchmark:** the 2K26 and 2K27 stanchions and boards (`-04` upper right) are dressed and lit.
- **Fix:**
  - A padded stanchion with a wordmark and a 15% blue-grey glass tint with a Fresnel edge.
  - Seated bench players (milestone 6).
  - A full scorer's-table decal.

#### 9. c14 champion (Blocker 8, c14 half)
- **Evidence:**
  - Better: the arena bowl, the court and the ribbon are back, and there are no giant cards (`desktop-07` lower pair).
  - Still failing:
    - `voidPct` is 15 on desktop (pass test under 5) and 5.1 on mobile
    - luma is 26.4
    - the top-left ceiling is black (0-600, 0-120) and the left stands fade to black (0-360, 120-450)
- **Fix:**
  - Light the far bowl with 2-3 lamp pools and a dim ceiling truss.
  - Raise the camera tilt so the court fills the lower third.

#### 10. Packet capture artifacts (not scored)
- **Evidence:**
  - dunk-close f00 is solid black, and drive-close f00 has a black panel at about 67-194, 5-310. The wide frames (dunk f00, drive f00) are normal, so the close crop went off the canvas.
  - dunk-close also loses the dunker from f10 to f15.
- **Effect:** the close view of the dunk's ball-in-hand clause can't be judged from the close strip.
- **Fix (harness):** clamp the crop rectangle to the canvas, and track the dunker through the hang.

---

## 3. Regressions against `v3-m5-r1.md`

1. **c19 defender poses** (partial loss of Keep 3): the four white defenders now share one lean, and two share an arm angle (defect 2). r1 ruling 4 had four distinct arm poses.
2. **Ball contrast:** c04 4.47 → 4.29, c05 4.29 → 4.17, jumper minimum 2.44 → 2.39 (`probe.json`). These are small but all in the wrong direction, and they erode Keep 6.
3. **Mobile c21:** the new framing exposes z-fighting patches on YOU's face and shoulder (defect 6). This is new because the shot now faces the players.

No regression in the venue walls, banners, wordmarks, ribbons or front end (sheets `desktop-02` and `-04`).

### Rulings on the r1 blockers' pass tests (my lens)

| r1 blocker | Status | Evidence |
|---|---|---|
| **1. The dunk: contact with the rim and ball** | **Mostly met (body clause met; hand clause not verifiable up close)** | Dunk f04-f15 (my 2x rim crops): the dunker stays in front of the rim and board in every frame, with no torso inside the ring and none behind the glass. The ball is above the front of the rim at f10-f12 with the arm reaching to it, goes through at f13, and the rim flashes at f14. The close strip loses the dunker from f10 (defect 10), so "in a hand until the rim plane" can't be confirmed at close range. |
| **2. Net reaction** | **Open (a token stretch)** | net-close f00-f07 (my 2.2x crop): the hem drops a few percent at f02-f03 and recoils by f06. That is well under 15%. The rim flash is kept (f00-f03). |
| **3. The dribble** | **Met** | c02: the ball is at (784, 502), fully visible, with the palm about half a ball-width above it (4x crop). c10 #13: the ball is under the hand (3x crop). c19: both hands are on the ball. c09: the ball is at the bottom of its bounce by the foot. |
| **4. Officials' bind pose** | **Met as written (net-close and c18)** | net-close f00 → f01 → f03: the arms go down, then a shrug, then up. c18 differs from BEFORE (`desktop-09` lower pair). Still frozen in c15, which is outside this test (defect 5). |
| **5. Armhole piping** | **Partly** | Clean at gameplay distance in c06 and c10. A small flick remains in c02. It fails in c21 (838-905, 548-625), c17 (752-762, 470-490; 856-874, 484-512) and jumper-close f05-f07. |
| **6. Floating buns** | **Met** | My c19 crop: all three buns sit on their heads, and they follow the crouch. c02 (my crop) and c16 (my crops) have no detached hair. |
| **7. Replay focus and beat** | **Partly** | **Focus met:** #2's number and the ball are sharp, and the blur is limited to the crowd and wall (`desktop-09` upper pair). **Beat open:** the ball is at the hip behind the body (828-840, 548-584), with both arms down, so this is not 3-4 ticks before release. There is a soft halo on the shoulder silhouettes. |
| **8. Showcase cameras** | **Partly** | **c21:** faces at three-quarter front on both viewports, with no hand on a face. But the inner-face and backface clause fails at #53's armhole (838-905, 548-625), and mobile shows the z-fight patches. **c14:** the bowl is restored, but `voidPct` is 15 against under 5. |
| **9. Make callout** | **Met on desktop** (UI lens, noted only) | make-wide f00-f06 reads "3 POINTS" with "+3". |
| **10. Mobile dunk framing** | **Not assessed** | This is Prosecutor B's lens. |
| **Carried r2 Blocker 1: skin** | **Open** | c02 YOU face (151,87,61), luma 103.4, unchanged. c15 referee (122,52,7). c18 referee (215,164,92). The c21 #53 face is (103,48,28), luma 62.1, which is fine. |
| **Carried r2 Blocker 2: sneakers** | **Open for players** | The officials' shoes hold (c15). The player shoes are slippers (defect 1). |
| **Carried r2 Blocker 3: officials' kit** | **Open** | c15 crop (defect 5). |
| **Carried: crowd exposure** | **Open, slightly worse** | c04 ball contrast 4.29 against 4.5. The jumper minimum is 2.39 against 2.6. c16 `floorCrowd` is 3.01. |

### Top fixes for my lens, in order
1. **Shoes and hair** (defects 1 and 3): seen in every gameplay frame.
2. **Pose variety and spacing** for off-ball defenders (defect 2).
3. **Piping baked into the texture**, plus a corrective shoulder shape (defect 4). This closes Blocker 5 and the c21 half of Blocker 8.
4. **Officials** (defect 5): the kit, the skin ramp and the c15 idle.
5. **Lighting:** bloom on the emissives, a lit replay far wall, a lit c14 bowl, and a mobile hierarchy push (defects 7 and 9).
