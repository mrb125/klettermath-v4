// stl-model.js — Thematische 3D-Druckmodelle des KletterMath-Kletterparks.
// Jede Plattform hat ein eigenes Design passend zur App-Darstellung.
// Seilverbindungen (Verbindungsvektoren) sind als Tuben enthalten.
// Scale: 1 Koordinateneinheit = 10 mm

import { PLATS, ROPES } from '../data/platforms.js';

const S      = 10;      // mm pro Koordinateneinheit
const BX0    = -6 * S;
const BX1    = 11 * S;
const BY0    = -5 * S;
const BY1    = 10 * S;
const BASE_Z = 5;       // Bodenplatte-Dicke (mm) — etwas dicker für Stabilität
const SOCK_H = 6;       // Sockel-Höhe über Bodenplatte — größerer Standfuß
const SOCK_Z = BASE_Z + SOCK_H;
const SOCK_R = 12;      // Sockelradius vergrößert (war 9)
const N_CYL  = 16;      // Zylinder-Subdivisions (Kompromiss Qualität/Größe)

// ── Geometrie-Grundbausteine ─────────────────────────────────────────────────

function fv([x, y, z]) {
  return `${x.toFixed(3)} ${y.toFixed(3)} ${z.toFixed(3)}`;
}

function computeNormal(v1, v2, v3) {
  const ax = v2[0]-v1[0], ay = v2[1]-v1[1], az = v2[2]-v1[2];
  const bx = v3[0]-v1[0], by = v3[1]-v1[1], bz = v3[2]-v1[2];
  const nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx;
  const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
  return `${(nx/len).toFixed(6)} ${(ny/len).toFixed(6)} ${(nz/len).toFixed(6)}`;
}

function tri(v1, v2, v3) {
  return `  facet normal ${computeNormal(v1,v2,v3)}\n    outer loop\n` +
         `      vertex ${fv(v1)}\n      vertex ${fv(v2)}\n      vertex ${fv(v3)}\n` +
         `    endloop\n  endfacet\n`;
}

function box(x0, y0, z0, x1, y1, z1) {
  return [
    tri([x0,y0,z0],[x1,y1,z0],[x1,y0,z0]), tri([x0,y0,z0],[x0,y1,z0],[x1,y1,z0]),
    tri([x0,y0,z1],[x1,y0,z1],[x1,y1,z1]), tri([x0,y0,z1],[x1,y1,z1],[x0,y1,z1]),
    tri([x0,y0,z0],[x1,y0,z0],[x1,y0,z1]), tri([x0,y0,z0],[x1,y0,z1],[x0,y0,z1]),
    tri([x1,y1,z0],[x0,y1,z1],[x0,y1,z0]), tri([x1,y1,z0],[x1,y1,z1],[x0,y1,z1]),
    tri([x0,y1,z0],[x0,y0,z0],[x0,y0,z1]), tri([x0,y1,z0],[x0,y0,z1],[x0,y1,z1]),
    tri([x1,y0,z0],[x1,y1,z0],[x1,y1,z1]), tri([x1,y0,z0],[x1,y1,z1],[x1,y0,z1]),
  ].join('');
}

function cylinder(cx, cy, z0, z1, r, n = N_CYL) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  let out = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [ax, ay] = pts[i], [bx, by] = pts[j];
    out += tri([ax,ay,z0],[bx,by,z0],[bx,by,z1]);
    out += tri([ax,ay,z0],[bx,by,z1],[ax,ay,z1]);
    out += tri([cx,cy,z0],[bx,by,z0],[ax,ay,z0]);
    out += tri([cx,cy,z1],[ax,ay,z1],[bx,by,z1]);
  }
  return out;
}

function cone(cx, cy, z0, z1, r, n = N_CYL) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  const tip = [cx, cy, z1];
  let out = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [ax, ay] = pts[i], [bx, by] = pts[j];
    out += tri([ax,ay,z0],[bx,by,z0], tip);
    out += tri([cx,cy,z0],[bx,by,z0],[ax,ay,z0]);
  }
  return out;
}

