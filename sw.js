const CACHE_NAME = 'allergy-aid-v1';
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});