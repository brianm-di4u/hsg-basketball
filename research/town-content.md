# Spa City Hoops: town content

Everything from Hot Springs and Garland County that the game shows, with its source. School facts
come from `shared/data/schools.json`, which is built from `research/schools-and-athletics.md` (see that
file for every link). Player-facing fact cards come from the audited trivia bank
`games/trivia/data/questions.json`, by question id, and only from items marked `confidence: confirmed`.

**Fictional:** every player, every coach-free team voice, every score, record and season result, every
out-of-county opponent town, and all gym art. The game never names a real student, minor or coach.

## 1. The seven schools (setting only)

The school data is inlined unchanged from `shared/data/schools.json` (version 1) at build time.

| School (short) | Mascot | Colors | Colors confirmed? | Basketball class | Notes used in game |
|---|---|---|---|---|---|
| Hot Springs (HSHS) | Trojans | black, gold | yes | 5A | founded 1887; title banners (below); 1912 uniform story |
| Lakeside (LHS) | Rams | blue, gold | yes | 5A | founded 1928; banners 1945 and 2000 |
| Lake Hamilton (LHHS) | Wolves | maroon, gold | yes | 6A | in Pearcy |
| Fountain Lake (FL) | Cobras | green, white | **no: game colors** | 4A | |
| Cutter-Morning Star (CMS) | Eagles | navy, silver | **no: game colors** | 2A, 2A-7 conference | |
| Jessieville (JHS) | Lions | purple, gold | **no: game colors** | 3A | |
| Mountain Pine (MP) | Red Devils | red, black | **no: game colors** | 2A, 2A-7 conference | |

- **Hex values are stand-ins** for every school (`schools.json` → `about`). Where `colorsConfirmed` is
  false, even the color names are game choices; the team picker and credits label them "game colors".
- **Mascot art** is original geometric art drawn in code from each school's `mascotConcept` (crested
  helmet, ram horns of concentric arcs, wolf wedges, cobra hood, eagle profile, lion mane ring,
  friendly imp shield). No logos.
- **Gym names** are all `venueConfirmed: false`, so the game never names a gym. Home games say
  "home gym" with generic art.

## 2. Basketball title years (shown as banners)

Source: `schools.json` → `titles`; `schools-and-athletics.md` → Championships by sport → Basketball.

| School | Boys | Girls | Unspecified |
|---|---|---|---|
| Hot Springs | 1932, 1996, 1998 | 1990, 1997, 1998, 2015, 2018 | |
| Lakeside | | | 1945, 2000 ("boys or girls not stated") |
| Others | none found | none found | |

- The game hangs these as pennants in the home-gym art for the right program, and lists them in the
  Trophy Room under "Real title years". Lakeside's two banners hang in **both** programs' gyms with the
  label "State champions" and no program, because the source does not say which.
- 1998 is the year Hot Springs won both titles. "Double crown" is our framing (`[inferred]` in the
  research), used only as a challenge name.
- No title is claimed for any other school. No title scores, opponents, coaches or players are known or shown.

## 3. Rules context

| Fact | Use in game | Source |
|---|---|---|
| Arkansas senior high basketball adopted a 35-second shot clock: AAA vote 183-69, August 2020; effective 2022-23 | the "35-second clock" setting (default) vs "Classic (no clock)"; fact card | `schools.json` → `rulesContext`; trivia hs-0256, hs-0261 |
| Class 6A used the clock experimentally first, in conference and state tournament games | challenge text for Lake Hamilton (6A) | `schools-and-athletics.md` → AAA rules context (NWA Online) |
| 8-minute quarters are an **unconfirmed** NFHS default | presented only as a game rule ("Full: 8-minute quarters") | `schools.json` → `rulesContext` |

Everything else in the rules (fouls, bonus, overtime length, free throws, possession arrow) is an
original **game rule** and is presented as such in How to Play. Court geometry (94 × 50 ft, a 19 ft 9 in
arc, 15 ft free-throw line) is game geometry, not a sourced claim.

## 4. The state finals venue

| Fact | Use | Source |
|---|---|---|
| Bank OZK Arena, 134 Convention Boulevard, Hot Springs, hosted the AAA basketball state championships for classes 6A–1A, March 12–14, 2026 | the season's final is "at Bank OZK Arena, Hot Springs"; Garland County teams get a home-crowd meter there | `schools.json` → `venues.basketballFinals`; trivia hs-0257 |

