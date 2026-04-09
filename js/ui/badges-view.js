import { getState, exportJSON } from '../state/store.js';

const BADGE_DEFS = [
  { id: 'erste_schritte',   name: 'Erste Schritte',    icon: '🥾', desc: 'Mission 1 abgeschlossen' },
  { id: 'vektor_meister',   name: 'Vektormeister',     icon: '🧭', desc: '5 Missionen abgeschlossen' },
  { id: 'kletter_profi',    name: 'Kletterprofi',      icon: '🧗', desc: 'Alle 12 Missionen abgeschlossen' },
  { id: 'streak_3',         name: '3-Tage-Streak',     icon: '🔥', desc: '3 Tage in Folge gelernt' },
  { id: 'streak_7',         name: 'Wochenstreak',      icon: '💥', desc: '7 Tage in Folge gelernt' },
  { id: 'streak_14',        name: 'Zweiwochenstreak',  icon: '⚡', desc: '14 Tage in Folge gelernt' },
  { id: 'first_try',        name: 'Erster Versuch',    icon: '🎯', desc: 'Eine Mission beim ersten Anlauf' },
  { id: 'gold_meister',     name: 'Goldmeister',       icon: '🏅', desc: '5 Missionen mit Gold abgeschlossen' },
  { id: 'ebenen_explorer',  name: 'Ebenen-Explorer',   icon: '📐', desc: 'Ebene durch 3 Punkte gemeistert' },
  { id: 'spiegel_held',     name: 'Spiegelheld',       icon: '🪞', desc: 'Spiegelung an Ebene gemeistert' },
];

export function renderBadges() {
  const state = getState();
  const container = document.getElementById('badges-content');
  if (!container) return;

  const xpEl = document.getElementById('badges-xp');
  if (xpEl) xpEl.textContent = `${state.progress.xp} XP`;

  const streak = state.progress.streak || 0;
  const streakNext = streak < 3 ? 3 : streak < 7 ? 7 : streak < 14 ? 14 : 14;
  const streakPct = Math.min(100, Math.round((streak / streakNext) * 100));
  const goldCount = Object.values(state.missionMastery || {}).filter(v => v === 'gold').length;

  let html = `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--gold);letter-spacing:3px">${state.progress.xp} XP</div>
      <div style="color:var(--text2);font-size:.85rem;margin-bottom:12px">${state.progress.done.length}/12 Missionen · ⭐ ${goldCount} Gold</div>
      <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:4px">
        <span style="font-size:1.2rem">🔥</span>
        <div style="flex:1;max-width:200px;background:rgba(255,255,255,.1);border-radius:6px;height:8px;overflow:hidden">
          <div style="width:${streakPct}%;height:100%;background:var(--rope);border-radius:6px;transition:width .4s"></div>
        </div>
        <span style="font-size:.8rem;color:var(--text2)">${streak} / ${streakNext} Tage</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">`;

  BADGE_DEFS.forEach(b => {
    const has = state.progress.badges.includes(b.id);
    html += `
      <div class="card" style="text-align:center;${has ? '' : 'opacity:.3;filter:grayscale(1)'}">
        <div style="font-size:2rem;margin-bottom:6px">${b.icon}</div>
        <div style="font-weight:700;font-size:.85rem">${b.name}</div>
        <div style="font-size:.72rem;color:var(--text2);margin-top:4px">${b.desc}</div>
      </div>`;
  });

  html += `</div>
    <button class="btn btn-sm" id="btn-export" style="margin-top:20px;width:100%">📊 Fortschritt exportieren (Lehrkraft)</button>`;

  container.innerHTML = html;

  document.getElementById('btn-export')?.addEventListener('click', () => {
    const data = exportJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klettermath-fortschritt-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

export function checkBadges() {
  const state = getState();
  const awards = [];
  const done = state.progress.done;
  const mastery = state.missionMastery || {};
  const goldCount = Object.values(mastery).filter(v => v === 'gold').length;

  if (done.length >= 1  && !state.progress.badges.includes('erste_schritte'))  awards.push('erste_schritte');
  if (done.length >= 5  && !state.progress.badges.includes('vektor_meister'))  awards.push('vektor_meister');
  if (done.length >= 12 && !state.progress.badges.includes('kletter_profi'))   awards.push('kletter_profi');
  if (state.progress.streak >= 3  && !state.progress.badges.includes('streak_3'))  awards.push('streak_3');
  if (state.progress.streak >= 7  && !state.progress.badges.includes('streak_7'))  awards.push('streak_7');
  if (state.progress.streak >= 14 && !state.progress.badges.includes('streak_14')) awards.push('streak_14');
  if (goldCount >= 1   && !state.progress.badges.includes('first_try'))    awards.push('first_try');
  if (goldCount >= 5   && !state.progress.badges.includes('gold_meister')) awards.push('gold_meister');
  if (done.includes(9) && !state.progress.badges.includes('ebenen_explorer')) awards.push('ebenen_explorer');
  if (done.includes(12)&& !state.progress.badges.includes('spiegel_held')) awards.push('spiegel_held');

  return awards;
}
