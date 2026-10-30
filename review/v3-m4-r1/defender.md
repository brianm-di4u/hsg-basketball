# v3-m4-r1: Defender brief

Round: v3-m4-r1, milestone 4 (new player models replace the mannequins; animation is still procedural). Before/after pairs compare with v3-m3-r2.

**What I read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m3-r2.md`.
- **Contact sheets:** all 4 desktop and all 3 mobile.
- **Before/after:** desktop `-01` to `-11`.
- **Full-size stills:** desktop c02, c06, c10, c15, c16, c17, c19 and c21; mobile c06.
- **Bursts:** desktop jumper, drive, make-wide, net-close and open-play; mobile make-wide.
- **Benchmarks:** sheets `-02` and `-03`.
- **Probes:** `probe/probe.json`, all stills and bursts.

**My measurements:** Rec.601 luma in sRGB 0-255, as box medians with p10/p90, plus 3-6x gridded crops. The boxes are listed where I use them. I did not review the webm or sound, and I don't score them.

---

## 1. Scores

| Category | v3-m3-r2 | **Defender** | Justification and evidence |
|---|---|---|---|
| Art: players, court, venue | 6 | **7** | **The mannequins are gone.** c21 shows modelled faces: iris and highlight, knitted brows, nose, lips and an ear (#12, x 640-760, y 110-280). It also shows five-finger hands (#12 x 800-900, y 370-500; #53 x 540-640, y 190-430) and piped jerseys (gold trim on maroon, black on white). These read at gameplay size: my 3x crop of c02 x 560-800, y 380-620 shows #53's eyes, brows, splayed fingers and a "53" centred on the chest. Dark skin is modelled again (see Lighting). **Held below 7.5 by:** bald or cap-only scalps (c21 #12), a cylinder bun (c19 #21, x 467-490, y 457-480), toe-sock shoes with jagged soles (c15 x 780-960, y 640-750), referees in player tank tops and shorts, photoreal crowd cards behind toon players, and the venue unchanged. |
| Lighting & materials | 6 | **6.5** | **The r2 crush is undone.** The c16 YOU face is 48, the c15 referee face 65 (r2: 1.2), and c10 #13's face 62 with eye highlights at 174-185. c21 light skin has R:G 1.58-1.67 and no skin pixel over 240. **Still against:** dark skin has no blue (c15 face RGB 120,50,0; c10 #13 116,45,5) and is flat (c15 face p10-p90 63-69). There's no bake, no bloom (`clippedPct` 0 everywhere) and no rim light. The replays are inverted (`floorY` 0.06 in c08 and c17), and the arena court is still the dimmest (c09 0.139). |
| Animation & game feel | 6.5 | **6.5** | **The new rig adds some secondary read:** the wrist stays cocked through follow-through (drive f06-f15), defenders splay their fingers (c02, c10 #13), and the desktop card and "+3" stagger is intact (make-wide f00-f06). **Unchanged:** the net is rigid (net-close f04-f11), the c18 referee holds one A-pose for all 12 frames, and the paint clump persists (open-play f00-f15). |
| UI / HUD | 7 | **7** | **Desktop is fully kept:** the card shows f00-f03 and is gone by f05, the "+3" sits to its right from f02 to f06, c20 is whole, and nothing covers the rim or ball. **Against:** the mobile card is back in contact with a shoe (Concession 2). Mobile Select still renders below its footer, and the mobile "+3" still sits on the backboard from f02 to f13. This is the score most at risk. |
| Typography | 6.5 | **6.5** | Unchanged (`desktop-07`, `-10`). The pills and chips are still under 12 px. |
| Readability | 6.5 | **7** | **The facing cue r2 lost is back on dark players:** c16 YOU face 48 against black hair at 0.6, and c10 #13 has eye whites. Numbers are bound to the torso (c02 "53", c21 "12"). **Ball outline improved but still below r1:** `ballContrast` c04 4.13 (r2 3.73), c05 3.73 (r2 3.38), jumper minimum 2.08 (r2 1.95). `handlerInBandPct` is 88-100. **Against:** the paint clump (c02, c19), and in mobile c02 the handler is hidden behind YOU. |
| Mobile portrait | 7 | **7** | Faces and fingers read at about 83 px (my 2x crop of mobile c02 x 240-560, y 560-1000 shows #31's splayed hands and #12's number). **Against:** the card touches the shoe, Select is unchanged, c17 is late, BOYS banners hang in a girls' game (mobile c06, y 140-200), and the framing is unchanged (c11 50.6 px, c16 41.5% empty). |
| Authenticity of setting | 6.5 | **6.5** | **The venue is unchanged:** the arena is structurally identical (`desktop-07` lower pair, `-05` upper pair). **New negative:** referees now wear the player body (tank top, shorts and sneakers: c06 x 90-160, c15, c17 x 160-240, c18). **New positive:** school-coloured piping on every kit. |
| **Overall** | **6.5** | **6.8** | (7 + 6.5 + 6.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 54 / 8 = **6.75**, a change of +0.25 on r2. Almost all of the gain is the player overhaul and the reversal of r2 Blocker 1's shading clauses. |

---

## 2. Strengths, with evidence

1. **The player models replaced the mannequins, which was the rubric's 5-anchor wording.**
   - **Faces:** c21 (before/after `desktop-11`, upper pair). In r2 there were dot eyes on capsule heads; now there are almond eyes with dark iris and white sclera, knitted brows, a modelled nose, lip line, jaw and ear.
     - My 3x crop of #12 (x 620-800, y 80-280) shows sclera and iris separated by about 130 luma. The darkest eye-zone pixel is 0 against a face median of 134.
   - **Hands:** five separate fingers, sculpted with knuckles:
     - c21 #12's hand (x 800-900, y 370-500) and #53's raised hand
     - the c15 referee's hands (x 680-720, y 290-320 and x 920-960, y 305-345)
     - c16 YOU's hand (my 3x crop, x 1170-1200, y 495-510)
     - c10 #13's raised hand (x 802-815, y 405-432)
   - **Kits:** piped necklines and armholes (c21: gold on maroon, black on white; c10 #13: white on navy). Contrasting short panels (c16 #14).
   - **Decals:** the r2 Art row cited "the '53' decal still smears down the torso side". In c02 the "53" now sits centred on the chest (x 740-770, y 455-470, my 3x crop). The c21 "12" is crisp, with a drop shadow.
2. **The dark-skin shading of r2 Blocker 1 is back,** on every character r2 named that is still dark:

   | Character | Box | r2 | Now |
   |---|---|---|---|
   | c16 YOU face/cheek | x 1152-1162, y 458-470 | 0.0 | **48.1** |
   | c16 YOU shoulder | x 1135-1148, y 475-495 | | **69.2** |
   | c16 YOU upper arm | x 1145-1152, y 500-520 | | **57.2** |
   | c15 referee face | x 870-905, y 125-150 | 1.2 | **65.2** |
   | c15 referee lower face | x 880-915, y 150-170 | | **62.9** |
   | c10 #13 face | x 768-784, y 421-432 | 3.3 | **61.6** |

   - **c10 #13's feature contrast:** the eye and headband pixels reach 174-185 against the 62 face, far above the 25 the pass test asks for.
   - **Other dark players in c02 and c19, lit side:**
     - c02's left white-kit player: face and neck 52.0, shoulder 85.3
     - c19's dark white-kit player (x 382-425, y 450-490): face 57.2, forearm 84.3, chest 94.5
   - All of these fall in the pass band of 35-75 on the face, or just above it on lit limbs.
   - Before/after `desktop-08` (upper pair) shows the c15 referee going from a black cutout to a modelled brown figure. `desktop-09` (upper pair) shows c17 #2 going from near-black to brown with a readable profile.
3. **The light-skin hue is natural** (r2: "red plastic"). Measured on c21 #12, against a pass band for R:G of 1.3-1.9:

   | c21 #12 region | Box | RGB | R:G |
   |---|---|---|---|
   | Lit cheek | x 690-725, y 185-220 | (190,114,66) | **1.67** |
   | Left cheek | | | **1.58** |
   | Hand | | | **1.56** |

   - No skin-hued pixel exceeds 240 anywhere in x 320-980, y 100-700 (0 pixels with R > 240 and R > 1.3G).
4. **Ball outline and hierarchy recovered part of the way** (probe):
   - `ballContrast`: c04 3.73 → **4.13**, and c05 3.38 → **3.73**, which passes the 3.6 clause. The jumper minimum rose 1.95 → **2.08**.
   - `floorCrowd`: c02 is now **3.38**, within 0.02 of the 3.4 pass. Desktop live ranges 2.75-3.38, against r2's 2.52-3.13.
   - The floor didn't dim to get there: home-gym `floorY` is 0.197-0.230.
5. **The desktop UI keeps survived the re-rig:**
   - The make-wide stagger is intact: card in f00-f03 (ghost at f04), the "+3" right of it from f02 to f06, the card gone by f05.
   - c20 is whole on both viewports (`desktop-10`, mobile sheet `-03`).
   - The rim flash is intact (net-close f00-f03).
   - No callout covers the rim or ball in c04, c05 or c07.
6. **The other venue keeps are intact:** the block walls and green wainscot (c08, c17), the COBRAS pennant, the title banners (c01), and the per-school bands and wordmarks (c10 JESSIEVILLE, c11 MOUNTAIN PINE). The c08 head and foreground clauses still pass (no foreground body; `desktop-04`, lower pair).
7. **The new rig reads athletically at gameplay size:**
   - **Drive:** the shooter's cocked wrist and raised elbow are held through flight (f06-f15; my 2x crop of f10 shows the follow-through and the trail).
   - **Defence:** both hands are up with fingers spread (c02 #53, c10 #13, c19 red #?).
   - **Make:** the c06 shooter lands with an arm cocked (x 230-330, y 500-740).

---

## 3. Pre-emptive rebuttals

1. **"Dark-skinned players are still black cutouts."** The packet contradicts this. The darkest-tone measurements in Strength 2 are 48-69 for c16 YOU and 63-65 for the c15 referee. Both were 0.0 and 1.2 in r2, and both now sit inside the 35-75 band. In my 6x crop of c16, the face, shoulder and forearm have a lit side and a shadow side (shoulder p10 59 to p90 78). Only the hair sits near 0, and it should.
2. **"Light skin is still red plastic."** c21 #12's cheek has R:G 1.58-1.67, inside the 1.3-1.9 band, and no skin pixel exceeds 240. The plastic sheen is gone too: the cheek's p10-p90 range is 131-133, with no specular hot spot.
3. **"Still mitten hands" or "faces don't read at gameplay size."** Five-finger hands appear in c21, c15, c16 (my 3x crop) and c10 #13, at a player height of about 170 px. At desktop gameplay scale (c02, 177.6 px players), my 3x crop shows #53's eyes, brows and splayed fingers. A harsh brief may be judging from the 0.5x contact sheet, where a 12 px face can't show features. The full-size still does.
4. **"The decal still smears down the side."** In c02 the "53" is centred and flat on the chest. In c21 the "53" (x 420-500, y 510-640) is the front number on a torso turned about 70 degrees to screen-left: the face profile and the jersey's neckline turn the same way, so this is foreshortening, not a smear.
5. **"The crowd got brighter and the hierarchy fell again."** The crowd is the same set as r2 (before/after `desktop-01` to `-06` show identical card placement). `floorCrowd` rose rather than fell: c02 is 3.38, against r2's range of 2.52-3.13. The live desktop maximum is up and the minimum is up (2.75, against 2.52).
6. **"The r2 desktop +3 and card stagger was lost in the re-rig."** desktop make-wide shows the card in f00-f03, a faint ghost in f04 and nothing in f05. The "+3" is at the right in f02-f06, as in Keep 3.
7. **"Animation is identical to r2."** The procedural timing is the same, and I concede that in Concession 9. The new rig does add held wrist follow-through (drive f06-f15) and splayed defensive hands, which the mitten mannequin couldn't show. That is a readability gain, not an animation-score gain, so I hold Animation at 6.5.
8. **"`floorY` of 0.06 means the replay floor is black."** The c08 and c17 probes sample floor inside a letterboxed frame, and r2 ruling 8 already found the replay probes unreliable (`voidPct` counts the letterbox). The floor in c17 (x 400-1280, y 660-745) is visibly lit wood and green apron. I still concede the replay hierarchy is inverted (Concession 7), because the wall does outshine the floor.

---

## 4. Concessions

1. **Blocker 1's assignment clause regressed.** The pass test says "keep the r2 assignments". Several characters ruling 1 restored are light again:
   - the c19 handler and #42 (`desktop-10` upper pair)
   - the c18 referee (`desktop-09` lower pair)
   - the c08 referee (`desktop-04` lower pair)
   - c02 YOU and #53, c11's pair, c12 #30, and c07 #12 (`desktop-01`, `-04`, `-06`)

   The c16 YOU, the c15 referee and c10 #13 kept their tones. The roster still mixes tones (dark players in c02, c06, c10, c16, c17 and c19), but the clause as written fails. **Blocker 1: shading and hue clauses closed, assignment clause open and regressed.**
2. **The mobile card margin regressed to contact (Blocker 3).** In mobile c06, #0's shoe has bright rows through y 997 (luma 227-232 at x 572-584), and the card's top edge is y 998. That is 0 px, against 7.5 css px in r2 and the 16 required. The shoe also tints the card's top rows (29-32 against 21). Mobile make-wide f00-f01 shows the same proximity.
3. **Mobile Select footer, unchanged and open (Blocker 4).** The mobile c13 still at y 1300-1688 shows "Cutter-" and "Jessieville" cards rendering below BACK/TIP OFF, and the Fountain Lake card ghosts behind the cue.
4. **Replay beats, unchanged and open (Blocker 5):**
   - **c17:** the ball (centre about 682,207, about 45 px across) is roughly 195 px from the nearest hand, and the shoes are cut by the letterbox at y 745.
   - **c08:** in my 5x crop (x 540-700, y 300-420) the ball is still drawn in front of the front rim and the front net strands.
5. **Blocker 2 is still failing 3 of 4 clauses:**
   - `floorCrowd` is 2.75-3.38 against 3.4, with c06 2.78, c16 2.75 and c10 2.80 the worst.
   - c04 `ballContrast` is 4.13 against 4.5, and the jumper minimum 2.08 against 2.6.
6. **Dark-skin colour is over-saturated and flat:**
   - The blue channel is 0-5 (c15 face RGB 120,50,0; c10 #13 116,45,5; c19 face 107,41,4), and R:G is 2.4-2.6.
   - The c15 referee's face spans only 63-69 from p10 to p90: it has value but little modelling. It reads as burnt orange rather than brown.

   This is r2 Fix 7's gamut problem, now visible on skin.
7. **Lighting is otherwise unchanged:**
   - No baked pools, bloom or rim light.
   - The replays are inverted (c08 wall over floor; probe `floorCrowd` 1.01-1.11).
   - The arena court is the dimmest of any venue (c09 `floorY` 0.139), and the c14 roof void is unchanged (`desktop-07` lower pair).
8. **Character-art gaps against the 2K Playgrounds 2 / Hoop Land "authored character" bar:**
   - **Hair:** c21 #12 is a bald skin scalp with only a dark cap at the crown, and the forehead box matches the cheek at 137 luma. The c19 #21 blonde bun reads as a gold cylinder.
   - **Expression:** the c21 pair and the c15 referee share the same knitted-brow scowl, so the expressions are uniform.
   - **Shoes:** they read as toe-socks with sculpted toe grooves, no laces, and a stair-stepped white sole edge (c15, my 3x crop of x 770-980, y 620-760).
   - **Wristband:** the yellow band on c21 #53 has a stair-stepped edge (x 600-640, y 320-430).
9. **Animation:**
   - The net stays rigid after the flash (net-close f04-f11, the same shape every frame).
   - The c18 referee holds one A-pose for all 12 net-close frames.
   - The jumper release is the same small motion (jumper f07-f09).
   - The paint is a clump of 7-8 overlapping bodies in every open-play frame.
10. **Authenticity:**
    - Referees use the player body: tank top, basketball shorts and sneakers (c06, c15, c17, c18), not a short-sleeve shirt and slacks.
    - BOYS STATE CHAMPS banners hang in a girls' game (mobile c06, y 140-200).
    - The photoreal crowd cards now clash with the toon players beside them (c15, c21), and the cards show fringe halos around the hair (my 3x crop of c21, x 0-200, y 0-120).
11. **c21 still has a near-plane intrusion.** A brown limb fills x 0-130, y 0-80. It is smaller than r2's black limb, but the "hide meshes within 0.4 m" fix hasn't landed.
12. **Mobile "+3":** it still sits on the backboard from f02 to f13 in mobile make-wide, fading only from f12.

**Net:** the milestone's deliverable, HQ players, is clearly visible and closes the shading and hue halves of the old Blocker 1. Every UI and replay blocker other than Blocker 1 is open, and the mobile card regressed. I score 6.8 overall, +0.25 on r2: a real gain, not a plateau, but one that depends entirely on the players.
