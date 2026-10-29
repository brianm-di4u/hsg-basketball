// Procedural art: original geometric mascot crests, shape-built players, the hardwood floor and venues.
// Mascots follow each school's `mascotConcept` from schools.json. No logos are reproduced.
import { COURT } from './court.js';
import { rnd, shade, contrast } from './util.js';

const TAU = Math.PI * 2;

// ---------------------------------------------------------------- crests (unit space: −1..1)
function shieldPath(c) {
  c.beginPath();
  c.moveTo(-0.82, -0.86); c.lineTo(0.82, -0.86); c.lineTo(0.82, 0.05);
  c.quadraticCurveTo(0.78, 0.62, 0, 0.98); c.quadraticCurveTo(-0.78, 0.62, -0.82, 0.05); c.closePath();
}
const MASCOT = {
  'hot-springs'(c, p, s) { // crested helmet in profile: half-dome + arched crest of stacked chevrons + cheek guard
    c.fillStyle = s; c.beginPath(); c.moveTo(-0.55, 0.45); c.arc(0, 0.3, 0.55, Math.PI, 0); c.lineTo(0.55, 0.62); c.lineTo(0.22, 0.62); c.lineTo(0.22, 0.42); c.lineTo(-0.1, 0.42); c.lineTo(-0.1, 0.68); c.lineTo(-0.55, 0.68); c.closePath(); c.fill();
    c.fillStyle = p; c.fillRect(0.02, 0.18, 0.45, 0.1); // eye slot
    c.fillStyle = s;
    for (let k = 0; k < 6; k++) { // crest chevrons arching over the dome
      const a = Math.PI * (1.05 + k * 0.16), r = 0.82;
      const x = Math.cos(a) * r * 0.9, y = 0.25 + Math.sin(a) * r;
      c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
      c.beginPath(); c.moveTo(-0.13, 0.05); c.lineTo(0, -0.12); c.lineTo(0.13, 0.05); c.lineTo(0.13, 0.13); c.lineTo(0, -0.02); c.lineTo(-0.13, 0.13); c.closePath(); c.fill(); c.restore();
    }
  },
  lakeside(c, p, s, a) { // ram head front-on: shield face, two spiral horns of concentric arcs
    c.fillStyle = s; c.beginPath(); c.moveTo(-0.32, -0.3); c.lineTo(0.32, -0.3); c.lineTo(0.26, 0.4); c.lineTo(0, 0.72); c.lineTo(-0.26, 0.4); c.closePath(); c.fill();
    c.strokeStyle = s; c.lineCap = 'round';
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
      c.lineWidth = 0.13 - k * 0.025;
      c.beginPath(); c.arc(sx * 0.48, -0.12, 0.36 - k * 0.11, sx > 0 ? -Math.PI * 0.95 : -Math.PI * 0.05, sx > 0 ? Math.PI * 0.6 : Math.PI * 0.4, sx < 0); c.stroke();
    }
    c.fillStyle = p; c.beginPath(); c.arc(-0.12, 0.05, 0.05, 0, TAU); c.arc(0.12, 0.05, 0.05, 0, TAU); c.fill();
  },
  'lake-hamilton'(c, p, s) { // wolf head 3/4: two tall ear triangles, long muzzle wedge, notch eye
    c.fillStyle = s; c.beginPath();
    c.moveTo(-0.5, -0.1); c.lineTo(-0.38, -0.78); c.lineTo(-0.12, -0.28); c.lineTo(0.08, -0.32); c.lineTo(0.2, -0.86); c.lineTo(0.38, -0.2);
    c.lineTo(0.82, 0.18); c.lineTo(0.62, 0.34); c.lineTo(0.2, 0.36); c.lineTo(-0.1, 0.72); c.lineTo(-0.48, 0.38); c.closePath(); c.fill();
    c.fillStyle = p; c.beginPath(); c.moveTo(0.02, -0.06); c.lineTo(0.3, 0.02); c.lineTo(0.06, 0.08); c.closePath(); c.fill();
  },
  'fountain-lake'(c, p, s) { // cobra raised with hood spread: teardrop hood, diamond head, forked tongue
    c.fillStyle = s; c.beginPath(); c.moveTo(0, -0.8); c.bezierCurveTo(0.75, -0.4, 0.62, 0.45, 0, 0.85); c.bezierCurveTo(-0.62, 0.45, -0.75, -0.4, 0, -0.8); c.fill();
    c.fillStyle = p; c.beginPath(); c.moveTo(0, -0.5); c.lineTo(0.22, -0.2); c.lineTo(0, 0.12); c.lineTo(-0.22, -0.2); c.closePath(); c.fill();
    c.strokeStyle = p; c.lineWidth = 0.05; c.beginPath(); c.moveTo(0, 0.12); c.lineTo(0, 0.32); c.moveTo(0, 0.32); c.lineTo(-0.08, 0.42); c.moveTo(0, 0.32); c.lineTo(0.08, 0.42); c.stroke();
    c.fillStyle = s; c.beginPath(); c.arc(-0.08, -0.22, 0.035, 0, TAU); c.arc(0.08, -0.22, 0.035, 0, TAU); c.fill();
  },
  'cutter-morning-star'(c, p, s, a) { // eagle profile: hooked beak triangle, crest of three feather blades, round eye
    c.fillStyle = s; c.beginPath(); c.moveTo(-0.5, 0.7); c.quadraticCurveTo(-0.62, -0.1, -0.1, -0.42); c.lineTo(0.35, -0.3); c.lineTo(0.42, 0.25); c.quadraticCurveTo(0.05, 0.3, -0.05, 0.7); c.closePath(); c.fill();
    for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(-0.3 + k * 0.05, -0.32); c.lineTo(-0.78 - k * 0.02, -0.72 + k * 0.3); c.lineTo(-0.2 + k * 0.08, -0.1 + k * 0.05); c.closePath(); c.fill(); }
    c.fillStyle = a || '#E6B422'; c.beginPath(); c.moveTo(0.35, -0.3); c.lineTo(0.85, -0.05); c.quadraticCurveTo(0.8, 0.22, 0.6, 0.25); c.lineTo(0.66, 0.05); c.lineTo(0.42, 0.06); c.closePath(); c.fill();
    c.fillStyle = p; c.beginPath(); c.arc(0.14, -0.14, 0.07, 0, TAU); c.fill();
  },
  jessieville(c, p, s) { // lion: hexagon face inside a ring of twelve flame-shaped mane points
    c.fillStyle = s;
    for (let k = 0; k < 12; k++) {
      const an = (k / 12) * TAU;
      c.beginPath(); c.moveTo(Math.cos(an - 0.22) * 0.48, Math.sin(an - 0.22) * 0.48);
      c.quadraticCurveTo(Math.cos(an) * 0.98, Math.sin(an) * 0.98, Math.cos(an + 0.3) * 0.86, Math.sin(an + 0.3) * 0.86);
      c.lineTo(Math.cos(an + 0.26) * 0.48, Math.sin(an + 0.26) * 0.48); c.closePath(); c.fill();
    }
    c.beginPath(); for (let k = 0; k < 6; k++) { const an = (k / 6) * TAU + Math.PI / 6; c.lineTo(Math.cos(an) * 0.5, Math.sin(an) * 0.5); } c.closePath(); c.fill();
    c.fillStyle = p; c.beginPath(); c.arc(-0.17, -0.06, 0.06, 0, TAU); c.arc(0.17, -0.06, 0.06, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-0.1, 0.14); c.lineTo(0.1, 0.14); c.lineTo(0, 0.26); c.closePath(); c.fill();
  },
  'mountain-pine'(c, p, s, a) { // friendly imp mark: pointed-ear shield, two short horn wedges, pitchfork-tail swash; no face
    c.fillStyle = s; c.beginPath(); c.moveTo(-0.5, -0.35); c.lineTo(-0.72, -0.6); c.lineTo(-0.38, -0.5); c.lineTo(0.38, -0.5); c.lineTo(0.72, -0.6); c.lineTo(0.5, -0.35);
    c.lineTo(0.46, 0.2); c.quadraticCurveTo(0.3, 0.55, 0, 0.62); c.quadraticCurveTo(-0.3, 0.55, -0.46, 0.2); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-0.32, -0.5); c.lineTo(-0.2, -0.86); c.lineTo(-0.1, -0.5); c.closePath(); c.moveTo(0.1, -0.5); c.lineTo(0.2, -0.86); c.lineTo(0.32, -0.5); c.closePath(); c.fill();
    c.strokeStyle = s; c.lineWidth = 0.08; c.lineCap = 'round'; c.beginPath(); c.moveTo(0.3, 0.5); c.quadraticCurveTo(0.8, 0.6, 0.72, 0.1); c.stroke();
    c.fillStyle = s; c.beginPath(); c.moveTo(0.72, -0.08); c.lineTo(0.86, 0.12); c.lineTo(0.58, 0.12); c.closePath(); c.fill();
    c.fillStyle = a; c.fillRect(-0.3, -0.12, 0.6, 0.08);
  },
  mono(c, p, s, a, letter) {
    c.fillStyle = s; c.fillRect(-0.82, 0.18, 1.64, 0.14);
    c.font = '900 1.0px "Arial Black", Impact, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(letter, 0, -0.18);
  },
};

