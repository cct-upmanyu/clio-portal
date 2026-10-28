import { useState } from 'react'
import Button from '../components/ui/Button'
import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import DocumentRow from '../components/documents/DocumentRow'
import PreviewDialog from '../components/documents/PreviewDialog'
import ShareDocumentsDialog from '../components/documents/ShareDocumentsDialog'
import { DocumentsIcon, UploadIcon } from '../components/ui/icons'
import { useMatters } from '../hooks/useMatters'
import { saveFile } from '../utils/files'

const PAGE_SIZE = 8

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

function DocumentLibrary({ matter }) {
  const [docs, setDocs] = useState(matter.documents)
  const [page, setPage] = useState(1)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)

  const sorted = [...docs].sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt))
  const pageDocs = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDownload = (doc) => {
    if (doc.file) saveFile(doc.file)
    // TODO: otherwise request a download URL for the document from the backend
  }

  const handleShare = (files) => {
    // TODO: upload the files (and note) to the backend for this matter
    const sharedAt = new Date().toISOString()
    const added = files.map((file) => ({ id: newId(), name: file.name, size: file.size, sharedBy: 'You', sharedAt, file }))
    setDocs((prev) => [...added, ...prev])
    setPage(1)
  }

  return (
    <Page>
      <PageHeader
        title="Documents"
        description="Files shared between you and your legal team."
        action={<Button icon={UploadIcon} onClick={() => setShareOpen(true)}>Share documents</Button>}
      />

      <Section className="flex-1">
        {sorted.length > 0 ? (
          <>
            <ul className="flex flex-col divide-y divide-divider">
              {pageDocs.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} onPreview={setPreviewDoc} onDownload={handleDownload} />
              ))}
            </ul>
            <Pagination page={page} pageSize={PAGE_SIZE} total={sorted.length} onPageChange={setPage} itemLabel="documents" />
          </>
        ) : (
          <EmptyState icon={DocumentsIcon} title="No documents yet">
            Files your legal team shares with you will appear here. You can also share documents with them.
          </EmptyState>
        )}
      </Section>

      <PreviewDialog doc={previewDoc} onClose={() => setPreviewDoc(null)} onDownload={handleDownload} />
      <ShareDocumentsDialog open={shareOpen} onClose={() => setShareOpen(false)} onShare={handleShare} />
    </Page>
  )
}

function Documents() {
  const { selectedMatter } = useMatters()
  // Keyed by matter so switching matters resets the list and page
  return <DocumentLibrary key={selectedMatter.id} matter={selectedMatter} />
}

export default Documents
