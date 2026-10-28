import Section from '../ui/Section'
import Avatar from '../ui/Avatar'
import { MailIcon, PhoneIcon } from '../ui/icons'
import { firm } from '../../data/sampleData'

const contactLink = 'inline-flex items-center gap-2 font-medium text-brand hover:text-brand-dark'

function LegalTeamCard() {
  return (
    <Section aria-labelledby="team-title" className="gap-4">
      <h2 id="team-title" className="text-base font-semibold">Your legal team</h2>

      <div className="flex items-center gap-3">
        <Avatar name={firm.attorney.name} size="md" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{firm.attorney.name}</span>
          <span className="text-[13px] text-muted">{firm.attorney.role}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-divider pt-4 text-sm leading-normal">
        <span className="font-semibold">{firm.name}</span>
        <address className="not-italic text-muted">
          {firm.addressLines.map((line) => <span key={line} className="block">{line}</span>)}
        </address>
        <a href={firm.phoneHref} className={contactLink}>
          <PhoneIcon className="size-4" />
          {firm.phone}
        </a>
        <a href={`mailto:${firm.email}`} className={contactLink}>
          <MailIcon className="size-4" />
          {firm.email}
        </a>
      </div>
    </Section>
  )
}

export default LegalTeamCard
