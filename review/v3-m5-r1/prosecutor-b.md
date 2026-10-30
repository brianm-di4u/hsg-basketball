# Prosecutor B — v3-m5-r1

Paths are relative to `screenshots/v3-m5-r1/review-packet/`. Still coordinates are device pixels; burst regions refer to the individual labelled frame. Inspected all contact sheets, all 16 burst strips, all before/after sheets, four benchmark sheets, probe JSON and the full-size stills cited here. Motion judgments use bursts; webm and sound are not reviewed. Mocap provenance, latency and IK implementation cannot be established from these images.

## Scores

| Category | Score | Reason and evidence |
|---|---:|---|
| Art | 6.5 | Kits/hands read, but overlapping bodies and solid hair remain: `stills/desktop/c21-face-close.png`, x525–1210 y85–780. Photographic fans/empty chairs: `stills/desktop/c15-bench-close.png`, x15–660 y90–520. |
| Lighting & materials | 6.5 | Floor/house hierarchy survives: `stills/desktop/c02-live.png`, lower versus upper half, probe floorCrowd 3.60. Skin/cloth remain smooth and similar in response: c21 above, x600–1080 y180–680. |
| Animation & game feel | 6.0 | Readable phases, but suspended poses and unclear dunk contact: `bursts/desktop-jumper-close.png` f02–f07, central body/legs; `desktop-dunk-close.png` f04–f11, upper hand/ball/rim region. |
| UI / HUD | 6.5 | Consistent broadcast bug and thumb deck: `stills/mobile/c02-live.png`, y0–140/y1310–1688. False SLAM DUNK/+3 feedback: `bursts/desktop-make-wide.png` f00–f03, upper half. |
| Typography | 6.5 | Clear display/text pairing, but secondary desktop labels remain tiny: `stills/desktop/c02-live.png`, x410–580 y58–74. Exact font sizes are unmeasured; 12 CSS px compliance is not established. |
| Readability | 6.0 | YOU ring works, but ball/body overlap and limb clumps persist: `stills/mobile/c02-live.png`, x310–435 y660–880 and x240–780 y900–1280. |
| Mobile portrait | 6.5 | Safe thumb deck and visible far basket: mobile c02 above. Small-player exceptions persist: `stills/mobile/c11-mountain-pine.png`, x100–700 y350–535; probe median 50.6 CSS px, empty foreground 32.3%. |
| Authenticity | 6.5 | School identity reads: desktop c02, x1030–1210 y325–350. Official retains exposed shoulders and shorts/tights: desktop c15, x790–1000 y180–750. Crowd/benches are milestone 6 work. |
| **Overall** | **6.4** | **51 / 8 = 6.375, rounded. Animation misses 7.5; overall misses 8.0.** |

The benchmark gap is visible without demanding realism: `benchmarks/benchmarks-04.png`, middle-right/lower-left Playgrounds panels, separates ball, hand and exaggerated windup clearly. `benchmarks/benchmarks-01.png`, bottom Hoop Land panels, separates small players from the floor. These static references support silhouette/readability comparisons, not claims about their animation timing. `benchmarks/benchmarks-03.png`, middle panels, shows much stronger skin/cloth/light differentiation than c21.

## Ranked defects and concrete fixes

1. **Frequent jump poses lack weight.** `bursts/desktop-jumper-close.png` f02–f07, central knees/torso/ball: nearly the same bent-leg, ball-beside-face pose holds across five 3-tick intervals, 0.25 seconds. f09–f15, central body, holds the raised-arm finish with little articulation. Landing does appear in f16–f17, lower half. `desktop-drive-close.png` f08–f15, central body, repeats the rigid airborne finish. **Fix:** progress hip/knee extension through ascent, wrist/finger release and ankle/pelvis compression through landing; shorten the held takeoff pose. World translation alone does not supply body motion.

2. **Dribble moves; body contact remains weak.** `bursts/desktop-open-play-close.png` f00–f07, center/lower half: ball descends and returns while the torso stays upright and hand tracking is sparse. f09–f12, center/left: defender reaches into the handler's space with little visible contact response. Mobile c02, x240–780 y900–1280, interleaves limbs. **Fix:** preserve bounce, improve wrist/elbow tracking, load hips on turns and separate bodies. Player-tracking crops cannot prove a numerical foot-slide distance or successful planted-foot IK; supply a fixed-floor close sequence.

