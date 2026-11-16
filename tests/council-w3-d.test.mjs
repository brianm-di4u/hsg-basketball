import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { click, waitFor } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Wave 3, batch D: difficulty, progression and records, and feedback, teaching and help.

const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};
const shot = (t, name) => t.shot(name, { wait: false, allowBlank: true }); // saved in the repo's own screenshots folder, by viewport (C4-07)
const exhibition = async (t, o = {}) => {
  await t.seed(o.seed ?? 7);
  await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', qLen: 120, shotClock: 35, difficulty: 1, paused: true, ...o });
  await t.waitForStable();
  return t.state();
};

export const tests = [];

// ---------------------------------------------------------------- S3-11 the balance tool
tests.push({
  name: 'S3-11: tools/balance.mjs --diff reports every tier at three skills, the tier ladder and each Banner Challenge, and keeps its old mode (node)',
  node: true,
  async run(t) {
    const run = (...a) => spawnSync(process.execPath, [path.join(game, 'tools/balance.mjs'), ...a], { cwd: game, encoding: 'utf8', timeout: 240000 });
    const sweep = run('--diff', '1', '60'); // one game a cell: this checks the report, not the numbers (the bands need dozens of games)
    const out = sweep.stdout;
    for (const skill of ['sharp', 'steady', 'casual']) for (const tier of ['Rookie', 'Varsity', 'All-State']) t.expect(new RegExp(`${skill}\\s+${tier}\\s+win\\s+\\d+%`).test(out), `a row for ${skill} on ${tier}`);
    t.equal((out.match(/mean margin Rookie/g) || []).length, 3, 'the tier ladder is reported for each skill');
    const { CHALLENGES } = await load('challenges.js');
    const finals = CHALLENGES.reduce((n, c) => n + c.steps.reduce((m, s) => m + (s.program ? 1 : (c.programs || [c.program]).length), 0), 0);
    t.equal((out.match(/^ {2}\S.* win\s+\d+%/gm) || []).length, finals, `a row for each final of each Banner Challenge (${finals})`);
    t.expect(/target \d+-\d+%/.test(out), 'the targets are printed beside the numbers');
    t.expect(sweep.status === 0 || /missed:/.test(out), 'it exits 0, or says which targets it missed and exits 1');
    const plain = run('3', '30');
    t.expect(plain.status === 0 && /home wins \d+\/3/.test(plain.stdout), 'without --diff it is the sanity check it was');
    const src = fs.readFileSync(path.join(game, 'tools/balance.mjs'), 'utf8');
    t.expect(/ladder: [\d.]+/.test(src) && /challenge: \[\d+, \d+\]/.test(src), 'the targets are named constants in the file');
  },
});

// ---------------------------------------------------------------- S2-06 shot clock label
tests.push({
  name: 'S2-06: the shot clock on the scoreboard says SHOT, and turns red for its last five seconds',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t);
    const sb = () => t.page.evaluate(() => { const e = document.querySelector('.sb-shot'); return e ? { text: e.innerText.replace(/\s+/g, ' ').trim(), low: e.classList.contains('low'), color: getComputedStyle(e).color } : null; });
    await t.game('setState', { match: { shot: 20 } });
    let s = await sb();
    t.expect(s && /^SHOT \d+$/.test(s.text), `the number carries its label (${s && s.text})`);
    t.expect(!s.low, 'it is not red with twenty seconds left');
    const calm = s.color;
    await t.game('setState', { match: { shot: 4.2 } });
    s = await sb();
    t.expect(s.low && s.text === 'SHOT 5', `at 4.2 s it reads SHOT 5 and is marked low (${s.text})`);
    t.expect(s.color !== calm, `and its colour changes (${calm} to ${s.color})`);
    await t.game('setState', { match: { shot: 5.5 } });
    t.expect(!(await sb()).low, 'above five seconds it is not low');
    await t.checkLayout();
    await t.game('setState', { match: { shot: 3 } });
    await shot(t, 'S2-06-shot-clock-low');
    await exhibition(t, { shotClock: 0 });
    const bar = await t.page.innerText('#sb');
    t.expect(/CLASSIC/.test(bar) && !/SHOT/.test(bar), 'with the clock off the scoreboard says CLASSIC, with no label');
  },
});

