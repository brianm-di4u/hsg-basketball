import { exhibition } from './helpers.mjs';

// Wave 4, batch A: saves, lifecycle and robustness; controls, rules and play.

export const tests = [];

const KEY = 'hsg-hoops-v1';
const put = (t, v) => t.page.evaluate(([k, s]) => localStorage.setItem(k, typeof s === 'string' ? s : JSON.stringify(s)), [KEY, v]);
const rawSave = (t) => t.page.evaluate((k) => localStorage.getItem(k), KEY);
async function loadWith(t, v) { await put(t, v); await t.reload(); }

tests.push({
  name: 'C4-01: a save from a newer version is told on the title and is byte-for-byte the same after a full visit',
  async run(t) {
    const newer = JSON.stringify({ v: 2, settings: { text: 130, sound: false }, best: { shootout: 99 }, future: { a: [1, 2, 3] }, season: { shape: 'from the future' } });
    await loadWith(t, newer);
    t.expect(/newer version of the game/i.test(await t.page.textContent('#screen')), 'the title says the saved data is from a newer version');
    t.expect(/this visit is not being saved/i.test(await t.page.textContent('#screen')), 'the title says this visit is not being saved');
    t.equal((await t.state()).settings.text, 100, 'the game plays from defaults, not the newer save');
    await t.checkLayout();
    await t.shot('C4-01-newer-title');
    // A visit that would normally save: settings, a finished exhibition, a season started and simmed, a Hot Streak run.
    await t.page.click('[data-act="settings"]');
    await t.page.click('[data-act="setText"][data-arg="115"]');
    await t.page.click('[data-act="setSound"][data-arg="0"]');
    t.equal((await t.state()).settings.text, 115, 'the setting still takes effect in this tab');
    await exhibition(t, { seed: 5 });
    await t.game('act', 'finishGame');
    await t.game('newGame', { mode: 'season', seed: 3 });
    await t.game('act', 'sim');
    await t.game('newGame', { mode: 'shootout', seed: 4 });
    t.equal(await rawSave(t), newer, 'the stored record is byte-for-byte the same');
    await t.game('scene', 'settings');
    t.expect(/newer version of the game/i.test(await t.page.textContent('#screen')), 'Settings says so too');
    t.expect(!(await t.page.$('[data-act="resetSave"]')), 'there is no reset button for a newer save');
    t.equal(await rawSave(t), newer, 'still the same after Settings');
  },
});

tests.push({
  name: 'C4-01: a damaged save still says it is unreadable and offers a reset; a good save shows no notice',
  viewports: ['desktop'],
  async run(t) {
    await loadWith(t, '{"v":1,"best":{"shoot');
    await t.page.click('[data-act="settings"]');
    t.expect(/unreadable/i.test(await t.page.textContent('#screen')), 'a damaged save says it is unreadable');
    t.expect(!!(await t.page.$('[data-act="resetSave"]')), 'and has the reset button');
    await loadWith(t, { v: 1, settings: { text: 115 } });
    t.expect(!/newer version|unreadable|not being saved/i.test(await t.page.textContent('#screen')), 'a good save shows no notice');
  },
});
