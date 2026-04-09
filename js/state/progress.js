import { getState, isDone } from './store.js';
import { MISSIONS } from '../data/missions.js';

export function isAvailable(missionId) {
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return false;
  if (isDone(missionId)) return true;
  return mission.prerequisites.every(pre => isDone(pre));
}

export function getAvailableMissions() {
  return MISSIONS.filter(m => isAvailable(m.id));
}

export function getNextMissions() {
  return MISSIONS.filter(m => !isDone(m.id) && isAvailable(m.id));
}
