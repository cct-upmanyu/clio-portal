import { useMemo, useState } from 'react'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import Section from '../../components/ui/Section'
import StatusPill from '../../components/ui/StatusPill'
import Tabs from '../../components/ui/Tabs'
import Spinner from '../../components/ui/Spinner'
import { ShieldIcon, ShieldOffIcon, UserPlusIcon, UsersIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import SearchField from '../../components/admin/SearchField'
import UserActions from '../../components/admin/UserActions'
import { useInviteUser } from '../../hooks/useInviteUser'
import { useGetAdminUsersQuery } from '../../redux/api/adminApi'
import { formatDateTime } from '../../utils/dates'

const PAGE_SIZE = 10
const STATUS_LABEL = { active: 'Active', invited: 'Invited', disabled: 'Disabled' }
const columns = 'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_36px] lg:items-center lg:gap-4'

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
    <li className={`flex items-start gap-3 py-3 ${columns}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={fullName(user)} size="sm" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{fullName(user)}</span>
          <span className="truncate text-[13px] text-muted">{user.email}</span>
          {/* Phones and tablets: the other columns fold under the name */}
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted lg:hidden">
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

function Users() {
  const { data, isLoading, isError, isFetching, refetch } = useGetAdminUsersQuery()
  const users = useMemo(() => data?.users ?? [], [data])
  // Every role someone has (Super admin included), for the filter
  const roleOptions = useMemo(() => [...new Map(users.map((u) => [u.role, u.roleName])).entries()], [users])
  const { inviteOpen, openInvite, closeInvite, invite } = useInviteUser()
  const [tab, setTab] = useState('all')
  const [role, setRole] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => (!role || u.role === role) && (!q || `${fullName(u)} ${u.email}`.toLowerCase().includes(q)))
  }, [users, role, query])

  const tabs = ['all', 'active', 'invited', 'disabled'].map((id) => ({
    id,
    label: id === 'all' ? 'All' : STATUS_LABEL[id],
    count: id === 'all' ? searched.length : searched.filter((u) => u.status === id).length,
  }))
  const visible = tab === 'all' ? searched : searched.filter((u) => u.status === tab)
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)))
  const pageUsers = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetPage = (fn) => (value) => {
    fn(value)
    setPage(1)
  }

  return (
    <Page>
      <PageHeader
        title="Users"
        description="Everyone who can sign in: clients, admins and super admins."
        action={<Button icon={UserPlusIcon} onClick={() => openInvite()}>Invite user</Button>}
      />

      <Section className="flex-1 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField className="flex-1" label="Search users" placeholder="Search by name or email" value={query} onChange={resetPage(setQuery)} />
          <select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => resetPage(setRole)(e.target.value)}
            className="h-10 rounded-lg border border-field bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none max-sm:w-full"
          >
            <option value="">All roles</option>
            {roleOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>

        <Tabs label="Filter by status" tabs={tabs} value={tab} onChange={resetPage(setTab)} idPrefix="users" />

        {isLoading ? (
          <div className="flex justify-center py-16 text-brand">
            <Spinner className="size-6" />
            <span className="sr-only">Loading users</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <EmptyState icon={UsersIcon} title="We couldn't load the users">Please try again in a moment.</EmptyState>
            <Button variant="secondary" onClick={refetch} loading={isFetching}>Try again</Button>
          </div>
        ) : pageUsers.length > 0 ? (
          <>
            <div aria-hidden="true" className={`hidden border-b border-divider pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted ${columns}`}>
              <span>Name</span><span>Role</span><span>Status</span><span>2FA</span><span>Last sign-in</span><span />
            </div>
            <ul aria-label="Users" className="-mt-4 flex flex-col divide-y divide-divider">
              {pageUsers.map((user) => <UserRow key={user.id} user={user} />)}
            </ul>
            <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={setPage} itemLabel="users" />
          </>
        ) : (
          <EmptyState icon={UsersIcon} title="No users found">
            {query || role ? 'Try a different name, email or role.' : 'Invite someone to get started.'}
          </EmptyState>
        )}
      </Section>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} onInvite={invite} />
    </Page>
  )
}

export default Users
