import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { baseApi } from '../redux/api/baseApi'
import { isActiveChat } from '../utils/activeChat'
import { getSocket } from '../utils/socket'

// Runs on every signed-in page. The server sends "unread" (no content) to a client's own room when one
// of their matters gets a message, so the switcher and sidebar badges update without the chat open.
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
    // Back after a drop: anything that arrived meanwhile only shows in fresh counts
    const onReconnect = () => dispatch(baseApi.util.invalidateTags(['Matters']))

    socket.on('unread', onUnread)
    socket.io.on('reconnect', onReconnect)
    return () => {
      socket.off('unread', onUnread)
      socket.io.off('reconnect', onReconnect)
    }
  }, [signedIn, dispatch])
}
