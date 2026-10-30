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
import { CalendarIcon, DocumentsIcon, InboxIcon, MessageIcon } from '../components/ui/icons'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { useMatters } from '../hooks/useMatters'
import { greeting } from '../utils/greeting'
import { formatDate, formatShort } from '../utils/dates'
import { fileKind } from '../utils/files'
import { sortTasks, taskStatus } from '../utils/tasks'

function Home() {
  const { selectedMatter: matter } = useMatters()
  const { firstName } = useCurrentUser()
  const byNewest = (key) => (a, b) => new Date(b[key]) - new Date(a[key])
  const recentDocuments = [...matter.documents].sort(byNewest('sharedAt')).slice(0, 3)
  const recentMessages = matter.messages.filter((m) => !m.fromMe).sort(byNewest('sentAt')).slice(0, 3)
  const dueTasks = sortTasks(matter.tasks).filter((t) => t.status !== 'completed').slice(0, 3)

  return (
    <Page>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description={`Here's the latest on ${matter.title.toLowerCase()} (${matter.number}).`}
        action={<Button to="/messages" icon={MessageIcon}>Message your attorney</Button>}
      />

      <MatterSummaryCard matter={matter} />

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
                  <ListItem key={msg.id} to="/messages" kind="message" title={msg.author} meta={msg.body || `Sent ${msg.attachment?.name}`} trailing={formatShort(msg.sentAt)} unread={msg.unread} />
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
            {matter.events.length > 0 ? (
              <div className="flex flex-col divide-y divide-divider">
                {matter.events.slice(0, 3).map((event) => (
                  <EventItem key={event.id} to="/events" {...event} />
                ))}
              </div>
            ) : (
              <EmptyState icon={CalendarIcon} title="No upcoming events">
                We'll let you know when a new event is scheduled.
              </EmptyState>
            )}
          </Section>

          <LegalTeamCard />
        </div>
      </div>
    </Page>
  )
}

export default Home
