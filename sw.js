// Lucky Farm service worker.
// - The game page is always fetched fresh (falls back to the saved copy when offline).
// - Libraries with a fixed version in their address (3D engine, Firebase, fonts) are kept on the phone,
//   so from the second launch on they load instantly instead of being downloaded again.
// - Live game data (Firebase database / sign-in) is never touched.
// - Shows the "hasadın hazır" push notifications sent by netlify/functions/harvest-push.mjs.
const CACHE = "lucky-v48", LIBS = "lucky-libs-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"])).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== LIBS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const isLib = u =>
  (u.hostname === "cdn.jsdelivr.net" && /@\d/.test(u.pathname)) ||
  (u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/")) ||
  u.hostname === "fonts.gstatic.com" || u.hostname === "fonts.googleapis.com";
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("/", copy)); return r; }).catch(() => caches.match("/")));
    return;
  }
  let u; try { u = new URL(req.url); } catch (err) { return; }
  if (!isLib(u)) return;
  e.respondWith(caches.open(LIBS).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }))));
});

// harvest notifications: the push carries no data, the text is written here
self.addEventListener("push", e => {
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    if (list.some(c => c.visibilityState === "visible" && c.focused)) return;   // already playing: no need to ring
    return self.registration.showNotification("Lucky Farm", {
      body: "🌾 Hasadın hazır! Ekinlerin toplanmayı bekliyor.", icon: "/icon-192.png", badge: "/badge-96.png",
      tag: "harvest", renotify: true, vibrate: [80, 40, 80], data: { url: "/" } });
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const c = list.find(w => new URL(w.url).origin === self.location.origin);
    return c ? c.focus() : self.clients.openWindow("/");
  }));
});
