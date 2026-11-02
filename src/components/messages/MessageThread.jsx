import { useEffect, useRef } from 'react'
import EmptyState from '../ui/EmptyState'
import { InboxIcon } from '../ui/icons'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import { firm } from '../../data/sampleData'
import { groupByDay } from '../../utils/dates'

// Full-height conversation for one matter, grouped under day separators.
// Fills AppLayout's content area and scrolls internally; the top bar already names the matter.
// `title`: the screen-reader heading; the firm's side passes its own. `header`: shown above the
// conversation (e.g. who's online). `typingText`: "Sam is typing…" above the composer.
function MessageThread({ messages, onSend, onTyping, title, header, typingText, emptyText, allowAttachments = true }) {
  const scrollRef = useRef(null)
  const groups = groupByDay(messages, (m) => m.sentAt)

  // Start at, and stay at, the newest message
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  return (
    <section aria-labelledby="messages-title" className="relative flex min-h-0 flex-1 flex-col bg-white">
      <h1 id="messages-title" className="sr-only">{title || `Messages with ${firm.attorney.name} and the legal team`}</h1>
      {header}

      {/* `relative`: screen-reader-only labels in the bubbles are absolutely positioned; without a positioned
          ancestor they'd be placed against the page and make it taller than the window, so the whole
          page would scroll. `overscroll-contain`: scrolling past the conversation's end stays here. */}
      <div ref={scrollRef} role="log" aria-label="Conversation" className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-canvas px-6 pb-4 max-sm:px-3">
        {groups.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState icon={InboxIcon} title="No messages yet">
              {emptyText || 'Send a message to start the conversation with your legal team about this matter.'}
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

      <p aria-live="polite" className="h-5 shrink-0 truncate bg-canvas px-6 text-xs italic text-muted max-sm:px-3">{typingText}</p>
      <MessageComposer onSend={onSend} onTyping={onTyping} allowAttachments={allowAttachments} />
    </section>
  )
}

export default MessageThread
