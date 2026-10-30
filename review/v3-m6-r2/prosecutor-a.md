# v3-m6-r2: Prosecutor A (art, lighting, setting)

**Inputs:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m6-r1.md`
- **Sheets:** desktop -01 to -04, mobile -01 to -03
- **Before/after:** desktop -01 to -11; mobile -01, -03, -05, -06, -07
- **Full-size stills:** desktop c14, c15, c18; mobile c14, c15
- **Bursts:** desktop make-wide, net-close, jumper-close
- **Benchmarks:** benchmarks-01, benchmarks-03
- `probe/probe.json`

**My crops** (nearest-neighbour, still coordinates, 50 px guides):
- **c15:** bench 20-540 × 200-520 at 2x; official 680-1000 × 80-560 at 2x; coach 520-720 × 120-600 at 2x; right crowd 900-1280 × 60-420 at 2x; one bench torso 200-360 × 260-400 at 4x
- **c06:** cheer group 560-960 × 260-480 at 3x; visitor bench 0-560 × 300-480 at 2x
- **c02:** bench and cheer 220-900 × 250-390 at 2x
- **c09:** bench and ribbon 380-760 × 205-300 at 3x
- **c10:** bench 500-1000 × 240-360 at 2.5x
- **c11:** benches 0-1280 × 320-460 at 1.2x; home bench 0-380 × 320-420 at 3x
- **c12:** gallery 120-1180 × 60-260 at 1.3x; hips 300-460 × 100-230 at 4x
- **c16:** bench 0-700 × 200-360 at 2x
- **c17:** lower-left 0-400 × 400-760 at 2x
- **c08:** lower-left 0-400 × 480-760 at 2x
- **c18:** white-clad fan 720-900 × 330-620 at 3x; left fans 130-560 × 140-480 at 2x; official 330-570 × 380-760 at 2x
- **c19:** handler 740-980 × 400-640 at 3x
- **c21:** armhole 700-940 × 440-720 at 3x; crowd 900-1100 × 400-620 at 3x
- **Mobile c15:** 0-480 × 300-960 at 1.5x; torso 60-260 × 500-760 at 3x
- **Mobile c21:** 0-780 × 300-1300 at 1x

**My samples** (median RGB):
- c14 top-left 0-480 × 0-140: (2,3,7). The r1 verdict quoted (5,5,10) for 0-600 × 0-120.
- c08 right wall 1000-1280 × 100-250: (25,13,3)
- c15 official's face 850-880 × 120-160: (102,50,34)
- c18 official's face 425-445 × 415-440: (195,142,110)

The webm and sound are not reviewed.

---

## Summary of the round, through my lens

The round fixed the two cheapest items on the r1 list:
- **The home bench now wears the home kit.** c02, c09, c10, c11, c15 and c16 are all in white.
- **The hip tears are gone at gameplay range.** I checked c06, c12, c18 and c21 at 3-4x.

It also made progress in three places:
- The officials have sleeves on the shoulder and a skin colour from the player ramp.
- The c12 gallery has varied poses.
- c14 is reframed onto a lit, cheering bowl.

Everything harder is still open, and the replay got worse:
- **The lockstep benches are untouched.** I count six identical poses in each of c02, c06, c10, c11 and c15.
- **The pom-poms are faceted gold icosahedra.**
- **The officials still wear shorts over tights.** The c15 official still stands arms-out, in swirled stripes.
- **c14 desktop still has a black void.** `voidPct` is 14.6 against a test of under 5.
- **The c09 ribbon is still eaten by heads.**
- **The c21 piping and the mobile c21 z-fight are unchanged.**
- **The replay is worse.** The r1 floating hand is now a sharp, unblurred green icosahedron, bigger than the official's head, in both c08 and c17.

Measured against the benchmarks, the benches read as rows of identical mannequins. Hoop Land (benchmarks-01, hoopland-1/2) has a 16-px bench crowd with more individuality than these 60-px figures. Against 2K27 (benchmarks-03), there's no bloom anywhere: `clippedPct` is 0 in every still.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **7** | **Up:**<br>- the bench kit is fixed (c02 crop 590-800 × 280-360; c15 bench)<br>- the hip tears are gone (c18 fan crop 720-900 × 330-620; c12 at 4x; c21 crowd at 3x)<br>**Against an 8:**<br>- six identical seated poses on every bench (c15 60-500 × 230-500; c11 0-330 × 330-410; c10 540-800 × 255-345; c06 150-470 × 340-460)<br>- bald, featureless mannequin heads (c10 610-760 × 255-285; mobile c15 120-187 × 447-527; the c06 coach 110-150 × 340-420)<br>- notched, stair-stepped collars (c15 4x crop, 230-270 × 280-302)<br>- the gold icosahedron pom-poms (c06 3x crop, 650-690 × 325-345)<br>- the sharp green icosahedron in the replay (c17 65-190 × 575-680)<br>- the c21 armhole (815-830 × 555-570)<br>- the shared c21 head mesh (unchanged, desktop-11 upper pair) |
| Lighting & materials | **7** | **Holds:**<br>- desktop `floorCrowd` is 3.18-4.14 (c02-c11, c16, c19)<br>- c04 ball contrast is 6.4<br>- the jumper minimum is 2.99<br>**Against:**<br>- c14 `voidPct` is 14.6, and the top-left (2,3,7) is darker than r1's (5,5,10)<br>- `clippedPct` is 0 in every still, so no bloom on the ribbons, boards or the rim flash<br>- the c08 wall is (25,13,3)<br>- mobile `floorCrowd` is 1.99-2.25 (c02, c06, c07, c10, c12, c16, c19)<br>- a bright depth-of-field halo rims the c08 official (225-310 × 520-610) |
| Animation & game feel | **7** | Not my lens.<br>The house reaction holds: make-wide f00-f13 builds, with arms up across the bowl by f08.<br>The benches clap in lockstep (c02, c15, c11), and the three cheerleaders share one arms-out pose in c06 (3x crop). |
| UI / HUD | **7** | Not my lens.<br>The callouts are unchanged ("3 POINTS", "+3", desktop-03 lower pair). The mobile "+3" still sits over the backboard (mobile-06 c16 pair). |
| Typography | **6.5** | Out of scope (milestone 7). desktop-07 upper pair is unchanged. |
| Readability | **7** | The ball and teams read in c02-c06, c09-c11 and c19.<br>The defender's reaching hand still sits on the handler's head (c19 3x crop, wristband at about 855,465, head top at about 870,455). |
| Mobile portrait | **7** | Player sizes are 82.5-87.5 px (c02-c05).<br>**Against:**<br>- **Mobile c15 crops the official's face at the right frame edge (680-780 × 270-420) and under the pause button. The coach becomes the subject.**<br>- mobile c21 z-fight<br>- mobile c14 has almost no confetti (3 flecks: about 300,1570; 230,1640; 705,1610)<br>- the mobile Select footer still leaks (sheet mobile-02, c13) |
| Authenticity of setting | **7.5** | **Up within 7.5:**<br>- the right kit on every bench<br>- cheer uniforms with pom-poms (c02, c06, c07, c19)<br>- officials with sleeves and natural skin<br>- a lit, cheering finals bowl in c14<br>**Not 8:**<br>- the officials still wear shorts over tights (c15 800-950 × 390-550; c18 crop 380-480 × 560-640 over tights to 700)<br>- the c15 official holds the arms-out pose in swirled stripes (930-990 × 240-310)<br>- the c09 ribbon reads "STATE ?INA S" behind the bench heads (450-560 × 235-260)<br>- the 1996 banner still contradicts the c20 fact<br>- every bench is a row of clones<br>- the "pom-poms" read as gold gems, not shredded pom-poms |
| **Overall** | **7.0** | (7 + 7 + 7 + 7 + 6.5 + 7 + 7 + 7.5) / 8 = 56 / 8 = **7.0**.<br>Every milestone-6 target is missed: Art 7 against 8.0, Authenticity 7.5 against 8.0, and overall 7.0 against 8.2.<br>The gain over r1 is 0. That's the second consecutive round under +0.2, so the plateau rule applies. |

---

## 2. Rulings on r1's blockers (my lens)

| r1 blocker | Status | Evidence |
|---|---|---|
| **1. Crowd and bench garment artifacts** | **Partly** | **Hip tears closed:**<br>- c06 cheer crop: clean black-to-gold transitions at 700-850 × 385-410<br>- c18 white-clad fan (3x crop): a clean shirt hem over khaki trousers at 790-830 × 390-500<br>- c12 (4x): clean at 352-396 × 172-200<br>- c21 crowd (3x): clean at 952-980 × 532-556<br>**Collars open:** the c15 bench tank tops have a notched, stair-stepped "U" neckline (4x crop, 230-270 × 280-302 and 330-360 × 275-300). Mobile c15 shows the same notch (120-180 × 547-577).<br>**Chest wedges open:** a deep skin V on the c15 coach's chest (600-640 × 200-280) and on mobile c15's coach (360-400 × 433-527).<br>**Mobile c15:** the pale bench player's shorts and shirt show skin-tone patches (about 127-160 × 700-767 and 173-220 × 553-640).<br>The test asks for no jagged collar outline, so it fails. |
| **2. The home bench in the home team's kit** | **Closed** | All in white:<br>- c02 (590-800 × 280-360)<br>- c09 (3x crop, 430-560 × 235-290)<br>- c10 (540-800 × 255-345)<br>- c15 (60-500 × 230-500)<br>- c16 (0-130 × 250-330)<br>- c19 (desktop-10 after)<br>c11's home bench is white, and Mountain Pine plays in white with red trim (the non-YOU player). The guest bench there is maroon, matching LHHS.<br>This is plain white tops without trim, but it is the same colours. The test is met. |
| **3. Lockstep, mannequin pose, lost props** | **Partly** | **Gallery: passes in the main.** In my c12 crop, poses vary: arms up, hands on hips, a weight shift. Some arms-down rest poses remain in 230-330 × 140-215.<br>**Props: partly.** Pom-poms are back (c02, c06, c07, c19), but they are gold icosahedra about 15 px across (c06 3x crop, 650-690 × 325-345 and 760-800 × 280-305). The uniform is a black tank over gold knee shorts, not a shell and skirt.<br>**Benches: fail.** No 3 adjacent figures may share a pose, and every bench has 6 in one:<br>- c02: seven open-palm claps<br>- c06 visitor bench: six crossed-arms poses, 150-470 × 340-460<br>- c15: six identical claps<br>- c11: six<br>- c10: six with hands at the hips<br>- c09: four |
| **4. Close cameras and replay** | **Open, worse in the replay** | **c15 desktop: passes the letter.** It's reframed, and the official is now the nearest body (feet at y about 680-740). The bench and coach bodies are still crowd-grade behind him: faceted coach head and eye slits (crop 560-640 × 140-200), notched collars.<br>**c15 mobile: weak.** The official is cut off at the right edge (680-780), so the mannequin coach and a bald bench player carry the frame.<br>**Replay: fails, and is worse.**<br>- **c17:** a sharp green icosahedron (a pom-pom) on a brown forearm, at 65-190 × 575-680, unblurred while the official behind it is blurred<br>- **c08:** the same at 125-240 × 640-735 (desktop-04 lower pair, desktop-09 upper pair)<br>It is larger and more legible as an artifact than r1's hand.<br>**Piping:** the c21 armhole is unchanged (3x crop, a gold bridge and magenta sliver at 815-830 × 555-570, background visible).<br>**Mobile c21:** the pale z-fight patches on YOU's nose bridge (350-380 × 540-600) and shoulders (240-280 × 670-700; 320-420 × 690-760) are unchanged. |
| **5. The c14 showcase** | **Partly** | **Desktop: fails.** `voidPct` is 18.5 → 14.6, against a test of under 5. The reframe puts a lit, arms-up bowl in the upper right (920-1280 × 0-480), with confetti and the STATE FINALS ribbon kept. But the top-left (0-480 × 0-140) is (2,3,7), darker than r1, and the left bowl (0-360 × 140-370) is (2,3,9) median.<br>**Mobile: passes the number.** `voidPct` is 6.2 → 4.7, but the scene is almost entirely behind the card. Confetti is down to about 3 flecks, and the ribbon shows only as an "IN" fragment at 760-780 × 880-900. "Confetti kept" is marginal. |
| **6. The officials** | **Partly** | **Met:**<br>- sleeves on the shoulder (c15 815-840 × 260-300; c18 crop)<br>- a collar line (c18 405-470 × 445-470)<br>- skin from the ramp: c15 (102,50,34) against r1's (122,51,5); c18 (195,142,110) against (214,162,90)<br>**Not met:**<br>- **Trousers:** black shorts over black tights in c15 (800-950 × 390-550, with tights to 700) and in c18 (shorts end at y about 640)<br>- **Stripes:** they swirl into curves on the c15 chest and shoulder (930-990 × 240-310), and in c08 (225-260 × 540-600). They are not UV-straight.<br>- **Pose:** the c15 official is in the same arms-out pose (hands at 700-740 × 340-370 and 900-940 × 380-410)<br>The test is conjunctive, so it fails. |
| **Carried:** c09 ribbon occlusion | **Open** | c09 3x crop: the bench heads cover "STATE FINALS" at 450-560 × 235-260. |
| **Carried:** c21 1996 banner | **Open** | Sheet desktop-04, c21: "1996 BOYS STATE CHAMPS". c20 says the boys won in 1998. |
| **Carried:** c08 wall, bloom, mobile key | **Open** | The wall is (25,13,3). `clippedPct` is 0 everywhere. Mobile `floorCrowd` is 1.99-2.25. |

---

## 3. Defects, ranked by how often a player sees them

### 1. Clone benches (every gameplay frame)
- **Evidence:**
  - c02, 590-800 × 280-360: seven identical palms-out claps
  - c06, 150-470 × 340-460: six identical crossed arms
  - c10, 540-800 × 255-345: six identical hands-on-hips seats
  - c11, 0-330 × 330-410: six identical chest claps
  - c09: four
  - c15 2x crop: six
  - jumper-close f01-f17, top band: the Fountain Lake bench, same pose
- **Fix:**
  - Use at least 4 seated variants: elbows on knees, leaning back, towel on the shoulder, arm on the next chair, a single clap.
  - Give each a random phase and a mirror.
  - Seat one player turned to talk to a neighbour.
  - Stand the coach in a different pose from the bench, not the same arms-up.

### 2. Mannequin heads in the bench and crowd (every gameplay frame; obvious in c15)
- **Evidence:**
  - bald pale heads: c10 610-640, 670-700 and 730-760 × 255-285; c06 coach 110-150 × 340-420; mobile c15 120-187 × 447-527
  - the faceted coach head with black eye slits (c15 crop 560-640 × 140-200)
  - flat skull caps for hair on the c15 bench (100-125 × 265)
- **Fix:**
  - Give every bench and crowd head at least 3 hair meshes (short, braids/bun, cap).
  - Darken the bald pale material to a skin ramp with a hair colour.
  - Use player-rig heads for the bench (they are within 4 m of the c15 camera).

### 3. The officials' kit and pose (most gameplay frames and every close camera)
- **Evidence:**
  - shorts over tights: c15 800-950 × 390-700; c18 crop; c10 960-1010 × 260-350
  - swirled stripes: c15 930-990 × 240-310; c08 225-260 × 540-600
  - the arms-out pose (c15)
- **Fix:**
  - Full-length black trousers on the official mesh, with the tights deleted.
  - UV-straight vertical stripes, with a separate yoke.
  - Drive c15 from the net-close idle and signal set.

### 4. Gem pom-poms (c02, c06, c07, c19: every home gameplay frame with the cheer squad)
- **Evidence:** c06 3x crop, 650-690 × 325-345 and 760-800 × 280-305: flat-shaded gold icosahedra with hard facets. In c17 and c08 the same mesh, in green, fills 125 px of the replay.
- **Fix:**
  - A shredded pom-pom: a cluster of 20-40 thin strips, or a noise-alpha sphere card with a metallic streak texture.
  - A pleated skirt in place of the knee shorts.
  - Two clip variants, so the three girls don't share one arms-out pose (c06).

### 5. The replay pom-pom intrusion (every three-point replay)
- **Evidence:**
  - c17, 65-190 × 575-680
  - c08, 125-240 × 640-735: sharp while the official at 140-270 is blurred
  - desktop-04 lower pair and desktop-09 upper pair show the hand became a larger blob
- **Fix:**
  - Cull crowd and cheer instances inside a 2 m capsule around the replay camera path.
  - Or put crowd and props in the depth-of-field pass.
  - Test with a pixel diff of the lower-left quadrant against a crowd-off render.

### 6. The c09 ribbon occluded (every state-finals frame)
- **Evidence:** c09 3x crop, heads at 450-560 × 235-260 over "STATE FINALS". The left reads "ST TE INA S" on sheet desktop-02.
- **Fix:** Raise the ribbon about 0.4 m, or lower the bench riser, or move the bench along the sideline away from the lettering.

### 7. No bloom, and a dark house edge (every frame)
- **Evidence:**
  - `clippedPct` is 0 in all 44 stills
  - c14 top-left (2,3,7), `voidPct` 14.6
  - c08 wall (25,13,3)
  - c09 crowd `crowdY` 0.0088 with `floorY` 0.137: the finals court is noticeably dimmer than the home gyms (0.20-0.23)
- **Fix:**
  - A bloom pass thresholded on the ribbon and the rim flash.
  - 2-3 lamp pools on the c14 far bowl, or keep the camera reframe but fill the top-left with the lit truss.
  - Light the c08 wall with a wash light.
  - A +10% court key on mobile (`floorCrowd` 1.99-2.25 against desktop 3.2-4.1).

### 8. Notched collars and chest wedges (gameplay at 3x; obvious in close cameras)
- **Evidence:** c15 4x crop (230-270 × 280-302); mobile c15 (120-180 × 547-577); the c15 coach chest (600-640 × 200-280).
- **Fix:** Paint the neckline into the shirt texture with an anti-aliased edge instead of a geometric cut, and close the V with fabric.

### 9. The c21 piping and the mobile c21 z-fight (each face close)
- **Evidence:** c21 3x crop, 815-830 × 555-570. Mobile c21: 350-380 × 540-600 and 240-280 × 670-700.
- **Fix:** As r1 fix 4. Bake the trim into the texture, cap the armhole, and separate the bodies by 5-10 cm or apply a polygon offset.

### 10. Mobile c15 framing (each mobile bench close)
- **Evidence:** the official is clipped at x 780, and his face is under the pause button (680-780 × 270-420). The mannequin coach is centred (330-450 × 300-960).
- **Fix:** On portrait, offset the camera target about 1 m toward the official, or swap the composition so the official is in the left two-thirds.

---

## 4. Regressions since v3-m6-r1

1. **The replay intrusion grew.** In c17 and c08, a sharp fan's hand became a sharp green icosahedron about twice the size of the official's head (c17 65-190 × 575-680; c08 125-240 × 640-735). See desktop-04 lower pair and desktop-09 upper pair.
2. **The c14 desktop top-left got darker:** (5,5,10) became (2,3,7) at 0-480 × 0-140. `voidPct` improved overall (18.5 → 14.6) only because the lit bowl now fills the right.
3. **The mobile c14 confetti is almost gone** (3 flecks). r1's Keep 10 named "the confetti over the c14 bowl", and desktop keeps it.
4. **Mobile c15 lost its subject.** The official is now cropped at the frame edge (mobile-05 right pair, AFTER against BEFORE).

**No regression in:**
- the desktop lighting hierarchy (`floorCrowd` 3.18-4.14; c04 6.4; jumper minimum 2.99)
- the gym-coloured house
- the c06 → c16 reaction build (make-wide f00-f13)
- the scorer's tables
- the walls and banners
