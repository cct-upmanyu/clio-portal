// The time zones a user can be given: every US zone, then the countries the firm's clients are most
// often in. Labels carry today's UTC offset, e.g. "Central Time · Chicago (UTC−06:00)".

const GROUPS = [
  {
    label: 'United States',
    zones: [
      ['America/New_York', 'Eastern Time · New York'],
      ['America/Chicago', 'Central Time · Chicago'],
      ['America/Denver', 'Mountain Time · Denver'],
      ['America/Phoenix', 'Mountain Time · Arizona (no DST)'],
      ['America/Los_Angeles', 'Pacific Time · Los Angeles'],
      ['America/Anchorage', 'Alaska Time · Anchorage'],
      ['Pacific/Honolulu', 'Hawaii Time · Honolulu'],
      ['America/Puerto_Rico', 'Atlantic Time · Puerto Rico'],
    ],
  },
  {
    label: 'Other countries',
    zones: [
      ['America/Toronto', 'Canada · Toronto'],
      ['America/Vancouver', 'Canada · Vancouver'],
      ['America/Mexico_City', 'Mexico · Mexico City'],
      ['America/Sao_Paulo', 'Brazil · São Paulo'],
      ['Europe/London', 'United Kingdom · London'],
      ['Europe/Paris', 'France · Paris'],
      ['Europe/Berlin', 'Germany · Berlin'],
      ['Africa/Johannesburg', 'South Africa · Johannesburg'],
      ['Asia/Dubai', 'United Arab Emirates · Dubai'],
      ['Asia/Kolkata', 'India · Kolkata'],
      ['Asia/Singapore', 'Singapore'],
      ['Asia/Manila', 'Philippines · Manila'],
      ['Asia/Shanghai', 'China · Shanghai'],
      ['Asia/Tokyo', 'Japan · Tokyo'],
      ['Australia/Sydney', 'Australia · Sydney'],
      ['UTC', 'Coordinated Universal Time (UTC)'],
    ],
  },
]

const utcOffset = (timeZone) => {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value
    return part === 'GMT' ? 'UTC+00:00' : (part || '').replace('GMT', 'UTC').replace('-', '−')
  } catch {
    return ''
  }
}

const withOffset = (label, zone) => {
  const offset = utcOffset(zone)
  return offset && zone !== 'UTC' ? `${label} (${offset})` : label
}

let cached
// `current`: a user's existing zone that isn't in the list is kept as its own option, so editing
// them doesn't quietly change it
export function timezoneGroups(current) {
  cached ??= GROUPS.map((group) => ({ label: group.label, options: group.zones.map(([value, label]) => ({ value, label: withOffset(label, value) })) }))
  const known = cached.some((group) => group.options.some((option) => option.value === current))
  if (!current || known) return cached
  return [...cached, { label: 'Current', options: [{ value: current, label: withOffset(current.replace(/_/g, ' '), current) }] }]
}
