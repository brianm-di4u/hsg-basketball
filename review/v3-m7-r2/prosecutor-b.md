# Prosecutor B — v3-m7-r2

## 1. Scores

**Fail the campaign stop rule: overall 7.4; UI and Mobile remain below 8.** Mean: 59.5 / 8 = 7.4375. All paths below are relative to `screenshots/v3-m7-r2/review-packet/`. Still cNN is a single capture; fNN denotes printed burst frames. Coordinates are image pixels (mobile 780 × 1688 device pixels); burst quadrants refer to each named frame, not the entire sheet.

| Category | Score | Evidence and justification |
|---|---:|---|
| Art | 7 | Faces and kits read, but close surfaces break: `stills/desktop/c21-face-close.png`, c21, (790–840,545–650), protruding gold armhole; `stills/mobile/c21-face-close.png`, c21, (330–420,580–810), irregular skin patches. |
| Lighting & materials | 7 | Court/house hierarchy works: `stills/desktop/c02-live.png`, c02, lower versus upper half; probe c02 floorCrowd 3.55. Broad smooth character surfaces remain: desktop c15, (680–1000,90–750). |
| Animation & game feel | 7 | Gather and release read, but recovery does not: `bursts/desktop-jumper-close.png`, f00–f08 center, versus f09–f16 upper body. Dunk remains airborne through f15 (`bursts/desktop-dunk.png`, f10–f15 upper-right action). |
| UI / HUD | 7.5 | Consistent card/focus treatment (`stills/mobile/c22-pause.png`, c22, 32–748 × 422–1358), but hidden menu staging and duplicate markers persist (mobile c21, 570–635 × 135–190 and 580–635 × 1235–1280). |
| Typography | 8 | Make subline now has a plate and roughly 20 device-pixel capitals, clearing the 18-device-pixel threshold (`stills/mobile/c06-make.png`, c06, 200–346 × 1108–1132). Condensed pennant (`stills/mobile/c14-champion.png`, c14, 315–460 × 395–485) and clear hub hierarchy (`stills/mobile/c20-hub.png`, c20, 90–690 × 70–1450) support 8. |
| Readability | 7 | Selection ring reads, but paint bodies stack (`stills/desktop/c02-live.png`, c02, 140–415 × 390–715); dribble overlaps defender silhouette (`bursts/desktop-open-play-close.png`, f05–f12 center). |
| Mobile portrait | 7.5 | Separate thumb deck is retained (mobile c06, 0–780 × 1290–1688), margins improve (mobile c13, card x32–748), but hero visibility and dunk framing still fail (mobile c14 above card; mobile-dunk f05–f13 center/lower court). |
| Authenticity | 7.5 | Wordmark, kits and table establish place (desktop c02, 550–1270 × 260–370); bench repetition and official stripes weaken it (desktop c15, 30–545 × 210–520 and 810–990 × 190–400). |
| **Overall** | **7.4** | **Gate fails.** |

Benchmark calibration: `benchmarks/benchmarks-01.png`, bottom-left/right Hoop Land panels, has clearer separated silhouettes than the cited c02 paint cluster. `benchmarks/benchmarks-02.png`, top row, combines dense menu information with illustrated identity; our mobile c13/c20 obscures the staged players. `benchmarks/benchmarks-04.png`, middle-right Playgrounds dunk, exposes an extended expressive silhouette compared with desktop-dunk f04–f13 upper-right player. These stills do not establish benchmark timing. `benchmarks/benchmarks-03.png`, middle row, shows directional light and differentiated skin/cloth beyond desktop c15's smooth surfaces. Photorealism is not required to repair the faults.

## 2. Defects ranked by encounter frequency

1. **Gameplay silhouettes still collide.** Desktop c02 (140–415,390–715) stacks torsos; open-play-close f05–f12 center places the ball against the defender. This establishes visual ambiguity, not a collision/rules bug. Improve spacing and hand/ball separation. Probe mobile dunk ballContrastMin 1.08 also supports occasional weak separation, not universal invisibility.

2. **Phone menus hide their heroes.** Full mobile c13 and c20 show no staged head-and-torso outside cards (outer strips x0–32/x748–780); mobile c14 shows crowd above the card (y140–326), not a hero. The flat navy band persists at c14 (0–780,0–140). Reflow shorter cards and stage a hero above them. Margin improvements alone cannot close blocker 9.

3. **Jumper recovery is held too long.** Desktop-jumper-close f09–f16 upper-body center keeps both arms overhead through descent; f17 changes them. Credit f00–f03 knee load and f08 ball separation. Recover guide and shooting arms progressively. Fixed-tick strips cannot establish input latency.

4. **Dunk ending and phone framing remain weak.** Desktop-dunk and mobile-dunk f10–f15, upper-right and upper-center respectively, remain airborne through the score change. Desktop-dunk-close loses the player by f10, so cannot certify landing. Add landing compression and capture through settling. Mobile-dunk f05–f13 leaves most center/lower court empty; probe emptyFgMean 57.537% corroborates wasted framing. Its 91.1 CSS-pixel player median measures a group, not the distant dunker's visible height.

