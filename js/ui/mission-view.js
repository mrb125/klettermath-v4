import { MISSIONS } from '../data/missions.js';
import { PLATS } from '../data/platforms.js';
import { checkAnswer, runDiagnostics } from '../math/checks.js';
import { getState, completeMission, completeCustomMission, addAttempt, useHint, getMissionStep, addErrorPattern, awardBadge } from '../state/store.js';
import { isExamMode } from '../state/exam-mode.js';
import { renderMath } from './math-render.js';
import { showToast } from './toast.js';
import { backToList } from './mission-list.js';
import { updateTopBar } from '../main.js';
import { checkBadges } from './badges-view.js';
import { renderTheoryButton, refreshGlossar, applyInlineGlossar } from './theory-panel.js';

let currentMission = null;
let currentStepIdx = 0;
let missionIsGold = true;

export function renderMission(missionId, customMission = null) {
  const mission = customMission || MISSIONS.find(m => m.id === missionId);
  if (!mission) return;
  currentMission = mission;
  currentStepIdx = 0;
  missionIsGold = true;

  // Find first incomplete step
  const state = getState();
  for (let i = 0; i < mission.steps.length; i++) {
    const ms = getMissionStep(missionId, i);
    if (ms.attempts > 0 && checkStepCorrect(mission, i)) {
      currentStepIdx = i + 1;
    } else {
      break;
    }
  }

  // Highlight platforms in scene
  highlightPlatforms(mission.platforms);

  renderMissionUI();
}

function checkStepCorrect(mission, stepIdx) {
  const step = mission.steps[stepIdx];
  const ms = getMissionStep(mission.id, stepIdx);
  return ms.attempts > 0 && ms.firstTry !== undefined;
}

function renderMissionUI() {
  const pane = document.getElementById('mission-pane');
  if (!pane || !currentMission) return;
  const m = currentMission;
  const title = typeof m.title === 'function' ? m.title() : m.title;

  let html = `
    <button class="mission-back" id="btn-back">← Zurück</button>
    <h2 style="font-size:1.3rem;color:var(--rope);margin-bottom:4px">Mission ${m.id}: ${title}</h2>
    <span class="chip chip-${m.difficulty}" style="margin-bottom:12px;display:inline-block">${m.difficulty} · ${m.xp} XP</span>
    <div class="mission-story">${m.story()}</div>
    <div class="mission-task">${m.task()}</div>`;

  // Tischaufgabe
  if (m.tischaufgabe) {
    html += `
      <details class="tisch-box">
        <summary>🪵 Tischaufgabe</summary>
        ${m.tischaufgabe.setup()}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-sm tisch-stl-btn">🖨️ Park mit Boden (STL)</button>
          <button class="btn btn-sm tisch-stl-plat-btn">🏗️ Nur Plattformen (STL)</button>
          <button class="btn btn-sm tisch-stl-indiv-btn" style="border-color:rgba(91,155,213,.4);color:#6495ed">📦 Einzeln für Bambu Lab (ZIP)</button>
        </div>
      </details>`;
  }

  // Steps
  // Exam mode banner
  if (isExamMode()) {
    html += `<div style="background:rgba(255,94,91,.12);border:1px solid rgba(255,94,91,.35);border-radius:8px;padding:8px 14px;margin-bottom:12px;font-size:.8rem;color:#ff5e5b">
      🎓 Prüfungsmodus — keine Hinweise verfügbar
    </div>`;
  }

  html += '<div id="steps-container">';
  m.steps.forEach((step, i) => {
    const isActive = i === currentStepIdx;
    const isDone = i < currentStepIdx;
    const isLocked = i > currentStepIdx;
    html += renderStep(step, i, isActive, isDone, isLocked);
  });
  html += '</div>';

  // If all done, show completion
  if (currentStepIdx >= m.steps.length) {
    html += renderCompletion();
  }

  pane.innerHTML = html;
  renderMath(pane);
  applyInlineGlossar(pane);

  bindStepEvents();

  document.getElementById('btn-back')?.addEventListener('click', () => {
    clearHighlights();
    backToList();
  });

  pane.querySelector('.tisch-stl-btn')?.addEventListener('click', () => {
    import('../export/stl-model.js').then(m => m.downloadParkSTL()).catch(console.error);
  });
  pane.querySelector('.tisch-stl-plat-btn')?.addEventListener('click', () => {
    import('../export/stl-model.js').then(m => m.downloadPlatformsSTL()).catch(console.error);
  });
  pane.querySelector('.tisch-stl-indiv-btn')?.addEventListener('click', () => {
    import('../export/stl-model.js').then(m => m.downloadIndividualSTLs()).catch(console.error);
  });

  document.getElementById('btn-next-mission')?.addEventListener('click', () => {
    clearHighlights();
    backToList();
  });
}

