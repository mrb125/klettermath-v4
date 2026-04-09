// theory.js — Themen-Erklärungen und Glossar für KletterMath
// Jedes Konzept hat: title, icon, color, body (HTML + KaTeX), formula, keyFacts[], missionIds[]
// Glossar-Einträge werden progressiv freigeschaltet (unlock ab missionId)

export const THEORY = {
  'Ortsvektor': {
    icon: '📍',
    color: '#e8a030',
    title: 'Ortsvektor',
    subtitle: 'Vom Ursprung zum Punkt',
    formula: '$$\\vec{OP} = \\begin{pmatrix}x_1\\\\x_2\\\\x_3\\end{pmatrix}$$',
    body: `
      <p>Der <strong>Ortsvektor</strong> eines Punktes P zeigt direkt vom Ursprung O zum Punkt P.
      Seine Komponenten sind identisch mit den Koordinaten des Punktes.</p>
      <p>Im Kletterpark: Jede Plattform liegt an einem bestimmten Ort im Raum.
      Der Ortsvektor gibt an, wie weit man in x₁-, x₂- und x₃-Richtung vom Eingang gehen muss.</p>
    `,
    keyFacts: [
      'Ortsvektor \\(\\vec{OP}\\) hat dieselben Komponenten wie die Koordinaten von P',
      'Der Betrag \\(|\\vec{OP}|\\) ist der Abstand von O zu P',
      'O selbst hat den Ortsvektor \\(\\vec{0}\\)',
    ],
    missionIds: [1],
  },

  'Verbindungsvektor & Betrag': {
    icon: '📏',
    color: '#ff6b35',
    title: 'Verbindungsvektor & Betrag',
    subtitle: 'Richtung und Länge eines Seils',
    formula: '$$\\vec{AB} = B - A \\qquad |\\vec{v}| = \\sqrt{x_1^2+x_2^2+x_3^2}$$',
    body: `
      <p>Der <strong>Verbindungsvektor</strong> \\(\\vec{AB}\\) zeigt von A nach B.
      Man erhält ihn durch Zielkoordinaten minus Startkoordinaten.</p>
      <p>Der <strong>Betrag</strong> eines Vektors ist seine Länge — im Kletterpark die tatsächliche Seillänge.</p>
    `,
    keyFacts: [
      '\\(\\vec{AB} = B - A\\) (immer: Ziel minus Start)',
      '\\(\\vec{AB} = -\\vec{BA}\\) (Richtungsumkehr)',
      'Betrag: \\(|\\vec{v}| = \\sqrt{x_1^2+x_2^2+x_3^2}\\)',
      'Mittelpunkt: \\(M = \\frac{A+B}{2}\\)',
    ],
    missionIds: [2],
  },

  'Parameterdarstellung': {
    icon: '🚡',
    color: '#6bcb77',
    title: 'Gerade in Parameterdarstellung',
    subtitle: 'Der Weg der Seilbahn als Gleichung',
    formula: '$$g: \\vec{x} = \\vec{a} + t \\cdot \\vec{v}, \\quad t \\in \\mathbb{R}$$',
    body: `
      <p>Eine <strong>Gerade</strong> im Raum wird durch zwei Angaben beschrieben:
      einen <em>Stützvektor</em> \\(\\vec{a}\\) (ein Punkt auf der Geraden) und
      einen <em>Richtungsvektor</em> \\(\\vec{v}\\) (die Richtung der Geraden).</p>
      <p>Der Parameter t gibt an, <em>wo auf der Geraden</em> man sich befindet:
      Bei t = 0 ist man am Stützpunkt, bei t = 1 nach einem Schritt in Richtung \\(\\vec{v}\\).</p>
    `,
    keyFacts: [
      'Stützvektor: ein beliebiger Punkt auf der Geraden',
      'Richtungsvektor: bestimmt die Richtung (darf vielfaches sein)',
      'Jeder Punkt der Geraden entspricht genau einem t-Wert',
      '\\(t < 0\\): Punkte "hinter" dem Stützpunkt',
    ],
    missionIds: [3],
  },

  'Skalarprodukt': {
    icon: '⚡',
    color: '#5b9bd5',
    title: 'Skalarprodukt',
    subtitle: 'Wie sehr zeigen zwei Seile in dieselbe Richtung?',
    formula: '$$\\vec{a} \\cdot \\vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3$$',
    body: `
      <p>Das <strong>Skalarprodukt</strong> zweier Vektoren ist eine Zahl (kein Vektor!).
      Es misst, wie sehr die Vektoren in dieselbe Richtung zeigen.</p>
      <p>Besondere Bedeutung: Sind zwei Vektoren <em>senkrecht</em> zueinander,
      ist ihr Skalarprodukt genau <strong>0</strong>.</p>
    `,
    keyFacts: [
      '\\(\\vec{a} \\cdot \\vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3\\)',
      '\\(\\vec{a} \\perp \\vec{b} \\Leftrightarrow \\vec{a} \\cdot \\vec{b} = 0\\)',
      '\\(\\vec{a} \\cdot \\vec{a} = |\\vec{a}|^2\\)',
      'Ergebnis ist eine Zahl, kein Vektor',
    ],
    missionIds: [4],
  },

  'Winkel zwischen Vektoren': {
    icon: '📐',
    color: '#ffd166',
    title: 'Winkel zwischen Vektoren',
    subtitle: 'Wie spitz treffen sich zwei Seile?',
    formula: '$$\\cos\\alpha = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{a}| \\cdot |\\vec{b}|}$$',
    body: `
      <p>Mit dem Skalarprodukt lässt sich der <strong>Winkel</strong> zwischen zwei Vektoren berechnen.
      Der Schnittwinkel zweier Geraden liegt immer zwischen 0° und 90°.</p>
      <p>Merkhilfe: Wenn das Skalarprodukt positiv ist → spitzer Winkel.
      Wenn negativ → stumpfer Winkel (dann nimm 180° − α).</p>
    `,
    keyFacts: [
      'Formel: \\(\\cos\\alpha = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|}\\)',
      'Schnittwinkel immer: \\(0° \\leq \\alpha \\leq 90°\\)',
      'Falls \\(\\alpha > 90°\\): Schnittwinkel \\(= 180° - \\alpha\\)',
      'Senkrecht: \\(\\alpha = 90°\\), parallel: \\(\\alpha = 0°\\)',
    ],
    missionIds: [6],
  },

  'Punktprobe': {
    icon: '🔍',
    color: '#a78bfa',
    title: 'Punktprobe',
    subtitle: 'Liegt dieser Punkt auf der Geraden?',
    formula: '$$P \\in g \\Leftrightarrow \\exists\\, t \\in \\mathbb{R}: \\vec{p} = \\vec{a} + t \\cdot \\vec{v}$$',
    body: `
      <p>Die <strong>Punktprobe</strong> prüft, ob ein Punkt auf einer Geraden liegt.
      Dazu setzt man die Koordinaten des Punktes in die Geradengleichung ein
      und prüft, ob alle drei Gleichungen <em>denselben t-Wert</em> liefern.</p>
    `,
    keyFacts: [
      'Aus jeder Koordinate einen t-Wert berechnen',
      'Alle drei t-Werte müssen identisch sein',
      'Ein anderer t pro Koordinate → Punkt liegt nicht auf g',
    ],
    missionIds: [5],
  },

  'Lagebeziehung': {
    icon: '🔀',
    color: '#f472b6',
    title: 'Lagebeziehung zweier Geraden',
    subtitle: 'Schneiden, kreuzen oder verlaufen sie parallel?',
    formula: '$$(\\vec{b}-\\vec{a}) \\cdot (\\vec{r_1} \\times \\vec{r_2}) \\neq 0 \\Rightarrow \\text{windschief}$$',
    body: `
      <p>Zwei Geraden im Raum können vier verschiedene Lagebeziehungen haben:</p>
      <ul>
        <li><strong>Identisch</strong>: Richtungsvektoren parallel, gemeinsamer Punkt</li>
        <li><strong>Parallel</strong>: Richtungsvektoren parallel, kein gemeinsamer Punkt</li>
        <li><strong>Schneidend</strong>: gemeinsamer Punkt, nicht parallel</li>
        <li><strong>Windschief</strong>: kein gemeinsamer Punkt, nicht parallel (nur im Raum!)</li>
      </ul>
      <p>Das <strong>Spatprodukt</strong> entscheidet: Ist es ≠ 0, sind die Geraden windschief.</p>
    `,
    keyFacts: [
      'Kreuzprodukt \\(\\vec{r_1} \\times \\vec{r_2} = \\vec{0}\\) → parallel oder identisch',
      'Spatprodukt ≠ 0 → windschief',
      'Spatprodukt = 0, Kreuzprodukt ≠ 0 → schneidend',
    ],
    missionIds: [7],
  },

  'Lotfußpunkt': {
    icon: '📐',
    color: '#6bcb77',
    title: 'Abstand Punkt–Gerade',
    subtitle: 'Der kürzeste Weg vom Gipfel zum Seil',
    formula: '$$t_0 = \\frac{\\vec{AP}\\cdot\\vec{r}}{\\vec{r}\\cdot\\vec{r}} \\qquad d = |P - (A + t_0\\vec{r})|$$',
    body: `
      <p>Der kürzeste Abstand von einem Punkt zu einer Geraden geht über den <strong>Lotfußpunkt</strong> F —
      den Fußpunkt des Lotes von P auf g.</p>
      <p>Vorgehen: Parameter \\(t_0\\) berechnen → Lotfußpunkt F einsetzen → Abstand |PF| berechnen.</p>
    `,
    keyFacts: [
      '\\(t_0 = \\frac{\\vec{AP}\\cdot\\vec{r}}{|\\vec{r}|^2}\\) (Lotfußpunktparameter)',
      'Lotfußpunkt: \\(F = A + t_0 \\cdot \\vec{r}\\)',
      'Abstand: \\(d = |P - F|\\)',
    ],
    missionIds: [8],
  },

  'Ebene': {
    icon: '🪟',
    color: '#e8a030',
    title: 'Ebene',
    subtitle: 'Die Kletterwand als mathematische Ebene',
    formula: '$$E: \\vec{n}\\cdot(\\vec{x}-\\vec{a})=0 \\quad \\Leftrightarrow \\quad n_1 x_1+n_2 x_2+n_3 x_3=d$$',
    body: `
      <p>Eine <strong>Ebene</strong> im Raum wird durch einen Punkt und den <em>Normalenvektor</em> beschrieben —
      einen Vektor, der senkrecht auf der Ebene steht.</p>
      <p>Der Normalenvektor \\(\\vec{n}\\) erhält man als Kreuzprodukt zweier Spannvektoren der Ebene.
      Die Koordinatenform \\(n_1 x_1 + n_2 x_2 + n_3 x_3 = d\\) ist die Gleichung der Ebene.</p>
    `,
    keyFacts: [
      'Normalenvektor: \\(\\vec{n} = \\vec{u} \\times \\vec{v}\\) (Kreuzprodukt der Spannvektoren)',
      'Koordinatenform: \\(n_1 x_1 + n_2 x_2 + n_3 x_3 = d\\)',
      '\\(d = \\vec{n} \\cdot \\vec{a}\\) (a = Aufpunkt)',
    ],
    missionIds: [9],
  },

  'Abstand Punkt-Ebene': {
    icon: '📏',
    color: '#5b9bd5',
    title: 'Abstand Punkt–Ebene',
    subtitle: 'Wie weit ist der Gipfel von der Kletterwand?',
    formula: '$$d(P, E) = \\frac{|\\vec{n} \\cdot \\vec{AP}|}{|\\vec{n}|}$$',
    body: `
      <p>Der Abstand eines Punktes P von einer Ebene E berechnet sich mit
      dem <strong>Lotabstandsformel</strong>: Das Skalarprodukt von Normalenvektor und Verbindungsvektor,
      geteilt durch die Länge des Normalenvektors.</p>
      <p>Ist \\(\\vec{n}\\) ein <em>Einheitsvektor</em> (Länge 1), entfällt das Dividieren.</p>
    `,
    keyFacts: [
      '\\(d = \\frac{|\\vec{n} \\cdot \\vec{AP}|}{|\\vec{n}|}\\)',
      'A ist ein beliebiger Punkt auf E',
      'Mit normiertem \\(\\vec{n_0}\\): \\(d = |\\vec{n_0} \\cdot \\vec{AP}|\\)',
    ],
    missionIds: [11],
  },

  'Schnitt Gerade–Ebene': {
    icon: '✂️',
    color: '#ff6b35',
    title: 'Schnitt Gerade–Ebene',
    subtitle: 'Trifft das Rettungsseil die Kletterwand?',
    formula: '$$t = \\frac{d - \\vec{n} \\cdot \\vec{p}}{\\vec{n} \\cdot \\vec{r}}$$',
    body: `
      <p>Um den Schnittpunkt einer Geraden mit einer Ebene zu finden, setzt man die
      Geradengleichung in die Ebenengleichung ein und löst nach t auf.</p>
      <p>Sonderfall: Ist \\(\\vec{n} \\cdot \\vec{r} = 0\\), verläuft die Gerade parallel zur Ebene.</p>
    `,
    keyFacts: [
      'Geradengleichung in Ebenengleichung einsetzen',
      'Nach t auflösen → Schnittpunkt durch t in Gerade einsetzen',
      '\\(\\vec{n} \\cdot \\vec{r} = 0\\) → Gerade parallel zur Ebene',
    ],
    missionIds: [10],
  },

  'Spiegelung an Ebene': {
    icon: '🪞',
    color: '#a78bfa',
    title: 'Spiegelung an einer Ebene',
    subtitle: 'Der Parallelkurs auf der anderen Seite',
    formula: "$$P' = 2F - P \\qquad F = P + t_0 \\cdot \\vec{n}$$",
    body: `
      <p>Um einen Punkt P an einer Ebene zu spiegeln, berechnet man zuerst
      den <strong>Lotfußpunkt F</strong> (Schnittpunkt der Lotgeraden durch P mit der Ebene).
      Der Spiegelpunkt P' liegt dann auf der anderen Seite von F im gleichen Abstand.</p>
    `,
    keyFacts: [
      'Lotgerade durch P mit Richtung \\(\\vec{n}\\): \\(\\vec{x} = P + t\\vec{n}\\)',
      'Lotfußpunkt F: Schnittpunkt der Lotgeraden mit E',
      "Spiegelpunkt: \\(P' = 2F - P\\)",
    ],
    missionIds: [12],
  },
};

