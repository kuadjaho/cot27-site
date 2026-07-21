// Service worker COT27 — consultation hors ligne (§5.3 du cahier des
// spécifications : « indispensable en salle de conférence saturée »).
//
// Stratégie volontairement simple et sûre :
//  - navigations : réseau d'abord, cache en secours (dernière version vue) ;
//  - assets statiques /_next/static : cache d'abord (immuables par nature) ;
//  - le programme et l'accueil sont pré-chargés dans le cache à l'install.

const VERSION = "cot27-v1";
const PRECACHE = ["/fr", "/en", "/fr/programme", "/en/programme"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Jamais de cache sur l'API ni sur l'admin.
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Assets fingerprintés : cache d'abord.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Navigations : réseau d'abord, cache en secours.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(`/${request.url.includes("/en") ? "en" : "fr"}/programme`))
        )
    );
  }
});
