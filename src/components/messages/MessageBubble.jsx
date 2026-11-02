import { useState } from 'react'
import Avatar from '../ui/Avatar'
import FileTile from '../ui/FileTile'
import { CheckIcon, CircleIcon, DownloadIcon } from '../ui/icons'
import { formatDateTime, formatTime } from '../../utils/dates'
import { formatBytes, saveFile } from '../../utils/files'

function Attachment({ attachment }) {
  const handleDownload = () => {
    if (attachment.file) saveFile(attachment.file)
    // TODO: otherwise fetch a download URL for the attachment from the backend
  }

  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-lg border border-line bg-white p-2">
      <FileTile name={attachment.name} size="sm" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-medium">{attachment.name}</span>
        <span className="text-[11px] text-muted">{formatBytes(attachment.size)}</span>
      </span>
      <button
        type="button"
        onClick={handleDownload}
        aria-label={`Download ${attachment.name}`}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle hover:text-brand"
      >
        <DownloadIcon className="size-4" />
      </button>
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

// One chat message. `firstOfRun` = first of consecutive messages from the same person,
// which shows the avatar and name and adds space above. `receipt` (my messages only): see MatterChat.
function MessageBubble({ message, firstOfRun }) {
  const { fromMe, author, body, sentAt, attachment, sending, failed, onRetry, receipt } = message

  return (
    <div className={`flex items-start gap-2 ${fromMe ? 'justify-end' : ''} ${firstOfRun ? 'mt-3' : ''}`}>
      {!fromMe && (firstOfRun ? <Avatar name={author} size="xs" /> : <span aria-hidden="true" className="w-8 shrink-0" />)}

      <div
        className={`flex max-w-[min(560px,80%)] flex-col gap-1.5 rounded-2xl px-3.5 py-2.5 ${
          fromMe ? 'bg-[#D3E6FA]' : 'border border-line bg-white'
        } ${firstOfRun ? (fromMe ? 'rounded-tr-md' : 'rounded-tl-md') : ''}`}
      >
        {!fromMe && firstOfRun && <span className="text-[13px] font-semibold">{author}</span>}
        {attachment && <Attachment attachment={attachment} />}
        {body && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{body}</p>}
        {failed ? (
          <button type="button" onClick={onRetry} className="cursor-pointer self-end text-[11px] font-medium leading-none text-danger hover:underline">
            Not sent · Retry
          </button>
        ) : (
          <span className="flex flex-wrap items-center justify-end gap-1 self-end text-[11px] leading-none text-muted">
            <time dateTime={sentAt}>{sending ? 'Sending…' : formatTime(sentAt)}</time>
            {fromMe && !sending && receipt && <Receipt receipt={receipt} />}
          </span>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