// Zylinder zwischen zwei beliebigen 3D-Punkten (für Seilverbindungen)
function tube([ax, ay, az], [bx, by, bz], r, n = 12) {
  const dx = bx-ax, dy = by-ay, dz = bz-az;
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if (len < 0.5) return '';
  const [ux, uy, uz] = [dx/len, dy/len, dz/len];

  // Perpendikulärvektor via cross-Produkt
  let px, py, pz;
  if (Math.abs(uz) < 0.9) {
    px = -uy; py = ux; pz = 0;
  } else {
    px = 0; py = -uz; pz = uy;
  }
  const pl = Math.sqrt(px*px + py*py + pz*pz);
  [px, py, pz] = [px/pl, py/pl, pz/pl];
  // Zweiter Perpendikulär (Kreuzprodukt d × p)
  const [qx, qy, qz] = [uy*pz - uz*py, uz*px - ux*pz, ux*py - uy*px];

  const cA = [], cB = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a) * r, sa = Math.sin(a) * r;
    cA.push([ax + px*ca + qx*sa, ay + py*ca + qy*sa, az + pz*ca + qz*sa]);
    cB.push([bx + px*ca + qx*sa, by + py*ca + qy*sa, bz + pz*ca + qz*sa]);
  }

  let out = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    out += tri(cA[i], cA[j], cB[j]);
    out += tri(cA[i], cB[j], cB[i]);
    out += tri([ax, ay, az], cA[j], cA[i]);   // Startdeckel
    out += tri([bx, by, bz], cB[i], cB[j]);   // Enddeckel
  }
  return out;
}

// ── Thematische Plattform-Designs ────────────────────────────────────────────
// Jede Funktion gibt STL-Dreiecke zurück und gibt die Höhe der Plattform-Oberkante zurück.
// capZ = die Z-Koordinate der Plattformfläche (für Seilanbindung)

// S — Start: Eingangstor (0|0|0, pegH=0)
function buildStart(cx, cy) {
  const base = SOCK_Z;
  let out = cylinder(cx, cy, BASE_Z, base, SOCK_R);  // Sockel
  // 2 Torpfosten
  out += cylinder(cx - 6, cy, base, base + 14, 2.5);
  out += cylinder(cx + 6, cy, base, base + 14, 2.5);
  // Querbalken oben
  out += box(cx - 6.5, cy - 2, base + 12, cx + 6.5, cy + 2, base + 15);
  // Bodenschwelle
  out += box(cx - 6.5, cy - 1.5, base, cx + 6.5, cy + 1.5, base + 3);
  return { stl: out, capZ: base + 3 };
}

// A — Adlerhorst: Baumhaus (4|1|3, pegH=30)
function buildTreehouse(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  // Stamm (Höhe = x₃)
  out += cylinder(cx, cy, SOCK_Z, SOCK_Z + pegH, 4);
  const top = SOCK_Z + pegH;
  // Plattform-Scheibe
  out += cylinder(cx, cy, top, top + 2, 11);
  // 4 kurze Geländerpfosten
  for (const [dx, dy] of [[-9,0],[9,0],[0,-9],[0,9]]) {
    out += cylinder(cx+dx, cy+dy, top+2, top+7, 1.2);
  }
  // Dach (Kegel)
  out += cone(cx, cy, top + 6, top + 14, 10);
  return { stl: out, capZ: top + 2 };
}

// B — Brücke: Hängebrücke (8|3|1, pegH=10)
function buildBridge(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  const top = SOCK_Z + pegH;
  // 2 Brückenturm-Posts
  out += cylinder(cx - 7, cy, SOCK_Z, top + 10, 2.5);
  out += cylinder(cx + 7, cy, SOCK_Z, top + 10, 2.5);
  // Quer-Verbindung oben (Turm-Querbalken)
  out += box(cx - 7.5, cy - 1.5, top + 8, cx + 7.5, cy + 1.5, top + 11);
  // Brückendeck (Fahrbahnfläche)
  out += box(cx - 9, cy - 4, top, cx + 9, cy + 4, top + 2);
  // 3 Bodenplanken quer
  for (const dx of [-5, 0, 5]) {
    out += box(cx + dx - 1, cy - 4.5, top, cx + dx + 1, cy + 4.5, top + 2.5);
  }
  return { stl: out, capZ: top + 2 };
}

// G — Gipfel: Baum mit Krone (-3|6|5, pegH=50)
function buildGipfel(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  // Dicker Stamm (Höhe = x₃)
  out += cylinder(cx, cy, SOCK_Z, SOCK_Z + pegH, 5);
  const top = SOCK_Z + pegH;
  // Breite Krone unten
  out += cylinder(cx, cy, top - 4, top + 6, 13);
  // Schmalere Krone oben
  out += cylinder(cx, cy, top + 4, top + 12, 9);
  // Kegel-Spitze
  out += cone(cx, cy, top + 10, top + 20, 7);
  return { stl: out, capZ: top + 6 };
}

