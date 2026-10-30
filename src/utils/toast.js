// Toasts live outside React so anything can raise one: components, RTK Query, plain utils.
//   toast.success('Document shared')
//   toast.error('Upload failed', { description: 'The file is larger than 25 MB.' })
const MAX_VISIBLE = 4
const EXIT_MS = 200
const DEFAULT_DURATION = { success: 2500, info: 3000, warning: 3500, error: 4000 }

let toasts = []
let nextId = 1
const listeners = new Set()

const emit = () => listeners.forEach((listener) => listener())

const set = (next) => {
  toasts = next
  emit()
}

const show = (variant, title, { description, duration } = {}) => {
  // The same message raised again (e.g. several requests failing at once) restarts the one already shown
  const existing = toasts.find((t) => t.variant === variant && t.title === title && t.description === description && !t.leaving)
  if (existing) {
    set(toasts.map((t) => (t === existing ? { ...t, key: nextId++ } : t)))
    return existing.id
  }

  const id = nextId++
  const item = { id, key: id, variant, title, description, duration: duration ?? DEFAULT_DURATION[variant], leaving: false }
  set([item, ...toasts].slice(0, MAX_VISIBLE))
  return id
}

const dismiss = (id) => {
  if (!toasts.some((t) => t.id === id && !t.leaving)) return
  set(toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
  setTimeout(() => set(toasts.filter((t) => t.id !== id)), EXIT_MS)
}

export const toast = {
  success: (title, options) => show('success', title, options),
  error: (title, options) => show('error', title, options),
  warning: (title, options) => show('warning', title, options),
  info: (title, options) => show('info', title, options),
  dismiss,
}

export const toastStore = {
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => toasts,
}
