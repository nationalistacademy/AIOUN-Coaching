/* AIOU Coaching offline app shell. LMS/auth routes are deliberately excluded. */
const VERSION = 'aiou-coaching-pwa-v1';
const CORE = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/theme.css',
  './css/brand.css',
  './js/pwa.js',
  './js/ui.js',
  './js/tools.js',
  './js/hub.js'
];
const SCOPE = new URL(self.registration.scope);
const withinScope = url => url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
const isLms = url => /\/lms(?:\/|$)/i.test(url.pathname);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE.map(path => new URL(path, SCOPE).href))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('aiou-coaching-pwa-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!withinScope(url) || isLms(url) || url.pathname.includes('/auth/')) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh.ok && fresh.type === 'basic') {
          const cache = await caches.open(VERSION);
          cache.put(req, fresh.clone()).catch(() => {});
        }
        return fresh;
      } catch (_) {
        const cache = await caches.open(VERSION);
        const exact = await cache.match(req, {ignoreSearch:true});
        if (exact) return exact;
        const clean = new URL(url.pathname, url.origin);
        const saved = await cache.match(clean.href, {ignoreSearch:true});
        return saved || cache.match(new URL('./offline.html', SCOPE).href);
      }
    })());
    return;
  }
  if (url.pathname.startsWith(SCOPE.pathname)) {
    event.respondWith(caches.match(req).then(cached => {
      const network = fetch(req).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(VERSION).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return response;
      });
      return cached || network.catch(() => Response.error());
    }));
  }
});
