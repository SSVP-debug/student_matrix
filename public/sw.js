/* student_matrix offline-first service worker.
   The build injects the complete asset manifest as self.__WB_MANIFEST.
   API requests and cross-origin requests are intentionally never cached. */
const CACHE_PREFIX = 'student_matrix-';
const CACHE = 'student_matrix-v3';
const STATIC_CACHE = `${CACHE}-static`;
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/data/quests.json',
  '/data/flashcards.json',
  ...(self.__WB_MANIFEST || []).map((entry) => typeof entry === 'string' ? entry : entry.url),
].filter((url, index, all) => url && all.indexOf(url) === index);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Cloud API calls must never be cached; stale AI responses are misleading and unsafe.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', copy)));
        }
        return response;
      }).catch(async () => {
        const shell = await caches.match('/index.html');
        if (shell) return shell;
        return new Response('The app has not been installed for offline use yet. Connect once and reload.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
    );
    return;
  }

  // Cache-first for same-origin static assets. Never let a cache miss throw a blank response.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
      return cached || network.catch(() => new Response('', { status: 504, statusText: 'Offline asset not cached' }));
    })
  );
});
