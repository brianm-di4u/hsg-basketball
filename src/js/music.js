// The game's music, written as data for the audio kit (see audiokit.js). Nothing here makes a sound by itself.
// Chord roots are scale degrees: 0 = I, 1 = ii, 2 = iii, 3 = IV, 4 = V, 5 = vi. Each piece runs well past 45 seconds
// before it comes round again, and the lead melody is composed once per bar of a section so the A section is
// recognisable each time it returns, with a small variation on every pass.
//
// Where each piece plays (main.js picks the name):
//   pepBand   title, season hub, setup and menu screens: a high-school pep band, tuba and brass over a snare line
//   breakRoom quarter breaks and a lost game: a quieter arrangement, soft piano over brushes and a walking bass
//   fanfare   a win, the champion screen, a new Hot Streak best: a brighter march with a brass lead
// Live play has no tune: the crowd bed and the tension layers carry the room.
export const SCORES = {
  // Bb major, 126 bpm, 32 bars (about 61 s). Tuba on one and three, brass stabs on two and four, snare line.
  pepBand: {
    bpm: 126, key: 58, sevenths: [4], form: 'AABA',
    sections: { A: [0, 3, 0, 4, 0, 3, 4, 0], B: [3, 3, 0, 5, 1, 4, 4, 4] },
    bass: { inst: 'tuba', pattern: 'two', gain: 0.14 }, comp: { inst: 'brass', at: [1, 3], gain: 0.034, len: 0.3 },
    lead: { inst: 'brass', gain: 0.07, vary: 0.25, rest: 0.08, lift: true, oct: 1 },
    perc: { k: [0, 2], s: [1, 3], h: [0.5, 1.5, 2.5, 3.5], gain: 0.45 }, perc2: { s: [3.5], h: [0.25, 1.25, 2.25, 3.25], gain: 0.4 },
    lp: 4800, delay: 0.08, delayBeats: 0.5,
  },
  // G major, 84 bpm, swung, 22 bars (about 63 s). Pad, a walking bass, brushes and a piano that sings the tune quietly.
  breakRoom: {
    bpm: 84, key: 55, swing: 0.18, sevenths: [1, 4], form: 'AABA',
    sections: { A: [0, 5, 1, 4, 0, 3], B: [3, 2, 5, 4] },
    pad: { gain: 0.04 }, bass: { inst: 'bass', pattern: 'walk', gain: 0.13 }, comp: { inst: 'piano', at: [1, 3], gain: 0.03 },
    lead: { inst: 'piano', gain: 0.085, vary: 0.5, rest: 0.1, oct: 1 },
    perc: { b: [1, 3], h: [0.5, 2.5], gain: 0.5 },
    lp: 3800, delay: 0.14, delayBeats: 0.75,
  },
  // F major, 112 bpm, 32 bars (about 69 s). A march: bass and drums on the beat, organ chords, a bright brass tune.
  fanfare: {
    bpm: 112, key: 65, sevenths: [4], form: 'AABA',
    sections: { A: [0, 0, 3, 4, 0, 5, 3, 4], B: [5, 5, 1, 4, 3, 3, 4, 0] },
    bass: { inst: 'tuba', pattern: 'two', gain: 0.13 }, comp: { inst: 'organ', at: [0, 1, 2, 3], gain: 0.03, len: 0.45 },
    lead: { inst: 'brass', gain: 0.07, vary: 0.3, rest: 0.05, lift: true, oct: 1, rhythms: [[0, 3, 4, 6], [0, 2, 4, 6, 7], [0, 4, 6], [0, 3, 4, 7], [0, 2, 3, 4]] },
    perc: { k: [0, 2], s: [1, 3], h: [0.5, 1.5, 2.5, 3.5], gain: 0.5 }, perc2: { s: [3.5, 1.5], h: [0.25, 1.25, 2.25, 3.25], gain: 0.4 },
    lp: 5200, delay: 0.1, delayBeats: 0.5,
  },
};
