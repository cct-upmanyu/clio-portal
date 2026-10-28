// Service worker: makes the portal installable and keeps the app shell available offline.
// API calls (/server/...) are never cached, so client data always comes fresh from the backend.
// Bump VERSION to drop old caches after a change to this file.
const VERSION = 'v1'
const CACHE = `portal-${VERSION}`
const SHELL = '/'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/server/')) return

  // Pages: network first so a new deploy shows straight away; offline (or a deep link the
  // host can't serve) falls back to the cached shell and the router takes over
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE).then((cache) => cache.put(SHELL, response.clone()))
          return response.ok ? response : caches.match(SHELL).then((cached) => cached || response)
        })
        .catch(() => caches.match(SHELL)),
    )
    return
  }

  // Vite's hashed build files never change, so the cached copy is always right
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
        return response
      })),
    )
    return
  }

  // Icons, manifest, etc.: serve the cached copy and refresh it in the background
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE).then((cache) => cache.put(request, response.clone()))
        return response
      })
      return cached || network
    }),
  )
})
