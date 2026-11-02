import { useState } from 'react'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import { UserPlusIcon, UsersIcon, UserXIcon } from '../ui/icons'
import RowMenu from './RowMenu'
import { useRemoveMatterContactMutation } from '../../redux/api/adminApi'
import { formatDateTime, formatDay } from '../../utils/dates'
import { toast } from '../../utils/toast'

const BADGES = {
  accepted: { label: 'Accepted', className: 'bg-success-soft text-success' },
  pending: { label: 'Invitation pending', className: 'bg-warning-soft text-warning' },
  expired: { label: 'Invitation expired', className: 'bg-danger-soft text-danger' },
  removed: { label: 'Removed', className: 'bg-subtle text-muted' },
}

// "Invited Nov 1 · Accepted Nov 2 · Last read the chat Nov 3, 4:10 PM", or for a removed client when and by whom
function history(contact) {
  const parts = []
  if (contact.invitation === 'removed') {
    parts.push(`Removed ${contact.removedAt ? formatDateTime(contact.removedAt) : ''}${contact.removedBy ? ` by ${contact.removedBy}` : ''}`.trim())
    if (contact.acceptedAt) parts.push(`Had accepted ${formatDay(contact.acceptedAt)}`)
    return parts.join(' · ')
  }
  if (contact.invitedAt) parts.push(`Invited ${formatDay(contact.invitedAt)}`)
  if (contact.invitation === 'accepted') {
    if (contact.acceptedAt) parts.push(`Accepted ${formatDay(contact.acceptedAt)}`)
    parts.push(contact.lastReadAt ? `Last read the chat ${formatDateTime(contact.lastReadAt)}` : 'Hasn\'t opened the chat yet')
  } else if (contact.invitation === 'pending') {
    parts.push('Waiting for them to accept')
  } else if (contact.invitation === 'expired') {
    parts.push('The link expired before they used it; invite them again to send a new one')
  }
  return parts.join(' · ')
}

function ContactRow({ contact, actions }) {
  const badge = BADGES[contact.invitation] ?? BADGES.pending
  const removed = contact.invitation === 'removed'
  return (
    <li className={`flex items-center gap-3 py-3 ${removed ? 'opacity-70' : ''}`}>
      <Avatar name={contact.name} size="sm" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate text-sm font-medium">{contact.name}</span>
          {contact.email && <span className="truncate text-[13px] text-muted">{contact.email}</span>}
        </span>
        <span className="text-[13px] text-muted">{history(contact)}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>{badge.label}</span>
      {actions}
    </li>
  )
}

// The matter's clients and their history on it. Admins can take someone off the matter: they lose
// access at once, while their messages and timeline entries stay as they were.
function MatterUsers({ matter, onInvite }) {
  const [removeContact, { isLoading: removing }] = useRemoveMatterContactMutation()
  const [confirming, setConfirming] = useState(null)
  const canInvite = matter.status !== 'Closed'

  const remove = async () => {
    try {
      await removeContact({ crmMatterId: matter.crmMatterId, userId: confirming.userId }).unwrap()
      toast.success(`${confirming.name} was removed from this matter`)
      setConfirming(null)
    } catch (err) {
      toast.error("Couldn't remove them", { description: err?.data?.message || 'Please try again.' })
    }
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      {matter.contacts.length === 0 ? (
        <div className="flex flex-col items-center pb-6">
          <EmptyState icon={UsersIcon} title="No client on this matter">
            Invite a client to give them access to this matter in the portal.
          </EmptyState>
          {canInvite && <Button icon={UserPlusIcon} onClick={onInvite}>Invite client</Button>}
        </div>
      ) : (
        <ul aria-label="Clients on this matter" className="flex flex-col divide-y divide-divider">
          {matter.contacts.map((contact) => (
            <ContactRow
              key={contact.userId}
              contact={contact}
              actions={(
                <RowMenu
                  label={`Actions for ${contact.name}`}
                  items={[{ label: 'Remove from this matter', icon: UserXIcon, tone: 'danger', onSelect: () => setConfirming(contact) }]}
                />
              )}
            />
          ))}
        </ul>
      )}

      {matter.removedContacts.length > 0 && (
        <section aria-labelledby="removed-clients" className="flex flex-col">
          <h2 id="removed-clients" className="border-b border-divider pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted">Removed</h2>
          <ul className="flex flex-col divide-y divide-divider">
            {matter.removedContacts.map((contact) => (
              <ContactRow key={contact.userId} contact={contact} actions={<span className="size-9 shrink-0" />} />
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        open={Boolean(confirming)}
        icon={UserXIcon}
        tone="danger"
        title={confirming ? `Remove ${confirming.name} from this matter?` : ''}
        confirmLabel="Remove"
        loading={removing}
        loadingLabel="Removing…"
        onConfirm={remove}
        onCancel={() => setConfirming(null)}
      >
        {confirming?.invitation === 'accepted'
          ? 'They lose access straight away: the matter leaves their portal and they get no more of its messages. What they already wrote or did stays in the conversation and the activity.'
          : 'Their invitation link to this matter stops working. You can invite them again later.'}
      </ConfirmDialog>
    </div>
  )
}

export default MatterUsers
