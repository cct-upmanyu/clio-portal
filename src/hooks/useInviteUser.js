import { useCallback, useState } from 'react'
import { useInviteUserMutation } from '../redux/api/adminApi'
import { isHandledGlobally } from '../redux/api/baseApi'
import { toast } from '../utils/toast'

// Opens the invite dialog (optionally for one matter, by its CRM id) and sends the invitation
export function useInviteUser() {
  const [dialog, setDialog] = useState({ open: false, crmMatterId: null })
  const [inviteUser] = useInviteUserMutation()

  const openInvite = useCallback((crmMatterId = null) => setDialog({ open: true, crmMatterId }), [])
  const closeInvite = useCallback(() => setDialog((prev) => ({ ...prev, open: false })), [])

  // Resolves { sent: true }, or { fieldErrors } for the dialog to show next to the fields
  const send = useCallback(async (body) => {
    try {
      const data = await inviteUser(body).unwrap()
      toast.success('Invitation sent', {
        description: data.invitation?.type === 'matter'
          ? `${body.email} already has an account. They'll get an email to accept the new matter.`
          : `We've emailed ${body.email} an invitation.`,
      })
      return { sent: true }
    } catch (err) {
      if (isHandledGlobally(err)) return { sent: false }
      const details = err?.data?.details
      if (details && typeof details === 'object' && Object.keys(details).length > 0) {
        // Field problems go next to the fields; say what happened too when it isn't plain validation
        if (err.data.code !== 'VALIDATION_FAILED') toast.error("Couldn't send the invitation", { description: err.data.message })
        return { sent: false, fieldErrors: details }
      }
      toast.error("Couldn't send the invitation", { description: err?.data?.message || 'Please try again.' })
      return { sent: false }
    }
  }, [inviteUser])

  return { inviteOpen: dialog.open, inviteCrmMatterId: dialog.crmMatterId, openInvite, closeInvite, invite: send }
}
