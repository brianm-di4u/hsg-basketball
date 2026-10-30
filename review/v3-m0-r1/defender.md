# v3-m0-r1: Defender brief

Inputs read: `PACKET.md`, `review/RUBRIC.md`, `review/history/final-review.md` (6.1), all 7 contact sheets, all 10 burst strips, `probe/probe.json`, benchmark sheets 01-04, and these full-size stills: desktop `c02`, `c03`, `c05`, `c06`, `c07`, `c08`, `c09`, `c12`, `c15`, `c18`, `c21`; mobile `c03`, `c06`. I made enlarged crops of desktop `c02`, `c05`, `c06` and of the jumper/drive burst frames f14. I did not watch `video/open-play.webm`, so nothing below relies on it.

Framing: this is the baseline of a new campaign, but the build is visibly **not** the build the 6.1 verdict scored. Several items that verdict listed as open or as regressions are fixed in these pixels. I credit them below and concede what has not moved.

---

## 1. Scores

| Category | Prev (final) | **Defender** | One-line case |
|---|---|---|---|
| Art: players, court, venue | 6.5 | **6.5** | Dense, varied crowd with cheerleaders, a real mesh net, eyes and brows on faces, hair variety. But the close cameras expose mannequins with mitten hands (`c21`), and the benches are still empty chairs (`c15`). Net: no change. |
| Lighting & materials | 5 | **6** | The house is finally dimmer than the floor: floorCrowd is 3.2-3.5 in every desktop gym and 3.98 in the arena. Floor sheen and contact shadows hold. White reflection wisps are still there, and there are still no pools or bloom. |
| Animation & game feel | 5.5 | **6.5** | Every gap the verdict named has moved: a ball trail (jumper and drive bursts), the ball dropping through a deforming mesh (net-close f04-f11), a jumping baseline crowd behind the rim, a slam that is placed clear of the rim and not stale on a miss, and a camera that re-frames after the make. |
| UI / HUD | 6 | **6.5** | Final-review regressions 1 and 2 are fixed (`c07` and mobile `c06`), and desktop regression 3 is mostly fixed (`c06`). The bug is still 656 px wide with tiny labels. "+3" still sits on the glass on mobile, and the YOU chevron covers the face in `c21`. |
| Typography | 5.5 | **5.5** | No change: the condensed slam face is good, and the menus are the same cream cards. |
| Readability | 6.5 | **6.5** | Gains: the dim house separates the players, there is a trail, and on mobile the ball flies over the floor. Losses: the desktop apex still sits in faces (ballContrast 1.10/1.16 on `c04`/`c05`), and the paint clumps merge (`c02`, `c19`). |
| Mobile portrait | 7 | **7** | Banners, the clear-of-rim slam and the visible trail all hold or improve. The rig is unchanged: players about 58 px, and the whole court shows on defense. |
| Authenticity of setting | 6.5 | **7** | It now meets most of the 7 anchor: students in school colours per gym, cheer squads, HOME/GUEST scorer's-table signage with the school name, a "STATE FINALS" table, and portrait title banners. Still missing: desktop banners and a filled bench. |
| **Overall** | **6.1** | **6.4** | (6.5+6+6.5+6.5+5.5+6.5+7+7)/8 = 6.44 |

---

## 2. Strengths, with evidence

### 2.1 The light hierarchy finally exists, and the probe proves it (6.1 verdict gap #1, house half)
- The 6.1 verdict said "the crowd is still at floor exposure" and "probes flat against m3".
- This packet's probe shows a consistent split in linear luminance:
  - desktop gameplay floorY is 0.23-0.26 against crowdY 0.035-0.042
  - floorCrowd is 3.16 (`c02`), 3.38 (`c03`), 3.49 (`c04`), 3.37 (`c06`), 3.45 (`c11`) and 3.98 (`c09` arena)
  - the burst means agree: jumper 3.58, drive 3.40, make-wide 3.20
- The arena is the darkest house, as the verdict asked ("0.45 in the arena"). Its crowdY is 0.0148, the lowest of any gym.
- Visually, `c02` and `c06` read as a lit court under a dimmer bowl. Players separate from the stands far better than the verdict described.

