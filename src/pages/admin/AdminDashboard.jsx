import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import Section from '../../components/ui/Section'
import SectionHeader from '../../components/ui/SectionHeader'
import {
  CalendarIcon, InboxIcon, InviteIcon, MattersIcon, MessageIcon, ResendIcon, TaskIcon, UserPlusIcon, UsersIcon,
} from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import StatTile from '../../components/admin/StatTile'
import { useAdminMatters } from '../../hooks/useAdminMatters'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useInviteUser } from '../../hooks/useInviteUser'
import { useReinvite } from '../../hooks/useReinvite'
import { useGetAdminDashboardQuery, useGetAdminUsersQuery } from '../../redux/api/adminApi'
import { useGetFirmActivityInfiniteQuery } from '../../redux/api/activityApi'
import { useGetTasksDueSoonQuery } from '../../redux/api/taskApi'
import { useGetUpcomingEventsQuery } from '../../redux/api/eventApi'
import { eventPlace, toEventItem } from '../../utils/events'
import EventItem from '../../components/ui/EventItem'
import { taskStatus } from '../../utils/tasks'
import ActivityFeed from '../../components/activity/ActivityFeed'
import { greeting } from '../../utils/greeting'
import { daysAgo, formatShort } from '../../utils/dates'

const PREVIEW = 5
const WEEK_DAYS = 7

const senderName = (sender) => [sender?.firstName, sender?.lastName].filter(Boolean).join(' ') || 'Client'

