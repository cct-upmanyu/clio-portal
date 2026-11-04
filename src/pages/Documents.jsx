import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import MatterDocuments from '../components/documents/MatterDocuments'
import { useMatters } from '../hooks/useMatters'

// Portal documents (files sent in the chat) and the matter's OneDrive folder, in two tabs. Fills the
// screen: the lists scroll inside, the tabs and toolbar stay put.
function Documents() {
  const { selectedMatter } = useMatters()
  if (!selectedMatter) return null

  return (
    <Page scroll={false}>
      <PageHeader title="Documents" description="Files shared between you and your legal team." />
      <div className="flex min-h-0 flex-1 flex-col px-6 max-sm:px-4">
        {/* Keyed by matter so switching matters starts over (OneDrive at the top folder) */}
        <MatterDocuments key={selectedMatter.crmMatterId} crmMatterId={selectedMatter.crmMatterId} />
      </div>
    </Page>
  )
}

export default Documents
