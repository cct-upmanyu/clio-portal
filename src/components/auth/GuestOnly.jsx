import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useGetMeQuery } from '../../redux/api/authApi'
import { hideBootSplash } from '../../utils/bootSplash'

// Sign-in and invite pages: a signed-in user is sent back into the portal.
// If the session check couldn't reach the server, show the page anyway (signing in will report the problem).
function GuestOnly() {
  const location = useLocation()
  const { isAuthenticated, isAuthInitialized, authCheckFailed } = useSelector((state) => state.auth)
  useGetMeQuery(undefined, { skip: isAuthInitialized })

  useEffect(() => {
    if (isAuthInitialized || authCheckFailed) hideBootSplash()
  }, [isAuthInitialized, authCheckFailed])

  if (!isAuthInitialized && !authCheckFailed) return null
  if (isAuthenticated) {
    // ?from=… (the CRM widget's "Open Admin Console"): already signed in, so go straight there
    const from = new URLSearchParams(location.search).get('from')
    const safeFrom = from?.startsWith('/') && !from.startsWith('//') ? from : null
    return <Navigate to={location.state?.from?.pathname || safeFrom || '/'} replace />
  }
  return <Outlet />
}

export default GuestOnly
