# Spa City Hoops: adversarial visual review, M2 (three.js 3D, real-GPU capture)

Reviewer stance: independent and deliberately harsh. The comparison is against shipped commercial and acclaimed indie basketball games, not against browser prototypes. I have not seen the developer's own assessment.

Inputs reviewed:
- **Real-GPU captures (high/medium tier), the main evidence:** contact sheets `screenshots/m2/gpu/sheets/desktop-01..02.png` and `mobile-01..02.png`. Full-size desktop `g01`-`g12` (1280x800) and mobile `g01`-`g12` (390x844, 2x device px). I also made enlarged crops of the `g02` mid-court clump, the `g04` meter and ball, the `g05` ball in flight, the `g07` arena corner, mobile `g05` and mobile `g08`.
- **Harness captures (SwiftShader):** all of `screenshots/m2/desktop` and `screenshots/m2/mobile`. The `m2/sheets` folder does not exist, so I built my own contact sheets. I looked closely at the forced-3D shots `v01`-`v60`, with a crop of the `v10` faces and of the mobile `v51` end wall. I looked at the 2D-fallback flow shots `01`-`32` for menus, typography and flow. `report.json` confirms the harness ran SwiftShader at "tier high" (desktop) / "tier medium" (mobile), about 56-58k tris and 86-116 draw calls.
- **Previous reviews:** `review/visual-before-review.md` (2D, 4.1) and `review/m1-review.md` (first 3D, 4.5).
- **Benchmarks:** all 17 images in `benchmarks/` and `SOURCES.md`.
- As instructed, I ignored the leftover scoreboard strip at the top of `g12-champion`.

Animation and game feel are inferred from still frames. No frame shows a made basket, a net, a callout or a dunk, so the payoff layer cannot be credited (see gap 4).

---

## 1. Verdict

