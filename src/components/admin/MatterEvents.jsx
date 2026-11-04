import RowsSkeleton from '../ui/RowsSkeleton'
import { useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import { CalendarIcon, CheckCircleIcon, EditIcon, MapPinIcon, ResendIcon, UserXIcon } from '../ui/icons'
import EventFilter, { EVENT_FILTERS } from '../events/EventFilter'
import EventDialog from './EventDialog'
import RowMenu from './RowMenu'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { useCreateEventMutation, useGetMatterEventsQuery, useSetEventStatusMutation, useUpdateEventMutation } from '../../redux/api/eventApi'
import { formatDay } from '../../utils/dates'
import { eventPlace, eventWhen, splitEvents, toEventItem } from '../../utils/events'
import { toast } from '../../utils/toast'

function DateBadge({ event }) {
  const { month, day } = toEventItem(event)
  return (
    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-[10px] border border-line bg-white">
      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand">{month}</span>
      <span className="text-lg font-bold leading-tight">{day}</span>
    </span>
  )
}

function EventRow({ event, onEdit, onStatus, onCancel }) {
  const held = event.status === 'completed'
  const cancelled = event.status === 'cancelled'
  const place = eventPlace(event)
  // A cancelled meeting is kept for the record only
  const items = cancelled ? [] : [
    ...(!held ? [{ label: 'Edit', icon: EditIcon, onSelect: () => onEdit(event) }] : []),
    held
      ? { label: 'Schedule again', icon: ResendIcon, onSelect: () => onStatus(event, 'reopen') }
      : { label: 'Mark as held', icon: CheckCircleIcon, onSelect: () => onStatus(event, 'complete') },
    { label: 'Cancel meeting', icon: UserXIcon, tone: 'danger', onSelect: () => onCancel(event) },
  ]
  const history = [
    event.createdBy && `Created by ${event.createdBy}`,
    event.updatedBy && `Updated by ${event.updatedBy}`,
    held && event.completedAt && `Held · marked ${formatDay(event.completedAt)}`,
    event.source === 'crm' && 'From Zoho CRM',
  ].filter(Boolean).join(' · ')

  return (
    <li className={`flex items-start gap-3 py-3.5 max-sm:gap-2.5 ${held || cancelled ? 'opacity-75' : ''}`}>
      <DateBadge event={event} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`text-sm font-semibold ${cancelled ? 'text-muted line-through decoration-1' : held ? 'text-muted' : 'text-ink'}`}>{event.title}</span>
          {held && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">Held</span>}
          {cancelled && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">Cancelled</span>}
        </div>
        <span className="text-[13px] text-body">{eventWhen(event)}</span>
        {place && (
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 text-[13px] text-muted">
            <span className="flex min-w-0 items-center gap-1">
              <MapPinIcon className="size-3.5 shrink-0" />
              <span className="truncate">{event.locationType === 'online' ? `${place} (online)` : place}</span>
            </span>
            {event.meetingLink && (
              <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:text-brand-dark">Join link</a>
            )}
          </span>
        )}
        <span className="text-xs text-muted">
          {event.host ? `Host: ${event.host}` : 'No host set'}
          {' · '}
          {event.participants.length > 0 ? event.participants.map((p) => p.name).join(', ') : 'No clients invited'}
        </span>
        {event.description && <p className="whitespace-pre-wrap text-[13px] leading-normal text-body">{event.description}</p>}
        {history && <span className="text-xs text-muted">{history}</span>}
      </div>
      <RowMenu label={`Actions for ${event.title}`} items={items} />
    </li>
  )
}

// A matter's meetings for the firm. `creating` / `onCreatingChange`: the new-meeting dialog, opened by
// the page header's + button.
function MatterEvents({ matter, creating, onCreatingChange }) {
  const { data: events = [], isLoading, isError, refetch } = useGetMatterEventsQuery(matter.crmMatterId, { refetchOnFocus: true })
  const [createEvent] = useCreateEventMutation()
  const [updateEvent] = useUpdateEventMutation()
  const [setEventStatus, { isLoading: changing }] = useSetEventStatusMutation()
  const [editing, setEditing] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)

  const clients = matter.contacts.filter((c) => c.invitation === 'accepted')
  const groups = splitEvents(events)
  const [filter, setFilter] = useState('upcoming')
  const shown = groups[filter]

  const failed = (title) => (err) => {
    if (!isHandledGlobally(err)) toast.error(title, { description: err?.data?.message || 'Please try again.' })
  }

  const save = async (body) => {
    try {
      if (editing) await updateEvent({ eventId: editing.id, ...body }).unwrap()
      else await createEvent({ crmMatterId: matter.crmMatterId, ...body }).unwrap()
      toast.success(editing ? 'Meeting updated' : 'Meeting created', { description: body.title })
      return { saved: true }
    } catch (err) {
      const details = err?.data?.details
      if (details && typeof details === 'object' && Object.keys(details).length > 0) return { saved: false, fieldErrors: details }
      failed(editing ? "Couldn't update the meeting" : "Couldn't create the meeting")(err)
      return { saved: false }
    }
  }

  const changeStatus = (event, action) => setEventStatus({ eventId: event.id, action }).unwrap()
    .then(() => toast.success(action === 'complete' ? 'Marked as held' : 'Scheduled again', { description: event.title }))
    .catch(failed("Couldn't update the meeting"))
  const cancel = () => setEventStatus({ eventId: cancelTarget.id, action: 'cancel' }).unwrap()
    .then(() => {
      toast.success('Meeting cancelled', { description: cancelTarget.title })
      setCancelTarget(null)
    })
    .catch(failed("Couldn't cancel the meeting"))

  const list = (items) => (
    <ul className="flex flex-col divide-y divide-divider">
      {items.map((event) => (
        <EventRow key={event.id} event={event} onEdit={setEditing} onStatus={changeStatus} onCancel={setCancelTarget} />
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-4 py-2">
      {isLoading ? (
        <RowsSkeleton lead="date" label="Loading meetings…" />
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted">
          Couldn&apos;t load the meetings.
          <Button variant="secondary" size="sm" onClick={refetch}>Try again</Button>
        </div>
      ) : events.length === 0 ? (
        <EmptyState icon={CalendarIcon} title="No meetings">Use the + button above to schedule a meeting, hearing or call.</EmptyState>
      ) : (
        <div className="flex flex-col">
          <EventFilter value={filter} onChange={setFilter} groups={groups} />
          {shown.length > 0 ? list(shown) : (
            <p className="py-6 text-center text-sm text-muted">{EVENT_FILTERS.find((f) => f.id === filter).empty}</p>
          )}
        </div>
      )}

      <EventDialog
        open={creating || Boolean(editing)}
        event={creating ? null : editing}
        clients={clients}
        onSave={save}
        onClose={() => {
          setEditing(null)
          onCreatingChange(false)
        }}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        icon={UserXIcon}
        tone="danger"
        title={cancelTarget ? `Cancel "${cancelTarget.title}"?` : ''}
        confirmLabel="Cancel meeting"
        cancelLabel="Keep it"
        loading={changing}
        loadingLabel="Cancelling…"
        onConfirm={cancel}
        onCancel={() => setCancelTarget(null)}
      >
        It disappears from the clients&apos; portal. It stays in this matter&apos;s activity.
      </ConfirmDialog>
    </div>
  )
}

export default MatterEvents
