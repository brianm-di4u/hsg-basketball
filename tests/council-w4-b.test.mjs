import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};

// Wave 4, batch B: polish across the game.

export const tests = [];

const KEY = 'hsg-hoops-v1';
const canVibrate = () => { Object.defineProperty(navigator, 'vibrate', { value: () => true, configurable: true, writable: true }); };

tests.push({
  name: 'C4-10: the Vibration row shows only where touch controls are in use, and the saved value is left alone',
  initScript: canVibrate,
  async run(t) {
    const row = async () => { await t.game('scene', 'settings'); return (await t.page.$('[aria-label="Vibration"]')) !== null; };
    const touchDevice = t.viewport === 'mobile';
    t.equal(await row(), touchDevice, touchDevice ? 'a phone that can vibrate shows the row' : 'a desktop that has navigator.vibrate but no touch does not show the row');
    await t.page.evaluate(() => document.querySelector('#screen').scrollTo?.(0, 99999));
    await t.shot('C4-10-settings-vibration');
    await t.game('setState', { settings: { touch: 'on' } });
    t.equal(await row(), true, 'touch controls set to Always show the row');
    await t.game('setState', { settings: { touch: 'off' } });
    t.equal(await row(), false, 'touch controls set to Never hide it, since nothing can buzz');
    await t.game('setState', { settings: { touch: 'auto', haptics: false } });
    await t.game('scene', 'settings');
    t.equal((await t.state()).settings.haptics, false, 'the saved choice is the same whether the row shows or not');
    await t.game('setState', { settings: { touch: 'on' } });
    await t.game('scene', 'settings');
    const on = await t.page.$eval('[data-act="setHaptics"][data-arg="0"]', (b) => b.getAttribute('aria-pressed'));
    t.equal(on, 'true', 'and the row, when it comes back, still reads Off');
    await t.checkLayout({ allowScrollY: true });
  },
});

tests.push({
  name: 'S2-13: one name for each setting on every screen, and the Playing tab is one-line bullets with the reach-in risk',
  async run(t) {
    const labels = async () => t.page.$$eval('#screen [role="group"] .seg-l', (els) => els.map((e) => e.textContent.trim()));
    const body = async () => t.page.innerText('#screen');
    for (const scene of ['select', 'seasonSetup', 'shootoutSetup']) {
      await t.game('scene', scene);
      const l = await labels();
      t.expect(!l.includes('Quarters') && !l.includes('Program'), `${scene}: no "Quarters" or "Program" label (${l.join(', ')})`);
    }
    await t.game('scene', 'select');
    let l = await labels();
    t.expect(l.includes('Quarter length') && l.includes('Boys / Girls team'), 'the exhibition setup says "Quarter length" and "Boys / Girls team"');
    await t.game('scene', 'seasonSetup');
    t.expect(/boys or girls team/i.test(await body()) && !/school and program/i.test(await body()), 'the season setup says "a boys or girls team", not "program"');
    t.expect(/size group your school plays in/i.test(await body()), 'the season setup glosses "Class"');
    await t.game('scene', 'settings');
    l = await labels();
    t.expect(l.includes('Quarter length'), 'Settings says "Quarter length"');
    await t.game('scene', 'help');
    await t.page.click('[data-act="helpTab"][data-arg="rules"]');
    t.expect(/Quarter length:/.test(await body()), 'the rules tab says "Quarter length"');
    await t.page.click('[data-act="helpTab"][data-arg="play"]');
    const tab = await t.page.$eval('.tabbody', (el) => ({
      paras: [...el.querySelectorAll(':scope > p')].length,
      items: [...el.querySelectorAll('li')].map((li) => li.textContent.trim()),
      text: el.innerText,
    }));
    t.equal(tab.paras, 0, 'the Playing tab has no paragraph blocks');
    t.expect(tab.items.length >= 20, `it is a list of tips (${tab.items.length})`);
    t.expect(tab.items.every((x) => x.length <= 150), `no tip is longer than 150 characters (longest ${Math.max(...tab.items.map((x) => x.length))})`);
    t.expect(/reaching in for a steal can be a foul/i.test(tab.text), 'the reach-in foul risk has its own line');
    t.expect(/Meter assist/.test(tab.text), 'Meter assist is explained');
    await t.shot('S2-13-help-playing');
    await t.checkLayout({ allowScrollY: true });
  },
});

const gesture = async (t) => {
  for (let k = 0; k < 20; k++) {
    await t.page.mouse.click(4, 4);
    try { await t.page.waitForFunction(() => window.__game.getState().audio.state === 'running', null, { timeout: 1500 }); return; } catch { /* click again */ }
  }
  t.fail('the audio context never reached running after a click');
};
const audio = (t) => t.page.evaluate(() => { const a = window.__game.getState().audio; return { gain: a.gain, goal: a.goal, state: a.state }; });
const settle = (t, goal) => t.page.waitForFunction((g) => { const a = window.__game.getState().audio; return Math.abs(a.gain - g) < 0.002; }, goal, { timeout: 8000 });

