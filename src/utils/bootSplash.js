// The "Setting up your portal" splash lives in index.html so it shows before any JS runs.
// It stays up only while the portal loads: hidden as soon as the app has rendered and
// web fonts are ready, so the app doesn't appear in a fallback font.
const FADE_MS = 400

let hiding = false

export function hideBootSplash() {
  const splash = document.getElementById('boot-splash')
  if (!splash || hiding) return
  hiding = true

  const fonts = document.fonts?.ready ?? Promise.resolve()

  fonts.then(() => {
    // Two frames: let the browser paint the app (and Tailwind generate its styles) underneath first
    requestAnimationFrame(() => requestAnimationFrame(() => {
      splash.classList.add('is-hidden')
      setTimeout(() => splash.remove(), FADE_MS)
    }))
  })
}
