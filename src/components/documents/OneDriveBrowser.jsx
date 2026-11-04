import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import {
  ChevronLeftIcon, ChevronRightIcon, CloseIcon, DocumentsIcon, DownloadIcon, ExternalLinkIcon, EyeIcon,
  SearchIcon, UploadIcon,
} from '../ui/icons'
import { FileGlyph, FolderGlyph } from './FileTypeIcon'
import PreviewDialog from './PreviewDialog'
import ShareDocumentsDialog from './ShareDocumentsDialog'
import { useOneDriveDownload, useOneDriveUpload } from '../../hooks/useOneDrive'
import { useGetOneDriveFolderQuery } from '../../redux/api/oneDriveApi'
import { formatDateTime, formatShort } from '../../utils/dates'
import { formatBytes, previewKind } from '../../utils/files'

// Name, then Modified, Size and actions on wider screens; phones put the details under the name
const COLUMNS = 'sm:grid sm:grid-cols-[minmax(0,1fr)_112px_88px_76px] sm:items-center'
// Shown on hover where there is hover (mouse); always shown on touch screens
const HOVER_ACTIONS = '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:opacity-100'
const FILTER_FROM = 8

const countLabel = (n) => (n === 1 ? '1 item' : `${n} items`)

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }),
  modified: (a, b) => new Date(a.modifiedAt || 0) - new Date(b.modifiedAt || 0),
  size: (a, b) => (a.folder ? a.childCount ?? 0 : a.size ?? 0) - (b.folder ? b.childCount ?? 0 : b.size ?? 0),
}

// The Sort menu: [value, label, key, direction]. Folders always stay first.
const SORT_OPTIONS = [
  ['name', 'Name A–Z', 'name', 1],
  ['name-desc', 'Name Z–A', 'name', -1],
  ['newest', 'Newest first', 'modified', -1],
  ['oldest', 'Oldest first', 'modified', 1],
  ['largest', 'Largest first', 'size', -1],
]

const iconButton = 'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-white hover:text-brand hover:shadow-[0_0_0_1px_var(--color-line)]'

function FolderRow({ item, onOpen }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={`group flex w-full cursor-pointer items-center gap-3 px-2 py-1.5 text-left hover:bg-canvas sm:rounded-md focus-visible:bg-canvas focus-visible:outline-none ${COLUMNS}`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <FolderGlyph className="size-7" />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-ink group-hover:text-brand">{item.name}</span>
            <span className="text-xs text-muted sm:hidden">
              {item.childCount !== null ? countLabel(item.childCount) : 'Folder'}{item.modifiedAt ? ` · ${formatShort(item.modifiedAt)}` : ''}
            </span>
          </span>
        </span>
        <span className="hidden truncate text-[13px] text-muted sm:block" title={item.modifiedAt ? formatDateTime(item.modifiedAt) : undefined}>
          {item.modifiedAt ? formatShort(item.modifiedAt) : ''}
        </span>
        <span className="hidden text-right text-[13px] text-muted sm:block">{item.childCount !== null ? countLabel(item.childCount) : ''}</span>
        <span className="ml-auto flex justify-end sm:ml-0">
          <ChevronRightIcon className="size-4 text-muted group-hover:text-brand" />
        </span>
      </button>
    </li>
  )
}

function FileRow({ item, onPreview, onDownload }) {
  const previewable = Boolean(previewKind(item.name))
  return (
    <li className={`group flex items-center gap-3 px-2 py-1.5 hover:bg-canvas sm:rounded-md ${COLUMNS}`}>
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <FileGlyph name={item.name} className="size-7" />
        <span className="flex min-w-0 flex-col">
          <button
            type="button"
            onClick={() => (previewable ? onPreview(item) : onDownload(item))}
            title={previewable ? `Preview ${item.name}` : `Download ${item.name}`}
            className="min-w-0 cursor-pointer truncate text-left text-sm text-ink hover:text-brand hover:underline"
          >
            {item.name}
          </button>
          <span className="text-xs text-muted sm:hidden">
            {formatBytes(item.size)}{item.modifiedAt ? ` · ${formatShort(item.modifiedAt)}` : ''}
          </span>
        </span>
      </span>
      <span className="hidden truncate text-[13px] text-muted sm:block" title={item.modifiedAt ? formatDateTime(item.modifiedAt) : undefined}>
        {item.modifiedAt ? formatShort(item.modifiedAt) : ''}
      </span>
      <span className="hidden text-right text-[13px] tabular-nums text-muted sm:block">{formatBytes(item.size)}</span>
      <span className={`flex shrink-0 justify-end gap-0.5 ${HOVER_ACTIONS}`}>
        {previewable && (
          <button type="button" onClick={() => onPreview(item)} aria-label={`Preview ${item.name}`} title="Preview" className={iconButton}>
            <EyeIcon className="size-4" />
          </button>
        )}
        <button type="button" onClick={() => onDownload(item)} aria-label={`Download ${item.name}`} title="Download" className={iconButton}>
          <DownloadIcon className="size-4" />
        </button>
      </span>
    </li>
  )
}

