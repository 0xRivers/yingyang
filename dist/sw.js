const root = self.registration.scope;
const prefix = 'ying-yang:' + new URL(root).pathname + ':';
const cacheName = prefix + 'v1';
const files = [
  'index.html', 'style.css', 'game.js', 'words.js', 'verify.js', 'pronunciation.js',
  'landscape.webp', 'pwa.js', 'manifest.webmanifest', 'icons/yin-yang.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch.png', 'icons/maskable.png'
];
const assets = new Set(files.map(file => new URL(file, root).href));
const index = new URL('index.html', root).href;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll([...assets].map(url => new Request(url, {cache: 'reload'})))
  ));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  url.hash = ''; url.search = '';
  const asset = url.href === root ? index : url.href;
  if (!assets.has(asset)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    if (['localhost','127.0.0.1','[::1]'].includes(url.hostname)) {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(asset, response.clone());
        return response;
      } catch { /* Local development falls back to the last cached build. */ }
    }
    return await cache.match(asset) || fetch(event.request);
  })());
});
