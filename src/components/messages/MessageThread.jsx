import { useEffect, useRef, useState } from 'react'
import EmptyState from '../ui/EmptyState'
import { InboxIcon } from '../ui/icons'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import { firm } from '../../data/sampleData'
import { groupByDay } from '../../utils/dates'

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

// Full-height conversation for one matter, grouped under day separators.
// Fills AppLayout's content area and scrolls internally; the top bar already names the matter.
function MessageThread({ matter }) {
  const [messages, setMessages] = useState(matter.messages)
  const scrollRef = useRef(null)
  const groups = groupByDay(messages, (m) => m.sentAt)

  // Start at, and stay at, the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  const handleSend = ({ body, files }) => {
    // TODO: POST the message (and upload attachments) to the backend
    const sentAt = new Date().toISOString()
    const base = { author: 'You', fromMe: true, sentAt }
    const outgoing = files.length === 0
      ? [{ ...base, id: newId(), body }]
      : files.map((file, i) => ({ ...base, id: newId(), body: i === 0 ? body : '', attachment: { name: file.name, size: file.size, file } }))
    setMessages((prev) => [...prev, ...outgoing])
  }

  return (
    <section aria-labelledby="messages-title" className="flex min-h-0 flex-1 flex-col bg-white">
      <h1 id="messages-title" className="sr-only">Messages with {firm.attorney.name} and the legal team</h1>

      <div ref={scrollRef} role="log" aria-label="Conversation" className="min-h-0 flex-1 overflow-y-auto bg-canvas px-6 pb-4 max-sm:px-3">
        {groups.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState icon={InboxIcon} title="No messages yet">
              Send a message to start the conversation with your legal team about this matter.
            </EmptyState>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-1.5">
              <div className="sticky top-0 z-10 flex justify-center pb-1 pt-4">
                <span className="rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-body shadow-sm">
                  {group.label}
                </span>
              </div>
              {group.items.map((message, i) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  firstOfRun={i === 0 || group.items[i - 1].author !== message.author}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <MessageComposer onSend={handleSend} />
    </section>
  )
}

export default MessageThread
