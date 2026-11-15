// Keyboard and touch input folded into one intent object read by the fixed step.
// Edges (shootP/shootR/passP/switchP) latch until the step consumes them, so quick taps are never lost.
export const I = { mx: 0, mz: 0, shoot: false, shootP: false, shootR: false, passP: false, switchP: false, sprint: false, sprintBtn: false, stick: { x: 0, z: 0, id: null } };
const keys = new Set();
const pad = { x: 0, z: 0, sprint: false, shooting: false, prev: [], navAt: 0, navHeld: false }; // the game pad: what it holds now, and which buttons were down at the last poll
let enabled = false;
export function setEnabled(on) { enabled = on; if (!on) { keys.clear(); I.shoot = false; I.sprintBtn = false; I.stick.x = I.stick.z = 0; pad.shooting = false; recompute(); } }
export function isEnabled() { return enabled; }
// The window lost focus or the page is going away: forget held keys and a held shot without releasing it.
export function cancelHeld() { keys.clear(); I.shoot = I.shootP = I.shootR = false; I.sprintBtn = false; recompute(); }

function recompute() {
  let x = 0, z = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) z -= 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) z += 1;
  if (pad.x || pad.z) { x = pad.x; z = pad.z; }
  if (I.stick.id != null) { x = I.stick.x; z = I.stick.z; }
  I.mx = x; I.mz = z;
  I.sprint = keys.has('ShiftLeft') || keys.has('ShiftRight') || I.sprintBtn || pad.sprint;
}

const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space', 'KeyX', 'KeyJ', 'KeyC', 'KeyK', 'ShiftLeft', 'ShiftRight']);

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
  window.addEventListener('blur', cancelHeld);
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
  if (btns.sprint) hold(btns.sprint, () => { I.sprintBtn = true; recompute(); }, () => { I.sprintBtn = false; recompute(); });
}

// ---------------------------------------------------------------- game pad (standard mapping)
// Left stick or D-pad moves, A shoots (hold, release), X passes or steals, Y or B switches, either bumper or trigger sprints,
// Start pauses. The same pad moves through the menus: D-pad or stick to choose, A to press, B to go back.
const DEAD = 0.2;
const dead = (v) => (Math.abs(v) < DEAD ? 0 : Math.sign(v) * (Math.abs(v) - DEAD) / (1 - DEAD));
function connectedPad() {
  try { for (const g of navigator.getGamepads ? navigator.getGamepads() : []) if (g && g.connected) return g; } catch (e) { /* blocked by the browser */ }
  return null;
}
// Reads the pad once. Returns null when none is connected, else what the menus need: { start, nav (-1, 0 or 1), ok, back, used }.
export function pollGamepad(now = performance.now()) {
  const g = connectedPad();
  if (!g) {
    if (pad.prev.length || pad.x || pad.z || pad.sprint || pad.shooting) { // unplugged: let go of everything it held
      if (pad.shooting && I.shoot) { I.shoot = false; I.shootR = true; }
      pad.prev = []; pad.x = pad.z = 0; pad.sprint = pad.shooting = false; recompute();
    }
    return null;
  }
  const b = (i) => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
  const edge = (i) => b(i) && !pad.prev[i];
  const ax = g.axes[0] || 0, az = g.axes[1] || 0;
  let x = dead(ax), z = dead(az);
  if (b(14)) x = -1; else if (b(15)) x = 1;
  if (b(12)) z = -1; else if (b(13)) z = 1;
  const out = { start: edge(9), nav: 0, ok: edge(0), back: edge(1), used: false };
  out.used = out.start || Array.from(g.buttons).some((_, i) => edge(i)) || Math.abs(x) > 0.5 || Math.abs(z) > 0.5;
  if (enabled) {
    const sprint = b(4) || b(5) || b(6) || b(7);
    if (x !== pad.x || z !== pad.z || sprint !== pad.sprint) { pad.x = x; pad.z = z; pad.sprint = sprint; recompute(); }
    if (edge(0) && !I.shoot) { I.shoot = true; I.shootP = true; pad.shooting = true; }
    if (!b(0) && pad.shooting) { pad.shooting = false; if (I.shoot) { I.shoot = false; I.shootR = true; } }
    if (edge(2)) I.passP = true;
    if (edge(3) || edge(1)) I.switchP = true;
    out.ok = out.back = false; // in play these are the game's buttons, not the menu's
  } else {
    if (pad.x || pad.z || pad.sprint) { pad.x = pad.z = 0; pad.sprint = false; recompute(); }
    const dir = Math.abs(x) >= Math.abs(z) ? x : z; // right and down go to the next control, left and up to the one before
    if (Math.abs(dir) > 0.5) { // a held direction repeats: after 380 ms, then every 160 ms
      if (!pad.navHeld || now >= pad.navAt) { out.nav = dir > 0 ? 1 : -1; pad.navAt = now + (pad.navHeld ? 160 : 380); pad.navHeld = true; }
    } else pad.navHeld = false;
  }
  pad.prev = Array.from(g.buttons).map((_, i) => b(i));
  return out;
}

// Copy the intent into a match input and clear the edges.
export function drain(target) {
  target.mx = I.mx; target.mz = I.mz; target.shoot = I.shoot; target.sprint = I.sprint;
  target.shootP = target.shootP || I.shootP; target.shootR = target.shootR || I.shootR;
  target.passP = target.passP || I.passP; target.switchP = target.switchP || I.switchP;
  I.shootP = I.shootR = I.passP = I.switchP = false;
}
