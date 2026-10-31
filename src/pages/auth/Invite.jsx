import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import InviteProblem from '../../components/auth/InviteProblem'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import ResendCode from '../../components/auth/ResendCode'
import { formatDuration } from '../../components/auth/useCountdown'
import Spinner from '../../components/ui/Spinner'
import { InviteIcon, LockIcon } from '../../components/ui/icons'
import { primaryButtonClass } from '../../components/auth/styles'
import { useSendInviteCodeMutation, useVerifyInviteCodeMutation, useVerifyInviteQuery } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { emailCodeErrorMessage } from '../../hooks/useSignInFlow'
import { maskEmail } from '../../utils/maskEmail'
import { linkProblemReason } from '../../utils/linkProblem'
import { toast } from '../../utils/toast'

const inviteProblemReason = (err) => linkProblemReason(err, 'INVITE_INVALID')

const sendFailed = (err) => {
  if (!isHandledGlobally(err)) toast.error("Couldn't send the code", { description: err?.data?.message || 'Please try again.' })
}

// Step 1: the invite link alone never signs anyone in. A code goes to the invited email, so a
// forwarded or leaked link is useless without that inbox.
function Invite() {
  const navigate = useNavigate()
  const { token } = useParams()
  const invite = useVerifyInviteQuery(token)
  const [sendCode] = useSendInviteCodeMutation()
  const [verifyCode, { isLoading }] = useVerifyInviteCodeMutation()
  const codeRequested = useRef(false)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sendProblem, setProblem] = useState(null)
  // Seconds until "Resend code" is available, known once the first send has answered
  const [resendWait, setResendWait] = useState(null)
  const [codeExpiresIn, setCodeExpiresIn] = useState(null)

  const details = invite.data?.data
  const totalSteps = details?.mfaRequired ? 3 : 2

  const problem = sendProblem || (invite.error ? inviteProblemReason(invite.error) || 'INVALID' : null)

  useEffect(() => {
    if (!details) return
    if (details.emailVerified) {
      navigate(`/invite/${token}/set-password`, { replace: true })
      return
    }
    // Once per visit. On a refresh within the resend cooldown the earlier code is still valid.
    if (codeRequested.current) return
    codeRequested.current = true
    sendCode(token).unwrap()
      .then(({ data }) => {
        setResendWait(data.resendAvailableInSeconds)
        setCodeExpiresIn(data.codeExpiresInSeconds)
      })
      .catch((err) => {
        const reason = inviteProblemReason(err)
        if (reason) return setProblem(reason)
        if (err?.data?.code === 'EMAIL_RATE_LIMITED') return setResendWait(err.data.details?.retryAfterSeconds ?? 0)
        sendFailed(err)
        setResendWait(0)
      })
  }, [details, navigate, sendCode, token])

  const submit = async (value) => {
    if (isLoading) return
    setError('')
    try {
      await verifyCode({ token, code: value }).unwrap()
      navigate(`/invite/${token}/set-password`, { replace: true })
    } catch (err) {
      const reason = inviteProblemReason(err)
      if (reason) return setProblem(reason)
      const message = emailCodeErrorMessage(err)
      if (message) setError(message)
      else if (!isHandledGlobally(err)) toast.error('Verification failed', { description: err?.data?.message || 'Please try again.' })
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
      const { data } = await sendCode(token).unwrap()
      setError('')
      toast.success('New code sent', { description: 'Use the code in the latest email.' })
      setCodeExpiresIn(data.codeExpiresInSeconds)
      return data.resendAvailableInSeconds
    } catch (err) {
      const reason = inviteProblemReason(err)
      if (reason) return setProblem(reason)
      if (err?.data?.code === 'EMAIL_RATE_LIMITED') return err.data.details?.retryAfterSeconds
      sendFailed(err)
      return 0
    }
  }

  if (problem) return <InviteProblem reason={problem} />

  if (!details || details.emailVerified) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-10 text-brand"><Spinner className="size-6" /></div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout footer="Not expecting this invitation? You can safely ignore it. No account is created until the code is confirmed.">
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
          <InviteIcon className="size-6" />
        </div>
        <span className="text-[13px] font-semibold text-muted">Step 1 of {totalSteps}</span>
      </div>

      <AuthHeading title={details.firstName ? `Welcome, ${details.firstName}` : "You're invited to the Client Portal"}>
        David Smith Law Firm has invited you to securely view your matters, documents and messages.
      </AuthHeading>

      <div className="flex gap-3 rounded-lg border border-line bg-canvas px-4 py-3 max-sm:px-3">
        <LockIcon className="mt-px size-5 shrink-0 text-brand" />
        <p className="text-sm leading-normal">
          To confirm it's really you, {resendWait === null ? "we're emailing" : "we've emailed"} a 6-digit code to{' '}
          <strong className="font-semibold">{maskEmail(details.email)}</strong>. Enter it below to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <OtpInput
            key={attempt}
            label="Verification code"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            describedBy={error ? 'invite-code-error' : undefined}
            onChange={setCode}
            onComplete={submit}
          />
          {error
            ? <span id="invite-code-error" role="alert" className="text-[13px] text-danger">{error}</span>
            : codeExpiresIn && <span className="text-[13px] text-muted">The code expires in {formatDuration(codeExpiresIn)}.</span>}
        </div>
        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1`}>
          {isLoading && <Spinner />}
          {isLoading ? 'Verifying…' : 'Verify and continue'}
        </button>
      </form>

      {resendWait !== null && <ResendCode seconds={resendWait} onResend={handleResend} />}
    </AuthLayout>
  )
}

export default Invite
