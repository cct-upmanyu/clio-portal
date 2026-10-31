import { useState } from 'react'
import { formatSeconds, useCountdown } from './useCountdown'
import { linkClass } from './styles'

// `seconds`: the wait the server gave with the last send. `onResend` returns the next wait (0 after a failure).
function ResendCode({ onResend, seconds, children }) {
  const [left, restart] = useCountdown(seconds)
  const [sending, setSending] = useState(false)

  const handleResend = async () => {
    setSending(true)
    try {
      const wait = await onResend?.()
      restart(typeof wait === 'number' ? wait : 0)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      {sending ? (
        <span>Sending a new code…</span>
      ) : left > 0 ? (
        <span>Didn't get it? Resend in {formatSeconds(left)}</span>
      ) : (
        <button type="button" onClick={handleResend} className={`${linkClass} cursor-pointer`}>
          Resend code
        </button>
      )}
      {children}
    </div>
  )
}

export default ResendCode
