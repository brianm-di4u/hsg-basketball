# v3-m7-r1: Defender brief

Round: v3-m7-r1 (milestone 7, round 1: the type system, menus over posed 3D players, HUD fixes, quality governor, credits).
Previous binding verdict: `review/v3-m6-r2.md` (7.0).

**What I used:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md` (Defender), `review/v3-m6-r2.md`
- **Sheets:** desktop -01 to -04, mobile -01 to -03
- **Before/after:** desktop -01 to -11, mobile -01 to -08
- **Full-size stills:** desktop c01, c02, c06, c13, c14, c20, c22; mobile c01, c06, c13, c14, c15, c16, c20, c21
- **Bursts:** desktop make-wide, dunk, dunk-close, jumper-close, net-close, open-play; mobile make-wide, dunk
- `probe/probe.json`, `benchmarks/benchmarks-03.png`
- **My crops** (scratch only, nearest-neighbour, still coordinates):
  - desktop c01: the card 330-690 × 90-520 at 2x
  - desktop c02: the scorebug 270-1010 × 0-75 at 2x; the bench and cheer squad 220-900 × 240-380 at 2x
  - desktop c08: the lower-left 0-300 × 420-720 at 1.5x
  - desktop c09: the ribbon 380-780 × 200-310 at 2.5x
  - desktop c14: the top-left 0-480 × 0-400 at 1.6x; #2 100-320 × 400-760 at 2x; the card 400-880 × 180-610 at 1.6x
  - desktop c17: the lower-left 0-420 × 380-700 at 1.5x
  - desktop c21: the banners 400-1000 × 80-260 at 1.5x
  - mobile c06: the callout 140-440 × 1000-1125 at 2x
  - mobile c14: below the card 0-780 × 1320-1688 at 1x
- **My measurements:**
  - glyph heights by row scan (bright-pixel rows)
  - the mobile card edge, by pixel scan at the card's mid-height
  - the c14 regional medians, over the same boxes as r2 ruling 4

**Not shown, not scored:** the quality governor (no frame-time data in the packet), the credits screen (no still), the webm, and sound.

---

## 1. Scores

| Category | Score | One-line case, with evidence |
|---|---|---|
| Art: players, court, venue | **7** | **Holds.**<br>**New:** posed, kit-correct players behind the menus: desktop c13 has #2 in the Hot Springs white at 0-200 × 330-760 and #15 in the Lakeside blue at 1090-1280 × 300-760, matching the selected HOME and AWAY cards; c14 and c20 also stage #2 and #15.<br>**Against:** every r2 Art item is unchanged (the bench clones, the bald heads, the gem pom-poms, the c21 piping, the replay icosahedron). Also new: the c14 #2 has white flaps standing off both shoulders (my 2x crop, still about 143-160 × 490-515). |
| Lighting & materials | **7** | **Holds, with a real c14 gain.**<br>- Desktop c14 `voidPct` is down from 14.6 to 9.1.<br>- r2's dead top-left (0-360 × 140-370) is now an arms-up crowd: my 1.6x crop, median (8,7,10) against r2's (2,3,9).<br>- The hierarchy is kept: desktop `floorCrowd` 3.17-4.12; c04 ball contrast 6.47 (r2 6.4); c05 6.03 (r2 5.98).<br>**Against:** `clippedPct` is 0 everywhere; mobile `floorCrowd` is 2.01-2.25; c14 still fails its test. |
| Animation & game feel | **7** | **Holds.**<br>- The make-wide build (f00-f13), the net stretch, the rim flash and the officials' signal (net-close f00-f11) are kept.<br>- The dunk float (desktop-dunk f10-f15) and the jumper hold (jumper-close f09-f16) are unchanged. |
| UI / HUD | **7.5** | **Up.** One designed system across title, select, hub, pause and champion screens:<br>- a navy card, a gold rule, gold primary and navy secondary buttons, and a cyan focus ring (desktop c01, c13, c20, c22, c14)<br>- the menus are staged over kit-matched 3D players (c13, c14, c20)<br>- the desktop and mobile "3 POINTS" callouts now sit clear of the rim (make-wide f00-f04 on both)<br>**Not 8:** the mobile "+3" still sits on the backboard through f13 (mobile make-wide f05-f13), and the motion is not shown. |
| Typography | **7.5** | **Up from 6.5, and the biggest move.**<br>- A condensed display face (headings, buttons, the HOOPS lockup) beside a condensed text face (body, schedule, disclaimers), with a visible scale (c20: title, section head, row, caption).<br>- My row scans put the smallest desktop UI text at a 9 px cap height, about 13 px type, consistent with the stated floor: the c20 "Then: Class 5A…" line at 542-550, the c20 Source line at 669-675 x-height, the c01 disclaimer at 609-617, and the c02 FOULS label at 61-69.<br>- Mobile type is crisp at 2x (mobile c01, c13, c20).<br>**Not 8:** the mobile "HOT SPRINGS" callout subline has a 14 device px cap (7 css), about 10 px type, on bare wood with no backing (mobile c06 at 1099-1112). The "STATE CHAMPS" pennant is set in an off-system wide grotesque (c14 crop). |
| Readability | **7** | **Holds.**<br>- Ball contrast is up a little (c04 6.47, c05 6.03); the jumper burst minimum is 2.97.<br>- The callouts moved off the rim (make-wide f00-f04).<br>- The paint clumps (open-play f00-f15) and the c19 reach are unchanged. |
| Mobile portrait | **7.5** | **Up a half.**<br>- The Select footer is closed: mobile c13 clips the list at about 1445 above "More options below", with nothing behind BACK and TIP OFF.<br>- The hub now fits with MENU and ROSTER on screen (mobile c20 1520-1610).<br>- The "3 POINTS" callout has moved into the empty lower court (mobile c06 150-420 × 1010-1100).<br>- Mobile menu type is large and crisp.<br>**Not 8:**<br>- the card margin is 20 device px (10 css) against the 32 test<br>- the "+3" is on the board<br>- the mobile c15 official is cropped under the pause button<br>- the mobile c21 z-fight<br>- the dunk zoom (`emptyFgMean` 57.75)<br>- mobile c14 shows about 4 confetti flecks against the test's 5<br>- no posed players are visible behind the mobile menus |
| Authenticity of setting | **7.5** | **Holds.**<br>- Small plus: the menus stage the players on the right floor (the Trojans centre logo under c13 and c20; the state-finals star under c14).<br>- The c09 ribbon, the 1996 banner, the bench lockstep and the officials' tights are unchanged. |
| **Overall** | **7.3** | (7 + 7 + 7 + 7.5 + 7.5 + 7 + 7.5 + 7.5) / 8 = 58 / 8 = 7.25, rounded to **7.3**. |

**The stop rule is not met, and I do not argue that it is.**
- The rule needs an overall of 8.5 or better, every category at 7 or better, and UI, Typography and Mobile each at 8 or better.
- My own brief has the overall at 7.3, and UI, Typography and Mobile each at 7.5.

---

## 2. Strengths, with evidence

### S1. A real two-face type system, at a floor that holds on desktop
- **Before and after:** desktop-10 lower pair (c20) and mobile-07 middle pair (c20).
  - BEFORE: the body is in a humanist sans ("Hot Springs home gym", the schedule rows).
  - AFTER: everything except the display heads is in a condensed text face.
  - The hub now reads as one family. On mobile it is shorter, so MENU and ROSTER come onto the screen (mobile c20 1520-1610, against BEFORE at about 1540+ in mobile-07, partly below).
- **The scale in desktop c20:**
  - "HOT SPRINGS TROJANS" (display, about 26 px cap)
  - "REGULAR SEASON · DECEMBER" (tracked caps label)
  - "Hot Springs Trojans vs Fountain Lake Cobras" (bold text)
  - "Hot Springs home gym" (regular text)
  - "Then: Class 5A…" (caption)
  - That is five distinct, consistent steps. It matches the 7 anchor ("a display face plus a text face used with a scale") on its face.
- **The floor, by row scan** (cap or x-height in still pixels):

  | Text | Rows | Height |
  |---|---|---|
  | c20 "Then: Class 5A state bracket…" | 542-550 | 9 px cap |
  | c20 "Source: Wikipedia…" | 669-675 | 7 px x-height (ascenders from 667) |
  | c01 disclaimer, line 1 | 609-617 | 9 px cap, about 19 px line pitch |
  | c01 disclaimer, line 2 | 628-636 | 9 px cap |
  | c02 scorebug "FOULS" | 61-69 | 9 px cap |

  A 9 px cap in a condensed face is about 13 px type. A harsh reviewer saying "the hub captions are under 12 px" has to beat these numbers.
- **The identity lockup:**
  - mobile c01 240-540 × 320-480: letterspaced gold "SPA CITY" over the cream condensed "HOOPS" with a red drop shadow
  - desktop c01 555-725 × 140-235: the same lockup
  - It is the closest thing in the build to type as identity (the 9 anchor). It is not new this round, but the new text face now sits under it without fighting it.

### S2. Menus staged over posed players in tonight's kits (desktop)
- **c13 (desktop-07 upper pair):**
  - BEFORE: an empty attract court.
  - AFTER: #2 in the Hot Springs home white (left edge 0-200 × 330-760) and #15 in the Lakeside blue and gold (1090-1280 × 300-760).
  - The selected cards are Hot Springs (home) and Lakeside (away), checked at 232-422 × 202-270 and 864-1054 × 202-270. The staging tells the truth about the selection.
- **c20:** #2 and #15 in the Trojans whites, over the Trojans centre-court logo, under the "TROJANS" wall wordmark (0-1280 × 0-45).
- **c14 (desktop-07 lower pair):**
  - BEFORE: an empty court under a card.
  - AFTER: #2 (hands up, 110-300 × 410-750) and #15 (arms up to the crowd, 980-1230 × 370-750) celebrate on the state-finals star, in front of a full arms-up bowl.
  - This is the most improved still in the packet.

### S3. c14 desktop is no longer a black void on its left half
- **r2 ruling 4 boxes, like for like:**

  | Region | r2 median | r1 median | Now |
  |---|---|---|---|
  | 0-360 × 140-370 | (2,3,9) | — | **(8,7,10)** |
  | 0-600 × 0-120 | (2,3,7) | — | (2,3,6), unchanged |

- **What the lift is:** my 1.6x crop of 0-480 × 0-400 shows the lower box is now a dense, arms-up, gold-and-blue crowd from y ≈ 150 down. It is detail, not void.
- **What is still black:** the ceiling band above the top tier (0-1280 × 0-50 median (2,3,6)) and the far upper-left corner (about 0-140 × 0-150).
- **The number:** `voidPct` fell from 14.6 to 9.1.

### S4. Callouts moved off the rim on both viewports
- **Desktop make-wide:**
  - "3 POINTS" sits in the upper-left crowd (f00-f04, tile x 230-330, about 60 px left of the board) and is gone by f04.
  - "+3" (f02-f06) rides above the board in the crowd, and is gone by f07.
- **Desktop c06:** the "3 POINTS" plate is at 280-660 × 125-235. The rim and net are at 915-1000 × 460-560, so they are clear.
- **Mobile make-wide:** "3 POINTS" sits low in the empty court (f00-f04, tile y about 320-345), far from the rim.
- **Mobile c06:** the plate is at 150-420 × 1010-1100. The basket is at 390-420 × 380-440, so it is clear.
- **Desktop dunk:** "SLAM DUNK" (f14-f15) sits bottom-right in the paint at about 1130-1270 × 1090-1140, clear of the rim.

### S5. The mobile Select footer, a carried item, is closed
- **mobile-05 left pair:**
  - BEFORE: "Cutter-" and "Jessieville" rows show below BACK and TIP OFF.
  - AFTER (and mobile c13 full still): the list is clipped at about y 1445, then "More options below ▾" at 1486, then BACK and TIP OFF at 1528-1625, with nothing behind them.
- This closes the r2 carried item "the mobile Select footer".

### S6. The mobile replay is clean
- Mobile c08 and c17 (mobile-03 middle pair, mobile-06 middle pair) show no unblurred crowd, cheer or prop geometry anywhere in the frame.
- The desktop is a different story (C1).

### S7. Keeps verified
- **The desktop lighting hierarchy:** `floorCrowd` c02 3.68, c03 4.10, c04 4.12, c05 4.05, c06 3.17, c09 3.18, c10 3.43, c11 3.48, c19 3.30.
- **Player size:** desktop c02 `playerPx` 177.6; mobile about 83 css px (c02 83.2, c03 87.5, c19 83.2).
- **The net and the rim flash** (net-close f00-f03).
- **The officials' made-three signal** (net-close f04-f11, make-wide f01-f06).
- **The 3D house build** (make-wide f07-f13: the arms-up wave).
- **The home benches in the home kit** (c02 crop: white-clad Trojans bench at 570-800 × 280-360).
- **The scorer's tables and wordmarks** (c02 "HOME HOT SPRINGS", c11 "MOUNTAIN PINE").
- **The thumb deck clear of play** (mobile c16: the play area ends at 1285 and the controls start at 1290).

---

## 3. Pre-emptive rebuttals

### R1. "The type floor is a lie: the captions are 10-11 px."
**Not on desktop.**
- The smallest UI captions I could find have a 9 px cap height (S1 table): c20 "Then…", c01 disclaimer, c02 FOULS.
- In a condensed face, a 9 px cap is about 13 px type.
- They look small next to the old humanist sans because the condensed face is narrow, not because the size dropped.

**I concede one real exception** (C4): the mobile "HOT SPRINGS" subline.

### R2. "c14 is still a black void."
**Only partly true.**
- The void that r2 measured in the left half (0-360 × 140-370) is now a lit, arms-up crowd: (8,7,10) against (2,3,9), and S3's crop.
- The remaining 9.1% is the arena ceiling band above the top tier (0-1280 × 0-50 at (2,3,6)) and the far top-left corner.
- That is a dark roof over a full bowl, not a hole in the scene. The frame also now carries two lit, posed players in the foreground.

The letter of r2 Blocker 4 (under 5) still fails (C3).

### R3. "The menu players are cardboard cut-outs that are mostly hidden."
**Not supported.**
- In c14, #2 and #15 are fully visible from the hands to the shoes (110-300 × 410-750 and 980-1230 × 370-750), in distinct poses: hands up, and arms raised to the crowd.
- In c13 and c20, the card covers their inner halves, but the faces, numbers and kits read (c13 #15 at 1140-1250 × 300-500).

**What is true:** on mobile the card covers them completely (C6).

### R4. "The '3 POINTS' callout still hides the rim."
**Contradicted** on desktop c06 and on desktop and mobile make-wide f00-f04 (S4). The only rim-area overlay left is the mobile "+3" (C5).

### R5. "The dunk-close burst has a black frame, so the renderer drops frames" (or "the quality governor blanks the screen").
**The packet contradicts this.**
- dunk-close f00 is a solid black tile. But desktop-dunk f00, the same moment at full size, is a fully rendered court with players, the crowd and the HUD.
- The black tile is the crop harness failing to find the dunker. It is not a game frame.

The harness also loses the dunker from f09 on, which is the carried r2 harness item. I concede it as a harness defect, not an art or animation one.

### R6. "Translucent cards make the menus unreadable."
**Overstated.**
- In my c14 crop, the ghost of the world-space "STATE FINALS" sign shows faintly behind the card at about 520-660 × 440-490.
- But the body line over it ("Hot Springs Trojans · Girls · Class 5A") is cream on a dark navy that is effectively opaque at that weight, and it reads cleanly.

It is a polish nit (C9), not a readability failure.

### R7. "Mobile players shrank" (`playerPx` c09 57.6, c11 50.6).
**The probe measures the wrong thing here, and this is not a regression.**
- mobile-03 right pair (c09) and mobile-04 middle pair (c11) show BEFORE and AFTER framed identically.
- The low median comes from the far-court cluster in these two framings. The live mobile stills (c02, c03, c10, c19) stay at about 83 css px.

---

## 4. Concessions

### C1. The replay foreground intrusion is still there on desktop (r2 Blocker 1: open on desktop)
- **c17:** a flat-shaded green icosahedron on a brown forearm, sharp, at about 0-90 × 480-590. My 1.5x crop shows the official behind it blurred.
- **c08:** the same object at about 20-145 × 543-647, with the forearm to 30-100 × 650-720 (my 1.5x crop).
- It has moved up and to the left since r2 (desktop-04 lower pair, desktop-09 upper pair). It has not gone.

### C2. The bench lockstep and the cheer routine (r2 Blocker 2: open)
- **c02 crop:** six white-clad bench players at 570-800 × 280-360 share one clap pose.
- **The cheer squad:** three girls at 220-400 × 255-370 hold one arms-out pose with faceted gold pom-poms.
- desktop-01 lower pair and desktop-08 lower pair are near-identical to r2.

### C3. c14 still fails its letter (r2 Blocker 4: partly)
- **Desktop:** `voidPct` is 9.1 against the test's 5 (R2).
- **Mobile:** 4.3 passes. But only about 4 confetti flecks show outside the card (around (293,1572), (218,1645), (690,1617) and (766,1030)) against the test's 5. A flat navy band also fills 0-780 × 0-136 above the scene.

### C4. One sub-floor text run on mobile
- The "HOT SPRINGS" subline under the mobile "3 POINTS" callout has a 14 device px cap (rows 1099-1112), which is 7 css px, or about 10 px type.
- It sits on bare floor wood with no plate behind it (mobile c06, my 2x crop).
- The same subline appears under "SLAM DUNK" (mobile dunk f14-f15).
- This breaks the rubric's "nothing under 12 px" for Typography 7 on this one element, so I hold Typography at 7.5, not 8.

### C5. The mobile "+3" sits on the backboard and does not expire by f08
- mobile make-wide f05-f13: the "+3" pill sits over the stanchion and the board top. It is still faintly visible at f12-f13.
- mobile c16: the pill is at 292-386 × 185-250, on the board top edge at 285-395 × 245-340.
- mobile-06 left pair: unchanged from r2.

### C6. The menu staging is invisible on mobile
- On mobile c13, c14 and c20, the card spans 20-760 of 780 device px, so the posed players never show.
- The card margin is 20 device px (10 css) on every menu (pixel scan at the card's mid-height on c01, c13, c14, c20 and c22), against the carried 32 test.

### C7. The officials, necklines, heads and close-camera surfaces are unchanged (r2 Blockers 3, 5 and 6: open)
- **c15 (desktop-08 upper pair) is near-identical:**
  - the official in shorts over tights, with swirled stripes over the right shoulder and the arms-out pose
  - the bench clones
- **c18 (desktop-09 lower pair):** the official is still in shorts over tights.
- **Mobile c15:**
  - the official's face is cropped at the right edge (690-780 × 270-420), under the pause button
  - the bench head at about 120-200 × 445-520 is pale and bald
- **c21:**
  - desktop (desktop-11 upper pair): unchanged
  - mobile c21: skin z-fight patches on the white-clad player's cheek at about 340-420 × 580-660, and on the shoulder at 580-700 × 690-760
  - mobile c21: the "YOU" marker is clipped under the HUD at 580-625 × 135-180

### C8. The carried animation and setting items are unchanged
- **The dunk:** the ball is over the ring at f10-f12 and still airborne at f15, with no landing (desktop-dunk).
- **The jumper:** it holds from f09 to f16 (jumper-close).
- **The net-close harness:** f00 already has the ball in the mesh.
- **The c09 ribbon:** my 2.5x crop reads "S?ATE FINALS" behind four bench heads.
- **The c21 "1996 BOYS STATE CHAMPS" banner** (my 1.5x crop, about 625-775 × 115-260 in crop) still contradicts the c20 fact (girls 1997 and 1998, boys 1998).
- **The mobile dunk** is still zoomed out (`emptyFgMean` 57.75).

### C9. Art and type polish
- **The c14 #2 jersey:** stiff white flaps stand off both shoulders (my 2x crop, still about 143-160 × 490-515 and 270-290 × 490-515). The front number is soft.
- **The "STATE CHAMPS" pennant** (c14 590-690 × 190-235, and mobile c14) is set in a wide heavy grotesque that belongs to neither UI face.
- **The world-space banners and the scorer's table** use a generic bold sans.
- **Card translucency** lets the "STATE FINALS" sign ghost through behind the c14 body copy.

### C10. The stop rule is not met
On this packet, no honest reading gets UI, Typography or Mobile to 8, or the overall to 8.5.
- **The milestone moved the two categories it targeted:** Typography gained a full point and UI half a point.
- **The art and setting categories did not move,** because none of the r2 blockers 1, 2, 3, 5 or 6 changed in the pixels.
