const CACHE_NAME = "weekend-app-demo-v9";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20260623b",
  "./app.js?v=20260623b",
  "./manifest.webmanifest",
  "./data/places.json",
  "./data/places.js?v=20260623b",
  "./data/weather.json",
  "./data/weather.js?v=20260623b",
  "./assets/apple-touch-icon.png",
  "./assets/zhaomushan.jpg",
  "./assets/guangyang-island.jpg",
  "./assets/tieshanping.jpg",
  "./assets/jinyun-camp.jpg",
  "./assets/kids-indoor.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const pathname = new URL(event.request.url).pathname;
  if (pathname.endsWith("/data/places.json") || pathname.endsWith("/data/weather.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
