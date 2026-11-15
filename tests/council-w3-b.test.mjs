import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition, stepUntil, waitFor } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Wave 3, batch B: controls, rules and play; difficulty, progression and records.

const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};
// A seeded match with the user's ball handler alone on the court (everyone else parked far away), as the council's feel probe did.
async function soloMatch() {
  const sim = await load('sim.js'), rost = await load('roster.js');
  const mk = (k) => ({ key: k, name: k, short: k, abbr: k.slice(0, 3), mascot: 'x', crest: null, colors: { primary: '#fff', secondary: '#000' }, kit: {}, roster: rost.makeRoster(k, 'boys', 5, 1) });
  const m = sim.createMatch({ mode: 'exhibition', home: mk('aaa'), away: mk('bbb'), seed: 7, user: 0, difficulty: 1, rules: { qLen: 240, shotClock: 35 } });
  sim.give(m, 0);
  const park = () => { for (let i = 1; i < 10; i++) { m.p[i].x = 70 + i; m.p[i].z = 5; m.p[i].tx = m.p[i].x; m.p[i].tz = m.p[i].z; m.p[i].vx = m.p[i].vz = 0; } };
  park();
  Object.assign(m.p[0], { x: 20, z: 25, tx: 20, tz: 25 });
  return { sim, m, step: () => { sim.tick(m); park(); } };
}

export const tests = [];

tests.push({
  name: 'S1-01: a player reaches top speed, stops and slides much sooner than before (node)',
  node: true,
  async run(t) {
    const { m, step } = await soloMatch();
    const trace = [];
    m.input.mx = 1; m.input.mz = 0;
    for (let k = 0; k < 60; k++) { step(); trace.push(m.p[0].vx); }
    const top = Math.max(...trace);
    const to90 = trace.findIndex((v) => v >= 0.9 * top) + 1;
    t.expect(top > 16.5 && top < 17.3, `top speed is unchanged (${top.toFixed(2)} ft/s)`);
    t.expect(to90 <= 14, `90% of top speed within 14 ticks (${to90}; it was 20)`);
    const x0 = m.p[0].x; m.input.mx = 0;
    let stop = 0; while (Math.abs(m.p[0].vx) > 0.5 && stop < 120) { step(); stop++; }
    t.expect(stop <= 12, `stopped within 12 ticks of letting go (${stop}; it was 22)`);
    t.expect(m.p[0].x - x0 <= 1.5, `and slid at most 1.5 ft (${(m.p[0].x - x0).toFixed(2)}; it was 3 ft)`);
  },
});

tests.push({
  name: 'S1-06: a jump shooter is at the top of his jump at the meter\'s sweet spot, at the same height as before (node)',
  node: true,
  async run(t) {
    const rules = await load('rules.js');
    const sweetMs = rules.SWEET * rules.meterTime('jumper') * 1000;
    for (const jmp of [0, 0.5, 1]) {
      const { m, sim, step } = await soloMatch();
      const p = m.p[0];
      m.teams[0].roster[p.r].jmp = jmp;
      Object.assign(p, { x: 70, z: 25, tx: 70, tz: 25 });
      m.input.shoot = true; m.input.shootP = true; step(); m.input.shootP = false;
      let apex = 0, apexAt = 0, released = 0, releaseY = 0;
      for (let n = 1; n < 300 && !(released && p.y <= 0); n++) {
        if (m.ball.state === 'held' && p.actT >= rules.SWEET * rules.meterTime('jumper')) { m.input.shoot = false; m.input.shootR = true; }
        step(); m.input.shootR = false;
        if (p.y > apex) { apex = p.y; apexAt = n; }
        if (!released && m.ball.state !== 'held') { released = n; releaseY = p.y; }
      }
      const oldApex = (10 + 4 * jmp) ** 2 / 64;
      t.expect(Math.abs(apexAt * 1000 / 60 - sweetMs) <= 50, `jump rating ${jmp}: the top of the jump (${Math.round(apexAt * 1000 / 60)} ms) is within 50 ms of the sweet spot (${Math.round(sweetMs)} ms); it was ${Math.round((10 + 4 * jmp) / 32 * 1000)} ms`);
      t.expect(releaseY >= 0.9 * apex, `jump rating ${jmp}: a PERFECT release leaves from the top (${releaseY.toFixed(2)} of ${apex.toFixed(2)} ft), not from the floor`);
      t.expect(Math.abs(apex - oldApex) <= 0.1, `jump rating ${jmp}: the jump is as high as before (${apex.toFixed(2)} ft against ${oldApex.toFixed(2)})`);
    }
  },
});

