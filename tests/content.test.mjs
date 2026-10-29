import { click } from './helpers.mjs';

const EXPECT = {
  'hot-springs': { cls: '5A', mascot: 'Trojans', confirmed: true },
  lakeside: { cls: '5A', mascot: 'Rams', confirmed: true },
  'lake-hamilton': { cls: '6A', mascot: 'Wolves', confirmed: true },
  'fountain-lake': { cls: '4A', mascot: 'Cobras', confirmed: false },
  'cutter-morning-star': { cls: '2A', mascot: 'Eagles', confirmed: false },
  jessieville: { cls: '3A', mascot: 'Lions', confirmed: false },
  'mountain-pine': { cls: '2A', mascot: 'Red Devils', confirmed: false },
};

export const tests = [
  {
    name: 'schools, crests and the team picker',
    async run(t) {
      const c = await t.game('act', 'crests');
      t.equal(c.teams.length, 7, 'seven county schools');
      for (const x of c.teams) {
        const e = EXPECT[x.key];
        t.expect(!!e, `${x.key} is a known school`);
        if (!e) continue;
        t.equal(x.cls, e.cls, `${x.key} basketball class`);
        t.equal(x.mascot, e.mascot, `${x.key} mascot`);
        t.equal(x.colorsConfirmed, e.confirmed, `${x.key} colorsConfirmed`);
        t.expect(c.keys.includes(x.crest) && x.crest !== 'mono', `${x.key} has its own crest drawing`);
      }
      t.equal(new Set(c.teams.map((x) => x.crest)).size, 7, 'seven distinct crests');
      await click(t, 'select');
      const txt = await t.page.textContent('#screen');
      for (const x of c.teams) t.expect(txt.includes(x.name.replace(' High School', '').replace('Hot Springs', 'Hot Springs')), `picker lists ${x.key}`);
      t.equal((txt.match(/game colors/g) || []).length, 8, 'four unconfirmed schools tagged in both pickers (2 × 4)');
      await t.shot('04-select');
      await t.checkLayout();
    },
  },
  {
    name: 'fictional rosters are deterministic and tiered',
    async run(t) {
      const a = await t.game('act', 'roster', 'lake-hamilton', 'boys');
      const b = await t.game('act', 'roster', 'lake-hamilton', 'boys');
      t.equal(JSON.stringify(a), JSON.stringify(b), 'same roster for the same school, program and seed');
      t.equal(a.length, 10, '10 players');
      t.equal(new Set(a.map((p) => p.num)).size, 10, 'unique numbers');
      t.equal(new Set(a.map((p) => `${p.first} ${p.last}`)).size, 10, 'unique names');
      const g = await t.game('act', 'roster', 'lake-hamilton', 'girls');
      t.expect(g[0].first !== a[0].first || g[0].last !== a[0].last, 'girls roster differs');
      const avgH = (r) => r.reduce((x, p) => x + p.height, 0) / r.length;
      t.expect(avgH(a) > avgH(g), 'heights generated per program');
      const ovr = (r) => r.slice(0, 5).reduce((x, p) => x + p.ovr, 0) / 5;
      const mp = await t.game('act', 'roster', 'mountain-pine', 'boys');
      t.expect(ovr(a) > ovr(mp), `6A starters (${ovr(a)}) rate above 2A (${ovr(mp)})`);
      const other = await t.game('act', 'roster', 'lake-hamilton', 'boys', '6A', 2);
      t.expect(JSON.stringify(other) !== JSON.stringify(a), 'a new season seed makes a new roster');
    },
  },
  {
    name: 'title pennants hang only for real titles',
    async run(t) {
      const yrs = async (k, p) => (await t.game('act', 'banners', k, p)).map((x) => x.year);
      t.equal(JSON.stringify(await yrs('hot-springs', 'girls')), JSON.stringify([1990, 1997, 1998, 2015, 2018]), 'Hot Springs girls');
      t.equal(JSON.stringify(await yrs('hot-springs', 'boys')), JSON.stringify([1932, 1996, 1998]), 'Hot Springs boys');
      t.equal(JSON.stringify(await yrs('lakeside', 'boys')), JSON.stringify([1945, 2000]), 'Lakeside (program not stated) boys gym');
      t.equal(JSON.stringify(await yrs('lakeside', 'girls')), JSON.stringify([1945, 2000]), 'Lakeside girls gym');
      for (const k of ['lake-hamilton', 'fountain-lake', 'cutter-morning-star', 'jessieville', 'mountain-pine']) t.equal((await yrs(k, 'boys')).length + (await yrs(k, 'girls')).length, 0, `${k}: no pennants`);
      const shoot = async (home, prog, name) => {
        await t.game('newGame', { mode: 'exhibition', home, away: home === 'jessieville' ? 'lake-hamilton' : 'jessieville', program: prog, user: 'home', seed: 3, paused: true });
        await t.game('step', 10);
        await t.shot(name);
      };
      await shoot('hot-springs', 'girls', '06-gym-hs-girls');
      await shoot('lakeside', 'boys', '06b-gym-lakeside');
      await shoot('jessieville', 'girls', '06c-gym-jessieville');
    },
  },
  {
    name: 'fact cards are audited and sourced',
    async run(t) {
      const f = await t.game('act', 'facts');
      t.expect(f.length >= 12, `${f.length} facts`);
      t.expect(f.every((x) => /^hs-\d{4}$/.test(x.id) && x.source && x.text), 'every fact has an audited id, text and source');
      await t.game('newGame', { mode: 'exhibition', home: 'lake-hamilton', away: 'lakeside', program: 'boys', user: 'home', seed: 8, paused: true });
      for (let k = 0; k < 40; k++) { await t.game('step', 15); if ((await t.state()).match.phase === 'live') break; }
      await t.game('setState', { match: { t: 0.3 } });
      for (let k = 0; k < 40; k++) { await t.game('step', 10); if ((await t.state()).scene === 'break') break; }
      const txt = await t.page.textContent('#screen');
      t.expect(txt.includes('Did you know?') && txt.includes('Source:'), 'quarter break shows a fact with its source');
      t.expect(f.some((x) => txt.includes(x.text)), 'the card text is one of the audited facts');
      await t.shot('07-break-fact');
    },
  },
];
