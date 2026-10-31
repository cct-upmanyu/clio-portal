import { useEffect, useState } from 'react'

// Seconds left until resend is allowed, plus a function to restart the timer (optionally with a new length)
export function useCountdown(seconds) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (left <= 0) return
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])

  return [left, (next = seconds) => setLeft(next)]
}

// Seconds left until an ISO date from the server, ticking every second (null without a deadline)
export function useSecondsUntil(deadline) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!deadline) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return deadline ? Math.max(0, Math.ceil((new Date(deadline) - now) / 1000)) : null
}

// 600 -> "10 minutes", 3600 -> "1 hour" (for timings the server sends)
export const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} ${minutes === 60 ? 'hour' : 'hours'}`
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

export const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
