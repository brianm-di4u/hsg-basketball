// WebAudio synthesis only. The context is created on the first user gesture; nothing plays before that.
// Chain: cues and the kit's ambience bed -> master gain -> limiter -> speakers.
import { makeAudioKit, measureAudio } from './audiokit.js';
import { SCORES } from './music.js';

export const AU = { ctx: null, master: null, kit: null, cues: null, on: true, vol: 0.5, ambOn: true, musOn: true, music: '', tension: 0, scene: '', paused: false, last: {}, count: {}, noise: null };

// Master gain is vol * MASTER_GAIN. It was 0.6, which left the loudest cue at a peak of 0.1 at the speakers; 1.4 puts
// the main cues at 0.25 to 0.45 at Medium and the limiter keeps cues, crowd and reactions under 0.95 on High.
const MASTER_GAIN = 1.4; // was 0.6
const MUSIC_LEVEL = 0.5; // music bus level when Music is On (the pieces' own gains are in music.js)
const AMB_LEVEL = 1.5;   // ambience bus level when Ambience is On: puts the bed at about -50 dBFS (quiet crowd) to -40 (roaring) at Medium

// The limiter sits between the master gain and the speakers so a pile-up of cues cannot clip.
function limiter(ctx, dest) {
  const c = ctx.createDynamicsCompressor();
  c.threshold.value = -4; c.knee.value = 0; c.ratio.value = 20; c.attack.value = 0.002; c.release.value = 0.12;
  c.connect(dest); return c;
}
function noiseBuffer(ctx) {
  const len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// ---------------------------------------------------------------- ambience scenes (data for the kit)
// The crowd bed: murmur, two bands of voices that drift, and a quiet room tone. `crowd` (0..1) moves the voices.
// Sparse one-shots keep it from ever sounding like a loop: a rolling swell, far-off claps and a shoe squeak.
const clap = (ctx, dst, t, rnd, v) => {
  const n = 2 + ((rnd() * 4) | 0);
  for (let i = 0; i < n; i++) {
    const s = t + i * (0.11 + rnd() * 0.07), src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = AU.noiseFor(ctx); src.loop = true; f.type = 'bandpass'; f.frequency.value = 1500 + rnd() * 900; f.Q.value = 1.1;
    g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(v * 0.9, s + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.06);
    src.connect(f); f.connect(g); g.connect(dst); src.start(s, rnd() * 1.5); src.stop(s + 0.08);
  }
};
const squeakFar = (ctx, dst, t, rnd, v) => {
  const o = ctx.createOscillator(), g = ctx.createGain(), f = 2100 + rnd() * 900;
  o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.08);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v * 0.5, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g); g.connect(dst); o.start(t); o.stop(t + 0.12);
};
// Tension: `tension` (0..1) brings up a low, wavering hum (two narrow bands of noise a few hertz apart, so they beat), and
// `beat` (0 or 1) switches on a slow heartbeat. main.js drives them from the clock and the score in the last minute.
const heartbeat = (ctx, dst, t, rnd, v) => {
  for (const [dt, f, k] of [[0, 62, 1], [0.17, 50, 0.7]]) {
    const o = ctx.createOscillator(), g = ctx.createGain(), s = t + dt;
    o.frequency.setValueAtTime(f, s); o.frequency.exponentialRampToValueAtTime(f * 0.6, s + 0.12);
    g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(v * k, s + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16);
    o.connect(g); g.connect(dst); o.start(s); o.stop(s + 0.2);
  }
};
const TENSION_BEDS = [
  { type: 'bandpass', freq: 55, q: 14, gain: 0.2, lfo: { rate: 0.15, depth: 0.5 }, param: 'tension', range: [0, 1] },
  { type: 'bandpass', freq: 58.5, q: 14, gain: 0.2, pan: 0.2, lfo: { rate: 0.11, depth: 0.5 }, param: 'tension', range: [0, 1] },
];
const TENSION_SPOT = { make: heartbeat, every: [0.84, 0.84], gain: 0.022, pan: [-0.05, 0.05], param: 'beat' };
export const SCENES = {
  gym: {
    beds: [
      { type: 'lowpass', freq: 420, q: 0.5, gain: 0.021, lfo: { rate: 0.07, depth: 0.45 }, param: 'crowd', range: [0.55, 1.5] },
      { type: 'bandpass', freq: 880, q: 0.7, gain: 0.014, pan: -0.3, lfo: { rate: 0.11, depth: 0.6 }, flfo: { rate: 0.05, depth: 160 }, param: 'crowd', range: [0.25, 1.7] },
      { type: 'bandpass', freq: 1450, q: 0.9, gain: 0.009, pan: 0.3, lfo: { rate: 0.09, depth: 0.7 }, flfo: { rate: 0.04, depth: 220 }, param: 'crowd', range: [0.15, 1.8] },
      { type: 'lowpass', freq: 150, q: 0.6, gain: 0.014 },
      ...TENSION_BEDS,
    ],
    spots: [
      { make: 'swell', every: [5, 11], gain: 0.03, pan: [-0.6, 0.6], param: 'crowd' },
      { make: clap, every: [9, 20], gain: 0.045, pan: [-0.7, 0.7] },
      { make: squeakFar, every: [6, 15], gain: 0.05, pan: [-0.7, 0.7] },
      TENSION_SPOT,
    ],
  },
  // The state-final arena: a bigger, darker room, a deeper murmur and longer swells.
  arena: {
    beds: [
      { type: 'lowpass', freq: 320, q: 0.5, gain: 0.025, lfo: { rate: 0.05, depth: 0.45 }, param: 'crowd', range: [0.55, 1.5] },
      { type: 'bandpass', freq: 760, q: 0.6, gain: 0.015, pan: -0.35, lfo: { rate: 0.08, depth: 0.6 }, flfo: { rate: 0.04, depth: 180 }, param: 'crowd', range: [0.25, 1.7] },
      { type: 'bandpass', freq: 1250, q: 0.8, gain: 0.01, pan: 0.35, lfo: { rate: 0.065, depth: 0.7 }, flfo: { rate: 0.03, depth: 240 }, param: 'crowd', range: [0.15, 1.8] },
      { type: 'lowpass', freq: 110, q: 0.6, gain: 0.018 },
      ...TENSION_BEDS,
    ],
    spots: [
      { make: 'swell', every: [6, 13], gain: 0.034, pan: [-0.6, 0.6], param: 'crowd' },
      { make: clap, every: [8, 18], gain: 0.045, pan: [-0.7, 0.7] },
      { make: squeakFar, every: [9, 20], gain: 0.045, pan: [-0.7, 0.7] },
      TENSION_SPOT,
    ],
  },
};
// The noise buffer the one-shots read from, one per context (live or offline).
const noiseCache = new WeakMap();
AU.noiseFor = (ctx) => { let b = noiseCache.get(ctx); if (!b) { b = noiseBuffer(ctx); noiseCache.set(ctx, b); } return b; };

