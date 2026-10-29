# PRD: Spa City Hoops

## 1. Vision
An arcade high-school basketball game you can finish in one sitting. You pick a real Garland County,
Arkansas school and a boys' or girls' program. You play a short season and a state bracket, and the
season ends with a hometown state final at Bank OZK Arena in Hot Springs. The schools are real; every player is
fictional. Rules, art and sound are original.

## 2. Pillars
1. **Feel first:** a crisp hold-and-release shot meter, readable passing, satisfying swishes.
2. **Local pride, honestly told:** real schools, colors, classes and title banners, each from a
   cited source. Unconfirmed items are labeled, and invented items are plainly fictional.
3. **One sitting:** a quick game takes 8–10 minutes, a short season about an hour, and any game can be simulated.
4. **Everyone plays:** boys' and girls' programs are equal in rules and depth. The game is fully playable by
   keyboard and touch, with no color-only cues.

## 3. Target players
Casual sports fans from Hot Springs, alumni and families, plus arcade-sports players. They play on a
laptop browser or a phone (portrait). No account, no network.

## 4. Modes
| Mode | Summary |
|---|---|
| **Season** | Pick a school and program. A Short season has 3 county games; a Full season has all 6 county opponents plus 2 fictional league foes. Then an 8-team state bracket for your class: quarterfinal, semifinal, final. Play or sim each game. Winning the title raises a banner in the Trophy Room. |
| **Exhibition** | Any two county schools, boys or girls, with settings for quarter length, shot clock and difficulty. |
| **Hot Streak** (shootout) | 60 s solo shooting from 7 floor spots worth 2 (inside the arc) or 3. A streak builds a steam gauge (×2 at 3 straight, ×3 at 6). Best score is saved. |
| **Banner Challenges** | Six short scenarios tied to sourced facts (see §7). Each card shows its fact and source and says "game scenario, not a recreation". |
| **Trophy Room** | Your banners, unlocks, shootout best, and the real title years from research. |

## 5. Rules (as played)
- 5-on-5, a 10-player fictional roster per team, four quarters. The quarter length is 2, 4 or 8 minutes (default 2,
  set in Settings, Season setup or the Exhibition picker). "8 minutes" is labeled as the full-length game rule, not a cited fact.
