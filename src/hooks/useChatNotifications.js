import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { baseApi } from '../redux/api/baseApi'
import { isActiveChat } from '../utils/activeChat'
import { getSocket } from '../utils/socket'

// Runs on every signed-in page. The server sends "unread" (no content) to a client's own room when one
// of their matters gets a message, so the switcher and sidebar badges update without the chat open;
// and "firm-unread" to firm users, for the admin dashboard's unread client messages.
export function useChatNotifications() {
  const dispatch = useDispatch()
  const signedIn = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (!signedIn) return undefined
    const socket = getSocket()
    const onUnread = ({ crmMatterId }) => {
      // Being read right now: the open chat marks it read, and a refetch here would race that
      if (isActiveChat(crmMatterId)) return
      dispatch(baseApi.util.invalidateTags(['Matters']))
    }
    // Admin dashboards: a client wrote, or someone at the firm read a matter's messages
    const onFirmUnread = () => dispatch(baseApi.util.invalidateTags(['AdminDashboard']))
    // Firm users: something was recorded on a timeline
    const onActivity = () => dispatch(baseApi.util.invalidateTags(['Activity']))
    // Back after a drop: anything that arrived meanwhile only shows in fresh counts
    const onReconnect = () => dispatch(baseApi.util.invalidateTags(['Matters', 'AdminDashboard', 'Activity']))

    socket.on('unread', onUnread)
    socket.on('firm-unread', onFirmUnread)
    socket.on('activity', onActivity)
    socket.io.on('reconnect', onReconnect)
    return () => {
      socket.off('unread', onUnread)
      socket.off('firm-unread', onFirmUnread)
      socket.off('activity', onActivity)
      socket.io.off('reconnect', onReconnect)
    }
  }, [signedIn, dispatch])
}
