import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import EventItem from '../components/ui/EventItem'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import { CalendarIcon } from '../components/ui/icons'
import { useMatters } from '../hooks/useMatters'

function Events() {
  const { selectedMatter: matter } = useMatters()

  return (
    <Page>
      <PageHeader title="Events" description="Meetings, hearings and deadlines for this matter." />
      <Section>
        {matter.events.length > 0 ? (
          <div className="flex flex-col divide-y divide-divider">
            {matter.events.map((event) => (
              <EventItem key={event.id} to="/events" {...event} />
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarIcon} title="No upcoming events">
            We'll let you know when a new event is scheduled.
          </EmptyState>
        )}
      </Section>
    </Page>
  )
}

export default Events
