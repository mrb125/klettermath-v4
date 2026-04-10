import { load as loadState, getState, onMissionCompleted } from './state/store.js';
import { registerScreen, navigate, initNav, onNavigate } from './ui/router.js';
import { initToast } from './ui/toast.js';
import { PLATS } from './data/platforms.js';
import { getStoredCode, storeCode, validateCode, syncProgress } from './api/sync.js';

// ── Boot ──
document.addEventListener('DOMContentLoaded', async () => {
  const state = loadState();
  initToast();

  // Offline/online banner
  function updateOnlineStatus() {
    const banner = document.getElementById('offline-banner');
    if (!banner) return;
    if (navigator.onLine) {
      banner.classList.add('hidden');
    } else {
      banner.classList.remove('hidden');
    }
  }
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Register screens
  registerScreen('code',    document.getElementById('s-code'), () => startZiplineLoop());
  registerScreen('welcome', document.getElementById('s-welcome'), () => startZiplineLoop());
  registerScreen('park',    document.getElementById('s-park'), onParkShow);
  registerScreen('badges',  document.getElementById('s-badges'), onBadgesShow);

  // Navigation
  initNav();
  onNavigate(id => {
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.nav === id);
    });
  });

  // Auto-start zipline animation on welcome + code screens
  function startZiplineLoop() {
    document.getElementById('zipline-person')?.classList.add('active');
    document.getElementById('zipline-person-code')?.classList.add('active');
  }
  // Also start on page load (covers direct welcome entry)
  setTimeout(startZiplineLoop, 800);

  // Welcome buttons — just navigate (animation is already looping)
  function enterPark() {
    navigate('park');
  }
  document.getElementById('btn-enter').addEventListener('click', enterPark);
  const btnContinue = document.getElementById('btn-continue');
  if (btnContinue) btnContinue.addEventListener('click', enterPark);

  // Code entry
  const codeInput = document.getElementById('code-input');
  const codeError = document.getElementById('code-error');
  const btnSubmit = document.getElementById('btn-code-submit');

  async function trySubmitCode() {
    const code = (codeInput?.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 6) {
      codeError.textContent = 'Code muss genau 6 Zeichen haben.';
      codeError.classList.remove('hidden');
      return;
    }
    btnSubmit.disabled = true;
    btnSubmit.textContent = '…';
    const result = await validateCode(code);
    if (result.valid) {
      storeCode(code);
      codeError.classList.add('hidden');
      goToApp(state);
    } else {
      codeError.textContent = result.error || 'Ungültiger Code';
      codeError.classList.remove('hidden');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'WEITER';
    }
  }

  btnSubmit?.addEventListener('click', trySubmitCode);
  codeInput?.addEventListener('keydown', e => { if (e.key === 'Enter') trySubmitCode() });
  codeInput?.addEventListener('input', () => {
    codeInput.value = codeInput.value.toUpperCase();
  });

  // Start: check for ?code= URL param (from QR scan) or stored code
  const urlCode = new URLSearchParams(location.search).get('code')?.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (urlCode && urlCode.length === 6) {
    // Validate and store code from URL, then remove param from address bar
    history.replaceState(null, '', location.pathname);
    btnSubmit.disabled = true;
    const result = await validateCode(urlCode);
    if (result.valid) {
      storeCode(urlCode);
      goToApp(state);
    } else {
      if (codeInput) codeInput.value = urlCode;
      navigate('code');
      codeError.textContent = result.error || 'Ungültiger Code';
      codeError.classList.remove('hidden');
    }
    btnSubmit.disabled = false;
  } else if (getStoredCode()) {
    goToApp(state);
  } else {
    navigate('code');
  }

  // Sync after each completed mission
  onMissionCompleted(s => { syncProgress(s); updateTopBar(); });

  updateTopBar();
});

function goToApp(state) {
  if (state.progress.done.length > 0) {
    document.getElementById('btn-continue')?.classList.remove('hidden');
    navigate('park');
  } else {
    navigate('welcome');
  }
}

// ── Scene (lazy load) ──
let sceneInitialized = false;

