// Exam mode — activated via ?exam=1 URL param or teacher dashboard toggle.
// When active: no hint button, no diagnostic messages, optional timer per mission.

const EXAM_KEY = 'km4_exam';

// Activate if URL param ?exam=1 is present (set by teacher's link/QR)
if (new URLSearchParams(location.search).get('exam') === '1') {
  sessionStorage.setItem(EXAM_KEY, '1');
}
// Deactivate if ?exam=0
if (new URLSearchParams(location.search).get('exam') === '0') {
  sessionStorage.removeItem(EXAM_KEY);
}

export function isExamMode() {
  return sessionStorage.getItem(EXAM_KEY) === '1';
}

export function setExamMode(on) {
  if (on) sessionStorage.setItem(EXAM_KEY, '1');
  else    sessionStorage.removeItem(EXAM_KEY);
}
