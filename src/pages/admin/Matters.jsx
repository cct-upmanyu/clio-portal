import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import Pagination from '../../components/ui/Pagination'
import Section from '../../components/ui/Section'
import StatusPill from '../../components/ui/StatusPill'
import Tabs from '../../components/ui/Tabs'
import { CalendarIcon, CheckCircleIcon, MattersIcon, TimelineIcon, UserPlusIcon, UsersIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import RowMenu from '../../components/admin/RowMenu'
import ListSkeleton from '../../components/admin/ListSkeleton'
import SearchField from '../../components/admin/SearchField'
import { toAdminMatter } from '../../hooks/useAdminMatters'
import { useInviteUser } from '../../hooks/useInviteUser'
import { PER_PAGE_OPTIONS, usePageParams } from '../../hooks/usePageParams'
import { useGetAdminMattersQuery } from '../../redux/api/adminApi'
import { formatDay } from '../../utils/dates'

const STATUSES = ['Open', 'Pending', 'Closed']
const SEARCH_DELAY_MS = 300
const opened = (matter) => (matter.openedOn ? formatDay(matter.openedOn) : '—')
const HEADINGS = [
  { label: 'Matter', icon: MattersIcon },
  { label: 'Clients', icon: UsersIcon },
  { label: 'Stage', icon: TimelineIcon },
  { label: 'Opened', icon: CalendarIcon },
  { label: 'Status', icon: CheckCircleIcon },
]
const columns = 'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-center lg:gap-4'

// "Jane Doe" / "Jane Doe, Marcus Lee" plus who still has to accept
function Clients({ contacts }) {
  if (contacts.length === 0) return <span className="text-[13px] font-medium text-warning">No client invited yet</span>
  const pending = contacts.filter((c) => c.invitation !== 'accepted').length
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm text-body">{contacts.map((c) => c.name).join(', ')}</span>
      {pending > 0 && <span className="text-[13px] text-warning">{pending === contacts.length ? 'Invitation not accepted yet' : `${pending} not accepted yet`}</span>}
    </span>
  )
}

function MatterRow({ matter, onInvite }) {
  const canInvite = matter.status !== 'Closed'
  return (
    <li className={`flex items-start gap-3 py-3 transition-colors max-sm:gap-2.5 max-sm:py-2.5 lg:px-3 lg:hover:bg-subtle/70 ${columns}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link to={`/matters/${matter.id}`} className="truncate text-sm font-medium hover:text-brand">{matter.number} · {matter.name}</Link>
        <span className="truncate text-[13px] text-muted">{matter.attorney} · Opened {opened(matter)}</span>
        <span className="mt-1.5 flex flex-col gap-1.5 max-sm:mt-1 max-sm:gap-1 lg:hidden">
          <Clients contacts={matter.contacts} />
          <span className="flex items-center gap-3 text-[13px] text-muted">
            <StatusPill status={matter.status} />
            {matter.stage}
          </span>
        </span>
      </div>
      <span className="hidden min-w-0 lg:flex"><Clients contacts={matter.contacts} /></span>
      <span className="hidden text-sm text-body lg:block">{matter.stage}</span>
      <span className="hidden text-[13px] text-muted lg:block">{opened(matter)}</span>
      <span className="hidden lg:block"><StatusPill status={matter.status} /></span>
      <RowMenu
        label={`Actions for ${matter.number} · ${matter.name}`}
        items={[
          ...(canInvite ? [{ label: 'Invite a client', icon: UserPlusIcon, onSelect: () => onInvite(matter.crmMatterId, `${matter.number} · ${matter.name}`) }] : []),
        ]}
      />
    </li>
  )
}

// Search, status tab, page and page size all go to the server (GET /admin/matters), which filters, counts
// and returns one page. Nothing is filtered in the browser.
function Matters() {
  const { inviteOpen, inviteCrmMatterId, inviteMatterLabel, openInvite, closeInvite, invite } = useInviteUser()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const { page, perPage, setPage, setPerPage } = usePageParams()

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, isError, refetch, isFetching } = useGetAdminMattersQuery({
    page, perPage, search, status: tab === 'all' ? undefined : tab,
  })
  const pageMatters = useMemo(() => (data?.matters ?? []).map(toAdminMatter), [data])
  const counts = data?.counts
  const total = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.totalPages ?? 1
  const currentPage = Math.min(page, totalPages)

  // e.g. the last matter on the last page changed status
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages)
  }, [data, page, totalPages, setPage])

  const tabs = [
    { id: 'all', label: 'All', count: counts?.all },
    ...STATUSES.map((status) => ({ id: status, label: status, count: counts?.[status] })),
  ]

  return (
    // Fills the screen: the toolbar, tabs and pager stay put; only the list scrolls
    <Page scroll={false}>
      <Section className="relative min-h-0 flex-1 gap-4 max-sm:gap-2.5 max-sm:pt-3 max-sm:pb-3" aria-busy={isFetching}>
        {isFetching && !isLoading && (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 animate-pulse rounded-full bg-brand/60" />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex shrink-0 items-center gap-2 pr-2 text-xl font-semibold text-ink max-sm:basis-full max-sm:text-lg">
            Matters
            {counts && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{counts.all}</span>}
          </h1>
          <SearchField
            className="flex-1 max-sm:order-last max-sm:basis-full"
            label="Search matters"
            placeholder="Search by number, name or client"
            value={query}
            onChange={(value) => { setQuery(value); setPage(1) }}
          />
        </div>

        <Tabs label="Filter by status" tabs={tabs} value={tab} onChange={(id) => { setTab(id); setPage(1) }} idPrefix="matters" />

        <div className="-mx-6 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 max-sm:-mx-4 max-sm:px-4">
          {isLoading ? (
            <ListSkeleton columns={columns} cells={4} label="Loading matters" />
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <EmptyState icon={MattersIcon} title="We couldn't load the matters">Please try again in a moment.</EmptyState>
              <Button variant="secondary" onClick={refetch} loading={isFetching}>Try again</Button>
            </div>
          ) : pageMatters.length > 0 ? (
            <>
              <div aria-hidden="true" className={`sticky top-0 z-10 hidden rounded-lg bg-brand-soft px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-dark shadow-[0_1px_0_rgba(11,92,173,0.08)] ${columns}`}>
                {HEADINGS.map(({ label, icon: Icon }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <Icon className="size-3.5 text-brand/70" />
                    {label}
                  </span>
                ))}
                <span className="w-9" />
              </div>
              <ul aria-label="Matters" className={`flex flex-col divide-y divide-divider transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
                {pageMatters.map((matter) => <MatterRow key={matter.id} matter={matter} onInvite={openInvite} />)}
              </ul>
            </>
          ) : (
            <EmptyState icon={MattersIcon} title="No matters found">
              {query || tab !== 'all' ? 'Try a different number, name, client or status.' : 'Matters appear here once they sync from Zoho CRM.'}
            </EmptyState>
          )}
        </div>

        {!isLoading && !isError && pageMatters.length > 0 && (
          <Pagination page={currentPage} pageSize={perPage} total={total} onPageChange={setPage} itemLabel="matters" pageSizeOptions={PER_PAGE_OPTIONS} onPageSizeChange={setPerPage} />
        )}
      </Section>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={inviteCrmMatterId} matterLabel={inviteMatterLabel} onInvite={invite} />
    </Page>
  )
}

export default Matters
