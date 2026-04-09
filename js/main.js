import { load as loadState, getState } from './state/store.js';
import { registerScreen, navigate, initNav, onNavigate } from './ui/router.js';
import { initToast } from './ui/toast.js';
import { PLATS } from './data/platforms.js';

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => {
  const state = loadState();
  initToast();

  // Register screens
  registerScreen('welcome', document.getElementById('s-welcome'));
  registerScreen('park', document.getElementById('s-park'), onParkShow);
  registerScreen('badges', document.getElementById('s-badges'), onBadgesShow);

  // Navigation
  initNav();
  onNavigate(id => {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === id);
    });
  });

  // Welcome buttons
  document.getElementById('btn-enter').addEventListener('click', () => navigate('park'));
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) {
    btnContinue.addEventListener('click', () => navigate('park'));
  }

  // Show welcome or park
  if (state.progress.done.length > 0) {
    document.getElementById('btn-continue')?.classList.remove('hidden');
    navigate('park');
  } else {
    navigate('welcome');
  }

  updateTopBar();
});

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