tests.push({
  name: 'S1-08: a replay plays at the speed of play, about 2 s, and the press that skips it still reaches the game',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t, { seed: 5 });
    await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
    await t.game('step', 150);
    t.expect(await t.game('act', 'replay', 'THREE', 1), 'a replay starts from the recorded frames');
    let s = await t.state();
    t.expect(s.replay && s.replay.speed >= 1, `it plays at normal speed or faster (${s.replay && s.replay.speed}); it was half speed`);
    const secs = s.replay.n / 60 / s.replay.speed;
    t.expect(secs <= 2.6 && secs >= 1, `and lasts about 2 s (${secs.toFixed(1)} s); it was 4.3 s`);
    await t.page.keyboard.down('Space');
    s = await t.state();
    t.equal(s.replay, null, 'a key skips the replay');
    t.expect(s.input.shoot, 'and that same press is not swallowed: Shoot is held');
    await t.page.keyboard.up('Space');
  },
});

// A finished match reduced to what whyLost reads: two rosters of box-score lines, the user's team and the winner.
const fakeMatch = (user, winner, a, b) => ({ user: { team: user }, winner, teams: [a, b].map((st) => ({ roster: [{ st: { to: 0, reb: 0, pf: 0, fgm: 0, fga: 0, ...st } }, { st: { to: 0, reb: 0, pf: 0, fgm: 0, fga: 0 } }] })) });

tests.push({
  name: 'S2-09: the final screen names the biggest gap behind a loss, with one thing to try, and says nothing after a win (node)',
  node: true,
  async run(t) {
    const { whyLost } = await load('ui.js');
    const lost = (us, them) => whyLost(fakeMatch(0, 1, us, them));
    t.equal(whyLost(fakeMatch(0, 0, { to: 9 }, { to: 1 })), null, 'a win gets no Why');
    t.equal(whyLost(fakeMatch(-1, 1, { to: 9 }, { to: 1 })), null, 'a game with no player gets no Why');
    let y = lost({ to: 9 }, { to: 3 });
    t.expect(/turned it over 9 times to their 3/.test(y.why) && /Pass/.test(y.tip), `turnovers: ${y.why} / ${y.tip}`);
    y = lost({ reb: 8 }, { reb: 15 });
    t.expect(/won the boards, 15 to 8/.test(y.why) && /rim/.test(y.tip), `rebounds: ${y.why} / ${y.tip}`);
    y = lost({ fgm: 4, fga: 20 }, { fgm: 9, fga: 20 });
    t.expect(/shot 45% to your 20%/.test(y.why) && /green/.test(y.tip), `shooting: ${y.why} / ${y.tip}`);
    y = lost({ pf: 9 }, { pf: 3 });
    t.expect(/9 fouls to their 3/.test(y.why) && /reaching/.test(y.tip), `fouls: ${y.why} / ${y.tip}`);
    y = lost({ to: 6, reb: 10 }, { to: 3, reb: 20 });
    t.expect(/boards/.test(y.why), 'when two gaps count, the larger one (boards, 2.5 steps; turnovers 1) is named');
    y = lost({ to: 4, reb: 8, fgm: 6, fga: 20, pf: 4 }, { to: 3, reb: 10, fgm: 7, fga: 20, pf: 3 });
    t.expect(/No one number/.test(y.why), 'a loss with no gap past its floor is called spread out');
    y = lost({ fgm: 1, fga: 4 }, { fgm: 4, fga: 4 });
    t.expect(!/shot/.test(y.why), 'shooting percentages from fewer than 8 attempts are not blamed');
  },
});

