# MECHANICS: Spa City Hoops core foundation

How the game runs under the hood. The ideas behind each choice are in `SAMPLES.md`.

## 1. Loop and timing
- **Fixed step:** `DT = 1/60` s. `main.js` runs a `requestAnimationFrame` loop that adds the elapsed
  real time (capped at 0.25 s) to an accumulator and calls `sim.tick(match, input)` while the
  accumulator holds at least `DT`. One render follows per frame. There is no interpolation.
- **Render on demand:** the rAF loop runs only during a match, the shootout or the title attract
  demo. Full-screen menus stop it. The title demo is static under reduced motion.
- **Pause:** `paused` stops ticking but keeps one render. `step(n)` runs `n` ticks synchronously,
  whether or not the game is paused, then renders. All test timing goes through it.
- **Clocks:** the game clock, shot clock and phase timers count simulated seconds (`DT` per tick). The game clock runs
  only in the `live` phase. It stops for dead balls (fouls, violations, out of bounds, free throws,
  quarter ends) and keeps running after made baskets.

## 2. World model (2.5D)
- **Court:** feet. `x` runs along the length (0–94), `z` across the depth (0 = far sideline, 50 = near sideline) and
  `y` is height. Rims sit at `x = 5.25` and `x = 88.75`, `z = 25`, `y = 10`. The three-point arc has a radius of
  19.75 ft from the rim center (straight lines in the corners at `z = 3`/`47`). The free-throw line is 13.75 ft from the rim center.
- **Projection (oblique, no perspective):**
  `sx = (x − camX)·s + W/2`, `sy = y0 + z·s·K − y·s`, with depth factor `K = 0.5` in landscape and a
  deeper 0.62 in portrait. `s` (px/ft) = `min(H/(50K + 9), W/span)`, where `span` = 56 ft in landscape and
  31 ft in portrait. `y0` leaves at least 7.2 ft of headroom so a player on the far sideline is never clipped.
  The camera follows the ball with a lead toward the attacked rim, and frames ball and rim while a shot is
  in the air. It eases at 4.5/s, or snaps under reduced motion, and is clamped to the court.
- **Draw order:** a cached floor layer (hardwood, lines, paint, rosette), then the backdrop and crowd (cached per size
  and venue), the far hoop half, entities sorted by `z` (players, ball, shadows first), the near hoop half and net,
  then effects and the shot meter.

## 3. State model (one serializable object)
`state` (in `main.js`) holds `{scene, settings, season, match, shootout, challenge, save}`.
`match` is plain JSON, so `getState()` can return it directly:

```
match = {
  id, mode: 'exhibition'|'season'|'challenge'|'demo', seed,
  rules: { qLen, shotClock: 35|0, quarters: 4, otLen, bonusAt: 5, foulOut: 5 },
  teams: [ {key, name, short, colors, kit, program, roster:[player…10], onCourt:[5 idx], score, teamFouls, isUser} ×2 ],
  p: [ 10 court players: {t, r, x,z,y, vx,vz,vy, face, act, actT, jumpT, hand:{x,y,z}, energy, cool, tgt} ],
  ball: { x,y,z, vx,vy,vz, holder, state:'held'|'pass'|'shot'|'loose'|'dead', from, to, shot:{…}, lastTouch, rimHit },
  poss, dir:[+1|-1, …] (attack direction per team, swaps at half),
  clock: { q, t, shot, running }, phase, phaseT, arrow, ft:{shooter, left, made, meter}, inbound:{…},
  user: { team, ctrl, switchLock }, events:[…last 40], stats, run, crowd, winner
}
```
Ratings are 0–1: `sht` (jump shot), `ins` (finishing), `pas`, `hnd` (handle), `def`, `reb`, `spd`, `blk`, `ft`.

## 4. Rules engine (`sim.js`, pure, no DOM)
- **Phases:** `tipoff` → `live` ↔ (`inbound` | `freethrow`) → `qend` → … → `final`.
- **Possession:** the team in control of the ball attacks the hoop given by `dir[team]`. Any change of
  possession resets the shot clock to 35. So does a shot that hits the rim.
- **Shot outcome:** rolled at release:
  `p = base(dist, type) × skill × contest × timing × crowd`, clamped to 0.02–0.97.
  - `base`: layup or dunk .66; 4–10 ft .50; 10–19.75 ft .42; three .35, dropping past 25 ft.
  - `skill = 0.7 + 0.6·rating`; `contest` from the nearest defender's distance and hand height.
  - `timing`: from meter quality, perfect ×1.35, good ×1.0, early/late ×0.7, bad ×0.35.
  The trajectory is then solved to pass through the rim center on a make, or to hit the front or back
  rim on a miss.
