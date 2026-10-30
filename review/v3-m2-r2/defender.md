# v3-m2-r2: Defender brief

**Inputs:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, and `review/v3-m2-r1.md` (the binding verdict, 6.5)
- All 7 contact sheets
- All 19 before/after pairs (11 desktop, 8 mobile)
- Benchmark sheet 04
- All 10 burst strips
- `probe/probe.json`
- Full-size stills: desktop c02, c06, c07, c08, c09, c13, c16, c21; mobile c08, c13, c02 (thumb deck)

**My own measurements** (crops and pixel statistics from the packet PNGs):
- **c18 net strands:** a 3x zoom of desktop c18 (x 500-820, y 140-420), plus the mean colour of net-strand pixels inside the ball versus outside it.
- **Mobile c18:** a 2x zoom (x 150-650, y 250-800).
- **Make-wide ball on the floor:** a 4.5x zoom of each ball in desktop make-wide f03-f06.
- **Open-play grade:** mean luma and saturation of every desktop open-play frame.
- **Red sliver:** a 3x nearest-neighbour zoom of mobile c02 (x 380-600, y 780-980) and c19 (x 220-420, y 790-960), plus a count of red pixels in the r1 sliver boxes.
- **Jumper:** a 3x strip of the shooter in desktop jumper f01-f15.
- **Mobile labels:** glyph heights of the mobile thumb-deck labels in c02.

