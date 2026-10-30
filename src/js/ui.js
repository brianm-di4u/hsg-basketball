// DOM screens as HTML strings. main.js owns state and handles `data-act` clicks.
import { COUNTY, team, banners, FACTS_LIST, FINALS, rivalry } from './data.js';
import { crestURL } from './art.js';
import { fullName, heightStr } from './roster.js';
import { ROUNDS, nextGame } from './season.js';
import { CHALLENGES } from './challenges.js';
import { DIFF } from './rules.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const crest = (t, px = 48, cls = 'crest') => `<img class="${cls}" src="${crestURL(t, px * 2)}" width="${px}" height="${px}" alt="">`;
const btn = (act, label, o = {}) => `<button class="btn ${o.cls || ''}" data-act="${act}"${o.arg != null ? ` data-arg="${esc(o.arg)}"` : ''}${o.pressed != null ? ` aria-pressed="${o.pressed}"` : ''}${o.disabled ? ' disabled' : ''}${o.label ? ` aria-label="${esc(o.label)}"` : ''}>${label}</button>`;
const seg = (act, opts, cur, label) => `<div class="seg" role="group" aria-label="${esc(label)}"><span class="seg-l">${esc(label)}</span>${opts.map(([v, t]) => btn(act, esc(t), { arg: v, pressed: String(v) === String(cur), cls: 'seg-b' })).join('')}</div>`;
const progLabel = (p) => (p === 'girls' ? 'Girls' : 'Boys');
const qLabel = (s) => `${s / 60} min`;

export const FICTION_NOTE = 'All players are fictional. Real Garland County schools appear as setting only; not affiliated with or endorsed by any school or the Arkansas Activities Association.';

export function teamCard(t, act, sel, o = {}) {
  const tag = t.fictional ? '<span class="tag">fictional town</span>' : !t.colorsConfirmed ? '<span class="tag">game colors</span>' : '';
  const colors = t.colorNames ? t.colorNames.join(' & ') : 'fictional colors';
  return `<button class="tcard${sel ? ' sel' : ''}" data-act="${act}" data-arg="${t.key}" aria-pressed="${sel}" style="--tc:${t.colors.primary};--tc2:${t.colors.secondary}">
    ${crest(t, o.px || 44)}<span class="tc-txt"><b>${esc(t.short)}</b><span>${esc(t.mascot)}${t.cls ? ` · ${t.cls}` : ''}</span><span class="tc-col"><i style="background:${t.colors.primary}"></i><i style="background:${t.colors.secondary}"></i>${esc(colors)}</span>${tag}</span></button>`;
}
const grid = (act, sel, label) => `<div class="tgrid" role="group" aria-label="${esc(label)}">${COUNTY.map((t) => teamCard(t, act, t.key === sel)).join('')}</div>`;

// ---------------------------------------------------------------- title
export function titleScreen(st) {
  const has = st.season && !st.season.done;
  return `<div class="panel title-panel">
    <h1 class="logo"><span class="l1">SPA CITY</span><span class="l2">HOOPS</span></h1>
    <p class="sub">High school basketball in Garland County, Arkansas</p>
    <nav class="menu" aria-label="Main menu">
      ${has ? btn('continueSeason', `Continue season <small>${esc(team(st.season.school).short)} ${progLabel(st.season.program)} · ${st.season.w}-${st.season.l}</small>`, { cls: 'primary' }) : ''}
      ${btn('seasonSetup', has ? 'New season' : 'Season', { cls: has ? '' : 'primary' })}
      ${btn('select', 'Exhibition')}
      ${btn('shootoutSetup', 'Hot Streak')}
      ${btn('challenges', 'Banner Challenges')}
      ${btn('trophies', 'Trophy Room')}
      <div class="menu-row">${btn('help', 'How to play')}${btn('settings', 'Settings')}</div>
    </nav>
    <p class="fine">${FICTION_NOTE}</p>
  </div>`;
}

