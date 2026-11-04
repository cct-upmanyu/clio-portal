import { useEffect, useId, useState } from 'react'
import Button from '../ui/Button'
import FileTile from '../ui/FileTile'
import Spinner from '../ui/Spinner'
import { CloseIcon, DownloadIcon, EyeIcon } from '../ui/icons'
import { useModalDialog } from '../../hooks/useModalDialog'
import { formatDate } from '../../utils/dates'
import { formatBytes, previewKind, sharedByLabel } from '../../utils/files'

// Read into the page (PDFs, text) only up to these sizes; bigger ones open in a new tab
const PDF_IN_PAGE_BYTES = 100 * 1024 * 1024
const TEXT_IN_PAGE_BYTES = 2 * 1024 * 1024
// How the browser's PDF viewer opens: 60% zoom, page thumbnails shown (navpanes: Chrome/Edge;
// pagemode: Firefox). Viewers ignore what they don't support.
const PDF_VIEW = '#zoom=60&navpanes=1&pagemode=thumbs'

// Loads what the preview shows: { url (for <img>/<video>/<iframe>), text, external (the Stratus link,
// for "Open in new tab") }. PDFs are read and re-typed so the browser shows them instead of downloading,
// whatever content type Stratus serves them with.
async function loadPreview(kind, doc, linkFor) {
  const { url } = await linkFor(doc.id)
  if (kind === 'pdf' && doc.size <= PDF_IN_PAGE_BYTES) {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(String(response.status))
      const blob = new Blob([await response.blob()], { type: 'application/pdf' })
      return { url: URL.createObjectURL(blob), external: url, objectUrl: true }
    } catch {
      return { url, external: url }
    }
  }
  if (kind === 'text') {
    if (doc.size > TEXT_IN_PAGE_BYTES) return { external: url }
    const response = await fetch(url)
    if (!response.ok) throw new Error(String(response.status))
    return { text: await response.text(), external: url }
  }
  return { url, external: url }
}

// Full-height viewer for one file, from a short-lived Stratus link (`linkFor(documentId)` → { url }):
// a slim title bar, and the file edge to edge below it. Phones: the whole screen. Only for files
// previewKind() can show; lists offer download alone for the rest.
// `doc`: { id, name, size, mine?, uploadedBy?, uploadedAt? }
function PreviewDialog({ doc, onClose, onDownload, linkFor }) {
  const dialogRef = useModalDialog(Boolean(doc))
  const titleId = useId()
  const kind = doc ? previewKind(doc.name) : null
  const [state, setState] = useState({ id: null })

  useEffect(() => {
    if (!doc || !kind) return undefined
    let cancelled = false
    let created = null
    loadPreview(kind, doc, linkFor)
      .then((loaded) => {
        if (loaded.objectUrl) created = loaded.url
        if (cancelled) {
          if (created) URL.revokeObjectURL(created)
          return
        }
        setState({ id: doc.id, ...loaded })
      })
      .catch(() => !cancelled && setState({ id: doc.id, failed: true }))
    return () => {
      cancelled = true
      if (created) URL.revokeObjectURL(created)
      // Forget the freed link, so opening this file again shows the spinner, not a broken page
      setState({ id: null })
    }
  }, [doc, kind, linkFor])

  const current = state.id === doc?.id ? state : {}
  const failed = current.failed
  const markFailed = () => setState((prev) => ({ ...prev, failed: true }))
  const shown = !failed && (current.url || current.text !== undefined)
  const loading = Boolean(kind) && !failed && !shown && !current.external

  const details = doc && [
    formatBytes(doc.size),
    doc.uploadedBy || doc.mine ? `Shared by ${sharedByLabel(doc)}` : null,
    doc.uploadedAt ? formatDate(doc.uploadedAt) : null,
  ].filter(Boolean).join(' · ')

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose()
      }}
      className="fixed inset-0 m-auto h-[min(820px,calc(100dvh-96px))] max-h-none w-[min(920px,calc(100vw-96px))] max-w-none overflow-hidden rounded-xl border-0 bg-[#525659] p-0 text-ink shadow-[0_24px_60px_rgba(10,31,61,0.32)] backdrop:bg-navy/60 max-sm:h-dvh max-sm:w-screen max-sm:rounded-none"
    >
      {doc && (
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-2.5 max-sm:gap-1.5 max-sm:px-2 max-sm:py-2">
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 id={titleId} className="truncate text-sm font-semibold">{doc.name}</h2>
              <p className="truncate text-xs text-muted">{details}</p>
            </div>
            <Button size="sm" icon={DownloadIcon} onClick={() => onDownload(doc)} aria-label="Download" className="max-sm:size-9 max-sm:px-0">
              <span className="max-sm:sr-only">Download</span>
            </Button>
            {current.external && (
              <Button
                variant="secondary"
                size="sm"
                icon={EyeIcon}
                onClick={() => window.open(current.external, '_blank', 'noopener')}
                aria-label="Open in new tab"
                className="max-sm:size-9 max-sm:px-0"
              >
                <span className="max-sm:sr-only">Open in new tab</span>
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink"
            >
              <CloseIcon className="size-[18px]" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {loading && (
              <>
                <Spinner className="size-7 text-white" />
                <span className="sr-only">Loading preview</span>
              </>
            )}
            {shown && kind === 'pdf' && <iframe src={`${current.url}${PDF_VIEW}`} title={doc.name} className="size-full border-0" />}
            {shown && kind === 'image' && (
              <img src={current.url} alt={doc.name} onError={markFailed} className="max-h-full max-w-full object-contain" />
            )}
            {shown && kind === 'video' && (
              <video src={current.url} controls playsInline preload="metadata" onError={markFailed} className="max-h-full max-w-full bg-black" />
            )}
            {shown && kind === 'audio' && (
              <audio src={current.url} controls preload="metadata" onError={markFailed} className="w-[min(480px,90%)]" />
            )}
            {shown && current.text !== undefined && (
              <pre className="size-full overflow-auto whitespace-pre-wrap break-words bg-white p-4 font-mono text-xs leading-relaxed text-ink">
                {current.text}
              </pre>
            )}
            {!loading && !shown && (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-white px-8 py-8 text-center max-sm:mx-4 max-sm:px-5">
                <FileTile name={doc.name} size="lg" />
                <span className="text-sm font-semibold">{failed ? "This file can't be previewed here" : 'Too large to preview here'}</span>
                <p className="max-w-[320px] text-[13px] leading-normal text-muted">
                  {current.external ? 'Open it in a new tab, or download it to your device.' : 'Download the file to open it on your device.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}

export default PreviewDialog
