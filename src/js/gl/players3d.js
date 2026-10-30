// 3D players: the Blender rig (assets/players.js, two builds), a kit shader that colors skin, jersey, shorts,
// socks and shoes from the rest-pose position, hair and numbers parented to bones, and procedural poses driven
// by the sim's actions. Display only: nothing here feeds back into the rules.
/* global THREE */
import { COURT } from '../court.js';
import { mix, makePose, blendPose, MASKS } from './anim-mixer.js';
import { solveLegs, reachArm } from './ik.js';

const TAU = Math.PI * 2;
const MODEL_H = 1.86; // rest height of the Blender bodies, metres
const BONES = ['hips', 'spine', 'chest', 'neck', 'head', 'clavicle_L', 'clavicle_R', 'upperarm_L', 'upperarm_R', 'forearm_L', 'forearm_R',
  'hand_L', 'hand_R', 'thigh_L', 'thigh_R', 'shin_L', 'shin_R', 'foot_L', 'foot_R'];

const P3 = { builds: null, hq: false, meta: {}, numTex: new Map(), hairGeo: new Map(), tmpQ: null, tmpE: null, tmpV: null };

// gltf: the lite mannequins (core) or, once streamed in, the HQ MPFB bodies (hq = true)
export function initPlayers(gltf, hq = false) {
  P3.tmpQ = new THREE.Quaternion(); P3.tmpE = new THREE.Euler(0, 0, 0, 'YXZ'); P3.tmpV = new THREE.Vector3();
  P3.builds = {}; P3.hq = hq; P3.meta = {};
  for (const id of ['M', 'F']) {
    const rig = gltf.scene.getObjectByName('Rig' + id);
    if (!rig) throw new Error('players.glb: missing Rig' + id);
    rig.position.set(0, 0, 0);
    // GLTFLoader makes duplicate node names unique (hand_L_1, …); both rigs share one bone naming
    rig.traverse((o) => { const m = o.name.match(/^(.*)_(\d+)$/); if (m && BONES.includes(m[1])) o.name = m[1]; });
    P3.builds[id] = rig;
    // where the HQ rig hangs its numbers and hair (written by art-src/blender/players/build_bodies_hq.py)
    try { P3.meta[id] = rig.userData.hsg ? JSON.parse(rig.userData.hsg) : null; } catch (e) { P3.meta[id] = null; }
  }
}

// ---------------------------------------------------------------- kit shader
const KIT_VERT = ['varying vec3 vRest;', '#include <begin_vertex>\n vRest = position;'];
const KIT_FRAG = `
varying vec3 vRest;
uniform vec3 uSkin, uJersey, uTrim, uShorts, uSock, uShoe, uHair, uStripe;
uniform float uChest, uLight, uRef, uHairMix, uBand;
float kitRough;
vec3 kitColor(vec3 p) {
  float h = p.y, ax = abs(p.x);
  kitRough = 0.5;
  if (h > 1.6) {
    // hair painted on the scalp: the hairline sits high at the brow, drops over the ears and low at the nape
    float back = smoothstep(0.07, -0.07, p.z);
    float hl = 1.792 - 0.118 * back - 0.02 * smoothstep(0.05, 0.09, ax) * (1.0 - back);
    if (uBand > 0.5 && abs(h - hl + 0.004) < 0.014) { kitRough = 0.9; return uTrim; } // headband
    if (uHairMix > 0.0 && h > hl) { kitRough = 0.9; return mix(uSkin, uHair, uHairMix); }
    // eyes, brows, nose shade and mouth
    vec2 e = vec2((ax - 0.036) / 0.011, (h - 1.722) / 0.0065);
    if (p.z > 0.05 && dot(e, e) < 1.0) { kitRough = 0.2; return dot(e, e) < 0.6 ? vec3(0.04, 0.03, 0.03) : mix(uSkin, vec3(0.8, 0.78, 0.75), 0.4); }
    if (p.z > 0.045 && h > 1.741 && h < 1.75 && ax > 0.018 && ax < 0.054) return mix(uSkin, uHair, 0.9);
    if (p.z > 0.07 && h > 1.664 && h < 1.669 && ax < 0.02) return uSkin * 0.55;
    return uSkin;
  }
  if (h < 0.118) { kitRough = 0.38; return h < 0.038 ? vec3(0.9, 0.89, 0.86) : (h < 0.05 ? uStripe : uShoe); }
  if (uRef > 0.5 && h < 1.062 && ax < 0.27) { kitRough = 0.7; return vec3(0.025); }          // official: black slacks
  if (h < 0.30 && ax < 0.2) { kitRough = 0.85; return (h > 0.255 && h < 0.276) ? uStripe : uSock; }
  if (h >= 0.585 && h < 1.062 && ax < 0.27) {
    kitRough = 0.78;
    if (h < 0.628 || h > 1.022) return uTrim;
    if (h < 0.96 && ax - 0.1 > 0.058 - (0.96 - h) * 0.03) return uStripe;
    return uShorts;
  }
  if (h >= 1.062 && h < 1.565) {
    float lim = h < 1.34 ? uChest + 0.03 : uChest + 0.03 - (h - 1.34) * 0.5;
    if (ax < lim) {
      kitRough = 0.8;
      float neck = p.z > 0.0 ? 1.535 - max(0.0, 0.082 - ax) * 1.5 : 1.53 - max(0.0, 0.07 - ax) * 0.4;
      if (h > neck) return uSkin;
      if (h > neck - 0.016 || ax > lim - 0.018) return uTrim;
      if (uRef > 0.5) return mod(floor((p.x + 0.4) * 24.0), 2.0) < 1.0 ? vec3(0.02) : vec3(0.9); // official's stripes
      return uJersey;
    }
  }
  return uSkin;
}
`;

