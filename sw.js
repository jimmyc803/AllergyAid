// Relative URLs also support GitHub Pages installations under /AllergyAid/.
const CACHE_NAME = "allergy-aid-v2";
const OFFLINE_URL = new URL("offline.html", self.registration.scope).href;
const SHELL = [
  "offline.html",
  "css/site.css",
  "js/site.js",
  "images/allergyaid-app-icon.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          SHELL.map((path) => new URL(path, self.registration.scope).href),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("allergy-aid-") && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  // Fetch menu data from the network; don't silently serve an old allergen guide offline.
  if (url.pathname.endsWith(".json")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(event.request)) || Response.error();
      }
    })(),
  );
});
