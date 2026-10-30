# Credits

Spa City Hoops is MIT-licensed (`LICENSE`). Everything below is third-party work it uses, with its license.
Real Garland County, Arkansas schools appear as setting only; the game is not affiliated with or endorsed by any
school or the Arkansas Activities Association. All players are fictional.

## Code (shipped in `vendor/`, licenses in `vendor/LICENSES/`)
| Library | Version | License | Use |
|---|---|---|---|
| three.js | r186 | MIT | 3D rendering |
| postprocessing (pmndrs) | 6.39.5 | Zlib | bloom, tone mapping, depth of field, the effect passes |
| N8AO | 2.0.1 | ISC | vendored with the post bundle |
| Basis Universal transcoder (via three.js) | — | Apache-2.0 | texture decoding (`vendor/basis/`) |

## Fonts (inlined in `index.html`)
| Font | Source | License |
|---|---|---|
| Bebas Neue | npm `@fontsource/bebas-neue` 5.2.5 | SIL Open Font License 1.1 (`vendor/bebas-neue-5.2.5/LICENSE`) |
| Barlow Condensed (500, 700) | npm `@fontsource/barlow-condensed` 5.3.0 | SIL Open Font License 1.1 (`vendor/barlow-condensed-5.3.0/LICENSE`) |

## Art and animation (streamed from `assets/hq/`)
| Asset | Source | License |
|---|---|---|
| Player and fan bodies | MakeHuman system assets through MPFB 2.0.18 (Blender extension), built by `art-src/blender/players/build_bodies_hq.py` and `art-src/blender/crowd/build_fans.py` | CC0 output (MPFB itself is GPL; no MPFB code ships) |
| Motion capture (run, jog, slide, dribble, crossover, jump shot, jump) | CMU Graphics Lab Motion Capture Database, BVH conversion by Bruce Hahne (2010) | Free for any use. "The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217." Takes listed in `art-src/anim/SOURCES.md` |
| Keyed clips, crowd clips | Original (`art-src/anim/keyed.mjs`, `src/js/gl/crowd-clips.js`) | MIT, with the game |
| Gym and arena shells, baked lighting | Original (`art-src/blender/venue/`, Blender 5.2 / Cycles) | MIT, with the game |
| Crests, crowd atlas (2D fallback), textures | Original | MIT, with the game |

## Tools (not shipped)
Blender 5.2 (GPL), esbuild (MIT), Playwright (Apache-2.0), gltf-transform (MIT), KTX-Software (Apache-2.0).
