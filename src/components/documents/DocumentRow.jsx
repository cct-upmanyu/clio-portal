import FileTile from '../ui/FileTile'
import { DownloadIcon, EyeIcon } from '../ui/icons'
import { formatDate } from '../../utils/dates'
import { formatBytes } from '../../utils/files'

const actionClass = 'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-body hover:bg-subtle hover:text-brand'

function DocumentRow({ doc, onPreview, onDownload }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <FileTile name={doc.name} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button type="button" onClick={() => onPreview(doc)} className="cursor-pointer truncate text-left text-sm font-medium hover:text-brand">
          {doc.name}
        </button>
        <span className="truncate text-[13px] text-muted">
          {formatBytes(doc.size)} · Shared by {doc.sharedBy} · {formatDate(doc.sharedAt)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button type="button" onClick={() => onPreview(doc)} aria-label={`Preview ${doc.name}`} title="Preview" className={actionClass}>
          <EyeIcon className="size-[18px]" />
        </button>
        <button type="button" onClick={() => onDownload(doc)} aria-label={`Download ${doc.name}`} title="Download" className={actionClass}>
          <DownloadIcon className="size-[18px]" />
        </button>
      </div>
    </li>
  )
}

export default DocumentRow
