// Pure rule math shared by the simulation and the AI. Everything here is a game rule or balance number.
import { clamp } from './util.js';

export const DIFF = [
  // rookie, varsity, all-state: AI release spread, steal aggression, contest reaction (s), user meter window scale, decision noise
  { name: 'Rookie', sd: 0.13, steal: 0.55, react: 0.3, win: 1.35, noise: 0.35 },
  { name: 'Varsity', sd: 0.09, steal: 1.0, react: 0.2, win: 1.0, noise: 0.22 },
  { name: 'All-State', sd: 0.065, steal: 1.35, react: 0.13, win: 0.8, noise: 0.12 },
];
// Team styles (S3-03): how an AI team plays. pace: 1 is today's tempo (above is quicker shots and more drives); three: leans toward
// (+) or away from (-) the three-point shot; press: 0 none, 1 a full-court press with a trap near half court. Opponents use their style;
// the team you steer, and its teammates, play the neutral one, as before.
export const STYLE_NEUTRAL = { name: 'Balanced', blurb: 'A bit of everything.', pace: 1, three: 0, press: 0 };
export const TEAM_AI = { sd: 0.09, steal: 0.9, react: 0.2, win: 1, noise: 0.22 }; // the user's AI teammates

export const SWEET = 0.9; // meter value at the top of the jump
export const meterTime = (type) => (type === 'jumper' ? 0.72 : 0.5);

// Quality from where the meter stopped. Returns {q, label}.
export function meterQuality(v, winScale = 1, type = 'jumper') {
  const w = 0.05 * winScale * (type === 'jumper' ? 1 : 1.6);
  const diff = Math.abs(v - SWEET);
  if (diff <= w) return { q: 1, label: 'PERFECT' };
  if (diff <= w * 3) return { q: 0.75, label: 'GOOD' };
  const q = clamp(0.5 - (diff - w * 3) * 2.2, 0.05, 0.5);
  return { q, label: v < SWEET ? 'EARLY' : 'LATE' };
}

export function contestFactor(dd, jumping) {
  let c = dd < 2 ? 0.62 : dd < 3.5 ? 0.8 : dd < 6 ? 0.93 : 1;
  if (jumping && dd < 4) c *= 0.88;
  return c;
}

// How the meter pays the player (S1-14). A PERFECT release by the human is worth more and also cancels half of the defender's contest; a GOOD one a
// little less, so a player with ordinary timing scores about as before and one who has mastered the window scores up to a quarter more. The AI's
// shots keep the old numbers, so the opponent, the teammates and the AI's own shot choices are exactly as they were. The late floor stays at 0.3.
export const PERFECT_MULT = 1.35;        // the AI's: PERFECT
export const HUMAN_PERFECT_MULT = 1.75;  // the player's PERFECT (was 1.35)
export const HUMAN_GOOD_MULT = 0.78;     // the player's GOOD (was 1)
export const HUMAN_PERFECT_RELIEF = 0.5; // the share of the contest penalty the player's PERFECT cancels (was 0)

export function shotChance({ dist, type, sht, ins, contest = 1, quality = 0.75, energy = 1, bonus = 1, human = false }) {
  let base;
  if (type === 'dunk') base = 0.9;
  else if (type === 'layup') base = 0.72;
  else if (dist < 10) base = 0.5;
  else if (dist < 19.75) base = 0.44;
  else base = 0.33 - Math.max(0, dist - 24) * 0.035;
  const rating = type === 'layup' || type === 'dunk' ? ins : sht;
  const skill = 0.7 + 0.6 * rating;
  const timing = quality >= 1 ? (human ? HUMAN_PERFECT_MULT : PERFECT_MULT) : quality >= 0.75 ? (human ? HUMAN_GOOD_MULT : 1) : 0.3 + quality * 0.8;
  const contested = human && quality >= 1 ? 1 - (1 - contest) * (1 - HUMAN_PERFECT_RELIEF) : contest;
  return clamp(base * skill * contested * timing * (0.9 + 0.1 * energy) * bonus, 0.02, 0.97);
}

export function ftChance(ft, q) {
  return clamp(0.2 + 0.42 * ft + 0.3 * q - (q < 0.3 ? 0.12 : 0), 0.05, 0.97);
}

// Quick statistical result for simulated games (season "Sim"). Returns [a, b], never tied.
export function simScore(ra, rb, o, rndFn, qLen = 8) {
  const poss = Math.round(14 * qLen * 0.5 + rndFn(o) * 6);
  const ppp = (r, opp) => clamp(0.86 + (r - opp) * 0.012 + (rndFn(o) - 0.5) * 0.12, 0.6, 1.2);
  const pa = ppp(ra, rb), pb = ppp(rb, ra);
  let a = 0, b = 0;
  for (let i = 0; i < poss; i++) {
    a += roll(pa); b += roll(pb);
  }
  function roll(p) {
    const x = rndFn(o);
    if (x < p * 0.36) return 2;
    if (x < p * 0.46) return 3;
    if (x < p * 0.52) return 1;
    return 0;
  }
  while (a === b) { a += roll(pa); b += roll(pb); }
  return [a, b];
}
