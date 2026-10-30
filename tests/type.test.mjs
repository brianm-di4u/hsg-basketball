// The type floor: no visible text a player reads is set under 13 CSS px, on any menu, on desktop or phone.
// (Text-size settings only raise it.) The scoreboard and the touch deck are checked in a live game.

const SCREENS = ['title', 'select', 'settings', 'help', 'challenges', 'trophies', 'shootoutSetup'];

function smallTextInPage(min) {
  const out = [];
  for (const el of document.querySelectorAll('#screen *, #sb *, #pad *')) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const px = parseFloat(cs.fontSize);
    if (px === 0) continue; // deliberately hidden text (a colour swatch's name, for screen readers)
    if (px < min) out.push(`${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''} "${el.textContent.trim().slice(0, 24)}" ${px}px`);
  }
  return out;
}

export const tests = [
  {
    name: 'type: no menu or HUD text under 13 px',
    async run(t) {
      await t.page.waitForTimeout(200);
      for (const sc of SCREENS) {
        await t.game('scene', sc);
        await t.page.waitForTimeout(60);
        const small = await t.page.evaluate(smallTextInPage, 13);
        t.expect(small.length === 0, `${sc}: text under 13 px: ${small.slice(0, 6).join('; ')}`);
      }
      await t.seed(4);
      await t.game('newGame', { mode: 'exhibition', home: 'hot-springs', away: 'lakeside', program: 'boys', user: 'home', paused: true });
      await t.game('step', 60);
      const small = await t.page.evaluate(smallTextInPage, 13);
      t.expect(small.length === 0, `game HUD: text under 13 px: ${small.slice(0, 6).join('; ')}`);
    },
  },
];