// ---------------------------------------------------------------- cues
// Each cue is a function (t, o) that builds nodes on the context `ctx` into `D` (the master, or a panner in front of
// it). Every play gets its own jitter J: pitch +/- cents, gain down by up to a couple of dB, and a different place in
// the noise buffer, so no two repeats are sample-identical. o = { pan, v (variant), p (0..1 state), big, mine, hard, far }.
// Per-cue level trims, measured so each gameplay cue peaks between 0.2 and 0.45 at Medium volume
// even at the quietest jitter draw (the jitter takes up to 1.5 dB off).
const TRIM = { fake: 1.6, sprint: 2.3, tick: 0.9, streak: 1.3, swish: 1.2, floor: 1.15, rim: 1.15, whistle: 1.1, cheer: 1.2, groan: 5.4, ooh: 5.3, sigh: 4.0, block: 0.74, release: 1.82, pass: 1.32, catch: 1.15, jump: 2.5, sub: 1.63 };
const JIT = { default: [20, 1.5], click: [8, 0.6], whistle: [18, 1.2], buzzer: [6, 0.6], meter: [4, 0.4], win: [6, 0.8] };

export function makeCues(ctx, master, kit) {
  const nb = AU.noiseFor(ctx);
  let D = master, J = { f: 1, g: 1, o: 0 };
  const env = (g, t, a, peak, dec) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); };
  const osc = (type, f, t, dur, peak, f2, a = 0.005) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f * J.f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2 * J.f, t + dur);
    env(g, t, a, peak * J.g, dur); o.connect(g); g.connect(D); o.start(t); o.stop(t + dur + 0.05);
    return o;
  };
  const nz = (t, dur, peak, type, freq, q = 1, f2, a = 0.01) => {
    const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq * J.f, t); if (f2) f.frequency.exponentialRampToValueAtTime(f2 * J.f, t + dur); f.Q.value = q;
    const g = ctx.createGain(); env(g, t, a, peak * J.g, dur);
    s.connect(f); f.connect(g); g.connect(D); s.start(t, J.o); s.stop(t + a + dur + 0.1);
  };
  // A sung vowel for the crowd's voice: a sawtooth pair at f0 (gliding to f1) through two band-pass formants.
  const vowel = (t, dur, peak, f0, f1, F1, F2, a = 0.12) => {
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak * J.g, t + a); g.gain.linearRampToValueAtTime(0.0001, t + dur); g.connect(D);
    for (const F of [F1, F2]) {
      const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = F; f.Q.value = 5; f.connect(g);
      for (const det of [-14, 11]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = det; o.frequency.setValueAtTime(f0 * J.f, t); o.frequency.linearRampToValueAtTime(f1 * J.f, t + dur); o.connect(f); o.start(t); o.stop(t + dur + 0.05); }
    }
  };
  const C = {
    // Ball and floor: a transient plus a body. `far` (not the player you steer) is quieter.
    bounce(t) { osc('sine', 150, t, 0.09, 0.55, 55); nz(t, 0.03, 0.16, 'highpass', 2600, 0.8); },
    floor(t) { osc('sine', 110, t, 0.09, 0.4, 50); nz(t, 0.025, 0.1, 'bandpass', 900, 1); },
    swish(t, o) { const p = o.p || 0; nz(t, 0.28, 0.5, 'bandpass', 3200 * (1 + 0.1 * p), 0.8); nz(t + 0.05, 0.2, 0.22, 'highpass', 5000); osc('sine', 1760 * (1 + 0.12 * p), t + 0.02, 0.07, 0.05); },
    rim(t, o) {   // three rings: front iron, back iron, and a flat side clank
      const v = o.v || 0, f = [640, 540, 760][v] || 640, hard = o.hard ? 1.45 : 1;
      osc('triangle', f, t, 0.22, 0.34 * hard); osc('square', f * (v === 2 ? 1.63 : 1.46), t, 0.12, 0.08);
      if (v === 1) osc('sine', f * 0.5, t, 0.3, 0.22 * hard, f * 0.45);
      nz(t, 0.05, 0.14, 'bandpass', 2300, 1);
    },
    whistle(t) {
      const o = osc('sine', 2500, t, 0.5, 0.3), l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 28; lg.gain.value = 90; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.55);
      osc('sine', 2535, t, 0.5, 0.12);   // a second pea, a hair apart, so the pair beats
    },
    buzzer(t) { osc('sawtooth', 176, t, 0.9, 0.3); osc('sawtooth', 179, t, 0.9, 0.22); osc('square', 352, t, 0.9, 0.05); },
    cheer(t, o) {   // your basket: wide, bright and long. Theirs: a lower, shorter, politer murmur
      const big = o.big, mine = o.mine !== false;
      if (mine) { nz(t, big ? 1.6 : 1.0, big ? 0.55 : 0.36, 'lowpass', 1100, 0.6); nz(t + 0.1, 0.8, 0.14, 'bandpass', 2400, 2); vowel(t, big ? 1.4 : 0.9, big ? 0.09 : 0.06, 210, 250, 800, 1200); }
      else { nz(t, 0.7, 0.2, 'lowpass', 700, 0.7); vowel(t + 0.05, 0.6, 0.035, 170, 130, 600, 1000); }
    },
    groan(t) { nz(t, 0.6, 0.22, 'lowpass', 500, 0.7); vowel(t, 0.7, 0.045, 150, 105, 600, 1000, 0.1); },
    ooh(t) { vowel(t, 0.9, 0.08, 190, 250, 330, 880, 0.25); nz(t, 0.7, 0.12, 'lowpass', 700, 0.7, undefined, 0.2); },   // a near miss
    sigh(t) { vowel(t, 0.8, 0.07, 240, 150, 700, 1100, 0.08); nz(t, 0.8, 0.14, 'lowpass', 900, 0.6, 450, 0.08); },       // it rimmed out
    roar(t) { nz(t, 1.8, 0.5, 'lowpass', 1300, 0.5, undefined, 0.4); nz(t + 0.2, 1.3, 0.14, 'bandpass', 2300, 1.5, undefined, 0.3); vowel(t, 1.6, 0.09, 200, 240, 800, 1250, 0.4); },
    squeak(t) { osc('sine', 2300, t, 0.07, 0.12, 3100); },
    click(t) { osc('square', 900, t, 0.03, 0.09); },
    steal(t) { osc('triangle', 520, t, 0.09, 0.38, 1040); nz(t, 0.05, 0.3, 'bandpass', 3000, 1.2); osc('sine', 130, t, 0.1, 0.3, 70); },
    block(t) { osc('sine', 90, t, 0.2, 0.7, 40); nz(t, 0.1, 0.45, 'lowpass', 800); nz(t, 0.04, 0.2, 'highpass', 2500); },
    // The user's own verbs
    release(t, o) { nz(t, 0.11, 0.32, 'bandpass', 1500, 1.4, o.three ? 3800 : 3000); osc('sine', 330, t + 0.02, 0.1, 0.22, 220); },
    pass(t) { nz(t, 0.06, 0.4, 'bandpass', 1900, 1.2, 1100); osc('sine', 420, t, 0.08, 0.3, 240); },
    catch(t) { nz(t, 0.05, 0.4, 'lowpass', 1400, 0.9); osc('sine', 190, t, 0.07, 0.4, 90); },
    jump(t) { osc('sine', 210, t, 0.12, 0.2, 130); nz(t, 0.14, 0.2, 'lowpass', 600, 0.8); },
    reb(t) { nz(t, 0.07, 0.5, 'lowpass', 1300, 0.9); osc('sine', 170, t, 0.09, 0.5, 80); osc('sine', 2500, t + 0.02, 0.05, 0.1, 3100); },
    sub(t) { osc('sine', 740, t, 0.16, 0.22); osc('sine', 988, t + 0.14, 0.2, 0.22); },
    // Low time: the shot clock ticks in its last five seconds (p 0..1 rises as it runs down), and the Hot Streak rises with its multiplier.
    tick(t, o) { const p = o.p || 0; osc('square', 1500 + 600 * p, t, 0.04, 0.3); osc('sine', 760 * (1 + 0.35 * p), t, 0.07, 0.4); nz(t, 0.02, 0.2, 'highpass', 3200); },
    streak(t, o) { const p = o.p || 0, base = 392 * (1 + 0.5 * p); nz(t, 0.55, 0.3, 'bandpass', 500 + 400 * p, 1.2, 3600); [0, 4, 7].forEach((st, k) => osc('triangle', base * 2 ** (st / 12), t + 0.08 * k, 0.3, 0.3)); },
    // Move set: a pump fake whips the air, a crossover squeaks and slaps the floor, sprint scuffs off the mark.
    fake(t) { nz(t, 0.09, 0.4, 'bandpass', 1300, 1.3, 2600); osc('sine', 300, t, 0.07, 0.2, 520); },
    cross(t) { osc('sine', 2100, t, 0.06, 0.1, 3000); osc('sine', 140, t + 0.03, 0.09, 0.5, 60); nz(t + 0.03, 0.03, 0.2, 'highpass', 2600); },
    sprint(t) { nz(t, 0.16, 0.34, 'bandpass', 1800, 1.1, 900); osc('sine', 2500, t + 0.02, 0.05, 0.08, 2900); },
    meter(t, o) { const p = o.p || 0; osc('sine', 880 + 880 * p, t, 0.05, 0.14); },
    jingle(t) { [523, 659, 784, 1047].forEach((f, k) => osc('triangle', f, t + k * 0.11, 0.22, 0.3)); },
    win(t) { [523, 659, 784, 1047, 1319].forEach((f, k) => osc('triangle', f, t + k * 0.13, 0.35, 0.34)); },
  };
  return {
    names: Object.keys(C),
    // Builds one cue now (or at time t) with its own jitter and an optional pan, no rate limit: the live play() and the offline tests both go through here.
    trigger(name, o = {}, t = ctx.currentTime) {
      if (!C[name]) return false;
      const [cents, db] = JIT[name] || JIT.default;
      J = kit ? kit.jit(cents, db) : { f: 1, g: 1, o: 0 };
      J.g *= TRIM[name] || 1;
      if (o.far) J.g *= o.far === true ? 0.4 : o.far; // not the player you steer: quieter
      let pn = null;
      if (o.pan && ctx.createStereoPanner) { pn = ctx.createStereoPanner(); pn.pan.value = Math.max(-0.7, Math.min(0.7, o.pan)); pn.connect(master); D = pn; } else D = master;
      try { C[name](t, o); } finally { D = master; }
      return true;
    },
  };
}

