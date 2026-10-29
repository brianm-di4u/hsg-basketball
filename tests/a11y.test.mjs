import { click, contrastReport } from './helpers.mjs';

async function sweep(t, label) {
  const screens = ['title', 'select', 'hub', 'help', 'settings', 'challenges', 'trophies'];
  let fails = [];
  for (const sc of screens) {
    await t.game('scene', sc);
    await t.page.waitForTimeout(260);
    await t.waitForStable(); // the panel's fade-in can lag the timer on a busy machine
    const r = await contrastReport(t.page);
    fails = fails.concat(r.fails.map((f) => ({ ...f, sc })));
  }
  await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lake-hamilton', program: 'boys', user: 'home', seed: 4, paused: true });
  await t.game('step', 10);
  const r = await contrastReport(t.page);
  fails = fails.concat(r.fails.map((f) => ({ ...f, sc: 'scoreboard' })));
  for (const f of fails.slice(0, 8)) t.log(`${label} ${f.sc}: "${f.text}" ${f.ratio} < ${f.need} (${f.tag}.${f.cls})`);
  t.equal(fails.length, 0, `${label}: all text passes WCAG contrast`);
}

export const tests = [
  {
    name: 'contrast: day theme',
    colorScheme: 'light',
    async run(t) {
      await t.game('newGame', { mode: 'season', school: 'cutter-morning-star', program: 'girls', seed: 2 });
      await sweep(t, 'light');
    },
  },
  {
    name: 'contrast: night theme',
    colorScheme: 'dark',
    async run(t) {
      const s = await t.state();
      t.equal(s.settings.theme, 'auto', 'theme follows the system');
      t.expect(await t.page.evaluate(() => document.body.classList.contains('theme-dark')), 'night theme applied');
      await t.shot('31-dark-title');
      await t.game('newGame', { mode: 'season', school: 'mountain-pine', program: 'boys', seed: 2 });
      await t.shot('31b-dark-hub');
      await sweep(t, 'dark');
    },
  },
  {
    name: 'reduced motion',
    reducedMotion: true,
    async run(t) {
      const s = await t.state();
      t.equal(s.reduced, true, 'system preference honored');
      const cam0 = s.view.camX;
      await t.page.waitForTimeout(500);
      t.equal((await t.state()).view.camX, cam0, 'title demo is still');
      t.equal((await t.state()).loop, false, 'no animation loop on the title');
      await t.game('act', 'confetti');
      t.equal((await t.state()).fx, 0, 'confetti suppressed');
      await t.shot('32-reduced');
      // the setting overrides the system too
      await t.game('setState', { settings: { motion: 'off' } });
      t.equal((await t.state()).reduced, false, 'Full motion setting');
      await t.game('setState', { settings: { motion: 'auto' } });
    },
  },
  {
    name: 'settings persist; text size; keyboard-only menus',
    async run(t) {
      await click(t, 'settings');
      await click(t, 'setText', '130');
      await click(t, 'setVol', '0.25');
      await click(t, 'setAssist', '1');
      await click(t, 'setQ', '480');
      await click(t, 'setClock', '0');
      await click(t, 'setDiff', '0');
      await click(t, 'setMotion', 'on');
      await click(t, 'setSound', '0');
      await t.shot('03-settings');
      await t.checkLayout();
      await t.reload();
      const s = await t.state();
      const st = s.settings;
      t.expect(st.text === 130 && st.vol === 0.25 && st.assist === true && st.qLen === 480 && st.shotClock === 0 && st.difficulty === 0 && st.motion === 'on' && st.sound === false, 'all settings persisted');
      const fs = await t.page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
      t.equal(fs, '20.8px', 'text size 130%');
      await t.game('setState', { settings: { text: 100, motion: 'auto', sound: true, qLen: 120, shotClock: 35, difficulty: 1, assist: false } });
      // keyboard-only: the first focus is the primary button; Enter activates
      await t.game('scene', 'title');
      await t.page.keyboard.press('Tab');
      await t.page.keyboard.press('Shift+Tab');
      await t.page.keyboard.press('Enter');
      t.equal((await t.state()).scene, 'seasonSetup', 'Enter on the focused Season button');
      await t.page.keyboard.press('Escape');
      t.equal((await t.state()).scene, 'title', 'Esc backs out');
    },
  },
  {
    name: 'audio waits for a gesture; M mutes',
    async run(t) {
      let s = await t.state();
      t.equal(s.audio.ctx, false, 'no audio context before a gesture');
      await click(t, 'help');
      s = await t.state();
      t.equal(s.audio.ctx, true, 'audio starts after a click');
      await t.page.keyboard.press('m');
      s = await t.state();
      t.equal(s.settings.sound, false, 'M mutes');
      t.equal(s.audio.on, false, 'synth off');
      await t.page.keyboard.press('m');
      t.equal((await t.state()).settings.sound, true, 'M unmutes');
    },
  },
];
