# v3-m3-r1: Defender brief

Round: v3-m3-r1, milestone 3, round 1 (a high-quality home-gym shell with baked GI, plus fixes for the four v3-m2-r3 blockers). Before/after pairs compare with v3-m2-r3.

**What I read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m2-r3.md`; all 7 contact sheets; all 19 before/after pairs; full stills desktop c02, c06, c08, c10, c12, c16, c17 and mobile c13, c17; bursts desktop make-wide, net-close and jumper, and mobile make-wide; `probe/probe.json`.

**My own measurements** (PIL; luma = 0.299R + 0.587G + 0.114B, sRGB 0-255):
- skin grids and boxes on the c06, c10 and c16 players named in r3 Blocker 4, plus the c15 referee
- the c21 face skin in both halves of before/after `desktop-11`
- the mobile c06 shoe-to-card gap, column by column
- 4x zooms of the "+3" in desktop make-wide f00 and f01
- c02-c19 play-area mean RGB and max luma
- the c17/c08 wall and floor luma
- 3-5x zooms of c06 (x 30-140, y 435-530), c10 (x 640-830, y 385-480), c16 (x 1080-1200, y 430-560 and x 960-1090, y 280-400), the c15 referee head and the c10 top-left wall

The webm and sound are not reviewed.

---

## 1. Scores

| Category | r3 final | **Defender** | One-line case |
|---|---|---|---|
| Art: players, court, venue | 6 | **6.5** | Faces now read at gameplay size: #13 in c10 has eyes, brows and a mouth (eyes 15-16 luma on skin 46-52). The c15 referee has brows, eyes and a mouth. The replay shows a whole, lit shooter (c17). Still mannequins with mitten hands and empty benches. |
| Lighting & materials | 6.5 | **7** | Desktop `floorCrowd` rose to 3.67-4.16 in c02-c07 (r3: 3.12-3.38). Crushed skin is lifted (c16 YOU shoulder 59 against 1.2 in r3). Whites reach 231-235 (r3: 222-226). The new walls carry a baked falloff (c17 wall 148 to 176 across x 120-460). No clipping anywhere (`clippedPct` 0). Short of 7 on the darkest faces and the amber grade (section 4). |
| Animation & game feel | 6.5 | **6.5** | The early replay beat has its subject again: an airborne #2 with the ball just out of the hands (c17, both viewports). The net is still rigid (net-close f04-f11) and the jumper camera is unchanged. |
| UI / HUD | 7 | **7** | Mobile Select gained a scroll cue, a fade and a cut-off row, and TIP OFF is in view (mobile c13). Callouts still never cover the rim or ball, and the lifecycle is kept. The mobile card margin got worse, and the desktop "+3" is still covered in f00-f01 (section 4). |
| Typography | 6.5 | **6.5** | Unchanged. The c20 "next"/"rival" pills are the same (before/after `desktop-10`). The new "More options below" cue has a ~7 px x-height (c20 x 200-420, y 670-715, my 4x zoom), so about a 13 px font, and passes. |
| Readability | 7 | **7** | Teams now separate: the green Fountain Lake kits and skin read in c03-c05 where r3 showed black figures (before/after `desktop-02`, `-03`). Body facing reads in c10 and c16. Ball outline holds (`ballContrast` c04 4.78, c05 3.74; jumper minimum 2.67, r3 2.63). The camera is untouched, so 7.5 is not earned. |
| Mobile portrait | 7 | **7** | Mobile c17 is fixed (a full shooter at 50% of the height, plus ball and basket), and Select is better. The card now touches the shoe (1 css px), and the framing exceptions are identical to r3. These net out. |
| Authenticity of setting | 6.5 | **6.5** | The shell reads as a built room: painted cream block walls, a coloured fascia and baked corner shading (c06 right wall; c12; c18 replaces the flat brick with an orange-and-cream wall). But there are still no desktop banners, the benches are empty, the replay far wall is a brown plane, and the fascia is Hot Springs orange even in Jessieville (c10). |
| **Overall** | **6.6** | **6.8** | (6.5 + 7 + 6.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 54 / 8 = 6.75 |

---

## 2. Strengths, with evidence

### 2.1 The black-silhouette defect is mostly fixed (r3 Blocker 4)
This is the largest visual change of the round, and it holds in every live frame.

**c16, the player r3 measured at luma 1.2:**
- My 5x zoom (x 1080-1200, y 430-560) shows this player faces away from camera.
- The r3 box (x 1135-1150, y 450-470) now samples the back of a black-haired head (mean 9.1, max 99).
- The skin around it is lit, modelled brown:

| Region (c16) | Box | Mean luma | Mean RGB |
|---|---|---|---|
| Shoulder | x 1138-1148, y 492-510 | 59.1 | (104,46,12) |
| Neck | x 1139-1146, y 468-478 | 38.7 | |
| Forearm | x 1152-1165, y 500-506 | 43.9 | |

- The shoulder shows a clear terminator in the zoom.

**c10:**
- #13's face has skin at 46-52 luma, eyes at 15-16 and visible brows and mouth: about 32 luma of feature contrast, which passes the 25 test.
- YOU's lit arm and torso read as brown rather than black. In r3, both were flat black (r3 ruling 1).

**c06, the left player (r3: 3.7):**
- The face and hair bun are brown and modelled (my 5x zoom).
- The box mean is now 25.0.
- The arm (x 100-128, y 487-494) is 34.2, and the shoulder (x 50-62, y 500-530) is 43.4.

**The c15 referee (r3: 22):**
- The r3 box (x 860-960, y 90-200) now measures 44.2.
- At 3x, the brows, both eyes and the mouth are visible.

**Lit players in general** went from a crushed red to a plausible skin hue. The c21 face in before/after `desktop-11`:

| Face | Before | After |
|---|---|---|
| #12 | RGB (105,10,1), luma 37 | (171,93,44), luma 111 |
| Opponent | (58,3,1), luma 19 | (146,68,19), luma 86 |

This also answers r3's Art complaint about "saturated red-brown skin".

**The r2 artifact tests still pass:**
- `clippedPct` is 0 in every still on both viewports, so no skin pixel exceeds 250.
- Live play-area max luma is 231-235 in c02, c07, c09, c10, c16 and c19, so no skin pixel exceeds 240.
- There is no ghost glow on the dark kits in c07 (before/after `desktop-04`, top pair).

### 2.2 The light hierarchy is stronger, and the grade opened up a little
- **Desktop `floorCrowd`:** c02 3.94, c03 3.75, c04 4.07, c05 4.07, c06 3.67, c07 4.16, c11 3.74, against 3.12-3.38 in r3. The court is now about 4x the crowd.
- **Live whites:** max luma is 231-235 against 222-226 in r3.
- **Grade:** the c02 play-area mean RGB is (125,82,36), with B/R at 0.29, against (116,73,30) and 0.26 in r3. A small step in the asked direction.
- **The shell walls carry soft baked falloff, not flat fills:**
  - the c17 cream wall goes from 148 at x 120-160 to 176 at x 420-460 (y 120-160)
  - c06 shows corner shading where the right wall meets the fascia (my zoom of x 1100-1280, y 0-300)
  - the c12 end wall grades from 120 at the left corner into the lit centre

### 2.3 The early replay beat is restored (r3 Blocker 3, c17 half)

**Desktop c17:**
- #2 spans x 635-915, y 358-745. That is 387 of the 689 px letterbox (56%).
- Both arms are up, the ball is at (672,203), and the basket and net are in frame (x 525-630, y 300-485).
- r3's c17 had no shooter and no ball (before/after `desktop-09`, top pair).

**Mobile c17:**
- #2 spans y 785-1505. That is 720 of the 1450 px letterbox (50%), and she is airborne: the shoes are clear of the floor line.
- The ball is at (436,560), and the basket and net are at x 225-330, y 700-965.
- r3's mobile c17 was wall, crowd and floor only (before/after `mobile-06`).

**Probes:** `ballPx` c17 is 29.2 on desktop and 21.2 on mobile, and the ball is visibly in frame, so this time the probe agrees with the pixels.

### 2.4 Mobile Select is materially better (r3 Blocker 2)
Mobile c13 against r3 (before/after `mobile-05`, first pair):
- **Layout:** it moved from horizontally scrolling single cards to a 2-column grid, which matches desktop.
- **Scroll cue:** a "More options below ▾" cue sits at y 1475-1500, over a fading cut-off row (Lake Hamilton / Fountain Lake, y 1400-1560).
- **TIP OFF:** fully visible (x 530-738, y 1518-1628).
- **Difficulty:** r3 had the Difficulty row ghosted behind the footer at rest. Now no option row is half-shown behind the footer at rest; the options are below the fold behind a clear cue.

### 2.5 The callout lifecycle and the closed artifacts are kept (r3 Keep items 1-2)
- **Mobile make-wide:** the card slides in at f00-f01, fades over f02-f04 and is gone at f05.
- **Desktop make-wide:** the card fades by f03-f04 and is gone at f05.
- **c16:** clean on both viewports.
- **Title:** clean (c01, both viewports).
- **c18 net over the ball:** clean (net-close f00-f03, with the rim flash kept).

### 2.6 Desktop Select and the front end are untouched (Keep item 3)
Before/after `desktop-07` shows c13 and c14 pixel-identical in layout. Nothing slid behind the footer.

---

## 3. Pre-emptive rebuttals

1. **"Dark-skinned players are still black blobs: the c16 head still measures about 9."** The r3 box now lands on hair. The player faces away (my 5x zoom of c16, x 1080-1200, y 430-560). The adjacent neck is 38.7, the shoulder 59.1, the forearm 43.9, and there is a visible terminator on the deltoid. A black-haired head from behind is not a crushed face.

2. **"The fix just whitewashed everyone, and skin diversity is gone."** Not supported.
   - **The c21 before was not a dark skin tone.** It was a broken one: RGB (58,3,1), with the green channel near zero.
   - **The darkest tones are still dark in this round:**
     - the far c16 player, face RGB (55,17,3), x 1060-1072, y 298-308
     - the c06 left player, (49,17,2)
     - c10 YOU, (68,24,5)
   - **The range runs** through medium (c10 #13, skin 46-52) to light (c16 #14, the blonde).

3. **"The lighting is flatter now: the brick texture was replaced by plain walls."** The brick was a texture; the new wall is lit.
   - The c17 wall carries a 28-luma falloff across the bay (148 to 176), and c06/c12 show baked corner shading.
   - The court-to-crowd ratio went up, not down: desktop `floorCrowd` is 3.67-4.16, against 3.12-3.38.
   - Plainness is a fair Authenticity point (no banners). It is not a lighting regression.

4. **"Black voids in the replays" (`voidPct` 10.7 in c08, 11.0 in c17).** Most of that is the letterbox: the bars at y 0-56 and y 745-800 are 13.9% of a 1280×800 frame, so the probe is counting the intended bars. The scene inside the letterbox is a lit cream wall (148-187), a lit crowd and a lit floor (105-113).

5. **"The ball is lost in the make and airball frames" (`ballContrast` c06 1.3, c07 1.01, desktop make-wide mean 1.14).** This probe is luma-only, and in these frames the ball sits on wood of nearly equal luma.
   - In c07 (x 555-585, y 388-418), the orange ball has a dark outline and sits above the AIRBALL tag.
   - The in-flight frames, where it matters, hold: c04 4.78, c05 3.74, jumper minimum 2.67.
   - This is the same probe limitation r3 ruling 9 recorded for c08.

6. **"Mobile c13 is still broken: the options are hidden."** The r3 pass test allows "a cut-off row plus a scroll cue". Both are present (y 1400-1560 and y 1475-1500). The real remaining failure is narrower, and I concede it in section 4.

7. **"c17 is still a regression: the camera shows the shooter from behind."** The r3 pass test asks for the shooter at 40-60% of the frame height, plus ball and basket in the letterbox. That is met: desktop 56%, mobile 50%. Shooting from behind toward the rim is a legitimate replay angle, and it keeps ball, shooter and basket in one frame.

8. **"Readability went down because the court got brighter around the players."** Not supported:
   - The lit green and blue kits now separate from each other in c03-c05 (before/after `desktop-02`, `-03`), where r3 had near-black figures.
   - Jumper `ballContrastMin` is 2.67 against r3's 2.63.

---

## 4. Concessions

### 4.1 r3 blockers, against their own pass tests

| r3 blocker | Status | Measurement |
|---|---|---|
| **1. Mobile card margin and the "+3"** | **Open, slightly worse** | **Mobile c06:** the shoe's white sole reaches y 994-996 (x 561-570), and the card's top edge is at y 998 (columns 450 and 590 both step from about 140 to 73 at y 998). That gap is about 2 device px, or 1 css px, against 6 css px in r3 and a 16 css px target. **Desktop make-wide:** f00 (4x zoom) shows the "+3" under the card, with only the bottom of the "3" below its lower edge. f01 shows the "+" covered and only "3" visible at the card's right edge. Only the lifecycle clause passes. |
| **2. Mobile Select** | **Partly** | The cue and cut-off row are present (2.4). But the footer height is not reserved: the next row ("Cutter-" / "Jessieville" card tops) renders below the footer at y 1640-1688, and the "Lake Hamilton" text ghosts through the footer at y 1440-1560. "Nothing renders behind it" fails. |
| **3. Replay beats** | **Partly** | **c17:** passes in substance. Two caveats: the ball is about 170 px above the hands on desktop and about 125 css px on mobile, so it is just released rather than "leaving the hand"; and desktop #2's feet sit on the letterbox edge (y 745). **c08 is unchanged and fails:** on desktop, the ball is at (623,323), level with the backboard and about 75 px above the rim (rim about y 400), not at or through it; a second brown-haired head (x 825-935, y 555-745) still overlaps #2's head (x 800-850, y 530-590). Mobile c08 has the same overlap, plus a referee filling the foreground (before/after `mobile-03`). |
| **4. Dark skin** | **Mostly closed; the pass test is narrowly missed for the darkest tone** | **Passes:** c16 YOU (neck 39, shoulder 59), c10 #13 (46-52 skin, 32 feature contrast), the c15 referee (44). **Misses** the "every on-court player ≥ 35 lit-side" clause: the c06 left face grid is 17-34 (forehead 33-34, cheek 19), the c10 YOU face profile 23-36 (lit edge 33-43), the far c16 player's face 19-30 (x 1060-1072, y 296-308). The c06 face also sits against an apron background of 29-30 luma, so the head barely separates from it. The feature clause passes for the far c16 face (eye up to 115 on skin about 22) and is borderline for the c06 face (eye 46-50 on skin about 25, roughly 21-25). |

### 4.2 Other weaknesses

**Camera and framing (fix 5): not attempted for the third round.**
- Mobile c11 50.6 px, c09 57.6 px, c16 41.5% empty.
- Drive `emptyFgMean` 25.7 desktop, 27.7 mobile; jumper `emptyFgMean` 8.48 desktop.
- All identical to r3. Jumper f04-f17 still holds the shooter on the crowd line.

**The net is rigid.** Net-close f04-f11: the same silhouette and length in every frame. Only the rim flash (f00-f03) marks the make.

**The grade is still amber.**
- The c02 play area is RGB (125,82,36).
- There is no bloom: the only values above 240 are HUD/card text (c06 max 246 is the card; c12 246 is the HUD).

**The replay hierarchy is inverted.**
- c08 cream wall (x 150-500, y 150-300): 160 luma.
- c17 wall: 148-176.
- Against a floor of 105-113 (c08 x 950-1150, y 660-735; c17 x 950-1150, y 690-735).
- The new shell's lit wall is the brightest surface in both replay beats.

**The replay far wall is still an undressed brown plane.** c17 x 800-1200, y 100-200: 70-91 luma, flat.

**The shell is not per-school.** The Jessieville gym (purple and gold) has the same orange fascia as Hot Springs: c10 x 0-40, y 40-70, RGB (128,65,4) (my 3x zoom).

**No title banners on any desktop home-gym wall.**
- c06 right wall: plaster and fascia only.
- The mobile end-wall banners (mobile c22, y 140-230) were already present in r3 (before/after `mobile-08`).

**Hot Streak is unchanged** except for the orange wall paint (before/after `desktop-06`, bottom pair). The crowd still stands on a ledge, there are no racks, and c12 `floorCrowd` is only 2.0.

**Mobile hierarchy is weaker than desktop.** `floorCrowd` mobile: c02 2.39, c06 1.88, c07 2.07, c16 1.98, c10 2.2. Without r3's mobile numbers in hand I can't call it a regression, but it is below the ~3 the Keep list cites.

**Desktop c20 now clips its content.**
- The hub's "Source: Wikipedia" line is cut, and a "More options below" cue appears (before/after `desktop-10`, bottom pair).
- At 1280×800, r3 showed the whole panel.
- A minor regression, though it is correctly cued.

**Typography is unchanged:** the c20 "next"/"rival" pills and the c13 "game colors" chips are still under 12 px.

**Crowd sprite halos persist.** There are dotted light edges around the crowd heads behind the c15 referee (my 3x zoom, x 850-980, y 80-220).

**Benches are still rows of empty identical chairs** (c15 x 20-650, y 280-520, by the r3 coordinates; c02 x 505-840, y 295-355).

**Players are still capsule mannequins with mitten hands** (c21), with a near-plane limb (c21 left edge).
