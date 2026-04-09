import { SimplexNoise } from './terrain.js';

const simplex = new SimplexNoise();

function createBarkTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#4a3a2a';
  ctx.fillRect(0, 0, 256, 256);
  const img = ctx.getImageData(0, 0, 256, 256), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const idx = i / 4, x = idx % 256, y = Math.floor(idx / 256);
    const n = simplex.noise(x * 0.08, y * 0.12) * 40;
    d[i] = Math.min(255, d[i] + n);
    d[i + 1] = Math.max(0, d[i + 1] - n);
    d[i + 2] = Math.max(0, d[i + 2] - n * 0.5);
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

export function createTree(x, z, height, trunkR) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const bark = new THREE.MeshStandardMaterial({ map: createBarkTexture(), color: 0x5a4a3a, roughness: 0.95 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkR * 0.7, trunkR, height, 8), bark);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  g.add(trunk);

  const cols = [0x2d5a1e, 0x3a7a2a, 0x4a8a3a, 0x2a6a2a, 0x4a9a4a];
  const offs = [
    { x: 0, y: height + 1.2, z: 0, s: 1.2 },
    { x: -0.6, y: height + 0.8, z: 0.3, s: 0.9 },
    { x: 0.6, y: height + 0.8, z: 0.3, s: 0.9 },
    { x: 0.2, y: height + 1.5, z: -0.5, s: 0.85 },
    { x: -0.3, y: height + 1.3, z: 0.6, s: 0.8 }
  ];
  offs.forEach((o, i) => {
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(o.s, 12, 12),
      new THREE.MeshStandardMaterial({ color: cols[i], roughness: 0.7 })
    );
    crown.position.set(o.x, o.y, o.z);
    crown.castShadow = true;
    g.add(crown);
  });
  return g;
}
