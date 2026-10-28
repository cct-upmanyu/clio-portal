import { BillIcon, CalendarIcon, DocumentsIcon, HomeIcon, MessageIcon, TaskIcon } from '../ui/icons'

// Shared by the desktop Sidebar and the mobile drawer.
// TODO: badge counts from the backend (unread messages, open tasks)
export const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: HomeIcon, end: true },
  { to: '/messages', label: 'Messages', icon: MessageIcon, badge: 2 },
  { to: '/tasks', label: 'Tasks', icon: TaskIcon },
  { to: '/documents', label: 'Documents', icon: DocumentsIcon },
  { to: '/events', label: 'Events', icon: CalendarIcon },
  { to: '/bills', label: 'Bills', icon: BillIcon },
]
