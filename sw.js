const CACHE_NAME = 'finans-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './icon.svg',
  './manifest.json',
  './UX%20Design/background.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cache hit or network fallback
        return response || fetch(event.request);
      })
  );
});