- The arena is drawn as a **generic modern arena**: no venue branding, no sponsor names. Whether it was
  once "Summit Arena" is unconfirmed, so that name never appears.
- The finals calendar date in the season view is "mid-March". The season runs November to March. This is `[inferred]` from game
  dates (`schools.json` → `seasons`), so the calendar shows month names only, never exact AAA dates.

## 5. Rivalries and leagues

| Pair | Game use | Source |
|---|---|---|
| Lakeside vs Lake Hamilton, the "Garland County rivalry" | "Rivalry game" tag and a louder crowd. No trophy or game name (none exists) and no football facts are shown in a basketball context | `schools.json` → `rivalries` |
| Hot Springs vs Lakeside, "5A South rivals" | "Rivalry game" tag | same |
| Cutter-Morning Star vs Mountain Pine, 2A-7 basketball league mates | the "2A-7 Showdown" challenge; same-league tag | same |

Not used: rivalry series dates (football, and the research has a 2018/2023 conflict).

## 6. The 1912 throwback kit

- In 1912 Pittsburgh Pirates star Honus Wagner bought and donated black-and-gold **basketball**
  uniforms to Hot Springs High School, and the school kept the colors. Sources: trivia hs-0185
  (Wikipedia: Hot Springs, Arkansas); `schools-and-athletics.md` → Hot Springs profile.
- In the game: an unlockable "1912-style" throwback kit for Hot Springs (a black jersey with a gold chest
  band and lace-up collar). The look is our invention, not a recreation of the real uniforms.

## 7. Fact cards ("Did you know?")

These appear at quarter breaks, at halftime and on the season hub. Each card shows the source name.
The text is a short restatement of the audited question and its answer, kept in `data/facts.json` with the
question id. `tools/check-facts.mjs` checks every id against the audited bank (confirmed, same source).

| id | Card text (short) |
|---|---|
| hs-0185 | Honus Wagner donated the black-and-gold basketball uniforms in 1912 |
| hs-0225 | Lakeside High School was founded in 1928 |
| hs-0226 | Lakeside won basketball state titles in 1945 and 2000 |
| hs-0238 | Hot Springs girls won back-to-back titles in 1997 and 1998; the boys also won in 1998 |
| hs-0256 | The Arkansas shot clock is 35 seconds |
| hs-0261 | The AAA adopted the shot clock by a 183-69 vote in 2020 |
| hs-0257 | The 2026 state finals were at Bank OZK Arena, March 12–14 |
| hs-0259 | Shameka Christon (Hot Springs High, 2000) went on to the WNBA |
| hs-0258 | Lakeside lists NBA player Keljin Blevins among its alumni |
| hs-0272 / hs-0273 | Lakeside: the Rams, blue and gold |
| hs-0274 / hs-0275 | Lake Hamilton: maroon and gold, in Pearcy |
| hs-0278 | Hot Springs: black and gold, the Trojans |

The alumni cards are text-only facts about adult public figures, as the content rules allow. No likeness,
no playable character.

## 8. Out-of-county opponents (fictional)

`schools.json` → `opponentsNote`: only the seven county schools are real; extra opponents must be
fictional towns. The game uses invented compound town names, each marked "fictional town" in the
team card:

Cinderbrook Foxes · Quartz Hollow Miners · Bluemist Herons · Ironleaf Owls · Hollowpine Hawks ·
Redclay Bison · Kettle Ford Otters · Marrow Creek Badgers · Ambergrove Comets · Lanternfield Knights ·
Copperbend Coyotes · Fernhaven Falcons · Saltlick Rangers · Thistledown Stags

Their colors and monogram crests are generated. They exist only to fill schedules and state brackets.

## 9. Players

- All rosters are generated by `roster.js` from a seeded RNG: first and last names from generic pools,
  shuffled together, plus jersey numbers, heights, positions and ratings. No name list comes from a real
  roster. Every roster screen and the credits say "All players are fictional."
- Team strength scales with classification (6A/5A deeper rosters) as a game-balance choice, not a claim
  about any real program.

## 10. Art direction sources

- `research/visual-style-guide.md` → Spa City Hoops: hardwood strips; a paterae-rosette center
  circle (Motif 9) in team color; a Deco bronze-grille scoreboard with neon digits and a mono shot-clock
  readout; a generic modern arena; a dot-matrix crowd; pennant banners with year numerals.
- Palettes: `school-colors` (stand-ins), `gilded-spa` (hardwood, home gym trim) and `deco-neon` (scoreboard,
  finals arena), copied from `shared/design/tokens.css`.
