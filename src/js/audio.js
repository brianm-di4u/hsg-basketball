// WebAudio synthesis only. The context is created on the first user gesture; nothing plays before that.
export const AU = { ctx: null, master: null, on: true, vol: 0.5, last: {}, noise: null };

export function unlock() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    AU.ctx = new C();
    AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.vol * 0.6; AU.master.connect(AU.ctx.destination);
    const len = AU.ctx.sampleRate;
    AU.noise = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate);
    const d = AU.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { AU.ctx = null; }
}
export function setVolume(v) { AU.vol = v; if (AU.master) AU.master.gain.value = v * 0.6; }
export function setOn(on) { AU.on = on; }

function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
function osc(type, f, t, dur, peak, f2) {
  const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  env(g, t, 0.005, peak, dur); o.connect(g); g.connect(AU.master); o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function noise(t, dur, peak, type, freq, q = 1) {
  const s = AU.ctx.createBufferSource(); s.buffer = AU.noise;
  const f = AU.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = AU.ctx.createGain(); env(g, t, 0.01, peak, dur);
  s.connect(f); f.connect(g); g.connect(AU.master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.1);
}

const SOUNDS = {
  bounce(t) { osc('sine', 150, t, 0.09, 0.35, 55); },
  swish(t) { noise(t, 0.28, 0.35, 'bandpass', 3200, 0.8); noise(t + 0.05, 0.2, 0.15, 'highpass', 5000); },
  rim(t, o) { osc('triangle', 640, t, 0.22, o && o.hard ? 0.3 : 0.2); osc('square', 937, t, 0.12, 0.06); },
  floor(t) { osc('sine', 110, t, 0.08, 0.2, 50); },
  whistle(t) { const o = osc('sine', 2500, t, 0.5, 0.16); const l = AU.ctx.createOscillator(), lg = AU.ctx.createGain(); l.frequency.value = 28; lg.gain.value = 90; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.55); },
  buzzer(t) { osc('sawtooth', 176, t, 0.9, 0.16); osc('sawtooth', 179, t, 0.9, 0.12); },
  cheer(t, o) { noise(t, (o && o.big) ? 1.6 : 1.0, (o && o.big) ? 0.32 : 0.2, 'lowpass', 1100, 0.6); noise(t + 0.1, 0.8, 0.08, 'bandpass', 2400, 2); },
  groan(t) { noise(t, 0.6, 0.12, 'lowpass', 500, 0.7); },
  squeak(t) { osc('sine', 2300, t, 0.07, 0.07, 3100); },
  click(t) { osc('square', 900, t, 0.03, 0.05); },
  steal(t) { osc('triangle', 520, t, 0.08, 0.18, 1040); },
  block(t) { osc('sine', 90, t, 0.2, 0.4, 40); noise(t, 0.1, 0.2, 'lowpass', 800); },
  meter(t) { osc('sine', 1320, t, 0.05, 0.08); },
  jingle(t) { [523, 659, 784, 1047].forEach((f, k) => osc('triangle', f, t + k * 0.11, 0.22, 0.14)); },
  win(t) { [523, 659, 784, 1047, 1319].forEach((f, k) => osc('triangle', f, t + k * 0.13, 0.35, 0.16)); },
};

// Rate-limited play by name.
export function play(name, o) {
  if (!AU.on || !AU.ctx || AU.ctx.state !== 'running') return;
  const now = AU.ctx.currentTime;
  const gap = name === 'bounce' ? 0.07 : name === 'squeak' ? 0.4 : 0.03;
  if (AU.last[name] && now - AU.last[name] < gap) return;
  AU.last[name] = now;
  try { SOUNDS[name] && SOUNDS[name](now, o); } catch (e) { /* audio is optional */ }
}
