/* Service Worker – Offline-Betrieb der statischen App.
 * Cached ausschließlich GET-Anfragen derselben Herkunft für statische Ressourcen (HTML, JS, CSS, Schriften, Bilder).
 * Es werden KEINE Formulardaten, KEINE POST-Anfragen und KEINE Fremdursprünge gespeichert.
 * Die App sendet ohnehin keine personenbezogenen Daten über das Netzwerk. */
const CACHE = 'aschke-beratung-static-v1';
const STATIC_EXT = /\.(?:js|css|woff2?|png|webp|svg|ico|webmanifest|html)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.search) return; // nie Anfragen mit Query-Parametern cachen
  const isNav = req.mode === 'navigate';
  if (!isNav && !STATIC_EXT.test(url.pathname)) return;
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match('./index.html')),
    ),
  );
});
