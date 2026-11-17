// Team definitions: the seven real Garland County schools (setting only, from shared/data/schools.json)
// plus clearly fictional out-of-county towns that fill schedules and brackets.
import { contrast, shade, clamp } from './util.js';
import { STYLE_NEUTRAL } from './rules.js';

/* global SCHOOLS, FACTS */
const RAW = typeof SCHOOLS !== 'undefined' ? SCHOOLS : globalThis.SCHOOLS;
const FACT_RAW = typeof FACTS !== 'undefined' ? FACTS : globalThis.FACTS;

export const CLASS_RANK = { '6A': 6, '5A': 5, '4A': 4, '3A': 3, '2A': 2 };

// Basketball title years by program. Lakeside's two titles do not say boys or girls ("any").
function titlesOf(s) {
  const t = s.titles || {};
  return { boys: t.basketballBoys || [], girls: t.basketballGirls || [], any: t.basketballUnspecified || [] };
}

export const COUNTY = RAW.schools.map((s) => ({
  key: s.id,
  name: s.name,
  short: s.short,
  abbr: s.abbr,
  city: s.city,
  mascot: s.mascot,
  mascotConcept: s.mascotConcept,
  colorNames: s.colorNames,
  colorsConfirmed: s.colorsConfirmed,
  colors: { ...s.colors },
  cls: s.classification.basketball,
  conf: (s.conference && s.conference.basketball) || null,
  tier: s.tier,
  crest: s.id,
  fictional: false,
  titles: titlesOf(s),
  // the home gym's name, only where the research confirmed it (S4-01); the others are shown as the school's home gym
  gym: s.venues && s.venues.basketball && s.venues.basketball.venueConfirmed ? s.venues.basketball.name : null,
  gymSeats: (s.venues && s.venues.basketball && s.venues.basketball.capacity) || null, // seats, only where the research found a figure (S4-14)
}));

// Fictional towns: invented compound names, invented colors. None is a real school.
const TOWNS = [
  ['cinderbrook', 'Fenwick Creek', 'Foxes', '#8A3B12', '#F2C14E'],
  ['quartz-hollow', 'Sawyer Ridge', 'Miners', '#3D4A57', '#E3E6EA'],
  ['bluemist', 'Tolliver Bluff', 'Herons', '#1D5F7A', '#BFE3EE'],
  ['ironleaf', 'Garrison Gap', 'Owls', '#2F3B2A', '#C9B458'],
  ['hollowpine', 'Lindsey Ford', 'Hawks', '#20553A', '#E8DDBF'],
  ['redclay', 'Dobbs Spur', 'Bison', '#7E2A1E', '#E7D3B0'],
  ['kettle-ford', 'Marlow Springs', 'Otters', '#4A3A6B', '#E9B949'],
  ['marrow-creek', 'Cobb Ridge', 'Badgers', '#2B2B2B', '#D96C3A'],
  ['ambergrove', 'Weatherby Bluff', 'Comets', '#5B2C83', '#F0A830'],
  ['lanternfield', 'Harlan Gap', 'Knights', '#183A63', '#D9D9D9'],
  ['copperbend', 'Teague Creek', 'Coyotes', '#6A3B1F', '#DDA15E'],
  ['fernhaven', 'Rutledge Spur', 'Falcons', '#245E52', '#F4E3B2'],
  ['saltlick', 'Ainsley Ford', 'Rangers', '#5C1F2E', '#C7CED6'],
  ['thistledown', 'Beckett Springs', 'Stags', '#3E2F5B', '#9FD3C7'],
];
export const FICTIONAL = TOWNS.map(([key, town, mascot, primary, secondary]) => ({
  key, name: `${town} High School`, short: town, abbr: town.includes(' ') ? town.split(' ').map((w) => w[0]).join('') : town.slice(0, 3).toUpperCase(),
  city: `${town} (fictional town)`, mascot, mascotConcept: 'monogram shield', colorNames: null, colorsConfirmed: false,
  colors: { primary, secondary, accent: '#FFFFFF' }, cls: null, conf: null, tier: 'mid', crest: 'mono', fictional: true,
  titles: { boys: [], girls: [], any: [] }, gym: null,
}));