// ---------------------------------------------------------------- live audio
export function unlock() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    const ctx = new C();
    AU.master = ctx.createGain(); AU.master.gain.value = AU.vol * MASTER_GAIN; AU.master.connect(limiter(ctx, ctx.destination));
    AU.kit = makeAudioKit(ctx, AU.master, { music: MUSIC_LEVEL, ambience: AMB_LEVEL });
    AU.kit.amb.set('tension', 0, 0.01); AU.kit.amb.set('beat', 0, 0.01);
    AU.cues = makeCues(ctx, AU.master, AU.kit);
    AU.noise = AU.noiseFor(ctx);
    AU.ctx = ctx;
    AU.kit.start();
    applyBeds();
  } catch (e) { AU.ctx = null; AU.kit = null; AU.cues = null; }
}
// Called when the page is hidden or loses focus; unlock() resumes it on the next gesture.
export function suspendAudio() { try { if (AU.ctx && AU.ctx.state === 'running') AU.ctx.suspend().catch(() => {}); } catch (e) { /* no audio */ } }
export function setVolume(v) { AU.vol = v; if (AU.master) AU.master.gain.value = v * MASTER_GAIN; }
export function setOn(on) { AU.on = on; applyBeds(); }
export function setAmbience(on) { AU.ambOn = on; applyBeds(); }
export function setMusic(on) { AU.musOn = on; applyBeds(); }

