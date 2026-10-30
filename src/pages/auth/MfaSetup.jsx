import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import AuthenticatorQr from '../../components/auth/AuthenticatorQr'
import BackupCodesPanel, { SavedCodesCheckbox } from '../../components/auth/BackupCodesPanel'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import Spinner from '../../components/ui/Spinner'
import { CheckIcon, ChevronLeftIcon, KeyIcon, ShieldIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useConfirmMfaSetupMutation, useGetMfaStatusQuery, useStartMfaSetupMutation } from '../../redux/api/authApi'
import { MFA_NAVIGATING_CODES, useFinishSignIn, useMfaErrorHandler } from '../../hooks/useSignInFlow'

function BackupCodes({ codes, email, onContinue }) {
  const [saved, setSaved] = useState(false)

  return (
    <AuthLayout>
      <div className="flex size-12 items-center justify-center rounded-xl bg-success-soft text-success max-sm:hidden">
        <KeyIcon className="size-6" />
      </div>

      <AuthHeading title="Save your backup codes">
        If you lose access to your authenticator app, you can sign in with one of these codes. Each code works once.
      </AuthHeading>

      <BackupCodesPanel codes={codes} email={email} />
      <SavedCodesCheckbox checked={saved} onChange={setSaved} />

      <button type="button" disabled={!saved} onClick={onContinue} className={primaryButtonClass}>
        Continue to the portal
      </button>
    </AuthLayout>
  )
}

// Shown when MFA is required but the user has no authenticator yet: scan QR, confirm a code, save backup codes
function MfaSetup() {
  const navigate = useNavigate()
  const location = useLocation()
  const finishSignIn = useFinishSignIn()
  const handleMfaError = useMfaErrorHandler()
  const status = useGetMfaStatusQuery(undefined, { refetchOnMountOrArgChange: true })
  const [startSetup, setupResult] = useStartMfaSetupMutation()
  const [confirmSetup, { isLoading: confirming }] = useConfirmMfaSetupMutation()
  const setupRequested = useRef(false)

  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [signedIn, setSignedIn] = useState(null)
  const [step, setStep] = useState('scan')

  const backToScan = () => {
    setStep('scan')
    setError('')
  }

  const setup = setupResult.data?.data

  useEffect(() => {
    if (status.error) {
      handleMfaError(status.error)
      if (!MFA_NAVIGATING_CODES.includes(status.error.data?.code)) navigate('/login', { replace: true })
    } else if (status.data && !status.data.data.mfaSetupRequired) {
      navigate('/login/mfa', { replace: true, state: location.state })
    } else if (status.data && !setupRequested.current) {
      // Once only: each call creates a new secret and retires the previous one
      setupRequested.current = true
      startSetup().unwrap().catch((err) => {
        handleMfaError(err)
        if (!MFA_NAVIGATING_CODES.includes(err?.data?.code)) navigate('/login', { replace: true })
      })
    }
  }, [status.error, status.data, startSetup, handleMfaError, navigate, location.state])

  const submit = async (value) => {
    if (confirming) return
    setError('')
    try {
      const { data } = await confirmSetup({ code: value }).unwrap()
      if (data.recoveryCodes?.length) setSignedIn(data)
      else finishSignIn(data)
    } catch (err) {
      setError(handleMfaError(err))
      setCode('')
      setAttempt((n) => n + 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (code.length !== OTP_LENGTH) return setError('Enter the 6-digit code shown in your authenticator app')
    return submit(code)
  }

  if (signedIn) {
    const { recoveryCodes, ...user } = signedIn
    return <BackupCodes codes={recoveryCodes} email={user.email} onContinue={() => finishSignIn(user)} />
  }

  if (!setup) {
    return (
      <AuthLayout>
        <div className="flex justify-center py-10 text-brand"><Spinner className="size-6" /></div>
      </AuthLayout>
    )
  }

  if (step === 'scan') {
    return (
      <AuthLayout>
        <Link to="/login" className={`${linkClass} inline-flex items-center gap-1.5 self-start`}>
          <ChevronLeftIcon className="size-4" />
          Back to sign in
        </Link>

        <AuthHeading title="Set up two-step verification">
          Scan this QR code with Google Authenticator, Microsoft Authenticator or any authenticator app.
        </AuthHeading>

        <AuthenticatorQr otpauthUrl={setup.otpauthUrl} secret={setup.secret} />

        <button type="button" onClick={() => setStep('verify')} className={primaryButtonClass}>
          I've scanned the code
        </button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <button type="button" onClick={backToScan} className={`${linkClass} inline-flex cursor-pointer items-center gap-1.5 self-start`}>
        <ChevronLeftIcon className="size-4" />
        Back to QR code
      </button>

      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand max-sm:hidden">
        <ShieldIcon className="size-6" />
      </div>

      <AuthHeading title="Enter the 6-digit code">
        Open your authenticator app and enter the code it shows for {setup.issuer}.
      </AuthHeading>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <OtpInput
            key={attempt}
            label="Authentication code"
            autoFocus
            invalid={Boolean(error)}
            disabled={confirming}
            describedBy={error ? 'setup-error' : undefined}
            onChange={setCode}
            onComplete={submit}
          />
          {error && <span id="setup-error" role="alert" className="text-[13px] text-danger">{error}</span>}
        </div>
        <button type="submit" disabled={confirming} className={`${primaryButtonClass} mt-1`}>
          {confirming ? <Spinner /> : <CheckIcon className="size-[18px]" />}
          {confirming ? 'Verifying…' : 'Verify and turn on'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default MfaSetup
