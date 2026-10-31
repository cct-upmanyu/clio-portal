import { useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import EmailField from '../../components/auth/EmailField'
import FormAlert from '../../components/auth/FormAlert'
import ResendCode from '../../components/auth/ResendCode'
import { formatDuration } from '../../components/auth/useCountdown'
import Spinner from '../../components/ui/Spinner'
import { ChevronLeftIcon, KeyIcon, MailIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useForgotPasswordMutation } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { maskEmail } from '../../utils/maskEmail'
import { accountProblem } from '../../utils/accountProblem'
import { toast } from '../../utils/toast'
import { shouldValidateOnBlur, validateEmail } from '../../utils/validation'

const failed = (err) => {
  if (!isHandledGlobally(err)) toast.error("Couldn't send the link", { description: err?.data?.message || 'Please try again.' })
}

function ForgotPassword() {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [alert, setAlert] = useState(null)
  // The reply to the last send: { email, expiresInSeconds, resendAvailableInSeconds }
  const [sent, setSent] = useState(null)
  const sentTo = sent?.email
  const emailRef = useRef(null)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const handleChange = (value) => {
    setEmail(value)
    setAlert(null)
    if (touched) setError(validateEmail(value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const problem = validateEmail(email)
    setError(problem)
    setTouched(true)
    if (problem) return emailRef.current?.focus()

    setAlert(null)
    try {
      const { data } = await forgotPassword({ email: email.trim() }).unwrap()
      setSent(data)
    } catch (err) {
      if (accountProblem(err)) setAlert(accountProblem(err))
      else if (err?.data?.details?.email) setError(err.data.details.email)
      else failed(err)
    }
  }

  const handleResend = async () => {
    try {
      const { data } = await forgotPassword({ email: sentTo }).unwrap()
      toast.success('Link sent again', { description: 'Use the link in the latest email.' })
      return data.resendAvailableInSeconds
    } catch (err) {
      failed(err)
      return 0
    }
  }

  const backLink = (
    <Link to="/login" state={{ from: location.state?.from }} className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
      <ChevronLeftIcon className="size-4" />
      Back to sign in
    </Link>
  )

  if (sentTo) {
    return (
      <AuthLayout footer={`The link works once and expires in ${formatDuration(sent.expiresInSeconds)}. If you didn't ask to reset your password, you can ignore the email.`}>
        {backLink}
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
          <MailIcon className="size-6" />
        </div>
        <AuthHeading title="Check your email">
          If there's an account for <strong className="font-semibold text-ink">{maskEmail(sentTo)}</strong>, we've sent it a link to choose a new password.
        </AuthHeading>
        <ResendCode seconds={sent.resendAvailableInSeconds} onResend={handleResend}>
          <button type="button" onClick={() => setSent(null)} className={`${linkClass} cursor-pointer`}>Use a different email</button>
        </ResendCode>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      {backLink}
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
        <KeyIcon className="size-6" />
      </div>

      <AuthHeading title="Forgot your password?">
        Enter the email address on your account and we'll send you a link to choose a new one.
      </AuthHeading>

      {alert && <FormAlert {...alert} />}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <EmailField
          ref={emailRef}
          id="forgot-email"
          value={email}
          onChange={handleChange}
          onBlur={(e) => {
            if (!shouldValidateOnBlur(e, email)) return
            setTouched(true)
            setError(validateEmail(email))
          }}
          error={error}
          autoFocus
        />
        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1`}>
          {isLoading && <Spinner />}
          {isLoading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-[13px] leading-normal text-muted">
        Prefer not to wait? <Link to="/login/code" state={{ email, from: location.state?.from }} className={linkClass}>Sign in with an email code</Link> instead.
      </p>
    </AuthLayout>
  )
}

export default ForgotPassword
