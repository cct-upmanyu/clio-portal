import { useCallback, useRef, useState } from 'react'
import StatusPill from '../ui/StatusPill'
import { CheckIcon, ChevronDownIcon } from '../ui/icons'
import { firm } from '../../data/sampleData'
import { useDismiss } from '../../hooks/useDismiss'
import { useMatters } from '../../hooks/useMatters'
import InvitationList from './InvitationList'

// The current matter's name in the top bar; opens a list to switch matters and accept invitations.
// On phones the list is a full-width panel centered under the top bar so it never runs off-screen.
function MatterSwitcher() {
  const { matters, invitations, selectedMatter, selectMatter, refetch } = useMatters()
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const canSwitch = matters.length > 1 || invitations.length > 0
  const matterName = selectedMatter?.label
  // Other matters only: the open one's messages are on screen. Counts refresh on load, switch and open.
  const otherUnread = matters.some((m) => m.id !== selectedMatter?.id && m.unreadCount > 0)

  const toggle = () => {
    if (!open) refetch()
    setOpen((v) => !v)
  }

  useDismiss(containerRef, open, close)

  if (!selectedMatter) return null

  const pick = (id) => {
    selectMatter(id)
    close()
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        onClick={toggle}
        disabled={!canSwitch}
        aria-haspopup={canSwitch ? 'menu' : undefined}
        aria-expanded={canSwitch ? open : undefined}
        aria-label={canSwitch ? `Switch matter. Current matter: ${matterName}` : undefined}
        className={`flex max-w-full min-w-0 flex-col items-start gap-0.5 rounded-lg px-1.5 py-1 text-left enabled:cursor-pointer enabled:hover:bg-white/15 ${open ? 'bg-white/15' : ''}`}
      >
        <span className="text-[11px] text-white/80 max-sm:hidden">Viewing matter</span>
        <span className="flex w-full min-w-0 items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-white max-sm:text-sm">{matterName}</span>
          <span className="max-sm:hidden"><StatusPill status={selectedMatter.status} /></span>
          {invitations.length > 0 && (
            <span className="shrink-0 rounded-full bg-white px-1.5 text-[11px] font-semibold leading-[18px] text-brand">
              {invitations.length}
              <span className="sr-only"> {invitations.length === 1 ? 'invitation' : 'invitations'} to accept</span>
            </span>
          )}
          {otherUnread && (
            <span className="size-2 shrink-0 rounded-full bg-red-600 ring-2 ring-white">
              <span className="sr-only">New messages in another matter</span>
            </span>
          )}
          {canSwitch && <ChevronDownIcon className={`size-4 shrink-0 text-white/80 transition-transform ${open ? 'rotate-180' : ''}`} />}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Switch matter"
          className="absolute left-0 top-[calc(100%+8px)] z-30 flex w-[360px] max-w-[calc(100vw-32px)] flex-col text-ink max-sm:fixed max-sm:inset-x-3 max-sm:top-[68px] max-sm:w-auto max-sm:max-w-none rounded-xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(10,31,61,0.16)]"
        >
          <span className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Your matters</span>
          {matters.map((matter) => {
            const selected = matter.id === selectedMatter.id
            const unread = selected ? 0 : matter.unreadCount
            return (
              <button
                key={matter.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => pick(matter.id)}
                className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left ${selected ? 'bg-[#F3F7FC]' : 'hover:bg-subtle'}`}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={`truncate text-sm ${selected || unread > 0 ? 'font-semibold' : 'font-medium'}`}>{matter.label}</span>
                  <span className="truncate text-xs text-muted">{matter.firmName || firm.name}</span>
                </span>
                {unread > 0 && (
                  <span className="shrink-0 rounded-full bg-red-600 px-1.5 text-[11px] font-semibold leading-[18px] text-white">
                    {unread > 99 ? '99+' : unread}
                    <span className="sr-only"> new {unread === 1 ? 'message' : 'messages'}</span>
                  </span>
                )}
                <StatusPill status={matter.status} />
                <span className="flex w-[18px] shrink-0 justify-center">
                  {selected && <CheckIcon className="size-[18px] text-brand" />}
                </span>
              </button>
            )
          })}
          {invitations.length > 0 && (
            <>
              <span className="mt-1 border-t border-divider px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Invitations</span>
              <InvitationList invitations={invitations} onAccepted={close} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MatterSwitcher
