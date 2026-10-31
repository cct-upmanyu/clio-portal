import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import DeadlineNotice from '../../components/auth/DeadlineNotice'
import LinkProblem from '../../components/auth/LinkProblem'
import NewPasswordFields from '../../components/auth/NewPasswordFields'
import { useSecondsUntil } from '../../components/auth/useCountdown'
import Spinner from '../../components/ui/Spinner'
import { primaryButtonClass } from '../../components/auth/styles'
import { useResetPasswordMutation, useVerifyResetLinkQuery } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { DISABLED_SIGN_OUT } from '../../utils/accountProblem'
import { linkProblemReason } from '../../utils/linkProblem'
import { maskEmail } from '../../utils/maskEmail'
import { toast } from '../../utils/toast'
import { isNewPasswordReady, validateNewPassword } from '../../utils/validation'

const PROBLEMS = {
  INVALID: { title: 'This link isn’t valid', message: 'The reset link is incomplete or has been replaced by a newer one.' },
  USED: { title: 'This link has already been used', message: 'Each reset link works once. Request a new one if you still need to reset your password.' },
  EXPIRED: { title: 'This link has expired', message: 'For your security, reset links only work for a limited time. Request a new one to continue.' },
  DISABLED: DISABLED_SIGN_OUT,
}

function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const link = useVerifyResetLinkQuery(token)
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitProblem, setProblem] = useState(null)
  const passwordRef = useRef(null)

  const details = link.data?.data
  const secondsLeft = useSecondsUntil(details?.expiresAt)

  const problem = submitProblem
    || (link.error ? linkProblemReason(link.error, 'RESET_LINK_INVALID') || 'INVALID' : null)
    || (secondsLeft === 0 ? 'EXPIRED' : null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const passwordProblem = validateNewPassword(password)
    if (passwordProblem || confirm !== password) {
      setError(passwordProblem)
      return passwordRef.current?.focus()
    }

    try {
      await resetPassword({ token, password }).unwrap()
      toast.success('Password updated', { description: 'Sign in with your new password.' })
      navigate('/login', { replace: true })
    } catch (err) {
      const code = err?.data?.code
      if (linkProblemReason(err, 'RESET_LINK_INVALID')) setProblem(linkProblemReason(err, 'RESET_LINK_INVALID'))
      else if (code === 'VALIDATION_FAILED') setError(err.data.details?.password || err.data.message)
      else if (!isHandledGlobally(err)) toast.error("Couldn't reset your password", { description: err?.data?.message || 'Please try again.' })
    }
  }

  if (problem) {
    return (
      <LinkProblem
        {...(PROBLEMS[problem] || PROBLEMS.INVALID)}
        action={problem === 'DISABLED' ? undefined : { to: '/forgot-password', label: 'Request a new link' }}
      />
    )
  }

  if (!details) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-10 text-brand"><Spinner className="size-6" /></div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout footer="If you have two-step verification turned on, you'll still need your authenticator app to sign in.">
      <AuthHeading title="Choose a new password">
        For <strong className="font-semibold text-ink">{maskEmail(details.email)}</strong>. Use one you don't use anywhere else.
      </AuthHeading>

      <DeadlineNotice secondsLeft={secondsLeft} label="Time left to choose your password" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <NewPasswordFields
          ref={passwordRef}
          password={password}
          onPasswordChange={(value) => { setPassword(value); setError('') }}
          confirm={confirm}
          onConfirmChange={setConfirm}
          error={error}
        />
        <button type="submit" disabled={isLoading || !isNewPasswordReady(password, confirm)} className={`${primaryButtonClass} mt-1`}>
          {isLoading && <Spinner />}
          {isLoading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
