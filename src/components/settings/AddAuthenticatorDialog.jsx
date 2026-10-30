import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import AuthenticatorQr from '../auth/AuthenticatorQr'
import BackupCodesPanel, { SavedCodesCheckbox } from '../auth/BackupCodesPanel'
import OtpInput, { OTP_LENGTH } from '../auth/OtpInput'
import { inputClass, inputErrorClass, labelClass } from '../auth/styles'
import ConfirmIdentityStep, { STEP_UP_CACHE_KEY } from './ConfirmIdentityStep'
import ConfirmPasswordStep from './ConfirmPasswordStep'
import { useMfaStepUpMutation, useStartAddFactorMutation, useVerifyNewFactorMutation } from '../../redux/api/authApi'
import { codeErrorMessage, useStepUpFailureHandler } from '../../hooks/useStepUpErrors'
import { toast } from '../../utils/toast'

const STEPS = {
  confirm: { n: 1, title: 'Confirm it\'s you' },
  name: { n: 2, title: 'Name your authenticator' },
  scan: { n: 3, title: 'Scan the QR code' },
  code: { n: 4, title: 'Enter the code from the app' },
  codes: { n: 5, title: 'Save your backup codes' },
}

const CONFIRM_FORM_ID = 'add-authenticator-confirm'

// Adding another app: confirm (current app code or backup code) → name → scan QR → code from the new app.
// enabling: turning two-step verification on for the first time, so confirm with the password
// instead, and finish by showing the new backup codes.
function AddAuthenticatorDialog({ open, onClose, enabling = false, email }) {
  const [, stepUpState] = useMfaStepUpMutation({ fixedCacheKey: STEP_UP_CACHE_KEY })
  const [startAddFactor, startState] = useStartAddFactorMutation()
  const [verifyNewFactor, verifyState] = useVerifyNewFactorMutation()
  const handleFailure = useStepUpFailureHandler(onClose)
  const busy = stepUpState.isLoading || startState.isLoading || verifyState.isLoading

  const [step, setStep] = useState('confirm')
  const [notice, setNotice] = useState('')
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [setup, setSetup] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [recoveryCodes, setRecoveryCodes] = useState(null)
  const [saved, setSaved] = useState(false)

  const goTo = (next) => {
    setStep(next)
    setError('')
    setCode('')
  }

  const handleError = (err) => {
    if (handleFailure(err)) return
    const errorCode = err?.data?.code
    if (errorCode === 'STEP_UP_REQUIRED' || errorCode === 'MFA_SETUP_NOT_STARTED') {
      // Confirmation expired (5 min) or used up: start again from step 1
      setNotice(err.data.message || 'Please confirm it\'s you again to continue.')
      goTo('confirm')
      return
    }
    setError(codeErrorMessage(err))
    setCode('')
    setAttempt((n) => n + 1)
  }

  const createFactor = async () => {
    if (busy) return
    if (!label.trim()) return setError('Give this authenticator a name, like "Work iPhone"')
    try {
      const { data } = await startAddFactor({ label: label.trim() }).unwrap()
      setSetup(data)
      goTo('scan')
    } catch (err) {
      handleError(err)
    }
  }

  const verifyFactor = async (newCode = code) => {
    if (busy) return
    if (newCode.length !== OTP_LENGTH) return setError('Enter the 6-digit code shown in your new authenticator app')
    try {
      const { data } = await verifyNewFactor({ factorId: setup.factorId, code: newCode }).unwrap()
      if (data.recoveryCodes?.length) {
        setRecoveryCodes(data.recoveryCodes)
        goTo('codes')
        return
      }
      toast.success('Authenticator added', { description: `"${label.trim()}" can now be used to sign in.` })
      onClose()
    } catch (err) {
      handleError(err)
    }
  }

  const errorMessage = error && <span id="add-mfa-error" role="alert" className="text-[13px] text-danger">{error}</span>

  const footer = {
    confirm: (
      <>
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button type="submit" form={CONFIRM_FORM_ID} loading={busy}>{busy ? 'Checking…' : 'Continue'}</Button>
      </>
    ),
    name: (
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={createFactor} loading={startState.isLoading}>Continue</Button>
      </>
    ),
    scan: (
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={() => goTo('code')}>I've scanned the code</Button>
      </>
    ),
    code: (
      <>
        <Button variant="secondary" onClick={() => goTo('scan')}>Back</Button>
        <Button onClick={() => verifyFactor()} loading={verifyState.isLoading}>
          {verifyState.isLoading ? 'Verifying…' : enabling ? 'Verify and turn on' : 'Verify and add'}
        </Button>
      </>
    ),
    codes: (
      <Button
        disabled={!saved}
        onClick={() => {
          toast.success('Two-step verification is on', { description: 'You\'ll enter a code from your app each time you sign in.' })
          onClose()
        }}
      >
        Done
      </Button>
    ),
  }[step]

  const totalSteps = recoveryCodes || enabling ? 5 : 4

  return (
    <Modal
      open={open}
      onClose={onClose}
      // Once backup codes are on screen, only "Done" closes it so they aren't lost by accident
      dismissible={!busy && step !== 'codes'}
      title={step === 'confirm' && enabling ? 'Confirm your password' : STEPS[step].title}
      description={`${enabling ? 'Turn on two-step verification' : 'Add authenticator'} · Step ${STEPS[step].n} of ${totalSteps}`}
      footer={footer}
    >
      {step === 'confirm' && (enabling ? (
        <ConfirmPasswordStep key={notice} formId={CONFIRM_FORM_ID} notice={notice} onConfirmed={() => goTo('name')} onClose={onClose} />
      ) : (
        <ConfirmIdentityStep
          key={notice}
          formId={CONFIRM_FORM_ID}
          notice={notice}
          onConfirmed={() => goTo('name')}
          onClose={onClose}
        />
      ))}

      {step === 'codes' && recoveryCodes && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-normal text-body">
            If you ever lose your phone, sign in with one of these codes instead. Each code works once.
          </p>
          <BackupCodesPanel codes={recoveryCodes} email={email} />
          <SavedCodesCheckbox checked={saved} onChange={setSaved} />
        </div>
      )}

      {step === 'name' && (
        <form onSubmit={(e) => { e.preventDefault(); createFactor() }} noValidate className="flex flex-col gap-1.5">
          <label htmlFor="factor-label" className={labelClass}>Device name</label>
          <input
            id="factor-label"
            value={label}
            onChange={(e) => { setLabel(e.target.value); setError('') }}
            autoFocus
            maxLength={100}
            placeholder="e.g. Work iPhone"
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? 'add-mfa-error' : 'factor-label-hint'}
            className={error ? inputErrorClass : inputClass}
          />
          {errorMessage || <span id="factor-label-hint" className="text-xs text-muted">Helps you tell your authenticators apart.</span>}
        </form>
      )}

      {step === 'scan' && setup && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-normal text-body">
            {enabling
              ? 'Scan this code with Google Authenticator, Microsoft Authenticator or any authenticator app.'
              : 'Open the authenticator app on your new device and scan this code.'}
          </p>
          <AuthenticatorQr otpauthUrl={setup.otpauthUrl} secret={setup.secret} />
        </div>
      )}

      {step === 'code' && (
        <form onSubmit={(e) => { e.preventDefault(); verifyFactor() }} noValidate className="flex flex-col gap-4">
          <p className="text-sm leading-normal text-body">
            Enter the 6-digit code your {enabling ? 'authenticator' : <strong className="font-semibold">new</strong>} app shows for {setup?.issuer}.
          </p>
          <div className="flex flex-col gap-2">
            <OtpInput
              key={`code-${attempt}`}
              label="Code from your new app"
              autoFocus
              invalid={Boolean(error)}
              disabled={busy}
              describedBy={error ? 'add-mfa-error' : undefined}
              onChange={setCode}
              onComplete={verifyFactor}
            />
            {errorMessage}
          </div>
        </form>
      )}
    </Modal>
  )
}

export default AddAuthenticatorDialog