// ---------------------------------------------------------------- S4-07 Hot Streak: steam
// The Hot Streak clock moves and a few frames are drawn after it: only then does "no steam" mean something.
async function alive(t) {
  const t0 = (await t.state()).shootout.t;
  await waitFor(t, (x) => x.shootout.t !== t0, 6000, 'the Hot Streak loop to run');
  await t.waitFrames(10);
}
tests.push({
  name: 'S4-07: the Hot Streak scoreboard calls the gauge STEAM, as the setup page does, and steam rises and the stands lift as it fills',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(3);
    await click(t, 'shootoutSetup');
    t.expect(/steam gauge/.test(await t.page.innerText('#screen')), 'the setup page promises a steam gauge');
    await click(t, 'startShootout');
    await waitFor(t, (s) => s.scene === 'shootout', 6000, 'the Hot Streak scene');
    const hud = () => t.page.evaluate(() => ({ text: document.querySelector('#sb .sb-steam').innerText, gauge: document.querySelector('#sb .gauge').getAttribute('aria-label') }));
    const h = await hud();
    t.expect(/STEAM/.test(h.text) && !/STREAK/.test(h.text), `the scoreboard says STEAM, not STREAK (${h.text.replace(/\s+/g, ' ')})`);
    t.equal(h.gauge, 'Steam gauge, 0 of 6 makes in a row', 'and the gauge is named for a screen reader');
    await t.game('setState', { shootout: { phase: 'live', streak: 0, mult: 1 } });
    await alive(t); // a positive sign the Hot Streak loop is running before something is said to be absent (C4-08)
    let s0 = await t.state();
    t.expect(s0.steam === 0 && s0.ventBoost === 0, 'with an empty gauge there is no extra steam');
    await t.game('setState', { shootout: { phase: 'live', streak: 3, mult: 2 } });
    const s = await waitFor(t, (x) => x.steam > 0 || x.ventBoost > 0, 6000, 'the steam answering the gauge');
    const three = s.gfx.mode === '3d' ? s.ventBoost : s.steam;
    t.expect(three > 0, `steam answers the gauge (${s.gfx.mode}: ${s.gfx.mode === '3d' ? 'vents at ' + s.ventBoost : s.steam + ' puffs'})`);
    await t.game('setState', { shootout: { phase: 'live', streak: 6, mult: 3 } });
    const full = await waitFor(t, (x) => x.gfx.mode !== '3d' || x.ventBoost > 0.9, 6000, 'a full gauge');
    if (full.gfx.mode === '3d') t.expect(full.ventBoost > three, `a fuller gauge swells the vents more (${three.toFixed(2)} to ${full.ventBoost.toFixed(2)})`);
    const c = await waitFor(t, (x) => x.shootCheer >= 0.4, 4000, 'the stands lifting');
    t.expect(c.shootCheer >= 0.4, 'and the stands lift with it');
    await shot(t, 'S4-07-hot-streak-steam');
  },
});
tests.push({
  name: 'S4-07: with reduced motion asked for there is no steam, but the gauge still says STEAM',
  reducedMotion: true,
  viewports: ['desktop'],
  async run(t) {
    await t.seed(3);
    await t.game('scene', 'shootout');
    await t.game('setState', { shootout: { phase: 'live', streak: 5, mult: 2 } });
    await alive(t);
    const s = await t.state();
    t.expect(s.steam === 0 && s.ventBoost === 0, 'no steam particles and no swelling vents under reduced motion');
    t.expect(/STEAM/.test(await t.page.innerText('#sb')), 'the label is still STEAM');
  },
});