// HQ bodies: every face carries a zone code (colour r = zone / 16); g = distance to a garment's open edge (x10 m),
// b = how far a shorts vertex faces outward. Piping, panels and the shorts' waistband come out crisp and curved.
const KIT3_VERT = ['attribute vec4 color; varying vec3 vRest; varying vec3 vZone;', '#include <begin_vertex>\n vRest = position; vZone = color.rgb;'];
const KIT3_FRAG = `
varying vec3 vRest; varying vec3 vZone;
uniform vec3 uSkin, uJersey, uTrim, uShorts, uSock, uShoe, uHair, uStripe;
uniform float uRef, uHairMix, uBand;
uniform vec4 uHead; uniform vec3 uEye, uMouth, uHand, uBrow;
float kitRough;
// painted hair: a hairline high at the brow, dropping toward the nape; clear of the ears
bool scalp(vec3 p) {
  vec3 d = p - uHead.xyz;
  float back = clamp((0.04 - d.z) / 0.12, 0.0, 1.0);                    // 0 at the brow, 1 at the back
  float line = 0.048 - 0.11 * back - 0.012 * smoothstep(0.05, 0.08, abs(d.x)) * (1.0 - back);
  bool ear = abs(d.x) > 0.072 && d.y < 0.015 && back < 0.75;
  return d.y > line && !ear && length(d) < 0.2;
}
vec3 kitColor(vec3 p) {
  float z = floor(vZone.r * 16.0 + 0.5), h = p.y;
  kitRough = 0.62;
  if (z < 0.5 && h > uHead.y - 0.09) {
    if (uHairMix > 0.0 && scalp(p)) {
      vec3 d = p - uHead.xyz; float back = clamp((0.04 - d.z) / 0.12, 0.0, 1.0);
      float line = 0.048 - 0.11 * back - 0.012 * smoothstep(0.05, 0.08, abs(d.x)) * (1.0 - back);
      if (uBand > 0.5 && d.y - line < 0.016) { kitRough = 0.9; return uStripe; }        // headband
      kitRough = 0.9; return mix(uSkin, uHair, uHairMix);
    }
    // brows: a soft arch over each eye, thicker toward the nose
    float bx = (abs(p.x) - uEye.x) / 0.022;
    vec2 e = vec2(abs(p.x) - uEye.x, h - uEye.y - 0.03 + uBrow.x * bx * bx - uBrow.y * bx);
    if (p.z > uEye.z - 0.02 && abs(e.x) < 0.024 && abs(e.y) < uBrow.z + 0.0025 * clamp(-e.x / 0.02, 0.0, 1.0)) { kitRough = 0.9; return mix(uSkin, uHair, 0.92); }
    // upper lid line, and lips with a small colour shift
    vec2 le = vec2(abs(p.x) - uEye.x, h - uEye.y);
    if (p.z > uEye.z - 0.012 && abs(le.x) < 0.017 && le.y > 0.0095 - 0.012 * le.x * le.x / 0.0003 && le.y < 0.0125 - 0.012 * le.x * le.x / 0.0003) return uSkin * 0.35;
    vec2 m = vec2(p.x / 0.02, (h - uMouth.y + 0.031) / 0.0062); // (MakeHuman's mouth joint sits at the upper lip line)
    if (p.z > uMouth.z - 0.02 && dot(m, m) < 1.0) return uSkin * vec3(0.78, 0.6, 0.6) + vec3(0.03, 0.0, 0.01);
  }
  if (z < 0.5 || (z > 13.5 && uRef > 0.5)) {
    float ax0 = abs(p.x);
    if (h < 0.3 && ax0 < 0.22) {                                    // socks, painted to a smooth top, tucked into the shoe
      kitRough = 0.85;
      if (uRef > 0.5) return vec3(0.025);
      return (h > 0.255 && h < 0.275) ? uStripe : uSock;
    }
    if (uRef < 0.5) { float wd = length(vec3(ax0, h, p.z) - uHand); if (wd > 0.034 && wd < 0.085 && h > uHand.y - 0.004 && h < uHand.y + 0.11) { kitRough = 0.85; return uStripe; } }
    if (uRef > 0.5 && h > 0.1 && h < 1.0 && ax0 < 0.27) { kitRough = 0.7; return vec3(0.025); }                 // officials: slacks
    if (uRef > 0.5 && h > 1.22 && h < 1.5 && ax0 > 0.15 && ax0 < 0.34) { kitRough = 0.75; return mod(floor((p.x + 0.4) * 24.0), 2.0) < 1.0 ? vec3(0.02) : vec3(0.9); } // and short sleeves
    kitRough = 0.48;
    return uSkin * vec3(1.0, 0.985, 1.0) + vec3(0.0, 0.002, 0.012);
  }
  if (z < 1.5 || (z > 2.5 && z < 3.5)) {                         // jersey or shorts
    kitRough = 0.8;
    bool shorts = z > 2.5;
    float ax = abs(p.x), front = p.z > 0.0 ? 1.0 : 0.0;
    // the garment's edges as smooth curves of the rest pose (y up, +z forward): distance inside the edge, metres
    float d;
    if (shorts) d = min(1.065 - h, h - 0.56);
    else {
      float neck = mix(1.51 + 0.6 * ax, 1.43 + 1.25 * ax * ax * 8.0, front);       // a scooped front, higher back
      float arm = (h < 1.36 ? 0.212 : 0.212 - (h - 1.36) * 0.4) - ax;              // armholes narrowing into straps
      d = min(min(neck - h, arm), h - 0.985);
    }
    if (d < 0.0) discard;                                           // outside the garment: the body shows
    if (d < 0.017) return uTrim;                                     // piping on every edge
    if (shorts && vZone.b > 0.78) return uStripe;                 // outer side panels
    if (uRef > 0.5 && !shorts) return mod(floor((p.x + 0.4) * 24.0), 2.0) < 1.0 ? vec3(0.02) : vec3(0.9);
    if (uRef > 0.5) return vec3(0.025);
    return shorts ? uShorts : uJersey;
  }
  if (z < 2.5 || z > 13.5) return uStripe;                        // trim, wristbands
  if (z < 4.5) return uStripe;
  if (z < 5.5) { kitRough = 0.85; return uRef > 0.5 ? vec3(0.025) : uSock; }
  if (z < 7.5) {
    if (h < 0.018) { kitRough = 0.7; return vec3(0.12); }                       // outsole
    if (h < 0.034) { kitRough = 0.5; return vec3(0.9, 0.89, 0.86); }           // midsole
    if (uRef > 0.5) { kitRough = 0.4; return vec3(0.02); }
    kitRough = 0.4; return h < 0.042 ? uStripe : uShoe;
  }
  if (z < 8.5) {
    if (uHairMix > 0.0 && !scalp(p)) discard;                       // the cap's edge is the painted hairline
    if (uBand > 0.5 && h < uHead.y + 0.04 && h > uHead.y + 0.02) { kitRough = 0.9; return uStripe; }
    kitRough = 0.7; return mix(uSkin, uHair, uHairMix) * (0.9 + 0.25 * smoothstep(0.6, 1.0, sin((h - uHead.y) * 160.0)));
  }
  if (z < 11.5) {
    vec3 c = vec3(sign(p.x) * uEye.x, uEye.y, uEye.z - 0.012);
    vec3 n = normalize(p - c);
    float d = n.z;                                                  // 1 looking straight ahead
    kitRough = 0.05;
    if (dot(n, normalize(vec3(-0.35 * sign(p.x), 0.4, 1.0))) > 0.9965) return vec3(1.6);  // catchlight
    if (d > 0.982) return vec3(0.008);                              // pupil
    if (d > 0.9) return mix(uHair * 0.5 + vec3(0.07, 0.04, 0.02), vec3(0.02), smoothstep(0.915, 0.9, d)); // iris, darker ring
    kitRough = 0.15; return vec3(0.86, 0.84, 0.8);                // eye white
  }
  if (z < 12.5) { kitRough = 0.9; return mix(uSkin, uHair, 0.92); } // brows
  return uSkin * vec3(0.86, 0.72, 0.7);                           // lips
}
`;

