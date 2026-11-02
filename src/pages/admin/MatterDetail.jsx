import { useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import EventItem from '../../components/ui/EventItem'
import Page from '../../components/ui/Page'
import StatusPill from '../../components/ui/StatusPill'
import Tabs, { TabPanel } from '../../components/ui/Tabs'
import { CalendarIcon, ChevronLeftIcon, RefreshIcon, TaskIcon, UserPlusIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import MessageThread from '../../components/messages/MessageThread'
import TaskRow from '../../components/tasks/TaskRow'
import { matterDetails } from '../../data/adminSampleData'
import { adminActions, useAdminData } from '../../hooks/useAdminData'
import { useInviteUser } from '../../hooks/useInviteUser'
import { formatDay, formatShort } from '../../utils/dates'
import { sortTasks } from '../../utils/tasks'
import { toast } from '../../utils/toast'

const TABS = ['messages', 'tasks', 'events']
const TAB_LABELS = { messages: 'Communication', tasks: 'Tasks', events: 'Events' }

function ClientChip({ contact }) {
  const accepted = contact.invitation === 'accepted'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pl-2.5 pr-2 text-[13px]">
      <span className="font-medium text-ink">{contact.name}</span>
      <span className={accepted ? 'text-success' : 'text-warning'}>{accepted ? 'Accepted' : 'Invitation pending'}</span>
    </span>
  )
}

// Sample data until the admin console is connected to the messages API; sends stay on this screen
function SampleThread({ matter, title }) {
  const [messages, setMessages] = useState(matter.messages)
  const handleSend = ({ body }) => {
    if (body) setMessages((prev) => [...prev, { id: crypto.randomUUID(), author: 'You', fromMe: true, body, sentAt: new Date().toISOString() }])
  }
  return <MessageThread messages={messages} onSend={handleSend} title={title} allowAttachments={false} />
}

function MatterDetail() {
  const { matterId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { matters } = useAdminData()
  const { inviteOpen, openInvite, closeInvite, invite } = useInviteUser()
  const [syncing, setSyncing] = useState(false)

  const matter = matters.find((m) => m.id === matterId)
  if (!matter) return <Navigate to="/matters" replace />

  const details = matterDetails(matter.id)
  const tasks = sortTasks(details.tasks)
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'messages'
  const counts = { messages: details.messages.length, tasks: tasks.filter((t) => t.status !== 'completed').length, events: details.events.length }
  const label = `${matter.number} · ${matter.name}`

  const resync = async () => {
    setSyncing(true)
    try {
      await adminActions.resyncMatter(matter)
      toast.success('Matter updated from Zoho CRM', { description: label })
    } catch {
      toast.error("Couldn't sync from Zoho CRM", { description: 'Please try again in a moment.' })
    } finally {
      setSyncing(false)
    }
  }

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
              {matter.attorney} · {matter.stage} · Opened {formatDay(matter.openedOn)}
              <span className="max-sm:block"><span className="max-sm:hidden"> · </span>Synced from Zoho CRM {formatShort(matter.lastSyncedAt)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={RefreshIcon} loading={syncing} onClick={resync}>
              {syncing ? 'Syncing…' : 'Resync from CRM'}
            </Button>
            {matter.status !== 'Closed' && (
              <Button icon={UserPlusIcon} onClick={() => openInvite(matter.crmMatterId)}>Invite client</Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-muted">Clients</span>
          {matter.contacts.length > 0
            ? matter.contacts.map((contact) => <ClientChip key={contact.userId} contact={contact} />)
            : <span className="text-[13px] font-medium text-warning">No client invited yet</span>}
        </div>

        <Tabs
          label="Matter sections"
          idPrefix="matter"
          value={tab}
          onChange={(id) => setSearchParams(id === 'messages' ? {} : { tab: id }, { replace: true })}
          tabs={TABS.map((id) => ({ id, label: TAB_LABELS[id], count: counts[id] }))}
        />
      </div>

      {/* Communication fills the rest of the screen and scrolls inside; the lists scroll as a whole */}
      {tab === 'messages' ? (
        <div role="tabpanel" id="matter-panel-messages" aria-labelledby="matter-messages" className="flex min-h-0 flex-1 flex-col">
          <SampleThread key={matter.id} matter={details}title={`Messages with the client on ${label}`} />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-2 max-sm:px-4">
          <TabPanel id={tab} idPrefix="matter">
            {tab === 'tasks' && (tasks.length > 0 ? (
              <ul className="flex flex-col divide-y divide-divider">
                {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
              </ul>
            ) : (
              <EmptyState icon={TaskIcon} title="No tasks">Tasks for the client on this matter will show here once they sync from Zoho CRM.</EmptyState>
            ))}
            {tab === 'events' && (details.events.length > 0 ? (
              <div className="flex flex-col divide-y divide-divider">
                {details.events.map((event) => <EventItem key={event.id} {...event} />)}
              </div>
            ) : (
              <EmptyState icon={CalendarIcon} title="No upcoming events">Meetings, hearings and deadlines will show here once they sync from Zoho CRM.</EmptyState>
            ))}
          </TabPanel>
        </div>
      )}

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={matter.crmMatterId} onInvite={invite} />
    </Page>
  )
}

export default MatterDetail
