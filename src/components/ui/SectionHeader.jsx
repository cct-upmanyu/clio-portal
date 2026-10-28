import { Link } from 'react-router-dom'
import { ChevronRightIcon } from './icons'

function SectionHeader({ title, linkLabel, to, id }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4">
      <h2 id={id} className="text-base font-semibold">{title}</h2>
      {linkLabel && to && (
        <Link to={to} className="inline-flex min-h-9 items-center gap-1 whitespace-nowrap text-sm font-medium text-brand hover:text-brand-dark">
          {linkLabel}
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  )
}

export default SectionHeader