tests.push({
  name: 'S5-13: a volume change glides and Sound off takes the master to silence, then back',
  viewports: ['desktop'],
  async run(t) {
    await gesture(t);
    await t.game('scene', 'settings');
    await settle(t, (await audio(t)).goal);
    const start = await audio(t);
    // A suspended context does not advance, so a value that was assigned would already have jumped and one that is scheduled has not.
    await t.page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await t.page.waitForFunction(() => window.__game.getState().audio.state === 'suspended', null, { timeout: 8000 });
    await t.game('setState', { settings: { vol: 0.8 } });
    const after = await audio(t);
    t.expect(after.goal > start.goal, `the volume goal moved (${start.goal} to ${after.goal})`);
    t.equal(after.gain, start.gain, 'the gain has not jumped: the change is scheduled, not assigned');
    await gesture(t);
    await settle(t, after.goal);
    await t.page.keyboard.press('KeyM');
    t.equal((await audio(t)).goal, 0, 'Sound off sets the master goal to 0');
    await settle(t, 0);
    t.expect((await audio(t)).gain < 0.002, 'the master is silent, so a cue already sounding is cut');
    await t.page.keyboard.press('KeyM');
    await settle(t, after.goal);
    t.expect((await audio(t)).gain > 0.1, 'Sound on brings it back to the chosen volume');
  },
});

tests.push({
  name: 'C4-09: the starting fives are read to a screen reader once the first-run tip clears',
  viewports: ['desktop'],
  async run(t) {
    const heard = () => t.page.evaluate(() => window.__heard.slice());
    const listen = () => t.page.evaluate(() => {
      window.__heard = [];
      new MutationObserver(() => { const x = document.querySelector('#live').textContent.trim(); if (x && window.__heard[window.__heard.length - 1] !== x) window.__heard.push(x); }).observe(document.querySelector('#live'), { childList: true, characterData: true, subtree: true });
    });
    const play = (seed) => t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed, paused: true });
    // A first game: the tip is up, so the fives wait.
    await t.page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: { tipsSeen: false } })), KEY);
    await t.reload();
    await listen();
    await play(3);
    await t.game('step', 3);
    t.expect((await t.state()).coach.cur === 'tipoff', 'the tip-off tip is showing');
    let said = await heard();
    t.expect(said.some((x) => /jump for it|Press Space|ball reaches its peak/i.test(x)), 'the tip is read first');
    t.expect(!said.some((x) => /Starting fives/.test(x)), 'the fives are not read over the tip');
    await t.stepUntil((s) => !s.coach.cur, { max: 2000, chunk: 5, label: 'the tip to clear' });
    said = await heard();
    const i = said.findIndex((x) => /Starting fives/.test(x));
    t.expect(i > 0, `the fives are read after the tip clears (${said.length} announcements)`);
    t.expect(i > 0 && /Hot Springs/.test(said[i]) && /Lakeside/.test(said[i]), 'and name both fives');
    t.equal(said.filter((x) => /Starting fives/.test(x)).length, 1, 'once');
    // Tips off or seen: read at once, as before.
    await t.game('scene', 'title');
    await t.page.evaluate((k) => localStorage.setItem(k, JSON.stringify({ v: 1, settings: { tipsSeen: true } })), KEY);
    await t.reload();
    await listen();
    await play(4);
    await t.game('step', 3);
    said = await heard();
    t.expect(said.some((x) => /Starting fives/.test(x)), 'with no tip showing the fives are read straight away');
  },
});

const SAVE_2D = () => {
  try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { tipsSeen: true, graphics: '2d' } })); } catch (e) { /* storage blocked */ }
  window.__fonts = [];
  const d = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
  Object.defineProperty(CanvasRenderingContext2D.prototype, 'font', { get() { return d.get.call(this); }, set(v) { window.__fonts.push(v); d.set.call(this, v); }, configurable: true });
};

