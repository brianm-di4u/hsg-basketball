// Pure rule math shared by the simulation and the AI. Everything here is a game rule or balance number.
import { clamp } from './util.js';

export const EDGE_ALLSTATE = 0.05; // rating points the opponent gains on All-State (was 0: the same team at every difficulty)
export const EDGE_ROOKIE = 0.08;   // and loses on Rookie (a bigger step: at 0.05 Rookie play did not move beyond the noise of 500 games)
export const DIFF = [
  // rookie, varsity, all-state: AI release spread, steal aggression, contest reaction (s), user meter window scale, decision noise,
  // edge: added to the opponent's shooting, finishing, defence and rebounding ratings (S3-02), so a harder game is also a better team, not only a sharper copy of it
  { name: 'Rookie', sd: 0.13, steal: 0.55, react: 0.3, win: 1.35, noise: 0.35, edge: -EDGE_ROOKIE },
  { name: 'Varsity', sd: 0.09, steal: 1.0, react: 0.2, win: 1.0, noise: 0.22, edge: 0 },
  { name: 'All-State', sd: 0.065, steal: 1.35, react: 0.13, win: 0.8, noise: 0.12, edge: EDGE_ALLSTATE },
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

// Base make chance by shot (S3-08): a drive and finish at the rim paid far more than anything from the perimeter, so a three is a little likelier
// and a dunk a little less likely. The AI rates its shots through the same function, so its choices move with these numbers.
export const BASE_DUNK = 0.82;  // was 0.9
export const BASE_THREE = 0.36; // was 0.33 (at 24 ft, falling 0.035 a foot beyond)

export function shotChance({ dist, type, sht, ins, contest = 1, quality = 0.75, energy = 1, bonus = 1, human = false }) {
  let base;
  if (type === 'dunk') base = BASE_DUNK;
  else if (type === 'layup') base = 0.72;
  else if (dist < 10) base = 0.5;
  else if (dist < 19.75) base = 0.44;
  else base = BASE_THREE - Math.max(0, dist - 24) * 0.035;
  const rating = type === 'layup' || type === 'dunk' ? ins : sht;
  const skill = 0.7 + 0.6 * rating;
  const timing = quality >= 1 ? (human ? HUMAN_PERFECT_MULT : PERFECT_MULT) : quality >= 0.75 ? (human ? HUMAN_GOOD_MULT : 1) : 0.3 + quality * 0.8;
  const contested = human && quality >= 1 ? 1 - (1 - contest) * (1 - HUMAN_PERFECT_RELIEF) : contest;
  return clamp(base * skill * contested * timing * (0.9 + 0.1 * energy) * bonus, 0.02, 0.97);
}

export function ftChance(ft, q) {
  return clamp(0.2 + 0.42 * ft + 0.3 * q - (q < 0.3 ? 0.12 : 0), 0.05, 0.97);
}

// Quick statistical result for simulated games (season "Sim"). Returns [a, b], never tied. Calibrated against played games (S3-10): 42 pairings of
// the county teams, 16 games each at 2-minute quarters, gave about 21 points a team, a margin of 0.28 points per rating point and a win chance of
// 48% plus 1.4% per rating point. Sim used to give 55 points a team, 1.5 points per rating point and 98% for a 6A team over a 2A one.
export const SIM_POSS_PER_MIN = 11;      // possessions a team gets per minute of quarter (was 7, which was 56 a game at the old default of 8-minute quarters)
export const SIM_PPP_PER_RATING = 0.0055; // points per possession gained per rating point of advantage (was 0.012)
export function simScore(ra, rb, o, rndFn, qLen = 2) { // qLen: minutes in a quarter (was 8; the game's own default quarter is 2)
  const poss = Math.round(SIM_POSS_PER_MIN * qLen + rndFn(o) * 3);
  const ppp = (r, opp) => clamp(0.86 + (r - opp) * SIM_PPP_PER_RATING + (rndFn(o) - 0.5) * 0.12, 0.6, 1.2);
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
