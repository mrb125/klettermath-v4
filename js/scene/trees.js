import { SimplexNoise } from './terrain.js';

const simplex = new SimplexNoise();

// Shared materials — created once for ALL trees
let _bark = null;
const _crownMats = [];
function getTreeMaterials() {
  if (!_bark) {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, 0, 128, 128);
    const img = ctx.getImageData(0, 0, 128, 128), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const idx = i / 4, x = idx % 128, y = Math.floor(idx / 128);
      const n = simplex.noise(x * 0.08, y * 0.12) * 40;
      d[i] = Math.min(255, d[i] + n);
      d[i + 1] = Math.max(0, d[i + 1] - n);
      d[i + 2] = Math.max(0, d[i + 2] - n * 0.5);
    }
    ctx.putImageData(img, 0, 0);
    _bark = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(c), color: 0x5a4a3a, roughness: 0.95 });
    [0x2d5a1e, 0x3a7a2a, 0x4a8a3a, 0x2a6a2a, 0x4a9a4a].forEach(col =>
      _crownMats.push(new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 }))
    );
  }
  return { bark: _bark, crownMats: _crownMats };
}

export function createTree(x, z, height, trunkR, isMobile = false) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const { bark, crownMats } = getTreeMaterials();
  const segs = isMobile ? 5 : 8;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.7, trunkR, height, segs), bark);
  trunk.position.y = height / 2;
  trunk.castShadow = !isMobile;
  g.add(trunk);

  const offs = [
    { x: 0,    y: height + 1.2, z: 0,    s: 1.2 },
    { x: -0.6, y: height + 0.8, z: 0.3,  s: 0.9 },
    { x: 0.6,  y: height + 0.8, z: 0.3,  s: 0.9 },
    { x: 0.2,  y: height + 1.5, z: -0.5, s: 0.85 },
    { x: -0.3, y: height + 1.3, z: 0.6,  s: 0.8 }
  ];
  const crownSegs = isMobile ? 5 : 8;
  offs.forEach((o, i) => {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(o.s, crownSegs, crownSegs), crownMats[i]);
    crown.position.set(o.x, o.y, o.z);
    crown.castShadow = !isMobile;
    g.add(crown);
  });
  return g;
}
