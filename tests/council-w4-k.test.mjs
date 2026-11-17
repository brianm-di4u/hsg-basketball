import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};

// Clean-up pass after wave 4 (council/wave-4b): K-01 to K-04.

export const tests = [];

const KEY = 'hsg-hoops-v1';

// the owner's list (hoops-town-names.json, final_14, with Fenwick Creek for Pruitt Creek), by team id; mascots and colours stay as they were
const TOWN_NAMES = {
  cinderbrook: ['Fenwick Creek', 'Foxes'], 'quartz-hollow': ['Sawyer Ridge', 'Miners'], bluemist: ['Tolliver Bluff', 'Herons'], ironleaf: ['Garrison Gap', 'Owls'],
  hollowpine: ['Lindsey Ford', 'Hawks'], redclay: ['Dobbs Spur', 'Bison'], 'kettle-ford': ['Marlow Springs', 'Otters'], 'marrow-creek': ['Cobb Ridge', 'Badgers'],
  ambergrove: ['Weatherby Bluff', 'Comets'], lanternfield: ['Harlan Gap', 'Knights'], copperbend: ['Teague Creek', 'Coyotes'], fernhaven: ['Rutledge Spur', 'Falcons'],
  saltlick: ['Ainsley Ford', 'Rangers'], thistledown: ['Beckett Springs', 'Stags'],
};
const OLD_NAMES = ['Cinderbrook', 'Quartz Hollow', 'Bluemist', 'Ironleaf', 'Hollowpine', 'Redclay', 'Kettle Ford', 'Marrow Creek', 'Ambergrove', 'Lanternfield', 'Copperbend', 'Fernhaven', 'Saltlick', 'Thistledown'];

tests.push({
  name: 'K-02: the 14 invented towns show their new names, with the same ids and mascots, and every abbreviation is still unique',
  node: true,
  async run(t) {
    const { FICTIONAL, COUNTY, team } = await load('data.js');
    t.equal(FICTIONAL.length, 14, 'fourteen invented towns');
    for (const [id, [town, mascot]] of Object.entries(TOWN_NAMES)) {
      const x = team(id);
      t.expect(x && x.short === town && x.name === `${town} High School` && x.city === `${town} (fictional town)`, `${id} shows ${town}`);
      t.equal(x.mascot, mascot, `${id} keeps its mascot`);
    }
    t.equal(FICTIONAL.map((f) => f.key).join(','), Object.keys(TOWN_NAMES).join(','), 'same ids, same order');
    const abbr = [...COUNTY, ...FICTIONAL].map((x) => x.abbr);
    t.equal(new Set(abbr).size, abbr.length, `every abbreviation is unique (${abbr.join(' ')})`);
    for (const f of FICTIONAL) t.expect(/^[A-Z]{2,3}$/.test(f.abbr), `${f.key}: the abbreviation is short capitals (${f.abbr})`);
    const listed = JSON.parse(fs.readFileSync(path.join(game, 'tests/fixtures/hoops-town-names.json'), 'utf8')).final_14;
    t.equal(FICTIONAL.map((f) => f.short).join(','), listed.join(','), 'the names are the owner’s final list, in order');
    const files = ['src/js/data.js', 'src/js/ui.js', 'src/js/challenges.js', 'src/js/main.js', 'README.md', 'research/town-content.md', 'index.html'];
    for (const f of files) {
      const text = fs.readFileSync(path.join(game, f), 'utf8');
      const left = OLD_NAMES.filter((n) => text.includes(n));
      t.equal(left.length, 0, `${f} holds none of the old names${left.length ? ` (${left.join(', ')})` : ''}`);
    }
  },
});

tests.push({
  name: 'K-02: a season saved with the old teams shows the new names on the same teams',
  viewports: ['desktop'],
  async run(t) {
    await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'boys', length: 'short', seed: 11 });
    await t.game('act', 'seasonResult', 50, 40);
    t.expect(((await t.state()).season.games).every((g) => typeof g.opp === 'string' && !g.name), 'the season stores each opponent as a team id, not a name');
    await t.page.evaluate(([k, key]) => {
      const raw = JSON.parse(localStorage.getItem(key));
      raw.season.games[2].opp = k;
      localStorage.setItem(key, JSON.stringify(raw));
    }, ['cinderbrook', KEY]);
    await t.reload();
    await t.game('scene', 'hub');
    const hub = await t.page.innerText('#screen');
    t.expect(/Fenwick Creek/.test(hub), 'a game scheduled against the team saved as cinderbrook now reads Fenwick Creek');
    t.expect(!/Cinderbrook/.test(hub), 'and not the old name');
    await t.checkLayout({ allowScrollY: true });
    await t.shot('K-02-hub-new-name');
  },
});

