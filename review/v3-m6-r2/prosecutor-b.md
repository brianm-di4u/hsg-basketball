# Prosecutor B — v3-m6-r2

Paths below are relative to `screenshots/v3-m6-r2/review-packet/`. Still coordinates are native pixels: desktop 1280×800, mobile 780×1688 (two device pixels per CSS pixel). Burst regions refer to each labelled tile. Opened all seven contact sheets, all 44 stills, all 16 bursts, all 19 comparison sheets and all four benchmark sheets. Read packet, probes, rubric and previous verdict. No source/developer notes consulted. Motion judgments use bursts; video and sound were not reviewed. Input latency and continuous frame pacing are not scored.

## 1. Scores

| Category | Score | Justification and evidence |
|---|---:|---|
| Art | 7.3 | Matching benches and restored cheer props help, but close figures remain crude and piping survives: desktop c02 (560–815,260–365), c06 (680–870,330–475), c15 (40–690,220–590), c21 (780–850,535–665). |
| Lighting & materials | 7.0 | Clear desktop hierarchy; weaker phone separation and dark champion bowl: desktop c04 upper/lower halves, mobile c02 court/background, desktop c14 upper-left. Probe floorCrowd 4.14 desktop c04 versus 2.24 mobile c02; desktop c14 voidPct 14.6. |
| Animation & feel | 7.0 | Readable release and make reaction, sustained pose holds and floating dunk: desktop-jumper-close f01–f17 centre, desktop-dunk f09–f15 upper-right, desktop-net-close f00–f11 centre, desktop-make-wide f00–f13 upper half. |
| UI / HUD | 7.0 | Clear branded bug and thumb controls; phone +3 persists at the board: mobile-make-wide f02–f13 upper-centre; mobile c16 (290–400,180–315). |
| Typography | 6.5 | Display/text hierarchy works; tiny metadata remains: desktop c13 chips (260–1030,220–530), mobile c02 abbreviations (25–755,20–65). Raster glyphs are visibly small relative to 12 CSS px; exact font declarations unavailable. Milestone 7 work. |
| Readability | 7.0 | Ring/released jumper read, but clustered bodies and reaches remain: desktop c19 (270–470,390–660), desktop-open-play f00–f15 lower-left, mobile c19 (150–580,900–1260). Probe desktop jumper ballContrastMin 2.99 supports released-ball visibility. |
| Mobile portrait | 7.0 | Thumb deck clear of play and basket visible; wasted dunk floor and poor close shots: mobile-dunk f04–f15 centre/lower court, mobile c15 and c21 above the control deck. Probe dunk emptyFgMean 57.756; c09/c11 playerPx 57.6/50.6. |
| Authenticity | 7.8 | Kits, gym colours, benches and cheer props nearly reach 8; wrong officials' trousers and repeated benches remain: desktop c02 sideline, c06 cheer group, c15 (750–1000,185–750), c06 (90–465,340–465). |
| **Overall** | **7.1** | **56.6 / 8 = 7.075 → 7.1.** Art <8, Authenticity <8 and overall <8.2. All milestone targets missed. |

Benchmark calibration: Hoop Land's spacing and compact score bug remain the relevant ~8 reference (`benchmarks/benchmarks-01.png`, bottom two panels, court/top bug). Playgrounds has stronger dunk silhouette and hand/ball staging (`benchmarks-04.png`, middle-right and bottom-left panels). Smooth minimally differentiated skin/jersey surfaces in desktop c21 centre remain far from 2K material separation (`benchmarks-02.png` middle row; `benchmarks-03.png` portrait panels; `benchmarks-04.png` top row). These are still comparisons, not benchmark motion claims.

## 2. Defects ranked by player exposure

1. **Off-ball congestion.** Desktop-open-play f00–f15 lower-left packs the paint while the right handler duel stays isolated. Desktop c19 (270–470,390–660) repeats extended-arm silhouettes; the defender reaches across the handler's head (820–875,450–480). Mobile-open-play f00–f15 lower third and mobile c19 (150–580,900–1260) compress these into overlapping bodies. Fix separation, stance/phase variety and reach constraints away from heads. The selection ring does not solve body staging.

