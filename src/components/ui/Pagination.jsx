import { ChevronLeftIcon, ChevronRightIcon } from './icons'

// Page numbers with the first, last and current ±1 shown; gaps become "…"
function pageList(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap-' + p, p] : [p]))
}

const buttonClass = 'flex size-9 max-sm:size-8 max-sm:text-[13px] cursor-pointer items-center justify-center rounded-lg text-sm disabled:cursor-not-allowed disabled:opacity-40'

// mt-auto: inside a flex-1 column it sits at the bottom of the panel.
// `pageSizeOptions` + `onPageSizeChange`: a "per page" select next to the count.
function Pagination({ page, pageSize, total, onPageChange, itemLabel = 'items', pageSizeOptions, onPageSizeChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4 max-sm:gap-x-2 max-sm:gap-y-1.5 max-sm:pt-2.5">
      <div className="flex shrink-0 items-center gap-3 max-sm:gap-2">
        <p className="text-[13px] text-muted max-sm:text-xs">
          <span className="max-sm:hidden">Showing </span><span className="font-medium text-ink">{from}–{to}</span> of <span className="font-medium text-ink">{total}</span><span className="max-sm:hidden"> {itemLabel}</span>
        </p>
        {pageSizeOptions && onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-[13px] text-muted max-sm:text-xs">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label={`${itemLabel} per page`}
              className="h-8 cursor-pointer rounded-lg border border-field bg-white pl-2 pr-1 text-[13px] font-medium text-ink focus:border-brand focus:outline-none max-sm:h-7 max-sm:text-xs"
            >
              {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="max-sm:hidden">per page</span>
          </label>
        )}
      </div>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="ml-auto flex items-center gap-1 max-sm:gap-0.5">
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
