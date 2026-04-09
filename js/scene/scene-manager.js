import { PLATS, ROPES } from '../data/platforms.js';
import { createTerrain, SimplexNoise } from './terrain.js';
import { buildPlatform } from './platforms.js';
import { createRope } from './ropes.js';
import { createAxes } from './camera.js';
import { createTree } from './trees.js';

let renderer, scene, camera, controls;
let platMeshes = [];
let ropeMeshes = [];
let animId = null;

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

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
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

  // Platforms
  PLATS.forEach((p, idx) => {
    const mesh = buildPlatform(p, idx);
    scene.add(mesh);
    platMeshes.push(mesh);
  });

  // Ropes
  ROPES.forEach(([a, b]) => {
    const rope = createRope(a, b);
    scene.add(rope);
    ropeMeshes.push(rope);
  });

  // Animate
  function animate() {
    animId = requestAnimationFrame(animate);
    controls.update();

    // Pulse indicators
    const t = Date.now() * 0.003;
    platMeshes.forEach(m => {
      if (m.userData.indicator) {
        m.userData.indicator.scale.setScalar(0.8 + Math.sin(t + m.userData.platId) * 0.2);
      }
    });

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

// ── Overlay API ──
let vectorArrows = [];
let userPoints = [];
let planeMesh = null;

export function addVectorArrow(ox, oy, oz, dx, dy, dz, color = 0x00ff88) {
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
  return addVectorArrow(a.x, a.y, a.z, b.x - a.x, b.y - a.y, b.z - a.z, color || 0x00ff88);
}

export function clearVectorArrows() {
  vectorArrows.forEach(a => { if (a && scene) scene.remove(a) });
  vectorArrows.length = 0;
}

export function placeUserPoint(x, y, z, label, color = 0x00ff88) {
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
  platMeshes.forEach(m => {
    const isHighlighted = ids.includes(m.userData.platId);
    if (m.userData.indicator) {
      m.userData.indicator.material.emissiveIntensity = isHighlighted ? 1.2 : 0.3;
      m.userData.indicator.scale.setScalar(isHighlighted ? 1.2 : 0.8);
    }
  });
}

export function clearHighlights() {
  highlightPlatforms([]);
}

export function dispose() {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) renderer.dispose();
  renderer = null;
  scene = null;
}
