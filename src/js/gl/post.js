// Post-processing: the frame renders into a half-float (HDR) target and one merged effect pass finishes it:
// bloom on the emitters (lamps, scoreboards, LED ribbons, the rim flash: anything brighter than white),
// a light contrast/saturation grade, anti-aliasing and ACES tone mapping. pmndrs postprocessing and N8AO come in
// the vendored bundle as THREE.PP and THREE.N8AOPostPass; nothing else in the game touches them. The low tier
// skips all of this and renders straight to the canvas.
/* global THREE */

// High: 4× MSAA in the scene target, full-strength bloom. Medium: FXAA, half-resolution bloom. Low: no composer.
const TIERS = { high: { msaa: 4, fxaa: false, bloomScale: 1 }, medium: { msaa: 0, fxaa: true, bloomScale: 0.5 } };

// emitters are authored brighter than 1.0 (scene3d/venue3d multiply their colors by this), so only they bloom
export const GLOW = 3.2;

export function makePost(renderer, scene, camera, tier) {
  const cfg = TIERS[tier];
  if (!cfg) { renderer.toneMapping = THREE.ACESFilmicToneMapping; return null; }
  const PP = THREE.PP;
  // the tone-mapping effect does the work now: the scene target stays linear HDR
  renderer.toneMapping = THREE.NoToneMapping;
  const composer = new PP.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: cfg.msaa });
  composer.addPass(new PP.RenderPass(scene, camera));
  const bloom = new PP.BloomEffect({ luminanceThreshold: 1.05, luminanceSmoothing: 0.25, intensity: 1.1, mipmapBlur: true, radius: 0.7, resolutionScale: cfg.bloomScale });
  const grade = new PP.BrightnessContrastEffect({ brightness: 0.0, contrast: 0.07 });
  const sat = new PP.HueSaturationEffect({ saturation: 0.08 });
  const tone = new PP.ToneMappingEffect({ mode: PP.ToneMappingMode.ACES_FILMIC });
  const effects = [bloom, tone, grade, sat];
  if (cfg.fxaa) effects.push(new PP.FXAAEffect()); // on the tone-mapped image
  composer.addPass(new PP.EffectPass(camera, ...effects));
  return {
    tier, composer,
    render(dt) { composer.render(dt); },
    setSize(w, h) { composer.setSize(w, h, false); },
    dispose() { composer.dispose(); renderer.toneMapping = THREE.ACESFilmicToneMapping; },
  };
}
