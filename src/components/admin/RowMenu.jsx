import { useCallback, useRef, useState } from 'react'
import { MoreIcon } from '../ui/icons'
import { useDismiss } from '../../hooks/useDismiss'

// "⋮" button opening a short list of actions for one row. Items: { label, icon, onSelect, tone? }
function RowMenu({ label, items }) {
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(containerRef, open, close)

  if (items.length === 0) return <span className="size-9 shrink-0" />

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle hover:text-ink ${open ? 'bg-subtle text-ink' : ''}`}
      >
        <MoreIcon className="size-[18px]" />
      </button>

      {open && (
        <div role="menu" aria-label={label} className="absolute right-0 top-[calc(100%+4px)] z-30 flex w-60 flex-col rounded-xl border border-line bg-white p-1.5 text-ink shadow-[0_16px_40px_rgba(10,31,61,0.16)]">
          {items.map(({ label: itemLabel, icon: Icon, onSelect, tone }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              onClick={() => {
                close()
                onSelect()
              }}
              className={`flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-subtle ${tone === 'danger' ? 'text-danger' : ''}`}
            >
              {Icon && <Icon className="size-[18px] shrink-0" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RowMenu