// How each team plays (S3-03): data, so the owner can edit one line. See STYLE_NEUTRAL in rules.js for what the numbers mean.
const S = {
  balanced: STYLE_NEUTRAL,
  runGun: { name: 'Run and gun', blurb: 'Pushes the ball and shoots early.', pace: 1.2, three: 0.4, press: 0.2 },
  shooters: { name: 'Perimeter shooters', blurb: 'Lives and dies by the three.', pace: 1, three: 0.8, press: 0 },
  grind: { name: 'Grind it out', blurb: 'Slows the game down and works the clock.', pace: 0.95, three: -0.2, press: 0 },
  press: { name: 'Full-court press', blurb: 'Pressures the ball the whole floor.', pace: 1.1, three: 0, press: 1 },
  trap: { name: 'Trap and run', blurb: 'Traps at half court, then runs.', pace: 1.15, three: 0.2, press: 0.6 },
  inside: { name: 'Inside out', blurb: 'Looks for layups first.', pace: 1.05, three: -0.6, press: 0.15 },
};
const STYLE_OF = {
  'hot-springs': S.balanced, lakeside: S.shooters, 'lake-hamilton': S.runGun, 'fountain-lake': S.grind, 'cutter-morning-star': S.trap, jessieville: S.press, 'mountain-pine': S.inside,
  cinderbrook: S.runGun, 'quartz-hollow': S.grind, bluemist: S.shooters, ironleaf: S.inside, hollowpine: S.balanced, redclay: S.press, 'kettle-ford': S.trap,
  'marrow-creek': S.grind, ambergrove: S.runGun, lanternfield: S.shooters, copperbend: S.balanced, fernhaven: S.inside, saltlick: S.trap, thistledown: S.balanced,
};
for (const t of [...COUNTY, ...FICTIONAL]) t.style = STYLE_OF[t.key] || STYLE_NEUTRAL;

const ALL = new Map([...COUNTY, ...FICTIONAL].map((t) => [t.key, t]));
export const team = (key) => ALL.get(key);
export const allTeams = () => [...ALL.values()];

export const RIVALRIES = RAW.rivalries.map((r) => ({ teams: r.teams, label: r.label }));
export function rivalry(a, b) {
  return RIVALRIES.find((r) => r.teams.includes(a) && r.teams.includes(b)) || null;
}

// How full the home crowd's meter starts in the home gym (S4-14): a bigger gym starts higher, a rivalry higher again. The finals arena keeps 0.3.
export const GYM_CROWD = { small: 0.25, perSeat: 0.15, from: 1000, span: 1500, rival: 0.15 }; // a gym of unknown size, the extra for a full gym, where that scale starts and spans (seats), the rivalry bump
export function gymCrowd(t, awayKey) {
  const c = GYM_CROWD, seats = t && t.gymSeats;
  const base = seats ? c.small + c.perSeat * clamp((seats - c.from) / c.span, 0, 1) : c.small;
  return +clamp(base + (t && rivalry(t.key, awayKey) ? c.rival : 0), 0, 1).toFixed(2);
}
export const FINALS = { name: RAW.venues.basketballFinals.name, address: RAW.venues.basketballFinals.address, city: 'Hot Springs' };
export const FACTS_LIST = (FACT_RAW && FACT_RAW.facts) || [];

// Pennants for a home gym: the real title years for that program (plus Lakeside's unspecified ones), then the banners the
// player won there. Those are marked `mine` (drawn with a different trim), numbered as in the Trophy Room ("Season 3"), and
// only the latest MY_BANNERS hang, so the wall never runs out of room. `trophies` is the save's list; none means real titles only.
const MY_BANNERS = 3;
export function banners(key, program, trophies = []) {
  const t = team(key);
  if (!t) return [];
  let real = [];
  if (!t.fictional) {
    const own = (program === 'girls' ? t.titles.girls : t.titles.boys).map((y) => ({ year: y, label: program === 'girls' ? 'GIRLS STATE CHAMPS' : 'BOYS STATE CHAMPS' }));
    const any = t.titles.any.map((y) => ({ year: y, label: 'STATE CHAMPIONS' }));
    real = [...own, ...any].sort((a, b) => a.year - b.year);
  }
  const mine = [];
  trophies.forEach((x, i) => { if (x && x.school === key && x.program === program) mine.push({ year: i + 1, label: 'YOUR SEASON', mine: true }); });
  return [...real, ...mine.slice(-MY_BANNERS)];
}

// Jerseys. Home wears light, away wears dark; the alternate kit is always dark: Hot Springs' 1912-style throwback, or a
// "Heritage" strip for the other schools (a deeper shade of the school's own colour with a band in the second colour; S3-01).
export function kitFor(t, side, throwback = false) {
  const c = t.colors;
  const light = '#F4F1EA';
  if (throwback && t.key !== 'hot-springs') {
    const jersey = shade(c.primary, -0.35), num = contrast(c.secondary, jersey) >= 3 ? c.secondary : light;
    return { jersey, trim: c.secondary, num, shorts: shade(c.primary, -0.55), band: c.secondary, light: false, heritage: true };
  }
  if (throwback) return { jersey: '#151515', trim: '#D4A017', num: '#D4A017', shorts: '#151515', band: '#D4A017', light: false, throwback: true };
  if (side === 'home') {
    const num = contrast(c.primary, light) >= 3 ? c.primary : shade(c.primary, -0.5);
    return { jersey: light, trim: c.primary, num, shorts: light, band: c.secondary, light: true };
  }
  const num = contrast(c.secondary, c.primary) >= 3 ? c.secondary : '#FFFFFF';
  return { jersey: c.primary, trim: c.secondary, num, shorts: c.primary, band: c.secondary, light: false };
}
