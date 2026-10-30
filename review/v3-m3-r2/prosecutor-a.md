# v3-m3-r2: Prosecutor A (art, lighting, setting)

Round: v3-m3-r2 (milestone 3, round 2: baked-lighting home gyms plus the state-finals arena). Before/after pairs compare with v3-m3-r1.

**What I read:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m3-r1.md`
- All 7 contact sheets
- **Before/after:** desktop `-01` to `-11`; mobile `-01` to `-06`
- **Full-size stills:** desktop c02, c08, c09, c14, c15, c17, c21
- **Bursts:** desktop make-wide, net-close and jumper; mobile make-wide. I left the other six strips to Prosecutor B's lens and make no motion claims from them.
- `benchmarks-01`, `benchmarks-03` and `SOURCES.md`
- `probe/probe.json` (all stills and bursts)

**My own measurements:** Rec.601 luma on sRGB 0-255, taken from the full-size stills. I quote the box median and give its RGB, so floor pixels inside a box don't inflate skin values. I also took 2-5x nearest-neighbour crops: c02 top-left, the c02 cluster, the c09 #15 and #4 pair, c10 #13, the c16 YOU player, the c19 #42 pair, the c08 rim, the c14 ribbon, the mobile c06 shoe and card, and the mobile c22 banners.

The webm and sound are not reviewed.

---

## Headline

The venue finally starts to appear, and the people in it have gone dark again:
- **What improved:** block walls with mortar lines and a strip of fascia now show above the crowd. The title has hanging banners. The r1 appearance assignments look restored: the dark-skinned LHHS players are back in c19 and c02.
- **What regressed:** the r1 dark-skin shading fix is gone. In c09, c10, c15, c16, c19 and c02, dark-skinned players and the referee render as black cutouts again:
  - head medians of 0.3 luma
  - c10 #13's face at 3.3 (r1: 40-52)
  - the c15 referee at 4.2 (r1: 44)
- **c21 is back to red plastic:** the #12 face is (68,1,0), against r3's (58,3,1).
- **The hierarchy weakened:** desktop `floorCrowd` is now 2.52-3.13, against 3.41-4.16 in r1.
- **The state-finals arena** is the round's other deliverable, and it is darker than the home gyms, structurally the same set, and has a black void where the roof should be.

On my lens, this is a net step back.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| **Art: players, court, venue** | **6** (r1 6.5) | **Venue up:** painted block with mortar lines in c02 (x 0-1280, y 55-90), on the c08/c17 left wall (x 0-550, y 56-470), the c18 upper wall (before/after `desktop-09`, lower pair) and the c01 title wall. The title has 1945/2000 banners. **Players down:** dark-skinned faces are black discs with no features. The c09 #15 head is (1,0,0), luma 0.3 (x 355-368, y 517-535; my 3x crop shows a pure silhouette). The c16 YOU head is 0.3 (x 1138-1152, y 448-468), and c10 #13's face has a median of 3.3 (x 769-781, y 413-427). The c21 near-plane limb (x 40-250, y 200-380) went from a skin-coloured sausage to a black one (median 2.8). The "53" decal still smears down the torso side (c21 x 440-515, y 500-640). The chairs are still empty and identical (c15). The photographic crowd still sits beside capsule mannequins (c15, c21). |
| **Lighting & materials** | **6** (r1 7) | **Fails the 7 anchor on artifacts and hierarchy:** <br>- black faces are back (above); the c15 referee is 4.2, against 44 in r1 <br>- desktop `floorCrowd` fell to c02 3.13, c03 2.82, c06 2.52, c10 2.61, c16 2.58, c19 2.77 (r1: 3.41-4.16) <br>- c15's crowd outshines its floor (`floorCrowd` 0.61) <br><br>**The replays:** <br>- the hierarchy is still inverted: the c08 wall is 144 (x 100-500, y 100-260) against a floor of 92 (x 1000-1250, y 620-700), and the probe gives 0.98 for c08 and c17 <br>- the far wall went from a brown plane (r1 84) to a near-black void: 21 (c08 x 600-1250, y 80-300; c17 the same) <br><br>**The baked GI:** <br>- the only visible bake effect is one centre-weighted falloff: floor medians run 139 at the centre to 96-100 at the frame edges, with the same profile in c11 and c12 under different cameras, so it reads as a vignette, not as pools <br>- no bloom: `clippedPct` is 0 in every still, and live-play maxima are 236-240 <br>- the walls still clip blue to 0: c02 fascia (105,38,0), c12 (99,35,0), c18 (129,53,0) |
| **Animation & game feel** | **6.5** (r1 6.5) | Unchanged in the strips I opened: <br>- the net silhouette is the same in net-close f00-f11, and only the rim flash (f00-f03) marks the make <br>- the jumper is the same small release at the crowd line (jumper f04-f17) <br>- desktop make-wide now staggers the card (f00-f03) and the "+3" (f02-f06), a small gain in payoff <br><br>Prosecutor B owns this category. |
| **UI / HUD** | **7** (r1 6.5) | **Fixed:** <br>- the desktop "+3" is delayed to f02 and offset right of the card (make-wide f02-f06) <br>- c20 shows the whole DID YOU KNOW panel, Source line included, with no cue (before/after `desktop-10`) <br><br>**Still failing:** <br>- mobile c13 still draws "Fountain" through the footer (about device y 1430) and the Cutter-/Jessieville cards below it (about device y 1650) (sheet `mobile-02`; before/after `mobile-05`) <br>- the mobile card sits about 7.5 css px under #0's shoe (below) <br>- the mobile "+3" sits on the backboard and shot clock from f02 to f13 (mobile make-wide) |
| **Typography** | **6.5** (r1 6.5) | Unchanged: the c20 "next"/"rival" pills and the c13 "game colors" chips are still under 12 px. The c14 ribbon "HOT SPRINGS, ARKANSAS" is partly hidden by crowd cards (below). |
| **Readability** | **6.5** (r1 7) | **The ball outline weakened:** `ballContrast` c04 3.73 (r1 4.78), c05 3.38 (3.74), jumper minimum 1.95 (2.67). **Body facing is lost:** crushed skin turns dark players into cutouts with no facing cue (the c16 YOU player x 1135-1160, y 440-560, and c09 #15). The paint still clumps (c02 x 155-410, y 380-720). |
| **Mobile portrait** | **7** (r1 7) | **Better:** the card no longer touches the shoe. In mobile c06 the sole's last bright row is y 979-984, and the card starts at y 998 (x 540-590): about 15 device px, or 7.5 css px. The mobile c08 referee no longer fills the foreground (before/after `mobile-03`). **Unchanged:** Select still renders behind and below the footer. Mobile c17 still releases the ball about 240 device px above the hands (before/after `mobile-06`). Framing probes are identical to r1 (c11 50.6 px, c09 57.6 px, c16 41.5% empty). |
| **Authenticity of setting** | **6.5** (r1 6.5) | **Credit:** <br>- the appearance mix is visibly restored in c19 and c02 (before/after `desktop-10` and `-01`) <br>- block walls and a fascia show above the crowd <br>- the title has banners <br><br>**Against:** <br>- the wall shows over only about 10% of the c02 and c19 frame height (y 0-85; the HUD covers its centre) and 7.5% of c16, against r1's 15% pass <br>- no desktop live frame has a banner <br>- the mobile banners still read 1932/1996/1998 "BOYS STATE CHAMPS" in a girls' game (mobile c22, my 3x crop) <br>- the state-finals arena reads as a home-gym set with a black void above it (c14) <br>- Hot Streak is unchanged (before/after `desktop-06`, lower pair) |
| **Overall** | **6.5** | (6 + 6 + 6.5 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 52 / 8 = **6.5**. r1 was 6.7. Every milestone target is missed: Lighting 6 against 7.5, Art 6 against 7.2, Authenticity 6.5 against 7.2, overall 6.5 against 7.4. |

---

## 2. Defects, ranked by how often a player sees them

### D1. Dark skin is crushed to black again (every live frame; about half the roster)
- **Evidence:** head and face medians:
  - c09 #15 0.3 (1,0,0); arm 5.7
  - c16 YOU 0.3; arm 7.0
  - c10 #13 face 3.3 (11,0,0); shoulder 9.5
  - c02 #42 face 9.6 (32,0,0); #1 8.4
  - c19 arms 6.7-27
  - c15 referee head 4.2 (14,0,0)
- **Tests failed:** r1 Blocker 4 requires lit-side dark skin at 35-75 in c02, c16 and c19, and c10 #13's features at 25 or more of contrast. Keep item 1 is lost.
- **c21:** both faces are saturated red. The #12 face is (68,1,0) at luma 20.9, against r3's (58,3,1). The near-plane arm is 2.8.
- **What it looks like:** the r1 shading fix reverted while the r3 assignments came back. `benchmarks-03` (2K26-1, 2K27-3) shows what dark skin should do under arena light: a key highlight, a terminator and a rim.
- **Fix:**
  - Keep the r2 per-character assignments, and put the r1 skin response back on top of them: lit-side luma 35-75 for the darkest tone, no skin pixel above 240, and hue held at R:G of about 1.4-1.8 (not 68:1).
  - If the new baked lighting drives character shading through probes or ambient terms, give characters a dynamic key plus ambient that is independent of the lightmap.
  - Add the cool rim term (0.15-0.2 of the key) that r1 fix 8 asked for.
  - Validate on c09 #15, c16 YOU, c10 #13, c15 referee, c21 #12.

### D2. The crowd still owns the frame, and it doesn't belong to the same art style (every live frame)
- **Evidence:**
  - In c02 the wall and fascia are visible only from y 0-85 (column scan x 960-1200: orange to y 55, then cream block), and the HUD covers x 360-920 of it. Photo cards fill from y 75 to 300.
  - c19 is the same (y 0-85); c16 shows y 0-60.
  - No desktop live frame has a banner.
  - Cards repeat inside one patch: the blonde "hands on cheeks" figure appears at about (82,150), (202,120) and (165,230) in c02, from my 2x crop of x 0-400, y 0-320.
  - The photographic faces (c15, c21) out-detail the capsule players they surround. Hoop Land (`benchmarks-01`, hoopland-1/2) draws crowd and players in one style.
- **Fix:**
  - Cut the bowl by 3-4 rows, or rake it lower, so that the c02/c19 framing shows at least 15% wall, with 4-6 banners on the end and side walls.
  - Desaturate the cards and drop their contrast about 20%, or posterize and outline them to match the player shading.
  - Raise the deck to 30 or more variants per school, and reject a variant repeated within 300 px.

### D3. The floor-to-crowd hierarchy has collapsed (every live frame)
- **Evidence:** desktop `floorCrowd`: c02 3.13, c03 2.82, c04 2.92, c05 2.82, c06 2.52, c07 2.64, c10 2.61, c11 2.78, c16 2.58, c19 2.77. In r1 these were 3.41-4.16 (Keep item 5). c15 is 0.61. Arena c09 floorY is 0.1395, against 0.20-0.23 in the gyms.
- **Fix:** take the crowd cards' exposure down 15-20% (target `floorCrowd` 3.5 or more), and bring the arena floor up to the gyms' floorY of about 0.21.

### D4. The state-finals arena is a dark home-gym set, not a named arena (c09, c14; every final)
- **Evidence:**
  - **Same structure as a home gym:** the c09 layout matches every gym (a ribbon at y 230-265, orange folding chairs, a scorer's table), plus a ribbon text strip.
  - **Darker than before:** the c09 floor is darker than r1. My grid of before/after `desktop-05` (top pair) gives column medians of 43-59 at the left edge and 107-123 in the centre for r2, against 67-79 and 116-132 for r1.
  - **A black void above the bowl:** in c14 the crowd ends in black. The top 60 px have a median of 5.5, and the black runs down to y 230 at the left (x 0-600, y 0-230). There is no roof, truss, lamp ring, centre-hung scoreboard or upper-bowl fascia.
  - **Crowd cards in front of the ribbon:** in c14 their legs stand in front of the ribbon, so it reads "H_T SPR_GS, ARKA_SAS" (x 935-1110, y 465-490, my 2x crop).
  - **The benchmark:** 2K27-1 and 2K27-3 (`benchmarks-03`) show a lamp ring, banners and LED ribbons.
- **Fix:**
  - Model an upper-bowl fascia and a ceiling: a truss grid with 12-20 emissive lamp cards that bloom.
  - Add a centre-hung scoreboard reading STATE FINALS and an end-wall banner line.
  - Light the court as a pool, brighter than the bowl.
  - Sort or clip the crowd cards behind the ribbon plane.

### D5. Gamut-clipped, flat fascia paint (every frame that shows a wall)
- **Evidence:** blue is 0 in c02 (105,38,0), c12 (99,35,0), c18 (129,53,0) and desktop c10 (103,44,0). The Jessieville top band (159,78,0) is yellower than Hot Springs (105,38,0), but it is still orange-gold with no blue.
- **Fix:** as r1 fix 3: every paint albedo at 8% blue or more before lighting, neutralise the global grade, and give the fascia a wainscot or a painted logo instead of a flat stripe.

### D6. No visible GI: no pools, bleed, occlusion or bloom (every frame)
- **Evidence:**
  - Floor grids for c11 and c12 give one symmetric centre bulge: 139 at the centre, 96-105 at the edges. The profile is the same with two cameras, so it is screen-space.
  - No orange bleed onto the cream block (c02 y 60-90 measures (128,110,79) beside a fascia of (136,59,0)).
  - No wall-floor occlusion.
  - `clippedPct` is 0 in all stills, with live-play maxima of 236-240.
- **Fix:** as r1 fix 2: 4-6 baked pools with 15-25% contrast that track world space, not the screen; occlusion under the bleachers and at the wall base; a thresholded bloom on the rim flash, shot clocks and exit signs.

### D7. The replays: inverted hierarchy, black far wall, black stanchion, late c17 (every highlight)
- **Evidence:**
  - **Hierarchy:** the c08 wall is 144 against a floor of 92.
  - **Far wall:** 21 (c08 x 600-1250, y 80-300).
  - **Stanchion:** 1.8, an untextured black box (c08 x 330-355, y 320-540).
  - **c17:** the ball (x 660-705, y 185-230) is about 150 px above the hands (about y 375). The shoes are cut by the letterbox at y 745. Mobile c17 is unchanged.
  - **c08 passes on the letter:** the ball centre is about (617,365), against the rim line at about y 358, with no head overlap. But the ball draws over the rim's front edge (my 5x crop of x 560-680, y 320-420), so it reads as in front of the rim, not through it.
- **Fix:** drop the wall bake about 40% so the floor wins; dress the far wall (block, banners, scoreboard); give the stanchion padded vinyl with a logo; fire c17 3-4 ticks earlier and frame it with the shoes inside; draw the front rim after the ball.

### D8. The c15 bench close-up: a black table and a black referee (close cameras)
- **Evidence:** the scorer's table face is median 1.0 (x 760-1280, y 420-680), and its "HOME" wordmark is barely legible (x 820-960, y 485-540). The referee is a silhouette (head 4.2). The crowd is brighter than the floor (`floorCrowd` 0.61). The chairs are empty and identical.
- **Fix:** light the table face (an emissive wordmark and an LED strip), apply D1, and put towels and bottles on the chairs.

### D9. Mobile setting and UI leftovers
- **Evidence:**
  - "BOYS STATE CHAMPS" 1932/1996/1998 in a girls' game (mobile c22, about y 160-230, my 3x crop), while c20 cites the girls' 1997 and 1998 titles.
  - The card margin is 7.5 css px (mobile c06).
  - Select draws behind its footer (mobile c13).
  - The "+3" sits over the backboard top from f02 to f13 (mobile make-wide).
- **Fix:** program-aware banners; a 16-24 css px card margin; an opaque footer that clips its scroll area; place the "+3" clear of the backboard.

### D10. Hot Streak is unchanged (c12)
- **Evidence:** before/after `desktop-06` (lower pair) is identical in the venue: the crowd stands on a ledge, with no bleacher and no ball racks. `floorCrowd` is 1.66.
- **Fix:** as r1 fix 9: a 3-step bleacher and two ball racks.

---

## 3. The r1 blockers, tested against their pass tests

| r1 blocker | Status | Evidence |
|---|---|---|
| **1.** Mobile card margin and the desktop "+3" | **Partly** | **Desktop passes:** the "+3" appears at f02, right of the card, and does not overlap it (make-wide f02-f06). The card is gone by f04-f05. **Mobile fails the 16 css px test:** the c06 gap is about 7.5 css px (sole y 979-984, card y 998, x 540-590). That is better than 1 px. |
| **2.** Menu footers | **Partly** | **Desktop c20 closed** (before/after `desktop-10`). **Mobile c13 open:** cards still ghost through the footer and render below it (before/after `mobile-05` is unchanged). |
| **3.** Replay beats | **Partly** | **c08 passes in both viewports:** the ball is at the rim plane, there is no head overlap, and the mobile referee is gone. The ball-over-rim draw order is the caveat. **c17 fails in both:** the ball is about 150 px (desktop) and about 240 device px (mobile) above the hands, and the desktop shoes are cut at y 745. |
| **4.** Appearance mix | **Open** (the assignment part passes; the shading part fails) | **Restored assignments:** dark LHHS players are back in c19 and c02 (before/after `desktop-10`, `-01`). The pass test has three clauses, and two fail. **"Lit-side 35-75 in c02, c16, c19" fails:** 9.6 / 0.3 / 6.7-27. **"The Blocker 4 values still pass" fails:** c10 #13's face is 3.3 and the c16 YOU head is 0.3. **"No skin pixel over 240"** passes. I can't confirm the full r3 assignment mapping without r3 frames in the packet. But c07 #12, c11 (both players), c12 #30 and c21 (both) all switched from light in r1 to dark here, so the mix has swung rather than settled. |

### The r1 "fix in this milestone" items

| r1 fix | Status | Evidence |
|---|---|---|
| **1.** The venue in frame | **Partly** | **Done:** block texture and the fascia show (c02 y 0-85). **Not done:** the wall is about 10% of frame height, against the 15% pass. There are no desktop live-frame banners, and no risers or kick plates under the crowd rows. |
| **2.** Visible GI | **Open** | D6 |
| **3.** Grade and gamut | **Open** | Wall blue is still 0 in c12 and c18. Jessieville's band (159,78,0) is yellower than Hot Springs' but not distinct gold. |
| **4.** Appearance mix | **Open** (shading) | Blocker 4 above |
| **5.** Replays and their lighting | **Partly** | The c08 beat is fixed. The far wall is worse (84 to 21), the hierarchy is still inverted, and c17 is unchanged. |
| **6.** Mobile card and "+3" | **Partly** | As Blocker 1 |
| **7.** Menu footers | **Partly** | As Blocker 2 |
| **8.** Materials | **Partly** | **Done:** block restored on the c18 upper wall and the replay wall. **Not done:** the stanchions are still black boxes (c08 1.8), the glass has no Fresnel (c18), skin and cloth share one response (c21), and there is no rim term. |
| **9.** Venue dressing, small items | **Open** | Hot Streak is unchanged; the chairs are empty (c15); crowd repeats (D2). |

---

## 4. Regressions since r1

1. **Dark skin crushed** in every live frame, and the c15 referee went from 44 to 4.2 (D1). This reverses r1 Keep item 1 and reopens r3's Blocker 4. It should be a blocker.
2. **c21 skin is red plastic again:** (68,1,0) against r3's (58,3,1). The near-plane limb is black.
3. **The floor-to-crowd hierarchy** fell from 3.41-4.16 to 2.52-3.13 (Keep item 5).
4. **The ball outline weakened:** c04 4.78 to 3.73, c05 3.74 to 3.38, jumper minimum 2.67 to 1.95 (Keep item 6).
5. **The replay far wall** went from a brown plane (84) to a near-black void (21) (c08, c17).
6. **The c09 arena floor got darker,** with a heavier left falloff (before/after `desktop-05`: left columns 43-59, against 67-79).

---

## Probe notes

- **Replay `floorCrowd`** (0.98) is valid here: it agrees with my wall and floor boxes.
- **c08/c17 `ballPx`** is 29.4 and 29.2, but the rendered c17 ball is about 45 px across, so it still reads simulation state (as r1 found).
- **c06/c07 `ballContrast`** (1.57 and 1.23) is luma-only on wood, and the ball's black outline is visible in both, so I don't score it down.
- **Every `clippedPct` is 0.** That settles the bloom question: there is none.
