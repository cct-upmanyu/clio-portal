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
  CheckCircleIcon, InviteIcon, MattersIcon, ResendIcon, ShieldIcon, UserPlusIcon, UsersIcon, UserXIcon,
} from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import StatTile from '../../components/admin/StatTile'
import { ROLES } from '../../data/adminSampleData'
import { adminActions, useAdminData } from '../../hooks/useAdminData'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useInviteUser } from '../../hooks/useInviteUser'
import { greeting } from '../../utils/greeting'
import { formatShort } from '../../utils/dates'
import { toast } from '../../utils/toast'

const CLIENT_ROLE = ROLES.find((role) => role.name === 'Client').id
const ACTIVITY_ICONS = { accepted: CheckCircleIcon, invited: InviteIcon, mfa: ShieldIcon, disabled: UserXIcon, enabled: UsersIcon }
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

function AdminDashboard() {
  const { firstName } = useCurrentUser()
  const { users, matters, activity } = useAdminData()
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
            {activity.length > 0 ? (
              <ul className="flex flex-col gap-4 pt-1">
                {activity.slice(0, 8).map((item) => {
                  const Icon = ACTIVITY_ICONS[item.kind] ?? CheckCircleIcon
                  return (
                    <li key={item.id} className="flex gap-3">
                      <span aria-hidden="true" className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-body">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[13px] leading-normal text-ink">{item.text}</span>
                        <span className="text-xs text-muted">{formatShort(item.at)}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <EmptyState title="Nothing yet">Invitations, sign-in changes and access changes will show here.</EmptyState>
            )}
          </Section>
        </div>
      </div>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={inviteCrmMatterId} onInvite={invite} />
    </Page>
  )
}

export default AdminDashboard
