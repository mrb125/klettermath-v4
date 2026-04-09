const screens = {};
const listeners = [];
let currentScreen = null;

export function registerScreen(id, el, onShow) {
  screens[id] = { el, onShow };
}

export function navigate(id) {
  if (currentScreen === id) return;
  Object.values(screens).forEach(s => s.el.classList.remove('active'));
  const screen = screens[id];
  if (screen) {
    screen.el.classList.add('active');
    currentScreen = id;
    if (screen.onShow) screen.onShow();
    listeners.forEach(fn => fn(id));
  }
}

export function getCurrent() { return currentScreen }

export function onNavigate(fn) { listeners.push(fn) }

export function initNav() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}