3. **Dunk contact is unclear.** `bursts/desktop-dunk-close.png` f04–f06, upper center: ball stays to the side around chest/shoulder height while rim crosses the torso. f07–f10, upper half: backboard obscures hand/body, ball appears beside/behind it. f11–f13, upper-left/center: ball approaches rim after body passes. This does not establish exact mesh penetration, but fails to sell a hand-driven finish. **Fix:** visibly anchor ball to palm through approach and downward rim crossing; stage camera on the visible side, then release and land.

4. **Make feedback contradicts the event.** `bursts/desktop-make-wide.png` f00–f03, upper center/right; `mobile-make-wide.png` f00–f03, lower-middle card/upper rim: SLAM DUNK accompanies three points/+3 in the packet's made-three sequence. Mobile f00 also clips the card at the right edge. **Fix:** derive text/points from one shot event; clamp the entire card entrance to the viewport. Actual dunk strip awards two (`desktop-dunk.png` f14–f15, top bug); this is not evidence that every dunk awards three.

5. **Net impact remains slight.** `bursts/desktop-net-close.png` f00–f11, upper-middle basket, and mobile equivalent f03–f08, upper-middle: ball traverses the net and rim flash fades, but net silhouette changes only slightly. **Fix:** local downward stretch, asymmetric flare and damped recoil. Credit existing passage/flash. Crowd pose changes are visible in desktop make-wide f00–f06, upper crowd; 3D crowd is deferred to milestone 6.

6. **Phone framing and ball separation still fail in exceptions.** `stills/mobile/c09-arena.png`, x100–780 y450–970 and y1060–1300: probe player median 57.6 CSS px, empty foreground 31.3%. c11 above is smaller still. `bursts/mobile-drive.png` f08–f15, upper-center shooter/large central floor, keeps action distant. **Fix:** frame handler plus target rim more tightly; retain thumb deck. `stills/mobile/c06-make.png`, x385–430 y390–435, ball is faint inside net: probe contrast 1.55, diameter 8.4 CSS px. Improve ball edge separation. Hand/net burst minima do not prove continuous loose-ball invisibility.

7. **Replay blur softens the subject.** `stills/desktop/c17-replay-early.png`, x660–730 y200–265 ball and x695–890 y345–745 shooter, shows softened/doubled edges alongside crowd blur. `stills/mobile/c17-replay-early.png`, x0–235 y120–1000 wall and x0–780 y1170–1580 floor, shows irregular sharp/soft boundaries. Ball remains far from lowered hands. **Fix:** protect ball/shooter focus, reduce blur during release, smooth depth transitions and start replay nearer hand release. Replay floorCrowd probes do not measure these defects.

8. **Carried footer leak and new result-camera failure.** `stills/mobile/c13-select.png`, y1400–1688: Fountain text ghosts into cue; names appear below footer. **Fix:** opaque pinned footer and clipped scroll area (milestone 7). `stills/desktop/c14-champion.png`, x0–360 y80–570 and x1100–1280 y0–570: giant cropped photographic fans dominate backdrop. **Fix now:** keep camera outside crowd cards and restore court/arena backdrop; fan replacement can wait for milestone 6.

## Regressions versus v3-m4-r2

- **Championship camera regresses:** `before-after/desktop-07.png`, lower pair, left/right backdrop; confirmed desktop c14 regions above. Court background becomes giant foreground fan cards.
- **Replay clarity regresses while effects are added:** `before-after/desktop-09.png`, upper pair, central ball/shooter/rim; `before-after/mobile-06.png`, middle pair, wall/ball/crowd. New blur is visible, but subject clarity is poorer (full-size evidence in defect 7).
- **Near-plane hand partially improves:** `before-after/desktop-11.png`, upper pair, upper-left; desktop c21 x0–300 y0–190 is clear now. Replacement framing overlaps two backs/shoulders at x600–1020 y90–700 and does not permit face assessment. Do not certify all contact/face gates closed.
- **Card clearance improves in still:** `before-after/mobile-02.png`, rightmost make pair, lower-right shoe/card; mobile c06 x500–625 y930–1000 has visible floor separation. Whole entrance remains unsafe at mobile make-wide f00. +3 remains through f13, upper-middle above basket.
- **Carried small-player framing, clumping and Select leak stay open:** defects 2, 6, 8. Previous 50.6/57.6 CSS-pixel framing exceptions are unchanged numerically. Officials' shoulder/shorts defect persists (desktop c15 regions above). Skin hues and prior tone-table tests are not remeasured here.
- **Coverage limit:** named bursts do not isolate complete passes, steals, blocks or celebrations. Their absence from dedicated evidence is not proof of missing implementation. Fixed-foot IK and mocap provenance also remain unverified. Supply dedicated complete cycles before claiming every milestone 5 gate satisfied.
