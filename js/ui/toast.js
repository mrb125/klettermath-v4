let container = null;

export function initToast() {
  container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
    document.body.appendChild(container);
  }
}

export function showToast(msg, type = 'info', duration = 3000) {
  if (!container) initToast();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  el.style.cssText = `
    padding: 10px 20px;
    border-radius: 8px;
    font-size: .85rem;
    color: #fff;
    pointer-events: auto;
    animation: fadeIn .3s ease;
    background: ${type === 'ok' ? 'var(--ok)' : type === 'err' ? 'var(--err)' : type === 'xp' ? 'var(--gold)' : 'var(--stone)'};
    ${type === 'xp' ? 'color: #1a1614; font-weight: 700' : ''}
  `;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}
