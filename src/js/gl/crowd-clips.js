// Keyed clips for the 3D crowd, benches and coaches (src/js/gl/crowd3d.js bakes them into a bone texture).
// Same pose space as the players' keyed clips (art-src/anim/keyed.mjs): per bone, Euler turns [x, y, z] (YXZ) in
// the character's own frame on top of the rest A-pose; x about its left (negative swings a thigh or arm forward,
// positive bends a shin back or leans the spine forward), y about up, z about forward (positive lifts the left
// arm out, negative the right). Keys: [time s, pose, hips height change in model metres].
// A seated body's hips stay over the instance origin and its feet swing forward, so a fan's origin is the seat
// (x, z) at the height of the floor the feet rest on.

const SIT = { thigh_L: [-1.5, 0.06, 0.08], thigh_R: [-1.5, -0.06, -0.08], shin_L: [1.45, 0, 0], shin_R: [1.45, 0, 0], foot_L: [0.05, 0, 0], foot_R: [0.05, 0, 0],
  spine: [0.14, 0, 0], chest: [0.06, 0, 0], neck: [-0.1, 0, 0], upperarm_L: [-0.55, 0.2, -0.3], upperarm_R: [-0.55, -0.2, 0.3], forearm_L: [-0.95, 0, 0.2], forearm_R: [-0.95, 0, -0.2] };
const SIT_DY = -0.55;
const ARMS = { upperarm_L: [-0.06, 0.1, -0.26], upperarm_R: [-0.06, -0.1, 0.26], forearm_L: [-0.28, 0, 0], forearm_R: [-0.28, 0, 0] };
const STAND = { thigh_L: [-0.05, 0, 0.04], thigh_R: [-0.05, 0, -0.04], shin_L: [0.1, 0, 0], shin_R: [0.1, 0, 0], ...ARMS };
const with_ = (...p) => Object.assign({}, ...p);

