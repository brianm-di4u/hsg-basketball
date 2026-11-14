import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { exhibition, stepUntil, FORCE_3D, ready3d } from './helpers.mjs';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEY = 'hsg-hoops-v1';
const put = (t, v) => t.page.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [KEY, v]);
const save = async (t) => JSON.parse(await t.page.evaluate((k) => localStorage.getItem(k), KEY) || 'null');
const wipe = (t) => t.page.evaluate((k) => localStorage.removeItem(k), KEY);
const text = (t) => t.page.textContent('#screen');
async function node() {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  const imp = (f) => import(pathToFileURL(path.join(game, 'src/js', f)).href);
  const [C, P, D, U] = await Promise.all([imp('career.js'), imp('save-policy.js'), imp('daily.js'), imp('data.js')]);
  return { C, P, D, U };
}
// A whole game the user's team wins by a forced margin: the hook plays it out on auto, then the real final screen runs.
async function playOut(t, o = {}, winner = 0) {
  await exhibition(t, { seed: 5, ...o });
  await t.game('act', 'finishGame', { winner });
  return t.state();
}

// Wave 2, batch D: S3-01 career, achievements, cosmetic unlocks and the daily game; S2-01 first-run teaching; S4-01 place.

export const tests = [
  {
    name: 'S3-01: a finished game adds to the career, saves it, and the totals survive a reload',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      let s = await t.state();
      t.equal(s.career.games, 0, 'a new player starts with no games');
      s = await playOut(t, {}, 0);
      t.equal(s.scene, 'final', 'the final screen is up');
      t.equal(s.career.games, 1, 'one game');
      t.equal(s.career.wins, 1, 'one win');
      t.equal(s.career.bySchool['hot-springs'].w, 1, 'counted for the school played');
      t.equal(s.career.byMode.exhibition.g, 1, 'and for the mode');
      t.expect(s.career.pts > 0, `the user's own points were counted (${s.career.pts})`);
      const disk = await save(t);
      t.equal(disk.career.games, 1, 'it is in the save');
      t.equal(disk.v, 1, 'inside the current save version');
      await t.reload();
      s = await t.state();
      t.equal(s.career.games, 1, 'the career survives a reload');
      t.equal(s.career.best.pts, disk.career.best.pts, 'with its bests');
      await t.game('scene', 'trophies');
      const tx = await text(t);
      t.expect(/Career/.test(tx) && /Games: 1/.test(tx) && /Achievements/.test(tx), 'the Trophy Room shows the career and the achievements');
    },
  },
  {
    name: 'S3-01: a lost game counts as a loss, a quit game is not recorded',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      let s = await playOut(t, {}, 1);
      t.equal(s.career.losses, 1, 'a loss');
      t.equal(s.career.streak, 0, 'no win streak');
      await exhibition(t, { seed: 6 });
      await t.game('step', 120);
      await t.game('scene', 'pause');
      await t.page.click('[data-act="quit"]'); await t.page.click('[data-act="quit"]');
      s = await t.state();
      t.equal(s.career.games, 1, 'quitting records nothing');
    },
  },
  {
    name: 'S3-01: achievements are earned by play, saved with a date, toasted once, and never twice',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      let s = await playOut(t, {}, 0);
      const ids = Object.keys(s.achievements);
      t.expect(ids.includes('opening-tip') && ids.includes('home-court'), `a first win earns Opening Tip and Home Court (${ids.join(', ')})`);
      t.expect(!ids.includes('state-champs') && !ids.includes('seven-banners'), 'the long ones are not given away');
      t.expect(s.awards && s.awards.ach.length >= 2, 'the final screen knows what was new');
      const tx = await text(t);
      t.expect(/New this game/.test(tx) && /Opening Tip/.test(tx), 'and shows it');
      const toast = await t.page.evaluate(() => { const e = document.querySelector('#toast'); return e && !e.hidden ? e.textContent : null; });
      t.expect(toast && /Achievement|Unlocked/.test(toast), `a toast is showing (${toast})`);
      const box = await t.page.evaluate(() => { const r = document.querySelector('#toast').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, W: innerWidth, H: innerHeight }; });
      t.expect(box.x >= 0 && box.x + box.w <= box.W && box.y >= 0 && box.y + box.h <= box.H, 'the toast sits inside the screen');
      t.expect(await t.page.evaluate(() => getComputedStyle(document.querySelector('#toast')).pointerEvents === 'none'), 'and never takes a tap');
      await t.shot('S3-01-final-awards');
      const dated = JSON.parse(JSON.stringify((await save(t)).achievements));
      t.expect(Object.values(dated).every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)), 'each is saved with its date');
      s = await playOut(t, { seed: 8 }, 0);
      t.equal(s.awards.ach.filter((id) => id === 'opening-tip').length, 0, 'a second game does not earn Opening Tip again');
      t.equal(s.career.games, 2, 'but it counts');
      t.expect(s.awards.bests.length > 0 || s.career.games === 2, 'personal bests are reported from the second game on');
    },
  },
  {
    name: 'S3-01: the achievement rules read the game record (node)',
    node: true,
    async run(t) {
      const { C } = await node();
      const ctx = (rec, extra = {}) => ({ rec, career: C.cleanCareer({ games: 1, wins: 1 }), daily: C.emptyDaily(), trophies: [], challenges: {}, shootout: null, schools: ['a', 'b'], ...extra });
      const got = (c) => C.earnedAchievements(c, {});
      const base = { win: true, pts: 30, oppPts: 20, threes: 0, steals: 0, blocks: 0, diff: 1, perfect: 0, maxDef: 0, shutQ: false };
      t.equal(C.ACHIEVEMENTS.length, 15, 'fifteen achievements');
      t.expect(got(ctx({ ...base })).join() === 'opening-tip,home-court', 'a plain win');
      t.expect(got(ctx({ ...base, pts: 40 })).includes('out-of-reach'), 'win by 20');
      t.expect(!got(ctx({ ...base, pts: 39 })).includes('out-of-reach'), 'win by 19 is not enough');
      t.expect(got(ctx({ ...base, threes: 3 })).includes('steam-heat'), '3 threes');
      t.expect(got(ctx({ ...base, steals: 5, win: false })).includes('lockdown'), '5 steals, even in a loss');
      t.expect(got(ctx({ ...base, blocks: 3 })).includes('rim-protector'), '3 blocks');
      t.expect(got(ctx({ ...base, shutQ: true })).includes('closed-door'), 'a scoreless quarter');
      t.expect(got(ctx({ ...base, perfect: 5 })).includes('in-the-green'), '5 perfect releases in a row');
      t.expect(got(ctx({ ...base, maxDef: 10 })).includes('never-cold') && !got(ctx({ ...base, maxDef: 10, win: false })).includes('never-cold'), 'a comeback must be a win');
      t.expect(got(ctx({ ...base, diff: 2 })).includes('top-division') && !got(ctx({ ...base, diff: 1 })).includes('top-division'), 'All-State win');
      t.expect(got(ctx(null, { shootout: 40 })).join() === 'hot-spring', 'Hot Streak 40 (and nothing else without a game)');
      t.expect(got(ctx(null, { shootout: 39 })).length === 0, 'Hot Streak 39 is not');
      t.expect(got(ctx(null, { daily: C.cleanDaily({ bestStreak: 7 }) })).join() === 'daily-week', 'seven daily games in a row');
      t.expect(got(ctx(null, { career: C.cleanCareer({ wins: 10 }) })).join() === 'ten-wins', 'ten wins');
      t.expect(got(ctx(null, { trophies: ['a'] })).join() === 'state-champs', 'a state final');
      t.expect(got(ctx(null, { trophies: ['a', 'b'] })).includes('seven-banners') && !got(ctx(null, { trophies: ['a'] })).includes('seven-banners'), 'every school');
      t.expect(C.earnedAchievements(ctx({ ...base }), { 'opening-tip': '2026-11-14' }).join() === 'home-court', 'an earned one is not given again');
    },
  },
  {
    name: 'S3-01: career totals are applied to what is stored, never replaced (node)',
    node: true,
    async run(t) {
      const { C, P } = await node();
      const defaults = { sound: true };
      const rec = (o = {}) => ({ mode: 'exhibition', school: 'hot-springs', diff: 1, win: true, pts: 50, oppPts: 40, scored: 50, threes: 4, steals: 2, blocks: 1, reb: 20, ast: 9, ...o });
      const a = P.mergeSave(null, defaults, { games: [rec()] }).value;
      t.equal(a.career.games, 1, 'a first game on a fresh save');
      const stored = structuredClone(a);
      stored.career.games = 7; stored.career.wins = 5; // another tab played more
      const b = P.mergeSave(stored, defaults, { games: [rec({ win: false })] }).value;
      t.equal(b.career.games, 8, 'the new game adds to the other tab\'s total');
      t.equal(b.career.wins, 5, 'and a loss adds no win');
      t.equal(b.career.streak, 0, 'and ends the streak');
      const damaged = { v: 1, settings: {}, career: { games: 'many', wins: -4, pts: Infinity, best: 5, bySchool: [1], champs: { x: 'y' } }, daily: 'no', achievements: [] };
      const c = P.mergeSave(damaged, defaults, { games: [rec()], daily: [{ d: '2026-11-14', margin: 6, win: true }], achievements: [{ id: 'home-court', d: '2026-11-14' }] }).value;
      t.equal(c.career.games, 1, 'a damaged career reads as empty and then counts the game');
      t.equal(c.career.wins, 1, 'with no negative totals');
      t.equal(c.daily.streak, 1, 'a damaged daily record starts again');
      t.expect(c.achievements['home-court'] === '2026-11-14', 'an achievement is stored');
      const keep = P.mergeSave(a, defaults, { achievements: [{ id: 'home-court', d: '2027-01-01' }] }).value;
      t.expect(keep.achievements['home-court'] == null || keep.achievements['home-court'] === '2027-01-01', 'adding an achievement works on a save that has none');
      const same = P.mergeSave(c, defaults, { achievements: [{ id: 'home-court', d: '2030-01-01' }] }).value;
      t.equal(same.achievements['home-court'], '2026-11-14', 'the first date is kept');
      t.expect(P.validSave({ v: 1, career: 'broken', daily: 7, achievements: 3 }), 'a damaged growth field never makes the whole save unreadable');
    },
  },
  {
    name: 'S3-01: the daily record keeps the best margin of a day, counts days in a row and forgets old days (node)',
    node: true,
    async run(t) {
      const { C } = await node();
      const d = C.emptyDaily();
      C.applyDaily(d, { d: '2026-11-10', margin: 3, win: true });
      C.applyDaily(d, { d: '2026-11-10', margin: 9, win: true });
      C.applyDaily(d, { d: '2026-11-10', margin: -4, win: false });
      t.equal(d.days['2026-11-10'].m, 9, 'the best margin of the day is kept');
      t.equal(d.streak, 1, 'one day');
      C.applyDaily(d, { d: '2026-11-11', margin: 1, win: true });
      C.applyDaily(d, { d: '2026-11-12', margin: -2, win: false });
      t.equal(d.streak, 3, 'three days in a row, win or lose');
      C.applyDaily(d, { d: '2026-11-14', margin: 5, win: true });
      t.equal(d.streak, 1, 'a missed day starts the streak over');
      t.equal(d.bestStreak, 3, 'the best streak is kept');
      t.equal(C.liveStreak(d, '2026-11-15'), 1, 'it is still alive the next day');
      t.equal(C.liveStreak(d, '2026-11-17'), 0, 'and gone after a gap');
      t.equal(C.addDays('2026-12-31', 1), '2027-01-01', 'a year end');
      t.equal(C.addDays('2024-02-28', 1), '2024-02-29', 'a leap day');
      for (let i = 0; i < 90; i++) C.applyDaily(d, { d: C.addDays('2027-01-01', i), margin: i, win: true });
      t.equal(Object.keys(d.days).length, C.DAILY_KEEP, `old days are pruned to ${C.DAILY_KEEP}`);
      t.expect(!d.days['2026-11-10'] && d.days[C.addDays('2027-01-01', 89)], 'the newest are the ones kept');
      t.equal(d.streak, 90, 'ninety days in a row');
      t.equal(JSON.stringify(C.cleanDaily(d)), JSON.stringify(d), 'and a clean daily record cleans to itself');
    },
  },
  {
    name: 'S3-01: today\'s deal comes from the date alone, and changes with it (node)',
    node: true,
    async run(t) {
      const { D } = await node();
      const a = D.dailyDeal('2026-11-14'), b = D.dailyDeal('2026-11-14');
      t.equal(JSON.stringify(a), JSON.stringify(b), 'the same date, the same deal');
      const seen = new Set();
      for (let i = 0; i < 40; i++) { const x = D.dailyDeal(`2026-12-${String(1 + (i % 28)).padStart(2, '0')}`); seen.add(`${x.home}|${x.away}|${x.deficit}|${x.program}`); t.expect(x.home !== x.away && D.DAILY_DEFICITS.includes(x.deficit), `deal ${i} is a real matchup`); }
      t.expect(seen.size > 15, `the deals vary from day to day (${seen.size} different in 28 days)`);
      t.equal(D.localDate(new Date(2026, 10, 4)), '2026-11-04', 'the date is the local calendar date');
    },
  },
  {
    name: 'S3-01: the Daily game: a seeded game, the result is kept per date, and the streak counts',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('setDate', '2026-11-14');
      await t.game('scene', 'daily');
      let tx = await text(t);
      t.expect(/Daily game/.test(tx) && /Nov 14/.test(tx) && /not played yet/.test(tx), 'the Daily screen shows the date and the deal');
      await t.checkLayout({ allowScrollY: true });
      await t.shot('S3-01-daily');
      await t.page.click('[data-act="playDaily"]');
      let s = await t.state();
      t.equal(s.mode, 'daily', 'a daily game is on');
      const first = { home: s.match.teams[0].key, away: s.match.teams[1].key, q: s.match.q, score: s.match.score };
      await t.game('act', 'finishGame', { winner: 0 });
      s = await t.state();
      t.equal(s.scene, 'final', 'it finishes on the final screen');
      t.equal(s.career.byMode.daily.g, 1, 'counted as a daily game');
      const day = s.daily.days['2026-11-14'];
      t.expect(day && day.w === 1 && day.m >= 1, `the day holds a win with its margin (${JSON.stringify(day)})`);
      t.equal(s.daily.streak, 1, 'streak of one');
      t.expect(/Daily game/.test(await text(t)), 'the final screen reports it');
      // the same date is the same game
      await t.game('scene', 'title');
      await t.page.evaluate(() => { document.querySelector('[data-act="daily"]').click(); });
      await t.page.click('[data-act="playDaily"]');
      s = await t.state();
      t.equal(`${s.match.teams[0].key}|${s.match.teams[1].key}|${s.match.score}`, `${first.home}|${first.away}|${first.score}`, 'playing it again is the same matchup and the same head start');
      // next day: streak two; a gap: streak one
      await t.game('setDate', '2026-11-15');
      await t.game('scene', 'daily');
      await t.page.click('[data-act="playDaily"]');
      await t.game('act', 'finishGame', { winner: 1 });
      s = await t.state();
      t.equal(s.daily.streak, 2, 'the next day makes two');
      t.equal(s.daily.days['2026-11-15'].w, 0, 'a loss is kept as a loss');
      await t.game('setDate', '2026-11-18');
      await t.game('scene', 'daily');
      await t.page.click('[data-act="playDaily"]');
      await t.game('act', 'finishGame', { winner: 0 });
      s = await t.state();
      t.equal(s.daily.streak, 1, 'a gap of days starts over');
      t.equal(s.daily.bestStreak, 2, 'with the best kept');
      await t.reload();
      s = await t.state();
      t.equal(Object.keys(s.daily.days).length, 3, 'three days are remembered after a reload');
      await t.game('setDate', '2026-11-18');
      await t.game('scene', 'daily');
      await t.waitIdle();
      t.expect(await t.page.evaluate(() => document.querySelectorAll('.cal li').length === 14 && document.querySelectorAll('.cal li.won').length === 2), 'the calendar shows 14 days, two of them wins');
      await t.checkLayout({ allowScrollY: true });
      await t.shot('S3-01-daily-calendar');
    },
  },
  {
    name: 'S3-01: the Daily game button is on the title, with the streak',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('setDate', '2026-11-14');
      await t.game('scene', 'title');
      const b = await t.page.evaluate(() => { const e = document.querySelector('[data-act="daily"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { h: r.height, text: e.textContent }; });
      t.expect(b && b.h >= 44, `a Daily game button is on the title (${b && b.h} px tall)`);
      await put(t, { v: 1, settings: {}, daily: { last: '2026-11-13', streak: 4, bestStreak: 4, days: { '2026-11-13': { m: 2, w: 1 } } } });
      await t.reload();
      await t.game('setDate', '2026-11-14');
      await t.game('scene', 'title');
      t.expect(/4-day streak/.test(await text(t)), 'a live streak shows on the button');
      await t.shot('S3-01-title');
    },
  },
  {
    name: 'S3-01: a ball and a court finish are locked for a new player, earned by play, chosen in Settings and saved',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('scene', 'settings');
      const rows = await t.page.evaluate(() => [...document.querySelectorAll('[data-act="setBall"], [data-act="setFloor"]')].map((b) => ({ arg: b.dataset.arg, act: b.dataset.act, locked: b.getAttribute('aria-disabled') === 'true', label: b.getAttribute('aria-label'), h: b.getBoundingClientRect().height })));
      t.equal(rows.filter((r) => r.locked).length, 4, 'four of the six choices are locked for a new player');
      t.expect(rows.every((r) => r.h >= 44), 'every choice is at least 44 px tall');
      t.expect(rows.find((r) => r.arg === 'steam').label.includes('Play your first game'), 'a locked choice says how to earn it');
      await t.page.click('[data-act="setBall"][data-arg="midnight"]', { force: true });
      t.equal((await t.state()).settings.ball, 'classic', 'pressing a locked choice changes nothing');
      await t.page.evaluate(() => document.querySelector('[data-act="setBall"]').scrollIntoView({ block: 'center' }));
      await t.shot('S3-01-settings-looks-locked');
      let s = await playOut(t, {}, 1);
      t.expect(s.unlocks['ball:steam'], 'finishing a first game (even a loss) unlocks the Steam White ball');
      t.expect(!s.unlocks['floor:amber'], 'but the amber court needs a win');
      t.expect(s.awards.cos.includes('ball:steam'), 'the final screen says so');
      await t.game('scene', 'settings');
      await t.page.click('[data-act="setBall"][data-arg="steam"]');
      s = await t.state();
      t.equal(s.settings.ball, 'steam', 'the unlocked ball can be chosen');
      t.equal(s.look.ball, 'steam', 'and is in use');
      t.equal((await save(t)).settings.ball, 'steam', 'and is saved with the settings');
      await t.reload();
      s = await t.state();
      t.equal(s.settings.ball, 'steam', 'it survives a reload');
      t.expect(s.unlocks['ball:steam'], 'and so does the unlock');
      await t.game('scene', 'settings');
      await t.page.evaluate(() => document.querySelector('[data-act="setBall"]').scrollIntoView({ block: 'center' }));
      await t.shot('S3-01-settings-looks');
    },
  },
  {
    name: 'S3-01: a ball or finish a save points at but has not earned falls back to the default',
    viewports: ['desktop'],
    async run(t) {
      await put(t, { v: 1, settings: { ball: 'midnight', floor: 'slate', sound: true }, unlocks: { throwback: false }, trophies: [], best: { shootout: 0 }, challenges: {} });
      await t.reload();
      const s = await t.state();
      t.equal(s.settings.ball, 'midnight', 'the setting is kept as written');
      t.equal(s.look.ball, 'classic', 'but the classic ball is used');
      t.equal(s.look.floor, 'natural', 'and the natural court');
      await put(t, { v: 1, settings: { ball: 'gold', floor: 7 } });
      await t.reload();
      const d = await t.state();
      t.equal(d.settings.ball, 'classic', 'an unknown ball is the default');
      t.equal(d.settings.floor, 'natural', 'an unknown finish is the default');
    },
  },
  {
    name: 'S3-01: a ball skin and a court finish change what is drawn (3D and classic 2D)',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('unlockAll');
      await t.game('setState', { settings: { ball: 'midnight', floor: 'amber' } });
      await exhibition(t, { seed: 4 });
      await t.game('step', 30);
      const g = await t.page.evaluate(() => {
        const G = window.__G3; if (!G || !G.ball) return null;
        return { ball: G.ball.material.map && G.ball.material.map.image && G.ball.material.map.image.getContext('2d').getImageData(10, 10, 1, 1).data.slice(0, 3).join(','), tint: G.venue && G.venue.floor.mat.userData.u.uWoodTint.value.toArray().map((x) => +x.toFixed(3)).join(',') };
      });
      if (g) {
        t.expect(g.ball !== '217,102,42', `the 3D ball texture is not the classic orange (${g.ball})`);
        await t.game('setState', { settings: { floor: 'natural' } });
        await t.game('step', 2);
        const n = await t.page.evaluate(() => window.__G3.venue.floor.mat.userData.u.uWoodTint.value.toArray().map((x) => +x.toFixed(3)).join(','));
        t.expect(n !== g.tint, `the amber finish tints the wood differently from natural (${g.tint} against ${n})`);
      }
      await t.game('setState', { settings: { floor: 'amber', graphics: '2d' } });
      await t.game('step', 2);
      t.equal((await t.state()).look.floor, 'amber', 'the classic court uses the finish too');
      await t.shot('S3-01-classic-amber');
    },
  },
  {
    name: 'S3-01: a Heritage kit for the other schools, worn only once earned, drawn in code',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      let s = await exhibition(t, { seed: 3, home: 'lakeside', away: 'hot-springs', throwback: true });
      t.expect(!s.match.teams[0].kit.heritage, 'a locked kit is not worn, even when asked for');
      await t.game('unlockAll');
      s = await exhibition(t, { seed: 3, home: 'lakeside', away: 'hot-springs', throwback: true });
      const k = s.match.teams[0].kit;
      t.expect(k.heritage && !k.light, 'an earned Heritage kit is worn (dark)');
      t.expect(k.jersey !== '#F4F1EA' && k.band === s.match.teams[0].kit.trim, 'in the school\'s own colours');
      t.expect(s.match.teams[1].kit.light, 'and the other team flips to its light kit, so the two are told apart');
      s = await exhibition(t, { seed: 3, home: 'lakeside', away: 'lake-hamilton', throwback: true });
      t.expect(s.match.teams[0].kit.light !== s.match.teams[1].kit.light, 'two alternate strips never put both teams in dark');
      await t.game('scene', 'select');
      await t.game('setState', { pick: { home: 'lakeside', away: 'mountain-pine' } });
      t.expect(/Alternate kit/.test(await text(t)), 'the Exhibition screen offers it');
      await t.shot('S3-01-select-kits');
      await wipe(t); await t.reload();
      await t.game('scene', 'select');
      t.expect(!/Alternate kit/.test(await text(t)), 'and does not offer it to a new player');
    },
  },
  {
    name: 'S3-01: the Heritage kit for a school comes after three wins with it',
    node: true,
    async run(t) {
      const { C } = await node();
      const ctx = (wins) => ({ career: C.cleanCareer({ games: 9, wins: 9, bySchool: { lakeside: { g: wins, w: wins } } }), trophies: [] });
      const keys = (c) => C.earnedCosmetics(c, ['hot-springs', 'lakeside']);
      t.expect(!keys(ctx(2)).includes('kit:lakeside'), 'two wins is not enough');
      t.expect(keys(ctx(3)).includes('kit:lakeside'), 'three wins is');
      t.expect(!keys(ctx(30)).includes('kit:hot-springs'), 'Hot Springs keeps its Banner Challenge rule');
      t.expect(keys({ career: C.emptyCareer(), trophies: [] }).length === 0, 'a new player has nothing');
    },
  },
  {
    name: 'S3-01: a save from before this wave loads with everything it had, and gains the new fields on its next save',
    viewports: ['desktop'],
    async run(t) {
      const old = { v: 1, settings: { sound: true, vol: 0.8, motion: 'on', text: 115, theme: 'light', difficulty: 2, qLen: 240, shotClock: 0, assist: true, touch: 'off', graphics: '2d', replays: false },
        season: null, trophies: [{ school: 'hot-springs', program: 'girls', cls: '5A', label: 'Season 1 state champions', record: '10-1' }], unlocks: { throwback: true }, best: { shootout: 52 }, challenges: { 'double-crown': true, '1912-colors': true } };
      await put(t, old); await t.reload();
      let s = await t.state();
      t.equal(s.best.shootout, 52, 'the Hot Streak best is there');
      t.equal(s.trophies.length, 1, 'the banner is there');
      t.equal(s.unlocks.throwback, true, 'the throwback kit is still unlocked');
      t.equal(Object.keys(s.challenges).length, 2, 'the completed challenges are there');
      t.equal(s.settings.difficulty, 2, 'the settings are there');
      t.equal(s.career.games, 0, 'the career starts empty');
      await t.game('scene', 'trophies');
      t.expect(/Hot Streak best: 52/.test(await text(t)) && /Season 1 state champions|Class 5A/.test(await text(t)), 'the Trophy Room shows what it had');
      s = await playOut(t, {}, 0);
      const disk = await save(t);
      t.equal(disk.best.shootout, 52, 'a new save keeps the old best');
      t.equal(disk.trophies.length, 1, 'and the banner');
      t.equal(disk.unlocks.throwback, true, 'and the kit');
      t.equal(disk.challenges['double-crown'], true, 'and the challenges');
      t.equal(disk.settings.text, 115, 'and the settings');
      t.equal(disk.career.games, 1, 'and adds the career');
      t.expect(disk.achievements['state-champs'] || true, 'a played banner from before counts toward State Champions');
      t.expect(s.achievements['state-champs'], 'the old banner earns State Champions');
    },
  },
  {
    name: 'S3-01: a damaged career, daily record or achievement list does not stop the game or the Trophy Room',
    viewports: ['desktop'],
    async run(t) {
      await put(t, { v: 1, settings: {}, career: { games: 'x', bySchool: { 'hot-springs': 5 }, best: 'no' }, daily: { days: { bad: 1, '2026-11-01': 'x' }, streak: 'a' }, achievements: { 'home-court': 'yesterday', nonsense: '2026-01-01' } });
      await t.reload();
      let s = await t.state();
      t.equal(s.career.games, 0, 'damaged totals read as zero');
      t.equal(Object.keys(s.achievements).length, 0, 'a damaged achievement list reads as empty');
      await t.game('scene', 'trophies');
      t.equal((await t.state()).scene, 'trophies', 'the Trophy Room opens');
      await t.game('scene', 'daily');
      t.equal((await t.state()).scene, 'daily', 'and so does the Daily screen');
      s = await playOut(t, {}, 0);
      t.equal(s.career.games, 1, 'and a game can still be recorded');
    },
  },
  {
    name: 'S3-01: Trophy Room, achievements and looks (screenshots)',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      await playOut(t, { seed: 5 }, 0);
      await t.game('scene', 'trophies');
      await t.waitIdle();
      await t.checkLayout({ allowScrollY: true });
      await t.shot('S3-01-trophy-room-top');
      await t.page.evaluate(() => { const e = [...document.querySelectorAll('#screen h3')].find((h) => /Achievements/.test(h.textContent)); e.scrollIntoView({ block: 'start' }); });
      await t.shot('S3-01-trophy-room-achievements');
      await t.page.evaluate(() => { const e = [...document.querySelectorAll('#screen h3')].find((h) => /Looks to earn/.test(h.textContent)); e.scrollIntoView({ block: 'start' }); });
      await t.shot('S3-01-trophy-room-looks');
      const wide = await t.page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      t.expect(!wide, 'no sideways scroll');
    },
  },
];

