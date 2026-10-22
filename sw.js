/* TATABO3 (cahier journalier digital) – service worker (hors ligne ; 1.29.1 : ouverture réseau d’abord, 3 s max, sinon copie locale) */
const CACHE = 'cahier-v29-2l';
/* 1.29.1 : préchargement réduit à l’essentiel du démarrage (installation rapide, même si iOS coupe l’app tôt) ;
   le reste (PDF, polices, grandes images) est mis en cache juste après l’activation, sans bloquer la mise à jour, et à la demande */
const ASSETS = [
  './index.html',   /* « ./ » = même page : servie depuis cette copie (pas de double téléchargement) */
  './manifest.webmanifest',
  './cj-crypto.js',   /* 1.29.0 : chiffrement local */
  './op2007-athle.js',   /* barèmes d’athlétisme OP 2007 */
  /* 1.29.1 (-h) : identité TATABO3 — nouveaux noms de fichiers (t3-…, tatabo3-…) pour contourner les caches HTTP/iOS des anciennes icônes */
  './icons/t3-mark.svg',
  './icons/tatabo3-wm-dark.svg',
  './icons/t3-favicon.svg',
  './icons/t3-icon-192.png',
  './icons/t3-apple-touch-180.png'
];
const LAZY_ASSETS = [
  './logo.jpg',
  './icons/t3-pdf.png',
  './icons/tatabo3-wm-light.svg',
  './icons/t3-favicon-32.png',
  './icons/t3-favicon.ico',
  './icons/t3-icon-512.png',
  './icons/t3-maskable-192.png',
  './icons/t3-maskable-512.png',
  './favicon.ico',
  './og-image-t3.png',
  /* exports PDF : bibliothèques et polices locales (aucun CDN) */
  './college.js',   /* 1.29.2 (j) : mode Collège, chargé après le démarrage */
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
  /* 1.29.1 : en cas d’échec (connexion coupée), le cache incomplet est supprimé ; l’ancienne version reste active, nouvel essai à la prochaine ouverture */
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(fresh))).then(() => self.skipWaiting(), e => caches.delete(CACHE).then(() => { throw e; })));
});
/* best effort, après l’activation (ne retarde jamais la mise à jour) : autres polices arabes + SDK de synchronisation */
function warmExtras() {
  return caches.open(CACHE).then(c => Promise.all(
    LAZY_ASSETS.concat(FONT_ASSETS).map(u => c.match(u).then(hit => hit || fetch(fresh(u)).then(r => r.ok ? c.put(u, r) : null)).catch(() => null))
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
  /* 1.29.1 : ouverture de l’application (navigation) — réseau d’abord, au plus ~3 s, sinon la copie locale (hors ligne ou réseau lent) */
  if (req.mode === 'navigate') {
    event.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')).then(hit => hit || caches.match('./'));
      const finish = r => { if (!done && r) { done = true; resolve(r); } };
      const timer = setTimeout(() => { fallback().then(hit => { if (hit) finish(hit); }); }, 3000);
      fetch(req, { cache: 'no-cache' }).then(res => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy.clone()).then(() => c.put('./', copy))).catch(() => null);
        }
        clearTimeout(timer);
        if (res && res.ok) finish(res); else fallback().then(hit => finish(hit || res));
      }).catch(() => { clearTimeout(timer); fallback().then(hit => finish(hit || Response.error())); });
    }));
    return;
  }
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
