import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import FormAlert from '../../components/auth/FormAlert'
import PasswordInput from '../../components/auth/PasswordInput'
import { MailIcon } from '../../components/ui/icons'
import { inputClass, inputErrorClass, labelClass, linkClass, primaryButtonClass, secondaryButtonClass } from '../../components/auth/styles'
import { useLoginMutation } from '../../redux/api/authApi'
import { baseApi, isHandledGlobally } from '../../redux/api/baseApi'
import { DISABLED_SIGN_OUT, accountProblem } from '../../utils/accountProblem'
import { toast } from '../../utils/toast'
import { useContinueSignIn } from '../../hooks/useSignInFlow'
import { shouldValidateOnBlur, validateEmail, validateLoginPassword } from '../../utils/validation'

const validate = { email: validateEmail, password: validateLoginPassword }

function Login() {
  const continueSignIn = useContinueSignIn()
  const location = useLocation()
  const dispatch = useDispatch()
  const signOutReason = useSelector((state) => state.auth.signOutReason)
  const sessionExpired = signOutReason === 'expired'
  // undefined until the first submit, so the reason for a sign-out shows only until the user tries again
  const [submitAlert, setAlert] = useState()
  const alert = submitAlert === undefined ? (signOutReason === 'disabled' ? DISABLED_SIGN_OUT : null) : submitAlert
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({ email: false, password: false })
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [login, { isLoading }] = useLoginMutation()

  // Drop anything cached for the previous user
  useEffect(() => {
    dispatch(baseApi.util.resetApiState())
  }, [dispatch])

  useEffect(() => {
    if (sessionExpired) toast.warning('Your session has ended', { description: 'Please sign in again to continue.' })
  }, [sessionExpired])

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

    setAlert(null)
    try {
      const { data } = await login({ email: email.trim(), password }).unwrap()
      continueSignIn(data)
    } catch (err) {
      const problem = accountProblem(err)
      if (problem) {
        setAlert(problem)
      } else if (!isHandledGlobally(err)) {
        toast.error('Sign-in failed', { description: err?.data?.message || 'Please try again.' })
      }
    }
  }

  return (
    <AuthLayout footer="New client? You'll receive an email invitation from your attorney's office.">
      <AuthHeading title="Sign in">Access your matters, documents and messages.</AuthHeading>

      {alert && <FormAlert {...alert} />}

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
    </AuthLayout>
  )
}

export default Login
