// ECA service worker — offline support. Bump VERSION to force clients to refresh the cache.
const VERSION = "eca-v13";
const SHELL = [
  "./", "./index.html", "./manifest.json",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png",
  "./img/eca-mark.png", "./img/eca-logo.jpg",
  "./img/pieces/lichess/wK.svg", "./img/pieces/lichess/wQ.svg", "./img/pieces/lichess/wR.svg", "./img/pieces/lichess/wB.svg", "./img/pieces/lichess/wN.svg", "./img/pieces/lichess/wP.svg",
  "./img/pieces/lichess/bK.svg", "./img/pieces/lichess/bQ.svg", "./img/pieces/lichess/bR.svg", "./img/pieces/lichess/bB.svg", "./img/pieces/lichess/bN.svg", "./img/pieces/lichess/bP.svg",
  // ملفات الكود (لازم نفس ?v= اللي في index.html)
  "./tailwind.css?v=eca-v13",
  "./js/core.js?v=eca-v13", "./js/arena.js?v=eca-v13", "./js/extras.js?v=eca-v13", "./js/streaks.js?v=eca-v13", "./js/today.js?v=eca-v13", "./js/reports.js?v=eca-v13", "./js/tournaments.js?v=eca-v13", "./js/review.js?v=eca-v13", "./js/quality.js?v=eca-v13", "./js/announce.js?v=eca-v13", "./js/progress.js?v=eca-v13", "./js/firebase.js?v=eca-v13",
  "./puzzles.js?v=eca-v13"   // عشان الامتحان يشتغل أوفلاين
];
const CDN = [
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
];
// Live data that must never be served from cache (Firebase, Lichess API, news proxy)
const NO_CACHE_HOSTS = [
  "firestore.googleapis.com", "identitytoolkit.googleapis.com", "securetoken.googleapis.com",
  "www.googleapis.com", "apis.google.com", "accounts.google.com",
  "api.allorigins.win"
];
const isLive = url => NO_CACHE_HOSTS.includes(url.hostname)
  || url.hostname.endsWith(".firebaseapp.com")
  || (url.hostname === "lichess.org" && url.pathname.startsWith("/api/"));

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    // one missing file must not break the whole install
    await Promise.allSettled(SHELL.map(u => c.add(u)));
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
  if (isLive(url)) return;            // let the browser go straight to the network

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
