// Steam vents (S4-01): slow plumes of steam rise from a few floor vents just outside the court, the way the spa town's
// bathhouses breathe on a cold morning. One camera-facing point sprite per puff, soft-edged and faint, drawn behind the
// players' action: out of bounds, so they never cover the ball or a player. Off on the lowest quality tier and under
// reduced motion. A few dozen points in one draw call: the cost is not measurable next to the venue.
/* global THREE */

// Court feet (x along the court, z across it) of the vents: the far corners and the baselines, all out of bounds.
export const VENT_SPOTS = [[-3.5, -4.5], [97.5, -4.5], [-6.5, 7], [100.5, 43]];
export const VENT_PUFFS = { high: 14, medium: 9, low: 0 }; // puffs rising from each vent, by quality tier
const LIFE = 5.5;    // seconds a puff lives
const RISE = 10;     // feet a puff climbs
const SIZE = [1.6, 6.5]; // world feet across: small at the grate, wide at the top
const ALPHA = 0.2;   // the most opaque a puff gets

export function makeVents(HL, HW) {
  const nMax = VENT_SPOTS.length * Math.max(...Object.values(VENT_PUFFS));
  const pos = new Float32Array(nMax * 3), size = new Float32Array(nMax), alpha = new Float32Array(nMax);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 600 }, uColor: { value: new THREE.Color(0xf1ece0) } },
    vertexShader: 'attribute float aSize; attribute float aAlpha; varying float vA; uniform float uScale; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = aAlpha; gl_PointSize = max(1.0, aSize * uScale / -mv.z); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 uColor; varying float vA; void main() { float d = length(gl_PointCoord - 0.5) * 2.0; gl_FragColor = vec4(uColor, smoothstep(1.0, 0.15, d) * vA); }',
    transparent: true, depthWrite: false, depthTest: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false; points.visible = false; points.renderOrder = 2;
  let drawn = -1;
  return {
    points, count: 0,
    // time in seconds, tier 'high' | 'medium' | 'low', off: reduced motion
    update(time, cam, renderer, tier, off) {
      const per = off ? 0 : VENT_PUFFS[tier] || 0, V = VENT_SPOTS.length, n = per * V;
      if (!n) { points.visible = false; this.count = 0; return; }
      const fov = cam.fov * Math.PI / 180, h = renderer.getDrawingBufferSize(new THREE.Vector2()).y;
      mat.uniforms.uScale.value = h / (2 * Math.tan(fov / 2));
      for (let i = 0; i < n; i++) {
        const v = i % V, k = Math.floor(i / V), [vx, vz] = VENT_SPOTS[v];
        const t = (time / LIFE + k / per + v * 0.23) % 1;
        const breathe = 0.55 + 0.45 * Math.sin(time * 0.31 + v * 2.3); // each vent swells and eases on its own slow beat
        const sway = Math.sin(t * 5 + i * 1.7) * 0.9 * t;
        pos[i * 3] = vx - HL + sway; pos[i * 3 + 1] = 0.4 + t * RISE; pos[i * 3 + 2] = vz - HW + Math.cos(t * 4 + i) * 0.6 * t;
        size[i] = SIZE[0] + (SIZE[1] - SIZE[0]) * t;
        alpha[i] = ALPHA * breathe * Math.pow(Math.sin(Math.PI * t), 1.3);
      }
      if (drawn !== n) { geo.setDrawRange(0, n); drawn = n; }
      geo.attributes.position.needsUpdate = geo.attributes.aSize.needsUpdate = geo.attributes.aAlpha.needsUpdate = true;
      points.visible = true; this.count = n;
    },
  };
}
