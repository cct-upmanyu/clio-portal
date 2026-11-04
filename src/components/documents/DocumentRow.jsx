import { FileGlyph } from './FileTypeIcon'
import { DownloadIcon, EyeIcon, LockIcon, MessageIcon, TrashIcon } from '../ui/icons'
import { formatDateTime, formatShort } from '../../utils/dates'
import { formatBytes, previewKind, sharedByLabel } from '../../utils/files'

// Name, then Shared by, Date, Size and actions on wider screens; phones put the details under the name.
// The same compact row as the OneDrive tab.
const DOCUMENT_COLUMNS = 'sm:grid sm:grid-cols-[minmax(0,1fr)_150px_96px_80px_96px] sm:items-center'
// Shown on hover where there is hover (mouse); always shown on touch screens
const HOVER_ACTIONS = '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100'
const iconButton = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-white hover:text-brand hover:shadow-[0_0_0_1px_var(--color-line)]'

// `onDelete`: firm only. `showVisibility`: the firm's view, where "Firm only" files are marked.
// Files the portal can't show (Word, zip…) have no preview: their name downloads them.
function DocumentRow({ doc, onPreview, onDownload, onDelete, showVisibility = false }) {
  const previewable = Boolean(previewKind(doc.name))
  return (
    <li className={`group flex items-center gap-3 px-2 py-1.5 hover:bg-canvas sm:rounded-md ${DOCUMENT_COLUMNS}`}>
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <FileGlyph name={doc.name} className="size-7" />
        <span className="flex min-w-0 flex-col">
          <span className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => (previewable ? onPreview(doc) : onDownload(doc))}
              title={previewable ? `Preview ${doc.name}` : `Download ${doc.name}`}
              className="min-w-0 cursor-pointer truncate text-left text-sm text-ink hover:text-brand hover:underline"
            >
              {doc.name}
            </button>
            {doc.messageId && (
              <span title="Sent in the chat" className="inline-flex shrink-0 items-center text-muted">
                <MessageIcon className="size-3.5" />
                <span className="sr-only">Sent in the chat</span>
              </span>
            )}
            {showVisibility && doc.visibility === 'firm' && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-subtle px-1.5 py-px text-[10.5px] font-semibold text-body">
                <LockIcon className="size-2.5" /> Firm only
              </span>
            )}
          </span>
          <span className="truncate text-xs text-muted sm:hidden">
            {formatBytes(doc.size)} · {sharedByLabel(doc)} · {formatShort(doc.uploadedAt)}
          </span>
        </span>
      </span>
      <span className="hidden truncate text-[13px] text-muted sm:block">{sharedByLabel(doc)}</span>
      <span className="hidden truncate text-[13px] text-muted sm:block" title={formatDateTime(doc.uploadedAt)}>{formatShort(doc.uploadedAt)}</span>
      <span className="hidden text-right text-[13px] tabular-nums text-muted sm:block">{formatBytes(doc.size)}</span>
      <span className={`flex shrink-0 justify-end gap-0.5 ${HOVER_ACTIONS}`}>
        {previewable && (
          <button type="button" onClick={() => onPreview(doc)} aria-label={`Preview ${doc.name}`} title="Preview" className={iconButton}>
            <EyeIcon className="size-4" />
          </button>
        )}
        <button type="button" onClick={() => onDownload(doc)} aria-label={`Download ${doc.name}`} title="Download" className={iconButton}>
          <DownloadIcon className="size-4" />
        </button>
        {onDelete && (
          <button type="button" onClick={() => onDelete(doc)} aria-label={`Remove ${doc.name}`} title="Remove" className={`${iconButton} hover:text-danger`}>
            <TrashIcon className="size-4" />
          </button>
        )}
      </span>
    </li>
  )
}

export default DocumentRow
