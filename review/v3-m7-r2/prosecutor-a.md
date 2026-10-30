# v3-m7-r2: Prosecutor A (art, lighting, setting)

Round: v3-m7-r2, milestone 7, round 2. Previous binding verdict: `review/v3-m7-r1.md` (7.2).
Gate (the campaign stop rule): overall ≥ 8.5, every category ≥ 7, and UI, Typography and Mobile each ≥ 8.

**What I read:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md` (the shared preamble and Prosecutor A), `review/v3-m7-r1.md`
- All 7 sheets
- All 19 before/after plates
- The bursts: desktop-dunk, desktop-dunk-close, desktop-make-wide, desktop-jumper-close
- `benchmarks-02`, plus `SOURCES.md`
- `probe/probe.json`
- **Full-size stills:**
  - desktop: c02, c07, c08, c13, c14, c15, c17, c21
  - mobile: c14, c15, c17

**My crops** (scratch only, nearest-neighbour; the coordinates below are still coordinates):
- **desktop c14:** #2 at 120-330 × 400-730 (2.5x); #15 at 950-1220 × 360-730 (2.2x); the top-left bowl at 0-640 × 0-400 (1.5x); the guest bench at 900-1280 × 230-410 (2x); the pennant at 540-740 × 170-300 (2.5x)
- **desktop c13:** #2 at 0-220 × 300-780; #15 at 1080-1280 × 290-780 (1.6x)
- **desktop c20:** #2 at 0-260 × 330-800; #15 at 1040-1280 × 330-800 (1.6x)
- **desktop c15:** the bench at 0-560 × 180-540 (2x); the official at 660-1010 × 90-420 (2x)
- **desktop c02:** the bench and cheer at 230-850 × 240-370 (2x); the scorebug at 360-920 × 8-92 (2x)
- **desktop c07:** the benches and cheer at 160-940 × 350-510 (2x)
- **desktop c11:** the bench at 0-420 × 270-400 (2.5x)
- **desktop c09:** the ribbon and bench at 380-760 × 190-330 (2.5x)
- **desktop c21:** the armhole at 700-900 × 420-680 (2.5x)
- **mobile c14:** the top at 0-780 × 0-340; the bottom at 0-780 × 1320-1688
- **mobile c06:** the callout at 100-520 × 980-1160 (2x)
- **mobile c17:** the player at 420-780 × 900-1580
- **mobile c21:** 0-780 × 100-900

**My measurements:**
- **Mobile card edges** (a row scan at mid-height): the border is at x 32 and x 746 on c01, c13, c20 and c22, and at x 32-36 and 742-746 on c14. That gives 32 device px margins.
- **Glyph rows** (bright-pixel rows):
  - desktop c02 "FOULS": 65-73 (9 px)
  - desktop c02 shot clock: 66-77
  - desktop c14 disclaimer: 534-545
  - mobile c06 "HOT SPRINGS" subline: about 19 device rows (≈ 9.5 css cap; my 2x crop)

The video and sound are not reviewed. The governor and credits are not shown.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **7** | **Real but narrow fixes:**<br>- the officials wear full-length trousers (desktop-08 and -09 pairs; c15 at 800-960 × 390-700)<br>- the replay icosahedron is gone (desktop-04 lower pair; desktop-09 upper pair)<br>- c14 has two distinct celebration poses<br>**The model itself is unchanged:**<br>- armhole flaps on the menu players (c14 #2 at about 176-190 × 484-514 and 250-270 × 480-505; c20 #15 at about 1140-1152 × 418-455)<br>- halo-blurred numbers (c13, c14 and c20)<br>- slipper shoes<br>- bald bench heads (c11 at about 40-50 × 320-340 and 175-190 × 310-330; mobile c15 at 70-140 × 480-560)<br>- stepped square necklines (c15 bench crop)<br>- gem pom-poms (c07 at 730-930 × 360-410)<br>- the c21 gold armhole flap (805-840 × 555-640)<br>Still mannequins against Playgrounds 2 and Hoop Land. |
| Lighting & materials | **7** | **For:**<br>- desktop c14 `voidPct` is 9.1 → **4.4**, and the old ceiling band is now lit crowd (c14 0-1280 × 0-60)<br>- the desktop hierarchy is kept (`floorCrowd` 3.25-4.14 on c02-c07, c16, c19)<br>**Against:**<br>- `clippedPct` is 0 on every still (no bloom anywhere)<br>- mobile c14 **regresses** to 5.1 (from 4.3), with a flat navy band at 0-780 × 0-140 and a black void at 0-780 × 140-200 and 0-260 × 200-330<br>- mobile `floorCrowd` is 1.96-2.24 on c02, c06, c07, c10, c12, c16 and c19<br>- the mobile c17 depth of field smears the in-focus subject (the "2" haloed, the jersey shading posterized, at 520-680 × 1100-1300)<br>- one plastic skin sheen on every close camera (c21) |
| Animation & game feel | **7** | **Unchanged in the bursts:**<br>- desktop-dunk is still airborne at f15 with no landing<br>- jumper-close holds the arms up f09-f17<br>**Kept:**<br>- the make-wide house build and the official's three signal (f04-f06)<br>- the bench clap now runs at different phases (c15 crop: six figures, six hand separations)<br>Not enough to move it. |
| UI / HUD | **7.5** | **For:**<br>- mobile card margins are now 32 device px (my scan)<br>- the mobile "+3" is gone from the board (mobile-06 first pair)<br>- the card system is consistent<br>**Against:**<br>- no staged player on any phone menu (mobile c13, c14, c20)<br>- desktop c13 and c20 players are still cut by the card and frame (c13 #15 hand behind the card at about 1080 × 470 and arm off-frame at 1270-1280 × 440-470)<br>- the duplicate "YOU" under the scorebug in c21 (510-535 × 90-120; mobile 580-625 × 135-180) |
| Typography | **8** | **Blocker 8's two items are closed:**<br>- the mobile c06 subline is about a 9.5 css cap on a plate (my 2x crop)<br>- the c14 pennant is set in the condensed display face (my 2.5x crop; a faint coloured edge remains on "STATE" at 2.5x)<br>The clock is now in the system condensed face (c02 bug crop). The desktop captions hold a 9 px cap ("FOULS" 65-73). |
| Readability | **7** | **Kept:**<br>- c04 `ballContrast` 6.2, c05 5.53<br>**Unchanged:**<br>- the paint clumps (c02 160-420 × 380-700; c10 sheet)<br>- the mobile `ballPx` of 8.6-11.2 |
| Mobile portrait | **7.5** | **Up a half:**<br>- the margins are at 32<br>- the subline is above the floor<br>- the "+3" is off the board<br>**Still open:**<br>- staging invisible on every phone menu<br>- the flat band and void in mobile c14 (`voidPct` 5.1)<br>- the c15 official cropped by the right edge, face just under the pause button (official 650-780 × 270-1200; pause 668-760 × 162-252)<br>- the mobile c21 skin z-fight patches (340-420 × 570-660)<br>- the dunk `emptyFgMean` of 57.5 |
| Authenticity of setting | **7.5** | **For:** the officials now read as officials (long trousers in c06, c07, c15, c18 and c22).<br>**Open:**<br>- "S?ATE FINALS" behind heads in c09 (460-570 × 238-260)<br>- the c21 1996 BOYS banner (785-880 × 160-290) against the c20 fact (1997/1998 girls, 1998 boys)<br>- twelve identical V-pose bench figures in white unitards on c14 (my crops)<br>- the gem pom-poms |
| **Overall** | **7.3** | (7 + 7 + 7 + 7.5 + 8 + 7 + 7.5 + 7.5) / 8 = 58.5 / 8 = 7.3125.<br>**The gate fails:** overall 7.3 against 8.5, UI 7.5 against 8 and Mobile 7.5 against 8.<br>The gain over 7.1875 is +0.125, under +0.2 (plateau). |

---

## 2. Defects, ranked by how often a player sees them

### D1. Bench and crowd figures: bald heads, stepped necklines, slipper feet (every gameplay frame)
- **Evidence:**
  - **c11 bench crop:** two of six seated figures are bald pale heads (#1 at about 40-50 × 320-340; #4 at about 175-190 × 310-330). The standing red-shirt fan at about 340-360 × 300-320 is also bald.
  - **c15 bench crop (2x):** every tank top has a flat, stepped rectangular neck cut (for example #2 at about 165-200 × 275-290 in the still). Every foot is a white slipper blob with no sole (40-400 × 420-500).
  - **mobile c15:** the bald bench head at 70-140 × 480-560 and the jagged neckline at 85-160 × 580-640, at phone size, near the centre of the frame.
  - **c14 desktop:** the bald head in the guest bench, my crop at about 1130 × 280.
- **Fix:**
  - At least 3 hair meshes, or a cap, assigned to every bench and crowd head. Pale skin with no hair is the default to remove.
  - A painted, anti-aliased neckline (a texture, not a geometry step).
  - A soled shoe on the instanced body.

### D2. Bench pose: better, but still one routine
- **Evidence:**
  - **c15 bench:** the six figures now show six different hand separations, and #6 raises one arm (my 2x crop). That is a real change from r1.
  - **c02 bench (230-850 × 240-370 crop):** five of six figures are still elbows-out at the chest in the same seated leg pose.
  - **c11 bench:** #3 and #4 are mirror-identical hands-up at the shoulders (about 120-200 × 300-340).
  - **c14:** both benches, six and six, stand in the **same** V pose in white unitards (top-left crop at 80-330 × 270-400; guest crop at 950-1200 × 270-400). That reads as clones on the most important screen in the game.
- **Fix:**
  - Draw seated poses from 4-6 variants (lean back, elbows on knees, towel, arms crossed, standing clap), not just phases of one clap.
  - On c14, mix the bench into jump, hug, arms-up and fist-pump, with ±15% timing.
  - Dress the c14 bench in their jerseys, not unitards.

### D3. Menu hero players are still the mannequin (every menu visit)
- **Evidence:**
  - **c14 #2 (2.5x):** white flaps stand off both armholes (about 176-190 × 484-514 and 250-270 × 480-505), the "2" has a dark halo, and the shoes are slipper blobs (190-300 × 670-720).
  - **c14 #15 (2.2x):** a flap at the left armhole (about 1016-1032 × 435-447), and a halo "15".
  - **c20 #15:** flaps at both armholes (about 1140-1152 × 418-455).
  - **c13 and c20 #2:** the same hands-up-at-the-shoulders pose in both menus. It is also c14 #2's pose (compare my three crops). One pose is reused across three screens.
  - **c13 and c20 #15:** still the arms-out near A-pose. desktop-07 and desktop-10 show before and after identical.
  - **Framing:** in c13, #15's right arm leaves the frame at x 1270-1280 × 440-470, and the left hand goes behind the card at about 1080 × 470. c20 #15 is the same.
- **Fix:**
  - Weld the jersey panels under the arm.
  - Number decals at 2x with clean alpha.
  - A soled shoe.
  - One authored idle per menu (ball on hip for c13, ball spin for c20, arms crossed for the hub), never the A-pose.
  - Pull both players about 80 px inward so their hands clear the card and the frame.

### D4. No bloom, no light that reads as a source (every frame)
- **Evidence:**
  - `clippedPct` is 0 on all 44 stills.
  - The make-wide rim flash (f00) and the c14 confetti show no glow.
  - Against nba2k27-1 (lamps blooming) and nba2k26-1 (rim light), the house reads as evenly lit.
- **Fix:**
  - A threshold bloom (luma > 0.9) on the rim flash, the ribbon boards, the scoreboard LEDs and the c14 truss.
  - One rim light on the players in close cameras.

### D5. Mobile c14 is a dark, empty screen (regression in the probe)
- **Evidence:**
  - `voidPct` is 4.3 → **5.1**.
  - A flat navy band at 0-780 × 0-140, and a black void at 0-780 × 140-200 and 0-260 × 200-330 (my top crop).
  - No posed player anywhere outside the card.
  - Below the card, only bare floor with 3 confetti flecks: (306,1581), (233,1656), (707,1626). At most 1-2 more sit in the 32 px right strip at about 750-770 × 900-1040.
  - The desktop c14 improvement did not reach the phone.
- **Fix:**
  - Tilt or offset the mobile c14 camera so the bowl fills 140-330.
  - Drop the flat band.
  - Stage one celebrating player (head and torso) in the 1320-1688 floor area below the card.
  - Spawn confetti across the full width.

### D6. Close-camera surfaces (c21; every close camera)
- **Evidence:**
  - **desktop c21:** the gold armhole piping stands off the body as a loose flap, with a maroon backface showing (about 805-840 × 555-640; my 2.5x crop). The "53" has a dark halo (470-680 × 650-800).
  - **mobile c21:** blotchy skin patches on the pale player's nose and cheek (about 340-420 × 570-660).
- **Fix:**
  - Cap the armhole and bake the piping into the jersey texture.
  - A polygon offset, or a 5-10 cm separation, for the overlapping c21 bodies.

### D7. Setting detail
- **Evidence:**
  - **c09:** "STATE FINALS" crossed by bench heads (460-570 × 238-260; my 2.5x crop). The second "HOT SPRINGS, ARKANSAS" is crossed by a head and the official (870-1010).
  - **c21:** the 1996 BOYS banner (785-880 × 160-290), while c20 states 1997 and 1998 girls and 1998 boys.
  - **c14:** "HOT SPRINGS, ARKANSAS" runs behind the bench at 100-330 × 330-350.
  - **The gem pom-poms:** c02 at 230-420 × 255-300; c07 at 730-930 × 360-410.
- **Fix:**
  - Raise the ribbon 0.4 m.
  - Change the banner to 1997 / 1998 GIRLS and 1998 BOYS.
  - Strip-cluster pom-poms.

### D8. The c15 official: trousers fixed, pose and yoke not
- **Evidence:**
  - **Fixed:** full-length black trousers (c15 at 800-960 × 390-700; mobile c15 at 650-780 × 700-1200).
  - **Not fixed:** the stripes on the chest and shoulder still curve and swirl. In my 2x crop of 660-1010 × 90-420, the arched stripe runs across the right shoulder at about 900-990 × 200-280.
  - **Not fixed:** the pose is still arms-out with palms forward. desktop-08's top pair is identical before and after.
- **Fix:**
  - UV-straight stripes on the yoke.
  - Drive c15 from the idle or signal set.

### D9. Mobile replay depth of field smears the subject
- **Evidence:**
  - mobile c17: the in-focus shooter has a halo "2" and posterized jersey shading (about 520-680 × 1100-1300).
  - A smear ring on the floor around the silhouette (about 430-520 × 1150-1400).
  - Painterly blotches on the left wall (0-210 × 400-900).
- **Fix:** Exclude the subject's depth from the blur, or use a separable Gaussian in place of the current filter on mobile.

### Packet note (not scored)
- `bursts/desktop-dunk-close.png` f00 is fully black, and from f08 to f15 the crop loses the dunker: only the rim and an official remain. The close crop does not track the dunker, so it cannot be used to judge the dunk body. `desktop-dunk.png` f10-f15 is used instead.

---

## 3. Regressions and the r1 blockers (my lens, with the others noted)

| r1 blocker | My ruling | Evidence |
|---|---|---|
| **1:** Replay foreground | **Closed** | **desktop c17:** no sharp prop at 0-90 × 480-590. The left-edge cheer figures (0-90 × 420-660) are blurred like the house. **desktop c08:** the green faceted prop at 20-145 × 545-645 is gone (desktop-04 lower pair). **Mobile c08 and c17:** clean (mobile-03 and -06). |
| **2:** Bench lockstep and cheer | **Partly** | **c15:** six phases, which I read as passing the "3 adjacent" test. **c07 cheer:** three distinct arm positions (730-930 × 360-505). **c11:** #3 and #4 are identical, but only two. **Against:** c14's two benches of six identical V poses (not in the test list, but a new exposure); c02 five of six elbows-out. |
| **3:** Officials | **Partly** | **Trousers: pass** in every still I checked (c06, c07, c15, c18, c22; desktop-08 and -09; mobile-06).<br>**Straight stripes in c15: fail** (the shoulder swirl).<br>**The c15 idle or signal pose: fail** (identical arms-out pose). |
| **4:** c14 | **Partly** | **Desktop `voidPct` 4.4: pass.** The bowl, the confetti, the ribbon and the posed players are kept, and #2 and #15 now differ.<br>**Mobile `voidPct` 5.1: fail, and a regression from 4.3.**<br>**Mobile confetti outside the card:** 3 certain, about 4-5 at best (borderline). |
| **5:** Necklines and heads | **Open** | Bald bench heads in c11 and mobile c15. Stepped necklines in c15. The c13 #15 flat brown hair cap on pale skin (about 1130-1180 × 310-345). |
| **6:** Close-camera surfaces | **Open** | The c21 armhole flap with a backface (805-840 × 555-640). The mobile c21 skin patches. |
| **7:** Menu hero players | **Open** | **Flaps:** c14 and c20.<br>**Halo numbers:** all three menus.<br>**Slipper shoes.**<br>**Poses:** #2 shares one pose across c13, c14 and c20; #15 is still in the A-pose in c13 and c20.<br>**Framing:** #15 is cut by the frame and the card in c13 and c20.<br>Only the c14 pose change is real. |
| **8:** Type floor and faces | **Closed** (not my lens) | The mobile c06 subline is about a 9.5 css cap, and the pennant is in the display face. |
| **9:** Mobile menu presentation | **Partly** | **Margins of 32 device px: pass** on c01, c13, c14, c20 and c22.<br>**Staged player visible on mobile c13, c14 and c20: fail.**<br>**The flat band in mobile c14: fail** (0-780 × 0-140). |

### Carried items
- **The dunk:** open (desktop-dunk f15 is airborne).
- **The jumper hold:** open (jumper-close f09-f17).
- **The mobile "+3":** closed on mobile c16 (mobile-06 first pair).
- **Mobile c15 framing:** open.
- **The c09 ribbon:** open.
- **The c21 1996 banner:** open.
- **The duplicate c21 "YOU":** open on both viewports.
- **The net-close harness:** f00 starts with the ball in the mesh (sheet c18 and the mobile-06 pair; not re-verified in the burst).

### New regressions
1. **Mobile c14 `voidPct`** is 4.3 → 5.1, and it now fails its own pass test.
2. **New clone exposure in c14:** lighting the desktop bowl revealed twelve bench figures in one V pose and white unitards (my top-left and guest crops). This is not a code regression, but it is a new visible defect on the payoff screen.
3. **No other gameplay pixels regressed.** The before/after plates for c02-c05, c09-c12 and c19 are visually identical apart from the officials.

**Bottom line:**
- This round fixed:
  - the officials' trousers
  - the replay foreground
  - the desktop c14 ceiling
  - the type floor
  - the mobile margins
- The players, heads, menu models and light sources are the r1 pixels.
- Art and Lighting stay at 7, so the 8.5 gate is arithmetically out of reach this round.