// ---------------------------------------------------------------- exhibition select
export function selectScreen(st) {
  const x = st.pick;
  const hs = (x.home === 'hot-springs' || x.away === 'hot-springs') && st.save.unlocks.throwback;
  return `<div class="panel wide setup">
    <h2>Exhibition</h2>
    ${seg('pickProgram', [['boys', 'Boys'], ['girls', 'Girls']], x.program, 'Program')}
    <div class="pickers"><div><h3 id="h-home">Home team</h3>${grid('pickHome', x.home, 'Home team')}</div>
    <div><h3 id="h-away">Away team</h3>${grid('pickAway', x.away, 'Away team')}</div></div>
    ${x.home === x.away ? '<p class="warn" role="alert">Pick two different schools.</p>' : ''}
    <div class="opts">${seg('pickSide', [['home', 'Home'], ['away', 'Away']], x.side, 'You play')}
    ${seg('setQ', [[120, '2 min'], [240, '4 min'], [480, '8 min (full)']], st.settings.qLen, 'Quarters')}
    ${seg('setClock', [[35, '35 seconds'], [0, 'Off (classic)']], st.settings.shotClock, 'Shot clock')}
    ${seg('setDiff', DIFF.map((d, i) => [i, d.name]), st.settings.difficulty, 'Difficulty')}</div>
    ${hs ? seg('setThrow', [[1, '1912-style throwback'], [0, 'Regular']], x.throwback ? 1 : 0, 'Hot Springs kit') : ''}
    <div class="row end">${btn('title', 'Back')}${btn('startExhibition', 'Tip off', { cls: 'primary', disabled: x.home === x.away })}</div>
  </div>`;
}

// ---------------------------------------------------------------- season setup
export function seasonSetupScreen(st) {
  const x = st.pick;
  const t = team(x.school);
  return `<div class="panel wide">
    <h2>New season</h2>
    <p>Pick your school and program. Play a county schedule, then the Class ${esc(t.cls)} state bracket. The state final is at ${esc(FINALS.name)}, ${esc(FINALS.city)}.</p>
    ${seg('pickProgram', [['boys', 'Boys'], ['girls', 'Girls']], x.program, 'Program')}
    ${grid('pickSchool', x.school, 'School')}
    ${seg('pickLength', [['short', 'Short: 3 games'], ['full', 'Full: 8 games']], x.length, 'Regular season')}
    ${seg('setQ', [[120, '2 min'], [240, '4 min'], [480, '8 min (full)']], st.settings.qLen, 'Quarters')}
    ${seg('setDiff', DIFF.map((d, i) => [i, d.name]), st.settings.difficulty, 'Difficulty')}
    ${st.season && !st.season.done ? '<p class="warn">Starting a new season replaces the season in progress.</p>' : ''}
    <div class="row end">${btn('title', 'Back')}${btn('startSeason', 'Start season', { cls: 'primary' })}</div>
  </div>`;
}

