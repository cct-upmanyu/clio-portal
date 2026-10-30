import { useId } from 'react'
import Button from './Button'
import { useModalDialog } from '../../hooks/useModalDialog'

// Modal "are you sure?" built on the native <dialog>: focus is trapped inside,
// Escape and a click on the backdrop cancel (except while `loading`).
function ConfirmDialog({
  open, icon: Icon, title, children, confirmLabel, cancelLabel = 'Cancel', tone = 'danger',
  loading = false, loadingLabel, onConfirm, onCancel,
}) {
  const dialogRef = useModalDialog(open)
  const titleId = useId()
  const cancel = () => {
    if (!loading) onCancel()
  }

  const iconTone = tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-brand-soft text-brand'

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        cancel()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) cancel()
      }}
      className="m-auto w-[min(400px,calc(100vw-32px))] rounded-xl border border-line bg-white p-0 text-ink shadow-[0_24px_60px_rgba(10,31,61,0.24)] backdrop:bg-navy/50"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex gap-4">
          {Icon && (
            <span aria-hidden="true" className={`flex size-10 shrink-0 items-center justify-center rounded-full ${iconTone}`}>
              <Icon className="size-5" />
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            <h2 id={titleId} className="text-base font-semibold">{title}</h2>
            {children && <p className="text-sm leading-normal text-muted">{children}</p>}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={cancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {loading && loadingLabel ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
