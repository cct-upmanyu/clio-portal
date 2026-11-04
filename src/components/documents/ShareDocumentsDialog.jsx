import { useEffect, useRef, useState } from 'react'
import Button from '../ui/Button'
import FileTile from '../ui/FileTile'
import Modal from '../ui/Modal'
import { CheckIcon, CloseIcon, LockIcon, UploadIcon } from '../ui/icons'
import { DOCUMENT_ACCEPT, MAX_DOCUMENT_BYTES, documentProblem, formatBytes } from '../../utils/files'
import { toast } from '../../utils/toast'

let nextKey = 0

// Picks files and uploads them one by one with `upload(file, { onProgress, visibility })` (useOneDriveUpload or
// useDocumentUpload), showing progress. `initialFiles`: files dropped on the page, added when it opens.
// `allowFirmOnly`: the Admin Console's Stratus uploads, which may keep files to the firm (hidden from clients).
// `maxBytes`: the limit for where the files go (from the server).
function ShareDocumentsDialog({ open, onClose, upload, title, description, initialFiles, allowFirmOnly = false, maxBytes = MAX_DOCUMENT_BYTES }) {
  const [items, setItems] = useState([])
  const [firmOnly, setFirmOnly] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  const toSend = items.filter((item) => !item.problem && item.status !== 'done')
  const update = (key, patch) => setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))

  const addFiles = (list) => setItems((prev) => [
    ...prev,
    ...list.map((file) => ({ key: nextKey++, file, problem: documentProblem(file, { maxBytes }), status: 'waiting', progress: 0 })),
  ])

  useEffect(() => {
    if (open && initialFiles?.length) addFiles(initialFiles)
  }, [open, initialFiles])

  const handleClose = () => {
    if (busy) return
    setItems([])
    setFirmOnly(false)
    setDragging(false)
    onClose()
  }

  const handleUpload = async () => {
    setBusy(true)
    let done = 0
    for (const item of toSend) {
      update(item.key, { status: 'uploading', progress: 0, error: null })
      try {
        await upload(item.file, {
          visibility: allowFirmOnly && firmOnly ? 'firm' : 'client',
          onProgress: (progress) => update(item.key, { progress }),
        })
        update(item.key, { status: 'done', progress: 1 })
        done += 1
      } catch (err) {
        update(item.key, { status: 'failed', error: err.shown ? 'Not uploaded' : err.message })
      }
    }
    setBusy(false)
    if (done === toSend.length) {
      toast.success(done === 1 ? 'Document shared' : `${done} documents shared`)
      setItems([])
      setFirmOnly(false)
      onClose()
    } else if (done > 0) {
      toast.error(`${toSend.length - done} of ${toSend.length} files weren't uploaded`, { description: 'Try those again.' })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (!busy) addFiles([...e.dataTransfer.files])
  }

  const failedCount = toSend.filter((item) => item.status === 'failed').length

  return (
    <Modal
      open={open}
      onClose={handleClose}
      dismissible={!busy}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={busy}>Cancel</Button>
          <Button icon={UploadIcon} onClick={handleUpload} disabled={toSend.length === 0} loading={busy}>
            {busy ? 'Uploading…' : failedCount > 0 && failedCount === toSend.length
              ? 'Try again'
              : `Upload${toSend.length > 0 ? ` ${toSend.length} ${toSend.length === 1 ? 'file' : 'files'}` : ''}`}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 max-sm:px-4 max-sm:py-6 ${
            dragging ? 'border-brand bg-brand-soft' : 'border-field bg-canvas hover:border-brand'
          }`}
        >
          <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-sm">
            <UploadIcon className="size-5" />
          </span>
          <span className="text-sm font-semibold max-sm:hidden">Drag and drop files here</span>
          <span className="text-[13px] text-muted">
            <span className="max-sm:hidden">or </span><span className="font-medium text-brand">browse</span> to choose files
          </span>
          <span className="text-xs text-muted">PDF, Word, Excel, images and more · up to {formatBytes(maxBytes)} each</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept={DOCUMENT_ACCEPT}
          onChange={(e) => {
            addFiles([...e.target.files])
            e.target.value = ''
          }}
        />

        {items.length > 0 && (
          <ul aria-label="Selected files" className="flex flex-col divide-y divide-divider rounded-lg border border-line">
            {items.map(({ key, file, problem, status, progress, error }) => (
              <li key={key} className="flex flex-col gap-1.5 px-3 py-2">
                <div className="flex items-center gap-3">
                  <FileTile name={file.name} size="sm" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{file.name}</span>
                    <span className={`truncate text-xs ${problem || status === 'failed' ? 'text-danger' : 'text-muted'}`}>
                      {formatBytes(file.size)}
                      {problem ? ` · ${problem}` : status === 'failed' ? ` · ${error}` : status === 'uploading' ? ` · ${Math.round(progress * 100)}%` : ''}
                    </span>
                  </span>
                  {status === 'done' ? (
                    <CheckIcon className="size-5 shrink-0 text-success" aria-label="Uploaded" />
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setItems((prev) => prev.filter((item) => item.key !== key))}
                      aria-label={`Remove ${file.name}`}
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink disabled:invisible"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  )}
                </div>
                {status === 'uploading' && (
                  <span className="h-1 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-label={`Uploading ${file.name}`} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <span className="block h-full rounded-full bg-brand transition-[width]" style={{ width: `${Math.max(progress * 100, 3)}%` }} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {allowFirmOnly && (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-2.5">
            <input type="checkbox" checked={firmOnly} disabled={busy} onChange={(e) => setFirmOnly(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
            <span className="flex flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-medium"><LockIcon className="size-3.5" /> Firm only</span>
              <span className="text-xs text-muted">Hidden from clients. Only people at the firm can see these files.</span>
            </span>
          </label>
        )}
      </div>
    </Modal>
  )
}

export default ShareDocumentsDialog
