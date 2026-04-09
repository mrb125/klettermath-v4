import { getState, exportJSON } from '../state/store.js';
import { TASKS_LIBRARY } from '../data/tasks-library.js';

const FLASHCARDS = [
  {
    icon: '📍', term: 'Ortsvektor',
    def: 'Vektor vom Ursprung zu einem Punkt P',
    formula: 'OP⃗ = (x₁|x₂|x₃)',
    unlockMission: 1
  },
  {
    icon: '➡️', term: 'Verbindungsvektor',
    def: 'Vektor von Punkt A nach Punkt B',
    formula: 'AB⃗ = OB⃗ − OA⃗',
    unlockMission: 4
  },
  {
    icon: '📏', term: 'Betrag',
    def: 'Länge eines Vektors',
    formula: '|v⃗| = √(x₁²+x₂²+x₃²)',
    unlockMission: 6
  },
  {
    icon: '🎯', term: 'Einheitsvektor',
    def: 'Vektor der Länge 1 in Richtung v⃗',
    formula: 'v̂ = v⃗ / |v⃗|',
    unlockMission: 6
  },
  {
    icon: '📐', term: 'Gerade',
    def: 'Alle Punkte auf einer Linie durch A in Richtung u⃗',
    formula: 'g: x⃗ = a⃗ + t·u⃗',
    unlockMission: 7
  },
  {
    icon: '✅', term: 'Punktprobe',
    def: 'Liegt Punkt P auf Gerade g?',
    formula: 'Löse x⃗ = a⃗ + t·u⃗ nach t',
    unlockMission: 8
  },
  {
    icon: '🪟', term: 'Spurpunkt',
    def: 'Schnittpunkt einer Geraden mit einer Koordinatenebene',
    formula: 'Setze xᵢ = 0, löse nach t',
    unlockMission: 9
  },
  {
    icon: '⚡', term: 'Skalarprodukt',
    def: 'Maß für den "Gleichlauf" zweier Vektoren',
    formula: 'a⃗·b⃗ = x₁y₁+x₂y₂+x₃y₃',
    unlockMission: 11
  },
  {
    icon: '📐', term: 'Winkel',
    def: 'Winkel zwischen zwei Vektoren',
    formula: 'cos φ = a⃗·b⃗ / (|a⃗||b⃗|)',
    unlockMission: 12
  },
];

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

    <div style="margin-top:28px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.2rem;letter-spacing:2px;color:var(--rope);margin-bottom:6px">
        🃏 Lernkarten
      </div>
      <div style="font-size:.75rem;color:var(--text2);margin-bottom:12px">
        Tippe auf eine Karte zum Umdrehen · Schalte neue Karten durch Missionen frei
      </div>
      <div class="flashcard-grid" id="flashcard-grid">`;

  FLASHCARDS.forEach((card, i) => {
    const unlocked = state.progress.done.includes(card.unlockMission);
    html += `
      <div class="flashcard${unlocked ? '' : ' locked'}" data-idx="${i}">
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="flashcard-icon">${card.icon}</div>
            <div class="flashcard-term">${card.term}</div>
            ${unlocked
              ? '<div style="font-size:.65rem;color:var(--text3);margin-top:4px">→ umdrehen</div>'
              : `<div style="font-size:.65rem;color:var(--text3);margin-top:4px">🔒 M${card.unlockMission}</div>`}
          </div>
          <div class="flashcard-back">
            <div class="flashcard-def">${card.def}</div>
            <div class="flashcard-formula">${card.formula}</div>
          </div>
        </div>
      </div>`;
  });

  html += `</div></div>
    <button class="btn btn-sm" id="btn-export" style="margin-top:20px;width:100%">📊 Fortschritt exportieren (Lehrkraft)</button>`;

  container.innerHTML = html;

  // Flip cards on click (unlocked only)
  document.querySelectorAll('.flashcard:not(.locked)').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

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

  renderTaskLibrarySection(container);
}

const CONCEPT_MAP = {
  koordinaten:'📍 Koordinaten', ortsvektor:'🎯 Ortsvektor', verbindungsvektor:'↗ Verbindungsvektor',
  betrag:'📏 Betrag', geradengleichung:'📐 Gerade', spurpunkt:'✕ Spurpunkt',
  schnittgerade:'⚡ Schnitt', abstand:'↔ Abstand', skalarprodukt:'· Skalarprodukt',
  winkel:'∠ Winkel', kreuzprodukt:'✕ Kreuzprodukt',
};

let _taskFilter = 'alle';

function renderTaskLibrarySection(container) {
  const section = document.createElement('details');
  section.id = 'task-library-section';
  section.style.cssText = 'margin-top:24px;border:1px solid rgba(139,115,85,.25);border-radius:12px;overflow:hidden';

  section.innerHTML = `
    <summary style="padding:14px 16px;cursor:pointer;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:2px;color:var(--rope);list-style:none;display:flex;align-items:center;gap:10px;background:rgba(232,160,48,.06)">
      <span>📚</span> Aufgaben-Bibliothek
      <span style="font-family:'Nunito',sans-serif;font-size:.72rem;color:var(--text2);font-weight:400;letter-spacing:.5px;margin-left:4px">${TASKS_LIBRARY.length} Aufgaben · 18 Länder</span>
      <span style="margin-left:auto;font-size:.75rem;color:var(--text2)">▼</span>
    </summary>
    <div style="padding:14px 16px">
      <div style="font-size:.75rem;color:var(--text2);margin-bottom:12px">Internationale Vektorrechnung-Aufgaben für Q1 GK NRW — mit KletterMath-Adaptierungshinweis</div>
      <div id="task-filter-bar" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px"></div>
      <div id="task-cards-list"></div>
    </div>`;

  container.appendChild(section);
  renderTaskFilters();
  renderTaskCards();
}

function renderTaskFilters() {
  const bar = document.getElementById('task-filter-bar');
  if (!bar) return;
  const concepts = ['alle', ...new Set(TASKS_LIBRARY.map(t => t.concept))];
  bar.innerHTML = concepts.map(c => {
    const label = c === 'alle' ? 'Alle' : (CONCEPT_MAP[c] || c);
    const active = _taskFilter === c;
    return `<button class="tl-filter-btn" data-f="${c}" style="
      padding:4px 10px;border-radius:99px;border:1px solid ${active ? 'var(--rope)' : 'rgba(139,115,85,.25)'};
      background:${active ? 'rgba(232,160,48,.2)' : 'transparent'};
      color:${active ? 'var(--rope)' : 'var(--text2)'};
      cursor:pointer;font-size:.72rem;font-family:var(--font);font-weight:700">${label}</button>`;
  }).join('');
  bar.querySelectorAll('.tl-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => { _taskFilter = btn.dataset.f; renderTaskFilters(); renderTaskCards(); });
  });
}

