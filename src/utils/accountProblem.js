const TITLES = {
  ACCOUNT_DISABLED: 'Your access has been disabled',
  ACCOUNT_NOT_ACTIVATED: 'Accept your invitation first',
}

// Shown on the login page after a session ends because the account was disabled
export const DISABLED_SIGN_OUT = {
  title: TITLES.ACCOUNT_DISABLED,
  message: "Your access to the Client Portal has been disabled. Please contact your attorney's office for help.",
}

// { title, message } when the error says the account can't sign in (disabled, invitation not accepted), else null
export const accountProblem = (err) => {
  const title = TITLES[err?.data?.code]
  return title ? { title, message: err.data.message } : null
}