The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | r1 final | **Defender** | Justification and evidence |
|---|---|---|---|
| Art: players, court, venue | 6 | **6** | **Credit:** the c21 jersey shard is gone. The "53" decal now sits on the black jersey (c21 x 440-520, y 510-640; compare before-after `desktop-11`). The crowds now wear school palettes (c02, c03, c10). The state-finals ribbon is built (c09 y 230-265). **Against:** the athletes are still mannequins, with dot eyes and no nose or mouth (c21 x 420-460 and 670-730, y 140-240), paddle hands (c21 x 830-980, y 500-590) and a huge near-plane limb (c21 x 0-330, y 380-630). The 7 anchor is still missed. |
| Lighting & materials | 6.5 | **7** | **All four r1 render artifacts close against their own pass tests** (section 2.1). **New:** a key/rim light on players (c21 left player's back and arm edges at x 540-700, y 120-620, and #12's forearm at x 940-980, y 400-580; c09 #15 at x 300-430, y 510-690). A lit, emissive ribbon (c09 y 230-265). The hierarchy holds (`floorCrowd` 2.77-3.53 in desktop live stills). **Against:** the ball-dim halo now shows on a bare wall (mobile c08 x 310-490, y 450-620). The rim light is over-strong on dark figures in shadow (c02 x 955-1005, y 260-370; c07 x 375-455, y 365-500). There is a blown glint on the shooter's hand (c08 x 850-880, y 530-560). |
| Animation & game feel | 6.5 | **6.5** | **Credit:** the card now has a real lifecycle: it slides in over f00-f02, holds still through f02-f09, fades over f10-f11, and is gone at f12 (desktop make-wide). The rim flash and clean net pass are kept (net-close f00-f03 cream, red from f04; the ball drops cleanly f05-f11). The jumper's follow-through arm is held from release onward (my jumper strip f08-f15). **Against:** the jumper is still a small silhouette on the crowd line (jumper f04-f17), so no knee load can be seen. Some of the c07 crowd still raises arms on an airball (c07 x 200-230, y 225-260; x 1130-1150, y 230-260). |
| UI / HUD | 6.5 | **7** | **The 7 anchor's placement test is now met in every make frame shown:** c06, c16, desktop make-wide f00-f11, mobile c06 and mobile make-wide (section 2.1, Blocker 1). Other fixes: the replay frames its subject (c08, c17); the dimmed live bug is gone from the champion card (before-after `desktop-07` c14); and the "+3" stays above the board. **Against:** desktop Select still overflows (c13 y 690-800). The c16 card subtitle collides with the scorer's-table lettering (c16 x 305-520, y 283-325). |
| Typography | 6 | **6** | **Unchanged in kind:** one display face and one text face with a scale (c13, c20, c22). **Mobile labels are at the floor, not clearly above it:** "JUMP" is about 17 device px tall in mobile c02 (y 1503-1519), which is about 8.5 css px cap height and roughly a 12 px font. **Also against:** the c16 subtitle collision, and the tiny c20 pills. |
| Readability | 7 | **7** | **Credit:** the drive handler is now in band in every frame (`handlerInBandPct` 100, was 40; drive f01-f15). Desktop players are 141-207 px, and the teams separate by jersey value (c02, c09, c16). The ball still reads in flight (`ballContrast` c04 4.69; jumper mean 4.12, minimum 2.50; mobile c04 5.06). **Against:** c05 `ballContrast` fell from 5.02 to 2.91, the price of removing the floor smudge (the outline still reads at c05). The paint still clumps (c02 x 160-420, y 400-720). |
| Mobile portrait | 7 | **7** | **Credit:** the replay frames the shooter, ball and basket (mobile c08, c17). The red sliver is gone (0 red pixels in the r1 boxes; my zoom). The mobile Select now shows TIP OFF in view (mobile c13 x 530-735, y 1545-1650). The card clears the YOU player (before-after `mobile-02` c06). `playerPx` is 77-88 in c02-c07, c10 and c19. **Against:** the mobile drive is still a tiny shooter at the far end (drive f06-f15, `emptyFgMean` 27.7, better than 36.8 but above the 20 target). c11 is 50.6 px, c16 has `emptyFgPct` 41.5, and c09 is 57.6 px. The replay halo smudge (mobile c08), and large dead bands around the replay letterbox (mobile c08 y 0-138 and y 1285-1688). |
| Authenticity of setting | 6.5 | **6.5** | **Credit:** the c09 fascia ribbon reads "HOT SPRINGS, ARKANSAS · STATE FINALS" (y 230-265). Crowd tints now follow the schools: Hot Springs gold and maroon (c02, versus orange in before-after `desktop-01`), Lakeside blue and gold with Fountain Lake green (c03 and c04, versus orange in r1), and Jessieville purple (c10, before-after `desktop-05`). **Against:** no team on the bench (c02 x 505-840, y 295-355: street-clothes sprites between empty chairs; c15); no desktop title banners; the Hot Streak crowd still stands on a ledge (c12). This is the top of the 6.5 band. |
| **Overall** | **6.5** | **6.6** | (6 + 7 + 6.5 + 7 + 6 + 7 + 7 + 6.5) / 8 = 53 / 8 = 6.625, which rounds to 6.6 |

---

## 2. Strengths, with evidence

### 2.1 Status of every r1 blocker, against its own pass test

**Blocker 1: callouts over the ball and the controlled player. Mostly closed (placement passes; the lifecycle falls short of 0.3 s).**
- **c06:**
  - The card is at x 280-660, y 155-305, over the crowd.
  - The ball in the net is at x 920-970, y 495-540, and the rim at x 910-1010, y 450-545.
  - The nearest player head is at y 430 (x 60-330).
  - No overlap. Before-after `desktop-03` shows r1's card on the floor, cutting the ball.
- **c16:**
  - The card is at x 195-560, y 160-308.
  - The only figure near it, the referee at x 670-750, y 235-340, is clear.
  - Every player is below y 320.
- **Desktop make-wide:**
  - The card sits in the crowd band in f00-f11, and every player and the ball are on the floor below it.
  - **Its position is fixed after the entrance.** The card's left edge, relative to its cell, reads 237 (f00), 133 (f01), then 84-86 in f02-f09. That is a 2-frame slide-in (10 ticks, about 0.17 s), not a hop. The r1 complaint was a jump at f06 to f07 and f09 to f10, mid-life; both are gone.
- **Mobile c06 and mobile make-wide:**
  - The card sits in the lower right, away from the YOU player (before-after `mobile-02`).
  - It slides in over f00-f02, holds through f02-f09, fades over f10-f11, and is gone at f12.
- **Lifecycle (conceded):** c16 still shows the card at roughly half opacity while the opponent brings the ball up. In make-wide it is gone by f12, which meets the ranked fix's "1.0 s at most" ceiling but not the blocker's 0.3 s test.

**Blocker 2: residual and new render artifacts. All four sub-items closed against their tests, with one new halo instance (conceded in section 4).**
- **(a) Pale disc over the ball in the net: closed.**
  - In my 3x zoom of c18, the strands over the ball are the same beige as the rest of the net.
  - **Measured:** the mean colour of net-strand pixels (low saturation, L > 0.55) inside the ball circle (centre 633,307, r 45) is (178,147,122). Outside the ball it is (187,177,168) on the left wall of the net, (181,160,144) on the right and (177,153,133) below.
  - So the strands over the ball are not brighter than the rest of the net; they are slightly warmer, from ball colour at the anti-aliased edges. There is no additive disc.
  - Mobile c18 (my 2x zoom) is the same. Before-after `desktop-09` and `mobile-06` (c18) show r1's pale disc next to the clean r2 net.
- **(b) Dark halo on the floor around the ball: closed on the floor.** My 4.5x zooms of make-wide f03, f04, f05 and f06 show an outlined ball on clean wood grain, with no darkening around it.
- **(c) Red sliver over the mobile court: closed.**
  - There are 0 pixels with r > 150, g < 80, b < 80 in mobile c02 x 470-500, y 830-920 and in mobile c19 x 300-330, y 850-890.
  - My 3x nearest-neighbour zooms show only floor and lines.
- **(d) Grade pop: closed.**
  - Frame-to-frame mean luma across desktop open-play f00-f15 changes by at most 0.9% (f12 to f13), and saturation by at most 0.3%. The test allows 3%.
  - The total drift over 16 frames is 82.6 to 79.6 luma, a smooth slide with no step.
  - The mobile open-play strip shows no visible step either.

**Blocker 3: the replay frames neither the shooter nor the ball. Closed.**
- **c08:** shooter #2 is at x 640-930, y 450-745, the ball at x 630-668, y 205-242, and the basket at x 530-610, y 340-500. The top letterbox ends at about y 56, so the ball has about 150 px of margin.
- **c17, mobile c08 and mobile c17** frame the same three.
- Before-after `desktop-04`, `desktop-09` and `mobile-03`/`-06` show r1's empty basket and clipped ball against r2's framed subject.

**Blocker 4: Select overflows. Partly closed.**
- **Mobile:** the redesign puts a persistent BACK / TIP OFF footer in view (mobile c13 y 1545-1650). r1 had no start action in view (before-after `mobile-05`).
- **Desktop and the rest of mobile:** still failing (conceded in section 4).

### 2.2 Ranked fixes from r1, credited where the packet shows them closed

| r1 fix | Status | Evidence |
|---|---|---|
| 1. Clear the artifacts | **Closed**, except the mobile replay halo | Section 2.1, Blocker 2 |
| 2. Callout placement and lifecycle | **Mostly closed** | Section 2.1, Blocker 1 |
| 3. Replay camera | **Closed** for framing. **Open** for beats: c08 and c17 are nearly the same beat (ball rising after release in both). | c08 vs c17 |
| 4. Characters and one art style | **Partly** | **Done:** the shard is gone (c21); the crowds use school tints (c02, c03, c10). **Open:** the models and posterising. |
| 5. Camera in motion | **Partly** | **Desktop drive:** `handlerInBandPct` 100, so the ≥ 90 test passes. **Jumper:** 88. **Mobile drive:** `emptyFgMean` 27.7, so the ≤ 20 test fails. |
| 6. Make-specific crowd and the shot animation | **Partly** | **Crowd:** c07's sideline crowd is mostly seated and clapping on the airball, with a few arms up. **Jumper:** the follow-through is held (jumper f08-f15); no knee load can be read at this size. |
| 7. Front end and small text | **Partly** | **Done:** the champion bug is gone (c14); the title no longer shows the cropped "LAKESIDE" wordmark (before-after `desktop-01`, `mobile-01`). **Open:** Select; the labels are at about 12 px. |
| 8. Lighting beyond hierarchy | **Partly** | **Done:** a player rim/key light (c21, c09, c06 left group x 40-170, y 430-710); an emissive arena ribbon (c09). The c19 floor reads hotter at centre than at the edges in before-after `desktop-10`, which may be a light pool; I don't claim more than that. **Open:** distinct specular for skin and cloth. |
| 9. Enclosure and place identity | **Partly** | **Done:** the ribbon (c09); the crowd palettes (c02, c03, c10). **Open:** benches, desktop title banners, Hot Streak bleachers. |
| 10. Mobile anti-aliasing and crowd alpha edges | **Open** | Mobile c18 zoom: a dotted pale fringe on the crowd cut-outs around the heads, right of the net. |

### 2.3 Kept from r1 (no regressions)
- **Desktop framing:** `emptyFgPct` 6.2-13.2 in c02, c05, c06, c07, c09, c10, c11, c16 and c19.
- **Mobile player size:** 77-88 px in c02-c07.
- **The "+3":** above the board on both viewports (c06 x 935-995, y 190-245; mobile make-wide f00-f11).
- **Menus:** the navy-and-gold front end (c01, c13, c14, c20, c22).
- **Enclosure:** the pads and the built replay wall (c08), the STATE FINALS table (c09), and per-school floors and crests (c10, c11).

---

## 3. Pre-emptive rebuttals

1. **"The pale ghost disc is still over the ball in c18."** Not supported. The net-strand pixels over the ball average (178,147,122), no brighter than the strands beside it ((177-187), (153-177), (133-168)). The bright cream ring is the rim flash on the rim (c18 x 520-760, y 175-225), which r1's Keep list (item 7) told the developer to keep. It is not a disc over the ball.
2. **"The slam card still jumps."** Not supported. The card's left edge holds at 84-86 px (cell-relative) from f02 through f09 in desktop make-wide. The only motion is the f00-f02 slide-in, an entrance tween in the Playgrounds 2 / 2K style that the 9 anchor asks for ("with motion"). It crosses no player or ball during the tween: it stays in the crowd band.
3. **"The card still covers players or the ball."** Not supported for c06, c16 or desktop make-wide (coordinates in section 2.1). In mobile make-wide f06-f08 the card passes within roughly 10-20 strip px of the players at its lower and upper edges. I can't prove a clean miss at strip resolution, and the Arbiter should zoom there. But the r1 failure (the card squarely over the YOU player) is gone.
4. **"The grade still pops in open play."** Not supported. The largest frame-to-frame change is 0.9% luma and 0.3% saturation (my measurement over f00-f15).
5. **"The replay still shows an empty basket."** Not supported in either viewport: c08, c17, mobile c08 and mobile c17 all show #2, the ball and the rim.
6. **"Mobile Select still has no start action."** Not supported. TIP OFF is at mobile c13 x 530-735, y 1545-1650. The Difficulty row is what is still cut (conceded).
7. **"Ghost figures glow beside the bench" (c02 x 955-1005, y 260-370; c07 x 375-455, y 365-500).** These are dark-uniformed players under the new rim light: the same cool edge term appears on the c21 close-ups and on c09 #15. That is the light r1 asked for, not a render ghost. It is too strong on figures that are otherwise in shadow, as conceded below.
8. **"Ball readability regressed: c05 `ballContrast` 5.02 → 2.91."** Partly true, but in context:
   - r1 itself ruled that the halo producing 5.02 also produced the floor smudge, and ordered it restricted.
   - The outlined ball still reads (c05; c04 4.69; jumper minimum 2.50, mean 4.12; mobile c04 5.06).
9. **"`handlerInBandPct` 88 in the jumper means the camera loses the shooter."** In jumper f04-f17 the shooter is always in frame, under the YOU chevron. The 12% is frames where the shooter sits high in the frame, near the crowd line. That is a composition issue (conceded), not a lost handler.
10. **Probes that measure the wrong thing:**
    - **`ballContrast` with a ball that isn't loose:** c18 at 1.09 (desktop) and 1.09 (mobile) measures a ball behind a net. c06 at 1.53 is the ball inside the net. make-wide at mean 1.35 is a dead ball rolling on the floor after a make. None of these is a ball in flight.
    - **`floorCrowd`:** c08, c17 and mobile c08/c17 measure replay framing. Desktop c15 at 0.65 is a close-up whose "floor" samples land on the dark apron.
    - **`playerPx` and `emptyFgPct` under menus:** c14 (107 px, 25.2%) and c22 measure players behind modal menus.
    - **Mobile c06 `emptyFgPct` 27.9:** this counts floor that the card now deliberately occupies.

---

## 4. Concessions

1. **The athletes are unchanged mannequins.** c21 has dot eyes with no nose or mouth (x 420-460 and 670-730, y 140-240), paddle hands (x 830-980, y 500-590), tube arms, and a giant blurred near-plane limb (x 0-330, y 380-630). Benchmark sheet 04 (Playgrounds 2) shows the gap plainly. This is the largest thing holding Art at 6.
2. **The desktop Select still overflows, and now looks broken.** The Quarters row is cut by the new footer (c13 y 690-720). The Shot clock and Difficulty rows render behind and below the footer, outside the panel (c13 x 365-655, y 735-800). On mobile the Difficulty row is cut by the footer (mobile c13 y 1475-1530), and the team cards are cut at the right edge (x 730) with no scroll affordance. Blocker 4's pass test fails on desktop.
3. **The ball-dim halo now smudges the replay wall.** Mobile c08 shows a dark radial blob about 180 px across on a flat wall (x 310-490, y 450-620). It is the same mechanism r1 ruled against on the floor, now on a non-crowd surface.
4. **The rim light is overdone in places.** It gives glowing outlines on players standing in shadow (c02 x 955-1005, y 260-370; c07 x 375-455, y 365-500; c06 x 40-170, y 430-710), and a blown white glint on #2's hand in the replay (c08 x 850-880, y 530-560). It needs clamping by exposure or a shadow mask.
5. **The card lifecycle misses the 0.3 s test.** c16 shows it still on screen at about half opacity during the opponent's push. The c16 subtitle "HOT SPRINGS" also overprints the scorer's-table lettering (x 305-520, y 283-325).
6. **Mobile camera exceptions persist.**
   - The drive shooter is tiny at the far end over bare floor (mobile drive f06-f15, `emptyFgMean` 27.7).
   - c11 is 50.6 px (worse than r1's 53.5), c16 has `emptyFgPct` 41.5 (worse than 37), and c09 is 57.6 px with `emptyFgPct` 31.3.
   - The mobile replay uses only y 138-1205 of the 1688-px screen.
7. **The desktop jumper is still a small, stiff silhouette on the crowd line** (jumper f04-f17). No load or landing compression can be read. The drive's shot (drive f06-f15) has the same composition, with `emptyFgMean` 25.7.
8. **Replay beats:** c17 ("early") and c08 ("late") are nearly the same moment, so r1 fix 3's "release, then the ball through the net" is not shown.
9. **Enclosure gaps:**
   - No team on either bench (c02, c15).
   - No desktop title banners (c02, c06, c09, c10, c11, c16).
   - The Hot Streak crowd still stands on a bare ledge (c12).
   - The photographic crowd is recoloured but not posterised. Its cut-outs show pale dotted fringes (mobile c18 zoom, the heads right of the net).
   - The new foreground crowd heads on the title screen are soft, upscaled cut-outs (c01 bottom left, x 90-260 at sheet scale).
10. **Typography is not improved.** The mobile deck labels sit at about 12 px (JUMP glyph about 17 device px), and the c20 pills are still tiny.
