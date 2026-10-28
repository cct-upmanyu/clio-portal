import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/Firm_Logo.webp'
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
      <Link to="/" className="flex flex-col items-start gap-2.5 px-2" aria-label="Client portal home">
        <span className="flex rounded-lg bg-white px-2.5 py-2">
          <img src={logo} alt={firm.name} className="h-9 w-auto" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-nav-muted">Client Portal</span>
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
