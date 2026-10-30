# v3-m3-r1: Prosecutor A (art, lighting, setting)

**Round:** v3-m3-r1. This is milestone 3, round 1: the home-gym shell with baked GI, plus the fixes for the four v3-m2-r3 blockers. Before/after pairs compare with v3-m2-r3.

**What I read and opened:**
- **Documents:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m2-r3.md`
- **Contact sheets:** all 7
- **Before/after:** `desktop-01`, `-02`, `-05`, `-06`, `-07`, `-08`, `-09`, `-10`
- **Full-size stills:** desktop c08, c09, c12, c15, c17, c18, c21; mobile c08, c17
- **Crops:** desktop c02, c06, c09, c10, c11 and c16; mobile c06, c13 and c22
- **Bursts:** desktop net-close and make-wide; mobile make-wide
- **Benchmarks:** `benchmarks-02` (nba2k25-1, the same behind-the-shooter view as c17)
- **Probe:** `probe/probe.json`

All luma figures are my own Rec.709 measurements on the stills, unless I mark them as probe values.

Video and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **6** | **Better:** dark-skinned players now have modelled brown skin and, on some, a face (c10 #13, 3x crop x 600-860, y 360-560). The replay left wall has a cream finish, a white rail and the COBRAS banner (c17 x 0-540, y 56-540). The mobile home wall carries three title banners (mobile c22 x 40-265, y 140-230). **Unchanged at the 5-6 anchor:** c21 still shows the near-plane sausage limb (x 0-300, y 100-380), mitten hands (x 1050-1120, y 640-740), two dot eyes and a brow line with no nose or mouth, and the "53" decal smeared down the side of the torso (x 435-515, y 505-640). The benches are still rows of identical empty chairs (c15 x 20-650, y 280-520). The stanchions are untextured black boxes (c18 x 850-1280, y 0-800). The crowd stands on a bare ledge with no bleacher under it (c12 x 220-1030, y 85-225). |
| Lighting & materials | **6.5** | **Credit:** r3 Blocker 4 is mostly closed. In c16 the YOU player's neck measures 36.6 and shoulder 57.6. In c10, #13's face skin is 40-46 with eyes and brows at 14-17. The hierarchy is stronger (probe `floorCrowd` 3.51-4.16 in c02-c19, against about 3.1-3.4 in r3), and live whites now reach 231-235 (r3: 222-226). **Against the 7 anchor:** the amber cast is unchanged (c02 play area mean RGB 125,82,36). The school-orange walls clip blue to 0 (c18 x 1150-1270, y 330-470 = RGB 149,60,0; c12 = 135,50,0). There is no material split: the c18 backboard glass is invisible, with no tint or reflection. There are no light pools, and nothing in the scene blooms; only HUD text and the rim flash pass 228 (c06 bright pixels sit at x 602-989, y 145-243, which is the card). The "baked GI" shows no visible bounce, colour bleed or corner occlusion in any live frame. |
| Animation & game feel | **6.5** | The net silhouette is the same in net-close f00-f11. Only the rim flash (f00-f03) marks the make. The crowd and the referee hold one pose across all 12 frames. The card lifecycle is kept: it is gone by f05 on both viewports. I did not re-audit the jumper; B's lens. |
| UI / HUD | **6.5** | **Down from r3.** The mobile card now all but touches the #0 shoe: it sits about 1 css px away, against 6 css px in r3 (mobile c06, defect 2). On desktop the card still covers the "+3" (make-wide f00: "+3" under the card's bottom edge; f01: the "+" hidden under its right edge). Mobile Select added a "More options below" cue, but the footer is translucent and team cards render through it and below it (defect 5). Desktop Select, the pause menu and the hub are clean (c13, c20, c22). |
| Typography | **6.5** | Unchanged: a condensed display face plus a text face on a scale. The c20 "next" and "rival" pills are still about 10-11 px (desktop c20 x 1370-1390 on the sheet; same pills as r3). |
| Readability | **7** | **Better:** dark-skinned bodies now show which way they face (c16 YOU, c10 YOU and #13), and the outlined ball reads (probe `ballContrast` c04 4.78, c05 3.74; jumper minimum 2.67). **Against:** mid-tone skin is now the same hue as the floor at a lower value (c10 #13 face RGB 123,56,14 on floor 207,142,59). The shot stills carry 26.9% empty foreground (probe c03 and c04 `emptyFgPct`), and the paint still clumps (c02 x 100-500, y 300-640). |
| Mobile portrait | **6.5** | **Down from r3.** The card touches the #0 shoe (defect 2), and Select still renders content behind its footer. Both replay beats spend about 40% of the frame on a featureless brown plane (mobile c17 x 240-780, y 120-880, luma 57-90 with no features). The framing exceptions are the same as r3 (probe c11 50.6 px, c09 57.6 px, c16 41.5% empty, drive `emptyFgMean` 27.7). Players read at 83 px in c02, c10 and c19. |
| Authenticity of setting | **6.5** | **Credit:** school-colour painted walls, three title banners on the Hot Springs wall on mobile (c06, c22), and the COBRAS replay wall. **Against:** no desktop live camera ever shows a wall or a banner, because the crowd sheet fills the top third of c02, c06, c09, c10, c11, c16 and c19. The benches are empty. The replay far wall is still an undressed brown plane (c08 x 560-1280, y 56-370). Hot Streak is unchanged: no steps and no racks (c12). The banners read "BOYS STATE CHAMPS" (1932, 1996, 1998) in a girls' game whose hub cites the girls' 1997 and 1998 titles (c20). Many players shifted from dark to pale skin (regression 1). |
| **Overall** | **6.5** | (6 + 6.5 + 6.5 + 6.5 + 6.5 + 7 + 6.5 + 6.5) / 8 = 52 / 8 = **6.5** |

---

## 2. r3 blockers against their pass tests

| r3 blocker | Status | Evidence |
|---|---|---|
| **1.** Mobile card margin and the desktop "+3" | **Open, and worse on mobile** | **Mobile c06:** the #0 shoe's silhouette ends at y 996 (the white sole is at luma 170-186 on rows 993-995, columns 561-571). The card's top edge starts at y 998, which is 2 device px, or 1 css px. r3 measured 6 css px. The shoe is inside the card's x span (x 264-621). **Desktop make-wide:** in f00 the "+3" sits under the card's bottom edge; in f01 the card covers the "+". My 4x crop of each tile shows both. **Kept:** the slide-in and fade, and the card gone by f05 on both viewports. |
| **2.** Mobile Select | **Partly** | **Added:** a "More options below" cue (mobile c13, y about 1488). **Still failing:** the footer is translucent. The Lake Hamilton and Fountain Lake cards show through it (y 1400-1560), and the team grid keeps rendering below it ("Cutter-" and "Jessieville" at y 1640-1688). So the footer height is not reserved, and something renders behind it. The You play, Shot clock and Difficulty rows are not visible at rest. |
| **3.** Replay beats | **Partly: c17 passes loosely, c08 fails** | **c17, desktop:** #2 spans x 640-915, y 358-745, which is 56% of the letterboxed height. The ball and the basket are in frame. But the ball is about 150 px above the raised hands (ball x 650-695, y 180-225), so this is the follow-through, not "the ball leaving the hand". **c17, mobile:** the same, with the shooter at y 785-1500. **c08, desktop:** a featureless brown capsule head (x 820-935, y 555-745) overlaps #2's head (x 795-850, y 528-590). **c08, mobile:** the referee (x 410-780, y 1070-1570) covers #2's head and shoulder. On both viewports the ball is above the rim (desktop x 607-638, y 308-338), not through it. **Probe:** c08 and c17 report the same `ballContrast` 4.45 and `ballPx` 29.2, although the ball sits at different screen positions. It is reading sim state, not the frame (r3 ruling 7 still applies). |
| **4.** Dark skin renders as black | **Mostly closed** | **Passes:** c16 YOU neck 36.6 and shoulder 57.6 (x 1134-1148, y 468-504). c10 #13's face skin is 40-46, with eyes and brows at 14-17 and the mouth at 24, about 26-30 of contrast. The c15 referee is modelled brown with a brow line. **One failure:** the far-left c06 player's face is 21.1 (x 68-82, y 453-470), with the extended arm about 30. That is under 35, and the only face feature is a single highlight pixel at 6x. The r2 artifact tests still pass: no skin pixel over 240, and no dark-kit glow off the lit court in c07 or c02. |

**Blockers still open:** blocker 1 is worse; blocker 2 is partly fixed; blocker 3 fails on c08.

---

## 3. Defects, ranked by how often a player sees them

### 1. The amber grade and clipped school colours (every live frame)
- **Evidence:**
  - the play-area mean RGB is 125,82,36 in c02 and c19, and 129,87,41 in c16, so blue is about 29% of red
  - the orange walls clip blue to exactly 0: c18 x 1150-1270, y 330-470 (149,60,0); c12 x 1060-1270, y 100-170 (135,50,0)
  - mid-tone skin is the floor's hue (c10 skin 123,56,14 against floor 207,142,59)
- **Why it matters:** the wall reads as flat plastic, and the players' limbs merge with the wood.
- **Fix:**
  - Neutralise the white balance in the grade and keep the warmth in the wood albedo.
  - Keep wall albedo inside gamut: give saturated paints at least 8-10% blue before lighting.
  - Shift skin albedos about 5-8° toward red/pink so skin separates from the maple at equal value.

### 2. The mobile make card touches a shoe, and the desktop card covers the "+3" (every make)
- **Evidence:** blocker 1 above (mobile c06 rows 993-998; desktop make-wide f00-f01).
- **Fix:**
  - Lower the mobile card by at least 24 css px, or test its rect against the silhouette, feet included, over the whole slide-in.
  - On desktop, delay the "+3" until the card has slid in, or place it outside the card's rect plus 12 px.

### 3. The players are still mannequins (every frame, and worst in close cameras)
- **Evidence:**
  - **c21:** the near-plane limb (x 0-300, y 100-380); dot eyes and no mouth or nose (x 430-470, y 205-240 and x 670-740, y 130-165); mitten hands (x 1050-1120, y 640-740); the side-smeared "53" (x 435-515, y 505-640); #53's arm passing through her own face line (x 540-660, y 240-620)
  - **c17:** a 387 px tall mannequin seen from behind, with flat tube arms (x 640-915, y 358-745), against nba2k25-1's identical composition (`benchmarks-02`, bottom-left)
  - **c18:** the referee
- **Fix:**
  - This is the HQ-player milestone.
  - **Until then:** hide meshes within 0.4 m of the camera; frame close cameras waist-up; add a mouth and nostril shadow; bind the number decal to the torso's front.

### 4. The shell is invisible in desktop play, and it reads as flat planes where it does show
- **Evidence:**
  - Desktop live frames show crowd from the HUD down to the table (c02, c06, c09, c10, c11, c16, c19), so no wall, banner or ceiling appears.
  - Where the shell is visible:
    - c12 wall: a flat orange band, luma 51-78, with no texture or banners
    - c18: brick in r3 became flat paint (before/after `desktop-09`, lower pair)
    - replay far wall: a uniform brown plane (c08 x 560-1280, y 56-370; mobile c17 x 240-780, y 120-880, luma 57-90)
    - stanchions: untextured black boxes (c08 x 315-545, y 345-600; c18 x 870-1140, y 75-600)
  - **c18 crowd:** the people stand on a dark slab with no riser faces (x 160-990, y 380-610).
- **Fix:**
  - Pitch the desktop live camera up 3-5°, or lower the crowd sheet one row, so the banner wall shows above the crowd in at least the c02/c19 framing.
  - Give the far wall a block texture, a fascia, a scoreboard and banners.
  - Give stanchions a padded-vinyl material with a bevel and a logo.
  - Add bleacher riser geometry with kick-plate faces under every crowd row.

### 5. Mobile Select renders behind and below its footer (every mobile session start)
- **Evidence:** blocker 2 above (mobile c13 y 1400-1688).
- **Fix:**
  - Make the footer opaque.
  - Reserve its height as bottom padding on the scroll container.
  - Clip the content at the footer's top edge.

### 6. The replay beats: c08 head overlap and post-release c17 (every highlight)
- **Evidence:** blocker 3 above.
- **Fix:**
  - Cull or fade any character mesh between the camera and the shooter's head (a capsule test along the view ray).
  - Fire c17 2-4 ticks earlier, at release.
  - Fire c08 when the ball's centre is below the rim plane.

### 7. No material split and no light design (every frame)
- **Evidence:**
  - Glass, wood, cloth and skin share one diffuse response (c18 backboard, c21 jersey against skin).
  - There are no pools of light on any desktop floor (c09, c10 and c11 floors are even end to end).
  - Bloom shows only on UI (c06 bright region = the card).
- **Fix:**
  - Glass gets a Fresnel reflection with a 10-15% tint and a dirty edge.
  - Jersey cloth gets a sheen lobe.
  - Add a thresholded bloom on the rim flash, the shot clocks and the exit signs.
  - Add 2-4 overhead pools baked into the floor lightmap; it is a GI milestone, so the lightmap should show them.

### 8. Crowd sprite quality
- **Evidence:** white halo fringes on dark hair at close range (c15 x 1100-1190, y 250-330), and photographic people behind toy players (c15, c21).
- **Fix:** premultiplied alpha with 1-2 px dilation; at minimum, a slight desaturation and blur on crowd cards so they sit behind the players.

### 9. Setting continuity and empty benches
- **Evidence:**
  - c15 chairs are empty and identical
  - mobile c22 banners say BOYS (1932, 1996, 1998) while c20 cites the girls' 1997 and 1998 titles
  - Hot Streak is unchanged (c12)
- **Fix:**
  - Hang girls' banners when the girls' program is selected, or hang both sets.
  - Put towels and bottles on the chairs.
  - Add the Hot Streak bleacher steps and ball racks from r3 fix 9.

---

## 4. Regressions since v3-m2-r3

### 1. The skin-tone mix shifted pale, which is not just exposure
The same players stand at the same positions in before/after pairs, but their hair colour changes too, so this is not lighting:
- **The referee:** dark-haired and dark-skinned in r3; grey-haired and pale now (before/after `desktop-09` lower pair, my 3x crop; also c06 and c18).
- **c19, red team:** #42 went from brown hair and dark skin to light hair and light skin, and the unnumbered bottom-left player from dark to pale (before/after `desktop-10` upper pair, 1.7x crop).
- **c16:** the right-hand LHS player went from dark skin and brown hair to pale skin and blonde hair (before/after `desktop-08` lower pair, 3x).
- **c02:** #53, #3 and YOU went from brown to pale (before/after `desktop-01` lower pair, 2x).

Dark-skinned players still appear (c02 left, c06 left, c10, c16 YOU, c15 referee), but noticeably fewer per frame. In a game set in Hot Springs schools, Blocker 4 asked for dark skin to render well, not to appear less. The Arbiter should confirm this from the pairs and require that the r3 appearance mix be restored.

### 2. The mobile card margin is worse
It went from 6 css px to about 1 css px (mobile c06).

### 3. The c18 back wall lost its brick
r3's brick wall is now a flat clipped-orange plane (before/after `desktop-09`). It is cleaner but materially poorer.

### Not regressions
The callout lifecycle, the clean title (c01), the ball outline, the "+3" and AIRBALL tags, desktop Select (c13), the portrait replay crop and the COBRAS wall are all kept.
