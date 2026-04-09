import { getState, isDone } from '../state/store.js';
import { isAvailable } from '../state/progress.js';
import { MISSIONS } from '../data/missions.js';
import { renderMath } from './math-render.js';

let activeMissionId = null;
let onSelectMission = null;

export function setOnSelectMission(fn) { onSelectMission = fn }

export function renderMissionList() {
  const pane = document.getElementById('mission-pane');
  if (!pane) return;

  // If a mission is active, don't overwrite
  if (activeMissionId !== null) return;

  const state = getState();
  let html = '<div class="mission-list-header">Missionen</div>';

  MISSIONS.forEach(m => {
    const done = isDone(m.id);
    const avail = isAvailable(m.id);
    const status = done ? 'done' : avail ? 'available' : 'locked';
    const title = typeof m.title === 'function' ? m.title() : m.title;

    html += `
      <div class="mission-card ${status}" data-id="${m.id}">
        <div class="mission-num">${done ? '✓' : m.id}</div>
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

  // Click handlers
  pane.querySelectorAll('.mission-card.available, .mission-card.done').forEach(card => {
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