M2 is a clear step forward and the first build that looks like a *game* rather than a tech demo. Most of the gain comes from fixing the m1 regressions:
- Players now have soft directional contact shadows.
- Jersey numbers are legible again at desktop play distance (`g02` #3, #14, #21, #42; `g08` #13, #21, #42).
- The user ring is a double ring that reads on any floor.
- The meter and grade word sit on solid plates.
- Crowds are tinted in the schools' colors.
- The cheer squad has moved out from behind the glass.
- Portrait has its own down-court rig, with the target rim in the top third (mobile `g03`/`g04`/`g05`/`g07`/`g10`).
- On a real GPU the image is clean, warm and coherent. `g02`, `g08` and `g12` would not embarrass a small commercial arcade release.

What still separates it from the benchmarks:
- **The desktop camera still loses the rim:** `g03` gather and the whole `g10` Hot Streak setup.
- **The ball in flight still disappears into the crowd** (`g04`, `g05`), with no trail.
- **The new floor reflections read as detached white ghosts.**
- **The portrait rig has three problems:**
  - It is so high and wide that players are about 25 css px tall.
  - The gym has vanished (no crowd, no walls, a black void above the rim).
  - When you defend, the action plays out underneath a black stanchion.
- **The arena, enclosure, menus and typography are mostly untouched.**
- **Up close the players are still smooth mannequins standing in front of a near-photographic crowd.**

Net: about +1 overall. The next point is mostly in camera and composition work again, plus a payoff layer.

---

## 2. Scores (1-10)

| Category | Before (2D) | M1 (3D, SwiftShader) | **M2 (3D, real GPU)** | Best benchmark | Why |
|---|---|---|---|---|---|
| Art: players, court, venue | 4 | 5 | **6** | 10 NBA 2K26 (stylized: Playgrounds 2 9, Hoop Land 8) | Per-school painted floors with wordmarks and crisp center crests (`g08`, `g09`, `g10`). Players are cleaner, with trims, numbers, socks, faces and buns. Crowds are school-tinted. Still mannequins up close (`v10`, `v12`), clashing with photographic crowd sprites. |
| Lighting & materials | 2 | 3 | **5** | 10 NBA 2K25 (stylized: Playgrounds 2 8) | Real wood grain, soft directional shadows and form shading on players. Dark skin holds form on GPU (`g02`, `g06`). But the crowd is as bright as the floor, there are no light pools, the reflections ghost, and black voids remain (`g02`/`g07` top-left, `g06` right half). `v10` #53 is still a black silhouette. |
| Animation & game feel (from frames) | 3 | 4 | **4.5** | 10 NBA 2K25/26 (arcade: Playgrounds 2 9, BB Classics 8) | The jumper, follow-through, close-out and celebration poses read well. Bodies interpenetrate in clumps (`g02` YOU vs ball handler). There is no trail, no visible make payoff, and the meter lingers after release (`g05`). |
| UI / HUD | 4 | 5 | **5.5** | 8 Hoop Land / 2K25 menus | The meter plate, grade plate, Hot Streak dots and mobile off-screen arrows (mobile `v40`/`v41`) are real improvements. The score bug still sits on a full-width 80 px bar. The menus are the unchanged cream cards, and the select screen still overflows at 1280x800 (`g11`). |
| Typography | 4 | 5 | **5** | 8 Hoop Land | Unchanged. Three faces: condensed display, generic web sans in menus, and a slab "READY" in Hot Streak (`g10`). Labels are about 9 px ("FOULS"). |
| Readability (teams, ball, you, meter) | 6 | 4 | **6** | 9 Hoop Land | Shadows, numbers, the ring and the meter plate all help. The ball against the crowd (`g04`, `g05`), the missing rim in `g10`/`g03`, the ghost reflections and the clumps hold it back. On mobile the numbers are unreadable. |
| Mobile (390x844 portrait) | 5 | 4 | **6** | ~8 (no portrait title in set) | The rim is in the top third and the ball travels over wood, a large structural win. Players are tiny, the place is gone, the stanchion covers defense (mobile `g02`, `g08`), and the meter covers players (mobile `g04`/`g05`). |
| Authenticity of setting | 5 | 6 | **6.5** | 10 NBA 2K26 (place identity: Playgrounds 2 9, Hoop Land 8) | School-color crowds, the pep band, cheer at the corners and per-school floors are good. The arena bowl with confetti (`g12`) has atmosphere. Title-year banners are still absent from desktop play, team benches are empty, and the Mountain Pine table is blank (`g09`). |
| **Overall (unweighted)** | **4.1** | **4.5** | **5.6** | ~9 | +1.1. Most m1 regressions are closed. Camera composition, the payoff layer and place identity cap it. |

---

## 3. Status of the m1 gaps

| m1 gap | Status | Evidence |
|---|---|---|
| 1. Gameplay camera frames the wrong things | **Partly closed** | Rim on screen in `g04`/`g05` (right edge) and `g02`/`g07`/`g08` (left). Still off-screen in `g03` gather and `g10` shootout. `v02` tip shows neither hoop. The bottom 30-40% of the frame is still empty wood (`g03`, `g05`, `g09`, `g10`). Far-wing shooters are still pinned against the crowd line. |
| 2. Portrait needs its own rig | **Closed structurally, with new problems** | Down-court rig with the rim in the top third (mobile `g03`-`g05`, `g07`, `g10`) and edge arrows (mobile `v40`, `v41`). New problems are covered in gaps 2 and 6. |
| 3. Shot moment and ball payoff | **Partly closed** | Meter on a bordered plate with a lit green window, and "EARLY" on a plate (`g04`). Ball has an outline (`v10`, `g06`). No trail in any frame. The ball is lost in the crowd (`g04`, `g05`). No make reaction shown. The desktop meter still sits over the crowd band. |
| 4. Flat lighting, crushed dark skin | **Partly closed** | GPU form shading, dark skin readable in `g02` (#1) and `g06`. Not done: crowd dimming, light pools, vignette. `v10` #53 is still pure black. |
| 5. No contact shadows | **Closed** | Every GPU frame. |
| 6. Numbers, YOU marker, team read | **Mostly closed on desktop, open on mobile** | Front and back numbers (`g02`, `g06` back "2"). Double ring. Mobile numbers are illegible at 25 css px. No ball-handler name plate. |
| 7. Mannequins vs photographic crowd | **Slightly improved** | Simple eyes and brows (`v10` #10), volumetric buns (`g06`). Hair is still a cap (`v12`), hands are still mittens, limbs are still pipes. The crowd is still photographic. |
| 8. Replay loses the subject | **Partly closed** | The shooter is now in frame from behind, with letterbox bars (`g06`). New problems are in gap 7. |
| 9. Enclosure holes and voids | **Open** | `g02` top-left slab, `g07` top-left black, `g06` right half charcoal, mobile `g04` black band above the rim. No near-side foreground layer. |
| 10. Title-year banners missing from play | **Barely started** | Present on the portrait end wall but sliced in half by the HUD (mobile `v51`). None in any desktop gameplay frame. |
| 11. State final reads as a recolored gym | **Partly closed** | `g12`/`v41` bowl with confetti and a darker house. Gameplay `g07` is still a gym with a sunburst, a black void top-left and a thin ribbon. |
| 12. Text clipping and z-fighting | **Open, in a new form** | Portrait baseline words are cut by the stanchion: "STATE ▮INALS" (mobile `g07`), "TRO▮ANS" (mobile `g10`), "RA▮S" (mobile `g04`). "HOT SPRIN…" is cropped at the bottom edge (`g07`). "WOLVES" is still sliced by the HUD (`v11`). |
| 13. Hot Streak HUD glyphs | **Partly closed** | Tofu boxes replaced by six dots. "STEAM" is still unexplained. "READY" uses a third, slab face (`g10`). |
| 14. Score bug generic and too wide | **Slightly improved** | About 655 px wide (was about 800). It still sits on an opaque full-width bar, labels are about 9 px, and it does not echo the in-gym scoreboard. |
| 15. Menus and title unchanged | **Open** | `g01`, `g11`, `31-dark-title`. |
| 16. Crowd generic and wrongly colored | **Mostly closed (color), open (repetition)** | School-tinted sections (`g04`, `g08`, `g09`). The same clasped-hands blonde sprite appears 4+ times in one `g04` crop. Hot Springs crowds are orange rather than gold (`g10`). |
| 17. Cheer squad behind the glass | **Closed** | Now at the baseline corners (`g04`, `g05`, `g08`). |
| 18. Ball scale at close range | **Open** | `v10`: the ball is about 2x head width. `g06`: the ball is about 100 px and larger than the shooter's head. |

---

## 4. Regressions and new defects (self-inflicted; fix first)

1. **Portrait players shrank from about 65 to about 25 css px.** Compare mobile `g04`/`g05`/`g07` with m1 mobile `v03`. Numbers are unreadable, and "YOU" plus the ring are the only identity cue.
2. **Portrait play has lost the gym.** No crowd, no wall, no banners are visible in mobile `g02`-`g05` or `g08`/`g09`. The frame is a wooden board, a dark void band above the far baseline (mobile `g04` y 260-410 device px) and a dark apron with upside-down lettering at the bottom (mobile `g02`).
3. **The stanchion occludes defense on portrait.** When your team defends the near basket, the post play happens under the black pole and backboard (mobile `g02`, enlarged mobile `g08`: a player behind the glass and the lane cut in half).
4. **Floor reflections read as ghosts.** White jerseys reflect as detached white wisps about half a body below each player, while dark limbs barely reflect (`g02` x380/550 y620-650, `g03` x500-520 y620-690, `g07` x860 y700, `g09` x750 y490). The strongest ghosts sit in the foreground, where real gloss is weakest.
5. **Hot Streak on desktop never shows the rim during setup** (`g10`). In m1 (`v51`) the rim was at least clipped at the edge. In the one mode that is only about shooting at the rim, the rim is the one thing off screen.
6. **Blank scorer's table for Mountain Pine** (`g09`: "HOME ... GUEST" with no name).
7. **Empty team benches read as hollow boxes** (`g07` x510-680 y215-235; `g02`, `g08` rows of empty chairs).
8. **Unexplained pale-yellow disc on the floor mid-flight** (mobile `g05` at about 263,388 device px; mobile `v22`). Either it is the ball's shadow drawn as a light, or it is a stray sprite. Either way it reads as a second ball or a bug.

---

## 5. Ranked gap list (most impactful first)

Constraints honored: original art only, offline, 60 fps laptop / 30+ fps phone, existing rules and meter logic unchanged.

### 1. The desktop shot camera still does not guarantee shooter, ball and rim in frame
- **Ours:**
  - `g03` gather: the rim is fully off-screen right, the shooter is about 70 px tall and pinned against the crowd line, and y 520-800 is empty wood.
  - `g10` Hot Streak: no rim at all, and the shooter is a 100 px figure in the middle of a 50% empty floor.
  - `v02` tip: neither hoop is visible.
  - `g04`/`g05`: the rim is wedged at the right edge.
- **Benchmarks:** `hoopland-1.jpg`/`hoopland-2.jpg` keep the attacking rim about 25% in from the edge with the play spread over the full height. `playgrounds2-3.jpg` (3-point contest) puts the camera behind the shooter with the rim center-frame. `playgrounds2-1.jpg` frames the shooter and the rim as a pair.
- **Fix:** the composer from m1 gap 1 is evidently only partly in.
  - **Hard constraint:** from gather to result, the attacking rim's projection must be inside x 12-88%, y 15-60%.
  - **Framing:** look-at at about 0.5 ball, 0.35 rim, 0.15 player centroid, plus a 10-15% push-in.
  - **Hot Streak:** give it its own rig: low behind-and-beside the shooter, rim in the upper middle, like `playgrounds2-3`.
  - **Bottom band:** raise the near-side bottom framing so the empty band shrinks to under 15%.
  - **Test:** in `visual.test.mjs`, project rim, ball and user for every shot frame, `g10` setup included, and fail if any of them is outside the safe area.

### 2. The portrait rig is too high and too wide: tiny players and no place
- **Ours:**
  - Mobile `g04`/`g05`/`g07`/`g10`: the whole court length is visible from a near-overhead pitch.
  - Players are about 25 css px tall (`g05` bottom row), and numbers are noise.
  - Mobile `g10` spends the bottom 45% of the view on the backcourt and center logo.
  - No crowd or wall is visible at all.
- **Benchmarks:** `nba2k25-1.jpg` and `playgrounds2-3.jpg` use a low, behind-the-play view in which the shooter is large and the venue fills the top. `hoopland-1.jpg` players are about 6-7% of the frame height; ours are about 3%.
- **Fix:**
  - **Pitch and length:** drop the pitch from near-overhead to about 50-55°. Frame from about 2 m behind the ball handler to about 3 m beyond the far baseline, roughly the attacking half plus 20%, not the full court.
  - **Players:** target a player height of 45-55 css px.
  - **Place:** let the far end wall, the banners and the baseline crowd fill the top 15-20% (that band is a black void today).
  - **Sidelines:** add sideline crowd slivers at the left and right edges.
  - **Backcourt:** in transition, pull back temporarily (dolly, not FOV) and push in again once the ball crosses half court.
  - **Hot Streak:** use a tight behind-shooter framing.

### 3. The ball in flight is still lost against the crowd (desktop) and has no trail anywhere
- **Ours:** `g04` (ball at x768 y152) and `g05` (crop: ball at x795 y130) show the ball reading as one more orange head in the stands. No trail in any GPU or harness frame (`g05`, mobile `g05`, `v22`). On mobile the ball is about 8 css px.
- **Benchmarks:** `playgrounds2-3.jpg` has a bright glowing trail against a busy background. `bbclassics-1.jpg` keeps the ball over the floor plane by camera choice.
- **Fix:**
  - **Trail:** add a ribbon trail of 8-10 segments, additive white to warm yellow, about 0.25 s long, drawn last with depth test off. This is one draw call.
  - **Halo:** add a 2 px light halo (not only a dark outline) while the ball is over the crowd band.
  - **Crowd under the ball:** locally dim the crowd behind the ball with a screen-space radial multiply (about 0.6, 120 px) while it is in flight.
  - **Mobile:** scale the ball up to about 1.4x while airborne.

### 4. There is no visible payoff for a make, and the meter lingers
- **Ours:** no frame shows a net snap, a rim wobble, a crowd stand, a callout or a camera punch. The 2D game had "+3" (`12b-score`), the 3D captures show nothing. `g05`/mobile `g05`: the meter and "EARLY" stay on screen through the flight and cover a teammate (mobile `g04`).
- **Benchmarks:** `bbclassics-4.jpg` uses a full-width "3 POINTS" slam with a speed streak. `playgrounds2-3.jpg` uses big circular counters and a glow.
- **Fix:**
  - **On a make:** net vertex animation, a 3-frame crowd-stand swap in the home section, a 120 ms push-in, and a display-face callout plate ("3!", "AND-ONE", "SWISH") in team colors.
  - **Meter timing:** fade the meter 150 ms after release, and offset it to the side away from the nearest player.
  - **Capture:** add `g13-make` and `g14-miss` to the GPU capture so the next review can judge this.
  - All of this must respect Reduced motion.

### 5. Floor reflections ghost instead of gloss
- **Ours:** see regression 4 (`g02`, `g03`, `g07`, `g09`). The reflections are bright, blurred, detached from the feet, and strongest near the camera.
- **Benchmarks:** `nba2k25-2.jpg` and `nba2k26-1.jpg` keep the floor gloss subtle, contiguous with the feet, and stronger toward the far court and the light sources.
- **Fix:**
  - **Height fade:** fade the reflected sample by its height above the floor (`exp(-h/0.5m)`), so shoes and shorts reflect but torsos do not.
  - **Fresnel:** weight the reflection by Fresnel (strong at grazing far court, under 0.08 in the near foreground).
  - **Strength:** cap the reflection at about 0.15 and desaturate it slightly.
  - **Fixtures:** add 4-6 baked fixture highlight streaks on the far half.
  - **Low tier:** keep the planar pass off.

### 6. Portrait defense plays out under the stanchion
- **Ours:** mobile `g02` and the enlarged mobile `g08` show the near-basket pole and board cutting through the lane while you defend. Upside-down baseline text fills the bottom band, and post players stand behind the glass.
- **Benchmarks:** no benchmark ever lets hoop geometry occlude a contested play. `hoopland-2.jpg` draws the near basket as a thin outline only.
- **Fix:**
  - **Occluders:** when the stanchion or board projects over any player or the ball, dither-fade it to about 25% (screen-door; no sorting cost) and drop the pole's shadow.
  - **Defense framing:** shift the look-at so the near paint sits at about 60-65% of the height rather than at the bottom edge.
  - **Alternative:** a 180° yaw swap on change of possession, with a 0.6 s eased swing (playtest it; it can disorient).

### 7. The replay is now aimed correctly but composed badly
- **Ours:** `g06` (and mobile `g06`):
  - The shooter is cut at the chest by the bottom letterbox.
  - The right half of the frame is a featureless charcoal wall, with no crowd behind the baseline.
  - The ball is about 100 px, larger than the shooter's head.
  - The referee's head pokes in at the bottom-left.
  - The live score bug and, on mobile, the full touch controls remain.
- **Benchmarks:** `nba2k25-1.jpg`: the shooter is full-height in the left third, the ball is above, and the crowd is a soft backdrop. `playgrounds2-3.jpg`: shooter and arc together, venue behind.
- **Fix:**
  - **Rig:** pull the camera back and up about 1.5 m with a 35-40° vertical FOV, so the shooter is in frame from knees to hands in the left third and the rim in the right third.
  - **Ball:** clamp the ball's screen size to 0.6x the shooter's head.
  - **Backdrop:** put baseline bleachers or a mural behind every hoop so replays never show an empty wall (see gap 9).
  - **Overlays:** hide the score bug and the touch controls during replays (keep tap-anywhere to skip).

### 8. Lighting: the house is as bright as the floor, and black voids remain
- **Ours:**
  - `g02`-`g05`, `g08`: the crowd sits at floor exposure, so the eye has no hierarchy.
  - No light pools, no vignette.
  - `g07`: the arena gameplay house is just as bright, against a black void top-left.
  - `v10` #53 is still a black silhouette under the harness tier.
- **Benchmarks:** `nba2k25-2.jpg`/`nba2k26-2.jpg`: a dim house, a hot floor, rim light on the players. `bbclassics-1.jpg` gets the same effect in 2D with bloom and a vignette.
- **Fix:**
  - **House:** multiply the crowd by 0.65 in gyms and 0.45 in the arena.
  - **Floor:** bake 4-6 soft light pools.
  - **Vignette:** add one on all tiers.
  - **Skin:** add the fresnel rim term and a skin-albedo luminance floor of about 0.16 on every tier, not only high.

### 9. The enclosure: voids, no near side, empty benches
- **Ours:**
  - `g02` top-left: a dark angled slab and a black box at the stanchion base.
  - `g07` top-left: pure black.
  - `g04` right edge: black.
  - `g06`: an empty wall.
  - Mobile `g04`/`g10`: a black band above the rim.
  - The near sideline has nothing (desktop bottom band).
  - The team benches are rows of empty chairs (`g02`, `g08`, `g07` hollow boxes).
- **Benchmarks:** `hoopland-1.jpg`/`hoopland-2.jpg` wrap the floor with benches, photographers and fans on all four sides. `playgrounds2-1.jpg` has no dead area at all.
- **Fix:**
  - **Benches:** seat 5 bench sprites plus a coach per team in uniform colors (reuse the crowd sprite pipeline with a jersey mask).
  - **Near side:** add a cropped near-side foreground strip: the scorer's table backs, a photographer, a front-row heads band.
  - **Baselines:** build baseline walls with pads, an exit sign, doors, a "HOME OF THE …" mural and bleachers.
  - **Stanchion:** pad the stanchion base in team color.
  - **Clear color:** never let it show.

### 10. Title-year banners are still not in desktop play, and they are sliced on mobile
- **Ours:** none in any desktop gameplay frame (`g02`-`g10`). On mobile `v51` the "2015 / 2018 STATE CHAMPIONS" banners exist but are cut in half by the HUD bar. The desktop title (`g01`) shows only name pennants ("EAGLES", "COBRAS"). The 2D fallback (`v60`, `10-tipoff`) still has them front and center.
- **Benchmarks:** `hoopland-2.jpg` puts the team identity where the camera always sees it.
- **Fix:**
  - **Desktop:** hang the real title-year banners on the far wall just above the top bleacher row, low enough to sit below the HUD at the gameplay camera, and on both baseline walls.
  - **Portrait:** drop them about 40 px so they clear the HUD.
  - **Lighting:** give them a small spot decal.
  - **Test:** at least one banner fully on-screen in `g02` and mobile `g04`.

### 11. Player models: still mannequins next to a photographic crowd
- **Ours:**
  - `v10`: #10 has a minimal eye and brow decal; #53 is a featureless black head.
  - Mitten hands; arms are uniform pipes with knob elbows.
  - `v12`: hair is still a smooth black cap.
  - `g02` crop: the YOU defender and the ball handler interpenetrate into one shape.
  - Behind them, the crowd is semi-photographic (`v10`, `v12`, `g05` crop).
- **Benchmarks:** `playgrounds2-1.jpg`/`playgrounds2-2.jpg` keep players and fans in one stylized family. `hoopland-2.jpg` uses one pixel style for everyone.
- **Fix:**
  - **Crowd:** stylize it down (posterize to 5-6 tones, 1 px outline, flatten faces).
  - **Players:** 6-8 volumetric hair meshes, 3-segment hands, tapered limbs, a nose and mouth on the face decal.
  - **Collision:** a capsule push-out between players (about 0.35 m) at the animation layer so bodies do not merge.

### 12. The state final still plays like a recolored gym
- **Ours:** `g07` gameplay: the same bleacher strip, a "STATE FINALS" table, a navy sunburst, a black void, a thin dark ribbon and a cropped "HOT SPRIN…" apron at the bottom edge. Only `g12`/`v41`, the wide and celebration shots, sell the bowl.
- **Benchmarks:** `nba2k25-2.jpg`/`nba2k26-2.jpg`: a bright LED ribbon, a shot-clock tower, a dark bowl, a floor pool.
- **Fix:**
  - **Gameplay camera:** a slightly higher, wider arena camera, so the second tier and a center-hung scoreboard silhouette show at the top.
  - **Ribbon:** an emissive ribbon at 2x height with scrolling generic copy.
  - **Lighting:** a floor spotlight pool and the house at 0.45.
  - **Apron:** move the "HOT SPRINGS · ARKANSAS" apron fully into frame or fully out.
  - Keep the venue art generic.

### 13. Score bug, Hot Streak HUD and typography
- **Ours:**
  - The bug (`g02`) is about 655 px wide on an opaque full-width 80 px bar. "FOULS" is about 9 px.
  - Hot Streak (`g10`): "READY" is set in a slab face that matches nothing else, and "STEAM" is unexplained.
  - Menus use a generic web sans.
- **Benchmarks:** `hoopland-1.jpg` uses a compact team-color bug of about 45% width. `playgrounds2-1.jpg` uses a translucent bar. `bbclassics-4.jpg` uses one HUD face throughout.
- **Fix:**
  - **Bug:** remove the full-width backing and float the bug with a shadow. Reskin it as the in-gym scoreboard (steel housing, amber digits, team plates). Labels 12 px or larger.
  - **Hot Streak:** use the display face only, and label the second panel "STEAM ×2 / NEXT RACK".
  - **Menus:** pick one menu face with personality (a condensed athletic sans) and stop using the default sans.

### 14. Menus and title are unchanged web cards, and the select screen still overflows
- **Ours:**
  - `g01`: the same cream modal over the 3D gym.
  - `g11`: a dense card grid with the Quarters row cut off at 1280x800.
  - Mobile `g11` needs a long scroll.
  - The night theme (`31-dark-title`) only follows the system setting; GPU captures show the cream cards.
- **Benchmarks:** `hoopland-4.jpg` uses big color-identity rows. `nba2k25-4.jpg` uses a bold dark kit with condensed headers.
- **Fix:**
  - **Title:** a slow 3D orbit backdrop with a navy and gold side rail.
  - **Team select:** a two-step Home, then Away flow with large crests and a jersey turntable on the real 3D model.
  - **Test:** select fits in 800 px.

### 15. Crowd repetition and the Hot Springs palette
- **Ours:** the `g04` crop shows the same clasped-hands blonde sprite 4+ times. The Hot Springs crowd is orange, not gold (`g10`, `g02`).
- **Benchmarks:** `nba2k25-1.jpg` shows varied home colors.
- **Fix:**
  - **Variation:** per-instance flip, ±6% scale, ±0.08 luminance, and a seeded shuffle that forbids the same sprite within 3 seats.
  - **Palette:** map Hot Springs to a true metallic gold (about #C9A227) plus black.

---

## 6. What must be kept

1. **Contact shadows** with directional stretch (every GPU frame). They are cheap and decisive.
2. **Legible front and back numbers** in trim color (`g02`, `g08`, `g06` back "2").
3. **The double YOU ring** and the "YOU" chevron (`g02`, `g08`). They read on every floor color.
4. **The meter plate with its lit green window and the plated grade word** (`g04`; mobile `g04`). Fix only its timing and placement.
5. **The portrait down-court principle, with the rim in the top third, and the off-screen edge arrows** (mobile `g03`-`g05`, `g07`; mobile `v40`/`v41`). Lower and tighten the rig; do not abandon it.
6. **Per-school floors:** paint colors, center crests and baseline wordmarks (`g08` purple, `g09` red, `g10` black, `g04` blue).
7. **School-tinted crowd sections** (`g04`, `g08`, `g09`).
8. **The cheer squad at the baseline corners and the pep band with sousaphones** (`g02`, `g08`).
9. **The arena bowl with confetti and the darker house** (`g12`, `v41`). Bring that look into gameplay.
10. **The ball's dark outline** (`v10`, `g06`). Add a halo and a trail to it.
11. **The GPU-tier wood grain and warm grade.** Keep the gloss, but fix the ghosting.
12. **The "REPLAY · THREE" plate and the letterbox** (`g06`).
13. **The 2D fallback with banners** (`v60`, flow `10`-`16`) as the low-end safety net, and the excellent mobile control cluster with Hot Streak's SHOOT-only reduction (mobile `g10`).
14. **Budget discipline:** about 56-58k tris and 86-116 draw calls even at high/medium. Every fix above (trail, dither fade, height-faded reflection, benches as instanced sprites, baked pools) fits inside it.

---

## 7. Suggested order of work

1. **Shot camera hard constraints (desktop and Hot Streak), plus a lower, tighter portrait rig with stanchion dither-fade** (gaps 1, 2, 6). Add safe-area tests for every shot frame.
2. **Ball trail, crowd dip behind the ball, and the make/miss payoff layer** (gaps 3, 4). Add make/miss frames to the GPU capture.
3. **Height-faded, Fresnel-weighted reflections; house dimming; pools; vignette** (gaps 5, 8).
4. **Enclosure: benches, baseline walls with banners in view, and replay recomposition** (gaps 7, 9, 10).
5. **Arena gameplay look; HUD, type and menu reskin** (gaps 12-14).
6. **Character art unification** (gap 11).

If items 1-3 land, I would expect roughly: Readability 7.5, Mobile 7.5, Lighting 6.5 and Animation & feel 5.5, for an overall of about 6.5. Past that, the ceiling is the character art and the menus.
