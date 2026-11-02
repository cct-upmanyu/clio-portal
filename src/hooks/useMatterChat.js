import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { messageApi, useGetMessagesQuery } from '../redux/api/messageApi'
import { getSocket } from '../utils/socket'

// Only while the live connection is down
const FALLBACK_POLL_MS = 60000
// While typing, "typing" is re-sent this often; others drop it when it isn't refreshed in TYPING_TTL_MS
const TYPING_REFRESH_MS = 3000
const TYPING_TTL_MS = 5000
// No keystroke for this long counts as having stopped
const TYPING_IDLE_MS = 4000

// One matter's chat: its messages (kept live over the socket), who else has it open, and who's typing.
// Clients reach their accepted matters; firm users (Admin Console) any matter.
export function useMatterChat(crmMatterId) {
  const dispatch = useDispatch()
  const myId = useSelector((state) => String(state.auth.user?.id ?? ''))
  const [connected, setConnected] = useState(false)
  const [online, setOnline] = useState([])
  const [typing, setTyping] = useState({})

  const query = useGetMessagesQuery(crmMatterId, {
    skip: !crmMatterId,
    pollingInterval: connected ? 0 : FALLBACK_POLL_MS,
    skipPollingIfUnfocused: true,
  })
  const refetchRef = useRef(query.refetch)
  refetchRef.current = query.refetch

  useEffect(() => {
    if (!crmMatterId) return undefined
    const socket = getSocket()
    const isThisMatter = (payload) => String(payload?.crmMatterId) === String(crmMatterId)
    let joinedBefore = false

    const join = () => {
      socket.emit('join', crmMatterId, (res) => {
        if (!res?.ok) return
        setConnected(true)
        setOnline(res.online || [])
        // Back after a drop (AppSail closes connections every few minutes): catch up on what was missed
        if (joinedBefore) refetchRef.current?.()
        joinedBefore = true
      })
    }
    const onDisconnect = () => {
      setConnected(false)
      setOnline([])
      setTyping({})
    }
    const onMessage = (message) => {
      if (!isThisMatter(message)) return
      dispatch(messageApi.util.updateQueryData('getMessages', crmMatterId, (messages) => {
        if (!messages.some((m) => String(m.id) === String(message.id))) {
          messages.push({ ...message, mine: String(message.sender?.id) === myId })
        }
      }))
      // Sending ends their typing
      setTyping((prev) => {
        const { [String(message.sender?.id)]: _, ...rest } = prev
        return rest
      })
    }
    const onPresence = (payload) => {
      if (isThisMatter(payload)) setOnline(payload.online || [])
    }
    const onTyping = (payload) => {
      if (!isThisMatter(payload) || String(payload.user?.id) === myId) return
      const id = String(payload.user.id)
      setTyping((prev) => {
        if (!payload.typing) {
          const { [id]: _, ...rest } = prev
          return rest
        }
        return { ...prev, [id]: { user: payload.user, until: Date.now() + TYPING_TTL_MS } }
      })
    }

    socket.on('connect', join)
    socket.on('disconnect', onDisconnect)
    socket.on('message', onMessage)
    socket.on('presence', onPresence)
    socket.on('typing', onTyping)
    if (socket.connected) join()

    return () => {
      socket.emit('leave', crmMatterId)
      socket.off('connect', join)
      socket.off('disconnect', onDisconnect)
      socket.off('message', onMessage)
      socket.off('presence', onPresence)
      socket.off('typing', onTyping)
      onDisconnect()
    }
  }, [crmMatterId, dispatch, myId])

  // Drops a "typing" whose sender went quiet without saying they stopped
  const anyoneTyping = Object.keys(typing).length > 0
  useEffect(() => {
    if (!anyoneTyping) return undefined
    const timer = setInterval(() => {
      const now = Date.now()
      setTyping((prev) => {
        const live = Object.fromEntries(Object.entries(prev).filter(([, t]) => t.until > now))
        return Object.keys(live).length === Object.keys(prev).length ? prev : live
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [anyoneTyping])

  // My own typing: call notifyTyping on every keystroke, stopTyping when the message is sent
  const lastSentRef = useRef(0)
  const idleTimerRef = useRef(null)
  const stopTyping = useCallback(() => {
    clearTimeout(idleTimerRef.current)
    if (lastSentRef.current === 0) return
    lastSentRef.current = 0
    getSocket().emit('typing', { crmMatterId, typing: false })
  }, [crmMatterId])
  const notifyTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastSentRef.current > TYPING_REFRESH_MS) {
      lastSentRef.current = now
      getSocket().emit('typing', { crmMatterId, typing: true })
    }
    clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS)
  }, [crmMatterId, stopTyping])
  useEffect(() => stopTyping, [stopTyping])

  return {
    messages: query.data ?? [],
    isSuccess: query.isSuccess,
    connected,
    online: online.filter((user) => String(user.id) !== myId),
    typingUsers: Object.values(typing).map((t) => t.user),
    notifyTyping,
    stopTyping,
  }
}
