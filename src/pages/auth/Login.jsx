import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import PasswordInput from '../../components/auth/PasswordInput'
import { MailIcon } from '../../components/ui/icons'
import { inputClass, labelClass, linkClass, primaryButtonClass, secondaryButtonClass } from '../../components/auth/styles'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: POST /auth/login { email, password }, then go to the dashboard
    navigate('/')
  }

  return (
    <AuthLayout footer="New client? You'll receive an email invitation from your attorney's office.">
      <AuthHeading title="Sign in">Access your matters, documents and messages.</AuthHeading>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Enter your password"
          labelAside={<Link to="/login/code" className={linkClass}>Forgot password?</Link>}
        />

        <button type="submit" disabled={!email || !password} className={`${primaryButtonClass} mt-1`}>
          Sign in
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link to="/login/code" state={{ email }} className={secondaryButtonClass}>
        <MailIcon className="size-[18px]" />
        Email me a sign-in code
      </Link>
    </AuthLayout>
  )
}

export default Login
