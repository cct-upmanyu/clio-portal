import { Link } from 'react-router-dom'
import { ChevronRightIcon, DocumentIcon, FileIcon, ImageIcon, MessageIcon, TaskIcon } from './icons'

const KINDS = {
  pdf: { icon: DocumentIcon, tile: 'bg-danger-soft text-danger' },
  image: { icon: ImageIcon, tile: 'bg-brand-soft text-brand' },
  file: { icon: FileIcon, tile: 'bg-subtle text-body' },
  message: { icon: MessageIcon, tile: 'bg-[#E9EEF5] text-navy' },
  task: { icon: TaskIcon, tile: 'bg-warning-soft text-warning' },
}

// One clickable row: icon tile, title, details line, optional trailing text.
// Put several in a `divide-y divide-divider` container to get separators.
function ListItem({ to, kind = 'file', title, meta, trailing, unread = false }) {
  const { icon: Icon, tile } = KINDS[kind] ?? KINDS.file

  return (
    <Link to={to} className="group flex min-h-16 items-center gap-3 py-2.5">
      <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tile}`}>
        <Icon className="size-[18px]" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`truncate text-sm group-hover:text-brand ${unread ? 'font-semibold' : 'font-medium'}`}>{title}</span>
          {unread && (
            <>
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand" />
              <span className="sr-only">Unread</span>
            </>
          )}
        </span>
        {meta && <span className="truncate text-[13px] text-muted">{meta}</span>}
      </span>

      {trailing && <span className="shrink-0 whitespace-nowrap text-xs text-muted">{trailing}</span>}
      <ChevronRightIcon className="size-[18px] shrink-0 text-muted" />
    </Link>
  )
}

export default ListItem
