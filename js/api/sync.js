const API_BASE = 'https://mrbl.4lima.de/klettermath-dashboard/api';
const CODE_KEY = 'km4_code';

export function getStoredCode() {
  return localStorage.getItem(CODE_KEY) || null;
}

export function storeCode(code) {
  localStorage.setItem(CODE_KEY, code.toUpperCase());
}

export function clearCode() {
  localStorage.removeItem(CODE_KEY);
}

export async function validateCode(code) {
  try {
    const res = await fetch(`${API_BASE}/validate.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.toUpperCase() })
    });
    return await res.json(); // { valid, class } or { valid: false, error }
  } catch {
    return { valid: false, error: 'Keine Verbindung zum Server' };
  }
}

export async function syncProgress(state) {
  const code = getStoredCode();
  if (!code) return;
  try {
    await fetch(`${API_BASE}/sync.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        missions: state.progress.done,
        xp:       state.progress.xp,
        streak:   state.progress.streak,
        mastery:  state.missionMastery || {}
      })
    });
  } catch {
    // Sync is best-effort — silently ignore network errors
  }
}
