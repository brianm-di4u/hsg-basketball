// Two-bone IK for the 3D players' legs, run after the clip pose: a foot the clip plants stays where it landed (no
// skating while the body moves at the sim's speed), and no foot sinks into the floor. The foot keeps its own turn.
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

// st: the player's state (st.c: foot contacts from the clip, bit 0 left, bit 1 right; -1 = procedural pose)
export function solveLegs(pm, st, ctx) {
  if (!IK.on || st.c < 0) return;
  if (!T) T = tmp();
  const k = st.ik || (st.ik = { L: { lock: null, w: 0, last: new THREE.Vector3() }, R: { lock: null, w: 0, last: new THREE.Vector3() } });
  const sc = pm.root.scale.x, ankH = pm.ankH * sc, air = (ctx.pl.y || 0) > 0.05, dt = ctx.dt || 1 / 60;
  const slideMax = 0.7; // feet: past this the foot lets go and re-plants (a turn, a sim teleport)
  pm.root.getWorldQuaternion(T.rq);
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
    } else S.lock = null;
    S.w = clamp(S.w + (planted ? dt / 0.06 : -dt / 0.1), 0, 1);
    // past the leg's reach the foot lets go and plants again where it is (no stretched leg, no hovering lock)
    const reach = (T.a.distanceTo(T.b) + T.b.distanceTo(T.c)) * 0.995;
    if (S.lock) S.lock.y = Math.max(T.c.y, ankH * 0.92); // the clip keeps the heel's height (a foot on its toes)
    if (S.lock && T.a.distanceTo(S.lock) > reach) { S.lock.set(T.c.x, Math.max(T.c.y, ankH * 0.92), T.c.z); S.last.copy(S.lock); IK.slips++; }
    if (S.lock) S.last.copy(S.lock);
    T.tg.copy(T.c).lerp(S.last, S.w);
    if (!air) T.tg.y = Math.max(T.tg.y, ankH * 0.92);
    if (T.tg.distanceToSquared(T.c) < 1e-6) continue;
    ft.getWorldQuaternion(T.fw);
    // knee: open or close the hinge so hip-to-ankle spans the target distance
    const la = T.a.distanceTo(T.b), lb = T.b.distanceTo(T.c);
    const d = clamp(T.a.distanceTo(T.tg), Math.abs(la - lb) + 1e-3, la + lb - 1e-3);
    T.ab.subVectors(T.b, T.a); T.bc.subVectors(T.c, T.b);
    T.n.crossVectors(T.ab, T.bc);
    if (T.n.lengthSq() < 1e-8) T.n.set(1, 0, 0).applyQuaternion(T.rq); // straight leg: bend about the character's left
    T.n.normalize();
    T.u.copy(T.ab).negate().normalize(); T.v.copy(T.bc).normalize();
    const cur = Math.acos(clamp(T.u.dot(T.v), -1, 1));
    const want = Math.acos(clamp((la * la + lb * lb - d * d) / (2 * la * lb), -1, 1));
    sh.getWorldQuaternion(T.sw);
    T.q.setFromAxisAngle(T.n, cur - want);
    setWorldQ(sh, T.q.multiply(T.sw));
    // hip: swing the whole leg so the ankle lands on the target
    ft.getWorldPosition(T.c);
    T.u.subVectors(T.c, T.a).normalize(); T.v.subVectors(T.tg, T.a).normalize();
    th.getWorldQuaternion(T.tw);
    T.q.setFromUnitVectors(T.u, T.v);
    setWorldQ(th, T.q.multiply(T.tw));
    setWorldQ(ft, T.fw);
    if (S.lock && S.w >= 1) {
      ft.getWorldPosition(T.c);
      const r = T.c.distanceTo(S.lock) / sc; // model metres
      if (r > IK.maxResid) { IK.maxResid = r; IK.worst = { r: +r.toFixed(3), dLock: +(T.a.distanceTo(S.lock) / sc).toFixed(3), reach: +((la + lb) / sc).toFixed(3), minR: +(Math.abs(la - lb) / sc).toFixed(3), dy: +(T.c.y - S.lock.y).toFixed(3), air: air }; }
      IK.locked++;
    }
  }
}
