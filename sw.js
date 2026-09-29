/* Cahier journalier digital – service worker (cache-first, hors ligne) */
const CACHE = 'cahier-v19';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-192.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  /* exports PDF : bibliothèques et polices locales (aucun CDN) */
  './cj-pdf.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js',
  './vendor/NotoSansArabic-Regular.ttf',
  './vendor/NotoSansArabic-Bold.ttf'
];
/* Firebase JS SDK (versioned, immutable files): cached on first successful fetch */
const SDK_PREFIX = 'https://www.gstatic.com/firebasejs/';
const SDK_FILES = ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => SDK_PREFIX + '12.19.0/' + f);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).then(() =>
    /* best effort: pre-cache the sync SDK; never blocks installation */
    Promise.all(SDK_FILES.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok ? c.put(u, r) : null).catch(() => null)))
  )).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('cahier-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.url.startsWith(SDK_PREFIX)) {
    event.respondWith(
      caches.match(req.url).then(hit => hit || fetch(req).then(res => {
        if (res && res.ok && (res.type === 'cors' || res.type === 'basic')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req.url, copy));
        }
        return res;
      }))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => req.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    })
  );
});
