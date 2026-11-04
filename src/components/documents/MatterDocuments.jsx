import { useSearchParams } from 'react-router-dom'
import Tabs, { TabPanel } from '../ui/Tabs'
import DocumentList from './DocumentList'
import OneDriveBrowser from './OneDriveBrowser'

const VIEWS = [
  { id: 'portal', label: 'Portal documents' },
  { id: 'onedrive', label: 'OneDrive' },
]

// A matter's documents in two tabs: Portal documents (files sent in the chat) and OneDrive (the matter's
// folder, live: browse, preview, upload into any folder). The open tab is kept in the URL (?docs=onedrive).
function MatterDocuments({ crmMatterId, firm = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const view = VIEWS.some((v) => v.id === searchParams.get('docs')) ? searchParams.get('docs') : VIEWS[0].id

  const show = (id) => setSearchParams((params) => {
    const next = new URLSearchParams(params)
    if (id === VIEWS[0].id) next.delete('docs')
    else next.set('docs', id)
    return next
  }, { replace: true })

  // Fills its parent's height: the tabs stay put and each view scrolls inside
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0">
        <Tabs label="Document sources" idPrefix="docs" value={view} onChange={show} tabs={VIEWS} />
      </div>
      <TabPanel id={view} idPrefix="docs" className="flex min-h-0 flex-1 flex-col">
        {view === 'portal' ? (
          <DocumentList
            crmMatterId={crmMatterId}
            firm={firm}
            emptyText={firm
              ? 'Files sent in this matter’s chat appear here. Other files are in the OneDrive tab.'
              : 'Files you and your legal team send in the chat appear here. Other files are in the OneDrive tab.'}
          />
        ) : (
          <OneDriveBrowser crmMatterId={crmMatterId} firm={firm} />
        )}
      </TabPanel>
    </div>
  )
}

export default MatterDocuments
