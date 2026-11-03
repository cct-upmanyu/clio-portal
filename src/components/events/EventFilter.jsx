import { useId } from 'react'

export const EVENT_FILTERS = [
  { id: 'upcoming', label: 'Upcoming', empty: 'Nothing scheduled.' },
  { id: 'past', label: 'Past', empty: 'No past meetings yet.' },
  { id: 'cancelled', label: 'Cancelled', empty: 'No cancelled meetings.' },
  { id: 'all', label: 'All', empty: 'No meetings yet.' },
]

// Upcoming / Past / Cancelled / All, each with its count. groups: the result of splitEvents.
function EventFilter({ value, onChange, groups }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3 border-b border-divider pb-2">
      <label htmlFor={id} className="sr-only">Show</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer rounded-lg border border-field bg-white pl-3 pr-8 text-sm font-medium text-ink focus:border-brand focus:outline-none max-sm:w-full"
      >
        {EVENT_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label} ({groups[f.id].length})</option>)}
      </select>
    </div>
  )
}

export default EventFilter
