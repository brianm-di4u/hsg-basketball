# Spa City Hoops: adversarial visual review, M3 (three.js 3D, real-GPU capture)

Reviewer stance: independent and deliberately harsh. The comparison is against shipped commercial and acclaimed indie basketball games, not against browser prototypes. I have not seen the developer's own assessment.

Inputs reviewed:
- **Real-GPU captures, the main evidence:** sheets `m3/gpu/sheets/desktop-01..02` and `mobile-01..02`, full-size desktop `g01`-`g12` (1280x800) and mobile `g01`-`g12` (390x844 at 2x). Enlarged crops: desktop `g02` clump, `g04`/`g05` ball over the crowd, and mobile `g02`, `g04`, `g05`, `g07`, `g10` play areas, plus a 2x zoom of the mobile `g05` baseline.
- **Harness captures (software GL):** `m3/sheets/desktop-01..10`, `mobile-01..08`, with full-size `v10-close-handler`. Flow shots `01`-`32` were checked for menus and flow only; they are the deliberate 2D fallback and look unchanged from m2.
- **Previous reviews:** `visual-before-review.md` (4.1), `m1-review.md` (4.5), `m2-review.md` (5.6).
- **Benchmarks:** `benchmarks/*.jpg` and `SOURCES.md`, re-checked against `hoopland-1.jpg` and `playgrounds2-3.jpg`.
- As instructed, I ignored the leftover score strip in `g12-champion`, and I did not hold the exact framing of `g03` against the build: the camera may still be easing there. `g04`/`g05`, a few frames later, show the same composition, so the composition findings stand.

Animation and game feel are again inferred from still frames. **For the second milestone running, no capture shows a made basket**, so the payoff layer still cannot be credited.

---

## 1. Verdict

M3 is a targeted defect-fixing pass, not a step change.

What landed:
- **The rim is now on screen in every shot frame** (desktop `g03`-`g05`: rim at about x 73%, y 27%).
- **Hot Streak has a behind-the-shooter rig** with the rim center-top (`g10`, mobile `g10`).
- **On portrait defense the near stanchion dither-fades** (mobile `g02`, `g08`).
- **Portrait players roughly doubled** in size (about 40-60 css px, up from about 25).
- **The score bug floats** without its full-width bar.
- **The meter clears on release** (`g04`).
- **Replays hide the HUD and touch controls** and now have a brick wall with a school pennant behind the hoop (`g06`, mobile `g06`).
- **The Mountain Pine scorer's table has its name** (`g09`).
- **The portrait arena shows its bowl** behind the far basket (mobile `g07`).

What did not move:
- **Lighting hierarchy.** The house is still as bright as the floor, with no pools and no vignette.
- **Ghost reflections** are fainter but still detached white wisps.
- **The ball in flight** still passes through the crowd on desktop with no trail.
- **No make payoff is visible.**
- **The enclosure:** empty benches, a black band behind every baseline, nothing on the near side.
- **Characters** are still mannequins.
- **Menus and the select overflow** are unchanged.
- **Desktop has no title-year banners** during play.

The new Hot Streak rig also exposes how empty the baseline end of each gym is.

Net: about +0.2. The fixes are real but mostly remove faults. They add almost nothing a player would call *spectacle*. The desktop live camera is still the single biggest weakness.

---

## 2. Scores (1-10)

