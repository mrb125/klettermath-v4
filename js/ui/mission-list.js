import { getState, isDone, getMastery } from '../state/store.js';
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

  let html = '<div class="mission-list-header">Missionen</div>';

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

export function backToList() {
  activeMissionId = null;
  renderMissionList();
}

export function getActiveMissionId() { return activeMissionId }
