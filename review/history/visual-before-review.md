# Spa City Hoops: adversarial visual review (baseline "visual-before")

Reviewer stance: independent and deliberately harsh. The comparison is against shipped commercial and acclaimed indie basketball games, not against other browser prototypes.

Inputs reviewed:
- All 14 contact sheets (`screenshots/visual-before/sheets/desktop-01..08.png`, `mobile-01..06.png`).
- Full-size frames: desktop `01-title`, `10-tipoff`, `11c-shot-meter`, `12b-score`, `14-freethrow`, `23-arena-final`, `24-champion`, `26-exhibition-girls`, `27-shootout`; mobile `11c-shot-meter`, `23-arena-final`.
- Benchmarks: all 17 files in `benchmarks/` (NBA 2K25 x4, NBA 2K26 x2, NBA 2K Playgrounds 2 x3, Hoop Land x4, Basketball Classics x4).

Caveat: animation and game feel are judged from still frames (poses, effects and motion cues). The benchmark set has no portrait-mobile title, so the mobile reference score is a judgment call (noted below).

---

## 1. Verdict in one paragraph

This is a clean, competent, flat-vector prototype with excellent *content* authenticity (real title-year banners, sourced facts, original crests) and almost no *visual* authenticity. In play it reads as a tactics board: a plan-view rectangle of wood, a one-row polka-dot crowd strip along the top, black voids past the baselines, tabletop-miniature "bases" under every player, a backboard drawn as a hairline, and a shot meter about the size of a jersey number. Lighting does not exist. The menus are a web settings page in a cream card. Nothing on screen says "Friday night in a packed Arkansas gym" or "state finals in a big arena", except text. Mobile portrait has workable controls, but the camera often hides the basket you are shooting at, and a band of dead brown sits between the court and the controls. The overall impression is about 4/10 against Hoop Land or Basketball Classics, and about 2/10 against 2K.

---

## 2. Scores (1-10)

