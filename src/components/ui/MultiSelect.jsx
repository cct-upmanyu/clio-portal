import { useCallback, useId, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, CloseIcon } from './icons'
import { useDismiss } from '../../hooks/useDismiss'

// A dropdown for picking several options, shown as removable chips. options: [{ value, label }].
// `allLabel` adds a "select all" row. Keyboard: Enter / Space / Arrow Down opens; arrows move,
// Enter or Space toggles, Escape closes (without closing a surrounding dialog).
function MultiSelect({ id, label, options, value, onChange, placeholder = 'Choose…', allLabel, invalid = false, describedBy, disabled = false }) {
  const containerRef = useRef(null)
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(containerRef, open, close)

  const rows = allLabel && options.length > 1 ? [{ value: '__all__', label: allLabel }, ...options] : options
  const allChosen = options.length > 0 && options.every((o) => value.includes(o.value))
  const isChosen = (row) => (row.value === '__all__' ? allChosen : value.includes(row.value))
  const selected = options.filter((o) => value.includes(o.value))

  const toggle = (row) => {
    if (row.value === '__all__') onChange(allChosen ? [] : options.map((o) => o.value))
    else onChange(value.includes(row.value) ? value.filter((v) => v !== row.value) : [...value, row.value])
  }

  const handleKeyDown = (e) => {
    if (disabled) return
    if (!open) {
      if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        setOpen(true)
        setActive(0)
      }
      return
    }
    if (e.key === 'Escape') {
      // Close just this list, not the dialog it sits in
      e.preventDefault()
      e.stopPropagation()
      close()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (rows[active]) toggle(rows[active])
    } else if (e.key === 'Tab') {
      close()
    }
  }

  const border = invalid
    ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(180,35,24,0.12)]'
    : `border-field focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,92,173,0.15)] ${open ? 'border-brand' : ''}`

  return (
    <div ref={containerRef} className="relative">
      <div
        id={id}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-activedescendant={open && rows[active] ? `${listId}-${active}` : undefined}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg border bg-white py-1.5 pl-3 pr-2 text-[15px] focus:outline-none ${border} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="py-1 text-muted">{placeholder}</span>
          ) : (
            selected.map((o) => (
              <span key={o.value} className="inline-flex max-w-full items-center gap-1 rounded-full bg-brand-soft py-0.5 pl-2.5 pr-1 text-[13px] font-medium text-brand">
                <span className="truncate">{o.label}</span>
                <button
                  type="button"
                  aria-label={`Remove ${o.label}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(value.filter((v) => v !== o.value))
                  }}
                  className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-brand/15"
                >
                  <CloseIcon className="size-3" />
                </button>
              </span>
            ))
          )}
        </span>
        <ChevronDownIcon className={`size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-56 overflow-y-auto rounded-lg border border-line bg-white p-1 shadow-[0_12px_32px_rgba(10,31,61,0.14)]"
        >
          {rows.length === 0 && <li className="px-3 py-2 text-sm text-muted">Nothing to choose</li>}
          {rows.map((row, index) => {
            const chosen = isChosen(row)
            return (
              <li
                key={row.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={chosen}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(row)}
                onMouseEnter={() => setActive(index)}
                className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm ${index === active ? 'bg-subtle' : ''} ${row.value === '__all__' ? 'font-medium' : ''}`}
              >
                <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${chosen ? 'border-brand bg-brand text-white' : 'border-field bg-white'}`}>
                  {chosen && <CheckIcon className="size-3" />}
                </span>
                {row.label}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default MultiSelect
