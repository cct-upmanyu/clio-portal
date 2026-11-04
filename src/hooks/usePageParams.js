import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export const PER_PAGE_OPTIONS = [10, 20, 30, 50, 100, 200]
export const DEFAULT_PER_PAGE = 30

// ?page= and ?per_page= for a paged list, so a reload or a shared link opens the same page.
// Anything else in the URL falls back to page 1 and 30 per page; the defaults are left out of the URL.
export function usePageParams() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number.parseInt(params.get('page'), 10) || 1)
  const asked = Number.parseInt(params.get('per_page'), 10)
  const perPage = PER_PAGE_OPTIONS.includes(asked) ? asked : DEFAULT_PER_PAGE

  const update = useCallback((next) => {
    setParams((prev) => {
      const out = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(next)) {
        const isDefault = (key === 'page' && value === 1) || (key === 'per_page' && value === DEFAULT_PER_PAGE)
        if (isDefault) out.delete(key)
        else out.set(key, String(value))
      }
      return out
    }, { replace: true })
  }, [setParams])

  const setPage = useCallback((value) => update({ page: value }), [update])
  // A new page size starts again from the first page
  const setPerPage = useCallback((value) => update({ per_page: value, page: 1 }), [update])

  return { page, perPage, setPage, setPerPage }
}
