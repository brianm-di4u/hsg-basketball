# v3-m4-r1: Prosecutor A (art, lighting, setting)

Round: v3-m4-r1, milestone 4 (HQ stylized player models replace the mannequins; animation still procedural).
Before/after pairs compare with v3-m3-r2. Previous binding verdict: `review/v3-m3-r2.md` (6.5).

**What I read:** PACKET.md, RUBRIC.md, REVIEWER.md, v3-m3-r2.md, `probe/probe.json`, all 4 desktop sheets and all 3 mobile sheets, before/after `desktop-05`, `desktop-08` and `desktop-11`, benchmark sheets `-02`, `-03` and `-04`, bursts `desktop-jumper` and `desktop-make-wide`, and the full-size stills desktop c02, c08, c15, c16, c17, c18, c19, c21 and mobile c21.

**My own crops and measurements** (Rec.601 luma, sRGB 0-255, box medians):
- 2-3x crops:
  - c21 faces (x 340-800, y 90-500), the c21 far elbow (x 300-520, y 360-540) and the c21 top-left corner (x 0-160, y 0-100)
  - mobile c21 torsos (x 300-780, y 560-1060)
  - c15 referee (x 660-1010, y 85-420) and c15 shoes (x 760-990, y 590-760)
  - c08 shooter, rim and left baseline; c17 shooter
  - c02 YOU/#53 and the paint clump; c16 YOU/#14 and the blue clump; c19 paint clump; c06 players
- Skin, wall and table boxes, listed where I use them.

