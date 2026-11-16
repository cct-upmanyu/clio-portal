import { useRef, useState } from 'react'
import FileTile from '../ui/FileTile'
import RichTextInput from './RichTextInput'
import { CloseIcon, PaperclipIcon, SendIcon } from '../ui/icons'
import { DOCUMENT_ACCEPT, formatBytes } from '../../utils/files'
import { hasFormatting, sanitizeHtml } from '../../utils/richText'

// Formatted text + attachments. Enter sends, Shift+Enter adds a new line.
// onSend({ body, html?, files }): `html` only when the text has formatting; `body` is always the plain text.
// `onTyping`: called on every keystroke, for the "typing…" others see
function MessageComposer({ onSend, onTyping, allowAttachments = true }) {
  const [hasText, setHasText] = useState(false)
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)
  const editorRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const canSend = hasText || files.length > 0

  const addFiles = (picked) => {
    if (allowAttachments && picked.length > 0) setFiles((prev) => [...prev, ...picked])
  }

  const submit = (e) => {
    e?.preventDefault()
    const editor = editorRef.current
    const body = editor?.text() || ''
    if (!body && files.length === 0) return
    const html = body ? sanitizeHtml(editor.html()) : ''
    onSend({ body, html: hasFormatting(html) ? html : undefined, files })
    editor?.clear()
    editor?.focus()
    setFiles([])
  }

  const isFileDrag = (e) => allowAttachments && [...(e.dataTransfer?.types || [])].includes('Files')

  return (
    <form
      onSubmit={submit}
      onDragOver={(e) => {
        if (!isFileDrag(e)) return
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
      }}
      onDrop={(e) => {
        if (!isFileDrag(e)) return
        e.preventDefault()
        setDragging(false)
        addFiles([...e.dataTransfer.files])
      }}
      className={`border-t border-line bg-white px-3 pb-3 max-sm:px-2 max-sm:pb-2 ${dragging ? 'bg-brand-soft' : ''}`}
    >
      <RichTextInput
        ref={editorRef}
        onChange={(text) => {
          setHasText(Boolean(text))
          if (text) onTyping?.()
        }}
        onSubmit={submit}
        onFiles={addFiles}
      />

      {files.length > 0 && (
        <ul aria-label="Attachments" className="flex flex-wrap gap-2 pt-2">
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

      <div className="flex items-center gap-2 pt-2">
        {allowAttachments && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach files"
            title="Attach files"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle"
          >
            <PaperclipIcon className="size-[18px]" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept={DOCUMENT_ACCEPT}
          onChange={(e) => {
            addFiles([...e.target.files])
            e.target.value = ''
          }}
        />
        <p className="min-w-0 flex-1 truncate text-[11px] text-muted max-sm:invisible">Enter to send · Shift + Enter for a new line</p>
        <button
          type="submit"
          disabled={!canSend}
          className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendIcon className="size-4" />
          Send
        </button>
      </div>
    </form>
  )
}

export default MessageComposer
