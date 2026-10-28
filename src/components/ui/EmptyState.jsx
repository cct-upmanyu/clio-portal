import { CheckCircleIcon } from './icons'

function EmptyState({ icon: Icon = CheckCircleIcon, title, children }) {
  return (
    <div className="flex min-h-[168px] flex-col items-center justify-center gap-2 px-2 py-6 text-center">
      <span aria-hidden="true" className="mb-1 flex size-10 items-center justify-center rounded-full bg-subtle text-body">
        <Icon className="size-5" />
      </span>
      <span className="text-sm font-semibold">{title}</span>
      {children && <p className="max-w-[320px] text-[13px] leading-normal text-muted">{children}</p>}
    </div>
  )
}

export default EmptyState
