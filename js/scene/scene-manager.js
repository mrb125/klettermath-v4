import { PLATS, ROPES } from '../data/platforms.js';
import { createTerrain, SimplexNoise } from './terrain.js';
import { buildPlatform } from './platforms.js';
import { createRope } from './ropes.js';
import { createAxes } from './camera.js';
import { createTree } from './trees.js';
import { C } from './colors.js';

let renderer, scene, camera, controls;
let platMeshes = [];
let ropeMeshes = [];
let animId = null;
let liveArrow = null;
let landmarkGroup = null;
let ziplinePerson = null;

// Math coordinates (x,y,z) → THREE.js (x, z, -y)
export function mathToScene(x, y, z) {
  return new THREE.Vector3(x, z, -y);
}

export function initScene(canvas) {
  if (renderer) return; // already initialized

  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;
  canvas.width = w;
  canvas.height = h;

  // Mobile detection — iPad / iPhone / Android
  const isMobile = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent));

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isMobile;  // no shadows on mobile → big speedup
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = isMobile ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;

  // Scene
  scene = new THREE.Scene();
  const fogCol = 0x2a2218;
  scene.background = new THREE.Color(fogCol);
  scene.fog = new THREE.FogExp2(fogCol, 0.035);

  // Camera
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(12, 9, 14);

  // Controls
  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(3.5, 2.5, 2);
  controls.maxDistance = 30;
  controls.minDistance = 3;
  controls.update();

  // Lights
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x3a2a1a, 0.5));
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.0);
  sun.position.set(10, 15, 8);
  sun.castShadow = !isMobile;
  sun.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0001;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.2));
  const pt = new THREE.PointLight(0xe8a030, 0.4, 15);
  pt.position.set(3.5, 5, 3.5);
  scene.add(pt);

  // Terrain
  scene.add(createTerrain());

  // Trees
  [
    { x: -2, z: -2, h: 4.5, r: 0.3 },
    { x: 9, z: -1, h: 4, r: 0.25 },
    { x: -1, z: 8, h: 5, r: 0.32 },
    { x: 10, z: 7, h: 4.2, r: 0.26 },
    { x: 5, z: -2, h: 4.8, r: 0.28 },
    { x: -2, z: 5, h: 4.6, r: 0.27 }
  ].forEach(t => scene.add(createTree(t.x, t.z, t.h, t.r)));

  // Grid
  const grid = new THREE.GridHelper(20, 20, 0x3a3228, 0x2e2820);
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  scene.add(grid);

  // Axes
  scene.add(createAxes());

  // Platforms — hidden until a mission activates them
  PLATS.forEach((p, idx) => {
    const mesh = buildPlatform(p, idx);
    mesh.visible = false;
    scene.add(mesh);
    platMeshes.push(mesh);
  });

  // Ropes — hidden until a mission activates them
  ROPES.forEach(([a, b]) => {
    const rope = createRope(a, b);
    rope.visible = false;
    scene.add(rope);
    ropeMeshes.push(rope);
  });

  // Landmarks — always visible reference points
  initLandmarks();

  // Zipline person — always visible ambient animation
  initZiplinePerson();

  // Precompute zipline direction for person facing
  const _zipDir = ZIP_TO.clone().sub(ZIP_FROM).normalize();
  const _zipAngle = Math.atan2(_zipDir.z, _zipDir.x);

  // Animate
  function animate() {
    animId = requestAnimationFrame(animate);
    controls.update();

    const now = Date.now();

    // Pulse indicators
    const pulse = now * 0.003;
    platMeshes.forEach(m => {
      if (m.userData.indicator) {
        m.userData.indicator.scale.setScalar(0.8 + Math.sin(pulse + m.userData.platId) * 0.2);
      }
    });

    // Zipline person: ping-pong S→A
    if (ziplinePerson) {
      const cycle = (now % (ZIP_DURATION * 2)) / ZIP_DURATION; // 0..2
      const tRaw = cycle <= 1 ? cycle : 2 - cycle;
      const t = tRaw < 0.5 ? 2*tRaw*tRaw : 1 - 2*(1-tRaw)*(1-tRaw);
      const pos = ZIP_FROM.clone().lerp(ZIP_TO, t);
      ziplinePerson.position.set(pos.x, pos.y - 0.95, pos.z);
      const swing = Math.sin(now * 0.0028) * 0.07 * Math.sin(Math.PI * t);
      ziplinePerson.rotation.z = swing;
      ziplinePerson.rotation.y = cycle <= 1 ? _zipAngle : _zipAngle + Math.PI;
    }

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  const onResize = () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
  new ResizeObserver(onResize).observe(canvas.parentElement);
}

// ── Zipline Person ──
const ZIP_FROM = mathToScene(0, 0, 0);   // S → scene (0,0,0)
const ZIP_TO   = mathToScene(4, 1, 3);   // A → scene (4,3,-1)
const ZIP_DURATION = 7000;

