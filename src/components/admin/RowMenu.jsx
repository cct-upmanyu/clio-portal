import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MoreIcon } from '../ui/icons'
import { useDismiss } from '../../hooks/useDismiss'

const GAP = 4
const EDGE = 8
const ITEM_HEIGHT = 40

// "⋮" button opening a short list of actions for one row. Items: { label, icon, onSelect, tone? }
// The menu is fixed to the screen, so a scrolling list can't cut it off; it opens upward when there
// isn't room below the button.
function RowMenu({ label, items }) {
  const containerRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(containerRef, open, close)

  // Placed from the button's spot on screen, and kept there while open (styles can still be settling
  // the moment it opens)
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return undefined
    }
    let frame
    let last = ''
    const place = () => {
      if (buttonRef.current && menuRef.current) {
        const button = buttonRef.current.getBoundingClientRect()
        const height = Math.max(menuRef.current.scrollHeight, items.length * ITEM_HEIGHT + 12)
        const below = window.innerHeight - button.bottom - GAP - EDGE
        const above = button.top - GAP - EDGE
        const up = below < height && above > below
        const next = {
          right: Math.max(EDGE, window.innerWidth - button.right),
          ...(up ? { bottom: window.innerHeight - button.top + GAP } : { top: button.bottom + GAP }),
          maxHeight: Math.max(120, up ? above : below),
        }
        const key = JSON.stringify(next)
        if (key !== last) {
          last = key
          setPosition(next)
        }
      }
      frame = requestAnimationFrame(place)
    }
    place()
    return () => cancelAnimationFrame(frame)
  }, [open, items.length])

  // It's placed for where the button was; scrolling or resizing closes it rather than leaving it behind
  useEffect(() => {
    if (!open) return undefined
    const onMove = (e) => {
      if (menuRef.current?.contains(e.target)) return
      close()
    }
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, close])

  if (items.length === 0) return <span className="size-9 shrink-0" />

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className={`flex size-9 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle hover:text-ink max-sm:size-8 ${open ? 'bg-subtle text-ink' : ''}`}
      >
        <MoreIcon className="size-[18px]" />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          style={{ position: 'fixed', ...(position ?? { top: 0, right: 0, visibility: 'hidden' }) }}
          className="z-50 flex w-60 flex-col overflow-y-auto rounded-xl border border-line bg-white p-1.5 text-ink shadow-[0_16px_40px_rgba(10,31,61,0.16)] max-sm:w-52 max-sm:p-1"
        >
          {items.map(({ label: itemLabel, icon: Icon, onSelect, tone }) => (
            <button
              key={itemLabel}
              type="button"
              role="menuitem"
              onClick={() => {
                close()
                onSelect()
              }}
              className={`flex min-h-10 w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-subtle max-sm:min-h-9 max-sm:gap-2.5 max-sm:px-2.5 max-sm:text-[13px] ${tone === 'danger' ? 'text-danger' : ''}`}
            >
              {Icon && <Icon className="size-[18px] shrink-0 max-sm:size-4" />}
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RowMenu
