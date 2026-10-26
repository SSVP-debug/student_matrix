/* Student Matrix offline-first service worker.
 * VitePWA injects built asset URLs into self.__WB_MANIFEST.
 * API and cross-origin requests are intentionally never cached.
 */
const CACHE_PREFIX = 'student_matrix-';
const CACHE_VERSION = 'v4';
const STATIC_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}-static`;

const manifestAssets = (self.__WB_MANIFEST || []).map((entry) =>
  typeof entry === 'string' ? entry : entry.url
);

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/data/quests.json',
  '/data/flashcards.json',
  ...manifestAssets,
].filter((url, index, all) => url && all.indexOf(url) === index);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // Cache each asset independently. A single optional/missing file must not
    // abort the entire service-worker installation and leave the app offline-less.
    const results = await Promise.allSettled(PRECACHE.map(async (path) => {
      const request = new Request(path, { cache: 'reload' });
      const response = await fetch(request);
      if (!response.ok) throw new Error(`Precache failed: ${path} (${response.status})`);
      await cache.put(request, response);
    }));

    const failed = results
      .map((result, index) => ({ result, path: PRECACHE[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failed.length) {
      console.warn('[Student Matrix SW] Some assets were not cached:', failed.map(({ path }) => path));
    }

    // The worker should still activate so cached routes and successfully
    // cached assets remain available; verify core JS/CSS precaching in tests.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never cache API requests: this prevents stale cloud-AI or account responses.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(STATIC_CACHE);
          await cache.put('/index.html', response.clone());
        }
        return response;
      } catch {
        const shell = await caches.match('/index.html');
        if (shell) return shell;
        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LearnAI offline</title></head><body style="font-family:system-ui;padding:2rem"><h1>LearnAI is not cached yet</h1><p>Connect to the internet, open the app once, wait for it to finish loading, then reload before going offline.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);

    // Cache-first for static resources. Refresh a cached response in the
    // background, with rejection handled so offline requests do not leak errors.
    if (cached) {
      event.waitUntil(fetch(request).then(async (response) => {
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(STATIC_CACHE);
          await cache.put(request, response.clone());
        }
      }).catch(() => {}));
      return cached;
    }

    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      // Return a visible error instead of an empty 504 response, which often
      // makes a failed dynamic import look like a completely white page.
      if (request.destination === 'script') {
        return new Response('console.error("This LearnAI script was not cached before going offline. Reconnect and reload the app once.");', {
          status: 200,
          headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
        });
      }
      return new Response('Offline: this resource was not cached. Reconnect and reload the app once.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
