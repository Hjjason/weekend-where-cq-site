const CACHE_NAME = "weekend-app-demo-v11";
const APP_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20260626a",
  "./app.js?v=20260626a",
  "./manifest.webmanifest",
  "./data/places.json",
  "./data/places.js?v=20260626a",
  "./data/weather.json",
  "./data/weather.js?v=20260626a"
];

async function putInCache(request, response) {
  if (!response || !response.ok) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fresh = fetch(request)
    .then(async (response) => {
      await putInCache(request, response);
      return response;
    })
    .catch(() => cached);

  return cached || fresh;
}

async function networkFirstWithTimeout(request, timeoutMs = 1600) {
  const cache = await caches.open(CACHE_NAME);
  const fallback = async () => (await cache.match(request)) || (await cache.match("./index.html"));
  const timedFallback = new Promise((resolve) => {
    setTimeout(async () => resolve(await fallback()), timeoutMs);
  });
  const fresh = fetch(request)
    .then(async (response) => {
      await putInCache(request, response);
      return response;
    })
    .catch(fallback);

  return Promise.race([fresh, timedFallback]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_ASSETS.map((asset) => cache.add(asset))))
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

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirstWithTimeout(event.request));
    return;
  }

  if (url.pathname.endsWith("/data/places.json") || url.pathname.endsWith("/data/weather.json")) {
    event.respondWith(networkFirstWithTimeout(event.request, 2500));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
