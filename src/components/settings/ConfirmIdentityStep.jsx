import { useState } from 'react'
import OtpInput, { OTP_LENGTH } from '../auth/OtpInput'
import { inputClass, inputErrorClass, labelClass, linkClass } from '../auth/styles'
import { useMfaStepUpMutation } from '../../redux/api/authApi'
import { codeErrorMessage, useStepUpFailureHandler } from '../../hooks/useStepUpErrors'
import { toast } from '../../utils/toast'

// Shared key, so a dialog's footer button can show this step's loading state
export const STEP_UP_CACHE_KEY = 'mfa-step-up'

const BACKUP_CODE_LENGTH = 8

// "Confirm it's you" with a current authenticator code or a backup code (POST /auth/mfa/step-up).
// Rendered as <form id={formId}> so the dialog footer can submit it with <Button type="submit" form={formId}>.
function ConfirmIdentityStep({ formId, intro, notice, onConfirmed, onClose }) {
  const [mfaStepUp, { isLoading }] = useMfaStepUpMutation({ fixedCacheKey: STEP_UP_CACHE_KEY })
  const handleFailure = useStepUpFailureHandler(onClose)

  const [useBackupCode, setUseBackupCode] = useState(false)
  const [code, setCode] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [error, setError] = useState(notice || '')
  const [attempt, setAttempt] = useState(0)

  const submit = async (appCode = code) => {
    if (isLoading) return
    setError('')
    let body
    if (useBackupCode) {
      if (backupCode.replace(/[^A-Za-z0-9]/g, '').length !== BACKUP_CODE_LENGTH) return setError('Enter one of your 8-character backup codes, like ABCD-1234')
      body = { recoveryCode: backupCode }
    } else {
      if (appCode.length !== OTP_LENGTH) return setError('Enter the 6-digit code from your current authenticator app')
      body = { code: appCode }
    }

    try {
      const { data } = await mfaStepUp(body).unwrap()
      if (data.usedRecoveryCode) {
        toast.info('Backup code used', { description: `You have ${data.recoveryCodesRemaining} backup ${data.recoveryCodesRemaining === 1 ? 'code' : 'codes'} left.` })
      }
      onConfirmed(data)
    } catch (err) {
      if (handleFailure(err)) return
      setError(codeErrorMessage(err))
      setCode('')
      setAttempt((n) => n + 1)
    }
  }

  return (
    <form id={formId} onSubmit={(e) => { e.preventDefault(); submit() }} noValidate className="flex flex-col gap-4">
      <p className="text-sm leading-normal text-body">
        {useBackupCode
          ? 'Enter one of your backup codes. It can only be used once.'
          : intro || 'To protect your account, enter a code from an authenticator app you already use.'}
      </p>
      <div className="flex flex-col gap-2">
        {useBackupCode ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${formId}-backup`} className={labelClass}>Backup code</label>
            <input
              id={`${formId}-backup`}
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="ABCD-1234"
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? `${formId}-error` : undefined}
              className={`${error ? inputErrorClass : inputClass} font-mono uppercase tracking-wider`}
            />
          </div>
        ) : (
          <OtpInput
            key={attempt}
            label="Code from your current app"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            describedBy={error ? `${formId}-error` : undefined}
            onChange={setCode}
            onComplete={submit}
          />
        )}
        {error && <span id={`${formId}-error`} role="alert" className="text-[13px] text-danger">{error}</span>}
      </div>
      <button
        type="button"
        onClick={() => { setUseBackupCode((v) => !v); setError('') }}
        className={`${linkClass} cursor-pointer self-start text-[13px]`}
      >
        {useBackupCode ? 'Use your authenticator app instead' : 'Lost your phone? Use a backup code'}
      </button>
    </form>
  )
}

export default ConfirmIdentityStep
