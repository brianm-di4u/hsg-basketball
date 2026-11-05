// Field-specific save intents. Ordinary preferences never replay cached progress.
const object = x => !!x && typeof x === 'object' && !Array.isArray(x);
const clone = x => JSON.parse(JSON.stringify(x));
function ordered(x) { return Array.isArray(x) ? x.map(ordered) : object(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, ordered(x[k])])) : x; }
export const seasonText = x => JSON.stringify(ordered(x || null));
export function validSave(x) {
  if (!object(x) || x.v !== 1) return false;
  for (const k of ['settings', 'unlocks', 'best', 'challenges']) if (x[k] != null && !object(x[k])) return false;
  if (x.trophies != null && (!Array.isArray(x.trophies) || !x.trophies.every(object))) return false;
  if (x.best?.shootout != null && (!Number.isFinite(x.best.shootout) || x.best.shootout < 0)) return false;
  if (x.season != null && (!object(x.season) || !Array.isArray(x.season.games) || typeof x.season.school !== 'string' || !Number.isFinite(x.season.seed))) return false;
  return true;
}
export function mergeSave(latest, defaults, intent) {
  if (latest && !validSave(latest)) throw new Error('Unsupported current save');
  const value = clone(latest || { v: 1, settings: defaults, season: null, trophies: [], unlocks: { throwback: false }, best: { shootout: 0 }, challenges: {} });
  value.settings = { ...defaults, ...(value.settings || {}), ...(intent.settings || {}) };
  if (Number.isFinite(intent.score) && intent.score >= 0) value.best = { ...(value.best || {}), shootout: Math.max(value.best?.shootout || 0, intent.score) };
  for (const k of intent.challenges || []) value.challenges = { ...(value.challenges || {}), [k]: true };
  for (const k of intent.unlocks || []) value.unlocks = { ...(value.unlocks || {}), [k]: true };
  const append = records => {
    if (!records?.length) return;
    value.trophies = value.trophies || [];
    for (const r of records) if (!value.trophies.some(old => seasonText(old) === seasonText(r))) value.trophies.push(clone(r));
  };
  append(intent.trophies);
  let seasonAccepted = false, seasonConflict = false;
  if (intent.season) {
    const s = intent.season;
    if (!s.blocked && s.base === seasonText(value.season)) {
      value.season = clone(s.value); append(s.trophies);
      seasonAccepted = true;
    } else seasonConflict = true;
  }
  return { value, seasonAccepted, seasonConflict };
}
