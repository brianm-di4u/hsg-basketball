// Team definitions: the seven real Garland County schools (setting only, from shared/data/schools.json)
// plus clearly fictional out-of-county towns that fill schedules and brackets.
import { contrast, shade } from './util.js';

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
}));

// Fictional towns: invented compound names, invented colors. None is a real school.
const TOWNS = [
  ['cinderbrook', 'Cinderbrook', 'Foxes', '#8A3B12', '#F2C14E'],
  ['quartz-hollow', 'Quartz Hollow', 'Miners', '#3D4A57', '#E3E6EA'],
  ['bluemist', 'Bluemist', 'Herons', '#1D5F7A', '#BFE3EE'],
  ['ironleaf', 'Ironleaf', 'Owls', '#2F3B2A', '#C9B458'],
  ['hollowpine', 'Hollowpine', 'Hawks', '#20553A', '#E8DDBF'],
  ['redclay', 'Redclay', 'Bison', '#7E2A1E', '#E7D3B0'],
  ['kettle-ford', 'Kettle Ford', 'Otters', '#4A3A6B', '#E9B949'],
  ['marrow-creek', 'Marrow Creek', 'Badgers', '#2B2B2B', '#D96C3A'],
  ['ambergrove', 'Ambergrove', 'Comets', '#5B2C83', '#F0A830'],
  ['lanternfield', 'Lanternfield', 'Knights', '#183A63', '#D9D9D9'],
  ['copperbend', 'Copperbend', 'Coyotes', '#6A3B1F', '#DDA15E'],
  ['fernhaven', 'Fernhaven', 'Falcons', '#245E52', '#F4E3B2'],
  ['saltlick', 'Saltlick', 'Rangers', '#5C1F2E', '#C7CED6'],
  ['thistledown', 'Thistledown', 'Stags', '#3E2F5B', '#9FD3C7'],
];
export const FICTIONAL = TOWNS.map(([key, town, mascot, primary, secondary]) => ({
  key, name: `${town} High School`, short: town, abbr: town.includes(' ') ? town.split(' ').map((w) => w[0]).join('') : town.slice(0, 3).toUpperCase(),
  city: `${town} (fictional town)`, mascot, mascotConcept: 'monogram shield', colorNames: null, colorsConfirmed: false,
  colors: { primary, secondary, accent: '#FFFFFF' }, cls: null, conf: null, tier: 'mid', crest: 'mono', fictional: true,
  titles: { boys: [], girls: [], any: [] },
}));

const ALL = new Map([...COUNTY, ...FICTIONAL].map((t) => [t.key, t]));
export const team = (key) => ALL.get(key);
export const allTeams = () => [...ALL.values()];

export const RIVALRIES = RAW.rivalries.map((r) => ({ teams: r.teams, label: r.label }));
export function rivalry(a, b) {
  return RIVALRIES.find((r) => r.teams.includes(a) && r.teams.includes(b)) || null;
}

export const FINALS = { name: RAW.venues.basketballFinals.name, address: RAW.venues.basketballFinals.address, city: 'Hot Springs' };
export const FACTS_LIST = (FACT_RAW && FACT_RAW.facts) || [];

// Pennants for a home gym: the real title years for that program (plus Lakeside's unspecified ones).
export function banners(key, program) {
  const t = team(key);
  if (!t || t.fictional) return [];
  const own = (program === 'girls' ? t.titles.girls : t.titles.boys).map((y) => ({ year: y, label: program === 'girls' ? 'GIRLS STATE CHAMPS' : 'BOYS STATE CHAMPS' }));
  const any = t.titles.any.map((y) => ({ year: y, label: 'STATE CHAMPIONS' }));
  return [...own, ...any].sort((a, b) => a.year - b.year);
}

// Jerseys. Home wears light, away wears dark; a throwback kit is always dark.
export function kitFor(t, side, throwback = false) {
  const c = t.colors;
  const light = '#F4F1EA';
  if (throwback) return { jersey: '#151515', trim: '#D4A017', num: '#D4A017', shorts: '#151515', band: '#D4A017', light: false, throwback: true };
  if (side === 'home') {
    const num = contrast(c.primary, light) >= 3 ? c.primary : shade(c.primary, -0.5);
    return { jersey: light, trim: c.primary, num, shorts: light, band: c.secondary, light: true };
  }
  const num = contrast(c.secondary, c.primary) >= 3 ? c.secondary : '#FFFFFF';
  return { jersey: c.primary, trim: c.secondary, num, shorts: c.primary, band: c.secondary, light: false };
}
