import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import AccountMenu from './AccountMenu'
import MatterSwitcher from './MatterSwitcher'
import MobileDrawer from './MobileDrawer'
import { BriefcaseIcon, MenuIcon } from '../ui/icons'
import { useCurrentUser } from '../../hooks/useCurrentUser'

// Brand blue over the navy Sidebar: the bar stands out as the page header (Clio-style)
function TopBar() {
  const currentUser = useCurrentUser()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-4 border-b border-black/10 bg-brand px-6 py-2.5 text-white shadow-[0_1px_2px_rgba(10,31,61,0.12)] max-lg:min-h-14 max-sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Mobile/tablet: firm logo in place of the sidebar */}
        <Link to="/" aria-label="Client portal home" className="flex shrink-0 lg:hidden">
          <BrandLogo lightClass="h-8" darkClass="size-10" frameClass="flex rounded-lg bg-white p-1" />
        </Link>

        <span aria-hidden="true" className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white lg:flex">
          <BriefcaseIcon className="size-5" />
        </span>

        <MatterSwitcher />
      </div>

      {/* Desktop: account dropdown. Mobile/tablet: menu button opens the drawer (sections + account) */}
      <div className="hidden lg:block">
        <AccountMenu user={currentUser} />
      </div>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open menu"
        aria-expanded={drawerOpen}
        className="-mr-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white hover:bg-white/15 lg:hidden"
      >
        <MenuIcon className="size-6" />
      </button>
      <MobileDrawer open={drawerOpen} onClose={closeDrawer} user={currentUser} />
    </header>
  )
}

export default TopBar