export const CREST_KEYS = Object.keys(MASCOT);

// Draw a crest badge centered at (cx, cy) with radius r.
export function drawCrest(c, team, cx, cy, r, opts = {}) {
  const { primary, secondary, accent } = team.colors;
  // keep contrast inside the badge: if secondary is too close to primary, use accent
  const fg = contrast(primary, secondary) >= 2.2 ? secondary : accent;
  c.save(); c.translate(cx, cy); c.scale(r, r);
  shieldPath(c); c.fillStyle = primary; c.fill();
  c.lineWidth = 0.09; c.strokeStyle = fg; c.stroke();
  shieldPath(c); c.save(); c.clip();
  c.scale(0.74, 0.74); c.translate(0, -0.02);
  const fn = MASCOT[team.crest] || MASCOT.mono;
  fn(c, primary, fg, accent, team.short[0]);
  c.restore();
  if (opts.ring) { c.lineWidth = 0.04; c.strokeStyle = 'rgba(0,0,0,0.35)'; shieldPath(c); c.stroke(); }
  c.restore();
}

// A crest as a data-URL image (for DOM menus), cached.
const crestCache = new Map();
export function crestURL(team, px = 64) {
  const k = `${team.key}|${px}`;
  if (crestCache.has(k)) return crestCache.get(k);
  let url = '';
  try {
    const cv = document.createElement('canvas'); cv.width = cv.height = px;
    drawCrest(cv.getContext('2d'), team, px / 2, px / 2, px * 0.46);
    url = cv.toDataURL();
  } catch (e) { url = ''; }
  crestCache.set(k, url);
  return url;
}

