# v3-m4-r2: Defender brief

Round: v3-m4-r2 (milestone 4 round 2: high-quality player models; animation still procedural). Before/after pairs compare with v3-m4-r1.

**Read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m4-r1.md`.

**Opened:**
- **Contact sheets:** desktop `-01` to `-04`, and mobile `-03`
- **Before/after pairs:** desktop `-01`, `-04`, `-08`, `-10`
- **Full-size stills:** desktop c21, and mobile c06
- **Bursts:** desktop jumper, make-wide and net-close; mobile make-wide
- **Benchmarks:** sheet `-04`
- **Probe:** `probe.json`, all of it

**My own measurements.** I used Rec.601 luma on sRGB 0-255, taking the median of each box. The coordinates are full-size still pixels.

**My crops:**
- **Desktop:**
  - c02 players at 2x and faces at 3x (x 160-820, y 360-720)
  - c19 players at 2x (x 280-940, y 330-660)
  - c16 players at 1.6x, and the YOU head at 6x
  - c15 shoes at 4x (x 760-1000, y 600-770) and the c15 referee at 2x (x 620-1040, y 60-460)
  - c21 faces at 3x (x 340-780, y 100-300) and armholes at 2x (x 360-1000, y 280-620)
  - c17 shooter at 2x (x 600-960, y 160-520)
  - c04 shooter at 4x (x 470-600, y 200-420)
  - the referees in c07, c08, c17 and c18
- **Mobile:**
  - c06 shoe-to-card edge at 4x, plus a row scan
  - c17 shoes at 2x
  - c13 footer

The webm and sound are not shown, and I don't score them.

---

## 1. Scores

| Category | Score | One line |
|---|---|---|
| Art: players, court, venue | **6.5** | **Real progress on the players:**<br>- the armhole tear is gone in c21, c17 and c02<br>- the formerly bald players now have hair (c02 #1, c16 near blue player)<br>- clean wristband edges and fingernails (c21)<br>- a continuous midsole and a school-colour heel stripe (c15, mobile c17)<br>**Still holding it below 7:** toes still show through the shoes (c15), #3 and #21 still have primitive hair solids (c19), the face template is unchanged, and the venue clause is still unmet. |
| Lighting & materials | **6.5** | Dark skin now carries blue at 30-36% of red (c02 #53 (105,51,34)). In r1 it was 0-3%. The `floorCrowd` hierarchy improved: c02 is 3.58 (r1 3.38) and c16 2.95 (r1 2.75). The c08 far wall is still a void (18.7), there are no pools or bloom, and the c15 referee still has no blue. |
| Animation & game feel | **6.5** | Unchanged, as planned for a procedural round. The net is rigid (net-close f04-f11), and the jumper release is small. The desktop stagger is intact (make-wide f00-f06). |
| UI / HUD | **7** | The desktop "+3" stagger holds, c20 is whole, and no callout covers the rim or ball. The mobile card is better (0 to about 12 device px) but still short of its 32 px test. |
| Typography | **6.5** | Unchanged. |
| Readability | **6.5** | Every ball number moved up: `ballContrast` c04 4.40 (r1 4.13), c05 4.10 (3.73), and the jumper minimum 2.14 (2.08). They are still below r1's 7-level figures (c04 4.78 and a minimum of 2.67). The c19 defender clump still interpenetrates. |
| Mobile portrait | **7** | Players are 82.5-87.5 px (c02-c05). The card margin is no longer contact (ruling below). The Select footer leak and the "+3" on the backboard are unchanged. |
| Authenticity of setting | **6.5** | **Officials:** they now have short sleeves and no wristbands (c15, c07, c18), but still wear shorts over tights. **Venue:** BOYS banners still hang in a girls' game (mobile c06), and the venue is unchanged. |
| **Overall** | **6.6** | (6.5+6.5+6.5+7+6.5+6.5+7+6.5)/8 = 6.625 |

My honest read is that this round closed one of the five milestone-4 blockers (Blocker 3) and moved three others (Blockers 1, 4 and 5) part-way, with measurements. That progress is real, but none of it crosses a half-step anchor in any category, so I don't claim a score gain.

---

## 2. Strengths, with evidence

### S1. The dark-skin hue is fixed on the players
R1's headline lighting defect was "terracotta" dark skin with blue at 0-3. Every dark player I measured now passes r1 Blocker 1's hue clause (R:G 1.3-2.1, blue at least 25% of red):

| Character | Box | RGB | Luma | R:G | B/R |
|---|---|---|---|---|---|
| c02 #53 face | 750-758, 424-434 | (105,51,34) | 65.2 | 2.06 | 0.32 |
| c02 #42 face | 344-354, 420-430 | (106,52,34) | 66.1 | 2.04 | 0.32 |
| c19 handler face | 871-881, 454-464 | (106,53,37) | 67.0 | 2.00 | 0.35 |
| c19 #42 arm | 450-458, 388-405 | (108,55,35) | 68.6 | 1.96 | 0.32 |
| c16 dark blue player | 604-612, 444-454 | (106,51,33) | 65.4 | 2.08 | 0.31 |
| c16 YOU shoulder | 1140-1150, 480-492 | (85,50,43) | 59.7 | 1.70 | 0.51 |
| c21 #53 cheek | 425-455, 233-250 | (105,53,38) | 66.8 | 1.98 | 0.36 |
| c17 #2 forearm | 700-720, 410-420 | (132,62,45) | 81.0 | 2.13 | 0.34 |

R1 had c15 at (120,50,0) and c16 YOU at (91,35,3). The mid tone also passes: YOU is (151,85,55) in c02, (150,85,57) in c19 and (149,84,57) in c21, at R:G 1.76-1.78 and B/R 0.36-0.38. The tone is consistent across three cameras, which shows it is bound to the character and not to the shot.

### S2. The dark-class assignments are restored for the players r1 named first
- **c02 #53:** dark in v3-m3-r2 and light in r1. It is now 65.2 lit-side luma (`desktop-01` lower pair; my c02 crop).
- **c19 handler and #42:** dark in v3-m3-r2 and at 101-102 luma in r1. They are now 67.0 and 65-69 (`desktop-10` upper pair; my c19 crop).
- **c16 blue team:** a dark blue player is back next to the ball (65.4).

All of these sit inside the 35-75 dark-class band that the pass test sets.

### S3. The armhole piping now stays on the torso (r1 Blocker 3)
- **c21** (my 2x crop, x 360-1000, y 280-620): #53's right arm is raised and bent across the chest, and the gold piping and maroon lining stay a continuous edge on the torso. No ring or lining sits on the upper arm. #12's black armhole loops are intact on both sides.
- **c17 #2** (my 2x crop): both arms are raised, and the white jersey edge follows the torso. R1's white wedge at x 840-860, y 410-440 is gone.
- **c02 #53** (my 3x crop): no maroon flap at the left shoulder.

The c21 camera and pose differ from r1, so the exact r1 elbow frame isn't reproduced. But the frame shown here is a harder case (an arm raised higher and bent more), and it is clean.

### S4. Trim edges are clean
- In c21, the wristbands are clean-edged at 2x: gold on #53 (x 620-690, y 370-445) and black on #12 (x 905-960, y 490-540). R1 cited a sawtooth here.
- #12's hand (c21, x 805-950, y 420-520) has visible fingernails and knuckle shading.

### S5. Hair coverage has improved
- c02 #1 was bald in r1 and now has a cropped orange cap (my c02 crop, crop x 230-280, y 105-150).
- The c16 near blue player now has a hair cap.
- c02 YOU and c16 YOU have sculpted black hair (my 6x c16 crop shows a shaped cap with a clean nape line).

### S6. The shoe midsole is continuous, and the shoes have accents
- **c15** (my 4x crop): both white midsoles now run as smooth, continuous bands. R1's ruling 2 cited a "torn and jagged" sole edge, and it is gone.
- **Mobile c17** (my 2x crop, x 440-780, y 1280-1520): the heel counters carry a green school-colour stripe, and the sole and upper read as separate parts.

### S7. The officials' kit moved toward a referee
- **c15** (my 2x crop): short sleeves now reach the mid-bicep on the near arm. In r1, the `desktop-08` upper pair BEFORE frame showed a tank top.
- **c07, c18:** sleeves are present.
- I saw no wristbands on any official (c07, c08, c15, c17, c18).

### S8. The ball and hierarchy numbers moved in the right direction
All of these are the probe's own numbers:

| Probe | r1 | r2 |
|---|---|---|
| `ballContrast` c04 | 4.13 | 4.40 |
| `ballContrast` c05 | 3.73 | 4.10 |
| desktop jumper `ballContrastMin` | 2.08 | 2.14 |
| `floorCrowd` c02 | 3.38 | 3.58 |
| `floorCrowd` c16 | 2.75 | 2.95 |
| desktop jumper `floorCrowdMean` | — | 4.01 |

c02 now passes the r2 crowd test (3.4), and c05 passes its 3.6 clause.

### S9. The mobile card is no longer touching a shoe
My row scan of mobile c06 (x 518-536): the shoe's grey sole ends at y 985-986, the floor runs at luma 120-124 from y 988 to 997, and the card begins at y 998. That is a gap of about 12 device px (about 6 css px), against 0 in r1. It still fails the test (see Concession 5), but the regression to contact is reversed. The slide-in, the fade and the card gone by f05 all hold (mobile make-wide f00-f05).

### S10. The keeps hold
- the desktop "+3" stagger (make-wide f00-f06)
- c20 whole (`desktop-10` lower pair, identical)
- the callout lifecycle and the rim flash (net-close f00-f03)
- the title banners and block walls (c01, c08)
- per-school bands (sheet `desktop-03`, c13)
- mobile player size (`playerPx` 82.5-87.5)
- desktop framing (141-207 px)

---

## 3. Pre-emptive rebuttals

### R1. "The skin fix failed again: the players are still orange."
The measurements contradict this for every dark and mid player. Blue is 30-38% of red (table S1), against 0-3% in r1. Only two characters still fail the hue clause: the c15 referee (Concession 1) and the pale #3 (R:G 1.20).

### R2. "The armholes still tear."
- In c21, c17 and c02 at 2-3x, no piping or lining pixel sits on the upper arm (S3).
- The only raised-arm gameplay still is c04 (my 4x crop). On the pale shooter there is a possible thin white edge at x 509-516, y 292-305, but at that size it can't be told apart from a white jersey edge against pale skin.
- The jumper burst frames are about 420 px wide, too small for a 3x armhole check. The burst can't decide this either way, so it shouldn't be scored as a failure.

### R3. "The c08 replay regressed: a foreground body has appeared."
`desktop-04` lower pair: #2 sits at the bottom right in both BEFORE and AFTER, in the same place. This is not new to r2.

### R4. "The c15 table face is a black void."
I measured the c15 table face at x 700-760, y 650-700: (64,39,18), luma 44.1. R1 had it at 0.9. It is dark wood, not a void.

### R5. "The officials are unchanged."
They gained short sleeves and lost the wristbands (S7). The legs are still unchanged (Concession 4).

### R6. "c16 YOU is crushed again: the head is at luma 29."
In c16, YOU faces away (my 6x crop): the "head" pixels are black hair, which a box should not count as skin. The lit shoulder is 59.7, and the shaded neck is 32.6. Skin luma in this frame should be judged on the shoulder and arms, which sit inside the dark-class band.

### R7. "Probe numbers show the ball got harder to see on mobile."
The mobile drive minimum is 1.13 and the make-wide minimum 1.14. These are minimums over frames in which the ball is in a hand or passing through the net, against a ring that includes skin or net. r1's ruling 8 already noted the probe measures the close camera poorly. The desktop loose-ball stills (c04 and c05) are the cleaner test, and both went up.

---

## 4. Concessions

### 1. Blocker 1 (skin) is Partly closed, not passed
- **Assignment clause, not met:**
  - **YOU:** this is the same character in c02, c19 and c21. In v3-m3-r2 YOU was dark class. YOU now renders at a lit-side luma of 100-101, outside the 35-75 band. That is better than r1's 135, but it is still the wrong class.
  - **All four named referees are still light:**
    - c07 face (1212-1224, 582-594): (158,121,67), luma 125.9
    - c18 face (422-436, 402-418): (216,163,89), luma 170.4
    - c08 and c17: the referees' faces and hands are visibly light in my referee crops.
  - Of the referees, only c15's remains dark.
- **Hue clause, not met:**
  - **The c15 referee still has no blue:** the face (872-890, 140-158) is (123,53,11), B/R 0.09, and the arm (690-720, 290-300) is (123,48,0), B/R 0.00. That is the r1 terracotta exactly. The player fix did not reach this character or this camera.
  - **Pale #3 still reads as paper:** (207,173,148), R:G 1.20, in c02 (268-280, 527-539), and (216,180,153), R:G 1.20, in c19 (446-456, 530-540).
  - The c17 #2 forearm, at R:G 2.13, is a hair over the 2.1 ceiling.
- I saw no skin pixel over 240 in any face box (maximum 236). No probe measures skin, so these boxes are the evidence.

### 2. Blocker 2 (sneakers) is Open
c15 at 4x (x 760-1000, y 600-770):
- Five toe ridges still show on both feet under the glossy black upper, and there is still no toe box.
- The sock layering is still asymmetric: a white sock band with a torn top edge on the left, and a white sliver on the right.
- Skin shows at the right ankle (938-950, 695-698): (124,53,5).
- In mobile c17 (my 2x crop) the sock is a thin white strip with brown skin on both sides of it, on both legs.

Only the midsole clause improved.

### 3. Near plane: the c21 intrusion got larger
- In c21, a brown hand fills x 0-300, y 0-190 at the top left: median (58,30,25) over x 60-240, y 40-120. R1's limb was x 0-120, y 0-70.
- #53's raised hand also lies across #12's cheek (x 690-770, y 190-370), which reads as contact or interpenetration in a hero shot.
- A thin, stray yellow strand runs at about x 605-640, y 340-380 between the two players (my 2x crop).

### 4. Blocker 4 (officials' kit) is Partly closed: the trousers clause fails, and there is a new shoulder artifact
- The officials still wear knee-length black shorts over black tights in c15, c07, c17 and c18 (my referee crops; the `desktop-08` upper pair AFTER).
- The new shirt leaves the tops of both shoulders bare. It reads as a tank-top neckline with sleeves hung below it: c15 at 2x (x 840-1000, y 250-300), and the c07 and c18 crops.
- The stripes on the far sleeve swirl into a zebra warp (c15, x 950-1000, y 300-420).

### 5. Blocker 5 (mobile card) is Partly closed
The gap is about 12 device px, against the test's 32 (S9). The mobile "+3" still sits on the backboard from f02 to f13 of mobile make-wide, fading only from f10.

### 6. The face template and the "expressive eyes" are unchanged
c21 at 3x (x 340-780, y 100-300):
- Both players share the same almond eye: a brown iris and a lid line, a white sclera corner and no true catchlight.
- They share the same heavy flat brow.
- The eyes are about the same size as in r1.
- #53's hairline steps in a stair pattern (crop x 400-520, y 180-230).
- #12 is still effectively bald, with only a thin crown cap.

### 7. The hair solids remain on the two r1 named players
- #3 still wears a black stovepipe, and #21 a flat-topped blonde bucket: c19 crop at x 290-360, y 330-420 and x 370-420, y 260-300; c02 crop at x 190-250, y 275-330.
- The c17 #2 bun is still a sphere cluster.

### 8. Clumps and cloned poses
In c19, four white defenders share one arm angle and overlap at the forearms (my c19 crop, x 0-300, y 130-520).

### 9. The carried milestone-3 blockers are unchanged
- **Mobile c13 footer:** "Cutter-" and "Jessieville" still render below BACK/TIP OFF (my crop, y 1250-1688), and "Fountain" ghosts behind the cue.
- **c08 far wall:** still a void. x 900-1200, y 120-300 measures (30,16,3), luma 18.7.
- **c17 ball:** about 230 px from the raised hand. The ball is at about (698,225) and the hand at about (910,320).
- **c09:** `floorY` is 0.138, unchanged.

### 10. Milestone targets are still far off
Art is 6.5 against 7.8, Authenticity 6.5 against 7.5, and overall 6.6 against 7.7. On my scores the round makes no category gain. The measurable fixes are real (S1-S9), but they sit inside the existing half-steps.

---

## Milestone-4 blocker scorecard (against r1's own pass tests)

| r1 Blocker | Status | Deciding measurement |
|---|---|---|
| 1. Skin assignments and hue | **Partly** | **Closed:** the players. #53, the c19 handler, #42 and a c16 blue player are dark class at 65-69, with blue at 30-36% of red. **Open:** YOU at 100-101, the referees light (c07 126, c18 170), the c15 referee at B/R 0.00-0.09, and #3 at R:G 1.20. |
| 2. Sneakers | **Open** | Five toe ridges per foot (c15 at 4x), asymmetric socks, and skin at the ankle (124,53,5). Only the midsole is fixed. |
| 3. Armhole piping | **Closed on the frames shown** | c21, c17 and c02 at 2-3x show no piping on the arm. The burst is too small to check at 3x. |
| 4. Officials' kit | **Partly** | **Closed:** sleeves present and no wristbands. **Open:** shorts over tights in c15, c07, c17 and c18, plus new bare shoulder tops. |
| 5. Mobile card margin | **Partly** | About 12 device px against 32 (mobile c06 row scan). |
