import { useEffect } from 'react'

// Calls onDismiss on a click outside `ref` or on Escape, while `active` is true
export function useDismiss(ref, active, onDismiss) {
  useEffect(() => {
    if (!active) return
    const handlePointer = (e) => {
      if (!ref.current?.contains(e.target)) onDismiss()
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [ref, active, onDismiss])
}