// ---------------------------------------------------------------- S4-04 fact cards by moment and school
tests.push({
  name: 'S4-04: a fact card about a school comes up only in a game with that school; general cards come up anywhere (node)',
  node: true,
  async run(t) {
    const U = await load('ui.js'), D = await load('data.js');
    const facts = D.FACTS_LIST;
    t.expect(facts.filter((f) => f.schools).length >= 10 && facts.some((f) => !f.schools), 'the cards are tagged: most name their schools, the shot clock and finals cards are general');
    const keys = new Set(D.COUNTY.map((x) => x.key));
    t.expect(facts.every((f) => !f.schools || (f.schools.length && f.schools.every((k) => keys.has(k)))), 'every tag is a real school key');
    // The pick is a function of the seed, so every seed is tried and the answer is the same every run.
    for (const pair of [['mountain-pine', 'cutter-morning-star'], ['hot-springs', 'lakeside'], ['jessieville', 'lake-hamilton']]) {
      const seen = new Set();
      for (let seed = 0; seed < facts.length * 3; seed++) seen.add(U.pickFact(seed, pair).id);
      for (const id of seen) { const f = facts.find((x) => x.id === id); t.expect(!f.schools || f.schools.some((k) => pair.includes(k)), `${pair.join(' v ')}: card ${id} is general or about one of them`); }
      t.expect(seen.size >= 3, `${pair.join(' v ')} still gets variety (${seen.size} cards)`);
    }
    const mp = new Set(); for (let seed = 0; seed < 42; seed++) mp.add(U.pickFact(seed, ['mountain-pine', 'cutter-morning-star']).id);
    t.expect(!mp.has('hs-0278') && !mp.has('hs-0185'), 'a Mountain Pine game does not get the Hot Springs colours or the 1912 card');
    const hs = new Set(); for (let seed = 0; seed < 42; seed++) hs.add(U.pickFact(seed, ['hot-springs', 'lakeside']).id);
    t.expect(hs.has('hs-0278') && hs.has('hs-0185'), 'a Hot Springs game does');
    t.equal(U.pickFact(5).id, facts[5 % facts.length].id, 'asked with no schools it still picks from the whole list, as before');
    t.expect(!!U.pickFact(9, ['no-such-school']), 'a school with no cards falls back to the general ones');
  },
});

// ---------------------------------------------------------------- S2-19 teaching difficulty
tests.push({
  name: 'S2-19: each difficulty says what it changes, on the setup screens, in Settings and in Help',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(2);
    await t.game('setState', { settings: { difficulty: 1 } });
    await click(t, 'select');
    const hint = () => t.page.innerText('.diff-hint');
    t.expect(/standard game/i.test(await hint()), `Varsity: ${await hint()}`);
    await click(t, 'setDiff', 0);
    t.expect(/wider shot window.*weaker/.test(await hint()), `Rookie: ${await hint()}`);
    await click(t, 'setDiff', 2);
    t.expect(/narrower shot window.*stronger/.test(await hint()), `All-State: ${await hint()}`);
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S2-19-difficulty-hint');
    await click(t, 'title');
    await click(t, 'seasonSetup');
    t.equal(await t.page.locator('.diff-hint').count(), 1, 'the season setup has it too');
    await click(t, 'title');
    await click(t, 'settings');
    t.equal(await t.page.locator('.diff-hint').count(), 1, 'and Settings');
    await click(t, 'back');
    await click(t, 'help');
    await click(t, 'helpTab', 'play');
    const txt = await t.page.innerText('.tabbody');
    t.expect(/Difficulty/.test(txt) && /Rookie/.test(txt) && /Struggling\? Try Rookie/.test(txt), 'the Playing tab of Help explains the tiers and suggests Rookie');
  },
});

const finishLoss = async (t, difficulty, margin = 30) => {
  await exhibition(t, { difficulty });
  const s0 = await t.state();
  await t.game('setState', { match: { q: 4, t: 1, score: [0, margin] } });
  await t.game('act', 'finishGame', { winner: 1 - s0.match.user.team });
  return waitFor(t, (x) => x.scene === 'final', 8000, 'the final screen');
};
tests.push({
  name: 'S2-19: a heavy loss on Varsity by someone who has never tried Rookie suggests it once, and never after Rookie has been played',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await finishLoss(t, 1);
    t.expect(/Struggling\?/.test(await t.page.innerText('#screen')), 'after a 30-point loss on Varsity the final screen suggests Rookie');
    await shot(t, 'S2-19-struggling-card');
    await t.checkLayout({ allowScrollY: true });
    await click(t, 'title');
    await finishLoss(t, 2);
    t.expect(!/Struggling\?/.test(await t.page.innerText('#screen')), 'a second heavy loss in the same visit does not repeat it');
    await t.page.reload();
    await waitFor(t, (s) => s.scene === 'title', 10000, 'reloaded');
    await finishLoss(t, 1, 8);
    t.expect(!/Struggling\?/.test(await t.page.innerText('#screen')), 'an 8-point loss is not a blow-out');
    // Rookie played: the career record has it, so the suggestion never comes back.
    await exhibition(t, { difficulty: 0 });
    await t.game('setState', { match: { q: 4, t: 1, score: [30, 0] } });
    await t.game('act', 'finishGame', { winner: (await t.state()).match.user.team });
    await waitFor(t, (x) => x.scene === 'final', 8000, 'a Rookie game');
    await t.page.reload();
    await waitFor(t, (s) => s.scene === 'title', 10000, 'reloaded again');
    await finishLoss(t, 1);
    t.expect(!/Struggling\?/.test(await t.page.innerText('#screen')), 'after a Rookie game has been played it is not offered');
  },
});
tests.push({
  name: 'S2-19: a heavy loss on Rookie is not told to try Rookie',
  viewports: ['desktop'],
  async run(t) {
    await finishLoss(t, 0);
    t.expect(!/Struggling\?/.test(await t.page.innerText('#screen')), 'no suggestion on Rookie');
  },
});

