import { forwardRef } from 'react'
import PasswordInput from './PasswordInput'
import { CheckIcon, CircleIcon } from '../ui/icons'
import { PASSWORD_RULES } from '../../utils/validation'

// New password + live checklist + confirmation. `error` is a server message for the password field.
const NewPasswordFields = forwardRef(function NewPasswordFields({ password, onPasswordChange, confirm, onConfirmChange, error }, ref) {
  const rules = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  const mismatch = confirm.length > 0 && confirm !== password

  return (
    <>
      <PasswordInput
        ref={ref}
        id="new-password"
        label="New password"
        value={password}
        onChange={onPasswordChange}
        autoComplete="new-password"
        placeholder="Create a password"
        error={error}
      />

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5" aria-label="Password requirements">
        {rules.map((rule) => (
          <li key={rule.text} className={`flex items-center gap-1.5 text-[13px] max-sm:text-xs ${rule.met ? 'text-success' : 'text-muted'}`}>
            {rule.met ? <CheckIcon className="size-4" /> : <CircleIcon className="size-4" />}
            {rule.text}
            <span className="sr-only">{rule.met ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>

      <PasswordInput
        id="confirm-password"
        label="Confirm password"
        value={confirm}
        onChange={onConfirmChange}
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={mismatch ? "Passwords don't match." : ''}
      />
    </>
  )
})

export default NewPasswordFields
