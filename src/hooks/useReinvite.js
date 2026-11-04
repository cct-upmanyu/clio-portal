import { useCallback, useState } from 'react'
import { useLazyGetAdminUserQuery } from '../redux/api/adminApi'
import { useInviteUser } from './useInviteUser'
import { toast } from '../utils/toast'

// Re-invite / resend a client to a matter with what's already on file for them (the same invitation the
// invite dialog sends), so nothing has to be typed again. An active client gets a "new matter" email;
// someone who never activated their account gets a fresh account invitation.
// Returns { reinvite(userId, crmMatterId), sendingTo (userId while it sends) }.
export function useReinvite() {
  const [getUser] = useLazyGetAdminUserQuery()
  const { invite } = useInviteUser()
  const [sendingTo, setSendingTo] = useState(null)

  const reinvite = useCallback(async (userId, crmMatterId) => {
    setSendingTo(String(userId))
    try {
      const { data } = await getUser(userId, true)
      const user = data?.user
      if (!user) {
        toast.error("Couldn't find this person's details", { description: 'Use Invite client instead.' })
        return
      }
      await invite({
        email: user.email,
        ...(user.salutation ? { salutation: user.salutation } : {}),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        timezone: user.timezone || data.defaultTimezone,
        mfaRequired: user.mfaRequired,
        crmMatterId,
      })
    } finally {
      setSendingTo(null)
    }
  }, [getUser, invite])

  return { reinvite, sendingTo }
}
