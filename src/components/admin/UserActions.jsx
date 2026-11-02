import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'
import { EditIcon, ResendIcon, ShieldIcon, ShieldOffIcon, UserCheckIcon, UserXIcon } from '../ui/icons'
import EditUserDialog from './EditUserDialog'
import RowMenu from './RowMenu'
import { adminActions } from '../../hooks/useAdminData'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { toast } from '../../utils/toast'

const ACTIONS_CONNECTED = false

const fullName = (user) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

// Every confirmable action: what the dialog says and what runs on confirm
const CONFIRMS = {
  disable: (user) => ({
    icon: UserXIcon, tone: 'danger', title: `Disable ${fullName(user)}'s access?`, confirmLabel: 'Disable access',
    body: "They'll be signed out straight away and can't sign in until you enable their access again. Nothing is deleted.",
    run: () => adminActions.setAccess(user, false), done: 'Access disabled',
  }),
  enable: (user) => ({
    icon: UserCheckIcon, tone: 'primary', title: `Enable ${fullName(user)}'s access?`, confirmLabel: 'Enable access',
    body: 'They can sign in again and will see the matters they had accepted before.',
    run: () => adminActions.setAccess(user, true), done: 'Access enabled',
  }),
  resetMfa: (user) => ({
    icon: ShieldOffIcon, tone: 'danger', title: 'Reset 2FA?', confirmLabel: 'Reset',
    body: `This removes ${fullName(user)}'s authenticator apps and backup codes. ${user.mfaRequired ? "They'll set up a new authenticator the next time they sign in." : 'They can sign in with just their password until they set it up again.'}`,
    run: () => adminActions.resetMfa(user), done: '2FA reset',
  }),
  stopRequiringMfa: (user) => ({
    icon: ShieldOffIcon, tone: 'danger', title: 'Stop requiring 2FA?', confirmLabel: 'Stop requiring',
    body: `${fullName(user)} will be able to sign in with just a password or emailed code. Authenticators they already set up keep working.`,
    run: () => adminActions.setMfaRequired(user, false), done: '2FA is no longer required',
  }),
}

// The "⋮" menu on a user row. What's offered comes from the backend (canEdit, canManageAccess):
// a super admin is only editable by themselves and their access can never be changed; on your own
// row only "Edit details" is offered (not your email). The backend enforces the same rules.
function UserActions({ user }) {
  const currentUser = useCurrentUser()
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false)
  const isSelf = String(user.id) === String(currentUser.id)

  const run = async (action, doneMessage) => {
    // TODO: connect each action to its admin API; until then nothing is changed
    if (!ACTIONS_CONNECTED) {
      setConfirm(null)
      toast.info('Not available yet', { description: 'This action will work once its API is connected.' })
      return
    }
    setBusy(true)
    try {
      await action()
      toast.success(doneMessage, { description: fullName(user) })
      setConfirm(null)
    } catch (err) {
      toast.error("Couldn't update this user", { description: err.message || 'Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const ask = (key) => () => setConfirm(CONFIRMS[key](user))

  const editItem = user.canEdit && { label: 'Edit details', icon: EditIcon, onSelect: () => setEditing(true) }
  const items = !user.canManageAccess ? [editItem].filter(Boolean) : [
    editItem,
    user.status === 'invited' && { label: 'Resend invitation', icon: ResendIcon, onSelect: () => run(() => adminActions.resendInvitation(user), 'Invitation sent again') },
    user.status === 'active' && user.mfaEnabled && { label: 'Reset 2FA', icon: ShieldOffIcon, onSelect: ask('resetMfa') },
    user.status !== 'disabled' && !user.mfaRequired && { label: 'Require 2FA', icon: ShieldIcon, onSelect: () => run(() => adminActions.setMfaRequired(user, true), '2FA is now required') },
    user.status !== 'disabled' && user.mfaRequired && { label: 'Stop requiring 2FA', icon: ShieldOffIcon, onSelect: ask('stopRequiringMfa') },
    user.status === 'disabled'
      ? { label: 'Enable access', icon: UserCheckIcon, onSelect: ask('enable') }
      : { label: 'Disable access', icon: UserXIcon, onSelect: ask('disable'), tone: 'danger' },
  ].filter(Boolean)

  return (
    <>
      <RowMenu label={`Actions for ${fullName(user)}`} items={items} />
      <EditUserDialog user={editing ? user : null} isSelf={isSelf} onClose={() => setEditing(false)} />
      <ConfirmDialog
        open={Boolean(confirm)}
        icon={confirm?.icon}
        tone={confirm?.tone}
        title={confirm?.title ?? ''}
        confirmLabel={confirm?.confirmLabel}
        loading={busy}
        loadingLabel="Saving…"
        onConfirm={() => run(confirm.run, confirm.done)}
        onCancel={() => setConfirm(null)}
      >
        {confirm?.body}
      </ConfirmDialog>
    </>
  )
}

export default UserActions
