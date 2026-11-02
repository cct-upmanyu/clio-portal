import { useEffect, useMemo, useRef, useState } from 'react'
import MessageThread from '../components/messages/MessageThread'
import { useMatterRealtime } from '../hooks/useMatterRealtime'
import { useMatters } from '../hooks/useMatters'
import { useGetMessagesQuery, useMarkMatterReadMutation, useSendMessageMutation } from '../redux/api/messageApi'

// Only while the realtime connection is down
const FALLBACK_POLL_MS = 60000

const newClientMessageId = () => crypto.randomUUID().replaceAll('-', '')

const authorOf = (message) => {
  if (message.mine) return 'You'
  const name = [message.sender.firstName, message.sender.lastName].filter(Boolean).join(' ')
  return name || (message.senderType === 'staff' ? 'Legal team' : 'Client')
}

function MatterMessages({ matter }) {
  const crmMatterId = matter.crmMatterId
  const refetchRef = useRef(null)
  const connected = useMatterRealtime(crmMatterId, () => refetchRef.current?.())
  const { data = [], refetch, isSuccess } = useGetMessagesQuery(crmMatterId, { pollingInterval: connected ? 0 : FALLBACK_POLL_MS, skipPollingIfUnfocused: true })
  refetchRef.current = refetch

  // Seen once the chat has loaded, and again whenever a new message arrives while it's open
  const [markRead] = useMarkMatterReadMutation()
  const lastMessageId = data.at(-1)?.id
  useEffect(() => {
    if (isSuccess) markRead(crmMatterId)
  }, [crmMatterId, isSuccess, lastMessageId, markRead])
  const [sendMessage] = useSendMessageMutation()
  const [outbox, setOutbox] = useState([])

  const deliver = async (item) => {
    setOutbox((prev) => prev.map((p) => (p.clientMessageId === item.clientMessageId ? { ...p, failed: false } : p)))
    try {
      await sendMessage({ crmMatterId, body: item.body, clientMessageId: item.clientMessageId }).unwrap()
      setOutbox((prev) => prev.filter((p) => p.clientMessageId !== item.clientMessageId))
    } catch {
      setOutbox((prev) => prev.map((p) => (p.clientMessageId === item.clientMessageId ? { ...p, failed: true } : p)))
    }
  }

  const handleSend = ({ body }) => {
    if (!body) return
    const item = { clientMessageId: newClientMessageId(), body, sentAt: new Date().toISOString() }
    setOutbox((prev) => [...prev, item])
    deliver(item)
  }

  const messages = useMemo(() => {
    const saved = data.map((m) => ({ id: m.id, author: authorOf(m), fromMe: m.mine, body: m.body, sentAt: m.sentAt }))
    // A poll can bring a message back before its own POST does
    const savedIds = new Set(data.map((m) => m.clientMessageId).filter(Boolean))
    const pending = outbox
      .filter((p) => !savedIds.has(p.clientMessageId))
      .map((p) => ({
        id: p.clientMessageId, author: 'You', fromMe: true, body: p.body, sentAt: p.sentAt,
        sending: !p.failed, failed: p.failed, onRetry: () => deliver(p),
      }))
    return [...saved, ...pending]
  }, [data, outbox])

  return <MessageThread messages={messages} onSend={handleSend} allowAttachments={false} />
}

// Full screen: no <Page> margin or panel; the thread fills the area below the top bar
function Messages() {
  const { selectedMatter } = useMatters()
  if (!selectedMatter) return null
  // Keyed by matter so switching matters starts that matter's thread fresh
  return <MatterMessages key={selectedMatter.id} matter={selectedMatter} />
}

export default Messages
