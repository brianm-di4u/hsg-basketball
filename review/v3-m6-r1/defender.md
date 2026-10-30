# v3-m6-r1: Defender brief

Round v3-m6-r1 (milestone 6, round 1): a 3D crowd replacing the photo cards, outcome reactions, bench players and coaches, apron dressing, and carried animation fixes. Milestone 6 targets are Authenticity 8.0, Art 8.0 and overall 8.2. Before/after pairs compare with v3-m5-r2.

**What I read:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md` (Defender), and `review/v3-m5-r2.md`
- All 7 sheets and all 19 before/after pairs
- **Full-size stills:** desktop c02, c06, c09, c15, c16, c17, c18, c19, c21; mobile c06, c15, c21
- **Bursts:** desktop make-wide, net-close, dunk, dunk-close, jumper-close, drive-close, open-play, open-play-close; mobile make-wide
- `probe/probe.json`, and `benchmarks-03`

**My crops** (scratch only):
- c15 bench (0-700, 180-600) at 2x; c15 crowd (640-1280, 80-420) at 2x
- c06 crowd (480-1000, 200-480) and c06 bench (0-520, 300-480) at 2.4x
- c17 shooter (660-900, 440-640) at 3x
- c21 #53's armhole (680-900, 420-680) and c21 baseline fans (880-1120, 420-640) at 2.5x
- c19 handler (760-960, 430-620) at 3x; c02 bench row (250-900, 260-370) at 2x
- mobile c06 shoe-to-card (500-680, 900-1030) at 4x
- the crowd band of make-wide f00, f02, f06, f11 and f13 at 2x
- the rim region of all 16 dunk frames at 2x; the net in all 12 net-close frames at 2x

**My measurements:**
- **Net hem:** the lowest net-white row in tile columns 200-235 of each net-close tile. Tile origins are x 6/432/858/1284 and y 6/300/594.
- **Mobile c06:** luma columns at x 555-600, y 960-1010.
- **Box medians (sRGB):**
  - c15 referee face (872-890, 140-158) = (122,51,5)
  - c08 far wall (900-1200, 120-300) = (29,16,3)
  - c14 bottom band (0-1280, 650-800) = (65,41,20)
  - c02 YOU face (675-680, 425-435) = (151,87,60)

The webm and sound are not reviewed or scored.

---

## 1. Scores

| Category | Score | One-line case |
|---|---|---|
| Art: players, court, venue | **7** | The 7 anchor's "depth on all sides (benches, near side, ends)" is now in the pixels: both benches are filled and fans stand behind the baseline. The new crowd geometry has visible artifacts (garment patches, sawtooth collars, chest rectangles), and the carried piping and hand-on-head defects remain. |
| Lighting & materials | **7** | The court is clearly brighter than the house in every desktop gameplay still (`floorCrowd` 3.18-4.08), ball contrast rose sharply, and floor sheen and contact shadows are kept. Against it: c14 `voidPct` got worse (18.5), the c08 far wall is unchanged (29,16,3), `clippedPct` is 0 everywhere, and the mobile hierarchy is still weak (1.96-2.2). |
| Animation & game feel | **7** | The net now passes its stretch clause (+36-41% by my scan), the replay shows a set point, and the crowd and benches react. The dunk float and the frozen follow-throughs are unchanged, and r2 ruling 2 made the half step conditional on the ground load, which is still missing. |
| UI / HUD | **7** | Unchanged and correct: "3 POINTS" with "+3", and "SLAM DUNK" with 2 points. The mobile "+3" still sits over the backboard. |
| Typography | **6.5** | Unchanged; this is milestone 7. |
| Readability | **7.5** | One of r2's four readability deductions (the ball-contrast slide) is now reversed by a wide margin: c04 6.01, c05 5.43, jumper minimum 3.00. The darker house makes every desktop gameplay figure pop. The off-ball paint mass and the c19 lockstep remain. |
| Mobile portrait | **7** | Players are about 83 px, the basket is in view, and the thumb deck is clear. The card margin is about 8 device px against 32, the "+3" is over the board, and `floorCrowd` is about 2. |
| Authenticity of setting | **7.5** | Every item named in the 7 anchor is now on screen: banners, benches, students, scorer's table. There are team-coloured sections in each gym, kitted benches, standing coaches and a baseline cheer group. The officials' kit, the c15 official's pose and close-camera crowd quality keep it under 8. |
| **Overall** | **7.1** | (7 + 7 + 7 + 7 + 6.5 + 7.5 + 7 + 7.5) / 8 = 56.5 / 8 = 7.06 |

**Against the targets:** I concede that none of the milestone 6 targets is met (Authenticity 7.5 against 8.0, Art 7 against 8.0, overall 7.1 against 8.2). This round is still the largest single gain since v3-m5-r1: +0.25 against r2's 6.8.

---

## 2. Strengths (with evidence)

### S1. The photo cards are gone, and the house is now built from 3D, posed, team-coloured people (milestone 6, item 1)
- **Every before/after pair with a crowd** shows flat photo fans replaced by modelled figures with bodies, limbs and seats:
  - `desktop-01` lower pair; `desktop-02` both pairs; `desktop-03`, `-04`, `-05`, `-06`; `desktop-08` upper pair
  - `mobile-01`, `-02`
- **The c15 crowd (my crop of 640-1280, 80-420)** has depth and parallax. The fans sit on tiers at different depths, turn their torsos, and their hands are articulated (clapping, open palms). The photo cards could not do any of this (`desktop-08` upper BEFORE: flat portraits behind the chairs).
- **The colours follow each gym and matchup:**
  - **Hot Springs** (c02, c19): black and gold, with maroon sections for Lake Hamilton
  - **Lakeside home** (c03-c05): blue, gold and green for Fountain Lake
  - **Jessieville** (c10): purple
  - **Mountain Pine** (c11): red
  - **The state finals** (c09): a mixed bowl
- **There is no repeated-sprite tiling.** No two adjacent fans in my c06 crowd crop share the same pose and shirt colour.

### S2. Both benches are filled, and they react to the outcome (milestone 6, items 2-3)
- **Home bench (HSHS):** black tops and gold shorts.
  - **c02 (my crop, 640-1180, 285-360):** eight seated players, with two empty orange chairs left for the staff at 505-560.
  - **c15 (my crop):** seven seated players, clapping, with forearms and hands raised (about 60-520, 210-500).
  - **c16:** the bench at the far left (0-150, 280-340).
  - **c19:** the bench at 630-900, 285-350.
- **Visitor bench (LHS):** blue kit.
  - **c06 (my crop, 130-470, 340-460):** six seated players with their **arms crossed** on the frame after a Hot Springs three, beside a seated coach in black at about 120-175, 350-460.
  - That is a partisan, outcome-specific reaction: the home side celebrates while the visitors sulk. It is exactly the "outcome reactions" this milestone asks for.
  - **c16:** the same blue bench at 740-1000, 260-330.
- **Coaches:**
  - **c15:** a standing coach in a black top and olive trousers, with a raised arm (550-700, 110-590).
  - **c09:** a standing figure beside the state-finals bench (680-700, 230-310).
- **Mobile c15 (sheet `mobile-02`)** shows the same bench and coach composition.

### S3. The crowd answers a make, and keeps answering
- **c06 (+1 frame):** most of the stand has its arms out or up (my c06 crop). The baseline group in black has its arms overhead (690-860, 340-475).
- **c16 (0.8 s later):** the poses have changed. Arms are overhead across the upper tiers (0-1280, 30-240), not the arms-out pose of c06, so the reaction animates over time rather than holding one frame.
- **make-wide (my crowd-band crops):** f00/f02 show arms out; by f06, f11 and f13 there are more raised and varied arms, with standing fans in the upper rows. The reaction lasts at least 13 frames × 5 ticks ≈ 1.1 s.
- **net-close:** the fans behind the basket raise their arms from f05 to f11 (the white-clad fan at tile ≈ 245-290: arms low at f00, out at f04, overhead at f06-f11).
- The 7 anchor asks for "a crowd that answers a make", and this one does, in 3D.

### S4. The net reaction now passes its stretch clause (r2 Blocker 2)
My measurements of the lowest net-white row in desktop net-close (rim top at tile row 57-58, rim tube rows 60-72):

| Frame | Hem row | Rim top to hem (px) |
|---|---|---|
| f00 | 144 | 86 |
| f01 | 147 | 89 |
| f02 | **149** | **91 (peak)** |
| f03 | 141 | 83 |
| f04 | 142 | 84 |
| f05 | 132 | 74 |
| f06 | 130 | 72 |
| f07 | 126 | 68 |
| f08 | **125** | **67 (settled)** |
| f09 | 126 | 68 |
| f10 | 129 | 71 |
| f11 | 130 | 72 |

- **The stretch:** the peak is about **+36%** over the settled f08 length measured from the rim top, or about **+41%** measured from the rim centre (row ≈ 66). The pass test is 15%. r2 measured about 11%.
- **It settles fast:** from f02 to f07 is 10 ticks, about 0.17 s, inside the 0.5 s limit. f10-f11 show a small damped rebound (+4-5 px), which is the recoil fix 3 asked for.
- **The rim flash is kept** (f00-f03, white-hot ring in my crops).
- **The hem rounds over the ball** at f04-f05 (my 2x crops). Its width measurement is noisy through the mesh holes, so I don't claim a measured flare.

### S5. The replay beat moved to the set point (r2 Blocker 4)
- **Desktop c17 (my 3x crop):** the ball (about 805-865, 485-550) is above #2's shoulder line (about y 560-580). The shooting forearm rises under it (about 850-885, 510-560), and the guide hand is up at about 705-730, 450-480. In r2 the ball was at the hip with both arms low (`desktop-09` upper pair: BEFORE against AFTER).
- **Mobile c17** (sheet `mobile-03`, `mobile-06`): the same set point, with the ball over the right shoulder.
- **The r2 focus is kept:** #2's number, headband and ball are crisp, and the crowd and wall are motion-blurred.

### S6. The carried crowd-exposure blocker is closed by the probe
r2 cited these numbers, with their pass lines, against the photo-card crowd. All three now pass on desktop, and the mobile release frames pass too:

| Measure | r2 | Now | Pass line |
|---|---|---|---|
| c04 `ballContrast` | 4.29 | **6.01** | 4.5 |
| c05 `ballContrast` | 4.17 | **5.43** | — |
| Jumper burst `ballContrastMin` | 2.39 | **3.00** (mean 4.95) | 2.6 |
| c16 `floorCrowd` | 3.01 | **3.35** | — |
| Mobile c04 / c05 `ballContrast` | — | 4.66 / 4.43 | — |

- **Desktop gameplay `floorCrowd`:** c02 3.85, c03 3.85, c04 4.08, c05 4.05, c10 3.47, c11 3.32, c19 3.48. In every desktop gameplay frame the court is clearly the brightest plane, which is the 7 anchor for Lighting.

### S7. Mobile card margin: improved, though still short
- **My 4x crop and luma scan of mobile c06:** the trailing sole of #0 ends at about y 989-990, and the card's top edge is at y 998 (every column from x 555 to 600 drops to luma ≈ 20 at y 998).
- That is about **8 device px**, against r2's 4. The direction is right, but it still fails 32 (concession C6).

### S8. Keeps verified
- **The callouts:** "3 POINTS" with "+3" (make-wide f00-f06 desktop, f00-f04 mobile), and "SLAM DUNK" with the score at 2 (dunk f14-f15).
- **The officials' made-three signal:** net-close, arms low at f00 and rising at f01-f03, with the signal f04-f11. Also make-wide f01-f06.
- **The dunk body clearance** (my rim crops, f04-f15).
- **The run cycle and floor dribble:** drive-close f01-f06.
- **The ball under the palm in c19** (my crop).
- **The bound hair:** the c19 and c17 buns.
- **The setting:** the banners, wordmarks and STATE FINALS ribbons (c09, c21).
- **The player sizes:** desktop `playerPx` 141-207, mobile 82.5-87.5 in c02-c05.

---

## 3. Pre-emptive rebuttals

### R1. "The new crowd is a dark mush; the photo crowd was better"
- **The darker house is the rubric's 7-anchor hierarchy** ("court brightest, house dimmer"), and it bought measurable readability (S6).
- **It isn't a void:**
  - `voidPct` is 0-1.6 in every desktop gameplay still (c02 0.3, c03 0.1, c04 0.7, c05 1.6, c06 1.3, c10 0, c16 0, c19 0.4).
  - In my c06 crowd crop every figure is separable: shirt colour, skin, hair, arms and seat rows.
- **The benchmarks set the same convention:** the NBA 2K houses in `benchmarks-03` (nba2k26-2, nba2k27-2, nba2k27-3) are far darker than their courts.
- **What I concede:** the crowd is less colourful than the photo cards, and individual faces read less at gameplay distance (C1).

### R2. "The crowd is frozen / one T-pose copied across the stand"
- **c06 against c16** (the same make, 0.8 s apart) shows different poses. c06 is mostly arms out; c16 is arms overhead across the top tiers.
- **make-wide** f00 → f06 → f13 (my crowd-band crops) shows arms rising and fans standing.
- **The c06 crop has at least five distinct postures:**
  - arms out
  - one arm up
  - hands on chest
  - arms crossed (the visitor bench)
  - both arms overhead (the baseline group)
- **What I concede:** many fans at c06 share the horizontal arms-out pose, which reads as a stiff "airplane" pose at the first frame (C3).

### R3. "The bench is cosmetic: no reaction"
- **The visitor bench crosses its arms** while the home crowd celebrates (c06, my bench crop, 130-470, 340-460).
- **The home bench claps** (c15, with both hands up and fingers spread on six players).
- These are two different poses keyed to the two sides of one outcome.

### R4. "Black voids" in c08, c17, c15 and c18 (`voidPct` 13.7 / 12.3 / 11.7 / 10.3)
- **c08 and c17:** most of it is the replay letterbox. The bars are 0-55 and 745-800, 111 rows of 800, so about 13.9% of the frame is pure black by design.
- **c15:** the large dark block (about 745-1280, 400-700) is the black-painted face of the scorer's table, with its lettering ("E" at about 945-960, 500-540). That is a modelled prop, not a hole.
- **c15 `floorCrowd` 0.78 and `floorY` 0.0049:** the probe's floor samples land on the dark apron and table, not the maple. It measures the wrong surface.
- **c18:** the dark mass is the stanchion pad and the under-basket shadow (right half), with the fans and the wall behind it lit.

### R5. "The net still doesn't react"
- The pass length test is met by a wide margin (S4: +36-41% against 15%), and it settles in about 10 ticks.
- The unmet sub-clauses are the rest frame and a measured flare (C4). A claim of "no reaction" is contradicted by hem rows 149 → 125.

### R6. "The replay still misses the release"
- c17 on both viewports shows the ball above the shoulder at the set point (S5), not the r2 hip gather.
- The remaining gap is the guide hand's distance (C5), not the beat.

### R7. Dunk `ballContrastMin` 1.05 (desktop) and 1.12 (mobile)
- As in r2 ruling 10, these sample the ball held in the hand against skin and the dark stand.
- They are not a gameplay readability fault. The loose-ball stills are 4.43-6.01.

### R8. "The crowd doesn't fit an Arkansas high-school gym"
- The stands are high-school bleachers, not a bowl, in c02, c06, c16 and c19: wooden tiered benches with an orange rail.
- The standing back row is a student section (c02 and c19, the top row at 0-1280, 10-100, all standing).
- The baseline cheer group is on the apron (c06), and the bench chairs are the gym's orange folding chairs (c02).
- The state-finals bowl (c09) keeps its tiered arena seating under the "HOT SPRINGS, ARKANSAS" ribbon.

---

## 4. Concessions

### C1. New crowd-mesh artifacts, visible in every close camera and some gameplay frames
- **Brown, torn-looking patches through garments.** Skin or another layer shows through clothing in jagged islands:
  - the c15 coach's olive trousers at the hips (about 590-640, 320-390)
  - the c18 white-clad fan (about 780-835, 380-500) and the black-clad fans' legs (about 250-330, 300-420)
  - the c21 baseline fans (about 940-985, 535-560)
  - the c06 baseline cheer group (about 755-790, 383-421)
  - mobile c15, where the coach's legs and torso are worst (about 300-440, 480-700)
- **Rectangular brown chest and neck patches** on most fans: c15 (for example 1015-1030, 85-95; 945-960, 145-155), and c06 throughout the crowd crop.
- **Sawtooth white collar outlines** on the bench players and fans (c15 bench at about 300-330, 262-272 and repeated along the row).
- **Faceted, featureless faces** at close range, such as the mobile c15 coach (about 330-380, 300-390).
- **The bench players' thighs are flat gold slabs** (c15, about 65-470, 330-420).

These are the main Art and Authenticity deductions this round.

### C2. The dunk (r2 Blocker 1) is unchanged: Open
- My rim crops show the hand and ball at the rim front at f08-f09, the ball above the ring at f10-f12, and through it at f13-f14.
- The dunker is airborne from f02 to f15, with no hang and no landing.
- dunk-close still has a black f00, and it loses the dunker from f08 (harness).

### C3. The jumper and pull-up have no anticipation or follow-through change (r2 fix 2): Open
- **jumper-close:** f01 knees are only slightly bent; the real bend comes at f02. The follow-through holds from f09 to f15, and the arms only start down at f16-f17.
- **drive-close:** the overhead "diamond" holds from f10 to f15, and f00 is half black (harness).
- The first make frame's crowd is largely one arms-out pose (R2).

### C4. The net is partly done
- f00 already has the ball inside the net, so there is no rest frame. The pass test asks for the capture to start before the ball enters.
- My width scans can't confirm a hem flare.
- Mobile net-close is not measured by me.

### C5. Replay: the guide hand
In desktop c17 the guide hand (about 705-730, 450-480) is about 80 px from the ball's left edge, roughly 1.5 forearm lengths. "Within one forearm of both hands" is only met for the shooting hand.

### C6. Armhole piping (r2 Blocker 3): Partly
- **c17 (my 3x crop):** reduced to thin green slivers off both shoulders (about 710-732, 577-580 and 847-863, 580-583). That is much smaller than r2's flap at 752-762, 470-490, but still outside the silhouette.
- **c21 (my 2.5x crop):** the gold panel still bridges the gap between #53's torso and arm (about 804-830, 552-656), with a magenta sliver at about 818-834, 556-574. This is unchanged from r2.
- **Mobile c21:** the yellow panel still projects into the arm opening (about 170-310, 830-990). There appears to be a lighter patch on YOU's cheek (about 355-410, 580-650).

### C7. c14 `voidPct` got worse
It is now 18.5 on desktop (r2: 15) and 6.2 on mobile (r2: 5.1), against under 5. The 3D bowl crowd is darker than the photo cards it replaced (`desktop-07` lower pair). The c14 bottom band is unchanged at (65,41,20).

### C8. Carried defects, unchanged
- **Skin:** the c15 referee face is (122,51,5), and the c02 YOU face is (151,87,60).
- **The c08 far wall** is (29,16,3).
- **The officials' kit is unchanged:** a scoop neckline and sleeves off the shoulder cap (c15, c18).
- **The c15 official** still holds the arms-out pose (`desktop-08` upper pair).
- **YOU's hand on the c19 handler's head** (my crop, about 847-860, 463-470).
- **The c19 lockstep defenders** (300-420, 400-600).
- **The eight-player paint mass** (open-play f00-f15).
- **The mobile Select footer:** "Cutter-" and "Jessieville" below BACK/TIP OFF (mobile c13).
- **Mobile "+3":** still over the backboard (mobile make-wide f02-f13).
- **Mobile `floorCrowd`:** 1.96-2.2 in c02, c06, c10 and c16.
- **Mobile c06:** the card margin is about 8 device px against 32 (S7), and the orange blotch around the planted foot is still there (my crop, about 532-588, 950-983).
- **Mobile `emptyFgMean`:** 57.76 in the dunk.
- `clippedPct` is 0 in every still; there is no bloom.

### C9. Partisanship stops at the bench
In c06 and c16, blue-shirted fans (Lakeside's colours, per the c13 chips) also raise their arms for a Hot Springs make. Only the benches split by allegiance.

### C10. The cheerleaders lost their pom-poms
The photo cards had pom-pom cheerleaders on the apron (`desktop-02` BEFORE c03/c04, `desktop-04` BEFORE c07). The new baseline group (c06) has none.

---

## 5. Status of r2 blockers, as the Defender sees them

| r2 item | Status | Evidence |
|---|---|---|
| **Blocker 1:** the dunk | **Open** | C2 |
| **Blocker 2:** the net | **Partly; length and settle met** | S4. Rest frame and flare not met (C4). |
| **Blocker 3:** piping | **Partly** | c17 improved to slivers; c21 and mobile c21 unchanged (C6). |
| **Blocker 4:** replay beat | **Closed on the beat, partly on the guide hand** | S5, C5 |
| **Blocker 5:** showcases | **Partly; c14 worse** | c21 faces are kept; c14 `voidPct` 18.5 (C7). |
| **Carried:** crowd exposure | **Closed** | S6 |
| **Carried:** mobile card margin | **Improved, still open** | 4 → about 8 device px (S7, C8) |
| **Carried:** skin, officials' kit, Select footer | **Open** | C8 |
| **Fix 7:** off-ball variety | **Open** | C8 |
| **Fix 10:** crowd and benches (milestone 6) | **Delivered** | S1-S3, with the defects in C1 |
