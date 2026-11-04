import RowsSkeleton from '../components/ui/RowsSkeleton'
import { useState } from 'react'
import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import EventItem from '../components/ui/EventItem'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import { CalendarIcon } from '../components/ui/icons'
import EventFilter, { EVENT_FILTERS } from '../components/events/EventFilter'
import { useMatters } from '../hooks/useMatters'
import { useGetMyEventsQuery } from '../redux/api/eventApi'
import { splitEvents, toEventItem } from '../utils/events'

// One meeting: the date badge, title, time and place, then how to join an online one.
// A cancelled one is marked as such (and has no join link).
function EventEntry({ event }) {
  const cancelled = event.status === 'cancelled'
  const held = event.status === 'completed'
  return (
    <div className={`flex flex-col ${cancelled || held ? 'opacity-75' : ''}`}>
      <EventItem {...toEventItem(event)} />
      {(cancelled || held || event.meetingLink || event.description) && (
        <div className="-mt-1 flex flex-col gap-1 pb-3 pl-[60px] text-[13px]">
          {cancelled && <span className="w-fit rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">Cancelled</span>}
          {held && <span className="w-fit rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">Held</span>}
          {!cancelled && !held && event.meetingLink && (
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
  const [filter, setFilter] = useState('upcoming')
  const groups = splitEvents(data)
  const shown = groups[filter]

  return (
    <Page>
      <PageHeader title="Events" description="Meetings, hearings and deadlines for this matter." />
      <Section>
        {isLoading ? (
          <RowsSkeleton lead="date" label="Loading meetings…" />
        ) : data.length === 0 ? (
          <EmptyState icon={CalendarIcon} title="No events yet">
            We'll let you know when a new event is scheduled.
          </EmptyState>
        ) : (
          <div className="flex flex-col">
            <EventFilter value={filter} onChange={setFilter} groups={groups} />
            {shown.length > 0 ? (
              <div className="flex flex-col divide-y divide-divider">
                {shown.map((event) => <EventEntry key={event.id} event={event} />)}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted">{EVENT_FILTERS.find((f) => f.id === filter).empty}</p>
            )}
          </div>
        )}
      </Section>
    </Page>
  )
}

export default Events
