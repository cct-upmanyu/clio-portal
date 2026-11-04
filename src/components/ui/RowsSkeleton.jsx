const WIDTHS = [58, 72, 46, 64, 52]

// Placeholder rows while a list loads. `lead`: 'icon' (a task's status circle) or 'date' (a meeting's
// date tile); `pills`: badges on the right (a task's priority and status).
function RowsSkeleton({ rows = 4, lead = 'icon', pills = 0, label }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <ul aria-hidden="true" className="flex flex-col divide-y divide-divider">
        {WIDTHS.slice(0, rows).map((width, i) => (
          <li key={i} className="flex items-start gap-3 py-3.5 max-sm:gap-2.5">
            {lead === 'date'
              ? <span className="size-12 shrink-0 animate-pulse rounded-[10px] bg-subtle" />
              : <span className="mt-0.5 size-5 shrink-0 animate-pulse rounded-full bg-line" />}
            <span className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
              <span className="h-3 animate-pulse rounded-full bg-line" style={{ width: `${width}%` }} />
              <span className="h-2.5 animate-pulse rounded-full bg-subtle" style={{ width: `${width - 18}%` }} />
              <span className="h-2 w-28 max-w-[40%] animate-pulse rounded-full bg-subtle" />
            </span>
            {pills > 0 && (
              <span className="flex shrink-0 items-center gap-2 max-sm:hidden">
                {Array.from({ length: pills }, (_, p) => (
                  <span key={p} className={`h-6 animate-pulse rounded-full bg-subtle ${p === pills - 1 ? 'w-20' : 'w-14'}`} />
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RowsSkeleton