tests.push({
  name: 'K-02: Help names two of the new towns',
  async run(t) {
    await t.game('scene', 'help');
    await t.page.click('[data-act="helpTab"][data-arg="about"]');
    const body = await t.page.innerText('#screen');
    t.expect(/Fenwick Creek, Sawyer Ridge and others\) are fictional towns/.test(body), 'the About tab lists two of them as fictional');
    await t.checkLayout({ allowScrollY: true });
  },
});

tests.push({
  name: 'K-03: the Credits line names the pep band and cheer squad cards, which the game ships and draws',
  async run(t) {
    const html = fs.readFileSync(path.join(game, 'index.html'), 'utf8');
    const tex = fs.readdirSync(path.join(game, 'assets')).filter((f) => /^tex\.[0-9a-f]+\.js$/.test(f));
    t.equal(tex.length, 1, 'one texture pack ships');
    t.expect(html.includes(tex[0]), 'the built page loads that pack');
    const pack = fs.readFileSync(path.join(game, 'assets', tex[0]), 'utf8');
    const groups = [...pack.matchAll(/"g":"([a-z]+)"/g)].map((m) => m[1]);
    t.expect(groups.includes('band') && groups.includes('cheer'), `the pack holds band and cheer sprites (${[...new Set(groups)].join(', ')})`);
    const venue = fs.readFileSync(path.join(game, 'src/js/gl/venue3d.js'), 'utf8');
    t.expect(/g: 'cheer'/.test(venue) && /'band'/.test(venue), 'and the venue builder places a cheer squad and a pep band from them');
    await t.game('scene', 'help');
    await t.page.click('[data-act="helpTab"][data-arg="about"]');
    const credits = await t.page.evaluate(() => [...document.querySelectorAll('#screen p')].map((p) => p.textContent).find((x) => x.includes('Credits') || x.includes('open-source')) || '');
    t.expect(/the photo crowd, pep band and cheer squad cards \(on the classic and lite views only\), maple floor and block-wall images were painted for this game with AI image generation/.test(credits), 'the sentence names them in the same style');
    t.expect(/Gyms, the arena and their lighting were built in Blender/.test(credits) && /everything else is drawn in code, and all sound is synthesized in the browser/.test(credits), 'and the rest of the paragraph is as it was');
    await t.checkLayout({ allowScrollY: true });
    await t.page.evaluate(() => [...document.querySelectorAll('#screen h3')].find((h) => h.textContent === 'Credits')?.scrollIntoView());
    await t.shot('K-03-credits');
  },
});

const seasonGame = async (t, o = {}) => {
  await t.seed(o.seed ?? 5);
  await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'boys', length: 'short', seed: o.seed ?? 5, play: true });
  await t.game('step', 30);
  if (o.score) { const ut = (await t.state()).match.user.team; await t.game('setState', { match: { score: ut === 0 ? o.score : [o.score[1], o.score[0]] } }); } // o.score is [the player, the opponent]
  await t.game('scene', 'pause');
};
const quit = async (t) => { await t.page.click('[data-act="quit"]'); await t.page.click('[data-act="quit"]'); };
const stored = (t) => t.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);

tests.push({
  name: 'K-01: the season pause card says Quit counts as a loss, before the player confirms, and only in a season game',
  async run(t) {
    await seasonGame(t);
    let card = await t.page.innerText('#screen');
    t.expect(/Quit game \(counts as a loss\)/.test(card), 'the Quit button says it counts as a loss');
    t.expect(!/not recorded/i.test(card), 'and no longer says "not recorded"');
    await t.shot('K-01-pause-season');
    await t.page.click('[data-act="quit"]');
    card = await t.page.innerText('#screen');
    t.expect(/recorded as a loss/.test(card) && /Resume/.test(card), 'the first press asks, and says it will be recorded as a loss');
    t.equal((await t.state()).scene, 'pause', 'and the game is still there');
    await t.checkLayout({ allowScrollY: true });
    await t.shot('K-01-pause-season-asked');
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 6, paused: true });
    await t.game('scene', 'pause');
    card = await t.page.innerText('#screen');
    t.expect(/Quit to menu/.test(card) && !/loss/i.test(card.replace(/Yes, quit and lose/, '')), 'an exhibition card is as it was: "Quit to menu"');
    await t.page.click('[data-act="quit"]');
    t.expect(/This game will be lost\./.test(await t.page.innerText('#screen')) && !/recorded/.test(await t.page.innerText('#screen')), 'and its warning does not mention the season');
  },
});

