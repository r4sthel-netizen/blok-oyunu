// The old offline copy of the game: remove it, so this address only shows the moving page from now on.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  await Promise.all((await caches.keys()).map(k => caches.delete(k)));
  await self.registration.unregister();
  (await self.clients.matchAll({ type: 'window' })).forEach(c => c.navigate(c.url).catch(() => {}));
})()));
