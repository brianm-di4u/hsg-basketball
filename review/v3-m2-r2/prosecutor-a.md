# v3-m2-r2: Prosecutor A (art, lighting, setting)

**Inputs:**
- `PACKET.md`, `review/RUBRIC.md`, `review/REVIEWER.md`, `review/v3-m2-r1.md`
- `probe/probe.json`
- **Before/after:** `mobile-05`, `mobile-07` and `mobile-08`. The other before-after pairs and all 7 contact sheets did not load in my session (the tool returned "media removed"), so I worked from full-size stills instead.
- **Desktop stills:** c01, c02, c05, c06, c07, c08, c09, c10, c11, c12, c13, c15, c16, c17, c18, c19, c21
- **Mobile stills:** c02, c05, c06, c08, c18
- **Bursts:** desktop make-wide, net-close, open-play, drive and jumper; mobile net-close, make-wide, drive and open-play
- **Benchmark sheets:** 01 and 04
- **My own zooms and pixel reads:**
  - c18 net (3x) plus RGB rows through it
  - c05 ball (4x, nearest-neighbour)
  - c01 foreground crowd (2x, nearest-neighbour)
  - the c02 crowd band, the c02 paint clump and the dark figure by the table
  - the c06 front row
  - c07 sideline figure; the c16 card on the table
  - c21 faces, hand and "53"
  - c08 shooter's arm
  - make-wide f04, f05 and f06, ball on floor (4x)
  - mobile c02 and c19 at the old sliver coordinates (3x)
  - mean luma and saturation for every open-play frame (both viewports)
  - luma rows through the ball halo in mobile c08, desktop c08 and mobile c05

The webm and the sound are not reviewed.

---

## 1. Scores