tests.push({
  name: 'K-01: quitting a season game while behind records the score as it stands as a loss',
  viewports: ['desktop'],
  async run(t) {
    await seasonGame(t, { score: [31, 44] });
    const before = await stored(t);
    const g = (await t.state()).season.games[0];
    t.equal(before.season.l, 0, 'nothing recorded yet');
    await quit(t);
    const s = await t.state();
    t.equal(s.scene, 'hub', 'back on the hub');
    t.equal(s.season.l, 1, 'one loss');
    t.equal(s.season.w, 0, 'no win');
    t.equal(s.season.idx, 1, 'the schedule moved on');
    const r = s.season.games[0].result;
    t.expect(r.us === 31 && r.them === 44, `the score as it stood is stored (${r.us}-${r.them})`);
    const disk = await stored(t);
    t.expect(disk.season.l === 1 && disk.season.games[0].result.us === r.us, 'and it is saved');
    t.equal(g.opp, s.season.games[0].opp, 'against the same opponent');
    t.equal(s.career.games, 0, 'it is not a career game, and no award is given');
  },
});

tests.push({
  name: 'K-01: quitting while ahead or tied is still a loss: the opponent is given one more point than the player',
  viewports: ['desktop'],
  async run(t) {
    for (const [mine, theirs, wantThem] of [[40, 22, 41], [25, 25, 26], [0, 0, 1]]) {
      await seasonGame(t, { score: [mine, theirs] });
      await quit(t);
      const s = await t.state(), r = s.season.games[0].result;
      t.equal(s.season.l, 1, `${mine}-${theirs}: recorded as a loss`);
      t.equal(s.season.w, 0, `${mine}-${theirs}: not a win`);
      t.expect(r.us === mine && r.them === wantThem, `${mine}-${theirs}: stored as ${mine}-${wantThem} (${r.us}-${r.them})`);
      await t.page.evaluate((k) => localStorage.removeItem(k), KEY);
      await t.reload();
    }
  },
});

tests.push({
  name: 'K-01: standings after a quit: the record, the next game and a replayed season all work',
  viewports: ['desktop'],
  async run(t) {
    await seasonGame(t, { score: [10, 30] });
    await quit(t);
    let s = await t.state();
    t.equal(`${s.season.w}-${s.season.l}`, '0-1', 'the record reads 0-1');
    t.expect(/0-1/.test(await t.page.innerText('#screen')), 'and the hub shows it');
    t.equal(s.season.next && s.season.next.opp, s.season.games[1].opp, 'the next game is the second on the schedule');
    await t.game('act', 'seasonResult', 50, 40);
    await t.game('act', 'seasonResult', 50, 40);
    s = await t.state();
    t.equal(s.season.phase, 'bracket', 'the bracket starts after the last game');
    const rounds = s.season.bracket.rounds[0];
    const seed = rounds.flatMap((g) => [[g.a, g.seedA], [g.b, g.seedB]]).find(([k]) => k === 'hot-springs')[1];
    t.expect(seed >= 3, `a 2-1 record seeds below a 3-0 one (seed ${seed})`);
    await t.reload();
    s = await t.state();
    t.equal(s.season.l, 1, 'a reload keeps the quit loss');
  },
});

tests.push({
  name: 'K-01: quitting a playoff game is a loss that ends the run, and the card says so',
  viewports: ['desktop'],
  async run(t) {
    await t.game('newGame', { mode: 'season', school: 'hot-springs', program: 'boys', length: 'short', seed: 9 });
    for (let k = 0; k < 3; k++) await t.game('act', 'seasonResult', 50, 40);
    await t.page.click('[data-act="playSeason"]');
    let s = await t.state();
    t.equal(s.mode, 'season', 'a season game');
    t.equal(s.season.phase, 'bracket', 'in the bracket');
    await t.game('step', 20);
    await t.game('scene', 'pause');
    await t.page.click('[data-act="quit"]');
    t.expect(/ends your playoff run/.test(await t.page.innerText('#screen')), 'the warning says the run ends');
    await t.page.click('[data-act="quit"]');
    s = await t.state();
    t.equal(s.season.phase, 'done', 'the season is over');
    t.equal(s.season.eliminated, 'Quarterfinal', 'out in the Quarterfinal');
  },
});