function SkeletonRows() {
  return (
    <ul aria-hidden="true">
      {[68, 52, 74, 46, 60, 40].map((width, i) => (
        <li key={i} className="flex items-center gap-2.5 px-2 py-2">
          <span className="size-7 shrink-0 animate-pulse rounded-md bg-subtle" />
          <span className="h-3.5 animate-pulse rounded bg-subtle" style={{ width: `${width}%` }} />
        </li>
      ))}
    </ul>
  )
}

// The matter's OneDrive folder, read live, as a compact file explorer: open folders, sort, filter, preview
// or download files, upload into the open folder (Upload, or drop files anywhere on the list). No linked
// folder: a note saying so. `firm`: the Admin Console, which also gets "Open in OneDrive". Key it by matter
// so switching matters starts at the top.
function OneDriveBrowser({ crmMatterId, firm = false }) {
  // The folders opened from the top: [{ id, name }]; empty = the matter's own folder
  const [trail, setTrail] = useState([])
  const current = trail.at(-1)
  const { data, isLoading, isFetching, isError, refetch } = useGetOneDriveFolderQuery(
    { crmMatterId, folderId: current?.id },
    { refetchOnFocus: true },
  )
  const upload = useOneDriveUpload(crmMatterId, current?.id)
  const { linkFor, download } = useOneDriveDownload(crmMatterId)
  const [uploading, setUploading] = useState(false)
  const [dropped, setDropped] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')

  const items = data?.items
  // Folders always first; then the chosen order. Filtered by name.
  const shown = useMemo(() => {
    const query = filter.trim().toLowerCase()
    const list = (items ?? []).filter((item) => !query || item.name.toLowerCase().includes(query))
    const [, , key, dir] = SORT_OPTIONS.find(([value]) => value === sortBy)
    return [...list].sort((a, b) => (Number(b.folder) - Number(a.folder)) || SORTS[key](a, b) * dir)
  }, [items, filter, sortBy])

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <EmptyState title="We couldn't load the files">Please try again in a moment.</EmptyState>
        <Button variant="secondary" onClick={refetch}>Try again</Button>
      </div>
    )
  }
  if (!isLoading && !data?.linked) {
    return (
      <EmptyState icon={DocumentsIcon} title="No folder is linked to this matter yet">
        {firm
          ? 'Add the OneDrive Drive ID and Folder Item ID to this matter in Zoho CRM. The folder shows here once the matter syncs.'
          : 'Your legal team hasn’t shared a folder for this matter. Please contact them to share files with you or to give you access.'}
      </EmptyState>
    )
  }

  const root = data?.root
  const folder = data?.folder
  const crumbs = [{ id: undefined, name: root?.name ?? 'Files' }, ...trail]
  const folderName = folder?.name ?? crumbs.at(-1).name

  const openFolder = (item) => {
    setFilter('')
    setTrail([...trail, { id: item.id, name: item.name }])
  }
  const goTo = (depth) => {
    setFilter('')
    setTrail(trail.slice(0, depth))
  }
  const openUpload = (files = null) => {
    setDropped(files)
    setUploading(true)
  }

  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')
  const dropHandlers = {
    onDragOver: (e) => {
      if (!hasFiles(e) || !folder) return
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: (e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
    },
    onDrop: (e) => {
      if (!hasFiles(e) || !folder) return
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) openUpload([...e.dataTransfer.files])
    },
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-white" {...dropHandlers}>
      {/* Toolbar: where you are, sort, filter, actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-2 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {trail.length > 0 && (
            <button
              type="button"
              onClick={() => goTo(trail.length - 1)}
              aria-label="Back to the parent folder"
              className="-ml-1 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-brand"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
          )}
          <nav aria-label="Folder path" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-1 text-sm">
              {crumbs.map((crumb, i) => {
                const last = i === crumbs.length - 1
                return (
                  <li key={crumb.id ?? 'root'} className={`flex min-w-0 items-center gap-1 ${last ? 'min-w-0' : 'shrink max-sm:hidden'}`}>
                    {last ? (
                      <span aria-current="page" className="truncate font-semibold text-ink">{crumb.name}</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => goTo(i)}
                          className="max-w-[160px] cursor-pointer truncate rounded px-1 text-muted hover:bg-subtle hover:text-brand"
                        >
                          {crumb.name}
                        </button>
                        <ChevronRightIcon className="size-3.5 shrink-0 text-muted" />
                      </>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 max-sm:w-full">
          <label className="relative flex shrink-0 items-center">
            <span className="sr-only">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 cursor-pointer appearance-none rounded-md border border-field bg-white pl-2.5 pr-7 text-[13px] text-body hover:border-brand focus:border-brand focus:outline-none"
            >
              {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <ChevronRightIcon className="pointer-events-none absolute right-2 size-3.5 rotate-90 text-muted" />
          </label>
          {(items?.length ?? 0) > FILTER_FROM && (
            <label className="relative flex min-w-0 items-center max-sm:flex-1">
              <span className="sr-only">Filter this folder</span>
              <SearchIcon className="pointer-events-none absolute left-2.5 size-4 text-muted" />
              <input
                type="search"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter"
                className="h-8 w-44 rounded-md border border-field bg-white pl-8 pr-7 text-[13px] placeholder:text-muted focus:border-brand focus:outline-none max-sm:w-full [&::-webkit-search-cancel-button]:hidden"
              />
              {filter && (
                <button type="button" onClick={() => setFilter('')} aria-label="Clear filter" className="absolute right-1 flex size-6 cursor-pointer items-center justify-center rounded text-muted hover:text-ink">
                  <CloseIcon className="size-3.5" />
                </button>
              )}
            </label>
          )}
          {firm && folder?.webUrl && (
            <button
              type="button"
              onClick={() => window.open(folder.webUrl, '_blank', 'noopener')}
              aria-label="Open in OneDrive"
              title="Open in OneDrive"
              className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-line px-2.5 text-[13px] font-medium text-body hover:border-brand hover:text-brand"
            >
              <ExternalLinkIcon className="size-4" />
              <span className="max-md:hidden">OneDrive</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => openUpload()}
            disabled={!folder}
            aria-label={`Upload to ${folderName}`}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-brand px-3 text-[13px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
          >
            <UploadIcon className="size-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Opening another folder: a thin bar while it loads, the old list stays */}
      <div className={`h-0.5 shrink-0 ${isFetching && !isLoading ? 'animate-pulse bg-brand' : 'bg-transparent'}`} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
      {isLoading ? (
        <SkeletonRows />
      ) : shown.length > 0 ? (
        <ul className="divide-y divide-divider" aria-label={`Contents of ${folderName}`}>
          {shown.map((item) => (item.folder ? (
            <FolderRow key={item.id} item={item} onOpen={openFolder} />
          ) : (
            <FileRow
              key={item.id}
              item={item}
              // Built once here: the preview reloads whenever this object changes
              onPreview={(file) => setPreviewItem({ id: file.id, name: file.name, size: file.size, uploadedAt: file.modifiedAt })}
              onDownload={download}
            />
          )))}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-[13px] text-muted">
          {filter ? `Nothing in ${folderName} matches “${filter}”.` : <>This folder is empty. <span className="max-sm:hidden">Drop files here or use Upload.</span></>}
        </p>
      )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-2 py-2 text-xs text-muted">
        <span>
          {items ? (filter ? `${shown.length} of ${countLabel(items.length)}` : countLabel(items.length)) : 'Loading…'}
        </span>
        <span className="max-sm:hidden">Drop files anywhere on this list to upload them to {folderName}</span>
      </div>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-brand bg-brand-soft/85">
          <span className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand shadow-sm">
            <UploadIcon className="size-4" /> Drop to upload to {folderName}
          </span>
        </div>
      )}

      <PreviewDialog doc={previewItem} onClose={() => setPreviewItem(null)} onDownload={download} linkFor={linkFor} />
      <ShareDocumentsDialog
        open={uploading}
        onClose={() => {
          setUploading(false)
          setDropped(null)
        }}
        upload={upload}
        initialFiles={dropped}
        maxBytes={data?.limits?.maxBytes}
        title={`Upload to ${folderName}`}
        description={firm ? 'Clients on this matter can see these files.' : 'Your legal team will be able to see these files.'}
      />
    </div>
  )
}

export default OneDriveBrowser