| Category | Spa City Hoops | Best benchmark (reference) | Notes |
|---|---|---|---|
| Art: players, court, venue | **4** | **10** NBA 2K26 (stylized ref: Hoop Land **8**) | Court lines and crests are tidy. Players are one body template; the venue is a strip. |
| Lighting & materials | **2** | **10** NBA 2K25 (stylized ref: Playgrounds 2 **8**, BB Classics **6**) | Perfectly flat, no light falloff, gloss, vignette or real shadows. |
| Animation & game feel (from frames) | **3** | **10** NBA 2K25/26 (arcade ref: Playgrounds 2 **9**, BB Classics **8**) | Stiff, limited poses. Shot feedback is tiny (a `+3` and a puff). |
| UI / HUD | **4** | **8** Hoop Land (in-game bug and menus), 2K25 **8** (menus) | The top HUD is two huge, empty bars. Menus are generic form controls. |
| Typography | **4** | **8** Hoop Land | System sans everywhere, plus one display wordmark and a clashing outlined callout font. Desktop tables run about 11px. |
| Readability (teams, ball, you, meter) | **6** | **9** Hoop Land | Team colors and numbers read well. The ball, the YOU marker and the meter are weak, and clumps turn to mush. |
| Mobile (390x844 portrait) | **5** | **~8** (no portrait title supplied; Hoop Land's mobile port is the closest stylized reference) | Good thumb controls. The basket is often off-screen, there is a dead band, and the court is a cropped landscape slice. |
| Authenticity of setting (AR HS gym / state-finals arena, local identity) | **5** | **10** NBA 2K26 (place identity: Playgrounds 2 **9**, team-branded floors: Hoop Land **8**) | Content: 8/10. Visuals: 3/10. The arena final is barely distinct from a home gym. |
| **Overall (unweighted)** | **4.1** | ~9 | |

---

## 3. Ranked gap list (most impactful first)

Each item gives the problem in our frames, what the benchmark does, and a fix. All fixes keep the existing rules, shot meter logic and bracket, and use original art.

### 1. The venue is a strip, not a room
- **Ours:** the crowd is a single band of colored dots on one sideline (every gameplay frame; most visible in `11c-shot-meter`, `12b-score`, `14-freethrow`). There is pure black past the baseline (`11c`, `12b`, `14`; flat team-color fill in `26`, `27`). Nothing appears on the near sideline, so the court floats in a void. At 1280px the dots read as polka-dot wallpaper, not people.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` wrap the floor on all sides with seated fans, a bench row, camera operators, a scorer's table and apron branding, so the court sits *inside* a building. `nba2k25-1.jpg` fills the whole frame with a crowd that reacts.
- **Fix:** build a full enclosure.
  - A near-sideline foreground band, cropped at the bottom edge: scorer's table, two benches, cheer squad and band in the corner.
  - Baseline end walls with gym wall pads, an exit door, and a padded stanchion base.
  - Folding wooden bleachers with real people silhouettes. Use 3-4 body shapes x 2-3 idle/cheer frames, palette-swapped per school, pre-rendered once into a sprite atlas and drawn as instanced quads or one cached canvas layer. That costs almost nothing per frame.
  - Fill the student section with the home colors.
  - Never let the camera show black.

### 2. No lighting or materials at all
- **Ours:** the floor is one uniformly lit plank texture. There is no falloff, no gloss and no reflections. Players have flat fills. The "shadows" are opaque dark discs. Crowd, floor and HUD all sit at the same brightness, so nothing pops (`10-tipoff`, `23-arena-final`).
- **Benchmarks:** `nba2k25-2.jpg` and `nba2k26-1.jpg` use rim light, spot pools and a dim house, so the eye goes to the player and the ball. `bbclassics-1.jpg` gets most of that effect in 2D with bloom and an edge vignette on a pale floor.
- **Fix:** add baked, cheap lighting:
  - One or two radial light pools on the floor from overhead fixtures (a pre-rendered overlay).
  - A glossy floor reflection: a vertically flipped, blurred, 15-20% alpha copy of players, banners and stanchions, clipped to the court.
  - A darker crowd (about -35% luminance) so the court is the brightest thing on screen, plus a screen vignette.
  - Soft elliptical blob shadows instead of hard discs.
  - Two-tone cel shading on players, with a light-side highlight on jerseys and skin.
  
  All of these are static or per-sprite and fit the 60/30 fps budget.

### 3. The shot moment has no payoff
- **Ours:**
  - The meter is a roughly 8x50 px vertical sliver beside the shooter (`11c-shot-meter`, `27-shootout`).
  - "PERFECT" is a tiny green outlined word (`12-three`).
  - A make is a small `+3` that overlaps the backboard, plus a little puff (`12b-score`).
  - There is no ball trail, no net reaction, no crowd reaction and no camera response.
- **Benchmarks:** `playgrounds2-2.jpg` shows a large, readable arc meter with a red-to-green gradient. `playgrounds2-3.jpg` shows a glowing ball trail on release. `bbclassics-4.jpg` fills the screen with "3 POINTS" plus a speed streak.
- **Fix (same meter logic, new presentation):**
  - Scale the meter 2-2.5x. Keep it player-anchored but offset so it never covers the ball or the hoop.
  - Give it a lit "green window" band, a release tick, and a 120 ms flash in the grade color.
  - Use large grade words (EARLY / GOOD / PERFECT / LATE) in the display font on a solid plate.
  - On release, add a ball trail (6-8 fading ghost circles) and a soft arc-apex highlight.
  - On a make: animate the net (3-4 frames), shake the rim on a miss, add a camera micro-punch (respecting reduced motion), a crowd "stand up" frame swap, a scoreboard digit flip, and a brief team-color banner callout ("3!", "AND-ONE", "BUZZER").
  - Keep everything opt-down under Reduced motion.

### 4. The basket is an afterthought
- **Ours:** the backboard is a vertical hairline with a tiny orange rim and net. The stanchion is a dark L drawn into the void (`11c`, `12b`, `14`, `26`, `27`). The target is the smallest object on screen besides the ball.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` draw the backboard as an angled glass panel with a shooter's square, a thick padded stanchion and a visible net, so the goal is a landmark. `nba2k25-2.jpg` shows the glass, the shot-clock tower and the stanchion pad.
- **Fix:**
  - Draw the backboard as a foreshortened parallelogram: translucent glass with a white border and an orange inner square.
  - Scale the rim about 1.4x and give it a 3D-looking hoop (two ellipses plus a front lip).
  - Add a net with sway frames, a team-color padded stanchion base on the floor, and a shot-clock box on top.
  - Make the hoop the brightest object on that half of the court.

### 5. The mobile portrait camera hides the basket and wastes space
- **Ours:** in `mobile/11c-shot-meter` the player is shooting and **the hoop is not on screen**. The same happens in `mobile/11-dribble` and `11b-pass`. A 150-200 px band of empty brown sits between the court and the control panel (mobile `11c`, `12-three`, `14-freethrow`). The court is the landscape view cropped to a narrow slice, so players are about 55 css px tall and most of the half-court is out of frame.
- **Benchmarks:** none in the set are portrait. All of them keep the target basket and the ball handler in frame at all times (`hoopland-1/2`, `bbclassics-1`).
- **Fix:**
  - Give portrait its own camera. Either rotate the court 90 degrees so the attack runs up the screen with the basket at the top (best use of a tall screen), or keep the landscape court but bias the camera so the attacking rim is always inside a 10% safe margin.
  - Remove the dead band: extend the court down to the control panel, or use that band for the score bug, meter grade callouts and the player name and number.
  - Draw an edge arrow pointing toward the basket when it is off-screen. One already exists for the ball (`mobile/12b-score`).

### 6. Players read as tabletop miniatures
- **Ours:**
  - Every player stands on an opaque dark ellipse that reads as a miniature's base (`10-tipoff`, `12b-score`, `23-arena-final`).
  - Every player faces the camera at all times with the number on the chest, even while running away from it. Direction of movement is unreadable.
  - Every player has the same height and build. A 5'5" guard and a 6'3" center (`05-roster`) look identical.
  - Arms are thin sticks and the poses are few.
- **Benchmarks:** `hoopland-2.jpg` sprites face the direction of travel and show backs. Bodies vary, players lean into runs, and each has a soft shadow, not a base. `bbclassics-3.jpg` shows deep athletic stances with bent knees and wide arms.
- **Fix:**
  - Replace the bases with soft shadows. Only the user and their matchup get rings.
  - Add at least 4 facings: front, back with the number on the back, and left/right 3/4. Pick the facing from the velocity vector.
  - Scale sprite height by roster height (about ±12%) and use 2-3 build widths.
  - Bend the knees in stance and give the arms proper shapes.
  
  This is the single biggest "looks like a real game" lever after the venue.

### 7. The ball is hard to find
- **Ours:** the ball is about 10-12 px and orange on a tan-orange floor, with no outline (`10-tipoff` above the jumpers, `11b-pass`, `26-exhibition-girls` at #35's hip). In the `17-ai-game` pile it is effectively invisible.
- **Benchmarks:** `nba2k26-1.jpg` makes the ball a hero object with seams and specular highlights. `hoopland-1.jpg` gives it a dark outline and draws it above everything.
- **Fix:**
  - Scale the ball about 1.4x and add a 1.5 px dark outline, seam lines and a highlight dot.
  - Always draw the carried or in-flight ball on top of the player stack.
  - Keep and strengthen the floor shadow already present in `12-three` (a good cue).
  - Add a subtle glow or halo while it is loose, so rebounds are trackable.

### 8. "YOU" and selection cues are tiny and get lost in clusters
- **Ours:** "YOU" is about a 10 px chevron with tiny text. In `10-tipoff` it sits on top of a player's number (#42), and in the `17-ai-game` cluster you cannot tell who anyone is. On mobile it is about 6 css px of text.
- **Benchmarks:** `bbclassics-1.jpg` uses a bright colored floor marker plus a big numbered pin. `playgrounds2-*` put the controlled player's name in the HUD.
- **Fix:**
  - Put an animated, bright team-color floor ring under the user, with a short pulse on switch.
  - Show a larger chevron with the player's number (not the word "YOU") that floats above the head and never overlaps another sprite's number (collision-offset it).
  - Add an off-screen edge indicator.
  - On defense, draw a dashed ring under your matchup.

### 9. Clumps become unreadable
- **Ours:** at the tip (`10-tipoff`: 31/42/YOU/45/15 overlap), in post-ups (`17-ai-game`: five players stacked) and around the inbound (`28c-throwback`), numbers overprint each other and limbs merge.
- **Benchmarks:** `hoopland-2.jpg` keeps a 1 px dark outline around every sprite, depth-sorts strictly, and its players rarely overlap their heads.
- **Fix:**
  - Give every sprite a 1.5-2 px outline: darkened jersey color, so it also encodes team.
  - Strictly y-sort by feet.
  - When sprites overlap, fade the farther one's number plate, or show the user's sprite as a silhouette through others.
  - As a presentation-only tweak, nudge render positions apart by a few pixels when feet circles overlap. This does not change the simulation.

### 10. The top HUD is two empty slabs
- **Ours:** on desktop, two panels about 575 px wide span the whole top. Each holds a 3-letter code, a score and a tiny "F 0", and is roughly 85% empty (`11c`, `12b`, `23`, all gameplay). Foul and bonus info is microscopic ("F 0 BONUS" in `14b-bonus`). The panels steal about 9% of vertical space from the venue.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` use one compact centered bug (about 45% width) with team-color blocks, a crest, the score, period, clock and shot clock. `playgrounds2-1.jpg` uses a translucent bar so the scene shows through.
- **Fix:**
  - Use a compact, centered score bug of about 480-560 px desktop and full width on mobile.
  - Design it as an original **vintage gym scoreboard**: dark steel housing, team-color name plates, amber "bulb" digits for the score, red for the clock and blue for the shot clock (keep the current color logic), with foul pips and a lit BONUS lamp.
  - This turns the HUD into a local-identity asset instead of a UI chrome bar.
  - Free the top corners for the venue.

### 11. Event callouts are low-contrast and inconsistent
- **Ours:**
  - "SHOOTING FOUL" in `14-freethrow` is pink outline text on tan wood and is barely legible.
  - "SHOT CLOCK" (`13-shotclock-violation`) and "FOUL" (`14b-bonus`) look the same and are about 12 px.
  - They use a pixel or outline font that matches nothing else in the game.
- **Benchmarks:** `bbclassics-2.jpg` sets "PICK N' ROLL - IN" on a solid white plate with heavy black type. `bbclassics-4.jpg` uses a huge plate with a streak.
- **Fix:**
  - Create one callout component: a solid plate in team or neutral color, the display font at 28-40 px desktop and 22 px mobile, a slide-in plus hold plus wipe-out animation, and a whistle icon for fouls.
  - Place callouts in a fixed band, not floating over the floor.

### 12. Menus look like a web form, not a game
- **Ours:**
  - `01-title` is a cream modal over a dimmed court, with a half-hidden player peeking from behind the card.
  - `03-settings` and `20-season-setup` are rows of bordered toggle buttons.
  - `04-select` uses small cards with small crests and "game colors" pills.
  - `22-bracket` is a list, not a bracket.
- **Benchmarks:** `hoopland-4.jpg` gives each team row a big color-identity block, a portrait and a strong hierarchy. `hoopland-3.jpg` frames stats in a consistent game UI kit with a shot chart. `nba2k25-4.jpg` uses bold section headers, a progress bar and an accented grid.
- **Fix:**
  - Commission original **title key art**: an illustrated Hot Springs night scene with Bathhouse Row and Arlington-style silhouettes, the mountain tower, steam rising, and a lit gym or arena in the foreground with a player silhouette. This is also the identity anchor.
  - Team select: big team-color tiles with a large crest, a jersey swatch rendered as an actual jersey, and the class badge.
  - Season setup as a stepper (Program → School → Length → Difficulty).
  - The bracket as an actual tree, with lines and the Bank OZK Arena final node at the right, styled like a printed state-tournament poster.
  - Settings can stay plain, but use the game's type and panel styling.

### 13. Typography has no system
- **Ours:**
  - System sans everywhere.
  - One heavy display wordmark (HOOPS) on the title only.
  - An outlined pixel font for in-game callouts.
  - Desktop body and tables at about 11 px (`02-help`, `05-roster`, `16-final`, `07-break-fact`), with headings barely larger than body.
- **Benchmarks:** `hoopland-3.jpg` and `hoopland-4.jpg` pair one display face for headers with a clean sans for data, at generous sizes. `nba2k25-4.jpg` uses heavy condensed caps for headers.
- **Fix:**
  - Bundle two OFL fonts offline (woff2, subset): a condensed athletic display face for headers, scoreboard plates, callouts and jersey numbers, and a highly legible UI sans for body and tables.
  - Set a minimum of 14 px desktop body and 13 px tables, with tabular numerals.
  - Use a 4-step type scale.
  - Retire the outlined pixel font.

### 14. The state final at Bank OZK Arena looks like a recolored gym
- **Ours:**
  - `23-arena-final` uses the same dot crowd, now on navy, a navy apron and a center sunburst.
  - The only signifiers are two "STATE FINALS" plates, which are **clipped at both screen edges and overlapped by the pause button**. The same clipped plate appears in `22-bracket` and `28b-challenge-play`.
  - Nothing about it is bigger, darker, louder or more important than a Tuesday home game.
- **Benchmarks:** `nba2k25-2.jpg` and `nba2k26-2.jpg` show a dark house, LED ribbon boards, a shot-clock tower, a hanging scoreboard and a vast multi-tier crowd. `playgrounds2-3.jpg` shows how a strong lighting palette alone makes a place feel special.
- **Fix:** create a dedicated arena skin, kept generic since the venue art is unconfirmed:
  - House lights down and spotlit floor.
  - A two-tier bowl, with the upper deck smaller and darker.
  - A center-hung scoreboard silhouette at the top edge.
  - A continuous LED ribbon with original generic copy ("STATE CHAMPIONSHIPS" / class / year).
  - A neutral championship floor: a different stain, a center "STATE FINALS" mark, and both schools' names on the baselines.
  - A media table and photographers on the baseline.
  - Fix the plate clipping and pause overlap.

### 15. Big moments end in a modal
- **Ours:**
  - `24-champion` (the climax of the whole mode) is a cream card with a pennant and a crest over a dimmed empty court, with a few speck-sized confetti pieces.
  - `16-final`, `27b-shootout-end` and `15-halftime` are also cards. Halftime and break cards are dominated by all-zero stat tables (`07-break-fact`, `15-halftime`).
- **Benchmarks:** `bbclassics-4.jpg` uses a full-screen typographic moment plus a big player cut-in. 2K's cinematic framing (`nba2k25-3.jpg`) shows the value of a hero shot.
- **Fix:**
  - Build a full-screen champion sequence: the floor stays visible, players run to center and pile up (a pre-posed cluster), team-color confetti at 5-10x the current size and density, the banner unfurls from the rafters with the year, and a trophy illustration. The summary card follows.
  - Final and halftime: lead with a big score and a top-performer card with the player sprite enlarged, plus a shot chart (made and missed dots on a half-court, an original rendition of the idea in `hoopland-3.jpg`). Collapse the zero-stat table by default.

### 16. The floor carries no school identity
- **Ours:** every school's center circle is the same template (a crest inside a laurel sunburst), only recolored (`06-gym-hs-girls`, `06b-gym-lakeside`, `06c-gym-jessieville`, `26`, `27`). There is no wordmark on the apron or baseline, and the Hot Springs gym has a black apron with a charcoal paint that looks unpainted.
- **Benchmarks:** `hoopland-2.jpg` uses a giant team letter at center, the team name running down the baseline and team-color paint and apron, so every gym is recognizable in one glance.
- **Fix:**
  - Make the apron the team color, with the mascot name ("TROJANS", "RAMS", "LIONS") on both baselines and the town or school name on the far sideline.
  - Vary center-court layouts by school (crest only, crest plus wordmark, big initial).
  - Give each gym 1-2 signature props: a stage at one end in older gyms, a bigger 6A gym for Lake Hamilton, wall murals in school colors.
  - Use per-gym wood tone and wear.

### 17. The gym has no people besides the ten players
- **Ours:** no referees (even on fouls, `14-freethrow`), no benches, coaches, cheerleaders, band, scorer's table or photographers, in any frame.
- **Benchmarks:** `hoopland-1.jpg` and `hoopland-2.jpg` show a ref, benches, a coach, camera crews and press row. `bbclassics-3.jpg` puts a ref at the center of the tip.
- **Fix:** add 1-2 refs (striped shirts) who track play loosely and pose for foul and violation calls, both benches, a coach who reacts, and cheer and band sprites. All of these are cheap, decorative and non-interactive.

### 18. Animation vocabulary looks thin (inferred)
- **Ours:** the frames show stance, arms-up defense, a stiff run with one leg forward, and a jumper with the ball overhead. Many players hold the same neutral pose (`10-tipoff`, `15b-overtime`). The tip jumper (#43) is the only dynamic silhouette.
- **Benchmarks:** `bbclassics-3.jpg` uses a deep coiled stance. `playgrounds2-1/2` show full extension dunks. `nba2k25-1.jpg` shows real set-point and release mechanics.
- **Fix:**
  - A 6-8 frame run.
  - A dribble cycle with ball bounce.
  - A 4-phase jumper: dip, rise, release with the guide hand, follow-through hold.
  - A defensive slide, box-out, a celebration (fist pump or point), and a dejected pose after a miss.
  - Squash and stretch on landings and on the ball at the floor.

### 19. Polish and composition bugs
- `01-title`: player #45 is half hidden behind the menu card. Hide the gameplay or compose it on purpose.
- `23-arena-final`, `22-bracket`, `28b-challenge-play`: "STATE FINALS" plates are clipped and covered by the pause button.
- `12b-score`: the `+3` collides with the backboard.
- `14b-bonus`: "BONUS" is microscopic inside the HUD.
- `02-help` and `02c-help-about` on desktop: help is a wall of 11 px text in a document layout.

---

## 4. What a three.js 3D upgrade would and would not solve

**It would solve, or make much easier:**
- Lighting and materials (gap 2): real light pools, floor reflections (a planar reflection or a baked environment), rim light on players, a dark arena house. These are cheap if baked into lightmaps.
- A hoop and backboard in true perspective (gap 4), and correct occlusion and depth in clumps (gap 9).
- The venue as an enclosure seen from a 3/4 broadcast angle (gap 1), with stands on all four sides and a real "big room" scale for Bank OZK Arena (gap 14).
- Player facing and rotation for free (gap 6), plus camera language: shot zoom, a slight dolly on makes, a champion orbit (gaps 3 and 15).
- A portrait camera (gap 5) becomes a camera parameter change rather than a re-layout.

**It would not solve:**
- Menus, typography, HUD design, callout design, celebration staging (gaps 10-13 and 15 copy/layout). These are 2D design work in any engine.
- Readability decisions (gaps 7-8): ball outline and scale, the YOU marker, meter size. Without them, 3D makes these worse (smaller on screen, perspective-shrunk far players).
- Local identity (gap 16): wordmarks, crests, gym props and key art still have to be authored.
- **Animation quality (gap 18). This is the trap.** Ten skinned characters with a few rough clips look markedly worse than good 2D. Credible 3D basketball needs locomotion blending, a dribble, a jumper, defense and reactions. Without mocap or a strong animator, expect "asset-store mannequin" results.
- Crowd quality: it still needs instanced billboard impostors with authored frames.

**Budget guidance for 60 fps on a mid laptop and 30+ on phones (three.js, offline-vendored as already done for mahjong):**
- Low-poly toon-shaded players (about 1.5-3k tris each, one 512 px atlas per kit with team-color tint via uniforms) and one shared skeleton.
- Baked lightmap for the court and stands, one directional light plus ambient, blob shadows (no realtime shadow maps on mobile).
- Crowd as an InstancedMesh of camera-facing quads with an atlas, using 2-3 frames of UV animation.
- Floor reflection: a pre-baked reflection texture plus screen-space fake on desktop only.
- Cap DPR at 2 on phones and use an adaptive resolution scaler.

**Recommendation:** a **2.5D hybrid** gets about 80% of the visual win at about 30% of the risk:
- three.js for the court, hoop, stands, lighting, camera and arena.
- Players as **camera-facing billboard sprites** with 4-8 directional painted frames (or pre-rendered from a single rigged model in Blender and baked to sprite sheets), plus soft shadows and outlines.
- This keeps 2D readability and art control, gets real depth, lighting and perspective, and keeps animation authoring tractable.

Full 3D characters are worth it only if the team commits to an animation pipeline.

---

## 5. Already good: keep these

1. **Real title-year banners per school** (`06-gym-hs-girls`: 1990/1997/1998/2015/2018 girls; `11c`: 1932/1996/1998 boys; `06b`: Lakeside 1945/2000). This is genuine, sourced local identity no benchmark has. Make them bigger and better lit, never remove them.
2. **Original crests and per-school color theming** of the apron, paint and center logo (`06b`, `06c`, `26`, `27`). The system is right; it needs more variation.
3. **Strong home-white vs colored-away contrast and large jersey numbers.** This is the best readability asset in the game (`23-arena-final`, `26-exhibition-girls`).
4. **Diverse player appearance:** skin tones, hair styles, and girls' programs with ponytails and buns, treated as first-class (`06*`, `23`, `26`).
5. **The scoreboard color logic:** a red game clock, a blue shot clock, and the "CLASSIC" label when the shot clock is off. Keep it in the redesigned bug.
6. **Mobile controls** (`mobile/*`): a large yellow SHOOT, a clear PASS/STEAL and SWITCH hierarchy, a big joystick, and context reduction (Hot Streak shows only SHOOT, `mobile/27-shootout`). This is the best part of the mobile build.
7. **The ball's floor shadow during flight** (`12-three`). It is a correct depth cue; scale it up.
8. **The labelled free-throw meter** ("FREE THROW 1 OF 2", `14-freethrow`). It is clear and should follow the new callout styling.
9. **Dark navy and gold theme** (`31-dark-title`, `31b-dark-hub`). It is more "game" than the cream theme; consider it the default for in-game overlays.
10. **Sourced "Did you know?" fact cards and honest disclaimers** (`07`, `21-hub`, `28-challenges`). Keep them, but present them with more visual weight.
11. **Accessibility settings:** reduced motion, text size, meter assist. Every new effect above must respect them.
12. **A performance-friendly flat pipeline.** Whatever upgrade is chosen must not regress the 60/30 fps targets.
