import { formatTime, getDisplayTimeZone } from './dates'

const part = (value, options) => new Date(value).toLocaleString('en-US', { timeZone: getDisplayTimeZone(), ...options })

// "Zoom", "Microsoft Teams" or "Online" for an online event; the venue for one in person
export const eventPlace = (event) => (event.locationType === 'online' ? event.provider || 'Online' : event.venue || null)

// "Tue, Nov 12 · 10:00 AM – 11:00 AM" in the user's time zone
export function eventWhen(event) {
  if (!event.startAt) return ''
  const day = part(event.startAt, { weekday: 'short', month: 'short', day: 'numeric' })
  const end = event.endAt ? ` – ${formatTime(event.endAt)}` : ''
  return `${day} · ${formatTime(event.startAt)}${end}`
}

// What <EventItem> shows: the date badge, the time and the place
export const toEventItem = (event) => ({
  id: event.id,
  month: event.startAt ? part(event.startAt, { month: 'short' }) : '',
  day: event.startAt ? part(event.startAt, { day: 'numeric' }) : '',
  title: event.title,
  time: eventWhen(event).split(' · ')[1] || '',
  place: eventPlace(event),
})

// Upcoming (scheduled, not ended) soonest first; past (held or ended) and cancelled most recent first.
// all: upcoming, then past, then cancelled.
export function splitEvents(events, now = new Date()) {
  const cancelled = events.filter((e) => e.status === 'cancelled')
  const live = events.filter((e) => e.status !== 'cancelled')
  const ended = (e) => e.status === 'completed' || new Date(e.endAt || e.startAt) < now
  const newestFirst = (a, b) => new Date(b.startAt) - new Date(a.startAt)
  const groups = {
    upcoming: live.filter((e) => !ended(e)).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)),
    past: live.filter(ended).sort(newestFirst),
    cancelled: cancelled.sort(newestFirst),
  }
  return { ...groups, all: [...groups.upcoming, ...groups.past, ...groups.cancelled] }
}
