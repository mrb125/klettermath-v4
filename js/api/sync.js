const API_BASE = 'https://mrbl.4lima.de/klettermath-dashboard/api';
const CODE_KEY  = 'km4_code';
const CLASS_KEY = 'km4_class_id';

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
    const data = await res.json(); // { valid, class, class_id } or { valid: false, error }
    if (data.valid && data.class_id) {
      localStorage.setItem(CLASS_KEY, data.class_id);
    }
    return data;
  } catch {
    return { valid: false, error: 'Keine Verbindung zum Server' };
  }
}

export async function fetchCustomMissions() {
  const code = getStoredCode();
  if (!code) return [];
  try {
    const res = await fetch(`${API_BASE}/custom-missions.php?code=${code}`);
    const list = await res.json();
    // Convert DB format to mission object format
    return list.map(m => ({
      id: `cm_${m.id}`,
      title: m.title,
      story: () => m.story || '',
      task:  () => '',
      steps: JSON.parse(m.data || '[]').map(s => ({
        ...s,
        prompt: typeof s.prompt === 'string' ? s.prompt : '',
        hints:  Array.isArray(s.hints) ? s.hints : [s.hints || ''],
      })),
      xp: m.xp || 60,
      difficulty: 'Mittel',
      concept: 'custom',
      platforms: [],
      prerequisites: [],
      isCustom: true,
    }));
  } catch {
    return [];
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
        mastery:  state.missionMastery || {},
        errors:   state.analytics?.errorPatterns || {}
      })
    });
  } catch {
    // Sync is best-effort — silently ignore network errors
  }
}
