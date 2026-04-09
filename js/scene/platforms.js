import { SimplexNoise } from './terrain.js';
import { C } from './colors.js';

const simplex = new SimplexNoise();

function createWoodTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(256, 256), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const idx = i / 4, x = idx % 256, y = Math.floor(idx / 256);
    const dist = Math.hypot(x - 128, y - 128);
    const ring = Math.sin(dist * 0.05) * 50 + 100;
    const grain = simplex.noise(x * 0.1, y * 0.05) * 30;
    const v = Math.floor(ring + grain);
    d[i] = Math.min(255, v + 50);
    d[i + 1] = Math.min(255, v + 20);
    d[i + 2] = Math.max(0, v - 30);
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

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

// Shared materials (created once)
let wood, bark, leaf, ropeMat;
function getMaterials() {
  if (!wood) {
    wood = new THREE.MeshStandardMaterial({ map: createWoodTexture(), color: 0x8b6f47, roughness: 0.7 });
    bark = new THREE.MeshStandardMaterial({ map: createBarkTexture(), color: 0x5a4a3a, roughness: 0.95 });
    leaf = new THREE.MeshStandardMaterial({ color: 0x3a7a2a, roughness: 0.7 });
    ropeMat = new THREE.MeshStandardMaterial({ color: C.ROPE, roughness: 0.9 });
  }
  return { wood, bark, leaf, ropeMat };
}

function buildParkObject(idx, g, p) {
  const { wood, bark, leaf, ropeMat } = getMaterials();
  const h = Math.max(p.z, 0.4);
  const gy = -p.z; // local y of ground

  if (idx === 0) {
    // S: Start — Eingangsbogen
    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8), bark);
    post1.position.set(-0.3, gy + 0.45, 0); post1.castShadow = true; g.add(post1);
    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9, 8), bark);
    post2.position.set(0.3, gy + 0.45, 0); post2.castShadow = true; g.add(post2);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), wood);
    beam.rotation.z = Math.PI / 2; beam.position.set(0, gy + 0.9, 0); beam.castShadow = true; g.add(beam);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.15, 0.03), new THREE.MeshStandardMaterial({ color: 0x2a6a1a, roughness: 0.6 }));
    sign.position.set(0, gy + 0.75, 0.05); g.add(sign);
  } else if (idx === 1) {
    // A: Adlerhorst — Baumhaus
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h + 0.6, 8), bark);
    trunk.position.y = gy + (h + 0.6) / 2; trunk.castShadow = true; g.add(trunk);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 0.08, 10), wood);
    plat.position.y = -0.05; plat.castShadow = true; g.add(plat);
    [[-0.3, 0.15, 0], [0.3, 0.15, 0], [0, 0.15, -0.3], [0, 0.15, 0.3]].forEach(c => {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), wood);
      r.position.set(c[0], c[1], c[2]); g.add(r);
    });
    [[0, 0.5, 0, 0.5], [-0.3, 0.4, 0.2, 0.35], [0.3, 0.35, -0.2, 0.35]].forEach(c => {
      const cr = new THREE.Mesh(new THREE.SphereGeometry(c[3], 8, 8), leaf);
      cr.position.set(c[0], c[1], c[2]); cr.castShadow = true; g.add(cr);
    });
  } else if (idx === 2) {
    // B: Brücke — Hängebrücke
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h + 0.5, 8), bark);
    p1.position.set(-0.35, gy + (h + 0.5) / 2, 0); p1.castShadow = true; g.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h + 0.5, 8), bark);
    p2.position.set(0.35, gy + (h + 0.5) / 2, 0); p2.castShadow = true; g.add(p2);
    for (let i = -3; i <= 3; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.3), wood);
      plank.position.set(i * 0.09, -0.05 - Math.abs(i) * 0.02, 0); plank.castShadow = true; g.add(plank);
    }
    const rail1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6), ropeMat);
    rail1.rotation.z = Math.PI / 2; rail1.position.set(0, 0.2, 0.15); g.add(rail1);
    const rail2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 6), ropeMat);
    rail2.rotation.z = Math.PI / 2; rail2.position.set(0, 0.2, -0.15); g.add(rail2);
  } else if (idx === 3) {
    // G: Gipfel — Kreuzung mit dickem Stamm
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, h + 0.8, 8), bark);
    trunk.position.y = gy + (h + 0.8) / 2; trunk.castShadow = true; g.add(trunk);
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 12), wood);
    plat.position.y = -0.05; plat.castShadow = true; g.add(plat);
    [[0.4, 0, 0], [-0.2, 0, 0.35], [-0.2, 0, -0.35]].forEach(c => {
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.12), wood);
      br.position.set(c[0], -0.03, c[2]); g.add(br);
    });
    const cr = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), leaf);
    cr.position.y = 0.5; cr.castShadow = true; g.add(cr);
  } else if (idx === 4) {
    // T: Trapez — Aussichtsturm
    const pillar = new THREE.MeshStandardMaterial({ color: 0x6a5a4a, roughness: 0.8 });
    [[-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2]].forEach(c => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h + 0.3, 6), pillar);
      leg.position.set(c[0], gy + (h + 0.3) / 2, c[2]); leg.castShadow = true; g.add(leg);
    });
    for (let y = 0; y < Math.floor(h); y++) {
      const str = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.02, 0.02), pillar);
      str.position.set(0, gy + 0.5 + y, 0.2); g.add(str);
      const str2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.44), pillar);
      str2.position.set(0.2, gy + 0.5 + y, 0); g.add(str2);
    }
    const plat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.7), wood);
    plat.position.y = -0.05; plat.castShadow = true; g.add(plat);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x8a4a2a, roughness: 0.7 }));
    roof.position.y = 0.35; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
  } else if (idx === 5) {
    // H: Hängenest — Hütte
    const bh = Math.max(h * 0.7, 0.5);
    const hut = new THREE.Mesh(new THREE.BoxGeometry(0.5, bh, 0.4), wood);
    hut.position.y = gy + bh / 2; hut.castShadow = true; g.add(hut);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.25, 4), new THREE.MeshStandardMaterial({ color: 0x8a3a2a, roughness: 0.7 }));
    roof.position.y = gy + bh + 0.12; roof.rotation.y = Math.PI / 4; g.add(roof);
    const red = new THREE.MeshStandardMaterial({ color: 0xee2222, emissive: 0xee2222, emissiveIntensity: 0.4 });
    const cv1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.02), red);
    cv1.position.set(0, gy + bh * 0.6, 0.21); g.add(cv1);
    const ch1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.02), red);
    ch1.position.set(0, gy + bh * 0.6, 0.21); g.add(ch1);
  } else if (idx === 6) {
    // K: Kletternetz — Kletterwand
    const bh = Math.max(h, 0.8);
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.7, bh, 0.1), new THREE.MeshStandardMaterial({ color: 0x7a7a6a, roughness: 0.9 }));
    wall.position.y = gy + bh / 2; wall.castShadow = true; g.add(wall);
    const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffaa22, 0xff44ff, 0x44ffff, 0xffff44, 0xff8844];
    for (let i = 0; i < 8; i++) {
      const grip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.5 }));
      grip.scale.set(1, 0.5, 1);
      grip.position.set(-0.25 + Math.random() * 0.5, gy + 0.15 + i * (bh * 0.1), 0.06);
      g.add(grip);
    }
  } else {
    // E: Endstation — Seilbahn-Mast
    const metal = new THREE.MeshStandardMaterial({ color: 0x5a5a6a, roughness: 0.4, metalness: 0.8 });
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, h + 0.6, 8), metal);
    mast.position.y = gy + (h + 0.6) / 2; mast.castShadow = true; g.add(mast);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), metal);
    arm.rotation.z = Math.PI / 2; arm.position.y = 0.1; arm.castShadow = true; g.add(arm);
    const seil = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.8, 4), ropeMat);
    seil.rotation.z = Math.PI / 2; seil.position.y = 0.12; g.add(seil);
    const gondel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.1), new THREE.MeshStandardMaterial({ color: 0xdd4422, roughness: 0.5 }));
    gondel.position.set(0.15, 0.0, 0); gondel.castShadow = true; g.add(gondel);
    const hang = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    hang.position.set(0.15, 0.06, 0); g.add(hang);
  }
}