export const CROWD_CLIPS = [
  // 0 sit: seated, hands on the thighs, the head following the play, breathing
  { name: 'sit', loop: true, dur: 3.2, keys: [
    [0, with_(SIT, { head: [0, 0.18, 0] }), SIT_DY], [1.6, with_(SIT, { head: [0.05, -0.2, 0], chest: [0.03, 0, 0] }), SIT_DY - 0.005], [3.2, with_(SIT, { head: [0, 0.18, 0] }), SIT_DY]] },
  // 1 sitclap: seated, clapping in front of the chest
  { name: 'sitclap', loop: true, dur: 0.46, keys: [
    [0, with_(SIT, { upperarm_L: [-1.0, 0.2, -0.2], upperarm_R: [-1.0, -0.2, 0.2], forearm_L: [-1.25, 0.5, 0], forearm_R: [-1.25, -0.5, 0] }), SIT_DY],
    [0.23, with_(SIT, { upperarm_L: [-1.0, 0.45, -0.45], upperarm_R: [-1.0, -0.45, 0.45], forearm_L: [-1.25, 0.75, 0], forearm_R: [-1.25, -0.75, 0] }), SIT_DY],
    [0.46, with_(SIT, { upperarm_L: [-1.0, 0.2, -0.2], upperarm_R: [-1.0, -0.2, 0.2], forearm_L: [-1.25, 0.5, 0], forearm_R: [-1.25, -0.5, 0] }), SIT_DY]] },
  // 2 standup (one-shot)
  { name: 'standup', dur: 0.5, keys: [[0, SIT, SIT_DY], [0.22, with_(SIT, { spine: [0.55, 0, 0], thigh_L: [-1.1, 0, 0.06], thigh_R: [-1.1, 0, -0.06], shin_L: [1.2, 0, 0], shin_R: [1.2, 0, 0] }), -0.42], [0.5, STAND, 0]] },
  // 3 cheer: standing, both arms up and waving, a bounce
  { name: 'cheer', loop: true, dur: 0.7, keys: [
    [0, with_(STAND, { upperarm_L: [-2.7, 0, 0.45], upperarm_R: [-2.7, 0, -0.45], forearm_L: [-0.3, 0, 0.2], forearm_R: [-0.3, 0, -0.2], neck: [-0.2, 0, 0], head: [-0.15, 0, 0] }), -0.02],
    [0.35, with_(STAND, { upperarm_L: [-2.95, 0, 0.25], upperarm_R: [-2.95, 0, -0.25], forearm_L: [-0.1, 0, -0.15], forearm_R: [-0.1, 0, 0.15], neck: [-0.25, 0, 0], head: [-0.2, 0, 0], shin_L: [0.0, 0, 0], shin_R: [0.0, 0, 0] }), 0.06],
    [0.7, with_(STAND, { upperarm_L: [-2.7, 0, 0.45], upperarm_R: [-2.7, 0, -0.45], forearm_L: [-0.3, 0, 0.2], forearm_R: [-0.3, 0, -0.2], neck: [-0.2, 0, 0], head: [-0.15, 0, 0] }), -0.02]] },
  // 4 sitdown (one-shot)
  { name: 'sitdown', dur: 0.5, keys: [[0, STAND, 0], [0.28, with_(SIT, { spine: [0.5, 0, 0], thigh_L: [-1.1, 0, 0.06], thigh_R: [-1.1, 0, -0.06], shin_L: [1.2, 0, 0], shin_R: [1.2, 0, 0] }), -0.42], [0.5, SIT, SIT_DY]] },
  // 5 groan: seated, hands on the head, slumped
  { name: 'groan', loop: true, dur: 1.4, keys: [
    [0, with_(SIT, { upperarm_L: [-2.35, 0, 0.75], upperarm_R: [-2.35, 0, -0.75], forearm_L: [-2.0, 0, 0], forearm_R: [-2.0, 0, 0], spine: [0.3, 0, 0], neck: [0.15, 0, 0], head: [0.1, 0, 0] }), SIT_DY - 0.02],
    [0.7, with_(SIT, { upperarm_L: [-2.3, 0, 0.7], upperarm_R: [-2.3, 0, -0.7], forearm_L: [-2.1, 0, 0], forearm_R: [-2.1, 0, 0], spine: [0.36, 0, 0], neck: [0.2, 0.1, 0], head: [0.15, 0.1, 0] }), SIT_DY - 0.03],
    [1.4, with_(SIT, { upperarm_L: [-2.35, 0, 0.75], upperarm_R: [-2.35, 0, -0.75], forearm_L: [-2.0, 0, 0], forearm_R: [-2.0, 0, 0], spine: [0.3, 0, 0], neck: [0.15, 0, 0], head: [0.1, 0, 0] }), SIT_DY - 0.02]] },
  // 6 stand: standing idle, weight from foot to foot
  { name: 'stand', loop: true, dur: 2.6, keys: [
    [0, with_(STAND, { hips: [0, 0.04, 0.03], head: [0, 0.15, 0] }), -0.01], [1.3, with_(STAND, { hips: [0, -0.04, -0.03], head: [0, -0.15, 0], upperarm_L: [-0.1, 0.1, -0.2] }), -0.015], [2.6, with_(STAND, { hips: [0, 0.04, 0.03], head: [0, 0.15, 0] }), -0.01]] },
  // 7 standclap
  { name: 'standclap', loop: true, dur: 0.46, keys: [
    [0, with_(STAND, { upperarm_L: [-1.1, 0.2, -0.2], upperarm_R: [-1.1, -0.2, 0.2], forearm_L: [-1.2, 0.5, 0], forearm_R: [-1.2, -0.5, 0] }), 0],
    [0.23, with_(STAND, { upperarm_L: [-1.1, 0.45, -0.45], upperarm_R: [-1.1, -0.45, 0.45], forearm_L: [-1.2, 0.75, 0], forearm_R: [-1.2, -0.75, 0] }), -0.01],
    [0.46, with_(STAND, { upperarm_L: [-1.1, 0.2, -0.2], upperarm_R: [-1.1, -0.2, 0.2], forearm_L: [-1.2, 0.5, 0], forearm_R: [-1.2, -0.5, 0] }), 0]] },
  // 8 pom: a cheerleader's alternating high-low arms
  { name: 'pom', loop: true, dur: 0.8, keys: [
    [0, with_(STAND, { upperarm_L: [-2.6, 0, 0.6], upperarm_R: [-0.6, 0, -0.9], forearm_L: [-0.1, 0, 0], forearm_R: [-0.1, 0, 0] }), 0],
    [0.4, with_(STAND, { upperarm_L: [-0.6, 0, 0.9], upperarm_R: [-2.6, 0, -0.6], forearm_L: [-0.1, 0, 0], forearm_R: [-0.1, 0, 0], thigh_L: [-0.4, 0, 0.05], shin_L: [0.7, 0, 0] }), -0.02],
    [0.8, with_(STAND, { upperarm_L: [-2.6, 0, 0.6], upperarm_R: [-0.6, 0, -0.9], forearm_L: [-0.1, 0, 0], forearm_R: [-0.1, 0, 0] }), 0]] },
  // 9 coach: standing, arms folded, turning to follow the play
  { name: 'coach', loop: true, dur: 4.0, keys: [
    [0, with_(STAND, { upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0], head: [0, 0.3, 0], chest: [0, 0.1, 0] }), -0.01],
    [2.0, with_(STAND, { upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0], head: [0, -0.3, 0], chest: [0, -0.1, 0] }), -0.015],
    [4.0, with_(STAND, { upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0], head: [0, 0.3, 0], chest: [0, 0.1, 0] }), -0.01]] },
  // 10 sitlean: seated, leaning in, elbows on the knees, hands together
  { name: 'sitlean', loop: true, dur: 3.6, keys: [
    [0, with_(SIT, { spine: [0.5, 0, 0], chest: [0.15, 0, 0], neck: [-0.45, 0, 0], head: [-0.1, 0.1, 0], upperarm_L: [-0.9, 0.35, -0.2], upperarm_R: [-0.9, -0.35, 0.2], forearm_L: [-1.5, 0.7, 0], forearm_R: [-1.5, -0.7, 0] }), SIT_DY],
    [1.8, with_(SIT, { spine: [0.54, 0, 0], chest: [0.15, 0, 0], neck: [-0.5, 0, 0], head: [-0.1, -0.15, 0], upperarm_L: [-0.9, 0.35, -0.2], upperarm_R: [-0.9, -0.35, 0.2], forearm_L: [-1.5, 0.7, 0], forearm_R: [-1.5, -0.7, 0] }), SIT_DY],
    [3.6, with_(SIT, { spine: [0.5, 0, 0], chest: [0.15, 0, 0], neck: [-0.45, 0, 0], head: [-0.1, 0.1, 0], upperarm_L: [-0.9, 0.35, -0.2], upperarm_R: [-0.9, -0.35, 0.2], forearm_L: [-1.5, 0.7, 0], forearm_R: [-1.5, -0.7, 0] }), SIT_DY]] },
  // 11 sitback: seated back, arms folded
  { name: 'sitback', loop: true, dur: 4.2, keys: [
    [0, with_(SIT, { spine: [-0.08, 0, 0], chest: [-0.05, 0, 0], neck: [0.05, 0, 0], head: [0, 0.2, 0], upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0] }), SIT_DY + 0.01],
    [2.1, with_(SIT, { spine: [-0.08, 0, 0], chest: [-0.03, 0, 0], neck: [0.05, 0, 0], head: [0, -0.25, 0], upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0] }), SIT_DY + 0.01],
    [4.2, with_(SIT, { spine: [-0.08, 0, 0], chest: [-0.05, 0, 0], neck: [0.05, 0, 0], head: [0, 0.2, 0], upperarm_L: [-0.75, 0.3, -0.45], upperarm_R: [-0.75, -0.3, 0.45], forearm_L: [-1.75, -0.9, 0], forearm_R: [-1.75, 0.9, 0] }), SIT_DY + 0.01]] },
  // 12 sittalk: seated, turned to the neighbour, one hand talking
  { name: 'sittalk', loop: true, dur: 2.0, keys: [
    [0, with_(SIT, { chest: [0.05, 0.35, 0], neck: [0, 0.3, 0], head: [0, 0.35, 0], upperarm_R: [-0.9, -0.1, 0.2], forearm_R: [-1.3, -0.4, 0] }), SIT_DY],
    [1.0, with_(SIT, { chest: [0.05, 0.38, 0], neck: [0, 0.3, 0], head: [-0.05, 0.4, 0], upperarm_R: [-1.1, -0.2, 0.25], forearm_R: [-1.1, -0.5, 0] }), SIT_DY],
    [2.0, with_(SIT, { chest: [0.05, 0.35, 0], neck: [0, 0.3, 0], head: [0, 0.35, 0], upperarm_R: [-0.9, -0.1, 0.2], forearm_R: [-1.3, -0.4, 0] }), SIT_DY]] },
];
export const CROWD_FPS = 30;
