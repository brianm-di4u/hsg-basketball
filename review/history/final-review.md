# Spa City Hoops: final adversarial visual review (three.js 3D, real-GPU capture)

Reviewer stance: independent and deliberately harsh. The yardstick is shipped commercial and acclaimed indie basketball games, not browser prototypes. I have not seen the developer's own assessment.

Inputs reviewed:
- **Final real-GPU captures (main evidence):** sheets `visual-final/gpu/sheets/desktop-01..03` and `mobile-01..02`. Full-size desktop `g01`-`g14` (1280x800) and mobile `g01`-`g14` (390x844 at 2x).
- **Zoomed crops:** desktop `g02` clump, `g04`/`g05` ball over the crowd, `g13` rim.
- **Side-by-side diffs against m3:** `m3/gpu/desktop` `g02`, `g04`, `g07`, `g10`; `m3/gpu/mobile` `g05`, `g10`.
- **Luminance probes:** crowd band vs floor vs corners on `g02`, `g04`, `g09`, final and m3.
- **Before/after pairs:** `visual-final/before-after/desktop-01..04`, `mobile-01..04`.
- **Previous reviews:** `visual-before-review.md` (4.1), `m1-review.md` (4.5), `m2-review.md` (5.6), `m3-review.md` (5.8).
- **Benchmarks:** `benchmarks/*.jpg` and `SOURCES.md`. Re-checked `hoopland-1.jpg` and `playgrounds2-3.jpg`.
- **As instructed:** I ignored the leftover score strip in `g12-champion` and did not hold `g03`'s exact framing against the build. `g04`/`g05` show the settled composition.

Animation and feel are still inferred from stills. This is the first milestone with a make (`g13`) and a miss (`g14`), so the payoff layer can finally be judged.

---

## 1. Verdict in one paragraph

The final pass added a real payoff layer and closed most of the portrait "place" defects:
- **Payoff:** a full-width "3 POINTS / HOT SPRINGS" slam with speed streaks, a "+3" pop at the rim, and an "AIRBALL" tag.
- **Portrait place:** banners sit fully below the HUD, baseline wordmarks are intact, the yellow ghost disc is gone, and the end walls have crowds.
- **Baseline ends:** filled behind the hoop on desktop and in Hot Streak.
- **Cameras:** a slightly closer desktop camera, and a Hot Streak shooter twice the size.

Three things a player sees all the time did not move:
- **The light.** The house is still at floor exposure and the floor ghosts are still there.
- **The ball in flight.** It still disappears into the crowd with no trail.
- **The first screens.** The menus are still cream web cards.

The new slam also creates two fresh faults:
- It **sits on top of the rim** in the portrait make frame.
- It **lingers into a later airball**.

Net: about +0.3, to **6.1**. That is a solid, readable browser game with a real sense of place. It is not a top-tier-looking basketball game.

---

## 2. Scores (1-10)