// ---------------------------------------------------------------- players
// Foot point at (x, y) on screen, s px/ft. pl = court player, r = roster player, kit = team kit.
export function drawPlayer(c, x, y, s, pl, r, kit, o = {}) {
  const H = (r.height / 12) * s; // body height in px
  const lift = (pl.y || 0) * s;
  const f = pl.face || 1;
  const act = pl.act;
  const moving = Math.hypot(pl.vx || 0, pl.vz || 0) > 1.2 && lift === 0;
  const ph = pl.run || 0;
  const swing = moving ? Math.sin(ph * 2) : 0;
  const by = y - lift;
  const hipY = by - H * 0.47, shY = by - H * 0.79, headY = by - H * 0.89;
  const hw = H * 0.12; // half shoulder width
  c.lineCap = 'round'; c.lineJoin = 'round';
  // legs
  const leg = Math.max(2, H * 0.075);
  c.strokeStyle = r.look.skin; c.lineWidth = leg;
  const kneeOut = lift > 0 ? H * 0.06 : 0;
  for (const side of [-1, 1]) {
    const sw = swing * side * H * 0.12;
    c.beginPath(); c.moveTo(x + side * hw * 0.45, hipY); c.lineTo(x + side * hw * 0.5 + sw * 0.5 + side * kneeOut, hipY + H * 0.22 - kneeOut * 0.5); c.lineTo(x + side * hw * 0.42 + sw, by - (lift > 0 ? H * 0.05 : 0)); c.stroke();
    c.fillStyle = '#1B1B1F'; c.beginPath(); c.ellipse(x + side * hw * 0.42 + sw + f * leg * 0.4, by - (lift > 0 ? H * 0.05 : 0), leg * 0.95, leg * 0.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#F4F1EA'; c.fillRect(x + side * hw * 0.42 + sw - leg * 0.5, by - H * 0.11 - (lift > 0 ? H * 0.05 : 0), leg, H * 0.04); // socks
  }
  // shorts
  c.fillStyle = kit.shorts;
  c.beginPath(); c.moveTo(x - hw * 1.0, hipY - H * 0.04); c.lineTo(x + hw * 1.0, hipY - H * 0.04); c.lineTo(x + hw * 1.08, hipY + H * 0.13); c.lineTo(x - hw * 1.08, hipY + H * 0.13); c.closePath(); c.fill();
  c.fillStyle = kit.trim; c.fillRect(x - hw * 1.08, hipY + H * 0.1, hw * 0.3, H * 0.03); c.fillRect(x + hw * 0.78, hipY + H * 0.1, hw * 0.3, H * 0.03);
  // arms (behind the torso when down)
  const arm = Math.max(1.8, H * 0.06);
  const armPose = poseArms(act, pl, f, H, moving, swing);
  c.strokeStyle = r.look.skin; c.lineWidth = arm;
  for (const a of armPose) { c.beginPath(); c.moveTo(x + a[0] * hw, shY + H * 0.03); c.lineTo(x + a[1] * H, shY + a[2] * H); c.lineTo(x + a[3] * H, shY + a[4] * H); c.stroke(); }
  // torso / jersey
  c.fillStyle = kit.jersey;
  c.beginPath(); c.moveTo(x - hw, shY); c.lineTo(x + hw, shY); c.lineTo(x + hw * 0.9, hipY - H * 0.02); c.lineTo(x - hw * 0.9, hipY - H * 0.02); c.closePath(); c.fill();
  c.strokeStyle = kit.trim; c.lineWidth = Math.max(1, H * 0.018); c.stroke();
  if (kit.throwback) { c.fillStyle = kit.band; c.fillRect(x - hw * 0.95, shY + H * 0.1, hw * 1.9, H * 0.05); }
  // collar
  c.fillStyle = kit.trim; c.beginPath(); c.moveTo(x - hw * 0.35, shY); c.lineTo(x, shY + H * 0.05); c.lineTo(x + hw * 0.35, shY); c.closePath(); c.fill();
  if (kit.throwback) { c.strokeStyle = kit.band; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 2, shY + H * 0.015); c.lineTo(x + 2, shY + H * 0.04); c.moveTo(x + 2, shY + H * 0.015); c.lineTo(x - 2, shY + H * 0.04); c.stroke(); }
  // number
  if (H > 22) {
    c.fillStyle = kit.num; c.font = `800 ${Math.round(H * 0.13)}px "Arial Black", Impact, system-ui, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(String(r.num), x, shY + H * (kit.throwback ? 0.2 : 0.15));
  }
  // head
  const hr = H * 0.065;
  c.fillStyle = r.look.skin; c.beginPath(); c.arc(x, headY, hr, 0, TAU); c.fill();
  drawHair(c, x, headY, hr, r.look, f);
  if (r.look.band) { c.fillStyle = kit.trim; c.fillRect(x - hr, headY - hr * 0.45, hr * 2, hr * 0.32); }
  c.fillStyle = '#1B1B1F'; c.beginPath(); c.arc(x + f * hr * 0.45, headY - hr * 0.05, Math.max(0.8, hr * 0.13), 0, TAU); c.fill();
}

function poseArms(act, pl, f, H, moving, swing) {
  // each arm: [shoulder side, elbow dx, elbow dy, hand dx, hand dy] (in units of H relative to shoulder)
  if (act === 'shoot' || act === 'layup') return [[-1, f * 0.02, -0.12, f * 0.05, -0.24], [1, f * 0.08, -0.12, f * 0.07, -0.26]];
  if (act === 'jump') return [[-1, -0.1, -0.12, -0.06, -0.27], [1, 0.1, -0.12, 0.06, -0.27]];
  if (act === 'celebrate') { const w = Math.sin((pl.actT || 0) * 10) * 0.05; return [[-1, -0.12, -0.14, -0.15 + w, -0.3], [1, 0.12, -0.14, 0.15 - w, -0.3]]; }
  if (act === 'pass') return [[-1, f * 0.12, 0.04, f * 0.24, 0.02], [1, f * 0.14, 0.05, f * 0.26, 0.03]];
  if (act === 'steal') return [[-1, -0.05, 0.1, -0.05, 0.22], [1, f * 0.16, 0.08, f * 0.28, 0.14]];
  if (pl.hasBall) return [[-1, -0.1, 0.12, -0.08 - swing * 0.03, 0.27], [1, f * 0.12, 0.12, f * 0.2, 0.22]];
  if (pl.defending) return [[-1, -0.16, 0.06, -0.24, 0.0], [1, 0.16, 0.06, 0.24, 0.0]];
  return [[-1, -0.07 - swing * 0.05, 0.14, -0.06 - swing * 0.08, 0.28], [1, 0.07 + swing * 0.05, 0.14, 0.06 + swing * 0.08, 0.28]];
}

function drawHair(c, x, y, r, look, f) {
  c.fillStyle = look.hairC;
  switch (look.hair) {
    case 'buzz': c.beginPath(); c.arc(x, y - r * 0.15, r * 1.0, Math.PI, 0); c.fill(); break;
    case 'high': c.fillRect(x - r * 0.95, y - r * 1.75, r * 1.9, r * 1.2); break;
    case 'curl': for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x - r * 0.8 + k * r * 0.4, y - r * 0.85, r * 0.42, 0, TAU); c.fill(); } break;
    case 'pony': c.beginPath(); c.arc(x, y - r * 0.2, r * 1.05, Math.PI, 0); c.fill(); c.beginPath(); c.ellipse(x - f * r * 1.2, y + r * 0.2, r * 0.4, r * 0.9, f * 0.4, 0, TAU); c.fill(); break;
    case 'bun': c.beginPath(); c.arc(x, y - r * 0.2, r * 1.05, Math.PI, 0); c.fill(); c.beginPath(); c.arc(x, y - r * 1.3, r * 0.5, 0, TAU); c.fill(); break;
    case 'puffs': c.beginPath(); c.arc(x - r * 0.95, y - r * 0.9, r * 0.55, 0, TAU); c.arc(x + r * 0.95, y - r * 0.9, r * 0.55, 0, TAU); c.fill(); c.beginPath(); c.arc(x, y - r * 0.2, r, Math.PI, 0); c.fill(); break;
    case 'braids': c.beginPath(); c.arc(x, y - r * 0.2, r * 1.05, Math.PI, 0); c.fill(); c.fillRect(x - r * 1.1, y - r * 0.2, r * 0.35, r * 1.6); c.fillRect(x + r * 0.75, y - r * 0.2, r * 0.35, r * 1.6); break;
    case 'band': case 'short': default: c.beginPath(); c.arc(x, y - r * 0.25, r * 1.02, Math.PI * 1.05, -0.05); c.fill();
  }
}

// ---------------------------------------------------------------- floor (cached by size + home team)
// The finals arena gets a neutral floor (no school paint or crest) with a Deco sunburst at center.
export const ARENA_FLOOR = { key: 'arena', colors: { primary: '#2B3A5C', secondary: '#D4AF37', accent: '#F4F1EA' }, crest: 'arena', short: 'S' };

export function buildFloor(v, home, dpr) {
  const s = v.s, mx = 6, mz = 3.5, K = v.K;
  const w = Math.ceil((COURT.L + mx * 2) * s), h = Math.ceil((COURT.W + mz * 2) * K * s + 2);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * dpr); cv.height = Math.ceil(h * dpr);
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const X = (x) => (x + mx) * s, Z = (z) => (z + mz) * K * s;
  // apron
  c.fillStyle = '#5E3D25'; c.fillRect(0, 0, w, h);
  c.fillStyle = shade(home.colors.primary, -0.1); c.fillRect(X(-mx), Z(-mz), w, Z(0) - Z(-mz));
  c.fillRect(X(-mx), Z(COURT.W), w, h - Z(COURT.W));
  c.fillRect(X(-mx), Z(0), X(0) - X(-mx), Z(COURT.W) - Z(0)); c.fillRect(X(COURT.L), Z(0), X(COURT.L + mx) - X(COURT.L), Z(COURT.W) - Z(0));
  // hardwood strips (boards run the length of the court)
  const o = { rs: 1234 };
  c.fillStyle = '#C9965A'; c.fillRect(X(0), Z(0), X(COURT.L) - X(0), Z(COURT.W) - Z(0));
  const strip = 0.75; // ft
  for (let z = 0; z < COURT.W; z += strip) {
    const tone = 0.06 * (rnd(o) - 0.5);
    c.fillStyle = shade('#C9965A', tone);
    c.fillRect(X(0), Z(z), X(COURT.L) - X(0), Z(z + strip) - Z(z) + 0.5);
    c.fillStyle = 'rgba(80,45,15,0.18)'; c.fillRect(X(0), Z(z), X(COURT.L) - X(0), Math.max(0.5, s * 0.03));
    let x = rnd(o) * 6;
    while (x < COURT.L) { c.fillRect(X(x), Z(z), Math.max(0.5, s * 0.04), Z(z + strip) - Z(z)); x += 4 + rnd(o) * 6; }
  }
  // sheen
  const g = c.createLinearGradient(0, Z(0), 0, Z(COURT.W)); g.addColorStop(0, 'rgba(255,240,210,0.16)'); g.addColorStop(0.5, 'rgba(255,240,210,0)'); g.addColorStop(1, 'rgba(60,30,10,0.12)');
  c.fillStyle = g; c.fillRect(X(0), Z(0), X(COURT.L) - X(0), Z(COURT.W) - Z(0));
  // paint (keys) in the home color
  c.fillStyle = home.colors.primary; c.globalAlpha = 0.82;
  c.fillRect(X(0), Z(COURT.keyZ0), X(19) - X(0), Z(COURT.keyZ1) - Z(COURT.keyZ0));
  c.fillRect(X(COURT.L - 19), Z(COURT.keyZ0), X(COURT.L) - X(COURT.L - 19), Z(COURT.keyZ1) - Z(COURT.keyZ0));
  c.globalAlpha = 1;
  // center circle with a paterae rosette (Motif 9)
  c.save(); c.translate(X(47), Z(25)); c.scale(1, K);
  c.fillStyle = home.colors.primary; c.beginPath(); c.arc(0, 0, COURT.centerR * s, 0, TAU); c.fill();
  c.fillStyle = home.colors.secondary; c.globalAlpha = 0.85;
  for (let k = 0; k < 10; k++) { c.save(); c.rotate((k / 10) * TAU); c.beginPath(); c.ellipse(0, -COURT.centerR * s * 0.55, s * 0.55, s * 1.6, 0, 0, TAU); c.fill(); c.restore(); }
  c.globalAlpha = 1; c.fillStyle = home.colors.primary; c.beginPath(); c.arc(0, 0, s * 2.6, 0, TAU); c.fill();
  c.restore();
  if (home.key === 'arena') { // Deco sunburst (Motif 6), drawn flat on the floor
    c.save(); c.translate(X(47), Z(25)); c.scale(1, K); c.fillStyle = '#D4AF37';
    for (let k = 0; k < 16; k++) { c.save(); c.rotate((k / 16) * TAU); c.beginPath(); c.moveTo(-s * (k % 2 ? 0.25 : 0.45), 0); c.lineTo(0, -s * (k % 2 ? 1.7 : 2.4)); c.lineTo(s * (k % 2 ? 0.25 : 0.45), 0); c.closePath(); c.fill(); c.restore(); }
    c.beginPath(); c.arc(0, 0, s * 0.7, 0, TAU); c.fill(); c.restore();
  } else drawCrest(c, home, X(47), Z(25) - s * 0.2, s * 2.1);
  // lines
  c.strokeStyle = 'rgba(255,255,255,0.92)'; c.lineWidth = Math.max(1.5, s * 0.17);
  c.strokeRect(X(0), Z(0), X(COURT.L) - X(0), Z(COURT.W) - Z(0));
  c.beginPath(); c.moveTo(X(47), Z(0)); c.lineTo(X(47), Z(COURT.W)); c.stroke();
  c.save(); c.translate(X(47), Z(25)); c.scale(1, K); c.beginPath(); c.arc(0, 0, COURT.centerR * s, 0, TAU); c.stroke(); c.restore();
  for (const side of [0, 1]) {
    const rx = COURT.rimX[side], dir = side ? -1 : 1, base = side ? COURT.L : 0;
    c.strokeRect(Math.min(X(base), X(base + dir * 19)), Z(COURT.keyZ0), Math.abs(X(base + dir * 19) - X(base)), Z(COURT.keyZ1) - Z(COURT.keyZ0));
    c.save(); c.translate(X(base + dir * 19), Z(25)); c.scale(1, K);
    c.beginPath(); c.arc(0, 0, COURT.ftR * s, side ? Math.PI / 2 : -Math.PI / 2, side ? -Math.PI / 2 : Math.PI / 2, side === 0 ? false : false); c.stroke();
    c.setLineDash([s * 0.9, s * 0.7]); c.beginPath(); c.arc(0, 0, COURT.ftR * s, side ? -Math.PI / 2 : Math.PI / 2, side ? Math.PI / 2 : Math.PI * 1.5); c.stroke(); c.setLineDash([]);
    c.restore();
    // three-point line: straight from the baseline, then the arc
    const R3 = COURT.threeR, zA = 25 - R3, zB = 25 + R3;
    c.beginPath(); c.moveTo(X(base), Z(zA)); c.lineTo(X(rx), Z(zA)); c.stroke();
    c.beginPath(); c.moveTo(X(base), Z(zB)); c.lineTo(X(rx), Z(zB)); c.stroke();
    c.save(); c.translate(X(rx), Z(25)); c.scale(1, K);
    c.beginPath(); c.arc(0, 0, R3 * s, -Math.PI / 2, Math.PI / 2, side === 1); c.stroke(); c.restore();
    // lane hash marks
    for (const hz of [COURT.keyZ0, COURT.keyZ1]) for (const hx of [7, 8, 11, 14]) {
      c.beginPath(); c.moveTo(X(base + dir * hx), Z(hz)); c.lineTo(X(base + dir * hx), Z(hz + (hz < 25 ? -0.8 : 0.8))); c.stroke();
    }
    // restricted arc
    c.save(); c.translate(X(rx), Z(25)); c.scale(1, K); c.lineWidth = Math.max(1, s * 0.1); c.beginPath(); c.arc(0, 0, 4 * s, -Math.PI / 2, Math.PI / 2, side === 1); c.stroke(); c.restore();
  }
  return { cv, mx, mz, w, h };
}

// ---------------------------------------------------------------- venue backdrop (above the far sideline)
// kind: 'home' (brick gym, wooden bleachers, pennants) or 'arena' (dark tiers, lights).
export function buildBackdrop(v, kind, home, away, pennants, dpr) {
  const s = v.s, mx = 14;
  const w = Math.ceil((COURT.L + mx * 2) * s), h = Math.ceil(v.y0 + 1);
  const cv = document.createElement('canvas'); cv.width = Math.ceil(w * dpr); cv.height = Math.ceil(h * dpr);
  const c = cv.getContext('2d'); c.scale(dpr, dpr);
  const X = (x) => (x + mx) * s;
  const o = { rs: 99 };
  const arena = kind === 'arena';
  // wall
  if (arena) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0C0B14'); g.addColorStop(1, '#1F1C2E');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  } else {
    c.fillStyle = '#9C5B42'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(60,25,15,0.35)';
    const bh = Math.max(3, s * 0.35), bw = bh * 2.2;
    for (let y = 0, r = 0; y < h; y += bh, r++) for (let x = (r % 2) * bw / 2 - bw; x < w; x += bw) { c.fillRect(x, y, bw - 1, 1); c.fillRect(x, y, 1, bh); }
  }
  // bleachers: rows stepping down to the floor, filled with a dot-matrix crowd
  const rows = Math.max(4, Math.floor((h * 0.62) / Math.max(5, s * 0.7)));
  const top = h * (arena ? 0.22 : 0.4), rowH = (h - top) / rows;
  const hc = [home.colors.primary, home.colors.secondary], ac = [away.colors.primary, away.colors.secondary];
  for (let r = 0; r < rows; r++) {
    const y = top + r * rowH;
    c.fillStyle = arena ? (r % 2 ? '#2A2640' : '#24203A') : (r % 2 ? '#8A6440' : '#7A5636');
    c.fillRect(0, y, w, rowH);
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, y + rowH - 1, w, 1);
    const dot = Math.max(1.4, rowH * 0.3);
    for (let x = dot; x < w; x += dot * 2.4) {
      if (rnd(o) < (arena ? 0.08 : 0.2)) continue;
      const frac = x / w;
      const pal = (arena ? (frac < 0.5 ? hc : ac) : (rnd(o) < 0.82 ? hc : ac));
      c.fillStyle = rnd(o) < 0.55 ? pal[0] : rnd(o) < 0.7 ? pal[1] : ['#E8D6C0', '#5A3420', '#C68863', '#F4F1EA'][Math.floor(rnd(o) * 4)];
      c.beginPath(); c.arc(x + (rnd(o) - 0.5) * dot, y + rowH * 0.45, dot * 0.75, 0, TAU); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x - dot * 0.6, y + rowH * 0.6, dot * 1.2, rowH * 0.3);
    }
  }
  if (arena) {
    // ring of lights and a generic finals banner (no venue branding)
    for (let x = s; x < w; x += s * 3) { c.fillStyle = 'rgba(255,240,200,0.9)'; c.beginPath(); c.arc(x, h * 0.06, Math.max(1.5, s * 0.18), 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,240,200,0.08)'; c.fillRect(0, h * 0.06, w, h * 0.12);
    const bh2 = Math.max(16, h * 0.2), fs = Math.max(10, bh2 * 0.62);
    for (const cx of [X(20), X(74)]) {
      c.font = `800 ${fs}px "Century Gothic", Futura, "Trebuchet MS", sans-serif`;
      const bw2 = c.measureText('STATE FINALS').width + fs * 2;
      c.fillStyle = '#7C5A2E'; c.fillRect(cx - bw2 / 2, h * 0.04, bw2, bh2);
      c.strokeStyle = '#D4AF37'; c.lineWidth = 2; c.strokeRect(cx - bw2 / 2 + 2, h * 0.04 + 2, bw2 - 4, bh2 - 4);
      c.fillStyle = '#FFE08A'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('STATE FINALS', cx, h * 0.04 + bh2 / 2 + 1);
    }
  } else if (pennants.length) {
    // title pennants: triangle felt pennants with year numerals, centered over the court
    // banners hang from the top of the wall; size follows the wall height so text always fits
    const n = pennants.length, ph = Math.max(26, h * 0.42), pw = Math.min(ph * 0.95, (COURT.L * s * 0.8) / n), gap = pw * 0.3;
    const total = n * pw + (n - 1) * gap;
    let x = X(47) - total / 2;
    const fg = contrast(home.colors.primary, home.colors.secondary) >= 2.2 ? home.colors.secondary : home.colors.accent;
    for (const pn of pennants) {
      const py = 2;
      c.fillStyle = home.colors.primary; c.beginPath(); c.moveTo(x, py); c.lineTo(x + pw, py); c.lineTo(x + pw, py + ph * 0.72); c.lineTo(x + pw / 2, py + ph); c.lineTo(x, py + ph * 0.72); c.closePath(); c.fill();
      c.strokeStyle = fg; c.lineWidth = Math.max(1, s * 0.06); c.stroke();
      c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = `800 ${Math.max(7, Math.min(pw * 0.27, ph * 0.3))}px "Arial Black", Impact, sans-serif`;
      c.fillText(String(pn.year), x + pw / 2, py + ph * 0.3);
      c.font = `700 ${Math.max(5, Math.min(pw * 0.12, ph * 0.13))}px system-ui, sans-serif`;
      c.fillText(pn.label.split(' ')[0], x + pw / 2, py + ph * 0.58);
      x += pw + gap;
    }
  }
  // floor-line shadow
  const g2 = c.createLinearGradient(0, h - s, 0, h); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.35)');
  c.fillStyle = g2; c.fillRect(0, h - s, w, s);
  return { cv, mx, w, h };
}
