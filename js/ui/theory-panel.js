// theory-panel.js
// Erklärungen (einblendbar über Button in Mission) + Glossar-Sidebar (rechts)

import { THEORY, GLOSSAR } from '../data/theory.js';
import { getState, isDone } from '../state/store.js';
import { renderMath } from './math-render.js';

// ── Theory Card (eingeblendet in Mission) ────────────────────────────────────

export function renderTheoryButton(concept, container) {
  const entry = THEORY[concept];
  if (!entry) return;
  const btn = document.createElement('button');
  btn.className = 'btn btn-sm theory-toggle-btn';
  btn.dataset.concept = concept;
  btn.innerHTML = `${entry.icon} Erklärung einblenden`;
  btn.addEventListener('click', () => toggleTheoryCard(concept, btn));
  container.appendChild(btn);
}

function toggleTheoryCard(concept, btn) {
  const existing = btn.parentElement.querySelector('.theory-card');
  if (existing) {
    existing.classList.toggle('theory-card--hidden');
    btn.innerHTML = existing.classList.contains('theory-card--hidden')
      ? `${THEORY[concept].icon} Erklärung einblenden`
      : `${THEORY[concept].icon} Erklärung ausblenden`;
    return;
  }

  const card = buildTheoryCard(concept);
  btn.insertAdjacentElement('afterend', card);
  btn.innerHTML = `${THEORY[concept].icon} Erklärung ausblenden`;
  renderMath(card);
}

function buildTheoryCard(concept) {
  const e = THEORY[concept];
  const card = document.createElement('div');
  card.className = 'theory-card';
  card.style.setProperty('--tc-color', e.color);
  card.innerHTML = `
    <div class="theory-card__header">
      <span class="theory-card__icon">${e.icon}</span>
      <div>
        <div class="theory-card__title">${e.title}</div>
        <div class="theory-card__sub">${e.subtitle}</div>
      </div>
    </div>
    <div class="theory-card__formula">${e.formula}</div>
    <div class="theory-card__body">${e.body}</div>
    <div class="theory-card__facts">
      <div class="theory-card__facts-label">Merksätze</div>
      <ul>
        ${e.keyFacts.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
  `;
  return card;
}

// ── Glossar Sidebar ───────────────────────────────────────────────────────────

let _glossarOpen = false;

export function initGlossar() {
  if (document.getElementById('glossar-sidebar')) return;

  // Toggle Button (rechts fixiert im Park-Screen)
  const toggle = document.createElement('button');
  toggle.id = 'glossar-toggle';
  toggle.className = 'glossar-toggle';
  toggle.innerHTML = '📖<br><span>Glossar</span>';
  toggle.setAttribute('aria-label', 'Glossar öffnen');
  toggle.addEventListener('click', () => openGlossar());
  document.getElementById('s-park')?.appendChild(toggle);

  // Sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'glossar-sidebar';
  sidebar.className = 'glossar-sidebar';
  sidebar.innerHTML = `
    <div class="glossar-head">
      <span class="glossar-title">📖 Glossar</span>
      <button class="glossar-close" id="glossar-close" aria-label="Schließen">✕</button>
    </div>
    <div class="glossar-filter-row" id="glossar-filter-row"></div>
    <div class="glossar-list" id="glossar-list"></div>
  `;
  document.getElementById('s-park')?.appendChild(sidebar);

  document.getElementById('glossar-close')?.addEventListener('click', closeGlossar);

  // Close on outside click
  sidebar.addEventListener('click', e => e.stopPropagation());
  document.getElementById('s-park')?.addEventListener('click', () => {
    if (_glossarOpen) closeGlossar();
  });
}

export function openGlossar() {
  _glossarOpen = true;
  const sidebar = document.getElementById('glossar-sidebar');
  if (!sidebar) return;
  sidebar.classList.add('glossar-sidebar--open');
  document.getElementById('glossar-toggle')?.classList.add('active');
  renderGlossarContent();
}

function closeGlossar() {
  _glossarOpen = false;
  document.getElementById('glossar-sidebar')?.classList.remove('glossar-sidebar--open');
  document.getElementById('glossar-toggle')?.classList.remove('active');
}

function unlockedCount() {
  // Count completed missions
  const state = getState();
  const done = state.missions ? Object.keys(state.missions).filter(id => isDone(parseInt(id))).length : 0;
  return done;
}

function renderGlossarContent() {
  const list = document.getElementById('glossar-list');
  const filterRow = document.getElementById('glossar-filter-row');
  if (!list) return;

  const done = unlockedCount();
  const entries = GLOSSAR.filter(g => g.unlock <= done);
  const locked = GLOSSAR.filter(g => g.unlock > done);

  // Filter buttons (A-Z / Freigeschaltet)
  filterRow.innerHTML = `
    <span class="glossar-progress">${entries.length}/${GLOSSAR.length} freigeschaltet</span>
  `;

  let html = '';
  entries.forEach(g => {
    html += `
      <div class="glossar-entry">
        <div class="glossar-term">
          ${g.term}
          ${g.symbol ? `<span class="glossar-sym">\\(${g.symbol}\\)</span>` : ''}
        </div>
        <div class="glossar-def">${g.def}</div>
      </div>
    `;
  });

  if (locked.length > 0) {
    html += `<div class="glossar-locked-hint">🔒 ${locked.length} weitere Begriffe werden nach mehr Missionen freigeschaltet</div>`;
  }

  list.innerHTML = html;
  renderMath(list);
}

// Update glossar when missions complete (call from mission-view)
export function refreshGlossar() {
  if (_glossarOpen) renderGlossarContent();
}
