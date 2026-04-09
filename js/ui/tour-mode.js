// tour-mode.js — Interleaving mode: mixed questions from mastered concepts

import { MISSIONS } from '../data/missions.js';
import { isDone } from '../state/store.js';
import { checkAnswer } from '../math/checks.js';
import { renderMath } from './math-render.js';
import { showToast } from './toast.js';
import { backToList } from './mission-list.js';

const TOUR_SIZE = 5; // number of mixed questions

export function startTour() {
  // Collect one step from each done mission (only missions with vector3 or number steps)
  const doneMissions = MISSIONS.filter(m => isDone(m.id));
  if (doneMissions.length < 3) {
    showToast('Schließe mindestens 3 Missionen ab, um die Tour zu starten!', 'warn');
    return;
  }

  // Build pool: one random step per done mission
  const pool = [];
  for (const m of doneMissions) {
    for (const step of m.steps) {
      if (step.type === 'vector3' || step.type === 'number') {
        pool.push({ mission: m, step });
        break; // only first matching step per mission
      }
    }
  }

  // Shuffle and take TOUR_SIZE unique-concept items
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const seenConcepts = new Set();
  const selected = [];
  for (const item of shuffled) {
    if (!seenConcepts.has(item.mission.concept) && selected.length < TOUR_SIZE) {
      seenConcepts.add(item.mission.concept);
      selected.push(item);
    }
  }
  // Fill remaining if not enough unique concepts
  for (const item of shuffled) {
    if (selected.length >= TOUR_SIZE) break;
    if (!selected.includes(item)) selected.push(item);
  }

  renderTour(selected);
}

function renderTour(items) {
  const pane = document.getElementById('mission-pane');
  if (!pane) return;

  let html = `
    <button class="mission-back" id="tour-back">← Zurück</button>
    <h2 style="font-size:1.2rem;color:var(--rope);margin-bottom:4px">🏕️ Kletterpark-Tour</h2>
    <p style="font-size:.8rem;color:rgba(255,255,255,.5);margin-bottom:16px">
      ${items.length} gemischte Aufgaben — kein Thema-Hinweis. Welches Verfahren passt?
    </p>
    <div id="tour-items">
  `;

  items.forEach((item, i) => {
    const prompt = typeof item.step.prompt === 'function' ? item.step.prompt() : item.step.prompt;
    html += `
      <div class="tour-item" data-tour-idx="${i}">
        <div class="tour-item__num">Aufgabe ${i + 1}</div>
        <div class="tour-item__prompt step-prompt">${prompt}</div>
        ${renderTourInput(item.step, i)}
        <div class="tour-item__feedback" id="tour-fb-${i}"></div>
      </div>
    `;
  });

  html += `</div>
    <div id="tour-summary" class="tour-summary" style="display:none"></div>
  `;

  pane.innerHTML = html;
  renderMath(pane);

  document.getElementById('tour-back')?.addEventListener('click', () => backToList());

  // Bind check buttons
  items.forEach((item, i) => {
    const checkBtn = document.getElementById(`tour-check-${i}`);
    checkBtn?.addEventListener('click', () => handleTourCheck(items, i));
    // Enter key
    const inputs = pane.querySelectorAll(`#tv-${i}-0, #tv-${i}-1, #tv-${i}-2, #tn-${i}`);
    inputs.forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleTourCheck(items, i); });
    });
  });
}

function renderTourInput(step, i) {
  if (step.type === 'vector3') {
    return `<div class="vec-col-input">
      <span class="vec-bracket">⎛<br>⎜<br>⎝</span>
      <div class="vec-col-fields">
        <div class="vec-row"><span class="vec-lbl">x₁</span><input class="input-field" id="tv-${i}-0" type="number" step="any" inputmode="decimal"></div>
        <div class="vec-row"><span class="vec-lbl">x₂</span><input class="input-field" id="tv-${i}-1" type="number" step="any" inputmode="decimal"></div>
        <div class="vec-row"><span class="vec-lbl">x₃</span><input class="input-field" id="tv-${i}-2" type="number" step="any" inputmode="decimal"></div>
      </div>
      <span class="vec-bracket">⎞<br>⎟<br>⎠</span>
    </div>
    <div class="step-actions">
      <button class="btn btn-primary" id="tour-check-${i}">Prüfen</button>
    </div>`;
  }
  if (step.type === 'number') {
    return `<div class="step-input-row">
      <input class="input-field" id="tn-${i}" type="number" step="any" style="width:120px">
    </div>
    <div class="step-actions">
      <button class="btn btn-primary" id="tour-check-${i}">Prüfen</button>
    </div>`;
  }
  return '';
}