// ---------------------------------------------------------------- season hub
export function hubScreen(st, fact) {
  const S = st.season;
  const me = team(S.school);
  const g = nextGame(S);
  let next = '';
  if (g) {
    const opp = team(g.opp);
    const where = g.arena ? `${esc(FINALS.name)}, ${esc(FINALS.city)}` : g.home ? `${esc(me.short)} home gym` : `at ${esc(opp.short)}`;
    next = `<section class="card next" aria-label="Next game">
      <p class="kicker">${esc(g.round || 'Regular season')} · ${esc(g.month)}</p>
      <div class="vs">${crest(me, 52)}<span>vs</span>${crest(opp, 52)}</div>
      <p class="big">${esc(me.short)} ${esc(me.mascot)} vs ${esc(opp.short)} ${esc(opp.mascot)}</p>
      <p>${where}${g.rival ? ` · <span class="tag">Rivalry game</span>` : ''}${opp.fictional ? ' · <span class="tag">fictional town</span>' : ''}</p>
      <div class="row">${btn('playSeason', 'Play game', { cls: 'primary' })}${btn('simSeason', 'Sim game')}</div>
    </section>`;
  } else if (S.done) {
    next = S.champion
      ? `<section class="card next champ"><p class="kicker">Season complete</p><p class="big">State champions!</p><p>${esc(me.short)} ${progLabel(S.program)} · Class ${esc(S.cls)} · ${S.w}-${S.l}</p><div class="row">${btn('seasonSetup', 'New season', { cls: 'primary' })}${btn('trophies', 'Trophy Room')}</div></section>`
      : `<section class="card next"><p class="kicker">Season over</p><p class="big">Eliminated in the ${esc((S.eliminated || 'bracket').toLowerCase())}</p><p>Final record ${S.w}-${S.l}. Every banner starts somewhere.</p><div class="row">${btn('seasonSetup', 'New season', { cls: 'primary' })}${btn('bracket', 'View bracket')}</div></section>`;
  }
  const rows = S.games.map((x, i) => {
    const o = team(x.opp);
    const res = x.result ? `<b class="${x.result.us > x.result.them ? 'w' : 'l'}">${x.result.us > x.result.them ? 'W' : 'L'} ${x.result.us}-${x.result.them}</b>` : (i === S.idx && S.phase === 'regular' ? '<span class="tag">next</span>' : '');
    return `<li>${crest(o, 24, 'crest sm')}<span class="sch-when">${esc(x.month)}</span><span class="sch-opp">${x.home ? 'vs' : 'at'} ${esc(o.short)}${x.rival ? ' <span class="tag">rival</span>' : ''}${o.fictional ? ' <span class="tag">fictional</span>' : ''}</span>${res}</li>`;
  }).join('');
  return `<div class="panel wide hub">
    <header class="hub-h">${crest(me, 56)}<div><h2>${esc(me.short)} ${esc(me.mascot)}</h2><p>${progLabel(S.program)} · Class ${esc(S.cls)} · Record <b>${S.w}-${S.l}</b></p></div></header>
    ${next}
    <section class="card"><h3>Schedule</h3><ol class="sched">${rows}</ol>
      ${S.bracket ? `<div class="row">${btn('bracket', 'State bracket')}</div>` : `<p class="fine">Then: Class ${esc(S.cls)} state bracket, March. The final is at ${esc(FINALS.name)}.</p>`}</section>
    ${fact ? factCard(fact) : ''}
    <div class="row end">${btn('title', 'Menu')}${btn('roster', 'Roster')}</div>
  </div>`;
}

export const factCard = (f) => `<aside class="card fact" aria-label="Did you know?"><p class="kicker">Did you know? · ${esc(f.tag)}</p><p>${esc(f.text)}</p><p class="src">Source: ${esc(f.source)}</p></aside>`;

export function rosterScreen(st, key, program, roster) {
  const t = team(key);
  return `<div class="panel wide">
    <header class="hub-h">${crest(t, 48)}<div><h2>${esc(t.short)} ${esc(t.mascot)} roster</h2><p>${progLabel(program)} · <b>All players are fictional.</b></p></div></header>
    <div class="tbl-wrap"><table class="tbl"><caption class="sr-only">Roster</caption><thead><tr><th>#</th><th>Name</th><th>Pos</th><th>Ht</th><th class="opt">Gr</th><th>Shoot</th><th class="opt">Inside</th><th>Def</th><th>Ovr</th></tr></thead>
    <tbody>${roster.map((p, i) => `<tr${i < 5 ? ' class="starter"' : ''}><td>${p.num}</td><td>${esc(fullName(p))}</td><td>${p.pos}</td><td>${heightStr(p.height)}</td><td class="opt">${p.grade}</td><td>${Math.round(p.sht * 100)}</td><td class="opt">${Math.round(p.ins * 100)}</td><td>${Math.round(p.def * 100)}</td><td><b>${p.ovr}</b></td></tr>`).join('')}</tbody></table></div>
    <p class="fine">Starters are highlighted. Names are random pairings from generic name lists; any resemblance to a real person is a coincidence.</p>
    <div class="row end">${btn('back', 'Back', { cls: 'primary' })}</div>
  </div>`;
}

