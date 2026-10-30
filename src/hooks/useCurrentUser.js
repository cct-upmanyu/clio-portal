import { useSelector } from 'react-redux'

export function useCurrentUser() {
  const user = useSelector((state) => state.auth.user)
  const firstName = user?.firstName || ''
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || ''
  return { ...user, firstName, name, email: user?.email || '' }
}
