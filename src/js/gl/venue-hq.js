// The high-quality home gym: the shared Blender shell (art-src/blender/venue/build_gym.py) with its baked
// lightmaps, dressed per school. Surfaces are unlit MeshBasicMaterials whose color is the school's (or the
// material's) albedo times the baked irradiance, so the light reads the same for every school without being
// counted twice; the floor keeps its live material (markings, wood, clear coat, player shadows) and takes the
// baked light as a multiplier. Everything procedural (crowd, pennants, scoreboards, hoops, benches) is still
// built by venue3d.js on top.
/* global THREE */
import { GLOW } from './post.js';
import { contrast } from '../util.js';

// exposure for the baked light: the floor's mean irradiance maps to about 1 (venue3d's lite floor brightness)
const EXPOSURE = 0.26;

// the shell's own colors (school tints replace the tint_* slots); C = the venue's linear color helper
function slotColor(name, home, C) {
  const dark = contrast(home.colors.primary, '#111111') < 2.2;
  switch (name) {
    case 'wood': return C('#A7794C');
    case 'riser': return C('#6B4A2E');
    case 'wall': return C('#E4DED0');
    case 'tint_primary': return C(dark ? home.colors.secondary : home.colors.primary);
    case 'tint_secondary': return C(home.colors.secondary);
    case 'ceiling': return C('#3A3A40');
    case 'steel': return C('#4A4E58');
    case 'surround': return C('#9A7E62');
    default: return C('#CCCCCC');
  }
}

// shell = { scene (glTF scene), lm: { floor, shell } (KTX2 textures), lmScale: { floor, shell } }
// floorMat = venue3d's floor material, patched here to take the floor lightmap
export function addShell(g, shell, home, floorMat, wallTex, C) {
  const root = shell.scene.clone(true);
  const lmMat = {};
  for (const tag of ['floor', 'shell']) { const t = shell.lm[tag]; t.channel = 1; t.flipY = false; lmMat[tag] = t; }
  root.traverse((o) => {
    if (!o.isMesh) return;
    const name = (o.material && o.material.name) || '';
    const tag = name === 'floor' || name === 'surround' ? 'floor' : 'shell';
    const lm = lmMat[tag], k = shell.lmScale[tag] * EXPOSURE * Math.PI; // MeshBasic divides baked light by π
    if (name === 'floor') {
      // the court keeps its live material; its UVs for the markings come from position (see the floor shader)
      o.material = floorMat;
      floorMat.userData.u.tLM.value = lm;
      floorMat.userData.u.uLM.value = shell.lmScale.floor * EXPOSURE;
      o.receiveShadow = true;
      return;
    }
    const m = new THREE.MeshBasicMaterial({ color: slotColor(name, home, C), lightMap: lm, lightMapIntensity: k });
    if (name === 'wall' && wallTex) { m.map = wallTex; }
    if (name === 'lamp') { m.lightMap = null; m.color = new THREE.Color(GLOW * 1.4, GLOW * 1.35, GLOW * 1.2); }
    o.material = m;
    o.userData.hq = true;
  });
  g.add(root);
  return root;
}