| Category | Before (2D) | M1 | M2 | **M3 (real GPU)** | Best benchmark | Why (M3) |
|---|---|---|---|---|---|---|
| Art: players, court, venue | 4 | 5 | 6 | **6** | 10 NBA 2K26 (stylized: Playgrounds 2 9, Hoop Land 8) | The floors and crests are still the strongest asset. The Mountain Pine table is fixed (`g09`), and the replay wall now has brick, an exit sign and a "COBRAS" pennant (`g06`). Benches are still empty chairs (`g02`, `g04`, `g08`, `g09`). Players are still faceless mannequins up close (`v12` head, `v10`). |
| Lighting & materials | 2 | 3 | 5 | **5** | 10 NBA 2K25 (stylized: Playgrounds 2 8) | Reflections are softer but still read as ghost wisps below the players (`g02` crop under #3/#14/#21). The crowd is at floor exposure (`g04`, `g09`). There are no light pools and no vignette. Black voids remain (`g10` band behind the board, `g07` left). `v10` #53 is still a black silhouette on the harness tier. |
| Animation & game feel (from frames) | 3 | 4 | 4.5 | **4.5** | 10 NBA 2K25/26 (arcade: Playgrounds 2 9, BB Classics 8) | The meter now clears at release, which is good. Still no trail, still no make frame, and bodies still merge in clumps (`g02` #12 into the ball handler). Nothing new to credit. |
| UI / HUD | 4 | 5 | 5.5 | **6** | 8 Hoop Land / 2K25 menus | The floating bug, the Hot Streak panel ("READY" in the display face, "STREAK" plus dots), and replays without HUD or controls are all real gains. But the bug is still about 655 px wide over the crowd and hides the "YOU" chevron in `v10`. The meter in `g03` still sits on the crowd band. |
| Typography | 4 | 5 | 5 | **5.5** | 8 Hoop Land | The slab "READY" is gone. Menu body text is still a generic web sans (`g11`, `g12`), and the 9-10 px "FOULS" labels are unchanged. |
| Readability (teams, ball, you, meter) | 6 | 4 | 6 | **6.5** | 9 Hoop Land | The rim is in frame for shots, Hot Streak shows the rim center-top, and the stanchion fades. The ball is still lost in the crowd on desktop (`g04`, `g05`), and a stray yellow disc on mobile (`g05`, `v22`) reads as a second ball. |
| Mobile (390x844 portrait) | 5 | 4 | 6 | **6.5** | ~8 (no portrait title in set) | Players are bigger, defense is no longer under the pole, and the arena bowl is visible. Still: a black band between the wall and the baseline (mobile `g03`-`g05`, `g10`), banners sliced by the HUD, baseline wordmarks cut by the stanchion base ("TRO▮ANS", "RA▮S", "STATE ▮NALS", "RED ▮VILS"), and the full court length still in view on offense. |
| Authenticity of setting | 5 | 6 | 6.5 | **6.5** | 10 NBA 2K26 (place identity: Playgrounds 2 9, Hoop Land 8) | Portrait end walls now carry "GIRLS STATE CHAMPS" banners (mobile `g10`), and the table and pennants help. Desktop gameplay still has no title-year banners, the benches are empty, and arena gameplay still reads as a dark gym (`g07`). |
| **Overall (unweighted)** | **4.1** | **4.5** | **5.6** | **5.8** | ~9 | +0.2. Correct fixes to the m2 defect list, but the high-impact layers (composition, payoff, light, place) are largely untouched. |

---

## 3. Status of the m2 gaps

| m2 gap | Status | Evidence |
|---|---|---|
| 1. Desktop shot camera: shooter, ball and rim in frame | **Partly closed** | The rim is inside the safe area in `g03`/`g04`/`g05`, and Hot Streak has its own rig (`g10`). But the shooter is still about 70 px tall, pinned at the far sideline against the crowd line. The ball apex is in the crowd. The bottom 35-45% of the frame is empty wood (`g04`/`g05` y 480-780, `g09` y 420-740). In live play the ball handler drifts to x 95% (`g07`). |
| 2. Portrait rig too high and wide | **Partly closed** | Players are about 40-60 css px (mobile `g02`, `g04`, `g07`). Offense still shows nearly the whole court (mobile `g05`, `g08`). The top band is a flat wall plus a black void (mobile `g04` y 320-500 device px). No sideline crowd. |
| 3. Ball lost against the crowd, no trail | **Mostly open** | The desktop ball has a soft halo (`g05` crop), but it still sits among the faces at y about 105, with no trail anywhere. On mobile it reads well over wood (mobile `g04`). |
| 4. No make payoff; meter lingers | **Meter: closed. Payoff: open (unverifiable)** | The meter is gone by `g04`. Still no make or miss capture, and no net, crowd or callout evidence. |
| 5. Floor reflections ghost | **Partly closed** | Fainter, but still white wisps about half a body below white jerseys (`g02` crop x 440-560 y 500-560; `v40`). |
| 6. Portrait defense under the stanchion | **Closed** | The board and pole dither-fade over the play (mobile `g02`, `g08`). The stanchion *base* still slices every baseline wordmark (see gap 5 below). |
| 7. Replay composition | **Mostly closed** | The HUD and controls are hidden, the wall now has a pennant, an exit sign and a shot clock, and the ref is no longer cut off. Still: the right half is a featureless charcoal wall, the shooter is cut at the thighs, and the ball is about 1x the shooter's head (target 0.6x). |
| 8. House as bright as the floor; voids | **Open** | `g04`, `g08`, `g09` crowds sit at floor exposure. No pools, no vignette. `g10` and mobile `g04`/`g10` have a black band behind the board. `g07` has a black upper-left. |
| 9. Enclosure: voids, near side, benches | **Open** | Empty chair rows in every gym (`g02`, `g04`, `g08`, `g09`). Nothing on the near sideline. The Hot Streak frame is empty on the right (`g10`). |
| 10. Title-year banners | **Partly closed (portrait only)** | Present on the portrait end wall (mobile `g04`/`g05`/`g10`), but the HUD crops their tops. None in any desktop gameplay frame (`g02`-`g10`). |
| 11. Player models vs photographic crowd | **Open** | `v12`: a huge featureless head. `v10`: #53 is a black silhouette, mitten hands, and the ball is 2x head width. The crowd is still semi-photographic. |
| 12. State final as a recolored gym | **Slightly improved** | The bowl shows on mobile `g07` and desktop `g07` left, and the "HOT SPRINGS · ARKANSAS" apron is fully in frame on `v40`. Desktop gameplay `g07` is still dark-gym: no light pool or readable ribbon, and the apron is cropped ("HOT SPR") at the right edge. |
| 13. Score bug, Hot Streak HUD, typography | **Partly closed** | Floating bug; "READY" in the display face; "STEAM" replaced by "STREAK". The bug is still 655 px wide, the labels are still about 10 px, and the menu sans is unchanged. |
| 14. Menus, title, select overflow | **Open** | `g01` is the same cream card. `g11` still cuts the Quarters row at 800 px. The bottom wordmark is cropped ("AKE HAMILTON", mobile "NING ST"). |
| 15. Crowd repetition and the Hot Springs palette | **Open** | Repeated clasped-hands sprites in the `g05` crop. The Hot Springs crowd still reads orange (`g02`). |
| m2 regression: blank Mountain Pine table | **Closed** | `g09`: "MOUNTAIN PINE". |
| m2 regression: empty benches as hollow boxes | **Open** | See gap 9. |
| m2 defect: pale-yellow floor disc mid-flight | **Open** | Mobile `g05` (device px 247,690): a glowing yellow disc on the floor while the actual ball has already landed by the baseline. Also mobile `v22`. |

### Regressions and new defects in M3
1. **The Hot Streak rig exposes a dead end of the gym** (`g10`, mobile `g10`):
   - A black band behind the backboard (desktop y 100-200).
   - No baseline crowd, and the right half is a dark void.
   - The stanchion base box sits dead center over "TRO▮ANS".

   In the one mode that is staged like a showcase, the frame is mostly empty floor and black.
2. **The "YOU" chevron slides under the score bug** when the user is near the far sideline (`v10`: the "YOU" label is half-hidden under the bug's bottom edge). Gameplay's own HUD occludes the most important marker.
3. **The live camera lets the ball handler reach the frame edge** (`g07`: YOU at x about 1200 of 1280). This is not proven new, but it contradicts the new shot-safe-area work and should be covered by the same constraint.

---

## 4. Ranked remaining gaps (most impactful first)

Constraints honored: original art only, offline, 60 fps laptop / 30+ fps phone, existing rules and meter unchanged.

### 1. MAJOR: desktop live and shot composition: a high, far-sideline camera with empty foreground
- **Ours:** `g04`/`g05`: the shooter is a 70 px figure on the far sideline whose head overlaps the crowd. The rim is jammed at the upper right. The bottom 40% is bare wood. `g09`: 55% empty floor. `g07`: the handler is at the right edge.
- **Benchmarks:** `hoopland-1.jpg` uses the full frame height for the play with a near-side crowd band. Broadcast 2K frames keep the ball handler between 30% and 70% of the width.
- **Fix:**
  - **Camera:** drop the camera height about 25% and dolly it to the near sideline so the far sideline sits at y about 20%, not y about 30%.
  - **Bias:** give the look-at a near-side bias so the empty band is under 15%.
  - **Dead zone:** add a dead-zone follow that keeps the ball handler inside x 20-80% and y 25-75%, with a 0.25 s lead in the movement direction.
  - **Shots:** keep the rim safe area and also require the shooter's head to sit below the crowd line (screen y of the head is at least 6% below the far sideline's projection), by pitching down 3-5° during gather.
  - **Test:** extend the existing safe-area test to the ball handler in live frames.

### 2. MAJOR: the shot has no payoff on screen, and the ball still vanishes into the crowd
- **Ours:** still no make capture. The desktop ball at its apex sits among faces (`g04`/`g05` crops); the halo is too subtle. No trail anywhere. Mobile shows a stray yellow disc (`g05`, `v22`).
- **Benchmarks:** `playgrounds2-3.jpg`: a glowing ball with a comet trail. `bbclassics-4.jpg`: a full-width "3 POINTS" slam.
- **Fix:**
  - **Trail:** an 8-10 segment additive ribbon trail (0.25 s, white to warm, depth test off; one draw call).
  - **Crowd dip:** a 120 px screen-space dim of the crowd behind the ball while it is airborne.
  - **Disc:** delete or hide the yellow disc on release.
  - **On a make:** net vertex snap, a home-section stand swap, a 120 ms push-in, and a team-color display-face callout ("3!", "SWISH", "AND-ONE"). Respect Reduced motion.
  - **Capture:** add `g13-make` and `g14-miss` to the GPU capture. A third milestone without them should not be scored on feel.

### 3. MAJOR: no light hierarchy, and residual reflection ghosts
- **Ours:** the gym crowds are at floor brightness (`g04`, `g08`, `g09`), so the eye has nowhere to land. White-jersey ghosts remain (`g02`). No pools, no vignette. `v10` #53 is black on the harness tier.
- **Benchmarks:** `nba2k25-2.jpg`/`nba2k26-2.jpg`: a dim house, a hot floor. `bbclassics-1.jpg`: the same effect in 2D with bloom and a vignette.
- **Fix:**
  - **House:** multiply the crowd by about 0.65 in gyms and 0.45 in the arena.
  - **Floor:** 4-6 baked soft pools on the floor texture.
  - **Vignette:** a screen vignette on all tiers.
  - **Reflections:** fade them by height (`exp(-h/0.5 m)`) with a Fresnel weight (under 0.08 in the foreground), capped at 0.15.
  - **Skin:** a skin luminance floor of about 0.16 and a rim term on every tier.

### 4. MAJOR: the enclosure is still hollow: empty benches, baseline black bands, nothing on the near side
- **Ours:** chair rows with no players in every gym. A black band between the end wall and the baseline (desktop `g10`, mobile `g03`-`g05`, `g10`). Hot Streak's right half is empty. Black stanchion boxes. The near sideline is a flat paint strip (`g09` red band).
- **Benchmarks:** `hoopland-1.jpg` shows benches with players and coaches, photographers and baseline fans on all four sides.
- **Fix:**
  - **Benches:** fill them with 5 instanced bench sprites plus a coach per team in uniform colors.
  - **Baseline ends:** close the black band with baseline bleacher sprites or a padded wall with doors and a "HOME OF THE …" mural.
  - **Stanchion bases:** pad them in team color.
  - **Near side:** add a cropped near-side strip (table backs, a photographer, a heads band).
  - **Test:** assert that no clear-color pixels appear in any gameplay frame.

### 5. MAJOR (mobile): the portrait rig still wastes the top of the screen and slices the place
- **Ours:**
  - On offense nearly the whole court is visible (mobile `g05`, `g08`).
  - The top quarter of the play area is a bare wall plus a black void (mobile `g04` y 140-500 device px).
  - Banners are cropped by the HUD.
  - Every baseline wordmark is cut by the stanchion base ("TRO▮ANS", "RA▮S", "STATE ▮NALS", "RED ▮VILS").
- **Fix:**
  - **Rig:** lower the pitch about 8-10° and frame from the ball handler to 3 m past the baseline, so players reach 55-65 css px.
  - **Top band:** fill it with the end-wall crowd, with the banners moved about 40 px below the HUD.
  - **Wordmarks:** split each wordmark around the stanchion (left and right of the base) or move it to the sideline aprons. Alternatively, extend the dither fade to the base whenever it overlaps paint text.

### 6. MAJOR: menus, title and team select are still web cards, and select still overflows
- **Ours:** `g01` and mobile `g01` show the same cream modal, with the bottom wordmark cropped ("AKE HAMILTON", "NING ST"). `g11` cuts "Quarters" at 800 px, and mobile `g11` needs a long scroll. The body text is a generic sans. These are the first screens anyone sees.
- **Benchmarks:** `hoopland-4.jpg` uses big color-identity rows. `nba2k25-4.jpg` uses a dark kit with condensed headers.
- **Fix:**
  - **Title:** a dark navy-and-gold side rail over a slow 3D orbit of the gym, with the wordmark fully in frame.
  - **Team select:** a two-step Home then Away select with large crests and a turntable of the real 3D jersey.
  - **Face:** one condensed athletic face throughout.
  - **Test:** select fits in 1280x800.

### 7. MAJOR (in Hot Streak): the new rig is aimed right but staged empty
- **Ours:** `g10` shows a 120 px shooter in a sea of floor, a black band behind the board, crowd only on the left, no ball racks, and the stanchion over "TRO▮ANS".
- **Benchmarks:** `playgrounds2-3.jpg`: a low camera, a shooter filling a third of the height, racks in the foreground, the venue framing the rim.
- **Fix:**
  - **Camera:** drop it to about 2.2 m and move it 3 m behind the shooter (shooter about 30% of the frame height, rim upper-middle).
  - **Props:** add two instanced ball racks at the spots (cheap spheres).
  - **Crowd:** put a baseline crowd behind the hoop and light that end with a pool.
  - **HUD:** a large in-world streak counter beside the HUD in the display face.

### 8. Minor at gameplay distance: mannequin players and body merging
- **Ours:** `v12` shows a faceless head that fills the frame. `v10`: mitten hands, pipe limbs, a ball twice the head width, and the #53 silhouette. `g02`: #12 merges into the handler.
- **Benchmarks:** `playgrounds2-1/2.jpg` keep players and crowd in one stylized family.
- **Fix:**
  - **Faces and bodies:** add a nose and mouth to the face decal, 6-8 hair meshes, tapered limbs, and 3-segment hands.
  - **Collision:** a 0.35 m capsule push-out at the animation layer.
  - **Ball scale:** clamp the ball's screen size near the camera to 0.6x head.
  - **Near clip:** near-clip players who get within 1.5 m of the camera, or dither-fade them.
  - **Crowd:** posterize it to 5-6 tones so it matches the players.

### 9. Minor: desktop place identity: no banners in play, a dark-gym arena, a repeated crowd
- **Ours:** no title-year banner in any desktop gameplay frame (`g02`-`g10`). `g07` arena: no readable ribbon, no floor pool, "HOT SPR" cropped at the right. In the `g05` crop the same sprites repeat within a few seats. The Hot Springs crowd is orange, not gold.
- **Fix:**
  - **Banners:** hang them on the far wall just above the top bleacher row, below the HUD at the gameplay camera, and test that one is fully visible in `g02`.
  - **Arena:** an emissive ribbon at 2x height, a floor pool, the house at 0.45, and the apron fully in or out of frame.
  - **Crowd:** a seeded shuffle that bars the same sprite within 3 seats, plus flip, scale and luminance jitter.
  - **Palette:** map Hot Springs to metallic gold (#C9A227) plus black.

### 10. Minor: HUD polish
- **Ours:** the bug is about 655 px wide over the crowd and hides the YOU chevron (`v10`). "FOULS" is about 10 px. The `g03` meter sits on the crowd band.
- **Fix:**
  - **Bug:** shrink it to about 45% width (team plate, score, clock), styled as the in-gym scoreboard, with labels 12 px or larger.
  - **YOU chevron:** clamp it below the bug's bottom edge, or flip it under the player when it would collide.
  - **Meter backing:** give the meter a dark backing card that extends 8 px beyond it when it overlaps the crowd.

---

## 5. What must be kept

1. **The shot safe-area constraint** (rim in frame in `g03`-`g05`) and its test. Extend it, do not loosen it.
2. **The Hot Streak behind-shooter axis** (`g10`). Lower it and fill it; keep the axis.
3. **The portrait stanchion dither fade** (mobile `g02`, `g08`).
4. **Replays without HUD or controls, with letterbox and the "REPLAY · THREE" plate** (`g06`).
5. **The floating score bug and the cleaned Hot Streak panel** ("READY", "STREAK" dots).
6. **The meter clearing at release, and the plated grade word** (`g04`, mobile `g04`).
7. From earlier milestones: contact shadows, legible numbers, the double YOU ring, per-school floors and crests, school-tinted crowds, the pep band and cheer at the corners, the arena bowl with confetti (`g12`), the GPU wood grain, the 2D fallback (`v60`), and the mobile control cluster.

## 6. Suggested order of work

1. **Desktop camera** (gap 1) and **portrait rig** (gap 5), with safe-area tests on live frames and the YOU chevron.
2. **Trail, crowd dip, disc removal and the make/miss payoff**, plus `g13`/`g14` captures (gap 2).
3. **House dimming, pools, vignette and reflection fade** (gap 3).
4. **Enclosure: benches, baseline ends, near side; and the Hot Streak staging** (gaps 4, 7).
5. **Menus, title and select** (gap 6).
6. **Characters, desktop banners, arena, HUD polish** (gaps 8-10).

If items 1-3 land and are visible in captures, I would expect roughly: Readability 7.5, Animation & feel 6, Lighting 6.5 and Mobile 7.5, for an overall of about 6.6.
