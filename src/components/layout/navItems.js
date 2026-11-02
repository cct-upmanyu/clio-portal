import { BillIcon, CalendarIcon, DashboardIcon, DocumentsIcon, HomeIcon, MattersIcon, MessageIcon, TaskIcon, UsersIcon } from '../ui/icons'

// Shared by the desktop Sidebar and the mobile drawer.
// Badge counts come from MainNav (unread messages for the selected matter)
export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/messages', label: 'Messages', icon: MessageIcon },
  { to: '/tasks', label: 'Tasks', icon: TaskIcon },
  { to: '/documents', label: 'Documents', icon: DocumentsIcon },
  { to: '/events', label: 'Events', icon: CalendarIcon },
  { to: '/bills', label: 'Bills', icon: BillIcon },
]

export const ADMIN_NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/matters', label: 'Matters', icon: MattersIcon },
  { to: '/users', label: 'Users', icon: UsersIcon },
]

export const portalName = (portal) => (portal === 'admin' ? 'Admin Console' : 'Client Portal')
