import { click, contrastReport, waitFor } from './helpers.mjs';

export const tests = [
  {
    name: 'title screen',
    async run(t) {
      const s = await t.state();
      t.equal(s.scene, 'title', 'boots to the title');
      const txt = await t.page.textContent('#screen');
      for (const w of ['SPA CITY', 'HOOPS', 'Season', 'Exhibition', 'Hot Streak', 'Banner Challenges', 'Trophy Room', 'How to play', 'Settings', 'All players are fictional']) t.expect(txt.includes(w), `title shows "${w}"`);
      t.expect(t.loadMs < 2000, `hooks ready in ${t.loadMs} ms`);
      await t.shot('01-title');
      await t.checkLayout();
    },
  },
  {
    name: 'help screens',
    async run(t) {
      await click(t, 'help');
      let txt = await t.page.textContent('#screen');
      t.expect(/Space/.test(txt) && /Arrow keys/.test(txt) && /SHOOT/.test(txt), 'controls for keyboard and touch');
      await t.shot('02-help');
      await click(t, 'helpTab', 'play');
      txt = await t.page.textContent('#screen');
      t.expect(/PERFECT/.test(txt) && /shot meter/.test(txt), 'meter explained');
      await click(t, 'helpTab', 'rules');
      txt = await t.page.textContent('#screen');
      t.expect(/35 seconds/.test(txt) && /183-69/.test(txt), 'rules cite the shot clock');
      t.expect(/game's rules/.test(txt), 'rules framed as game rules');
      await t.shot('02b-help-rules');
      await click(t, 'helpTab', 'about');
      txt = await t.page.textContent('#screen');
      for (const w of ['Fountain Lake', 'Cutter-Morning Star', 'Jessieville', 'Mountain Pine', 'game colors', 'fictional towns', 'Bank OZK Arena', 'MIT']) t.expect(txt.includes(w), `about mentions ${w}`);
      await t.shot('02c-help-about');
      await t.checkLayout();
      await t.page.keyboard.press('Escape');
      t.equal((await t.state()).scene, 'title', 'Esc returns to the title');
    },
  },
];
