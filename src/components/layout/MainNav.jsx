import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export const navItemClass = 'flex h-10 items-center gap-3 rounded-lg px-3 text-sm'
export const navItemIdleClass = 'font-medium text-nav-text hover:bg-white/10 hover:text-white'

// Main section links on the navy background (desktop Sidebar and mobile drawer)
function MainNav({ onNavigate }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) => `${navItemClass} ${isActive ? 'bg-brand font-semibold text-white' : navItemIdleClass}`}
        >
          <Icon className="size-[18px] shrink-0" />
          <span className="flex-1">{label}</span>
          {badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-navy">
              {badge}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default MainNav
