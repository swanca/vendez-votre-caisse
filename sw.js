/* Service worker : jeu jouable hors ligne. Réseau d'abord (pour recevoir les mises à jour), cache en secours. */
const CACHE = "vvc-v4";
const FILES = ["./", "index.html", "manifest.json", "css/style.css", "js/data.js", "js/data2.js", "js/art.js", "js/engine.js", "js/sound.js", "js/ui.js", "js/main.js",
  "assets/franck-complet.mp3", "assets/franck-salut.mp3", "assets/voix/vache.mp3", "assets/voix/ane.mp3", "assets/voix/zebre.mp3", "assets/voix/cheval.mp3", "assets/voix/boeuf.mp3", "assets/icon-192.png", "assets/icon-512.png", "assets/apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || !e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