tests.push({
  name: 'S2-14: the canvas lettering follows the Text size setting, and the small print is 14 px',
  initScript: SAVE_2D,
  async run(t) {
    const sizes = async (text) => {
      await t.game('setState', { settings: { text } });
      await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 5, paused: true });
      await t.page.evaluate(() => { window.__fonts.length = 0; });
      await t.game('step', 3);
      await t.game('act', 'foul', 0, 'reach'); // a FOUL call-out
      await t.game('step', 2);
      await t.waitIdle();
      return t.page.evaluate(() => {
        const px = (re) => Math.max(0, ...window.__fonts.filter((f) => re.test(f)).map((f) => +/(\d+)px/.exec(f)[1]));
        return { popup: px(/Bebas/), you: px(/Barlow/) };
      });
    };
    const a = await sizes(100), b = await sizes(130), c = await sizes(115);
    t.expect(a.popup > 0 && a.you > 0, `the call-out and the YOU marker are drawn (${JSON.stringify(a)})`);
    t.expect(b.popup >= a.popup * 1.1, `the call-out is larger at 130% (${a.popup} to ${b.popup} px)`);
    t.expect(b.you >= a.you * 1.1, `the YOU label is larger at 130% (${a.you} to ${b.you} px)`);
    t.expect(c.popup >= a.popup && c.popup <= b.popup, `and 115% is between (${c.popup} px)`);
    await t.shot('S2-14-callout-130');
    await t.game('setState', { settings: { text: 100 } });
    await t.game('scene', 'title');
    const fine = await t.page.$$eval('.fine', (els) => els.filter((e) => e.offsetParent).map((e) => parseFloat(getComputedStyle(e).fontSize)));
    t.expect(fine.length > 0 && fine.every((x) => x >= 14), `every small-print line on the title is at least 14 px (${fine.join(', ')})`);
    await t.game('setState', { settings: { text: 130 } });
    await t.game('scene', 'title');
    await t.checkLayout({ allowScrollY: true });
    await t.shot('S2-14-title-130');
    await t.game('setState', { settings: { text: 100 } });
    await t.game('scene', 'help');
    await t.page.click('[data-act="helpTab"][data-arg="about"]');
    const src = await t.page.$$eval('.src', (els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    t.expect(src.length > 0 && src.every((x) => x >= 14), `and every fact-card source (${src.length}) is at least 14 px`);
    await t.checkLayout({ allowScrollY: true });
  },
});

const OLD_FACTS = ['hs-0185', 'hs-0225', 'hs-0226', 'hs-0238', 'hs-0258', 'hs-0259', 'hs-0260', 'hs-0272', 'hs-0273', 'hs-0274', 'hs-0275', 'hs-0278'];

tests.push({
  name: 'C4-04: the 25 approved town cards are in after the old ones, and a school still gets its own cards about half the time',
  node: true,
  async run(t) {
    const facts = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8')).facts;
    const approved = JSON.parse(fs.readFileSync(path.join(game, '../_council/owner-review/approved-local-facts.json'), 'utf8')).games['hsg-basketball'].cards;
    t.equal(facts.length, 39, '14 + 25 cards');
    t.equal(facts.slice(14).length, approved.length, 'the 25 new cards come after the 14');
    approved.forEach((c, i) => {
      const f = facts[14 + i];
      t.expect(f.id === c.id && f.tag === c.tag && f.text === c.text && f.source === c.source && JSON.stringify(f.schools || null) === JSON.stringify(c.schools || null), `card ${c.id} is as approved, in order`);
    });
    const { FACTS_LIST } = await load('data.js');
    const { pickFact } = await load('ui.js');
    t.equal(FACTS_LIST.length, 39, 'the game holds all 39');
    t.expect(FACTS_LIST.slice(0, 14).every((f, i) => f.id === facts[i].id), 'the first 14 keep their order');
    const share = (keys, n = 4000) => {
      const seen = new Set(); let mine = 0;
      for (let seed = 1; seed <= n; seed++) { const f = pickFact(seed, keys); seen.add(f.id); if (f.schools) mine++; }
      return { mine: mine / n, seen };
    };
    for (const keys of [['hot-springs', 'lakeside'], ['hot-springs', 'cutter-morning-star'], ['lake-hamilton', 'mountain-pine']]) {
      const r = share(keys);
      t.expect(r.mine > 0.45 && r.mine < 0.55, `${keys.join(' v ')}: about half the cards are about its schools (${(r.mine * 100).toFixed(0)}%)`);
      const eligible = FACTS_LIST.filter((f) => !f.schools || f.schools.some((k) => keys.includes(k)));
      t.equal(r.seen.size, eligible.length, `${keys.join(' v ')}: every eligible card comes up (${eligible.length})`);
    }
    const none = share(['cutter-morning-star', 'mountain-pine']);
    t.equal(none.mine, 0, 'a game with no school cards shows only the general ones');
    for (let seed = 1; seed <= 500; seed++) { const f = pickFact(seed, ['cutter-morning-star']); t.expect(!f.schools, 'a school card never shows in a game that does not involve its school'); if (f.schools) break; }
    t.equal(pickFact(7, ['hot-springs', 'lakeside']).id, pickFact(7, ['hot-springs', 'lakeside']).id, 'the same seed gives the same card');
  },
});

