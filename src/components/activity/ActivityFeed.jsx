import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import { TimelineIcon } from '../ui/icons'
import { describeActivity } from '../../utils/activity'
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
          const { icon: Icon, text } = describeActivity(event, { inMatter, viewer })
          const content = (
            <>
              <span aria-hidden="true" className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-subtle text-body">
                <Icon className="size-3.5" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] leading-normal text-ink">{text}</span>
                {event.occurredAt && <time dateTime={event.occurredAt} className="text-xs text-muted">{formatDateTime(event.occurredAt)}</time>}
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
