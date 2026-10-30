import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useGetMeQuery } from '../../redux/api/authApi'
import { hideBootSplash } from '../../utils/bootSplash'

// Sign-in and invite pages: a signed-in user is sent back into the portal
function GuestOnly() {
  const location = useLocation()
  const { isAuthenticated, isAuthInitialized } = useSelector((state) => state.auth)
  useGetMeQuery(undefined, { skip: isAuthInitialized })

  useEffect(() => {
    if (isAuthInitialized) hideBootSplash()
  }, [isAuthInitialized])

  if (!isAuthInitialized) return null
  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || '/'} replace />
  return <Outlet />
}

export default GuestOnly
