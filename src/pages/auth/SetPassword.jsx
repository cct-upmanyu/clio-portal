import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import DeadlineNotice from '../../components/auth/DeadlineNotice'
import InviteProblem from '../../components/auth/InviteProblem'
import NewPasswordFields from '../../components/auth/NewPasswordFields'
import { useSecondsUntil } from '../../components/auth/useCountdown'
import Spinner from '../../components/ui/Spinner'
import { CheckIcon } from '../../components/ui/icons'
import { primaryButtonClass, secondaryButtonClass } from '../../components/auth/styles'
import { useCompleteInviteMutation, useVerifyInviteQuery } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { useContinueSignIn } from '../../hooks/useSignInFlow'
import { linkProblemReason } from '../../utils/linkProblem'
import { toast } from '../../utils/toast'
import { isNewPasswordReady, validateNewPassword } from '../../utils/validation'

const inviteProblemReason = (err) => linkProblemReason(err, 'INVITE_INVALID')

// Step 2 of the invitation: a password is optional (without one, the user signs in with an email
// code). Then the MFA setup when MFA is required, otherwise straight into the portal.
function SetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const continueSignIn = useContinueSignIn()
  const invite = useVerifyInviteQuery(token, { refetchOnMountOrArgChange: true })
  const [completeInvite] = useCompleteInviteMutation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitProblem, setProblem] = useState(null)
  // 'password' or 'skip' while that request runs
  const [submitting, setSubmitting] = useState(null)
  const passwordRef = useRef(null)

  const details = invite.data?.data
  const secondsLeft = useSecondsUntil(details?.emailVerified ? details.expiresAt : null)
  const totalSteps = details?.mfaRequired ? 3 : 2

  const problem = submitProblem
    || (invite.error ? inviteProblemReason(invite.error) || 'INVALID' : null)
    || (secondsLeft === 0 ? 'EXPIRED' : null)

  useEffect(() => {
    if (details && !details.emailVerified) navigate(`/invite/${token}`, { replace: true })
  }, [details, navigate, token])

  const finish = async (mode) => {
    if (submitting) return
    setSubmitting(mode)
    try {
      const { data } = await completeInvite(mode === 'password' ? { token, password } : { token }).unwrap()
      continueSignIn(data, { firstVisit: true })
    } catch (err) {
      const reason = inviteProblemReason(err)
      const code = err?.data?.code
      if (reason) setProblem(reason)
      else if (code === 'INVITE_EMAIL_NOT_VERIFIED') navigate(`/invite/${token}`, { replace: true })
      else if (code === 'VALIDATION_FAILED') setError(err.data.details?.password || err.data.message)
      else if (!isHandledGlobally(err)) toast.error("Couldn't finish setting up your account", { description: err?.data?.message || 'Please try again.' })
      setSubmitting(null)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const passwordProblem = validateNewPassword(password)
    if (passwordProblem || confirm !== password) {
      setError(passwordProblem)
      return passwordRef.current?.focus()
    }
    finish('password')
  }

  if (problem) return <InviteProblem reason={problem} />

  if (!details?.emailVerified) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-10 text-brand"><Spinner className="size-6" /></div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout footer={details.mfaRequired ? 'Next, you\'ll set up an authenticator app to protect your account.' : undefined}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-muted">Step 2 of {totalSteps}</span>
        <span className="rounded-full bg-subtle px-2.5 py-0.5 text-xs font-medium text-muted">Optional</span>
      </div>

      <AuthHeading title="Set a password">
        Sign in faster with your email and a password. Or skip this: you can always sign in with a code we email you, and add a password later in Settings.
      </AuthHeading>

      <div className="flex items-center gap-2.5 rounded-lg border border-success/30 bg-success-soft px-3.5 py-3">
        <CheckIcon className="size-[18px] shrink-0 text-success" />
        <span className="text-sm">Email confirmed</span>
      </div>

      <DeadlineNotice secondsLeft={secondsLeft} label="Time left to finish setting up" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <NewPasswordFields
          ref={passwordRef}
          password={password}
          onPasswordChange={(value) => { setPassword(value); setError('') }}
          confirm={confirm}
          onConfirmChange={setConfirm}
          error={error}
        />

        <div className="mt-1 flex flex-col gap-3">
          <button type="submit" disabled={Boolean(submitting) || !isNewPasswordReady(password, confirm)} className={primaryButtonClass}>
            {submitting === 'password' && <Spinner />}
            {submitting === 'password' ? 'Saving…' : 'Set password and continue'}
          </button>
          <button
            type="button"
            onClick={() => finish('skip')}
            disabled={Boolean(submitting)}
            className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {submitting === 'skip' && <Spinner />}
            Skip for now
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}

export default SetPassword
