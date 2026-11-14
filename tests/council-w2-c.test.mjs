import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition, stepUntil, click } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// The rules engine on its own, in node: styles and late-game play are measured over many seeded games (the sim is deterministic).
async function engine() {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  const imp = (f) => import(pathToFileURL(path.join(game, 'src/js', f)).href);
  const [D, R, S, rules] = await Promise.all([imp('data.js'), imp('roster.js'), imp('sim.js'), imp('rules.js')]);
  const mk = (key, side, program, style) => { const t = D.team(key); return { ...t, style: style || t.style, roster: R.makeRoster(t.key, program, t.cls, 1), kit: D.kitFor(t, side) }; };
  const sums = (m, t, k) => S.boxScore(m)[t].reduce((a, p) => a + p[k], 0);
  return { D, R, S, rules, mk, sums };
}
// One AI game (qLen seconds a quarter). o: home/away keys, style (the away team's), user (0 = the home side is the steered team, on auto), diff, seed.
function playGame(E, o) {
  const program = o.program || 'boys';
  const m = E.S.createMatch({ mode: 'demo', home: E.mk(o.home || 'hot-springs', 'home', program), away: E.mk(o.away || 'lakeside', 'away', program, o.style), program, rules: { qLen: o.qLen || 60, shotClock: 35 }, seed: o.seed, user: o.user ?? 0, difficulty: o.diff ?? 1, autoBreak: true });
  if ((o.user ?? 0) >= 0) m.user.auto = true;
  for (let k = 0; k < 60 * 2000 && m.phase !== 'final'; k++) { E.S.tick(m); m.ev.length = 0; }
  return m;
}

// Wave 2, batch C: P-N01 the move set (sprint, pump fake, crossover) and S3-03 opponent styles and score-aware play.

const center = (r) => [r.x + r.w / 2, r.y + r.h / 2];
const input = (t, o) => t.game('act', 'input', o);
const player = (s, i) => s.match.players[i];
const fga = (s, team = 0) => s.match.stats[team].reduce((a, p) => a + p.fga, 0);

// A live game, the user (team 0, player 0) holding the ball at (x, z) with the other nine parked far away.
async function stage(t, x = 12, z = 25, seed = 31) {
  await exhibition(t, { seed });
  await stepUntil(t, (s) => s.match.phase === 'live', 900, 10, 'live');
  await t.game('act', 'autoplay', false);
  await park(t, x, z);
}
async function park(t, x, z) {
  await t.game('act', 'give', 0, 0);
  for (let i = 1; i < 5; i++) await t.game('act', 'place', 0, i, 20, 6 * i);
  for (let i = 0; i < 5; i++) await t.game('act', 'place', 1, i, 80, 6 + 9 * i);
  await t.game('act', 'place', 0, 0, x, z);
}

