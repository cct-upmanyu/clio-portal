import { WarningIcon } from '../ui/icons'

// A problem the user can't fix by editing the form (e.g. a disabled account)
function FormAlert({ title, message }) {
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3 max-sm:px-3">
      <WarningIcon className="mt-px size-5 shrink-0 text-warning" />
      <div className="flex flex-col gap-0.5 text-sm leading-normal">
        <strong className="font-semibold text-ink">{title}</strong>
        <span className="text-ink">{message}</span>
      </div>
    </div>
  )
}

export default FormAlert
