const DAY_MS = 24 * 60 * 60 * 1000

// Times are shown in the signed-in user's time zone (users.timezone); undefined = the browser's own.
// Set from the store whenever the user changes (see store.js).
let displayTimeZone

export function setDisplayTimeZone(timeZone) {
  try {
    if (timeZone) new Intl.DateTimeFormat('en-US', { timeZone })
    displayTimeZone = timeZone || undefined
  } catch {
    displayTimeZone = undefined
  }
}

export const getDisplayTimeZone = () => displayTimeZone

const format = (value, options) => new Date(value).toLocaleString('en-US', { timeZone: displayTimeZone, ...options })

// The calendar day of `value` in the display time zone, as a UTC midnight (so days subtract cleanly)
const dayNumber = (value) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', { timeZone: displayTimeZone, year: 'numeric', month: 'numeric', day: 'numeric' })
      .formatToParts(new Date(value))
      .map((p) => [p.type, Number(p.value)]),
  )
  return Date.UTC(parts.year, parts.month - 1, parts.day)
}

// Whole days from `value` to `now`: 0 = today, 1 = yesterday, -1 = tomorrow
export const daysAgo = (value, now = new Date()) =>
  Math.round((dayNumber(now) - dayNumber(value)) / DAY_MS)

const sameYear = (value, now = new Date()) => format(value, { year: 'numeric' }) === format(now, { year: 'numeric' })

// The hour (0-23) it is at `value` in the display time zone
export const hourOf = (value = new Date()) => Number(format(value, { hour: 'numeric', hourCycle: 'h23' }))

// "6:39 PM"
export const formatTime = (value) => format(value, { hour: 'numeric', minute: '2-digit' })

// "Nov 1, 2026, 4:02 PM": the full date and time, for records like a last sign-in
export const formatDateTime = (value) =>
  format(value, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

// "Oct 22" this year, "Oct 22, 2025" otherwise
export const formatDate = (value, now = new Date()) =>
  format(value, { month: 'short', day: 'numeric', ...(sameYear(value, now) ? {} : { year: 'numeric' }) })

// Chat day separators, WhatsApp style: Today, Yesterday, weekday this week, then the date
export function dayLabel(value, now = new Date()) {
  const diff = daysAgo(value, now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return format(value, { weekday: 'long' })
  return format(value, {
    weekday: 'short', month: 'long', day: 'numeric', ...(sameYear(value, now) ? {} : { year: 'numeric' }),
  })
}

// Compact list timestamp: time today, "Yesterday", then the date
export function formatShort(value, now = new Date()) {
  const diff = daysAgo(value, now)
  if (diff === 0) return formatTime(value)
  if (diff === 1) return 'Yesterday'
  return formatDate(value, now)
}

// Consecutive items that fall on the same calendar day
export function groupByDay(items, getDate) {
  const groups = []
  for (const item of items) {
    const key = dayNumber(getDate(item))
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, label: dayLabel(getDate(item)), items: [item] })
  }
  return groups
}

// A date-only value ("2026-10-20") as "Oct 20, 2026", without a time-zone shift
export const formatDay = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)
  const date = year && month && day ? new Date(year, month - 1, day) : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Today as "Wednesday, November 4", in the display time zone
export const formatToday = () => format(Date.now(), { weekday: 'long', month: 'long', day: 'numeric' })

// A message's time as "Wed, May 01, 2026 at 3:44 PM"
export const formatMessageTime = (value) =>
  `${format(value, { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })} at ${formatTime(value)}`
