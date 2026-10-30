# v3-m3-r2: Defender brief

Round: v3-m3-r2 (milestone 3, round 2: baked-lighting venues for the home gyms and the state-finals arena). Before/after pairs compare with v3-m3-r1.

**Inputs read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m3-r1.md`; all 7 contact sheets; all 19 before/after pairs; the full-size stills desktop c08, c16, c17, c19, c21 and mobile c06, c08; the bursts desktop make-wide, net-close and jumper, and mobile make-wide; `probe/probe.json` (all stills and bursts).

**My own measurements:** Rec.601 luma, sRGB 0-255, from the full-size stills:
- luma grids of the c16, c19, c15 and c21 skin
- a row-by-row luma sample of the mobile c06 shoe-to-card gap (x 535-600, y 950-1010)
- 3x crops of mobile make-wide f00-f04
- a 5x crop of the c08 ball and rim (x 570-670, y 320-420)
- mean colour boxes on the walls, the floor and the c21 skin
- column profiles of floor luma in c03, c11, c12 and c16

The webm and sound are not reviewed, and I score neither up nor down for them.

---

## 1. Scores

| Category | Score | One-line case and evidence |
|---|---|---|
| Art: players, court, venue | **6.5** | **For:** the venue now has a built surface. Painted block with mortar lines shows above the crowd in c06 (x 880-1280, y 55-100) and c02 (y 30-40), on the c18 back wall (desktop-09 pair, upper band), and on the replay left wall (c08 x 0-555, y 55-470, with a green wainscot and a cream fascia). Banners hang on the desktop title wall (c01: 1945 and 2000 STATE CHAMPIONS). The c08 head overlap is gone. **Against:** dark-skinned players render as near-black silhouettes again (§4.1), and the c21 near limb is now a black blob (mean luma 4.8). |
| Lighting & materials | **6.5** | **Down from 7.** Dark skin is crushed again: c16 YOU arms 1-10, c19 #42 arms 2-15, the c15 referee's head 0-2, and c21 #12's cheek is (68,4,2). In r1 the arbiter cited the end of that defect as the reason Lighting reached 7. The hierarchy is weaker too (`floorCrowd` 2.52-3.13 desktop live, against 3.41-4.16). **Credit:** a centre-weighted floor falloff now shows (§3.6), and the replay far wall no longer glows (luma 19.7, against r1's 84). |
| Animation & game feel | **6.5** | Unchanged in motion: the rim flash shows in net-close f00-f03, the net is rigid from f04 to f11, and the jumper repeats r1 (jumper f04-f17). The c08 beat now isolates the shooter (no overlap, no foreground body), but c17 is still late (§2.3). |
| UI / HUD | **7** | **Up from 6.5.** The desktop "+3" no longer sits under the card (make-wide f00-f01: no "+3"; it appears in f02 at the right edge, clear of the fading card). Desktop and mobile c20 show the whole DID YOU KNOW panel with its Source line and no scroll cue. The mobile card no longer touches #0's shoe. **Still failing:** the mobile card margin (about 6.5 css px against 16) and the mobile Select footer. |
| Typography | **6.5** | Unchanged: a condensed display face plus a text face on a scale (c13, c20, c22). The c20 pills and c13 chips are still under 12 px. |
| Readability | **7** | Kits separate the teams in every live frame (c02, c10, c16, c19). The YOU marker and ring are constant, and `handlerInBandPct` is 88-100. **Against:** body facing is lost on the crushed dark players (c16 YOU reads as a silhouette), and the ball outline weakened (`ballContrast` c04 3.73 against 4.78; jumper minimum 1.95 against 2.67). |
| Mobile portrait | **7** | **Better:** mobile c08 no longer has a referee filling the foreground (mobile-03 pair), mobile c20 is clean (mobile-07), and the card has left the shoe. **Same:** players are 83 px (c02, c10, c19) and the thumb deck is separate. **Against:** Select still renders under its footer, c17 is unchanged, the replay far wall is a dark featureless plane (mobile c08 x 270-780, y 120-760), the framing exceptions are identical (c11 50.6 px, c09 57.6 px, c16 41.5%), and the "BOYS STATE CHAMPS" banners still hang in a girls' game (mobile c06 y 140-200). |
| Authenticity of setting | **6.5** | **For:** block walls and risers read as a real gym; the title has banners; the replay dressing (COBRAS pennant, wainscot) holds; the per-school bands and wordmarks are kept (c10, c11). The appearance assignment swung back toward r3 (c19 #42 and the ball handler are dark again). **Against:** the fix 1 pass (15% of the frame showing wall) fails at about 5% in c02 and c19, there are no live desktop banners, the benches are empty, and the mobile banners still say BOYS. |
| **Overall** | **6.7** | (6.5 + 6.5 + 6.5 + 7 + 6.5 + 7 + 7 + 6.5) / 8 = 53.5 / 8 = 6.69 |

---

## 2. Strengths, with evidence (what improved since `v3-m3-r1`)

### 2.1 Blocker 1, desktop half: the "+3" passes
- In desktop make-wide f00 and f01, the "3 POINTS" card slides in and no "+3" is drawn anywhere.
- The "+3" first appears in f02, at the far right of the play area (burst x about 1170), well clear of the card (burst x 940-1045), which is already fading.
- The card is faint by f03-f04 and gone by f05. The "+3" holds through f06.
- The pass test ("in desktop make-wide f00-f02, the card does not overlap the '+3'"), and the requirement to keep the slide-in, the fade and gone-by-f05, are all met.
- Desktop c06 (desktop-03 pair, lower) confirms it: the r1 "+3" beside the card is gone from the make frame.

### 2.2 Blocker 2, desktop and mobile c20: pass
- **Desktop c20 AFTER** (desktop-10 pair, lower right) shows the whole DID YOU KNOW panel, including "Source: Wikipedia: Hot Springs High School", with MENU and ROSTER below it and no "More options below" cue. This is the r3 layout the pass test asks for.
- **Mobile c20 AFTER** (mobile-07 pair, centre) also gains the Source line and loses the cue.

### 2.3 Blocker 3, c08: two of three clauses pass, on both viewports
- **Head overlap:** desktop c08 #2's head (x 805-855, y 485-545) is clear. No other figure is within 100 px; the r1 brown-haired head at x 825-935 is gone (desktop-04 pair, lower).
- **Foreground:** no character stands between the camera and the shooter on desktop. On mobile, the r1 referee that filled the right foreground is gone, and #2 is the only foreground figure (mobile c08; mobile-03 pair).
- **Rim plane, judged on the rendered frame:**
  - Desktop ball: y 353-378, so its centre is at 365.5. The rim's front band is centred at y about 357 (my 5x crop), so the ball centre is about 8 px below the rim line.
  - Mobile ball: y 775-812, centre about 793, against a rim at about 782.
- `ballPx` still reads 29.4 against a rendered ball of about 26 px, so as r1 ruled, it still measures simulation state.

### 2.4 Blocker 4: the appearance assignment moved back toward r3
r1's evidence for this blocker was characters going pale or blonde. Those characters are dark-haired and dark-skinned again:
- **c19:** #42 and the ball handler, the two players r1 named as the darkest LHHS figures in r3, are dark again (desktop-10 pair, upper; c19 x 455-530 and x 840-920). The visible LHHS team now mixes dark (#42, the handler, the far player at x 455-475) with light (#21, the near player at x 420-460).
- **c18:** the referee's hair is black again, not grey (desktop-09 pair, lower).
- **c07, c11, c12, c09:** the light players with blonde hair of r1 (desktop-04, -06, -05) now render with dark hair and dark skin. Light players remain: c16 #14 is blonde, c19 #21 is light, c10 has a light player at x 840.

**This half of the blocker is credited. The shading half fails badly; see §4.1.**

### 2.5 The venue now shows a built surface where it shows at all
- **c06:** above the crowd (x 880-1280, y 55-100) is painted block with visible mortar courses. Dark bleacher risers sit under each crowd row (my 2x crop). The same block is on the end wall at x 1180-1280.
- **c18:** the back wall above the orange band is coursed block (desktop-09 pair, lower right, y 445-540). That partly reverses r1 regression 4 (the brick lost to flat paint). The orange band itself is still flat.
- **c08 and c17:** the left wall is now coursed block with a dark-green wainscot (c08 x 0-230, y 460-600) and a cream fascia rail. In r1 it was flat cream (desktop-04 lower pair; desktop-09 upper pair).
- **c01 title:** two navy "1945 / 2000 STATE CHAMPIONS" banners hang on a block wall (desktop-01 pair, upper). The r1 title showed no banners. This is the first banner visible on a desktop wall.
- **Mobile:** the block-and-band wall sits above the crowd in every gameplay frame (mobile c06 y 140-330).

### 2.6 The replay wall no longer outshines the floor from the far side
- r1 fix 5 asked to "drop the wall bake so the floor is the brightest surface". The far wall in c08 is now luma 19.7, RGB (31,17,4), over x 700-1250, y 80-300, against r1's 84.
- The left wall is still brighter than the floor (147 against 107); see §4.6.

### 2.7 Kept from r1 (nothing regressed here)
- The callout lifecycle: slide, fade, gone by f05 on both viewports (both make-wide bursts).
- The rim flash (net-close f00-f03).
- The per-school wall bands and wordmarks (c10, c11), and the STATE FINALS dressing (c09).
- The mobile Select 2-column grid and its cue.
- The Fountain Lake green kits (c03-c05).
- Desktop player scale (`playerPx` 141-207), and mobile at about 83 px.

---

## 3. Pre-emptive rebuttals

### 3.1 "The mobile card still touches the shoe"
- **Not supported.** In mobile c06, #0's right shoe has its last bright row at y 984 (x 567-575: 142, then 110 at y 985). The card's top edge is y 998, where luma drops from 123-128 to 62-65. The gap is 13 device px, about 6.5 css px.
- In mobile make-wide f00-f01 (my 3x crops), the card's top edge clears the shoe by about 3 burst px. That is roughly 5 css px; it is no longer contact.
- **Concession:** it is still well short of the 16 css px pass test (§4.2).

### 3.2 "The '+3' is still hidden"
- **Contradicted by the burst** (§2.1). r1 saw the "+" hidden in f01. Here, no "+3" exists before f02, and from f02 it is about 125 burst px right of the card.

### 3.3 "c08 still fails"
- **Only one clause is open,** not all three (§2.3). The head-overlap and foreground clauses pass on both viewports. The ball centre measures below the rim line on both.
- **Concession:** in my 5x crop the ball is drawn over the front net strands and the front of the rim (§4.3), so "inside the net" is not shown.

### 3.4 "c20 still clips its Source line"
- **Contradicted** by desktop-10 and mobile-07 (§2.2).

### 3.5 "The shell is still invisible"
- **Overstated.** Coursed block shows in c06 (x 880-1280, y 55-100), c02 (y 30-40), c18, c08 and c17. c01 has banners. A reviewer who calls the walls "flat paint bands" is describing r1. The c06 and c18 crops show mortar courses.
- **Conceded:** the amount shown in live play is about 5% of frame height (c02 y 0-40 of 800), far short of fix 1's 15%. No live desktop frame shows a banner.

### 3.6 "The floors are even end to end; no light pools"
- **No longer true.** Floor luma now falls from the centre to the edges:

| Frame and rows | Centre | Edges |
|---|---|---|
| c11, y 560-600 | 142-146 (x 320-720) | 101 (x 0-80, x 1200-1280) |
| c12, y 560-600 | 139 | 92-95 |
| c16, y 720-790 | 132-135 | 85-95 |

- That is a 30-40% falloff, against r1's "even end to end".
- **Is it a bake or a vignette?** The packet can't separate a baked pool from a screen vignette. The crowd above the c16 floor darkens much less (y 100-260: 29-50, noisy), which leans toward the floor rather than a full-frame vignette.
- **Conceded:** it is one broad centre pool, not the 4-6 pools with gaps that fix 2 asked for, and nothing blooms (`clippedPct` 0 in every still).

### 3.7 "The replay far wall is a bright brown plane (84)"
- **Measured at 19.7 now** (§2.6). It no longer competes with the floor.
- **Conceded:** it is still featureless, and darker it reads as an unlit void over about 40% of desktop c08 (x 555-1280, y 55-330) and mobile c08 (§4.6).

### 3.8 Probe readings that a reviewer may misuse
- **`ballContrast` in c06 (1.57), c07 (1.23) and make-wide (minimum 1.29):** this is the luma-only measure on wood that r1 ruled misleading. The ball keeps its dark outline in c07 (x 1110-1140, y 330-355).
- **c18 `ballContrast` 1.24:** the ball is behind the net, as it should be.
- **Replay `floorCrowd` 0.98 and `voidPct` 12.8-13.2:** the void count includes the letterbox, as r1 ruled.
- **c08 and c17 `ballPx`:** simulation state, not the rendered ball.

### 3.9 "The appearance mix is still pale"
- **Not supported** for the assignment (§2.4). If anything, the population now leans dark: c11 and c12 have no light player.
- **The real problem is how dark skin is shaded, not who is dark** (§4.1).

---

## 4. Concessions

### 4.1 Dark skin is crushed again (Blocker 4 fails its pass test, and r1 Keep #1 is lost)
This is the round's worst regression, and I don't defend it.

**The pass test asks for lit-side skin luma 35-75 on dark players in c02, c16 and c19, the c16 shoulder at about 59, and c10 #13's features at 25 or more of contrast. My grids:**

| Character | Frame and region | Luma | Reference |
|---|---|---|---|
| YOU (the dark player) | c16, arms x 1133-1153, y 476-530 | 1-11 | |
| YOU, head | c16, x 1137-1153, y 448-472 | 0-2 | |
| #12 | c16, arms and face, x 960-1000, y 383-416 | 8-27 | |
| #42 | c19, right arm, x 512-520, y 400-430 | 8-15 | |
| #42 | c19, left arm, x 444-452, y 378-420 | 2-8 | |
| ball handler | c19, arm, x 843-870, y 484-490 | 8-22 | |
| ball handler | c19, face, x 876-891, y 454-475 | 8-13 | |
| referee, head | c15, x 1078-1132, y 86-176 | 0-2 | r1 Keep: 44 |

**Hue is lost as well as brightness:**
- c21 #12's cheek is RGB (68,4,2), luma 22.6. That is r3's red-plastic (58,3,1) almost exactly.
- c21 #53's face is luma 11.9 and her forearm (32,0,0).
- The near-plane limb is luma 4.8 (x 30-250, y 190-330).
- No skin pixel exceeds 240, but that clause is trivially met.

**Effect:** dark-skinned players lose body facing and facial features at gameplay size (c16 YOU and c19 #42 read as silhouettes). This drags Lighting below the 7 anchor's "no artifacts" and costs Art and Readability.

**Fix:**
- Keep the r2 assignments and re-apply the r1 shading on top of them: lit-side luma 35-75, a visible terminator, and hue (R-G) under about 40 on dark tones.
- Validate on c16 YOU, c19 #42, the c15 referee and c21 #12.

### 4.2 Mobile card margin: Blocker 1, mobile half, fails
- About 6.5 css px in mobile c06 and about 5 css px in make-wide f00-f01, against the 16 css px required.
- It is better than r1's contact, but it fails.

### 4.3 c08: the ball sits over the net
- In my 5x crop (x 570-670, y 320-420), the ball occludes both the rim's front band and the net strands.
- In c18 the net correctly draws over the ball. In c08 it does not, so the ball reads as just in front of the rim, not in the net.
- Combined with §4.4, Blocker 3 stays **Partly**.

### 4.4 c17 is unchanged: Blocker 3 fails here
- **Desktop:** the ball (x 660-704, y 185-230, diameter about 45) is about 150 px above the raised hands (y about 365-375), more than three diameters.
- **Shoes:** they are cut by the letterbox at y 745.
- **Mobile:** c17 matches r1 in pose and ball height (mobile-06 pair, centre).

### 4.5 Mobile Select: Blocker 2, mobile half, fails
- Mobile c13 is pixel-identical to r1 (mobile-05 pair, left).
- The Fountain Lake card ghosts behind "More options below" (pair y about 487).
- The Cutter-Morning Star and Jessieville cards render below BACK / TIP OFF (pair y about 560-575).

### 4.6 The replays still invert the hierarchy on the near side
- In c08, the left wall upper area (x 120-300, y 120-260) is luma 147, against floor wood 107 (x 960-1150, y 620-720).
- The far wall is now a dark void rather than a dressed wall: no block, banners, scoreboard or fascia.

### 4.7 Weaker live hierarchy, unchanged grade and gamut
- **Hierarchy:** desktop `floorCrowd` is 2.52-3.13 in c02-c19, against 3.41-4.16 in r1. `floorY` is unchanged (about 0.20-0.23); `crowdY` rose (0.036-0.058). The crowd brightened; the floor did not dim.
- **Grade:** the c02 play area is still (126,83,37), against r1's (125,82,36).
- **Gamut:** wall blue is still clipped (c18 orange wall (129,52,0); desktop c10 band (96,48,9)). Fix 3's pass (blue above 10 in c12 and c18) fails on c18.

### 4.8 Venue amount and dressing
- **Fix 1 pass fails:** wall above the crowd is about 5% of the c02 and c19 frame height, against 15%.
- **Banners:** none on any live desktop wall. The mobile banners still read "BOYS STATE CHAMPS" in a girls' game (mobile c06 y 140-200).
- **Benches and Hot Streak:** the benches are empty (c15). Hot Streak's backdrop is unchanged (desktop-06 lower pair).

### 4.9 Unchanged motion and readability debts
- The net is rigid (net-close f04-f11).
- The jumper is the same small release (jumper f04-f17).
- The ball outline is weaker in flight (c04 3.73, c05 3.38; jumper minimum 1.95, against r1's 4.78 / 3.74 / 2.67).
- The framing probes are identical to r1 (mobile c11 50.6 px, c09 57.6 px, c16 41.5%; drive `emptyFgMean` 25.7).

### 4.10 Status of r1's four blockers, by their own pass tests

| Blocker | Status | Basis |
|---|---|---|
| 1. Card and "+3" | **Partly** | Desktop passes (§2.1); mobile is about 6.5 css px against 16 (§4.2). |
| 2. Menu footers | **Partly** | c20 passes on both viewports; mobile c13 fails (§4.5). |
| 3. Replay beats | **Partly** | c08: two of three clauses pass, and the ball over the net is ambiguous. c17 fails (§4.4). |
| 4. Appearance mix | **Open** | The assignments are restored (§2.4), but the lit-side 35-75 clause and the "Blocker 4 values still pass" clause both fail. The dark-skin crush returned (§4.1), so this is now a regression against r1 Keep #1. |
