import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useGetMattersQuery, useSelectMatterMutation } from '../redux/api/matterApi'
import { formatDay } from '../utils/dates'

// Documents, messages, tasks and events aren't served by the backend yet: their pages show empty states
const toMatter = (matter) => ({
  ...matter,
  title: matter.name || 'Untitled matter',
  label: [matter.number, matter.name || 'Untitled matter'].filter(Boolean).join(' · '),
  opened: matter.openedOn ? formatDay(matter.openedOn) : null,
  documents: [],
  messages: [],
  tasks: [],
  events: [],
})

// The client's matters, the ones they're invited to but haven't accepted, and the one every page is showing. The selection is saved on the user
// (GET /auth/me → selectedMatterId), so a reload or another device opens the same matter.
export function useMatters() {
  const { data, isLoading, isError, refetch, isFetching } = useGetMattersQuery()
  const savedId = useSelector((state) => state.auth.user?.selectedMatterId ?? null)
  const [saveSelection] = useSelectMatterMutation()

  const matters = useMemo(() => (data?.matters ?? []).map(toMatter), [data])
  const invitations = useMemo(() => (data?.invitations ?? []).map((invitation) => toMatter(invitation.matter)), [data])
  // A saved matter the user can no longer see falls back to their first one, as on the backend
  const selectedMatter = matters.find((m) => String(m.id) === String(savedId)) ?? matters[0] ?? null

  const selectMatter = useCallback((id) => {
    if (String(id) !== String(selectedMatter?.id)) saveSelection(String(id))
  }, [saveSelection, selectedMatter?.id])

  return { matters, invitations, selectedMatter, selectMatter, isLoading, isError, refetch, isFetching }
}
