export function createAxes() {
  const g = new THREE.Group();
  const L = 8;

  const axes = [
    { d: new THREE.Vector3(1, 0, 0), c: 0xff6b35, l: 'x\u2081' },
    { d: new THREE.Vector3(0, 0, -1), c: 0x6bcb77, l: 'x\u2082' },
    { d: new THREE.Vector3(0, 1, 0), c: 0x5b9bd5, l: 'x\u2083' }
  ];

  axes.forEach(ax => {
    const arrow = new THREE.ArrowHelper(ax.d, new THREE.Vector3(0, 0, 0), L, ax.c, 0.3, 0.12);
    arrow.line.material.linewidth = 2;
    g.add(arrow);

    const cv = document.createElement('canvas');
    cv.width = 64; cv.height = 64;
    const cx = cv.getContext('2d');
    cx.fillStyle = '#' + ax.c.toString(16).padStart(6, '0');
    cx.font = 'bold 36px JetBrains Mono, monospace';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(ax.l, 32, 32);
    const tex = new THREE.CanvasTexture(cv);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sp.scale.set(0.5, 0.5, 1);
    sp.position.copy(ax.d.clone().multiplyScalar(L + 0.5));
    g.add(sp);
  });

  return g;
}
