import RowsSkeleton from '../ui/RowsSkeleton'
import { SkeletonMessages } from '../messages/MessageThread'

const bar = 'animate-pulse rounded-full bg-line'

// The matter page while the matter loads: the same header, tabs and (for the open tab) body as the real
// page, so nothing moves when it arrives. `tabs`: [{ id, label }]; `tab`: the open one.
function MatterDetailSkeleton({ tabs, tab }) {
  return (
    <div role="status" aria-busy="true" className="flex min-h-0 flex-1 flex-col">
      <span className="sr-only">Loading matter…</span>
      <div aria-hidden="true" className="flex flex-col gap-3 border-b border-line bg-white px-6 pb-0 pt-4 max-sm:gap-2 max-sm:px-3 max-sm:pt-2.5">
        <span className={`h-3 w-20 max-sm:hidden ${bar} bg-subtle`} />
        <div className="flex items-start justify-between gap-4 max-sm:items-center max-sm:gap-2">
          <span className="size-8 shrink-0 sm:hidden" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 max-sm:gap-1.5">
            <div className="flex items-center gap-3 max-sm:gap-2">
              <span className={`h-5 w-[min(420px,60%)] max-sm:h-4 ${bar}`} />
              <span className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-subtle" />
            </div>
            <span className={`h-3 w-[min(320px,50%)] ${bar} bg-subtle`} />
          </div>
          <div className="flex shrink-0 gap-2 max-sm:gap-1">
            <span className="h-10 w-28 animate-pulse rounded-lg border border-line bg-white max-sm:size-9" />
            <span className="size-10 animate-pulse rounded-full bg-brand/20 max-sm:size-9" />
          </div>
        </div>
        <div className="flex gap-1 overflow-hidden border-b border-transparent">
          {tabs.map(({ id, label }) => (
            <span
              key={id}
              className={`flex h-10 shrink-0 items-center px-3 text-sm max-sm:h-9 max-sm:px-2.5 max-sm:text-[13px] ${
                id === tab ? 'font-semibold text-brand shadow-[inset_0_-2px_0_var(--color-brand)]' : 'font-medium text-muted/70'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white px-6 max-sm:px-3">
        {tab === 'messages' ? (
          <div className="flex min-h-0 flex-1 flex-col pb-4">
            <SkeletonMessages />
          </div>
        ) : (
          <div className="pt-2">
            <RowsSkeleton
              rows={5}
              lead={tab === 'events' ? 'date' : 'icon'}
              pills={tab === 'tasks' ? 2 : tab === 'users' || tab === 'documents' ? 1 : 0}
              label=""
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MatterDetailSkeleton
