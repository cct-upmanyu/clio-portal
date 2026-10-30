import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import Spinner from '../../components/ui/Spinner'
import { ChevronLeftIcon, ShieldIcon } from '../../components/ui/icons'
import { inputClass, inputErrorClass, labelClass, linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useGetMfaStatusQuery, useVerifyMfaMutation } from '../../redux/api/authApi'
import { MFA_NAVIGATING_CODES, useFinishSignIn, useMfaErrorHandler } from '../../hooks/useSignInFlow'
import { toast } from '../../utils/toast'

const LOW_BACKUP_CODES = 3

// Second sign-in step for users who already have an authenticator app (or a backup code)
function MfaVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const finishSignIn = useFinishSignIn()
  const handleMfaError = useMfaErrorHandler()
  const status = useGetMfaStatusQuery(undefined, { refetchOnMountOrArgChange: true })
  const [verifyMfa, { isLoading }] = useVerifyMfaMutation()

  const [useBackupCode, setUseBackupCode] = useState(false)
  const [code, setCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (status.error) {
      handleMfaError(status.error)
      if (!MFA_NAVIGATING_CODES.includes(status.error.data?.code)) navigate('/login', { replace: true })
    } else if (status.data?.data?.mfaSetupRequired) {
      navigate('/login/mfa/setup', { replace: true, state: location.state })
    }
  }, [status.error, status.data, handleMfaError, navigate, location.state])

  const submit = async (body) => {
    if (isLoading) return
    setError('')
    try {
      const { data } = await verifyMfa(body).unwrap()
      if (data.usedRecoveryCode && data.recoveryCodesRemaining <= LOW_BACKUP_CODES) {
        toast.warning(`Only ${data.recoveryCodesRemaining} backup ${data.recoveryCodesRemaining === 1 ? 'code' : 'codes'} left`, {
          description: 'Generate new backup codes from your account settings.',
        })
      }
      finishSignIn(data)
    } catch (err) {
      setError(handleMfaError(err))
      setCode('')
      setAttempt((n) => n + 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (useBackupCode) {
      if (backupCode.replace(/[^A-Za-z0-9]/g, '').length !== 8) return setError('Enter one of your 8-character backup codes, like ABCD-1234')
      return submit({ recoveryCode: backupCode })
    }
    if (code.length !== OTP_LENGTH) return setError('Enter the 6-digit code from your authenticator app')
    return submit({ code })
  }

  const switchMode = () => {
    setUseBackupCode((v) => !v)
    setError('')
  }

  if (!status.data) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-10 text-brand"><Spinner className="size-6" /></div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout footer="Lost access to your authenticator app and backup codes? Contact your attorney's office to reset two-step verification.">
      <Link to="/login" className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Back to sign in
      </Link>

      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
        <ShieldIcon className="size-6" />
      </div>

      <AuthHeading title="Two-step verification">
        {useBackupCode
          ? 'Enter one of the backup codes you saved when you set up two-step verification.'
          : 'Open your authenticator app and enter the 6-digit code for the Client Portal.'}
      </AuthHeading>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {useBackupCode ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="backup-code" className={labelClass}>Backup code</label>
              <input
                id="backup-code"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="ABCD-1234"
                aria-invalid={Boolean(error) || undefined}
                aria-describedby={error ? 'mfa-error' : undefined}
                className={`${error ? inputErrorClass : inputClass} font-mono uppercase tracking-wider`}
              />
            </div>
          ) : (
            <OtpInput
              key={attempt}
              label="Authentication code"
              autoFocus
              invalid={Boolean(error)}
              disabled={isLoading}
              describedBy={error ? 'mfa-error' : undefined}
              onChange={setCode}
              onComplete={(value) => submit({ code: value })}
            />
          )}
          {error && <span id="mfa-error" role="alert" className="text-[13px] text-danger">{error}</span>}
        </div>

        <button type="submit" disabled={isLoading} className={`${primaryButtonClass} mt-1`}>
          {isLoading && <Spinner />}
          {isLoading ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      <button type="button" onClick={switchMode} className={`${linkClass} cursor-pointer self-center`}>
        {useBackupCode ? 'Use your authenticator app instead' : 'Use a backup code instead'}
      </button>
    </AuthLayout>
  )
}

export default MfaVerify
