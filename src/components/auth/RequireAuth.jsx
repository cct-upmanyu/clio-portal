import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useGetMeQuery } from '../../redux/api/authApi'
import { hideBootSplash } from '../../utils/bootSplash'

// Until GET /auth/me answers, render nothing: the boot splash is still covering the page
function RequireAuth({ children }) {
  const location = useLocation()
  const { isAuthenticated, isAuthInitialized } = useSelector((state) => state.auth)
  useGetMeQuery(undefined, { skip: isAuthenticated })

  useEffect(() => {
    if (isAuthInitialized) hideBootSplash()
  }, [isAuthInitialized])

  if (!isAuthInitialized) return null
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

export default RequireAuth