// Client messages no one at the firm has read yet, one row per matter. Opening the chat reads them,
// which takes the matter off every admin's list. Updates live (useChatNotifications).
function UnreadMessages() {
  const { data, isLoading } = useGetAdminDashboardQuery(undefined, { refetchOnFocus: true })
  const entries = data?.unreadMessages ?? []

  return (
    <Section>
      <SectionHeader title={entries.length > 0 ? `New client messages (${data.totalUnread})` : 'New client messages'} linkLabel="All matters" to="/matters" />
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Loading messages…</p>
      ) : entries.length > 0 ? (
        <ul className="flex flex-col divide-y divide-divider">
          {entries.map(({ matter, unreadCount, latest }) => (
            <li key={matter.id}>
              <Link
                to={`/matters/${matter.id}`}
                className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-subtle"
                aria-label={`${unreadCount} new ${unreadCount === 1 ? 'message' : 'messages'} from ${senderName(latest.sender)} on ${matter.number || ''} ${matter.name || ''}`}
              >
                <Avatar name={senderName(latest.sender)} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-semibold">{senderName(latest.sender)}</span>
                    {latest.sentAt && <span className="shrink-0 text-xs text-muted">{formatShort(latest.sentAt)}</span>}
                  </span>
                  <span className="truncate text-[13px] text-muted">{[matter.number, matter.name].filter(Boolean).join(' · ')}</span>
                  <span className="line-clamp-2 text-[13px] text-body">{latest.body}</span>
                </span>
                <span className="mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={InboxIcon} title="You're all caught up">New messages from clients will show here until someone at the firm reads them.</EmptyState>
      )}
    </Section>
  )
}

// The 10 open tasks due soonest across every matter; overdue ones first
function TasksDueSoon() {
  const { data: tasks = [], isLoading } = useGetTasksDueSoonQuery(10, { refetchOnFocus: true })
  return (
    <Section>
      <SectionHeader title="Tasks due soon" linkLabel="All matters" to="/matters" />
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Loading tasks…</p>
      ) : tasks.length > 0 ? (
        <ul className="flex flex-col divide-y divide-divider">
          {tasks.map((task) => {
            const { tone, label } = taskStatus(task)
            const done = task.assignees.filter((a) => a.status === 'completed').length
            return (
              <li key={task.id}>
                <Link to={`/matters/${task.matterId}?tab=tasks`} className="-mx-2 flex items-start gap-3 rounded-lg px-2 py-3 hover:bg-subtle">
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">{task.title}</span>
                    <span className="truncate text-[13px] text-muted">{[task.matter?.number, task.matter?.name].filter(Boolean).join(' · ')}</span>
                    <span className="truncate text-xs text-muted">
                      {task.assignees.map((a) => a.name).join(', ')}{task.assignees.length > 1 ? ` · ${done} of ${task.assignees.length} done` : ''}
                    </span>
                  </span>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tone === 'overdue' ? 'bg-danger-soft text-danger' : 'bg-subtle text-body'}`}>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState title="No open tasks">Tasks you give clients on a matter will show here until they're done.</EmptyState>
      )}
    </Section>
  )
}

// The next 10 scheduled meetings across every matter
function UpcomingEvents() {
  const { data: events = [], isLoading } = useGetUpcomingEventsQuery(10, { refetchOnFocus: true })
  return (
    <Section>
      <SectionHeader title="Upcoming events" linkLabel="All matters" to="/matters" />
      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Loading events…</p>
      ) : events.length > 0 ? (
        <div className="flex flex-col divide-y divide-divider">
          {events.map((event) => {
            const item = toEventItem(event)
            const matter = [event.matter?.number, event.matter?.name].filter(Boolean).join(' · ')
            return (
              <EventItem
                key={event.id}
                to={`/matters/${event.matterId}?tab=events`}
                {...item}
                place={[matter, eventPlace(event)].filter(Boolean).join(' · ')}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState title="Nothing scheduled">Meetings you schedule on a matter will show here.</EmptyState>
      )}
    </Section>
  )
}

// Invitations not accepted yet, across every matter, newest first
function WaitingForClients({ matters }) {
  const { reinvite, sendingTo } = useReinvite()
  const waiting = matters
    .flatMap((matter) => matter.contacts.filter((c) => c.invitation !== 'accepted').map((contact) => ({ ...contact, matter })))
    .sort((a, b) => new Date(b.invitedAt || 0) - new Date(a.invitedAt || 0))

  return (
    <Section>
      <SectionHeader title="Waiting for the client to accept" linkLabel="All matters" to="/matters" />
      {waiting.length > 0 ? (
        <ul className="flex flex-col divide-y divide-divider">
          {waiting.slice(0, PREVIEW).map(({ userId, name, invitation, invitedAt, matter }) => (
            <li key={`${matter.id}-${userId}`} className="flex items-center gap-3 py-3">
              <Avatar name={name} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2">
                  <span className="truncate text-sm font-medium">{name}</span>
                  {invitation === 'expired' && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">Expired</span>}
                </span>
                <span className="truncate text-[13px] text-muted">
                  <Link to={`/matters/${matter.id}?tab=users`} className="hover:text-brand">{matter.number} · {matter.name}</Link>
                  {invitedAt ? ` · Invited ${formatShort(invitedAt)}` : ''}
                </span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={ResendIcon}
                loading={sendingTo === String(userId)}
                onClick={() => reinvite(userId, matter.crmMatterId)}
                aria-label={`Resend the invitation to ${name}`}
                className="max-sm:size-9 max-sm:px-0"
              >
                <span className="max-sm:sr-only">Resend</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No invitations waiting">Every invited client has accepted.</EmptyState>
      )}
    </Section>
  )
}

// Open or pending matters with nobody on them (removed clients don't count)
function MattersWithoutClient({ matters, onInvite }) {
  const withoutClient = matters.filter((m) => m.status !== 'Closed' && m.contacts.length === 0)
  return (
    <Section>
      <SectionHeader title="Matters without a client" linkLabel="All matters" to="/matters" />
      {withoutClient.length > 0 ? (
        <ul className="flex flex-col divide-y divide-divider">
          {withoutClient.slice(0, PREVIEW).map((matter) => (
            <li key={matter.id} className="flex items-center gap-3 py-3">
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                <MattersIcon className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Link to={`/matters/${matter.id}`} className="truncate text-sm font-medium hover:text-brand">{matter.number} · {matter.name}</Link>
                <span className="truncate text-[13px] text-muted">{matter.attorney} · {matter.stage} · {matter.status}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={UserPlusIcon}
                onClick={() => onInvite(matter.crmMatterId)}
                aria-label={`Invite a client to ${matter.number}`}
                className="max-sm:size-9 max-sm:px-0"
              >
                <span className="max-sm:sr-only">Invite</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Every matter has a client">All open and pending matters have someone invited.</EmptyState>
      )}
    </Section>
  )
}

function AdminDashboard() {
  const { firstName } = useCurrentUser()
  const { matters, isLoading: mattersLoading } = useAdminMatters()
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsersQuery()
  const { data: inbox, isLoading: inboxLoading } = useGetAdminDashboardQuery(undefined, { refetchOnFocus: true })
  const { data: dueTasks = [], isLoading: tasksLoading } = useGetTasksDueSoonQuery(10, { refetchOnFocus: true })
  const { data: upcoming = [], isLoading: eventsLoading } = useGetUpcomingEventsQuery(10, { refetchOnFocus: true })
  const activity = useGetFirmActivityInfiniteQuery({ perPage: 5 }, { refetchOnFocus: true })
  const { inviteOpen, inviteCrmMatterId, openInvite, closeInvite, invite } = useInviteUser()

  const count = (list, fn) => list.filter(fn).length
  const clients = (usersData?.users ?? []).filter((u) => u.roleName === 'Client')
  const signedIn = (usersData?.users ?? []).filter((u) => u.status === 'active')
  const waiting = matters.reduce((n, m) => n + count(m.contacts, (c) => c.invitation !== 'accepted'), 0)
  const expired = matters.reduce((n, m) => n + count(m.contacts, (c) => c.invitation === 'expired'), 0)
  const unread = inbox?.totalUnread ?? 0
  const unreadMatters = inbox?.unreadMessages?.length ?? 0
  const overdue = count(dueTasks, (t) => taskStatus(t).tone === 'overdue')
  const dueThisWeek = count(dueTasks, (t) => t.due && taskStatus(t).tone !== 'overdue' && -daysAgo(t.due) <= WEEK_DAYS)
  const meetingsThisWeek = count(upcoming, (e) => -daysAgo(e.startAt) <= WEEK_DAYS)
  const nextMeeting = upcoming[0] && toEventItem(upcoming[0])
  // The due-soon and upcoming lists hold at most 10
  const capped = (n, list) => (list.length >= 10 && n >= 10 ? '10+' : n)

  return (
    <Page>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description="Here's what's happening in the Client Portal."
        action={<Button icon={UserPlusIcon} onClick={() => openInvite()}>Invite client</Button>}
      />

      <Section aria-label="Overview" className="bg-canvas">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6 max-sm:gap-2">
          <StatTile
            to="/matters"
            icon={MattersIcon}
            tone="brand"
            label="Open matters"
            loading={mattersLoading}
            value={count(matters, (m) => m.status === 'Open')}
            detail={`${count(matters, (m) => m.status === 'Pending')} pending · ${count(matters, (m) => m.status === 'Closed')} closed`}
          />
          <StatTile
            to="/"
            icon={MessageIcon}
            tone="rose"
            label="Unread messages"
            loading={inboxLoading}
            value={unread}
            detail={unread > 0 ? `From clients on ${unreadMatters} ${unreadMatters === 1 ? 'matter' : 'matters'}` : 'All caught up'}
            alert={unread > 0 ? 'danger' : undefined}
          />
          <StatTile
            to="/matters"
            icon={TaskIcon}
            tone="violet"
            label="Overdue tasks"
            loading={tasksLoading}
            value={capped(overdue, dueTasks)}
            detail={overdue > 0 ? `${dueThisWeek} more due this week` : `${dueThisWeek} due this week`}
            alert={overdue > 0 ? 'danger' : undefined}
          />
          <StatTile
            to="/matters"
            icon={CalendarIcon}
            tone="sky"
            label="Meetings this week"
            loading={eventsLoading}
            value={capped(meetingsThisWeek, upcoming)}
            detail={nextMeeting ? `Next: ${nextMeeting.month} ${nextMeeting.day} · ${nextMeeting.title}` : 'Nothing scheduled'}
          />
          <StatTile
            to="/matters"
            icon={InviteIcon}
            tone="amber"
            label="Invitations waiting"
            loading={mattersLoading}
            value={waiting}
            detail={expired > 0 ? `${expired} expired · resend them` : 'Sent but not accepted yet'}
            alert={expired > 0 ? 'warning' : undefined}
          />
          <StatTile
            to="/users"
            icon={UsersIcon}
            tone="emerald"
            label="Active clients"
            loading={usersLoading}
            value={count(clients, (u) => u.status === 'active')}
            detail={`2FA on for ${count(signedIn, (u) => u.mfaEnabled)} of ${signedIn.length} people`}
          />
        </div>
      </Section>

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-line">
        <div className="flex min-w-0 flex-col">
          <UnreadMessages />

          <TasksDueSoon />

          <UpcomingEvents />

          <WaitingForClients matters={matters} />

          <MattersWithoutClient matters={matters} onInvite={openInvite} />
        </div>

        <div className="flex min-w-0 flex-col">
          <Section>
            <SectionHeader title="Recent activity" linkLabel="All activity" to="/activity" />
            {/* The latest 5 across the firm; the Activity page has everything */}
            <ActivityFeed result={activity} loadMore={false} linkToMatter />
          </Section>
        </div>
      </div>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={inviteCrmMatterId} onInvite={invite} />
    </Page>
  )
}

export default AdminDashboard
