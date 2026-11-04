import { useMemo } from 'react'
import { useGetAdminMatterQuery } from '../redux/api/adminApi'

// A synced matter for the Admin Console, in the shape its pages use
export const toAdminMatter = (matter) => ({
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

// One matter's page (by its portal id)
export function useAdminMatter(matterId) {
  const { data, isLoading, isError, error, refetch, isFetching } = useGetAdminMatterQuery(matterId, { skip: !matterId })
  const matter = useMemo(() => (data ? toAdminMatter(data) : null), [data])
  return { matter, isLoading, isError, notFound: error?.status === 404, refetch, isFetching }
}