function renderStep(step, idx, isActive, isDone, isLocked) {
  const cls = isDone ? 'done' : isLocked ? 'locked' : '';
  const prompt = typeof step.prompt === 'function' ? step.prompt() : step.prompt;

  let html = `<div class="step-card ${cls}" data-step="${idx}">`;
  html += `<div class="step-prompt">${isDone ? '✓ ' : ''}${prompt}</div>`;

  if (isActive) {
    html += renderInput(step, idx);
  }

  html += `<div id="feedback-${idx}"></div>`;
  html += `<div id="hint-${idx}"></div>`;
  html += '</div>';
  return html;
}

function renderInput(step, idx) {
  let html = '';
  if (step.type === 'vector3') {
    html += `<div class="vec-col-input">
      <span class="vec-bracket">⎛<br>⎜<br>⎝</span>
      <div class="vec-col-fields">
        <div class="vec-row"><span class="vec-lbl">x₁</span><input class="input-field" id="v-${idx}-0" type="number" step="any" inputmode="decimal"></div>
        <div class="vec-row"><span class="vec-lbl">x₂</span><input class="input-field" id="v-${idx}-1" type="number" step="any" inputmode="decimal"></div>
        <div class="vec-row"><span class="vec-lbl">x₃</span><input class="input-field" id="v-${idx}-2" type="number" step="any" inputmode="decimal"></div>
      </div>
      <span class="vec-bracket">⎞<br>⎟<br>⎠</span>
    </div>`;
  } else if (step.type === 'number') {
    html += `<div class="step-input-row">
      <input class="input-field" id="num-${idx}" type="number" step="any" style="width:120px">
    </div>`;
  } else if (step.type === 'mc') {
    html += '<div class="mc-options">';
    (step.options || []).forEach((opt, oi) => {
      html += `<button class="mc-option" data-step="${idx}" data-opt="${opt}">${opt}</button>`;
    });
    html += '</div>';
  }

  html += `<div class="step-actions">
    ${step.type !== 'mc' ? `<button class="btn btn-primary" id="check-${idx}">Prüfen</button>` : ''}
    ${isExamMode() ? '' : `<button class="btn btn-sm" id="hint-btn-${idx}">💡 Hinweis</button>`}
  </div>`;

  return html;
}