export function buildPlatform(p, idx) {
  const g = new THREE.Group();
  buildParkObject(idx, g, p);

  // Find top Y for indicator placement
  let topY = 0.3;
  g.children.forEach(child => {
    let cy = child.position.y || 0;
    if (child.geometry) {
      child.geometry.computeBoundingBox();
      const bb = child.geometry.boundingBox;
      if (bb) cy += bb.max.y * (child.scale.y || 1);
    }
    if (cy > topY) topY = cy;
  });
  const indY = topY + 0.35;

  // Indicator sphere
  const indGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const indMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.color),
    emissive: new THREE.Color(p.color),
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.6
  });
  const ind = new THREE.Mesh(indGeo, indMat);
  ind.position.y = indY;
  ind.castShadow = true;
  g.add(ind);

  // Label sprite
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 64;
  const cx = cv.getContext('2d');
  cx.fillStyle = 'rgba(26,22,20,0.8)';
  cx.beginPath();
  cx.roundRect(4, 4, 248, 56, 10);
  cx.fill();
  cx.fillStyle = p.color;
  cx.font = 'bold 26px Nunito,sans-serif';
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  cx.fillText(`${p.name} (${p.x}|${p.y}|${p.z})`, 128, 32);
  const tex = new THREE.CanvasTexture(cv);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sp.scale.set(1.8, 0.5, 1);
  sp.position.set(0, indY + 0.35, 0);
  g.add(sp);

  // Position in scene coordinates
  g.position.set(p.x, p.z, -p.y);
  g.userData = { platId: idx, baseColor: p.color, indicator: ind };
  return g;
}