export function bracketScreen(st) {
  const S = st.season, B = S.bracket;
  const col = (r) => {
    const games = B.rounds[r] || [];
    const body = games.length ? games.map((g) => {
      const line = (k, seed, sc, w) => { const t = team(k); return `<div class="bline${k === S.school ? ' me' : ''}${w === k ? ' won' : ''}">${crest(t, 20, 'crest sm')}<span>${seed ? `<small>${seed}</small> ` : ''}${esc(t.short)}</span><b>${sc ?? ''}</b></div>`; };
      return `<div class="bgame">${line(g.a, g.seedA, g.score ? g.score[0] : null, g.winner)}${line(g.b, g.seedB, g.score ? g.score[1] : null, g.winner)}</div>`;
    }).join('') : '<p class="fine">To be decided</p>';
    return `<section class="bcol"><h3>${ROUNDS[r]}</h3>${r === 2 ? `<p class="fine">${esc(FINALS.name)}, ${esc(FINALS.city)}</p>` : ''}${body}</section>`;
  };
  return `<div class="panel wide">
    <h2>Class ${esc(S.cls)} state bracket · ${progLabel(S.program)}</h2>
    <p class="fine">Garland County schools of this class plus fictional out-of-county towns. Results other than yours are simulated.</p>
    <div class="bracket">${col(0)}${col(1)}${col(2)}</div>
    <div class="row end">${btn('back', 'Back', { cls: 'primary' })}</div>
  </div>`;
}

// ---------------------------------------------------------------- in-game overlays
const teamLine = (m, t) => { const T = m.teams[t]; const s = (k) => T.roster.reduce((a, r) => a + r.st[k], 0); return { fg: `${s('fgm')}/${s('fga')}`, tp: `${s('tpm')}/${s('tpa')}`, ft: `${s('ftm')}/${s('fta')}`, reb: s('reb'), ast: s('ast'), to: s('to'), stl: s('stl'), blk: s('blk') }; };
export function teamTotals(m) {
  const a = teamLine(m, 0), b = teamLine(m, 1);
  const row = (k, l) => `<tr><th scope="row">${l}</th><td>${a[k]}</td><td>${b[k]}</td></tr>`;
  return `<table class="tbl tot"><thead><tr><th></th><th>${esc(m.teams[0].abbr)}</th><th>${esc(m.teams[1].abbr)}</th></tr></thead><tbody>${row('fg', 'Field goals')}${row('tp', '3-pointers')}${row('ft', 'Free throws')}${row('reb', 'Rebounds')}${row('ast', 'Assists')}${row('stl', 'Steals')}${row('blk', 'Blocks')}${row('to', 'Turnovers')}</tbody></table>`;
}
export function boxTable(m, t) {
  const T = m.teams[t];
  return `<div class="tbl-wrap"><table class="tbl box"><caption>${esc(T.short)} ${esc(T.mascot)} (fictional players)</caption><thead><tr><th>#</th><th>Player</th><th>Pts</th><th>Reb</th><th>Ast</th><th>FG</th><th>3P</th><th>FT</th><th>PF</th></tr></thead>
  <tbody>${T.roster.filter((r) => r.st.sec > 0).map((r) => `<tr><td>${r.num}</td><td>${esc(r.first[0])}. ${esc(r.last)}</td><td><b>${r.st.pts}</b></td><td>${r.st.reb}</td><td>${r.st.ast}</td><td>${r.st.fgm}/${r.st.fga}</td><td>${r.st.tpm}/${r.st.tpa}</td><td>${r.st.ftm}/${r.st.fta}</td><td>${r.st.pf}${r.out ? ' (out)' : ''}</td></tr>`).join('')}</tbody></table></div>`;
}
const scoreLine = (m) => `<div class="final-score"><span>${crest(m.teams[0], 40)}<b>${esc(m.teams[0].short)}</b><em>${m.teams[0].score}</em></span><span>${crest(m.teams[1], 40)}<b>${esc(m.teams[1].short)}</b><em>${m.teams[1].score}</em></span></div>`;

export function pauseScreen(st, m, showBox) {
  return `<div class="panel">
    <h2>Paused</h2>${scoreLine(m)}
    <nav class="menu">${btn('resume', 'Resume', { cls: 'primary' })}${btn('toggleBox', showBox ? 'Hide box score' : 'Box score')}${btn('help', 'How to play')}${btn('settings', 'Settings')}${btn('quit', st.mode === 'season' ? 'Quit game (not recorded)' : 'Quit to menu')}</nav>
    ${showBox ? teamTotals(m) + boxTable(m, m.user.team >= 0 ? m.user.team : 0) : ''}
  </div>`;
}

