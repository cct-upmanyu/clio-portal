import { Link } from 'react-router-dom'

// One headline number on the admin dashboard, linking to the list behind it
function StatTile({ label, value, detail, to, icon: Icon }) {
  return (
    <Link to={to} className="group flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-white p-4 hover:border-brand/40 hover:shadow-[0_4px_16px_rgba(10,31,61,0.08)]">
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {Icon && (
          <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Icon className="size-4" />
          </span>
        )}
      </span>
      <span className="text-[28px] font-bold leading-none tracking-[-0.02em] text-ink">{value}</span>
      {detail && <span className="text-[13px] text-muted group-hover:text-body">{detail}</span>}
    </Link>
  )
}

export default StatTile
