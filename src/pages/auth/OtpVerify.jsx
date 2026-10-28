import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import ResendCode from '../../components/auth/ResendCode'
import { ChevronLeftIcon, MailIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { maskEmail } from '../../utils/maskEmail'

function OtpVerify() {
  const navigate = useNavigate()
  const email = useLocation().state?.email
  const [code, setCode] = useState('')

  // Reached without going through the email step (e.g. page refresh)
  if (!email) return <Navigate to="/login/code" replace />

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: POST /auth/otp/verify { email, code }, then go to the dashboard
    navigate('/')
  }

  const handleResend = () => {
    // TODO: POST /auth/otp/request { email }
  }

  return (
    <AuthLayout>
      <Link to="/login/code" state={{ email }} className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Use a different email
      </Link>

      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
        <MailIcon className="size-6" />
      </div>

      <AuthHeading title="Check your email">
        We sent a 6-digit code to <strong className="font-semibold text-ink">{maskEmail(email)}</strong>. It expires in 10 minutes.
      </AuthHeading>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <OtpInput label="6-digit code" onChange={setCode} />
        <button type="submit" disabled={code.length !== OTP_LENGTH} className={`${primaryButtonClass} mt-1`}>
          Verify and sign in
        </button>
      </form>

      <ResendCode onResend={handleResend}>
        <Link to="/login" className={linkClass}>Use password instead</Link>
      </ResendCode>
    </AuthLayout>
  )
}

export default OtpVerify
