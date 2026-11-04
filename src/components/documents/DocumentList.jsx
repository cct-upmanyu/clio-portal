import { useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import { DocumentsIcon, TrashIcon } from '../ui/icons'
import DocumentRow from './DocumentRow'
import PreviewDialog from './PreviewDialog'
import { useDocumentDownload } from '../../hooks/useDocuments'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { useDeleteDocumentMutation, useGetDocumentsQuery } from '../../redux/api/documentApi'
import { toast } from '../../utils/toast'

const countLabel = (n) => (n === 1 ? '1 document' : `${n} documents`)

function SkeletonRows() {
  return (
    <ul aria-hidden="true">
      {[62, 48, 70, 40, 56].map((width, i) => (
        <li key={i} className="flex items-center gap-2.5 px-2 py-2">
          <span className="size-7 shrink-0 animate-pulse rounded-md bg-subtle" />
          <span className="h-3.5 animate-pulse rounded bg-subtle" style={{ width: `${width}%` }} />
        </li>
      ))}
    </ul>
  )
}

// The matter's Portal documents (files sent in the chat, kept in Stratus) with preview and download.
// New files are added from the chat; anything else goes to the OneDrive tab. Fills its parent's height:
// the list scrolls, the count stays at the bottom. `firm`: Admin Console, which also sees "Firm only"
// files and removes files.
function DocumentList({ crmMatterId, firm = false, emptyText }) {
  const { data: documents = [], isLoading, isFetching, isError, refetch } = useGetDocumentsQuery(crmMatterId, { refetchOnFocus: true })
  const { linkFor, download } = useDocumentDownload(crmMatterId)
  const [deleteDocument, deleting] = useDeleteDocumentMutation()
  const [previewDoc, setPreviewDoc] = useState(null)
  const [removing, setRemoving] = useState(null)

  const remove = async () => {
    try {
      await deleteDocument({ crmMatterId, documentId: removing.id }).unwrap()
      toast.success('Document removed', { description: removing.name })
      setRemoving(null)
    } catch (err) {
      if (!isHandledGlobally(err)) toast.error("Couldn't remove this document", { description: err?.data?.message || 'Please try again.' })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className={`h-0.5 shrink-0 ${isFetching && !isLoading ? 'animate-pulse bg-brand' : 'bg-transparent'}`} />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-1">
        {isLoading ? (
          <SkeletonRows />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <EmptyState title="We couldn't load the documents">Please try again in a moment.</EmptyState>
            <Button variant="secondary" onClick={refetch}>Try again</Button>
          </div>
        ) : documents.length > 0 ? (
          <ul className="divide-y divide-divider" aria-label="Portal documents">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onPreview={setPreviewDoc}
                onDownload={download}
                onDelete={firm ? setRemoving : undefined}
                showVisibility={firm}
              />
            ))}
          </ul>
        ) : (
          <EmptyState icon={DocumentsIcon} title="No documents yet">{emptyText}</EmptyState>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-2 py-2 text-xs text-muted">
        <span>{isLoading ? 'Loading…' : countLabel(documents.length)}</span>
        <span className="max-sm:hidden">Files sent in the chat · Other files are in the OneDrive tab</span>
      </div>

      <PreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} onDownload={download} linkFor={linkFor} />
      <ConfirmDialog
        open={Boolean(removing)}
        icon={TrashIcon}
        tone="danger"
        title={`Remove ${removing?.name ?? 'this document'}?`}
        confirmLabel="Remove"
        loading={deleting.isLoading}
        loadingLabel="Removing…"
        onConfirm={remove}
        onCancel={() => setRemoving(null)}
      >
        {removing?.messageId
          ? 'The file is deleted for everyone. The chat message it was sent with stays, marked as removed.'
          : 'The file is deleted for everyone on this matter. This can’t be undone.'}
      </ConfirmDialog>
    </div>
  )
}

export default DocumentList
