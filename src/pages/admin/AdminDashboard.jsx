import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import Section from '../../components/ui/Section'
import SectionHeader from '../../components/ui/SectionHeader'
import {
  InboxIcon, InviteIcon, MattersIcon, ResendIcon, ShieldIcon, UserPlusIcon, UsersIcon,
} from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import StatTile from '../../components/admin/StatTile'
import { ROLES } from '../../data/adminSampleData'
import { adminActions, useAdminData } from '../../hooks/useAdminData'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useInviteUser } from '../../hooks/useInviteUser'
import { useGetAdminDashboardQuery } from '../../redux/api/adminApi'
import { useGetFirmActivityInfiniteQuery } from '../../redux/api/activityApi'
import { useGetTasksDueSoonQuery } from '../../redux/api/taskApi'
import { taskStatus } from '../../utils/tasks'
import ActivityFeed from '../../components/activity/ActivityFeed'
import { greeting } from '../../utils/greeting'
import { formatShort } from '../../utils/dates'
import { toast } from '../../utils/toast'

const CLIENT_ROLE = ROLES.find((role) => role.name === 'Client').id
const PREVIEW = 5

function ResendButton({ user }) {
  const [sending, setSending] = useState(false)
  const resend = async () => {
    setSending(true)
    await adminActions.resendInvitation(user)
    setSending(false)
    toast.success('Invitation sent again', { description: user.email })
  }
  return (
    <Button variant="secondary" size="sm" icon={ResendIcon} loading={sending} onClick={resend} aria-label={`Resend invitation to ${user.firstName} ${user.lastName}`}>
      Resend
    </Button>
  )
}

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

function AdminDashboard() {
  const { firstName } = useCurrentUser()
  const { users, matters } = useAdminData()
  const activity = useGetFirmActivityInfiniteQuery({ perPage: 50 }, { refetchOnFocus: true })
  const { inviteOpen, inviteCrmMatterId, openInvite, closeInvite, invite } = useInviteUser()

  const count = (list, fn) => list.filter(fn).length
  const clients = users.filter((u) => u.role === CLIENT_ROLE)
  const signInUsers = users.filter((u) => u.status === 'active')
  const pending = matters.flatMap((m) => m.contacts.filter((c) => c.invitation === 'pending').map((c) => ({ ...c, matter: m, user: users.find((u) => u.id === c.userId) })))
  const withoutClient = matters.filter((m) => m.status !== 'Closed' && m.contacts.length === 0)
  const mfaMissing = count(signInUsers, (u) => u.mfaRequired && !u.mfaEnabled)

  return (
    <Page>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : greeting()}
        description="Here's what's happening in the Client Portal."
        action={<Button icon={UserPlusIcon} onClick={() => openInvite()}>Invite client</Button>}
      />

      <Section aria-label="Overview" className="bg-canvas">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            to="/matters"
            icon={MattersIcon}
            label="Open matters"
            value={count(matters, (m) => m.status === 'Open')}
            detail={`${count(matters, (m) => m.status === 'Pending')} pending · ${count(matters, (m) => m.status === 'Closed')} closed`}
          />
          <StatTile
            to="/users"
            icon={UsersIcon}
            label="Active clients"
            value={count(clients, (u) => u.status === 'active')}
            detail={`${count(clients, (u) => u.status === 'invited')} invited · ${count(clients, (u) => u.status === 'disabled')} disabled`}
          />
          <StatTile
            to="/matters"
            icon={InviteIcon}
            label="Invitations waiting"
            value={pending.length}
            detail="Sent but not accepted yet"
          />
          <StatTile
            to="/users"
            icon={ShieldIcon}
            label="2FA"
            value={`${count(signInUsers, (u) => u.mfaEnabled)} of ${signInUsers.length}`}
            detail={mfaMissing > 0 ? `${mfaMissing} required but not set up` : 'Everyone required has set it up'}
          />
        </div>
      </Section>

      <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-line">
        <div className="flex min-w-0 flex-col">
          <UnreadMessages />

          <TasksDueSoon />

          <Section>
            <SectionHeader title="Waiting for the client to accept" linkLabel="All matters" to="/matters" />
            {pending.length > 0 ? (
              <ul className="flex flex-col divide-y divide-divider">
                {pending.slice(0, PREVIEW).map(({ userId, name, matter, user }) => (
                  <li key={`${matter.id}-${userId}`} className="flex items-center gap-3 py-3">
                    <Avatar name={name} size="sm" />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-sm font-medium">{name}</span>
                      <span className="truncate text-[13px] text-muted">
                        <Link to={`/matters/${matter.id}`} className="hover:text-brand">{matter.number} · {matter.name}</Link>{user?.invitedAt ? ` · Invited ${formatShort(user.invitedAt)}` : ''}
                      </span>
                    </span>
                    {user?.status === 'invited' && <ResendButton user={user} />}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No invitations waiting">Every invited client has accepted.</EmptyState>
            )}
          </Section>

          <Section>
            <SectionHeader title="Matters without a client" />
            {withoutClient.length > 0 ? (
              <ul className="flex flex-col divide-y divide-divider">
                {withoutClient.slice(0, PREVIEW).map((matter) => (
                  <li key={matter.id} className="flex items-center gap-3 py-3">
                    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
                      <MattersIcon className="size-[18px]" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <Link to={`/matters/${matter.id}`} className="truncate text-sm font-medium hover:text-brand">{matter.number} · {matter.name}</Link>
                      <span className="truncate text-[13px] text-muted">{matter.attorney} · {matter.stage}</span>
                    </span>
                    <Button variant="secondary" size="sm" icon={UserPlusIcon} onClick={() => openInvite(matter.crmMatterId)} aria-label={`Invite a client to ${matter.number}`}>
                      Invite
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Every matter has a client">Open matters all have someone invited.</EmptyState>
            )}
          </Section>
        </div>

        <div className="flex min-w-0 flex-col">
          <Section>
            <SectionHeader title="Recent activity" />
            {/* The latest 50 events across the firm; each matter's Timeline tab has its full history */}
            <ActivityFeed result={activity} loadMore={false} />
          </Section>
        </div>
      </div>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={inviteCrmMatterId} onInvite={invite} />
    </Page>
  )
}

export default AdminDashboard
