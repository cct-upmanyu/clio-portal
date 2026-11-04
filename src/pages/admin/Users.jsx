import { useEffect, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import Pagination from '../../components/ui/Pagination'
import Section from '../../components/ui/Section'
import StatusPill from '../../components/ui/StatusPill'
import Tabs from '../../components/ui/Tabs'
import { CheckCircleIcon, ClockIcon, KeyIcon, ShieldIcon, ShieldOffIcon, UserPlusIcon, UsersIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import ListSkeleton from '../../components/admin/ListSkeleton'
import SearchField from '../../components/admin/SearchField'
import UserActions from '../../components/admin/UserActions'
import { useInviteUser } from '../../hooks/useInviteUser'
import { PER_PAGE_OPTIONS, usePageParams } from '../../hooks/usePageParams'
import { useGetAdminUsersQuery } from '../../redux/api/adminApi'
import { formatDateTime } from '../../utils/dates'

const SEARCH_DELAY_MS = 300
const STATUS_LABEL = { active: 'Active', invited: 'Invited', disabled: 'Disabled' }
const columns = 'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_36px] lg:items-center lg:gap-4'

const HEADINGS = [
  { label: 'Name', icon: UsersIcon },
  { label: 'Role', icon: KeyIcon },
  { label: 'Status', icon: CheckCircleIcon },
  { label: '2FA', icon: ShieldIcon },
  { label: 'Last sign-in', icon: ClockIcon },
]

const fullName = (user) => [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

function MfaState({ user }) {
  if (user.mfaEnabled) {
    return <span className="inline-flex items-center gap-1.5 text-[13px] text-success"><ShieldIcon className="size-4" />On</span>
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] ${user.mfaRequired ? 'text-warning' : 'text-muted'}`}>
      <ShieldOffIcon className="size-4" />
      {user.mfaRequired ? 'Not set up yet' : 'Off'}
    </span>
  )
}

function UserRow({ user }) {
  const lastSeen = user.lastSignInAt
    ? formatDateTime(user.lastSignInAt)
    : user.status === 'invited' && user.createdAt ? `Invited ${formatDateTime(user.createdAt)}` : 'Never signed in'

  return (
    <li className={`flex items-start gap-3 py-3 transition-colors max-sm:gap-2.5 max-sm:py-2.5 lg:px-3 lg:hover:bg-subtle/70 ${columns}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3 max-sm:items-start max-sm:gap-2.5">
        <span className="max-sm:hidden"><Avatar name={fullName(user)} size="sm" /></span>
        <span className="mt-0.5 sm:hidden"><Avatar name={fullName(user)} size="xs" /></span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{fullName(user)}</span>
          <span className="truncate text-[13px] text-muted">{user.email}</span>
          {/* Phones and tablets: the other columns fold under the name */}
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted max-sm:mt-0.5 max-sm:gap-x-2 max-sm:text-xs lg:hidden">
            <StatusPill status={STATUS_LABEL[user.status] ?? user.status} />
            <span>{user.roleName}</span>
            <MfaState user={user} />
            <span>{lastSeen}</span>
          </span>
        </div>
      </div>
      <span className="hidden text-sm text-body lg:block">{user.roleName}</span>
      <span className="hidden lg:block"><StatusPill status={STATUS_LABEL[user.status] ?? user.status} /></span>
      <span className="hidden lg:block"><MfaState user={user} /></span>
      <span className="hidden text-[13px] text-muted lg:block">{lastSeen}</span>
      <UserActions user={user} />
    </li>
  )
}

// Search, role, status tab and page all go to the server (GET /admin/users), which filters, counts and
// returns one page of up to 250. Nothing is filtered in the browser.
function Users() {
  const { inviteOpen, openInvite, closeInvite, invite } = useInviteUser()
  const [tab, setTab] = useState('all')
  const [role, setRole] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const { page, perPage, setPage, setPerPage } = usePageParams()

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading, isError, isFetching, refetch } = useGetAdminUsersQuery({
    page, perPage, search, role, status: tab === 'all' ? undefined : tab,
  })
  const pageUsers = data?.users ?? []
  const counts = data?.counts
  const total = data?.pagination?.total ?? 0
  const totalPages = data?.pagination?.totalPages ?? 1

  // e.g. the last user on the last page was disabled while on the Active tab
  useEffect(() => {
    if (data && page > totalPages) setPage(totalPages)
  }, [data, page, totalPages])

  const tabs = ['all', 'active', 'invited', 'disabled'].map((id) => ({
    id,
    label: id === 'all' ? 'All' : STATUS_LABEL[id],
    count: counts?.[id],
  }))

  const resetPage = (fn) => (value) => {
    fn(value)
    setPage(1)
  }

  return (
    // Fills the screen: the header, filters, tabs and pager stay put; only the list scrolls
    <Page scroll={false}>
      <Section className="relative min-h-0 flex-1 gap-4 max-sm:gap-2.5 max-sm:pt-3 max-sm:pb-3" aria-busy={isFetching}>
        {isFetching && !isLoading && (
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 animate-pulse rounded-full bg-brand/60" />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex shrink-0 items-center gap-2 pr-2 text-xl font-semibold text-ink max-sm:basis-[calc(100%-3rem)] max-sm:text-lg">
            Users
            {counts && <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{counts.all}</span>}
          </h1>
          <SearchField className="flex-1 max-sm:order-last max-sm:basis-0" label="Search users" placeholder="Search by name or email" value={query} onChange={resetPage(setQuery)} />
          <select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => resetPage(setRole)(e.target.value)}
            className="h-10 rounded-lg border border-field bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none max-sm:order-last max-sm:h-9 max-sm:max-w-[112px] max-sm:px-2 max-sm:text-[13px]"
          >
            <option value="">All roles</option>
            {(data?.roleFilters ?? []).map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
          {/* Admins only: clients are invited from their matter */}
          <button
            type="button"
            onClick={() => openInvite()}
            aria-label="Invite an admin"
            title="Invite an admin"
            className="ml-auto flex size-10 shrink-0 max-sm:size-9 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <UserPlusIcon className="size-[18px]" />
          </button>
        </div>

        <Tabs label="Filter by status" tabs={tabs} value={tab} onChange={resetPage(setTab)} idPrefix="users" />

        <div className="-mx-6 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 max-sm:-mx-4 max-sm:px-4">
        {isLoading ? (
          <ListSkeleton columns={columns} cells={4} avatar label="Loading users" />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <EmptyState icon={UsersIcon} title="We couldn't load the users">Please try again in a moment.</EmptyState>
            <Button variant="secondary" onClick={refetch} loading={isFetching}>Try again</Button>
          </div>
        ) : pageUsers.length > 0 ? (
          <>
            <div aria-hidden="true" className={`sticky top-0 z-10 hidden rounded-lg bg-brand-soft px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-dark shadow-[0_1px_0_rgba(11,92,173,0.08)] ${columns}`}>
              {HEADINGS.map(({ label, icon: Icon }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon className="size-3.5 text-brand/70" />
                  {label}
                </span>
              ))}
              <span />
            </div>
            <ul aria-label="Users" className={`flex flex-col divide-y divide-divider transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
              {pageUsers.map((user) => <UserRow key={user.id} user={user} />)}
            </ul>
          </>
        ) : (
          <EmptyState icon={UsersIcon} title="No users found">
            {search || role || tab !== 'all' ? 'Try a different name, email, role or status.' : 'Invite an admin with the + button, or invite clients from their matter.'}
          </EmptyState>
        )}
        </div>

        {!isLoading && !isError && pageUsers.length > 0 && (
          <Pagination page={Math.min(page, totalPages)} pageSize={perPage} total={total} onPageChange={setPage} itemLabel="users" pageSizeOptions={PER_PAGE_OPTIONS} onPageSizeChange={setPerPage} />
        )}
      </Section>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} onInvite={invite} adminOnly />
    </Page>
  )
}

export default Users
