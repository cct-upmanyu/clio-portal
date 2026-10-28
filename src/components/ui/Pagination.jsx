import { ChevronLeftIcon, ChevronRightIcon } from './icons'

// Page numbers with the first, last and current ±1 shown; gaps become "…"
function pageList(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap-' + p, p] : [p]))
}

const buttonClass = 'flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-40'

// mt-auto: inside a flex-1 column it sits at the bottom of the panel
function Pagination({ page, pageSize, total, onPageChange, itemLabel = 'items' }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
      <p className="text-[13px] text-muted">
        Showing <span className="font-medium text-ink">{from}–{to}</span> of <span className="font-medium text-ink">{total}</span> {itemLabel}
      </p>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page" className={`${buttonClass} text-body hover:bg-subtle`}>
            <ChevronLeftIcon className="size-4" />
          </button>
          {pageList(page, pageCount).map((p) =>
            typeof p === 'string' ? (
              <span key={p} aria-hidden="true" className="w-6 text-center text-sm text-muted">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={`${buttonClass} ${p === page ? 'bg-brand font-semibold text-white' : 'font-medium text-body hover:bg-subtle'}`}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pageCount} aria-label="Next page" className={`${buttonClass} text-body hover:bg-subtle`}>
            <ChevronRightIcon className="size-4" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default Pagination
