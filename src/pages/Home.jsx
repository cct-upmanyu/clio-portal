import Button from '../components/ui/Button'
import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import EventItem from '../components/ui/EventItem'
import ListItem from '../components/ui/ListItem'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import SectionHeader from '../components/ui/SectionHeader'
import MatterSummaryCard from '../components/home/MatterSummaryCard'
import LegalTeamCard from '../components/home/LegalTeamCard'
import Spinner from '../components/ui/Spinner'
import { CalendarIcon, DocumentsIcon, InboxIcon, MessageIcon } from '../components/ui/icons'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useMatters } from '../hooks/useMatters'
import { useGetDashboardQuery } from '../redux/api/matterApi'
import { greeting } from '../utils/greeting'
import { formatDate, formatShort } from '../utils/dates'
import { fileKind } from '../utils/files'
import { sortTasks, taskStatus } from '../utils/tasks'

const byNewest = (key) => (a, b) => new Date(b[key]) - new Date(a[key])
const senderName = ({ firstName, lastName }) => [firstName, lastName].filter(Boolean).join(' ') || 'Your legal team'

function Home() {
  const { selectedMatter: matter } = useMatters()
  const { firstName } = useCurrentUser()
  const { data: dashboard, isError, isFetching, refetch } = useGetDashboardQuery()
  // Right after a switch the cached dashboard is still the previous matter's until the refetch lands
  const current = dashboard?.matter && String(dashboard.matter.id) === String(matter.id) ? dashboard : null

  return (
    <Page>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description={matter.number ? `Here's the latest on ${matter.title.toLowerCase()} (${matter.number}).` : `Here's the latest on ${matter.title.toLowerCase()}.`}
        action={<Button to="/messages" icon={MessageIcon}>Message your attorney</Button>}
      />

      <MatterSummaryCard matter={matter} nextEvent={current?.events[0]} />

      {current ? (
        <DashboardSections dashboard={current} />
      ) : isError && !isFetching ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12">
          <EmptyState title="We couldn't load this matter's updates">Please try again in a moment.</EmptyState>
          <Button variant="secondary" onClick={refetch}>Try again</Button>
        </div>
      ) : (
        <div className="flex justify-center px-6 py-16">
          <Spinner className="size-6 text-brand" />
          <span className="sr-only">Loading this matter's updates</span>
        </div>
      )}
    </Page>
  )
}

function DashboardSections({ dashboard }) {
  const recentDocuments = [...dashboard.documents].sort(byNewest('sharedAt')).slice(0, 3)
  const dueTasks = sortTasks(dashboard.tasks).filter((t) => t.status !== 'completed').slice(0, 3)
  const { recentMessages, events } = dashboard

  return (
    <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-line">
      <div className="flex min-w-0 flex-col">
        <Section>
          <SectionHeader title="Recently shared documents" linkLabel="View all" to="/documents" />
          {recentDocuments.length > 0 ? (
            <div className="flex flex-col divide-y divide-divider">
              {recentDocuments.map((doc) => (
                <ListItem key={doc.id} to="/documents" kind={fileKind(doc.name)} title={doc.name} meta={`Shared by ${doc.sharedBy} · ${formatDate(doc.sharedAt)}`} />
              ))}
            </div>
          ) : (
            <EmptyState icon={DocumentsIcon} title="No documents yet">
              Files your legal team shares with you will appear here.
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader title="Recent messages" linkLabel="Open inbox" to="/messages" />
          {recentMessages.length > 0 ? (
            <div className="flex flex-col divide-y divide-divider">
              {recentMessages.map((msg) => (
                <ListItem key={msg.id} to="/messages" kind="message" title={senderName(msg.sender)} meta={msg.body} trailing={msg.sentAt ? formatShort(msg.sentAt) : undefined} />
              ))}
            </div>
          ) : (
            <EmptyState icon={InboxIcon} title="No messages">
              Conversations with your legal team about this matter will appear here.
            </EmptyState>
          )}
        </Section>
      </div>

      <div className="flex min-w-0 flex-col">
        <Section>
          <SectionHeader title="Tasks due soon" linkLabel="View all" to="/tasks" />
          {dueTasks.length > 0 ? (
            <div className="flex flex-col divide-y divide-divider">
              {dueTasks.map((task) => (
                <ListItem key={task.id} to="/tasks" kind="task" title={task.title} meta={taskStatus(task).label} />
              ))}
            </div>
          ) : (
            <EmptyState title="You're all caught up">
              No tasks due soon. We'll let you know when something needs your attention.
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionHeader title="Upcoming events" linkLabel="View all" to="/events" />
          {events.length > 0 ? (
            <div className="flex flex-col divide-y divide-divider">
              {events.slice(0, 3).map((event) => (
                <EventItem key={event.id} to="/events" {...event} />
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarIcon} title="No upcoming events">
              We'll let you know when a new event is scheduled.
            </EmptyState>
          )}
        </Section>

        <LegalTeamCard matter={dashboard.matter} />
      </div>
    </div>
  )
}

export default Home
