# v3-m6-r2: Defender brief

**Inputs**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md` (Defender role), and `review/v3-m6-r1.md` (the binding verdict)
- **Sheets:** desktop-01 to -04, mobile-01 to -03
- **Before/after:** desktop-01 to -11; mobile-03, -06 and -07
- **Bursts:** desktop make-wide, net-close, jumper-close, dunk, dunk-close, drive, drive-close and open-play; mobile make-wide
- `probe/probe.json`
- **Full-size stills, with my nearest-neighbour crops** (scratch only; coordinates below are always in still pixels):
  - desktop c02, c06, c09, c10, c11, c12, c14, c15, c16, c17, c18, c19 and c21
  - mobile c06, c14, c15 and c21

The webm and sound are not reviewed and not scored.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| Art: players, court, venue | **7.5** | **Up from 7:**<br>- **Blocker 1's garment tears are gone** at every site the verdict listed: c06 (700-850, 385-410), c12 (352-396, 172-200), the c18 white-clad fan (790-830, 390-500), c21 (952-980, 532-556), the c15 coach (594-690, 336-555), and mobile c15.<br>- **The bench sawtooth collars** are now clean tank necklines (c15, 60-500, 230-330).<br>- **The cheer squad** has a shell top, a skirt and pom-poms (c06 at 3x, 700-880, 330-470).<br>**Not 8:**<br>- the close-range crowd-LOD heads in c15 and mobile c15<br>- the sharp green polyhedron in c08 and c17<br>- the c21 piping<br>- the shared c21 head mesh |
| Lighting & materials | **7** | **Held:**<br>- The desktop hierarchy holds: `floorCrowd` 3.25-4.14 (c02-c11, c16, c19), c04 ball contrast **6.4** (was 6.01), c05 **5.98** (was 5.43), and a jumper minimum of 2.99.<br>- The c14 bowl is now lit and celebrating (`desktop-07` lower pair).<br>**Against:**<br>- c14 `voidPct` is still 14.6, and the top-left (0-600, 0-120) means (4,4,9)<br>- `clippedPct` is 0 everywhere<br>- mobile `floorCrowd` is 1.99-2.25 |
| Animation & game feel | **7** | **Kept:**<br>- the net's barrel and stretch (net-close f00-f03)<br>- the ball now drops clear of the net to the floor (f05-f11)<br>- the official goes from idle (f00) to arms out (f01-f02) to the overhead signal (f03-f11)<br>- the house rises through make-wide f00-f13<br>- the new cheer squad performs varied arm positions<br>**Unchanged:** the dunk float (dunk f10-f12, airborne at f15), the jumper hold (jumper-close f09-f16), the pull-up hold (drive-close f08-f15), and the benches' lockstep. |
| UI / HUD | **7** | Unchanged. The callouts are correct ("3 POINTS" with "+3", "SLAM DUNK" with 2 points). The mobile "+3" still sits over the backboard (mobile make-wide f02-f13). |
| Typography | **6.5** | Out of scope (milestone 7). c13 is unchanged (`desktop-07` upper pair). |
| Readability | **7** | **Held:** ball contrast is up (above), and `handlerInBandPct` is 88-100 on every burst.<br>**Against:**<br>- the c19 hand on the handler's head is unchanged (my crop, about 847-860, 462-468)<br>- the paint mass (open-play f00-f15) |
| Mobile portrait | **7** | **Up:** mobile c14 `voidPct` is **4.7**, which passes the Blocker 5 test on mobile.<br>**Unchanged:**<br>- the card margin is about 10 device px<br>- the "+3" sits over the board<br>- the dunk `emptyFgMean` is 57.76<br>- the c21 z-fight<br>- the Select footer leak, now with a "More options below" cue |
| Authenticity of setting | **8** | **Of the six items in ruling 4's "not 8" list, two are closed and two are partly closed:**<br>- **Closed:** the home benches wear tonight's kit in every gym (c02, c09, c10, c11, c15, c16, c19).<br>- **Closed:** the cheer squads wear school colours with pom-poms (HSHS gold/black in c06, c07, c19 and dunk-close f02-f04; Jessieville purple/gold in c10).<br>- **Partly:** the officials now wear crew-neck shirts with set-in sleeves and a lanyard (c15, c18).<br>- **Partly:** the c12 gallery shows several poses.<br>- **Open:** the c09 ribbon.<br>- **Open:** the c21 1996 banner. |
| **Overall** | **7.1** | (7.5 + 7 + 7 + 7 + 6.5 + 7 + 7 + 8) / 8 = 57 / 8 = **7.125**.<br>The gain is +0.125 against 7.0. I concede it is under 0.2, and that the Art and overall targets are missed. |

---

## 2. Strengths, with evidence

### S1. Blocker 1 (crowd and bench garment artifacts) is closed at every site the verdict listed
I checked each site at 3x:

| Site | Before (v3-m6-r1) | Now |
|---|---|---|
| **c06 cheer group** (700-850, 385-410) | skin shards through black tops and trousers | Clean black tops on gold skirts. The waist boundary at about y 395-405 is one continuous line on all three figures. |
| **c12 gallery** (352-396, 172-200) | a hip tear | The black-top, brown-trouser figure at about 367-400, 147-193 is clean, as is the whole left group (220-560, 80-240). |
| **c18 white-clad fan** | brown shards from the belly to mid-thigh | A white long-sleeve top over khaki trousers (my 1.6x crop, about 790-880, 340-560), with no shards. `desktop-09` lower pair shows the change side by side. |
| **c21** (952-980, 532-556) | a hip tear | A yellow-shirted fan in navy trousers, clean at 4x. |
| **c15 coach** (594-690, 336-555) | a hip tear | A black tee over khaki trousers, clean from the hem to the shoe. |
| **Mobile c15** (300-440, 480-700) | a hip tear | The same coach, clean. |
| **c15 bench collars** at (187,267), (319,267) and (469,286) | sawtooth collars | Clean scoop tank necklines on white tank tops (my 2x crop, 40-540, 200-420). |

Blocker 1's own pass test has two parts:
- **"No skin or under-layer shows through any shirt or trouser":** met in c06, c12, c15, c18, c21 and mobile c15.
- **"No rectangular patch on any chest":** see concession C6.

### S2. Blocker 2 (the home bench in the home team's kit) is closed in every listed frame
- **c02** (my 3x crop, 620-960, 250-350): five white tanks and white shorts. HSHS plays in white with black trim (the c02 handler).
- **c09:** white at the state finals (my 2.5x crop, about 420-560, 235-310). `desktop-05` upper pair shows BEFORE in black/gold and AFTER in white.
- **c10:** the Jessieville bench is in white (my 2x crop, 570-800, 255-330), matching JHS in white (c10 #23 and others).
- **c11:** the Mountain Pine bench is white (`desktop-06` upper pair: BEFORE red, AFTER white). It matches the white-and-red MP defender on the floor.
- **c15:** white tank tops and white shorts (60-500, 230-500). `desktop-08` upper pair shows the swap from black/gold.
- **c16** (0-160, 300-340) and **c19** (my crop): white.

The visiting benches keep their own colours: Lakeside blue in c06 (my 2x crop, 150-470, 340-460) and in c16.

### S3. The cheer squad is a cheer squad again (a regressed item in Blocker 3 is closed)
- **c06, my 3x crop of 560-940, 260-480:**
  - three cheerleaders in black shell tops and gold skirts, white sneakers and socks
  - gold pom-poms in hand: at about (655,345), (737,350) and (884,338), with more at (757,333) and (820,350)
  - three different arm positions: left one arm up and one forward; centre both out; right one up and one out
- **The same squad appears at:**
  - c07 (about 1020-1100, 185-240)
  - c19 (about 590-700, 160-215)
  - dunk-close f02-f04 (behind the dunker)
  - make-wide f00-f06
- **c10 (my 2x crop, 300-420, 225-330):** Jessieville's squad is in purple tops and gold skirts with purple pom-poms, in Jessieville's own colours.

The verdict's test was "the cheer group (c06, c07, c19) wears a cheer uniform with pom-poms". That is met. The pom-poms are low-poly icosahedra, which I concede under Art (C7).

### S4. The officials' shirt is fixed (Blocker 6, part 1)
- **c18 (my 1.5x crop, 330-640, 380-800):**
  - a crew-neck striped shirt with a black lanyard loop, short sleeves set on the shoulder, and vertical stripes
  - the r1 scoop neck and off-the-shoulder sleeve are gone (`desktop-09` lower pair)
- **c15 (my 1.5x crop, 680-1280, 60-420):** the same crew neck and lanyard, and the sleeves sit on the shoulder cap.
- **Skin:**
  - The c18 face is about (203,149,111) at (430,425) and (201,149,117) at (440,440). r1 had (214,162,90), a yellow cast; this is now a plausible light skin tone.
  - The c15 face is (99,46,26) to (107,58,45) at (860-880, 140-160). r1 had (122,51,5), a saturated orange; this is now a brown with a real blue channel.

### S5. The officials perform the net-close beat
In desktop-net-close:
- **f00:** an arms-down idle
- **f01-f02:** arms out
- **f03-f11:** both arms overhead, the made-three signal

This is the verdict's keep 7, kept and extended into a clean three-step sequence. In make-wide, the trail official signals at f01-f06.

### S6. The c14 showcase is a real payoff now (Blocker 5 partly closed)
- **`desktop-07` lower pair:**
  - BEFORE was a dark bowl with a few lit seats.
  - AFTER, the right half of the bowl (920-1280, 100-480) is a celebrating crowd with arms overhead, confetti specks (white and gold, about 140-1240, 260-560) and the finalists celebrating on the floor (about 940-1080, 400-490).
- **Mobile c14** `voidPct` is **4.7**, against 6.2 in r1. That **passes** the "<5" test on mobile.
- **Desktop c14** `voidPct` is **14.6**, against 18.5: better, but it fails (C3).

### S7. The c12 gallery is no longer one mannequin pose (Blocker 3, partly)
My 3x crops of 220-560, 80-240 and 700-1080, 80-240 show:
- one hand raised (about 230, 145)
- hands clasped in front (about 305, 185)
- arms akimbo and arms spread (about 920-990, 110-150)
- a hand to the face (about 815, 115)
- both hands raised (about 850-880, 95-110)
- one arm reaching out (about 1060, 130)

r1 described "about 25 identical rest poses". That is no longer true. Some neighbours still share the arms-down stance (C4).

### S8. The desktop lighting and ball read improved slightly and kept the hierarchy
From `probe.json`:
- c04 `ballContrast` is **6.4** (r1 6.01) and c05 **5.98** (r1 5.43).
- The jumper burst's `ballContrastMin` is 2.99 (r1 3.00).
- `floorCrowd` is 3.25-4.14 on every desktop gameplay still.
- The desktop crowd stays dim against the court: `crowdY` 0.0167-0.0336.

### S9. Carried keeps are intact
- **The callouts:** make-wide f00-f06, and dunk f14-f15 ("SLAM DUNK", with 2 points on the bug).
- **The dribble ball under the hand:** my c19 3x crop, with the ball at about 860-890, 527-557 under the right hand.
- **The bound buns:** c17 (my 2x crop) and c12.
- **The setting:**
  - the HOT SPRINGS / JESSIEVILLE / MOUNTAIN PINE / STATE FINALS tables
  - the wordmarks and court logos
  - the RAMS and TROJANS baselines
  - the COBRAS banner in c08
- **The mobile thumb deck** is clear of play, and the mobile `playerPx` is 82.5-87.5 in c02-c05.

---

## 3. Pre-emptive rebuttals

### R1. "The home bench is still in the wrong kit."
Not supported. In c02, c09, c10, c11, c15, c16 and c19 the home benches wear white tanks and white shorts, matching their teams (S2). The before/after pairs `desktop-01` (lower), `-05`, `-06` (upper) and `-08` (upper) show the change directly.

### R2. "The crowd still has hip tears and skin shards."
Not at any site the verdict listed (S1, with the 3x crops cited). A prosecutor who repeats r1's list must cite a new coordinate. The listed ones are clean.

### R3. "The cheerleaders have no pom-poms."
False:
- c06: five pom-poms in the 3x crop
- c10: purple pom-poms
- c19: gold pom-poms at about (600,160), (617,164), (636,170) and (707,163)
- dunk-close f02-f04: pom-poms behind the dunker

### R4. "drive-close f00 and dunk-close f00 show a black void."
That is the crop harness, not the game. In desktop-drive f00 the ball handler is at the right frame edge, and an off-screen arrow is drawn at the right edge (tile about 420,153). The close crop centred on him runs past the frame, so its right part is black. In desktop-dunk f00 the dunker is likewise off-frame. Every later close frame has full content.

### R5. "The c18 net-close voidPct of 10.7 and the c15 floorCrowd of 0.78 show dark, flat close shots."
r1 ruling 9 already found that these probes measure the wrong thing:
- In c18, the void is the black stanchion pad (about 840-950, 380-560 and the base at 1100-1280, 600-760).
- In c15, the "floor" samples fall on the scorer's table and apron.

They should not be used as evidence either way.

### R6. "The officials are unchanged."
The shirt is not unchanged:
- `desktop-08` upper pair: BEFORE a scoop neck with the sleeve off the shoulder cap; AFTER a crew neck with a lanyard and set-in sleeves
- `desktop-09` lower pair: the same change
- the skin moved (S4)

What is unchanged is the lower body and the c15 pose (C2). The verdict's Blocker 6 is partly closed, not open.

### R7. "The crowd still clones / the house is frozen."
- The house develops from c06 (arms out) to c16 (arms overhead, my c16 crop 0-1280, 120-380), and through make-wide f00-f13 and net-close f00-f08.
- The cheer squad, the c12 gallery and the c14 bowl have varied poses.

The lockstep that remains is on the **benches** (C1). It does not apply to the crowd as a whole.

### R8. "c14 is still a black void."
On mobile it passes (`voidPct` 4.7). On desktop it fails in the top-left only. The bowl, the confetti and the ribbons ("STATE FINALS" at about 1080-1170, 95-105 and 1225-1280, 450-470) are kept, and the celebrating crowd now fills the right half (S6). "Still a void" overstates a 14.6% top-left band. "Still fails the <5 test" is accurate.

### R9. "The net reaction regressed."
- **The hem:** my per-column scan of tile columns 190-230 (luma 120) gives f00-f03 hems at rows 147 / 151 / 151 / 147. These are the same peak values the r1 verdict measured.
- **After f04 my scan is unusable:** the dropping ball and the official contaminate the columns. I don't claim a number there.
- **The settle:** by eye, the net is short and settled by f05-f07.
- **The ball exits:** it now visibly leaves the net and falls to the floor (f05-f11). That is an improvement in the read of the make.

---

## 4. Concessions

### C1. Bench lockstep (Blocker 3, the bench part) is still open
- **c15 (my 2x crop of 40-540, 200-420):** six home bench players share one forward-clap pose at the same phase.
- **c02 (my 3x crop):** five white tanks in near-identical claps.
- **c10 (my 2x crop):** six white bench players in one seated open-palm pose.
- **c06 (my 2x crop) and c16 (my 3.5x crop):** the Lakeside bench is all crossed arms. c16 shows small phase differences only.

This fails "no 3 adjacent figures share the same pose and phase".

### C2. The officials' lower body and the c15 pose
- c15 and c18 still show **black shorts over black tights** (c18 crop, about 395-480, 590-720 and 345-500, 720-800), not full-length trousers.
- The c15 official still holds the **arms-out** pose (c15, 700-960, 320-420), not the idle/signal set.
- The c15 shirt's stripes curl around the shoulder (about 940-980, 270-310), which is not "UV-straight".

Blocker 6 is partly closed.

### C3. c14 on desktop fails
`voidPct` is 14.6 against the test's 5. The top-left (0-600, 0-120) means about (4,4,9).

### C4. The c12 gallery is varied but not fully
- In my 3x crop, three front-row figures at about 340-400, 140-240 share the same arms-down, legs-apart stance.
- The right group's middle (about 830-930, 150-240) is similar.

The test is partly met.

### C5. The close cameras (Blocker 4) stay open, with a new artifact
- **c08 and c17:** the floating fan's hand is replaced by a **sharp, faceted green polyhedron** (apparently a pom-pom), with a brown forearm under it. It sits at about 125-240, 640-735 in c08 (my 2x crop) and about 0-120, 560-700 in c17 (`desktop-09` upper pair). It is unblurred and in the foreground, so "no unblurred crowd geometry" still fails. It arguably reads worse than the hand.
- **c15 and mobile c15:** the bench and coach bodies are still crowd-LOD, with mitten hands. Several have pale, near-bald heads with a hair cap: c15 at about 75-130, 210-280; mobile c15 at about 112-187, 445-532. They are clean of tears, but they are not player-grade.
- **c21 piping is unchanged:** a gold strip with a magenta sliver bridges #53's arm opening at about 800-830, 550-600 (my 3x crop).
- **Mobile c21:** the pale z-fight patches on YOU's nose bridge and cheek (about 335-390, 540-590) and the shoulder seam remain.
- **c17:** the green slivers off both shoulders remain at about (710-732, 578) and (840-862, 581).

### C6. The neckline cuts on white-topped fans
In c15 the white-topped fans have stepped, square-cut necklines that show skin in a near-rectangle (about 760-830, 100-130 and 920-990, 140-170). They now sit at the collar, not mid-chest, but at 2.5x they still read as cut-outs.

### C7. Prop quality
The pom-poms are faceted gold icosahedra (c06, c19, c10). They read as pom-poms at gameplay size, but as polyhedra at 3x and in the c08 and c17 foreground.

### C8. Carried animation is unchanged
- **The dunk:** ball over the ring at f10-f12, airborne at f15, and dunk-close loses the dunker from f08.
- **The jumper:** jumper-close f00-f01 have near-straight legs, and f09-f16 hold the follow-through.
- **The pull-up:** drive-close f08-f15 holds the arms overhead.

### C9. Carried setting and readability items are unchanged
- **c09:** the bench heads still occlude the upper "STATE FINALS" ribbon (my 2.5x crop, about 440-560, 238-255).
- **c21:** still shows a "1996 BOYS STATE CHAMPS" banner, against the hub's fact (the boys won in 1998).
- **c19:** the defender's hand still rests on the handler's head (my 3x crop, about 847-860, 462-468).

### C10. Mobile is unchanged
- **The card margin:** the sole bottom is at about y 989 and the card top at y 999 in mobile c06, so about 10 device px against 32. The orange blotch at the ankle (about 532-582, 952-980) remains.
- **"+3" over the backboard:** mobile make-wide f02-f13.
- **The dunk:** `emptyFgMean` 57.76.
- **The c13 Select footer:** "Cutter-" and "Jessieville" still leak below BACK/TIP OFF, though a "More options below" cue was added.
- **The lighting:** mobile `floorCrowd` stays at 1.99-2.25 in c02, c06, c07, c10, c16 and c19.

### C11. The milestone
On my own scores, Art (7.5) and overall (7.1) miss their milestone-6 targets, and Authenticity reaches 8.0 only on my reading. The round's gain is +0.125, under the 0.2 plateau threshold.