// ---------------------------------------------------------------- S3-12 and S4-17 the season hub, the bracket and the final
tests.push({
  name: 'S3-12 and S4-17: the hub shows the opponent rating and threat and what Sim game does, and the bracket says why you are seeded where you are',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(5);
    await click(t, 'seasonSetup');
    await click(t, 'startSeason');
    await waitFor(t, (s) => s.scene === 'hub', 4000, 'the season hub');
    let txt = await t.page.innerText('.card.next');
    t.expect(/Overall \d+ \(yours \d+\) · Threat ▮+▯* (tougher than you|an even match|weaker than you)/.test(txt), `the next-game card shows Ovr and threat (${(txt.match(/Overall[^\n]*/) || [''])[0]})`);
    t.expect(/Sim game rates both rosters and scores a result for you\. It counts toward your record and seed\./.test(txt), 'and a line under the buttons says what Sim game does');
    const label = await t.page.getAttribute('.threat .bars', 'aria-label');
    t.expect(/^[123] of 3: /.test(label), `the bars have a text name (${label})`);
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S3-12-hub-threat');
    for (let k = 0; k < 3; k++) { await t.page.waitForFunction(() => window.__game.isIdle(), null, { timeout: 8000 }); await t.page.waitForTimeout(400); await click(t, 'simSeason'); } // 400 ms: a second click of the same act inside 350 ms is a double click (S6-08)
    const s = await waitFor(t, (x) => x.season && x.season.phase === 'bracket', 6000, 'the bracket phase');
    await t.page.waitForFunction(() => window.__game.isIdle(), null, { timeout: 8000 });
    await click(t, 'bracket');
    txt = await t.page.innerText('#screen');
    const m = txt.match(/Seeded (\d) on a regular-season record of (\d+)-(\d+)\. Your seed follows your record; the other teams are seeded by rating\./);
    t.expect(!!m, `the bracket explains the seed (${(txt.match(/Seeded[^\n]*/) || [''])[0]})`);
    if (m) {
      t.equal(+m[1], s.season.bracket.seeds.indexOf(s.season.school) + 1, 'and it names the seed the bracket really gave');
      t.equal(+m[2] + +m[3], 3, 'from the three regular-season games');
      t.equal(+m[2], s.season.w, 'with the wins the season holds');
    }
    await t.checkLayout({ allowScrollY: true });
    await shot(t, 'S4-17-bracket-seed');
  },
});
tests.push({
  name: 'S3-12: the threat bars compare the two rosters: a 2A school sees a 6A opponent as tougher, a 6A school sees a 2A one as weaker (node)',
  node: true,
  async run(t) {
    const U = await load('ui.js'), D = await load('data.js');
    const six = D.COUNTY.find((x) => x.cls === '6A'), two = D.COUNTY.find((x) => x.cls === '2A');
    const mk = (k) => ({ school: k.key, program: 'boys', cls: k.cls, seed: 1 });
    const up = U.threatOf(mk(two), six.key), down = U.threatOf(mk(six), two.key);
    t.expect(up.theirs > up.mine && up.bars === 3, `${two.short} (2A) against ${six.short} (6A): ${up.mine} against ${up.theirs}, ${up.bars} bars`);
    t.expect(down.theirs < down.mine && down.bars === 1, `${six.short} against ${two.short}: ${down.mine} against ${down.theirs}, ${down.bars} bar`);
    const even = U.threatOf(mk(six), six.key);
    t.expect(even.bars === 2 && even.word === 'an even match', 'a team against itself is an even match');
  },
});
tests.push({
  name: 'S4-17: the bracket line names the seed and the regular-season record it came from (node)',
  node: true,
  async run(t) {
    const U = await load('ui.js');
    const g = (us, them) => ({ result: { us, them } });
    const S = { school: 'me', games: [g(50, 40), g(30, 44), g(41, 60)], bracket: { seeds: ['a', 'b', 'me', 'c'] } };
    const line = U.seedLine(S);
    t.expect(/^Seeded 3 on a regular-season record of 1-2./.test(line), `seed 3 from one win and two losses (${line})`);
    t.expect(/seeded by rating.$/.test(line), 'and it says how the others are seeded');
  },
});