- **Free throws:** a swinging marker. Stop it in the green band. The chance comes from the `ft` rating
  and the stop distance.
- **Fouls (game rules):** shooting fouls give 2 shots (3 for a three; 1 on an and-one). Reach-in fouls on steal
  attempts give the ball to the other team out of bounds. From the 5th team foul of a quarter, every non-shooting foul gives
  2 shots (the bonus). A player with 5 fouls fouls out and is replaced.
- **Violations:** shot clock (when on), out of bounds (last touch), 5-second inbound. When the game clock
  shows less than the shot clock, the shot clock is switched off.
- **Quarters:** the quarter length is a setting (2, 4 or 8 minutes). Teams swap ends at halftime. Q2, Q3 and Q4 start with an
  inbound for the team the alternating arrow points to. A tie after Q4 plays overtime of half a quarter (at least 1 min) until there is a winner.
- **Buzzer beaters:** a shot released before 0.0 counts.

## 5. AI (`ai.js`)
Decisions run every 0.25–0.4 s per player (jittered with the match RNG). Movement steers toward the
chosen target each tick.
- **Offense spots** (relative to the attacked rim): point, two wings, two posts; small cuts every few
  seconds. In transition, everyone runs to their spots.
- **Ball handler:** a utility score for each option:
  - *shoot* (open × range fit × rating, higher as the shot clock runs down);
  - *drive* (an open lane to the rim);
  - *pass* (open teammate × pass-lane safety, with a small penalty for repeating passes);
  - *hold or dribble to a spot*.
  The best option wins, with randomness by difficulty.
- **Defense:** man-to-man by matchup. Each defender interposes between the assignment and the rim, with a gap
  of 3 ft on the ball and 6–10 ft off the ball. One help defender steps in on drives inside 12 ft. Defenders try steals
  on cooldown (`def` rating) and jump to contest shots within 4 ft.
- **Rebounds:** on a miss, the predicted landing point is shared. The two nearest of each team crash it and the rest
  get back. A player grabs the ball when it is within reach and below their reach height (+2.5 ft when jumping).
- **Difficulty** (Rookie / Varsity / All-State) sets the AI's timing quality, steal and contest
  aggression, decision noise and the width of the player's meter window.
- **User team:** the AI moves all user teammates. The user drives one player: the ball handler on
  offense, and on defense the defender auto-switched to the ball (with 0.8 s hysteresis) or switched by hand.

## 6. Input (`input.js`)
- **Keyboard:** arrows or WASD move. **Space** = shoot (hold, then release) or jump/block on defense.
  **X/J** = pass, or steal on defense. **C/K** = switch player. **P/Esc** = pause. **M** = mute.
- **Touch:** a left-side virtual stick (pointer events, `touch-action: none`) and buttons for Shoot
  (hold and release), Pass/Steal and Switch, each at least 56 px.
- The fixed step reads one `intent` object: `{mx, mz, shootHeld, shootPressed, shootReleased, passPressed, switchPressed}`.
  Edges are latched until the next tick consumes them, so a fast tap is never lost.

## 7. Rendering (`render.js`, `art.js`)
- Canvas 2D at device pixel ratio (capped at 2). Cached layers: the floor (per size, home team and venue),
  the backdrop (arena or home gym with pennants and a dot-matrix crowd) and mascot crests (per school and size).
- Players are built from shapes: shadow, legs, shorts, a jersey with a number, arms, head and hair.
  Pose comes from `act` (run, dribble, jump, shoot, layup, celebrate). The home team wears light jerseys and the away team dark.
  Each player's floor ring is solid for home and dashed for away. The user's player carries a "YOU" chevron.
  Teams are never told apart by color alone.
- Effects: swish net ripple, rim shake, score pop, steam puffs on threes, confetti on titles. All are
  suppressed or reduced under reduced motion.

## 8. RNG
`mulberry32`. The match RNG (`match.seed`, advanced inside `sim`) drives every rules decision. A separate
cosmetic RNG drives crowd and particles, so drawing never changes outcomes. `seed(n)` reseeds the next
match or season. Rosters come from `hash(schoolId, program, seasonSeed)`.

## 9. Saves
`localStorage` key `hsg-hoops-v1`, written in try/catch:
`{v:1, settings, season (or null), trophies:[{school, program, label}], unlocks:{throwback}, best:{shootout}, challenges:{id:true}}`.
The game saves after every season game and settings change. If storage is unavailable, the game runs in memory
and shows a one-line notice in Settings.

## 10. `window.__game` hooks
See `DEV-PLAN.md` §3 for the full spec: `seed`, `getState`, `setState`, `isIdle`, `step`, `pause`,
`resume`, `scene`, `newGame`, `act`.
