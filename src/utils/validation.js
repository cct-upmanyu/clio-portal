// Mirrors functions/backend/utils/validation.js: keep the two in sync
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const EMAIL_MAX_LENGTH = 255
export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MAX_LENGTH = 256

// `text` for checklists (Set password), `message` for inline errors
export const PASSWORD_RULES = [
  { text: `${PASSWORD_MIN_LENGTH}+ characters`, message: `at least ${PASSWORD_MIN_LENGTH} characters`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { text: 'One uppercase letter', message: 'one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { text: 'One number', message: 'one number', test: (p) => /\d/.test(p) },
  { text: 'One symbol', message: 'one symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

const joinList = (items) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0]

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Enter your email address'
  if (email.length > EMAIL_MAX_LENGTH) return `Email must be ${EMAIL_MAX_LENGTH} characters or fewer`
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@example.com'
  return ''
}

export function validateLoginPassword(value) {
  if (!value) return 'Enter your password'
  if (value.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  if (value.length > PASSWORD_MAX_LENGTH) return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`
  return ''
}

// For creating a password (register / set password): all PASSWORD_RULES
export function validateNewPassword(value) {
  if (!value) return 'Enter your password'
  if (value.length > PASSWORD_MAX_LENGTH) return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`
  const unmet = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.message)
  if (unmet.length > 0) return `Password needs ${joinList(unmet)}`
  return ''
}

export const isNewPasswordReady = (password, confirm) =>
  PASSWORD_RULES.every((rule) => rule.test(password)) && confirm === password

// Whether leaving a field should show its error. Not while it's still empty (that waits for submit),
// and not when focus moves to a link or button outside the form (the user is leaving the page).
export const shouldValidateOnBlur = (event, value) => {
  if (!value.trim()) return false
  const next = event.relatedTarget
  return !next || Boolean(event.currentTarget.form?.contains(next))
}
