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

// ── Inline Glossar (Tap-to-reveal in Aufgabentexten) ──────────────────────────

// Begriffe die im Text erkannt und verlinkt werden sollen
const INLINE_TERMS = [
  { term: 'Ortsvektor', short: 'Zeigt vom Ursprung O zum Punkt P. Komponenten = Koordinaten von P.' },
  { term: 'Verbindungsvektor', short: '\\(\\vec{AB} = B - A\\) — Ziel minus Start.' },
  { term: 'Richtungsvektor', short: 'Gibt die Richtung einer Geraden an.' },
  { term: 'Stützvektor', short: 'Ortsvektor eines Punktes auf der Geraden.' },
  { term: 'Skalarprodukt', short: '\\(\\vec{a} \\cdot \\vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3\\) — ergibt eine Zahl.' },
  { term: 'Normalenvektor', short: 'Steht senkrecht auf einer Ebene.' },
  { term: 'Lotfußpunkt', short: 'Schnittpunkt des Lotes mit der Geraden/Ebene — bestimmt den kürzesten Abstand.' },
  { term: 'Kreuzprodukt', short: 'Ergibt einen Vektor senkrecht zu beiden Eingangsvektoren.' },
  { term: 'Parameterdarstellung', short: '\\(g: \\vec{x} = \\vec{a} + t \\cdot \\vec{v}\\)' },
  { term: 'windschief', short: 'Zwei Geraden im Raum ohne gemeinsamen Punkt, nicht parallel.' },
  { term: 'Spatprodukt', short: '\\((\\vec{c}, \\vec{a}, \\vec{b}) = \\vec{c} \\cdot (\\vec{a} \\times \\vec{b})\\) — Null wenn alle drei in einer Ebene.' },
];

export function applyInlineGlossar(container) {
  if (!container) return;
  // Only process .mission-story and .mission-task elements
  const targets = container.querySelectorAll('.mission-story, .mission-task, .step-prompt');
  targets.forEach(el => _annotateElement(el));
}

function _annotateElement(el) {
  // Don't double-annotate
  if (el.dataset.glossarDone) return;
  el.dataset.glossarDone = '1';

  INLINE_TERMS.forEach(({ term, short }) => {
    // Walk text nodes and wrap matches — avoid wrapping inside existing .gl-term or KaTeX
    _wrapTermInTextNodes(el, term, short);
  });
}

function _wrapTermInTextNodes(root, term, short) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      // Skip nodes inside KaTeX or existing glossar marks
      let p = node.parentElement;
      while (p && p !== root) {
        if (p.classList.contains('gl-term') || p.classList.contains('katex') || p.tagName === 'SCRIPT') {
          return NodeFilter.FILTER_REJECT;
        }
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);

  nodes.forEach(node => {
    const text = node.textContent;
    const idx = text.indexOf(term);
    if (idx === -1) return;

    const before = document.createTextNode(text.slice(0, idx));
    const span = document.createElement('span');
    span.className = 'gl-term';
    span.textContent = term;
    span.dataset.def = short;
    const after = document.createTextNode(text.slice(idx + term.length));

    node.parentNode.insertBefore(before, node);
    node.parentNode.insertBefore(span, node);
    node.parentNode.insertBefore(after, node);
    node.parentNode.removeChild(node);

    span.addEventListener('click', (e) => {
      e.stopPropagation();
      _togglePopup(span, short);
    });
  });
}

function _togglePopup(span, short) {
  // Remove any existing popup
  document.querySelectorAll('.gl-popup').forEach(p => p.remove());

  const existing = span.nextElementSibling;
  if (existing?.classList.contains('gl-popup')) return; // already shown — close

  const popup = document.createElement('span');
  popup.className = 'gl-popup';
  popup.innerHTML = short;
  span.insertAdjacentElement('afterend', popup);
  renderMath(popup);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', function close() {
      popup.remove();
      document.removeEventListener('click', close);
    }, { once: true });
  }, 10);
}
