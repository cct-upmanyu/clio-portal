import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'
import { firm } from '../../data/sampleData'
import { HelpIcon, SignOutIcon } from '../ui/icons'
import MainNav, { navItemClass, navItemIdleClass } from './MainNav'
import SignOutDialog from './SignOutDialog'

// Desktop only (lg and up); smaller screens use MobileDrawer
function Sidebar() {
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  return (
    <aside
      aria-label="Sidebar"
      className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col gap-5 overflow-y-auto bg-navy px-3 py-5 text-white lg:flex"
    >
      <Link to="/" className="flex flex-col items-center gap-3 border-b border-white/10 px-2 pb-5 pt-1" aria-label="Client portal home">
        <BrandLogo lightClass="h-12" darkClass="size-20" frameClass="flex rounded-xl bg-white px-3.5 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.25)]" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-nav-muted">Client Portal</span>
      </Link>

      <MainNav />

      <div className="mt-auto flex flex-col gap-1 border-t border-white/15 pt-4">
        <a href={`mailto:${firm.email}`} className={`${navItemClass} ${navItemIdleClass}`}>
          <HelpIcon className="size-[18px] shrink-0" />
          Help &amp; contact
        </a>
        <button type="button" onClick={() => setConfirmSignOut(true)} className={`${navItemClass} ${navItemIdleClass} cursor-pointer`}>
          <SignOutIcon className="size-[18px] shrink-0" />
          Sign out
        </button>
      </div>
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
    </aside>
  )
}

export default Sidebar