// T — Trapez: Aussichtsturm (6|-4|7, pegH=70)
function buildTower(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  const top = SOCK_Z + pegH;
  const off = 4.5;
  // 4 Turmstreben (Beine)
  for (const [dx, dy] of [[-off,-off],[-off,off],[off,-off],[off,off]]) {
    out += cylinder(cx + dx, cy + dy, SOCK_Z, top, 2.5);
  }
  // Horizontale Verstrebungen (2 Ebenen)
  for (const h of [SOCK_Z + pegH * 0.4, SOCK_Z + pegH * 0.75]) {
    out += box(cx - off - 1.5, cy - 1, h, cx + off + 1.5, cy + 1, h + 2);
    out += box(cx - 1, cy - off - 1.5, h, cx + 1, cy + off + 1.5, h + 2);
  }
  // Plattform oben
  out += box(cx - 7, cy - 7, top, cx + 7, cy + 7, top + 2.5);
  // Geländer (4 Seiten)
  out += box(cx - 7, cy - 7, top + 2.5, cx + 7, cy - 5, top + 6);
  out += box(cx - 7, cy + 5, top + 2.5, cx + 7, cy + 7, top + 6);
  out += box(cx - 7, cy - 7, top + 2.5, cx - 5, cy + 7, top + 6);
  out += box(cx + 5, cy - 7, top + 2.5, cx + 7, cy + 7, top + 6);
  // Pyramiden-Dach
  out += cone(cx, cy, top + 5, top + 14, 9);
  return { stl: out, capZ: top + 2.5 };
}

// H — Hängenest: Hütte im Baum (-5|8|2, pegH=20)
function buildHut(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  // Träger-Stamm
  out += cylinder(cx, cy, SOCK_Z, SOCK_Z + pegH, 3);
  const top = SOCK_Z + pegH;
  // Hütten-Box
  out += box(cx - 5.5, cy - 5.5, top, cx + 5.5, cy + 5.5, top + 9);
  // Fenster-Öffnung (Vertiefung durch kleinere Box über Hütten-Box)
  out += box(cx - 1.5, cy - 6, top + 2, cx + 1.5, cy - 4.5, top + 5.5);
  // Kegel-Dach
  out += cone(cx, cy, top + 8, top + 16, 8);
  return { stl: out, capZ: top + 9 };
}

// K — Kletternetz: Kletterwand (5|9|4, pegH=40)
function buildWall(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  // 2 Seitenpfosten
  out += cylinder(cx - 8, cy, SOCK_Z, SOCK_Z + pegH + 5, 2.5);
  out += cylinder(cx + 8, cy, SOCK_Z, SOCK_Z + pegH + 5, 2.5);
  // Wandfläche
  out += box(cx - 8, cy - 2, SOCK_Z, cx + 8, cy + 2, SOCK_Z + pegH);
  const top = SOCK_Z + pegH;
  // 6 Griffpunkte (kleine Kegel auf der Vorderfläche)
  for (const [dx, dz] of [[-5, 8],[0, 12],[5, 18],[-4, 22],[3, 28],[-2, 35]]) {
    out += cone(cx + dx, cy - 2.5, top - pegH + dz - 2, top - pegH + dz + 2, 2);
  }
  // Querbalken oben
  out += box(cx - 9, cy - 3, top, cx + 9, cy + 3, top + 3);
  return { stl: out, capZ: top };
}

// E — Endstation: Seilbahnmast (10|-2|1, pegH=10)
function buildMast(cx, cy, pegH) {
  let out = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);  // Sockel
  const mastH = Math.max(pegH, 25);  // Mast mindestens 25mm sichtbar
  // Hauptmast
  out += cylinder(cx, cy, SOCK_Z, SOCK_Z + mastH, 3);
  const top = SOCK_Z + mastH;
  // Horizontaler Ausleger
  out += box(cx - 12, cy - 1.5, top - 2, cx + 2, cy + 1.5, top + 1);
  // Seilscheibe (Trommel)
  out += cylinder(cx - 10, cy, top - 3, top + 3, 4);
  // Gondel (Box hängend)
  const gondZ = SOCK_Z + pegH - 2;
  out += box(cx - 13, cy - 3.5, gondZ - 5, cx - 7, cy + 3.5, gondZ + 1);
  // Aufhängedraht (dünner Zylinder)
  out += cylinder(cx - 10, cy, gondZ + 1, top - 3, 0.8);
  return { stl: out, capZ: SOCK_Z + pegH + 1 };
}

// Dispatcher: wählt Design nach Plattform-Label
function buildPlatformGeometry(p) {
  const cx  = p.x * S;
  const cy  = p.y * S;
  const pegH = p.z * S;

  switch (p.lbl) {
    case 'S': return buildStart(cx, cy);
    case 'A': return buildTreehouse(cx, cy, pegH);
    case 'B': return buildBridge(cx, cy, pegH);
    case 'G': return buildGipfel(cx, cy, pegH);
    case 'T': return buildTower(cx, cy, pegH);
    case 'H': return buildHut(cx, cy, pegH);
    case 'K': return buildWall(cx, cy, pegH);
    case 'E': return buildMast(cx, cy, pegH);
    default: {
      // Fallback: generischer Peg + Cap
      let stl = cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);
      if (pegH > 0) stl += cylinder(cx, cy, SOCK_Z, SOCK_Z + pegH, 4);
      stl += cylinder(cx, cy, SOCK_Z + pegH, SOCK_Z + pegH + 2, 6);
      return { stl, capZ: SOCK_Z + pegH + 2 };
    }
  }
}

