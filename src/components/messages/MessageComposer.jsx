import { useRef, useState } from 'react'
import FileTile from '../ui/FileTile'
import { CloseIcon, PaperclipIcon, SendIcon } from '../ui/icons'
import { formatBytes } from '../../utils/files'

const MAX_HEIGHT = 160

// Text box + attachments. Enter sends, Shift+Enter adds a new line.
function MessageComposer({ onSend }) {
  const [body, setBody] = useState('')
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)
  const textRef = useRef(null)
  const canSend = body.trim().length > 0 || files.length > 0

  const autoGrow = (el) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }

  const submit = (e) => {
    e?.preventDefault()
    if (!canSend) return
    onSend({ body: body.trim(), files })
    setBody('')
    setFiles([])
    if (textRef.current) textRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={submit} className="border-t border-line bg-white p-3 max-sm:p-2">
      {files.length > 0 && (
        <ul aria-label="Attachments" className="flex flex-wrap gap-2 pb-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex max-w-[260px] items-center gap-2 rounded-lg border border-line bg-canvas py-1 pl-1 pr-1">
              <FileTile name={file.name} size="sm" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-xs font-medium">{file.name}</span>
                <span className="text-[11px] text-muted">{formatBytes(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, index) => index !== i))}
                aria-label={`Remove ${file.name}`}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-ink"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-1.5 rounded-xl border border-field bg-white p-1.5 focus-within:border-brand focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-brand">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle"
        >
          <PaperclipIcon className="size-[18px]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const picked = [...e.target.files]
            setFiles((prev) => [...prev, ...picked])
            e.target.value = ''
          }}
        />

        <label htmlFor="message-input" className="sr-only">Message</label>
        <textarea
          id="message-input"
          ref={textRef}
          rows={1}
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            autoGrow(e.target)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-5 outline-none placeholder:text-muted"
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon className="size-4" />
        </button>
      </div>
      <p className="mt-1.5 px-1 text-[11px] text-muted max-sm:hidden">Enter to send · Shift + Enter for a new line</p>
    </form>
  )
}

export default MessageComposer
