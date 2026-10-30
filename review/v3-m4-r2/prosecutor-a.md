# v3-m4-r2: Prosecutor A (art, lighting, setting)

Round v3-m4-r2, milestone 4 round 2 (high-quality player models). Before/after pairs compare with v3-m4-r1. Binding previous verdict: `review/v3-m4-r1.md` (6.6; Art 6.5, Authenticity 6.5; 5 milestone-4 blockers).

**What I opened:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m4-r1.md`
- Contact sheets: desktop `-01` to `-04`, mobile `-01`
- Full-size stills (desktop): c02, c07, c15, c16, c17, c18, c19, c21
- Full-size stills (mobile): c06, c21 (play-area crops)
- Before/after: desktop `-01`, `-08`, `-09`, `-10`
- Bursts: `desktop-jumper.png`
- Benchmarks: sheet `-02` and `SOURCES.md`
- `probe/probe.json`, all stills

**My crops** (in the full-size stills):
- c15 shoes (x 760-1000, y 600-770) at 4x, and the c15 referee (x 660-1010, y 80-560) at 2x
- c21 faces (x 340-800, y 100-320) at 2x, and the c21 far elbow (x 280-560, y 320-560) at 3x
- c02 players (x 150-800, y 380-560) and c19 players (x 280-940, y 340-560) at 2x
- c16 blue clump and referee (x 540-840, y 320-520) and c16 YOU (x 1090-1250, y 430-560) at 3x
- c18 referee (x 340-560, y 380-560) at 3x
- c17 #2 raised arms (x 700-940, y 290-480) at 3x, c04 shooter (x 470-590, y 230-380) at 4x, and the c15 referee's face (x 840-940, y 80-180) at 4x
- mobile c06, the card and the nearest player (x 300-780, y 700-1150)

**My measurements** (sRGB 0-255, Rec.601 luma, 5x5 box medians on faces, 13x13 on walls):

| Character / surface | RGB | Luma | R:G | B/R |
|---|---|---|---|---|
| c02 YOU | (149,83,54) | 99.4 | 1.80 | 0.36 |
| c02 #53 | (105,50,33) | 64.5 | 2.10 | 0.31 |
| c02 #3 | (207,173,149) | 180.4 | 1.20 | 0.72 |
| c19 YOU | (150,85,57) | 101.2 | 1.76 | 0.38 |
| c19 handler | (106,53,37) | 67.0 | 2.00 | 0.35 |
| c19 #42 | (105,49,32) | 63.8 | 2.14 | 0.30 |
| c19 #21 | (194,140,107) | 152.4 | 1.39 | 0.55 |
| c15 referee cheek | (122,51,7) | 67.2 | 2.39 | 0.06 |
| c15 referee forearm | (121,46,1) | 63.3 | 2.63 | 0.01 |
| c21 #12 (YOU) cheek, grid median | ~(150,85,57) | ~100 | 1.76 | 0.38 |
| c21 #53 cheek | (106,49,29) | 63.8 | 2.16 | 0.27 |
| c16 near blue player | (155,100,63) | 112.2 | 1.55 | 0.41 |
| c16 back blue player (x 655, y 335) | (215,181,157) | 188.4 | 1.19 | 0.73 |
| c16 right blue player (x 798, y 335) | (154,88,59) | 104.4 | 1.75 | 0.38 |
| c16 referee | (213,161,89) | 168.3 | 1.32 | 0.42 |
| c07 referee | (161,123,70) | 128.3 | 1.31 | 0.43 |
| c17 referee | (185,135,66) | 142.1 | 1.37 | 0.36 |
| c08 far wall / left wall | (33,19,4) / (160,143,108) | 21.5 / 144.1 | | |
| c17 far wall / left wall | (34,19,4) / (169,151,114) | 21.8 / 152.2 | | |

No skin-like pixel in the c21 face region exceeds 240.

The webm and sound are not reviewed or scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **6.5** | **One artifact class is fixed:** armhole piping now stays on the torso. In the c21 far-elbow crop the gold ring is a continuous loop on the jersey, and the c17 #2 raised arms show intact armholes.<br>**Every other r1 artifact is still on screen:**<br>- five toe ridges per shoe in the c15 crop<br>- primitive hair: the c19 #21 blonde cylinder (x 465-500, y 455-490), the #3 black stovepipe (x 425-460, y 500-530), sphere-cluster buns (c16 #14, c17 #2), and the bald scalp on c21 #12, who is YOU<br>- one face template with small eyes (c21, c15 and c18 crops)<br>- the near-plane forearm at c21 x 0-300, y 0-190, now larger than r1's<br>**A new artifact:** the officials' shirt slides off the shoulders (c15, c18).<br>**The venue is unchanged:** empty chairs, the black table face (c15) and the c09 arena.<br>Against Playgrounds 2 and Hoop Land's authored characters this is still a 6.5. |
| Lighting & materials | **6.5** | **Up:**<br>- c02 `floorCrowd` is 3.58 (r1 3.38), now over 3.4. c16 is 2.95 (r1 2.75).<br>- Player dark skin has blue back: c02 #53, c19 #42 and the c19 handler have B/R 0.30-0.35.<br>**Still failing the 7 anchor:**<br>- The c15 referee is still terracotta: (122,51,7), B/R 0.06.<br>- Pale skin is still paper: c02 #3 and the c16 back blue player are at R:G 1.19-1.20.<br>- `clippedPct` is 0 in every still: no bloom, and no pools of light.<br>- The replay far wall is a 21.5 void against a 144-152 left wall (c08, c17), unchanged.<br>- One matte response covers skin, cloth and shoe, with no rim term (c21). |
| Animation & game feel | **6.5** | **Unchanged procedural motion.** The jumper burst (f07-f11) is the same small release, as expected before milestone 5. |
| UI / HUD | **7** | **Unchanged.** The broadcast bug and callout placement hold (c03-c07; c06 "3 POINTS" clear of the rim). The mobile card is still too close to a shoe (Blocker 5). |
| Typography | **6.5** | **Unchanged.** The c13 chips and c20 pills are still small (sheet `desktop-03`, `desktop-04`). |
| Readability | **6.5** | **Up:** `ballContrast` c04 is 4.40 (r1 4.13), c05 4.10 (r1 3.73), and the c08/c17 replays 3.1-3.28.<br>**Not enough for 7:**<br>- The c19 clump still interpenetrates: four white defenders overlap at the forearms (x 290-420, y 400-600).<br>- Pale #21 and #3 merge into the white defenders (c19 crop).<br>- Mobile c06/c07 `ballContrast` is 1.28-1.59. |
| Mobile portrait | **7** | **Unchanged.** `playerPx` is 82.5-87.5 in c02-c05, with a separate thumb deck.<br>The card-to-shoe gap is now about 12 device px (mobile c06; the shoe ends at y 985, the card starts at y 998). That is better than r1's 0, but under the 32 px test. |
| Authenticity of setting | **6.5** | **Officials:** they now have short sleeves, but still wear shorts over tights, the shirt is off the shoulders, and the shoes have toes (c15, c16, c18).<br>**Unchanged:**<br>- photographic fans behind toon athletes (c15, c18, c21)<br>- empty bench chairs (c02, c15, c19)<br>- the c09 arena (`floorY` 0.138)<br>**Plus:** school-colour piping still holds on every kit (c02, c10, c16). |
| **Overall** | **6.6** | (6.5 + 6.5 + 6.5 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 53 / 8 = 6.625. **No change from r1.** Every milestone target is still missed: Art 6.5 against 7.8, Authenticity 6.5 against 7.5, and overall 6.6 against 7.7. |

### The r1 milestone-4 blockers against their pass tests

| r1 blocker | Status | Evidence |
|---|---|---|
| **1. Skin assignments and hue** | **Partly. Fails.** | **Assignments that pass** (dark class, luma 35-75): c02 #53 64.5, the c19 handler 67.0, c19 #42 63.8. c17 #2 also went visibly darker (`desktop-09` upper pair).<br>**Assignments that fail:**<br>- **YOU has a new tone of his own:** c02 99.4, c19 101.2, c21 about 100. r1 named c02 YOU and c19 YOU as dark-class. YOU is now medium, which also moves c21 #12 off r1 Keep 3's reference (r1: (190,114,66)).<br>- **The c16 blue team:** only one dark player in my crop. The others are 104.4, 112.2 and 188.4 (`desktop-08` lower pair is unchanged from r1).<br>- **The referees:** c16 168.3, c07 128.3 and c17 142.1, and the c18 referee is visibly pale peach in my crop. Only c15 is dark.<br>**Hue:**<br>- The c15 referee has B/R 0.06 and R:G 2.39. It fails both clauses.<br>- c02 #3 is R:G 1.20 and the c16 back blue player 1.19. Both fail the 1.3 floor.<br>- c19 #42 (2.14) and c21 #53 (2.16) sit just over the 2.1 ceiling.<br>**What still holds:** the luma floor (c15 referee 67) and no skin pixel over 240. |
| **2. Sneakers** | **Open** | My 4x crop of c15 (x 760-1000, y 600-770) still shows five toe ridges on both feet, and there is no toe box.<br>Orange skin shows at the right ankle (about x 935, y 696).<br>The sock is still asymmetric: a white band on the left, only a sliver on the right.<br>The midsole edge is now continuous, but stair-stepped. |
| **3. Armhole piping** | **Closed in the stills I checked** | **c21 far elbow** (3x crop): the gold and maroon ring stays on the torso, and the bent arm is clean.<br>**c17 #2 with both arms raised** (3x crop): the armholes are intact, and the r1 wedge is gone.<br>**c02 #53 left shoulder** (2x crop): no flap.<br>**Not verified:** the jumper burst frames are too small to check f08-f14 at 3x. The c04 shooter (4x crop) shows no tear at that size. |
| **4. Officials' kit** | **Partly. Fails.** | **Now passes:**<br>- short sleeves to mid-bicep (c15, c17, c18; `desktop-08` upper pair BEFORE shows a tank top)<br>- no wristbands in c15<br>**Still fails:**<br>- shorts over black tights instead of full-length trousers (c15 x 820-955, y 385-545; c16 crop; c18 x 390-490, y 560-720)<br>- toe-ridge shoes<br>**New defect:** the neckline sits off the shoulders, so bare shoulders and collarbone show above the stripes (c15 crop, x 840-1000, y 180-230; c18 x 390-490, y 440-475). It reads as an off-the-shoulder top, not an officiating shirt. |
| **5. Mobile card margin** | **Partly. Fails.** | **Row scan of mobile c06** (x 515-600): the shoe's dark pixels end at y 985 (x 521-527), and the card edge starts at y 998. That is about 12 device px (6 css), against the 32 required. Better than r1's 0.<br>**Not checked:** the frames of mobile make-wide. |

---

## 2. Defects, ranked by how often a player sees them

### 1. The skin roster is still wrong in every gameplay frame
- **Evidence:** the table above.
  - YOU is a medium tone of his own (99-101) in c02, c19 and c21.
  - The c16 blue team is 3 of 4 non-dark, with one at 188.4.
  - Five of the six officials in the packet are pale (c07, c16, c17, c18; c15 is the exception).
  - The c15 referee is (122,51,7), with no blue.
  - c02 #3 (207,173,149) reads as paper.
- **Fix:**
  - Bind the tone to the player record and restore the v3-m3-r2 mapping for every character the r1 pass test lists, YOU first.
  - Put the officials in the same table, so the c18, c16, c07 and c17 referees get their m3-r2 tones.
  - Give the darkest ramp step a blue of 30-40% of red. The c15 referee's material is evidently on an old ramp: re-point it.
  - Lift light-tone saturation to R:G 1.35-1.5.
  - Add the cool rim term (0.15-0.2 of the key).

### 2. Hair is still primitive solids in every gameplay frame
- **Evidence:**
  - the c19 #21 blonde flat-topped cylinder (x 465-500, y 455-490) and the #3 black stovepipe (x 425-460, y 500-530), both unchanged from r1
  - sphere-cluster buns on c16 #14 (my crop) and c17 #2 (x 760-830, y 335-375)
  - YOU has a bare skin scalp (c21 #12, x 630-790, y 90-140; mobile c21 the same)
  - #53's hairline is a hard planar step (c21 crop, x 360-540, y 130-200)
- **Fix:**
  - Tapered, sculpted hair shells with feathered hairlines and an anisotropic band.
  - Buns blended to the scalp.
  - A hair asset on every player who isn't authored bald.

### 3. Officials in shorts, tights and an off-the-shoulder shirt
- **Evidence:** c15, c16, c17, c18 and c07 (crops above). There is an official in almost every live frame.
- **Fix:**
  - A separate official body with full-length black trousers to the shoe and a crew or V neckline that covers the trapezius and shoulder caps.
  - Stripes mapped straight. They warp into zebra swirls on the c15 sleeve (x 950-1000, y 200-300) and the c16 torso.
  - Plain black shoes.

### 4. Photographic crowd cards behind toon athletes
- **Evidence:** c15, c18 and c21, where a full-contrast photo face sits next to a toon face. The c18 fans also stand on the floor behind the stanchion.
- **Fix:** milestone 6, the crowd from the character pipeline. Until then, posterize, outline and darken the cards.

### 5. One face template with small eyes
- **Evidence:**
  - the c21 crop: both players have the same brow, small almond eyes with no catchlight, and a line for lips
  - the c15 and c18 referee crops: the same brow and eye
  - The owner's "expressive eyes" direction is unmet, and nothing changed since r1.
- **Fix:**
  - Eyes 30-40% larger, with an iris ring, a cornea catchlight and a lid line.
  - Per-character brow and mouth presets.
  - Lips modelled with a colour shift.

### 6. Toes through the shoes
- **Evidence:** the c15 4x crop, plus skin at the right ankle. This is visible in every close camera, and as a flat "slipper" read in c18 (x 385-505, y 705-755).
- **Fix:**
  - Mask or delete the foot under the shoe.
  - A shoe mesh with a toe box, a bevelled midsole, a lace panel and a school-colour accent.
  - Symmetric sock layering.

### 7. The replay venue void and no light design
- **Evidence:**
  - the c08/c17 far wall at 21.5, against a left wall at 144-152
  - `clippedPct` 0 in every still
  - no lamp bloom or pools anywhere (compare nba2k25-2 on sheet `benchmarks-02`)
- **Fix:**
  - Build the replay gym's far wall and upper bowl, or light it to 60-90.
  - Add bloom on the scoreboard and lamps, and floor pools under the key.

### 8. Body interpenetration in clumps
- **Evidence:** the c19 forearm stack (x 290-420, y 400-600), and c02 #21 into a white defender (x 300-360, y 450-540).
- **Fix:**
  - Torso capsule separation of 0.45 m or more.
  - ±15° arm variance on shared defensive poses.

### 9. The near-plane limb in c21
- **Evidence:** a brown forearm and hand cover x 0-300, y 0-190, median (77,55,50). It is larger than r1's x 0-120.
- **Fix:** fade or hide meshes within 0.4 m of the camera.

### 10. Trim aliasing
- **Evidence:** the stair-stepped gold piping in the c21 far-elbow crop (the yellow edges at 3x), and the c15 midsole steps.
- **Fix:** put the trims in geometry, or use signed-distance trim masks with mips.

### 11. Venue dressing (carried)
- **Evidence:**
  - empty identical chairs (c02, c15, c19)
  - the black table face (c15 x 745-1280, y 390-700)
  - c09 `floorY` 0.138
- **Fix:** the r1 fix list, item 10.

---

## 3. Regressions against v3-m4-r1

1. **The officials' shirt neckline is new and wrong.** The shirt now has sleeves but sits below the shoulders, exposing them (c15, c18). This is a new artifact introduced by the Blocker 4 work.
2. **YOU changed tone class again.** c21 #12 went from (190,114,66), luma about 131, to about (150,85,57), luma about 100. It now matches c02 and c19 YOU at 99-101: neither the r1 light reference (Keep 3) nor the dark class the pass test requires.
3. **The near-plane limb grew** in c21, from x 0-120 to x 0-300.

**No regression in:**
- the hierarchy and ball numbers (c02 `floorCrowd` 3.58, c04 4.40, c05 4.10)
- the skin luma floor
- the kit piping
- the wall surfaces
- the c08/c17 compositions