The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **6.5** | **Up from 6. The players are now authored characters, not mannequins.** c21 shows a modelled nose, ears, brows, eyes and five-finger hands (my 2x crop). Jerseys have piped necks and armholes, the shorts have side panels, there are wristbands, and the decals sit on the chest (c02 #53, my 3x crop). Dark players are modelled again, with features (c15 referee, c16 YOU).<br>**It stops well short of 7:**<br>- **Sneakers:** they are a black skin over a bare foot, so the toes show through, and the soles have ragged white edges (c15 shoes crop).<br>- **Armholes:** they tear onto the arm when it bends (c21 elbow crop; c17 right shoulder; c02 #53 left shoulder).<br>- **Hair:** some of it is primitive solids: a stovepipe on #3 and a flat-topped bucket on #21 (c02, c19).<br>- **Faces:** both c21 players and the c15 referee share one small-eyed, worried-brow face.<br>- **Venue:** unchanged. The table face is black, the stanchions are black boxes, the chairs are empty and identical, and the arena roof is still missing. |
| Lighting & materials | **6** | **Unchanged.** The skin crush is fixed on luma: c16 YOU head 48.2, c15 referee 64.6, against 0.0 and 1.2 in r2.<br>**But the hue is broken at both ends of the range:**<br>- Dark skin is rust with no blue: c15 referee RGB (120,49,0), R:G 2.45; c16 YOU head (91,35,3), R:G 2.60.<br>- Light skin goes sallow or paper: the c08 referee is (193,156,81), R:G 1.24; c02 #3 is (212,179,146), R:G 1.18.<br>**Materials and light:** skin, jersey and shoe all share one matte response. There is no rim light, no specular and no catchlight (c21).<br>**Fails the hierarchy:** desktop live `floorCrowd` is 2.75-3.38, against a pass of 3.4.<br>**Carried artifacts:** wall blue is still 0 (c18 134,60,0; c12 98,35,0; c02 fascia 131,57,0), the c15 table face is 0.9, and the c08 far wall is a 20.6-luma void while the left wall (147) outshines the floor (97). |
| Animation & game feel | **6.5** | Procedural and unchanged, as planned. Against: cloned poses (the four white defenders in c19 hold the same arm angle, in a conga line). c17 has the ball about 250 px from the release hand. c02 #53 dribbles with both hands raised above the ball. |
| UI / HUD | **7** | Unchanged. The desktop "+3" stagger holds (make-wide f02-f06). Mobile c13 still draws cards (Cutter-, Jessieville) below BACK/TIP OFF (sheet `mobile-02`). |
| Typography | **6.5** | Unchanged: a display face plus a text face. The c20 "next"/"rival" pills and the c13 "game colors" chips are still under 12 px. |
| Readability | **6.5** | **Better:** dark players have faces and a facing cue again (c16 YOU crop, c02 clump #42). `ballContrast` is c04 4.13 (r2 3.73), c05 3.73 (3.38) and jumper minimum 2.08 (1.95).<br>**Worse:** the new meshes interpenetrate in every clump. In c16 three blue players occupy one volume (x 540-640, y 410-560); in c19 four white defenders overlap at the arms (x 290-420, y 400-600); in c02 #21 runs through a white player (x 300-360, y 450-540). |
| Mobile portrait | **7** | Unchanged. Players are about 83 px (`playerPx` 82.5-87.5 in c02-c05), and the thumb deck is separate. Against: Select still renders below its footer (mobile c13), and c17 is still late (the ball sits far above the hands, `mobile-03`). |
| Authenticity of setting | **6.5** | **Unchanged venue:** c09 is structurally identical to r2 (`desktop-05` upper pair), and `floorY` is still 0.139.<br>**New inauthenticity from the player pipeline:** every referee wears the player kit, a sleeveless striped tank with wristbands, shorts and tights (c15, c18, c06, c08). A high-school official wears a short-sleeved striped shirt and black trousers.<br>**The crowd:** photographic fans stand on the court apron with no contact shadow (c08 x 0-100, y 450-700; c18 x 180-890, y 130-590; c19 x 0-70, y 290-420). |
| **Overall** | **6.6** | (6.5 + 6 + 6.5 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 52.5 / 8 = 6.56. That is +0.06 on r2's 6.50, which is not a 0.2 gain. Art moved alone, and the player models brought a new set of artifacts with them. |

**Against the benchmarks:**
- **Playgrounds 2** (`benchmarks-04`: playgrounds2-1, -2 and -3) is stylized all the way down. Its crowd, its players and its props share one shader and one proportion system.
- **Here, the stylized players stand in front of a photographic crowd** at full contrast (c15, c21, c18). In every close camera the people in the stands look more real than the athletes. A Playgrounds player would read that as two games composited together.
- **The 2K27 portraits** (`benchmarks-03`, `-04`) show what "material" means: sweat specular, cloth weave, and a rim light on the skin. c21 has none of these.

---

## 2. Defects, ranked by how often a player sees them

### 1. The photographic crowd fights the stylized players (every frame)
- **Evidence:**
  - c21 and c15 put AI-photo fans at full detail and contrast directly behind toon athletes. The c15 crowd is sharper than the referee's face (c15 x 0-1280, y 0-400).
  - In c18 the photo fans stand on the floor behind the basket at near-player scale, with no shadows (x 180-890, y 130-590).
  - The c08 and c19 baseline fans stand on the apron (c08 x 0-100, y 450-700).
  - `crowdY` is up to 0.0911 in c18, and live `floorCrowd` is 2.75-3.38.
- **Fix:**
  - Push the cards toward the players' style: posterize to 4-6 tones, add a 1 px dark outline, desaturate 15%, cut contrast 25%, and add a 1.5-2 px blur at gameplay distance.
  - Remove every card from the floor plane, or give it a contact shadow and a matching toon grade.
  - Long term: render the crowd from the new character pipeline at low LOD.

### 2. Skin hue: rust dark tones, sallow light tones (every frame)
- **Evidence:**
  - **Dark:** c15 referee face (x 870-900, y 120-170) median (120,49,0), R:G 2.45; arm (x 940-990, y 200-280) (135,62,3); c16 YOU head (x 1150-1166, y 452-470) (91,35,3), R:G 2.60.
  - **Light:** c08 referee (x 245-262, y 500-520) (193,156,81), R:G 1.24; c02 #3 face (x 265-285, y 535-555) (212,179,146), R:G 1.18.
  - **In range:** c21 #12 cheek (x 650-700, y 170-215) is R:G 1.65, which passes; c21 #53 (x 380-430, y 200-260) is 1.99, just over the 1.9 limit.
- **Why it reads wrong:** the blue channel is 0 on dark skin. That is the same gamut clip as the walls, and it reads as terracotta, not brown.
- **Fix:**
  - Author the skin ramp in linear space with blue at 35-45% of red on the darkest tone. Clamp R:G to 1.3-1.9 on the lit side for every tone, and validate on rendered masks.
  - Add the cool rim term (0.15-0.2 of the key), asked for since r3. It would also separate dark skin from the floor.

### 3. Hair meshes are primitive solids (every gameplay frame)
- **Evidence:**
  - #3 has a tall flat-topped black cylinder: c02 (x 250-290, y 495-530), and c19 (x 425-460, y 495-530).
  - #21 has a blonde flat-topped bucket (c19 x 465-495, y 455-485).
  - #14's bun (c16 crop) and #2's bun (c08, c17 crops) are lumpy clusters of spheres.
  - #53's fade has a hard, stair-stepped hairline polygon (c21 crop, x 380-540, y 120-200; mobile c21 x 0-240, y 310-420).
- **Fix:**
  - Model the hair as sculpted shells with a tapered silhouette: no flat tops, and buns blended to the scalp.
  - Feather the hairline with an alpha-tested fringe, or a vertex-colour fade to skin.
  - Give the shells a hair-spec band (anisotropic highlight) so they read as hair, not as hats.

### 4. Bodies interpenetrate and poses are cloned (c02, c16, c19)
- **Evidence:**
  - c19: four white defenders hold the same arms-out pose and overlap at the forearms (x 290-420, y 400-600, my crop).
  - c16: three blue players share one volume (x 540-640, y 410-560).
  - c02: #21 passes through a white player (x 300-360, y 450-540).
- **Fix:**
  - Add a capsule-separation pass of at least 0.45 m between torsos.
  - Add per-player phase offset and a ±15° arm-angle variance on shared defensive poses.

### 5. Armhole piping tears onto the arm when the arm moves (close and mid cameras)
- **Evidence:**
  - **c21 far elbow** (x 360-430, y 405-480, my 3x crop): the gold armhole and maroon lining have been dragged down onto the elbow as a floating crescent, and the fingers appear to sprout from under it.
  - **c17 right shoulder** (x 840-860, y 410-440): a white jersey flap stands off the raised arm.
  - **c02 #53's left shoulder** (x 770-785, y 445-455): a maroon flap sticks out past the deltoid.
- **Fix:**
  - Weight the jersey's armhole ring 100% to the spine/clavicle bones, never to the upper arm.
  - Add a corrective blendshape, or push the cloth out along normals, for arm raise above 60°.

### 6. The sneakers show bare toes, and the soles are ragged (every close camera; visible at gameplay size as lumpy toes)
- **Evidence:**
  - c15 shoes (x 785-965, y 640-750, my 3x crop): five toe ridges show through a glossy black upper on both feet.
  - The white sole's top edge is torn and jagged.
  - Orange skin specks show at both ankles (x ~855, y 650; x ~950, y 690).
  - A white sliver runs down the right tights (x ~925, y 650-700).
  - The left leg has a white sock band; the right has none.
- **Fix:**
  - Delete the foot mesh under the shoe, or hide it with a mask.
  - Model the shoe as its own mesh: a toe box, a midsole with a bevel, and a clean sole/upper seam in geometry, not in texture.
  - Fix the sock/tights layering so it is symmetric.

### 7. Texture-mask aliasing on the trims (every close camera)
- **Evidence:**
  - The gold wristband's top edge is a sawtooth: c21 (x 595-640, y 315-350), and in mobile c21 a 6-tooth zigzag (x 440-510, y 600-640).
  - The gold armhole and neck piping are stair-stepped (c21 crop, x 360-640, y 370-470).
  - The referee's stripes are pixel-stepped (c15 crop, x 840-960, y 190-390).
  - The decals carry a blurry tan halo ("12" in c21 and mobile c21; "2" in c08).
- **Fix:**
  - Put the trims in geometry (an edge loop with its own material ID), or raise the trim mask to 2K and use signed-distance edges.
  - Generate mips with alpha-to-coverage.
  - Rebake the decal outlines at 2x and sharpen them.

### 8. Faces are one template with small, dead eyes (c21, c15, c08)
- **Evidence:**
  - In c21 each head is about 150 px tall, but the eye whites are about 12x5 px with a dot iris and no catchlight.
  - The lips are a faint line, not a modelled shape.
  - #12, #53 and the c15 referee all wear the same inner-raised "worried" brows.
- **Against the owner's direction:** "expressive eyes" in the animated-film sense means eyes at roughly 1.3-1.5x realistic scale, with a specular catchlight and a visible iris colour. Playgrounds 2 pushes this further still.
- **Fix:**
  - Scale the eyes up 30-40%. Add an iris with a ring, a cornea dome with a fixed catchlight, and a lid line.
  - Give each character a brow and mouth preset (neutral, focused, intense) and vary it per player.
  - Add a lip shape with a subtle colour shift.

### 9. Referees wear the player kit (c06, c08, c15, c16, c18)
- **Evidence:** a sleeveless striped tank, black wristbands, shorts over tights, and basketball shoes (c15 full frame; c18 x 340-550, y 385-760).
- **Fix:** a short-sleeved striped V-neck shirt, black trousers, black shoes, and no wristbands. A whistle lanyard would add authenticity at no cost.

### 10. Stray geometry slivers (mobile c21)
- **Evidence:** a thin black vertical line on #12's jersey by the armhole (mobile c21 x 668-675, y 680-765), and a yellow-and-purple strand floating between the players (x 340-380, y 635-690).
- **Fix:** find the degenerate or back-facing strip (likely the piping or wristband edge) and cap or weld it.

### 11. A near-plane limb is still in the c21 close camera
- **Evidence:** a brown blob at the top left (x 0-130, y 0-80, my 3x crop). It is smaller than r2's, but it is still a body part cut by the near plane.
- **Fix:** fade or hide meshes within 0.4 m of the camera (r2 fix 10).

### 12. Venue carryovers (every frame)
- **Evidence:**
  - the c15 table face is luma 0.9 (x 800-1200, y 450-650)
  - the stanchions are black boxes (c08 x 315-545, y 300-560; c18 x 870-1140, y 0-600)
  - the chairs are empty and identical (c02, c15, c19)
  - the arena is unchanged with a dark roof (c09, `desktop-05`; c14)
  - the replay far wall is a void (c08 x 800-1100, y 100-250, luma 20.6), and the left wall outshines the floor (147 against 97)
  - wall blue is 0 (c02, c12, c18)
  - Hot Streak is unchanged (c12)
- **Fix:** as r2 fixes 3-7. None of them was touched this round.

---

## 3. Regressions and status against v3-m3-r2

**Regressions:**
1. **The appearance mix appears to have drifted lighter** (r2 Keep 6, the assignments):
   - **c16 blue team:** in `desktop-08` (lower pair) several dark blue players in BEFORE are light or paper-pale in AFTER (my crop: three pale blue players, one dark).
   - **c10 white clump:** mostly dark in BEFORE, mostly light in AFTER (`desktop-05` lower pair).
   - **c21:** both players are now light or tan (`desktop-11` upper pair).
   - c16 YOU and the c15 referee stay dark. I can't map every character without r-1 frames, but the balance shifted.
2. **The new models brought new artifact classes**, not regressions of a Keep but new defects at milestone level: toes through the shoes, armhole tearing, sawtooth trims, interpenetration, and stray strands (defects 4-7 and 10).
3. **Still broken from r2, no change:**
   - c08 draws the ball over the front rim and the front net strands (my 4x crop, x 560-680, y 320-420; the front rim passes behind the ball).
   - c17's ball is about 250 px from the release hand, and the shoes are cut by the letterbox at y 745.

**Status of the r2 blockers:**

| r2 blocker | Status | Evidence |
|---|---|---|
| **1. Skin shading and hue** | **Partly** | **Luma passes:** c16 YOU head 48.2 and c15 referee 64.6 (both ≥ 35), and no skin pixel is over 240 (maximum 225). **Hue fails:** dark tones have blue at 0-3 with R:G 2.45-2.60; light tones run R:G 1.18-1.24 (c08 referee, c02 #3); c21 #53 is 1.99. |
| **2. Crowd exposure** | **Partly** | Desktop live `floorCrowd` 2.75-3.38 (pass 3.4). `ballContrast` c04 4.13 (pass 4.5), c05 3.73 (pass met), jumper minimum 2.08 (pass 2.6). `floorY` holds at 0.19 or more except c09. |
| **3. Mobile card margin** | Not judged in my lens | The mobile c06 card now sits mid-frame, clear of the players in the sheet. Prosecutor B should measure it. |
| **4. Mobile Select footer** | **Open** | Cards render below BACK/TIP OFF (sheet `mobile-02`, c13). |
| **5. Replay beats** | **Open** | c17: the ball is far from the hand on both viewports (desktop c17; `mobile-03`). c08: the ball is over the front rim (above). |

**Keeps verified:**
- the block walls (c02, c18) and the replay wainscot (c08)
- the title banners (sheet c01)
- the desktop "+3" stagger (make-wide f02-f06)
- c20 whole (sheet `desktop-04`)
- the per-school bands and wordmarks
- no callout over the rim or ball in the stills I opened
