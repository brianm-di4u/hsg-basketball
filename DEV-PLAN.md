# DEV-PLAN: Spa City Hoops

## 1. Milestones
| Milestone | Goal | Tasks | Status |
|---|---|---|---|
| **M1 Foundation** | builds, boots, draws a court, hooks work | `src/` skeleton and inliner build; tokens copied into CSS; util (mulberry32 on a JSON object, storage); data (inlined schools.json and facts.json, fictional towns); roster generator; court projection, cached floor and backdrop; crests; title screen; `window.__game` skeleton | done |
| **M2 Core loop** | one playable game | sim phases (tipoff, live, inbound); steering movement; dribble, pass, shoot with the meter, make/miss trajectories; rebounds; scoring; game and shot clocks; quarters and the final; offense and defense AI; keyboard input; scoreboard | done |
| **M3 Full rules and content** | every rule and mode | fouls, free throws, bonus, foul-outs; blocks and steals; out of bounds; overtime; auto-subs; touch input; season (schedule, sim, bracket, arena final, champion); exhibition; Hot Streak; challenges; trophy room; saves | done |
| **M4 Polish, audio, a11y** | feels finished | WebAudio cues; effects (net, rim shake, steam, confetti, pops); fact cards; help and settings; reduced motion; text size; day/night themes; focus management; live region; portrait framing | done |
| **M5 Optimize and release** | ship | fps, heap and size checks; balance tool; final matrix at both viewports; REPORT.md | done |

## 2. Source layout
```
src/index.html            page shell (+ @inline ../../../shared/data/schools.json, ../data/facts.json)
src/styles/main.css       tokens + UI
src/js/util.js            rng (state lives in JSON), math, storage, hash, contrast
src/js/data.js            schools, fictional towns, facts, banners, kits
src/js/roster.js          fictional roster generator
src/js/court.js           geometry constants, oblique projection (per-view depth factor)
src/js/rules.js           shot/free-throw chances, meter windows, difficulty table, season sim score
src/js/ai.js              offense spots and cuts, utility-scored ball handler, man defense with help
src/js/sim.js             match rules engine (pure; imported by tools/balance.mjs in Node)
src/js/season.js          schedule, bracket, results
src/js/challenges.js      Banner Challenge definitions
src/js/shootout.js        Hot Streak
src/js/art.js             crests, players, floor, venues
src/js/render.js          frame composition, camera, effects, meters
src/js/audio.js           WebAudio synth
src/js/input.js           keyboard, touch stick and buttons
src/js/ui.js              DOM screens
src/js/main.js            boot, loop, scenes, hooks
tools/balance.mjs         Node: N AI-vs-AI games with the real engine; fails on unfinished or scoreless games
tools/check-facts.mjs     Node: facts.json against the audited trivia bank
```

