import { useCallback } from 'react'
import { useAcceptMatterInvitationMutation } from '../redux/api/matterApi'
import { isHandledGlobally } from '../redux/api/baseApi'
import { toast } from '../utils/toast'

// Accepts a matter invitation and says so. Resolves true once the matter is the one being shown.
export function useAcceptInvitation() {
  const [acceptMutation, { isLoading, originalArgs }] = useAcceptMatterInvitationMutation()

  const accept = useCallback(async (matter) => {
    try {
      await acceptMutation(matter.id).unwrap()
      toast.success('Invitation accepted', { description: `${matter.label} is now in your portal.` })
      return true
    } catch (err) {
      if (!isHandledGlobally(err)) toast.error("Couldn't accept the invitation", { description: err?.data?.message || 'Please try again.' })
      return false
    }
  }, [acceptMutation])

  return { accept, acceptingId: isLoading ? String(originalArgs) : null }
}
