import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useGetMeQuery } from '../../redux/api/authApi'
import { hideBootSplash } from '../../utils/bootSplash'
import ServiceUnavailable from './ServiceUnavailable'

// Until GET /auth/me answers, render nothing: the boot splash is still covering the page.
// Only a real "not signed in" goes to /login; a server that can't answer gets a retry screen.
function RequireAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated, isAuthInitialized, authCheckFailed } = useSelector((state) => state.auth)
  const { refetch, isFetching } = useGetMeQuery(undefined, { skip: isAuthenticated })

  useEffect(() => {
    if (isAuthInitialized || authCheckFailed) hideBootSplash()
  }, [isAuthInitialized, authCheckFailed])

  if (authCheckFailed) return <ServiceUnavailable onRetry={refetch} retrying={isFetching} />
  if (!isAuthInitialized) return null
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export default RequireAuth
