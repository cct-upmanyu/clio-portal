import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import PasswordInput from '../../components/auth/PasswordInput'
import { MailIcon } from '../../components/ui/icons'
import { inputClass, inputErrorClass, labelClass, linkClass, primaryButtonClass, secondaryButtonClass } from '../../components/auth/styles'
import { useGetSsoConfigQuery, useLoginMutation } from '../../redux/api/authApi'
import { env } from '../../config/env'
import { baseApi, isHandledGlobally } from '../../redux/api/baseApi'
import { toastAccountDisabled, toastAccountProblem } from '../../utils/accountProblem'
import { toast } from '../../utils/toast'
import { useContinueSignIn } from '../../hooks/useSignInFlow'
import { shouldValidateOnBlur, validateEmail, validateLoginPassword } from '../../utils/validation'

const validate = { email: validateEmail, password: validateLoginPassword }

// Why "Sign in with Zoho" sent the user back here (?sso_error=… from the backend)
const SSO_ERRORS = {
  no_account: ['No firm account for that Zoho user', 'Use the Zoho account with the same email as your portal account, or sign in with your password.'],
  invite_pending: ['Finish your invitation first', 'Open the invitation email and set up your account, then you can sign in with Zoho.'],
  disabled: ['Your access is disabled', 'Contact an administrator.'],
  cancelled: ['Sign in with Zoho was cancelled', ''],
  expired: ['That sign-in took too long', 'Please try Sign in with Zoho again.'],
  no_email: ['Zoho did not share a verified email', 'Please sign in with your password.'],
  not_configured: ['Sign in with Zoho isn’t set up', 'Please sign in with your password.'],
  zoho_error: ['Sign in with Zoho failed', 'Please try again, or sign in with your password.'],
}

const ZohoMark = () => (
  <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
    <rect x="2" y="5" width="9" height="9" rx="1.5" fill="#E42527" />
    <rect x="13" y="5" width="9" height="9" rx="1.5" fill="#089949" />
    <rect x="2" y="15" width="9" height="5" rx="1.5" fill="#F9B21D" />
    <rect x="13" y="15" width="9" height="5" rx="1.5" fill="#226DB4" />
  </svg>
)

function Login() {
  const continueSignIn = useContinueSignIn()
  const location = useLocation()
  const dispatch = useDispatch()
  const signOutReason = useSelector((state) => state.auth.signOutReason)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [login, { isLoading }] = useLoginMutation()
  const { data: sso } = useGetSsoConfigQuery()
  const query = new URLSearchParams(location.search)
  const fromParam = query.get('from')
  const from = location.state?.from?.pathname || (fromParam?.startsWith('/') && !fromParam.startsWith('//') ? fromParam : '/')
  const zohoStart = `${env.apiUrl}/auth/sso/zoho/start?from=${encodeURIComponent(from)}`
  // Opened from the CRM widget (?sso=zoho): go straight to Zoho, no click needed
  const autoZoho = query.get('sso') === 'zoho'

  useEffect(() => {
    if (autoZoho && sso?.zoho) window.location.assign(zohoStart)
  }, [autoZoho, sso?.zoho, zohoStart])

  useEffect(() => {
    const reason = new URLSearchParams(location.search).get('sso_error')
    if (!reason) return
    const [title, description] = SSO_ERRORS[reason] || SSO_ERRORS.zoho_error
    toast.error(title, description ? { description } : undefined)
  }, [location.search])

  // Drop anything cached for the previous user
  useEffect(() => {
    dispatch(baseApi.util.resetApiState())
  }, [dispatch])

  useEffect(() => {
    if (signOutReason === 'expired') toast.warning('Your session has ended', { description: 'Please sign in again to continue.' })
    else if (signOutReason === 'disabled') toastAccountDisabled()
  }, [signOutReason])

  // Errors appear once a field has been left (or on submit), then update as the user types
  const handleChange = (field, setValue) => (value) => {
    setValue(value)
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validate[field](value) }))
  }

  const handleBlur = (field, value) => (e) => {
    if (!shouldValidateOnBlur(e, value)) return
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validate[field](value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = { email: validateEmail(email), password: validateLoginPassword(password) }
    setErrors(nextErrors)
    setTouched({ email: true, password: true })
    if (nextErrors.email) return emailRef.current?.focus()
    if (nextErrors.password) return passwordRef.current?.focus()

    try {
      const { data } = await login({ email: email.trim(), password }).unwrap()
      continueSignIn(data)
    } catch (err) {
      if (!toastAccountProblem(err) && !isHandledGlobally(err)) {
        toast.error('Sign-in failed', { description: err?.data?.message || 'Please try again.' })
      }
    }
  }

  return (
    <AuthLayout footer="New client? You'll receive an email invitation from your attorney's office.">
      <AuthHeading title="Sign in">Access your matters, documents and messages.</AuthHeading>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleChange('email', setEmail)(e.target.value)}
            onBlur={handleBlur('email', email)}
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email) || undefined}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={errors.email ? inputErrorClass : inputClass}
          />
          {errors.email && <span id="email-error" className="text-[13px] text-danger">{errors.email}</span>}
        </div>

        <PasswordInput
          ref={passwordRef}
          id="password"
          label="Password"
          value={password}
          onChange={handleChange('password', setPassword)}
          onBlur={handleBlur('password', password)}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
          labelAside={<Link to="/forgot-password" state={{ email, from: location.state?.from }} className={linkClass}>Forgot password?</Link>}
        />

        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1`}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[13px] text-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Link to="/login/code" state={{ email, from: location.state?.from }} className={secondaryButtonClass}>
        <MailIcon className="size-[18px]" />
        Email me a sign-in code
      </Link>

      {sso?.zoho && (
        // A full page load: the browser goes to Zoho and comes back to /login/sso
        <a href={zohoStart} className={secondaryButtonClass}>
          <ZohoMark />
          Sign in with Zoho
        </a>
      )}
    </AuthLayout>
  )
}

export default Login
