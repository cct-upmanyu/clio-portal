import { Navigate, Outlet } from 'react-router-dom'
import { useChatNotifications } from '../../hooks/useChatNotifications'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import AppLayout from './AppLayout'
import RequireMatter from './RequireMatter'

// One frame for both portals; only the client portal needs a matter to show
function PortalLayout() {
  const { isAdmin } = useCurrentUser()
  useChatNotifications()
  if (isAdmin) return <AppLayout />
  return (
    <RequireMatter>
      <AppLayout />
    </RequireMatter>
  )
}

// Routes that exist in only one portal send the other portal home
export function PortalOnly({ portal }) {
  const current = useCurrentUser().portal
  return current === portal ? <Outlet /> : <Navigate to="/" replace />
}

// The same path showing a different page per portal (e.g. "/")
export function ByPortal({ client, admin }) {
  return useCurrentUser().isAdmin ? admin : client
}

export default PortalLayout
