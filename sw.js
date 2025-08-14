const CACHE_NAME = 'allergy-aid-v2'; // ← CHANGE VERSION NUMBER
const urlsToCache = [
  '/',
  '/index.html',
  '/css/home.css',
  '/css/navbar.css',
  '/js/home.js',
  '/images/allergyaid-app-icon.png',
  '/images/food-safety.jpg'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // ← ADD THIS LINE
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // ← DELETE OLD CACHES
          }
        })
      );
    })
  );
  clients.claim(); // ← ADD THIS LINE
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});