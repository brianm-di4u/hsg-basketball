# v3-m7-r2: Defender brief

Round: v3-m7-r2 (milestone 7, round 2). The before/after pairs compare with v3-m7-r1. The binding verdict is `review/v3-m7-r1.md` (7.2).

**Inputs:**
- **Read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md` (Defender), `review/v3-m7-r1.md`
- **Sheets:** desktop-01 to -04; mobile-01 to -03
- **Before/after:** all 11 desktop and 8 mobile pairs
- **Full stills:**
  - desktop c01, c08, c13, c14, c15, c17, c20, c21
  - mobile c06, c14, c15, c20, c21
- **Bursts:** desktop-dunk, -dunk-close, -jumper-close, -make-wide, -net-close, -open-play-close; mobile-dunk, -make-wide
- **Benchmarks:** benchmarks-03
- **Probe:** `probe/probe.json`

**My measurements.** Crops are nearest-neighbour, in still coordinates. Row scans count rows with bright text pixels.
- **mobile c06, the "HOT SPRINGS" subline:** rows 1110-1130, a 21-row cap. That is a 10.5 css cap.
- **Desktop caption caps** are all 9 rows:
  - c14 disclaimer 534-542
  - c20 "Then:" 542-550
  - c20 Source line 668-676
  - c20 RIVAL chip 472-480
  - c20 eyebrow 156-164
  - c13 GAME COLORS chip 335-343
  - c02 scorebug FOULS 65-73
- **The mobile card edge** (border colour 46,58,99), scanned at y 590, 844 and 1181: x = 32 and 747 on c01, c13, c14, c20 and c22. That leaves 32 device px on both sides.
- **c13 against c20, a diff of the left hero (0-200 × 300-800):** 0.0% of pixels differ by more than 24 luma. The two frames show the same pose.
- **mobile c14, near-black pixels (luma under 16):** 12.7% of the frame, and 80% of them sit in the top strip at y 0-330.
- **Confetti outside the card on mobile c14:** five flecks, at (752,922), (771,1037), (306,1578), (234,1655) and (707,1626).

---

## 1. Scores

| Category | r1 final | **Defender** | One-line case |
|---|---|---|---|
| Art: players, court, venue | 7 | **7.5** | Three m6-era Art blockers moved in the pixels:<br>- the replay prop is gone (desktop-04 lower pair, desktop-09 upper pair)<br>- the bench clap lockstep is broken (c15 crop)<br>- the officials wear full-length trousers in every still<br>c14's heroes now hold authored celebration poses. The flaps, the haloed numbers, the c21 armhole and the bald heads stay open (section 4). |
| Lighting & materials | 7 | **7** | Desktop c14 `voidPct` is 9.1 → **4.4**, which passes the under-5 test, and the bowl now fills 0-1280 × 0-150. The rest is unchanged:<br>- `clippedPct` is 0 everywhere<br>- mobile `floorCrowd` is 1.96-2.24<br>- mobile c14 `voidPct` is 5.1 |
| Animation & game feel | 7 | **7** | The crowd and bench answer with varied phases (c15, c11, c09, c02 crops). Make-wide f00-f06 keeps the rim flash, the net and the official's signal. The dunk and jumper bursts are the same as r1, so no gain is claimed. |
| UI / HUD | 7.5 | **8** | Three of r1's "not 8" items are closed:<br>- the mobile "+3" is gone (mobile c16; mobile-make-wide f00-f13)<br>- the mobile card margin is 32 device px<br>- c13 #2 no longer touches the card<br>The clock is now set in the system's condensed face (my c02 2.5x crop). The card system is unchanged. **Against:** mobile menus still have no staged player, and the c21 duplicate YOU remains. |
| Typography | 7.5 | **8** | Both clauses of Blocker 8 pass:<br>- the subline is a 10.5 css cap on a black plate (mobile c06 1110-1130)<br>- the pennant is re-lettered in the display face (c14 550-730 × 175-290)<br>The desktop 9 px floor holds on all seven caps I scanned. The clock moved off the generic monospace. **Residual:** faint subpixel fringing on the pennant at 3x. |
| Readability | 7 | **7** | The keeps hold: c04 `ballContrast` 6.20 and c05 5.53, both well over 3. The paint clumps and c19 are unchanged. |
| Mobile portrait | 7 | **7.5** | Three carried items are closed: the margins (32 device px), the "+3" on the board, and the sub-floor subline. **Open:**<br>- no staged player on mobile c13, c14 or c20<br>- the c14 top band<br>- c15 framing<br>- the dunk `emptyFgMean` of 57.5<br>- the c21 skin patches |
| Authenticity of setting | 7.5 | **8** | The officials are in black slacks in c06, c07, c08, c15, c17, c18 and c22. The benches read as a team of individuals (c15, c11, c09). The cheer group shows distinct poses (c02, c06). The c14 finals bowl is full to the rafters. **Open:** the c09 ribbon and the c21 1996 banner. |
| **Overall** | **7.2** | **7.5** | (7.5 + 7 + 7 + 8 + 8 + 7 + 7.5 + 8) / 8 = 60 / 8 = **7.5**, a gain of +0.31 over r1, so this round is **not a plateau**. **The gate still fails:** overall 7.5 against 8.5, and Mobile 7.5 against 8. I do not claim the stop rule is met. |

---

## 2. Strengths, with evidence

### S1. The replay foreground intrusion is gone on desktop (Blocker 1)
- **desktop-04 lower pair (c08):** in BEFORE, the green faceted prop sits at the left edge, about 15-80 × 710-800 in pair coordinates. In AFTER, the same region shows the cheer group standing at the baseline.
- **desktop-09 upper pair (c17):** the green prop at the BEFORE left edge (8-55 × 245-300) is gone in AFTER.
- **Full desktop c17:** everything at 0-280 × 400-700 is depth-of-field blurred, including the official and the green-shirted fans (my c17 2x crop). Nothing sharp intrudes.
- **Full desktop c08:** the figures at 0-160 × 465-730 stand beside the official at courtside depth (my c08 2x crop). They are in focus, and so is the whole of c08: it has no DOF, and the backboard and far crowd are just as sharp. They are part of the scene, not a foreground occluder. (Rebuttal R1 has more.)
- **Mobile c08 and c17** stay clean (mobile-03 middle pair; mobile-06 middle pair).

### S2. The bench lockstep is broken (Blocker 2)
- **c15** (my 1.8x crop of 20-560 × 200-520), the six seated players left to right:
  1. hands apart, reaching forward
  2. palms together at the chest
  3. hands spread at the sternum
  4. a mid-clap at the chest
  5. one hand low, one at the chest
  6. both hands raised to the face
- **The BEFORE c15** (my desktop-08 2.5x crop) shows six identical palm-to-palm claps.
- **c11** (my 2x crop of 0-520 × 280-430), six bench figures:
  1. a wide shrug
  2. hands at the chest
  3. hands at the head
  4. hands at the head, but in a different lean and phase
  5. hands at the chest
  6. arms crossed low
  
  No three adjacent figures share a pose.
- **c09** (my 1.8x crop of 300-1000 × 200-340), four figures:
  1. one hand raised
  2. hands crossed at the chest
  3. hands at the chest
  4. both hands up
- **The cheer group shows at least two distinct poses:**
  - **c02** (my crop of 0-700 × 230-380): #1 has her arms out level, #2 has one pom up and one at the hip, and #3 has one arm high.
  - **c06** (my crop of 300-900 × 240-440): pom-poms at the chest, arms out, and one arm high.

Against r1's pass test, every bench group of 5 or more I can resolve (c15, c11) shows no 3 adjacent figures in the same pose and phase. The cheer clause also passes.

### S3. The officials wear full-length black trousers in every still (Blocker 3, clause 1)
- **The before/after pairs:**
  - desktop-08 upper pair: c15 shorts over tights → full slacks
  - desktop-09 lower pair: c18 shorts over tights → full slacks
- **My crops:**
  - c22 at 920-1080 × 240-420
  - c06 at 20-160 × 550-800
  - c07 at 1150-1280 × 520-800
  - c08 at 210-320 × 510-640 (4x)
- **Mobile:** c15 at 600-780 × 700-1120 and c18 (mobile-06 last pair) also show them.
- **Mobile c15:** the stripes are straight and vertical at 640-780 × 380-700.

### S4. Desktop c14 now passes its lighting test (Blocker 4, desktop half)
- **`probe.json`:** desktop c14 `voidPct` is **4.4** (r1: 9.1, under the 5 threshold).
- **desktop-07 lower pair:** the BEFORE frame has a near-black band at the top. The AFTER frame fills 0-1280 × 0-150 with an arms-up bowl, gold confetti, and the lit ribbon text at about 230-1230 × 30-50.
- **Mobile c14 confetti:** five flecks outside the card, at (752,922), (771,1037), (306,1578), (234,1655) and (707,1626), against r1's 3-4. That meets the "at least 5" clause, if only just.

### S5. The type floor holds everywhere I can measure (Blocker 8)
- **The mobile c06 subline:**
  - r1: a 7 css cap on bare wood
  - now: a **21-row cap (1110-1130), a 10.5 css cap** on its own black plate (mobile c06 190-360 × 1102-1138)
  - mobile-dunk f14-f15 shows the same plate under "SLAM DUNK"
- **The c14 pennant** is re-lettered in the condensed display face, the same face as "STATE CHAMPIONS!" and the buttons (my 3x crop of 550-730 × 175-290). r1's wide grotesque is gone.
- **The clock:** my c02 2.5x crop of the scorebug shows "1:54" in the condensed display figures, centred and tight. r1's generic spaced monospace (desktop-01 lower pair, BEFORE "1 : 54") is gone.
- **The desktop floor:** seven captions scan at 9 rows (≈13 px). The figures are under *My measurements* above.

### S6. Mobile presentation is partly fixed (Blocker 9 and the carried items)
- **Card margins of 32 device px (16 css)** on all five mobile menus (my scan). This closes r1's carried item.
- **The mobile "+3" is gone:**
  - mobile-06 first pair: the BEFORE "+3" pill at about 105-135 × 70-90 on the board is absent in AFTER
  - mobile-make-wide f00-f13 shows no "+3" in any frame; the lower-court "3 POINTS / HOT SPRINGS" plate carries the make and fades by f04
- **Mobile c20** fits on one screen at 32 px margins, with the five-step type scale crisp at 2x (full still).

### S7. The menu heroes improved where they matter most (Blocker 7, partly)
- **c14** (my 2x crops):
  - #2 (130-330 × 400-730) holds a two-hands-up "let's go" pose
  - #15 (950-1220 × 360-730) has her head thrown back and her arms spread wide
  
  These are distinct, authored celebrations, not the A-pose. Both players sit fully inside the frame (head, hands and feet) and clear of the card.
- **c13 #2:** desktop-07 upper pair BEFORE shows the A-pose, with a hand touching the card at about 125 × 205. AFTER shows a raised fists-up idle, clear of the card (my 2.5x crops of both panels).
- **Shoes:** #15's white shoes in c14 now have a dark sole band (my c14 #15 crop, 990-1100 × 650-715). In c13, the away #15 wears dark shoes with a gold sole ring (my c13 crop, 1100-1280 × 690-760).

---

## 3. Pre-emptive rebuttals

**R1. "c08 still has unblurred crowd geometry at the left edge, so Blocker 1 stays open."**
- r1's defect was a **sharp prop in a blurred frame**: c17 0-90 × 480-590 and c08 20-145 × 545-645. That prop is gone (desktop-04, desktop-09).
- **c08 has no depth of field anywhere.** The backboard at 560-630 × 260-400, the far crowd and the banner are all sharp. So the courtside fans at 0-160 × 465-730 being sharp is consistent, not an intrusion.
- They stand on the floor behind the baseline, at the official's depth, and their feet are visible at y 700-730.
- In c17, which does use DOF, the same group is blurred (my crop).
- If the Arbiter reads the pass test literally ("no unblurred crowd anywhere in c08"), the remaining gap is a test-wording issue, not the defect r1 described.

**R2. "The 3D game is unchanged again."**
r1 could say this (a 0.2-2% diff). The pixels say otherwise this round:
- the c15 bench poses (desktop-08 upper pair)
- the trousers in c06, c07, c15, c18 and c22
- the c08/c17 left edge
- the c14 bowl
- the c13 #2 pose

On the pair composites, my BEFORE/AFTER thumbnail diff is 10.6% for c15, 23.4% for c14 and 19.1% for c21. Crowd timing inflates these numbers, so I cite the specific crops, not the percentages.

**R3. "desktop-dunk-close f00 is a black void, and the dunker vanishes from the crop by f12."**
This is a crop-harness fault, not a render fault:
- the full-frame desktop-dunk f00 shows a normal, lit court with ten players
- in full-frame f12-f15 the dunker is still under the rim at about 1100 × 1000-1070 (sheet coordinates)

The close crop simply loses its target after the ball leaves the hand. Do not score Animation or Lighting down on dunk-close f00 or f12-f15.

**R4. "Mobile c14 fails the void test, so the champion camera got worse."**
- Mobile c14 `voidPct` is 5.1 against r1's 4.3. That is a 0.8-point move, and my scan places 80% of the near-black pixels in the top strip at y 0-330.
- The card, the floor, the star and the confetti below are well lit.
- **I concede the strip (C3).** But this is one band on one screen, not a darker scene. The confetti clause, which r1 failed, now passes with five flecks.

**R5. "The pennant still fringes, so Blocker 8 is open."**
- At 3x, the pennant glyph edges show faint red and green subpixel anti-aliasing (my crop 550-730 × 175-290).
- At 1x, "STATE CHAMPS" reads as clean gold condensed caps. It is in the display face, which was the substance of r1's complaint ("off-system wide grotesque").
- The face clause passes. The fringing is a rasterization nit that is invisible at native size. It does not cap Typography at 7.5.

**R6. "Mobile type is still small: scorebug FOULS, Press Space, YOU."**
- Mobile type renders at 2x. The mobile scorebug FOULS and team codes read at about 9-10 css caps in mobile c06 (25-155 × 30-110, full still).
- The desktop FOULS label scans at 9 rows (65-73).
- The YOU marker's yellow glyph rows in c02 span 352-362 (my 5x crop of 610-690 × 330-400).
- None of these is under the 9 css cap floor.

**R7. "The ball got harder to see: c04 6.47 → 6.20, c05 6.03 → 5.53."**
- These are still 5-6:1 contrasts, near double the 3:1 bar.
- Mobile c04 is 4.69 and c05 is 4.36.
- A 0.3-0.5 drift with crowd timing is not a readability regression.

**R8. "Mobile c09 and c11 players are tiny (`playerPx` 57.6, 50.6)."**
As in r1 ruling 8, these probes sample the far-court cluster. mobile-03 and mobile-04 last pairs show the frames are identical to r1, so this is not a shrink.

---

## 4. Concessions

- **C1. The mobile menus still show no staged player (Blocker 9, clause 2, open).**
  - The mobile c13 and c20 cards run from y 24 to about 1630-1660, edge to edge.
  - The mobile c14 card covers 326-1325, and neither hero is in frame.
  - The round's flagship staging is still invisible on the phone. **This alone keeps Mobile under 8.**

- **C2. The menu heroes still carry r1's construction defects (Blocker 7, partly).**
  - **Armhole flaps:**
    - c14 #2: white triangles at about 177-195 × 487-512 and 250-270 × 487-507 (my 2x crop)
    - c20 white #15: about 1135-1145 × 435-455 and 1235-1245 × 435-460
  - **The numbers still have a soft dark halo:** "2" and "15" in c14, and "2" in c13/c20.
  - **c13 and c20 do not differ.** The left hero in c13 and c20 is pixel-identical (my diff: 0.0% over 0-200 × 300-800). The right hero holds the same near-A-pose in both (my side-by-side, 1060-1280 × 290-780). The pass test asked for different idles per menu.
  - **Framing:** c13 #15's outstretched hand reaches the frame edge at about x 1274.
  - The c14 white shoes are still slipper-shaped; only the sole band is new.

- **C3. The mobile c14 top band (Blocker 9, clause 3, open).**
  - a flat navy band (16,16,28) at 0-780 × 0-140
  - a near-black strip (2,3,6) at 0-780 × 140-200, and down to 330 on the left (0-260)
  
  This is also why mobile `voidPct` is 5.1. Blocker 4 fails on mobile.

- **C4. The officials are only partly finished (Blocker 3, clauses 2-3).**
  - **The stripes still swirl:**
    - c15 at the shoulder and chest (820-990 × 200-300)
    - c06 (my crop, 120-180 × 560-620)
    - c08, where they are tribal-like curls (my 4x crop, 225-265 × 545-620)
  - **The c15 official still holds the arms-out pose** (680-990 × 280-420).
  - **The c08 official has a soft warm halo** hugging the silhouette (my 4x crop), with visible stair-step aliasing on the stripes.

- **C5. Heads, necklines and props (Blocker 5, open).**
  - **Pale hairless heads:** c11 bench #1 and #4 (about 80-100 and 355-375 × 300-330 in still coordinates), and the mobile c15 bench figure at 70-140 × 480-560.
  - **Stepped tank necklines on every c15 bench player** (my crop).
  - **The pom-poms are still faceted gems** (c02 and c06 crops).

- **C6. Close-camera surfaces (Blocker 6, open).**
  - **desktop c21:** the gold armhole trim stands off the body with its inner face and a dark gap showing (my 3x crop, 807-847 × 553-620).
  - **mobile c21:** mottled skin patches on the white player's cheek (340-420 × 580-660) and shoulder (560-700 × 690-760).
  - **The duplicate YOU** at desktop c21 485-605 × 90-120 and mobile c21 580-625 × 135-185 remains.

- **C7. The carried motion items are unchanged.**
  - **desktop-dunk:** the ball sits over the ring through f09-f11, with no landing inside the burst.
  - **jumper-close:** the arm hold runs f09-f17, and the shooter lands with her arms still up.
  - **net-close f00** still starts with the ball in the mesh.
  - **The mobile dunk** still frames the dunker in the top 15% (`emptyFgMean` 57.5).
  - **desktop-open-play-close:** #53 and #12 interpenetrate at f05-f09.

- **C8. The setting details are open.**
  - "S?ATE FINALS" sits behind heads in c09 (my crop, 285-480 × 70-110).
  - The c21 banners still read 1932 / 1996 / 1998 BOYS against the c20 fact.
  - Mobile c15 still puts the official's face under the pause button (680-780 × 270-440).

- **C9. Lighting.**
  - `clippedPct` is 0 in every still, so no bloom is measured. The net-close f00-f03 rim flash is the only glow.
  - Mobile `floorCrowd` stays at 1.96-2.24 in live play.

---

## 5. Status of r1's blockers, as I read the pixels

| r1 blocker | Defender status | Key evidence |
|---|---|---|
| 1. Replay foreground | **Closed** (see R1) | desktop-04 lower pair, desktop-09 upper pair, my c17 crop |
| 2. Bench lockstep and cheer | **Closed** | c15, c11 and c09 crops; c02 and c06 cheer crops |
| 3. Officials | **Partly** | Trousers closed in every still. Stripes swirl in c06, c08 and c15. The c15 arms-out pose remains. |
| 4. c14 | **Partly** | Desktop `voidPct` 4.4 passes, and mobile confetti (5) passes. Mobile `voidPct` 5.1 fails. |
| 5. Heads and necklines | **Open** | C5 |
| 6. Close-camera surfaces | **Open** | C6 |
| 7. Menu heroes | **Partly** | Poses in c14 and the c13 #2 idle pass. The c13 = c20 duplicate, the flaps, the halo and the slippers do not. |
| 8. Type floor and pennant | **Closed** | 10.5 css subline; display-face pennant (R5 covers the fringing) |
| 9. Mobile menus | **Partly** | Margins closed. Staging (C1) and the c14 band (C3) are open. |

Carried items:
- **Closed:** the mobile "+3"
- **Open:** the dunk, the jumper hold, net-close f00, the c09 ribbon, the c21 banner, the duplicate YOU and mobile c15 framing
- **Not checked:** the c17 guide hand. I did not measure it this round, so I make no claim either way.

**Regressions:** none found in the 3D content. Mobile c14 `voidPct` moved 4.3 → 5.1 (C3/R4); I count it as one band, not a darker scene.
