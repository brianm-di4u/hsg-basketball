# Animation sources

## CMU Graphics Lab Motion Capture Database
"The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from
NSF EIA-0196217." CMU places no restrictions on the use of the data; the BVH conversion is Bruce Hahne's 2010
release (cgspeed), which adds no restrictions. Fetched from the GitHub mirror
https://github.com/sfd158/cmu-mocap (`data/0SS/SS_TT.bvh`) into `art-src/anim/cmu/` (git-ignored).

| Clip (game) | Take | Description (CMU index) | Frames used (120 fps) |
|---|---|---|---|
| jog | 16_35 | run/jog | 52-148 (one stride cycle) |
| run | 09_01 | run | 40-124 (one stride cycle) |
| slide | 06_08 | basketball - sideways dribble (legs only) | 109-193 |
| dribble | 06_12 | basketball - forward dribble, crossover (upper body) | 811-895 |
| crossover | 06_12 | basketball - crossover dribble (upper body) | 160-268 |
| jumper | 06_15 | basketball - dribble, shoot (legs, trunk, timing; arms keyed) | 253-421 |
| jump (block) | 16_01 | jump (legs, trunk; arms keyed) | 61-229 |
| stance | 06_15 | basketball - standing with the ball | 13-109 |

Also fetched for later milestones (not used yet): 06_02, 06_03, 06_06, 06_09, 06_13, 06_14, 09_02, 16_45,
16_55, 13_10, 26_02, 27_02 (basketball signals), 02_03, 15_12.

Retargeting: `art-src/blender/anim/retarget_cmu.py` (clip ranges in `cmu_clips.json`).

## Keyed clips
`art-src/anim/keyed.mjs`: idle, defensive stance, layup, one- and two-hand dunks, chest pass, steal, block arms,
jump-shot arms, three celebrations. Original work.
