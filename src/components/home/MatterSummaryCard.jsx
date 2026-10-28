import Section from '../ui/Section'
import StatusPill from '../ui/StatusPill'
import { firm } from '../../data/sampleData'

function MatterSummaryCard({ matter }) {
  const facts = [
    { label: 'Current stage', value: matter.stage },
    { label: 'Responsible attorney', value: firm.attorney.name },
    { label: 'Opened', value: matter.opened },
    { label: 'Next event', value: matter.nextEvent },
  ]

  return (
    <Section aria-labelledby="matter-title" className="gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Your matter</span>
          <h2 id="matter-title" className="text-base font-semibold">{matter.number} · {matter.title}</h2>
        </div>
        <StatusPill status={matter.status} size="md" dot />
      </div>

      <dl className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 border-t border-divider pt-4">
        {facts.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <dt className="text-[13px] text-muted">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export default MatterSummaryCard
