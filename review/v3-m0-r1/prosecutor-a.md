# v3-m0-r1: Prosecutor A (art, lighting, setting)

Stance: harsh. I judge against the benchmark sheets in the packet, not against "good for a browser game". I have not seen the developer's assessment.

**Inputs:**
- `PACKET.md` and `RUBRIC.md`
- `review/history/final-review.md` (the previous binding verdict: 6.1)
- All 7 contact sheets and all 4 benchmark sheets
- Full-size desktop stills: c02, c04, c06, c08, c09, c10, c11, c12, c15, c16, c17, c18, c21
- Full-size mobile stills: c02, c06, c09, c17, c18
- Bursts: desktop jumper, drive, make-wide and net-close
- `probe/probe.json`, plus the annotated `probe/desktop/c02-live.png`
- 2-3x zoomed crops I made of desktop c02, c04, c09, c11 and c16, and of mobile c02

**Not reviewed:** the webm video (I can't open it), sound (not shown).

**Packet inconsistency:** the `c17-replay-early` thumbnails on `sheets/desktop-03.png` and `sheets/mobile-03.png` show an empty court with no player. The full-size `stills/desktop/c17-replay-early.png` and `stills/mobile/c17-replay-early.png` show the #2 shooter with arms up. The sheet and the still came from different frames. All c17 claims below cite the full-size still.

**Probe caveat:** the crowd samples in `probe/desktop/c02-live.png` (red dots) mostly land on the dark gaps between seats and spectators, not on faces and shirts. So `crowdY` (~0.035-0.042) and `floorCrowd` (3.2-3.5) overstate how dim the house looks to a player. The eye reads the lit, high-detail photo faces, not the gaps. I treat `floorCrowd` as an upper bound on the hierarchy, not as proof of one. No probe measures floor-reflection ghosts at all.

---

## 1. Scores

| Category | Score | Justification | Evidence |
|---|---|---|---|
| Art: players, court, venue | **6** | The floors, crests, per-school crowd recolor, pep band and cheerleaders are real assets. The new close cameras prove the players are faceless mannequins: dot eyes, no nose or mouth, no fingers. The photoreal crowd behind them makes the players look worse, not better. | c21 desktop: #12 face at x 670-760, y 120-200 has two dots and a brow line; hands are rounded stubs (x 1000-1090, y 680-780). c15: ref's hands are stumps (x 960-1010, y 380-430). c02: empty bench chairs (x 600-890, y 210-255). Replay c08: void at x 540-1280, y 56-580. |
| Lighting & materials | **5** | Contact shadows and a believable floor sheen, and the court is brighter than the house (probe). But ghost wisps still show on every floor, there are new translucent ghost discs at the rim, and 20-37% of each gameplay frame is near-black. Players are flat-lit with no key or rim light. Glass, skin, cloth and wood don't read as different materials. | c16: wisps at x 810-940, y 330-690. c09: wisps at x 470-490, y 480-540 and x 980-1000, y 570-640, the second on the dark apron off the court. c18: discs at x 480-800, y 115-210. Probe `nearBlackPct`: c02 24.1, c06 26.6, c09 36.8. c21: skin is a single flat brown with no specular. |
| Animation & game feel | **5.5** | There is a ball trail and a visible ball through the net, which the prior verdict lacked. The net barely deforms, and the crowd sprites hold near-identical poses across the frames. The slam card sits on screen through the whole make-wide strip. Prosecutor B owns this category. | Trail: jumper f12-f17, drive f09-f15 (orange blob over the crowd). Net-close f04-f11: ball in and out of the net; net silhouette nearly constant. Make-wide f00-f13: slam on all 14 frames. |
| UI / HUD | **5.5** | "+3" sits on the backboard on both viewports. The slam and "+3" still linger 0.8 s after the make. A giant YOU chevron covers the controlled player's face in the close camera. Menus are still cream web cards, and select still overflows 800 px. | c06 desktop: "+3" at x 820-880, y 130-180, over the glass. Mobile c06: "+3" plate at x 340-470, y 435-505, covering the rim. c16: "+3" floating over the crowd at x 1190-1230, y 85-125, with the slam at x 445-835, y 515-635. c21: chevron at x 690-930, y 205-335. c13: Quarters row cut at the bottom edge. |
| Typography | **5.5** | No change: a good condensed display face on the slam and HUD, and generic sans text in the menus. | c01, c13, c20, c22 (desktop and mobile). |
| Readability | **6** | The ball at its apex still sits among faces. The probe confirms it: `ballContrast` is 1.10 (c04), 1.16 (c05), mobile 1.02 (c05) and 1.01 (c06). On mobile, a translucent near-basket box washes out the paint clump. | c04 zoom: ball at about (530, 150) on a row of photo faces. Mobile c02: box at x 330-550, y 935-1075. |
| Mobile portrait | **6.5** | The banners with real title years and the end-wall crowd are good. Players measure only 47-58 css px (probe `playerPx`), the whole court is still visible, and the near-basket fade reads as a glitch box over the most important area. | Mobile c02, c10, c11 (whole court); mobile c02 box; mobile c06 banners 1932/1996/1998 at the top. |
| Authenticity of setting | **6.5** | Real gym elements: a pep band with tubas, cheerleaders, a scorer's table board (HOME / HOT SPRINGS / GUEST), school-colored crowds, baseline wordmarks, and title banners on portrait. But no desktop gameplay frame shows a title banner. The state-finals arena still reads as a dark gym with a cropped "HOT SP" apron. | c02 zoom: pep band at x 200-270, y 120-160. c11: MOUNTAIN PINE board at x 450-810, y 220-255, and a red crowd. c09: apron x 0-1280, y 620-800, "HOT SP" cropped at the right edge, no ribbon. |
| **Overall** | **5.8** | Mean of 6 / 5 / 5.5 / 5.5 / 5.5 / 6 / 6.5 / 6.5 = 46.5 / 8 = 5.81. | |

The overall is 0.3 under the prior 6.1. The build is reported as unchanged. The drop is evidence, not a regression: this round adds close cameras (c15, c18, c21), a net cam and bursts, and they expose the mannequin bodies, the sprite crowd's lack of grounding and the ghosting, which the old far stills hid. Art −0.5, UI −0.5 and Mobile −0.5 are calls on what these new frames show.

---

## 2. Defects, ranked by how often a player sees them

### 1. Floor-reflection ghosts in every gameplay frame (open since m1)
- **Evidence:**
  - Pale vertical wisps sit 0.5-2 body heights below the players. They don't track anyone's silhouette.
    - c16 zoom: x 810-940, y 330-690, and a second wisp under the midcourt clump at about x 600-640, y 400-470.
    - c09: x 470-490, y 480-540, and x 980-1000, y 570-640. The second one extends past the sideline onto the dark apron, which proves it is a reflection pass and not a floor texture.
  - Mobile c02: smears at x 370-470, y 1160-1260 and x 200-240, y 1010-1040.
  - Mobile c06: smears at x 120-160, y 990-1050; x 520-560, y 1130-1200; x 740-780, y 1110-1170.
- **Fix:** clamp the planar reflection to the court polygon. Fade it with height above the floor (`exp(-h/0.4 m)`) and a Fresnel weight, with a total cap of about 0.12. If it still ghosts at that cap, delete the reflection and rely on the existing contact shadows plus a baked sheen gradient. Hoop Land and Playgrounds 2 ship with no reflections at all.

### 2. Faceless mannequin players, and a photoreal crowd that out-renders them
- **Evidence:**
  - c21: the #12 face is two dots and a brow stroke, with no nose or mouth (x 670-760, y 120-200). The hands are mittens (x 1000-1090, y 680-780; x 330-380, y 200-330). The limbs are untapered tubes.
  - c15: the ref's arms end in stumps (x 960-1010, y 380-430) under a blank head (x 880-940, y 90-160).
  - c08 and c17: #2's arms end in balls.
  - Behind them, the crowd is photographic people with lit faces and individual expressions (c15 x 0-1280, y 0-400; c21 background).
  - The result inverts the art hierarchy. The spectators are rendered at a higher fidelity than the athletes, and the two styles clash in every close shot (c15, c18, c21, and mobile c18 and c21).
  - Against the benchmarks, Playgrounds 2 (`benchmarks-04`, playgrounds2-1/2) gives stylized players faces, sneakers and silhouettes, with a crowd in the *same* style.
  - **Originality:** whether the photo crowd is original art is not shown in the packet. Flagging it for the Arbiter, because the brief requires original art.
- **Fix:** pick one style.
  - **Option A (cheaper):** posterize and cel-shade the crowd sprites (quantize to 4-5 tones, add a dark outline), so they sit in the players' toon world.
  - **Option B:** lift the players to the crowd's level of definition. Add a face decal with a nose, mouth and brows, 3-segment hands, tapered limbs and 6-8 hair meshes.
  - **Either way:** keep the close and replay cameras off faces until it's done. In c21 the camera is at face height on a model that can't take it.

### 3. Black voids and ungrounded geometry around the court
- **Evidence:**
  - Probe `nearBlackPct` is 20-27% on every desktop gym frame, 36.8% on c09, and 43% on c18.
  - **Stanchions:** the bases are flat black slabs. c02 at x 10-170, y 355-475; c06 at x 1030-1190, y 345-470; c12 at x 600-680, y 195-290; c18 at x 860-1280, y 290-800.
  - **Replay:** in c08 and c17 the right 55% of the frame (x 540-1280, y 56-580) is an untextured dark wall with no crowd, no banner and no light.
  - **Arena:** in c09 the near apron (y 620-800) is a black band.
  - **Hot Streak:** in c12 the baseline crowd stands on a black floor in front of a black band (x 210-1060, y 90-250), with no bleacher.
  - **Net cam:** in c18 the fans float on the dark baseline with their feet at y 450-610 and no riser under them.
- **Fix:**
  - **Stanchion bases:** pad them in team color with a light top bevel.
  - **Replay wall:** give the replay camera's back wall the same crowd and banner treatment as the far side, or cap the replay camera's yaw so it never faces the bare wall.
  - **Baseline crowd:** put it on a 3-step bleacher mesh, with a light pool on it.
  - **Arena apron:** fill it with a lit courtside row.
  - **Test:** no near-black region larger than 3% of any gameplay frame.

### 4. Ball lost over the crowd at its apex
- **Evidence:**
  - c04 zoom: the ball is at about (530, 150) on a row of faces with orange shirts. Probe `ballContrast` is 1.10 (c04) and 1.16 (c05).
  - Mobile is worse: 1.02 (c05) and 1.01 (c06).
  - The new trail (jumper f12-f17, drive f09-f15) is an orange blob over orange and gold shirts, so it doesn't help.
- **Fix:**
  - **Crowd dim:** a ~120 px screen-space dim of the crowd layer behind the airborne ball, to 60%.
  - **Trail color:** a white-core trail instead of orange.
  - **Ball outline:** a 1.5 px dark outline on the ball while it's airborne.
  - **Target:** `ballContrast` at 2.0 or more at the apex.

### 5. Ghost discs above the rim on the make
- **Evidence:**
  - c18: four or five translucent white circles overlap the rim and backboard (x 480-800, y 115-210).
  - Mobile c18: the same at x 160-620, y 300-460.
  - Net-close burst: present f00-f09.
  - They read as a render fault (stale trail copies or a flash sprite with no additive tint), not as a make effect.
- **Fix:** either remove them, or make them a single additive ring flash on the rim that lasts ≤ 120 ms. Keep the trail's last positions out of the frame once the ball is below the rim.

### 6. The mobile near-basket fade reads as a glitch box over the paint
- **Evidence:** mobile c02 zoom. A translucent gray rectangle (x 330-550, y 935-1075) shows a faint red rim circle through it. It cuts a defender's arm at its edge and washes out the four players in the clump.
- **Conflict:** the prior verdict listed "the stanchion dither fade" under *Keep*. In this frame it hurts readability exactly where play is.
- **Fix:** fade the near backboard and rim to 0 alpha, not 30-40%, whenever their screen box overlaps a player box. Or drop the near hoop below the frame by tilting the portrait rig.

### 7. Empty benches, and spectators sitting in team chairs
- **Evidence:**
  - c02: an empty black chair row at x 600-890, y 210-255.
  - c04 zoom: green chairs with spectators' jeans and sneakers visible under the seats.
  - c11 zoom: red chairs with the same overlap at x 165-400, y 205-255.
  - c15: six empty black chairs at x 20-650, y 280-520, with fans in the riser behind them.
  - No uniformed bench players or coach appear in any frame.
- **Fix:** 5 instanced bench players plus a coach per team, in warm-up colors. Push the front crowd row back one riser so it doesn't share the bench's screen space.

### 8. Desktop place identity is thinner than portrait's
- **Evidence:**
  - **Banners:** portrait shows title banners (mobile c06: 1932/1996/1998; mobile c12: 1990-2018). No desktop gameplay still (c02-c07, c09-c11, c16, c19) shows a single banner. The only desktop banner is on the replay wall (c08: COBRAS).
  - **Arena:** c09 has no ribbon board and a cropped "HOT SP" apron. The arena crowd is the gym crowd recolored.
  - **Camera clones:** c02 and c10 use the identical camera and formation (probe `handlerX` 0.659 in both). Only the paint color and crowd shirts change.
  - **Palette:** Jessieville's crowd reads navy and gold, not purple and gold (c10, y 90-240).
- **Fix:**
  - **Banners:** hang them above the top visible bleacher row on the desktop far wall, below the HUD.
  - **Arena:** an emissive ribbon on the c09 fascia (y ~185-215), and frame the apron wordmark fully.
  - **Palette:** map the Jessieville crowd to purple.

### 9. Repeated crowd sprites
- **Evidence:** c11 zoom shows the same blonde, hands-clasped sprite at several seats within about 6 seats of each other (crop around x 650/770/1065 → full-size x ~325, ~385, ~530, y ~100-200). I could not confirm the identical sprite at desktop full size with certainty, so this one is lower confidence.
- **Fix:** a seeded no-repeat-within-3-seats shuffle, plus a per-instance hue and value jitter of ±6%.

### 10. Foreground clipping in the face close camera
- **Evidence:** c21: an out-of-focus brown arm fills x 0-330, y 370-620, cut by the near plane.
- **Fix:** push the near plane out or hide limbs that are within 0.4 m of the camera.

---

## 3. Regressions and status against `final-review.md`

The build is reported unchanged, so every difference below is a capture difference. I separate "not reproduced" from "fixed".

| Prior item | Status this round | Evidence |
|---|---|---|
| Gap 1: no light hierarchy; floor ghosts | **Partly.** The house now probes ~3.2-3.5x dimmer than the floor (biased, see the probe caveat), but the ghosts are still there. | c16, c09, mobile c02/c06 wisps; probe `floorCrowd` |
| Gap 2: ball lost in flight; payoff all HUD | **Partly.** There is now a trail and a visible ball through the net, but `ballContrast` is still 1.0-1.16 at the apex. | jumper f12-f17; net-close f04-f11; c04/c05 probe |
| Gap 3: desktop empty foreground | **Open.** | probe `emptyFgPct` c03 44.5, c07 51.4, c11 45.2; drive burst mean 42.2 |
| Gap 4: menus are web cards | **Open.** | c01, c13 (Quarters row cut), c20, c22 |
| Gap 5: enclosure half built | **Open.** Empty benches, black stanchions, the arena apron, and a new void found on the replay wall. | c15, c02, c09, c08/c17 |
| Gap 6: portrait rig framing | **Open.** | mobile `playerPx` 47-58; whole court in mobile c02/c10/c11 |
| Gap 7: mannequins and merging | **Open, and worse exposed.** | c21, c15; c02 zoom: two white jerseys merged at x 370-420, y 310-450 |
| Gap 8: Hot Streak staging | **Open.** Crowd on a black floor, black band, no ball racks. | c12 |
| Gap 9: desktop place identity | **Open.** | No desktop gameplay banners; c09 |
| Regression: stale slam on an airball | **Not reproduced.** The c07 airball shows only the "AIRBALL" tag on both viewports. | c07 desktop and mobile |
| Regression: slam occludes the rim on portrait | **Partly.** The slam now sits right of and below the rim, but the "+3" plate now covers the rim. | mobile c06 x 340-470, y 435-505 |
| Regression: desktop "+3" over the glass | **Open.** | c06 x 820-880, y 130-180 |
| Keep: stanchion dither fade | **Contested** (see defect 6). | mobile c02 |

**New defects not cited in the prior verdict:**
- the ghost discs at the rim (c18)
- the replay-wall void (c08, c17)
- the photo-crowd vs mannequin style clash, now visible in the close cameras (c15, c18, c21)
- the near-plane arm clipping (c21)
- spectators in team chairs (c04, c11)

None of these can be called a build regression without a before frame. They are new *evidence*.

---

## 4. Bottom line for the Arbiter

The far gameplay camera still looks like a tidy, readable 6. Every camera that gets closer (c08, c15, c17, c18, c21) drops the game toward 5. It shows mitten-handed mannequins in front of a photographic crowd that is rendered better than they are, standing on black floors next to black slabs. The three cheapest moves for this lens:
1. **Kill the reflection ghosts and the rim discs.**
2. **Unify the crowd and player styles.** Toon the crowd, or face the players.
3. **Fill the voids.** Stanchion pads, the replay wall, bleachers under the floating crowd, the arena apron.