// Capsule polyfill for Three.js r128 (no CapsuleGeometry available)
function makeCapsule(r, h, mat) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), mat));
  const topCap = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
  topCap.position.y = h / 2;
  g.add(topCap);
  const botCap = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
  botCap.position.y = -h / 2;
  g.add(botCap);
  return g;
}

function buildZiplinePerson() {
  const g = new THREE.Group();
  const skin  = new THREE.MeshStandardMaterial({ color: 0xe0a876, roughness: 0.8 });
  const helmt = new THREE.MeshStandardMaterial({ color: 0xc8833a, roughness: 0.4, metalness: 0.2 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x4a7a5a, roughness: 0.7 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: 0.8 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd4a030, roughness: 0.3, metalness: 0.7 });
  const rope  = new THREE.MeshStandardMaterial({ color: 0x8b6034, roughness: 0.9 });

  // Pulley
  const pulley = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), metal);
  pulley.rotation.z = Math.PI / 2;
  pulley.position.set(0, 0.95, 0);
  g.add(pulley);
  // Connecting rope
  const connRope = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 5), rope);
  connRope.position.set(0, 0.88, 0);
  g.add(connRope);
  // Arms (CylinderGeometry instead of CapsuleGeometry)
  for (const side of [-1, 1]) {
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), metal.clone());
    grip.position.set(side * 0.11, 0.84, 0);
    g.add(grip);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.30, 6), skin);
    arm.position.set(side * 0.19, 0.65, 0);
    arm.rotation.z = -side * 0.55;
    g.add(arm);
  }
  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), skin);
  head.position.set(0, 0.55, 0);
  g.add(head);
  // Helmet
  const helmBody = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 6, 0, Math.PI*2, 0, Math.PI/2), helmt);
  helmBody.position.set(0, 0.57, 0);
  g.add(helmBody);
  const helmBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.21, 0.05, 10), helmt);
  helmBrim.position.set(0, 0.54, 0);
  g.add(helmBrim);
  // Body
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.30, 8), shirt);
  body.position.set(0, 0.24, 0);
  g.add(body);
  // Harness
  const harness = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 5, 10), metal);
  harness.position.set(0, 0.10, 0);
  harness.rotation.x = Math.PI / 2;
  g.add(harness);
  // Legs + boots
  for (const side of [-1, 1]) {
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.26, 6), pants);
    upper.position.set(side * 0.085, -0.12, 0);
    upper.rotation.z = side * 0.12;
    g.add(upper);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.22, 6), pants);
    lower.position.set(side * 0.10, -0.38, 0.03);
    lower.rotation.z = side * 0.08;
    g.add(lower);
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 }));
    boot.position.set(side * 0.11, -0.50, 0.04);
    g.add(boot);
  }
  // Backpack
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.20, 0.10), new THREE.MeshStandardMaterial({ color: 0x2a5a3a, roughness: 0.8 }));
  pack.position.set(0, 0.28, -0.16);
  g.add(pack);
  return g;
}

function initZiplinePerson() {
  const pts = [ZIP_FROM.clone(), ZIP_TO.clone()];
  const wireMat = new THREE.LineBasicMaterial({ color: 0xb08040, linewidth: 1, transparent: true, opacity: 0.55 });
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  ziplinePerson = buildZiplinePerson();
  ziplinePerson.position.copy(ZIP_FROM);
  ziplinePerson.position.y -= 0.95;
  scene.add(ziplinePerson);
}

// ── Overlay API ──
let vectorArrows = [];
let userPoints = [];
let planeMesh = null;

export function addVectorArrow(ox, oy, oz, dx, dy, dz, color = C.CORRECT_ARROW) {
  if (!scene) return null;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 0.01) return null;

  const g = new THREE.Group();
  const shaftLen = len * 0.8;
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, metalness: 0.3 });

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, shaftLen, 6), mat);
  shaft.position.y = shaftLen / 2;
  g.add(shaft);

  const head = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.12, len * 0.2, 8), mat);
  head.position.y = shaftLen + len * 0.1;
  g.add(head);

  const sceneDir = new THREE.Vector3(dx, dz, -dy).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(sceneDir.dot(up)) > 0.999) {
    if (sceneDir.y < 0) g.rotation.z = Math.PI;
  } else {
    g.quaternion.setFromUnitVectors(up, sceneDir);
  }

  g.position.set(ox, oz, -oy);
  scene.add(g);
  vectorArrows.push(g);
  return g;
}

export function addPlatArrow(fromIdx, toIdx, color) {
  const a = PLATS[fromIdx], b = PLATS[toIdx];
  return addVectorArrow(a.x, a.y, a.z, b.x - a.x, b.y - a.y, b.z - a.z, color || C.CORRECT_ARROW);
}

export function clearVectorArrows() {
  vectorArrows.forEach(a => { if (a && scene) scene.remove(a) });
  vectorArrows.length = 0;
}