2. **Bench rows still repeat.** Desktop c02 (570–810,265–360) has adjacent open-palm claps with closely matched angles; c15 (60–520,240–500) repeats claps; c06 (90–465,335–465) retains blue crossed-arm figures. Gallery variety improves: c12 (230–1060,90–235) has different raised/low arms, so calling the entire gallery frozen would be false. Fix independent bench gestures/phases; verify no three adjacent figures share pose AND phase. Keep the developing reaction in desktop-make-wide f00–f13 upper half, culminating in overhead arms.

3. **Jumper/pull-up pose holds.** Desktop-jumper-close f01 centre has nearly straight planted legs; bend appears at f02 near takeoff. f04–f07 sustain the set pose; f09–f16 sustain follow-through, dropping arms at f17. The latter spans 21 ticks/0.35 seconds between endpoints. Desktop-drive-close f10–f15 centre repeats the overhead finish. Ball departure is visible at jumper f08: release is present. Fix a planted load before lift, shorter hold, blended arm recovery and landing compression.

4. **Dunk impact and landing remain unresolved.** Desktop-dunk f09–f12 upper-right holds the ball around/above the ring before f13–f14 entry; f15 remains airborne. Mobile-dunk f04–f15 upper-centre reinforces the suspended-body read. Fix release on contact, ball through within three ticks, a 4–8 tick hang and compressed landing within the capture. Desktop-dunk-close f07–f15 loses the subject to the left; f00 is empty/black. Repair crop tracking. The actual wide camera retains the dunker, so the crop failure is not a game-camera disappearance.

5. **Phone framing/callout.** Mobile-dunk f04–f15 centre/lower half leaves much empty floor, confirmed by emptyFgMean 57.756. Mobile c09 (0–780,450–1305) and c11 (0–780,350–1290) have small distant players, consistent with 57.6/50.6 CSS px medians. Mobile-make-wide f02–f13 upper-centre keeps +3 over the shot-clock/backboard zone through new play; it does not cover the rim itself. Tighten action framing and move +3 beside the bug, expiring by f08. Preserve mobile c02 controls at y1310–1688, clear of play.

6. **Close-camera surface/LOD failures.** Mobile c21 pale patches remain on nose/face and shoulders (320–440,530–680; 220–410,660–810; 550–725,665–855), alongside #53's yellow armhole panel (120–335,790–1000). Desktop c21 (795–850,545–660) retains a yellow strip with contrasting sliver. Desktop c15 coach/bench (50–690,220–590) and mobile c15 (0–450,300–990) retain faceted heads/angular hands. Fix player inner faces and skin surfaces; reframe or upgrade nearby crowd heads/hands. Cleaner garment seams do not close the complete close-camera test.

7. **Officials still fail the kit/idle clauses.** Desktop c15 (760–1005,185–750), c18 (335–555,385–755) show shorts over narrow tights; c15 keeps both arms down/out. Skin looks less orange than BEFORE (`before-after/desktop-08.png`, upper pair, official), but a shared player ramp cannot be proven from appearance. Fix full trousers, crew/collared neckline and prescribed idle/signal set. Keep the made-three signal in desktop-net-close f02–f11 lower-centre.

8. **Replay repair retains sharp foreground crowd geometry.** Desktop c17 (0–190,575–735), c08 (75–230,635–745) show a sharp faceted green pom-pom/forearm against blurred official/crowd. BEFORE had a sharp hand (`before-after/desktop-09.png` upper pair, lower-left; desktop-04 lower pair, lower-left). The silhouette changes; the no-unblurred-crowd-geometry test still fails. Guide hand in desktop c17 (690–735,445–495) remains separated from ball (805–870,480–550); mobile c17 hand (475–530,915–980), ball (625–725,970–1060) also fails the intended nearby support-hand staging. Cull/blur near-camera crowd and bring the guide hand to the ball. Preserve sharp #2 and the above-shoulder set point.

