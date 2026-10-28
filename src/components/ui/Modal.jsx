import { useId } from 'react'
import { useModalDialog } from '../../hooks/useModalDialog'
import { CloseIcon } from './icons'

const SIZES = {
  md: 'w-[min(480px,calc(100vw-32px))]',
  lg: 'w-[min(760px,calc(100vw-32px))]',
}

// Native <dialog> modal with a title bar, scrollable body and optional footer.
// Escape, the close button and a click on the backdrop all call onClose.
function Modal({ open, onClose, title, description, size = 'md', footer, children }) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className={`m-auto max-h-[calc(100dvh-32px)] rounded-xl border border-line bg-white p-0 text-ink shadow-[0_24px_60px_rgba(10,31,61,0.24)] backdrop:bg-navy/50 ${SIZES[size]}`}
    >
      <div className="flex max-h-[calc(100dvh-34px)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 id={titleId} className="truncate text-base font-semibold">{title}</h2>
            {description && <p className="text-[13px] text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink"
          >
            <CloseIcon className="size-[18px]" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-divider px-5 py-3">{footer}</div>}
      </div>
    </dialog>
  )
}

export default Modal