// ── Glossar ───────────────────────────────────────────────────────────────────
// unlock: freigeschaltet ab dieser Mission-Nummer abgeschlossen
export const GLOSSAR = [
  { term: 'Vektor', symbol: '\\vec{v}', def: 'Mathematisches Objekt mit Richtung und Länge — kein Punkt, sondern eine Verschiebung.', unlock: 0 },
  { term: 'Ortsvektor', symbol: '\\vec{OP}', def: 'Verbindet den Ursprung O mit einem Punkt P. Komponenten = Koordinaten von P.', unlock: 0 },
  { term: 'Punkt', symbol: 'P(x_1 \\mid x_2 \\mid x_3)', def: 'Ort im Raum, beschrieben durch drei Koordinaten.', unlock: 0 },
  { term: 'Komponente', symbol: 'x_1, x_2, x_3', def: 'Die drei Einträge eines Vektors — Verschiebung in x₁-, x₂- und x₃-Richtung.', unlock: 0 },
  { term: 'Verbindungsvektor', symbol: '\\vec{AB} = B - A', def: 'Zeigt von A nach B. Immer: Zielkoordinaten minus Startkoordinaten.', unlock: 1 },
  { term: 'Betrag', symbol: '|\\vec{v}|', def: 'Die Länge eines Vektors. Berechnung: Wurzel aus der Summe der quadrierten Komponenten.', unlock: 1 },
  { term: 'Richtungsvektor', symbol: '\\vec{v}', def: 'Gibt die Richtung einer Geraden an. Vielfache des Richtungsvektors beschreiben dieselbe Gerade.', unlock: 2 },
  { term: 'Stützvektor', symbol: '\\vec{a}', def: 'Ortsvektor eines Punktes auf der Geraden. Ausgangspunkt der Parameterdarstellung.', unlock: 2 },
  { term: 'Parameter', symbol: 't \\in \\mathbb{R}', def: 'Variable in der Geradengleichung. Jedes t entspricht genau einem Punkt auf der Geraden.', unlock: 2 },
  { term: 'Skalarprodukt', symbol: '\\vec{a} \\cdot \\vec{b}', def: 'Summe der komponentenweisen Produkte. Ergebnis ist eine Zahl (Skalar).', unlock: 3 },
  { term: 'Senkrecht', symbol: '\\vec{a} \\perp \\vec{b}', def: 'Zwei Vektoren stehen senkrecht, wenn ihr Skalarprodukt 0 ist.', unlock: 3 },
  { term: 'Normalenvektor', symbol: '\\vec{n}', def: 'Steht senkrecht auf einer Ebene. Entscheidend für Ebenengleichungen.', unlock: 8 },
  { term: 'Kreuzprodukt', symbol: '\\vec{a} \\times \\vec{b}', def: 'Ergibt einen Vektor, der senkrecht auf beiden Eingangsvektoren steht. Länge = Flächeninhalt des aufgespannten Parallelogramms.', unlock: 6 },
  { term: 'Spatprodukt', symbol: '(\\vec{c}, \\vec{a}, \\vec{b})', def: 'Skalarprodukt eines Vektors mit dem Kreuzprodukt zweier anderer. Null, wenn alle drei in einer Ebene liegen.', unlock: 6 },
  { term: 'Windschief', symbol: '', def: 'Zwei Geraden im Raum, die weder parallel noch schneidend sind. Nur im 3D möglich!', unlock: 6 },
  { term: 'Lotfußpunkt', symbol: 'F', def: 'Schnittpunkt des Lotes von einem Punkt auf eine Gerade oder Ebene. Bestimmt den kürzesten Abstand.', unlock: 7 },
  { term: 'Einheitsvektor', symbol: '\\vec{e} = \\frac{\\vec{v}}{|\\vec{v}|}', def: 'Vektor der Länge 1 in einer bestimmten Richtung. Nützlich für Abstandsberechnungen.', unlock: 7 },
  { term: 'Koordinatenform', symbol: 'n_1 x_1 + n_2 x_2 + n_3 x_3 = d', def: 'Gleichung einer Ebene in der Form mit Normalenvektor-Komponenten.', unlock: 8 },
  { term: 'Spannvektoren', symbol: '\\vec{u}, \\vec{v}', def: 'Zwei linear unabhängige Vektoren, die eine Ebene aufspannen.', unlock: 8 },
];
