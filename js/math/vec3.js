export class V3 {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z }
  add(b) { return new V3(this.x + b.x, this.y + b.y, this.z + b.z) }
  sub(b) { return new V3(this.x - b.x, this.y - b.y, this.z - b.z) }
  scale(s) { return new V3(this.x * s, this.y * s, this.z * s) }
  dot(b) { return this.x * b.x + this.y * b.y + this.z * b.z }
  cross(b) { return new V3(this.y * b.z - this.z * b.y, this.z * b.x - this.x * b.z, this.x * b.y - this.y * b.x) }
  len() { return Math.sqrt(this.dot(this)) }
  norm() { const l = this.len(); return l > 0 ? this.scale(1 / l) : new V3(0, 0, 0) }
  angleTo(b) { const c = Math.max(-1, Math.min(1, this.dot(b) / (this.len() * b.len()))); return Math.acos(c) * 180 / Math.PI }
  schnittWinkel(b) { const a = this.angleTo(b); return a > 90 ? 180 - a : a }
  lotFuss(s, r) { const t = this.sub(s).dot(r) / r.dot(r); return { punkt: s.add(r.scale(t)), t } }
  distToLine(s, r) { return this.sub(this.lotFuss(s, r).punkt).len() }
  lageRel(r2, s1, s2) {
    const c = this.cross(r2);
    if (c.len() < 1e-10) return s2.sub(s1).cross(this).len() < 1e-10 ? 'identisch' : 'parallel';
    return Math.abs(s2.sub(s1).dot(c)) > 1e-8 ? 'windschief' : 'schneidend';
  }
  eq(b, t = 0.1) { return Math.abs(this.x - b.x) <= t && Math.abs(this.y - b.y) <= t && Math.abs(this.z - b.z) <= t }
  toString() { return `(${this.x}|${this.y}|${this.z})` }
  toStr(d = 2) { const r = v => Math.round(v * 10 ** d) / 10 ** d; return `(${r(this.x)}|${r(this.y)}|${r(this.z)})` }
  toArr() { return [this.x, this.y, this.z] }
}

export const v3 = (x, y, z) => new V3(x, y, z);
