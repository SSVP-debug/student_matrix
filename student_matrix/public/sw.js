/* student_matrix service worker: makes the app work with no connection.
   - Same-origin GET requests only (nothing is ever sent to third parties).
   - App shell + data are cached on first visit; later visits use the cache first and refresh it quietly. */
const CACHE = 'student_matrix-v2';
const PRECACHE = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg', '/data/quests.json', '/data/flashcards.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // Page navigations: network first, fall back to the cached shell (single-page app).
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { caches.open(CACHE).then((c) => c.put('/index.html', r.clone())); return r; }).catch(() => caches.match('/index.html')));
    return;
  }

  // Everything else: cache first, update in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((r) => { if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    })
  );
});
