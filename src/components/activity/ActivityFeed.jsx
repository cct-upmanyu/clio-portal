import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { TimelineIcon } from '../ui/icons'
import { ACTIVITY_MODULES, describeActivity } from '../../utils/activity'
import { formatDateTime } from '../../utils/dates'

// A timeline from one of the activityApi infinite queries. `inMatter` / `viewer`: see describeActivity.
// `loadMore`: offer the next page when there is one (the dashboard shows only the latest page).
// `linkToMatter` (Admin Console): an event on a matter opens that matter's Activity tab.
function ActivityFeed({ result, inMatter = false, viewer = 'firm', loadMore = true, linkToMatter = false, emptyText }) {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } = result
  const events = data?.pages.flatMap((page) => page.events) ?? []

  if (isLoading) return <p className="py-6 text-center text-sm text-muted">Loading activity…</p>
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted">
        Couldn&apos;t load the activity.
        <Button variant="secondary" size="sm" onClick={refetch}>Try again</Button>
      </div>
    )
  }
  if (events.length === 0) {
    return <EmptyState icon={TimelineIcon} title="Nothing yet">{emptyText || 'Invitations, sign-in changes and other updates will show here.'}</EmptyState>
  }

  return (
    <div className="flex flex-col gap-4">
      <ol className={`flex flex-col pt-1 ${linkToMatter ? 'gap-2' : 'gap-4'}`}>
        {events.map((event) => {
          const { icon: Icon, module, text } = describeActivity(event, { inMatter, viewer })
          const { label, badge } = ACTIVITY_MODULES[module] ?? ACTIVITY_MODULES.other
          const content = (
            <>
              <span aria-hidden="true" className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ${badge}`}>
                <Icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] leading-normal text-body">
                  {text.map((part, i) => (typeof part === 'string'
                    ? <span key={i}>{part}</span>
                    : <span key={i} className="font-semibold text-ink">{part.strong}</span>))}
                </span>
                <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                  <span className="font-medium">{label}</span>
                  {event.occurredAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <time dateTime={event.occurredAt}>{formatDateTime(event.occurredAt)}</time>
                    </>
                  )}
                </span>
              </span>
            </>
          )
          return (
            <li key={event.id}>
              {linkToMatter && event.matter?.id ? (
                <Link to={`/matters/${event.matter.id}?tab=activity`} className="-mx-2 flex gap-3 rounded-lg px-2 py-1 hover:bg-subtle">
                  {content}
                </Link>
              ) : (
                <div className="flex gap-3">{content}</div>
              )}
            </li>
          )
        })}
      </ol>
      {loadMore && hasNextPage && (
        <Button variant="secondary" size="sm" className="self-center" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Loading…' : 'Show older activity'}
        </Button>
      )}
    </div>
  )
}

export default ActivityFeed
