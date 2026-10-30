// Post-processing: the frame renders into a half-float target and one merged effect pass finishes it
// (anti-aliasing, tone mapping; bloom, grade and AO join it in later passes of the campaign). pmndrs
// postprocessing and N8AO come in the vendored bundle as THREE.PP and THREE.N8AOPostPass; nothing else in the
// game touches them. The low tier skips all of this and renders straight to the canvas.
/* global THREE */

// High: 4× MSAA in the scene target. Medium: FXAA in the effect pass. Low: no composer.
const TIERS = { high: { msaa: 4, fxaa: false }, medium: { msaa: 0, fxaa: true } };

export function makePost(renderer, scene, camera, tier) {
  const cfg = TIERS[tier];
  if (!cfg) { renderer.toneMapping = THREE.ACESFilmicToneMapping; return null; }
  const PP = THREE.PP;
  // the tone-mapping effect does the work now: the scene target stays linear HDR
  renderer.toneMapping = THREE.NoToneMapping;
  const composer = new PP.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: cfg.msaa });
  composer.addPass(new PP.RenderPass(scene, camera));
  const tone = new PP.ToneMappingEffect({ mode: PP.ToneMappingMode.ACES_FILMIC });
  const effects = [tone];
  if (cfg.fxaa) effects.unshift(new PP.FXAAEffect());
  const pass = new PP.EffectPass(camera, ...effects);
  composer.addPass(pass);
  return {
    tier, composer,
    render(dt) { composer.render(dt); },
    setSize(w, h) { composer.setSize(w, h, false); },
    dispose() { composer.dispose(); renderer.toneMapping = THREE.ACESFilmicToneMapping; },
  };
}