tests.push({
  name: 'S3-12: the final screen of a season game says what it did to the season',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.seed(6);
    await click(t, 'seasonSetup');
    await click(t, 'pickLength', 'full');
    await click(t, 'startSeason');
    await waitFor(t, (s) => s.scene === 'hub', 4000, 'the hub');
    await click(t, 'playSeason');
    await t.game('pause');
    const s0 = await t.state();
    await t.game('setState', { match: { q: 4, t: 1, score: [0, 40] } });
    await t.game('act', 'finishGame', { winner: 1 - s0.match.user.team });
    await waitFor(t, (x) => x.scene === 'final', 8000, 'the final screen');
    const txt = await t.page.innerText('#screen');
    t.expect(/Record now 0-1\. 7 regular-season games left before the state bracket\./.test(txt), `a full season's first game: record and games left (${(txt.match(/Record now[^\n]*/) || [''])[0]})`);
    await shot(t, 'S3-12-final-season');
    await t.checkLayout({ allowScrollY: true });
  },
});

// ---------------------------------------------------------------- S1-13 the meter on the SHOOT button
tests.push({
  name: 'S1-13: while the shot meter rises, a ring around the SHOOT button fills with it and shows the good and perfect zones; it clears on release',
  viewports: ['mobile'],
  async run(t) {
    await exhibition(t);
    const ring = () => t.page.evaluate(() => {
      const e = document.querySelector('#b-shoot'), g = (k) => parseFloat(e.style.getPropertyValue(k));
      return { on: e.classList.contains('metering'), mf: g('--mf'), gs: g('--gs'), ps: g('--ps'), pe: g('--pe'), ge: g('--ge'), op: getComputedStyle(e, '::after').opacity };
    });
    const until = async (pred) => { const end = Date.now() + 6000; let r = await ring(); while (!pred(r) && Date.now() < end) { await t.page.waitForTimeout(40); r = await ring(); } return r; };
    t.expect(!(await ring()).on, 'idle: no ring');
    await t.game('act', 'give', 0, 4);
    await t.game('act', 'input', { shoot: true });
    await t.game('resume');
    const r1 = await until((r) => r.on && r.mf > 20);
    t.expect(r1.on && r1.mf > 20 && r1.op === '1', `the ring shows and fills (fill ${r1.mf} of 360 degrees)`);
    t.expect(r1.gs < r1.ps && r1.ps < r1.pe && r1.pe < r1.ge, `the good zone (${r1.gs} to ${r1.ge}) holds the perfect zone (${r1.ps} to ${r1.pe})`);
    t.expect(Math.abs((r1.ps + r1.pe) / 2 - (0.9 / 1.18) * 360) < 1.5, `centred on the sweet spot, 0.9 of the bar (${((r1.ps + r1.pe) / 2).toFixed(1)} degrees)`);
    await shot(t, 'S1-13-shoot-ring');
    const r2 = await until((r) => !r.on || r.mf > r1.mf + 10);
    t.expect(!r2.on || r2.mf > r1.mf, 'it keeps filling as the meter rises (or the shot has already gone)');
    await t.game('act', 'input', { shoot: false });
    const r3 = await until((r) => !r.on);
    t.expect(!r3.on, 'after release the ring is gone');
  },
});
