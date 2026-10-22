// ECA service worker — offline support. Bump VERSION to force clients to refresh the cache.
const VERSION = "eca-v1";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
const CDN = [
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    // external libs: best effort (opaque responses are fine for <script>/<link>)
    await Promise.allSettled(CDN.map(u => fetch(new Request(u, { mode: "no-cors" })).then(r => c.put(u, r))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // The app page: network first (so updates arrive), cache fallback (so it works offline)
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(rej, 4000))]);
        if (res && res.ok) { const c = await caches.open(VERSION); c.put("./index.html", res.clone()); }
        return res;
      } catch (_) {
        return (await caches.match("./index.html")) || (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  // Everything else: cache first, refresh in background
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const net = fetch(req).then(async res => {
      if (res && (res.ok || res.type === "opaque")) { const c = await caches.open(VERSION); c.put(req, res.clone()); }
      return res;
    }).catch(() => null);
    return cached || (await net) || Response.error();
  })());
});