## 3. `window.__game` hook spec
| Call | Effect / returns |
|---|---|
| `seed(n)` | sets the seed for the next match, season or shootout; returns `n` |
| `getState()` | `{scene, mode, paused, settings, storageOk, match: summary|null, season, shootout, challenge, chalResult, trophies, unlocks, best, challenges, pick, audio:{ctx,on}, reduced, touch, fx, loop, view, ui:{focus}}`. The match summary is `{mode, phase, q, t, shot, shotOff, running, poss, score, winner, dir, arrow, venue, crowd, crowdTeam, rules, difficulty, program, teams:[{key,name,abbr,isUser,tf,kit,onCourt,fictional}], ball:{state,holder,x,y,z,shot}, user:{team,ctrl,auto,meterLabel}, players:[…10], ft, inb, stats (box score), log, scVio, pend}` |
| `setState(s)` | merges `s.settings`, `s.pick`, `s.unlocks`, `s.match` (`{q,t,shot,score,teamFouls,crowd,energy}`) and `s.shootout`; re-renders; returns `true` |
| `isIdle()` | `true` when no screen entry animation is running (live play counts as ambient, so tests `pause()` first) |
| `step(n)` | runs `n` fixed 1/60 s steps, then renders; returns the phase |
| `pause()` / `resume()` | freeze or unfreeze the loop |
| `scene(name)` | `title`, `help`, `settings`, `select`, `seasonSetup`, `hub`, `roster`, `bracket`, `game`, `pause`, `break`, `final`, `champion`, `shootoutSetup`, `shootout`, `shootoutEnd`, `challenges`, `trophies` |
| `newGame(opts)` | `{mode:'exhibition'|'season'|'challenge'|'shootout', seed, paused, …}`: exhibition `{home, away, program, user:'home'|'away'|'none', qLen, shotClock, difficulty, venue}`; season `{school, program, length, play}`; challenge `{challenge, program}`; shootout `{school, program}` |
| `act('autoplay', bool)` | the AI also drives the user's team |
| `act('input', {mx,mz,shoot,pass,switch})` | sets the input intent |
| `act('shootAt', q)` | the ball handler shoots with a forced meter quality (0–1) |
| `act('give', team, slot)` / `act('place', team, slot, x, z)` | ball to a player / move a player |
| `act('foul', defTeam, 'shoot'|'reach')` | the nearest defender fouls the ball handler |
| `act('ftStop', q)` | stops the free-throw marker at quality `q` |
| `act('finishGame', {winner?})` | AI plays the rest of the match to the final (optionally forcing the winner for flow tests) |
| `act('sim')` / `act('seasonResult', us, them)` | sim the next season game / record a result |
| `act('facts')`, `act('crests')`, `act('banners', key, program)`, `act('roster', key, program, cls?, seed?)`, `act('spots')`, `act('layout')`, `act('storage')` | data and layout for assertions |
| `act('shootoutShot', q)`, `act('freeze', bool)`, `act('confetti')`, `act('meterQuality', v, scale, type)` | helpers |

## 4. Test matrix
Tests in `tests/*.test.mjs` run at both viewports unless marked. Screenshots are in `screenshots/<milestone>/<vp>/`.

| AC | Test (file › name) | Screenshot(s) |
|---|---|---|
| AC1 | every test (the harness fails on network requests and console errors); perf › performance | — |
| AC2 | screens › title screen | `01-title` |
| AC3 | screens › help screens | `02-help`, `02b-help-rules`, `02c-help-about` |
| AC4 | a11y › settings persist; text size; keyboard-only menus | `03-settings` |
| AC5, AC6 | content › schools, crests and the team picker | `04-select` |
| AC7 | content › fictional rosters are deterministic and tiered; season › setup… (roster screen) | `05-roster` |
| AC8 | content › title pennants hang only for real titles | `06-gym-hs-girls`, `06b-gym-lakeside`, `06c-gym-jessieville` |
| AC9 | content › fact cards are audited and sourced; `tools/check-facts.mjs` | `07-break-fact` |
| AC10 | match › tip-off starts the game | `10-tipoff` |
| AC11 | match › keyboard controls; input › touch controls (mobile); input › desktop hides touch controls (desktop) | `11-dribble`, `11b-pass`, `11c-shot-meter`, `11d-touch` |
| AC12 | match › meter timing drives make rate (desktop) | — |
| AC13 | match › scoring: threes, twos and the scoreboard | `12-three`, `12b-score` |
| AC14 | match › shot clock: countdown, violation, resets; classic mode | `13-shotclock-violation`, `13b-classic` |
| AC15 | match › fouls, free throws, bonus and foul-outs | `14-freethrow`, `14b-bonus` |
| AC16 | match › quarters, halftime, overtime and the final | `15-halftime`, `15b-overtime`, `16-final` |
| AC17, AC18 | match › AI vs AI games finish with real stats; `tools/balance.mjs` | `17-ai-game` |
| AC19 | match › pause stops the clock; quit returns to the menu | `18-pause` |
| AC20, AC21 | season › setup, hub, sim and a played game | `20-season-setup`, `21-hub` |
| AC22, AC23, AC24 | season › bracket, arena final and champion; season › elimination ends the season | `22-bracket`, `23-arena-final`, `24-champion`, `24b-eliminated` |
| AC25 | season › saves and resumes after reload; season › storage blocked | `25-resume` |
| AC26 | modes › exhibition: girls, team picker and settings | `04b-select-girls`, `26-exhibition-girls` |
| AC27 | modes › hot streak shootout | `27-shootout`, `27b-shootout-end` |
| AC28 | modes › banner challenges | `28-challenges`, `28b-challenge-play`, `28c-throwback` |
| AC29 | modes › trophy room | `29-trophies` |
| AC30 | `t.checkLayout()` in the screen tests; input › touch controls (≥ 44 px, on screen, below the court) | — |
| AC31 | a11y › contrast: day theme; a11y › contrast: night theme | `31-dark-title`, `31b-dark-hub` |
| AC32 | a11y › reduced motion | `32-reduced` |
| AC33 | perf › performance: fps, heap, size, load | — |
| AC34 | a11y › audio waits for a gesture; M mutes | — |

