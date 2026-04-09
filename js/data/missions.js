import { PLATS, platV3, connV, connArr, pCoord, P } from './platforms.js';

const pV = platV3;
const pArr = i => platV3(i).toArr();

export const MISSIONS = [
  {
    id: 1, title: 'Erste Schritte', concept: 'Ortsvektor',
    difficulty: 'basis', xp: 30, prerequisites: [],
    platforms: [0, 1],
    story: () => `Du stehst am ${P(0)} des Kletterparks und blickst hinauf zum ${P(1)}. Um den Weg zu planen, brauchst du den Ortsvektor.`,
    task: () => `Gib den Ortsvektor \\(\\vec{O${PLATS[1].lbl}}\\) der Plattform ${pCoord(1)} an.`,
    tischaufgabe: {
      setup: () => `<ol><li>Lege das <strong>Koordinatengitter</strong> auf den Tisch</li><li>Setze Plattform <strong>${PLATS[0].lbl}</strong> auf den Ursprung ${pCoord(0)}</li><li>Setze Plattform <strong>${PLATS[1].lbl}</strong> auf Position ${pCoord(1)}</li><li>Der Ortsvektor zeigt von ${PLATS[0].lbl} nach ${PLATS[1].lbl}</li></ol>`,
      materials: ['Koordinatengitter', 'Stift']
    },
    steps: [
      {
        prompt: () => `Der Ortsvektor \\(\\vec{O${PLATS[1].lbl}}\\) zeigt vom Ursprung O direkt zum Punkt ${PLATS[1].name}. Gib ihn an:`,
        type: 'vector3',
        answer: () => pArr(1),
        tolerance: 0.1,
        hints: [
          () => `Schau auf das 3D-Modell: Welche x₁-, x₂- und x₃-Koordinate hat ${PLATS[1].name}? Der Ortsvektor hat genau diese drei Werte als Komponenten.`,
          () => `${PLATS[1].name} hat die Koordinaten ${pCoord(1)}. Der Ortsvektor ist identisch mit diesen Koordinaten.`,
          () => `$$\\vec{O${PLATS[1].lbl}} = \\begin{pmatrix}${PLATS[1].x}\\\\${PLATS[1].y}\\\\${PLATS[1].z}\\end{pmatrix}$$`
        ],
        diagnostics: [
          { pattern: (ans) => ans[0] === 0 && ans[1] === 0 && ans[2] === 0, msg: 'Das ist der Nullvektor — der Ortsvektor von S, nicht von A! Schau auf die Koordinaten von A.' },
          { pattern: (ans) => { const p = PLATS[1]; return Math.abs(ans[0]-p.y)<0.1 && Math.abs(ans[1]-p.z)<0.1 && Math.abs(ans[2]-p.x)<0.1 }, msg: 'Die Komponenten sind vertauscht. x₁ ist die erste, x₂ die zweite, x₃ die dritte Koordinate.' }
        ]
      },
      {
        prompt: () => `Berechne den Betrag \\(|\\vec{O${PLATS[1].lbl}}|\\) (2 Dezimalstellen):`,
        type: 'number',
        answer: () => pV(1).len(),
        tolerance: 0.05,
        hints: [
          () => '\\(|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}\\)',
          () => `\\(|\\vec{O${PLATS[1].lbl}}| = \\sqrt{${PLATS[1].x}^2+${PLATS[1].y}^2+${PLATS[1].z}^2}\\)`,
          () => { const len = pV(1).len(); return `$$|\\vec{O${PLATS[1].lbl}}| = \\sqrt{${PLATS[1].x*PLATS[1].x+PLATS[1].y*PLATS[1].y+PLATS[1].z*PLATS[1].z}} \\approx ${len.toFixed(2)}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => Math.abs(ans - (PLATS[1].x + PLATS[1].y + PLATS[1].z)) < 0.1, msg: 'Das ist die Summe der Koordinaten, nicht der Betrag! Vergiss die Wurzel nicht.' }
        ]
      }
    ],
    insight: {
      title: 'Ortsvektor',
      formula: '$$\\vec{OP} = \\begin{pmatrix}x_P\\\\y_P\\\\z_P\\end{pmatrix}$$',
      body: 'Der Ortsvektor zeigt vom Ursprung O direkt zum Punkt P. Seine Komponenten sind identisch mit den Koordinaten des Punktes.'
    },
    badge: 'erste_schritte'
  },
  {
    id: 2, title: 'Das erste Seil', concept: 'Verbindungsvektor & Betrag',
    difficulty: 'basis', xp: 30, prerequisites: [1],
    platforms: [0, 1],
    story: () => `Vom ${P(0)} führt ein Seil zum ${P(1)}. Wie lang ist dieses Seil?`,
    task: () => `Berechne den Verbindungsvektor \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}\\) und seine Länge.`,
    tischaufgabe: {
      setup: () => `<ol><li>Verbinde Plattform <strong>${PLATS[0].lbl}</strong> und <strong>${PLATS[1].lbl}</strong> mit einer Schnur</li><li>Miss die Schnurlänge mit dem Lineal</li><li>Vergleiche deine Messung mit der Berechnung</li></ol>`,
      materials: ['Koordinatengitter', 'Schnur', 'Lineal']
    },
    steps: [
      {
        prompt: () => `Berechne \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}} = ${PLATS[1].lbl} - ${PLATS[0].lbl}\\):`,
        type: 'vector3', answer: () => connArr(0, 1), tolerance: 0.1,
        hints: [
          () => `Welcher Punkt ist Start, welcher Ziel? Der Pfeil \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}\\) zeigt von ${PLATS[0].name} nach ${PLATS[1].name} — also: Zielkoordinaten minus Startkoordinaten.`,
          () => `\\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}} = ${pCoord(1)} - ${pCoord(0)}\\) — rechne jede Koordinate einzeln.`,
          () => { const v = connArr(0, 1); return `$$\\vec{${PLATS[0].lbl}${PLATS[1].lbl}} = \\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const rev = connArr(1, 0); return Math.abs(ans[0]-rev[0])<0.1 && Math.abs(ans[1]-rev[1])<0.1 && Math.abs(ans[2]-rev[2])<0.1 }, msg: 'Richtung falsch: Du hast Start−Ziel statt Ziel−Start gerechnet. Der Pfeil zeigt immer vom ersten zum zweiten Buchstaben.' }
        ]
      },
      {
        prompt: () => `Berechne den Betrag \\(|\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}|\\) (2 Dez.):`,
        type: 'number', answer: () => connV(0, 1).len(), tolerance: 0.05,
        hints: [
          () => '\\(|\\vec{v}| = \\sqrt{x^2 + y^2 + z^2}\\)',
          () => { const v = connArr(0, 1); return `\\(\\sqrt{${v[0]}^2+${v[1]}^2+${v[2]}^2}\\)` },
          () => { const v = connArr(0, 1); const len = connV(0, 1).len(); return `$$|\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}| = \\sqrt{${v[0]*v[0]+v[1]*v[1]+v[2]*v[2]}} \\approx ${len.toFixed(2)}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Mittelpunkt M der Strecke ${PLATS[0].lbl}${PLATS[1].lbl} (als Vektor):`,
        type: 'vector3',
        answer: () => [(pV(0).x + pV(1).x) / 2, (pV(0).y + pV(1).y) / 2, (pV(0).z + pV(1).z) / 2],
        tolerance: 0.1,
        hints: [
          () => 'M = (A + B) / 2',
          () => `\\(M = \\frac{1}{2}(${pCoord(0)} + ${pCoord(1)})\\)`,
          () => { const m = [(pV(0).x+pV(1).x)/2,(pV(0).y+pV(1).y)/2,(pV(0).z+pV(1).z)/2]; return `$$M = \\begin{pmatrix}${m[0]}\\\\${m[1]}\\\\${m[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Verbindungsvektor & Betrag',
      formula: '$$\\vec{AB} = B - A \\qquad |\\vec{v}| = \\sqrt{x^2+y^2+z^2}$$',
      body: 'Der Verbindungsvektor zeigt von A nach B. Sein Betrag ist die Länge des Seils.'
    }
  },
  {
    id: 3, title: 'Die Seilbahn', concept: 'Parameterdarstellung',
    difficulty: 'basis', xp: 30, prerequisites: [2],
    platforms: [0, 1],
    story: () => `Eine Seilbahn bewegt sich vom ${P(0)} geradeaus zum ${P(1)}. Du willst den Weg als Gerade beschreiben.`,
    task: () => `Stelle die Parametergleichung der Geraden durch ${PLATS[0].name} und ${PLATS[1].name} auf.`,
    tischaufgabe: {
      setup: () => `<ol><li>Spanne eine Schnur von <strong>${PLATS[0].lbl}</strong> nach <strong>${PLATS[1].lbl}</strong></li><li>Verlängere die Schnur über ${PLATS[1].lbl} hinaus</li><li>Markiere den Punkt bei doppelter Entfernung (t=2)</li></ol>`,
      materials: ['Koordinatengitter', 'Schnur']
    },
    steps: [
      {
        prompt: () => `Gib den Richtungsvektor der Geraden an (= \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}\\)):`,
        type: 'vector3', answer: () => connArr(0, 1), tolerance: 0.1,
        hints: [
          () => 'Der Richtungsvektor ist der Verbindungsvektor.',
          () => `\\(\\vec{r} = ${PLATS[1].lbl} - ${PLATS[0].lbl}\\)`,
          () => { const v = connArr(0, 1); return `$$\\vec{r} = \\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Setze t = 2 in \\(g: \\vec{x} = \\vec{O${PLATS[0].lbl}} + t \\cdot \\vec{r}\\) ein. Welcher Punkt?`,
        type: 'vector3', answer: () => connArr(0, 1).map(x => x * 2), tolerance: 0.1,
        hints: [
          () => `\\(\\vec{x} = ${pCoord(0)} + 2 \\cdot \\vec{r}\\)`,
          () => { const v = connArr(0, 1); return `\\(\\vec{x} = \\begin{pmatrix}0\\\\0\\\\0\\end{pmatrix} + 2 \\cdot \\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}\\)` },
          () => { const v = connArr(0, 1); return `$$\\vec{x} = \\begin{pmatrix}${v[0]*2}\\\\${v[1]*2}\\\\${v[2]*2}\\end{pmatrix}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const v = connArr(0, 1); return Math.abs(ans[0]-v[0])<0.1 && Math.abs(ans[1]-v[1])<0.1 && Math.abs(ans[2]-v[2])<0.1 }, msg: 'Du hast t = 1 eingesetzt statt t = 2!' }
        ]
      },
      {
        prompt: () => `Für welchen Parameter t erreicht man Punkt ${PLATS[1].lbl}?`,
        type: 'number', answer: () => 1, tolerance: 0.05,
        hints: [
          () => `Setze \\(\\vec{x} = \\vec{O${PLATS[1].lbl}}\\) und löse nach t auf.`,
          () => `Bei t = 0 ist man am Start, bei t = 1 am Ziel.`,
          () => '$$t = 1$$'
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Parameterdarstellung',
      formula: '$$g: \\vec{x} = \\vec{a} + t \\cdot \\vec{v}, \\quad t \\in \\mathbb{R}$$',
      body: 'Eine Gerade wird durch einen Stützvektor und einen Richtungsvektor beschrieben. Der Parameter t gibt an, wo auf der Geraden man sich befindet.'
    }
  },
  {
    id: 4, title: 'Aufprallwinkel', concept: 'Skalarprodukt',
    difficulty: 'basis', xp: 30, prerequisites: [2],
    platforms: [0, 1, 2],
    story: () => `Am ${P(1)} treffen sich die Seile von ${P(0)}→${P(1)} und von ${P(1)}→${P(2)}. In welchem Winkel kommen sie zusammen?`,
    task: () => `Berechne das Skalarprodukt \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}} \\cdot \\vec{${PLATS[1].lbl}${PLATS[2].lbl}}\\).`,
    steps: [
      {
        prompt: () => `Berechne \\(\\vec{${PLATS[1].lbl}${PLATS[2].lbl}} = ${PLATS[2].lbl} - ${PLATS[1].lbl}\\):`,
        type: 'vector3', answer: () => connArr(1, 2), tolerance: 0.1,
        hints: [
          () => 'Ziel minus Start',
          () => `\\(${pCoord(2)} - ${pCoord(1)}\\)`,
          () => { const v = connArr(1, 2); return `$$\\vec{${PLATS[1].lbl}${PLATS[2].lbl}} = \\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne das Skalarprodukt \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}} \\cdot \\vec{${PLATS[1].lbl}${PLATS[2].lbl}}\\):`,
        type: 'number', answer: () => connV(0, 1).dot(connV(1, 2)), tolerance: 0.1,
        hints: [
          () => `Jede gleichnamige Komponente multiplizieren, dann addieren: \\(a_1 \\cdot b_1 + a_2 \\cdot b_2 + a_3 \\cdot b_3\\). Nicht die Vektoren addieren!`,
          () => { const a = connArr(0,1), b = connArr(1,2); return `\\(${a[0]} \\cdot ${b[0]} + ${a[1]} \\cdot ${b[1]} + ${a[2]} \\cdot ${b[2]}\\)` },
          () => `$$\\vec{r_1} \\cdot \\vec{r_2} = ${connV(0,1).dot(connV(1,2))}$$`
        ],
        diagnostics: [
          { pattern: (ans) => { const a = connArr(0,1), b = connArr(1,2); const wrongSum = (a[0]+b[0])+(a[1]+b[1])+(a[2]+b[2]); return Math.abs(ans - wrongSum) < 0.5 }, msg: 'Du hast die Komponenten addiert statt multipliziert. Das Skalarprodukt ist a₁·b₁ + a₂·b₂ + a₃·b₃.' }
        ]
      },
      {
        prompt: () => `Berechne den Winkel \\(\\alpha\\) in Grad (1 Dezimalstelle):`,
        type: 'number', answer: () => connV(0, 1).angleTo(connV(1, 2)), tolerance: 0.5,
        hints: [
          () => '\\(\\cos\\alpha = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|}\\)',
          () => { const sp = connV(0,1).dot(connV(1,2)); const l1 = connV(0,1).len(); const l2 = connV(1,2).len(); return `\\(\\cos\\alpha = \\frac{${sp.toFixed(1)}}{${l1.toFixed(2)} \\cdot ${l2.toFixed(2)}}\\)` },
          () => `$$\\alpha \\approx ${connV(0,1).angleTo(connV(1,2)).toFixed(1)}°$$`
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Skalarprodukt & Winkel',
      formula: '$$\\cos\\alpha = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|}$$',
      body: 'Das Skalarprodukt misst, wie sehr zwei Vektoren in dieselbe Richtung zeigen. Bei 0 stehen sie senkrecht.'
    }
  },
  {
    id: 5, title: 'Liegt er auf dem Weg?', concept: 'Punktprobe',
    difficulty: 'standard', xp: 50, prerequisites: [3],
    platforms: [0, 1, 3],
    story: () => `Ein Punkt liegt irgendwo in der Nähe der Seilbahn-Route ${P(0)}→${P(1)}. Liegt er tatsächlich auf der Geraden?`,
    task: () => `Prüfe, ob der Mittelpunkt von S und G auf der Geraden g durch ${P(0)} mit Richtung \\(\\vec{SA}\\) liegt.`,
    steps: [
      {
        prompt: () => {
          const testPt = [(pV(0).x+pV(3).x)/2, (pV(0).y+pV(3).y)/2, (pV(0).z+pV(3).z)/2];
          return `Setze den Testpunkt (${testPt[0].toFixed(1)}|${testPt[1].toFixed(1)}|${testPt[2].toFixed(1)}) in die Gleichung ein. Welches t ergibt die x₁-Koordinate?`
        },
        type: 'number',
        answer: () => {
          const testPt = [(pV(0).x+pV(3).x)/2, (pV(0).y+pV(3).y)/2, (pV(0).z+pV(3).z)/2];
          const v = connArr(0, 1);
          return v[0] !== 0 ? testPt[0] / v[0] : 0;
        },
        tolerance: 0.05,
        hints: [
          () => 'Berechne: x₁-Koordinate / x₁-Richtung',
          () => { const testPt = [(pV(0).x+pV(3).x)/2,(pV(0).y+pV(3).y)/2,(pV(0).z+pV(3).z)/2]; const v = connArr(0,1); return `\\(t = \\frac{${testPt[0].toFixed(1)}}{${v[0]}}\\)` },
          () => { const testPt = [(pV(0).x+pV(3).x)/2,(pV(0).y+pV(3).y)/2,(pV(0).z+pV(3).z)/2]; const v = connArr(0,1); const t = testPt[0]/v[0]; return `$$t = ${t.toFixed(3)}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Prüfe: Liefert dieses t auch die richtigen x₂ und x₃ Koordinaten?`,
        type: 'mc', options: ['Nein — liegt nicht auf g', 'Ja — liegt auf g'],
        answer: () => {
          const testPt = [(pV(0).x+pV(3).x)/2, (pV(0).y+pV(3).y)/2, (pV(0).z+pV(3).z)/2];
          const v = connArr(0, 1);
          const t = testPt[0] / v[0];
          const chk_y = Math.abs(v[1] * t - testPt[1]) < 0.1;
          const chk_z = Math.abs(v[2] * t - testPt[2]) < 0.1;
          return chk_y && chk_z ? 'Ja — liegt auf g' : 'Nein — liegt nicht auf g';
        },
        tolerance: 0,
        hints: [
          () => 'Vergleiche alle drei t-Werte.',
          () => 'Wenn die t-Werte nicht alle gleich sind, liegt der Punkt nicht auf der Geraden.',
          () => 'Berechne t aus jeder Koordinate und vergleiche.'
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Punktprobe',
      formula: '$$P \\in g \\Leftrightarrow \\exists t: \\vec{p} = \\vec{a} + t \\cdot \\vec{v}$$',
      body: 'Ein Punkt liegt auf einer Geraden, wenn alle drei Gleichungen denselben Parameter t liefern.'
    }
  },
  {
    id: 6, title: 'Scharfer Winkel', concept: 'Winkel zwischen Vektoren',
    difficulty: 'standard', xp: 50, prerequisites: [4],
    platforms: [1, 2, 3],
    story: () => `Am ${P(1)} treffen sich Seile aus verschiedenen Richtungen. Unter welchem Schnittwinkel treffen die Geraden aufeinander?`,
    task: () => `Berechne den Schnittwinkel (0°–90°) der Geraden ${PLATS[1].lbl}${PLATS[2].lbl} und ${PLATS[1].lbl}${PLATS[3].lbl}.`,
    steps: [
      {
        prompt: () => `Berechne den Winkel zwischen \\(\\vec{${PLATS[1].lbl}${PLATS[2].lbl}}\\) und \\(\\vec{${PLATS[1].lbl}${PLATS[3].lbl}}\\) (1 Dez.):`,
        type: 'number', answer: () => connV(1, 2).angleTo(connV(1, 3)), tolerance: 0.5,
        hints: [
          () => '\\(\\cos\\alpha = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|}\\)',
          () => { const sp = connV(1,2).dot(connV(1,3)); return `Skalarprodukt = ${sp}` },
          () => `$$\\alpha \\approx ${connV(1,2).angleTo(connV(1,3)).toFixed(1)}°$$`
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Schnittwinkel (zwischen 0° und 90°, 1 Dez.):`,
        type: 'number',
        answer: () => { const a = connV(1, 2).angleTo(connV(1, 3)); return Math.min(a, 180 - a) },
        tolerance: 0.5,
        hints: [
          () => 'Der Schnittwinkel ist der kleinere der beiden möglichen Winkel.',
          () => 'Falls α > 90°, nimm 180° − α.',
          () => { const a = connV(1,2).angleTo(connV(1,3)); const s = Math.min(a, 180-a); return `$$\\text{Schnittwinkel} \\approx ${s.toFixed(1)}°$$` }
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Schnittwinkel',
      formula: '$$\\text{Schnittwinkel} = \\begin{cases} \\alpha & \\text{falls } \\alpha \\leq 90° \\\\ 180° - \\alpha & \\text{sonst} \\end{cases}$$',
      body: 'Der Schnittwinkel zweier Geraden liegt immer zwischen 0° und 90°.'
    }
  },
  {
    id: 7, title: 'Zwei Seile kreuzen?', concept: 'Lagebeziehung',
    difficulty: 'standard', xp: 50, prerequisites: [5],
    platforms: [0, 1, 3, 4],
    story: () => `Seil 1 führt von ${P(0)} nach ${P(1)}. Seil 2 führt von ${P(3)} nach ${P(4)}. Kreuzen sich die Seile?`,
    task: () => `Bestimme die Lagebeziehung der Geraden g₁ (${PLATS[0].lbl}→${PLATS[1].lbl}) und g₂ (${PLATS[3].lbl}→${PLATS[4].lbl}).`,
    steps: [
      {
        prompt: () => `Berechne den Richtungsvektor von g₂: \\(\\vec{${PLATS[3].lbl}${PLATS[4].lbl}}\\)`,
        type: 'vector3', answer: () => connArr(3, 4), tolerance: 0.1,
        hints: [
          () => 'Ziel minus Start',
          () => `\\(${pCoord(4)} - ${pCoord(3)}\\)`,
          () => { const v = connArr(3, 4); return `$$\\vec{r_2} = \\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne das Kreuzprodukt \\(\\vec{r_1} \\times \\vec{r_2}\\):`,
        type: 'vector3', answer: () => connV(0, 1).cross(connV(3, 4)).toArr(), tolerance: 0.1,
        hints: [
          () => 'Kreuzprodukt-Formel: \\((a_2b_3-a_3b_2, a_3b_1-a_1b_3, a_1b_2-a_2b_1)\\)',
          () => { const a = connArr(0,1), b = connArr(3,4); return `\\(\\begin{pmatrix}${a[1]}\\cdot${b[2]}-${a[2]}\\cdot${b[1]}\\\\ ${a[2]}\\cdot${b[0]}-${a[0]}\\cdot${b[2]}\\\\ ${a[0]}\\cdot${b[1]}-${a[1]}\\cdot${b[0]}\\end{pmatrix}\\)` },
          () => { const c = connV(0,1).cross(connV(3,4)); return `$$\\vec{r_1} \\times \\vec{r_2} = \\begin{pmatrix}${c.x}\\\\${c.y}\\\\${c.z}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => {
          const c = connV(0, 1).cross(connV(3, 4));
          const sp = pV(3).sub(pV(0)).dot(c);
          return `Das Spatprodukt (${PLATS[3].lbl}−${PLATS[0].lbl}) · (r₁ × r₂) = ${sp.toFixed(1)}. Wie ist die Lagebeziehung?`
        },
        type: 'mc', options: ['windschief', 'schneidend', 'parallel', 'identisch'],
        answer: () => {
          const c = connV(0, 1).cross(connV(3, 4));
          const sp = pV(3).sub(pV(0)).dot(c);
          return Math.abs(sp) > 0.1 ? 'windschief' : 'schneidend';
        },
        tolerance: 0,
        hints: [
          () => 'Wenn das Spatprodukt ≠ 0: windschief',
          () => 'Wenn Kreuzprodukt = 0: parallel oder identisch. Sonst: windschief oder schneidend.',
          () => 'Das Spatprodukt entscheidet zwischen windschief und schneidend.'
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Lagebeziehung zweier Geraden',
      formula: '$$(\\vec{b}-\\vec{a}) \\cdot (\\vec{r_1} \\times \\vec{r_2}) \\neq 0 \\Rightarrow \\text{windschief}$$',
      body: 'Zwei Geraden im Raum können schneidend, parallel, identisch oder windschief sein.'
    }
  },
  {
    id: 8, title: 'Abstand zur Stütze', concept: 'Lotfußpunkt',
    difficulty: 'standard', xp: 50, prerequisites: [6, 7],
    platforms: [0, 1, 3],
    story: () => `${P(3)} liegt neben der Seilbahn-Route ${P(0)}→${P(1)}. Wie weit ist ${PLATS[3].name} vom Seil entfernt?`,
    task: () => `Berechne den Abstand von ${PLATS[3].name} zur Geraden g durch ${P(0)} mit Richtung \\(\\vec{SA}\\).`,
    steps: [
      {
        prompt: () => `Berechne den Lotfußpunkt-Parameter t = \\(\\frac{\\vec{SG} \\cdot \\vec{r}}{\\vec{r} \\cdot \\vec{r}}\\):`,
        type: 'number',
        answer: () => { const sg = pV(3).sub(pV(0)); const r = connV(0, 1); return sg.dot(r) / r.dot(r) },
        tolerance: 0.05,
        hints: [
          () => '\\(t = \\frac{\\vec{SG} \\cdot \\vec{r}}{\\vec{r} \\cdot \\vec{r}}\\)',
          () => { const sg = pV(3).sub(pV(0)); const r = connV(0,1); return `\\(t = \\frac{${sg.dot(r)}}{${r.dot(r)}}\\)` },
          () => { const sg = pV(3).sub(pV(0)); const r = connV(0,1); const t = sg.dot(r)/r.dot(r); return `$$t = ${t.toFixed(3)}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Abstand d = |G − Lotfußpunkt| (2 Dez.):`,
        type: 'number',
        answer: () => pV(3).distToLine(pV(0), connV(0, 1)),
        tolerance: 0.1,
        hints: [
          () => 'd = |G − (S + t·r)|',
          () => 'Setze t in die Geradengleichung ein, berechne den Lotfußpunkt F, dann |G − F|.',
          () => { const d = pV(3).distToLine(pV(0), connV(0, 1)); return `$$d \\approx ${d.toFixed(2)}$$` }
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Abstand Punkt — Gerade',
      formula: '$$t_0 = \\frac{\\vec{AP}\\cdot\\vec{r}}{\\vec{r}\\cdot\\vec{r}} \\qquad d = |P - (A + t_0\\cdot\\vec{r})|$$',
      body: 'Der kürzeste Abstand ist der Weg über den Lotfußpunkt.'
    }
  },
  {
    id: 9, title: 'Die Kletterwand', concept: 'Ebene',
    difficulty: 'vertiefung', xp: 80, prerequisites: [8],
    platforms: [0, 1, 2],
    story: () => `Drei Plattformen ${P(0)}, ${P(1)} und ${P(2)} spannen eine Kletterwand auf. Bestimme die Ebene.`,
    task: () => `Berechne die Ebenengleichung durch ${PLATS[0].name}, ${PLATS[1].name} und ${PLATS[2].name}.`,
    tischaufgabe: {
      setup: () => `<ol><li>Setze <strong>${PLATS[0].lbl}</strong>, <strong>${PLATS[1].lbl}</strong> und <strong>${PLATS[2].lbl}</strong> auf das Gitter</li><li>Lege ein Blatt Papier so, dass es alle drei berührt</li><li>Der Normalenvektor steht senkrecht darauf</li></ol>`,
      materials: ['Koordinatengitter', 'Blatt Papier']
    },
    steps: [
      {
        prompt: () => `Spannvektor 1: \\(\\vec{${PLATS[0].lbl}${PLATS[1].lbl}}\\) = ?`,
        type: 'vector3', answer: () => connArr(0, 1), tolerance: 0.1,
        hints: [
          () => 'Ziel minus Start',
          () => `\\(${pCoord(1)} - ${pCoord(0)}\\)`,
          () => { const v = connArr(0,1); return `$$\\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Spannvektor 2: \\(\\vec{${PLATS[0].lbl}${PLATS[2].lbl}}\\) = ?`,
        type: 'vector3', answer: () => connArr(0, 2), tolerance: 0.1,
        hints: [
          () => 'Ziel minus Start',
          () => `\\(${pCoord(2)} - ${pCoord(0)}\\)`,
          () => { const v = connArr(0,2); return `$$\\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Normalenvektor \\(\\vec{n} = \\vec{${PLATS[0].lbl}${PLATS[1].lbl}} \\times \\vec{${PLATS[0].lbl}${PLATS[2].lbl}}\\):`,
        type: 'vector3', answer: () => connV(0, 1).cross(connV(0, 2)).toArr(), tolerance: 0.1,
        hints: [
          () => { const a = connArr(0,1), b = connArr(0,2); return `Kreuzprodukt-Schema: \\(\\vec{n} = \\begin{pmatrix}a_2 b_3 - a_3 b_2\\\\ a_3 b_1 - a_1 b_3\\\\ a_1 b_2 - a_2 b_1\\end{pmatrix}\\). Setze \\(\\vec{SA}=(${a[0]};${a[1]};${a[2]})\\) und \\(\\vec{SB}=(${b[0]};${b[1]};${b[2]})\\) ein.` },
          () => { const a = connArr(0,1), b = connArr(0,2); return `\\(\\vec{n} = \\begin{pmatrix}${a[1]}\\cdot${b[2]}-${a[2]}\\cdot${b[1]}\\\\ ${a[2]}\\cdot${b[0]}-${a[0]}\\cdot${b[2]}\\\\ ${a[0]}\\cdot${b[1]}-${a[1]}\\cdot${b[0]}\\end{pmatrix}\\)` },
          () => { const c = connV(0,1).cross(connV(0,2)); return `$$\\vec{n} = \\begin{pmatrix}${c.x}\\\\${c.y}\\\\${c.z}\\end{pmatrix}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const c = connV(0,2).cross(connV(0,1)); return Math.abs(ans[0]-c.x)<0.1 && Math.abs(ans[1]-c.y)<0.1 && Math.abs(ans[2]-c.z)<0.1 }, msg: 'Richtung des Normalenvektors ist umgekehrt (andere Vorzeichen). Für die Ebene ist das auch gültig — die Richtung \\(\\vec{SA}\\times\\vec{SB}\\) ist die Konvention.' }
        ]
      },
      {
        prompt: () => `Berechne d = \\(\\vec{n} \\cdot \\vec{O${PLATS[0].lbl}}\\) für die Koordinatenform:`,
        type: 'number', answer: () => connV(0, 1).cross(connV(0, 2)).dot(pV(0)), tolerance: 0.1,
        hints: [
          () => 'Skalarprodukt n · Stützvektor',
          () => { const n = connV(0,1).cross(connV(0,2)); return `\\(${n.x} \\cdot ${PLATS[0].x} + ${n.y} \\cdot ${PLATS[0].y} + ${n.z} \\cdot ${PLATS[0].z}\\)` },
          () => { const d = connV(0,1).cross(connV(0,2)).dot(pV(0)); return `$$d = ${d}$$` }
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Ebene',
      formula: '$$E: \\vec{n}\\cdot(\\vec{x}-\\vec{a})=0$$',
      body: 'Eine Ebene wird definiert durch einen Punkt und einen Normalenvektor, der senkrecht auf ihr steht.'
    },
    badge: 'ebenen_explorer'
  },
  {
    id: 11, title: 'Wie weit ist der Gipfel?', concept: 'Abstand Punkt-Ebene',
    difficulty: 'vertiefung', xp: 80, prerequisites: [9, 8],
    platforms: [0, 1, 2, 3],
    story: () => `Die Kletterwand (Ebene durch ${P(0)}, ${P(1)}, ${P(2)}) liegt im Park. Wie weit ist der ${P(3)} von dieser Wand entfernt?`,
    task: () => `Berechne den Abstand von ${PLATS[3].name} ${PLATS[3].lbl}${pCoord(3)} zur Ebene durch S, A, B.`,
    tischaufgabe: {
      setup: () => `<ol><li>Lege ein Blatt Papier durch <strong>${PLATS[0].lbl}</strong>, <strong>${PLATS[1].lbl}</strong>, <strong>${PLATS[2].lbl}</strong></li><li>Messe mit einem Lineal den senkrechten Abstand von <strong>${PLATS[3].lbl}</strong> zur Papierfläche</li><li>Vergleiche mit deiner Rechnung</li></ol>`,
      materials: ['Koordinatengitter', 'Blatt Papier', 'Lineal']
    },
    steps: [
      {
        prompt: () => `Gib den Normalenvektor \\(\\vec{n} = \\vec{SA} \\times \\vec{SB}\\) der Ebene an:`,
        type: 'vector3',
        answer: () => connV(0, 1).cross(connV(0, 2)).toArr(),
        tolerance: 0.1,
        hints: [
          () => { const a = connArr(0,1), b = connArr(0,2); return `Kreuzprodukt \\(\\vec{SA}\\times\\vec{SB}\\): \\(\\begin{pmatrix}${a[1]}\\cdot${b[2]}-${a[2]}\\cdot${b[1]}\\\\ ${a[2]}\\cdot${b[0]}-${a[0]}\\cdot${b[2]}\\\\ ${a[0]}\\cdot${b[1]}-${a[1]}\\cdot${b[0]}\\end{pmatrix}\\)` },
          () => { const a = connArr(0,1), b = connArr(0,2); return `\\(\\vec{SA}=(${a[0]};${a[1]};${a[2]}),\\ \\vec{SB}=(${b[0]};${b[1]};${b[2]})\\)` },
          () => { const c = connV(0,1).cross(connV(0,2)); return `$$\\vec{n} = \\begin{pmatrix}${c.x}\\\\${c.y}\\\\${c.z}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => {
          const n = connV(0,1).cross(connV(0,2));
          const sg = pV(3).sub(pV(0));
          return `Berechne \\(\\vec{n} \\cdot \\vec{SG}\\) (Zähler der Abstandsformel):`;
        },
        type: 'number',
        answer: () => connV(0,1).cross(connV(0,2)).dot(pV(3).sub(pV(0))),
        tolerance: 0.5,
        hints: [
          () => `\\(\\vec{SG}\\) zeigt von S nach G — also Koordinaten von G minus Koordinaten von S.`,
          () => { const n = connV(0,1).cross(connV(0,2)); const sg = pV(3).sub(pV(0)); return `\\(\\vec{n} \\cdot \\vec{SG} = ${n.x}\\cdot${sg.x} + ${n.y}\\cdot${sg.y} + ${n.z}\\cdot${sg.z}\\)` },
          () => { const d = connV(0,1).cross(connV(0,2)).dot(pV(3).sub(pV(0))); return `$$\\vec{n} \\cdot \\vec{SG} = ${d}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Abstand \\(d = \\frac{|\\vec{n} \\cdot \\vec{SG}|}{|\\vec{n}|}\\) (2 Dez.):`,
        type: 'number',
        answer: () => {
          const n = connV(0,1).cross(connV(0,2));
          return Math.abs(n.dot(pV(3).sub(pV(0)))) / n.len();
        },
        tolerance: 0.05,
        hints: [
          () => `\\(d = \\frac{|\\vec{n} \\cdot \\vec{SG}|}{|\\vec{n}|}\\) — Betrag des Zählers durch Betrag des Normalenvektors.`,
          () => { const n = connV(0,1).cross(connV(0,2)); const dot = n.dot(pV(3).sub(pV(0))); return `\\(d = \\frac{|${dot}|}{${n.len().toFixed(2)}}\\)` },
          () => { const n = connV(0,1).cross(connV(0,2)); const d = Math.abs(n.dot(pV(3).sub(pV(0)))) / n.len(); return `$$d \\approx ${d.toFixed(2)}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const n = connV(0,1).cross(connV(0,2)); const raw = n.dot(pV(3).sub(pV(0))); return Math.abs(ans - Math.abs(raw)) < 0.5 }, msg: 'Du hast vergessen, durch |n⃗| zu dividieren! Der Abstand ist |n⃗·SG⃗| geteilt durch den Betrag des Normalenvektors.' }
        ]
      }
    ],
    insight: {
      title: 'Abstand Punkt — Ebene',
      formula: '$$d(P, E) = \\frac{|\\vec{n} \\cdot \\vec{AP}|}{|\\vec{n}|}$$',
      body: 'Der Abstand eines Punktes P von einer Ebene E (mit Normalenvektor n⃗ und Punkt A ∈ E) berechnet sich über das Skalarprodukt mit dem normalisierten Normalenvektor.'
    }
  },
  {
    id: 10, title: 'Seil trifft Wand', concept: 'Schnitt Gerade–Ebene',
    difficulty: 'vertiefung', xp: 80, prerequisites: [9],
    platforms: [0, 1, 2, 5, 7],
    story: () => `Ein Rettungsseil führt vom ${P(5)} zum ${P(7)}. Schneidet es die Kletterwand aus Mission 9?`,
    task: () => `Berechne den Schnitt der Geraden ${PLATS[5].lbl}→${PLATS[7].lbl} mit der Ebene durch ${PLATS[0].lbl}, ${PLATS[1].lbl}, ${PLATS[2].lbl}.`,
    steps: [
      {
        prompt: () => `Richtungsvektor \\(\\vec{${PLATS[5].lbl}${PLATS[7].lbl}}\\):`,
        type: 'vector3', answer: () => connArr(5, 7), tolerance: 0.1,
        hints: [
          () => 'Ziel minus Start',
          () => `\\(${pCoord(7)} - ${pCoord(5)}\\)`,
          () => { const v = connArr(5, 7); return `$$\\begin{pmatrix}${v[0]}\\\\${v[1]}\\\\${v[2]}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Schnittparameter t:`,
        type: 'number',
        answer: () => {
          const n = connV(0, 1).cross(connV(0, 2));
          const rr = connV(5, 7);
          return -n.dot(pV(0).sub(pV(5))) / n.dot(rr);
        },
        tolerance: 0.05,
        hints: [
          () => '\\(t = \\frac{-\\vec{n} \\cdot (\\vec{a} - \\vec{p})}{\\vec{n} \\cdot \\vec{r}}\\)',
          () => { const n = connV(0,1).cross(connV(0,2)); const rr = connV(5,7); return `\\(\\vec{n} \\cdot \\vec{r} = ${n.dot(rr)}\\)` },
          () => { const n = connV(0,1).cross(connV(0,2)); const rr = connV(5,7); const t = -n.dot(pV(0).sub(pV(5)))/n.dot(rr); return `$$t \\approx ${t.toFixed(3)}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Liegt der Schnittpunkt auf dem Seil (0 ≤ t ≤ 1)?`,
        type: 'mc', options: ['Ja', 'Nein'],
        answer: () => {
          const n = connV(0, 1).cross(connV(0, 2));
          const rr = connV(5, 7);
          const t = -n.dot(pV(0).sub(pV(5))) / n.dot(rr);
          return t >= 0 && t <= 1 ? 'Ja' : 'Nein';
        },
        tolerance: 0,
        hints: [
          () => 'Prüfe: 0 ≤ t ≤ 1',
          () => 'Bei t ∈ [0,1] liegt der Schnittpunkt zwischen den Endpunkten.',
          () => 'Wenn t außerhalb von [0,1] liegt, schneidet das Seil die Wand nicht.'
        ],
        diagnostics: []
      }
    ],
    insight: {
      title: 'Schnitt Gerade–Ebene',
      formula: '$$t = \\frac{-\\vec{n}\\cdot(\\vec{a}-\\vec{p})}{\\vec{n}\\cdot\\vec{r}}$$',
      body: 'Den Schnittpunkt findet man, indem man die Geradengleichung in die Ebenengleichung einsetzt.'
    }
  },
  {
    id: 12, title: 'Spiegelpunkt im Wald', concept: 'Spiegelung an Ebene',
    difficulty: 'vertiefung', xp: 100, prerequisites: [11],
    platforms: [0, 1, 2, 4],
    story: () => `${P(4)} soll an der Kletterwand (Ebene durch S, A, B) gespiegelt werden — wie bei einem Hochseilgarten-Parallelkurs. Wo liegt der Spiegelpunkt?`,
    task: () => `Spiegle Plattform ${PLATS[4].name} ${PLATS[4].lbl}${pCoord(4)} an der Ebene durch S, A, B.`,
    badge: 'spiegel_held',
    steps: [
      {
        prompt: () => `Berechne den Parameter \\(t = \\frac{-\\vec{n} \\cdot (\\vec{OT} - \\vec{OS})}{|\\vec{n}|^2}\\) für die Lotgerade durch T mit Richtung \\(\\vec{n}\\):`,
        type: 'number',
        answer: () => {
          const n = connV(0,1).cross(connV(0,2));
          return -n.dot(pV(4).sub(pV(0))) / n.dot(n);
        },
        tolerance: 0.005,
        hints: [
          () => { const n = connV(0,1).cross(connV(0,2)); return `Die Lotgerade durch T lautet \\(\\vec{x} = \\vec{OT} + t \\cdot \\vec{n}\\). Einsetzen in die Ebenengleichung \\(\\vec{n}\\cdot(\\vec{x}-\\vec{OS})=0\\) liefert t.` },
          () => { const n = connV(0,1).cross(connV(0,2)); const dots = n.dot(pV(4).sub(pV(0))); return `\\(t = \\frac{-${dots}}{${n.dot(n)}}\\)` },
          () => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); return `$$t = ${t.toFixed(4)}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const n = connV(0,1).cross(connV(0,2)); const t = n.dot(pV(4).sub(pV(0)))/n.dot(n); return Math.abs(ans - t) < 0.01 }, msg: 'Vorzeichen falsch! Der Parameter t muss negativ sein, wenn T auf der positiven Seite der Ebene liegt.' }
        ]
      },
      {
        prompt: () => `Berechne den Lotfußpunkt \\(F = T + t \\cdot \\vec{n}\\) (als Vektor):`,
        type: 'vector3',
        answer: () => {
          const n = connV(0,1).cross(connV(0,2));
          const t = -n.dot(pV(4).sub(pV(0))) / n.dot(n);
          return pV(4).add(n.scale(t)).toArr();
        },
        tolerance: 0.05,
        hints: [
          () => { const n = connV(0,1).cross(connV(0,2)); return `F liegt auf der Lotgeraden \\(\\vec{x} = \\vec{OT} + t \\cdot \\vec{n}\\). Setze den berechneten t-Wert ein.` },
          () => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); return `\\(F = \\vec{OT} + ${t.toFixed(4)} \\cdot \\begin{pmatrix}${n.x}\\\\${n.y}\\\\${n.z}\\end{pmatrix}\\)` },
          () => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); const f = pV(4).add(n.scale(t)); return `$$F \\approx \\begin{pmatrix}${f.x.toFixed(2)}\\\\${f.y.toFixed(2)}\\\\${f.z.toFixed(2)}\\end{pmatrix}$$` }
        ],
        diagnostics: []
      },
      {
        prompt: () => `Berechne den Spiegelpunkt \\(T' = 2F - T\\):`,
        type: 'vector3',
        answer: () => {
          const n = connV(0,1).cross(connV(0,2));
          const t = -n.dot(pV(4).sub(pV(0))) / n.dot(n);
          const f = pV(4).add(n.scale(t));
          return f.scale(2).sub(pV(4)).toArr();
        },
        tolerance: 0.1,
        hints: [
          () => 'Der Spiegelpunkt T\u2032 liegt auf der anderen Seite von F: T\u2032 = 2\u00B7F \u2212 T',
          () => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); const f = pV(4).add(n.scale(t)); return `\\(T' = 2 \\cdot \\begin{pmatrix}${f.x.toFixed(2)}\\\\${f.y.toFixed(2)}\\\\${f.z.toFixed(2)}\\end{pmatrix} - \\begin{pmatrix}${pV(4).x}\\\\${pV(4).y}\\\\${pV(4).z}\\end{pmatrix}\\)` },
          () => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); const f = pV(4).add(n.scale(t)); const tp = f.scale(2).sub(pV(4)); return `$$T' \\approx \\begin{pmatrix}${tp.x.toFixed(2)}\\\\${tp.y.toFixed(2)}\\\\${tp.z.toFixed(2)}\\end{pmatrix}$$` }
        ],
        diagnostics: [
          { pattern: (ans) => { const n = connV(0,1).cross(connV(0,2)); const t = -n.dot(pV(4).sub(pV(0)))/n.dot(n); const f = pV(4).add(n.scale(t)); const wrong = pV(4).sub(f.sub(pV(4))); return Math.abs(ans[0]-wrong.x)<0.1 && Math.abs(ans[1]-wrong.y)<0.1 }, msg: 'Fast! Pr\u00FCfe die Formel: T\u2032 = 2\u00B7F \u2212 T, nicht F \u2212 (T \u2212 F).' }
        ]
      }
    ],
    insight: {
      title: 'Spiegelung an einer Ebene',
      formula: '$$T\u2032 = 2F - T, \\quad F = T + t \\cdot \\vec{n}, \\quad t = \\frac{-\\vec{n}\\cdot(T-A)}{|\\vec{n}|^2}$$',
      body: 'Der Spiegelpunkt liegt symmetrisch zum Lotfu\u00DFpunkt F: F ist der Mittelpunkt von T und T\u2032.'
    }
  }
];
