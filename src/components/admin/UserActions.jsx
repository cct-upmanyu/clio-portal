import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog'
import { EditIcon, ResendIcon, ShieldIcon, ShieldOffIcon, UserCheckIcon, UserXIcon } from '../ui/icons'
import EditUserDialog from './EditUserDialog'
import RowMenu from './RowMenu'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { isHandledGlobally } from '../../redux/api/baseApi'
import {
  useDisableUserAccessMutation, useEnableUserAccessMutation, useResendUserInvitationMutation, useResetUserMfaMutation,
  useSetUserMfaRequiredMutation,
} from '../../redux/api/adminApi'
import { toast } from '../../utils/toast'

const fullName = (user) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

// Every confirmable action: what the dialog says (`you` on your own row) and which call runs on confirm
const CONFIRMS = {
  disable: (user) => ({
    icon: UserXIcon, tone: 'danger', title: `Disable ${fullName(user)}'s access?`, confirmLabel: 'Disable access',
    body: "They'll be signed out straight away and can't sign in until you enable their access again. Nothing is deleted.",
    run: 'disable', done: 'Access disabled',
  }),
  enable: (user) => ({
    icon: UserCheckIcon, tone: 'primary', title: `Enable ${fullName(user)}'s access?`, confirmLabel: 'Enable access',
    body: 'They can sign in again and will see the matters they had accepted before.',
    run: 'enable', done: 'Access enabled',
  }),
  resetMfa: (user, self) => ({
    icon: ShieldOffIcon, tone: 'danger', title: self ? 'Reset your 2FA?' : 'Reset 2FA?', confirmLabel: 'Reset',
    body: self
      ? `This removes your authenticator apps and backup codes. ${user.mfaRequired ? "You'll set up a new authenticator the next time you sign in." : 'You can sign in with just your password until you set it up again.'}`
      : `This removes ${fullName(user)}'s authenticator apps and backup codes. ${user.mfaRequired ? "They'll set up a new authenticator the next time they sign in." : 'They can sign in with just their password until they set it up again.'}`,
    run: 'resetMfa', done: '2FA reset',
  }),
  stopRequiringMfa: (user, self) => ({
    icon: ShieldOffIcon, tone: 'danger', title: 'Stop requiring 2FA?', confirmLabel: 'Stop requiring',
    body: self
      ? 'You will be able to sign in with just a password or emailed code. Authenticators you already set up keep working.'
      : `${fullName(user)} will be able to sign in with just a password or emailed code. Authenticators they already set up keep working.`,
    run: 'stopRequiringMfa', done: '2FA is no longer required',
  }),
}

// The "⋮" menu on a user row. What's offered comes from the backend, which enforces the same rules:
// canEdit (a super admin only by themselves), canManageAccess (never yourself or a super admin: disable,
// enable, resend invitation), canManageMfa (anyone's 2FA, your own included; a super admin's only by a
// super admin).
function UserActions({ user }) {
  const currentUser = useCurrentUser()
  const [confirm, setConfirm] = useState(null)
  const [editing, setEditing] = useState(false)
  const isSelf = String(user.id) === String(currentUser.id)

  const [disableAccess, disabling] = useDisableUserAccessMutation()
  const [enableAccess, enabling] = useEnableUserAccessMutation()
  const [resendInvitation] = useResendUserInvitationMutation()
  const [setMfaRequired] = useSetUserMfaRequiredMutation()
  const [resetMfa, resetting] = useResetUserMfaMutation()
  const busy = disabling.isLoading || enabling.isLoading || resetting.isLoading

  const calls = {
    disable: () => disableAccess(user.id),
    enable: () => enableAccess(user.id),
    resendInvitation: () => resendInvitation(user.id),
    requireMfa: () => setMfaRequired({ id: user.id, required: true }),
    stopRequiringMfa: () => setMfaRequired({ id: user.id, required: false }),
    resetMfa: () => resetMfa(user.id),
  }

  const run = async (key, doneMessage) => {
    try {
      await calls[key]().unwrap()
      toast.success(doneMessage, { description: fullName(user) })
      setConfirm(null)
    } catch (err) {
      if (!isHandledGlobally(err)) toast.error("Couldn't update this user", { description: err?.data?.message || 'Please try again.' })
    }
  }

  const ask = (key) => () => setConfirm(CONFIRMS[key](user, isSelf))
  const active = user.status !== 'disabled'

  const items = [
    user.canEdit && { label: 'Edit details', icon: EditIcon, onSelect: () => setEditing(true) },
    user.canManageAccess && user.status === 'invited'
      && { label: 'Resend invitation', icon: ResendIcon, onSelect: () => run('resendInvitation', 'Invitation sent again') },
    user.canManageMfa && active && user.mfaEnabled && { label: isSelf ? 'Reset my 2FA' : 'Reset 2FA', icon: ShieldOffIcon, onSelect: ask('resetMfa') },
    user.canManageMfa && active && !user.mfaRequired && { label: 'Require 2FA', icon: ShieldIcon, onSelect: () => run('requireMfa', '2FA is now required') },
    user.canManageMfa && active && user.mfaRequired && { label: 'Stop requiring 2FA', icon: ShieldOffIcon, onSelect: ask('stopRequiringMfa') },
    user.canManageAccess && (user.status === 'disabled'
      ? { label: 'Enable access', icon: UserCheckIcon, onSelect: ask('enable') }
      : { label: 'Disable access', icon: UserXIcon, onSelect: ask('disable'), tone: 'danger' }),
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