9. **Desktop champion gate fails despite improvement.** Desktop c14 (0–500,0–280) remains dark bowl. voidPct 14.6 improves on previous 18.5 but fails under 5. Mobile 4.7 passes its numerical half. `before-after/desktop-07.png` lower pair shows more lit court. Fix remaining desktop composition/light while keeping confetti and ribbon (c14 court/right half).

10. **Carried phone margin/footer.** Mobile c06 trailing sole (roughly 560–595,970–990) ends just above the card at y998, short of 32 device px; orange smear remains near left runner's ankle (125–175,800–865). Mobile c13 leaks Cutter/Jessieville text below the footer (100–725,1640–1688). Enforce the 32 px exclusion zone, remove smear and clip scrolling rows above footer. Tiny metadata in the score table belongs to milestone 7; no new menu regression alleged.

## 3. Prior blocker tests and regressions

| Prior binding test | Ruling | Evidence |
|---|---|---|
| B1 crowd garments | **Improved; strict magnified closure not certified.** | Large former hip shards absent at native scale: desktop c06 cheer hips (680–850,390–440), c12 gallery (235–1060,155–225), c15 coach (575–690,340–560), c18 white fan (755–855,400–620), c21 gallery (920–1130,490–630), mobile c15 coach (295–435,600–965). Required exhaustive 3x scan was not performed; no unconditional closure. |
| B2 home kit | **Closed in supplied views.** | White benches match floor whites: desktop c02 (560–815,270–365), c09 (420–560,235–315), c10 (575–815,255–345), c15 (45–520,235–505), c16 left edge, c19 (620–865,270–355). Before-after desktop-08 upper pair makes change explicit. |
| B3 performance/props | **Partly.** | Restored pom-poms and school-colour shell/skirt silhouettes: c06 (680–870,330–475), c07 (720–900,370–505), c19 (330–465,250–360). c12 gallery variety improves; bench repeats persist (defect 2). Make reaction retained. A single gallery still cannot prove weight-shifting idle. |
| B4 close/replay | **Open.** | Sharp foreground prop c17 lower-left, crude c15 bodies, c21 piping and phone skin patches (defects 6/8). |
| B5 c14 | **Partly.** | 14.6 desktop / 4.7 mobile voidPct; required under 5 on both. |
| B6 officials | **Partly; open gate.** | Skin/sleeves look improved in before-after desktop-08 upper pair; full-trouser and c15 idle clauses fail (defect 7). |
| Carried dunk/jumper | **Open.** | Dunk f09–f15 upper-right, jumper-close f01–f17 centre. |
| Replay guide hand | **Open.** | c17 hand/ball coordinates, defect 8. |
| Mobile card/footer | **Open.** | c06 sole/card; c13 bottom edge, defect 10. |
| Net/harness | **Animation closure retained; harness open.** | Desktop/mobile-net-close f00–f05 centre shows lengthening/flaring around descending ball and f06–f11 recovery, with flash. f00 already contains ball; no pre-entry frame. No newly measured stretch percentage asserted. |
| Desktop exposure | **Keep retained.** | c04 ball at (605,175) separates clearly; probe contrast 6.4 and jumper minimum 2.99. |

The comparison sheets show corrections rather than a broad new regression: bench kits and cheer props return, gallery poses vary, c14 improves. The replay's faceted pom-pom remains a sharp distraction (`before-after/desktop-09.png` upper pair, lower-left): a failed repair of the earlier regression, not evidence all replay focus worsened. Player piping/phone skin artifacts remain on both sides of `before-after/mobile-07.png`, rightmost pair, face/armhole.

Probe limits: c15 floorCrowd samples dark apron/table, not playable floor. Net-close contrast samples mesh/ball overlap; dunk contrast samples a held ball. Neither settles loose-ball readability. Replay voidPct includes letterboxing and c18 includes stanchion. Zero clipped pixels alone does not prove absent bloom. Sound, haptics, latency, continuous pacing and landing beyond the strips are not established here.
