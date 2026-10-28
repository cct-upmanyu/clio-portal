import { useEffect, useState } from 'react'

// Seconds left until resend is allowed, plus a function to restart the timer
export function useCountdown(seconds) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    if (left <= 0) return
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])

  return [left, () => setLeft(seconds)]
}

export const formatSeconds = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