export function breakScreen(m, fact) {
  const q = m.clock.q;
  const title = q === 2 ? 'Halftime' : q >= 4 ? (m.teams[0].score === m.teams[1].score ? 'Tied! Overtime next' : 'End of regulation') : `End of Q${q}`;
  return `<div class="panel">
    <h2>${title}</h2>${scoreLine(m)}
    ${teamTotals(m)}
    ${fact ? factCard(fact) : ''}
    <div class="row end">${btn('continueGame', q === 2 ? 'Start the second half' : q >= 4 ? 'Start overtime' : `Start Q${q + 1}`, { cls: 'primary' })}</div>
  </div>`;
}

export function finalScreen(st, m, tops, extra = '') {
  const w = m.winner, ut = m.user.team;
  const head = ut < 0 ? `${esc(m.teams[w].short)} win` : w === ut ? 'You win!' : `${esc(m.teams[w].short)} win`;
  return `<div class="panel">
    <p class="kicker">Final${m.clock.q > 4 ? (m.clock.q > 5 ? ` (${m.clock.q - 4} OT)` : ' (OT)') : ''}</p>
    <h2>${head}</h2>${scoreLine(m)}
    <section class="card tops"><h3>Top performers</h3>${tops.map((t) => `<p><b>${esc(t.team)}:</b> #${t.num} ${esc(t.name)} · ${t.pts} pts, ${t.reb} reb, ${t.ast} ast</p>`).join('')}<p class="fine">All players are fictional.</p></section>
    ${extra}
    ${boxTable(m, ut >= 0 ? ut : w)}
    <div class="row end">${st.mode === 'season' ? btn('afterSeasonGame', 'Continue', { cls: 'primary' }) : st.mode === 'challenge' ? btn('afterChallenge', 'Continue', { cls: 'primary' }) : `${btn('title', 'Menu')}${btn('rematch', 'Rematch', { cls: 'primary' })}`}</div>
  </div>`;
}

export function championScreen(st) {
  const S = st.season, t = team(S.school);
  return `<div class="panel champ-panel" style="--tc:${t.colors.primary};--tc2:${t.colors.secondary}">
    <div class="pennant" aria-hidden="true"><span>STATE</span><span>CHAMPS</span></div>
    ${crest(t, 96)}
    <h2>State champions!</h2>
    <p class="big">${esc(t.short)} ${esc(t.mascot)} · ${progLabel(S.program)} · Class ${esc(S.cls)}</p>
    <p>Won the state final at ${esc(FINALS.name)}, ${esc(FINALS.city)}. Season record ${S.w}-${S.l}.</p>
    <p class="fine">Your season is a game result, not a real title. A banner has been added to your Trophy Room.</p>
    <div class="row end">${btn('trophies', 'Trophy Room')}${btn('hub', 'Continue', { cls: 'primary' })}</div>
  </div>`;
}

// ---------------------------------------------------------------- shootout
export function shootoutSetupScreen(st) {
  const x = st.pick;
  return `<div class="panel wide">
    <h2>Hot Streak</h2>
    <p>60 seconds, seven spots around the arc and the elbows. Inside spots are worth 2, beyond the arc 3. Three makes in a row fill the steam gauge for double points; six in a row for triple. Your shooter is the best jump shooter on the roster (fictional).</p>
    ${seg('pickProgram', [['boys', 'Boys'], ['girls', 'Girls']], x.program, 'Program')}
    ${grid('pickSchool', x.school, 'School')}
    <p>Best score: <b>${st.save.best.shootout || 0}</b></p>
    <div class="row end">${btn('title', 'Back')}${btn('startShootout', 'Start', { cls: 'primary' })}</div>
  </div>`;
}
export function shootoutEndScreen(st, so, isBest) {
  return `<div class="panel">
    <p class="kicker">Hot Streak · time</p>
    <h2>${so.score} points</h2>
    <p>${so.made} of ${so.att} made${so.att ? ` (${Math.round((100 * so.made) / so.att)}%)` : ''}.</p>
    <p>${isBest ? '<b>New best!</b>' : `Best: <b>${st.save.best.shootout}</b>`}</p>
    <div class="row end">${btn('title', 'Menu')}${btn('startShootout', 'Go again', { cls: 'primary' })}</div>
  </div>`;
}

// ---------------------------------------------------------------- challenges and trophies
export function challengesScreen(st) {
  const done = st.save.challenges || {};
  return `<div class="panel wide">
    <h2>Banner Challenges</h2>
    <p>Short scenarios built around real Garland County basketball history. Each is a <b>game scenario, not a recreation</b> of a real game: the players and situations are fictional.</p>
    <div class="clist">${CHALLENGES.map((c) => {
      const t = team(c.school);
      return `<article class="card chal${done[c.id] ? ' done' : ''}">
        <header>${crest(t, 40)}<div><h3>${esc(c.title)}${done[c.id] ? ' <span class="tag ok">Completed ✓</span>' : ''}</h3><p class="kicker">${esc(c.who)}</p></div></header>
        <p class="fact-line">${esc(c.fact)} <span class="src">Source: ${esc(c.source)}</span></p>
        <p><b>Setup:</b> ${esc(c.setup)}</p><p><b>Goal:</b> ${esc(c.goal)}</p>
        <div class="row">${(c.programs || [c.program]).map((p) => btn('playChallenge', c.programs ? `Play (${progLabel(p)})` : 'Play', { arg: `${c.id}|${p}`, cls: 'primary' })).join('')}</div>
      </article>`;
    }).join('')}</div>
    <div class="row end">${btn('title', 'Back')}</div>
  </div>`;
}

export function trophiesScreen(st) {
  const sv = st.save;
  const tro = sv.trophies.length ? sv.trophies.map((x) => { const t = team(x.school); return `<li class="pen" style="--tc:${t.colors.primary};--tc2:${t.colors.secondary}">${crest(t, 36)}<span><b>${esc(t.short)}</b> ${progLabel(x.program)}<br><small>Class ${esc(x.cls)} · ${esc(x.label)}</small></span></li>`; }).join('') : '<li class="fine">No banners yet. Win a season\'s state final to raise one.</li>';
  const real = COUNTY.filter((t) => t.titles.boys.length + t.titles.girls.length + t.titles.any.length).map((t) => {
    const parts = [];
    if (t.titles.boys.length) parts.push(`boys ${t.titles.boys.join(', ')}`);
    if (t.titles.girls.length) parts.push(`girls ${t.titles.girls.join(', ')}`);
    if (t.titles.any.length) parts.push(`${t.titles.any.join(' and ')} (boys or girls not stated in the source)`);
    return `<li>${crest(t, 24, 'crest sm')}<span><b>${esc(t.short)}:</b> ${parts.join('; ')}</span></li>`;
  }).join('');
  const nDone = Object.keys(sv.challenges || {}).length;
  return `<div class="panel wide">
    <h2>Trophy Room</h2>
    <section class="card"><h3>Your banners</h3><ul class="pens">${tro}</ul></section>
    <section class="card"><h3>Records and unlocks</h3><ul class="plain kv">
      <li>Hot Streak best: <b>${sv.best.shootout || 0}</b></li>
      <li>Banner Challenges completed: <b>${nDone} of ${CHALLENGES.length}</b></li>
      <li>1912-style throwback kit (Hot Springs): <b>${sv.unlocks.throwback ? 'unlocked' : 'locked'}</b>${sv.unlocks.throwback ? '' : ' (complete the "1912 Colors" challenge)'}</li></ul></section>
    <section class="card"><h3>Real title years</h3><p class="fine">Basketball state titles from the research (source: Wikipedia school pages via research/schools-and-athletics.md). No titles were found for the other five schools.</p><ul class="plain">${real}</ul></section>
    <div class="row end">${btn('title', 'Back', { cls: 'primary' })}</div>
  </div>`;
}

// ---------------------------------------------------------------- help and settings
export function helpScreen(st, tab = 'controls') {
  const tabs = [['controls', 'Controls'], ['play', 'Playing'], ['rules', 'Game rules'], ['about', 'About & sources']];
  let body = '';
  if (tab === 'controls') body = `<table class="tbl keys"><thead><tr><th>Action</th><th>Keyboard</th><th>Touch</th></tr></thead><tbody>
    <tr><td>Move</td><td>Arrow keys or WASD</td><td>Left stick</td></tr>
    <tr><td>Shoot: hold, release at the top of the jump</td><td><kbd>Space</kbd></td><td>SHOOT (hold)</td></tr>
    <tr><td>On defense: jump to block or rebound</td><td><kbd>Space</kbd></td><td>SHOOT</td></tr>
    <tr><td>Pass toward the stick (or to the most open teammate)</td><td><kbd>X</kbd> or <kbd>J</kbd></td><td>PASS</td></tr>
    <tr><td>On defense: steal</td><td><kbd>X</kbd> or <kbd>J</kbd></td><td>STEAL</td></tr>
    <tr><td>Switch to another defender</td><td><kbd>C</kbd> or <kbd>K</kbd></td><td>SWITCH</td></tr>
    <tr><td>Pause</td><td><kbd>P</kbd> or <kbd>Esc</kbd></td><td>❚❚</td></tr>
    <tr><td>Mute</td><td><kbd>M</kbd></td><td>Settings</td></tr></tbody></table>
    <p>Menus: <kbd>Tab</kbd> to move, <kbd>Enter</kbd> to choose, <kbd>Esc</kbd> to go back.</p>`;
  if (tab === 'play') body = `<h3>The shot meter</h3><p>Hold Shoot to rise into your jump. A bar fills beside your player. Let go when the marker reaches the bright green band at the top of the jump. You'll see <b>PERFECT</b>, <b>GOOD</b>, <b>EARLY</b> or <b>LATE</b>. Perfect releases go in far more often; open looks beat contested ones; close shots beat long ones. Near the rim the same button lays it in, and it is more forgiving.</p>
    <h3>Free throws</h3><p>A marker swings across a bar. Press Shoot when it is in the green middle.</p>
    <h3>Tip-off</h3><p>Press Shoot as the tossed ball reaches its peak to jump for it. Good timing wins more tips.</p>
    <h3>Offense</h3><p>You control whoever has the ball. Pass to find open teammates, especially cutters heading to the rim. The 35-second shot clock is on the scoreboard.</p>
    <h3>Defense</h3><p>You control the defender nearest the ball (marked <b>YOU</b> with a yellow chevron). Stay between your player and the rim. Time steals and blocks: reaching in can draw a foul. Switch defenders any time.</p>
    <h3>Telling teams apart</h3><p>Home players stand on a solid ring, away players on a dashed ring. Home wears light jerseys, away wears dark ones.</p>`;
  if (tab === 'rules') body = `<p>These are the game's rules. Only the 35-second shot clock is a sourced Arkansas rule; everything else is how this game plays.</p><ul class="plain bullets">
    <li><b>Quarters:</b> four, 2, 4 or 8 minutes each (8 is the full-length setting). Teams swap ends at halftime.</li>
    <li><b>Shot clock:</b> 35 seconds, Arkansas's clock since 2022-23 (adopted 183-69 in 2020). It resets on a change of possession or when a shot hits the rim, and switches off when less game time remains. "Classic" turns it off.</li>
    <li><b>Scoring:</b> 2 inside the arc, 3 beyond it, 1 per free throw.</li>
    <li><b>Fouls:</b> a shooting foul gives 2 free throws (3 on a three, 1 after a made basket). Reach-in fouls give the ball back out of bounds; from a team's 5th foul in a quarter they give 2 shots (the bonus). Five fouls and a player is out.</li>
    <li><b>Possession:</b> a jump ball starts the game; later quarters alternate.</li>
    <li><b>Overtime:</b> half a quarter (at least 1 minute) until there is a winner.</li>
    <li><b>Violations:</b> shot clock, out of bounds and 5 seconds to inbound.</li>
    <li><b>Subs:</b> tired players are swapped automatically at dead balls.</li></ul>`;
  if (tab === 'about') body = `<p>${FICTION_NOTE}</p>
    <h3>Where the facts come from</h3><ul class="plain bullets">
    <li>School names, cities, mascots, colors, classes and title years: <code>shared/data/schools.json</code>, compiled from Wikipedia school pages and AAA news coverage (see <code>research/schools-and-athletics.md</code>).</li>
    <li>Colors are stand-in values. Fountain Lake (green and white), Cutter-Morning Star (navy and silver), Jessieville (purple and gold) and Mountain Pine (red and black) are <b>game colors</b>: their real colors were not confirmed.</li>
    <li>Mascot crests are original geometric drawings, not school logos. Gym names are not shown because none was confirmed.</li>
    <li>The state final venue: ${esc(FINALS.name)}, ${esc(FINALS.address)}, hosted the 2026 AAA basketball state championships. The 3D arena follows its published seating chart (two tiers of royal-blue seats, one end with only a small lower section); everything else in the arena art is generic.</li>
    <li>Gyms are generic game art in each school's colors. Title-year pennants hang only for real state titles.</li>
    <li>Out-of-county opponents (Cinderbrook, Quartz Hollow and others) are fictional towns.</li></ul>
    <h3>Fact cards</h3><ul class="plain facts">${FACTS_LIST.map((f) => `<li>${esc(f.text)} <span class="src">(${esc(f.source)})</span></li>`).join('')}</ul>
    <h3>Credits</h3><p>Spa City Hoops is part of the open-source Hot Springs Games collection (MIT license). Gyms, the arena and their lighting were built in Blender; the photo crowd cards (on the classic and lite views only), maple floor and block-wall images were painted for this game with AI image generation; everything else is drawn in code, and all sound is synthesized in the browser. The only network use is loading the game's own high-quality art from the same site after it starts: no ads, analytics or accounts.</p>
    <ul class="plain bullets fine">
    <li>Player and fan bodies: built from MakeHuman system assets with MPFB 2 (CC0).</li>
    <li>Motion capture: the CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu; created with funding from NSF EIA-0196217), BVH conversion by Bruce Hahne. Other animation is keyed for this game.</li>
    <li>three.js r186 (MIT), postprocessing by pmndrs (Zlib), N8AO (ISC), the Basis Universal transcoder (Apache-2.0).</li>
    <li>Typefaces: Bebas Neue by Dharma Type and Barlow Condensed by Jeremy Tribby (both SIL Open Font License 1.1).</li>
    <li>Classic 2D court available in Settings → Graphics.</li></ul>`;
  return `<div class="panel wide">
    <h2>How to play</h2>
    <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === tab}" data-act="helpTab" data-arg="${k}">${l}</button>`).join('')}</div>
    <div class="tabbody" role="tabpanel">${body}</div>
    <div class="row end">${btn('back', 'Back', { cls: 'primary' })}</div>
  </div>`;
}

export function settingsScreen(st, storageOk) {
  const s = st.settings;
  return `<div class="panel wide">
    <h2>Settings</h2>
    ${seg('setSound', [[1, 'On'], [0, 'Off']], s.sound ? 1 : 0, 'Sound')}
    ${seg('setVol', [[0.25, 'Low'], [0.5, 'Medium'], [0.8, 'High']], s.vol, 'Volume')}
    ${seg('setMotion', [['auto', 'Follow system'], ['on', 'Reduce'], ['off', 'Full']], s.motion, 'Reduced motion')}
    ${seg('setText', [[100, '100%'], [115, '115%'], [130, '130%']], s.text, 'Text size')}
    ${seg('setTheme', [['auto', 'Default (night)'], ['light', 'Day'], ['dark', 'Night']], s.theme, 'Menu theme')}
    ${seg('setDiff', DIFF.map((d, i) => [i, d.name]), s.difficulty, 'Difficulty')}
    ${seg('setQ', [[120, '2 min'], [240, '4 min'], [480, '8 min (full)']], s.qLen, 'Quarter length')}
    ${seg('setClock', [[35, '35-second clock'], [0, 'Classic (off)']], s.shotClock, 'Shot clock')}
    ${seg('setAssist', [[1, 'On (wider window)'], [0, 'Off']], s.assist ? 1 : 0, 'Meter assist')}
    ${seg('setTouch', [['auto', 'Auto'], ['on', 'Always'], ['off', 'Never']], s.touch, 'Touch controls')}
    ${seg('setGraphics', [['auto', 'Auto'], ['3d', '3D gym'], ['2d', 'Classic 2D']], s.graphics || 'auto', 'Graphics')}
    ${seg('setReplays', [[1, 'On'], [0, 'Off']], s.replays === false ? 0 : 1, 'Highlight replays')}
    ${storageOk ? '' : '<p class="warn" role="status">Saving is unavailable in this browser, so progress lasts only until you close the page.</p>'}
    <div class="row end">${btn('back', 'Done', { cls: 'primary' })}</div>
  </div>`;
}

export function pickFact(seed) { return FACTS_LIST.length ? FACTS_LIST[Math.abs(seed | 0) % FACTS_LIST.length] : null; }
export { banners, rivalry };
