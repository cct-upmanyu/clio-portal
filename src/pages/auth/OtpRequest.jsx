import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import { ChevronLeftIcon } from '../../components/ui/icons'
import { inputClass, labelClass, linkClass, primaryButtonClass } from '../../components/auth/styles'

function OtpRequest() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: POST /auth/otp/request { email }
    navigate('/login/code/verify', { state: { email } })
  }

  return (
    <AuthLayout>
      <Link to="/login" className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Back to sign in
      </Link>

      <AuthHeading title="Sign in with an email code">
        Enter the email address on your account. We'll send you a 6-digit code — no password needed.
      </AuthHeading>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="otp-email" className={labelClass}>Email</label>
          <input
            id="otp-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <button type="submit" disabled={!email} className={`${primaryButtonClass} mt-1`}>
          Send code
        </button>
      </form>

      <p className="text-[13px] leading-normal text-muted">
        For your security, we show the same message whether or not an account exists for this email.
      </p>
    </AuthLayout>
  )
}

export default OtpRequest
