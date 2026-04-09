export function checkAnswer(type, userAnswer, correctAnswer, tolerance = 0.1) {
  if (type === 'vector3') {
    return checkVector(userAnswer, correctAnswer, tolerance);
  }
  if (type === 'number') {
    return checkNumber(userAnswer, correctAnswer, tolerance);
  }
  if (type === 'mc') {
    return checkMC(userAnswer, correctAnswer);
  }
  return false;
}

function checkVector(user, correct, tol) {
  if (!Array.isArray(user) || user.length !== 3) return false;
  if (!Array.isArray(correct) || correct.length !== 3) return false;
  return Math.abs(user[0] - correct[0]) <= tol
      && Math.abs(user[1] - correct[1]) <= tol
      && Math.abs(user[2] - correct[2]) <= tol;
}

function checkNumber(user, correct, tol) {
  if (typeof user !== 'number' || isNaN(user)) return false;
  return Math.abs(user - correct) <= tol;
}

function checkMC(user, correct) {
  return user === correct;
}

export function runDiagnostics(type, userAnswer, diagnostics) {
  if (!diagnostics || diagnostics.length === 0) return null;
  for (const d of diagnostics) {
    if (typeof d.pattern === 'function') {
      if (d.pattern(userAnswer)) return d.msg;
    }
  }
  return null;
}
