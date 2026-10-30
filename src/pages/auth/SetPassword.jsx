import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import PasswordInput from '../../components/auth/PasswordInput'
import { CheckIcon, CircleIcon } from '../../components/ui/icons'
import { primaryButtonClass } from '../../components/auth/styles'
import { PASSWORD_RULES } from '../../utils/validation'

function SetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const rules = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(password) }))
  const mismatch = confirm.length > 0 && confirm !== password
  const canSubmit = rules.every((r) => r.met) && confirm === password

  // TODO: guard this page — without the token from POST /auth/invite/verify, send the user back to the invite step
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: POST /auth/invite/set-password { password } (with the verify token), marks the invite as used
    navigate('/login', { replace: true })
  }

  return (
    <AuthLayout>
      <span className="text-[13px] font-semibold text-muted">Step 2 of 2</span>

      <AuthHeading title="Set your password">
        You'll use this with your email to sign in. You can also sign in with an email code anytime.
      </AuthHeading>

      <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-3">
        <CheckIcon className="size-[18px] shrink-0 text-success" />
        <span className="text-sm">Email verified</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Create a password"
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

        <div className="flex flex-col gap-1.5">
          <PasswordInput
            id="confirm-password"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            invalid={mismatch}
          />
          {mismatch && <span className="text-[13px] text-danger" role="alert">Passwords don't match.</span>}
        </div>

        <button type="submit" disabled={!canSubmit} className={`${primaryButtonClass} mt-1`}>
          Set password and continue
        </button>
      </form>
    </AuthLayout>
  )
}

export default SetPassword
