// Blopu offline cache. The whole game is a handful of files: keep them all, answer from the cache at once
// and refresh it in the background, so the game opens instantly and also works with no connection.
const CACHE = 'blopu-0ac3943e1e';
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/favicon-32.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "fonts/XRXI3I6Li01BKofiOc5wtlZ2di8HDBImdTo3j77e.woff2", "fonts/XRXV3I6Li01BKofIMeaBXso.woff2", "fonts/XRXV3I6Li01BKofINeaB.woff2", "fonts/XRXV3I6Li01BKofIO-aBXso.woff2", "fonts/XRXV3I6Li01BKofIOOaBXso.woff2", "fonts/XRXV3I6Li01BKofIOuaBXso.woff2", "fonts/fonts.css", "fonts/i7dPIFZ9Zz-WBtRtedDbYE98RWq7.woff2", "fonts/i7dPIFZ9Zz-WBtRtedDbYEF8RQ.woff2"];
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
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const hit = await c.match(key, { ignoreSearch: req.mode === 'navigate' });
    const net = fetch(req).then(r => { if (r && r.ok && r.type === 'basic') c.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (await c.match('index.html')) || Response.error();
  }));
});
