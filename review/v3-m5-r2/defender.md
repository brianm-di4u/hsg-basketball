# v3-m5-r2: Defender brief

Round v3-m5-r2 (milestone 5, round 2: animation). Before/after pairs compare with v3-m5-r1.

**Inputs:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m5-r1.md` (binding), all 7 contact sheets, before/after desktop-01, -02, -03, -05, -07, -08, -09, -10, -11 and mobile-01, every desktop burst and close burst, mobile dunk, make-wide and net-close bursts, and `probe/probe.json`.

**My measurements:**
- **Crops:** c02 #53 (x 640-820, y 380-580) at 4x; c10 #13 (x 720-840, y 360-560) at 4x; c19 clump (x 200-560, y 300-640) at 2.7x; c06 #12 (x 60-300, y 440-660) at 3x.
- **Burst crops:**
  - dunk-close f05-f09 at 2x
  - dunk wide f04-f15, the rim region at 2.5x and f10-f13 at 5x
  - net-close f00-f11 at 2x and f02/f03/f04/f08/f11 at 3x
  - jumper-close f00-f04, f07, f08, f15-f17 at 2x
  - open-play-close f00-f04 and f07-f15 at 2.2x
  - mobile dunk f10-f13 at 4x
- **Box medians** (sRGB, Rec.601 luma) on full-size stills: c15 referee face (872-890, 140-158); c08 far wall (900-1200, 120-300); c14 bottom band (0-1280, 600-800); c02 YOU face (675-680, 425-435).

**Coordinates:** burst coordinates are in the burst sheet's own pixels. Wide desktop tiles start at x 6 / 432 / 858 / 1284 and y 6 / 300 / 594 / 888, about 1/3 scale. Still coordinates are full-size 1280×800.

**Not reviewed:** the webm and sound. They are not shown in a way I can read, so I score them neither up nor down.

---

## 1. Scores

| Category | r1 final | **Defender** | Justification and evidence |
|---|---|---|---|
| Art: players, court, venue | 6.5 | **6.5** | **All four r1 art regressions are cleared:**<br>- the armhole piping lies on the torso (c02 #53, c06 #12, c10 #13, c21)<br>- the buns sit on the heads (c19 crop)<br>- c21 shows two faces at three-quarter front<br>- c14 shows the arena again<br>**Held at 6.5 because nothing new was added:** #21's bucket hair and #3's stovepipe (c19), the hard hair-cap edge (c21 x 475-620, y 110-180), the officials' kit (c15) and the empty benches (milestone 6). |
| Lighting & materials | 6.5 | **6.5** | **Up:**<br>- the c14 bottom band is now luma 43.4, (61,39,20), the arena floor, against r1's 7.5<br>- the c17 depth of field now keeps #2 sharp and blurs only the background<br>**Against:**<br>- the c08 far wall is still (29,16,3), luma 18.4<br>- the c15 referee face is (122,52,7)<br>- `clippedPct` is 0 in every still<br>- a slight probe dip: c04 `ballContrast` 4.29 (r1 4.47), c05 4.17 (r1 4.29) |
| Animation & game feel | 7 | **7.5** | **Four r1 animation blockers are closed in the bursts:**<br>- the dunk stays in front of the rim with the ball in hand (dunk f04-f13, dunk-close f05-f08)<br>- the net stretches and recoils (net-close f00-f11; mobile net-close f00-f07)<br>- the officials signal (net-close f00→f03; make-wide f01-f06)<br>- the dribble ball is visible and under the hand (c02, c10)<br>**The jumper gains a planted knee load** (jumper-close f01). All three clauses of the 7 anchor now hold: athletic motion, net/rim reaction, and a crowd that answers (make-wide f00-f06).<br>**Not higher:** frozen follow-through holds, no rim hang, and the c17 beat is early (§4). |
| UI / HUD | 7 | **7** | **Blocker 9 is closed:** "3 POINTS" with "+3" on a three (desktop make-wide f00-f06, mobile make-wide f00-f04), and "SLAM DUNK" with the score going 0→2 on the dunk (dunk f14-f15). The mobile card sits whole inside the viewport in f00-f04.<br>**Carried:** the mobile "+3" over the backboard (mobile make-wide f02-f13). |
| Typography | 6.5 | **6.5** | Out of scope (milestone 7). Unchanged: c13 and c20 are identical BEFORE/AFTER (`desktop-07`, `desktop-10`). |
| Readability | 6.5 | **7** | **The specific r1 readability defects are closed:**<br>- the ball is fully visible beside the handler in c02 and c10 (crops; `desktop-01` and `desktop-05` lower pairs)<br>- no buns float over the c19 clump<br>- the mobile dunk dunker is readable (`playerPxMedian` 89.8, against r1's ~20 px)<br>**Against:** the six-player paint clump in open-play f00-f15 and the jumper `ballContrastMin` of 2.39 (r1 2.44). |
| Mobile portrait | 7 | **7** | **Blocker 10 is closed:** the mobile dunk camera travels to the far rim (mobile dunk f00→f04). The rim is in frame f04-f15, and the dunker is about 95 css px tall at f10 (probe median 89.8).<br>**Also:** the card stays inside the viewport, and mobile c21 shows a face.<br>**Carried:** the Select footer leak (mobile c13: "Cutter-" and "Jessieville" render under BACK/TIP OFF), the "+3" over the backboard, c16 `emptyFgPct` 41.5, and c11 `playerPx` 50.6. |
| Authenticity of setting | 6.5 | **6.5** | **Plus:** the officials now give a made-three signal with both arms up (net-close f03-f11; make-wide f01-f06), and the c14 title moment is back in the arena (`desktop-07` lower pair).<br>**Minus:** the officials' kit is unchanged (c15, `desktop-08` upper pair identical), the benches are empty, and the c09 arena is unchanged. |
| **Overall** | **6.8** | **6.8** | (6.5 + 6.5 + 7.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 54.5 / 8 = **6.81**, which rounds to 6.8. That is +0.06 on r1's 6.75.<br>The round was spent clearing ten blockers, most of them regressions, rather than adding new art. The category the milestone targets moves to its 7.5 target. Overall 8.0 is not met, and I don't claim it. |

---

## 2. Strengths, with evidence

### S1. The dunk is rebuilt around the rim (r1 Blocker 1)
- **dunk-close f05-f07 (2x crop):**
  - the dunker's whole body stays left of, and in front of, the rim and the backboard frame
  - the ball is under his right hand at f05, cradled at the shoulder at f06, and in the extended hand at f07
  - the rim and net draw cleanly beside him, with no ring across his chest (compare r1's f06-f07)
- **dunk-close f08:** the arm reaches to the near edge of the rim with the ball at the front of the ring (tile x 0-60, y 410-450).
- **dunk wide f10-f13 (5x crop of the rim):**
  - f10-f11: the dunker is in front of the rim with his arm over the ring and the ball in his hand above the rim
  - f12: the ball is on the hand at the rim
  - f13: the ball is in the ring with the hand on top
  - f14: the rim flashes and the score goes to 2 ("SLAM DUNK")
  - f14-f15: he lands in front of the basket (tile x 1100-1140, y 1000-1080)
- The torso never crosses the backboard plane in any frame. That meets every clause of the r1 pass test except an explicit rim hang (Concession C3).

### S2. The net reacts (r1 Blocker 2)
**Desktop net-close (3x crops, rim centre-line to hem, sheet pixels):**

| Frame | Rim to hem | Notes |
|---|---|---|
| f02 | ≈79 | ball mid-net, rim flashing |
| f04 | ≈75 | the ball pushes through the hem, which opens around it (tile x 180-280, y 420-450) |
| f08 | ≈68 | settled |
| f11 | ≈72 | still swaying |

- The f02 length is about **16%** longer than the settled f08 (±2 px of reading error).
- The f00-f03 cone bellies outward around the ball; f06-f11 return to a straight taper.

**Mobile net-close:**
- f00: about 103 px; f04: about 115 px, with the ball in the hem
- f07: about 92 px
- That is a change of about 20%.

This is stretch, flare and recoil inside about 0.3 s (f02→f08 = 12 ticks). Keep 7 (the rim flash, f00-f03) is retained.

### S3. The officials are animated characters (r1 Blocker 4)
- **net-close:** the referee changes pose:
  - f00: arms low and out
  - f01: arms wide, palms up
  - f02: arms rising
  - f03-f11: both arms straight up (the made-three signal)
- **mobile net-close f00-f11:** the same progression; one arm is up from f03.
- **make-wide f01-f06:** the baseline official holds both arms up.
- **drive f01-f15:** the official jogs and his legs change every frame.
- The bind pose is gone in every burst.

### S4. The dribble ball is in hand and visible (r1 Blocker 3)
- **c02 #53 (4x crop):**
  - the ball is fully visible beside the right hip, at about (770-798, 489-517) full-res
  - the open right hand is directly above it at about (776, 479), within one ball-width
  - BEFORE hid the ball behind the far hip (`desktop-01` lower pair)
- **c10 #13 (4x crop):** the ball is fully visible at about (788-816, 475-503), with the hand at about (806, 470) just above it.
- **c19 handler:** unchanged and correct (the ball under the palm).
- **open-play-close:**
  - f00: the ball sits under #12's left hand
  - f11-f12: the hand is on the ball at the waist
  - f13-f15: #12 dribbles away with the ball rising to the hand
- **drive-close f01-f06:** Keep 2 is intact (the planted lead foot, and the ball reaching the floor under the hand at f03-f04).

### S5. Armhole piping restored (r1 Blocker 5; r2 Keep 2 recovered)
- **c02 #53 (4x):** the gold piping follows the scoop and armholes on the torso, with no flaps beyond the shoulder line.
- **c06 #12 (3x):** the black piping lies flat on the chest and armholes, with no horns.
- **c10 #13 (4x):** the white piping is on the torso.
- **c21:** the gold piping on #53 runs flush with the shoulder (x 450-560, y 430-600 and x 750-830, y 450-600), and the r1 trim shards at x 900-950 are gone.
- **jumper-close f03-f15:** with the arms raised, I see no strips outside the silhouette at 2x.

### S6. The hair pieces are bound (r1 Blocker 6)
- **My c19 crop:** the three buns (brown, blonde, brown) sit on their heads at about (326, 409), (344, 418) and (383, 413) full-res, with no air gap. That is the same three crouched defenders r1 measured as floating 10-30 px.
- **c10 #13:** the bun sits on the crown.
- **c17:** #2's bun is attached.
- **c06:** the right-hand player's bun is attached.

### S7. The showcase cameras are restored (r1 Blocker 8)
- **c21:**
  - YOU (#12) and #53 are both at three-quarter front
  - eyes with irises and lids, defined brows, and a nose and mouth (x 520-760, y 170-420)
  - no hand on a face, no third-party limb, and no lining or backface
  - **mobile c21:** #12's face at three-quarter front (sheet `mobile-03`)
- **c14:**
  - the arena bowl, the court lines and the far stands are back (`desktop-07` lower pair)
  - no fan card is anywhere near 120 px tall
  - the bottom band went from luma 7.5 to 43.4 (my box)

### S8. Replay focus fixed (r1 Blocker 7, focus half)
- **c17:**
  - #2's number "2", the jersey trim, the wristband and the shoe edges are crisp (x 715-900, y 370-720)
  - the backboard, the stanchion and the crowd are softly defocused
  - the EXIT sign no longer streaks
  - `desktop-09` upper pair: BEFORE smeared the subject, AFTER does not
- **c08:** the composition is kept (sheet `desktop-02`).

### S9. The jumper has weight on the floor (r1 ruling 2, fix 6)
- **jumper-close:**
  - f00: a dribble stance
  - f01: the ball comes to the chest with both knees clearly flexed, and the feet are planted inside the full ring. r1's f01 had "nearly straight legs".
  - f02-f04: the knee angle progressively opens during the rise, rather than one held pose
  - f08: the release, with the ball leaving at the top right
  - f17: the landing, with the knees softened on the ring
- The ground load is still short (§4), but it now exists on the floor.

### S10. The callouts are correct and the mobile dunk is framed (r1 Blockers 9, 10)
- **Callouts:** covered in the UI row.
- **mobile dunk:** f00-f03 track the drive up the floor, and f04-f15 hold the far rim at the top of the frame. My 4x crop of f10-f11 shows the dunker at about 59 sheet px, about 95 css px tall. The probe median is 89.8. The thumb deck is clear in every frame.

---

## 3. Pre-emptive rebuttals

### R1. "The dunk-close burst proves nothing: it loses the dunker after f07."
- The close strip's crop drifts left (dunk-close f08-f15 show the rim and the stands, then an official).
- **But the wide strip settles the contact question:**
  - dunk f10-f13 at 5x show the dunker in front of the rim with the ball in hand
  - f13 shows the ball in the ring with the hand on top
  - f14 shows the flash and the score of 2
- Close f05-f08 cover the approach and agree.
- The crop failure is a packet defect. It should not be read as the body vanishing. I do concede that the hang can't be judged up close (C3).

### R2. "Black frames: dunk-close f00 and drive-close f00 render nothing."
- **The wide strips at the same frames show normal renders:**
  - dunk f00: the centre court with the players
  - drive f00: the centre circle
- In both, the next frame is a camera cut to the shooter (dunk f01, drive f01).
- The close tile is a crop centred on a player who is not yet in the cut. It is not a black void in the game.
- No wide burst has a black frame.

### R3. "A grey ghost square trails the ball at release (jumper-close f08-f09)."
- My 5x crop of f08 (x 80-160, y 350-430): the grey shape behind the ball is a fan in a white hoodie in the stands.
- In f09 the same fan is visible beside the ball at (300, 395).
- It is crowd, not a motion-blur artifact.

### R4. "The net is still rigid."
- Contradicted by S2:
  - desktop: about +16% rim-to-hem at f02 against the settled f08, the hem opening around the ball at f04, and the sway at f11
  - mobile: about 20%, f04 against f07
- The only fair objection is that r1's test measured the change "against f00", and f00 here already has the ball in the net. So that baseline undercounts the stretch (C6).

### R5. "The officials are still in a bind pose."
- net-close f00-f11, mobile net-close f00-f11, make-wide f01-f06 and drive f01-f15 all show changing poses (S3).
- c15 is the one static close-up. It is a single still, and its pose differs from c18 (palms forward).

### R6. "The replay still blurs the subject."
- c17: #2 is the sharpest object in the frame (S8). The blur is now where r1's pass test wants it: background and crowd.
- The defect that remains is the beat, not the focus (C1).

### R7. "Ball contrast regressed."
- c04 is 4.47→4.29, c05 is 4.29→4.17, and the jumper minimum is 2.44→2.39. Each change is under 5%, and c04 and c05 are still above 4.
- The dunk `ballContrastMin` of 1.00 and mean of 1.39 measure a ball held in the hand against skin and the orange stands. The ball is not loose for most of the dunk, so the probe is measuring the wrong thing.
- c06 `ballContrast` 1.6 samples the ball inside the net mesh, the same situation as r1.

### R8. "c14 still has a void (`voidPct` 15)."
- The modal dims a real arena:
  - my bottom band is (61,39,20), luma 43.4, which is the floor (court lines visible at x 1200-1280, y 650-800)
  - the dark top-left is unlit upper stands with visible seat rows
- r1's 36.8 was a navy panel at luma 7.5.
- I concede that the literal `voidPct` < 5 clause isn't met (C9). The visual regression is gone.

### R9. "On mobile the dunker is a dot."
- The probe `playerPxMedian` for the mobile dunk is 89.8, against the 60 css px the pass test requires.
- The rim is in frame from f04 to f15 (mobile dunk sheet).

### R10. "Wrong callout again."
- Desktop make-wide f00-f06: "3 POINTS" and "+3".
- Mobile make-wide f00-f04: "3 POINTS", inside the viewport.
- Dunk f14-f15: "SLAM DUNK" with HSHS 0→2.
- Every pairing matches its event.

### R11. "Long airborne hang in the drive pull-up is floaty."
- Partly fair (C2). But it is a genre choice that the benchmark sheet shows in Playgrounds 2, and r1 ruling 2 accepted the hang as within genre.
- The complaint that does stick is the frozen pose during the hang, not its length.

---

## 4. Concessions

### C1. The c17 beat is early, not 3-4 ticks before release
- c17: #2 holds the ball low at the right hip (the ball at about (820-845, 545-585)) with the right hand at the chest. That is the catch or gather, and nowhere near the set point.
- Mobile c17 is the same.
- The focus half of r1 Blocker 7 is closed; the beat half is open.

### C2. Frozen follow-through holds
- **drive-close f10-f15:** six identical frames (18 ticks) with both arms over the head while airborne. There is no settling of the wrists or progression in the legs.
- **jumper-close f09-f16:** the arms are locked overhead for about 24 ticks into the landing, and only f17 starts to lower them.
- This is the largest thing keeping Animation off 8: the release is authored, but the hold after it is a still.

### C3. No rim hang, and the dunk lacks weight at contact
- The dunker releases straight down (dunk f13→f14). No frame shows a hand on the rim or a hang, and the close crop cannot confirm the contact up close (R1).
- **Mobile dunk f10-f11 (4x):** the red rim line reads across the dunker's neck as seen from behind. At about 25 sheet px I can't tell whether that is the rim drawn in front of him (penetration) or a perspective overlap. The Arbiter should zoom it.

### C4. The c19 clump is a lockstep line
- The four white defenders stand in a nested crouch, all leaning the same way (x 230-560, y 400-640).
- Two of the four (the brown-bun player and the front player) share the same horizontal right-arm reach.
- The arms aren't fully cloned, but the variance r1 credited is reduced.

### C5. open-play-close f05-f07: an ambiguous ball
- The ball rides at chest height between #53 and #12 (f07 tile, around x 1410-1440, y 160-190). Neither hand is clearly on it at 2.2x, and the two bodies overlap.
- It may be a strip attempt, but it doesn't read as one.
- The six-player paint clump persists through open-play f00-f15.

### C6. The net stretch is on the margin
- About 16% (desktop) and about 20% (mobile) against settled frames. Against f00 as written in the pass test, the desktop change is smaller.
- The flare is modest: the hem width changes little except where the ball pushes through it (f04).

### C7. The carried art and setting items are untouched
- the c15 referee face is (122,52,7), B/R 0.06
- the officials' scoop neckline and knee shorts over tights are unchanged (`desktop-08` upper pair, identical)
- #21's bucket hair and #3's stovepipe (c19)
- the c21 hair caps have hard edges
- the empty benches (milestone 6)

### C8. Lighting has not moved
- the c08 far wall is luma 18.4, (29,16,3)
- `clippedPct` is 0 everywhere, so there is no bloom
- c16 `floorCrowd` is 3.01 and the jumper minimum is 2.39, so the carried crowd-exposure blocker is still open

### C9. c14 `voidPct` is 15 against < 5 (R8)
The literal pass-test clause fails.

### C10. Mobile carried items
- the Select footer leak (mobile c13 bottom: "Cutter-" and "Jessieville" below BACK/TIP OFF, and "Fountain" ghosted)
- the "+3" sits over the backboard from f02 to f13 and is still visible at f13
- c16 empty foreground 41.5%; c11 `playerPx` 50.6; c09 57.6

### Status of r1's 10 milestone-5 blockers, as I read the pixels

| Blocker | My reading |
|---|---|
| 1. Dunk | **Closed except the hang** (S1, C3) |
| 2. Net | **Closed, marginal on the 15%-against-f00 wording** (S2, C6) |
| 3. Dribble | **Closed** in c02, c10, c19 and drive-close; **ambiguous** at open-play-close f05-f07 (C5) |
| 4. Officials' pose | **Closed** (S3) |
| 5. Armhole piping | **Closed** (S5) |
| 6. Buns | **Closed** (S6) |
| 7. Replay | **Partly:** focus closed, beat open (S8, C1) |
| 8. c14 / c21 | **c21 closed; c14 visually closed,** `voidPct` 15 against 5 (S7, C9) |
| 9. Callout | **Closed** (R10) |
| 10. Mobile dunk | **Closed** (S10), with the neck overlap to check (C3) |

Eight are closed outright, and two are partly closed. Nothing has regressed against r1's Keeps, apart from the reduced arm variance in c19 (C4).
