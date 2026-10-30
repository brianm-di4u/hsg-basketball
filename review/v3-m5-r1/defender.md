# v3-m5-r1: Defender brief

Round: v3-m5-r1, milestone 5, round 1 (animation). Milestone targets: Animation 7.5, overall 8.0.

**What I read:** `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m4-r2.md` (the binding verdict).

**What I opened:**
- **Contact sheets:** desktop `-01` to `-04`, mobile `-01` to `-03`
- **Every burst:** all 10 desktop strips (including the four `-close` strips) and all 6 mobile strips
- **Before/after:** desktop `-01`, `-02`, `-03`, `-08`, `-09`, `-10`, `-11`; mobile `-03`
- **Full-size stills:** desktop c02, c04, c06, c08, c15, c17, c19, c21; mobile c06
- **Benchmarks:** sheet `-02` (2K25 jump-shot set point)
- `probe/probe.json`

**My own measurements:**
- Skin boxes (Rec.601 luma, box medians) in c02, c15 and c21.
- A column luma scan of the mobile c06 shoe-to-card edge at x 540-600, y 955-1005.
- Crops:
  - c02 at x 600-800, y 390-580 (3x) and x 110-420, y 380-560 (2.5x)
  - c19 at x 210-530, y 360-620 (2.5x) and x 740-960, y 440-620 (3x)
  - c16 at x 540-1280, y 300-640 (1.4x)
  - c17 at x 480-900, y 180-620 (2x)
  - dunk-close f05-f07 (2x) and f08-f11 (1.5x)
  - drive-close f02-f06 (1.6x)
  - net-close f00, f01, f02, f03, f06 and f11 around the net (2x)

