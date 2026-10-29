# REPORT: Spa City Hoops (`games/basketball`)

## What was built

An original arcade high-school basketball game set in Garland County, Arkansas. It ships as one
self-contained `index.html` (221 KB), built from `src/` (about 3,700 lines) with `shared/tools/inline.mjs`.
The seven real county schools are the setting. Every player is fictional.

- **Match engine (`sim.js`):** 5-on-5 on a 2.5D court drawn in code, run as a fixed 60 Hz step in a pure,
  JSON-serializable rules engine that also runs in Node.
  - **Shooting:** hold and release. A meter beside the shooter grades the release PERFECT, GOOD, EARLY or
    LATE. The make chance is rolled at release from distance, rating, the nearest defender's contest and
    the timing; the ball's arc is then solved to swish or hit the rim.
  - **Other play:** layups and dunks, passing toward the stick or to the most open teammate, steals,
    blocks, rebounds that land where physics says, out of bounds, and auto-subs by fatigue.
  - **Rules:** the 35-second shot clock (the one sourced rule) with rim and possession resets and the
    switch-off near the end of a period, plus a Classic no-clock option. Shooting fouls and and-ones,
    the bonus from the 5th team foul, foul-outs, a free-throw marker mini-game, a jump-ball tip-off with a
    timing bonus, the alternating arrow, halftime end swap, overtime and buzzer-beaters.
- **Team AI:** offense spots with cuts; a utility-scored ball handler (shoot, drive, pass or hold, with a
  patient half-court tempo); man-to-man defense with interposition, a help defender and contest jumps;
  rebound crashing. Three difficulties. The user's teammates are AI-driven, and the user controls the ball
  handler or the defender nearest the ball (auto-switch with hysteresis, or switch by hand).
- **Season:** pick a school and a boys' or girls' program. A Short (3 games) or Full (6 county games
  plus 2 fictional league foes) schedule runs November to February; any game can be played or simmed.
  Then comes an 8-team state bracket for the school's real class, made of county schools of that class plus
  fictional towns, seeded by record. The final is at Bank OZK Arena, Hot Springs, on a neutral floor in
  generic arena art, with a home-crowd meter for the county team. A title raises a banner in the Trophy
  Room. The season autosaves after every game.
- **Other modes:**
  - **Exhibition:** any two county schools, boys or girls, home or away, with 2/4/8-minute quarters,
    clock or Classic, and three difficulties.
  - **Hot Streak:** an original 60-second shootout from 7 spots worth 2 or 3, with a steam-gauge multiplier
    (x2 after 3 straight makes, x3 after 6). The best score is saved.
  - **Banner Challenges:** six scenarios built on sourced facts:
    - Double Crown (1998)
    - Lady Trojans Five
    - Bookend Banners (Lakeside 1945/2000)
    - 1912 Colors (Wagner): unlocks a throwback kit
    - 6A Trial Run (the shot-clock adoption)
    - 2A-7 Showdown
  - **Trophy Room.**
- **Local content:**
  - Schools: the real names, mascots, classes and colors from `shared/data/schools.json`, inlined at
    build time and unedited. The four unconfirmed color sets are tagged "game colors".
  - Crests: seven original geometric crests drawn from each `mascotConcept`.
  - Banners: home-gym pennants hang only for real title years. Hot Springs boys and girls have their own;
    Lakeside's 1945/2000 show in both gyms as "State" because the source does not say which program.
  - Fact cards: 14 "Did you know?" cards from the audited trivia bank, each with its source.
  - All rules other than the shot clock are presented as game rules.
- **Presentation:**
  - Graphics: shape-built players with varied skin tones and hair, and a hardwood floor with a
    paterae-rosette center in the home color.
  - Home gym: brick wall, bleachers and a dot-matrix crowd. Finals arena: dark tiers, lights and
    "STATE FINALS" banners.
  - Scoreboard: a Deco bronze-grille bar with neon digits.
  - Effects: net ripple, rim shake, steam puffs, confetti and pop text.
  - Sound: synthesized in WebAudio (dribble, swish, rim, whistle, buzzer, crowd, squeak, jingles).

## Acceptance criteria (PRD §15)

