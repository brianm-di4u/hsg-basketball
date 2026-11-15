import { stepUntil } from './helpers.mjs';

// Wave 3, batch E: feedback, teaching and help (S2-02 the pass receiver marker, S4-03 the PA line, S4-24 WebGL warnings).

const shot = (t, name) => t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/${name}-${t.viewport}.png` });
const exhibition = async (t, o = {}) => {
  await t.seed(o.seed ?? 7);
  await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1, paused: true, ...o });
  await t.waitForStable();
  return t.state();
};
const passTo = async (t) => (await t.state()).hud.passTo;


// A basket by this player from beside his rim, the defence out of the way. The shot is the sim's own (it can still miss), so it tries again until one drops.
async function scoreFor(t, team, slot) {
  for (let attempt = 0; attempt < 8; attempt++) {
    await stepUntil(t, (x) => !['shot', 'net'].includes(x.match.ball.state), 300, 10, 'the last shot to be over');
    const before = (await t.state()).match.score;
    await t.game('act', 'give', team, slot);
    await t.game('act', 'place', team, slot, team ? 9.4 : 84.6, 25);
    for (let k = 0; k < 5; k++) await t.game('act', 'place', 1 - team, k, 47 + (k - 2) * 6, k % 2 ? 4 : 46);
    await t.game('step', 1);
    await t.game('act', 'shootAt', 1);
    for (let k = 0; k < 12; k++) {
      await t.game('step', 15);
      const s = await t.state();
      if (s.match.score[0] + s.match.score[1] > before[0] + before[1]) return s;
    }
  }
  t.fail('no basket in eight tries');
  return t.state();
}

export const tests = [];

// ---------------------------------------------------------------- S2-02 the pass receiver marker
tests.push({
  name: 'S2-02: the teammate a pass would reach is marked, follows the stick, and the mark is gone when you shoot, defend or have no ball',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t);
    // the ball handler at mid-court; one teammate straight ahead, one straight behind, the rest out of the line
    const lay = async () => {
      await t.game('act', 'give', 0, 2);
      await t.game('act', 'place', 0, 2, 47, 25);
      await t.game('act', 'place', 0, 0, 62, 25);
      await t.game('act', 'place', 0, 1, 32, 25);
      await t.game('act', 'place', 0, 3, 47, 6);
      await t.game('act', 'place', 0, 4, 47, 44);
      for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 20 + s * 14, s % 2 ? 2 : 48);
    };
    await lay();
    // a phone draws the court upright, and the stick is turned to match: say "toward the basket" in the screen's terms
    const vd = (await t.state()).hud.vertical;
    const toward = (k) => (vd ? { mx: 0, mz: -k / vd } : { mx: k, mz: 0 });
    await t.game('act', 'input', toward(1));
    await t.game('step', 1);
    t.equal(await passTo(t), 0, 'stick toward the basket they attack: the teammate ahead is marked');
    await t.game('act', 'input', toward(-1));
    await t.game('step', 1);
    t.equal(await passTo(t), 1, 'stick the other way: the mark moves to the teammate behind');
    await t.game('act', 'input', { mx: 0, mz: 0 });
    await t.game('step', 1);
    const open = await passTo(t);
    t.expect(open != null && open !== 2 && open < 5, `with the stick at rest a teammate is still marked (${open})`);
    // the mark is the very player the pass goes to
    await t.game('act', 'input', toward(1));
    await t.game('step', 1);
    await shot(t, 'S2-02-pass-marker');
    await t.game('act', 'input', { ...toward(1), pass: true });
    await t.game('step', 1);
    const s = await t.state();
    t.equal(s.match.ball.state, 'pass', 'the pass was thrown');
    await t.game('step', 40);
    t.equal((await t.state()).match.ball.holder, 0, 'and the marked teammate caught it');
    // a defender, or a man who has no ball, has no mark
    await t.game('act', 'input', { mx: 0, mz: 0 });
    await t.game('act', 'give', 1, 2);
    await t.game('step', 1);
    t.equal(await passTo(t), null, 'on defence there is no mark');
    await lay();
    await t.game('act', 'input', { mx: 0, mz: 0, shoot: true });
    await t.game('step', 3);
    t.equal(await passTo(t), null, 'once the shot has started there is no mark');
    await t.game('act', 'input', { shoot: false });
  },
});

// ---------------------------------------------------------------- S4-03 the PA line
tests.push({
  name: 'S4-03: the game opens with a welcome and the two starting fives, then says who takes the lead, and clears when the game is paused',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    const s0 = await exhibition(t);
    t.equal(s0.pa, null, 'nothing is said before the game starts');
    await t.game('step', 2);
    let s = await t.state();
    t.expect(s.pa && /^Welcome to Trojan Arena$/.test(s.pa.kicker), `the welcome names the home gym (${s.pa && s.pa.kicker})`);
    const lines = s.pa.text.split('\n');
    t.equal(lines.length, 2, 'one line for each team');
    const lasts = (team) => s.match.players.filter((p) => p.t === team && p.slot < 5).map((p) => p.name.split(' ').slice(1).join(' '));
    t.expect(lasts(1).every((n) => lines[0].includes(n)) && lines[0].startsWith('Lakeside'), `the visitors' five: ${lines[0]}`);
    t.expect(lasts(0).every((n) => lines[1].includes(n)) && lines[1].startsWith('Hot Springs'), `the home five: ${lines[1]}`);
    await shot(t, 'S4-03-starting-fives');
    // it never takes the screen's input: the stage under it still gets the click
    t.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('#pa')).pointerEvents), 'none', 'it ignores taps and clicks');
    const box = await t.page.evaluate(() => { const r = document.querySelector('#pa').getBoundingClientRect(); const sb = document.querySelector('#sb').getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom, sbB: sb.bottom, W: innerWidth }; });
    t.expect(box.l >= 0 && box.r <= box.W, `it fits the width (${Math.round(box.l)} to ${Math.round(box.r)} of ${box.W})`);
    // it goes by itself (a basket may say something new first, so wait for no welcome)
    await stepUntil(t, (x) => !x.pa || !/^Welcome/.test(x.pa.kicker), 600, 30, 'the welcome to clear');
    // baskets: first score, then the tie, then the lead (shots from beside the rim)
    const score = (team, slot) => scoreFor(t, team, slot);
    s = await score(0, 4);
    t.expect(s.pa && /^Hot Springs scores first\.$/.test(s.pa.text), `the first basket (${s.pa && s.pa.text})`);
    s = await score(1, 4);
    t.expect(s.pa && /^Tie game, (\d+)-\1\.$/.test(s.pa.text), `an equalising basket (${s.pa && s.pa.text})`);
    s = await score(1, 3);
    t.expect(s.pa && /^Lakeside takes the lead, \d+-\d+\.$/.test(s.pa.text), `a change of lead (${s.pa && s.pa.text})`);
    // it clears when the game is paused
    await t.game('scene', 'pause');
    t.equal((await t.state()).pa, null, 'a paused game shows no PA line');
  },
});

