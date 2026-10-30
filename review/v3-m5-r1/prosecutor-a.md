# v3-m5-r1: Prosecutor A (art, lighting, setting)

Round: v3-m5-r1, milestone 5, round 1 (animation). **Milestone 5 targets:** Animation 7.5 or better, overall 8.0 or better.
Previous binding verdict: `review/v3-m4-r2.md` (overall 6.6).

**Inputs I opened:**
- Sheets: desktop-01 to -04, mobile-01 to -03
- Before/after: desktop-01 to -11 (the -01 to -05 pairs on a second pass)
- Full stills (desktop): c02, c06, c08, c09, c10, c14, c15, c16, c17, c18, c21. Mobile c06 at full size.
- Bursts: desktop jumper-close, drive-close, dunk, dunk-close, net-close, open-play-close; mobile make-wide, mobile dunk
- Benchmarks: sheets -01, -02, -04, and `SOURCES.md`
- `probe/probe.json`

**My own measurements** are Rec.601 luma, sRGB 0-255, box medians on full-size still pixels, plus crops at 2-8x. The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **6.5** | **Up:** the five toe ridges are gone. c15 shoes are now a smooth toe box with a continuous white midsole (my crop x 760-1000, y 620-760). The c21 near-plane hand is gone (`desktop-11`).<br>**New regressions:**<br>- armhole piping now flares off the shoulders as loose "wings" on every player I cropped: c02 #53 (x 727-737, y 430-437 and x 770-780, y 433-445), c06 #12 (x 137-147 and 200-205, y 505-515), c10 #13 (x 748-760 and 795-805, y 420-435)<br>- c21 no longer shows a single face; it is two backs of heads, with a yellow inner lining and a pink backface in #53's armhole (x 740-840, y 340-450)<br>- c14 sits on giant pixelated fan cards over a navy void<br>**Unchanged:** #3's stovepipe hair and #21's bucket hair (c02, c19), #14's sphere bun (c16 x 1190-1220, y 500-525), the off-shoulder officials, empty chairs. |
| Lighting & materials | **6.5** | **Up, slightly:** c02 `floorCrowd` 3.60 (r2 3.58) and c16 2.97 (2.95).<br>**Against:**<br>- The new replay depth of field and motion blur smear the subject itself: in c17 #2's jersey edge and number are doubled (x 830-870, y 440-600), and the EXIT sign ghosts (x 395-420, y 455-470).<br>- c08 adds glow halos: an orange rim around the referee's hand (x 255-310, y 590-640) and dark auras behind the fan cards (x 1080-1280, y 440-600).<br>- The c15 referee is still terracotta: face (122,51,4) and (122,48,0), B/R 0.03 and 0.00.<br>- The c08 far wall is still a void: (29,16,3), luma 18.4.<br>- `clippedPct` is 0 in every still, so there are no pools of light and no bloom.<br>- c14 `voidPct` is 36.8. |
| Animation & game feel | **7** | **Up a full step in body motion:**<br>- The dribble reaches the floor (drive-close f02-f04; open-play-close f03-f04).<br>- The jumper has a knee load (jumper-close f02-f07), a release (f08) and a held follow-through (f09-f17).<br>- The dunk has a gather and a hang (dunk-close f05-f09).<br>**Held from 7.5:**<br>- The net is still rigid. Its silhouette is the same tapered tube f00-f11 while the ball passes through (net-close, my strip).<br>- The dunk ball leaves the rim and drops in from above at f12-f13 (dunk, crop x 220-420, y 60-190), after the dunker has swung under the basket at f10-f11.<br>- The c18 referee holds one splayed-finger pose for all 12 net-close frames.<br>- The defender's arm sits inside #12's chest (open-play-close f04-f08). |
| UI / HUD | **7** | Unchanged in design.<br>**Up:** the mobile c06 card margin is now about 22 device px (shoe ends at y 975, x 540; card top at y 998), up from 12 but short of 32.<br>**Still open:** the "+3" sits on the backboard f02-f13 (mobile make-wide), and the Select footer leak ("Cutter-" and "Jessieville" under BACK/TIP OFF, mobile c13). |
| Typography | **6.5** | Unchanged: the c13 "game colors" chips and c20 pills are under 12 px (`desktop-07`, `desktop-10`). |
| Readability | **6.5** | **Up:** `ballContrast` c04 4.47 (r2 4.40), c05 4.29 (4.10), jumper minimum 2.44 (2.14).<br>**New:** the dribble layer parks the ball behind the handler's far hip, with the dribbling hand at the chest:<br>- c02 #53: only a sliver of the ball shows (x 765-772, y 470-495)<br>- c10 #13: the same (x 785-795, y 455-480)<br>- `desktop-01` lower pair: the c02 ball was clearly visible in BEFORE<br>The c16 ball merges with a blonde hair cap (x 520-560, y 410-445). The c19 forearm stack is unchanged. |
| Mobile portrait | **7** | `playerPx` is 83.2-87.5 in c02-c04, and the separate thumb deck holds.<br>**Against:**<br>- The mobile dunk keeps the dunker as a roughly 20 px speck at the far rim (mobile dunk f08-f13).<br>- Mobile c21 is the back of #53 filling the frame.<br>- The card margin is 22 device px against 32, and the "+3" sits on the backboard.<br>- c11 `playerPx` is 50.6 and c16 `emptyFgPct` is 41.5. |
| Authenticity of setting | **6.5** | **Unchanged:**<br>- The officials wear knee shorts over tights with a bare-shoulder shirt (c15 crop x 800-1010, y 80-320; c18 crop x 320-570, y 390-770).<br>- Photographic fans stand behind the toon athletes, and the same fan card repeats (c18: the black-hoodie boy with hands on head at x 350-470, y 280-420 and again at x 750-870, y 340-500).<br>- Benches are empty (c02, c06, c15, c21).<br>- The c09 `floorY` is still 0.138.<br>- BOYS STATE CHAMPS banners hang in a girls' game (mobile c06, x 0-260, y 135-205).<br>**New:** the c14 state-title moment no longer shows the arena; it shows two blown-up pixel faces (`desktop-07` lower pair). |
| **Overall** | **6.8** | (6.5 + 6.5 + 7 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 54 / 8 = 6.75. Against r2's 6.625 that is +0.125. **Both milestone-5 targets are missed:** Animation 7 against 7.5, and overall 6.8 against 8.0. |

---

## 2. Defects, ranked by how often a player sees them

### 1. Armhole piping flares off the shoulders (regression of r2 Keep 2, seen in every live frame)
- **Evidence:**
  - c02 #53 at 8x (x 720-800, y 415-455): the gold piping leaves the torso and sticks out as a free strip past the arm silhouette on both sides (x 727-737, y 430-437 and x 770-780, y 433-445).
  - c06 #12 at 6x (x 130-220, y 480-560): black-and-white trim "horns" stand off both shoulders (x 137-147 and x 200-205, y 505-515).
  - c10 #13 at 4x (x 730-820, y 370-560): white piping wings at x 748-760, y 420-430 and x 795-805, y 425-435.
  - The open-play-close #12 shows the same gold flaps at the shoulders f00-f07.
  - c21: black and white trim shards sit between #53's arm and #12's torso (x 880-960, y 260-400, my 3x crop).
- **Why it matters:** r2 closed Blocker 3 and put "every armhole edge stays a continuous loop on the torso" in Keep 2, and said it would reopen if a later packet showed a tear. With the new arm poses the edge no longer follows the deltoid. This is the most-seen art artifact in the build.
- **Fix:**
  - Skin the piping strip to the same bone weights as the torso vertices it sits on (chest and spine, not the upper arm), or bake it into the jersey texture as a painted edge instead of a separate strip mesh.
  - Test it against the mocap clip extremes: dribble arm at the chest, jumper set point, dunk reach.

### 2. Replay post-processing smears the subject and adds halos (new)
- **Evidence:**
  - c17 full still: the whole frame is soft, including the focus subject #2. The jersey's right edge and the "2" are doubled (my crop x 600-900, y 330-750: a double edge at x 830-870, y 440-600).
  - The EXIT sign smears into a streak (x 395-420, y 455-470), and the banner (x 285-345, y 55-245) is unreadable.
  - The ball carries an orange glow ring (x 665-725, y 195-260).
  - c08 at 5x (x 200-320, y 510-640): an orange halo around the referee's hand and forearm, and a dark aura along his back against the wall.
  - c08 crowd at 4x (x 1080-1280, y 440-600): every fan card has a dark fringe aura.
  - `desktop-09` upper pair: BEFORE c17 is sharp. AFTER is uniformly blurred, and the shooter's arms have dropped, so the replay now shows neither a clear subject nor the follow-through.
- **Fix:**
  - Focus the depth of field on the replay subject's chest distance, with an in-focus band of at least ±1.5 m.
  - Mask motion blur by per-object velocity, not camera-only, so a near-static subject stays sharp. Cap the blur at 8 px at 1280 wide.
  - Premultiply the crowd-card alpha before the depth of field and bloom, which removes the dark auras.
  - Clamp the bloom threshold so skin can't glow.
  - Fire c17 3-4 ticks earlier (carried r2 Blocker 5).

### 3. The dribble layer hides the ball (new; every handler frame)
- **Evidence:**
  - c02 #53 at 4x (x 710-810, y 390-570): the ball is behind the far hip, only an orange sliver shows (x 765-772, y 470-495), and the dribbling hand is up at the chest.
  - c10 #13 at 4x: the identical pose and the identical hidden ball.
  - `desktop-01` lower pair and `desktop-05` lower pair: in BEFORE the ball sits clearly in front of the handler.
  - c19 is fine: the ball is in front with the hand on it (crop x 420-980, y 300-620).
- **Fix:** on the broadcast camera, mirror the dribble to the camera-side hand, or offset the dribble lane forward 0.15-0.2 m. Keep the hand within 0.1 m of the ball at the top of every bounce.

### 4. Hair, faces and the face-close shot (r2 fix items 2 and 5, worse in c21)
- **Evidence:**
  - c21 full still: the "face-close" camera now sits behind #53 and YOU. No face is in frame.
  - #53's hair is a cap with a hard polygon edge and an orange streak (x 745-910, y 95-150). YOU's black cap ends in a straight cut (x 900-1010, y 65-150).
  - The inside of #53's armhole shows the yellow inner lining and a pink backface patch (x 740-840, y 340-450, and x 775-800, y 360-385).
  - #3's black stovepipe and #21's flat-topped bucket are unchanged (c02 crop x 110-420, y 380-740; c19 crop).
  - #14's sphere bun is unchanged (c16 crop x 960-1280, y 350-730).
- **Fix:**
  - Re-aim c21 at a front three-quarter on both players, at head height and 1.2-1.5 m away. That is the shot the milestone uses to judge faces.
  - Make the jersey's inner faces single-sided in the body colour, or cap them.
  - Hair: carry over r2 fix 2 (tapered shells, a feathered hairline, no flat tops).

### 5. c14 champion screen: giant pixelated fan cards over a void (new regression)
- **Evidence:**
  - c14 full still: a fan card blown up to about 300 × 480 px (x 60-360, y 90-570) and a second one at x 1100-1280, both visibly pixel-stepped (my 2x crop x 60-360, y 120-420).
  - The bottom quarter is a flat navy void: y 600-800 is (5,5,27), luma 7.5.
  - Probe: `voidPct` 36.8 and `nearBlackPct` 51.6.
  - `desktop-07` lower pair: BEFORE shows the arena bowl and the court.
- **Fix:** put the c14 camera back on the arena bowl. Never let a camera come within card distance of the crowd plane: clamp the camera to stay in front of the first row, or cull cards whose screen height is over 120 px.

### 6. Officials: kit, skin and a frozen idle pose (r2 Blocker 3, partly; animation gap new to this milestone)
- **Evidence:**
  - c15 at 2.5x (x 800-1010, y 80-320): a tank-scoop neckline with bare shoulders, and stripes swirling on the far sleeve.
  - The c15 face is (122,51,4) and the side of the face (122,48,0). That is B/R 0.00-0.03, unchanged from r2.
  - c18 at 1.6x: the same off-shoulder cut, knee shorts over tights, and yellow-light skin (210,154,79).
  - net-close f00-f11: the referee holds one stiff arms-out pose with splayed fingers for 0.4 s (my strip).
  - c06 crop: the referee's shirt stripes swirl into blobs.
  - **Credit:** the shoes are now plain black with a white sole and no toe ridges (c15 crop).
- **Fix:**
  - Give the officials a separate body with a yoke shirt and full trousers (r2 fix 4).
  - Re-point the c15 official at the player skin ramp.
  - Drive the officials off the same mocap idle and trot set as the players, so none of them holds the bind pose.

### 7. Crowd cards: repeats, photo-against-toon, empty benches (carried; milestone 6)
- **Evidence:**
  - c18: the same black-hoodie boy with hands on head appears twice (x 350-470, y 280-420 and x 750-870, y 340-500; my side-by-side crop).
  - c08: the green-hoodie boy with clasped hands repeats (crowd crop).
  - c15 and c21: photographic fans with real skin and hair directly behind toon players.
  - Empty orange chairs in c02 (x 505-835, y 295-355), c15 and c21; empty blue chairs in c06 (x 110-550, y 375-450).
- **Fix (until milestone 6):** posterize and outline the cards to the toon palette, randomize horizontal flip and tint per instance so neighbours never repeat, and seat placeholder bench players.

### 8. Dunk ball desync (animation, but it reads as a broken make)
- **Evidence:**
  - dunk-close f05-f07: the ball is at the rim in the dunker's hand.
  - f10: the ball is above the backboard, out of the hand.
  - Wide dunk (my crop x 220-420, y 60-190 per frame): the ball is above the board at f10-f11 and drops into the rim from above at f12-f13, after the dunker has passed under the basket. The "+2" appears at f14.
- **Fix:** attach the ball to the hand until a throw-down event at the rim, then release it with downward velocity through the cylinder in the same tick.

### 9. Lighting hierarchy and the venue (carried)
- **Evidence:**
  - `clippedPct` 0 in every still.
  - c09 `floorY` 0.138, with the probe values unchanged from r2.
  - The c08 far wall is (29,16,3), luma 18.4.
  - Mobile `floorCrowd` is 2.07-2.57 in c02-c06.
- **Fix:** r2 fix 10, the venue items: a bake, arena key lights, and bloom on boards and lamps.

### 10. Mobile card and "+3" (r2 Blocker 4, partly)
- **Evidence:**
  - The mobile c06 card edge is at y 998, and the nearest shoe ends at y 975 (x 540): 22-23 device px, against 32.
  - Mobile make-wide: the "+3" sits over the backboard f02-f13.
- **Fix:** drop the card 12 css px, or test it against silhouettes; move the "+3" off the board.

---

## 3. Regressions against `v3-m4-r2.md`

1. **Armhole piping breaks off the torso** (Keep 2 / closed Blocker 3): c02 #53, c06 #12, c10 #13, open-play-close f00-f07, c21. Defect 1.
2. **c21 lost its faces.** The close camera now frames two backs of heads, with an exposed jersey lining and a pink backface (`desktop-11` upper pair; c21 x 740-840, y 340-450). The near-plane hand clause of Blocker 5 is met, but the shot no longer serves its purpose.
3. **c14 champion:** the arena bowl is replaced by pixelated giant fan cards and a navy void (`desktop-07` lower pair; `voidPct` 36.8).
4. **c17 replay:** sharp in BEFORE, uniformly blurred with ghosted edges in AFTER, and the shooter's arms are now down (`desktop-09` upper pair). The carried replay-beat blocker gets worse.
5. **Ball visibility in handler frames:** c02 and c10 now hide the ball behind the hip (`desktop-01` and `desktop-05` lower pairs).

## Status of r2 blockers (my reading)

| r2 blocker | Status | Evidence |
|---|---|---|
| 1. Skin roster and hue | **Partly** | The c02 YOU is still (150,84,55), luma 100.4, and the c19 YOU is the same at 100.4. The c16 YOU is dark (58,26,22), luma 35.1. The c15 referee is B/R 0.00-0.03, unchanged. c19 #3 (215,180,154) and the c16 near blue player (215,179,154) have R:G 1.19-1.20, unchanged. The c18 official is still light (210,154,79). |
| 2. Sneakers | **Mostly closed** | No toe ridges. A rounded toe box and a continuous midsole (c15 crop). Still no lace panel, and an orange sliver at the right ankle (c15 x 950-960, y 695-702). |
| 3. Officials' kit | **Open** | Bare shoulders, knee shorts over tights, swirling stripes (c15, c18, c06). |
| 4. Mobile card margin | **Partly** | 22 device px against 32. |
| 5. Close-camera near plane | **Partly** | No third-party hand, and no hand on a face. But c21 has no faces and shows lining and backface artifacts. |
| Carried: crowd exposure | **Partly** | c04 4.47 against 4.5 (fails by 0.03); jumper minimum 2.44 against 2.6 (fails); c16 `floorCrowd` 2.97 (fails). |
| Carried: Select footer | **Open** | Mobile c13 (sheet mobile-02): "Cutter-" and "Jessieville" render under BACK/TIP OFF. |
| Carried: replay beats | **Open, worse** | c17 (regression 4). |

## Keep (credit where the pixels earn it)
- **The sneakers:** a smooth toe box and a continuous midsole (c15).
- **The new locomotion:** dribble contact with the floor (drive-close f02-f04), the jumper load and the held follow-through (jumper-close f02-f17), and the dunk gather and hang (dunk-close f05-f09). The c16 runners have varied, readable strides (my crops x 500-820 and x 960-1280).
- **The ball and hierarchy gains:** c04 4.47, c05 4.29, the jumper minimum 2.44, c02 `floorCrowd` 3.60.
- **The rim flash on a make** (net-close f00-f03), and dark-class skin on c02 #53 (luma 64.4) and the c09 handler (62.9).
