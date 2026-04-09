import { getState, isDone, getMastery, getDueReviews } from '../state/store.js';
import { isAvailable } from '../state/progress.js';
import { MISSIONS } from '../data/missions.js';
import { renderMath } from './math-render.js';
import { fetchCustomMissions } from '../api/sync.js';

let activeMissionId = null;
let onSelectMission = null;

export function setOnSelectMission(fn) { onSelectMission = fn }

export async function renderMissionList() {
  const pane = document.getElementById('mission-pane');
  if (!pane) return;

  // If a mission is active, don't overwrite
  if (activeMissionId !== null) return;

  const dueReviews = getDueReviews();
  // Only show concepts that have at least one done mission
  const doneConcepts = new Set(MISSIONS.filter(m => isDone(m.id)).map(m => m.concept));
  const actionableDue = dueReviews.filter(r => doneConcepts.has(r.concept)).slice(0, 3);

  let html = '<div class="mission-list-header">Missionen</div>';

  if (actionableDue.length > 0) {
    html += `<div class="review-banner">
      <div class="review-banner__title">🔔 Heute zur Wiederholung empfohlen</div>
      <div class="review-banner__items">
        ${actionableDue.map(r => {
          const daysSince = Math.floor((new Date() - new Date(r.lastDate)) / 86400000);
          return `<button class="review-chip" data-concept="${r.concept}">
            ${getConceptIcon(r.concept)} ${r.concept}
            <span class="review-chip__age">vor ${daysSince}d</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  }

  html += buildMasteryOverview();

  MISSIONS.forEach(m => {
    const done  = isDone(m.id);
    const avail = isAvailable(m.id);
    const status = done ? 'done' : avail ? 'available' : 'locked';
    const mastery = done ? getMastery(m.id) : null;
    const statusIcon = mastery === 'gold' ? '⭐' : done ? '✓' : m.id;
    const title = typeof m.title === 'function' ? m.title() : m.title;

    html += `
      <div class="mission-card ${status}" data-id="${m.id}" data-custom="0">
        <div class="mission-num">${statusIcon}</div>
        <div class="mission-info">
          <div class="mission-title">${title}</div>
          <div class="mission-meta">
            <span class="chip chip-${m.difficulty}">${m.difficulty}</span>
            <span class="mission-xp">${m.xp} XP</span>
          </div>
        </div>
      </div>`;
  });

  pane.innerHTML = html;

  pane.querySelectorAll('.review-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const concept = btn.dataset.concept;
      startReviewSession(concept);
    });
  });

  // Fetch & append custom missions
  fetchCustomMissions().then(customs => {
    if (!customs.length) return;
    let cHtml = '<div class="mission-list-header" style="margin-top:12px;border-top:1px solid rgba(139,115,85,.2);padding-top:12px">📝 Lehrer-Aufgaben</div>';
    customs.forEach(m => {
      const done = getState().progress.customDone?.includes(m.id);
      const status = done ? 'done' : 'available';
      cHtml += `
        <div class="mission-card ${status}" data-id="${m.id}" data-custom="1">
          <div class="mission-num">${done ? '✓' : '+'}</div>
          <div class="mission-info">
            <div class="mission-title">${m.title}</div>
            <div class="mission-meta">
              <span class="chip chip-Mittel">Mittel</span>
              <span class="mission-xp">${m.xp} XP</span>
            </div>
          </div>
        </div>`;
    });
    pane.insertAdjacentHTML('beforeend', cHtml);

    // Click handlers for custom missions
    pane.querySelectorAll('.mission-card[data-custom="1"].available').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        activeMissionId = id;
        const mission = customs.find(m => m.id === id);
        if (mission) import('./mission-view.js').then(mod => mod.renderMission(id, mission));
      });
    });
  });

  // Click handlers for standard missions
  pane.querySelectorAll('.mission-card[data-custom="0"].available, .mission-card[data-custom="0"].done').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      activeMissionId = id;
      if (onSelectMission) onSelectMission(id);
      import('./mission-view.js').then(mod => mod.renderMission(id));
    });
  });
}

function buildMasteryOverview() {
  // Group missions by concept
  const groups = {};
  MISSIONS.forEach(m => {
    const c = m.concept;
    if (!groups[c]) groups[c] = { total: 0, done: 0, icon: getConceptIcon(c) };
    groups[c].total++;
    if (isDone(m.id)) groups[c].done++;
  });

  const entries = Object.entries(groups);
  const totalDone = entries.reduce((s, [, g]) => s + g.done, 0);
  const totalAll  = entries.reduce((s, [, g]) => s + g.total, 0);
  const overallPct = Math.round((totalDone / totalAll) * 100);

  let html = `
    <details class="mastery-overview" ${totalDone > 0 ? 'open' : ''}>
      <summary class="mastery-overview__summary">
        <span>📊 Fortschritt</span>
        <span class="mastery-overview__total">${totalDone}/${totalAll} Missionen · ${overallPct}%</span>
      </summary>
      <div class="mastery-bars">
  `;

  entries.forEach(([concept, g]) => {
    const pct = g.total > 0 ? Math.round((g.done / g.total) * 100) : 0;
    const label = pct === 100 ? '✓' : `${g.done}/${g.total}`;
    html += `
      <div class="mastery-bar-row">
        <span class="mastery-bar-label">${g.icon} ${concept}</span>
        <div class="mastery-bar-track">
          <div class="mastery-bar-fill ${pct === 100 ? 'mastery-bar-fill--done' : ''}" style="width:${pct}%"></div>
        </div>
        <span class="mastery-bar-count">${label}</span>
      </div>
    `;
  });

  html += `</div></details>`;
  return html;
}

function getConceptIcon(concept) {
  const MAP = {
    'Ortsvektor': '📍',
    'Verbindungsvektor & Betrag': '📏',
    'Parameterdarstellung': '🚡',
    'Skalarprodukt': '⚡',
    'Punktprobe': '🔍',
    'Winkel zwischen Vektoren': '📐',
    'Lagebeziehung': '🔀',
    'Lotfußpunkt': '📐',
    'Ebene': '🪟',
    'Abstand Punkt-Ebene': '📏',
    'Schnitt Gerade–Ebene': '✂️',
    'Spiegelung an Ebene': '🪞',
  };
  return MAP[concept] || '🎯';
}

function startReviewSession(concept) {
  // Find all done missions for this concept
  const conceptMissions = MISSIONS.filter(m => m.concept === concept && isDone(m.id));
  if (!conceptMissions.length) return;

  // Pick first available mission (or rotate based on date)
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const mission = conceptMissions[dayOfYear % conceptMissions.length];

  // Open that mission directly
  import('./mission-view.js').then(mod => {
    activeMissionId = mission.id;
    mod.renderMission(mission.id);
  });
}

export function backToList() {
  activeMissionId = null;
  renderMissionList();
}

export function getActiveMissionId() { return activeMissionId }
