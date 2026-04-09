// error-classifier.js
// Detects common vector calculus misconceptions and returns targeted feedback

/**
 * Classify a wrong answer and return a targeted feedback message.
 * Returns null if no specific pattern detected.
 *
 * @param {'vector3'|'number'} type
 * @param {number[]|number} userAnswer
 * @param {number[]|number} correct
 * @param {string} concept — mission concept name
 * @returns {string|null}
 */
export function classifyError(type, userAnswer, correct, concept) {
  if (type === 'vector3' && Array.isArray(userAnswer) && Array.isArray(correct)) {
    return classifyVector(userAnswer, correct, concept);
  }
  if (type === 'number' && typeof userAnswer === 'number' && typeof correct === 'number') {
    return classifyScalar(userAnswer, correct, concept);
  }
  return null;
}

function near(a, b, tol = 0.15) {
  return Math.abs(a - b) <= tol;
}

function classifyVector(ans, cor, concept) {
  const [a1, a2, a3] = ans;
  const [c1, c2, c3] = cor;

  // 1. Vorzeichen-Fehler: answer ≈ -correct (alle Komponenten negiert)
  if (near(a1, -c1) && near(a2, -c2) && near(a3, -c3)) {
    return '↩️ <strong>Vorzeichenfehler:</strong> Alle Vorzeichen sind vertauscht. ' +
      'Beim Verbindungsvektor gilt: <em>Ziel minus Start</em> — du hast wahrscheinlich Start minus Ziel gerechnet.';
  }

  // 2. Einzelner Vorzeichenfehler (eine Komponente negiert, andere korrekt)
  const signErrors = [near(a1, -c1), near(a2, -c2), near(a3, -c3)].filter(Boolean);
  const allAbsCorrect = [
    near(a1, c1) || near(a1, -c1),
    near(a2, c2) || near(a2, -c2),
    near(a3, c3) || near(a3, -c3),
  ].every(Boolean);
  if (signErrors.length === 1 && allAbsCorrect) {
    const comp = near(a1, -c1) ? 'x₁' : near(a2, -c2) ? 'x₂' : 'x₃';
    return `↩️ <strong>Vorzeichenfehler bei ${comp}:</strong> Diese Komponente hat das falsche Vorzeichen — prüfe Ziel minus Start für jede Koordinate!`;
  }

  // 3. Komponenten-Vertauscht (alle 5 Nicht-Identitäts-Permutationen)
  const perms = [
    [c1, c3, c2],
    [c2, c1, c3],
    [c2, c3, c1],
    [c3, c1, c2],
    [c3, c2, c1],
  ];
  for (const [p1, p2, p3] of perms) {
    if (near(a1, p1) && near(a2, p2) && near(a3, p3)) {
      return '🔀 <strong>Komponenten vertauscht:</strong> Die Werte stimmen, aber in der falschen Reihenfolge. ' +
        'x₁ ist die erste, x₂ die zweite, x₃ die dritte Koordinate.';
    }
  }

  // 4. Faktor-Fehler: answer ≈ k · correct für einfaches k ≠ 1
  const refDenom = c1 !== 0 ? c1 : c2 !== 0 ? c2 : c3;
  if (refDenom !== 0) {
    const refNum = c1 !== 0 ? a1 : c2 !== 0 ? a2 : a3;
    const k = refNum / refDenom;
    if (Math.abs(k) > 0.1 && Math.abs(k - 1) > 0.15 &&
        near(a1, k * c1, 0.2) && near(a2, k * c2, 0.2) && near(a3, k * c3, 0.2)) {
      const kStr = k.toFixed(1);
      return `✖️ <strong>Skalierungsfehler (Faktor ${kStr}):</strong> Der Richtungsvektor ist korrekt, aber mit ${kStr} multipliziert. ` +
        'Hier wird ein bestimmter Vektor erwartet, nicht nur die Richtung.';
    }
  }

  // 5. Betrag statt Vektor: alle Komponenten ≈ |cor|
  const mag = Math.sqrt(c1 * c1 + c2 * c2 + c3 * c3);
  if (mag > 0.01 && near(a1, mag) && near(a2, mag) && near(a3, mag)) {
    return '📏 <strong>Betrag statt Vektor:</strong> Du hast den Betrag |v| ≈ ' + mag.toFixed(2) + ' in alle Felder eingetragen. ' +
      'Hier wird der Vektor selbst gesucht, nicht seine Länge.';
  }

  // 6. Koordinaten x₁ und x₂ vertauscht (Sonderfall: x₁↔x₂ mit Vorzeichen)
  if (near(a1, c2) && near(a2, c1) && near(a3, c3)) {
    return '🔀 <strong>Koordinaten x₁ und x₂ gedreht:</strong> Die erste und zweite Koordinate sind vertauscht. ' +
      'Achte auf die Reihenfolge: x₁ oben, x₂ Mitte, x₃ unten.';
  }
  // 7. Koordinaten x₁ und x₃ vertauscht
  if (near(a1, c3) && near(a2, c2) && near(a3, c1)) {
    return '🔀 <strong>Koordinaten x₁ und x₃ gedreht:</strong> Die erste und dritte Koordinate sind vertauscht. ' +
      'Achte auf die Reihenfolge: x₁ oben, x₂ Mitte, x₃ unten.';
  }

  // 8. Plus statt Minus (für Verbindungsvektor): ans ≈ cor + 2·start
  // Heuristic: user added instead of subtracted → ans ≈ -cor if endpoints symmetric,
  // already caught by rule 1. Additionally flag when two components positive-sum pattern.
  // (Cannot recover start point here, so this is covered by rules 1+2 in practice.)

  return null;
}

function classifyScalar(ans, cor) {
  // Wurzel vergessen: ans ≈ cor²
  if (cor !== 0 && near(ans, cor * cor, Math.max(0.5, Math.abs(cor) * 0.2))) {
    return '√ <strong>Wurzel vergessen:</strong> Du hast das Ergebnis ohne Wurzel angegeben. ' +
      'Der Betrag ist \\(\\sqrt{x_1^2+x_2^2+x_3^2}\\), nicht \\(x_1^2+x_2^2+x_3^2\\).';
  }

  // Vorzeichenfehler: negatives Ergebnis wo positiv erwartet
  if (near(ans, -cor) && cor > 0) {
    return '↩️ <strong>Vorzeichenfehler:</strong> Das Ergebnis ist negativ — Beträge und Abstände sind immer ≥ 0.';
  }

  // Faktor 2 (verdoppelt)
  if (cor !== 0 && near(ans, 2 * cor, Math.max(0.2, Math.abs(cor) * 0.15))) {
    return '✖️ <strong>Verdoppelt?</strong> Dein Ergebnis ist ungefähr doppelt so groß wie erwartet — prüfe deinen Rechenweg.';
  }

  // Faktor 0.5 (halbiert)
  if (cor !== 0 && near(ans, 0.5 * cor, Math.max(0.1, Math.abs(cor) * 0.1))) {
    return '✖️ <strong>Halbiert?</strong> Dein Ergebnis ist ungefähr halb so groß wie erwartet — prüfe ob du durch 2 geteilt hast.';
  }

  // Summe statt Betrag: ans ≈ |c| but we only have the scalar expected value,
  // so this is only detectable if we know the original vector. Skipped here.

  return null;
}
