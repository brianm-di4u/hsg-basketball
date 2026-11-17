import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (f) => {
  if (!globalThis.SCHOOLS) globalThis.SCHOOLS = JSON.parse(fs.readFileSync(path.join(game, 'shared/data/schools.json'), 'utf8'));
  if (!globalThis.FACTS) globalThis.FACTS = JSON.parse(fs.readFileSync(path.join(game, 'data/facts.json'), 'utf8'));
  return import(pathToFileURL(path.join(game, 'src/js', f)).href);
};

// Clean-up pass after wave 4 (council/wave-4b): K-01 to K-04 (each item adds its tests as it lands).

export const tests = [];

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

