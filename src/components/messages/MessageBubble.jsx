import Avatar from '../ui/Avatar'
import FileTile from '../ui/FileTile'
import { DownloadIcon } from '../ui/icons'
import { formatTime } from '../../utils/dates'
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

// One chat message. `firstOfRun` = first of consecutive messages from the same person,
// which shows the avatar and name and adds space above.
function MessageBubble({ message, firstOfRun }) {
  const { fromMe, author, body, sentAt, attachment } = message

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
        <time dateTime={sentAt} className="self-end text-[11px] leading-none text-muted">{formatTime(sentAt)}</time>
      </div>
    </div>
  )
}

export default MessageBubble
