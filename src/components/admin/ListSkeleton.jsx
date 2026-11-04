const ROWS = 8
const WIDTHS = [62, 48, 70, 54, 66, 44, 58, 72]

// Placeholder rows for an admin list while its first page loads. `columns`: the list's grid classes;
// `cells`: how many columns follow the name; `avatar`: a circle before the name (Users).
function ListSkeleton({ columns, cells, avatar = false, label }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className={`hidden rounded-lg bg-brand-soft px-3 py-3 ${columns}`}>
        {Array.from({ length: cells + 1 }, (_, i) => <span key={i} className="h-2.5 w-16 animate-pulse rounded-full bg-brand/15" />)}
        <span />
      </div>
      <ul aria-hidden="true" className="flex flex-col divide-y divide-divider">
        {WIDTHS.slice(0, ROWS).map((width, row) => (
          <li key={row} className={`flex items-start gap-3 py-3 max-sm:gap-2.5 max-sm:py-2.5 lg:px-3 ${columns}`}>
            <div className="flex min-w-0 flex-1 items-center gap-3 max-sm:items-start max-sm:gap-2.5">
              {avatar && <span className="size-9 shrink-0 animate-pulse rounded-full bg-line max-sm:size-8" />}
              <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
                <span className="h-3 animate-pulse rounded-full bg-line" style={{ width: `${width}%` }} />
                <span className="h-2.5 animate-pulse rounded-full bg-subtle" style={{ width: `${width - 14}%` }} />
                {/* Phones and tablets: the folded-in details */}
                <span className="mt-1 flex gap-2 lg:hidden">
                  <span className="h-5 w-16 animate-pulse rounded-full bg-subtle" />
                  <span className="h-5 w-12 animate-pulse rounded-full bg-subtle" />
                </span>
              </div>
            </div>
            {Array.from({ length: cells }, (_, i) => (
              <span key={i} className="hidden h-3 animate-pulse rounded-full bg-subtle lg:block" style={{ width: `${40 + ((row + i * 3) % 4) * 12}%` }} />
            ))}
            <span className="size-9 shrink-0 max-sm:size-8" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ListSkeleton
