# v3-m2-r3: Prosecutor A (art, lighting, setting)

Round v3-m2-r3. Before/after pairs compare with v3-m2-r2. Last binding verdict: `review/v3-m2-r2.md` (6.6, 3 blockers).

**What I opened:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m2-r2.md`
- **Contact sheets:** the first read of all 7 returned "media removed: request limit" in my session. A later read of `sheets/desktop-01.png` and `sheets/desktop-04.png` worked. For the rest I used the full-size stills and the before/after pairs, which cover every shot.
- **Before/after:** all 11 desktop pairs; mobile pairs 01, 02, 03, 04 and 06. Pairs mobile-05, -07 and -08 did not load (request limit) and I make no claims from them.
- **Full-size desktop stills:** c01 (via before-after), c02, c06, c07, c08, c09, c10, c11, c12, c13, c15, c16, c17, c21
- **Full-size mobile stills:** c01, c02, c05, c06, c07, c08, c09, c11, c12, c13, c15, c16, c17, c18, c21
- **Bursts:** desktop make-wide, jumper, drive, open-play and net-close; mobile make-wide, drive and net-close. Mobile jumper and open-play did not load.
- **Benchmarks:** sheets 01 and 04
- `probe/probe.json` (all entries), plus the annotated probe frames for desktop c08 and c17 and mobile c17
- **My own zooms (nearest-neighbour) and pixel statistics (mean, max and p99 luma, mean RGB):**
  - the r2 rim-light coordinates in c02, c06 and c07
  - dark-skinned heads in c06, c10, c16 and c09
  - the c15 referee's head and shoes, and a c15 crowd sprite's edge
  - the mobile c08 wall around the ball (ball located by an orange-pixel search at x 348-377, y 715-747)
  - the flat replay walls in c08, c17 and mobile c17
  - the c17 right edge
  - the c21 near-plane limb
  - full-frame luma and colour of 7 live desktop stills

The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| **Art: players, court, venue** | **6** | **Better:** the title is now a pulled-back attract view, with no giant cut-out faces (before-after `desktop-01` top; mobile c01). The street-clothes sprites are gone from the bench chairs (c02 x 505-840, y 295-355; c09; c15). **Unchanged mannequins:** red-orange tubes with mitten hands and dot eyes (c21 sheet). The skin averages RGB (110,11,2) on the face at x 700-780, y 170-260, which is not a skin colour. The near-plane limb is still there (c21 x 0-330, y 380-630). **The crowd is a different art style:** a photographic crowd behind toy players in every live frame, and benchmark sheet 04 (Playgrounds 2) shows how far apart these are. **Benches:** they are now rows of identical flat red chairs with nobody in them (c15 x 20-650, y 280-520). |
| **Lighting & materials** | **6.5** | **Credit:** the r2 ghosts are gone. The dark kits in the apron no longer glow: c07 x 375-455, y 360-500 peaks at luma 225, which is the white referee stripe; c02 x 950-1010, y 255-370 peaks at 212; and the c06 left player's hip is clean in my 3x zoom. The mobile replay blot is gone (ruling below). The hierarchy holds (`floorCrowd` 2.7-3.4 in desktop live stills). There is a soft floor pool in c12: luma 145 at centre against 109-113 at the sides. **Against:** dark skin is crushed to pure black: the c16 head at x 1135-1150, y 450-470 has mean luma 1.2, and the c06 head at x 63-80, y 445-470 has 3.9. Every live frame has a heavy amber cast, with mean RGB (116,73,30) in c02, and white tops out near luma 225 in c02, c07, c09, c10, c16 and c19, so there is no real highlight and no bloom. Skin, cloth and wood still don't differ as materials (c21). The 7 anchor fails on the black faces. |
| **Animation & game feel** | **6.5** | **Credit:** the callout now slides in over make-wide f00-f02 and is faded by f04 on desktop; on mobile it fades over f02-f04 in empty floor, before the opponent arrives in f06. The rim flash is kept (net-close f00-f03). **Against:** the net is a rigid lattice the ball passes through without deforming it (desktop net-close f00-f05). The jumper is the same small release at the crowd line (jumper f04-f17). The replay-early beat now shows no shooter and no ball (c17; regression 1). |
| **UI / HUD** | **7** | **Credit:** Blocker 1 passes in the pixels. The desktop card is gone from c16 and gone by make-wide f04-f05, before possession resumes at f07. The mobile card never touches a player box (mobile make-wide f00-f04). Desktop Select fits 1280×800 with TIP OFF in view (c13 x 958-1060, y 683-735; before-after `desktop-07`). **Against:** mobile Select still clips the Shot clock buttons at the footer line (mobile c13 y 1475-1530), and the Difficulty row sits behind and below the footer (y 1590-1688). In make-wide f00-f01 the incoming card partly covers the "+3". |
| **Typography** | **6.5** | **Credit:** one condensed display face plus a text face, used consistently (c13, c20, c22). **Against:** the c13 "game colors" pills and the c20 "next"/"rival" pills are tiny, and "Press Space to skip" is small (c08 x 12-170, y 62-90). It is not yet "nothing under 12 px". |
| **Readability** | **7** | **Credit:** the ball keeps its dark outline (c10 zoom; `ballContrast` c04 4.6, jumper minimum 2.63). **Against:** the shooter still stands on the crowd line over a large bare floor (jumper f04-f17; drive f08-f15). Dark-skinned players read as featureless black cut-outs (c10 #13 and YOU, c16, c09 #15), so you can't tell which way a body faces. The paint still clumps (c19). |
| **Mobile portrait** | **7** | **Credit:** players are 77-88 px in c02-c07, c10 and c19. The replay is a taller portrait crop (before-after `mobile-03`, c08). The title is clean (mobile c01). **Against:** the exceptions are numerically identical to r2: c11 50.6 px, c16 41.5% empty, c09 57.6 px, and drive `emptyFgMean` 27.7, with the shooter at the top over about 70% bare floor in mobile drive f06-f15. Mobile c17 shows only floor and crowd. Mobile Select still clips. |
| **Authenticity of setting** | **6.5** | **Credit:** the STATE FINALS ribbon and table (c09 y 230-310), school-colour crowds and the pep band (c02 x 60-260, y 160-320), the per-school floor crests and table wordmarks (c10, c11), and the COBRAS wall banner (c08). **Against:** no team on any bench, only empty chairs now (c15, c02, c09). There are no title banners on any desktop home-gym wall: c06 right wall x 1150-1280, y 0-300 and c10 left wall x 0-80 are bare brick, and c12 has a bare back wall (y 0-90). The Hot Streak crowd still stands on a ledge with no ball racks (c12 x 220-1040, y 90-225). The replay end wall is an untextured brown plane (defect 5). |
| **Overall** | **6.6** | (6 + 6.5 + 6.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 53 / 8 = 6.63 |

---

## 2. Defects, ranked by how often a player sees them

### 1. Dark-skinned players render as pure-black silhouettes with no face (most live frames)
- **Evidence:**
  - c16 head at x 1135-1150, y 450-470: mean luma 1.2, RGB (4,0,0), on the lit court, beside a lit #14 whose skin is luma 59 at x 1220-1240, y 510-530
  - c06 left player's head at x 63-80, y 445-470: mean 3.9
  - c10 YOU and #13 (my 3x zoom of x 620-840, y 380-560): heads and arms are flat black, and #13's face shows no feature
  - c09 #15 at x 330-430, y 515-690
  - c15 referee's head at x 860-960, y 90-200: mean 22, a black head with one white eye dot
  - The r2 version of the same c16 player had a faint grey edge on the head that is now gone (before-after `desktop-08`, my 3x zoom of both halves).
- **Why it matters:** masking the rim term fixed the ghosts but left nothing to model dark skin. These players read as holes in the frame, which is also a representation problem in a game set in real schools.
- **Fix:**
  - Floor the dark-skin albedo at about sRGB 55-75, rather than near-black.
  - Add wrap or subsurface-style diffuse (wrap about 0.3) so the terminator softens.
  - Bring back a cool rim term at about 0.15-0.2 of the key, applied only to bodies inside the lit-court mask.
  - Give the face features (eyes, brows, lips) a value contrast of at least 25 luma against the skin.
  - **Pass test:** in c06, c10 and c16, mean skin luma on the lit side of every on-court player is at least 35, and a face feature is visible in a 3x zoom.

### 2. An amber grade with capped highlights (every live frame)
- **Evidence:**
  - The mean RGB of the play area (y 90-800) is (116,73,30) in c02, (122,77,40) in c10 and (121,78,34) in c16: blue sits at roughly a quarter of red.
  - Max luma is 221.7 in c02, 225.6 in c07, 223.5 in c09, 225.4 in c10, 223.7 in c16 and 225.4 in c19. Nothing in live play reaches 240. Only the c06 card text does, with 7,693 pixels.
  - So white jerseys read as cream, the scoreboard digits and the rim flash don't bloom, and the whole frame looks sepia beside benchmark sheet 04 (Playgrounds 2 has neutral whites and hot lamps).
- **Fix:**
  - Neutralize the white balance: a cooler grade that keeps the wood warm through its albedo, not through a global tint.
  - Raise the tonemap white point so true whites reach 240-250.
  - Add a bloom pass, thresholded so only the rim flash, the shot-clock digits, the exit signs and the c09 ribbon pass it.

### 3. A photographic crowd behind toy players, with fringed sprite edges and repeats (every live frame)
- **Evidence:**
  - Two art styles in every desktop live frame (crowd y 0-380, players below; c02, c06, c16).
  - A pale alpha halo on dark hair: c15 x 1090-1200, y 245-330 (4x zoom).
  - A blonde-woman sprite with similar poses recurs many times across c02 x 380-1000, y 90-300 (1.5x zoom).
- **Fix:**
  - Premultiplied alpha with 1 px dilation on the crowd atlas.
  - A seeded no-repeat-within-3-seats shuffle with mirror and tint jitter (r2 fix 8, not done).
  - The style unification belongs to the VAT-crowd milestone.

### 4. Mannequin players (every close and mid shot)
- **Evidence:** c21: capsule heads, dot eyes, mitten hands (x 830-980, y 480-600), and the near-plane limb (x 0-330, y 380-630; mean luma 28.6). The "53" decal floats at the torso's edge. Skin is RGB (110,11,2).
- **Fix:** this is r2 fix 9 (later milestone). Until then, hide meshes within 0.4 m of the camera and keep the c21 camera waist-up.

### 5. Untextured end wall in replays (every replay)
- **Evidence:**
  - c17 x 400-1200, y 80-250: luma 50-74 as a smooth gradient, with no brick, banner or ceiling, filling about 25% of the frame.
  - c08 x 650-1250, y 80-330: the same.
  - Mobile c17 y 120-650: about 32% of the frame.
  - Mobile c08 x 280-330, y 560-600 and x 360-400, y 760-800: exactly 73.6-73.8 with zero variance.
  - The left wall in c08 does have brick and the COBRAS banner (x 0-550), so the far wall is simply not dressed.
- **Fix:**
  - Extend the brick material, plus 3-5 banners and a fascia or ceiling truss, to the far wall above the bleachers.
  - Or pitch the replay camera down so the wall leaves the frame.

### 6. The early replay shows nothing (every replay; regression 1)
- **Evidence:**
  - **Desktop c17:** the basket is at the far left (x 130-250, y 140-345). There is no shooter and no ball (my orange-pixel search finds only 24 scattered pixels). Two cropped defenders, #32 and #10, sit at the right edge (x 1150-1280, y 420-700; 2x zoom). The probe's ball ring (x 55-145, y 180-275) circles empty wall.
  - **Mobile c17:** floor and crowd only, with no basket, player or ball (orange-pixel search: none).
  - r2 c17 showed #2 releasing with the ball in the air (before-after `desktop-09` and `mobile-06`, left halves). r2 fix 5 asked for the release beat, with the shooter large.
- **Fix:** anchor the "early" camera to the shooter's position at release, with the shooter at 40-60% of the frame height and the ball and hand in frame. Validate that the ball is inside the letterbox in both early and late beats.

### 7. Empty benches and a black-slab scorer's table (bench and sideline views)
- **Evidence:**
  - c15 x 20-650, y 280-520: 11 identical flat red chairs with no players. The chair faces are uniform, with no wear or texture.
  - The scorer's table at c15 x 745-1280, y 380-700 is a black box with only an "H…E" fragment showing past the referee.
  - c02 and c09 have the same empty chairs.
  - Clearing the street-clothes sprites was ordered, but the result is a gym with no teams.
- **Fix:** r2 fix 10 (benches) in its milestone. Until then, add towels or water bottles on the chairs and give the scorer's table a lit face (school wordmark, a light strip, two officials).

### 8. Desktop home gyms still have no banners; Hot Streak is unchanged (most desktop frames)
- **Evidence:**
  - c06 right wall x 1150-1280, y 0-300 and c10 left wall x 0-80 are bare brick and stripe.
  - The c12 back wall (y 0-90) is bare. The c12 crowd stands on a two-step ledge with nobody behind it (x 220-1040, y 90-225), and there are no ball racks (before-after `desktop-06` bottom pair, nearly identical).
  - Mobile c06 and c07 do carry pennant banners (y 70-95 at half scale).
- **Fix:** r2 fix 8: 3-5 title banners on the desktop end and side walls; a 3-step bleacher and two ball racks in Hot Streak.

### 9. The net is rigid and the stanchion is untextured (every make)
- **Evidence:**
  - Desktop net-close f00-f05: the ball passes down through a lattice that keeps its shape.
  - Mobile c18 (3x zoom): the net is a flat cream lattice with no strand shading.
  - The stanchion is a plain black-and-orange box (c18; c12 x 600-680, y 170-265).
- **Fix:** net vertex sway driven by ball contact, and strand shading (r2 fix 7). Bevel the stanchion pad and give it a vinyl sheen.

### 10. Minor lighting artifacts
- **Mobile c17:** a white floor smear at x 90-180, y 1480-1560 (mean luma 188, against 127 on the floor nearby). It reads as a blob, not a lamp reflection. Clamp the specular and use a broader lobe.
- **c15 shoes:** a thin white rim along the soles of black shoes in shadow (x 820-940, y 650-725; max 215; 4x zoom). This is residue of the rim term, and the received-light mask should cover it too.

### 11. Camera framing (most shots)
- **Evidence:** jumper f04-f17 and drive f08-f15 put the shooter at the crowd line. Mobile drive f06-f15 puts the shooter at the top over about 70% empty floor. Mobile c11, c16 and c09 numbers are unchanged (r2 fix 4, not done).
- **Fix:** as r2 fix 4.

---

## 3. Regressions and blocker status against `v3-m2-r2.md`

### Blockers

| r2 blocker | Status | Evidence |
|---|---|---|
| **1. Callout lifecycle and mobile slot** | **Closed** (in the pixels I could see) | **Desktop:** no card in c16. In make-wide the card slides f00-f02 (about 0.17 s), fades f03-f04, and is gone at f05, before the opponent pushes at f07. **Mobile:** make-wide f00-f04 is in empty floor below every player, and it is gone by f05, before players enter at f06. **Nit:** the card covers the "+3" in make-wide f00-f01. |
| **2a. Rim/specular ghosts on dark kits** | **Closed** | **c07** x 375-455, y 360-500: max 225.6, which is the white stripe on the referee's jersey; the body is dark with no hip bloom (3x zoom). **c02** x 950-1010, y 255-370: max 212. **c06** x 40-170, y 430-710: max 188, with no skin pixel above 240. **Side effect:** dark skin is now crushed (defect 1). |
| **2b. Ball-dim blot on a flat wall** | **Closed** | **Mobile c08:** the ball is at x 348-377, y 715-747. Wall luma right beside it is 73.6 (x 360-400, y 760-800); 3+ diameters away it is 73.8 (x 280-330, y 560-600), within 5%. My 2x zoom shows a clean outlined ball. **Mobile c05:** no dark halo near the ball (x 390-440, y 300-345 is 66, against 55-56 further away, so brighter, not darker). |
| **2c. Upscaled title cut-outs** | **Closed** | Before-after `desktop-01` top: the AFTER has no foreground faces. Mobile c01 (half-scale view) has no giant face at the bottom. |
| **3. Select overflows** | **Partly** | **Desktop closed:** c13 fits, with TIP OFF at x 958-1060, y 683-735 and nothing behind the footer. **Mobile open:** the Shot clock buttons are cut at the footer line (mobile c13 y 1475-1530). The Difficulty label is ghosted behind the footer at about y 1605, and its buttons are cut at the bottom edge (y 1660-1688). The partly visible third card (x 640-720) works as a scroll cue for the team lists. |

### "Fix in this milestone" items

| Item | Status | Evidence |
|---|---|---|
| 1. Clear the new artifacts | **Closed**, with one side effect | See 2a-2c above. New: the dark-skin crush (defect 1). |
| 2. Callout slot and lifecycle | **Closed** | Blocker 1 |
| 3. Select layout | **Partly** | Blocker 3 |
| 4. Shot camera and portrait framing | **Open** | The jumper and drive framing are unchanged. The mobile probe numbers are identical to r2. |
| 5. Replay beats and portrait replay | **Partly, with a regression** | **Done:** a taller portrait crop (before-after `mobile-03` right pair). **Regressed:** c17 "early" frames no shooter or ball (defect 6). |
| 6. HUD and type polish | **Open** | The c20 pills and "Press Space to skip" are unchanged in size. |
| 7. Lighting, the next step | **Partly** | **Some:** a soft floor pool in c12, and floor sheen in the replays (c17 x 420-480, y 550-610 is luma 145 against 131 nearby). **Not done:** the material split (c21), net strand shading (mobile c18), and bloom (no live pixel above 226). |
| 8. Venue dressing and crowd sprites | **Partly** | **Done:** the bench rows are cleared of street-clothes sprites (c02, c09, c15). **Not done:** desktop banners, the no-repeat shuffle, the Hot Streak bleacher and racks, crowd-edge premultiplication (c15 halo), and mobile AA. |

### Regressions since r2
1. **The replay-early beat lost its subject** on both viewports: c17 and mobile c17 have no shooter, no ball, and (on mobile) no basket.
2. **Dark-skin faces lost their last bit of modeling.** The faint grey edge on the c16 head in r2 is gone (before-after `desktop-08`, 3x zoom), and the head now averages luma 1.2.
3. **The emptied benches** now show a gym with no teams: rows of identical flat chairs (c15). This was ordered, so I note it but do not count it against the build.

### Keep items that were checked and held
- The ball's dark outline (c10 zoom; jumper `ballContrastMin` 2.63)
- The rim flash (net-close f00-f03)
- The hierarchy (`floorCrowd` 2.7-3.4)
- The STATE FINALS ribbon and table (c09)
- The school-colour crowds and pep band (c02)
- The desktop framing (`emptyFgPct` 6.2-13.2 in live stills)
- The mobile 77-88 px players
- The navy-and-gold front end (c13, c20, c22)
