// Hand-keyed basketball clips, in the pose space of src/js/gl/players3d.js (poseFor): per bone, Euler turns
// [x, y, z] (order YXZ) in the character's own frame on top of the rest A-pose:
//   x: about its left axis (negative raises an arm forward / swings a thigh forward; positive bends a shin back,
//      leans the spine forward), y: about up (positive turns to its left), z: about forward (positive lifts the
//      left arm out to the side; the right arm lifts with negative z).
// Each key: [time s, { bone: [x, y, z] }, hips height change (model metres, negative crouches), foot contacts
// (bit 0 left, bit 1 right; default both)]. Between keys the turns ease (smoothstep) and slerp.
// `from` builds on a retargeted CMU clip: its keys replace only the bones they name.
// tools/build-anims.mjs bakes these at 30 fps beside the CMU clips.

const STANCE = { thigh_L: [-0.2, 0, 0.06], thigh_R: [-0.2, 0, -0.06], shin_L: [0.36, 0, 0], shin_R: [0.36, 0, 0], foot_L: [-0.12, 0, -0.04], foot_R: [-0.12, 0, 0.04], spine: [0.1, 0, 0] };
const ARMS_DOWN = { upperarm_L: [-0.08, 0.15, 0.12], upperarm_R: [-0.08, -0.15, -0.12], forearm_L: [-0.3, 0, 0], forearm_R: [-0.3, 0, 0] };
const P = (...parts) => Object.assign({}, ...parts.map((p) => JSON.parse(JSON.stringify(p))));