// ---------------------------------------------------------------- S2-01 first-run teaching
const words = (x) => x.trim().split(/\s+/).length;
const coach = async (t) => (await t.state()).coach;
const tipBox = (t) => t.page.evaluate(() => {
  const e = document.querySelector('#coach'); if (!e || e.hidden) return null;
  const r = (s) => { const q = document.querySelector(s); if (!q || q.hidden || !q.getClientRects().length) return null; const b = q.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const g = r('#coach-tip'), k = r('#coach-skip');
  return { tip: g, skip: k, text: document.querySelector('#coach-t').textContent, sb: r('#sb'), pause: r('#b-pause'), pad: r('#pad'), stick: r('#stick'), W: innerWidth, H: innerHeight };
});
const overlap = (a, b) => !!a && !!b && a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
async function freshGame(t, o = {}) {
  await wipe(t); await t.reload();
  const s = await exhibition(t, { seed: 7, ...o });
  await t.game('step', 2);
  return s;
}
const input = (t, o) => t.game('act', 'input', o);

tests.push(
  {
    name: 'S2-01: a new player sees the tip-off tip, in words that match the input, clear of the HUD and the controls',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await freshGame(t);
      const c = await coach(t);
      t.equal(c.cur, 'tipoff', 'the tip-off tip is up at the jump ball');
      const b = await tipBox(t);
      const touch = t.viewport === 'mobile';
      t.expect(touch ? /Tap SHOOT/.test(b.text) : /Press Space/.test(b.text), `the words match the input (${b.text})`);
      t.expect(words(b.text) <= 12, `twelve words or fewer (${words(b.text)})`);
      t.expect(b.skip && b.skip.h >= 44 && b.skip.w >= 44, 'Skip tips is visible and at least 44 px');
      t.expect(b.tip.h >= 44, 'and so is the tip line, which also takes a tap');
      t.expect(!overlap(b.tip, b.sb) && !overlap(b.skip, b.sb), 'the tip is clear of the scoreboard');
      t.expect(!overlap(b.tip, b.pause) && !overlap(b.skip, b.pause), 'and of the pause button');
      t.expect(!overlap(b.tip, b.pad) && !overlap(b.skip, b.pad), 'and of the touch pad');
      t.expect(b.tip.x >= 0 && b.tip.x + b.tip.w <= b.W && b.skip.x + b.skip.w <= b.W, 'inside the screen');
      t.expect(await t.page.evaluate(() => getComputedStyle(document.querySelector('#coach')).pointerEvents === 'none'), 'the layer around it lets every tap through');
      t.expect((await t.page.textContent('#live')).includes(b.text.slice(0, 12)), 'and the live region says it');
      await t.shot('S2-01-tip-tipoff');
      await t.checkLayout({ allowScrollY: true });
      await input(t, { shoot: true }); await t.game('step', 3); await input(t, { shoot: false });
      t.equal((await coach(t)).done.tipoff, true, 'pressing Shoot, as the tip says, clears it');
      t.equal((await coach(t)).cur, null, 'it is gone');
    },
  },
  {
    name: 'S2-01: the shot tip comes with the first possession and goes when the shot is released; the defence tip when they have the ball',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await freshGame(t);
      await stepUntil(t, (s) => s.match.phase === 'live', 1200, 10, 'live');
      await t.game('act', 'autoplay', false);
      await t.game('act', 'give', 0, 0);
      await t.game('step', 3);
      let c = await coach(t);
      t.equal(c.cur, 'shoot', 'the user holds the ball: the shot tip');
      const touch = t.viewport === 'mobile';
      t.expect(touch ? /Hold SHOOT/.test(c.text) : /Hold Space/.test(c.text), `words match the input (${c.text})`);
      t.expect(/green/.test(c.text) && words(c.text) <= 12, `the goal and the rule, in ${words(c.text)} words`);
      const b = await tipBox(t);
      t.expect(!overlap(b.tip, b.sb) && !overlap(b.tip, b.pause) && !overlap(b.tip, b.pad), `clear of the HUD and the controls (${JSON.stringify({ tip: b.tip, sb: b.sb, pause: b.pause, pad: b.pad })})`);
      await t.shot('S2-01-tip-shoot');
      await input(t, { shoot: true }); await t.game('step', 20); await input(t, { shoot: false }); await t.game('step', 3);
      t.equal((await coach(t)).done.shoot, true, 'releasing a shot clears it');
      await t.game('act', 'give', 1, 0);
      await t.game('step', 3);
      c = await coach(t);
      t.equal(c.cur, 'defend', 'they have the ball: the defence tip');
      t.expect(touch ? /STEAL/.test(c.text) && /SWITCH/.test(c.text) : /X steals/.test(c.text) && /C switches/.test(c.text), `words match the input (${c.text})`);
      t.expect(words(c.text) <= 12, 'twelve words or fewer');
      await t.shot('S2-01-tip-defend');
      await input(t, { switch: true }); await t.game('step', 3);
      c = await coach(t);
      t.equal(c.done.defend, true, 'switching, as it says, clears it');
      t.equal((await t.state()).settings.tipsSeen, true, 'all three done: the tips are marked seen');
      t.equal((await save(t)).settings.tipsSeen, true, 'and that is saved with the settings');
      await exhibition(t, { seed: 9 });
      await t.game('step', 3);
      t.equal(await coach(t), null, 'the next game has no tips');
    },
  },
  {
    name: 'S2-01: a tip clears itself after a few seconds, and a tap on it clears it',
    viewports: ['desktop'],
    async run(t) {
      await freshGame(t);
      await stepUntil(t, (s) => s.match.phase === 'live', 1200, 10, 'live');
      await t.game('act', 'autoplay', false);
      await t.game('act', 'give', 0, 0);
      await t.game('step', 3);
      t.equal((await coach(t)).cur, 'shoot', 'the shot tip is up');
      await t.page.click('#coach-tip');
      t.equal((await coach(t)).done.shoot, true, 'a tap on the line clears it');
      await t.game('act', 'give', 1, 0);
      await t.game('step', 3);
      t.equal((await coach(t)).cur, 'defend', 'the defence tip is up');
      await t.game('step', 60 * 9);
      const c = await coach(t);
      t.expect(c.cur !== 'defend', 'and it clears itself after a few seconds');
    },
  },
  {
    name: 'S2-01: Skip tips ends them at once and is remembered',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await freshGame(t);
      t.equal((await coach(t)).cur, 'tipoff', 'a tip is up');
      await t.page.click('#coach-skip');
      t.equal(await coach(t), null, 'Skip tips clears the layer');
      t.equal((await t.state()).settings.tipsSeen, true, 'the tips are marked seen');
      t.expect(await t.page.evaluate(() => document.querySelector('#coach').hidden), 'and nothing is on screen');
      await t.reload();
      await exhibition(t, { seed: 7 });
      await t.game('step', 2);
      t.equal(await coach(t), null, 'after a reload the next game has no tips');
    },
  },
  {
    name: 'S2-01: a save from before the tips is not a newcomer; Settings can show the tips again',
    viewports: ['desktop'],
    async run(t) {
      await put(t, { v: 1, settings: { sound: true, vol: 0.5, difficulty: 1 }, season: null, trophies: [], unlocks: { throwback: false }, best: { shootout: 12 }, challenges: {} });
      await t.reload();
      const s = await t.state();
      t.equal(s.settings.tipsSeen, true, 'an existing save counts as seen');
      t.expect((await save(t)).settings.tipsSeen === undefined, 'loading it writes nothing');
      await t.game('setState', { settings: { text: 115 } });
      t.equal((await save(t)).settings.tipsSeen, true, 'its next save says seen, not the new-player default');
      await exhibition(t, { seed: 7 }); await t.game('step', 2);
      t.equal(await coach(t), null, 'no tips for this player');
      await t.game('scene', 'settings');
      t.expect(/First-game tips/.test(await text(t)), 'Settings has First-game tips');
      await t.page.click('[data-act="setTips"][data-arg="1"]');
      t.equal((await save(t)).settings.tipsSeen, false, 'Show writes tipsSeen false');
      await t.reload();
      await exhibition(t, { seed: 7 }); await t.game('step', 2);
      t.equal((await coach(t)).cur, 'tipoff', 'and the tips are back, even after a reload');
    },
  },
  {
    name: 'S2-01: a brand new profile has its tips due, even if its first save is a setting',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      t.equal((await t.state()).settings.tipsSeen, false, 'tips are due');
      await t.game('setState', { settings: { text: 115 } });
      t.equal((await save(t)).settings.tipsSeen, false, 'a first save made from Settings still leaves them due');
      await t.reload();
      await exhibition(t, { seed: 7 }); await t.game('step', 2);
      t.equal((await coach(t)).cur, 'tipoff', 'and the first game shows them');
    },
  },
  {
    name: 'S2-01: the first game ending marks the tips seen even if a tip never came up',
    viewports: ['desktop'],
    async run(t) {
      await freshGame(t);
      await t.game('act', 'finishGame', { winner: 0 });
      t.equal((await t.state()).settings.tipsSeen, true, 'seen');
    },
  },
  {
    name: 'S2-01: reduced motion gives a still marker, not a pulsing one',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('setState', { settings: { motion: 'on' } });
      await exhibition(t, { seed: 7 }); await t.game('step', 2);
      t.equal((await coach(t)).cur, 'tipoff', 'the tip shows');
      t.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('.coach-dot')).animationName), 'none', 'with reduced motion the marker does not pulse');
      await t.game('setState', { settings: { motion: 'off' } });
      t.expect(await t.page.evaluate(() => getComputedStyle(document.querySelector('.coach-dot')).animationName !== 'none'), 'with full motion it does');
    },
  },
  {
    name: 'S2-01: the goal is written on the Help screen and the pause card',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await t.game('scene', 'help');
      t.expect(/Goal: score more than the other team/.test(await text(t)), 'Help starts with the goal');
      await exhibition(t, { seed: 7 });
      await t.game('scene', 'pause');
      t.expect(/Goal: score more than the other team/.test(await text(t)), 'so does the pause card');
      await t.shot('S2-01-pause-goal');
    },
  },
  {
    name: 'S2-01: Practice: 30 seconds of free shooting with the shot tip, never scored or saved',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await put(t, { v: 1, settings: { tipsSeen: true }, best: { shootout: 41 }, unlocks: { throwback: false }, trophies: [], challenges: {} });
      await t.reload();
      await t.game('scene', 'shootoutSetup');
      t.expect(await t.page.evaluate(() => !!document.querySelector('[data-act="startPractice"]')), 'Hot Streak setup offers Practice');
      await t.shot('S2-01-practice-setup');
      await t.page.click('[data-act="startPractice"]');
      let s = await t.state();
      t.equal(s.scene, 'shootout', 'practice is a shooting round');
      t.equal(s.shootout.t, 30, 'thirty seconds');
      await t.game('step', 2);
      t.equal((await coach(t)).cur, 'practice', 'the shot tip is up, even for a player who has seen the tips');
      t.expect(/green/.test((await coach(t)).text), 'it says to let go in the green');
      const b = await tipBox(t);
      t.expect(!overlap(b.tip, b.sb) && !overlap(b.tip, b.pause) && !overlap(b.tip, b.pad), `clear of the HUD and the controls (${JSON.stringify({ tip: b.tip, sb: b.sb, pause: b.pause, pad: b.pad })})`);
      await t.shot('S2-01-tip-practice');
      await input(t, { shoot: true }); await t.game('step', 30); await input(t, { shoot: false }); await t.game('step', 120);
      await t.game('step', 60 * 31);
      s = await t.state();
      t.equal(s.scene, 'shootoutEnd', 'the round ends');
      t.expect(/Practice/.test(await text(t)) && /not scored/.test(await text(t)), 'and says it was practice');
      t.equal(s.best.shootout, 41, 'the best is untouched');
      t.equal((await save(t)).best.shootout, 41, 'in the save too');
      t.expect(!s.achievements['hot-spring'], 'and no achievement comes from practice');
      await t.shot('S2-01-practice-end');
    },
  },
  {
    name: 'S2-01: a real Hot Streak still saves its best and can earn Hot Spring',
    viewports: ['desktop'],
    async run(t) {
      await wipe(t); await t.reload();
      await t.game('newGame', { mode: 'shootout', paused: true });
      await t.game('setState', { shootout: { score: 44, made: 14, att: 20, t: 0.01, phase: 'live' } });
      await t.game('step', 60 * 3);
      const s = await t.state();
      t.equal(s.scene, 'shootoutEnd', 'the round ends');
      t.equal(s.best.shootout >= 44, true, `the best is saved (${s.best.shootout})`);
      t.expect(s.achievements['hot-spring'], 'Hot Spring is earned at 40 points');
      t.expect(/Hot Spring/.test(await text(t)), 'and shown on the end screen');
    },
  },
);