| Category | Score | Justification and evidence |
|---|---|---|
| **Art: players, court, venue** | **6** | **Better:** the c09 fascia ribbon, and crowd tints now in each school's colours (gold and maroon in c02, purple and gold in c10, blue and gold in c06).<br>**Players are still mannequins:**<br>- c21 faces (x 430-810, y 110-290): eyebrows, white-ringed dot eyes and a mouth line were added, but there is still no nose, the head is a capsule and the hair is a painted cap.<br>- The c21 hand (x 830-980, y 480-590) is a mitten with no fingers.<br>- The "53" panel still juts out over the elbow (c21 x 440-520, y 510-640).<br>- The c02 #1 is a bald dome (x 255-290, y 415-450).<br>**The title screen opens on artifacts:** the foreground crowd is upscaled, blurry photo cut-outs with ragged, stair-stepped alpha (c01 x 0-420 and x 900-1280, y 520-800; my 2x zoom).<br>Far from benchmark sheet 04 (Playgrounds 2). |
| **Lighting & materials** | **6.5** | **Credit:** three m2-r1 artifacts are gone (the pale disc, the desktop floor smudge and the grade pop; see section 3). The hierarchy holds (`floorCrowd` 2.77-3.42 in desktop live stills). The rim flash blooms (net-close f00-f03).<br>**New, and holding it below 7:**<br>- **A white rim term turns dark-kit players in the unlit apron into glowing ghost outlines:** c07 x 375-455, y 360-500 (my zoom); c02 x 950-1000, y 255-370; c05 x 15-70, y 225-325.<br>- **A blown white patch on the shooter's arm:** c08 x 850-885, y 520-560 (my zoom).<br>- **A dark ball halo smudges a flat wall in the mobile replay:** mobile c08 x 310-490, y 450-620; wall luma 73 drops to about 36 beside the ball.<br>**Still missing:** floor light pools, and any difference between skin, cloth and wood. c21 skin and jersey are the same matte. |
| **Animation & game feel** | **6.5** | **Credit:**<br>- the rim flash fading from cream to red (net-close f00-f04, both viewports)<br>- a clean ball exit through the net (f04-f11)<br>- a ball streak on the drive (f12-f15)<br>- the slam card now stays parked over the crowd (desktop make-wide f00-f11)<br>**Against:** the jumper is still a stiff, small-silhouette release (jumper f08-f17), and part of the crowd still raises its arms on the airball (c07 x 190-220, y 225-260; x 570-600, y 175-200). |
| **UI / HUD** | **6.5** | **Credit:** the card no longer touches the ball or the YOU player (c06 card x 280-655, y 160-270; ball x 925-965, y 500-540; mobile c06 card on empty floor, y 1000-1140).<br>**Against:**<br>- **Desktop Select still overflows:** the footer bar cuts through the Quarters row, and the Shot clock and Difficulty rows sit below the fold (c13 y 690-800).<br>- **The card's "HOT SPRINGS" subtitle lands on the table's own "HOT SPRINGS" wordmark:** c16 x 300-520, y 280-325, and make-wide f07-f10. Two words stack in two typefaces. |
| **Typography** | **6** | The condensed display face is consistent (c13). The mobile "STEAL"/"JUMP" sublabels are still about 9 css px (mobile c06 x 435-510, y 1565-1590; x 620-690, y 1500-1525). |
| **Readability** | **7** | The ball keeps its dark outline in flight (c05 zoom), and the teams separate by jersey value.<br>**Watch:**<br>- c05 `ballContrast` fell from 5.02 to 2.91, and mobile c05 from 4.37 to 3.73.<br>- The paint clumps still merge: c02 x 160-420, y 400-720; c19 x 290-520, y 360-730. |
| **Mobile portrait** | **6.5** | **Credit:** c02-c07 hold 77-88 px, the basket is in view, the card is clear of players (mobile c06), and the banners are on the wall (mobile c06 x 0-250, y 140-200).<br>**Exceptions are worse than last round:**<br>- c16 `emptyFgPct` 41.5 with `playerPx` 66.4 (was 37 / 68.7)<br>- c11 50.6 px (was 53.5)<br>- c09 57.6 px with `emptyFgPct` 31.3<br>- the drive is still a small shooter over bare wood (mobile drive f06-f15, `emptyFgMean` 27.7)<br>- the replay halo smudge (mobile c08) |
| **Authenticity of setting** | **6.5** | **Credit:**<br>- the "HOT SPRINGS, ARKANSAS / STATE FINALS" fascia ribbon (c09 x 0-1280, y 235-265)<br>- school-colour crowds (c02, c06, c10, c11)<br>- the COBRAS banner on the replay wall (c08 x 305-370, y 55-305)<br>- STATE CHAMPS banners on mobile (mobile c06)<br>**Still missing:**<br>- **No team on any bench:** street-clothes spectators sit among empty chairs (c02 x 505-840, y 295-355; c10 x 510-830, y 275-335; c15 x 60-660, y 200-520).<br>- **No title banners on any desktop home-gym wall** (c02, c06, c10, c11, c19).<br>- **Hot Streak crowd on a bare ledge:** it still stands on a ledge with no bleacher and no ball racks (c12 x 220-1040, y 90-225).<br>Only c09 reaches the 7 anchor. |
| **Overall** | **6.4** | (6 + 6.5 + 6.5 + 6.5 + 6 + 7 + 6.5 + 6.5) / 8 = 51.5 / 8 = 6.44 |

---

## 2. Defects, ranked by how often a player sees them

### 1. Mannequin athletes in every frame
- **Evidence:**
  - c21: capsule heads with no nose (x 430-810, y 110-290); mitten hand (x 830-980, y 480-590); the "53" panel sticking out over the elbow (x 440-520, y 510-640); a giant near-plane arm filling x 0-330, y 380-620.
  - c02 #1 has a bald dome (x 255-290, y 415-450).
  - c02 has a horizontal-kick pose with a leg at head height (x 355-410, y 380-420).
  - Benchmark sheet 04 (Playgrounds 2) has authored heads, hair, shoes and fingers.
