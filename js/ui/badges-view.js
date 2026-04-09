import { getState } from '../state/store.js';

const BADGE_DEFS = [
  { id: 'erste_schritte', name: 'Erste Schritte', icon: '🥾', desc: 'Mission 1 abgeschlossen' },
  { id: 'vektor_meister', name: 'Vektormeister', icon: '🧭', desc: '5 Missionen abgeschlossen' },
  { id: 'kletter_profi', name: 'Kletterprofi', icon: '🧗', desc: 'Alle 10 Missionen abgeschlossen' },
  { id: 'streak_3', name: '3-Tage-Streak', icon: '🔥', desc: '3 Tage in Folge gelernt' },
  { id: 'first_try', name: 'Erster Versuch', icon: '🎯', desc: 'Eine Mission im ersten Anlauf' },
  { id: 'ebenen_explorer', name: 'Ebenen-Explorer', icon: '📐', desc: 'Die Kletterwand gemeistert' },
];

export function renderBadges() {
  const state = getState();
  const container = document.getElementById('badges-content');
  if (!container) return;

  const xpEl = document.getElementById('badges-xp');
  if (xpEl) xpEl.textContent = `${state.progress.xp} XP`;

  let html = `
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:2.5rem;color:var(--gold);letter-spacing:3px">${state.progress.xp} XP</div>
      <div style="color:var(--text2);font-size:.85rem">${state.progress.done.length}/10 Missionen · Streak: ${state.progress.streak} Tage</div>
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

  html += '</div>';
  container.innerHTML = html;
}

export function checkBadges() {
  const state = getState();
  const awards = [];
  const done = state.progress.done;

  if (done.length >= 1 && !state.progress.badges.includes('erste_schritte')) awards.push('erste_schritte');
  if (done.length >= 5 && !state.progress.badges.includes('vektor_meister')) awards.push('vektor_meister');
  if (done.length >= 10 && !state.progress.badges.includes('kletter_profi')) awards.push('kletter_profi');
  if (state.progress.streak >= 3 && !state.progress.badges.includes('streak_3')) awards.push('streak_3');
  if (done.includes(9) && !state.progress.badges.includes('ebenen_explorer')) awards.push('ebenen_explorer');

  return awards;
}
