import { exhibition, stepUntil, click } from './helpers.mjs';

export const tests = [
  {
    name: 'tip-off starts the game',
    async run(t) {
      let s = await exhibition(t);
      t.equal(s.scene, 'game', 'in the game scene');
      t.equal(s.match.phase, 'tipoff', 'jump ball first');
      await t.game('step', 24);
      await t.shot('10-tipoff');
      s = await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live after tip');
      t.expect(s.match.poss === 0 || s.match.poss === 1, 'a team has possession');
      t.expect(s.match.running, 'clock runs after the tip');
      t.expect(s.match.log.some((l) => /tip won/.test(l)), 'tip logged');
    },
  },
  {
    name: 'keyboard controls: move, pass, shoot',
    async run(t) {
      await exhibition(t, { difficulty: 0 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('act', 'give', 0, 0);
      // clear the defense away so the test is about controls
      for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 20 + s * 3, 6 + s * 9);
      await t.game('act', 'place', 0, 0, 50, 25);
      let s = await t.state();
      t.equal(s.match.user.ctrl, 0, 'user controls the ball handler');
      // portrait phones turn input to the camera, so measure where the player goes on screen
      const p0 = { ...s.match.players[0] };
      await t.page.keyboard.down('ArrowRight');
      await t.game('step', 40);
      await t.page.keyboard.up('ArrowRight');
      s = await t.state();
      const p1 = s.match.players[0];
      // both ends through the same (final) camera, which follows the ball
      const x0 = (await t.game('act', 'project', p0.x, p0.z)).x, x1 = (await t.game('act', 'project', p1.x, p1.z)).x;
      t.expect(x1 > x0 + 20, `moved right on screen (${x0} → ${x1} px)`);
      t.log(`ArrowRight: ${x0} → ${x1} px`);
      await t.shot('11-dribble');
      await t.page.keyboard.press('x');
      await t.game('step', 6);
      s = await t.state();
      t.equal(s.match.ball.state, 'pass', 'X passes');
      await t.shot('11b-pass');
      s = await stepUntil(t, (x) => x.match.ball.state === 'held', 120, 4, 'catch');
      t.equal(s.match.players[s.match.ball.holder].t, 0, 'a teammate caught it');
      t.equal(s.match.user.ctrl, s.match.ball.holder, 'control follows the ball');
      await t.page.keyboard.down('Space');
      await t.game('step', 26);
      s = await t.state();
      const sh = s.match.players[s.match.ball.holder >= 0 ? s.match.ball.holder : s.match.user.ctrl];
      t.expect(sh.act === 'shoot' || sh.act === 'layup', 'Space starts a shot');
      await t.shot('11c-shot-meter');
      await t.page.keyboard.up('Space');
      await t.game('step', 3);
      s = await t.state();
      t.equal(s.match.ball.state, 'shot', 'releasing Space shoots');
      t.expect(['PERFECT', 'GOOD', 'EARLY', 'LATE'].includes(s.match.user.meterLabel), `meter label ${s.match.user.meterLabel}`);
    },
  },
  {
    name: 'meter timing drives make rate',
    viewports: ['desktop'],
    async run(t) {
      await exhibition(t, { seed: 21 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      const run = async (q, n) => {
        let made = 0;
        for (let k = 0; k < n; k++) {
          await t.game('setState', { match: { t: 100, shot: 30 } });
          await t.game('act', 'give', 0, 1);
          await t.game('act', 'place', 0, 1, 78, 25); // 10.75 ft from the right rim
          for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 30, 5 + s * 10);
          const before = (await t.state()).match.score[0];
          await t.game('act', 'shootAt', q);
          await stepUntil(t, (x) => x.match.ball.state !== 'held' && x.match.ball.state !== 'shot', 240, 10, 'shot resolves');
          if ((await t.state()).match.score[0] > before) made++;
        }
        return made;
      };
      const good = await run(1, 24), bad = await run(0.08, 24);
      t.log(`perfect ${good}/24, bad ${bad}/24`);
      t.expect(good >= bad + 6, `perfect releases (${good}) beat bad ones (${bad}) clearly`);
    },
  },
  {
    name: 'scoring: threes, twos and the scoreboard',
    async run(t) {
      await exhibition(t, { seed: 31 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      const tryShot = async (x, z, want) => {
        for (let k = 0; k < 12; k++) {
          await t.game('setState', { match: { t: 100, shot: 30 } });
          await t.game('act', 'give', 0, 0);
          await t.game('act', 'place', 0, 0, x, z);
          for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 30, 5 + s * 10);
          const before = (await t.state()).match.score[0];
          await t.game('act', 'shootAt', 1);
          let s = await stepUntil(t, (y) => y.match.ball.state === 'shot', 120, 2, 'release');
          t.equal(s.match.ball.shot.three, want === 3, `shot from ${x},${z} is ${want === 3 ? 'a three' : 'a two'}`);
          if (want === 3 && k === 0) { await t.game('step', 12); await t.shot('12-three'); }
          s = await stepUntil(t, (y) => y.match.ball.state !== 'shot', 200, 4, 'resolve');
          const d = s.match.score[0] - before;
          if (d > 0) { t.equal(d, want, `made shot scores ${want}`); return s; }
        }
        t.fail(`no make in 12 tries from ${x},${z}`);
        return t.state();
      };
      await tryShot(66, 25, 3);
      await t.game('step', 8);
      await t.shot('12b-score');
      const sb = await t.page.textContent('#sb');
      t.expect(sb.includes('HSHS') && sb.includes('LHS'), 'scoreboard shows both abbreviations');
      const s = await tryShot(77, 25, 2);
      t.expect((await t.page.textContent('#sb')).includes(String(s.match.score[0])), 'scoreboard shows the score');
    },
  },
  {
    name: 'shot clock: countdown, violation, resets; classic mode',
    async run(t) {
      await exhibition(t, { seed: 41 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('act', 'give', 0, 0);
      await t.game('act', 'place', 0, 0, 40, 25);
      for (let s = 0; s < 5; s++) await t.game('act', 'place', 1, s, 80, 5 + s * 10);
      await t.game('setState', { match: { shot: 1.2, t: 100 } });
      let s = await t.state();
      const sc0 = s.match.shot;
      await t.game('step', 30);
      s = await t.state();
      t.expect(s.match.shot < sc0, 'shot clock counts down');
      s = await stepUntil(t, (x) => x.match.log.some((l) => /shot-clock violation/.test(l)), 300, 5, 'violation');
      await t.shot('13-shotclock-violation');
      s = await stepUntil(t, (x) => x.match.phase === 'inbound', 200, 5, 'inbound after violation');
      t.equal(s.match.poss, 1, 'violation turns the ball over');
      t.expect(Math.abs(s.match.shot - 35) < 0.01, 'shot clock reset to 35 on the change of possession');
      t.equal(s.match.scVio[0], 1, 'violation counted');
      // a shot off the rim resets the clock
      let saw = false;
      for (let k = 0; k < 8 && !saw; k++) {
        await t.game('act', 'give', 0, 1);
        await t.game('act', 'place', 0, 1, 66, 25);
        for (let q = 0; q < 5; q++) await t.game('act', 'place', 1, q, 30, 5 + q * 10);
        await t.game('setState', { match: { shot: 10, t: 100 } });
        const before = (await t.state()).match.score[0];
        await t.game('act', 'shootAt', 0.4);
        s = await stepUntil(t, (x) => x.match.ball.state !== 'held' && x.match.ball.state !== 'shot', 200, 2, 'resolve');
        if (s.match.ball.state === 'loose' && s.match.score[0] === before) { saw = true; t.expect(s.match.shot > 33, `rim hit resets the shot clock (${s.match.shot})`); }
      }
      t.expect(saw, 'saw a miss off the rim');
      // classic mode
      await t.game('newGame', { mode: 'exhibition', home: 'jessieville', away: 'fountain-lake', program: 'girls', user: 'home', shotClock: 0, paused: true });
      await t.game('step', 60);
      s = await t.state();
      t.equal(s.match.rules.shotClock, 0, 'classic: no shot clock');
      t.expect((await t.page.textContent('#sb')).includes('CLASSIC'), 'scoreboard says CLASSIC');
      await t.shot('13b-classic');
    },
  },
  {
    name: 'fouls, free throws, bonus and foul-outs',
    async run(t) {
      await exhibition(t, { seed: 51 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('act', 'give', 0, 2);
      await t.game('act', 'foul', 1, 'shoot');
      let s = await stepUntil(t, (x) => x.match.phase === 'ft', 120, 5, 'free throws');
      t.equal(s.match.ft.total, 2, 'shooting foul: 2 free throws');
      t.equal(s.match.ft.team, 0, 'the fouled team shoots');
      await t.game('step', 20);
      await t.shot('14-freethrow');
      await t.game('act', 'ftStop', 1);
      s = await stepUntil(t, (x) => x.match.ft && x.match.ft.left === 1 && x.match.ft.state === 'aim', 240, 5, 'second attempt');
      await t.game('step', 30);
      await t.page.keyboard.press('Space'); // the second one by keyboard
      s = await stepUntil(t, (x) => x.match.phase !== 'ft', 300, 5, 'free throws done');
      const fta = s.match.stats[0].reduce((a, p) => a + p.fta, 0);
      const ftm = s.match.stats[0].reduce((a, p) => a + p.ftm, 0);
      t.equal(fta, 2, 'two attempts recorded');
      t.equal(s.match.score[0], ftm, 'each made free throw scores 1');
      await stepUntil(t, (x) => x.match.phase === 'live' || x.match.phase === 'inbound', 300, 5, 'play resumes');
      await t.game('act', 'give', 0, 0);
      await t.game('setState', { match: { teamFouls: [0, 4] } });
      await t.game('act', 'foul', 1, 'reach');
      s = await stepUntil(t, (x) => x.match.phase === 'ft', 120, 5, 'bonus free throws');
      t.equal(s.match.ft.total, 2, 'bonus: 2 shots');
      t.expect((await t.page.textContent('#sb')).includes('BONUS'), 'scoreboard shows BONUS');
      await t.shot('14b-bonus');
      await t.game('act', 'give', 1, 0);
      await t.game('setState', { match: { teamFouls: [0, 0] } });
      await t.game('act', 'foul', 0, 'reach');
      s = await stepUntil(t, (x) => x.match.phase === 'inbound', 120, 5, 'side out');
      t.equal(s.match.inb.team, 1, 'reach-in before the bonus: ball out of bounds');
      for (let k = 0; k < 5; k++) { // five fouls on the same defender
        await t.game('act', 'give', 0, 0);
        await t.game('act', 'place', 0, 0, 60, 25);
        await t.game('act', 'place', 1, 0, 61, 25);
        await t.game('setState', { match: { teamFouls: [0, 0] } });
        await t.game('act', 'foul', 1, 'reach');
        await stepUntil(t, (x) => x.match.phase === 'inbound', 120, 5, 'side out');
      }
      s = await t.state();
      const out = s.match.stats[1].find((p) => p.pf >= 5);
      t.expect(!!out, 'a player reached 5 fouls');
      const onCourt = s.match.teams[1].onCourt.map((r) => s.match.stats[1][r].num);
      t.expect(out && !onCourt.includes(out.num), 'the fouled-out player left the court');
    },
  },
  {
    name: 'quarters, halftime, overtime and the final',
    async run(t) {
      await exhibition(t, { seed: 61 });
      await stepUntil(t, (x) => x.match.phase === 'live', 600, 10, 'live');
      await t.game('setState', { match: { t: 0.5, q: 2 } });
      let s = await stepUntil(t, (x) => x.scene === 'break', 400, 10, 'halftime');
      t.equal(s.match.q, 2, 'break after Q2');
      const dir = s.match.dir.slice();
      t.expect((await t.page.textContent('#screen')).includes('Halftime'), 'halftime title');
      t.expect((await t.page.textContent('#screen')).includes('Source:'), 'fact card with source');
      await t.shot('15-halftime');
      await click(t, 'continueGame');
      s = await t.state();
      t.equal(s.match.q, 3, 'third quarter');
      t.equal(s.match.dir[0], -dir[0], 'teams swapped ends');
      t.equal(s.scene, 'game', 'back to the game');
      await t.game('pause');
      await t.game('setState', { match: { q: 4, t: 0.5, score: [40, 40] } });
      s = await stepUntil(t, (x) => x.scene === 'break', 400, 10, 'end of regulation');
      t.expect((await t.page.textContent('#screen')).includes('Overtime'), 'tie: overtime');
      await click(t, 'continueGame');
      s = await t.state();
      t.equal(s.match.q, 5, 'overtime period');
      t.expect(Math.abs(s.match.t - 60) < 0.1, 'overtime is half a 2-minute quarter (1:00)');
      await t.game('pause');
      await t.game('step', 40);
      await t.shot('15b-overtime');
      await t.game('setState', { match: { t: 0.5, score: [44, 41] } });
      s = await stepUntil(t, (x) => x.scene === 'final', 400, 10, 'final');
      t.equal(s.match.winner, 0, 'leader wins');
      const txt = await t.page.textContent('#screen');
      t.expect(txt.includes('Final (OT)') && txt.includes('Top performers') && txt.includes('fictional'), 'final shows OT, top performers and the fiction note');
      await t.shot('16-final');
      await t.checkLayout();
    },
  },
  {
    name: 'AI vs AI games finish with real stats',
    async run(t) {
      const tot = { stl: 0, blk: 0, reb: 0, pts: 0 };
      for (let g = 0; g < 3; g++) {
        await t.game('newGame', { mode: 'exhibition', home: ['lake-hamilton', 'mountain-pine', 'fountain-lake'][g], away: ['lakeside', 'cutter-morning-star', 'jessieville'][g], program: g === 1 ? 'girls' : 'boys', user: 'none', qLen: 60, seed: 100 + g, paused: true });
        const s = await t.game('act', 'finishGame');
        t.equal(s.phase, 'final', `game ${g} finished`);
        t.expect(s.score[0] > 0 && s.score[1] > 0, `both teams scored (${s.score.join('-')})`);
        for (const side of s.stats) for (const p of side) { tot.stl += p.stl; tot.blk += p.blk; tot.reb += p.reb; tot.pts += p.pts; }
      }
      t.log(JSON.stringify(tot));
      t.expect(tot.reb > 10 && tot.stl > 0, 'rebounds and steals happen');
      await t.game('newGame', { mode: 'exhibition', home: 'lakeside', away: 'lake-hamilton', program: 'boys', user: 'none', qLen: 120, seed: 77, paused: true });
      await t.game('step', 900);
      await t.shot('17-ai-game');
    },
  },
  {
    name: 'pause stops the clock; quit returns to the menu',
    async run(t) {
      await exhibition(t, { seed: 71 });
      await t.game('resume');
      await t.page.waitForTimeout(1500);
      await t.page.keyboard.press('p');
      let s = await t.state();
      t.equal(s.scene, 'pause', 'P pauses');
      const c0 = s.match.t;
      await t.page.waitForTimeout(600);
      s = await t.state();
      t.equal(s.match.t, c0, 'clock frozen while paused');
      await t.shot('18-pause');
      await click(t, 'toggleBox');
      t.expect((await t.page.textContent('#screen')).includes('Field goals'), 'box score from pause');
      await click(t, 'resume');
      t.equal((await t.state()).scene, 'game', 'resume');
      await t.page.click('#b-pause');
      t.equal((await t.state()).scene, 'pause', 'pause button');
      await click(t, 'quit');
      t.equal((await t.state()).scene, 'title', 'quit to the title');
    },
  },
];
