const STYLES = {
  Open: 'bg-success-soft text-success',
  Pending: 'bg-warning-soft text-warning',
  Closed: 'bg-subtle text-muted',
}

function StatusPill({ status, size = 'sm', dot = false }) {
  const sizing = size === 'md' ? 'h-7 px-3 text-[13px]' : 'h-[22px] px-2 text-xs'

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ${sizing} ${STYLES[status] ?? STYLES.Open}`}>
      {dot && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {status}
    </span>
  )
}

export default StatusPill
