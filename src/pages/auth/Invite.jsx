import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import ResendCode from '../../components/auth/ResendCode'
import { InviteIcon, LockIcon } from '../../components/ui/icons'
import { primaryButtonClass } from '../../components/auth/styles'

// The invite link alone never signs anyone in: the code goes separately to the
// invited email, so a forwarded or leaked link is useless without that inbox.
function Invite() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [code, setCode] = useState('')

  // TODO: on load, GET /auth/invite/:token -> sends the code, returns the masked email
  // (and shows an "invite expired or already used" state when the token is invalid)
  const maskedEmail = null

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: POST /auth/invite/verify { token, code } -> short-lived token that only allows setting a password
    navigate(`/invite/${token}/set-password`)
  }

  const handleResend = () => {
    // TODO: POST /auth/invite/resend { token }
  }

  return (
    <AuthLayout footer="Not expecting this invitation? You can safely ignore it — no account is created until the code is verified.">
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
          <InviteIcon className="size-6" />
        </div>
        <span className="text-[13px] font-semibold text-muted">Step 1 of 2</span>
      </div>

      <AuthHeading title="You're invited to the Client Portal">
        David Smith Law Firm invited you to securely view your matters, documents and messages.
      </AuthHeading>

      <div className="flex gap-3 rounded-lg border border-line bg-canvas px-4 py-3 max-sm:px-3">
        <LockIcon className="mt-px size-5 shrink-0 text-brand" />
        <p className="text-sm leading-normal">
          To confirm it's really you, we've emailed a 6-digit code to{' '}
          {maskedEmail ? <strong className="font-semibold">{maskedEmail}</strong> : 'the address your invitation was sent to'}.
          Enter it below to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <OtpInput label="Verification code" onChange={setCode} />
          <span className="text-[13px] text-muted">The code expires in 10 minutes.</span>
        </div>
        <button type="submit" disabled={code.length !== OTP_LENGTH} className={`${primaryButtonClass} mt-1`}>
          Verify and continue
        </button>
      </form>

      <ResendCode onResend={handleResend} />
    </AuthLayout>
  )
}

export default Invite
