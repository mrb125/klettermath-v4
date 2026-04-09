// KletterMath Service Worker
// Cache-first for static assets, network-first for API calls

const CACHE = 'km4-v10';

const STATIC = [
  './',
  './index.html',
  './assets/welcome-bg.jpg',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/mission.css',
  './js/main.js',
  './js/state/store.js',
  './js/state/progress.js',
  './js/state/exam-mode.js',
  './js/ui/router.js',
  './js/ui/toast.js',
  './js/ui/mission-list.js',
  './js/ui/mission-view.js',
  './js/ui/tour-mode.js',
  './js/ui/badges-view.js',
  './js/ui/math-render.js',
  './js/ui/theory-panel.js',
  './js/data/missions.js',
  './js/data/platforms.js',
  './js/data/theory.js',
  './js/data/tasks-library.js',
  './js/data/erroneous.js',
  './js/math/vec3.js',
  './js/math/checks.js',
  './js/math/error-classifier.js',
  './js/scene/scene-manager.js',
  './js/scene/camera.js',
  './js/scene/colors.js',
  './js/scene/platforms.js',
  './js/scene/ropes.js',
  './js/scene/terrain.js',
  './js/scene/trees.js',
  './js/api/sync.js',
  './js/export/stl-model.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
  'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls: network-first, fall back to cached
  if (url.pathname.includes('/klettermath-dashboard/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Everything else: cache-first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});