// ── Haupt-Export ─────────────────────────────────────────────────────────────

export function downloadParkSTL() {
  let data = 'solid klettermath_park\n';

  // 1. Bodenplatte
  data += box(BX0, BY0, 0, BX1, BY1, BASE_Z);

  // 2. Gitterlinien (Rippen)
  const GW = 0.75, GH = 1.0;
  const AW = 1.5,  AH = 2.0;
  for (let xi = -6; xi <= 11; xi++) {
    const xmm = xi * S, isAxis = xi === 0;
    const [w, h] = isAxis ? [AW, AH] : [GW, GH];
    data += box(xmm - w/2, BY0, BASE_Z, xmm + w/2, BY1, BASE_Z + h);
  }
  for (let yi = -5; yi <= 10; yi++) {
    const ymm = yi * S, isAxis = yi === 0;
    const [w, h] = isAxis ? [AW, AH] : [GW, GH];
    data += box(BX0, ymm - w/2, BASE_Z, BX1, ymm + w/2, BASE_Z + h);
  }

  // 3. Achspfeile (Kegel)
  const arrowBase = BASE_Z + AH;
  data += cone(BX1, 0, arrowBase, arrowBase + 8, 4);   // x₁+
  data += cone(0, BY1, arrowBase, arrowBase + 8, 4);   // x₂+

  // 4. Thematische Plattformen + Höhentabelle für Seilanbindung
  const capZByIdx = {};
  for (const p of PLATS) {
    const { stl, capZ } = buildPlatformGeometry(p);
    data += stl;
    capZByIdx[p.id] = capZ;
  }

  // 5. Seile (alle 11 ROPES-Verbindungen)
  for (const [ai, bi] of ROPES) {
    const pa = PLATS[ai], pb = PLATS[bi];
    const A = [pa.x * S, pa.y * S, capZByIdx[pa.id]];
    const B = [pb.x * S, pb.y * S, capZByIdx[pb.id]];
    data += tube(A, B, 1.5);
  }

  data += 'endsolid klettermath_park\n';
  _triggerDownload(data, 'klettermath-park.stl');
}

// Nur die 8 Plattform-Objekte — keine Bodenplatte, kein Gitter, keine Seile.
// Ideal für Einzeldruck der thematischen Tokens.
export function downloadPlatformsSTL() {
  let data = 'solid klettermath_plattformen\n';

  for (const p of PLATS) {
    const { stl } = buildPlatformGeometry(p);
    data += stl;
  }

  data += 'endsolid klettermath_plattformen\n';
  _triggerDownload(data, 'klettermath-plattformen.stl');
}

// Einzelne STL-Dateien pro Plattform als ZIP (für Bambu Lab / PrusaSlicer Multi-Plate)
// Jede Plattform landet als eigene .stl auf einem eigenen Plate.
// Lädt eine ZIP-Datei mit 8 STL-Dateien (kein Server nötig, alles im Browser).
export async function downloadIndividualSTLs() {
  // Dynamisch fflate laden (tiny ZIP-Lib, ~45 KB gzipped)
  let zip;
  try {
    const fflate = await import('https://cdn.jsdelivr.net/npm/fflate@0.8.2/esm/browser.js');
    zip = fflate;
  } catch {
    // Fallback: einzelne Downloads
    _downloadIndividualFallback();
    return;
  }

  const files = {};
  for (const p of PLATS) {
    const { stl } = buildPlatformGeometry(p);
    const stlData = `solid km_${p.lbl}\n${stl}endsolid km_${p.lbl}\n`;
    // fflate erwartet Uint8Array
    files[`km_${p.lbl}_${p.name}.stl`] = new TextEncoder().encode(stlData);
  }

  const zipped = zip.zipSync(files, { level: 1 });
  const blob = new Blob([zipped], { type: 'application/zip' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'klettermath-plattformen-einzeln.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fallback: 8 einzelne Downloads nacheinander (kein ZIP nötig)
function _downloadIndividualFallback() {
  PLATS.forEach((p, i) => {
    const { stl } = buildPlatformGeometry(p);
    const data = `solid km_${p.lbl}\n${stl}endsolid km_${p.lbl}\n`;
    setTimeout(() => _triggerDownload(data, `km_${p.lbl}_${p.name}.stl`), i * 200);
  });
}

function _triggerDownload(data, filename) {
  const blob = new Blob([data], { type: 'model/stl' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
