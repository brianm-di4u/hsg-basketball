// Keyboard and touch input folded into one intent object read by the fixed step.
// Edges (shootP/shootR/passP/switchP) latch until the step consumes them, so quick taps are never lost.
export const I = { mx: 0, mz: 0, shoot: false, shootP: false, shootR: false, passP: false, switchP: false, stick: { x: 0, z: 0, id: null } };
const keys = new Set();
let enabled = false;
export function setEnabled(on) { enabled = on; if (!on) { keys.clear(); I.shoot = false; I.stick.x = I.stick.z = 0; recompute(); } }
export function isEnabled() { return enabled; }

function recompute() {
  let x = 0, z = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) z -= 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) z += 1;
  if (I.stick.id != null) { x = I.stick.x; z = I.stick.z; }
  I.mx = x; I.mz = z;
}

const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'KeyX', 'KeyJ', 'KeyC', 'KeyK']);

export function initInput(onKey) {
  window.addEventListener('keydown', (e) => {
    if (onKey(e) === true) { e.preventDefault(); return; }
    if (!enabled || !GAME_KEYS.has(e.code)) return;
    e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    if (e.code === 'Space') { I.shoot = true; I.shootP = true; }
    if (e.code === 'KeyX' || e.code === 'KeyJ') I.passP = true;
    if (e.code === 'KeyC' || e.code === 'KeyK') I.switchP = true;
    recompute();
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
    if (e.code === 'Space' && I.shoot) { I.shoot = false; I.shootR = true; }
    recompute();
  });
  window.addEventListener('blur', () => { keys.clear(); if (I.shoot) { I.shoot = false; I.shootR = true; } recompute(); });
}

// Touch controls: a virtual stick plus three buttons (pointer events cover touch, pen and mouse).
export function initTouch(stickEl, knobEl, btns) {
  const center = () => { const r = stickEl.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, R: r.width / 2 }; };
  const move = (e) => {
    const c = center();
    let dx = (e.clientX - c.x) / (c.R * 0.75), dy = (e.clientY - c.y) / (c.R * 0.75);
    const L = Math.hypot(dx, dy);
    if (L > 1) { dx /= L; dy /= L; }
    I.stick.x = Math.abs(dx) < 0.15 ? 0 : dx; I.stick.z = Math.abs(dy) < 0.15 ? 0 : dy;
    knobEl.style.transform = `translate(${dx * c.R * 0.5}px, ${dy * c.R * 0.5}px)`;
    recompute();
  };
  stickEl.addEventListener('pointerdown', (e) => {
    e.preventDefault(); I.stick.id = e.pointerId;
    try { stickEl.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointers */ }
    move(e);
  });
  stickEl.addEventListener('pointermove', (e) => { if (e.pointerId === I.stick.id) move(e); });
  const end = (e) => { if (e.pointerId !== I.stick.id) return; I.stick.id = null; I.stick.x = I.stick.z = 0; knobEl.style.transform = ''; recompute(); };
  stickEl.addEventListener('pointerup', end); stickEl.addEventListener('pointercancel', end);
  const hold = (el, down, up) => {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (err) { /* ok */ } down(); });
    const off = () => { if (!el.classList.contains('on')) return; el.classList.remove('on'); up && up(); };
    el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  };
  hold(btns.shoot, () => { I.shoot = true; I.shootP = true; }, () => { I.shoot = false; I.shootR = true; });
  hold(btns.pass, () => { I.passP = true; });
  hold(btns.sw, () => { I.switchP = true; });
}

// Copy the intent into a match input and clear the edges.
export function drain(target) {
  target.mx = I.mx; target.mz = I.mz; target.shoot = I.shoot;
  target.shootP = target.shootP || I.shootP; target.shootR = target.shootR || I.shootR;
  target.passP = target.passP || I.passP; target.switchP = target.switchP || I.switchP;
  I.shootP = I.shootR = I.passP = I.switchP = false;
}