function bindStepEvents() {
  if (!currentMission) return;
  const idx = currentStepIdx;
  if (idx >= currentMission.steps.length) return;
  const step = currentMission.steps[idx];

  // Check button
  const checkBtn = document.getElementById(`check-${idx}`);
  if (checkBtn) {
    checkBtn.addEventListener('click', () => handleCheck(idx));
  }

  // Enter key on inputs
  document.querySelectorAll(`#v-${idx}-0, #v-${idx}-1, #v-${idx}-2, #num-${idx}`).forEach(inp => {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleCheck(idx) });
  });

  // MC options
  document.querySelectorAll(`.mc-option[data-step="${idx}"]`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`.mc-option[data-step="${idx}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      handleMCCheck(idx, btn.dataset.opt);
    });
  });

  // Hint button
  const hintBtn = document.getElementById(`hint-btn-${idx}`);
  if (hintBtn) {
    hintBtn.addEventListener('click', () => handleHint(idx));
  }

  // Focus first input
  const firstInput = document.getElementById(`v-${idx}-0`) || document.getElementById(`num-${idx}`);
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function getUserAnswer(step, idx) {
  if (step.type === 'vector3') {
    const x = parseFloat(document.getElementById(`v-${idx}-0`)?.value);
    const y = parseFloat(document.getElementById(`v-${idx}-1`)?.value);
    const z = parseFloat(document.getElementById(`v-${idx}-2`)?.value);
    if (isNaN(x) || isNaN(y) || isNaN(z)) return null;
    return [x, y, z];
  }
  if (step.type === 'number') {
    const n = parseFloat(document.getElementById(`num-${idx}`)?.value);
    if (isNaN(n)) return null;
    return n;
  }
  return null;
}

function handleCheck(idx) {
  const step = currentMission.steps[idx];
  const userAnswer = getUserAnswer(step, idx);
  if (userAnswer === null) {
    showFeedback(idx, 'Bitte alle Felder ausfüllen.', false);
    return;
  }
  doCheck(idx, step, userAnswer);
}

function handleMCCheck(idx, selected) {
  const step = currentMission.steps[idx];
  doCheck(idx, step, selected);
}

function doCheck(idx, step, userAnswer) {
  const correct = typeof step.answer === 'function' ? step.answer() : step.answer;
  const tol = step.tolerance ?? 0.1;
  const isCorrect = checkAnswer(step.type, userAnswer, correct, tol);

  addAttempt(currentMission.id, idx);

  if (isCorrect) {
    showFeedback(idx, 'Richtig! ✓', true);
    markInputsCorrect(step, idx);
    if (step.type === 'vector3') showVectorArrow(userAnswer, true);
    currentStepIdx = idx + 1;

    const advanceStep = () => {
      if (currentStepIdx >= currentMission.steps.length) {
        onMissionComplete();
      } else {
        renderMissionUI();
      }
    };

    setTimeout(() => {
      if (!isExamMode()) {
        showSelfExplain(idx, currentMission.concept, advanceStep);
      } else {
        advanceStep();
      }
    }, 600);
  } else {
    missionIsGold = false;
    // Check diagnostics (suppressed in exam mode)
    const diagMsg = isExamMode() ? null : runDiagnostics(step.type, userAnswer, step.diagnostics);
    const msg = diagMsg || 'Leider falsch. Versuch es nochmal!';
    showFeedback(idx, msg, false);
    markInputsWrong(step, idx);
    addErrorPattern(currentMission.concept);
    // Generation Effect: Erklärung nach ≥2 Fehlversuchen automatisch einblenden
    const msNow = getMissionStep(currentMission.id, idx);
    if (msNow.attempts >= 2) {
      const taskEl = document.querySelector('#mission-pane .mission-task');
      if (taskEl && !document.querySelector('.theory-card') && !document.querySelector('.theory-toggle-btn')) {
        showToast('💡 Erklärung freigeschaltet — du kämpfst nicht allein!', 'ok', 3000);
        renderTheoryButton(currentMission.concept, taskEl);
        const autoBtn = taskEl.querySelector('.theory-toggle-btn');
        if (autoBtn) setTimeout(() => autoBtn.click(), 500);
      }
    }
    if (step.type === 'vector3') {
      const ms = getMissionStep(currentMission.id, idx);
      showVectorArrow(userAnswer, false);
      if (ms.attempts >= 3) {
        const correct = typeof step.answer === 'function' ? step.answer() : step.answer;
        if (Array.isArray(correct)) showVectorArrow(correct, true);
      }
    }
  }
}

function showFeedback(idx, msg, correct) {
  const el = document.getElementById(`feedback-${idx}`);
  if (!el) return;
  el.className = `step-feedback ${correct ? 'correct' : 'wrong'}`;
  el.innerHTML = msg;
  renderMath(el);
}

function markInputsCorrect(step, idx) {
  if (step.type === 'vector3') {
    for (let i = 0; i < 3; i++) {
      const inp = document.getElementById(`v-${idx}-${i}`);
      if (inp) { inp.classList.add('correct'); inp.disabled = true }
    }
  } else if (step.type === 'number') {
    const inp = document.getElementById(`num-${idx}`);
    if (inp) { inp.classList.add('correct'); inp.disabled = true }
  } else if (step.type === 'mc') {
    document.querySelectorAll(`.mc-option[data-step="${idx}"]`).forEach(b => {
      const correct = typeof currentMission.steps[idx].answer === 'function'
        ? currentMission.steps[idx].answer() : currentMission.steps[idx].answer;
      b.classList.add(b.dataset.opt === correct ? 'correct' : '');
      b.disabled = true;
    });
  }
}

function markInputsWrong(step, idx) {
  if (step.type === 'vector3') {
    for (let i = 0; i < 3; i++) {
      const inp = document.getElementById(`v-${idx}-${i}`);
      if (inp) inp.classList.add('wrong');
    }
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        const inp = document.getElementById(`v-${idx}-${i}`);
        if (inp) inp.classList.remove('wrong');
      }
    }, 1500);
  } else if (step.type === 'number') {
    const inp = document.getElementById(`num-${idx}`);
    if (inp) inp.classList.add('wrong');
    setTimeout(() => inp?.classList.remove('wrong'), 1500);
  }
}

function handleHint(idx) {
  missionIsGold = false;
  const step = currentMission.steps[idx];
  if (!step.hints || !step.hints.length) return;
  const ms = getMissionStep(currentMission.id, idx);

  const hintEl = document.getElementById(`hint-${idx}`);
  if (!hintEl) return;

  const totalTiers = step.hints.length;

  // Determine which tier to reveal next.
  // ms.hintTier stays 0 after showing tier 0 (useHint uses Math.max),
  // so we use DOM presence to distinguish "first click" from "already showing".
  const hintsAlreadyShown = hintEl && hintEl.querySelector('.hint-tier-label');
  let nextTier;
  if (!hintsAlreadyShown) {
    // First reveal — adaptive: skip to tier 1 if many prior errors
    const state = getState();
    const priorErrors = state.analytics?.errorPatterns?.[currentMission.concept] || 0;
    if (priorErrors >= 3) {
      nextTier = Math.min(1, totalTiers - 1);
      showToast('💡 Adaptiver Modus: Du bekommst direkt eine ausführlichere Hilfe.', 'ok', 3500);
    } else {
      nextTier = 0;
    }
  } else {
    nextTier = Math.min(ms.hintTier + 1, totalTiers - 1);
  }

  useHint(currentMission.id, idx, nextTier);

  const TIER_META = [
    { label: '💡 Hinweis',       cls: 'hint-box hint-tier-1' },
    { label: '🔍 Strategie',     cls: 'hint-box hint-tier-2' },
    { label: '📝 Musterlösung',  cls: 'worked-box hint-tier-3' },
  ];

  let html = '';
  for (let t = 0; t <= nextTier; t++) {
    const hint = typeof step.hints[t] === 'function' ? step.hints[t]() : step.hints[t];
    const meta = TIER_META[t] || TIER_META[TIER_META.length - 1];
    html += `<div class="${meta.cls}">
      <span class="hint-tier-label">${meta.label}</span>
      <div class="hint-content">${hint}</div>
    </div>`;
  }

  // Progress dots
  html += '<div class="hint-progress">';
  for (let t = 0; t < totalTiers; t++) {
    html += `<span class="hint-dot ${t <= nextTier ? 'filled' : ''}"></span>`;
  }
  html += `<span class="hint-progress-txt">${nextTier + 1} / ${totalTiers}</span>`;
  html += '</div>';

  // "Nächste Stufe" button if more tiers remain
  if (nextTier < totalTiers - 1) {
    html += `<button class="btn btn-sm hint-next-btn" id="hint-next-${idx}" style="margin-top:6px">▶ Nächste Stufe</button>`;
  }

  hintEl.innerHTML = html;
  renderMath(hintEl);

  document.getElementById(`hint-next-${idx}`)?.addEventListener('click', () => handleHint(idx));
}

function onMissionComplete() {
  const m = currentMission;
  if (m.isCustom) {
    completeCustomMission(m.id, m.xp);
  } else {
    completeMission(m.id, m.xp, missionIsGold);
  }
  showToast(`+${m.xp} XP`, 'xp');
  updateTopBar();

  // Check badges
  const newBadges = checkBadges();
  newBadges.forEach(b => {
    if (awardBadge(b)) showToast(`Badge freigeschaltet: ${b}`, 'ok', 4000);
  });
  refreshGlossar();

  renderMissionUI();
}

function renderCompletion() {
  const m = currentMission;
  let html = `
    <div class="completion-banner">
      <div class="completion-xp">+${m.xp} XP</div>
      <div class="completion-msg">Mission abgeschlossen!</div>
    </div>`;

  if (m.insight) {
    html += `
      <div class="insight-card">
        <div class="insight-title">${m.insight.title}</div>
        <div class="insight-formula">${m.insight.formula}</div>
        <div class="insight-body">${m.insight.body}</div>
      </div>`;
  }

  html += `<button class="btn btn-primary" style="margin-top:16px;width:100%" id="btn-next-mission">Nächste Mission</button>`;

  return html;
}

// ── Selbsterklärungscheck ─────────────────────────────────────────────────────
async function showSelfExplain(idx, concept, onDone) {
  const { THEORY } = await import('../data/theory.js');
  const se = THEORY[concept]?.selfExplain;
  if (!se) { onDone(); return; }

  const fb = document.getElementById(`feedback-${idx}`);
  if (!fb) { onDone(); return; }

  // Shuffle options
  const opts = [...se.options].sort(() => Math.random() - 0.5);

  const el = document.createElement('div');
  el.className = 'self-explain';
  el.innerHTML = `
    <div class="se-question">🤔 ${se.q}</div>
    <div class="se-options">
      ${opts.map((o, i) => `<button class="se-opt" data-idx="${i}">${o.text}</button>`).join('')}
    </div>
    <button class="se-skip">Überspringen →</button>
  `;
  fb.appendChild(el);
  renderMath(el);

  el.querySelector('.se-skip').addEventListener('click', onDone);
  el.querySelectorAll('.se-opt').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.se-opt').forEach(b => b.disabled = true);
      const opt = opts[i];
      const fbDiv = document.createElement('div');
      fbDiv.className = opt.correct ? 'se-feedback se-ok' : 'se-feedback se-err';
      fbDiv.textContent = opt.fb;
      el.appendChild(fbDiv);
      setTimeout(onDone, 1800);
    });
  });
}

// Scene integration stubs
function highlightPlatforms(platformIds) {
  try {
    import('../scene/scene-manager.js').then(mod => {
      if (mod.highlightPlatforms) mod.highlightPlatforms(platformIds);
    }).catch(() => {});
  } catch {}
}

function clearHighlights() {
  try {
    import('../scene/scene-manager.js').then(mod => {
      if (mod.clearHighlights) mod.clearHighlights();
      if (mod.clearVectorArrows) mod.clearVectorArrows();
    }).catch(() => {});
  } catch {}
}

function showVectorArrow(vec, correct) {
  try {
    import('../scene/scene-manager.js').then(mod => {
      if (!correct) mod.clearVectorArrows?.();
      mod.addVectorArrow?.(0, 0, 0, vec[0], vec[1], vec[2], correct ? 0x00ff88 : 0xff4444);
    }).catch(() => {});
  } catch {}
}