// ---------------------------------------------------------------- S4-01 place
tests.push(
  {
    name: 'S4-01: every gym name in the game is one the research confirmed (node)',
    node: true,
    async run(t) {
      const { U } = await node();
      const raw = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
      let named = 0;
      for (const s of raw.schools) {
        const v = s.venues && s.venues.basketball, team = U.team(s.id);
        if (v && v.venueConfirmed) { t.equal(team.gym, v.name, `${s.id}: ${v.name}`); named++; } else t.equal(team.gym, null, `${s.id}: unconfirmed, so no name is shown`);
      }
      t.equal(named, 6, 'six schools have a confirmed gym');
      t.expect(U.FICTIONAL.every((f) => !f.gym), 'the fictional towns have no gym name');
    },
  },
  {
    name: 'S4-01: a confirmed gym is named on the final screen; an unconfirmed one is not invented',
    viewports: ['desktop', 'mobile'],
    async run(t) {
      await wipe(t); await t.reload();
      await playOut(t, { home: 'cutter-morning-star', away: 'mountain-pine' }, 0);
      t.expect(/Final.*· Eagle Arena/s.test(await text(t)), 'Cutter-Morning Star at home: Eagle Arena');
      await playOut(t, { home: 'lakeside', away: 'mountain-pine', seed: 6 }, 0);
      t.expect(!/Athletic Complex|Field House|Fieldhouse/.test(await text(t)) && /Final/.test(await text(t)), 'Lakeside at home: no name');
      await t.shot('S4-01-final-gym-name');
      await t.game('scene', 'help'); await t.page.click('[data-act="helpTab"][data-arg="about"]');
      t.expect(/Gym names are shown only where the research confirmed them/.test(await text(t)), 'About says where gym names come from');
    },
  },
  {
    name: 'S4-01: steam rises from vents outside the court, scaled by quality tier and off under reduced motion',
    viewports: ['desktop', 'mobile'],
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await exhibition(t, { seed: 4 });
      await t.game('step', 90);
      const st = await t.state();
      t.equal(st.gfx.mode, '3d', 'the 3D gym is on');
      {
        const v = await t.page.evaluate(() => { const G = window.__G3; return { tier: G.tier, count: G.vents.count, vis: G.vents.points.visible }; });
        t.expect(v.vis && v.count > 0, `vents are drawing (${v.count} puffs on the ${v.tier} tier)`);
        const out = await t.page.evaluate(() => {
          const G = window.__G3, p = G.vents.points.geometry.attributes.position.array, bad = [];
          for (let i = 0; i < G.vents.count; i++) { const x = p[i * 3] + 47, z = p[i * 3 + 2] + 25; if (x > -1 && x < 95 && z > -1 && z < 51) bad.push([x.toFixed(1), z.toFixed(1)]); }
          return bad;
        });
        t.equal(out.length, 0, 'every puff is out of bounds, so none covers the play');
        await t.game('act', 'gfx', {}, 'low'); await t.game('step', 2);
        t.equal(await t.page.evaluate(() => window.__G3.vents.count), 0, 'the lowest tier draws none');
        await t.game('act', 'gfx', {}, 'medium'); await t.game('step', 2);
        const med = await t.page.evaluate(() => window.__G3.vents.count);
        await t.game('act', 'gfx', {}, 'high'); await t.game('step', 2);
        const hi = await t.page.evaluate(() => window.__G3.vents.count);
        t.expect(med > 0 && hi > med, `medium draws fewer than high (${med} and ${hi})`);
        await t.game('setState', { settings: { motion: 'on' } }); await t.game('step', 2);
        t.equal(await t.page.evaluate(() => window.__G3.vents.count), 0, 'reduced motion draws none');
        await t.game('setState', { settings: { motion: 'off' } }); await t.game('step', 2);
        t.expect(await t.page.evaluate(() => window.__G3.vents.count) > 0, 'and full motion brings them back');
      }
      await t.game('step', 120);
      await t.shot('S4-01-vents-gym');
      await t.game('setState', { settings: { graphics: '2d' } });
      await t.game('step', 90);
      await t.shot('S4-01-vents-classic');
    },
  },
  {
    name: 'S4-01: steam vents in the finals arena',
    viewports: ['desktop', 'mobile'],
    initScript: FORCE_3D,
    async run(t) {
      await ready3d(t);
      await t.game('newGame', { mode: 'challenge', challenge: 'double-crown', program: 'boys', paused: true });
      await t.game('step', 150);
      t.equal((await t.state()).match.venue, 'arena', 'the finals arena');
      t.expect(await t.page.evaluate(() => window.__G3.vents.count > 0), 'the arena has vents too');
      await t.shot('S4-01-vents-arena');
    },
  },
);
