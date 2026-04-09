import { MISSIONS } from '../data/missions.js';
import { PLATS } from '../data/platforms.js';
import { checkAnswer, runDiagnostics } from '../math/checks.js';
import { getState, completeMission, addAttempt, useHint, getMissionStep, addErrorPattern, awardBadge } from '../state/store.js';
import { renderMath } from './math-render.js';
import { showToast } from './toast.js';
import { backToList } from './mission-list.js';
import { updateTopBar } from '../main.js';
import { checkBadges } from './badges-view.js';

let currentMission = null;
let currentStepIdx = 0;

export function renderMission(missionId) {
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return;
  currentMission = mission;
  currentStepIdx = 0;

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
      </details>`;
  }

  // Steps
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
  bindStepEvents();

  document.getElementById('btn-back')?.addEventListener('click', () => {
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
    html += `<div class="step-input-row">
      <span class="vec-label">x₁</span><input class="input-field" id="v-${idx}-0" type="number" step="any">
      <span class="vec-label">x₂</span><input class="input-field" id="v-${idx}-1" type="number" step="any">
      <span class="vec-label">x₃</span><input class="input-field" id="v-${idx}-2" type="number" step="any">
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
    <button class="btn btn-sm" id="hint-btn-${idx}">💡 Hinweis</button>
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
    currentStepIdx = idx + 1;

    setTimeout(() => {
      if (currentStepIdx >= currentMission.steps.length) {
        onMissionComplete();
      } else {
        renderMissionUI();
      }
    }, 600);
  } else {
    // Check diagnostics
    const diagMsg = runDiagnostics(step.type, userAnswer, step.diagnostics);
    const msg = diagMsg || 'Leider falsch. Versuch es nochmal!';
    showFeedback(idx, msg, false);
    markInputsWrong(step, idx);
    addErrorPattern(currentMission.concept);
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
  const step = currentMission.steps[idx];
  const ms = getMissionStep(currentMission.id, idx);
  const tier = Math.min(ms.hintTier, step.hints.length - 1);
  const nextTier = Math.min(tier + (ms.hintTier === 0 && ms.attempts === 0 ? 0 : 1), step.hints.length - 1);

  useHint(currentMission.id, idx, nextTier);

  const hintEl = document.getElementById(`hint-${idx}`);
  if (!hintEl) return;

  let html = '';
  for (let t = 0; t <= nextTier; t++) {
    const hint = typeof step.hints[t] === 'function' ? step.hints[t]() : step.hints[t];
    const label = t === 0 ? '💡 Hinweis' : t === 1 ? '🔍 Strategie' : '📝 Musterlösung';
    html += `<div class="${t === step.hints.length - 1 ? 'worked-box' : 'hint-box'}">${label}: ${hint}</div>`;
  }

  hintEl.innerHTML = html;
  renderMath(hintEl);
}

function onMissionComplete() {
  const m = currentMission;
  completeMission(m.id, m.xp);
  showToast(`+${m.xp} XP`, 'xp');
  updateTopBar();

  // Check badges
  const newBadges = checkBadges();
  newBadges.forEach(b => {
    if (awardBadge(b)) showToast(`Badge freigeschaltet: ${b}`, 'ok', 4000);
  });

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
    }).catch(() => {});
  } catch {}
}