function renderMapSVG() {
  const svg = document.getElementById('map-svg');
  if (!svg || svg.dataset.rendered) return;
  svg.dataset.rendered = '1';

  const PLATS = [
    { lbl: 'S', x: 0,  y: 0,  color: '#94a3b8', name: 'Start' },
    { lbl: 'A', x: 4,  y: 1,  color: '#e8a030', name: 'Adlerhorst' },
    { lbl: 'B', x: 8,  y: 3,  color: '#ff6b35', name: 'Brücke' },
    { lbl: 'G', x: -3, y: 6,  color: '#6bcb77', name: 'Gipfel' },
    { lbl: 'T', x: 6,  y: -4, color: '#5b9bd5', name: 'Trapez' },
    { lbl: 'H', x: -5, y: 8,  color: '#a78bfa', name: 'Hängenest' },
    { lbl: 'K', x: 5,  y: 9,  color: '#f472b6', name: 'Kletternetz' },
    { lbl: 'E', x: 10, y: -2, color: '#ffd166', name: 'Endstation' },
  ];
  const ROPES = [[0,1],[0,3],[1,2],[1,3],[2,4],[2,7],[3,4],[3,5],[4,6],[5,6],[6,7]];

  // Map math coords to SVG viewport (400x400), with padding 30
  const PAD = 30;
  const W = 400, H = 400;
  const xMin = -6, xMax = 11, yMin = -5, yMax = 10;
  const scaleX = (W - 2*PAD) / (xMax - xMin);
  const scaleY = (H - 2*PAD) / (yMax - yMin);

  function toSVG(mx, my) {
    return [
      PAD + (mx - xMin) * scaleX,
      H - PAD - (my - yMin) * scaleY   // flip Y so +y is up
    ];
  }

  let svgContent = '';

  // Coordinate grid (subtle)
  for (let gx = -5; gx <= 10; gx += 5) {
    const [sx] = toSVG(gx, 0);
    svgContent += `<line x1="${sx}" y1="${PAD}" x2="${sx}" y2="${H-PAD}" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
    svgContent += `<text x="${sx}" y="${H-PAD+12}" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.3)">${gx}</text>`;
  }
  for (let gy = -5; gy <= 10; gy += 5) {
    const [, sy] = toSVG(0, gy);
    svgContent += `<line x1="${PAD}" y1="${sy}" x2="${W-PAD}" y2="${sy}" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>`;
    svgContent += `<text x="${PAD-8}" y="${sy+3}" text-anchor="end" font-size="8" fill="rgba(255,255,255,0.3)">${gy}</text>`;
  }

  // Axes
  const [ox, oy] = toSVG(0, 0);
  svgContent += `<line x1="${PAD}" y1="${oy}" x2="${W-PAD}" y2="${oy}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`;
  svgContent += `<line x1="${ox}" y1="${PAD}" x2="${ox}" y2="${H-PAD}" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>`;

  // Ropes
  ROPES.forEach(([a, b]) => {
    const [x1, y1] = toSVG(PLATS[a].x, PLATS[a].y);
    const [x2, y2] = toSVG(PLATS[b].x, PLATS[b].y);
    svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(200,163,90,0.7)" stroke-width="2" stroke-dasharray="4,3"/>`;
  });

  // Platforms
  PLATS.forEach(p => {
    const [cx, cy] = toSVG(p.x, p.y);
    // Glow circle
    svgContent += `<circle cx="${cx}" cy="${cy}" r="11" fill="${p.color}" opacity="0.2"/>`;
    // Main circle
    svgContent += `<circle cx="${cx}" cy="${cy}" r="7" fill="${p.color}" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>`;
    // Label inside
    svgContent += `<text x="${cx}" y="${cy+3}" text-anchor="middle" font-size="7" font-weight="bold" fill="#1a1612">${p.lbl}</text>`;
    // Name below
    svgContent += `<text x="${cx}" y="${cy+18}" text-anchor="middle" font-size="6.5" fill="rgba(255,255,255,0.75)" font-weight="600">${p.name}</text>`;
  });

  svg.innerHTML = svgContent;
}

