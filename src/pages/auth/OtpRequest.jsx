import { useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import EmailField from '../../components/auth/EmailField'
import Spinner from '../../components/ui/Spinner'
import { ChevronLeftIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useRequestLoginCodeMutation } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { toast } from '../../utils/toast'
import { shouldValidateOnBlur, validateEmail } from '../../utils/validation'

function OtpRequest() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const emailRef = useRef(null)
  const [requestCode, { isLoading }] = useRequestLoginCodeMutation()

  const handleChange = (value) => {
    setEmail(value)
    if (touched) setError(validateEmail(value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const problem = validateEmail(email)
    setError(problem)
    setTouched(true)
    if (problem) return emailRef.current?.focus()

    try {
      const { data } = await requestCode({ email: email.trim() }).unwrap()
      navigate('/login/code/verify', {
        state: { email: data.email, expiresInSeconds: data.expiresInSeconds, resendAvailableInSeconds: data.resendAvailableInSeconds, from: location.state?.from },
      })
    } catch (err) {
      if (err?.data?.details?.email) setError(err.data.details.email)
      else if (!isHandledGlobally(err)) toast.error("Couldn't send the code", { description: err?.data?.message || 'Please try again.' })
    }
  }

  return (
    <AuthLayout>
      <Link to="/login" state={{ from: location.state?.from }} className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Back to sign in
      </Link>

      <AuthHeading title="Sign in with an email code">
        Enter the email address on your account. We'll send you a 6-digit code, no password needed.
      </AuthHeading>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <EmailField
          ref={emailRef}
          id="otp-email"
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
          {isLoading ? 'Sending…' : 'Send code'}
        </button>
      </form>

      <p className="text-[13px] leading-normal text-muted">
        For your security, we show the same message whether or not an account exists for this email.
      </p>
    </AuthLayout>
  )
}

export default OtpRequest