- **Shot clock:** 35 s (default; Arkansas's clock since 2022-23) or Classic (off). It resets on a change of possession or
  when a shot hits the rim. It turns off when the game clock is below it. A violation is a turnover.
- 2 points inside the arc, 3 outside, 1 per free throw.
- **Fouls:**
  - A shooting foul gives 2 free throws (3 on a three); a made basket plus a foul gives 1.
  - A reach-in or blocking foul gives the other team the ball out of bounds.
  - From the 5th team foul in a quarter, non-shooting fouls give 2 shots.
  - A player fouls out at 5.
- **Possession:** a jump ball opens the game. Later quarters start with an inbound for the team the alternating arrow points to.
  Teams swap ends at half.
- **Overtime:** half a quarter (at least 1 min), repeated until there is a winner.
- **Violations:** shot clock, out of bounds (last touch) and a 5-second inbound.
- Rules are presented as game rules in How to Play; only the 35-second clock is cited.

## 6. Controls
| Action | Keyboard | Touch |
|---|---|---|
| Move | Arrows / WASD | left stick |
| Shoot (hold, release at the top) / Jump, block, rebound | Space | Shoot button (hold) |
| Pass (toward the stick direction, or to the most open teammate) / Steal | X or J | Pass button |
| Switch defender | C or K | Switch button |
| Pause | P or Esc | ❚❚ button |
| Mute | M | settings |

Menus work with Tab, Enter and Esc and show a visible focus ring.

## 7. Hot Springs content map
| Where | Content | Source |
|---|---|---|
| Team picker, team cards | the 7 schools: name, city, mascot (original geometric crest), colors (with a "game colors" tag where unconfirmed), basketball class | `shared/data/schools.json` |
| Home gym art | pennants for real title years: Hot Springs (boys 1932/1996/1998; girls 1990/1997/1998/2015/2018) and Lakeside (1945, 2000, program not stated) | schools.json `titles` |
| Season final | "State final, Bank OZK Arena, Hot Springs", with a home-crowd meter for county teams; generic arena art | schools.json `venues.basketballFinals` |
| Settings and rules | 35-second shot clock, adopted 183-69 (2020), effective 2022-23 | schools.json `rulesContext` |
| Rivalry tag | Lakeside–Lake Hamilton, Hot Springs–Lakeside, CMS–Mountain Pine (2A-7 basketball) | schools.json `rivalries` |
| Quarter breaks, season hub | "Did you know?" fact cards with source names | audited trivia ids in `data/facts.json` |
| Challenges | Double Crown (1998), Lady Trojans Five, Bookend Banners (Lakeside 1945/2000), 1912 Colors (Wagner), 6A Trial Run (shot clock first used in 6A), 2A-7 Showdown | schools.json and the research |
| Unlock | 1912-style throwback kit for Hot Springs (look invented) | trivia hs-0185 |
| Fictional layer | players, results, out-of-county towns (marked "fictional town") | n/a |

## 8. Screens and flow
Title (attract demo behind the menu) → Season setup → Season hub (schedule, record, roster, fact) → Match → Final →
hub … → Bracket → Final at the arena → Champion. Exhibition: Team select → Match → Final. Hot Streak →
Results. Challenges list → Match → Result. Trophy Room. How to Play (controls, rules, meter, credits and
sources). Settings. Pause (resume, box score, how to play, settings, quit). Quarter break (box score
summary and a fact card).

## 9. Art direction
- **Palettes:** `school-colors` (stand-ins), `gilded-spa` (hardwood, home gym trim) and `deco-neon` (scoreboard, arena, UI dark).
- **Court:** hardwood strips; key and center circle in the home team's color; a paterae-rosette center motif;
  three-point arcs and free-throw circles; baseline mascot crest.
- **Venues:** the home gym has a brick wall, wooden bleachers with a dot crowd and pennants with title years. The finals arena has
  dark tiers, a dot-matrix crowd in both teams' colors and a ring of lights, with no branding.
- **Scoreboard (DOM):** a bronze-grille Deco bar with neon-style digits in a mono font: score, quarter, game clock, shot clock,
  team fouls and the bonus.
- **Players:** shape-built athletes with varied skin tones and hair. Home team in light jerseys, away in dark. Numbers on jerseys.
- **Mascots:** seven original geometric crests from each `mascotConcept`. Fictional teams get a shield monogram.

## 10. Audio direction
WebAudio synthesis only: dribble thump, swish (filtered noise), rim clank (detuned metallic partials),
whistle, buzzer, crowd swell on runs, sneaker squeak, menu clicks and a short title jingle. Quiet by default
(volume 50%). Mute with M or in settings.

## 11. Accessibility
- Keyboard-only play for every screen and the match. Visible focus.
- Text contrast ≥ 4.5:1 in UI. No information by color alone: home/away floor rings are solid/dashed, the user
  has a chevron and a label, and the meter has a marker shape plus "PERFECT/GOOD/EARLY/LATE" text.
- Reduced motion (system setting or toggle): no screen shake, no confetti, a snapping camera and a static title.
- Text size 100/115/130%. Meter assist (a wider window). An `aria-live` region announces scores and phase changes.
- Night (dark) and day (light) UI themes follow `prefers-color-scheme`.

## 12. Mobile and touch
Portrait first at 390×844: scoreboard on top, court in the middle, controls below the court so thumbs never
cover play. Touch targets are at least 44 px (stick 120 px, buttons 64 px). Landscape phones and desktop hide the controls
unless touch is detected.

## 13. Performance budgets
60 fps on a mid-range laptop during play; HTML ≤ 2 MB (target < 400 KB); hooks ready in ≤ 2 s; heap
< 40 MB; zero network requests.

## 14. Save/load
Settings, the current season (auto-saved after each game), trophies, unlocks, challenge completions and the
Hot Streak best. All of it is wrapped in try/catch, and the game works without storage.

## 15. Acceptance criteria
**Boot and shell**
- AC1. The game loads from one self-contained `index.html` with zero network requests and zero console errors.
- AC2. The title shows the game name, the menu (Season, Exhibition, Hot Streak, Challenges, Trophy Room, How to
  Play, Settings) and a "fictional players" note.
- AC3. How to Play covers controls, game rules, the shot meter, sources and credits, including "game colors" for the 4 unconfirmed schools.
- AC4. Settings change and persist sound, volume, reduced motion, text size, difficulty, quarter length,
  shot clock and meter assist.

**Teams and content**
- AC5. All 7 schools appear with their correct name, mascot, basketball class and stand-in colors from
  `schools.json`. The 4 unconfirmed schools show a "game colors" tag.
- AC6. Each school has a distinct original geometric crest drawn in code.
- AC7. Rosters are fictional, deterministic per school, program and seed, with 10 players, unique numbers and ratings
  that vary by class tier. The roster screen says "All players are fictional."
- AC8. The home gym of Hot Springs and Lakeside shows pennants with exactly their real title years for the
  program, and no other school shows a title pennant.
- AC9. Fact cards show only audited, confirmed facts, each with its source name.

**Match**
- AC10. A tip-off starts the game, and one team gains possession.
- AC11. The player can move, pass, shoot (hold and release) and switch, by keyboard and by touch.
- AC12. Shot results follow the meter: a perfect release from an open close range scores far more often than a
  bad release (checked statistically).
- AC13. Two-point and three-point baskets score correctly by distance, free throws score 1, and scores
  show in the scoreboard.
- AC14. The 35-second shot clock counts down, resets on possession change and on rim hits, and causes a turnover at 0.
  Classic mode shows no shot clock.
- AC15. Shooting fouls award the right number of free throws. The free-throw mini-game works by keyboard and touch.
  Bonus and foul-outs apply.
- AC16. Quarters end at 0:00 with a buzzer. Teams swap ends at half. A tie goes to overtime. The final screen shows the winner,
  the box score and the top performer.
- AC17. AI vs AI games always finish, with plausible scores and both teams scoring (balance tool, 50 games).
- AC18. Steals, blocks, rebounds and out-of-bounds turnovers happen in play and are counted in stats.
- AC19. Pause stops the clocks. Resume continues. Quit returns to the menu.

**Season**
- AC20. Season setup picks a school, program and length. The hub lists the schedule (Nov–Mar, months only), record and next game.
- AC21. Any game can be played or simmed. Other results are simmed.
- AC22. After the regular season, an 8-team state bracket for the school's class appears: county schools of that class
  plus fictional towns.
- AC23. The final is labeled "Bank OZK Arena, Hot Springs" with generic arena art and a home-crowd meter for county teams.
- AC24. Winning the final shows a champion screen and adds a banner to the Trophy Room. Losing ends the season with a summary.
- AC25. The season auto-saves after each game and resumes after a reload. A storage failure does not break play.

**Other modes**
- AC26. Exhibition supports any two county schools, boys or girls, with all settings.
- AC27. Hot Streak runs 60 s with 7 spots, a multiplier and a saved best.
- AC28. Six Banner Challenges each show a sourced fact, a "game scenario" note, a start state and a goal. Completion
  is saved. "1912 Colors" unlocks the throwback kit.
- AC29. The Trophy Room lists earned banners, unlocks, the shootout best and the real title years.

**Quality**
- AC30. No horizontal overflow and no off-screen controls at 1280×800 and 390×844. Touch targets are at least 44 px.
- AC31. UI text contrast is ≥ 4.5:1 in light and dark themes.
- AC32. Reduced motion disables shake, confetti and the title demo.
- AC33. ≥ 55 fps in a live match on the test machine; HTML ≤ 2 MB; hooks ready in ≤ 2 s.
- AC34. Audio is synthesized, mutable and silent before the first user gesture.

## 16. Out of scope
Online play, multiplayer on one device, a franchise mode across many seasons, player editing, real player
names or likenesses, coaches, real gym names, play-by-play voice, other states' rules, set plays and
substitution menus (auto-subs only), a 3D camera, and any school logos or sponsor branding.
