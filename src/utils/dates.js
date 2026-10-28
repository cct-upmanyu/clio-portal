const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (value) => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

// Whole days from `value` to `now`: 0 = today, 1 = yesterday, -1 = tomorrow
export const daysAgo = (value, now = new Date()) =>
  Math.round((startOfDay(now) - startOfDay(value)) / DAY_MS)

const sameYear = (value, now = new Date()) => new Date(value).getFullYear() === now.getFullYear()

// "6:39 PM"
export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// "Oct 22" this year, "Oct 22, 2025" otherwise
export const formatDate = (value, now = new Date()) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(sameYear(value, now) ? {} : { year: 'numeric' }) })

// Chat day separators, WhatsApp style: Today, Yesterday, weekday this week, then the date
export function dayLabel(value, now = new Date()) {
  const diff = daysAgo(value, now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return new Date(value).toLocaleDateString('en-US', { weekday: 'long' })
  return new Date(value).toLocaleDateString('en-US', {
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
    const key = startOfDay(getDate(item)).toISOString()
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, label: dayLabel(getDate(item)), items: [item] })
  }
  return groups
}
