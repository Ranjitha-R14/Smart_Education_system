const CACHE = "sep-app-v4";
const CORE = ["./","index.html","login.html","css/style.css","js/app.js","js/pwa.js","manifest.webmanifest",
  "student/dashboard.html","student/attendance.html","student/events.html","student/doubts.html",
  "student/counseling.html","student/password.html","faculty/index.html",
  "images/icon-192.png","images/icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// stale-while-revalidate: opens instantly offline, refreshes in the background
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
