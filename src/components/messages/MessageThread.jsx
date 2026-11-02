import { useEffect, useRef } from 'react'
import EmptyState from '../ui/EmptyState'
import { InboxIcon } from '../ui/icons'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import { firm } from '../../data/sampleData'
import { groupByDay } from '../../utils/dates'

// Full-height conversation for one matter, grouped under day separators.
// Fills AppLayout's content area and scrolls internally; the top bar already names the matter.
// `title`: the screen-reader heading; the firm's side passes its own
function MessageThread({ messages, onSend, title, allowAttachments = true }) {
  const scrollRef = useRef(null)
  const groups = groupByDay(messages, (m) => m.sentAt)

  // Start at, and stay at, the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  return (
    <section aria-labelledby="messages-title" className="flex min-h-0 flex-1 flex-col bg-white">
      <h1 id="messages-title" className="sr-only">{title || `Messages with ${firm.attorney.name} and the legal team`}</h1>

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

      <MessageComposer onSend={onSend} allowAttachments={allowAttachments} />
    </section>
  )
}

export default MessageThread
