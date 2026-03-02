const CACHE = "china-trip-0.14";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((resp) => {
        // cache update for same-origin
        const url = new URL(req.url);
        if (url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
      // offline-first for navigation
      if (req.mode === "navigate") return cached || fetchPromise;
      return cached || fetchPromise;
    })
  );
});
