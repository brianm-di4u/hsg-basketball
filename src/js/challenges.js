// Banner Challenges: short scenarios built on sourced facts. Every situation is a fictional game scenario.
// start: {q, t, score:[home, away], poss: 'user'|'opp'} jumps into the game; otherwise the game starts with a tip.
export const CHALLENGES = [
  {
    id: 'double-crown', title: 'Double Crown', who: 'Hot Springs Trojans · boys, then girls', school: 'hot-springs', program: 'boys',
    fact: 'In 1998 Hot Springs High won both the boys and the girls basketball state titles.', source: 'Wikipedia: Hot Springs High School',
    setup: 'Two state finals in a row at the finals arena, 2-minute quarters: first the boys, then the girls, each against a fictional opponent.',
    goal: 'Win both finals.', steps: [{ program: 'boys', opp: 'ironleaf' }, { program: 'girls', opp: 'fernhaven' }], venue: 'arena', qLen: 120,
  },
  {
    id: 'lady-trojans-five', title: 'Lady Trojans Five', who: 'Hot Springs Trojans · girls', school: 'hot-springs', program: 'girls',
    fact: 'Hot Springs girls won state titles in 1990, 1997, 1998, 2015 and 2018.', source: 'Wikipedia: Hot Springs High School',
    setup: 'State final against fictional Ambergrove. Fourth quarter, 2:00 left, down 6.', goal: 'Come back and win.',
    steps: [{ program: 'girls', opp: 'ambergrove', start: { q: 4, t: 120, score: [34, 40], poss: 'user' } }], venue: 'arena', qLen: 120,
  },
  {
    id: 'bookend-banners', title: 'Bookend Banners', who: 'Lakeside Rams · boys or girls', school: 'lakeside', programs: ['boys', 'girls'],
    fact: 'Lakeside won basketball state titles in 1945 and 2000, 55 years apart. The source does not say whether boys or girls.', source: 'Wikipedia: Lakeside High School',
    setup: 'Classic rules (no shot clock). State final against fictional Copperbend, tied with 1:30 left.', goal: 'Win the final.',
    steps: [{ opp: 'copperbend', start: { q: 4, t: 90, score: [38, 38], poss: 'opp' } }], venue: 'arena', qLen: 120, shotClock: 0,
  },
  {
    id: '1912-colors', title: '1912 Colors', who: 'Hot Springs Trojans · boys', school: 'hot-springs', program: 'boys',
    fact: 'In 1912 baseball star Honus Wagner bought and donated black-and-gold basketball uniforms to Hot Springs High School; the school kept the colors.', source: 'Wikipedia: Hot Springs, Arkansas',
    setup: 'Wear a 1912-style throwback kit (our design, not a copy of the real uniforms) in a classic-rules game against Lakeside, 2-minute quarters.',
    goal: 'Win to unlock the throwback kit for Exhibition and Season.', steps: [{ program: 'boys', opp: 'lakeside', throwback: true }], venue: 'home', qLen: 120, shotClock: 0, unlock: 'throwback',
  },
  {
    id: '6a-trial', title: '6A Trial Run', who: 'Lake Hamilton Wolves · boys', school: 'lake-hamilton', program: 'boys',
    fact: 'Arkansas adopted a 35-second shot clock by a 183-69 vote in 2020, effective 2022-23. Class 6A used it first, experimentally, in conference and state tournament games.', source: 'Delta Plex News; NWA Online (via research/schools-and-athletics.md)',
    setup: 'Fourth quarter against fictional Lanternfield with the 35-second clock. 2:00 left, up 2.', goal: 'Win, and allow 6 points or fewer from here.',
    steps: [{ program: 'boys', opp: 'lanternfield', start: { q: 4, t: 120, score: [30, 28], poss: 'opp' }, maxAllowed: 6 }], venue: 'home', qLen: 120, shotClock: 35,
  },
  {
    id: '2a7-showdown', title: '2A-7 Showdown', who: 'Cutter-Morning Star Eagles vs Mountain Pine Red Devils', school: 'cutter-morning-star', programs: ['boys', 'girls'],
    fact: 'Cutter-Morning Star and Mountain Pine are league mates in the 2A-7 basketball conference.', source: 'Sentinel-Record (via research/schools-and-athletics.md)',
    setup: 'A full 2-minute-quarter league game: Cutter-Morning Star at home against Mountain Pine.', goal: 'Win the league game.',
    steps: [{ opp: 'mountain-pine' }], venue: 'home', qLen: 120,
  },
];
export const challenge = (id) => CHALLENGES.find((c) => c.id === id);
