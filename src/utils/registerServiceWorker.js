// Registers the PWA service worker. Production only: in dev it would cache Vite's modules
// and serve stale code.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.error('Service worker registration failed', error))
  })
}