| Category | 2D original | M3 | **Final** | Best benchmark | Why (final) |
|---|---|---|---|---|---|
| Art: players, court, venue | 4 | 6 | **6.5** | 10 NBA 2K26 (stylized: Playgrounds 2 9, Hoop Land 8) | Baseline-end crowds now close the ends: desktop `g02` left, `g04`/`g05`/`g13` right, `g10` behind the hoop, mobile `g05`/`g10`/`g13`. The floors and crests are still the best asset. Benches are still empty chairs (`g04` crop, `g09`). Players are still faceless mannequins (`g02` #21, `g06` #2 at 40% of the frame height). |
| Lighting & materials | 2 | 5 | **5** | 10 NBA 2K25 (stylized: Playgrounds 2 8) | Probes are flat against m3: floor mean 128-133 vs 136-138, and the corner falloff is the same (`g09` corner 85 vs center 149; m3 81 vs 145). Ghost wisps sit under #14 and #21 (`g02` crop) and under the left-wing players in `g04`. The `g07` near apron is a black band. There are no light pools that read as light. |
| Animation & game feel (from frames) | 3 | 4.5 | **5.5** | 10 NBA 2K25/26 (arcade: Playgrounds 2 9, BB Classics 8) | There is now a make beat (`g13`: slam, speed streaks, "+3" at the rim) and a miss beat (`g14`: "AIRBALL"). Still no trail, no visible net, no ball-through-hoop moment, and no make-specific crowd: the right-end fans have their arms up in `g04` and `g14` as well. Bodies still merge (`g02` #12 into his defender). |
| UI / HUD | 4 | 6 | **6** | 8 Hoop Land / 2K25 menus | The slam and "AIRBALL" plates are in the house style and read instantly. But the slam covers the rim on mobile (`g13`) and persists into a miss (`g14`). The score bug is unchanged at about 656 px wide with ~10 px "FOULS". The `g03` meter still sits on the bench and crowd band. |
| Typography | 4 | 5.5 | **5.5** | 8 Hoop Land | The slam uses a good condensed italic display face. Menus and modals (`g01`, `g11`, `g12`) are unchanged: a generic sans body and a cramped button label face. |
| Readability (teams, ball, you, meter) | 6 | 6.5 | **6.5** | 9 Hoop Land | **Gains:** the mobile ghost disc is gone (mobile `g05`, versus m3), and the desktop shooter grew from ~70 to ~100 px (`g04`). **Losses:** the desktop ball at its apex still sits among faces (`g04` at about 530,150; `g05` at about 590,70), and on the mobile make the rim is hidden under the slam (mobile `g13`). |
| Mobile (390x844 portrait) | 5 | 6.5 | **7** | ~8 (no portrait title in set) | **Fixed:** title-year banners fully visible below the HUD (mobile `g03`-`g05`, `g10`, `g13`); "RAMS" and "TROJANS" no longer cut by the stanchion; the black band filled with an end-wall crowd; the disc removed. **Unchanged:** the rig. Players are about 45-65 css px, and defense still shows the whole court (mobile `g02`, `g08`, `g09`). |
| Authenticity of setting | 5 | 6.5 | **6.5** | 10 NBA 2K26 (place: Playgrounds 2 9, Hoop Land 8) | **Portrait** gyms now feel like specific gyms (banners, end crowds, wordmarks). **Desktop gameplay** still has no title-year banners. **The Bank OZK Arena final** (`g07`) still reads as a dark gym: no ribbon, a black near apron, "HOT SP" cropped. |
| **Overall (unweighted)** | **4.1** | **5.8** | **6.1** | **~9** | +0.3. Real gains in payoff and portrait place. The three highest-impact layers (light, ball flight, menus) did not move. |

---

## 3. Status of the m3 ranked gaps

| m3 gap | Status | Evidence |
|---|---|---|
| 1. Desktop live and shot composition | **Partly** | The camera is a little lower and closer: the shooter is ~100 px (was ~70) in `g04`, and players are ~15% larger in `g02` (side-by-side with m3). Still ~40% bare wood at the bottom (`g04`/`g05` y 480-800, `g09` y 470-780, `g13` lower left). The shooter's head is in the bench and crowd band (`g04` crop). The ball handler still reaches the frame edge (`g07`: YOU at x ~1200 of 1280). |
| 2. No payoff; ball lost in the crowd | **Partly** | **Closed:** a make and a miss are captured; the slam, "+3" and "AIRBALL" are present; the mobile disc is gone. **Open:** no trail in any frame; no crowd dip behind the ball (`g04` crop: the ball sits on faces); no visible net or ball through the hoop. **New faults:** the slam occludes the rim (mobile `g13`) and the stale slam shows on the airball (`g14`). |
| 3. Light hierarchy; reflection ghosts | **Open** | The probes match m3 within noise. The crowd is still at floor exposure (`g04`, `g09`). White wisps appear 0.5-1 body below the white jerseys (`g02` crop under #14 and #21; `g04` left wing; mobile `g02` paint). |
| 4. Hollow enclosure | **Partly** | **Closed:** the baseline ends now have crowds on desktop, mobile and Hot Streak. **Open:** the benches are still empty chair rows (`g04` crop, green chairs; `g09`, red chairs); the stanchion bases are still black boxes (`g02` left, `g04`/`g13` right); there is nothing on the near side (`g07` bottom 25% is black). |
| 5. Portrait rig wastes the top and slices the place | **Partly (place: closed; framing: open)** | **Place, closed:** banners are fully under the HUD, the wordmarks are intact, the end-wall crowd fills the old black band (mobile `g05` vs m3). **Framing, open:** the rig pitch and height are unchanged (whole court in mobile `g02`, `g08`, `g09`; players ~45-65 css px). |
| 6. Menus, title, select | **Open** | `g01`, `g11` and `g12` are the same cream cards. `g11` still cuts the Quarters row at 800 px. The title backdrop wordmark is cropped ("R-MORNING STAR", mobile "N LAKE"). |
| 7. Hot Streak staged empty | **Partly** | The shooter is ~230 px (was ~120), there is a jumping baseline crowd behind the hoop, and "TROJANS" is unobstructed (`g10` vs m3). Still: a high camera, no ball racks, a black band above the crowd (y ~90-110), the crowd standing on a black void, and a dark right edge (x 1080-1280). |
| 8. Mannequin players; body merging | **Open** | `g02` crop: the #21 head has no features and the hands are mittens. #12 still merges into his defender. In `g06` the #2 player fills 40% of the frame with no face detail. |
| 9. Desktop place identity | **Open** | No title-year banners in any desktop gameplay frame (`g02`-`g10`, `g13`, `g14`). In the `g07` arena there is no ribbon, a black near apron, and "HOT SP" is cropped. Crowd sprites repeat within a few seats (`g05` crop). |
| 10. HUD polish | **Open** | The bug spans x ~312-968, and "FOULS" is ~10 px. The `g03` meter overlaps the bench and crowd band. The YOU-under-bug collision did not reproduce in these frames (unverified). |
| m3 regression: Hot Streak dead end | **Mostly closed** | See gap 7: the baseline crowd and the larger shooter. The black band and the right-side void remain. |
| m3 regression: handler at the frame edge | **Open** | `g07`. |

---

## 4. Regressions and new defects in the final build

1. **A stale "3 POINTS / HOT SPRINGS" slam on an airball** (desktop and mobile `g14`).
   - The score is 0-0, the ball is tagged "AIRBALL", and the make slam is still on screen, half slid out to the right.
   - It may come from the capture script's sequencing. Either way, the build is not cancelling the callout on a reset or a new shot, and the evidence contradicts itself.
   - **Fix:** cancel and hide all callouts on a possession change, a shot release and a scene reset. Add a test that no slam element is visible within 50 ms of `shotReleased`.
2. **The make slam occludes the rim on portrait** (mobile `g13`).
   - The card covers the backboard and rim at the exact moment the ball goes through.
   - The 2D original showed the ball in the net with "+3" (`before-after/mobile-02`, bottom pair), so this one beat is now *less* readable than the 2D original.
   - **Fix:** project the rim to the screen and place the slam in the half of the frame away from it, and enter it ~250 ms after the net event.
3. **The desktop make frame stacks overlays on the hoop.**
   - In `g13`, the "+3" box sits over the backboard glass.
   - The slam card hides a figure under it (only shoes show at x ~975, y ~360) and covers the paint.
   - **Fix:** float "+3" above the backboard top edge, not over the glass. Push the slam into the lower-left quadrant on desktop, which is the empty-wood band anyway.
4. **Minor:** the slam's white speed streaks over the end-wall crowd read as a render glitch at phone size (mobile `g13` x 0-170, y 440-510; mobile `g07`). Fade them by 50% over non-floor pixels, or confine them to the card's bounding band.

---

## 5. Remaining gaps, ranked (to be listed as known gaps)

Constraints honored: original art only, offline, 60 fps laptop / 30+ fps phone, rules and meter unchanged.

### 1. MAJOR: no light hierarchy, and floor-reflection ghosts (open for three milestones)
- **Evidence:** the crowd is at floor exposure (`g04`, `g09`); white wisps appear under the players (`g02`, `g04`, mobile `g02`); the probes show no change from m3.
- **Fix:**
  - **House:** multiply the crowd by 0.65 in gyms and 0.45 in the arena.
  - **Floor:** bake 4-6 soft light pools into the floor texture.
  - **Vignette:** a screen vignette on every tier, about 18% at the corners.
  - **Reflections:** fade them with height (`exp(-h/0.5 m)`) and a Fresnel weight, with a total cap of 0.15. If the cap still ghosts, drop the planar reflection and use a blurred, per-team colored contact smear.

### 2. MAJOR: the ball is lost in flight, and the payoff is all HUD and no world
- **Evidence:**
  - The apex sits among faces (`g04`, `g05` crops) and there is no trail anywhere.
  - Neither make capture shows the ball, the net or the rim reacting.
  - The slam covers the rim on mobile and lingers into a miss.
- **Fix:**
  - **Trail:** an 8-10 segment additive ribbon trail (0.25 s, one draw call).
  - **Crowd dip:** a ~120 px screen-space crowd dim behind the airborne ball.
  - **Net and rim:** a net vertex snap with a rim flash on the make, and a rim shake on a miss off iron.
  - **Crowd:** a make-only swap of the home section to standing.
  - **Slam:** rim-aware placement, delayed to the net event.
  - **Callout lifecycle:** fix as in regression 1 above.

### 3. MAJOR: desktop composition is still a high, far-sideline camera with an empty foreground
- **Evidence:** ~40% empty wood (`g04`, `g05`, `g09`, `g13`); the shooter's head is in the crowd band (`g04`); the handler is at x 94% (`g07`).
- **Fix:**
  - **Camera:** lower it another ~20% and add a near-side look-at bias (empty band under 15%).
  - **Dead zone:** a follow dead zone that keeps the handler within x 20-80%.
  - **Gather:** pitch down 3-5° so the shooter's head clears the crowd line.
  - **Test:** extend the shot safe-area test to live frames.

### 4. MAJOR: menus, title and team select are unchanged web cards
- **Evidence:** `g01`, `g11`, `g12` and their mobile twins. These are the first and last screens anyone sees, and `g11` overflows 800 px.
- **Fix:**
  - **Title:** a dark navy-and-gold side rail over the existing 3D gym orbit, with the backdrop wordmark fully framed.
  - **Team select:** a two-step Home then Away select with big crests in school colors.
  - **Face:** one condensed face (the slam's) for all headings and buttons.
  - **Test:** select fits in 1280x800.

### 5. MAJOR: the enclosure is still only half built
- **Evidence:** empty bench chairs in every gym (`g04`, `g09`); black stanchion boxes (`g02`, `g04`, `g13`); nothing on the near sideline; the arena near apron is a black band (`g07`).
- **Fix:**
  - **Benches:** 5 instanced bench players plus a coach per team in uniform colors.
  - **Stanchion bases:** pad them in team color.
  - **Near side:** a cropped near-side strip (table backs, a photographer, a heads band).
  - **Arena apron:** fill the near apron with a lit courtside row.
  - **Test:** no clear-color or near-black area larger than 3% of any gameplay frame.

### 6. MAJOR (mobile): the portrait rig framing is unchanged
- **Evidence:** the whole court is visible and players are ~45-65 css px (mobile `g02`, `g08`, `g09`).
- **Fix:** lower the pitch 8-10° and frame from the ball handler to 3 m past the attacked baseline, so players reach 60-70 css px. Keep the new banners and the end-wall crowd in the top band.

### 7. minor (MAJOR in replays): mannequin players and body merging
- **Evidence:** `g02` faceless heads and mitten hands; the `g06` replay puts that model at 40% of the frame height.
- **Fix:**
  - **Faces and bodies:** add a nose and mouth to the face decal, 6-8 hair meshes, tapered limbs and 3-segment hands.
  - **Collision:** a 0.35 m capsule push-out.
  - **Replay framing:** keep the replay camera at waist-up or wider, so the model never fills more than 30% of the height.

### 8. minor: Hot Streak staging
- **Evidence:** a high camera, no ball racks, a black band above the baseline crowd, the crowd on a black floor, a dark right edge (`g10`).
- **Fix:**
  - **Camera:** about 2.2 m high and 3 m behind the shooter.
  - **Props:** two instanced ball racks.
  - **Crowd:** put the baseline crowd on a bleacher block with a light pool.

### 9. minor: desktop place identity
- **Evidence:** no banners in desktop gameplay; no arena ribbon (`g07`); repeated crowd sprites; the Hot Springs crowd reads orange, not gold.
- **Fix:**
  - **Banners:** hang them on the far wall just above the top bleacher row, below the HUD.
  - **Arena:** an emissive ribbon.
  - **Crowd:** a seeded no-repeat-within-3-seats shuffle.
  - **Palette:** map Hot Springs to gold (#C9A227) plus black.

### 10. minor: HUD polish
- **Evidence:** the 656 px bug and ~10 px labels; the meter on the crowd band (`g03`).
- **Fix:**
  - **Bug:** shrink it to ~45% width with labels of 12 px or more.
  - **Meter:** a dark backing card when it overlaps the crowd.
  - **YOU chevron:** clamp it below the bug.

---

## 6. What must be kept

1. **The slam callout's look:** the display face, the black card with a gold rule, the team name under it, and the "AIRBALL" plate. Fix its placement and lifecycle, not its style.
2. **The portrait place work:** banners below the HUD, end-wall crowds, intact wordmarks, the stanchion dither fade.
3. **The baseline-end crowds** on desktop and in Hot Streak.
4. **From earlier milestones:**
   - The shot safe-area constraint and its test.
   - The Hot Streak behind-shooter axis.
   - Replays without HUD.
   - The floating bug.
   - Meter clear on release.
   - Contact shadows.
   - Per-school floors and crests.
   - The pep band and cheer.
   - Arena confetti.
   - The 2D fallback.

---

## 7. Verdict on the campaign goal

The campaign did not reach its goal of visual quality on par with top-tier games of this type. It took the game from **4.1** to **6.1**, a large and genuine jump: a real 3D gym with school-specific floors, crests, crowds and banners, readable cameras and a payoff beat. That still leaves it about **2-3 points short** of the stylized benchmarks (Hoop Land ~8, Playgrounds 2 ~9) and further from 2K. Closing the gap mostly takes the same three things the last three reviews named, which are cheap at 60/30 fps:
- **Lighting:** a dimmed house, floor pools, no ghosts.
- **Ball and make:** a ball trail and an in-world make reaction.
- **Menus:** real game menus instead of web cards.

Done, those should be worth roughly +1. Character models and the enclosure would be needed for the rest.
