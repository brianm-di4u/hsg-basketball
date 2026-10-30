// The shot trail: one camera-facing ribbon (a triangle strip through the ball's recent positions) that tapers
// and fades toward its tail. Additive, so it glows against the dark house and reads at broadcast distance.
/* global THREE */

const N = 24; // points kept

export function makeTrail() {
  const pos = new Float32Array(N * 2 * 3), alpha = new Float32Array(N * 2);
  const idx = [];
  for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setIndex(idx);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xff8a3d) }, uGain: { value: 1 } },
    vertexShader: 'attribute float aAlpha; varying float vA; void main() { vA = aAlpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 uColor; uniform float uGain; varying float vA; void main() { gl_FragColor = vec4(uColor * uGain * vA, vA); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false; mesh.visible = false; mesh.renderOrder = 3;
  const pts = [];
  const side = new THREE.Vector3(), seg = new THREE.Vector3(), toCam = new THREE.Vector3();
  return {
    mesh,
    clear() { pts.length = 0; mesh.visible = false; },
    // ballPos: world position this frame; cam: the camera; color: hex; width: ribbon width at the head (ft)
    update(ballPos, cam, color, width = 0.62) {
      if (pts.length && pts[0].distanceTo(ballPos) > 3) pts.length = 0; // a step(n) jump: start over
      if (!pts.length || pts[0].distanceTo(ballPos) > 0.05) pts.unshift(ballPos.clone());
      if (pts.length > N) pts.length = N;
      mat.uniforms.uColor.value.setHex(color);
      if (pts.length < 2) { mesh.visible = false; return; }
      for (let i = 0; i < N; i++) {
        const p = pts[Math.min(i, pts.length - 1)], q = pts[Math.min(i + 1, pts.length - 1)] || p;
        seg.subVectors(i + 1 < pts.length ? p : pts[i - 1] || p, i + 1 < pts.length ? q : p);
        toCam.subVectors(cam.position, p);
        side.crossVectors(seg, toCam).normalize();
        const f = i < pts.length ? 1 - i / (pts.length - 1 || 1) : 0, w = width * (0.15 + 0.85 * f);
        pos.set([p.x + side.x * w, p.y + side.y * w, p.z + side.z * w, p.x - side.x * w, p.y - side.y * w, p.z - side.z * w], i * 6);
        // fades in a short way behind the ball, so the ball keeps a clear dark edge
        const head = Math.min(1, (1 - f) / 0.18);
        alpha[i * 2] = alpha[i * 2 + 1] = f * f * head * 0.9;
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.aAlpha.needsUpdate = true;
      mesh.visible = true;
    },
  };
}