tests.push({
  name: 'S2-09: a lost final shows the Why card and a won one does not',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await exhibition(t, { seed: 61 });
    await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
    await t.game('setState', { match: { q: 4, t: 0.5, score: [30, 44] } });
    let s = await stepUntil(t, (x) => x.scene === 'final', 600, 10, 'final');
    t.equal(s.match.winner, 1, 'the player lost');
    const card = await t.page.locator('#screen .card.why');
    t.equal(await card.count(), 1, 'one Why card');
    const txt = await card.innerText();
    t.expect(/Why it slipped/.test(txt) && /Try:/.test(txt), `it names a reason and a try: ${txt.replace(/\n/g, ' ')}`);
    await t.checkLayout();
    await t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/S2-09-why-card-${t.viewport}.png` });
    await exhibition(t, { seed: 61 });
    await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
    await t.game('setState', { match: { q: 4, t: 0.5, score: [44, 30] } });
    s = await stepUntil(t, (x) => x.scene === 'final', 600, 10, 'final');
    t.equal(await t.page.locator('#screen .card.why').count(), 0, 'a win has none');
  },
});

tests.push({
  name: 'S4-14: the home crowd starts fuller in a bigger gym and against a rival (node)',
  node: true,
  async run(t) {
    const D = await load('data.js');
    const hs = D.team('hot-springs'), lh = D.team('lake-hamilton'), cms = D.team('cutter-morning-star'), lk = D.team('lakeside');
    t.expect(hs.gymSeats === 2200 && lh.gymSeats === 2280 && cms.gymSeats === 1500 && lk.gymSeats == null, 'seats come from the research data and only where it has a figure');
    const g = (tm, away) => D.gymCrowd(tm, away);
    t.expect(g(lh, 'fountain-lake') > g(cms, 'fountain-lake'), `a 2,280-seat gym (${g(lh, 'fountain-lake')}) starts above a 1,500-seat one (${g(cms, 'fountain-lake')})`);
    t.expect(g(cms, 'fountain-lake') > g(lk, 'fountain-lake'), `and above a gym with no seat figure (${g(lk, 'fountain-lake')})`);
    t.expect(g(hs, 'lakeside') > g(hs, 'fountain-lake') + 0.1, `a rival coming to Hot Springs raises the start (${g(hs, 'lakeside')} against ${g(hs, 'fountain-lake')})`);
    t.expect(g(hs, 'lakeside') <= 0.6, 'but not past the 0.6 where the crowd starts to help: the home side still has to score first');
    t.equal(g(hs, 'thistledown'), g(hs, 'fountain-lake'), 'a fictional visitor is no rival');
  },
});

tests.push({
  name: 'S4-14: an exhibition at home in a real gym has the crowd meter; away from home it does not',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 3, paused: true });
    let s = await t.state();
    t.equal(s.match.crowdTeam, 0, 'the home gym crowd backs the player at home');
    t.expect(Math.abs(s.match.crowd - 0.52) < 0.011, `Hot Springs against a rival starts at about 0.52 (${s.match.crowd})`);
    t.equal(await t.page.locator('#sb .sb-crowd').count(), 1, 'and the scoreboard shows the crowd bar');
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'fountain-lake', program: 'boys', user: 'home', seed: 3, paused: true });
    s = await t.state();
    t.expect(Math.abs(s.match.crowd - 0.37) < 0.011, `a non-rival starts at about 0.37 (${s.match.crowd})`);
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'away', seed: 3, paused: true });
    s = await t.state();
    t.equal(s.match.crowdTeam, -1, 'playing away gets no crowd, as before');
    await t.game('newGame', { mode: 'exhibition', home: 'thistledown', away: 'lakeside', program: 'boys', user: 'home', seed: 3, paused: true });
    s = await t.state();
    t.equal(s.match.crowdTeam, -1, 'a fictional home team has none');
    await t.game('newGame', { mode: 'exhibition', home: 'lakeside', away: 'hot-springs', program: 'boys', user: 'home', seed: 3, paused: true, venue: 'arena' });
    s = await t.state();
    t.equal(s.match.crowdTeam, 0, 'the finals arena crowd is unchanged');
    t.expect(Math.abs(s.match.crowd - 0.3) < 0.011, `and still starts at 0.3 (${s.match.crowd})`);
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 3, paused: true });
    await t.checkLayout();
    await t.page.screenshot({ path: `../_council/hsg-basketball/wave-3/shots/S4-14-home-crowd-bar-${t.viewport}.png` });
  },
});

tests.push({
  name: 'S6-12: the title draws at most about 30 frames a second, rests after a spell with no input, and wakes on a touch of the mouse',
  viewports: ['desktop', 'mobile'],
  async run(t) {
    await waitFor(t, (s) => s.scene === 'title' && s.title && s.title.running, 10000, 'title loop running');
    await t.game('act', 'titleIdleAfter', 60000);
    const f0 = (await t.state()).title.frames;
    await t.page.waitForTimeout(2000);
    const f1 = (await t.state()).title.frames;
    // An uncapped loop draws about 120 frames in 2 s at 60 Hz; the cap gives about 60. Slower machines draw fewer, never more.
    t.log(`title frames in 2 s: ${f1 - f0}`);
    t.expect(f1 - f0 <= 72, `no more than about 30 frames a second (${f1 - f0} in 2 s)`);
    t.expect(f1 - f0 >= 1, `and it is still drawing (${f1 - f0} in 2 s)`);
    await t.game('act', 'titleIdleAfter', 400);
    await waitFor(t, (s) => s.title.idle && !s.title.running, 6000, 'the title resting');
    const rested = (await t.state()).title.frames;
    await t.page.waitForTimeout(400);
    t.equal((await t.state()).title.frames, rested, 'a resting title draws nothing');
    await t.page.mouse.move(40, 60);
    await t.page.mouse.move(80, 100);
    await waitFor(t, (s) => !s.title.idle && s.title.running && s.title.frames > rested, 6000, 'the title waking');
    await t.game('act', 'titleIdleAfter', 400);
    await waitFor(t, (s) => s.title.idle && !s.title.running, 6000, 'resting again');
    await t.page.keyboard.press('Shift');
    await waitFor(t, (s) => !s.title.idle && s.title.running, 6000, 'waking on a key');
  },
});

tests.push({
  name: 'S6-12: the title frame gate passes about 30 frames a second on 60, 120 and 144 Hz screens (node)',
  node: true,
  async run(t) {
    const { frameDue } = await load('util.js');
    for (const hz of [60, 120, 144]) {
      let last = 0, drawn = 0;
      for (let ts = 1000 / hz; ts <= 2000; ts += 1000 / hz) if (frameDue(ts, last, 33)) { drawn++; last = ts; }
      t.expect(drawn >= 56 && drawn <= 64, `${hz} Hz: ${drawn} frames drawn in 2 s (about 60, which is 30 a second)`);
    }
    t.expect(frameDue(1000, 0, 0), 'with no limit every frame is due');
  },
});

tests.push({
  name: 'S1-14: timing pays more for the player: a PERFECT release is worth more, cancels half the contest, a late one is unchanged, the AI is untouched (node)',
  node: true,
  async run(t) {
    const rules = await load('rules.js');
    const c = (o) => rules.shotChance({ dist: 24, type: 'jumper', sht: 0.55, ins: 0.55, ...o });
    const ai = { perfect: c({ quality: 1 }), good: c({ quality: 0.75 }), late: c({ quality: 0.3 }), contested: c({ quality: 1, contest: 0.62 }) };
    t.expect(Math.abs(ai.perfect - 0.459) < 0.002 && Math.abs(ai.good - 0.34) < 0.002 && Math.abs(ai.contested - 0.284) < 0.002, `the AI's numbers are as before (${ai.perfect.toFixed(3)}, ${ai.good.toFixed(3)}, ${ai.contested.toFixed(3)})`);
    const hu = { perfect: c({ quality: 1, human: true }), good: c({ quality: 0.75, human: true }), late: c({ quality: 0.3, human: true }), contested: c({ quality: 1, contest: 0.62, human: true }) };
    t.expect(hu.perfect >= 0.55, `a PERFECT open three at an average rating goes in at least 55% (${hu.perfect.toFixed(3)}; it was 46%)`);
    t.expect(hu.contested >= 0.45, `a contested PERFECT three goes in at least 45% (${hu.contested.toFixed(3)}; it was 28%)`);
    t.expect(hu.late === ai.late, 'a late release is worth what it was');
    t.expect(hu.good < ai.good && hu.good > 0.22, `a GOOD one pays a little less to keep ordinary timing near where it was (${hu.good.toFixed(3)} against ${ai.good.toFixed(3)})`);
    // Expected chance over a spread of release times, a mix of shots (the council's probe, one defender distance each).
    const mean = (sd, human) => {
      let a = 0, w = 0;
      for (const [dist, type, weight, contest] of [[24, 'jumper', 3, 1], [24, 'jumper', 2, 0.8], [15, 'jumper', 2, 1], [15, 'jumper', 2, 0.8], [3, 'layup', 2, 1], [3, 'layup', 2, 0.62]]) {
        for (let z = -4; z <= 4; z += 0.05) { const q = rules.meterQuality(Math.max(0.05, rules.SWEET + z * sd), 1, 'jumper').q, p = Math.exp(-z * z / 2); a += weight * p * rules.shotChance({ dist, type, sht: 0.6, ins: 0.6, contest, quality: q, human }); w += weight * p; }
      }
      return a / w;
    };
    const gainMaster = mean(0.05, true) / mean(0.05, false) - 1, gainCasual = mean(0.22, true) / mean(0.22, false) - 1;
    t.expect(gainMaster >= 0.12, `a player who has the window (spread 0.05) scores at least 12% more (${(gainMaster * 100).toFixed(1)}%)`);
    t.expect(Math.abs(gainCasual) <= 0.02, `one with loose timing (spread 0.22) is within 2% of before (${(gainCasual * 100).toFixed(1)}%)`);
    t.expect(mean(0.05, true) - mean(0.16, true) > 1.4 * (mean(0.05, false) - mean(0.16, false)), 'the gap between a sharp and a loose shooter is at least 40% wider');
    // Wired into the match: the user's own shot gets the human rule, the same shot taken by the AI does not.
    const probOf = async (auto) => {
      const { m, sim, step } = await soloMatch();
      Object.assign(m.p[0], { x: 70, z: 25, tx: 70, tz: 25 });
      m.user.auto = auto;
      sim.forceShot(m, 0, 1);
      for (let n = 0; n < 120 && m.ball.state === 'held'; n++) step();
      return m.ball.shot && m.ball.shot.prob;
    };
    const hp = await probOf(false), ap = await probOf(true);
    t.expect(hp > ap * 1.2, `the player's forced PERFECT three is rated ${hp && hp.toFixed(3)} and the AI's ${ap && ap.toFixed(3)}`);
  },
});
