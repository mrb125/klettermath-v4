// stl-model.js — Generates a 3D-printable ASCII STL of the KletterMath climbing park.
// Scale: 1 coordinate unit = 10 mm (1 cm)
// Coordinate mapping: x₁ → STL X, x₂ → STL Y, x₃ → STL Z (height above table)

import { PLATS } from '../data/platforms.js';

const S      = 10;          // mm per coordinate unit
const BX0    = -6 * S;      // base plate X min (mm)
const BX1    = 11 * S;      // base plate X max (mm)
const BY0    = -5 * S;      // base plate Y min (mm)
const BY1    = 10 * S;      // base plate Y max (mm)
const BASE_Z = 3;           // base plate thickness (mm)
const SOCK_H = 4;           // socket height above base (mm)
const SOCK_Z = BASE_Z + SOCK_H;
const SOCK_R = 10;          // socket radius (mm) — wide for stability
const PEG_R  = 4;           // peg (thin cylinder) radius (mm)
const CAP_R  = 6;           // cap (platform disc) radius (mm)
const CAP_H  = 2;           // cap height (mm)
const N      = 24;          // cylinder subdivisions

// ── STL geometry helpers ────────────────────────────────────────────────────

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

// Axis-aligned box — 12 triangles, all normals pointing outward
function box(x0, y0, z0, x1, y1, z1) {
  return [
    // Bottom (−Z)
    tri([x0,y0,z0],[x1,y1,z0],[x1,y0,z0]),
    tri([x0,y0,z0],[x0,y1,z0],[x1,y1,z0]),
    // Top (+Z)
    tri([x0,y0,z1],[x1,y0,z1],[x1,y1,z1]),
    tri([x0,y0,z1],[x1,y1,z1],[x0,y1,z1]),
    // Front (−Y)
    tri([x0,y0,z0],[x1,y0,z0],[x1,y0,z1]),
    tri([x0,y0,z0],[x1,y0,z1],[x0,y0,z1]),
    // Back (+Y)
    tri([x1,y1,z0],[x0,y1,z1],[x0,y1,z0]),
    tri([x1,y1,z0],[x1,y1,z1],[x0,y1,z1]),
    // Left (−X)
    tri([x0,y1,z0],[x0,y0,z0],[x0,y0,z1]),
    tri([x0,y1,z0],[x0,y0,z1],[x0,y1,z1]),
    // Right (+X)
    tri([x1,y0,z0],[x1,y1,z0],[x1,y1,z1]),
    tri([x1,y0,z0],[x1,y1,z1],[x1,y0,z1]),
  ].join('');
}

// Upright cylinder — side + top + bottom caps, outward normals
function cylinder(cx, cy, z0, z1, r, n = N) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  let out = '';
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const [ax, ay] = pts[i], [bx, by] = pts[j];
    // Side faces (outward)
    out += tri([ax,ay,z0],[bx,by,z0],[bx,by,z1]);
    out += tri([ax,ay,z0],[bx,by,z1],[ax,ay,z1]);
    // Bottom cap (−Z normal)
    out += tri([cx,cy,z0],[bx,by,z0],[ax,ay,z0]);
    // Top cap (+Z normal)
    out += tri([cx,cy,z1],[ax,ay,z1],[bx,by,z1]);
  }
  return out;
}

// Cone (pointing in +Z) — for axis arrows
function cone(cx, cy, z0, z1, r, n = 16) {
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
    out += tri([cx,cy,z0],[bx,by,z0],[ax,ay,z0]);  // bottom cap
  }
  return out;
}

// ── Main export ─────────────────────────────────────────────────────────────

export function downloadParkSTL() {
  let data = 'solid klettermath_park\n';

  // 1. Base plate
  data += box(BX0, BY0, 0, BX1, BY1, BASE_Z);

  // 2. Grid lines (raised ridges every 1 unit)
  const GW = 0.75, GH = 1.0;   // minor grid: 0.75mm wide, 1mm high
  const AW = 1.5,  AH = 2.0;   // axis line: 1.5mm wide, 2mm high

  for (let xi = -6; xi <= 11; xi++) {
    const xmm = xi * S;
    const isAxis = xi === 0;
    const [w, h] = isAxis ? [AW, AH] : [GW, GH];
    data += box(xmm - w/2, BY0, BASE_Z, xmm + w/2, BY1, BASE_Z + h);
  }
  for (let yi = -5; yi <= 10; yi++) {
    const ymm = yi * S;
    const isAxis = yi === 0;
    const [w, h] = isAxis ? [AW, AH] : [GW, GH];
    data += box(BX0, ymm - w/2, BASE_Z, BX1, ymm + w/2, BASE_Z + h);
  }

  // 3. Axis arrow cones
  const arrowBase = BASE_Z + AH;
  data += cone(BX1, 0, arrowBase, arrowBase + 8, 4);   // x₁ positive end
  data += cone(0, BY1, arrowBase, arrowBase + 8, 4);   // x₂ positive end

  // 4. Platform objects
  for (const p of PLATS) {
    const cx   = p.x * S;
    const cy   = p.y * S;
    const pegH = p.z * S;   // height above socket top (mm)

    // Socket — wide disc for stability, fused with base plate (z=BASE_Z..SOCK_Z)
    data += cylinder(cx, cy, BASE_Z, SOCK_Z, SOCK_R);

    if (pegH > 0) {
      // Peg — thin cylinder carrying the height information
      data += cylinder(cx, cy, SOCK_Z, SOCK_Z + pegH, PEG_R);
      // Cap — wider disc on top, represents the platform
      data += cylinder(cx, cy, SOCK_Z + pegH, SOCK_Z + pegH + CAP_H, CAP_R);
    } else {
      // z=0 platform (S = Startplattform): no peg, cap sits directly on socket
      data += cylinder(cx, cy, SOCK_Z, SOCK_Z + CAP_H, CAP_R);
    }
  }

  data += 'endsolid klettermath_park\n';

  // Trigger browser download
  const blob = new Blob([data], { type: 'model/stl' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'klettermath-park.stl';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
