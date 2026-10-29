// Fictional roster generator. Names are random pairings from generic pools; no list comes from a real roster.
import { hash, rnd, rint, pick, gauss, clamp, shuffle } from './util.js';
import { CLASS_RANK } from './data.js';

const FIRST_B = ['Avery', 'Bennett', 'Cal', 'Dante', 'Eli', 'Finn', 'Gabe', 'Hollis', 'Isaiah', 'Jalen', 'Kai', 'Landon', 'Marcus', 'Nico', 'Omar', 'Pierce', 'Quinn', 'Reid', 'Silas', 'Tate', 'Uriel', 'Vance', 'Wes', 'Xavier', 'Yusuf', 'Zeke', 'Andre', 'Brooks', 'Cyrus', 'Dorian', 'Ezra', 'Grady', 'Jace', 'Keon', 'Luis', 'Malik', 'Rowan', 'Theo', 'Darius', 'Mateo'];
const FIRST_G = ['Addie', 'Brielle', 'Cora', 'Dani', 'Ellis', 'Faith', 'Gia', 'Harper', 'Imani', 'Jada', 'Kenzie', 'Lena', 'Maya', 'Nia', 'Olive', 'Paige', 'Quinn', 'Reese', 'Sasha', 'Tessa', 'Vivi', 'Wren', 'Yara', 'Zoe', 'Aaliyah', 'Bree', 'Camila', 'Dior', 'Esme', 'Gracie', 'Hallie', 'Jordyn', 'Kiara', 'Lucia', 'Marisol', 'Nora', 'Remy', 'Sloane', 'Talia', 'Willa'];
const LAST = ['Abbott', 'Alvarez', 'Barlow', 'Beck', 'Bishop', 'Boone', 'Brennan', 'Calloway', 'Cantrell', 'Carver', 'Castillo', 'Coleman', 'Crane', 'Dalton', 'Delgado', 'Ellison', 'Farris', 'Fenwick', 'Fuller', 'Garrison', 'Greer', 'Hale', 'Harlan', 'Hayes', 'Holloway', 'Ingram', 'Jennings', 'Keller', 'Kirby', 'Lang', 'Lowell', 'Maddox', 'Mercer', 'Monroe', 'Nash', 'Navarro', 'Okafor', 'Pace', 'Pruitt', 'Quarles', 'Ramsey', 'Reyes', 'Rhodes', 'Sawyer', 'Sloan', 'Stroud', 'Talley', 'Tatum', 'Underwood', 'Vaughn', 'Voss', 'Whitaker', 'Wilder', 'Yates', 'Zamora', 'Pickett', 'Odum', 'Lyle', 'Doss', 'Embry'];
const NUMBERS = [0, 1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 40, 41, 42, 43, 44, 45, 50, 51, 52, 53, 54, 55];
// positions for roster slots 0..9: starters PG, G, F, F, C then bench
const POS = ['G', 'G', 'F', 'F', 'C', 'G', 'G', 'F', 'F', 'C'];
const SKIN = ['#F1C9A5', '#E0AC86', '#C68863', '#A86B45', '#7D4A2A', '#5A3420'];
const HAIR_C = ['#1E1712', '#3B2416', '#6B4423', '#A8743A', '#D2B26A', '#2B2B2B'];
const HAIR_B = ['short', 'buzz', 'high', 'curl', 'short', 'band'];
const HAIR_G = ['pony', 'bun', 'puffs', 'braids', 'pony', 'short'];

// Base strength per class (game balance only).
const BASE = { 6: 0.6, 5: 0.57, 4: 0.53, 3: 0.5, 2: 0.47 };

export function makeRoster(teamKey, program, cls, seed = 1) {
  const o = { rs: hash(`${teamKey}|${program}|${seed}`) | 0 };
  const girls = program === 'girls';
  const base = BASE[CLASS_RANK[cls] || 4];
  const nums = shuffle(o, NUMBERS.slice());
  const lasts = shuffle(o, LAST.slice());
  const firsts = shuffle(o, (girls ? FIRST_G : FIRST_B).slice());
  const players = [];
  for (let i = 0; i < 10; i++) {
    const pos = POS[i];
    const lvl = clamp(base + (i < 5 ? 0.1 - i * 0.012 : -0.02 - (i - 5) * 0.025) + gauss(o) * 0.05, 0.25, 0.92);
    const r = (bias) => clamp(lvl + bias + gauss(o) * 0.07, 0.15, 0.97);
    // heights in inches
    const h = girls ? { G: [63, 68], F: [67, 72], C: [70, 75] }[pos] : { G: [69, 74], F: [73, 77], C: [76, 80] }[pos];
    const height = rint(o, h[0], h[1]);
    const p = {
      id: `${teamKey}-${program}-${i}`,
      first: firsts[i], last: lasts[i], num: nums[i], pos, height,
      grade: pick(o, [9, 10, 11, 11, 12, 12]),
      sht: r(pos === 'G' ? 0.06 : pos === 'C' ? -0.1 : 0),
      ins: r(pos === 'C' ? 0.08 : pos === 'G' ? -0.03 : 0.03),
      pas: r(pos === 'G' ? 0.08 : -0.04),
      hnd: r(pos === 'G' ? 0.08 : pos === 'C' ? -0.1 : 0),
      def: r(0),
      reb: r(pos === 'C' ? 0.12 : pos === 'F' ? 0.04 : -0.08),
      spd: r(pos === 'G' ? 0.06 : pos === 'C' ? -0.08 : 0),
      blk: r(pos === 'C' ? 0.1 : pos === 'G' ? -0.1 : 0),
      ft: r(0.03),
      jmp: r(0),
      look: { skin: pick(o, SKIN), hair: pick(o, girls ? HAIR_G : HAIR_B), hairC: pick(o, HAIR_C), band: rnd(o) < 0.2 },
    };
    p.ovr = Math.round(100 * (p.sht + p.ins + p.pas + p.hnd + p.def + p.reb + p.spd) / 7);
    players.push(p);
  }
  return players;
}

export const fullName = (p) => `${p.first} ${p.last}`;
export const heightStr = (inch) => `${Math.floor(inch / 12)}'${inch % 12}"`;
export const teamRating = (roster) => roster.slice(0, 8).reduce((a, p, i) => a + p.ovr * (i < 5 ? 1.2 : 0.6), 0) / (5 * 1.2 + 3 * 0.6);
