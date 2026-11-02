import { NavLink } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useMatters } from '../../hooks/useMatters'
import { useGetAdminDashboardQuery } from '../../redux/api/adminApi'
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from './navItems'

export const navItemClass = 'flex h-10 items-center gap-3 rounded-lg px-3 text-sm'
export const navItemIdleClass = 'font-medium text-nav-text hover:bg-white/10 hover:text-white'

// Main section links on the navy background (desktop Sidebar and mobile drawer)
function MainNav({ onNavigate }) {
  const { isAdmin } = useCurrentUser()
  const { selectedMatter } = useMatters()
  const { data: dashboard } = useGetAdminDashboardQuery(undefined, { skip: !isAdmin, refetchOnFocus: true })
  // Client: unread in the matter being viewed (other matters' show in the matter switcher).
  // Admin: client messages no one at the firm has read, on the dashboard.
  const badges = isAdmin
    ? { '/': dashboard?.totalUnread || 0 }
    : { '/messages': selectedMatter?.unreadCount || 0 }

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {(isAdmin ? ADMIN_NAV_ITEMS : NAV_ITEMS).map(({ to, label, icon: Icon, end }) => {
        const badge = badges[to] || 0
        return (
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
              {badge > 99 ? '99+' : badge}
              <span className="sr-only"> unread</span>
            </span>
          )}
        </NavLink>
        )
      })}
    </nav>
  )
}

export default MainNav