function kitMaterial() {
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0 });
  const u = {
    uSkin: { value: new THREE.Color() }, uJersey: { value: new THREE.Color() }, uTrim: { value: new THREE.Color() }, uShorts: { value: new THREE.Color() },
    uSock: { value: new THREE.Color() }, uShoe: { value: new THREE.Color() }, uHair: { value: new THREE.Color() }, uStripe: { value: new THREE.Color() },
    uChest: { value: 0.19 }, uLight: { value: 0 }, uRef: { value: 0 }, uHairMix: { value: 1 }, uBand: { value: 0 },
    uHead: { value: new THREE.Vector4(0, 1.77, 0.03, 0.12) }, uEye: { value: new THREE.Vector3(0.032, 1.76, 0.1) },
    uMouth: { value: new THREE.Vector3(0, 1.69, 0.1) }, uHand: { value: new THREE.Vector3(0.4, 0.95, 0) }, uBrow: { value: new THREE.Vector3(0.0028, 0.0018, 0.0042) },
  };
  mat.userData.u = u;
  const hq = P3.hq, V = hq ? KIT3_VERT : KIT_VERT;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = V[0] + '\n' + sh.vertexShader.replace('#include <begin_vertex>', V[1]);
    sh.fragmentShader = (hq ? KIT3_FRAG : KIT_FRAG) + sh.fragmentShader
      .replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = kitColor(vRest);')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = kitRough;')
      // fill so dark skin keeps its modelling, plus a cool back light that rims the shoulders, heads and arms
      // (view space: from behind the players and above), which separates them from the floor and the crowd
      .replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
        { vec3 V = normalize(vViewPosition);
          float fr = pow(1.0 - saturate(dot(normal, V)), 2.5);
          reflectedLight.indirectDiffuse += diffuseColor.rgb * (0.3 + fr * 0.45); // fill, so the shadow side of dark skin keeps its features
          float rim = pow(1.0 - saturate(dot(normal, V)), 3.0) * saturate(dot(normal, normalize(vec3(0.3, 0.6, -0.75))) + 0.3);
          // gated by the light this point receives (none for a body in the unlit apron), tinted by the surface and
          // capped, so a dark kit gets a cool edge and never a white glow
          float lit = clamp(dot(reflectedLight.directDiffuse, vec3(0.333)) / max(0.03, dot(diffuseColor.rgb, vec3(0.333))) * 0.6, 0.0, 1.0);
          reflectedLight.directSpecular += min(vec3(0.62, 0.72, 1.0) * rim * 1.6 * lit * (0.35 + 0.65 * diffuseColor.rgb), vec3(0.3)); }`);
  };
  mat.customProgramCacheKey = () => (hq ? 'kit3' : 'kit2');
  return mat;
}

// Color.set() already converts sRGB hex to linear (three's color management); converting again crushed dark skin to black
const col = (c, hex) => c.set(hex);
// skin and hair: the roster's tones were authored against that crushed look, so keep each player's family by
// setting halfway between the hex and its linear value (deep tones stay deep, never black)
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
// skin takes its true color (each player keeps the same tone; deep tones stay lit and modelled); hair goes half
// way, so dark hair stays dark and grey reads as grey-black
const _srgb = { r: 0, g: 0, b: 0 };
const colLook = (c, hex, w = 0) => { new THREE.Color(hex).getRGB(_srgb, THREE.SRGBColorSpace); const k = (v) => v * (1 - w) + lin(v) * w; c.setRGB(k(_srgb.r), k(_srgb.g), k(_srgb.b), THREE.SRGBColorSpace); return c; };

const SKIN3 = { '#F1C9A5': '#E9C3A6', '#E0AC86': '#C99B7E', '#C68863': '#9E6E54', '#A86B45': '#7A513C', '#7D4A2A': '#5A3A2B', '#5A3420': '#432A1F' };
function setKit(pm, kit, look) {
  const u = pm.mat.userData.u;
  if (pm.hq) colLook(u.uSkin.value, SKIN3[String(look.skin).toUpperCase()] || look.skin, 0); else colLook(u.uSkin.value, look.skin, 0.3); colLook(u.uHair.value, look.hairC, 0.5);
  col(u.uJersey.value, kit.jersey); col(u.uShorts.value, kit.shorts); col(u.uTrim.value, kit.trim);
  col(u.uStripe.value, kit.light ? kit.trim : kit.band || kit.trim);
  col(u.uSock.value, kit.light ? '#F4F1EA' : '#F4F1EA');
  col(u.uShoe.value, kit.light ? '#F4F1EA' : '#1B1B1F');
  u.uChest.value = pm.build === 'F' ? 0.18 : 0.21;
  u.uRef.value = kit.ref ? 1 : 0;
  u.uHairMix.value = look.hair === 'buzz' ? 0.72 : 1;
  u.uBand.value = look.band ? 1 : 0;
  if (pm.meta) {
    const c = pm.meta.headCenter; u.uHead.value.set(c[0], c[1], c[2], pm.meta.headRadius);
    if (pm.meta.eye) u.uEye.value.set(...pm.meta.eye);
    if (pm.meta.mouth) u.uMouth.value.set(...pm.meta.mouth);
    if (pm.meta.hand) u.uHand.value.set(...pm.meta.hand);
    // each character's own brows: arch, tilt toward the nose and weight from a stable hash of who they are
    const hsh = [...String(look.id || look.skin + look.hair + look.hairC)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const f = (k) => ((hsh >>> k) & 255) / 255;
    u.uBrow.value.set(0.0016 + 0.0026 * f(0), -0.0005 + 0.0032 * f(8), 0.0034 + 0.0018 * f(16));
  }
}

// ---------------------------------------------------------------- numbers and hair
function numberTexture(num, fg, edge) {
  const k = `${num}|${fg}|${edge}`;
  if (P3.numTex.has(k)) return P3.numTex.get(k);
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const c = cv.getContext('2d');
  c.font = '900 92px "Arial Black", Impact, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const s = String(num);
  c.save(); c.translate(64, 68); if (s.length > 1) c.scale(0.86, 1);
  c.lineJoin = 'round'; c.lineWidth = 12; c.strokeStyle = edge; c.strokeText(s, 0, 0);
  c.fillStyle = fg; c.fillText(s, 0, 0);
  c.restore();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  P3.numTex.set(k, t);
  return t;
}

// Hair meshes in head-centred model space (metres). Head centre ≈ (0, 1.73, 0), radius ≈ 0.1.
// Hair volume on top of the painted scalp, per style (model space, metres; head centre ≈ (0, 1.73, 0)).
// Short styles need none; a null result means no mesh.
function hairGeometry(style) {
  if (P3.hairGeo.has(style)) return P3.hairGeo.get(style);
  const parts = [];
  const ball = (r, x, y, z, sx = 1, sy = 1, sz = 1) => { const g = new THREE.SphereGeometry(r, 12, 8); g.scale(sx, sy, sz); g.translate(x, y, z); return g; };
  switch (style) {
    case 'high': { const g = new THREE.CylinderGeometry(0.078, 0.088, 0.1, 16); g.translate(0, 1.85, -0.012); parts.push(g); break; }
    case 'curl': for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU; parts.push(ball(0.04, Math.cos(a) * 0.06, 1.835 + (k % 2) * 0.01, Math.sin(a) * 0.065 - 0.015)); } parts.push(ball(0.05, 0, 1.85, -0.01)); break;
    case 'puffs': for (const x of [-1, 1]) parts.push(ball(0.06, x * 0.08, 1.83, -0.035)); break;
    case 'pony': parts.push(ball(0.04, 0, 1.8, -0.1)); { const g = new THREE.SphereGeometry(0.042, 10, 8); g.scale(0.8, 2.2, 0.8); g.rotateX(0.45); g.translate(0, 1.7, -0.15); parts.push(g); } break;
    case 'bun': parts.push(ball(0.054, 0, 1.85, -0.06)); break;
    case 'braids': for (const x of [-1, 1]) { const g = new THREE.CylinderGeometry(0.017, 0.011, 0.26, 6); g.translate(x * 0.075, 1.6, -0.075); parts.push(g); } break;
    default: break;
  }
  const g = parts.length ? mergeGeos(parts) : null;
  P3.hairGeo.set(style, g);
  return g;
}
function mergeGeos(list) {
  // tiny merge (positions + normals + index) to keep one draw call per hair style
  let n = 0, ni = 0;
  for (const g of list) { n += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx = new Uint32Array(ni);
  let o = 0, oi = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
    const I = g.index ? g.index.array : [...Array(g.attributes.position.count).keys()];
    for (let k = 0; k < I.length; k++) idx[oi + k] = I[k] + o;
    o += g.attributes.position.count; oi += I.length;
  }
  const m = new THREE.BufferGeometry();
  m.setAttribute('position', new THREE.BufferAttribute(pos, 3)); m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  m.setIndex(new THREE.BufferAttribute(idx, 1));
  return m;
}

// Attach an object given in model space (rest pose) to a bone, keeping its rest placement.
function attach(rig, boneName, obj) {
  const bone = rig.getObjectByName(boneName);
  rig.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(bone.matrixWorld).invert().multiply(rig.matrixWorld);
  obj.updateMatrix();
  obj.matrix.premultiply(inv);
  obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);
  bone.add(obj);
}

// ---------------------------------------------------------------- one player
export function makePlayer(build) {
  const rig = THREE.SkeletonUtils.clone(P3.builds[build]);
  const root = new THREE.Group();
  root.add(rig);
  const mat = kitMaterial();
  let mesh = null;
  rig.traverse((o) => { if (o.isSkinnedMesh) { mesh = o; o.material = mat; o.castShadow = true; o.frustumCulled = false; } });
  // rest frames: local and model-space quaternions per bone
  rig.updateMatrixWorld(true);
  const rigQInv = rig.getWorldQuaternion(new THREE.Quaternion()).invert();
  const bones = {};
  for (const n of BONES) {
    const b = rig.getObjectByName(n);
    const model = b.getWorldQuaternion(new THREE.Quaternion()).premultiply(rigQInv);
    bones[n] = { b, rest: b.quaternion.clone(), model, inv: model.clone().invert() };
  }
  // clips lower and raise the hips: model +y in the hips' parent frame, in rig units
  const hb = bones.hips.b, hp = hb.parent;
  const toParent = new THREE.Matrix4().copy(hp.matrixWorld).invert().multiply(rig.matrixWorld);
  const hipUp = new THREE.Vector3(0, 1, 0).transformDirection(toParent).multiplyScalar(1 / new THREE.Vector3().setFromMatrixScale(toParent).x);
  // the ball sits in the right palm: midway along the hand toward the knuckles, a ball's radius off the palm
  const mPos = (name) => { const o = rig.getObjectByName(name); return o ? o.getWorldPosition(new THREE.Vector3()).applyMatrix4(new THREE.Matrix4().copy(rig.matrixWorld).invert()) : null; };
  const hR = mPos('hand_R'), knR = mPos('middle_01_r') || mPos('forearm_R').sub(hR).multiplyScalar(-0.45).add(hR);
  const sock = hR.clone().lerp(knR, 0.75).add(new THREE.Vector3(0.11, 0.0, 0.03));
  const socket = sock.applyMatrix4(rig.matrixWorld).applyMatrix4(new THREE.Matrix4().copy(bones.hand_R.b.matrixWorld).invert());
  // finger chains (HQ only): curl axis per segment in the model frame
  const fingers = [];
  for (const side of ['l', 'r']) for (const f of ['thumb', 'index', 'middle', 'ring', 'pinky']) {
    for (let k = 1; k <= 3; k++) {
      const b = rig.getObjectByName(`${f}_0${k}_${side}`); if (!b) continue;
      const a0 = mPos(b.name), a1 = k < 3 ? mPos(`${f}_0${k + 1}_${side}`) : a0.clone().add(a0.clone().sub(mPos(`${f}_0${k - 1}_${side}`)));
      const dir = a1.sub(a0).normalize();
      const palm = new THREE.Vector3(side === 'l' ? -1 : 1, 0, 0.25).normalize(); // palms face the thighs in the rest pose
      const axis = new THREE.Vector3().crossVectors(palm, dir).normalize();
      const model = b.getWorldQuaternion(new THREE.Quaternion()).premultiply(rigQInv);
      fingers.push({ b, rest: b.quaternion.clone(), model, inv: model.clone().invert(), axis, thumb: f === 'thumb', k, side });
    }
  }
  const hairMat = new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0 });
  const numMatF = new THREE.MeshStandardMaterial({ transparent: true, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  const numMatB = numMatF.clone();
  const plane = new THREE.PlaneGeometry(0.25, 0.25);
  const meta = P3.hq ? P3.meta[build] : null;
  const front = new THREE.Mesh(plane, numMatF); front.position.set(...(meta ? meta.numFront : [0, 1.32, 0.15]));
  const back = new THREE.Mesh(plane, numMatB); back.position.set(...(meta ? meta.numBack : [0, 1.35, -0.136])); back.rotation.y = Math.PI;
  attach(rig, 'chest', front); attach(rig, 'chest', back);
  const pm = { root, rig, mesh, mat, bones, build, hq: P3.hq, meta, hair: null, hairMat, front, back, numMatF, numMatB, key: '', st: null,
    hipRest: hb.position.clone(), hipUp, socket, fingers, proc: makePose(), ankH: mPos('foot_L').y };
  return pm;
}

export function dressPlayer(pm, r, kit) {
  const k = `${r.id || r.num}|${kit.jersey}|${kit.trim}|${r.look.hair}`;
  if (pm.key === k) return;
  pm.key = k;
  // attachments are placed in the rest pose (a pooled rig may still hold its last pose)
  for (const n of BONES) pm.bones[n].b.quaternion.copy(pm.bones[n].rest);
  pm.bones.hips.b.position.copy(pm.hipRest); // and a clip may have lowered the hips
  setKit(pm, kit, { ...r.look, id: r.id || r.num });
  colLook(pm.hairMat.color, r.look.hairC, 0.5);
  if (pm.hair) pm.hair.parent.remove(pm.hair);
  const hg = hairGeometry(r.look.hair);
  pm.hair = new THREE.Group();
  if (hg) {
    const hm = new THREE.Mesh(hg, pm.hairMat); hm.castShadow = true;
    // the styles are modelled for the lite head (centre 1.73 m, radius 0.1): move and scale them onto an HQ head
    if (pm.meta) { const c = pm.meta.headCenter, k = 1.06; hm.position.set(c[0], c[1] - 1.73 * k, c[2] - 0.01); hm.scale.setScalar(k); }
    pm.hair.add(hm);
  }
  attach(pm.rig, 'head', pm.hair);
  pm.front.visible = pm.back.visible = !kit.ref;
  if (kit.ref) { pm.st = null; return; }
  const edge = kit.light ? '#FFFFFF' : kit.jersey;
  const t = numberTexture(r.num, kit.num, kit.light ? kit.jersey : edge);
  pm.numMatF.map = t; pm.numMatB.map = t; pm.numMatF.needsUpdate = pm.numMatB.needsUpdate = true;
  pm.st = null;
}

// ---------------------------------------------------------------- posing
// A pose is a set of model-space Euler rotations (x, y, z) per bone, applied on top of the rest pose:
// bone.local = rest · (modelRest⁻¹ · Δ · modelRest), so Δ turns the bone about axes of the character's own
// frame (x = its left, y = up, z = forward) while it still follows its parent.
function applyPose(pm, pose) {
  const q = P3.tmpQ, e = P3.tmpE;
  for (const n of BONES) {
    const B = pm.bones[n], d = pose[n];
    if (!d) { B.b.quaternion.copy(B.rest); continue; }
    e.set(d[0], d[1], d[2], 'YXZ');
    q.setFromEuler(e);
    q.premultiply(B.inv).multiply(B.model);
    B.b.quaternion.copy(B.rest).multiply(q);
  }
}

// the same, from a clip pose (quaternion turns per bone, a hips height change in model metres)
function applyPoseQ(pm, pose) {
  const q = P3.tmpQ;
  for (const n of BONES) {
    const B = pm.bones[n];
    q.copy(pose.q[n]).premultiply(B.inv).multiply(B.model);
    B.b.quaternion.copy(B.rest).multiply(q);
  }
  pm.bones.hips.b.position.copy(pm.hipRest).addScaledVector(pm.hipUp, pose.dy);
}
// Euler poses (poseFor) as quaternions, to layer the procedural parts over the clips
function eulerToQ(P, out) {
  const e = P3.tmpE;
  for (const n of BONES) { const d = P[n]; if (d) { e.set(d[0], d[1], d[2], 'YXZ'); out.q[n].setFromEuler(e); } else out.q[n].identity(); }
  out.dy = 0; out.c = 0;
  return out;
}
// fingers: a relaxed curl, closing around the ball when it is in the hand (HQ bodies have finger bones)
const _fq = { q: null };
function poseFingers(pm, grip, gripL) {
  if (!pm.fingers.length) return;
  const q = _fq.q || (_fq.q = new THREE.Quaternion());
  for (const F of pm.fingers) {
    const g = F.side === 'r' ? grip : gripL;
    const a = F.thumb ? 0.15 + 0.25 * g : (F.k === 1 ? 0.25 + 0.35 * g : 0.35 + 0.3 * g);
    q.setFromAxisAngle(F.axis, a).premultiply(F.inv).multiply(F.model);
    F.b.quaternion.copy(F.rest).multiply(q);
  }
}

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }

// Build the pose for this frame. ctx: { pl, r, hasBall, defending, ballPos, rimX, meterF, t, dt, user }
function poseFor(pm, ctx) {
  const st = pm.st;
  const pl = ctx.pl, act = pl.act;
  const speed = Math.hypot(pl.vx || 0, pl.vz || 0);
  const air = (pl.y || 0) > 0.05;
  const P = {};
  const add = (n, x = 0, y = 0, z = 0) => { const o = P[n] || (P[n] = [0, 0, 0]); o[0] += x; o[1] += y; o[2] += z; };
  // base: athletic stance; deeper when defending
  const crouch = ctx.defending ? 0.75 : 0.25;
  // locomotion blend
  const run = Math.min(1, speed / 9);
  // one stride cycle (two steps) covers about 10.7 ft at a run, so the feet keep pace with the ground
  st.phase += (speed * 0.59 + (run > 0.05 ? 0.5 : 0)) * ctx.dt * (ctx.defending && !ctx.chasing ? 0.9 : 1);
  const ph = st.phase;
  const sL = Math.sin(ph), sR = -sL;
  // legs
  if (!air) {
    if (ctx.defending && !ctx.chasing) {
      // defensive slide: wide stance, knees bent, small shuffles
      const shuffle = Math.sin(ph * 1.2) * run * 0.25;
      add('thigh_L', -0.55 * crouch - shuffle, 0, 0.26); add('thigh_R', -0.55 * crouch + shuffle, 0, -0.26);
      add('shin_L', 1.0 * crouch); add('shin_R', 1.0 * crouch);
      add('foot_L', -0.45 * crouch, 0, -0.2); add('foot_R', -0.45 * crouch, 0, 0.2);
      add('hips', 0, 0, 0);
      add('spine', 0.42 * crouch); add('chest', 0.12);
      add('neck', -0.35 * crouch); add('head', -0.15);
      // active hands: arms out and up
      const w = Math.sin(st.t * 3.1) * 0.12;
      add('upperarm_L', -0.5, 0, 1.0 + w); add('upperarm_R', -0.5, 0, -1.0 - w);
      add('forearm_L', -0.9, 0, 0.3); add('forearm_R', -0.9, 0, -0.3);
    } else {
      const a = 0.62 * run, k = 1.1 * run;
      add('thigh_L', -sL * a - 0.25 * crouch); add('thigh_R', -sR * a - 0.25 * crouch);
      add('shin_L', (Math.max(0, Math.sin(ph + 1.4)) * k + 0.35 * crouch + 0.1 * run));
      add('shin_R', (Math.max(0, Math.sin(ph + 1.4 + Math.PI)) * k + 0.35 * crouch + 0.1 * run));
      add('foot_L', 0.12 * crouch); add('foot_R', 0.12 * crouch);
      add('spine', 0.1 * crouch + 0.18 * run); add('neck', -0.12 * run);
      // arm swing (opposite to legs)
      add('upperarm_L', sL * 0.7 * run - 0.12, 0, 0.12); add('upperarm_R', sR * 0.7 * run - 0.12, 0, -0.12);
      add('forearm_L', -0.5 - 0.6 * run); add('forearm_R', -0.5 - 0.6 * run);
      // idle breathing sway
      const br = Math.sin(st.t * 1.7) * 0.03 * (1 - run);
      add('chest', br); add('upperarm_L', 0, 0, br); add('upperarm_R', 0, 0, -br);
    }
  } else {
    // airborne: tucked legs
    add('thigh_L', -0.5); add('thigh_R', -0.25); add('shin_L', 0.9); add('shin_R', 0.5);
    add('foot_L', 0.3); add('foot_R', 0.2);
  }
  // upper body by action
  if (act === 'shoot' || act === 'layup') {
    const f = ctx.meterF; // 0 → 1 over the gather and rise
    const rel = ctx.released;
    if (act === 'layup') {
      add('upperarm_R', -2.9, 0, -0.2); add('forearm_R', -0.2); add('upperarm_L', -1.1, 0, 0.4); add('forearm_L', -0.8);
      add('thigh_L', -1.1); add('shin_L', 1.4); add('spine', -0.1);
    } else {
      // gather (ball at chest) → set point above the forehead → release with a wrist flick
      const up = rel ? 1 : smooth(Math.min(1, f * 1.15));
      add('upperarm_R', lerp(-1.0, -2.75, up), 0, lerp(-0.25, -0.15, up)); add('forearm_R', lerp(-1.6, rel ? -0.15 : -1.75, up));
      add('hand_R', rel ? 1.1 : -0.9);
      add('upperarm_L', lerp(-0.9, -2.45, up), 0, lerp(0.45, 0.32, up)); add('forearm_L', lerp(-1.4, -1.2, up), 0, 0.35);
      if (!air) { add('thigh_L', -0.45 * (1 - up)); add('thigh_R', -0.45 * (1 - up)); add('shin_L', 0.8 * (1 - up)); add('shin_R', 0.8 * (1 - up)); add('spine', 0.25 * (1 - up)); }
      add('neck', -0.15); add('head', -0.2);
    }
  } else if (act === 'jump') {
    add('upperarm_L', -2.9, 0, 0.15); add('upperarm_R', -2.9, 0, -0.15); add('forearm_L', -0.15); add('forearm_R', -0.15);
    add('neck', -0.25); add('head', -0.2);
  } else if (act === 'celebrate') {
    const w = Math.sin(st.t * 9);
    add('upperarm_L', -2.6, 0, 0.5 + w * 0.15); add('upperarm_R', -2.6, 0, -0.5 - w * 0.15); add('forearm_L', -0.5); add('forearm_R', -0.5);
    add('head', -0.25);
  } else if (act === 'pass') {
    add('upperarm_L', -1.45, 0, -0.1); add('upperarm_R', -1.45, 0, 0.1); add('forearm_L', -0.15); add('forearm_R', -0.15); add('spine', 0.15);
  } else if (act === 'steal') {
    add('upperarm_R', -1.35, 0, 0.1); add('forearm_R', -0.1); add('spine', 0.45); add('thigh_R', -0.6); add('shin_R', 0.6);
  } else if (ctx.hasBall) {
    // dribble with the right hand; hand rides the bounce
    const bob = ctx.dribbleY;
    add('upperarm_R', lerp(-0.85, -0.35, bob), 0, -0.25); add('forearm_R', lerp(-1.05, -0.4, bob)); add('hand_R', lerp(0.2, -0.5, bob));
    add('upperarm_L', -0.75, 0, 0.35); add('forearm_L', -1.0, 0, 0.2);
    add('spine', 0.18); add('neck', -0.1);
    if (ctx.holdBall) { P.upperarm_R = [-0.9, 0, -0.1]; P.forearm_R = [-1.6, 0, 0.5]; P.hand_R = [0, 0, 0]; P.upperarm_L = [-0.9, 0, 0.1]; P.forearm_L = [-1.6, 0, -0.5]; }
  }
  // look toward the ball a little
  add('neck', 0, ctx.lookYaw * 0.35, 0); add('head', 0, ctx.lookYaw * 0.35, 0);
  return P;
}

// Update a player's transform and pose. Returns the world position of the right hand (for the ball).
export function updatePlayer(pm, ctx) {
  const pl = ctx.pl;
  if (!pm.st) pm.st = { head: pl.t ? -Math.PI / 2 : Math.PI / 2, phase: Math.random() * TAU, t: Math.random() * 10 };
  const st = pm.st;
  st.t += ctx.dt;
  // heading: toward the ball handler or rim, or along velocity when running
  const speed = Math.hypot(pl.vx || 0, pl.vz || 0);
  let want = st.head;
  if (ctx.faceX != null) want = Math.atan2(ctx.faceX - pl.x, ctx.faceZ - pl.z);
  if (speed > 3 && !ctx.defending && !ctx.hasBall) want = Math.atan2(pl.vx, pl.vz);
  if (speed > 3 && ctx.hasBall && pl.act !== 'shoot' && pl.act !== 'layup') want = Math.atan2(pl.vx, pl.vz);
  const d = angDiff(st.head, want);
  st.head += ctx.snap ? d : d * Math.min(1, ctx.dt * 9);
  // yaw from body to the ball, for the head turn
  const toBall = Math.atan2(ctx.ballX - pl.x, ctx.ballZ - pl.z);
  ctx.lookYaw = Math.max(-0.9, Math.min(0.9, angDiff(st.head, toBall)));
  const sc = (ctx.r.height / 12) / MODEL_H;
  // the sim leaves the floor the tick a jumper starts: show the knee load first (the first 0.13 s rise eases in)
  // (the feet stay down 0.08 s, then the body catches the sim up by 0.22 s)
  const lift = pl.act === 'shoot' ? smooth(Math.max(0, Math.min(1, ((pl.actT || 0) - 0.08) / 0.14))) : 1;
  let y = (pl.y || 0) * lift;
  // a dunk hangs on the rim a moment after the throw-down, then drops
  if (pl.act === 'layup' && pl.stype === 'dunk') {
    if (!ctx.released) st.hangY = Math.max(st.hangY || 0, y);
    else { const h = st.rimPost || 0; if (h < 0.16) y = Math.max(y, st.hangY || 0); else if (h < 0.3) y = Math.max(y, (st.hangY || 0) * (1 - (h - 0.16) / 0.14)); }
  } else st.hangY = 0;
  ctx.airY = y;
  pm.root.position.set(pl.x - COURT.L / 2, y, pl.z - COURT.W / 2);
  pm.root.rotation.y = st.head;
  pm.root.scale.setScalar(sc);
  const P = poseFor(pm, ctx);
  st.hash = st.hash ?? ((ctx.r.num || 0) * 7 + (ctx.r.id ? String(ctx.r.id).length : 3));
  ctx.hash = st.hash;
  // the dribbling hand is the one on the camera's side (the ball never hides behind the body); a change of hand
  // waits a third of a second and plays as a crossover
  if (ctx.dribbling && ctx.camX != null) {
    const rx = -Math.cos(st.head), rz = Math.sin(st.head);
    const want = rx * (ctx.camX - pl.x) + rz * (ctx.camZ - pl.z) >= 0 ? 'R' : 'L';
    if (!st.drib) st.drib = want;
    st.dribWait = want === st.drib ? 0 : (st.dribWait || 0) + ctx.dt;
    if (st.dribWait > 0.33) { st.drib = want; st.dribWait = 0; if (st.mx) st.mx.cross = true; }
  }
  ctx.dribHand = st.drib || 'R';
  const clipPose = pm.noClips ? null : mix(st, ctx, sc);
  if (clipPose) {
    // the procedural layers the clips don't cover: defensive hands, the two-hand hold, the head turned to the ball
    const proc = eulerToQ(P, pm.proc);
    if (ctx.defending && !ctx.chasing && !ctx.pl.act?.match(/jump|steal/)) blendPose(clipPose, proc, 0.85, MASKS.UPPER);
    if (ctx.holdBall) blendPose(clipPose, proc, 1, MASKS.UPPER);
    const e = P3.tmpE, q = P3.tmpQ;
    for (const n of ['neck', 'head']) { e.set(0, ctx.lookYaw * 0.35, 0, 'YXZ'); q.setFromEuler(e); clipPose.q[n].premultiply(q); }
    applyPoseQ(pm, clipPose);
    st.dy = clipPose.dy; st.c = clipPose.c;
  } else { applyPose(pm, P); pm.bones.hips.b.position.copy(pm.hipRest); st.c = -1; }
  const two = ctx.hasBall && (ctx.holdBall || ctx.pl.act === 'shoot' || ctx.pl.act === 'layup');
  poseFingers(pm, ctx.hasBall && (two || ctx.dribHand !== 'L') ? 1 : 0, two ? 0.8 : ctx.hasBall && ctx.dribHand === 'L' ? 1 : 0);
  pm.root.updateMatrixWorld(true);
  if (clipPose) solveLegs(pm, st, ctx);
  // the dribble: the ball bounces in a lane ahead of the right hip, where the camera sees it, and the hand comes
  // down onto it at the top of each bounce
  // layups and dunks: the hand goes to the front of the rim (a dunk holds it there through the throw-down)
  if (clipPose && pl.act === 'layup' && ctx.rimX != null) {
    const dunk = pl.stype === 'dunk';
    if (!ctx.released) st.rimPost = 0; else st.rimPost = (st.rimPost || 0) + ctx.dt;
    const w = !ctx.released ? smooth(Math.max(0, Math.min(1, (ctx.meterF - 0.35) / 0.5))) : Math.max(0, 1 - Math.max(0, st.rimPost - (dunk ? 0.32 : 0.05)) / 0.2);
    const dir = ctx.rimX > COURT.L / 2 ? 1 : -1;
    P3.tmpT = P3.tmpT || new THREE.Vector3();
    P3.tmpT.set(ctx.rimX - dir * (dunk ? 0.55 : 0.9) - COURT.L / 2, dunk ? 10.35 : 10.6, COURT.rimZ - COURT.W / 2);
    reachArm(pm, 'R', P3.tmpT, w * (dunk ? 1 : 0.7));
  }
  if (ctx.dribbling && clipPose) {
    const run = Math.min(1, Math.hypot(pl.vx || 0, pl.vz || 0) / 14);
    const hs = ctx.dribHand === 'L' ? 1 : -1;
    const lane = P3.tmpV.set(0.3 * hs, 0, 0.3 + 0.12 * run).applyMatrix4(pm.root.matrixWorld);
    const w = smooth(Math.max(0, Math.min(1, (ctx.ballY / ctx.ballTop - 0.5) / 0.42)));
    P3.tmpT = P3.tmpT || new THREE.Vector3();
    reachArm(pm, ctx.dribHand, P3.tmpT.set(lane.x, ctx.ballY + 0.44 + 0.08 * sc, lane.z), w * 0.95);
    lane.y = ctx.ballTop + 2; // the scene takes the sim's height (the lower of the two)
    return lane;
  }
  const hand = pm.bones.hand_R.b;
  return P3.tmpV.copy(pm.socket).applyMatrix4(hand.matrixWorld);
}