export const tests = [
  {
    name: 'P-N01: holding Sprint runs faster and costs energy; spent legs cut the boost out',
    viewports: ['desktop'],
    async run(t) {
      const run = async (sprint, energy) => {
        await stage(t, 10, 25);
        if (energy != null) await t.game('act', 'tire', 0, 0, energy);
        const s0 = await t.state();
        await input(t, { mx: 1, sprint });
        await t.game('step', 100);
        const s = await t.state();
        await input(t, { mx: 0, sprint: false });
        return { dx: player(s, 0).x - player(s0, 0).x, de: player(s0, 0).energy - player(s, 0).energy };
      };
      const walk = await run(false), sprint = await run(true);
      t.log(`walk ${walk.dx.toFixed(1)} ft, sprint ${sprint.dx.toFixed(1)} ft, energy ${walk.de.toFixed(3)} vs ${sprint.de.toFixed(3)}`);
      t.expect(sprint.dx > walk.dx * 1.15, `sprint covers more ground (${sprint.dx.toFixed(1)} vs ${walk.dx.toFixed(1)})`);
      t.expect(sprint.de > walk.de * 1.8, `sprint drains more energy (${sprint.de.toFixed(3)} vs ${walk.de.toFixed(3)})`);
      const tired = await run(true, 0.25);
      t.expect(tired.dx < walk.dx * 1.08, `no boost when the legs are spent (${tired.dx.toFixed(1)} vs walk ${walk.dx.toFixed(1)})`);
    },
  },
  {
    name: 'P-N01: the Shift key is Sprint (real key presses)',
    viewports: ['desktop'],
    async run(t) {
      const go = async (shift) => {
        await stage(t, 10, 25);
        const x0 = player(await t.state(), 0).x;
        await t.page.keyboard.down('ArrowRight');
        if (shift) await t.page.keyboard.down('Shift');
        await t.game('step', 90);
        const x1 = player(await t.state(), 0).x;
        if (shift) await t.page.keyboard.up('Shift');
        await t.page.keyboard.up('ArrowRight');
        return x1 - x0;
      };
      const a = await go(false), b = await go(true);
      t.expect(b > a * 1.12, `Shift makes the run longer (${b.toFixed(1)} vs ${a.toFixed(1)})`);
      const fx = (await t.state()).match.fx;
      t.expect(fx.sprint[0] > 0.5, `the sim counted sprint time (${fx.sprint[0].toFixed(2)} s)`);
    },
  },
  {
    name: 'P-N01: a quick Shoot tap is a pump fake; holding it still shoots',
    viewports: ['desktop'],
    async run(t) {
      let jumped = 0, fakes = 0;
      for (let k = 0; k < 14; k++) {
        if (k === 0) await stage(t, 62, 25, 33); else await park(t, 62, 25);
        await t.game('act', 'place', 1, 0, 64.2, 25);
        const before = fga(await t.state());
        await input(t, { shoot: true });
        await t.game('step', 4);
        await input(t, { shoot: false });
        await t.game('step', 1);
        let s = await t.state();
        t.equal(player(s, 0).act, 'pump', 'the tap became a pump fake');
        t.equal(s.match.ball.state, 'held', 'the ball is still in his hands');
        fakes++;
        let seen = false;
        for (let n = 0; n < 8; n++) { await t.game('step', 1); s = await t.state(); if (player(s, 5).y > 0 || player(s, 5).act === 'jump') seen = true; }
        if (seen) jumped++;
        t.equal(fga(await t.state()), before, 'a fake is not an attempt');
        await t.game('step', 60);
      }
      t.expect(jumped >= 2, `the defender bit on ${jumped} of ${fakes} fakes`);
      t.expect(jumped < fakes, `and did not bite every time (${jumped} of ${fakes})`);
      await park(t, 62, 25);
      await input(t, { shoot: true });
      await t.game('step', 22);
      await input(t, { shoot: false });
      await t.game('step', 2);
      const s = await t.state();
      t.equal(s.match.ball.state, 'shot', 'a held button releases a real shot');
    },
  },
  {
    name: 'P-N01: flipping the stick while dribbling is a crossover; a pause between does not count',
    viewports: ['desktop'],
    async run(t) {
      await stage(t, 30, 25, 35);
      await input(t, { mx: 1 });
      await t.game('step', 24);
      let s = await t.state();
      const xf = player(s, 0).x;
      await input(t, { mx: -1 });
      await t.game('step', 1);
      s = await t.state();
      t.equal(player(s, 0).act, 'cross', 'the flip starts a crossover');
      t.equal(s.match.fx.cross[0], 1, 'counted once');
      await t.game('step', 12);
      s = await t.state();
      t.expect(player(s, 0).x < xf, `he is heading back the other way (${xf.toFixed(1)} to ${player(s, 0).x.toFixed(1)})`);
      await input(t, { mx: 0 });
      await t.game('step', 90);
      await park(t, 30, 25);
      await input(t, { mx: 1 });
      await t.game('step', 24);
      await input(t, { mx: 0 });
      await t.game('step', 30);
      await input(t, { mx: -1 });
      await t.game('step', 10);
      s = await t.state();
      t.equal(s.match.fx.cross[0], 1, 'stopping first is not a crossover');
      await input(t, { mx: 0 });
      // it can leave a defender behind, and the one beaten is slowed
      let slowed = 0;
      for (let k = 0; k < 12; k++) {
        await park(t, 30, 25);
        await t.game('act', 'place', 1, 0, 33, 28);
        await input(t, { mx: 1 });
        await t.game('step', 24);
        await t.game('act', 'place', 1, 0, 36, 27);
        await input(t, { mx: -1 });
        await t.game('step', 2);
        s = await t.state();
        if (player(s, 5).stun > 0) slowed++;
        await input(t, { mx: 0 });
        await t.game('step', 70);
      }
      t.expect(slowed >= 2 && slowed < 12, `a close defender was left behind ${slowed} of 12 times`);
    },
  },
  {
    name: 'P-N01: both teams use the move set in a whole game',
    viewports: ['desktop'],
    async run(t) {
      const fx = { sprint: [0, 0], pump: [0, 0], cross: [0, 0] };
      for (const seed of [41, 42, 43]) {
        await exhibition(t, { seed, qLen: 120, away: 'lake-hamilton' });
        await t.game('act', 'finishGame');
        const f = (await t.state()).match.fx;
        for (const k of Object.keys(fx)) for (let i = 0; i < 2; i++) fx[k][i] += f[k][i];
      }
      t.log(`three games: sprint s ${fx.sprint.map((x) => x.toFixed(0))}, fakes ${fx.pump}, crossovers ${fx.cross}`);
      t.expect(fx.sprint[0] > 30 && fx.sprint[1] > 30, 'both sides sprint');
      t.expect(fx.pump[0] + fx.pump[1] >= 2, 'the AI pumps');
      t.expect(fx.cross[0] + fx.cross[1] >= 2, 'the AI crosses over');
    },
  },
  {
    name: 'P-N01: Sprint is on the touch pad (44 px, on screen, nothing overlaps) and runs farther',
    viewports: ['mobile'],
    async run(t) {
      await stage(t, 10, 25, 37);
      const L = await t.game('act', 'layout');
      for (const k of ['stick', 'shoot', 'pass', 'sw', 'sprint']) {
        t.expect(L[k] && L[k].w >= 44 && L[k].h >= 44, `${k} is at least 44 px (${L[k] && L[k].w}x${L[k] && L[k].h})`);
        t.expect(L[k] && L[k].y + L[k].h <= t.vp.height && L[k].x >= 0 && L[k].x + L[k].w <= t.vp.width, `${k} on screen`);
      }
      const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
      const names = ['stick', 'sprint', 'sw', 'pass', 'shoot'];
      for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) t.expect(!hit(L[names[i]], L[names[j]]), `${names[i]} does not overlap ${names[j]}`);
      await t.shot('P-N01-pad');
      const cdp = await t.page.context().newCDPSession(t.page);
      const pt = (id, x, y) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 });
      const [sx, sy] = center(L.stick), [bx, by] = center(L.sprint);
      const run = async (withBtn) => {
        await park(t, 10, 25);
        const p0 = player(await t.state(), 0);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: withBtn ? [pt(1, sx, sy), pt(2, bx, by)] : [pt(1, sx, sy)] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: withBtn ? [pt(1, sx + 50, sy), pt(2, bx, by)] : [pt(1, sx + 50, sy)] });
        await t.game('step', 60); // short: the run stays inside the sideline
        const p1 = player(await t.state(), 0);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await t.game('step', 60);
        return Math.hypot(p1.x - p0.x, p1.z - p0.z);
      };
      const a = await run(false), b = await run(true);
      await cdp.detach();
      t.expect(b > a * 1.1, `holding SPRINT runs farther (${b.toFixed(1)} vs ${a.toFixed(1)} ft)`);
    },
  },
  {
    name: 'P-N01: Help lists Sprint, the pump fake and the crossover',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.game('scene', 'help');
      let txt = await t.page.evaluate(() => document.getElementById('screen').innerText);
      for (const w of ['Sprint', 'Pump fake', 'Crossover']) t.expect(txt.includes(w), `the Controls tab mentions ${w}`);
      await click(t, 'helpTab', 'play');
      txt = await t.page.evaluate(() => document.getElementById('screen').innerText);
      t.expect(/sprint, fakes and crossovers/i.test(txt), 'the Playing tab explains them');
      await t.shot('P-N01-help');
    },
  },
  {
    name: 'S3-03: every team has a style (data), and the seven county schools do not all play alike',
    node: true,
    async run(t) {
      const E = await engine();
      const all = E.D.allTeams();
      t.equal(all.length, 21, 'seven county schools and fourteen fictional towns');
      for (const tm of all) {
        const st = tm.style;
        t.expect(st && typeof st.name === 'string' && st.blurb && st.pace >= 0.8 && st.pace <= 1.25 && st.three >= -0.6 && st.three <= 0.9 && st.press >= 0 && st.press <= 1, `${tm.key} has a style in range`);
        t.expect(/[.]$/.test(st.blurb) && st.blurb.length <= 48 && !/ {2}/.test(st.blurb), `${tm.key} blurb reads as one short sentence: ${st.blurb}`);
      }
      t.expect(new Set(E.D.COUNTY.map((c) => c.style.name)).size >= 5, 'the county schools use at least five different styles');
      const m = playGame(E, { seed: 1 });
      t.equal(m.teams[0].style.name, 'Balanced', 'the team you steer plays the neutral style');
      t.equal(m.teams[1].style.name, E.D.team('lakeside').style.name, 'the opponent plays its own');
    },
  },
  {
    name: 'S3-03: styles change how a team plays (threes, tempo, pressure)',
    node: true,
    async run(t) {
      const E = await engine();
      const run = (key) => {
        const style = E.D.team(key).style, r = { fga: 0, tpa: 0, stlAgainst: 0, poss: 0 };
        for (let g = 0; g < 30; g++) {
          const m = playGame(E, { seed: 300 + g, away: 'lake-hamilton', style, qLen: 120, program: g % 2 ? 'girls' : 'boys' });
          r.fga += E.sums(m, 1, 'fga'); r.poss += E.sums(m, 1, 'fga') + E.sums(m, 1, 'to'); r.tpa += E.sums(m, 1, 'tpa'); r.stlAgainst += E.sums(m, 1, 'stl');
        }
        return { tpaShare: r.tpa / r.fga, poss: r.poss / 30, forced: r.stlAgainst / 30 };
      };
      const base = run('hot-springs'), shoot = run('lakeside'), grind = run('fountain-lake'), gun = run('lake-hamilton'), press = run('jessieville');
      t.log(`balanced ${JSON.stringify(base)}; shooters ${JSON.stringify(shoot)}; grind ${JSON.stringify(grind)}; run and gun ${JSON.stringify(gun)}; press ${JSON.stringify(press)}`);
      t.expect(shoot.tpaShare > base.tpaShare + 0.08, `Perimeter shooters take more threes (${shoot.tpaShare.toFixed(2)} vs ${base.tpaShare.toFixed(2)})`);
      t.expect(shoot.tpaShare > grind.tpaShare + 0.08, `and more than Grind it out (${grind.tpaShare.toFixed(2)})`);
      t.expect(gun.poss > grind.poss * 1.05, `Run and gun gets up more shots than Grind it out (${gun.poss.toFixed(1)} vs ${grind.poss.toFixed(1)} shots and turnovers a game)`);
      t.expect(press.forced > base.forced * 1.15, `a full-court press steals the ball more (${press.forced.toFixed(2)} vs ${base.forced.toFixed(2)} steals a game)`);
    },
  },
  {
    name: 'S3-03: a team behind late fouls on purpose and shoots threes; the team ahead does neither and runs the clock',
    node: true,
    async run(t) {
      const E = await engine();
      // From a live fourth quarter: team 0 (an AI side, nobody steering unless asked) against team 1, with a score and a clock we set.
      const late = (seed, secs, a, b, user = -1) => {
        const m = E.S.createMatch({ mode: 'demo', home: E.mk('hot-springs', 'home', 'boys'), away: E.mk('lakeside', 'away', 'boys'), program: 'boys', rules: { qLen: 120, shotClock: 35 }, seed, user, difficulty: 1, autoBreak: true });
        if (user >= 0) m.user.auto = true;
        for (let k = 0; k < 600 && m.phase !== 'live'; k++) E.S.tick(m);
        m.clock.q = 4; m.clock.t = secs; m.teams[0].score = a; m.teams[1].score = b;
        const f0 = [E.sums(m, 0, 'fga'), E.sums(m, 1, 'fga')], p0 = [E.sums(m, 0, 'tpa'), E.sums(m, 1, 'tpa')];
        for (let k = 0; k < 60 * 60 && m.phase !== 'final' && m.phase !== 'qend'; k++) { E.S.tick(m); m.ev.length = 0; }
        return { hack: m.fx.hack.slice(), fga: [E.sums(m, 0, 'fga') - f0[0], E.sums(m, 1, 'fga') - f0[1]], tpa: [E.sums(m, 0, 'tpa') - p0[0], E.sums(m, 1, 'tpa') - p0[1]] };
      };
      let hackTrail = 0, hackLead = 0, hackUser = 0;
      for (let s = 1; s <= 24; s++) {
        const r = late(s, 22, 50, 53); // team 0 is three down with 22 s left
        if (r.hack[0] > 0) hackTrail++;
        hackLead += r.hack[1];
        hackUser += late(s, 22, 50, 53, 0).hack[0];
      }
      t.log(`fouls on purpose: ${hackTrail} of 24 games by the team behind, ${hackLead} by the team ahead, ${hackUser} by a steered side's teammates`);
      t.expect(hackTrail >= 8, `the team behind fouls on purpose in ${hackTrail} of 24 games`);
      t.equal(hackLead, 0, 'the team ahead never fouls on purpose');
      t.equal(hackUser, 0, 'a side you steer is never made to foul by its AI teammates');
      let trailThree = 0, trailAll = 0, tiedThree = 0, tiedAll = 0, leadFga = 0, trailFga = 0;
      for (let s = 1; s <= 30; s++) {
        const a = late(100 + s, 40, 50, 55), b = late(100 + s, 40, 50, 50), c = late(100 + s, 60, 56, 50);
        trailThree += a.tpa[0]; trailAll += a.fga[0]; tiedThree += b.tpa[0]; tiedAll += b.fga[0];
        leadFga += c.fga[0]; trailFga += c.fga[1];
      }
      t.log(`threes share, five down: ${(trailThree / trailAll).toFixed(2)}, tied: ${(tiedThree / tiedAll).toFixed(2)}; shots in the last minute, six up ${leadFga} vs six down ${trailFga}`);
      t.expect(trailThree / trailAll > tiedThree / tiedAll + 0.08, 'a team five down with 40 s left goes for threes more than a tied one');
      t.expect(leadFga < trailFga * 0.9, `the team six up shoots less in the last minute than the team six down (${leadFga} vs ${trailFga})`);
    },
  },
  {
    name: 'S3-03: Rookie, Varsity and All-State still run in that order, and the AI turn stays far inside a frame',
    node: true,
    async run(t) {
      const E = await engine();
      const per = [];
      for (const diff of [0, 1, 2]) {
        E.rules.TEAM_AI.sd = 0.08 / E.rules.DIFF[diff].win; // a steady human timing the meter, as in the council's balance probe
        let margin = 0, wins = 0;
        for (let g = 0; g < 40; g++) {
          const m = playGame(E, { seed: 700 + g, home: 'hot-springs', away: ['lakeside', 'lake-hamilton', 'fountain-lake', 'jessieville', 'cutter-morning-star', 'mountain-pine'][g % 6], diff, qLen: 90, program: g % 2 ? 'girls' : 'boys' });
          margin += m.teams[0].score - m.teams[1].score; if (m.teams[0].score > m.teams[1].score) wins++;
        }
        per.push({ margin: margin / 40, wins });
      }
      E.rules.TEAM_AI.sd = 0.09;
      t.log(`user margin by difficulty (Rookie, Varsity, All-State): ${per.map((p) => `${p.margin.toFixed(1)} (${p.wins}/40)`).join(', ')}`);
      t.expect(per[0].margin > per[1].margin && per[1].margin > per[2].margin, 'the user does best against Rookie, worst against All-State');
      const ms = [];
      for (let g = 0; g < 3; g++) {
        const m = E.S.createMatch({ mode: 'demo', home: E.mk('hot-springs', 'home', 'boys'), away: E.mk('jessieville', 'away', 'boys'), program: 'boys', rules: { qLen: 60, shotClock: 35 }, seed: 50 + g, user: -1, difficulty: 2, autoBreak: true });
        for (let k = 0; k < 60 * 2000 && m.phase !== 'final'; k++) { const t0 = performance.now(); E.S.tick(m); ms.push(performance.now() - t0); m.ev.length = 0; }
      }
      ms.sort((x, y) => x - y);
      const mean = ms.reduce((a, b) => a + b, 0) / ms.length, p99 = ms[Math.floor(ms.length * 0.99)];
      t.log(`tick cost over ${ms.length} ticks: mean ${mean.toFixed(3)} ms, p99 ${p99.toFixed(3)} ms, worst ${ms[ms.length - 1].toFixed(2)} ms`);
      t.expect(mean < 1 && p99 < 4, 'a tick costs under 1 ms on average and 4 ms at the 99th percentile (a frame is 16.7 ms)');
    },
  },
  {
    name: 'S3-03: a 6A team beats a 2A team clearly more often than the other way round',
    node: true,
    async run(t) {
      const E = await engine();
      const rate = (home, away) => { let w = 0; for (let g = 0; g < 60; g++) { const m = playGame(E, { seed: 900 + g, home, away, qLen: 120, program: g % 2 ? 'girls' : 'boys' }); if (m.teams[0].score > m.teams[1].score) w++; } return w / 60; };
      const big = rate('lake-hamilton', 'mountain-pine'), small = rate('mountain-pine', 'lake-hamilton');
      t.log(`6A user vs 2A ${(big * 100).toFixed(0)} percent; 2A user vs 6A ${(small * 100).toFixed(0)} percent`);
      t.expect(big >= 0.6 && big <= 0.85, `the 6A user wins ${(big * 100).toFixed(0)} percent of games against a 2A team`);
      t.expect(small >= 0.15 && small <= 0.4, `the 2A user wins ${(small * 100).toFixed(0)} percent against a 6A team`);
    },
  },
  {
    name: 'S3-03: the season hub tells you how the next opponent plays',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.seed(11);
      await t.game('scene', 'hub');
      const txt = await t.page.evaluate(() => document.querySelector('.card.next').innerText);
      t.expect(/They play:/.test(txt), 'the next-game card has a "They play" line');
      const line = await t.page.evaluate(() => { const el = document.querySelector('.card.next .sub'); return el ? el.innerText : ''; });
      t.expect(line.length > 20 && line.length < 90, `it is a short line (${line})`);
      const box = await t.page.evaluate(() => { const r = document.querySelector('.card.next .sub').getBoundingClientRect(); return { r: r.right, w: innerWidth, h: document.documentElement.scrollWidth }; });
      t.expect(box.r <= box.w && box.h <= box.w, 'nothing runs off the screen');
      await t.shot('S3-03-hub-style');
      await click(t, 'playSeason');
      await t.game('step', 2);
      const m = (await t.state()).match;
      t.expect(m && typeof m.teams[1].style === 'string' && m.teams[1].style.length > 3, `the match carries the opponent's style (${m && m.teams[1].style})`);
    },
  },
];
