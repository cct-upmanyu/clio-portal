import { useCallback, useState } from 'react'
import { useGetAdminUsersQuery } from '../redux/api/adminApi'
import { useInviteUser } from './useInviteUser'
import { toast } from '../utils/toast'

// Re-invite / resend a client to a matter with what's already on file for them (the same invitation the
// invite dialog sends), so nothing has to be typed again. An active client gets a "new matter" email;
// someone who never activated their account gets a fresh account invitation.
// Returns { reinvite(userId, crmMatterId), sendingTo (userId while it sends) }.
export function useReinvite() {
  const { data: usersData } = useGetAdminUsersQuery()
  const { invite } = useInviteUser()
  const [sendingTo, setSendingTo] = useState(null)

  const reinvite = useCallback(async (userId, crmMatterId) => {
    const user = usersData?.users.find((u) => String(u.id) === String(userId))
    if (!user) {
      toast.error("Couldn't find this person's details", { description: 'Use Invite client instead.' })
      return
    }
    setSendingTo(String(userId))
    try {
      await invite({
        email: user.email,
        ...(user.salutation ? { salutation: user.salutation } : {}),
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        timezone: user.timezone || usersData.defaultTimezone,
        mfaRequired: user.mfaRequired,
        crmMatterId,
      })
    } finally {
      setSendingTo(null)
    }
  }, [usersData, invite])

  return { reinvite, sendingTo }
}
