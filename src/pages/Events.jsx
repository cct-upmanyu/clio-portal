import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import EventItem from '../components/ui/EventItem'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import { CalendarIcon } from '../components/ui/icons'
import { useMatters } from '../hooks/useMatters'
import { useGetMyEventsQuery } from '../redux/api/eventApi'
import { splitEvents, toEventItem } from '../utils/events'

// One meeting: the date badge, title, time and place, then how to join an online one
function EventEntry({ event }) {
  return (
    <div className="flex flex-col">
      <EventItem {...toEventItem(event)} />
      {(event.meetingLink || event.description) && (
        <div className="-mt-1 flex flex-col gap-1 pb-3 pl-[60px] text-[13px]">
          {event.meetingLink && (
            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="w-fit font-medium text-brand hover:text-brand-dark">
              Join the meeting
            </a>
          )}
          {event.description && <p className="whitespace-pre-wrap text-muted">{event.description}</p>}
        </div>
      )}
    </div>
  )
}

function Events() {
  const { selectedMatter: matter } = useMatters()
  const { data = [], isLoading } = useGetMyEventsQuery(matter.crmMatterId, { refetchOnFocus: true })
  const { upcoming, past } = splitEvents(data)

  return (
    <Page>
      <PageHeader title="Events" description="Meetings, hearings and deadlines for this matter." />
      <Section>
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted">Loading events…</p>
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col divide-y divide-divider">
            {upcoming.map((event) => <EventEntry key={event.id} event={event} />)}
          </div>
        ) : (
          <EmptyState icon={CalendarIcon} title="No upcoming events">
            We'll let you know when a new event is scheduled.
          </EmptyState>
        )}
      </Section>
      {past.length > 0 && (
        <Section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Past</h2>
          <div className="flex flex-col divide-y divide-divider opacity-75">
            {past.map((event) => <EventEntry key={event.id} event={event} />)}
          </div>
        </Section>
      )}
    </Page>
  )
}

export default Events