async function onParkShow() {
  updateTopBar();
  if (!sceneInitialized) {
    sceneInitialized = true;
    const { initScene } = await import('./scene/scene-manager.js');
    initScene(document.getElementById('park-canvas'));
  }
  // Camera preset buttons (inject once)
  if (!document.getElementById('cam-presets')) {
    const bar = document.createElement('div');
    bar.id = 'cam-presets';
    bar.className = 'cam-presets';
    bar.innerHTML = `
      <button class="cam-btn" data-preset="top" title="Draufsicht">⬆</button>
      <button class="cam-btn" data-preset="front" title="Vorne">👁</button>
      <button class="cam-btn" data-preset="side" title="Seite">↔</button>
      <button class="cam-btn" data-preset="default" title="Standard">⌂</button>
    `;
    document.querySelector('.canvas-pane')?.appendChild(bar);
    bar.addEventListener('click', e => {
      const btn = e.target.closest('.cam-btn');
      if (!btn) return;
      import('./scene/scene-manager.js').then(m => m.setCameraPreset(btn.dataset.preset));
    });
  }
  // Map overlay toggle (inject once)
  if (!document.getElementById('map-toggle-btn')) {
    const btn = document.createElement('button');
    btn.id = 'map-toggle-btn';
    btn.className = 'cam-btn map-toggle-btn';
    btn.title = 'Park-Karte';
    btn.innerHTML = '🗺️';
    btn.style.marginTop = '8px';
    document.getElementById('cam-presets')?.appendChild(btn);

    btn.addEventListener('click', () => {
      const overlay = document.getElementById('map-overlay');
      if (!overlay) return;
      const isShown = overlay.style.display !== 'none';
      overlay.style.display = isShown ? 'none' : 'flex';
      btn.classList.toggle('active', !isShown);
      if (!isShown) renderMapSVG();
    });
  }
  // Load mission list
  const { renderMissionList } = await import('./ui/mission-list.js');
  renderMissionList();
  // Init glossar sidebar
  const { initGlossar } = await import('./ui/theory-panel.js');
  initGlossar();

  // Tab switching: Karte ↔ Liste
  document.querySelectorAll('.pane-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.pane-tab').forEach(b => b.classList.toggle('active', b === btn));
      if (tab === 'map') {
        showMapMode();
      } else {
        document.getElementById('map-pane').style.display = 'none';
        document.getElementById('mission-pane').style.display = 'block';
      }
    });
  });

  // Always reset SVG rendered-flag so re-entering park refreshes markers
  const _svg = document.getElementById('map-pane-svg');
  if (_svg) delete _svg.dataset.rendered;

  // Show map mode (tabs + map, hide mission content)
  showMapMode();

  // km-back-to-map: switch back to map after mission complete / back button
  if (!window._kmMapListenerAdded) {
    window._kmMapListenerAdded = true;
    document.addEventListener('km-back-to-map', () => showMapMode());
  }
}

async function onBadgesShow() {
  const { renderBadges } = await import('./ui/badges-view.js');
  renderBadges();
}

// ── Interactive Map Pane ──
// Pixel positions (in 400×400 SVG space) are mapped visually to park-map.jpg
// They match the hand-drawn platform locations, NOT the raw math coordinates.
const MAP_PLATS = [
  { id: 0, lbl: 'S', cx: 148, cy: 253, color: '#94a3b8', name: 'Start' },
  { id: 1, lbl: 'A', cx: 224, cy: 228, color: '#e8a030', name: 'Adlerhorst' },
  { id: 2, lbl: 'B', cx: 290, cy: 184, color: '#ff6b35', name: 'Brücke' },
  { id: 3, lbl: 'G', cx: 100, cy: 128, color: '#6bcb77', name: 'Gipfel' },
  { id: 4, lbl: 'T', cx: 236, cy: 336, color: '#5b9bd5', name: 'Trapez' },
  { id: 5, lbl: 'H', cx:  56, cy:  76, color: '#a78bfa', name: 'Hängenest' },
  { id: 6, lbl: 'K', cx: 244, cy:  52, color: '#f472b6', name: 'Kletternetz' },
  { id: 7, lbl: 'E', cx: 340, cy: 296, color: '#ffd166', name: 'Endstation' },
];
const MAP_ROPES = [[0,1],[0,3],[1,2],[1,3],[2,4],[2,7],[3,4],[3,5],[4,6],[5,6],[6,7]];

