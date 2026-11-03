import { Link } from 'react-router-dom'

// Accent per tile: the bar along the top and the icon chip
const TONES = {
  brand: { bar: 'bg-brand', chip: 'bg-brand-soft text-brand' },
  violet: { bar: 'bg-violet-500', chip: 'bg-violet-50 text-violet-600' },
  amber: { bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-600' },
  sky: { bar: 'bg-sky-500', chip: 'bg-sky-50 text-sky-600' },
  emerald: { bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-600' },
  rose: { bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-600' },
}

// One headline number on the admin dashboard, linking to the list behind it.
// `alert`: the detail line needs attention (e.g. overdue tasks); 'danger' or 'warning'.
function StatTile({ label, value, detail, to, icon: Icon, tone = 'brand', alert, loading = false }) {
  const { bar, chip } = TONES[tone] ?? TONES.brand
  const detailTone = alert === 'danger' ? 'font-medium text-danger' : alert === 'warning' ? 'font-medium text-warning' : 'text-muted group-hover:text-body'
  return (
    <Link
      to={to}
      className="group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-line bg-white p-4 pt-5 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_10px_28px_rgba(10,31,61,0.10)] max-sm:p-3 max-sm:pt-4"
    >
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${bar}`} />
      <span className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium leading-tight text-muted">{label}</span>
        {Icon && (
          <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${chip} max-sm:size-8`}>
            <Icon className="size-[18px]" />
          </span>
        )}
      </span>
      <span className="text-[30px] font-bold leading-none tracking-[-0.02em] text-ink max-sm:text-2xl">
        {loading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-subtle align-middle" /> : value}
      </span>
      {detail && <span className={`text-[13px] leading-snug ${detailTone} max-sm:text-xs`}>{detail}</span>}
    </Link>
  )
}

export default StatTile
