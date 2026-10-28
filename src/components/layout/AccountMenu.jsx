import { useCallback, useRef, useState } from 'react'
import Avatar from '../ui/Avatar'
import { ChevronDownIcon, HelpIcon, SettingsIcon, SignOutIcon } from '../ui/icons'
import { firm } from '../../data/sampleData'
import { useDismiss } from '../../hooks/useDismiss'
import SignOutDialog from './SignOutDialog'

const menuItemClass = 'flex min-h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-subtle'

// Desktop account dropdown: profile, settings, help, sign out (mobile uses MobileDrawer)
function AccountMenu({ user }) {
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useDismiss(containerRef, open, close)

  const handleSignOut = () => {
    close()
    setConfirmSignOut(true)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-2 ${open ? 'border-brand' : 'border-line hover:border-field'}`}
      >
        <Avatar name={user.name} size="xs" />
        <span className="text-sm font-medium max-sm:hidden">{user.name}</span>
        <ChevronDownIcon className={`size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-30 flex w-[300px] max-w-[calc(100vw-32px)] flex-col rounded-xl border border-line bg-white p-2 shadow-[0_16px_40px_rgba(10,31,61,0.16)]"
        >
          <div className="flex items-center gap-3 px-3 pb-3.5 pt-2.5">
            <Avatar name={user.name} />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="truncate text-[13px] text-muted">{user.email}</span>
            </span>
          </div>

          <div className="mx-1 mb-2 h-px bg-divider" />
          {/* TODO: account settings page */}
          <button type="button" role="menuitem" onClick={close} className={menuItemClass}>
            <SettingsIcon className="size-[18px]" />
            Account settings
          </button>
          <a role="menuitem" href={`mailto:${firm.email}`} className={menuItemClass}>
            <HelpIcon className="size-[18px]" />
            Help &amp; contact
          </a>
          <div className="mx-1 my-2 h-px bg-divider" />
          <button type="button" role="menuitem" onClick={handleSignOut} className={`${menuItemClass} text-danger`}>
            <SignOutIcon className="size-[18px]" />
            Sign out
          </button>
        </div>
      )}
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
    </div>
  )
}

export default AccountMenu
