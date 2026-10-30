# v3-m2-r3: Defender brief

Round v3-m2-r3. I compare it with the binding r2 verdict (`review/v3-m2-r2.md`, 6.6, 3 blockers). The before/after pairs compare with r2.

**What I read:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m2-r2.md`
- All 7 contact sheets and all 19 before/after pairs
- **Full-size desktop stills:** c01, c02, c06 (probe), c08 (probe), c13, c17 (probe), c21
- **Full-size mobile stills:** c01, c08 (probe), c13
- **Bursts:** desktop make-wide, jumper, drive, open-play and net-close; mobile make-wide, drive and jumper
- `probe/probe.json`
- **My own zooms and measurements:**
  - the r2 rim-glow coordinates in c07, c02 and c06, plus before/after `desktop-04` (c07) and `desktop-11` (c21)
  - mobile make-wide f00-f02 (2x) and f00/f01 (4x)
  - the mobile c06 card edge against the probe player box
  - wall luma around the ball in mobile c08; a zoom of mobile c05
  - luma for every desktop open-play frame
  - the letterbox extent of the mobile replay
  - floor-patch luma in c02 before and after
  - glyph height of "Press Space to skip" (c08)
  - mobile c06 against c07 crowd poses

The webm and sound are not reviewed or scored.

Coordinates are full-size pixels unless I say "strip" (burst-sheet pixels). In the mobile bursts, 1 strip px is about 3.25 device px, which is about 1.6 css px.

---

## 1. Scores

| Category | r2 final | **Defender r3** | One-line case |
|---|---|---|---|
| Art: players, court, venue | 6 | **6** | **Better:** the c01 title regression is gone, and so are the bench-chair street-clothes sprites (c02, c15). **Unchanged:** the same capsule-headed mannequins (c21). |
| Lighting & materials | 6.5 | **7** | The only thing r2 held against the 7 anchor was "no artifacts", and all three artifacts now pass their tests (§3). The hierarchy holds (`floorCrowd` 2.72-3.44 in live stills), and the contact shadows are kept. |
| Animation & game feel | 6.5 | **6.5** | **Better:** the card lifecycle now has a real entrance, hold and fade (make-wide f00-f05). **Against:** the jumper is unchanged, the mobile airball crowd is the same as the make crowd, and c17 lost its shooter. |
| UI / HUD | 6.5 | **7** | **Fixed:** the desktop card clears play by more than 200 px and is gone 0.42 s after the make; desktop Select fits 1280×800; the c16 subtitle collision is gone; the title is clean. **Against:** mobile card margins, mobile Select's hidden Difficulty row, and the empty c17 replay. |
| Typography | 6.5 | **6.5** | **Better:** desktop Select now sets team names at a readable size with no clipped rows (c13). **Unchanged:** the c20 pills. "Press Space to skip" is about a 15 px font (11 px caps), so it is not a sub-12 px label. |
| Readability | 7 | **7** | **Better:** no callout sits over the ball or a ball carrier in any frame. **Unchanged:** the shot camera (jumper f04-f17, drive f06-f15) and the paint clump (c02). |
| Mobile portrait | 7 | **7** | **Better:** the replay now uses about 86% of the height with no blot, and the card is gone before the opponents arrive (f05). **Unchanged:** the framing exceptions (c11 50.6 px, c16 41.5%, drive 27.7). **New:** the Difficulty row on Select is behind the footer. |
| Authenticity of setting | 6.5 | **6.5** | Empty team chairs now read as a real bench rather than fans in team seats (c02, c15). There are still no players on the bench, no desktop title banners, and the Hot Streak ledge is unchanged. |
| **Overall** | **6.6** | **6.7** | (6 + 7 + 6.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 53.5 / 8 = 6.69 |

---

## 2. Status of every r2 blocker against its own pass test

### Blocker 1: callout lifecycle and the mobile slot

**Verdict: closed on desktop and on lifecycle; partly open on the mobile margin.**

**Lifecycle (both viewports): passes.**
- The make-wide burst is 5 ticks per frame.
- **Desktop:** the card slides in over f00-f02, from strip x 300-420 in f00 to about 152-272 cell-relative in f02. That is 10 ticks, 0.17 s, inside the 0.2 s limit.
- **Desktop hold:** the card stays at the same cell-relative x (about 152-276) through f03 while dimming. It is faint in f04 at the same spot and **gone in f05**: 25 ticks, 0.42 s after the make.
- **Mobile:** the same shape. The card enters at the right edge in f00, holds from f02, dims through f03-f04 and is gone in f05.
- **The timing beats the test.** The card is fully gone before possession resumes:
  - desktop: the camera cuts to the inbound at f07, and the opponents push from f08
  - mobile: the opponents first enter at the bottom in f05-f06
- r2's lingering card is gone:
  - c16 is clean (before/after `desktop-08` bottom; mobile `mobile-06` left pair)
  - mobile f07, where r2 had the card over #42, now shows no card at all

**Desktop placement: passes.**
- In probe c06, the card is at x 535-920, y 125-240. The nearest player box starts at y 440, and the ball is at x 925-975, y 510-555. That is more than 200 px of clearance.
- No player or ball is near it in make-wide f00-f04.
- The "HOT SPRINGS" subtitle was dropped on desktop, which also removes the r2 c16 overprint.

**Mobile placement: fails the 16 px margin, and I concede it.**
- It no longer covers anyone's body. It sits too close to #0's feet:
  - **Mobile make-wide f00 (4x zoom):** #0's trailing foot touches the card's top edge while the card slides in, a gap of less than 1 strip px.
  - **f01:** the gap is about 7 strip px, roughly 11 css px.
  - **Mobile c06:** the card's top edge is at y 998 (row luma 121 drops to 22). The probe box for #0 ends at y 966, a 32 device px (16 css px) gap. #0's visible shoe reaches y about 987, which leaves about 11 device px (5.5 css px).
- The probe box stops above the shoe, so the probe flatters this test.

### Blocker 2: new render artifacts

**Verdict: closed, all three parts.**

**(a) Rim/specular glow on dark kits in shadow: passes.**
- **Before/after `desktop-04` (c07), at half scale x 170-280 / 818-928, y 160-280:** BEFORE shows the r2 figure with a hard white edge and a white bloom at the hip. AFTER shows a matte dark figure with no edge glow at all.
- **c07 (x 405-445, y 360-500):** the figure there is a referee. The maximum luma is 226 and the 99th percentile is 202; those bright pixels are the white stripes of the shirt itself, its own "lit-side jersey".
- **c02 (x 930-1010, y 255-370):** a referee in the apron. Maximum 212, 99th percentile 169, mean 22. My 3x zoom shows no rim or bloom.
- **c06, left dark-kit player (x 40-130, y 440-640):** maximum 178, below the lit #12 jersey's 189 (x 150-210, y 510-600). The white on the dark kits is the flat side panel of the kit design, the same on both black/white players. It is not a glow.
- **Skin pixels never exceed 240 luma:** the maximum is 212 in c21, c06 and c08 (skin mask r>g>b, r−b>40).
- The r2 c08 arm glint is gone: in r3 c08 the shooter is seen from behind and is matte.
- In before/after `desktop-11`, #53's dark jersey has lost its white sheen (BEFORE x about 140-250, y 380-500 in my 1.5x crop).

**(b) Ball-dim blot on a flat wall: passes.**
- **Mobile c08:** the ball is at (365, 733), about 42 px across. Mean wall luma is 71.8 within 0.75-3 diameters (x ≥ 280, above the floor) and 73.6 at 5-6 diameters. That is a 2.4% difference, inside the 5% test. r2 measured about 73 dropping to about 36.
- **Mobile c05:** my 2x zoom of x 200-600, y 200-500 shows an outlined ball over an even brick wall and the crowd, with no dark disc.
- Before/after `mobile-03` (c08) shows the BEFORE halo around the ball and none AFTER.

**(c) Ragged title cut-outs: passes.**
- **c01 desktop:** the attract camera is pulled back. The crowd is at seat scale (x 0-1280, y 40-320), and there are no foreground faces (before/after `desktop-01` top).
- **Mobile c01:** no giant blurred face. The crowd is small at y 90-240, and the bottom is plain floor (before/after `mobile-01` left pair).
- No sprite is shown above native resolution, and there are no stair-stepped edges.

### Blocker 3: Select overflows

**Verdict: closed on desktop; partly open on mobile.**

**Desktop: passes.**
- In c13, the whole setup fits inside the panel (x 200-1080, y 35-750): both 7-team grids, You play, Shot clock, Quarters and Difficulty (y 556-656).
- The footer sits on its own rule at y about 682, with BACK and TIP OFF at y 683-735. Nothing is behind it.
- Before/after `desktop-07` top shows BEFORE with three rows behind the footer and AFTER clean.

**Mobile: partly passes.**
- **Passes:**
  - TIP OFF stays in view (mobile c13 x 530-738, y 1543-1650).
  - The team lists now show a cut-off third card at the right edge (x 640-730, y 380-665 and y 760-1050), which is the cut-off-card cue the test asks for.
- **Fails:**
  - The Shot clock buttons run under the footer (y 1475-1530).
  - The Difficulty label is ghosted at y 1590, and the ROOKIE/VARSITY/ALL-STATE row shows only its top at y 1660-1688.
  - The faded edge does suggest more content below, but a player at rest cannot see the Difficulty row.

### Blockers scorecard

| Blocker | Status | Measurement |
|---|---|---|
| 1. Callout lifecycle | **Closed** | Slide-in 0.17 s (f00-f02); gone 0.42 s after the make (f05), before resumed play (f07) |
| 1. Desktop slot | **Closed** | c06: more than 200 px to the nearest player box or the ball |
| 1. Mobile slot | **Open, narrowly** | f00 touches #0's foot; f01 about 11 css px; c06 is 16 css px to the probe box but 5.5 css px to the shoe |
| 2a. Rim glow | **Closed** | c07, c02 and c06 have no glow; dark kit 178 is below lit jersey 189; skin max 212 |
| 2b. Wall blot | **Closed** | Mobile c08 wall 71.8 vs 73.6 (2.4%) |
| 2c. Title cut-outs | **Closed** | c01 on both viewports |
| 3. Desktop Select | **Closed** | c13 fits with a reserved footer |
| 3. Mobile Select | **Partly** | TIP OFF in view and a card cue; Difficulty behind the footer |

---

## 3. Strengths (with evidence)

1. **Every r2 render artifact is closed by measurement (§2, Blocker 2).** This round adds no new lighting artifact. Lighting reaches the 7 anchor as written:
   - clear hierarchy: `floorCrowd` 3.3 (c02), 3.12-3.38 (c03-c05), 3.44 (c09), 2.72 (c10)
   - soft contact shadows under every player in c02 (for example x 230-350, y 700-760)
   - no artifacts at any r2 coordinate
2. **The make callout is a broadcast beat now, not an obstruction.** It slides in, holds and fades (desktop make-wide f00-f05). It sits in the crowd band, and on desktop it no longer carries a subtitle. On mobile it never covers a body or the ball. This is the r2 Keep item 3 motion with the lifecycle fixed.
3. **Desktop Select is a finished screen.** It has two clean 2-column grids with colour chips and "game colors" tags, and the options sit in two columns (c13 x 222-1060, y 556-656). This was carried from r1.
4. **The title screen is a good first impression again.** A clean attract view sits behind the navy-and-gold menu on both viewports (c01).
5. **The portrait replay now uses the phone.**
   - The scene spans y about 118-1569 of 1688 (about 86%; r2 used y 138-1285). r2 fix 5 asked for about 80%.
   - In mobile c08, the ball (365, 733), the rim (335-390, 830-860) and the shooter (x 440-780, y 1040-1570) are all inside the frame.
6. **The bench reads as a bench.** The chairs at c02 x 505-840, y 295-355 are empty. r2 had fans sitting in them (before/after `desktop-01` bottom and `desktop-04` top), and r2 fix 8 asked for exactly this. c15 shows a clean row of empty team chairs (before/after `desktop-08` top).
7. **The keep items hold:**
   - **Open-play grade:** the largest step is 0.80% luma, a smooth 79.0 → 76.8 drift (my per-frame means).
   - **Rim flash and clean net pass:** net-close f00-f03 shows the flash and the ball visible through an even lattice. c18 is unchanged from r2 (before/after `desktop-09` bottom).
   - **Ball outline in flight:** `ballContrast` c04 4.6 and c05 3.5. The jumper minimum is 2.63 (r2: 2.50).
   - **Drive handler in band:** 100%.
   - **Desktop framing:** `emptyFgPct` 6.2-13.2 in live stills, players 142-207 px.
   - **Mobile:** players 80-88 px in c02-c07, c10 and c19. The basket is in view, and the thumb deck is separate.
   - **Fronts and champion screen:** the STATE FINALS ribbon (c09) and the champion screen with no bug (c14) are both kept.

---

## 4. Pre-emptive rebuttals

1. **"The card still lingers into play" or "it still hops."**
   - The burst contradicts this. The card is gone in f05 on both viewports, 0.42 s after the make and before the inbound.
   - Its cell-relative position is constant from f02 to f04. Movement happens only in the 10-tick entrance.
   - c16 shows no card.
2. **"The rim-light fix just turned the players into silhouettes."**
   - Lit-court players are well lit. The c06 #12 jersey measures 189 maximum and about 110 mean, and the c02 white kits read clearly against the floor.
   - Only bodies off the lit court go dark, which is what r2 fix 1 ordered.
   - I concede below that the lit-court rim term is now faint.
3. **"There's still a white hot spot on the c07 figure."** The bright pixels (maximum 226) are the referee's white shirt stripes, the garment itself (zoom of x 405-445, y 360-500). No bloom extends past the silhouette.
4. **"The replay wall still has a halo."** Mobile c08 measures 71.8 against 73.6, a 2.4% difference. The desktop c08 wall around the ball (622, 322) is an even brown.
5. **"`voidPct` 14.5 in c15 or 14.9 in c14 means black voids."**
   - c15 is the dark face of the scorer's table and the shadowed apron, with "H…" lettering at x 1060-1110, y 240-275 (before/after scale).
   - c14 is the modal dim behind the champion card.
   - Both are dark but detailed, not empty.
6. **"`ballContrast` collapsed (c06 1.52, c07 1.15, make-wide 1.2)."** These measure a ball in the net (c06) or a dead ball on the floor (c07, make-wide f02-f06). In flight it is 4.6 (c04) and 3.5 (c05), and my c07 view shows the ball with its dark outline on the wood (x 1110-1145, y 320-350).
7. **"Mobile Select still overflows exactly as before."** Not exactly:
   - The team lists gained the cut-off-card cue that the pass test names.
   - TIP OFF is in view.
   - The Difficulty row is still hidden, as conceded below.
8. **"The crowd got worse and thinner."** It is more lit-wood-and-rows than black mush (before/after `desktop-01` bottom), and the crowd still sits about 3x dimmer than the floor (`crowdY` 0.032 against `floorY` 0.221 in c02). It is a style change and not a regression in hierarchy.

---

## 5. Probes that measure the wrong thing

- **c17 and mobile c17 player numbers** (`playerPx` 239.7 desktop, 372.5 mobile; desktop `ballPx` 33) are wrong:
  - In probe c17, the cyan boxes at x 875-1050, y 420-670 sit on bare floor, and the yellow ring at (100, 228) is on the backboard arm.
  - The pixels show no shooter and no ball.
  - The probe reads simulation state, not what the replay camera renders. **This number must not be used to credit c17.**
- **Desktop and mobile c08 `ballContrast`:** the ring is offset from the ball. Desktop has the ring at (535, 345) and the ball at (622, 322); mobile has the ring at (215, 770) and the ball at (365, 733).
- **Mobile c06 `emptyFgPct` 27.9:** this is the floor the card occupies on purpose.
- **Desktop jumper `emptyFgMean` 8.5:** still the lowest player, not the shooter (r2 ruling 8).
- **c13, c14, c20 and c22 player and floor numbers:** these measure frames behind modal menus.

---

## 6. Concessions

1. **c17 is a regression.**
   - The "early" replay beat now shows an empty half-court and the crowd, with no shooter and no ball. That holds on desktop (before/after `desktop-09` top) and on mobile (`mobile-06` middle).
   - r2 had #2 large with the ball. The two replay beats are still not "release" and "ball through the net". c08 shows the ball arriving at the rim, with the shooter seen from behind and cropped by the bottom edge (c08 x 700-935, y 530-745).
2. **The mobile card margin fails the 16 px test.** It touches #0's foot in make-wide f00 and is about 11 css px away in f01. In c06 it is 5.5 css px from the visible shoe.
3. **The Difficulty row on mobile Select is behind the footer** (mobile c13 y 1590-1688), and the Shot clock buttons run under it (y 1475-1530).
4. **The camera fixes were not attempted.**
   - **Desktop:** the shooter is still at the crowd line over half a frame of floor (jumper f04-f17; drive f06-f15, `emptyFgMean` 25.7).
   - **Mobile:** the numbers are identical to r2 (drive 27.7; c11 50.6 px; c16 41.5%; c09 57.6 px). In the mobile drive (f06-f15), the shooter is about 30 strip px tall at the top of the frame.
   - Readability cannot reach 7.5 without these.
5. **The mobile airball crowd matches the make crowd.** Mobile c07 and c06 (y 340-480) show the same raised-arm poses, sprite for sprite. r2 ruling 12 is still open.
6. **The rim/key light on lit players is now faint.** Only a slight warm edge remains on #12's right shoulder (c21 x 840-940, y 345-400). r2 Keep item 5 asked to mask the light, not lose it, and as a concept it is now barely visible.
7. **Characters are unchanged.**
   - c21 still has capsule heads with dot eyes and mitten hands (x 920-1040, y 640-750).
   - The "53" decal floats at the torso's edge (x 440-520, y 510-640), and the near-plane limb is still there (x 0-330, y 370-620).
   - Skin renders as a uniform saturated red-brown with no material split.
   - These belong to later milestones, but they cap Art at 6.
8. **Lighting step 7 was not done:** there are no floor pools (c02 floor patches are identical before and after: 104/138/103/135), and there is no net strand shading or extra bloom.
9. **Venue dressing is still incomplete:**
   - no title banners on the desktop home-gym walls (c02, c06, c10, c11, c19)
   - the Hot Streak crowd still stands on a ledge (before/after `desktop-06` bottom)
   - the c20 "next"/"rival" pills are unchanged (before/after `desktop-10` bottom)
10. **Against the milestone targets:**
    - UI (7.0 against 6.8) and Lighting now meet their targets.
    - Readability (7.0 against 7.5) does not.
    - Overall (6.7 against 7.0) does not.
    - Two blockers stay partly open: the mobile card margin and mobile Select. c17 is a new regression the Arbiter should list.
