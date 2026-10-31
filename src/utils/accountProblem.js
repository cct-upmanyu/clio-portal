import { toast } from './toast'

const TITLES = {
  ACCOUNT_DISABLED: 'Your access has been disabled',
  ACCOUNT_NOT_ACTIVATED: 'Accept your invitation first',
}

const DISABLED_MESSAGE = "Your access to the Client Portal has been disabled. Please contact your attorney's office for help."
// Long enough to read the whole explanation
const DURATION = 7000

// When the error says the account can't sign in (disabled, invitation not accepted): shows it as a
// toast and returns true. Otherwise returns false and shows nothing.
export const toastAccountProblem = (err) => {
  const title = TITLES[err?.data?.code]
  if (!title) return false
  toast.error(title, { description: err.data.message, duration: DURATION })
  return true
}

// For a session that ended because the account was disabled (no server message at hand)
export const toastAccountDisabled = () =>
  toast.error(TITLES.ACCOUNT_DISABLED, { description: DISABLED_MESSAGE, duration: DURATION })
