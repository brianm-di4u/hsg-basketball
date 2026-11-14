// The daily game (S3-01): one seeded exhibition per local date, the same for every player that day.
// The date picks the program, the user's school (a county school), the opponent, a head-start deficit and the game's seed.
import { COUNTY, allTeams } from './data.js';
import { hash, rnd, pick } from './util.js';

export const DAILY_Q = 120;           // seconds a quarter: a daily game is a short one (about eight minutes)
export const DAILY_DEFICITS = [0, 3, 5, 7]; // points the user's team starts behind (the handicap); the middle of the range is the usual
export const DAILY_DIFF = 1;          // Varsity

export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function dailyDeal(date) {
  const o = { rs: hash(`spa-city-daily-${date}`) };
  const program = rnd(o) < 0.5 ? 'boys' : 'girls';
  const home = pick(o, COUNTY).key;
  const others = allTeams().filter((t) => t.key !== home);
  const away = pick(o, others).key;
  const deficit = pick(o, DAILY_DEFICITS);
  return { date, program, home, away, deficit, seed: hash(`game-${date}`) & 0xffff, diff: DAILY_DIFF, qLen: DAILY_Q };
}
