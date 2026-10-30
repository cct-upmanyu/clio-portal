import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { toast, toastStore } from '../../utils/toast'
import { AlertIcon, CheckCircleIcon, CloseIcon, InfoIcon, WarningIcon } from './icons'

const VARIANTS = {
  success: { icon: CheckCircleIcon, textClass: 'text-success', lineClass: 'bg-success', label: 'Success' },
  error: { icon: AlertIcon, textClass: 'text-danger', lineClass: 'bg-danger', label: 'Error' },
  warning: { icon: WarningIcon, textClass: 'text-warning', lineClass: 'bg-warning', label: 'Warning' },
  info: { icon: InfoIcon, textClass: 'text-brand', lineClass: 'bg-brand', label: 'Notice' },
}

// Auto-dismisses after `duration`; hovering or focusing it pauses the timer and the progress bar
function ToastItem({ item }) {
  const { icon: Icon, textClass, lineClass, label } = VARIANTS[item.variant]
  const remaining = useRef(item.duration)
  const startedAt = useRef(0)
  const timer = useRef(null)
  const paused = useRef(false)

  const pause = () => {
    if (paused.current) return
    paused.current = true
    clearTimeout(timer.current)
    remaining.current -= Date.now() - startedAt.current
  }

  const resume = () => {
    paused.current = false
    startedAt.current = Date.now()
    clearTimeout(timer.current)
    timer.current = setTimeout(() => toast.dismiss(item.id), Math.max(remaining.current, 0))
  }

  // `key` changes when the same toast is raised again, restarting the timer
  useEffect(() => {
    remaining.current = item.duration
    paused.current = false
    startedAt.current = Date.now()
    timer.current = setTimeout(() => toast.dismiss(item.id), item.duration)
    return () => clearTimeout(timer.current)
  }, [item.id, item.key, item.duration])

  return (
    <div
      role={item.variant === 'error' ? 'alert' : 'status'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className={`toast group pointer-events-auto relative flex w-full items-start gap-2.5 overflow-hidden rounded-lg border border-line bg-white py-2.5 pl-3 pr-9 text-ink shadow-[0_8px_24px_rgba(10,31,61,0.14)] ${item.leaving ? 'toast-leave' : 'toast-enter'}`}
    >
      <Icon className={`mt-px size-[18px] shrink-0 ${textClass}`} />

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="sr-only">{label}:</span>
        <p className="text-[13px] font-semibold leading-5">{item.title}</p>
        {item.description && <p className="text-xs leading-[18px] text-muted">{item.description}</p>}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
        className="absolute right-1.5 top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-md text-ink/60 hover:bg-subtle hover:text-ink"
      >
        <CloseIcon className="size-3.5" />
      </button>

      <span
        key={item.key}
        aria-hidden="true"
        style={{ animationDuration: `${item.duration}ms` }}
        className={`toast-progress absolute inset-x-0 bottom-0 h-[3px] origin-left group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${lineClass}`}
      />
    </div>
  )
}

const topmostModal = () => [...document.querySelectorAll('dialog[open]')].filter((d) => d.matches(':modal')).at(-1) || document.body

// An open modal <dialog> sits above every z-index and makes the rest of the page inert, so toasts
// are rendered inside it while it's open (still position: fixed to the viewport, and clickable)
function useTopmostModal() {
  const [container, setContainer] = useState(() => topmostModal())

  useEffect(() => {
    // childList too: a dialog unmounted while still open never loses its `open` attribute
    const observer = new MutationObserver(() => setContainer(topmostModal()))
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open'] })
    return () => observer.disconnect()
  }, [])

  return container
}

function Toaster() {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot)
  const container = useTopmostModal()

  return createPortal(
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-[min(360px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2 max-sm:top-3"
    >
      {toasts.map((item) => <ToastItem key={item.id} item={item} />)}
    </section>,
    container,
  )
}

export default Toaster
