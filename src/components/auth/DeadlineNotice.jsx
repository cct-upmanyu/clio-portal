import { ClockIcon } from '../ui/icons'
import { formatSeconds } from './useCountdown'

const URGENT_SECONDS = 60

// "Time left to finish: 9:42", turning amber in the last minute
function DeadlineNotice({ secondsLeft, label = 'Time left to finish' }) {
  if (secondsLeft === null) return null
  const urgent = secondsLeft <= URGENT_SECONDS

  return (
    <div
      role="timer"
      aria-live={urgent ? 'polite' : 'off'}
      className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
        urgent ? 'border-warning/30 bg-warning-soft text-warning' : 'border-line bg-canvas text-ink'
      }`}
    >
      <ClockIcon className="size-[18px] shrink-0" />
      <span>
        {label}: <strong className="font-semibold tabular-nums">{formatSeconds(secondsLeft)}</strong>
      </span>
    </div>
  )
}

export default DeadlineNotice
