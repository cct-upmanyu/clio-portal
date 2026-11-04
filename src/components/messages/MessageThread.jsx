import { useEffect, useLayoutEffect, useRef } from 'react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { InboxIcon } from '../ui/icons'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'
import { firm } from '../../data/sampleData'
import { groupByDay } from '../../utils/dates'

// While the first page loads: a few bubbles in the shape of a conversation (theirs on the left with an
// avatar, mine on the right), at the bottom like the real thing, instead of "No messages yet".
const SKELETON = [
  { mine: false, lines: [72, 48] },
  { mine: true, lines: [56] },
  { mine: false, lines: [64] },
  { mine: true, lines: [80, 60] },
  { mine: false, lines: [40] },
  { mine: true, lines: [52] },
]

export function SkeletonMessages() {
  return (
    <div aria-hidden="true" className="flex flex-1 flex-col justify-end gap-3 pt-4">
      <div className="flex justify-center">
        <span className="h-6 w-20 animate-pulse rounded-full bg-subtle" />
      </div>
      {SKELETON.map((bubble, i) => (
        <div key={i} className={`flex items-start gap-2.5 max-sm:gap-1.5 ${bubble.mine ? 'flex-row-reverse' : ''}`}>
          <span className="size-8 shrink-0 animate-pulse rounded-full bg-line max-sm:size-6" />
          <div
            className={`flex w-[min(360px,75%)] animate-pulse flex-col gap-2 rounded-lg px-3.5 py-3 ${
              bubble.mine ? 'items-end bg-[#E3F0FC]' : 'bg-[#F1F3F6]'
            }`}
          >
            {bubble.lines.map((width, j) => (
              <span key={j} className="h-2.5 rounded-full bg-white/80" style={{ width: `${width}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Full-height conversation for one matter, grouped under day separators.
// Fills AppLayout's content area and scrolls internally; the top bar already names the matter.
// `title`: the screen-reader heading; the firm's side passes its own. `header`: shown above the
// conversation (e.g. who's online). `typingText`: "Sam is typing…" above the composer.
// `loading`: the first page hasn't arrived (skeletons); `loadError` + `onRetry`: it failed.
function MessageThread({ messages, onSend, onTyping, title, header, typingText, emptyText, allowAttachments = true, loading = false, loadError = false, onRetry }) {
  const scrollRef = useRef(null)
  const contentRef = useRef(null)
  const groups = groupByDay(messages, (m) => m.sentAt)

  // Open at, and stay at, the newest message, until the reader scrolls up to read older ones.
  // Things that change height after the first paint (the online bar, fonts, late messages) would
  // otherwise leave the view short of the bottom, so any change of size scrolls it back down too.
  const stickToBottom = useRef(true)
  const toBottom = () => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }
  const handleScroll = () => {
    const el = scrollRef.current
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  // Sending a message brings you back to the bottom, wherever you'd scrolled to
  const last = messages.at(-1)
  const lastKey = last ? `${last.id}${last.fromMe ? ':me' : ''}` : ''
  const previousLast = useRef(lastKey)
  if (lastKey !== previousLast.current) {
    if (last?.fromMe) stickToBottom.current = true
    previousLast.current = lastKey
  }

  useLayoutEffect(() => {
    if (stickToBottom.current) toBottom()
  })

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (stickToBottom.current) toBottom()
    })
    if (contentRef.current) observer.observe(contentRef.current)
    if (scrollRef.current) observer.observe(scrollRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section aria-labelledby="messages-title" className="relative flex min-h-0 flex-1 flex-col bg-white">
      <h1 id="messages-title" className="sr-only">{title || `Messages with ${firm.attorney.name} and the legal team`}</h1>
      {header}

      {/* `relative`: screen-reader-only labels in the bubbles are absolutely positioned; without a positioned
          ancestor they'd be placed against the page and make it taller than the window, so the whole
          page would scroll. `overscroll-contain`: scrolling past the conversation's end stays here. */}
      <div ref={scrollRef} onScroll={handleScroll} role="log" aria-label="Conversation" aria-busy={loading} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-6 pb-4 max-sm:px-3">
        <div ref={contentRef} className="flex min-h-full flex-col">
          {loading ? (
            <SkeletonMessages />
          ) : loadError && groups.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <EmptyState icon={InboxIcon} title="We couldn't load the messages">Please try again in a moment.</EmptyState>
              {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
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
      </div>

      <p aria-live="polite" className="h-5 shrink-0 truncate bg-white px-6 text-xs italic text-muted max-sm:px-3">{typingText}</p>
      <MessageComposer onSend={onSend} onTyping={onTyping} allowAttachments={allowAttachments} />
    </section>
  )
}

export default MessageThread