export const KEYED = {
  // relaxed athletic stance: weight shifts side to side, breathing in the chest
  idle: {
    loop: true, dur: 2.4,
    keys: [
      [0, P(STANCE, ARMS_DOWN, { hips: [0, 0.03, 0.02], chest: [0.02, 0, 0] }), -0.035],
      [1.2, P(STANCE, ARMS_DOWN, { hips: [0, -0.03, -0.02], chest: [-0.02, 0, 0], upperarm_L: [-0.18, 0, 0.13], upperarm_R: [-0.18, 0, -0.13] }), -0.03],
      [2.4, P(STANCE, ARMS_DOWN, { hips: [0, 0.03, 0.02], chest: [0.02, 0, 0] }), -0.035],
    ],
  },
  // a defender set low and wide, bouncing lightly on the balls of the feet
  dstance: {
    loop: true, dur: 0.8,
    keys: [
      [0, { thigh_L: [-0.5, 0.08, 0.3], thigh_R: [-0.5, -0.08, -0.3], shin_L: [0.9, 0, 0], shin_R: [0.9, 0, 0], foot_L: [-0.38, 0, -0.26], foot_R: [-0.38, 0, 0.26], spine: [0.38, 0, 0], chest: [0.1, 0, 0], neck: [-0.3, 0, 0], head: [-0.12, 0, 0] }, -0.13],
      [0.4, { thigh_L: [-0.56, 0.08, 0.3], thigh_R: [-0.56, -0.08, -0.3], shin_L: [1.0, 0, 0], shin_R: [1.0, 0, 0], foot_L: [-0.42, 0, -0.26], foot_R: [-0.42, 0, 0.26], spine: [0.4, 0, 0], chest: [0.1, 0, 0], neck: [-0.32, 0, 0], head: [-0.12, 0, 0] }, -0.155],
      [0.8, { thigh_L: [-0.5, 0.08, 0.3], thigh_R: [-0.5, -0.08, -0.3], shin_L: [0.9, 0, 0], shin_R: [0.9, 0, 0], foot_L: [-0.38, 0, -0.26], foot_R: [-0.38, 0, 0.26], spine: [0.38, 0, 0], chest: [0.1, 0, 0], neck: [-0.3, 0, 0], head: [-0.12, 0, 0] }, -0.13],
    ],
  },
  // right-hand layup off the left foot: gather, the right knee drives, the arm reaches and the wrist rolls it up
  layup: {
    dur: 1.1, marks: { start: 0.12, release: 0.55 },
    keys: [
      [0, P(STANCE, { upperarm_R: [-1.0, 0, -0.1], forearm_R: [-1.7, 0, 0.4], upperarm_L: [-1.0, 0, 0.1], forearm_L: [-1.7, 0, -0.4], spine: [0.3, 0, 0], thigh_L: [-0.7, 0, 0], shin_L: [0.9, 0, 0] }), -0.14, 1],
      [0.2, { thigh_L: [-0.1, 0, 0], shin_L: [0.25, 0, 0], foot_L: [0.45, 0, 0], thigh_R: [-1.25, 0, -0.05], shin_R: [1.55, 0, 0], foot_R: [0.3, 0, 0], upperarm_R: [-1.9, 0, -0.1], forearm_R: [-1.4, 0, 0.3], upperarm_L: [-1.5, 0, 0.2], forearm_L: [-1.3, 0, -0.3], spine: [0.05, 0, 0], neck: [-0.2, 0, 0], head: [-0.2, 0, 0] }, 0, 0],
      [0.55, { thigh_L: [0.0, 0, 0], shin_L: [0.3, 0, 0], foot_L: [0.5, 0, 0], thigh_R: [-1.45, 0, -0.05], shin_R: [1.7, 0, 0], foot_R: [0.35, 0, 0], upperarm_R: [-2.95, 0, -0.15], forearm_R: [-0.15, 0, 0], hand_R: [0.7, 0, 0], upperarm_L: [-1.25, 0, 0.45], forearm_L: [-0.9, 0, 0], spine: [-0.12, 0, 0], neck: [-0.3, 0, 0], head: [-0.3, 0, 0] }, 0, 0],
      [0.8, { thigh_L: [-0.45, 0, 0.05], shin_L: [0.6, 0, 0], thigh_R: [-0.6, 0, -0.05], shin_R: [0.8, 0, 0], upperarm_R: [-1.6, 0, -0.2], forearm_R: [-0.5, 0, 0], upperarm_L: [-0.8, 0, 0.35], forearm_L: [-0.8, 0, 0], spine: [0.1, 0, 0], neck: [-0.15, 0, 0] }, 0, 0],
      [1.1, P(STANCE, ARMS_DOWN, { thigh_L: [-0.55, 0, 0.06], thigh_R: [-0.55, 0, -0.06], shin_L: [0.95, 0, 0], shin_R: [0.95, 0, 0], foot_L: [-0.35, 0, 0], foot_R: [-0.35, 0, 0], spine: [0.35, 0, 0] }), -0.15],
    ],
  },
  // one-hand dunk: a two-foot gather, the ball cocked behind the head, thrown down through the rim, a hang
  dunk1: {
    dur: 1.25, marks: { start: 0.1, release: 0.62 },
    keys: [
      [0, P({ thigh_L: [-0.75, 0, 0.08], thigh_R: [-0.75, 0, -0.08], shin_L: [1.3, 0, 0], shin_R: [1.3, 0, 0], foot_L: [-0.5, 0, 0], foot_R: [-0.5, 0, 0], spine: [0.45, 0, 0], upperarm_R: [-0.7, 0, -0.1], forearm_R: [-1.8, 0, 0.4], upperarm_L: [-0.7, 0, 0.1], forearm_L: [-1.8, 0, -0.4] }), -0.24],
      [0.25, { thigh_L: [-0.35, 0, 0.05], thigh_R: [-0.15, 0, -0.05], shin_L: [0.55, 0, 0], shin_R: [0.35, 0, 0], foot_L: [0.5, 0, 0], foot_R: [0.55, 0, 0], spine: [-0.1, 0, 0], upperarm_R: [-2.6, 0, -0.2], forearm_R: [-1.0, 0, 0], upperarm_L: [-2.2, 0, 0.3], forearm_L: [-0.6, 0, 0], neck: [-0.25, 0, 0], head: [-0.2, 0, 0] }, 0, 0],
      [0.5, { thigh_L: [-0.55, 0, 0.1], thigh_R: [-0.85, 0, -0.1], shin_L: [1.0, 0, 0], shin_R: [1.3, 0, 0], foot_L: [0.45, 0, 0], foot_R: [0.4, 0, 0], spine: [-0.22, 0, 0], upperarm_R: [-3.05, 0, -0.15], forearm_R: [-1.55, 0, 0], hand_R: [-0.5, 0, 0], upperarm_L: [-1.9, 0, 0.55], forearm_L: [-0.4, 0, 0], neck: [-0.35, 0, 0], head: [-0.25, 0, 0] }, 0, 0],
      [0.66, { thigh_L: [-0.7, 0, 0.1], thigh_R: [-0.95, 0, -0.1], shin_L: [1.2, 0, 0], shin_R: [1.4, 0, 0], foot_L: [0.4, 0, 0], foot_R: [0.4, 0, 0], spine: [0.2, 0, 0], upperarm_R: [-2.55, 0, -0.1], forearm_R: [-0.15, 0, 0], hand_R: [0.9, 0, 0], upperarm_L: [-1.3, 0, 0.6], forearm_L: [-0.5, 0, 0], neck: [-0.1, 0, 0] }, 0, 0],
      [0.9, { thigh_L: [-0.3, 0, 0.08], thigh_R: [-0.35, 0, -0.08], shin_L: [0.5, 0, 0], shin_R: [0.6, 0, 0], foot_L: [0.3, 0, 0], foot_R: [0.3, 0, 0], spine: [0.0, 0, 0], upperarm_R: [-2.9, 0, -0.15], forearm_R: [-0.3, 0, 0], upperarm_L: [-1.0, 0, 0.5], forearm_L: [-0.6, 0, 0] }, 0, 0],
      [1.25, P(STANCE, ARMS_DOWN, { thigh_L: [-0.7, 0, 0.08], thigh_R: [-0.7, 0, -0.08], shin_L: [1.15, 0, 0], shin_R: [1.15, 0, 0], foot_L: [-0.42, 0, 0], foot_R: [-0.42, 0, 0], spine: [0.42, 0, 0], upperarm_L: [-0.6, 0, 0.35], upperarm_R: [-0.6, 0, -0.35] }), -0.2],
    ],
  },
  // two-hand dunk: both hands take it back over the head and hammer it down
  dunk2: {
    dur: 1.25, marks: { start: 0.1, release: 0.62 },
    keys: [
      [0, P({ thigh_L: [-0.8, 0, 0.08], thigh_R: [-0.8, 0, -0.08], shin_L: [1.35, 0, 0], shin_R: [1.35, 0, 0], foot_L: [-0.52, 0, 0], foot_R: [-0.52, 0, 0], spine: [0.5, 0, 0], upperarm_R: [-0.8, 0, 0.05], forearm_R: [-1.7, 0, 0.5], upperarm_L: [-0.8, 0, -0.05], forearm_L: [-1.7, 0, -0.5] }), -0.25],
      [0.25, { thigh_L: [-0.2, 0, 0.05], thigh_R: [-0.2, 0, -0.05], shin_L: [0.4, 0, 0], shin_R: [0.4, 0, 0], foot_L: [0.55, 0, 0], foot_R: [0.55, 0, 0], spine: [-0.1, 0, 0], upperarm_R: [-2.5, 0, 0.05], forearm_R: [-1.2, 0, 0.3], upperarm_L: [-2.5, 0, -0.05], forearm_L: [-1.2, 0, -0.3], neck: [-0.25, 0, 0] }, 0, 0],
      [0.5, { thigh_L: [-0.75, 0, 0.12], thigh_R: [-0.75, 0, -0.12], shin_L: [1.35, 0, 0], shin_R: [1.35, 0, 0], foot_L: [0.4, 0, 0], foot_R: [0.4, 0, 0], spine: [-0.3, 0, 0], upperarm_R: [-3.1, 0, 0.1], forearm_R: [-1.7, 0, 0.3], upperarm_L: [-3.1, 0, -0.1], forearm_L: [-1.7, 0, -0.3], neck: [-0.35, 0, 0], head: [-0.2, 0, 0] }, 0, 0],
      [0.66, { thigh_L: [-0.85, 0, 0.12], thigh_R: [-0.85, 0, -0.12], shin_L: [1.4, 0, 0], shin_R: [1.4, 0, 0], foot_L: [0.4, 0, 0], foot_R: [0.4, 0, 0], spine: [0.3, 0, 0], upperarm_R: [-2.4, 0, 0.05], forearm_R: [-0.2, 0, 0.1], hand_R: [0.8, 0, 0], upperarm_L: [-2.4, 0, -0.05], forearm_L: [-0.2, 0, -0.1], hand_L: [0.8, 0, 0], neck: [-0.05, 0, 0] }, 0, 0],
      [0.9, { thigh_L: [-0.35, 0, 0.08], thigh_R: [-0.35, 0, -0.08], shin_L: [0.6, 0, 0], shin_R: [0.6, 0, 0], foot_L: [0.3, 0, 0], foot_R: [0.3, 0, 0], spine: [0.0, 0, 0], upperarm_R: [-2.95, 0, -0.1], forearm_R: [-0.3, 0, 0], upperarm_L: [-2.95, 0, 0.1], forearm_L: [-0.3, 0, 0] }, 0, 0],
      [1.25, P(STANCE, ARMS_DOWN, { thigh_L: [-0.7, 0, 0.08], thigh_R: [-0.7, 0, -0.08], shin_L: [1.15, 0, 0], shin_R: [1.15, 0, 0], foot_L: [-0.42, 0, 0], foot_R: [-0.42, 0, 0], spine: [0.42, 0, 0], upperarm_L: [-0.6, 0, 0.35], upperarm_R: [-0.6, 0, -0.35] }), -0.2],
    ],
  },
  // chest pass: a step in, both arms punch out from the chest, thumbs turn down on the follow-through
  pass: {
    dur: 0.55, mask: 'upper',
    keys: [
      [0, { upperarm_R: [-0.6, 0, 0.05], forearm_R: [-1.45, 0, 0.55], upperarm_L: [-0.6, 0, -0.05], forearm_L: [-1.45, 0, -0.55], spine: [0.1, 0, 0] }],
      [0.08, { upperarm_R: [-0.45, 0, -0.05], forearm_R: [-1.6, 0, 0.6], upperarm_L: [-0.45, 0, 0.05], forearm_L: [-1.6, 0, -0.6], spine: [0.05, 0, 0] }],
      [0.2, { upperarm_R: [-1.5, 0, 0.12], forearm_R: [-0.15, 0, 0.1], hand_R: [0.6, 0, 0], upperarm_L: [-1.5, 0, -0.12], forearm_L: [-0.15, 0, -0.1], hand_L: [0.6, 0, 0], spine: [0.3, 0, 0], neck: [-0.15, 0, 0] }],
      [0.55, { upperarm_R: [-0.6, 0, -0.1], forearm_R: [-0.6, 0, 0], upperarm_L: [-0.6, 0, 0.1], forearm_L: [-0.6, 0, 0], spine: [0.15, 0, 0] }],
    ],
  },
  // steal: a low lunge and a right-hand swipe across at the ball
  steal: {
    dur: 0.6,
    keys: [
      [0, P(STANCE, { upperarm_R: [-0.9, 0.0, -0.7], forearm_R: [-0.4, 0, 0], upperarm_L: [-0.5, 0, 0.6], forearm_L: [-0.7, 0, 0], spine: [0.35, 0, 0] }), -0.08],
      [0.18, { thigh_R: [-0.95, 0, -0.1], shin_R: [1.1, 0, 0], foot_R: [-0.3, 0, 0], thigh_L: [0.2, 0, 0.08], shin_L: [0.5, 0, 0], foot_L: [0.2, 0, 0], spine: [0.6, 0.25, 0], upperarm_R: [-1.35, 0.7, 0.1], forearm_R: [-0.1, 0, 0], hand_R: [0.3, 0, 0], upperarm_L: [-0.3, 0, 0.7], forearm_L: [-0.6, 0, 0], neck: [-0.4, 0, 0] }, -0.2, 3],
      [0.6, P(STANCE, ARMS_DOWN, { thigh_R: [-0.5, 0, -0.06], shin_R: [0.7, 0, 0], spine: [0.3, 0, 0], upperarm_L: [-0.4, 0, 0.5], upperarm_R: [-0.4, 0, -0.5] }), -0.1],
    ],
  },
  // jump shot: the retargeted CMU take's legs, trunk and timing (06_15) with keyed arms. The performer shot a set
  // shot from the chin, so the arms carry the ball to a set point over the forehead and finish at full extension
  // with the wrist snapped, held through the fall
  jumper: {
    from: 'jumper', marks: { start: 0.45, release: 0.8 },
    keys: [
      [0, { upperarm_R: [-0.7, 0, -0.2], forearm_R: [-1.7, 0, 0.4], hand_R: [-0.6, 0, 0], upperarm_L: [-0.7, 0, 0.2], forearm_L: [-1.7, 0, -0.4] }],
      [0.45, { upperarm_R: [-1.0, 0, -0.25], forearm_R: [-1.6, 0, 0.3], hand_R: [-0.9, 0, 0], upperarm_L: [-0.9, 0, 0.45], forearm_L: [-1.4, 0, 0.35] }],
      [0.62, { upperarm_R: [-2.0, 0, -0.2], forearm_R: [-1.8, 0, 0.1], hand_R: [-0.9, 0, 0], upperarm_L: [-1.8, 0, 0.4], forearm_L: [-1.3, 0, 0.35] }],
      [0.76, { upperarm_R: [-2.75, 0, -0.15], forearm_R: [-1.75, 0, 0], hand_R: [-0.9, 0, 0], upperarm_L: [-2.45, 0, 0.32], forearm_L: [-1.2, 0, 0.35] }],
      [0.86, { upperarm_R: [-2.95, 0, -0.12], forearm_R: [-0.15, 0, 0], hand_R: [1.1, 0, 0], upperarm_L: [-2.3, 0, 0.5], forearm_L: [-0.8, 0, 0.2] }],
      [1.12, { upperarm_R: [-2.85, 0, -0.12], forearm_R: [-0.2, 0, 0], hand_R: [1.2, 0, 0], upperarm_L: [-1.9, 0, 0.55], forearm_L: [-0.7, 0, 0.1] }],
      [1.4, { upperarm_R: [-1.2, 0, -0.2], forearm_R: [-0.6, 0, 0], hand_R: [0.3, 0, 0], upperarm_L: [-0.9, 0, 0.35], forearm_L: [-0.6, 0, 0] }],
    ],
  },
  // block / rebound: the retargeted CMU jump's legs and trunk, both arms reaching straight up
  block: {
    from: 'jump', marks: { start: 0.38, noLift: true },
    keys: [
      [0, { upperarm_R: [-0.6, 0, -0.3], forearm_R: [-0.8, 0, 0], upperarm_L: [-0.6, 0, 0.3], forearm_L: [-0.8, 0, 0] }],
      [0.42, { upperarm_R: [-1.6, 0, -0.15], forearm_R: [-0.7, 0, 0], upperarm_L: [-1.6, 0, 0.15], forearm_L: [-0.7, 0, 0] }],
      [0.7, { upperarm_R: [-3.0, 0, -0.18], forearm_R: [-0.1, 0, 0], hand_R: [-0.2, 0, 0], upperarm_L: [-3.0, 0, 0.18], forearm_L: [-0.1, 0, 0], hand_L: [-0.2, 0, 0], neck: [-0.25, 0, 0], head: [-0.2, 0, 0] }],
      [0.95, { upperarm_R: [-2.6, 0, -0.25], forearm_R: [-0.3, 0, 0], upperarm_L: [-2.6, 0, 0.25], forearm_L: [-0.3, 0, 0] }],
      [1.4, { upperarm_R: [-0.5, 0, -0.3], forearm_R: [-0.7, 0, 0], upperarm_L: [-0.5, 0, 0.3], forearm_L: [-0.7, 0, 0] }],
    ],
  },
  // celebrations (a player keeps one): fist pump, arms up in a V with a hop, point to the sky with a chest thump
  celebrate1: {
    loop: true, dur: 0.7,
    keys: [
      [0, P(STANCE, { upperarm_R: [-1.6, 0, -0.75], forearm_R: [-2.2, 0, 0], hand_R: [0.3, 0, 0], upperarm_L: [-0.4, 0, 0.35], forearm_L: [-1.2, 0, 0], spine: [-0.05, 0, 0], neck: [-0.2, 0, 0], head: [-0.15, 0, 0] }), -0.04],
      [0.22, P(STANCE, { upperarm_R: [-0.7, 0, -0.45], forearm_R: [-2.35, 0, 0], hand_R: [0.3, 0, 0], upperarm_L: [-0.5, 0, 0.4], forearm_L: [-1.3, 0, 0], spine: [0.25, 0, 0], thigh_L: [-0.4, 0, 0.06], thigh_R: [-0.4, 0, -0.06], shin_L: [0.7, 0, 0], shin_R: [0.7, 0, 0], neck: [0.05, 0, 0] }), -0.1],
      [0.7, P(STANCE, { upperarm_R: [-1.6, 0, -0.75], forearm_R: [-2.2, 0, 0], hand_R: [0.3, 0, 0], upperarm_L: [-0.4, 0, 0.35], forearm_L: [-1.2, 0, 0], spine: [-0.05, 0, 0], neck: [-0.2, 0, 0], head: [-0.15, 0, 0] }), -0.04],
    ],
  },
  celebrate2: {
    loop: true, dur: 0.6,
    keys: [
      [0, P(STANCE, { upperarm_R: [-2.5, 0, -0.75], forearm_R: [-0.35, 0, 0], upperarm_L: [-2.5, 0, 0.75], forearm_L: [-0.35, 0, 0], spine: [-0.15, 0, 0], neck: [-0.3, 0, 0], head: [-0.2, 0, 0] }), -0.06],
      [0.3, P({ thigh_L: [-0.05, 0, 0.05], thigh_R: [-0.05, 0, -0.05], shin_L: [0.12, 0, 0], shin_R: [0.12, 0, 0], foot_L: [0.35, 0, 0], foot_R: [0.35, 0, 0], upperarm_R: [-2.75, 0, -0.6], forearm_R: [-0.15, 0, 0], upperarm_L: [-2.75, 0, 0.6], forearm_L: [-0.15, 0, 0], spine: [-0.2, 0, 0], neck: [-0.35, 0, 0], head: [-0.2, 0, 0] }), 0.05, 0],
      [0.6, P(STANCE, { upperarm_R: [-2.5, 0, -0.75], forearm_R: [-0.35, 0, 0], upperarm_L: [-2.5, 0, 0.75], forearm_L: [-0.35, 0, 0], spine: [-0.15, 0, 0], neck: [-0.3, 0, 0], head: [-0.2, 0, 0] }), -0.06],
    ],
  },
  celebrate3: {
    loop: true, dur: 0.9,
    keys: [
      [0, P(STANCE, { upperarm_R: [-2.7, 0.2, -0.3], forearm_R: [-0.1, 0, 0], upperarm_L: [-0.9, 0.2, 0.05], forearm_L: [-2.0, 0.6, 0], spine: [-0.1, 0.1, 0], neck: [-0.35, 0, 0], head: [-0.2, 0.1, 0] }), -0.03],
      [0.45, P(STANCE, { upperarm_R: [-2.85, 0.25, -0.25], forearm_R: [-0.05, 0, 0], upperarm_L: [-0.75, 0.25, 0.1], forearm_L: [-2.2, 0.7, 0], spine: [-0.05, -0.1, 0], neck: [-0.3, 0, 0], head: [-0.25, -0.1, 0], thigh_L: [-0.32, 0, 0.06], shin_L: [0.6, 0, 0] }), -0.07],
      [0.9, P(STANCE, { upperarm_R: [-2.7, 0.2, -0.3], forearm_R: [-0.1, 0, 0], upperarm_L: [-0.9, 0.2, 0.05], forearm_L: [-2.0, 0.6, 0], spine: [-0.1, 0.1, 0], neck: [-0.35, 0, 0], head: [-0.2, 0.1, 0] }), -0.03],
    ],
  },
};