tests.push({
  name: 'S4-03: an 8-0 run is called, once, and the next basket does not repeat it',
  viewports: ['desktop'],
  async run(t) {
    await exhibition(t);
    await t.game('step', 2);
    const score = (team, slot) => scoreFor(t, team, slot);
    let s;
    const said = [];
    for (let k = 0; k < 5; k++) { s = await score(0, 4); if (s.pa && s.pa.text !== said[said.length - 1]) said.push(s.pa.text); }
    const runs = said.filter((x) => / on an? \d+-0 run\.$/.test(x));
    t.equal(runs.length, 1, `five baskets in a row bring one call of a run (${said.join(' | ')})`);
    t.expect(/^Hot Springs on (an 8|a 9|a 10|an 11)-0 run\.$/.test(runs[0] || ''), `it names the team and the run (${runs[0]})`);
  },
});

// ---------------------------------------------------------------- S4-24 WebGL warnings
tests.push({
  name: 'S4-24: starting a 3D game, a rematch and the state arena draw with no WebGL draw-call warnings and no uninitialised kit-shader variable',
  viewports: ['desktop'],
  async run(t) {
    const bad = [];
    t.page.on('console', (m) => { const x = m.text(); if (m.type() !== 'log' && /GL_INVALID|uninitialized variable|WebGL: INVALID/.test(x)) bad.push(x.slice(0, 160)); });
    await t.reload(); // the 3D scene starts again, with the listener already in place
    await exhibition(t);
    await t.game('resume');
    await t.page.waitForFunction(() => window.__game.getState().gfx.frames > 90, null, { timeout: 30000 });
    const g = (await t.state()).gfx;
    t.equal(g.mode, '3d', 'the 3D court is up (a 2D fallback would pass this test for nothing)');
    await t.game('scene', 'title');
    await t.game('newGame', { mode: 'challenge', challenge: 'double-crown', program: 'boys', paused: true });
    await t.game('resume');
    const f0 = (await t.state()).gfx.frames;
    await t.page.waitForFunction((n) => window.__game.getState().gfx.frames > n + 60, f0, { timeout: 30000 });
    t.equal(bad.length, 0, `no draw call was refused and no kit shader leaves a variable unset (${bad.length}: ${bad[0] || ''})`);
  },
});
