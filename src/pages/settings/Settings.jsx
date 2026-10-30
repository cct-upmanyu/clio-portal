import { NavLink, Outlet } from 'react-router-dom'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import { ShieldIcon } from '../../components/ui/icons'

// Add new settings sections here (and a matching child route in App.jsx)
const SECTIONS = [
  { to: 'security', label: 'Security', icon: ShieldIcon },
]

const linkClass = ({ isActive }) =>
  `flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-sm ${
    isActive ? 'bg-brand-soft font-semibold text-brand' : 'font-medium text-body hover:bg-subtle hover:text-ink'
  }`

function Settings() {
  return (
    <Page>
      <PageHeader title="Account settings" description="Manage your sign-in and security preferences." />

      <div className="flex flex-1 max-lg:flex-col">
        <nav aria-label="Settings" className="flex shrink-0 gap-1 border-line bg-white p-3 lg:w-56 lg:flex-col lg:border-r max-lg:overflow-x-auto max-lg:border-b">
          {SECTIONS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </Page>
  )
}

export default Settings
