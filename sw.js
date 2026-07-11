// =======================================================================
// sw.js — Service worker de Alcanza (PWA).
// - App shell: stale-while-revalidate (sirve del caché al instante, se
//   actualiza en segundo plano). Funciona offline.
// - Datos de Supabase: network-first con fallback a caché, así offline se
//   ven las últimas promos que se cargaron.
// - Fuentes de Google: cacheadas en runtime.
// Al publicar cambios importantes, subí VERSION para forzar la limpieza del
// caché viejo.
// =======================================================================

const VERSION = "alcanza-v10";

const SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./manifest.webmanifest",
  "./js/main.js",
  "./js/config.js",
  "./js/store.js",
  "./js/state.js",
  "./js/format.js",
  "./js/promos.js",
  "./js/data.js",
  "./js/ui/render.js",
  "./js/ui/theme.js",
  "./js/ui/tour.js",
  "./js/ui/tween.js",
  "./js/ui/toast.js",
  "./js/ui/modal.js",
  "./js/ui/share.js",
  "./js/ui/feedback.js",
  "./js/ui/tooltip.js",
  "./js/ui/ioshint.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Datos de Supabase: network-first, fallback a caché (últimas promos offline).
  if (url.hostname.endsWith("supabase.co")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Fuentes de Google: cache-first con actualización en segundo plano.
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    event.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req)
          .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
          .catch(() => cached);
        return cached || net;
      })
    );
    return;
  }

  // App shell y mismo origen: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req)
          .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
          .catch(() => cached || caches.match("./index.html"));
        return cached || net;
      })
    );
    return;
  }
});