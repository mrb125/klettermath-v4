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
    selfExplain: {
      q: 'Warum gilt: Ortsvektor = Koordinaten des Punktes?',
      options: [
        { text: 'Weil der Ortsvektor vom Ursprung O zum Punkt P zeigt — die Verschiebung entspricht genau den Koordinaten.', correct: true, fb: 'Genau! Ursprung → Punkt = Koordinaten als Verschiebung.' },
        { text: 'Weil Vektoren immer am Ursprung starten — das gilt für alle Vektoren.', correct: false, fb: 'Nicht ganz: Nicht alle Vektoren starten am Ursprung — nur der Ortsvektor ist speziell so definiert.' },
        { text: 'Weil Punkte im Raum nur durch Vektoren definiert werden können.', correct: false, fb: 'Nicht ganz: Punkte haben Koordinaten unabhängig von Vektoren.' },
      ],
    },
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
    selfExplain: {
      q: 'Warum gilt \\(\\vec{AB} = B - A\\), nicht \\(A - B\\)?',
      options: [
        { text: 'Weil der Vektor vom Start A zum Ziel B zeigt — Ziel minus Start ergibt die Verschiebung.', correct: true, fb: 'Richtig: Ziel minus Start — immer in diese Reihenfolge merken!' },
        { text: 'Weil Vektoren immer in positiver Koordinatenrichtung zeigen.', correct: false, fb: 'Nicht korrekt: Verbindungsvektoren können in jede Richtung zeigen.' },
        { text: 'Weil B weiter vom Ursprung entfernt liegt als A.', correct: false, fb: 'Nicht korrekt: Die Reihenfolge hängt von der Richtung ab, nicht vom Abstand zum Ursprung.' },
      ],
    },
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
    selfExplain: {
      q: 'Was bedeutet der Parameter t geometrisch?',
      options: [
        { text: 't gibt die Position auf der Geraden an: t=0 ist der Stützpunkt, t=1 ein Schritt in Richtungsvektor-Richtung.', correct: true, fb: 'Genau! t ist ein geometrischer Skalierungsfaktor, kein Zeitwert.' },
        { text: 't ist die Zeit, die ein Kletterer braucht, um die Strecke zurückzulegen.', correct: false, fb: 'Nicht korrekt: t ist keine Zeit, sondern ein geometrischer Parameter.' },
        { text: 't ist die Länge des Richtungsvektors.', correct: false, fb: 'Nicht korrekt: t skaliert den Richtungsvektor, gibt aber nicht dessen Länge an.' },
      ],
    },
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
    selfExplain: {
      q: 'Warum ist das Skalarprodukt senkrechter Vektoren null?',
      options: [
        { text: 'Weil senkrechte Vektoren keine gemeinsame Richtungskomponente haben — das Produkt der Projektionen ist 0.', correct: true, fb: 'Richtig! Das ist das zentrale Orthogonalitätskriterium.' },
        { text: 'Weil bei 90° einer der Vektoren den Betrag 0 hat.', correct: false, fb: 'Nicht korrekt: Die Vektoren selbst haben Betrag > 0 — nur ihre Projektion aufeinander ist 0.' },
        { text: 'Weil 90° der maximale Winkel zwischen zwei Vektoren ist.', correct: false, fb: 'Nicht korrekt: Vektoren können auch stumpfe Winkel (> 90°) einschließen.' },
      ],
    },
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
    selfExplain: {
      q: 'Welche Formel liefert den Winkel zwischen zwei Vektoren?',
      options: [
        { text: '\\(\\cos\\alpha = \\frac{\\vec{a}\\cdot\\vec{b}}{|\\vec{a}|\\cdot|\\vec{b}|}\\) — Skalarprodukt geteilt durch Produkt der Beträge.', correct: true, fb: 'Genau! Das normierte Skalarprodukt gibt den Kosinus des Winkels.' },
        { text: '\\(\\alpha = \\vec{a} \\cdot \\vec{b}\\) — das Skalarprodukt direkt.', correct: false, fb: 'Nicht korrekt: Das Skalarprodukt ist ein Längenwert, kein Winkel.' },
        { text: '\\(\\alpha = |\\vec{a} - \\vec{b}|\\) — die Länge der Differenz.', correct: false, fb: 'Nicht korrekt: Das ist der Abstand der Spitzen, kein Winkel.' },
      ],
    },
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
    selfExplain: {
      q: 'Wie prüft man, ob Punkt P auf Gerade g liegt?',
      options: [
        { text: 'Man setzt P als \\(\\vec{x}\\) ein und löst nach t auf — gibt es ein t, liegt P auf g.', correct: true, fb: 'Richtig! Ein eindeutiges t → P liegt auf g; Widerspruch → P liegt nicht auf g.' },
        { text: 'Man berechnet den Abstand von P zur Geraden und prüft, ob er < 0,1 ist.', correct: false, fb: 'Nicht korrekt: Bei der Punktprobe prüfen wir exakte Zugehörigkeit, nicht Näherungswerte.' },
        { text: 'Man vergleicht die Richtungsvektoren von P und g.', correct: false, fb: 'Nicht korrekt: Der Richtungsvektor allein sagt nichts über den Punkt P aus.' },
      ],
    },
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
    selfExplain: {
      q: 'Woran erkennt man windschiefe Geraden?',
      options: [
        { text: 'Das Gleichungssystem ist widersprüchlich (kein t/s löst alle 3 Gleichungen) — und die Richtungsvektoren sind nicht parallel.', correct: true, fb: 'Genau! Kein gemeinsamer Punkt + nicht parallel = windschief.' },
        { text: 'Die Geraden haben keinen gemeinsamen Punkt — das bedeutet automatisch windschief.', correct: false, fb: 'Nicht ganz: Parallele Geraden haben auch keinen gemeinsamen Punkt — sind aber nicht windschief.' },
        { text: 'Die Richtungsvektoren zeigen in verschiedene Richtungen.', correct: false, fb: 'Nicht korrekt: Verschiedene Richtungen allein genügen nicht — auch schneidende Geraden können verschiedene Richtungen haben.' },
      ],
    },
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
    selfExplain: {
      q: 'Warum ist am Lotfußpunkt das Skalarprodukt null?',
      options: [
        { text: 'Der Lotfußpunkt ist der nächste Punkt auf der Geraden — das Lot steht senkrecht zur Geraden, also \\(\\vec{FL} \\perp \\vec{v}\\).', correct: true, fb: 'Richtig! Das Skalarprodukt des Lotvektors mit dem Richtungsvektor = 0 bestimmt t.' },
        { text: 'Weil am Lotfußpunkt der Richtungsvektor den Betrag 0 hat.', correct: false, fb: 'Nicht korrekt: Der Richtungsvektor behält seinen Betrag — nur die Senkrechtenbeziehung ändert sich.' },
        { text: 'Weil der Lotfußpunkt immer im Ursprung liegt.', correct: false, fb: 'Nicht korrekt: Der Lotfußpunkt liegt auf der Geraden, nicht notwendigerweise im Ursprung.' },
      ],
    },
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
    selfExplain: {
      q: 'Was beschreibt der Normalenvektor einer Ebene?',
      options: [
        { text: 'Der Normalenvektor steht senkrecht auf der Ebene — jeder in der Ebene liegende Vektor ist senkrecht zum Normalenvektor.', correct: true, fb: 'Genau! \\(\\vec{n} \\perp\\) Ebene ist das zentrale Konzept.' },
        { text: 'Der Normalenvektor gibt die Richtung der Ebene an.', correct: false, fb: 'Nicht korrekt: Richtungen in der Ebene werden durch Richtungsvektoren beschrieben, nicht den Normalenvektor.' },
        { text: 'Der Normalenvektor zeigt von der Ebene zum Ursprung.', correct: false, fb: 'Nicht korrekt: Der Normalenvektor zeigt senkrecht aus der Ebene, nicht notwendig zum Ursprung.' },
      ],
    },
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
    selfExplain: {
      q: 'Warum muss man bei der Abstandsformel durch \\(|\\vec{n}|\\) teilen?',
      options: [
        { text: 'Weil der Normalenvektor nicht normiert sein muss — die Formel mit \\(|\\vec{n}|\\) liefert den echten geometrischen Abstand.', correct: true, fb: 'Richtig! Ohne Normierung würde die Länge des Normalenvektors das Ergebnis verfälschen.' },
        { text: 'Damit das Ergebnis immer positiv ist.', correct: false, fb: 'Nicht ganz: Der Betrag macht das Ergebnis positiv — aber der Grund für die Division ist die Normierung.' },
        { text: 'Damit die Einheit stimmt.', correct: false, fb: 'Nicht korrekt: Die Einheit ändert sich nicht durch die Division.' },
      ],
    },
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
    selfExplain: {
      q: 'Wie bestimmt man die Schnittgerade zweier Ebenen?',
      options: [
        { text: 'Man löst das Gleichungssystem der beiden Ebenengleichungen mit einem freien Parameter — der Parameter wird zum t der Schnittgeraden.', correct: true, fb: 'Richtig! Das Gleichungssystem mit 1 Freiheitsgrad liefert genau eine Gerade.' },
        { text: 'Man berechnet das Kreuzprodukt der Normalenvektoren als Richtungsvektor.', correct: false, fb: 'Nicht vollständig: Das Kreuzprodukt gibt den Richtungsvektor, aber nicht den Stützpunkt.' },
        { text: 'Man setzt die Ebenengleichungen gleich und löst nach x₁ auf.', correct: false, fb: 'Nicht vollständig: Nur eine Koordinate reicht nicht — man braucht eine Parameterdarstellung.' },
      ],
    },
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
    selfExplain: {
      q: 'Welche Schritte braucht man zur Spiegelung eines Punktes an einer Ebene?',
      options: [
        { text: "Lotfußpunkt berechnen → Spiegelpunkt durch \\(P' = 2L - P\\), wobei L der Lotfußpunkt ist.", correct: true, fb: "Genau! L ist der Mittelpunkt von PP' — daher P' = 2L - P." },
        { text: 'Normalenvektor umkehren und an P ansetzen.', correct: false, fb: 'Nicht korrekt: Das beschreibt keine Spiegelung, sondern eine Reflexion des Vektors.' },
        { text: 'P an der Ebene reflektieren, indem man die Koordinaten des Normalenvektors subtrahiert.', correct: false, fb: 'Nicht korrekt: Das ist eine Verschiebung, keine Spiegelung.' },
      ],
    },
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
