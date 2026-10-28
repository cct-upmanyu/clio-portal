import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import Avatar from '../ui/Avatar'
import { CloseIcon, HelpIcon, SettingsIcon, SignOutIcon } from '../ui/icons'
import { firm } from '../../data/sampleData'
import { useModalDialog } from '../../hooks/useModalDialog'
import MainNav, { navItemClass, navItemIdleClass } from './MainNav'
import SignOutDialog from './SignOutDialog'

const DESKTOP_QUERY = '(min-width: 1024px)'

// Below lg: opens on the left with the section links and the profile/account
// actions. Built on a modal <dialog>, so focus stays inside and Escape closes it.
function MobileDrawer({ open, onClose, user }) {
  const dialogRef = useModalDialog(open)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  // Growing to desktop width swaps to the Sidebar, so close the drawer
  useEffect(() => {
    if (!open) return
    const media = window.matchMedia(DESKTOP_QUERY)
    const handleChange = (e) => { if (e.matches) onClose() }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [open, onClose])

  const handleSignOut = () => {
    onClose()
    setConfirmSignOut(true)
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        aria-label="Menu"
        onCancel={(e) => {
          e.preventDefault()
          onClose()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) onClose()
        }}
        className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[300px] max-w-[85vw] bg-navy p-0 text-white backdrop:bg-navy/50"
      >
        <div className="flex h-full flex-col gap-5 overflow-y-auto px-3 py-4">
          {/* Centered brand header, same as the desktop Sidebar; close button pinned top-right */}
          <div className="relative border-b border-white/10 px-2 pb-5 pt-3">
            <Link to="/" onClick={onClose} aria-label="Client portal home" className="flex flex-col items-center gap-3">
              <BrandLogo lightClass="h-12" darkClass="size-20" frameClass="flex rounded-xl bg-white px-3.5 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-nav-muted">Client Portal</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute -right-1 -top-1 flex size-10 cursor-pointer items-center justify-center rounded-lg text-nav-text hover:bg-white/10 hover:text-white"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <MainNav onNavigate={onClose} />

          <div className="mt-auto flex flex-col gap-1 border-t border-white/15 pt-4">
            <div className="mb-2 flex items-center gap-3 px-3">
              <Avatar name={user.name} inverted />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{user.name}</span>
                <span className="truncate text-xs text-nav-muted">{user.email}</span>
              </span>
            </div>
            {/* TODO: account settings page */}
            <button type="button" onClick={onClose} className={`${navItemClass} ${navItemIdleClass} cursor-pointer`}>
              <SettingsIcon className="size-[18px] shrink-0" />
              Account settings
            </button>
            <a href={`mailto:${firm.email}`} className={`${navItemClass} ${navItemIdleClass}`}>
              <HelpIcon className="size-[18px] shrink-0" />
              Help &amp; contact
            </a>
            <button type="button" onClick={handleSignOut} className={`${navItemClass} ${navItemIdleClass} cursor-pointer`}>
              <SignOutIcon className="size-[18px] shrink-0" />
              Sign out
            </button>
          </div>
        </div>
      </dialog>
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
    </>
  )
}

export default MobileDrawer