function renderTaskCards() {
  const list = document.getElementById('task-cards-list');
  if (!list) return;
  const tasks = _taskFilter === 'alle' ? TASKS_LIBRARY : TASKS_LIBRARY.filter(t => t.concept === _taskFilter);
  if (!tasks.length) { list.innerHTML = '<div style="color:var(--text2);font-size:.85rem">Keine Aufgaben für diesen Filter.</div>'; return; }

  list.innerHTML = tasks.map(t => {
    const diffColor = t.diff === 'leicht' ? 'var(--ok)' : t.diff === 'mittel' ? 'var(--rope)' : 'var(--err)';
    const diffLabel = t.diff === 'leicht' ? '● Leicht' : t.diff === 'mittel' ? '●● Mittel' : '●●● Schwer';
    const conceptLabel = CONCEPT_MAP[t.concept] || t.concept;
    return `<div style="background:rgba(255,255,255,.04);border:1px solid rgba(139,115,85,.18);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
        <span style="font-size:1.3rem;flex-shrink:0">${t.flag}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.9rem;line-height:1.3">${t.title}</div>
          <div style="font-size:.72rem;color:var(--text2);margin-top:2px">${t.country} · ${t.context}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;background:rgba(100,149,237,.15);color:#6495ed;border:1px solid rgba(100,149,237,.25);font-weight:700">${conceptLabel}</span>
        <span style="font-size:.7rem;padding:2px 8px;border-radius:99px;color:${diffColor};border:1px solid ${diffColor}30;background:${diffColor}18;font-weight:700">${diffLabel}</span>
      </div>
      <div style="font-size:.82rem;color:var(--text2);line-height:1.5;margin-bottom:8px">${t.desc}</div>
      <div style="font-size:.78rem;background:rgba(232,160,48,.06);border:1px solid rgba(232,160,48,.15);border-radius:6px;padding:7px 10px;line-height:1.4;margin-bottom:8px">🧗 ${t.km}</div>
      <a href="${t.source}" target="_blank" rel="noopener" style="font-size:.73rem;color:var(--rope);opacity:.8;text-decoration:none">🔗 ${t.label}</a>
    </div>`;
  }).join('');
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