export function placeUserPoint(x, y, z, label, color = C.CORRECT_ARROW) {
  if (!scene) return;
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, metalness: 0.5, roughness: 0.2 })
  );
  const g = new THREE.Group();
  g.add(sphere);
  g.position.set(x, z, -y);
  scene.add(g);
  userPoints.push(g);
}

export function clearUserPoints() {
  userPoints.forEach(p => { if (p && scene) scene.remove(p) });
  userPoints.length = 0;
}

export function highlightPlatforms(ids) {
  // Only show platforms relevant to this mission
  platMeshes.forEach(m => {
    m.visible = ids.includes(m.userData.platId);
    if (m.visible && m.userData.indicator) {
      m.userData.indicator.material.emissiveIntensity = 1.2;
      m.userData.indicator.scale.setScalar(1.2);
    }
  });
  // Only show ropes between the highlighted platforms
  ropeMeshes.forEach((m, i) => {
    const rope = ROPES[i];
    m.visible = !!(rope && ids.includes(rope[0]) && ids.includes(rope[1]));
  });
}

export function clearHighlights() {
  platMeshes.forEach(m => { m.visible = false; });
  ropeMeshes.forEach(m => { m.visible = false; });
}

// Show all platforms one by one (no ropes) — used for Ortsvektor overview
export function animateAllPlatforms(delayMs = 380) {
  // Hide everything first
  platMeshes.forEach(m => { m.visible = false; });
  ropeMeshes.forEach(m => { m.visible = false; });

  platMeshes.forEach((m, i) => {
    setTimeout(() => {
      m.visible = true;
      if (m.userData.indicator) {
        m.userData.indicator.material.emissiveIntensity = 1.0;
      }
    }, i * delayMs);
  });
}

export function setCameraPreset(name) {
  if (!camera || !controls) return;
  const presets = {
    map:     { pos: [3.5, 18, 3],    target: [3.5, 0, 2] },
    top:     { pos: [3.5, 22, 0.01], target: [3.5, 0, 0] },
    front:   { pos: [3.5, 4, 20],    target: [3.5, 4, 0] },
    side:    { pos: [22, 4, 2],      target: [3.5, 4, 2] },
    default: { pos: [12, 9, 14],     target: [3.5, 2.5, 2] },
  };
  const p = presets[name] || presets.default;
  camera.position.set(...p.pos);
  controls.target.set(...p.target);
  controls.update();
}

export function showLiveVector(ox, oy, oz, dx, dy, dz) {
  if (!scene) return;
  // Remove previous live arrow
  if (liveArrow) { scene.remove(liveArrow); liveArrow = null; }

  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if (len < 0.01) return;

  // Semi-transparent amber preview
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffa726,
    emissive: 0xffa726,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.65,
    metalness: 0.2,
  });

  const shaftLen = len * 0.8;
  const g = new THREE.Group();

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, shaftLen, 6), mat);
  shaft.position.y = shaftLen / 2;
  g.add(shaft);

  const head = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.14, len * 0.2, 8), mat);
  head.position.y = shaftLen + len * 0.1;
  g.add(head);

  const sceneDir = new THREE.Vector3(dx, dz, -dy).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  if (Math.abs(sceneDir.dot(up)) > 0.999) {
    if (sceneDir.y < 0) g.rotation.z = Math.PI;
  } else {
    g.quaternion.setFromUnitVectors(up, sceneDir);
  }
  g.position.set(ox, oz, -oy);

  scene.add(g);
  liveArrow = g;
}

export function clearLiveVector() {
  if (liveArrow && scene) { scene.remove(liveArrow); liveArrow = null; }
}


function initLandmarks() {
  if (landmarkGroup) return;
  landmarkGroup = new THREE.Group();

  const landmarks = [
    { x: 0, y: 0, z: 0, lbl: 'S', coord: '(0|0|0)' },
    { x: -3, y: 6, z: 5, lbl: 'G', coord: '(-3|6|5)' },
    { x: 6, y: -4, z: 7, lbl: 'T', coord: '(6|-4|7)' },
  ];

  landmarks.forEach(({ x, y, z, lbl, coord }) => {
    // mathToScene: THREE pos = (x, z, -y)
    const pos = new THREE.Vector3(x, z, -y);

    // Small grey sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        emissive: 0x444444,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.7,
      })
    );
    sphere.position.copy(pos);
    landmarkGroup.add(sphere);

    // Text sprite using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, 128, 48);
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = 'rgba(200,200,200,0.85)';
    ctx.textAlign = 'center';
    ctx.fillText(lbl, 64, 20);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = 'rgba(160,160,160,0.7)';
    ctx.fillText(coord, 64, 38);

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(pos);
    sprite.position.y += 0.5; // float above sphere
    sprite.scale.set(1.2, 0.45, 1);
    landmarkGroup.add(sprite);
  });

  scene.add(landmarkGroup);
}

export function dispose() {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) renderer.dispose();
  renderer = null;
  scene = null;
}
