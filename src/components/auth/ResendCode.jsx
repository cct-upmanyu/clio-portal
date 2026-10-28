import { formatSeconds, useCountdown } from './useCountdown'
import { linkClass } from './styles'

const RESEND_AFTER_SECONDS = 60

function ResendCode({ onResend, children }) {
  const [left, restart] = useCountdown(RESEND_AFTER_SECONDS)

  const handleResend = () => {
    onResend?.()
    restart()
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      {left > 0 ? (
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
