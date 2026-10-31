import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import ResendCode from '../../components/auth/ResendCode'
import { formatDuration } from '../../components/auth/useCountdown'
import Spinner from '../../components/ui/Spinner'
import { ChevronLeftIcon, MailIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useRequestLoginCodeMutation, useVerifyLoginCodeMutation } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { emailCodeErrorMessage, useContinueSignIn } from '../../hooks/useSignInFlow'
import { maskEmail } from '../../utils/maskEmail'
import { toast } from '../../utils/toast'

function OtpVerify() {
  const location = useLocation()
  const { email, expiresInSeconds, resendAvailableInSeconds } = location.state || {}
  const continueSignIn = useContinueSignIn()
  const [verifyCode, { isLoading }] = useVerifyLoginCodeMutation()
  const [requestCode] = useRequestLoginCodeMutation()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  // Reached without going through the email step (e.g. page refresh)
  if (!email) return <Navigate to="/login/code" replace />

  const submit = async (value) => {
    if (isLoading) return
    setError('')
    try {
      const { data } = await verifyCode({ email, code: value }).unwrap()
      continueSignIn(data)
    } catch (err) {
      const message = emailCodeErrorMessage(err)
      if (message) setError(message)
      else if (!isHandledGlobally(err)) toast.error('Sign-in failed', { description: err?.data?.message || 'Please try again.' })
      setCode('')
      setAttempt((n) => n + 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.length !== OTP_LENGTH) return setError('Enter the 6-digit code from the email')
    submit(code)
  }

  const handleResend = async () => {
    try {
      const { data } = await requestCode({ email }).unwrap()
      setError('')
      toast.success('New code sent', { description: 'Use the code in the latest email.' })
      return data.resendAvailableInSeconds
    } catch (err) {
      if (!isHandledGlobally(err)) toast.error("Couldn't send the code", { description: err?.data?.message || 'Please try again.' })
      return 0
    }
  }

  return (
    <AuthLayout>
      <Link to="/login/code" state={{ email, from: location.state?.from }} className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Use a different email
      </Link>

      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
        <MailIcon className="size-6" />
      </div>

      <AuthHeading title="Check your email">
        If there's an account for <strong className="font-semibold text-ink">{maskEmail(email)}</strong>, we've sent it a 6-digit code.{expiresInSeconds ? ` It expires in ${formatDuration(expiresInSeconds)}.` : ''}
      </AuthHeading>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <OtpInput
            key={attempt}
            label="6-digit code"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            describedBy={error ? 'code-error' : undefined}
            onChange={setCode}
            onComplete={submit}
          />
          {error && <span id="code-error" role="alert" className="text-[13px] text-danger">{error}</span>}
        </div>
        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1`}>
          {isLoading && <Spinner />}
          {isLoading ? 'Verifying…' : 'Verify and sign in'}
        </button>
      </form>

      <ResendCode seconds={resendAvailableInSeconds ?? 0} onResend={handleResend}>
        <Link to="/login" state={{ from: location.state?.from }} className={linkClass}>Use password instead</Link>
      </ResendCode>
    </AuthLayout>
  )
}

export default OtpVerify
