// Wave 2 follow-ups after the verifier's pass: the pep band has its own tune, and the cue levels are repeatable.
const render = (t, name, seconds, opt = {}) => t.page.evaluate(([n, s, o]) => window.__game.audioRender(n, s, false, o), [name, seconds, opt]);

export const tests = [
  {
    name: 'S5-01 follow-up: the pep band is not the kit example, nor either other piece, and stays inside the music mix',
    viewports: ['desktop'],
    async run(t) {
      const r = await render(t, 'pepBand', 60);
      t.expect(r.peak >= 0.06 && r.peak <= 0.16 && r.rmsDb >= -40 && r.rmsDb <= -28, `pepBand peak ${r.peak}, RMS ${r.rmsDb} dBFS inside the music limits`);
      t.expect(r.built.formSeconds >= 45 && r.built.distinctBars >= 6 && r.built.pitches >= 6 && r.longestSilence === 0, `it runs ${r.built.formSeconds} s with ${r.built.distinctBars} distinct bars and ${r.built.pitches} pitches`);
      t.expect(r.built.bpm !== 126, 'it is not at the kit example tempo of 126 bpm');
      for (const other of ['breakRoom', 'fanfare']) {
        const q = await render(t, other, 60);
        t.expect(q.built.bpm !== r.built.bpm, `its tempo (${r.built.bpm}) differs from ${other} (${q.built.bpm})`);
        t.expect(Math.abs(q.rmsDb - r.rmsDb) > 0.05 || q.built.notes !== r.built.notes, `it renders differently from ${other}`);
      }
    },
  },
  {
    name: 'S5-04 follow-up: cue levels are repeatable, and the quietest draw of the soft cues stays above 0.205',
    viewports: ['desktop'],
    async run(t) {
      const o = (seed) => ({ seed, cue: { three: true, big: true, mine: true, hard: true, p: 0.6 } });
      const a = await render(t, 'cue:groan', 2, o(5)), b = await render(t, 'cue:groan', 2, o(5));
      t.equal(a.peak, b.peak, 'the same seed gives the same peak (the noise is seeded)');
      for (const c of ['groan', 'ooh', 'sigh', 'sprint', 'fake']) {
        let lo = 9, hi = 0;
        for (let seed = 1; seed <= 40; seed++) { const r = await render(t, 'cue:' + c, 2, o(seed)); lo = Math.min(lo, r.peak); hi = Math.max(hi, r.peak); }
        t.expect(lo >= 0.205 && hi <= 0.45, `${c} over 40 draws peaks ${lo}..${hi} (want 0.205 to 0.45)`);
      }
    },
  },
];
