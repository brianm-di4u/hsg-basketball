# Visual review rubric (v3 campaign)

Every round scores the same 8 categories from 1 to 10, against shipped games: the files in `benchmarks/`
(described in `benchmarks/SOURCES.md`). These are the same categories as the v2 reviews (`review/history/`),
so the scores compare: v2 ended at **6.1**.
- **The scale:** NBA 2K25-27 sets 10 for realism.
- **The realistic target:** the stylized benchmarks, NBA 2K Playgrounds 2 (about 9) and Hoop Land (about 8).

Overall = the unweighted mean of the 8, to one decimal.

**Rules:**
- **Scope:** score only what the packet shows. Name the shot (`c06-make`, `bursts/desktop-jumper.png` f07) and
  where in the frame (pixel coordinates or a quadrant) for every claim.
- **Probe numbers:** use them where they settle a claim (`probe/probe.json`).
- **Animation and game feel:** judge from bursts and video first, stills second.
- **Mobile:** judge it as a portrait phone game; no portrait benchmark exists, so ~8 is the reference.

## Anchors

| Category | 5 | 7 | 9 |
|---|---|---|---|
| **Art: players, court, venue** | Clean but generic: mannequin players, a tidy floor, a venue that reads as a set | Players with faces and hands that read at gameplay size; a venue with depth on all sides (benches, near side, ends) | Playgrounds 2 / Hoop Land level of authored character: distinct, appealing players and a place you could name |
| **Lighting & materials** | Even, flat exposure; crowd as bright as the floor; no gloss that reads as light | A clear hierarchy (court brightest, house dimmer), believable floor sheen, soft contact shadows, no artifacts | 2K-like key/rim light on players, pools of light, bloom on lamps and boards, materials that differ (wood, glass, cloth, skin) |
| **Animation & game feel** | Stiff, few poses; a make and a miss feel the same | Readable athletic motion (gather, release, landing), real net/rim reaction, a crowd that answers a make | Playgrounds 2 arcade punch: anticipation and follow-through, weighty contact, a payoff you feel on every make |
| **UI / HUD** | Generic web controls; overlays fight the play | A consistent broadcast style; callouts placed so they never hide the rim or the ball | 2K25 / Hoop Land menus and bug: designed, legible, branded, with motion |
| **Typography** | System faces, cramped labels, sizes under 12 px | A display face plus a text face used with a scale; nothing under 12 px | Hoop Land level: type is part of the identity, crisp at every size |
| **Readability** | You, the ball and teams get lost in clumps or crowd | Ball, you and both teams read at a glance in every gameplay frame | Hoop Land: never a doubt where the ball is or who you control |
| **Mobile portrait** | Works but wastes space; players tiny; the basket hides | Players large enough to read, the basket always in view, nothing important under thumbs | A phone-first presentation that would ship on a store front page |
| **Authenticity of setting** | Text says Arkansas high-school gym; visuals do not | It looks like a specific Arkansas gym or the state-finals arena: banners, benches, students, scorer's table | 2K26-level sense of place, scaled to a high-school gym |
