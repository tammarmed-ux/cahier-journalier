/* Cahier journalier digital – service worker (cache-first, hors ligne) */
const CACHE = 'cahier-v28';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo.jpg',
  /* logo B « Cahier d’EPS » : noms de fichiers versionnés (-b) pour contourner les caches HTTP/iOS des anciennes icônes */
  './icons/logo-b.svg',
  './icons/logo-b-pdf.png',
  './icons/favicon-b.svg',
  './icons/favicon-b-32.png',
  './icons/favicon-b.ico',
  './icons/icon-b-192.png',
  './icons/icon-b-512.png',
  './icons/maskable-b-192.png',
  './icons/maskable-b-512.png',
  './icons/apple-touch-icon-b.png',
  './favicon.ico',
  './og-image-b.png',
  /* exports PDF : bibliothèques et polices locales (aucun CDN) */
  './cj-pdf.js',
  './vendor/jspdf.umd.min.js',
  './vendor/jspdf.plugin.autotable.min.js',
  './vendor/NotoSansArabic-Regular.ttf',
  './vendor/NotoSansArabic-Bold.ttf',
  './vendor/bidi-js.min.js'
];
/* autres polices arabes au choix (Paramètres) : mises en cache après l’installation, sans jamais la bloquer (aussi à la demande au premier usage) */
const FONT_ASSETS = ['Amiri', 'NotoNaskhArabic', 'Cairo', 'Tajawal'].reduce((a, f) => a.concat(['./vendor/' + f + '-Regular.ttf', './vendor/' + f + '-Bold.ttf']), []);
/* Firebase JS SDK (versioned, immutable files): cached on first successful fetch */
const SDK_PREFIX = 'https://www.gstatic.com/firebasejs/';
const SDK_FILES = ['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(f => SDK_PREFIX + '12.19.0/' + f);

/* installation : chaque fichier est téléchargé en contournant le cache HTTP du navigateur (cache: 'reload'),
   sinon une ancienne copie (ex. anciennes icônes servies avec max-age=3600) pourrait être recopiée dans le nouveau cache */
const fresh = u => new Request(u, { cache: 'reload' });
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(fresh))).then(() => self.skipWaiting()));
});
/* best effort, après l’activation (ne retarde jamais la mise à jour) : autres polices arabes + SDK de synchronisation */
function warmExtras() {
  return caches.open(CACHE).then(c => Promise.all(
    FONT_ASSETS.map(u => c.match(u).then(hit => hit || fetch(fresh(u)).then(r => r.ok ? c.put(u, r) : null)).catch(() => null))
      .concat(SDK_FILES.map(u => c.match(u).then(hit => hit || fetch(u, { mode: 'cors', cache: 'reload' }).then(r => r.ok ? c.put(u, r) : null)).catch(() => null)))
  ));
}

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('cahier-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => { warmExtras(); })
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
