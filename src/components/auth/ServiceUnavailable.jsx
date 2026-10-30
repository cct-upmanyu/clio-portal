import AuthLayout, { AuthHeading } from './AuthLayout'
import Spinner from '../ui/Spinner'
import { AlertIcon, RefreshIcon } from '../ui/icons'
import { primaryButtonClass } from './styles'

// Shown when the session check can't reach the server. The user isn't signed out, just waiting.
function ServiceUnavailable({ onRetry, retrying }) {
  return (
    <AuthLayout footer="Your session is still active. You won't need to sign in again.">
      <div className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
        <AlertIcon className="size-6" />
      </div>
      <AuthHeading title="We can't reach the Client Portal">
        This is usually temporary. Check your internet connection, then try again.
      </AuthHeading>
      <button type="button" onClick={onRetry} disabled={retrying} className={primaryButtonClass}>
        {retrying ? <Spinner /> : <RefreshIcon className="size-[18px]" />}
        {retrying ? 'Trying again…' : 'Try again'}
      </button>
    </AuthLayout>
  )
}

export default ServiceUnavailable
