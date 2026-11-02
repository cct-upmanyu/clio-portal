import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import Pagination from '../../components/ui/Pagination'
import Section from '../../components/ui/Section'
import StatusPill from '../../components/ui/StatusPill'
import Tabs from '../../components/ui/Tabs'
import { MattersIcon, UserPlusIcon } from '../../components/ui/icons'
import InviteUserDialog from '../../components/admin/InviteUserDialog'
import SearchField from '../../components/admin/SearchField'
import { useAdminData } from '../../hooks/useAdminData'
import { useInviteUser } from '../../hooks/useInviteUser'
import { formatDay } from '../../utils/dates'

const PAGE_SIZE = 10
const STATUSES = ['Open', 'Pending', 'Closed']
const columns = 'lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-center lg:gap-4'

// "Jane Doe" / "Jane Doe, Marcus Lee" plus who still has to accept
function Clients({ contacts }) {
  if (contacts.length === 0) return <span className="text-[13px] font-medium text-warning">No client invited yet</span>
  const pending = contacts.filter((c) => c.invitation === 'pending').length
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
    <li className={`flex items-start gap-3 py-3 ${columns}`}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link to={`/matters/${matter.id}`} className="truncate text-sm font-medium hover:text-brand">{matter.number} · {matter.name}</Link>
        <span className="truncate text-[13px] text-muted">{matter.attorney} · Opened {formatDay(matter.openedOn)}</span>
        <span className="mt-1.5 flex flex-col gap-1.5 lg:hidden">
          <Clients contacts={matter.contacts} />
          <span className="flex items-center gap-3 text-[13px] text-muted">
            <StatusPill status={matter.status} />
            {matter.stage}
          </span>
        </span>
      </div>
      <span className="hidden min-w-0 lg:flex"><Clients contacts={matter.contacts} /></span>
      <span className="hidden text-sm text-body lg:block">{matter.stage}</span>
      <span className="hidden text-[13px] text-muted lg:block">{formatDay(matter.openedOn)}</span>
      <span className="hidden lg:block"><StatusPill status={matter.status} /></span>
      {canInvite ? (
        <Button variant="secondary" size="sm" icon={UserPlusIcon} onClick={() => onInvite(matter.crmMatterId)} aria-label={`Invite a client to ${matter.number} · ${matter.name}`}>
          Invite
        </Button>
      ) : (
        <span className="hidden w-[86px] lg:block" />
      )}
    </li>
  )
}

function Matters() {
  const { matters } = useAdminData()
  const { inviteOpen, inviteCrmMatterId, openInvite, closeInvite, invite } = useInviteUser()
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return matters
    return matters.filter((m) => `${m.number} ${m.name} ${m.attorney} ${m.contacts.map((c) => c.name).join(' ')}`.toLowerCase().includes(q))
  }, [matters, query])

  const tabs = [
    { id: 'all', label: 'All', count: searched.length },
    ...STATUSES.map((status) => ({ id: status, label: status, count: searched.filter((m) => m.status === status).length })),
  ]
  const visible = tab === 'all' ? searched : searched.filter((m) => m.status === tab)
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)))
  const pageMatters = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <Page>
      <PageHeader
        title="Matters"
        description="Matters synced from Zoho CRM, and the clients who can see them in the portal."
        action={<Button icon={UserPlusIcon} onClick={() => openInvite()}>Invite client</Button>}
      />

      <Section className="flex-1 gap-4">
        <SearchField label="Search matters" placeholder="Search by number, name, attorney or client" value={query} onChange={(value) => { setQuery(value); setPage(1) }} />

        <Tabs label="Filter by status" tabs={tabs} value={tab} onChange={(id) => { setTab(id); setPage(1) }} idPrefix="matters" />

        {pageMatters.length > 0 ? (
          <>
            <div aria-hidden="true" className={`hidden border-b border-divider pb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted ${columns}`}>
              <span>Matter</span><span>Clients</span><span>Stage</span><span>Opened</span><span>Status</span><span className="w-[86px]" />
            </div>
            <ul aria-label="Matters" className="-mt-4 flex flex-col divide-y divide-divider">
              {pageMatters.map((matter) => <MatterRow key={matter.id} matter={matter} onInvite={openInvite} />)}
            </ul>
            <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={setPage} itemLabel="matters" />
          </>
        ) : (
          <EmptyState icon={MattersIcon} title="No matters found">
            {query ? 'Try a different number, name or client.' : 'Matters appear here once they sync from Zoho CRM.'}
          </EmptyState>
        )}
      </Section>

      <InviteUserDialog open={inviteOpen} onClose={closeInvite} crmMatterId={inviteCrmMatterId} onInvite={invite} />
    </Page>
  )
}

export default Matters