const tourResults = {};

function handleTourCheck(items, i) {
  if (tourResults[i] !== undefined) return; // already answered

  const item = items[i];
  const step = item.step;

  // Get answer
  let userAnswer;
  if (step.type === 'vector3') {
    const x = parseFloat(document.getElementById(`tv-${i}-0`)?.value);
    const y = parseFloat(document.getElementById(`tv-${i}-1`)?.value);
    const z = parseFloat(document.getElementById(`tv-${i}-2`)?.value);
    if (isNaN(x) || isNaN(y) || isNaN(z)) return;
    userAnswer = [x, y, z];
  } else {
    const n = parseFloat(document.getElementById(`tn-${i}`)?.value);
    if (isNaN(n)) return;
    userAnswer = n;
  }

  const correct = typeof step.answer === 'function' ? step.answer() : step.answer;
  const tol = step.tolerance ?? 0.1;
  const isCorrect = checkAnswer(step.type, userAnswer, correct, tol);

  tourResults[i] = { correct: isCorrect, concept: item.mission.concept };

  // Show feedback
  const fb = document.getElementById(`tour-fb-${i}`);
  if (fb) {
    fb.className = `step-feedback ${isCorrect ? 'correct' : 'wrong'}`;
    if (isCorrect) {
      fb.textContent = '✓ Richtig!';
      // Reveal concept
      fb.innerHTML += ` <span style="opacity:.6;font-size:.8rem">· ${item.mission.concept}</span>`;
    } else {
      const corStr = Array.isArray(correct) ? `(${correct.join(' | ')})` : correct;
      fb.innerHTML = `✗ Leider falsch — Lösung: <strong>${corStr}</strong> <span style="opacity:.6;font-size:.8rem">· ${item.mission.concept}</span>`;
    }
    renderMath(fb);
  }

  // Disable input
  const inputs = document.querySelectorAll(`#tv-${i}-0, #tv-${i}-1, #tv-${i}-2, #tn-${i}`);
  inputs.forEach(inp => { if (inp) inp.disabled = true; });
  document.getElementById(`tour-check-${i}`)?.remove();

  // Check if all answered
  if (Object.keys(tourResults).length === items.length) {
    showTourSummary(items);
  }
}

function showTourSummary(items) {
  // Group results by concept
  const byConceptMap = {};
  for (const [i, res] of Object.entries(tourResults)) {
    if (!byConceptMap[res.concept]) byConceptMap[res.concept] = { correct: 0, total: 0 };
    byConceptMap[res.concept].total++;
    if (res.correct) byConceptMap[res.concept].correct++;
  }

  const totalCorrect = Object.values(tourResults).filter(r => r.correct).length;
  const total = items.length;

  let html = `
    <div class="tour-summary__title">🏁 Tour abgeschlossen: ${totalCorrect}/${total} richtig</div>
    <div class="tour-summary__breakdown">
  `;
  for (const [concept, stats] of Object.entries(byConceptMap)) {
    const allOk = stats.correct === stats.total;
    html += `<div class="tour-summary__row">
      <span>${concept}</span>
      <span class="${allOk ? 'tour-ok' : 'tour-err'}">${stats.correct}/${stats.total} ${allOk ? '✓' : '✗'}</span>
    </div>`;
  }
  html += `</div>
    <button class="btn btn-primary" id="tour-done" style="margin-top:12px;width:100%">Zurück zur Übersicht</button>
  `;

  const summaryEl = document.getElementById('tour-summary');
  if (summaryEl) {
    summaryEl.innerHTML = html;
    summaryEl.style.display = 'block';
    summaryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('tour-done')?.addEventListener('click', () => backToList());
  }

  if (totalCorrect === total) {
    showToast('🏆 Perfekte Runde! Alle Themen gemischt gemeistert!', 'ok', 3000);
  }
}