5. **Bench variety is insufficiently distinct; officials are partly repaired.** Desktop c15 (175–545,220–520) retains similar adjacent chest-height clap silhouettes. Desktop c02 (560–820,265–365) has more hand-angle variety, so claiming unchanged lockstep everywhere would be unfair. C15 now has full trousers (800–970,390–745), but curved/forked stripes (820–980,190–395) and spread arms (680–1000,280–415). Use clearly different rest/lean/clap silhouettes, grounded idle/signal poses and straight stripes. Single stills cannot establish distinct animation phases.

6. **Close cameras expose persistent artifacts.** C21 surface faults are cited in the table. Mobile c21's upper YOU is cut by the bug while a second arrow sits near the jersey bottom (table coordinates); desktop c21 repeats this at (500–545,90–120) and (505–535,770–795). Cull off-frame markers. Mobile c15 official exits the right edge at x780 (head y275–425, body y425–1215); offset the camera to include the person.

7. **Replay guide hand and net harness remain unresolved.** Desktop c17 guide hand (690–740,445–515) is separated from ball (805–865,480–550); mobile c17 repeats it at (475–540,920–990) versus (620–720,960–1060). Both net-close strips f00 start with the ball already in the mesh, center/top-center. Later frames show exit and mesh change, but onset/contact entry is not shown. Align the guide hand and capture before entry.

## 3. Regressions and r1 binding pass tests

No clear new regression is established by the opened pairs. Improvements do not close all clauses.

| Previous item | Ruling and evidence |
|---|---|
| Blocker 1: replay foreground | **Target prop removed.** `before-after/desktop-04.png`, bottom pair left edge, and `desktop-09.png`, top pair left edge, lose the sharp green intrusion. Full desktop c08 (0–155,460–700) and c17 (0–100,450–650) confirm. The stricter no-unblurred-crowd-anywhere clause is not certified: c08 still has crisp nearby left-side crowd. Mobile c17 left/bottom quadrants show no equivalent prop. |
| Blocker 2: bench/cheer | **Partly.** C02 hand arrangements improve, c15 silhouettes remain repetitive (defect 5). C02 cheer group (250–395,265–375) has different arm angles. Distinct phases are not established by stills. |
| Blocker 3: officials | **Partly.** Slacks visible in c15 and desktop-net-close f00–f11 lower-left official; curved stripes/spread pose remain. `before-after/desktop-08.png`, top pair, shows trouser improvement. |
| Blocker 4: champion | **Partly; fails.** Probe desktop voidPct 4.4 passes under 5; mobile 5.1 fails. `before-after/desktop-07.png`, bottom pair top edge, shows bowl replacing ceiling band. Full mobile c14 outside card (card x32–748,y326–1327) does not yield five confidently visible confetti flecks; band remains. |
| Blockers 5–6: heads/necklines/surfaces | **Open in inspected close evidence.** Mobile c15 (70–205,480–640) retains pale hairless-looking head and angular neckline; c21 faults remain as above. This does not assert every model fails. |
| Blocker 7: menu heroes | **Partly.** Desktop c13/c20 left player gestures, differing from right, but repeats across screens (x0–180,y340–760); right hand is cut at x1280,y470–510. Full-containment and distinct-per-screen clauses fail. Desktop c14 has distinct celebrations (140–315,415–720 and 960–1215,375–720). All armhole/number/shoe clauses at specified magnification are not certified here. |
| Blocker 8: type | **Observed headline faults repaired; score 8.** Mobile c06 subline clears cap threshold and has a plate; mobile-dunk f14–f15 lower-right subline is visibly enlarged. Condensed c14 pennant appears on both viewports. `before-after/mobile-02.png`, last pair, and `mobile-05.png`, middle pair, show changes. This is a raster finding, not an audit of unseen UI. |
| Blocker 9: mobile menus | **Partly.** Full mobile c01/c13/c14/c20/c22 cards run x32–748, closing margin clause. Hidden heroes and c14 top band fail remaining clauses (defect 2). |
| Carried phone +N | **Closed in captured make sequence.** `bursts/mobile-make-wide.png` f00–f13 top-center board remains free of +3; lower callout fades out by f05. `before-after/mobile-06.png`, first pair, removes prior board pop. |
| Carried dunk/jumper/guide hand/harness/c15/duplicate YOU | **Open**, defects 3–7. Select footer remains clear: mobile c13 (60–725,1430–1630), list separated from BACK/TIP OFF. |

Sound, haptics, latency and continuous real-time playback quality are not shown by inspected image evidence and receive no invented credit or penalty. Motion judgments use fixed-tick strips; the listed video was not played. Probe contrast is local sampling, not an occlusion test; aggregate playerPx/emptyFg values do not override visible composition.
