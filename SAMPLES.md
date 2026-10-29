# SAMPLES: code-sample survey for Spa City Hoops

Goal: find open-source code and write-ups that do the core mechanics well. The mechanics are a fixed-step
real-time loop, a 2.5D court with a jump/ball arc, timing-based shooting, passing lanes and team AI
for 5-on-5.

**Result: no third-party code was copied or adapted.** All of the game's code is original. The samples
below gave ideas only. Nothing was downloaded into `reference-samples/`, because reading the
repository pages and the source files online was enough.

| # | Sample | URL | License | Version read | Reuse verdict |
|---|---|---|---|---|---|
| 1 | Glenn Fiedler, "Fix Your Timestep!" | https://gafferongames.com/post/fix_your_timestep/ | article (no code license) | page as of 2026-10 | **Ideas only**: accumulator loop |
| 2 | Mugen87/kickoff: soccer team AI on Yuka | https://github.com/Mugen87/kickoff | MIT | `2404fee` (2021-01-19) | **Ideas only**: team states, support spots, pass-safety test |
| 3 | cxong/Dunkman: TIC-80 slam-dunk minigame | https://github.com/cxong/Dunkman | MIT | `32ab666` (2023-05-04) | **Ideas only**: keep-away from defender hands |
| 4 | MDN "2D breakout game using pure JavaScript" (end3r/Gamedev-Canvas-workshop) | https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_breakout_game_pure_JavaScript | repo license NOASSERTION; MDN prose CC-BY-SA | gh-pages, pushed 2022-06-09 | **Reference only**: unclear license |
| 5 | Craig Reynolds, "Steering Behaviors For Autonomous Characters" (GDC 1999) | https://www.red3d.com/cwr/steer/ | paper | 1999 | **Ideas only**: seek, arrive, pursuit, interpose |

## 1. Fix Your Timestep (Fiedler)
- **Does well:** separates the simulation rate from the display rate. The renderer produces time, an
  accumulator consumes it in fixed `dt` steps, and the frame time is capped so a slow tab cannot cause a
  "spiral of death".
- **Does badly (for us):** interpolation between states adds a copy of every entity. At 60 Hz on a
  60 Hz display the gain is small.
- **Takeaway:** a 60 Hz fixed step with an accumulator and a 0.25 s cap, and no interpolation. The test hook
  `step(n)` simply runs `n` fixed ticks, so tests are deterministic.

## 2. Kickoff (Mugen87, MIT)
Read `src/entities/Team.js` (it ports the "Simple Soccer" design from Buckland's *Programming Game AI by Example*).
- **Does well:**
  - a team-level state machine (attacking, defending, kickoff) above player states;
  - each player gets a fixed **home region** per team state;
  - a **pass-safety test** that projects each opponent into the pass's local frame and compares the ball's
    travel time with the opponent's reach (`maxSpeed × t + radii`);
  - a "best supporting attacker" chosen against a scored support spot.
- **Does badly:**
  - the safety test reads a `_startPosition` that is never assigned (looks like a bug);
  - stale tangent points are reused when the receiver circle test fails;
  - the supporting role flip-flops with no hysteresis;
  - three.js rendering and a library dependency (Yuka) are far too heavy for a single-file game.
- **Takeaway:** offense spots per possession (our "home regions": point, two wings, two posts), a
  simplified pass-lane test (point-to-segment distance against defender reach over the pass's flight time),
  and **hysteresis** on every role switch (the user's auto-switch and the help defender).

## 3. Dunkman (cxong, MIT)
- **Does well:** a tiny arcade loop whose whole tension is keeping the ball away from defenders' hands
  on the way to the rim.
- **Does badly (for us):** it is MoonScript on TIC-80, a single-player minigame with no team play or
  shooting model.
- **Takeaway:** defenders' **reach** is the threat, not their bodies. Our steals and blocks test the
  ball against a defender's hand position and timing, so good spacing beats button mashing.

## 4. MDN Breakout tutorial (reference only)
- **Does well:** a clean structure for the canvas loop: clear, draw, update, collision, win/lose states.
  It also covers keyboard and mouse handling with `keydown`/`keyup` flags.
- **Does badly:** variable timestep (it moves by a fixed amount per frame, so speed follows the display rate).
  The tutorial's license is unclear, so no code was taken.
- **Takeaway:** keyboard state as pressed-flags read by the fixed step, plus edge-triggered "just pressed"
  sets for pass and shoot.

## 5. Reynolds steering behaviors (paper)
- **Does well:** composable movement: *seek*, *arrive* (slows near the target), *pursuit* (leads a
  moving target) and *interpose* (stands between two agents).
- **Takeaway:** off-ball offense uses arrive to its spot. Man defense uses interpose between the
  assignment and the rim, at a gap that depends on ball distance. Help defense and rebound chasing use pursuit.
  Speed and acceleration caps per player rating give feel without a physics library.

## Side-by-side: what became the foundation

| Concern | Taken from | Our version |
|---|---|---|
| Loop | Fiedler | 60 Hz fixed step, accumulator, 0.25 s cap, `step(n)` hook |
| Team AI structure | Kickoff | team phase (transition / half-court / defense) → player roles → steering targets |
| Passing | Kickoff | pass lanes scored by defender reach over flight time; pass to the most open teammate along the stick direction |
| Movement | Reynolds | arrive / interpose / pursuit with per-rating speed and acceleration |
| Steals and blocks | Dunkman | hand-reach tests on timing windows, not body contact |
| Input | MDN | held-key flags plus just-pressed edges, read only inside the fixed step |
| Shooting | (none found that fit) | original: hold-and-release meter, outcome rolled at release, trajectory solved to hit or miss the rim |
