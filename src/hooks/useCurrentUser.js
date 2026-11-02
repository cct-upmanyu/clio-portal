import { useSelector } from 'react-redux'

export function useCurrentUser() {
  const user = useSelector((state) => state.auth.user)
  const firstName = user?.firstName || ''
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || ''
  // 'admin' (firm staff: admin console) or 'client' (client portal), decided by the backend from the role
  const portal = user?.portal === 'admin' ? 'admin' : 'client'
  return { ...user, firstName, name, email: user?.email || '', portal, isAdmin: portal === 'admin' }
}
