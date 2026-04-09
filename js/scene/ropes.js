import { PLATS } from '../data/platforms.js';
import { C } from './colors.js';

export function createRope(a, b) {
  const pa = PLATS[a], pb = PLATS[b];
  const start = new THREE.Vector3(pa.x, pa.z, -pa.y);
  const end = new THREE.Vector3(pb.x, pb.z, -pb.y);
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();

  const cylGeo = new THREE.CylinderGeometry(0.03, 0.03, len, 8);
  const ropeMat = new THREE.MeshStandardMaterial({ color: C.ROPE, roughness: 0.85, metalness: 0.05 });
  const cyl = new THREE.Mesh(cylGeo, ropeMat);
  cyl.castShadow = true;
  cyl.receiveShadow = true;

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  cyl.position.copy(mid);

  const q = new THREE.Quaternion();
  q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  cyl.quaternion.copy(q);

  const knotGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const knotMat = new THREE.MeshStandardMaterial({ color: C.ROPE, roughness: 0.7 });
  const k1 = new THREE.Mesh(knotGeo, knotMat);
  k1.position.copy(start);
  const k2 = new THREE.Mesh(knotGeo, knotMat);
  k2.position.copy(end);

  const group = new THREE.Group();
  group.add(cyl);
  group.add(k1);
  group.add(k2);
  group.userData = { a, b };
  return group;
}
