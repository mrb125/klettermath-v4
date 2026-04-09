import { v3 } from '../math/vec3.js';

export const PLATS = [
  { id: 0, name: 'Start',       lbl: 'S', x: 0,  y: 0, z: 0, color: '#94a3b8' },
  { id: 1, name: 'Adlerhorst',  lbl: 'A', x: 4,  y: 1, z: 3, color: '#e8a030' },
  { id: 2, name: 'Brücke',      lbl: 'B', x: 8,  y: 3, z: 1, color: '#ff6b35' },
  { id: 3, name: 'Gipfel',      lbl: 'G', x: -3, y: 6, z: 5, color: '#6bcb77' },
  { id: 4, name: 'Trapez',      lbl: 'T', x: 6,  y: -4,z: 7, color: '#5b9bd5' },
  { id: 5, name: 'Hängenest',   lbl: 'H', x: -5, y: 8, z: 2, color: '#a78bfa' },
  { id: 6, name: 'Kletternetz', lbl: 'K', x: 5,  y: 9, z: 4, color: '#f472b6' },
  { id: 7, name: 'Endstation',  lbl: 'E', x: 10, y: -2,z: 1, color: '#ffd166' }
];

export const ROPES = [
  [0,1], [0,3], [1,2], [1,3], [2,4], [2,7], [3,4], [3,5], [4,6], [5,6], [6,7]
];

export function platV3(i) {
  return v3(PLATS[i].x, PLATS[i].y, PLATS[i].z);
}

export function connV(a, b) {
  return platV3(b).sub(platV3(a));
}

export function connArr(a, b) {
  return connV(a, b).toArr();
}

// Textdarstellung: NRW-Notation (x₁|x₂|x₃) für Fließtext
export function pCoord(i) {
  const p = PLATS[i];
  return `(${p.x}|${p.y}|${p.z})`;
}

// LaTeX-Darstellung: \mid-Abstände für Einsatz innerhalb \(...\) oder $$...$$
export function pCoordTeX(i) {
  const p = PLATS[i];
  return `(${p.x} \\mid ${p.y} \\mid ${p.z})`;
}

export function P(i) {
  return `${PLATS[i].name} ${PLATS[i].lbl}${pCoord(i)}`;
}
