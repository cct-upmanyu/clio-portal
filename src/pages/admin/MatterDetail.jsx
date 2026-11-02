import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import StatusPill from '../../components/ui/StatusPill'
import Tabs, { TabPanel } from '../../components/ui/Tabs'
import { CalendarIcon, ChevronLeftIcon, RefreshIcon, UserPlusIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import MatterTasks from '../../components/admin/MatterTasks'
import MatterUsers from '../../components/admin/MatterUsers'
import ActivityFeed from '../../components/activity/ActivityFeed'
import MatterChat from '../../components/messages/MatterChat'
import { useAdminMatters } from '../../hooks/useAdminMatters'
import { useInviteUser } from '../../hooks/useInviteUser'
import { useGetAdminMatterActivityInfiniteQuery } from '../../redux/api/activityApi'
import { formatDay } from '../../utils/dates'

const TABS = ['messages', 'tasks', 'events', 'users', 'activity']
const TAB_LABELS = { messages: 'Communication', tasks: 'Tasks', events: 'Events', users: 'Users', activity: 'Activity' }

// Everything that happened on the matter: invitations, acceptances, removals, documents… (firm view: all of it)
function MatterActivity({ crmMatterId }) {
  const activity = useGetAdminMatterActivityInfiniteQuery(crmMatterId, { refetchOnFocus: true })
  return (
    <div className="py-4">
      <ActivityFeed result={activity} inMatter emptyText="Invitations, acceptances and other changes to this matter will show here." />
    </div>
  )
}

function MatterDetail() {
  const { matterId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { matters, isLoading, refetch, isFetching } = useAdminMatters()
  const { inviteOpen, openInvite, closeInvite, invite } = useInviteUser()

  if (isLoading) {
    return (
      <Page>
        <p className="py-8 text-center text-sm text-muted">Loading matter…</p>
      </Page>
    )
  }
  const matter = matters.find((m) => m.id === matterId)
  if (!matter) return <Navigate to="/matters" replace />

  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'messages'
  const label = `${matter.number} · ${matter.name}`
  const hasAcceptedClient = matter.contacts.some((c) => c.invitation === 'accepted')

  return (
    <Page scroll={false}>
      <div className="flex flex-col gap-3 border-b border-line bg-white px-6 pb-0 pt-4 max-sm:px-4">
        <Link to="/matters" className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-muted hover:text-brand">
          <ChevronLeftIcon className="size-4" />
          Matters
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-xl font-bold leading-tight tracking-[-0.01em]">{label}</h1>
              <StatusPill status={matter.status} size="md" dot />
            </div>
            <p className="text-[13px] leading-normal text-muted">
              {matter.attorney} · {matter.stage}{matter.openedOn ? ` · Opened ${formatDay(matter.openedOn)}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Re-reads the portal's copy of the matter; syncing from Zoho CRM itself isn't built yet */}
            <Button variant="secondary" icon={RefreshIcon} loading={isFetching} onClick={refetch}>
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </Button>
            {matter.status !== 'Closed' && (
              <Button icon={UserPlusIcon} onClick={() => openInvite(matter.crmMatterId)}>Invite client</Button>
            )}
          </div>
        </div>

        <Tabs
          label="Matter sections"
          idPrefix="matter"
          value={tab}
          onChange={(id) => setSearchParams(id === 'messages' ? {} : { tab: id }, { replace: true })}
          tabs={TABS.map((id) => ({ id, label: TAB_LABELS[id], count: id === 'users' ? matter.contacts.length : undefined }))}
        />
      </div>

      {/* Communication fills the rest of the screen and scrolls inside; the lists scroll as a whole */}
      {tab === 'messages' ? (
        <div role="tabpanel" id="matter-panel-messages" aria-labelledby="matter-messages" className="flex min-h-0 flex-1 flex-col">
          <MatterChat
            key={matter.crmMatterId}
            crmMatterId={matter.crmMatterId}
            viewer="firm"
            title={`Messages with the client on ${label}`}
            emptyText={hasAcceptedClient
              ? 'No messages yet. Messages sent here appear in the client portal for this matter.'
              : 'No messages yet. Clients see messages sent here once they accept their invitation.'}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-2 max-sm:px-4">
          <TabPanel id={tab} idPrefix="matter">
            {tab === 'tasks' && <MatterTasks matter={matter} />}
            {tab === 'events' && (
              <EmptyState icon={CalendarIcon} title="No upcoming events">Meetings, hearings and deadlines will show here once they sync from Zoho CRM.</EmptyState>
            )}
            {tab === 'users' && <MatterUsers matter={matter} onInvite={() => openInvite(matter.crmMatterId)} />}
            {tab === 'activity' && <MatterActivity crmMatterId={matter.crmMatterId} />}
          </TabPanel>
        </div>
      )}

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={matter.crmMatterId} onInvite={invite} />
    </Page>
  )
}

export default MatterDetail
