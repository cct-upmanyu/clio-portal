import { useRef } from 'react'

// Underlined tab bar (scrolls sideways on narrow screens, no visible scrollbar).
// Left/Right/Home/End move between tabs.
// Pair with <TabPanel id={...}> for each tab.
function Tabs({ label, tabs, value, onChange, idPrefix = 'tab' }) {
  const refs = useRef({})

  const handleKeyDown = (e, index) => {
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
    if (!(e.key in moves)) return
    e.preventDefault()
    const next = tabs[(moves[e.key] + tabs.length) % tabs.length]
    onChange(next.id)
    refs.current[next.id]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab, index) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(el) => { refs.current[tab.id] = el }}
            type="button"
            role="tab"
            id={`${idPrefix}-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex h-10 shrink-0 cursor-pointer items-center gap-2 px-3 text-sm ${
              selected ? 'font-semibold text-brand shadow-[inset_0_-2px_0_var(--color-brand)]' : 'font-medium text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`rounded-full px-1.5 py-px text-xs font-semibold ${selected ? 'bg-brand-soft text-brand' : 'bg-subtle text-muted'}`}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({ id, idPrefix = 'tab', children }) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-${id}`}>
      {children}
    </div>
  )
}

export default Tabs
