import { useMemo } from 'react'
import { useGetAdminMattersQuery } from '../redux/api/adminApi'

// Every synced matter for the Admin Console, in the shape its pages use
const toMatter = (matter) => ({
  id: String(matter.id),
  crmMatterId: matter.crmMatterId,
  number: matter.number || '—',
  name: matter.name || 'Untitled matter',
  status: matter.status,
  stage: matter.stage || '—',
  attorney: matter.responsibleAttorney || 'No attorney assigned',
  openedOn: matter.openedOn,
  // On the matter now (accepted, pending or expired invitation); removed ones are kept apart for history
  contacts: (matter.contacts || []).filter((c) => c.invitation !== 'removed'),
  removedContacts: (matter.contacts || []).filter((c) => c.invitation === 'removed'),
})

export function useAdminMatters() {
  const { data, isLoading, isError, refetch, isFetching } = useGetAdminMattersQuery()
  const matters = useMemo(() => (data ?? []).map(toMatter), [data])
  return { matters, isLoading, isError, refetch, isFetching }
}
