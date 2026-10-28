import { useEffect, useMemo } from 'react'
import Button from '../ui/Button'
import FileTile from '../ui/FileTile'
import Modal from '../ui/Modal'
import { DownloadIcon } from '../ui/icons'
import { formatDate } from '../../utils/dates'
import { fileKind, formatBytes } from '../../utils/files'

// Shows images and PDFs the browser already has (files shared this session).
// TODO: load a preview URL from the backend for stored documents.
function PreviewDialog({ doc, onClose, onDownload }) {
  const url = useMemo(() => (doc?.file ? URL.createObjectURL(doc.file) : null), [doc])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  const kind = doc ? fileKind(doc.name) : null

  return (
    <Modal
      open={Boolean(doc)}
      onClose={onClose}
      size="lg"
      title={doc?.name}
      description={doc && `${formatBytes(doc.size)} · Shared by ${doc.sharedBy} · ${formatDate(doc.sharedAt)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button icon={DownloadIcon} onClick={() => onDownload(doc)}>Download</Button>
        </>
      }
    >
      {doc && (
        <div className="flex min-h-[50dvh] items-center justify-center overflow-hidden rounded-lg border border-line bg-canvas">
          {url && kind === 'image' && <img src={url} alt={doc.name} className="max-h-[60dvh] w-auto object-contain" />}
          {url && kind === 'pdf' && <iframe src={url} title={doc.name} className="h-[60dvh] w-full" />}
          {(!url || kind === 'file') && (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <FileTile name={doc.name} size="lg" />
              <span className="text-sm font-semibold">Preview not available</span>
              <p className="max-w-[340px] text-[13px] leading-normal text-muted">
                Download the file to open it on your device.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default PreviewDialog