### 2.2 A ball trail now exists (6.1 verdict: "no trail in any frame")
- **Desktop:** a string of glowing orange/gold beads follows the ball from release.
  - `bursts/desktop-jumper.png` f10-f17: an enlarged f14 shows 4-5 beads arcing over the "EARLY" tag.
  - `bursts/desktop-drive.png` f10-f15: a brighter gold chain on a "PERFECT" release.
- **Mobile:** a dotted yellow-to-pink bead trail traces the whole arc over the floor (`bursts/mobile-jumper.png` f10-f17), and a vertical bead chain shows in `bursts/mobile-drive.png` f12-f15.
- The trail colour appears to change with release quality: amber on EARLY, brighter gold on PERFECT. That is feedback, not just decoration.

### 2.3 An in-world make: the ball goes through a real net (6.1 verdict: "no visible net, no ball-through-hoop moment")
- **Net:** `c18-net-close` shows a modelled mesh net with real holes, white cord and a red rim. The ball is inside the net at about (640,300).
- **Ball path:** `bursts/desktop-net-close.png` tracks the ball from the rim (f00-f02), through the mesh (f03-f07), out the bottom (f08-f09) and down to the floor (f10-f11). The net bulges around the ball in f05-f07.
- **Mobile:** the same sequence plays in `bursts/mobile-net-close.png` f00-f11.
- **Crowd:** the baseline crowd behind the basket is mid-jump with arms up in `c18`. The figures at (180-300, 230-460) are off the ground with bent knees.

### 2.4 Slam placement and lifecycle are fixed (6.1 verdict section 4, regressions 1-3)
- **Regression 1 (stale slam on an airball): fixed.** In desktop and mobile `c07-miss` the score is 0-0, the "AIRBALL" tag shows at (780,312), and there is no "3 POINTS" card anywhere.
- **Regression 2 (slam occludes the rim on portrait): fixed.** In mobile `c06-make` the slam card is at y 745-885 in the court half, and the rim (about 405,520) and backboard are uncovered. Across `bursts/mobile-make-wide.png` f00-f13 the card never touches the rim.
- **Regression 3 (desktop overlays stacked on the hoop): mostly fixed.**
  - The slam sits in the lower-right foreground of `c06` (650-1040, 515-670), over empty wood and the dark lane. No player is hidden under it.
  - The "+3" sits mostly above and left of the backboard (820-880, 130-180) rather than in the middle of the glass.
  - In `bursts/desktop-make-wide.png` f00-f04 the card slides in from the right and settles lower-left. That is the quadrant the verdict asked for.
- **Regression 4 (speed streaks over the crowd): not reproduced.** The streaks in `c06` and `c18` (580-680, 540-600) are confined to the floor next to the card.

### 2.5 The venue reads as a full house with a cheer culture
- **Crowd density:** dense, individually varied crowds fill every sideline bowl (`c02`, `c03`, `c06`, `c10`, `c11`). The sprites differ in age, hair, clothing and pose, as the `c15` and `c21` close-ups show.
- **Per-school colours:**
  - Lakeside blue/gold (`c03`)
  - Jessieville purple (`c10`)
  - Mountain Pine red/black, with red apron and red stands (`c11`)
  - Lake Hamilton maroon (`bursts/desktop-open-play.png`)
- **Cheer squads** in school uniform with pom-poms stand on the baseline: navy for Lakeside (`c03`, `c05` crop), black for Hot Springs (`c06` crop).
- **Scorer's table** signage carries HOME/GUEST and the school name ("HOT SPRINGS" in `c02`, "LAKESIDE" in `c03`, "MOUNTAIN PINE" in `c11`, "STATE FINALS" in `c09`).

