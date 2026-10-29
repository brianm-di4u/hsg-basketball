import { click, stepUntil, waitFor } from './helpers.mjs';

const MONTHS = ['November', 'December', 'January', 'February'];

export const tests = [
  {
    name: 'season: setup, hub, sim and a played game',
    async run(t) {
      await t.seed(5);
      await click(t, 'seasonSetup');
      await click(t, 'pickSchool', 'lakeside');
      await click(t, 'pickProgram', 'girls');
      t.expect((await t.page.textContent('#screen')).includes('Bank OZK Arena'), 'setup names the finals venue');
      await t.shot('20-season-setup');
      await t.checkLayout();
      await click(t, 'startSeason');
      let s = await t.state();
      t.equal(s.scene, 'hub', 'season hub');
      t.equal(s.season.school, 'lakeside', 'school');
      t.equal(s.season.cls, '5A', 'Lakeside is 5A');
      t.equal(s.season.games.length, 3, 'short season: 3 games');
      t.expect(s.season.games.every((g) => MONTHS.includes(g.month)), 'months only, Nov-Feb');
      t.expect(s.season.games.every((g) => !['lakeside'].includes(g.opp)), 'no self games');
      t.expect(s.season.games.some((g) => g.rival), 'a rivalry game on the schedule');
      const txt = await t.page.textContent('#screen');
      t.expect(txt.includes('Record') && txt.includes('Did you know?') && txt.includes('Source:'), 'hub shows record and a sourced fact');
      await t.shot('21-hub');
      await click(t, 'simSeason');
      s = await t.state();
      t.equal(s.season.w + s.season.l, 1, 'sim records a result');
      t.expect(!!s.season.games[0].result, 'result stored');
      await click(t, 'playSeason');
      s = await t.state();
      t.equal(s.scene, 'game', 'playing the next game');
      t.equal(s.mode, 'season', 'season mode');
      const ut = s.match.user.team;
      t.equal(s.match.teams[ut].key, 'lakeside', 'user plays Lakeside');
      t.equal(s.match.program, 'girls', 'girls program');
      await t.game('act', 'finishGame', { winner: ut });
      s = await waitFor(t, (x) => x.scene === 'final', 4000, 'final');
      await click(t, 'afterSeasonGame');
      s = await t.state();
      t.equal(s.scene, 'hub', 'back to the hub');
      t.equal(s.season.w + s.season.l, 2, 'played game recorded');
      await click(t, 'roster');
      const rt = await t.page.textContent('#screen');
      t.expect(rt.includes('All players are fictional'), 'roster says fictional');
      await t.shot('05-roster');
      await t.checkLayout();
      await click(t, 'back');
      t.equal((await t.state()).scene, 'hub', 'back from roster');
    },
  },
  {
    name: 'season: bracket, arena final and champion',
    async run(t) {
      await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'girls', length: 'short', seed: 9 });
      for (let k = 0; k < 3; k++) await t.game('act', 'seasonResult', 50, 40);
      let s = await t.state();
      t.equal(s.season.phase, 'bracket', 'bracket after the regular season');
      const teams = s.season.bracket.rounds[0].flatMap((g) => [g.a, g.b]);
      t.equal(teams.length, 8, '8-team bracket');
      t.expect(teams.includes('hot-springs') && teams.includes('lakeside'), 'both 5A county schools are in the 5A bracket');
      const crests = await t.game('act', 'crests');
      const county = new Set(crests.teams.map((x) => x.key));
      t.expect(teams.filter((k) => county.has(k)).every((k) => crests.teams.find((x) => x.key === k).cls === '5A'), 'only 5A county schools');
      t.equal(s.season.bracket.rounds[0][0].a, 'hot-springs', '3-0 record earns the 1 seed');
      await click(t, 'bracket');
      await t.shot('22-bracket');
      await t.checkLayout();
      await click(t, 'back');
      await t.game('act', 'seasonResult', 48, 41); // quarterfinal
      await t.game('act', 'seasonResult', 52, 49); // semifinal
      s = await t.state();
      t.equal(s.season.next.round, 'State final', 'in the final');
      t.equal(s.season.next.arena, true, 'final at the arena');
      t.expect((await t.page.textContent('#screen')).includes('Bank OZK Arena, Hot Springs'), 'hub names Bank OZK Arena, Hot Springs');
      await click(t, 'playSeason');
      await t.game('pause');
      s = await t.state();
      t.equal(s.match.venue, 'arena', 'arena venue');
      t.equal(s.match.crowdTeam, s.match.user.team, 'home crowd backs the county team');
      await t.game('step', 50);
      await t.shot('23-arena-final');
      await t.game('act', 'finishGame', { winner: s.match.user.team });
      await waitFor(t, (x) => x.scene === 'final', 4000, 'final');
      await click(t, 'afterSeasonGame');
      s = await t.state();
      t.equal(s.scene, 'champion', 'champion screen');
      t.equal(s.season.champion, true, 'champion flag');
      t.expect(s.trophies.length === 1 && s.trophies[0].school === 'hot-springs' && s.trophies[0].program === 'girls', 'banner saved');
      t.expect((await t.page.textContent('#screen')).includes('not a real title'), 'champion screen says it is a game result');
      await t.game('act', 'freeze', true);
      await t.shot('24-champion');
      await t.game('act', 'freeze', false);
    },
  },
  {
    name: 'season: elimination ends the season',
    async run(t) {
      await t.game('newGame', { mode: 'season', school: 'mountain-pine', program: 'boys', length: 'short', seed: 3 });
      for (let k = 0; k < 3; k++) await t.game('act', 'seasonResult', 30, 41);
      let s = await t.state();
      const teams = s.season.bracket.rounds[0].flatMap((g) => [g.a, g.b]);
      t.expect(teams.includes('cutter-morning-star'), 'the other 2A school is in the 2A bracket');
      t.expect((s.season.bracket.rounds[0].find((g) => g.b === 'mountain-pine') || {}).seedB >= 7, 'winless team is a low seed');
      await t.game('act', 'seasonResult', 40, 44);
      s = await t.state();
      t.equal(s.season.done, true, 'season over');
      t.equal(s.season.eliminated, 'Quarterfinal', 'out in the quarterfinal');
      t.expect((await t.page.textContent('#screen')).includes('Eliminated'), 'hub says eliminated');
      await t.shot('24b-eliminated');
    },
  },
  {
    name: 'season: saves and resumes after reload',
    async run(t) {
      await t.game('newGame', { mode: 'season', school: 'jessieville', program: 'girls', length: 'full', seed: 4 });
      let s = await t.state();
      t.equal(s.season.games.length, 8, 'full season: 8 games');
      t.expect(s.season.games.filter((g) => !['hot-springs', 'lakeside', 'lake-hamilton', 'fountain-lake', 'cutter-morning-star', 'mountain-pine'].includes(g.opp)).length === 2, 'two fictional league foes');
      await t.game('act', 'sim');
      await t.game('act', 'sim');
      await t.reload();
      s = await t.state();
      t.equal(s.scene, 'title', 'title after reload');
      t.expect((await t.page.textContent('#screen')).includes('Continue season'), 'continue offered');
      await click(t, 'continueSeason');
      s = await t.state();
      t.equal(s.season.school, 'jessieville', 'same school');
      t.equal(s.season.w + s.season.l, 2, 'same record');
      await t.shot('25-resume');
    },
  },
  {
    name: 'storage blocked: the game still plays',
    initScript: () => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); },
    async run(t) {
      let s = await t.state();
      t.equal(s.scene, 'title', 'boots');
      await t.game('newGame', { mode: 'season', school: 'fountain-lake', program: 'boys', length: 'short', seed: 2 });
      await t.game('act', 'sim');
      s = await t.state();
      t.equal(s.storageOk, false, 'storage reported unavailable');
      t.equal(s.season.w + s.season.l, 1, 'season works in memory');
      await t.game('scene', 'settings');
      t.expect((await t.page.textContent('#screen')).includes('Saving is unavailable'), 'settings explain');
    },
  },
];
