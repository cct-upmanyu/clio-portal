import { useRef, useState } from 'react'
import Button from '../ui/Button'
import FileTile from '../ui/FileTile'
import Modal from '../ui/Modal'
import { CloseIcon, UploadIcon } from '../ui/icons'
import { formatBytes } from '../../utils/files'

const MAX_BYTES = 25 * 1024 * 1024

function ShareDocumentsDialog({ open, onClose, onShare }) {
  const [files, setFiles] = useState([])
  const [note, setNote] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const valid = files.filter((f) => f.size <= MAX_BYTES)

  const addFiles = (list) => setFiles((prev) => [...prev, ...list])

  const reset = () => {
    setFiles([])
    setNote('')
    setDragging(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleShare = () => {
    onShare(valid, note.trim())
    handleClose()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles([...e.dataTransfer.files])
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Share documents"
      description="Your legal team will be able to see these files."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button icon={UploadIcon} onClick={handleShare} disabled={valid.length === 0}>
            Share{valid.length > 0 ? ` ${valid.length} ${valid.length === 1 ? 'file' : 'files'}` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragging ? 'border-brand bg-brand-soft' : 'border-field bg-canvas hover:border-brand'
          }`}
        >
          <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-sm">
            <UploadIcon className="size-5" />
          </span>
          <span className="text-sm font-semibold">Drag and drop files here</span>
          <span className="text-[13px] text-muted">
            or <span className="font-medium text-brand">browse</span> to choose files
          </span>
          <span className="text-xs text-muted">PDF, Word, images and more · up to 25 MB each</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            addFiles([...e.target.files])
            e.target.value = ''
          }}
        />

        {files.length > 0 && (
          <ul aria-label="Selected files" className="flex flex-col divide-y divide-divider rounded-lg border border-line">
            {files.map((file, i) => {
              const tooBig = file.size > MAX_BYTES
              return (
                <li key={`${file.name}-${i}`} className="flex items-center gap-3 px-3 py-2">
                  <FileTile name={file.name} size="sm" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{file.name}</span>
                    <span className={`text-xs ${tooBig ? 'text-danger' : 'text-muted'}`}>
                      {tooBig ? `${formatBytes(file.size)} · Too large, max 25 MB` : formatBytes(file.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, index) => index !== i))}
                    aria-label={`Remove ${file.name}`}
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="share-note" className="text-sm font-medium">Note <span className="font-normal text-muted">(optional)</span></label>
          <textarea
            id="share-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a short note for your legal team"
            className="resize-none rounded-lg border border-field px-3 py-2 text-sm placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-offset-1 focus:outline-brand"
          />
        </div>
      </div>
    </Modal>
  )
}

export default ShareDocumentsDialog
