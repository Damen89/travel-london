// Service worker: l'app funziona offline dopo la prima apertura.
// Le mattonelle della mappa già viste restano in cache (max ~3000).
const VERSION = "londra-v3";
const SHELL = [
  "./", "index.html", "config.js", "data.js", "tube.js", "manifest.json",
  "vendor/leaflet.js", "vendor/leaflet.css",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];
const TILES = "londra-tiles";
const MAX_TILES = 3000;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VERSION && k !== TILES).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

async function trimTiles() {
  const c = await caches.open(TILES);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - MAX_TILES; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Mattonelle OpenStreetMap: prima la cache, poi la rete
  if (url.hostname === "tile.openstreetmap.org") {
    e.respondWith(caches.open(TILES).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      try {
        const r = await fetch(e.request);
        if (r.ok) { c.put(e.request, r.clone()); trimTiles(); }
        return r;
      } catch { return new Response("", { status: 504 }); }
    }));
    return;
  }

  // File dell'app: rete se disponibile (così gli aggiornamenti arrivano), altrimenti cache
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => {
      if (r.ok) { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
  }
});