| AC | Status | Evidence / note |
|---|---|---|
| AC1 single file, zero network, zero console errors | **Met** | every test (the harness fails on either); 221 KB |
| AC2 title | **Met** | screens › title screen (01) |
| AC3 how to play, sources, credits, game colors | **Met** | screens › help screens (02, 02b, 02c) |
| AC4 settings persist | **Met** | a11y › settings persist (03) across a reload |
| AC5 seven schools, correct data, game-colors tag | **Met** | content › schools, crests and the team picker (04) |
| AC6 distinct original crests | **Met** | 7 distinct crest drawings; none uses the fictional monogram |
| AC7 fictional deterministic rosters, tiered | **Met** | content › rosters; roster screen says "All players are fictional" (05) |
| AC8 pennants only for real titles | **Met** | content › pennants (06, 06b, 06c) |
| AC9 audited, sourced facts | **Met** | `tools/check-facts.mjs` 14/14; break card (07) |
| AC10 tip-off | **Met** | match › tip-off (10) |
| AC11 move, pass, shoot, switch by keyboard and touch | **Met** | match › keyboard controls (11, 11b, 11c); input › touch controls (11d) |
| AC12 meter matters | **Met** | perfect 18/24 vs bad 5/24 from 10.75 ft, open |
| AC13 2s, 3s, free throws, scoreboard | **Met** | match › scoring (12, 12b); free-throw scoring in the fouls test |
| AC14 shot clock and Classic | **Met** | countdown, violation turnover, reset on possession and on a rim hit (13, 13b) |
| AC15 fouls, free throws, bonus, foul-out | **Met** | the free-throw mini-game by hook and by keyboard Space (14, 14b). Touch free throws use the same SHOOT button (tested for shots, not for free throws) |
| AC16 quarters, halftime swap, OT, final | **Met** | (15, 15b, 16) |
| AC17 AI games always finish with plausible scores | **Met** | `tools/balance.mjs`: 50/50 games finish. 2-minute quarters: 20 points a team, FG 38%, 3P 30%, FT 63%. 8-minute quarters: about 75 a team (arcade pace, above real high-school scoring) |
| AC18 steals, blocks, rebounds, OOB counted | **Met** | AI test totals and the balance tool show steals, blocks and rebounds every game. OOB turnovers are logged; the balance output does not count them separately |
| AC19 pause, resume, quit | **Met** | (18) |
| AC20–AC21 season setup, hub, play or sim | **Met** | (20, 21) |
| AC22 class bracket with fictional fill | **Met** | 5A bracket includes Hot Springs and Lakeside; 2A bracket includes both 2A schools (22) |
| AC23 arena final, home-crowd meter | **Met** | (23) |
| AC24 champion and banner; elimination summary | **Met** | (24, 24b) |
| AC25 autosave, resume, blocked storage | **Met** | (25); the storage-blocked test plays a season in memory and Settings explains |
| AC26 exhibition girls and settings | **Met** | (04b, 26) |
| AC27 Hot Streak | **Met** | multiplier reached in test; best saved (27, 27b) |
| AC28 six challenges, completion, unlock | **Met** | complete, unlock and multi-step flows tested (28, 28b, 28c) |
| AC29 Trophy Room | **Met** | (29) |
| AC30 layout, touch targets | **Met** | `checkLayout` on every screen test. Pad controls are 56–136 px and sit below the court in portrait |
| AC31 contrast ≥ 4.5:1, day and night | **Met** | a11y sweeps 8 screens per theme with a WCAG checker: 0 failures (31, 31b) |
| AC32 reduced motion | **Met** | no loop on the title, confetti suppressed, camera snaps (32) |
| AC33 performance | **Met** | 60.2 fps in a live 10-player match (headless Chromium), heap 9.5 MB, hooks in 86–94 ms |
| AC34 audio after a gesture, mutable | **Met** | no AudioContext before the first click; M toggles |

## Test results

- `node shared/test-harness/run.mjs games/basketball --milestone final`: **61/61 passed** (desktop and
  mobile). That is 31 desktop and 30 mobile tests across 8 files, with no console errors and no external
  requests.
- **All 89 screenshots in `screenshots/final/` were inspected** (44 desktop, 45 mobile), through the
  14 contact sheets plus full-size checks during earlier milestones.
- Node tools:
  - `tools/check-facts.mjs`: 14/14 verified against the audited trivia bank.
  - `tools/balance.mjs 50 120`: 50/50 games finished, none scoreless.

## Performance

| Measure | Result | Budget |
|---|---|---|
| `index.html` | 221 KB | ≤ 2 MB |
| Hooks ready | 86 ms desktop, 94 ms mobile | ≤ 2 s |
| Live match | 60.2 fps | 60 fps |
| JS heap | 9.5 MB | < 40 MB |

The floor and venue are cached once per size, DPR, venue and teams. Menus stop the rAF loop (render on
demand). Only matches, Hot Streak, the title demo and the champion confetti run it.

## Known gaps

- **No human has played it, listened to the audio or used a screen reader.** Game feel (meter window,
  AI aggression, camera lead) was tuned by tests, the Node balance tool and screenshots only. Sounds are
  short and quiet by default.
- **Scoring pace:** with 8-minute quarters the AI scores about 75 a team, higher than real high-school
  games, because arcade possessions are faster. Shorter quarters (the default 2 minutes) feel right.
- **Difficulty is not measured against a human.** It changes the AI's release spread, steal and contest
  aggression and decision noise, and the player's meter window. No win-rate study was done.
- **Simplifications** (all presented as game rules): no backcourt, 3-second or travel calls; no set
  plays; subs are automatic; possession arrow only at quarter starts; free-throw lane spots can overlap
  slightly when a team has several players behind the arc.
- **Landscape phones:** a CSS overlay layout exists for short landscape screens, but no viewport in the
  test matrix covers it.
- **Facts not used:** the rivalry history (football-specific; the 2018/2023 conflict in the research has since been resolved as 2018),
  the "Summit Arena" former name (unconfirmed), gym names (all unconfirmed) and exact AAA dates (months only).

## Harness requests

1. **`t.touchDrag(from, to, {holdEndMs})`**: the current `holdMs` waits at the *start* and lifts right
   after the last move, so a held stick can't be tested. The input test works around it with raw CDP
   touch points through `t.page.context().newCDPSession(t.page)`.
2. **Gallery/contact sheets:** it would help to list each shot's test name on the sheet, because several
   tests share a screen.

## Files

`PRD.md`, `MECHANICS.md`, `DEV-PLAN.md` (milestones, hook spec, test matrix, defect log of 17 fixes),
`SAMPLES.md` (5 samples; no third-party code used), `research/town-content.md`, `data/facts.json`,
`src/`, `tests/` (8 files), `tools/` (balance, check-facts), `index.html` (built).