### 2.6 Players read larger on desktop and are better grounded
- **Size:** desktop median playerPx is 130-146 in every gameplay still (for example `c02` 138.9 and `c16` 145.8), with burst medians of about 137.5. In the `c02` crop, numbers (#1, #3, #21, #24) and team trims read clearly.
- **Contact shadows:** soft and directional under every player (`c02` crop under #21 at about 600,600; `c06-left` crop).
- **Hair variety:** buns, top-knots and short crops (`c02` #3 bun and #21 top-knot; `c08` #2 bun; `c12` #30 braid).
- **Faces:** at close range they now have eyes and brows (`c21` at 445,230 and 715,155; `c15` referee). The 6.1 verdict described them as "faceless".

### 2.7 Desktop handler framing improved in normal play
- handlerX is 0.659 (`c02`), 0.517 (`c16`), 0.661 (`c19`) and 0.66 (`c10`, `c11`), against the verdict's ~0.94 handler-at-the-edge case.
- Burst handlerInBandPct is 100% in open play, 88% in the jumper and 86% in make-wide.
- The exceptions are conceded in section 4.

### 2.8 Hot Streak and replay improvements hold
- **Hot Streak (`c12`):**
  - a large shooter (~220 px, #30, braid visible)
  - a jumping baseline crowd framing the rim on both sides
  - "TROJANS" unobstructed
  - the right edge is now dark wood apron, not the verdict's void
- **Replays (`c08`, `c17`):**
  - letterboxed and HUD-free, with a "REPLAY · THREE" bug
  - `c08` catches the shooter's follow-through with both arms up and the ball in flight toward the rim, with a team banner ("COBRAS") on the wall: a real broadcast beat

---

## 3. Pre-emptive rebuttals

1. **"The crowd is still as bright as the floor."** The probe contradicts this.
   - floorCrowd is 3.2-3.5 in every desktop gym still and burst, and 3.98 in the arena.
   - crowdY never exceeds 0.043 in desktop gameplay, against a floorY of at least 0.23.
   - The crowd looks busy because it is detailed, not because it is exposed like the floor.
2. **"Still no ball trail."** The bursts show beads behind the ball: desktop jumper f10-f17, desktop drive f10-f15, mobile jumper f10-f17, mobile drive f12-f15. The trail is real. A fair complaint is that on desktop it sits against the crowd (see concessions).
3. **"No net or rim reaction on a make."** The ball visibly passes through a mesh net that bulges (net-close f03-f09, desktop and mobile), and `c18` shows the net and the jumping crowd behind it.
4. **"The slam still covers the rim and lingers into the miss."** Not in this packet.
   - `c07`: no slam, 0-0, "AIRBALL".
   - mobile `c06`: slam at y 745-885, rim at about y 520.
   - make-wide desktop f00-f13 and mobile f00-f13: the card never overlaps the rim.
5. **"Big black voids."** Most dark areas are dark but detailed:
   - the stanchion bases are dark navy or black padded boxes with highlights (`c03` at 1110-1280, 410-540)
   - the near apron in the gyms is dark-stained wood with reflections (`c06` right, `c07` at 960-1280, 400-800)
   - Desktop nearBlackPct of 20-26% is driven by those aprons and the stanchion, not by a clear-colour void.
   - The real exceptions are the arena near apron (`c09` y 620-800) and the replay back wall (`c08` x 540-1280). I concede both below.
6. **Probe numbers that measure the wrong thing.** A prosecutor should not cite these:
   - **mobile `c06-make`:** floorY 0.0288 and floorCrowd 0.86 look like an inverted hierarchy. The floor samples land on the dark slam card and the dark-stained lane; the visible floor in that frame is as bright as in `c03`.
   - **`c15-bench-close`:** floorY 0.012 and 0.0035 sample the dark apron under the bench, not the court.
   - **menus (`c13`, `c14`, `c20`, `c22`):** floorY/crowdY read the cream cards (floorY up to 1.0). They say nothing about lighting.
   - **mobile `c08`/`c17`:** playerPx of 262-267 measures the replay close-up, not gameplay scale.
   - **mobile `c06`:** ballContrast 1.01 with ballPx 7.4 is the ball inside the dark net/backboard area at the make, not a flight-readability failure. The flight frames are the right test (mobile `c04` 1.58, `c07` 1.78).
7. **"Players are still faceless."** At close range they have eyes and brows (`c21`, `c15`). At gameplay size no face detail reads, which the rubric 7 anchor does count against them. I concede that part, but the verdict's literal "faceless heads" is out of date.
8. **"Floor ghosts got worse."** They did not, and in the `c02` crop of the paint clump I find none under #1, #3, #21 or #24. They remain in other frames; see concession 2.

---

## 4. Concessions

1. **The players are still mannequins, and the close cameras now advertise it.**
   - In `c21-face-close` the two players are tube limbs with mitten hands. The faces have eyes and brows, but no nose and no mouth.
   - The photo-real crowd behind them makes the style clash stark.
   - `c15` shows the same with the referee.
   - This is the largest Art drag and is far from Playgrounds 2 (benchmarks-04, `playgrounds2-1`/`-2`).
2. **Reflection wisps persist.** White vertical smears sit under white-jersey players:
   - `c06` at about (290,400-430), (430,430-490) and (85,650-690), in the `c06-left` crop
   - `c09` at about (470,480-520) and (990,600-640)
   - mobile `c06` under #31 (60,1060-1100) and #0 (540,1160-1200)
   - The 6.1 verdict's fix (height fade, Fresnel, cap 0.15) is not visibly done.
3. **Pale "ghost discs" above the rim on the make.** In `c18` at (480-800, 115-215), and in net-close f00-f07 on both viewports, overlapping translucent white circles hover over the rim. They are probably trail copies of the ball, but they read as a render artifact or smoke, not as a trail. Tint them ball-orange and shrink them, or drop them in the close camera.
4. **The desktop ball apex is still in the crowd.** In `c05` the ball is at about (595,112) on top of the faces, and the `c05` crop confirms it. ballContrast is 1.16 (`c05`) and 1.10 (`c04`), and the desktop jumper burst minimum is 1.09. There is no crowd dip behind the ball. The trail helps only partly.
5. **The benches are still empty, or filled with fans.**
   - `c15`: eight black chairs, all empty.
   - `c03`, `c05` crop: green chairs, some empty, the rest holding jeans-wearing spectators, not players in uniform.
   - `c06` crop: blue chairs, same.
   - The rubric 7 "benches" item is not met.
6. **Desktop composition still wastes the foreground.**
   - emptyFgPct is 44.5 (`c03`), 51.4 (`c07`), 45.2 (`c11`) and 42.2 (drive burst mean).
   - The shooter's head still sits in the bench/crowd band (`c03` at about 450,250).
   - The handler reaches the edge in `c09` (handlerX 0.937) and `c22` (0.889).
7. **The arena final is still the weakest venue.** `c09` has a black near apron (y 620-800), "HOT SP" cropped at the bottom right, no ribbon board and no banners. The darker house does not substitute for arena identity.
8. **No title-year banners in desktop gameplay.** They appear only on portrait (mobile `c03`: 1945/2000; mobile `c06`: 1932/1996/1998). The one banner visible on desktop is the "COBRAS" team banner in replay `c08`.
9. **The crowd reaction is not make-specific.** The right-end fans have their arms up in `c07-miss` (1100-1260, 170-550) just as in `c06-make`. The jump in `c18` is good, but nothing shows a miss getting a different crowd.
10. **HUD polish is unchanged.**
    - The bug still spans about x 312-968 with ~10 px "FOULS" labels (`c02`).
    - The mobile "+3" sits on the backboard glass (mobile `c06` at 340-470, 435-505; make-wide f00-f11).
    - The YOU chevron scales into a huge triangle over the player's face in `c21` (690-930, 205-335).
11. **The menus are unchanged web cards.**
    - `c01`, `c13`, `c14`, `c20` and `c22` are still cream cards with a generic sans body.
    - `c13` still cuts the Quarters row at the bottom of 800 px.
    - The title backdrop wordmarks are still cropped ("LAKESIDE" on the desktop baseline; mobile "LIC…" / "…ESSIEVI…").
    - Typography stays at 5.5.
12. **The mobile rig is unchanged.** Players are about 58 px (probe 47-58, `c11` 47). Defense shows the whole court (mobile `c02`, `c10`, open-play burst f00-f15). The basket is tiny at the top on offense (mobile `c09`).
13. **Hot Streak staging is only partly done.** `c12` still has the black band under the wall (y ~85-100), the baseline crowd standing on a dark platform with no bleacher, and no ball racks.
14. **The replay back wall is a flat dark plane.** In `c08` and `c17` it fills roughly x 540-1280, y 55-580, about 40% of the frame, with no detail.
