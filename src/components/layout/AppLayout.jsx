import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import { clearAccessDenied } from '../../redux/slices/authSlice'
import AccessDenied from './AccessDenied'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

// Frame for every signed-in page: sidebar (desktop) or drawer (mobile, opened from the top bar).
// The area below the top bar is handed to the page as-is; each page sets its own
// margin and panel with <Page>, so the sidebar and top bar stay put while it scrolls.
function AppLayout() {
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const { accessDenied, accessDeniedMessage } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearAccessDenied())
  }, [pathname, dispatch])

  return (
    <div className="h-dvh overflow-hidden bg-canvas text-ink lg:flex">
      <Sidebar />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">
          {accessDenied ? <AccessDenied message={accessDeniedMessage} /> : <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
