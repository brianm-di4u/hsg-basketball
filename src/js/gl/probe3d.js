// A reflection probe of the venue itself: one cube snapshot of the empty gym from mid-court, prefiltered with
// PMREM. It lights players and the ball (scene.environment) and gives the varnished floor its reflections.
// The floor looks it up box-projected, so the bleachers and banners land where they stand in the room instead
// of at infinity. Rebuilt whenever the venue changes; players, the ball and effects are hidden while it renders.
/* global THREE */

export function makeProbe(renderer, size) {
  const rt = new THREE.WebGLCubeRenderTarget(size, { type: THREE.HalfFloatType });
  const cam = new THREE.CubeCamera(0.5, 600, rt);
  const pmrem = new THREE.PMREMGenerator(renderer);
  let env = null;
  return {
    pos: new THREE.Vector3(0, 7, 0),
    get texture() { return env && env.texture; },
    // hide: objects to keep out of the snapshot (players, ball, trail, markers)
    capture(scene, hide) {
      const vis = hide.map((o) => o.visible);
      hide.forEach((o) => { o.visible = false; });
      const env0 = scene.environment; scene.environment = null;
      const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
      cam.position.copy(this.pos);
      cam.update(renderer, scene);
      renderer.toneMapping = tm; scene.environment = env0;
      hide.forEach((o, i) => { o.visible = vis[i]; });
      if (env) env.dispose();
      env = pmrem.fromCubemap(rt.texture);
      return env.texture;
    },
    dispose() { rt.dispose(); pmrem.dispose(); if (env) env.dispose(); },
  };
}

// Patch a material's image-based light so reflections are box-projected around the probe.
// box = { min: Vector3, max: Vector3 } in world space (the room), probe = the probe's world position.
export function boxProject(material, box, probe) {
  const u = { uBoxMin: { value: box.min }, uBoxMax: { value: box.max }, uProbePos: { value: probe } };
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    Object.assign(sh.uniforms, u);
    sh.vertexShader = 'varying vec3 vBoxWorld;\n' + sh.vertexShader.replace('#include <worldpos_vertex>',
      '#include <worldpos_vertex>\n vBoxWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uBoxMin, uBoxMax, uProbePos; varying vec3 vBoxWorld;\n'
        + 'vec3 boxDir(vec3 r) { vec3 t1 = (uBoxMax - vBoxWorld) / r, t2 = (uBoxMin - vBoxWorld) / r; vec3 tf = max(t1, t2);'
        + ' float t = min(min(tf.x, tf.y), tf.z); return normalize(vBoxWorld + r * t - uProbePos); }');
    sh.fragmentShader = sh.fragmentShader.replace('#include <envmap_physical_pars_fragment>',
      THREE.ShaderChunk.envmap_physical_pars_fragment.replace(
        'vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );',
        'vec4 envMapColor = textureCubeUV( envMap, envMapRotation * boxDir( reflectVec ), roughness );'));
  };
  const key = material.customProgramCacheKey ? material.customProgramCacheKey.bind(material) : () => '';
  material.customProgramCacheKey = () => key() + '|box';
  return material;
}
