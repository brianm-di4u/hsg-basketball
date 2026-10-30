# v3-m2-r1: Defender brief

**Read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m0-r1.md` (the last binding verdict, 6.1).

**Looked at:**
- **Sheets:** all 7 contact sheets and all 19 before/after pairs.
- **Full-size desktop stills:** c02, c05, c06, c07, c08, c09, c13, c16, c18.
- **Full-size mobile stills:** c02, c06.
- **Bursts:** desktop jumper, drive, make-wide, net-close and open-play; mobile drive, make-wide and net-close.
- **Benchmarks:** sheet 04.
- **Probe:** `probe.json` and the annotated `probe/desktop/c05-flight.png`.
- **My own 2-5x crops:** desktop c16 (feet and floor), c06 (rim and card), c05 (ball), drive f14, make-wide f07 and f10-f11, mobile c02 (paint and a red sliver), mobile c06 (floor), mobile c19, the desktop HUD, and the mobile control deck.

**Not reviewed:** the webm. Sound is not shown. Neither is scored.

---

## 1. Scores

| Category | m0 final | **Defender** | One-line case |
|---|---|---|---|
| Art: players, court, venue | 6 | **6.5** | **Enclosure filled:** the replay wall now has brick, a lit scoreboard and a banner (c08); the stanchion bases are team-colour pads with a lit bevel (c07 x 985-1170, y 440-590; c18 x 850-1280, y 490-800); Hot Streak has a brick wall where the black band was (c12); the arena shows courtside chairs, not a black apron (c09). **Unchanged:** the players are the same mannequins (c21). |
| Lighting & materials | 6 | **6.5** | **Blockers 1 and 2 closed:** no wisps in a 2x crop of c16 (x 900-1280, y 330-760), c09, or mobile c02/c06, and no ghost discs in c18 or in net-close f00-f07 on either viewport. The hierarchy holds (`floorCrowd` 3.06-3.64 on desktop). **Still missing:** player rim light, bloom, material separation, and a specular sheen I can point to. |
| Animation & game feel | 6 | **6.5** | **New:** a rim flash on the make (net-close f00-f03, cream rim, red again from f04, on both viewports); a dimmed halo plus outline on the airborne ball; a continuous trail streak (drive f13-f15). **Unchanged:** the crowd still cheers an airball (c07 x 1090-1250, y 240-460). The jumper is still generic. |
| UI / HUD | 6 | **7** | **Front end:** one navy-and-gold broadcast style with a condensed display face across c01, c13, c14, c20 and c22 on both viewports. **In game:** the chevron is clamped (c21), the bug is narrower (x 362-918, about 43% of the width), the "+3" sits above the board on both viewports, and the close-camera slam and the orphaned "+3" are gone. **Against:** c13 still cuts the Quarters row, and the c06 slam clips the ball. |
| Typography | 5.5 | **6** | The display and text faces now run through every menu with a visible scale (c13: 30 px title, 18 px team names, 13 px meta). Labels under 12 px remain: mobile "STEAL"/"JUMP" (about 7 css px cap height, so about 10 px type), and desktop "FOULS" is borderline (9 px cap height at y 61-69). |
| Readability | 6 | **7** | **Ball:** `ballContrast` at the apex is now 5.02 (c04/c05; it was 1.10/1.16), mobile c05 is 4.37 (it was 1.02), and the desktop burst minima are 2.39-4.23. **Players:** 142-207 px on desktop. **Mobile:** the near-hoop box is gone. **Against:** paint clumps still merge (c02 x 160-420, y 400-720; mobile c02 x 350-600, y 880-1210). |
| Mobile portrait | 6.5 | **7** | **Size:** `playerPx` 82-88 in mobile c02-c07 (it was 47-58; the target was 65-75). **Clear areas:** the box is gone, the "+3" sits off the rim (mobile c06 x 365-455, y 287-350, with the board top at y ~363), the basket is always in view, and the deck is unchanged. **Against:** c11 is 53.5 px, still a whole-court frame, and the drive leaves about 55% of the frame as bare floor (`emptyFgMean` 36.8). |
| Authenticity of setting | 6.5 | **6.5** | **Better:** an in-world scoreboard and banner on the replay wall, a framed STATE FINALS table, team-colour stanchion pads, and a Hot Streak wall. **Against:** the benches are still empty (c15), there is no title banner in desktop live play (only a cropped pennant at c07 x 1235-1270, y 0-90), and the replay scoreboard shows the wrong teams and score (c08). |
| **Overall** | **6.1** | **6.6** | (6.5 + 6.5 + 6.5 + 7 + 6 + 7 + 7 + 6.5) / 8 = 53 / 8 = 6.63 |

---

## 2. Strengths, with evidence

### 2.1 All four m0 blockers are closed or nearly closed

1. **Blocker 1 (floor-reflection ghosts): closed.**
   - **Desktop c16:** my 2x crop (x 900-1280, y 330-760) shows #12, #14 and the YOU player standing on clean grain with soft, dark contact shadows. There is no pale streak under any white jersey. The m0 evidence location (x 820-940, y 330-690) is clean.
   - **Desktop c09:** the floor under every white jersey is clean, and the dark apron that exposed the reflection pass is out of frame.
   - **Mobile c06:** my crop (x 0-700, y 700-1200) shows only soft dark shadows under #45, #32 and #0.
   - **Mobile c02:** the m0 spot (x 370-470, y 1160-1260) is plain paint.
2. **Blocker 2 (ghost discs over the rim): closed.**
   - Before and after on `before-after/desktop-09` (c18) and `mobile-06` (c18): the four or five white circles over the rim are gone.
   - Net-close f00-f11 on both viewports show one ball dropping through one net, with nothing hovering.
3. **Blocker 3 (mobile near-hoop box): closed.**
   - Mobile c02 x 330-550, y 935-1075 is now open paint with the defenders fully visible (`before-after/mobile-01`).
   - Mobile c10 and c19 are also clean (`mobile-04`, `mobile-07`).
4. **Blocker 4 (callouts on the rim or ball, orphaned callout): mostly closed.**
   - **Mobile "+3":** it now floats above the board (mobile c06 x 365-455, y 287-350; the board top is at y ~363). It holds there for all of mobile make-wide f00-f13 and fades from f10.
   - **Desktop "+3":** clear of the board (c06 x 915-1000, y 185-245; the board top is at y ~285).
   - **Orphan:** the edge "+3" from c16 is gone (`before-after/desktop-08`). In desktop make-wide f07 the "+3" is near the edge only because the board is still in frame (zoom: the board is at the tile's right edge).
   - **Close camera:** the slam no longer appears (c18 on both viewports; net-close f00-f11).
   - What remains is in the concessions (4.2).

### 2.2 The ball is now readable in flight (the m0 gap-2 headline)

- **Probe:** `ballContrast` is 5.02 at c04 and c05 (it was 1.10/1.16) and 4.37 on mobile c05 (it was 1.02).
- **Pixels:** my 5x crop of c05 (x 620-730, y 95-195) shows a 1-2 px dark outline and a darker halo that dims the crowd faces behind the ball. That is exactly the "outline plus screen-space dim" fix in m0 fix 5.
- **Is the probe valid?** A prosecutor may say the probe ring is just sampling the halo. It is, but the halo is the intended fix, and the pixels show the ball standing out from the faces.
- **In motion:** the desktop burst minima are 2.39 (drive), 4.23 (jumper), 2.43 (make-wide) and 3.65 (net-close), where m0 was about 1.1 at the apex.
- **Trail:** it is now a continuous pale-gold streak with a darker body, not gold beads on gold shirts. In the drive f14 crop (x 1000-1200, y 960-1050) it reads against the crowd.

### 2.3 Desktop camera: bigger players, much less bare wood

- **`emptyFgPct`:**

  | Still | m0 | m2 |
  |---|---|---|
  | c02 | (n/a) | 10.5 |
  | c05 | (n/a) | 9.0 |
  | c09 | (n/a) | 12.5 |
  | c10 | (n/a) | 6.2 |
  | c11 | 45.2 | 8.8 |
  | c16 | (n/a) | 8.8 |
  | c19 | (n/a) | 8.5 |

  The m0 values for c03 and c07 were 44.5 and 51.4; see the concessions for where they stand now.
- **Burst means:** jumper 8.5, open-play 10.4, make-wide 6.4.
- **`playerPx`:** 142-207, up from 130-146, so m0 Keep 6 (player size) is honoured and exceeded.
- **Handler position:** c09 `handlerX` is 0.772 (it was 0.937 at the edge), and open-play `handlerInBandPct` is 100.
- **Side by side:** `before-after/desktop-01` (c02), `-05` (c09/c10) and `-06` (c11) show the court filling the frame where the empty bottom band used to be.

### 2.4 The front end has a designed identity (m0 gap 4)

- **Style:** every menu moved from cream web cards to one navy-and-gold panel style over the 3D gym (`before-after/desktop-01`, `-07`, `-10`, `-11`; `mobile-01`, `-05`, `-07`, `-08`).
- **Type:** headings and buttons use the slam's condensed face ("EXHIBITION", "BOYS/GIRLS", "HOME TEAM", "PLAY GAME", "PAUSED").
- **Focus:** the gold primary button with a blue focus ring is consistent across c01, c13, c14, c20 and c22.
- **Branding:** crests sit on every team card. The c14 champion card has the STATE CHAMPS pennant and a gold crest.
- **Rubric:** this is the 7 anchor's "consistent broadcast style" now running from title to champion.

### 2.5 The enclosure is filled where m0 found voids (m0 gaps 5 and 9)

- **Replay wall (m0 ruling 5's "true void", about 45% of the frame):** it is now a brick wall with a lit in-world scoreboard, a shot clock, a COBRAS banner, and the crowd along the floor (c08 x 0-1280, y 56-745; c17). The probe agrees: `voidPct` is 8.6 and 8.9, nowhere near 45%.
- **Arena near apron (m0 "true void"):** it is out of frame. c09 now shows a lit floor to the bottom edge, courtside chairs (x 360-560, y 258-305), and a fully framed "HOME · STATE FINALS · GUEST" table (x 565-1260, y 275-315). `nearBlackPct` is 24 and `voidPct` 1.5.
- **Stanchion bases:** they were black slabs. They are now orange team pads with a lit top bevel and a red band (c07 x 985-1170, y 440-590; c18 x 850-1280, y 490-800). This is m0 fix 9 almost verbatim.
- **Hot Streak:** the black band above the crowd is a brick wall, and the stanchion is padded (`before-after/desktop-06` c12; `mobile-04`).
- **Benches:** the chairs read as wooden chairs in team-adjacent orange, not black voids (c15, `before-after/desktop-08`). They are still empty (see the concessions).

### 2.6 Make payoff in the world, not only the HUD

- **Rim flash:** net-close f00-f03 shows a cream or white rim, and from f04 it is red again. At 2 ticks per frame that is about 4 frames, roughly 130 ms, on both viewports. This is the "one rim-coloured flash" m0 fix 1 asked for in place of the discs.
- **Net:** in net-close f04-f07 the net stretches down around the ball as it exits.
- **Crowd:** the baseline crowd still jumps behind the hoop on the make (c18, net-close all frames), and m0 Keep 3 is honoured.

### 2.7 Chevron and HUD polish (m0 gap 10)

- **Chevron:** c21 showed a 240 px chevron over the face. It is now a small "YOU" marker of about 30 px at x ~1050, y ~55 in the pair image (`before-after/desktop-11`).
- **Bug:** it spans x 362-918 (556 px, about 43% of 1280), down from 312-968. That meets m0 fix 6's "about 45%".

### 2.8 Keep list honoured

- **Hierarchy:** about 3x (`floorCrowd` 3.06-3.64; arena 3.49).
- **Make beat:** the slam card look and the AIRBALL tag (c07). There is no slam on the airball (c07, mobile c07).
- **Ball and net:** the mesh net and the jumping crowd behind it.
- **Venue:** per-school floors and crests (c09, c10, c11, c16).
- **Portrait:** the banners and the separate deck (mobile c06 banners at y 140-225).
- **Replays:** letterboxed with the "REPLAY · THREE" bug.
- **Hot Streak:** the behind-shooter axis (c12).
- **YOU ring.**

---

## 3. Pre-emptive rebuttals

1. **"The reflection ghosts are still there."** Not in this packet.
   - The 2x crop of desktop c16 at the m0 location is clean, as are c09 and mobile c02/c06 (2.1).
   - The faint warm patches under dark-skinned players in mobile c06 (x ~560-620, y ~1080-1180) are darker than the floor. They are contact or soft shadows, not the pale vertical wisps of m0.
2. **"New ghosts in the net close-up: the ball looks pale and doubled."**
   - c18 and net-close f00-f03 show one ball seen through the net mesh while the rim flashes cream. In f04-f11 it is the same orange ball with a dark halo.
   - There is never more than one ball-sized object. Concede only that the ball reads washed out while it is inside the mesh (4.1).
3. **"`ballContrast` 5.02 is a probe artefact."**
   - It is measured against a ring that includes the dark halo. But the halo is real pixels on screen: the c05 crop shows the dimmed faces.
   - A player sees what the probe sees. It is a valid measure of the intended fix.
4. **"The desktop camera still leaves half the frame bare wood."** Contradicted by the probe.
   - `emptyFgPct` is 6.2-12.5 in c02, c05, c09, c10, c11, c16 and c19, with a jumper burst mean of 8.5 and an open-play mean of 10.4.
   - The cases that are still high are named in 4.3. They are no longer the rule.
5. **"The replay is still a black void."**
   - c08 and c17 are a lit brick wall with a scoreboard and a banner; `voidPct` is 8.6/8.9.
   - The remaining dark area is the letterbox, which is a Keep item.
6. **"The arena still has a black apron and a cropped 'HOT SP'."** Not in frame in c09, and `nearBlackPct` dropped to 24.
7. **"The mobile '+3' still sits on the rim."**
   - The plate's bottom edge is at y ~350 and the board's top at y ~363 (mobile c06).
   - Across make-wide f00-f13 it stays above the board and never overlaps the rim or net.
8. **"The menus are still web cards."** They are styled panels with a display face, crests, team-colour accents and a consistent focus state across 5 screens and 2 viewports (2.4). They are not yet 2K or Hoop Land menus, but they are no longer generic.
9. **"Mobile players are tiny."** `playerPx` is 82.4 (c02), 88 (c03), 86.3 (c04), 87.3 (c05), 80 (c06), 85.9 (c07) and 82.3 (c19): above the 65-75 target m0 set.

---

## 4. Concessions (plainly)

### 4.1 Art and lighting

- **The players are unchanged mannequins:**
  - mitten hands and tube limbs (c21 hand x ~0-190, y 90-300; forearm x 1000-1090, y 680-780)
  - a dot-eye face with no nose
  - the same near-plane limb clipping in c21
  - the stub-armed ref in c15 and c18
- **The photographic crowd still out-renders the athletes** (c15, c18, c21). This is the single largest Art gap and is untouched. Crowd provenance is not shown.
- **No 9-anchor lighting:**
  - no key or rim light on the players (c02, c16)
  - no visible bloom on the scoreboard digits (c08) or anywhere else
  - skin, cloth, glass and wood still render alike (c18 glass is a pale frame)
  - with the reflection gone, I cannot point to a specular floor sheen in c09 or c16. The floor reads as clean, slightly warm-graded wood.
- **The ball reads pale in close-ups:** inside the net mesh in c18 (x 570-710, y 240-380) and in net-close f00-f03.
- **A new small artifact on mobile:** a thin red vertical sliver floating over the floor in mobile c02 (x 483-488, y 848-908) and mobile c19 (x 310-318, y 860-881). It looks like a remnant of the removed near hoop, and it should go.
- **An exposure shift in desktop open-play:** f14-f15 turn visibly paler and flatter than f00-f13, on the floor and the crowd alike.

### 4.2 UI and typography

- **The c06 slam card clips the ball:** the card's top edge cuts across the bottom of the ball as it exits the net (desktop c06 x 905-965, y 505-520; zoom). This is a fresh case of "callout on the ball", caused by the lower camera putting the hoop lower in frame.
- **The slam covers the shooter during the pan:**
  - desktop make-wide f07: the card sits over the YOU player
  - mobile make-wide f06: the card brushes the shooter
  - mobile make-wide f08: the card covers a trailing player
  - In make-wide f12-f13 (both viewports) it fades over the centre logo and the players.
- **c13 select still cuts the Quarters row** at y ~770-800 on desktop. Mobile c13 is a long scroll.
- **The replay scoreboard is wrong:** it reads "FOUNTAIN L 0 · MOUNTAIN P 0" with the COBRAS banner (c08 x 440-785, y 80-255). The clock (1:58) matches the HSHS 3 · LHS 0 make in c06. A player will read it as a bug.
- **Labels under 12 px remain:**
  - mobile "STEAL"/"JUMP" in the deck (about 7 css px cap height)
  - desktop "FOULS" at about 9 px cap height (borderline)
  - the c13 "game colors" pills
  - the c01 disclaimer

### 4.3 Readability and the camera

- **Paint clumps still merge:** c02 x 160-420, y 400-720; c19 x 160-330, y 230-400 (sheet); mobile c02 x 350-600, y 880-1210; open-play every frame.
- **The shooter's head still sits on the crowd line** in the jumper (jumper f08-f17, YOU at the apron edge).
- **Bare-wood frames remain:** `emptyFgPct` 26.9 (c03, c04), 38.6 (c07), and the drive burst mean 24.8.
- **The drive handler hits the edge:** `handlerInBandPct` 40 (drive f02-f04, handler at about 0.9 of the width).
- **The replay camera has lost the shooter.** The m0 replay showed #2 celebrating. c08 and c17 now show an empty basket, the crowd and the ref's head (c08 x 420-530, y 660-745), with the ball clipped at the top edge (c08 x 395-455, y 56-78). It is a "replay" of a three with no shooter in it.

### 4.4 Mobile

- **Mobile c11** is still a whole-court frame (`playerPx` 53.5).
- **Mobile c16 and the drive** leave large empty floor (`emptyFgPct` 37; drive `emptyFgMean` 36.8). In mobile drive f06-f15 the shooter sits in the top third, with the lower ~55% empty, and burst `ballContrastMin` is 1.12.

### 4.5 Animation

- **The crowd is still not make-specific:** the right-end fans have their arms up on the airball (desktop c07 x 1090-1250, y 240-460), and the mobile c07 crowd behind the basket is up too.
- **No knee load or held follow-through** is visible in the jumper burst. The release is still generic.

### 4.6 Authenticity

- **The benches are still empty chairs** (c15 x 20-400, y 690-800 on the sheet; desktop c02 x 505-840, y 295-355).
- **No title banners in desktop live play** apart from a cropped pennant edge (c07 x 1235-1270, y 0-90).
- **No arena ribbon** (c09).
- **The Hot Springs crowd still reads orange, not gold** (c02, c16).
- **The Hot Streak crowd stands on a ledge** with no bleacher and no ball racks (c12).

---

## 5. Status of the m0 gaps as I read them (for the Arbiter)

| m0 gap | Status | Key evidence |
|---|---|---|
| 1. Ghosts and hierarchy | **Closed** (one small new artifact) | 2.1; mobile red sliver (4.1) |
| 2. Ball in flight and payoff | **Mostly closed** | ballContrast 5.02/4.37, rim flash, streak trail; crowd not make-specific |
| 3. Desktop composition | **Partly → mostly** | emptyFg 6-12.5 in most live stills; c03/c04/c07 and drive still high; shooter head on the crowd line |
| 4. Menus | **Mostly closed** | the navy/gold system everywhere; c13 overflow open |
| 5. Enclosure | **Partly** | replay wall, stanchion pads, arena apron and Hot Streak wall done; benches empty, no near side |
| 6. Portrait rig | **Mostly closed** | playerPx 80-88; c11 and drive still wide |
| 7. Mannequins | **Open** | c21 unchanged |
| 8. Hot Streak staging | **Partly** | wall in place of the black band; no bleacher or racks |
| 9. Desktop place identity | **Open/partly** | the STATE FINALS table is framed; no banners in live play, no ribbon, palette unchanged |
| 10. HUD polish | **Mostly closed** | chevron clamped; bug at 43%; STEAL/JUMP under 12 px |
| Blockers 1-3 | **Closed** | 2.1 |
| Blocker 4 | **Mostly closed** | rim and orphan cases fixed; the c06 slam now clips the ball; the slam covers the shooter in make-wide f07 |
| New regression | **Replay framing** | the shooter is missing from c08/c17; the in-world scoreboard shows the wrong teams and score |
