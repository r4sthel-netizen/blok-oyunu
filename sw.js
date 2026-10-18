// Blopu offline cache. The whole game is a handful of files: keep them all, answer from the cache at once
// and refresh it in the background, so the game opens instantly and also works with no connection.
const CACHE = 'blopu-a728ccf944';
const FILES = ["./", "index.html", "android.html", "iphone.html", "tanitim.html", "qr-android.svg", "qr-iphone.svg", "kur.css", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "fonts/XRXI3I6Li01BKofiOc5wtlZ2di8HDBImdTo3j77e.woff2", "fonts/XRXV3I6Li01BKofIMeaBXso.woff2", "fonts/XRXV3I6Li01BKofINeaB.woff2", "fonts/XRXV3I6Li01BKofIO-aBXso.woff2", "fonts/XRXV3I6Li01BKofIOOaBXso.woff2", "fonts/XRXV3I6Li01BKofIOuaBXso.woff2", "fonts/fonts.css", "fonts/i7dPIFZ9Zz-WBtRtedDbYE98RWq7.woff2", "fonts/i7dPIFZ9Zz-WBtRtedDbYEF8RQ.woff2"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const nav = req.mode === 'navigate';
    if (nav) {   // pages: fresh copy when online (so updates show at once), the cached one when offline or slow
      const fresh = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
      const late = new Promise(res => setTimeout(res, 3000, null));
      const r = await Promise.race([fresh, late]);
      if (r && r.ok) return r;
      return (await c.match(req, { ignoreSearch: true })) || (await fresh) || (await c.match('./')) || Response.error();
    }
    const hit = await c.match(req, { ignoreSearch: nav });
    const net = fetch(req).then(r => { if (r && r.ok && r.type === 'basic') c.put(req, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (nav && await c.match('./')) || Response.error();
  }));
});
