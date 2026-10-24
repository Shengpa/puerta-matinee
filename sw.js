// Guarda la app y sus librerías para que abra aunque no haya señal en el club.
// Los datos los maneja Firestore (tiene su propia cola offline).
const CACHE = "puerta-v8";
const SHELL = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "logo.png"];
const CDN = /^https:\/\/(www\.gstatic\.com\/firebasejs|cdnjs\.cloudflare\.com)\//;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === location.origin;
  if (!same && !CDN.test(req.url)) return; // Firestore/Auth van directo a la red

  if (req.mode === "navigate") { // la página: primero red (para recibir cambios), si no hay, la guardada
    e.respondWith(fetch(req.url, {cache: "no-cache"}).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
