import { load as loadState, getState, onMissionCompleted } from './state/store.js';
import { registerScreen, navigate, initNav, onNavigate } from './ui/router.js';
import { initToast } from './ui/toast.js';
import { PLATS } from './data/platforms.js';
import { getStoredCode, storeCode, validateCode, syncProgress } from './api/sync.js';

// ── Boot ──
document.addEventListener('DOMContentLoaded', async () => {
  const state = loadState();
  initToast();

  // Register screens
  registerScreen('code',    document.getElementById('s-code'));
  registerScreen('welcome', document.getElementById('s-welcome'));
  registerScreen('park',    document.getElementById('s-park'), onParkShow);
  registerScreen('badges',  document.getElementById('s-badges'), onBadgesShow);

  // Navigation
  initNav();
  onNavigate(id => {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === id);
    });
  });

  // Welcome buttons — trigger zipline then navigate
  function enterPark() {
    const person = document.getElementById('zipline-person');
    if (person && person.style.display !== 'none') {
      person.classList.add('active');
      setTimeout(() => { person.classList.remove('active'); navigate('park'); }, 1650);
    } else {
      navigate('park');
    }
  }
  document.getElementById('btn-enter').addEventListener('click', enterPark);
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) btnContinue.addEventListener('click', enterPark);

  // Code entry
  const codeInput = document.getElementById('code-input');
  const codeError = document.getElementById('code-error');
  const btnSubmit = document.getElementById('btn-code-submit');

  async function trySubmitCode() {
    const code = (codeInput?.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) {
      codeError.textContent = 'Code muss genau 6 Zeichen haben.';
      codeError.classList.remove('hidden');
      return;
    }
    btnSubmit.disabled = true;
    btnSubmit.textContent = '…';
    const result = await validateCode(code);
    if (result.valid) {
      storeCode(code);
      codeError.classList.add('hidden');
      goToApp(state);
    } else {
      codeError.textContent = result.error || 'Ungültiger Code';
      codeError.classList.remove('hidden');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'WEITER';
    }
  }

  btnSubmit?.addEventListener('click', trySubmitCode);
  codeInput?.addEventListener('keydown', e => { if (e.key === 'Enter') trySubmitCode() });
  codeInput?.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
  });

  // Start: check for ?code= URL param (from QR scan) or stored code
  const urlCode = new URLSearchParams(location.search).get('code')?.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (urlCode && urlCode.length === 6) {
    // Validate and store code from URL, then remove param from address bar
    history.replaceState(null, '', location.pathname);
    btnSubmit.disabled = true;
    const result = await validateCode(urlCode);
    if (result.valid) {
      storeCode(urlCode);
      goToApp(state);
    } else {
      if (codeInput) codeInput.value = urlCode;
      navigate('code');
      codeError.textContent = result.error || 'Ungültiger Code';
      codeError.classList.remove('hidden');
    }
    btnSubmit.disabled = false;
  } else if (getStoredCode()) {
    goToApp(state);
  } else {
    navigate('code');
  }

  // Sync after each completed mission
  onMissionCompleted(s => { syncProgress(s); updateTopBar(); });

  updateTopBar();
});

function goToApp(state) {
  if (state.progress.done.length > 0) {
    document.getElementById('btn-continue')?.classList.remove('hidden');
    navigate('park');
  } else {
    navigate('welcome');
  }
}

// ── Scene (lazy load) ──
let sceneInitialized = false;

async function onParkShow() {
  updateTopBar();
  if (!sceneInitialized) {
    sceneInitialized = true;
    const { initScene } = await import('./scene/scene-manager.js');
    initScene(document.getElementById('park-canvas'));
  }
  // Load mission list
  const { renderMissionList } = await import('./ui/mission-list.js');
  renderMissionList();
  // Init glossar sidebar
  const { initGlossar } = await import('./ui/theory-panel.js');
  initGlossar();
}

async function onBadgesShow() {
  const { renderBadges } = await import('./ui/badges-view.js');
  renderBadges();
}

// ── Top Bar ──
export function updateTopBar() {
  const state = getState();
  if (!state) return;
  const done = state.progress.done.length;
  const total = 12;
  const pct = Math.round((done / total) * 100);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = pct + '%';
  const lbl = document.getElementById('progress-label');
  if (lbl) lbl.textContent = `${done}/${total}`;
  const xp = document.getElementById('top-xp');
  if (xp) xp.textContent = `${state.progress.xp} XP`;
  const streak = document.getElementById('top-streak');
  if (streak) {
    const s = state.progress.streak || 0;
    streak.textContent = `🔥 ${s}`;
    streak.style.opacity = s > 0 ? '1' : '0.4';
  }
}
