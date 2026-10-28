import { useEffect, useRef } from 'react'

// Opens/closes a native <dialog> as a modal to match `open`; returns its ref
export function useModalDialog(open) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return dialogRef
}