tests.push({
  name: 'C4-04: the longest card fits its place on the half-time card and the season hub',
  async run(t) {
    const facts = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8')).facts;
    const longest = facts.reduce((a, b) => (b.text.length + b.source.length > a.text.length + a.source.length ? b : a));
    await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', seed: 3, paused: true });
    await t.game('step', 60);
    await t.game('setState', { match: { t: 0.3 } });
    await t.stepUntil((s) => s.scene === 'break', { max: 900, chunk: 10, label: 'the quarter break' });
    const fit = async (where) => {
      const r = await t.page.evaluate((f) => {
        const el = document.querySelector('.card.fact');
        if (!el) return null;
        el.querySelector('.kicker').textContent = `Did you know? · ${f.tag}`;
        el.querySelectorAll('p')[1].textContent = f.text;
        el.querySelector('.src').textContent = `Source: ${f.source}`;
        const b = el.getBoundingClientRect(), W = document.documentElement.clientWidth, H = document.documentElement.clientHeight;
        return { l: b.left, r: b.right, t: b.top, b: b.bottom, W, H, over: el.scrollWidth > el.clientWidth + 1, docOver: document.documentElement.scrollWidth > W };
      }, longest);
      t.expect(!!r, `${where}: the fact card is shown`);
      if (!r) return;
      t.expect(r.l >= 0 && r.r <= r.W && !r.over && !r.docOver, `${where}: the longest card (${longest.id}, ${longest.text.length} characters) is inside the screen sideways (${Math.round(r.l)} to ${Math.round(r.r)} of ${r.W})`);
    };
    await fit('half-time');
    await t.shot('C4-04-longest-card-break');
    await t.checkLayout({ allowScrollY: true });
    await t.game('newGame', { mode: 'season', seed: 3 });
    await t.game('scene', 'hub');
    await fit('season hub');
    await t.checkLayout({ allowScrollY: true });
  },
});

tests.push({
  name: 'S4-10: on a phone in portrait the title card is a two-column block at the top and the attract camera aims up; desktop is as it was',
  initScript: () => { try { localStorage.setItem('hsg-hoops-v1', JSON.stringify({ v: 1, settings: { tipsSeen: true, graphics: '3d' } })); } catch (e) { /* storage blocked */ } },
  async run(t) {
    await t.game('scene', 'title');
    await t.page.waitForFunction(() => { const s = window.__game.getState(); return ['ready', 'failed', 'unsupported'].includes(s.gfx.state) && window.__game.isIdle() && document.body.classList.contains('gl') === (s.gfx.mode === '3d') && s.title.cam; }, null, { timeout: 30000 });
    const read = () => t.page.evaluate(() => {
      const p = document.querySelector('.title-panel').getBoundingClientRect(), H = innerHeight, W = innerWidth;
      const bs = [...document.querySelectorAll('.title-panel .menu .btn')].map((b) => b.getBoundingClientRect());
      const cols = new Set(bs.map((b) => Math.round(b.left)));
      return { top: p.top, bottom: p.bottom, H, W, n: bs.length, cols: cols.size, minH: Math.min(...bs.map((b) => b.height)), inside: bs.every((b) => b.left >= 0 && b.right <= W && b.bottom <= H), cam: window.__game.getState().title.cam, overflowX: document.documentElement.scrollWidth > W };
    });
    const r = await read();
    t.expect(r.n >= 8 && r.minH >= 44 && r.inside && !r.overflowX, `every menu button is on the screen and at least 44 px tall (${r.n} buttons, shortest ${Math.round(r.minH)} px)`);
    if (t.viewport === 'mobile') {
      t.expect(r.bottom <= r.H * 0.55, `the card ends in the top half (${Math.round(r.bottom)} of ${r.H} px; it was 719)`);
      t.equal(r.cols, 2, 'the menu is in two columns');
      t.expect(r.cam.fov > 42 && r.cam.aim > 5, `the camera looks wider and aims up (fov ${r.cam.fov}, aim height ${r.cam.aim})`);
      await t.shot('S4-10-title');
      // a season in progress adds a Continue button: still two columns, still on the screen
      await t.game('newGame', { mode: 'season', seed: 3 });
      await t.game('scene', 'title');
      await t.game('setState', { settings: { text: 130 } });
      const c = await read();
      t.expect(c.n === 9 && c.inside && !c.overflowX, `with Continue season and text at 130% every button is still on the screen (${c.n} buttons, card ends at ${Math.round(c.bottom)} of ${c.H} px)`);
      await t.checkLayout({ allowScrollY: true });
      await t.shot('S4-10-title-continue-130');
    } else {
      t.expect(r.bottom > r.H * 0.7, 'desktop: the card is the single column it was');
      t.equal(r.cam.fov, 42, 'desktop: the attract camera is unchanged (fov 42)');
      t.equal(r.cam.aim, 5, 'desktop: and aimed where it was');
      await t.shot('S4-10-title');
    }
  },
});
