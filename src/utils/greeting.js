import { hourOf } from './dates'

// In the user's time zone, like every other time in the portal
export function greeting(date = new Date()) {
  const hour = hourOf(date)
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