- **Fix:**
  - **Heads:** a nose and a jaw plane.
  - **Hands:** 3-segment hands with a thumb.
  - **Hair:** 6-8 hair meshes (no bald default).
  - **Limbs:** tapered limbs and soled shoes.
  - **Number:** bind the number decal to the torso skin weights.
  - **Close camera:** clip any mesh within 0.4 m of it.
  - **Poses:** clamp the kick pose's hip flexion.

### 2. Glowing ghost outlines on dark-kit players in the apron
- **New this round.**
- **Evidence:**
  - c07 x 375-455, y 360-500: a near-black body with a hard white rim (my zoom)
  - c02 x 950-1000, y 255-370
  - c05 x 15-70, y 225-325
  - c08 x 850-885, y 520-560: a blown white patch on the arm
  - c15: a white rim on the referee's shoes (x 825-940, y 650-720)
- **Fix:**
  - **Tint and cap:** make the rim term cool (about #9fb8ff), cap it at 0.35 of key, and multiply it by the lit-floor mask or the received light, so a body in the unlit apron does not glow.
  - **Highlights:** clamp the specular so no skin pixel clips above 245.

### 3. The photo crowd: a different art style, and it repeats
- **Evidence:**
  - Photo crowds fill y 0-300 of every desktop live frame (c02, c06, c10, c11, c19).
  - The same clapping blonde sprite recurs across the c02 band (x 380-1000, y 90-300).
  - The c01 foreground faces are upscaled about 4x with ragged alpha (x 0-420 and x 900-1280, y 520-800).
  - A stray white vertical quad between a spectator's knees (c06 x 376-380, y 405-435).
- **Fix:**
  - **Style:** posterize to 4-5 tones with a dark edge and desaturate 20-30%.
  - **Repeats:** seed the shuffle so no sprite repeats within 3 seats, with a mirror and ±8% tint jitter.
  - **Title:** replace the c01 foreground with sprites at native resolution (or blur them as depth-of-field), using premultiplied alpha with 1 px dilation.

### 4. No team on the benches, and no banners on the desktop gym walls
- **Evidence:**
  - Street-clothes sprites sit in the bench chairs: c02 x 505-840, y 295-355; c10 x 510-830, y 275-335; c11 x 935-1250, y 335-400; c15 x 60-660, y 200-520.
  - None of the desktop home-gym frames (c02, c06, c10, c11, c19) shows a title banner, although mobile c06 does.
- **Fix:**
  - **Benches:** 5 seated players in warm-ups plus a coach per team, in school colours. Remove the crowd sprites from the bench row.
  - **Banners:** 3-5 title banners on the desktop far wall, set below the HUD bug.

### 5. The ball halo is now a dark smudge on flat walls (mobile)
- **Evidence:**
  - mobile c08 x 310-490, y 450-620: the wall goes from about 73 to about 36 luma around the ball (pixel row y 538)
  - mobile c05: a halo on the brick wall behind the board (x 330-420, y 300-420)
  - Desktop c08 has no halo (row y 222 stays flat at 74), so the two viewports disagree.
- **Fix:**
  - **Where it applies:** mask the dim with the crowd sprite alpha, never the wall or the court.
  - **Replays:** turn it off in the replay camera.

### 6. The card subtitle collides with the in-world table wordmark
- **Evidence:** c16 x 300-520, y 280-325: "HOT SPRINGS" in italic white sits on top of the gold "HOT SPRINGS" table text. The same happens in make-wide f07-f10.
- **Fix:** move the card up by its subtitle height, or drop the subtitle when the table wordmark is on screen.

### 7. No light pools, and no material separation
- **Evidence:**
  - c02, c12 and c19 floors show only a broad vignette, with no discrete pools.
  - In c21, skin and jersey share one matte response.
  - The c18 net is a flat cream lattice with no strand shading (my zoom).
- **Fix:**
  - **Floor:** 4-6 baked soft pools.
  - **Materials:** skin with a soft sheen and a slight SSS tint; matte, slightly darker cloth; a grazing-angle sheen on the wood.
  - **Net:** shade it by strand normal.

### 8. Desktop Select still overflows
- **Evidence:** c13 y 690-800: the footer covers the Quarters row, and the Shot clock and Difficulty rows sit below the fold. On mobile (before-after `mobile-05`, AFTER), TIP OFF is in view, but the footer clips the Difficulty row.
- **Fix:**
  - **Steps:** split Select into Home, then Away, then options.
  - **Footer:** reserve the footer height in the scroll area.

### 9. The Hot Streak crowd stands on a ledge
- **Evidence:** c12 x 220-1040, y 90-225: rows of standing photo sprites on a black slab, with no bleacher and no racks.
- **Fix:** a 3-step bleacher and two ball racks by the arc.

---

## 3. Regressions, and the status of `v3-m2-r1` blockers and fixes

| m2-r1 item | Status | Evidence |
|---|---|---|
| **Blocker 1:** card over the ball or player | **Closed** on placement | **Desktop:** the card sits over the crowd only (c06 x 280-655, y 160-270; make-wide f00-f11).<br>**Mobile:** it sits on empty floor (mobile c06 y 1000-1140).<br>**Residue:** the card still lingers semi-transparent to f11 on desktop and f11 on mobile while play resumes, and the subtitle collides with the table (defect 6). |
| **Blocker 2a:** pale disc in the net | **Closed** | In my c18 3x zoom, the strands over the ball read about (175, 146, 122), against about (180, 158, 138) elsewhere, so they match. The ball shows orange through the holes. Mobile c18 is the same. |
| **Blocker 2b:** floor smudge around the ball | **Closed on desktop; moved on mobile** | My make-wide f04/f05/f06 zooms show clean wood around the ball. **But** mobile c08 has a dark halo on the wall (defect 5). |
| **Blocker 2c:** red sliver on mobile | **Closed** | Nothing at mobile c02 x 483-488, y 848-908 or mobile c19 x 310-318, y 860-881 (3x zoom). |
| **Blocker 2d:** grade pop | **Closed** | The largest frame-to-frame step in desktop open-play is 0.7 luma (0.9%) and 0.4 saturation. Mobile is the same. The f13 to f14 step was 0.4. |
| **Blocker 3:** the replay frames no shooter or ball | **Closed** | c08 and c17 frame #2 from behind, the ball (c08 x 630-668, y 205-242; c17 x 662-712, y 186-236) and the basket, all well inside the letterbox. Mobile c08 is the same.<br>**Weak point:** c08 and c17 are nearly the same beat (the ball moved about 40 px). |
| **Blocker 4:** Select overflow | **Open (desktop) / Partly (mobile)** | See defect 8. |
| **Fix 4:** characters and crowd style | **Open** | Defects 1 and 3. Only eyebrows and a mouth were added (c21). |
| **Fix 5:** camera in motion | **Partly** | Desktop drive `handlerInBandPct` is 100 (was 40), but `emptyFgMean` is 25.7. Mobile drive `emptyFgMean` is 27.7 (was 36.8). |
| **Fix 6:** crowd reaction on a make vs a miss; the jumper | **Partly** | Fewer arms are up on the airball (c07), but some still are. The jumper is unchanged (f08-f17). |
| **Fix 8:** lighting | **Partly** | A rim term was added, but it causes defect 2. No pools. No material split. |
| **Fix 9:** enclosure and identity | **Partly** | **Done:** the c09 ribbon and school-colour crowds.<br>**Not done:** benches, desktop banners, the Hot Streak bleacher. |
| **Fix 10:** mobile aliasing and crowd alpha | **Open** | The c01 foreground alpha is ragged (defect 3). |

**Regressions this round:**
1. The ghost rim outlines and the clipped arm highlight (defect 2). These are new.
2. The ball halo now shows on flat walls in the mobile replay (mobile c08).
3. Desktop c05 `ballContrast` fell from 5.02 to 2.91 (mobile c05 from 4.37 to 3.73). This is Keep item 1. The outline still reads in my zoom, but the number regressed.
4. The mobile exception frames got worse: c16 `emptyFgPct` went from 37 to 41.5, and c11 from 53.5 px to 50.6 px.
