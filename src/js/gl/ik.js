// Two-bone IK for the 3D players, run after the clip pose. Legs: a foot the clip plants stays where it landed (no
// skating while the body moves at the sim's speed), and no foot sinks into the floor; the foot keeps its own turn.
// Arms: a hand reaches a world target (the ball at the top of a dribble, the rim on a dunk), blended by weight.
// Display only.
/* global THREE */

export const IK = { on: true, maxResid: 0, slips: 0, locked: 0 };
let T = null;
function tmp() {
  const V = () => new THREE.Vector3(), Q = () => new THREE.Quaternion();
  return { a: V(), b: V(), c: V(), tg: V(), ab: V(), bc: V(), n: V(), u: V(), v: V(), q: Q(), pw: Q(), sw: Q(), tw: Q(), fw: Q(), rq: Q() };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function setWorldQ(bone, wq) {
  bone.parent.getWorldQuaternion(T.pw);
  bone.quaternion.copy(T.pw.invert().multiply(wq));
  bone.updateMatrixWorld(true);
}

// Put the end of the chain b1 → b2 → b3 (b3's origin: the ankle or wrist) on T.tg. The hinge bends in the plane the
// pose already bends in (fallback: about `axis`, world space, when the limb is straight); b3 keeps its world turn.
function twoBone(b1, b2, b3, axis) {
  b1.getWorldPosition(T.a); b2.getWorldPosition(T.b); b3.getWorldPosition(T.c);
  b3.getWorldQuaternion(T.fw);
  const la = T.a.distanceTo(T.b), lb = T.b.distanceTo(T.c);
  const d = clamp(T.a.distanceTo(T.tg), Math.abs(la - lb) + 1e-3, la + lb - 1e-3);
  T.ab.subVectors(T.b, T.a); T.bc.subVectors(T.c, T.b);
  T.n.crossVectors(T.ab, T.bc);
  if (T.n.lengthSq() < 1e-8) T.n.copy(axis);
  T.n.normalize();
  T.u.copy(T.ab).negate().normalize(); T.v.copy(T.bc).normalize();
  const cur = Math.acos(clamp(T.u.dot(T.v), -1, 1));
  const want = Math.acos(clamp((la * la + lb * lb - d * d) / (2 * la * lb), -1, 1));
  b2.getWorldQuaternion(T.sw);
  T.q.setFromAxisAngle(T.n, cur - want);
  setWorldQ(b2, T.q.multiply(T.sw));
  // swing the whole limb so its end lands on the target
  b3.getWorldPosition(T.c);
  T.u.subVectors(T.c, T.a).normalize(); T.v.subVectors(T.tg, T.a).normalize();
  b1.getWorldQuaternion(T.tw);
  T.q.setFromUnitVectors(T.u, T.v);
  setWorldQ(b1, T.q.multiply(T.tw));
  setWorldQ(b3, T.fw);
  return { la, lb };
}

// st: the player's state (st.c: foot contacts from the clip, bit 0 left, bit 1 right; -1 = procedural pose)
export function solveLegs(pm, st, ctx) {
  if (!IK.on || st.c < 0) return;
  if (!T) T = tmp();
  const k = st.ik || (st.ik = { L: { lock: null, w: 0, last: new THREE.Vector3() }, R: { lock: null, w: 0, last: new THREE.Vector3() }, at: new THREE.Vector3(), seen: false });
  // a jump in position (a replay cut, a sim placement) drops the old locks: they belong to another place
  if (!k.seen || k.at.distanceToSquared(pm.root.position) > 9) { for (const s of ['L', 'R']) { k[s].lock = null; k[s].w = 0; } }
  k.at.copy(pm.root.position); k.seen = true;
  const sc = pm.root.scale.x, ankH = pm.ankH * sc, air = (ctx.airY ?? ctx.pl.y ?? 0) > 0.05, dt = ctx.dt || 1 / 60;
  const slideMax = 0.7; // feet: past this the foot lets go and re-plants (a turn, a sim teleport)
  pm.root.getWorldQuaternion(T.rq);
  const left = new THREE.Vector3(1, 0, 0).applyQuaternion(T.rq); // straight leg: bend about the character's left
  for (const side of ['L', 'R']) {
    const S = k[side];
    const th = pm.bones['thigh_' + side].b, sh = pm.bones['shin_' + side].b, ft = pm.bones['foot_' + side].b;
    th.getWorldPosition(T.a); sh.getWorldPosition(T.b); ft.getWorldPosition(T.c);
    const planted = !air && ((st.c >> (side === 'L' ? 0 : 1)) & 1) === 1;
    if (planted) {
      if (!S.lock) { S.lock = T.c.clone(); S.lock.y = ankH; }
      const dx = T.c.x - S.lock.x, dz = T.c.z - S.lock.z;
      if (dx * dx + dz * dz > slideMax * slideMax) { S.lock.set(T.c.x, ankH, T.c.z); IK.slips++; }
      S.last.copy(S.lock);
    } else { S.lock = null; if (S.last.distanceToSquared(T.c) > slideMax * slideMax * 4) S.w = 0; }
    S.w = clamp(S.w + (planted ? dt / 0.06 : -dt / 0.1), 0, 1);
    // past the leg's reach the foot lets go and plants again where it is (no stretched leg, no hovering lock)
    const reach = (T.a.distanceTo(T.b) + T.b.distanceTo(T.c)) * 0.995;
    if (S.lock) S.lock.y = Math.max(T.c.y, ankH * 0.92); // the clip keeps the heel's height (a foot on its toes)
    if (S.lock && T.a.distanceTo(S.lock) > reach) { S.lock.set(T.c.x, Math.max(T.c.y, ankH * 0.92), T.c.z); S.last.copy(S.lock); IK.slips++; }
    if (S.lock) S.last.copy(S.lock);
    T.tg.copy(T.c).lerp(S.last, S.w);
    if (!air) T.tg.y = Math.max(T.tg.y, ankH * 0.92);
    if (T.tg.distanceToSquared(T.c) < 1e-6) continue;
    twoBone(th, sh, ft, left);
    if (S.lock && S.w >= 1) {
      ft.getWorldPosition(T.c);
      const r = T.c.distanceTo(S.lock) / sc; // model metres
      if (r > IK.maxResid) IK.maxResid = r;
      IK.locked++;
    }
  }
}

// Reach a hand ('L' | 'R') toward a world point (the wrist goes there), blended by w in 0..1.
export function reachArm(pm, side, target, w) {
  if (!IK.on || w <= 0.001) return;
  if (!T) T = tmp();
  const ua = pm.bones['upperarm_' + side].b, fa = pm.bones['forearm_' + side].b, hd = pm.bones['hand_' + side].b;
  hd.getWorldPosition(T.c);
  T.tg.copy(T.c).lerp(target, clamp(w, 0, 1));
  pm.root.getWorldQuaternion(T.rq);
  // a straight arm bends at the elbow about the character's up axis crossed with the arm: use its up
  const up = new THREE.Vector3(0, side === 'R' ? -1 : 1, 0).applyQuaternion(T.rq);
  twoBone(ua, fa, hd, up);
}
