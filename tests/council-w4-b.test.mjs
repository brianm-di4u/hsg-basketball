import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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
