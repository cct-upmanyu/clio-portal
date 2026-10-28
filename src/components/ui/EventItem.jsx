import { Link } from 'react-router-dom'
import { MapPinIcon } from './icons'

function EventItem({ to, month, day, title, time, place }) {
  return (
    <Link to={to} className="group flex min-h-[76px] items-center gap-3 py-3">
      <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-[10px] border border-line bg-white">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">{month}</span>
        <span className="text-lg font-bold leading-tight">{day}</span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-sm font-semibold group-hover:text-brand">{title}</span>
        <span className="text-[13px] text-muted">{time}</span>
        {place && (
          <span className="flex min-w-0 items-center gap-1 text-[13px] text-muted">
            <MapPinIcon className="size-3.5 shrink-0" />
            <span className="truncate">{place}</span>
          </span>
        )}
      </span>
    </Link>
  )
}

export default EventItem