export function showMapMode() {
  document.querySelector('.pane-tabs')?.style.setProperty('display', 'flex');
  document.getElementById('map-pane').style.display = 'flex';
  document.getElementById('mission-pane').style.display = 'none';
  document.querySelectorAll('.pane-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === 'map'));
  const svg = document.getElementById('map-pane-svg');
  if (svg) delete svg.dataset.rendered;
  renderMapPane();
}

export function showMissionMode() {
  document.querySelector('.pane-tabs')?.style.setProperty('display', 'none');
  document.getElementById('map-pane').style.display = 'none';
  document.getElementById('mission-pane').style.display = 'block';
}

export function renderMapPane() {
  const svg = document.getElementById('map-pane-svg');
  if (!svg || svg.dataset.rendered) return;
  svg.dataset.rendered = '1';

  let html = '';

  // Rope lines between platform positions
  MAP_ROPES.forEach(([a, b]) => {
    const pa = MAP_PLATS[a], pb = MAP_PLATS[b];
    html += `<line x1="${pa.cx}" y1="${pa.cy}" x2="${pb.cx}" y2="${pb.cy}" stroke="rgba(200,150,60,0.75)" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
  });

  // Platform markers (clickable)
  MAP_PLATS.forEach((p) => {
    html += `
      <g class="map-plat" data-plat-id="${p.id}" style="cursor:pointer" role="button" tabindex="0" aria-label="${p.name}">
        <circle cx="${p.cx}" cy="${p.cy}" r="15" fill="${p.color}" opacity="0.22" class="map-plat__pulse"/>
        <circle cx="${p.cx}" cy="${p.cy}" r="10" fill="${p.color}" stroke="rgba(255,255,255,0.85)" stroke-width="1.5"/>
        <text x="${p.cx}" y="${p.cy + 4}" text-anchor="middle" font-size="9" font-weight="bold" fill="#111" pointer-events="none">${p.lbl}</text>
        <text x="${p.cx}" y="${p.cy + 22}" text-anchor="middle" font-size="7.5" fill="rgba(255,255,255,0.9)" font-weight="600" pointer-events="none">${p.name}</text>
      </g>`;
  });

  svg.innerHTML = html;

  // Update completion status
  import('./state/store.js').then(({ isDone }) => {
    MAP_PLATS.forEach((p) => {
      const g = svg.querySelector(`[data-plat-id="${p.id}"]`);
      if (!g) return;
      const done = isDone(p.id + 1); // mission IDs = platform index + 1
      if (done) {
        const circles = g.querySelectorAll('circle');
        circles[1]?.setAttribute('stroke', '#4caf50');
        circles[1]?.setAttribute('stroke-width', '2.5');
        const check = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        check.setAttribute('x', p.cx + 7);
        check.setAttribute('y', p.cy - 8);
        check.setAttribute('font-size', '10');
        check.setAttribute('fill', '#4caf50');
        check.setAttribute('pointer-events', 'none');
        check.textContent = '✓';
        g.appendChild(check);
      }
    });
  });

  // Click handlers — open mission
  svg.querySelectorAll('.map-plat').forEach(g => {
    const platId = parseInt(g.dataset.platId);
    const missionId = platId + 1;

    const activate = () => {
      showMissionMode();
      import('./ui/mission-view.js').then(mod => mod.renderMission(missionId));
      import('./scene/scene-manager.js').then(m => m.highlightPlatforms([platId])).catch(() => {});
    };

    g.addEventListener('click', activate);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });
}

// ── Top Bar ──
export function updateTopBar() {
  const state = getState();
  if (!state) return;
  const done = state.progress.done.length;
  const total = 17;
  const pct = Math.round((done / total) * 100);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = pct + '%';
  const lbl = document.getElementById('progress-label');
  if (lbl) lbl.textContent = `${done}/${total}`;
  const xp = document.getElementById('top-xp');
  if (xp) xp.textContent = `${state.progress.xp} XP`;
  const streak = document.getElementById('top-streak');
  if (streak) {
    const s = state.progress.streak || 0;
    streak.textContent = `🔥 ${s}`;
    streak.style.opacity = s > 0 ? '1' : '0.4';
  }
}