## 5. Defect log
| # | Milestone | Defect | Fix | Status |
|---|---|---|---|---|
| 1 | M2 (Node balance) | A shooter's `shoot` pose survived into an inbound, so `release()` fired every tick: hundreds of phantom shots and a 10% FG rate | `shooterTick` only runs in `live`; inbound setup and `gainBall` clear shooting poses | fixed |
| 2 | M2 | AI perimeter spots sat at 24–26 ft, so most shots were deep threes | spots moved to 21.5 ft (point), 18 ft wings, 11 ft posts; AI weights threes at 2.6 instead of 3 | fixed |
| 3 | M2 | 15 blocks per 8-minute game; contested shots too punishing (FG 18–27%) | block chance cut twice, contest factors softened, on-ball gap 3.4 ft | fixed (FG ≈ 35–38%) |
| 4 | M2 | Free throws at 80% | `ftChance` rebalanced (≈ 66%) | fixed |
| 5 | M2 | `give` did not update the user's control until the next tick | `give` sets `user.ctrl` | fixed |
| 6 | M3 | A loose ball going out of bounds after the horn queued an inbound with 0.0 on the clock: the game never ended | OOB checks the clock; a safety net in `clockTick` queues the period end whenever time is up and nothing is pending | fixed (50/50 balance games finish) |
| 7 | M3 | 8-minute quarters produced 100+ points a team | patient AI offense (hold value decays slower, early contested jumpers discounted, drives after 3 s) and fewer steal attempts | fixed (≈ 75 a team at 8 min, ≈ 20 at 2 min) |
| 8 | M3 | Mobile court used only a third of the stage; the "YOU" chevron hid behind other players | portrait views use a deeper 0.62 depth factor and a 31 ft span; chevron drawn after all players | fixed |
| 9 | M3 | Test: `t.touchDrag` lifts the finger at the end, so a held stick could not be tested | the test drives raw CDP touch points through `t.page` | fixed (test) |
| 10 | M3 | Desktop layout check found the hidden touch stick at 0×0 | `act('layout')` treats elements without client rects as absent | fixed |
| 11 | M3 visual | Title pennants overflowed their triangles; text unreadable on desktop | banner shape sized from wall height; text sized to fit | fixed |
| 12 | M3 visual | Finals arena reused the home team's floor paint and crest; "STATE FINALS" text 7 px | neutral arena floor with a Deco sunburst; two readable banners | fixed |
| 13 | M3 visual | Three-point steam puffs drew as a solid white ball at the rim | smaller, fainter, drifting puffs | fixed |
| 14 | M3 visual | Mobile: ball in flight off-screen (camera stayed on the shooter); Hot Streak corner spot under the pause button | camera frames ball and rim during shots; Hot Streak starts at the top of the key and the camera follows the spot in portrait | fixed |
| 15 | M3 visual | Far-sideline players' heads clipped at the top of the canvas | view leaves 7.2 ft of headroom above the far sideline | fixed |
| 16 | M3 visual | Champion pennant clipped "CHAMPS"; Trophy Room records list broke into columns; roster table wider than a phone | swallowtail banner; block list; optional columns hidden under 600 px | fixed |
| 17 | M3 visual | Forced-quality test shots showed the wrong meter label; label collided with the "YOU" chevron | label follows the forced quality; label drawn beside the meter | fixed |
