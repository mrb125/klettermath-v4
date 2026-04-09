const STORAGE_KEY = 'km4';

const DEFAULT_STATE = {
  version: 4,
  progress: {
    done: [],
    customDone: [],
    xp: 0,
    badges: [],
    streak: 0,
    lastLogin: null
  },
  missionState: {},
  missionMastery: {},
  analytics: {
    errorPatterns: {},
    weeklyXP: {}
  }
};

let state = null;

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.version === 4) {
        state = parsed;
        if (!state.missionMastery) state.missionMastery = {};
        if (!state.progress.customDone) state.progress.customDone = [];
      } else {
        state = deepClone(DEFAULT_STATE);
      }
    } else {
      state = deepClone(DEFAULT_STATE);
    }
  } catch {
    state = deepClone(DEFAULT_STATE);
  }
  updateStreak();
  return state;
}

export function save() {
  if (!state) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function reset() {
  state = deepClone(DEFAULT_STATE);
  save();
  return state;
}

export function getState() { return state }

export function isDone(id) {
  return state.progress.done.includes(id);
}

let _onComplete = null;
export function onMissionCompleted(fn) { _onComplete = fn; }

export function completeMission(id, xp, isGold = false) {
  const isNew = !state.progress.done.includes(id);
  if (isNew) {
    state.progress.done.push(id);
    state.progress.xp += xp;
    const week = getWeekKey();
    state.analytics.weeklyXP[week] = (state.analytics.weeklyXP[week] || 0) + xp;
  }
  const current = state.missionMastery[id];
  if (!current || (isGold && current !== 'gold')) {
    state.missionMastery[id] = isGold ? 'gold' : 'silver';
  }
  save();
  if (_onComplete) _onComplete(state);
}

export function completeCustomMission(id, xp) {
  if (!state.progress.customDone.includes(id)) {
    state.progress.customDone.push(id);
    state.progress.xp += xp;
  }
  save();
  if (_onComplete) _onComplete(state);
}

export function getMastery(id) {
  return state?.missionMastery?.[id] || null;
}

export function getMissionStep(missionId, stepIdx) {
  const key = `${missionId}_${stepIdx}`;
  if (!state.missionState[key]) {
    state.missionState[key] = { attempts: 0, hintTier: 0, firstTry: true };
  }
  return state.missionState[key];
}

export function addAttempt(missionId, stepIdx) {
  const ms = getMissionStep(missionId, stepIdx);
  ms.attempts++;
  if (ms.attempts > 1) ms.firstTry = false;
  save();
}

export function useHint(missionId, stepIdx, tier) {
  const ms = getMissionStep(missionId, stepIdx);
  ms.hintTier = Math.max(ms.hintTier, tier);
  ms.firstTry = false;
  save();
}

export function addErrorPattern(concept) {
  state.analytics.errorPatterns[concept] = (state.analytics.errorPatterns[concept] || 0) + 1;
  save();
}

export function hasBadge(id) {
  return state.progress.badges.includes(id);
}

export function awardBadge(id) {
  if (!state.progress.badges.includes(id)) {
    state.progress.badges.push(id);
    save();
    return true;
  }
  return false;
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function saveReflection(missionId, data) {
  // data: { stars, tags, note, ts }
  if (!state.analytics.reflections) state.analytics.reflections = {};
  state.analytics.reflections[missionId] = { ...data, ts: new Date().toISOString() };
  save();
}

export function getReflection(missionId) {
  return state?.analytics?.reflections?.[missionId] || null;
}

function getWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.progress.lastLogin === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (state.progress.lastLogin === yesterday) {
    state.progress.streak++;
  } else if (state.progress.lastLogin !== today) {
    state.progress.streak = 1;
  }
  state.progress.lastLogin = today;
  save();
}
