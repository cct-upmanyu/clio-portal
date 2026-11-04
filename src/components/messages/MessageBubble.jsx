import { useState } from 'react'
import Avatar from '../ui/Avatar'
import FileTile from '../ui/FileTile'
import { CheckIcon, CircleIcon, DownloadIcon } from '../ui/icons'
import { formatDateTime, formatMessageTime, formatTime } from '../../utils/dates'
import { formatBytes } from '../../utils/files'

// A file sent with the message. `progress` (0-1): still uploading; `deleted`: the firm removed it.
function Attachment({ attachment }) {
  const { name, size, progress, deleted, onDownload, onPreview } = attachment
  const uploading = typeof progress === 'number'

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 rounded-lg border border-line bg-white p-2 ${deleted ? 'opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <FileTile name={name} size="sm" />
        <span className="flex min-w-0 flex-1 flex-col">
          {onPreview && !deleted ? (
            <button type="button" onClick={onPreview} title="Preview" className="cursor-pointer truncate text-left text-[13px] font-medium hover:text-brand hover:underline">
              {name}
            </button>
          ) : (
            <span className={`truncate text-[13px] font-medium ${deleted ? 'line-through' : ''}`}>{name}</span>
          )}
          <span className="text-[11px] text-muted">
            {deleted ? 'File removed' : uploading ? `Uploading · ${Math.round(progress * 100)}%` : formatBytes(size)}
          </span>
        </span>
        {onDownload && !deleted && (
          <button
            type="button"
            onClick={onDownload}
            aria-label={`Download ${name}`}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle hover:text-brand"
          >
            <DownloadIcon className="size-4" />
          </button>
        )}
      </div>
      {uploading && (
        <span className="h-1 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
          <span className="block h-full rounded-full bg-brand transition-[width]" style={{ width: `${Math.max(progress * 100, 3)}%` }} />
        </span>
      )}
    </div>
  )
}

const READ_BLUE = 'text-[#34B7F1]'
const STATUS_LABEL = { none: 'Sent, not read yet', partial: 'Read by some', all: 'Read' }

// Two ticks coloured separately: both grey (not read), first blue (read by some of the clients), both blue
function Ticks({ status }) {
  const first = status === 'none' ? 'text-muted' : READ_BLUE
  const second = status === 'all' ? READ_BLUE : 'text-muted'
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
      <path d="M2 12.5l4.5 4.5L15 8.5" stroke="currentColor" className={first} />
      <path d="M11 15.5l1.5 1.5L21 8.5" stroke="currentColor" className={second} />
    </svg>
  )
}

// Who among the matter's clients has read a firm message (firm users only)
function Readers({ readers }) {
  if (readers.length === 0) return <p className="text-xs text-muted">No client has access to this matter yet.</p>
  return (
    <ul className="flex flex-col gap-1">
      {readers.map((reader) => (
        <li key={reader.userId} className="flex items-center gap-1.5 text-xs">
          {reader.read
            ? <CheckIcon className={`size-3.5 shrink-0 ${READ_BLUE}`} aria-hidden="true" />
            : <CircleIcon className="size-3.5 shrink-0 text-muted" aria-hidden="true" />}
          <span className="font-medium text-ink">{reader.name}</span>
          <span className="text-muted">{reader.read ? `· Read ${formatDateTime(reader.readAt)}` : '· Not read yet'}</span>
        </li>
      ))}
    </ul>
  )
}

function Receipt({ receipt }) {
  const [open, setOpen] = useState(false)
  const label = STATUS_LABEL[receipt.status]
  // The client side only gets the ticks; the firm can open who has read it
  if (!receipt.readers) {
    return (
      <span title={label}>
        <Ticks status={receipt.status} />
        <span className="sr-only">{label}</span>
      </span>
    )
  }
  const readCount = receipt.readers.filter((r) => r.read).length
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={`${label} · ${readCount} of ${receipt.readers.length} clients`}
        className="-m-1 flex cursor-pointer items-center rounded p-1 hover:bg-white/60"
      >
        <Ticks status={receipt.status} />
        <span className="sr-only">{`${label}, ${readCount} of ${receipt.readers.length} clients. Show who has read it`}</span>
      </button>
      {open && (
        <span className="basis-full rounded-lg bg-white/70 px-2.5 py-2">
          <Readers readers={receipt.readers} />
        </span>
      )}
    </>
  )
}

// One chat message. `firstOfRun` = first of consecutive messages from the same person: the name, the
// full date and time and the avatar go with it; the rest of the run sits under it with just the time.
// `receipt` (my messages only): see MatterChat. The avatar shrinks on phones so the text gets the room.
function MessageBubble({ message, firstOfRun }) {
  const { fromMe, author, name, body, sentAt, attachment, sending, failed, onRetry, receipt } = message
  const who = name || author
  const avatar = firstOfRun
    ? <span className="mt-6 shrink-0 max-sm:mt-5"><Avatar name={who} size="chat" /></span>
    : <span aria-hidden="true" className="w-8 shrink-0 max-sm:w-6" />

  return (
    <div className={`flex items-start gap-2.5 max-sm:gap-1.5 ${fromMe ? 'flex-row-reverse' : ''} ${firstOfRun ? 'mt-4 max-sm:mt-3' : ''}`}>
      {avatar}

      <div className={`flex min-w-0 max-w-[min(720px,85%)] flex-col gap-1 max-sm:max-w-[calc(100%-1.875rem)] ${fromMe ? 'items-end' : 'items-start'}`}>
        {firstOfRun && (
          <p className={`flex max-w-full flex-wrap items-baseline gap-x-2 px-0.5 ${fromMe ? 'justify-end' : ''}`}>
            <span className="truncate text-[13px] font-semibold text-ink max-sm:text-xs">{who}</span>
            <time dateTime={sentAt} className="text-xs text-muted max-sm:text-[11px]">
              {sending ? 'Sending…' : formatMessageTime(sentAt)}
            </time>
          </p>
        )}

        <div className={`flex min-w-0 max-w-full flex-col gap-1.5 rounded-lg px-3.5 py-2.5 max-sm:px-3 max-sm:py-2 ${
          fromMe ? 'bg-[#E3F0FC]' : 'bg-[#F1F3F6]'
        }`}>
          {attachment && <Attachment attachment={attachment} />}
          {body && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink max-sm:text-[13.5px]">{body}</p>}
          {failed ? (
            <button type="button" onClick={onRetry} className="cursor-pointer self-end text-[11px] font-medium leading-none text-danger hover:underline">
              Not sent · Retry
            </button>
          ) : (!firstOfRun || (fromMe && !sending && receipt)) && (
            <span className="flex flex-wrap items-center justify-end gap-1 self-end text-[11px] leading-none text-muted">
              {!firstOfRun && <time dateTime={sentAt}>{sending ? 'Sending…' : formatTime(sentAt)}</time>}
              {fromMe && !sending && receipt && <Receipt receipt={receipt} />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
