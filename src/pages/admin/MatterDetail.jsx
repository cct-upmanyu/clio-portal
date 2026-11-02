import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import StatusPill from '../../components/ui/StatusPill'
import Tabs, { TabPanel } from '../../components/ui/Tabs'
import { CalendarIcon, ChevronLeftIcon, PlusIcon, RefreshIcon } from '../../components/ui/icons'
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
  const [creatingTask, setCreatingTask] = useState(false)

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

  // The header's + adds to the open tab (Communication and Activity have nothing to add; events aren't built yet)
  const closed = matter.status === 'Closed'
  const addAction = {
    users: { label: 'Invite client', onClick: () => openInvite(matter.crmMatterId), disabledReason: closed ? 'This matter is closed' : null },
    tasks: {
      label: 'New task',
      onClick: () => setCreatingTask(true),
      disabledReason: closed ? 'This matter is closed' : !hasAcceptedClient ? 'A client needs to accept this matter first' : null,
    },
  }[tab]

  return (
    <Page scroll={false}>
      <div className="flex flex-col gap-3 border-b border-line bg-white px-6 pb-0 pt-4 max-sm:gap-2 max-sm:px-3 max-sm:pt-2.5">
        <Link to="/matters" className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-muted hover:text-brand max-sm:hidden">
          <ChevronLeftIcon className="size-4" />
          Matters
        </Link>

        {/* Phones: one compact row (back, title, status, icon-only actions) so the chat keeps the screen */}
        <div className="flex items-start justify-between gap-x-4 gap-y-3 max-sm:items-center max-sm:gap-2">
          <Link to="/matters" aria-label="Back to matters" className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-brand sm:hidden">
            <ChevronLeftIcon className="size-5" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1 max-sm:gap-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 max-sm:flex-nowrap max-sm:gap-2">
              <h1 className="text-xl font-bold leading-tight tracking-[-0.01em] max-sm:truncate max-sm:text-base">{label}</h1>
              <span className="shrink-0"><StatusPill status={matter.status} size="md" dot /></span>
            </div>
            <p className="text-[13px] leading-normal text-muted max-sm:truncate max-sm:text-xs">
              {matter.attorney} · {matter.stage}{matter.openedOn ? ` · Opened ${formatDay(matter.openedOn)}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 gap-2 max-sm:gap-1">
            {/* Re-reads the portal's copy of the matter; syncing from Zoho CRM itself isn't built yet */}
            <Button variant="secondary" icon={RefreshIcon} loading={isFetching} onClick={refetch} aria-label="Refresh" className="max-sm:size-9 max-sm:px-0">
              <span className="max-sm:sr-only">{isFetching ? 'Refreshing…' : 'Refresh'}</span>
            </Button>
            {addAction && (
              <button
                type="button"
                onClick={addAction.onClick}
                disabled={Boolean(addAction.disabledReason)}
                aria-label={addAction.label}
                title={addAction.disabledReason || addAction.label}
                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 max-sm:size-9"
              >
                <PlusIcon className="size-5" />
              </button>
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
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-2 max-sm:px-3">
          <TabPanel id={tab} idPrefix="matter">
            {tab === 'tasks' && <MatterTasks matter={matter} creating={creatingTask} onCreatingChange={setCreatingTask} />}
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
