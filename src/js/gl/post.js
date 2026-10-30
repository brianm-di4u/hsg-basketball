// Post-processing: the frame renders into a half-float (HDR) target and one merged effect pass finishes it:
// bloom on the emitters (lamps, scoreboards, LED ribbons, the rim flash: anything brighter than white),
// a light contrast/saturation grade, anti-aliasing and ACES tone mapping. pmndrs postprocessing and N8AO come in
// the vendored bundle as THREE.PP and THREE.N8AOPostPass; nothing else in the game touches them. The low tier
// skips all of this and renders straight to the canvas.
// Replays and close-ups (setCinema) add a depth of field focused on the subject and, on high, a camera-motion
// blur (each pixel smeared along its screen motion since the last frame, rebuilt from depth); medium gets a vignette.
/* global THREE */

// High: 4× MSAA in the scene target, full-strength bloom. Medium: FXAA, half-resolution bloom. Low: no composer.
const TIERS = { high: { msaa: 4, fxaa: false, bloomScale: 1 }, medium: { msaa: 0, fxaa: true, bloomScale: 0.5 } };

// emitters are authored brighter than 1.0 (scene3d/venue3d multiply their colors by this), so only they bloom
export const GLOW = 3.2;

// camera-motion blur: reproject each pixel's world position with last frame's view-projection
const BLUR_FRAG = `
uniform mat4 uInvVP, uPrevVP;
uniform float uAmount;
void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {
  vec4 ndc = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
  vec4 wp = uInvVP * ndc; wp /= wp.w;
  vec4 pp = uPrevVP * wp; pp.xy /= pp.w;
  vec2 vel = (uv - (pp.xy * 0.5 + 0.5)) * uAmount;
  float L = length(vel);
  if (L > 0.012) vel *= 0.012 / L;
  vec4 acc = inputColor;
  for (int i = 1; i < 8; i++) acc += texture2D(inputBuffer, uv - vel * (float(i) / 7.0));
  outputColor = acc / 8.0;
}`;
function makeBlur(PP) {
  class CameraBlur extends PP.Effect {
    constructor() {
      super('CameraBlur', BLUR_FRAG, { attributes: PP.EffectAttribute.DEPTH, uniforms: new Map([['uInvVP', new THREE.Uniform(new THREE.Matrix4())], ['uPrevVP', new THREE.Uniform(new THREE.Matrix4())], ['uAmount', new THREE.Uniform(0.6)]]) });
    }
  }
  return new CameraBlur();
}

export function makePost(renderer, scene, camera, tier) {
  const cfg = TIERS[tier];
  if (!cfg) { renderer.toneMapping = THREE.ACESFilmicToneMapping; return null; }
  const PP = THREE.PP;
  // the tone-mapping effect does the work now: the scene target stays linear HDR
  renderer.toneMapping = THREE.NoToneMapping;
  const composer = new PP.EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: cfg.msaa });
  composer.addPass(new PP.RenderPass(scene, camera));
  // cinema: depth of field (and motion blur on high) in HDR, before the grade; off in live play
  const dof = new PP.DepthOfFieldEffect(camera, { focusDistance: 30, focusRange: 6, bokehScale: tier === 'high' ? 5 : 3.5, resolutionScale: 0.5 });
  dof.target = new THREE.Vector3();
  const blur = tier === 'high' ? makeBlur(PP) : null;
  const cine = new PP.EffectPass(camera, ...(blur ? [dof, blur] : [dof]));
  cine.enabled = false;
  composer.addPass(cine);
  const vig = new PP.VignetteEffect({ offset: 0.3, darkness: 0.0 });
  const bloom = new PP.BloomEffect({ luminanceThreshold: 1.05, luminanceSmoothing: 0.25, intensity: 1.1, mipmapBlur: true, radius: 0.7, resolutionScale: cfg.bloomScale });
  const grade = new PP.BrightnessContrastEffect({ brightness: 0.02, contrast: 0.08 });
  const sat = new PP.HueSaturationEffect({ saturation: 0.08 });
  const tone = new PP.ToneMappingEffect({ mode: PP.ToneMappingMode.ACES_FILMIC });
  const effects = [bloom, tone, grade, sat, vig];
  if (cfg.fxaa) effects.push(new PP.FXAAEffect()); // on the tone-mapped image
  composer.addPass(new PP.EffectPass(camera, ...effects));
  const vp = new THREE.Matrix4(), prevVP = new THREE.Matrix4();
  let primed = false;
  const lastPos = new THREE.Vector3();
  return {
    tier, composer,
    // on: a replay or close-up camera; focus: the subject's world position
    setCinema(on, focus) {
      cine.enabled = !!on;
      vig.darkness = on ? 0.45 : 0.0;
      if (on && focus) dof.target.copy(focus);
      if (!on) primed = false;
    },
    render(dt) {
      if (blur && cine.enabled) {
        camera.updateMatrixWorld();
        vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        // a cut (the camera jumped) starts clean: no smear across it
        if (!primed || camera.position.distanceTo(lastPos) > 2.5) prevVP.copy(vp);
        primed = true; lastPos.copy(camera.position);
        blur.uniforms.get('uInvVP').value.copy(vp).invert();
        blur.uniforms.get('uPrevVP').value.copy(prevVP);
        // a step(n) hook draws one frame for many ticks: scale the smear to one 60 Hz frame
        blur.uniforms.get('uAmount').value = Math.min(1, (1 / 60) / Math.max(dt || 1 / 60, 1 / 240)) * 0.7;
        prevVP.copy(vp);
      }
      composer.render(dt);
    },
    setSize(w, h) { composer.setSize(w, h, false); },
    dispose() { composer.dispose(); renderer.toneMapping = THREE.ACESFilmicToneMapping; },
  };
}