// Which bed should be sounding: the scene asked for, if Sound and Ambience are both on. While the pause card is up (or
// Sound is off) the kit is held: it fades out and schedules nothing until released.
function applyBeds() {
  const kit = AU.kit;
  if (!kit) return;
  const want = AU.on && AU.ambOn && AU.scene && SCENES[AU.scene] ? SCENES[AU.scene] : null;
  if (want) kit.amb.play(want, { fade: 2.5 }); else if (kit.amb.scene) kit.amb.stop(1.2);
  const tune = AU.on && AU.musOn && AU.music && SCORES[AU.music] ? SCORES[AU.music] : null;
  if (tune) kit.music.play(tune, { fade: 1.8 }); else if (kit.music.score) kit.music.stop(1.2);
  const hold = !AU.on || AU.paused;
  if (hold && !kit.held) kit.hold(); else if (!hold && kit.held) kit.release();
}
// 'gym' | 'arena' | '' (no bed). Called as scenes change.
export function setScene(name) { if (AU.scene === name) return; AU.scene = name; applyBeds(); }
// A piece from music.js by name, or '' for none: the title and menus, a quarter break and the final screens have a tune; live play does not.
export function setMusicTrack(name) { if (AU.music === name) return; AU.music = name; applyBeds(); }
export function setPaused(p) { if (AU.paused === !!p) return; AU.paused = !!p; applyBeds(); }
// 0..1 crowd excitement, throttled to ten updates a second of audio time.
export function setCrowd(v) {
  const kit = AU.kit; if (!kit || !AU.ctx) return;
  const now = AU.ctx.currentTime;
  if (AU.crowdAt != null && now - AU.crowdAt < 0.1) return;
  AU.crowdAt = now; AU.crowd = v; kit.amb.set('crowd', Math.max(0, Math.min(1, v)), 0.35);
}
// 0..1 tension (last minute of a close game, a Hot Streak): lifts the hum under the crowd; from 0.5 up the heartbeat starts.
export function setTension(v) {
  const kit = AU.kit; if (!kit || !AU.ctx) return;
  v = Math.max(0, Math.min(1, v));
  if (Math.abs(v - AU.tension) < 0.02 && (v === 0) === (AU.tension === 0)) return;
  AU.tension = v; kit.amb.set('tension', v, 0.8); kit.amb.set('beat', v >= 0.5 ? 1 : 0, 0.1);
}
// A big cue (whistle, buzzer, fanfare) pulls the crowd bed and the music down a little for its length.
export function duck(db = 5, ms = 600) { if (AU.kit && AU.kit.amb) { AU.kit.amb.duck(db, ms); AU.kit.music.duck(db, ms); } }