The webm is not reviewed (I can't play it), and sound is not shown. Neither is scored.

---

## 1. Scores

| Category | r2 final | **Defender** | Reason and evidence |
|---|---|---|---|
| Art: players, court, venue | 6.5 | **6.5** | **Credit:** the referee's shoes in c15 are now rounded black shoes with a white sole and no toe ridges (x 770-980, y 640-750; `desktop-08` upper pair BEFORE/AFTER). c21 has no third-character hand in the near plane, no hand on a face and no visible strand.<br>**Holding it at 6.5:**<br>- **new:** detached hair buns float above three defenders' heads in c19 (x 260-410, y 375-410)<br>- the c21 showcase now shows the backs of two heads<br>- referee skin is unchanged at (123,48,0) (c15)<br>- the venue clause is unmet |
| Lighting & materials | 6.5 | **6.5** | **Ball separation is up again:** `ballContrast` c04 4.47 (r2 4.40), c05 4.29 (4.10), jumper min 2.44 (2.14). `floorCrowd` c02 is 3.60.<br>**Against:** `clippedPct` is 0 everywhere; c16 is 2.97; the c15 referee skin has no blue; c17's blur is over-applied (§4). |
| Animation & game feel | 6.5 | **7** | **Up a full step from r2's procedural 6.5:**<br>- an authored jumper with a dip, a set point, an airborne release, a held follow-through and a landing (`desktop-jumper-close` f00-f17)<br>- a running stride with toe-off and a dribble that tracks the hand (`desktop-drive-close` f02-f06)<br>- a dribble cycle in traffic (`desktop-open-play-close` f00-f15)<br>- the crouched handler (c19)<br>**Not 7.5:**<br>- the dunk passes through the rim and backboard, and the ball is not slammed (`desktop-dunk-close` f06-f09)<br>- the net is still rigid<br>- the replay lost its release pose (c17)<br>- the mobile dunk is unreadable |
| UI / HUD | 7 | **7** | **Holds:** the desktop stagger, c20 whole, no callout over the rim or ball in desktop bursts, and the shot meter tracks the shooter (jumper f01-f07).<br>**Against:**<br>- **new:** a "SLAM DUNK" card on a three (`make-wide` desktop f00-f04 and mobile f00-f04, with "+3" in both)<br>- the mobile "+3" sits on the backboard (mobile make-wide f02-f13, mobile dunk "+2" f14-f15)<br>- the mobile Select footer still leaks |
| Typography | 6.5 | **6.5** | Unchanged and not in scope. The c13 "game colors" chips are still under 12 px. |
| Readability | 6.5 | **6.5** | **Credit:**<br>- the ball gains above<br>- the c19 white defenders no longer share one cloned arm angle (`desktop-10` upper pair: four distinct arm poses)<br>- the handler's ball is crisp and clear of his body (c19 crop x 900-940, y 525-560)<br>**Against:**<br>- the mobile dunk is about 25 px tall at the far rim (mobile dunk f06-f13)<br>- mobile `ballContrastMin` is 1.00-1.30 in the mobile dunk, drive and jumper bursts<br>- in c02 the ball is hidden behind #53's hip |
| Mobile portrait | 7 | **7** | **Holds:** `playerPx` 82.5-87.5 in c02-c05 and the separate thumb deck. **Credit:** the card margin is up to about 21 device px from 12 (mobile c06 scan). **Against:** the dunk framing (mobile dunk f00-f15: the camera stays on the centre circle), the "+3" on the backboard, and the Select leak. |
| Authenticity of setting | 6.5 | **6.5** | Not in scope this milestone. The official's black shoe (c15) is a small plus; the kit (shorts over tights, bare shoulders) and the venue are unchanged. |
| **Overall** | **6.6** | **6.8** | (6.5 + 6.5 + 7 + 7 + 6.5 + 6.5 + 7 + 6.5) / 8 = 54 / 8 = 6.75. That is +0.13 on r2. The milestone targets (Animation 7.5, overall 8.0) are **not met**. |

---

## 2. Strengths, with evidence

### S1. The jump shot is now an authored motion with every phase present (`desktop-jumper-close`, 3 ticks per frame)
- **f00:** a dribble stance with the ball at the right hip.
- **f01:** the gather. The ball comes to the chest with both hands and the knees flex.
- **f02:** the dip. Both knees bend visibly, and the ball rises past the face to the set point.
- **f03-f07:** the rise. The player's feet separate from the yellow ring: the ring is at y about 270 under the feet in f00 and f01, has dropped to the bottom edge of the tile in f02, and is off the tile in f03-f12. The crop tracks the body, so the body has left the floor. The ball sits at a set point above the right eyebrow with the elbow cocked. That is the same set-point geometry as `benchmarks/nba2k25-1.jpg` (sheet `-02`, lower left): the ball above the head, the shooting elbow near 90° and the guide hand on the side.
- **f08:** the release, with the shooting arm fully extended overhead and the wrist broken toward the rim.
- **f09-f13:** the follow-through holds, with both arms up, for 15 ticks (0.25 s).
- **f13-f17:** the landing. The ring returns under the feet (f13 at the tile's bottom edge, f15-f17 under the shoes), and the arms stay raised into f17.

This directly answers r2's "the same small release (jumper f07-f11)" and the r2 fix-10 ask for "mocap with knee load and wrist finish": the knee load is f02 and the wrist finish is f08-f09.

### S2. Locomotion has a real gait cycle, and the dribble layer follows the hand (`desktop-drive-close` f02-f06, my 1.6x crop)
- **f02-f04:** the lead foot stays planted inside the ring while the trail leg swings through. In f05 and f06 the trail foot shows its sole, a toe-off pushing back from the floor (crop x 1170-1200, y 380-420 and x 1470-1500, y 360-400).
- **The dribble:** the ball goes from the left knee (f02) to the floor (f03, crop x 400-440, y 340-385) and back up (f04). The dribbling hand stays directly above it every frame (wristband at crop y about 250, over the ball's x). The ball is never left behind the hand.
- **f07:** a two-hand gather into a pull-up. **f08-f15:** the same overhead release and held follow-through as S1, judged PERFECT.

### S3. The open-court dribble reads as a dribble, not a carried ball (`desktop-open-play-close`, 4 ticks per frame)
- **The bounce cycle:** the ball goes waist, waist, low, floor and rising in f00-f04. It is back at the hip in f06-f07, low in f08, and through f13-f15 it is down near the shins (a crossover or between-the-legs move).
- **The legs:** #12's knee lifts on the off-beat (f03, left knee raised with the shoe off the floor).
- **The defender:** #53 is in a slide with the reaching arm extended across the handler (f05-f08), a contact gesture that the r2 build didn't have.

### S4. Live-play poses are more athletic and less cloned
- **c19:** the handler crouches with knees bent and the trunk leaning forward, and the ball is at the hand's height outside the hip (my 3x crop at x 900-945, y 520-560). The defender #12 is in a wide slide stance with the lead arm out.
- **`desktop-10` upper pair:** the four white defenders were a forearm stack with one shared angle in BEFORE. In AFTER they have four different arm angles (#14's arms high, the dark defender's arm out across the body, and two others). r2 fix item 8 asked for "±15° arm variance on shared defensive poses", and this does better than that.
- **c04:** the shooter is visibly airborne. The feet are at y about 390 and the ring at y about 440, with the arms fully extended. The defenders behind are in mid-stride (#40 at x 180-245, y 330-465, with the legs split).

### S5. The ball reads better, and the probes confirm it
| Probe | r2 | v3-m5-r1 |
|---|---|---|
| `ballContrast` c04 | 4.40 | 4.47 |
| `ballContrast` c05 | 4.10 | 4.29 |
| desktop jumper `ballContrastMin` | 2.14 | 2.44 |
| desktop jumper `ballContrastMean` | (not given) | 4.20 |

- The carried r2 Blocker 2 thresholds (c04 4.5, jumper minimum 2.6) are still narrowly missed, but every number moved the right way.
- c02 `floorCrowd` 3.60 holds above the 3.4 test.

### S6. The make still pays off on the rim and in the stands
- **The rim flash:** the rim glows warm white in `desktop-net-close` f00-f03 and settles to red by f04, as kept in r2.
- **The ball reads inside the net:** the mesh is drawn over the ball (my net crop f01-f03: you can see the net's lattice across the ball), and the ball exits below the hem in f04.
- **The crowd answers the make:** in c06 many fans have both arms raised (x 0-280, y 40-140; x 930-1180, y 60-140), and the cheerleaders are mid-pompom (x 680-860, y 330-470).

### S7. Close-camera Blocker 5 conditions are met in the frame shown (c21 desktop and mobile)
- No third character's limb enters the near plane. The r2 hand at x 0-300, y 0-190 is gone (`desktop-11` upper pair).
- No hand rests on a face.
- No stray yellow strand at x 605-640, y 340-380.
- Both heads now carry hair caps: #53 brown and #12 black (c21 x 740-1010, y 60-150). That answers r2's "YOU's bare scalp in c21".

See Concession 4 for why this is a hollow pass.

### S8. The officials' shoes are fixed (c15)
`desktop-08` upper pair:
- **BEFORE:** five-ridged toe shoes with a sock band.
- **AFTER (c15 at x 770-980, y 640-750):** smooth, rounded black shoes with a continuous white sole and no ridges, and black tights into the shoe with no skin at the ankle.

That closes the toe-geometry clause of r2 Blocker 2 *for the official in c15*. I can't verify the players' shoes at close range in this packet.

### S9. The replay has real camera treatment
- **c17:** the background crowd is heavily softened (x 480-1280, y 360-610). The #2 jersey and the near court are softer than r1, but they keep a defined silhouette edge (my 2x crop: the left jersey edge at crop x 515-525 is a single clean edge, while the backboard frame at crop x 60-220 is doubled).
- The doubled edge on a static object during a dolly is camera motion blur, as the round claims.
- c08 (late replay) is crisp, so the effect is tied to camera motion, not left on permanently.

### S10. The mobile card margin improved
- **My column scan of mobile c06:** the lowest shoe and shadow pixels end at y 976 (x 540 and x 556), the floor runs to y 997, and the card edge starts at y 998 (luma 61-66, then 20).
- That is about **21 device px**, up from r2's 12. It still misses the 32 px test (Concession 7).

---

## 3. Pre-emptive rebuttals

### R1. "The animation is the same procedural rig, just retimed."
**Contradicted by `desktop-jumper-close`:**
- The r2 jumper had no visible knee dip and a small release.
- This one has a dip (f02), a set point (f03-f07), a full-extension release (f08), a 15-tick follow-through hold (f09-f13) and a landing with the ring returning under the feet (f13-f17).

**And by `desktop-drive-close` f05-f06:** the trailing foot's sole faces the camera at toe-off. A procedural sine-swing leg doesn't show the sole.

### R2. "The ball floats; the dribble isn't connected to the hand."
**Not in the open-court bursts:**
- In `desktop-drive-close` f02-f04 the wristband is directly above the ball at every height, including f03 with the ball on the floor.
- In c19 the ball sits just under the handler's dribbling hand at the hip.
- c02 is the exception: the ball is tucked behind #53's hip with no hand on it (my 3x crop at x 765-775, y 470-500). I concede that single frame.

### R3. "The players are stiff and skate."
**The bursts show weight transfer.**
- **Weight transfer:** a planted lead foot with the trail leg swinging (drive-close f02-f06), the knee lift on the dribble off-beat (open-play-close f03), and the defenders' split-leg strides (c04 #40, `desktop-jumper` f04-f07 at the left edge).
- **Foot sliding:** I can't prove its absence from strips where the camera and ring move with the player. A prosecutor can't prove its presence from them either. Treat it as not shown.

### R4. "c17 is a ruined, blurred frame, a lighting artifact."
**It is a deliberate camera effect with a differentiated subject.**
- The crowd is blurred far more than #2's silhouette (my 2x crop), and the static backboard is doubled, which is motion-blur behaviour.
- c08 from the same replay is sharp.
- `ballContrast` c17 is 2.33, so the ball still separates.

I concede the strength is too high (Concession 5). It is not a void or a rendering failure.

### R5. "The net is still rigid, so nothing changed at the rim."
**Half true, and I concede the net (Concession 3).** But the rim beat isn't static:
- the rim flash and colour settle (net-close f00-f04)
- the ball is correctly occluded by the mesh inside the net (f01-f03)
- the score bug updates on the beat (dunk f13 to f14: 0 to 2)

### R6. "Lighting regressed."
**The probe numbers say otherwise.** c04 4.47, c05 4.29, the jumper minimum 2.44 and c02 `floorCrowd` 3.60 are all at or above r2. `floorCrowd` c16 is 2.97 (r2 2.95), and `clippedPct` is 0, as in r2. Nothing here moved down.

### R7. "The mobile probe minimums (dunk `ballContrastMin` 1.00) prove the ball vanishes on mobile."
**The probe measures the wrong thing.** On those frames the ball is in a hand or at the far rim at about 4 px:
- In mobile dunk f06-f13 the action is at the top rim, about 25 px tall.
- The 1.00 is a camera-framing failure (Concession 6), not a ball-material failure.
- The mobile c04 loose-ball value is 4.17.

### R8. "The c19 defenders are still a cloned forearm stack."
**Contradicted by `desktop-10` upper pair** (four distinct arm angles in AFTER) and by my c19 crop (#14 both arms high, the dark #0 one arm across, the rear defender reaching right).

The defect in that clump is the floating hair (Concession 1), not cloned arms.

---

## 4. Concessions (plainly)

### 1. Detached hair buns: a new, visible regression (c19)
- Three sphere-cluster buns float 15-30 px above their owners' heads with clear floor between: brown at x 265-290, y 382-395; blonde at x 293-318, y 390-402; brown at x 382-405, y 388-408 (my 2.5x crop).
- They sit over the white defenders in the most-seen live camera.
- In c02 and c16 the same bun type is attached (my crops), so this is pose-dependent: the bun isn't bound to the head bone the new skeleton drives.
- This must be fixed before the milestone can pass.

### 2. The dunk clips through the rim and backboard, and the ball is never slammed (`desktop-dunk-close`, `desktop-dunk`)
- **f06 (my 2x crop):** the red rim ring wraps the dunker's chest, and the net is drawn over his torso. He passes through the hoop.
- **f07:** the net still overlaps the torso.
- **f08-f09:** the backboard's frame and glass cross his torso, so he is drawn behind or through the board.
- **The ball:** it is held out to the side in the off hand (f05 at x about 1040, y about 110; f06 at x about 1228, y about 105), not over the rim. It reappears above the board in f10 and goes through the rim only in wide f12-f13, after the dunker has dropped away.
- This is a Playgrounds-2-category move with no contact. It is the main reason Animation is 7, not 7.5.

### 3. The net is still rigid (`desktop-net-close` f00-f11, `mobile-net-close` f00-f11)
- My net crop (f00, f01, f02, f03, f06, f11) shows the same cone silhouette before, during and after the ball. There is no stretch, no flare at the hem and no sway.
- This is the 7 anchor's "real net/rim reaction" clause, and it is still unmet.
- The crowd card behind it holds an identical pose for 22 ticks.

### 4. The c21 "face-close" shows no faces
- `desktop-11` upper pair: the AFTER camera sees the back of #53's head and the back of #12's head. The mobile c21 is the same.
- The Blocker 5 conditions pass, but because the showcase now shows no face to judge, which defeats the shot.
- The re-pose that removed the hand on the face also turned both players away from the camera.

### 5. The c17 replay lost its release pose, and its blur is too strong
- `desktop-09` upper pair: BEFORE has #2 with both arms up in follow-through. AFTER has #2 with the arms down and the ball in the same place far above (x about 690, y about 228 against the hands at y about 550).
- r2 Blocker 5 asked the replay to fire *earlier*. The pose is now *later*.
- The blur softens the subject's number "2" (x 770-810, y 470-520) as well as the crowd. Mask the subject or cut the strength.

### 6. The mobile dunk is unreadable (`mobile-dunk` f00-f15)
The camera stays on the centre circle while the dunk happens at the top rim, where the dunker is about 25 px tall in f06-f13. The probe's `handlerInBandPct` of 100 measures a different player. Mobile Portrait can't move up while a signature move plays off-screen.

### 7. UI defects in the make sequence
- "SLAM DUNK" is the card on a made three, with "+3" beside it on both viewports. In desktop make-wide f00 the shooter is at the arc (x about 90, y about 240) and the score was already 3. The callout names the wrong event.
- The mobile "+3" still sits on the backboard f02-f13 (mobile make-wide) and fades only from f10. The "+2" sits on the backboard in mobile dunk f14-f15.
- The mobile card margin is about 21 device px against 32 (S10).
- The mobile Select footer still leaks "Cutter-" and "Jessieville" under BACK/TIP OFF (mobile sheet `-02`, c13 bottom).

### 8. The milestone-4 art blockers mostly carry
- **Skin:** the c15 referee is (122,51,4) on the face and (123,48,0) on the forearm, B/R 0.00-0.03, identical to r2. YOU in c02 is (151,87,60), luma 103.1, identical to r2. Neither was in this milestone's scope, but both still fail r2 Blocker 1.
- **Officials' kit:** shorts over tights with a bare-shoulder tank neckline (c15 x 830-1000, y 195-240), and the far sleeve's stripes still swirl (c15 x 950-1000, y 220-300).
- **Officials' pose:** they stand in a near-bind arms-out pose that doesn't change across `desktop-net-close` f00-f11 (x 115-190).

### 9. Drive and dunk bursts open on a dead frame
`desktop-drive-close` f00 and `desktop-dunk-close` f00 are black, and dunk-close f01 is half black, because the crop target is off-frame. The wide strips show a camera cut between f00 and f01 (`desktop-dunk` f00 to f01). I treat this as harness setup, not a game pop, but the packet can't prove it either way.

### 10. Not shown
The webm wasn't reviewed. Steals, blocks, passes, layups, leg IK on slopes and celebration animations other than the c06/c16 crowd aren't isolated in any burst, so I give no credit for them.

---

## Summary for the arbiter

**Animation has genuinely crossed from procedural to authored.** The jumper, the drive gait and the dribble layer are all evidenced frame by frame. That earns a 7, not the 7.5 target, for four reasons:
- the dunk clips through the rim and board, with the ball detached (dunk-close f06-f09)
- the net is still rigid
- the hair buns float in c19, a regression from the new skeleton
- the replay and face-close showcases lost their subjects' key pose

Everything else holds at r2 levels, with small probe gains in ball contrast.

**Overall:** 6.8. Both milestone-5 targets are missed.