// Rate-limited play by name.
const GAPS = { sprint: 0.6, fake: 0.3, cross: 0.3, bounce: 0.07, squeak: 0.4, catch: 0.06, meter: 0.04, ooh: 0.6, sigh: 0.6, roar: 1.5, groan: 0.5, cheer: 0.25 };
export function play(name, o = {}) {
  if (!AU.on || !AU.ctx || AU.ctx.state !== 'running' || !AU.cues) return;
  const now = AU.ctx.currentTime;
  AU.count[name] = (AU.count[name] || 0) + 1; // requests, for the tests: counted before the rate limit
  const gap = GAPS[name] ?? 0.03;
  if (AU.last[name] && now - AU.last[name] < gap) return;
  AU.last[name] = now;
  try { AU.cues.trigger(name, o, now); } catch (e) { /* audio is optional */ }
}

// ---------------------------------------------------------------- offline renders (test hooks and the owner's WAV previews)
export function audioList() { return { music: Object.keys(SCORES), ambience: Object.keys(SCENES), cues: ['bounce', 'floor', 'swish', 'rim', 'whistle', 'buzzer', 'cheer', 'groan', 'ooh', 'sigh', 'roar', 'steal', 'block', 'release', 'pass', 'catch', 'jump', 'reb', 'sub', 'meter', 'squeak', 'click', 'win', 'tick', 'streak', 'fake', 'cross', 'sprint'] }; }
// Renders a piece by itself at the level the game ships (Medium volume), without touching the live audio or settings.
// `name` is a music piece, an ambience scene, or 'cue:<name>' for one cue. `opt`: { crowd (0..1), tension (0..1, a scene's low hum; the heartbeat comes on from 0.5), cue (options for the cue), vol, seed (changes the jitter and the melody), mixCue (a cue to fire at 1 s on top), music (a piece to play under a scene or cue) }.
// For a piece, `built` is the kit's variation count plus its tempo and the seconds before it repeats.
export function audioRender(name, seconds = 30, wantWav = false, opt = {}) {
  const isCue = String(name).startsWith('cue:'), id = isCue ? name.slice(4) : name, isMusic = !isCue && !!SCORES[id];
  if (isCue ? !audioList().cues.includes(id) : !isMusic && !SCENES[id]) return Promise.reject(new Error('unknown audio: ' + name));
  if (opt.music && !SCORES[opt.music]) return Promise.reject(new Error('unknown music: ' + opt.music));
  return measureAudio((oc, dest) => {
    const master = oc.createGain(); master.gain.value = (opt.vol ?? 0.5) * MASTER_GAIN; master.connect(limiter(oc, dest));
    const kit = makeAudioKit(oc, master, { seed: opt.seed ?? 11, music: MUSIC_LEVEL, ambience: AMB_LEVEL });
    const under = isMusic ? id : opt.music;
    if (under) kit.music.play(SCORES[under], { at: 0, fade: 0.5 });
    if (isCue) { makeCues(oc, master, kit).trigger(id, opt.cue || {}, 0.05); if (under) kit.scheduleUntil(seconds); return null; }
    if (!isMusic) {
      kit.amb.set('crowd', opt.crowd ?? 0.5, 0.01); kit.amb.set('tension', opt.tension ?? 0, 0.01); kit.amb.set('beat', (opt.tension ?? 0) >= 0.5 ? 1 : 0, 0.01);
      kit.amb.play(SCENES[id], { at: 0, fade: 0.5 });
    }
    if (opt.mixCue) makeCues(oc, master, kit).trigger(opt.mixCue, opt.cue || {}, 1);
    kit.scheduleUntil(seconds);
    return isMusic ? () => { const sc = SCORES[id], info = kit.music.info(); return { ...info, bpm: sc.bpm, formSeconds: +(info.formBars * (sc.beats || 4) * 60 / sc.bpm).toFixed(1) }; } : null;
  }, seconds, { wav: wantWav });
}
