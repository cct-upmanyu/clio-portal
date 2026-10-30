import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import OtpInput, { OTP_LENGTH } from '../../components/auth/OtpInput'
import Spinner from '../../components/ui/Spinner'
import { CheckIcon, ChevronLeftIcon, CopyIcon, DownloadIcon, KeyIcon, ShieldIcon } from '../../components/ui/icons'
import { linkClass, primaryButtonClass } from '../../components/auth/styles'
import { useConfirmMfaSetupMutation, useGetMfaStatusQuery, useStartMfaSetupMutation } from '../../redux/api/authApi'
import { MFA_NAVIGATING_CODES, useFinishSignIn, useMfaErrorHandler } from '../../hooks/useSignInFlow'
import { saveFile } from '../../utils/files'
import { toast } from '../../utils/toast'

const smallButtonClass =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-field bg-white px-3 text-[13px] font-semibold text-ink hover:bg-subtle'

const copy = async (text, what) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copied`)
  } catch {
    toast.error('Could not copy', { description: 'Select the text and copy it manually.' })
  }
}

function BackupCodes({ codes, email, onContinue }) {
  const [saved, setSaved] = useState(false)
  const text = codes.join('\n')

  const download = () => {
    const content = [
      'David Smith Law Firm - Client Portal',
      'Two-step verification backup codes',
      `Account: ${email}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...codes,
      '',
      'Each code can be used once if you cannot use your authenticator app.',
    ].join('\n')
    saveFile(new Blob([content], { type: 'text/plain' }), 'client-portal-backup-codes.txt')
  }

  return (
    <AuthLayout>
      <div className="flex size-12 items-center justify-center rounded-xl bg-success-soft text-success max-sm:hidden">
        <KeyIcon className="size-6" />
      </div>

      <AuthHeading title="Save your backup codes">
        If you lose access to your authenticator app, you can sign in with one of these codes. Each code works once.
      </AuthHeading>

      <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4">
        <ul aria-label="Backup codes" className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[15px] font-semibold tracking-wider text-ink">
          {codes.map((code) => <li key={code}>{code}</li>)}
        </ul>
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          <button type="button" onClick={() => copy(text, 'Backup codes')} className={smallButtonClass}>
            <CopyIcon className="size-4" /> Copy
          </button>
          <button type="button" onClick={download} className={smallButtonClass}>
            <DownloadIcon className="size-4" /> Download
          </button>
        </div>
      </div>

      <p className="rounded-lg border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-[13px] leading-normal text-warning">
        These codes won't be shown again. Store them somewhere safe, like a password manager.
      </p>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
        I've saved my backup codes somewhere safe
      </label>

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

  const [qrDataUrl, setQrDataUrl] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [signedIn, setSignedIn] = useState(null)
  const [step, setStep] = useState('scan')
  const [showKey, setShowKey] = useState(false)

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

  useEffect(() => {
    if (!setup?.otpauthUrl) return
    QRCode.toDataURL(setup.otpauthUrl, { width: 336, margin: 1, color: { dark: '#10213A', light: '#FFFFFF' } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [setup?.otpauthUrl])

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

  const groupedKey = setup.secret.match(/.{1,4}/g).join(' ')

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

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg border border-line bg-white p-2">
            {qrDataUrl
              ? <img src={qrDataUrl} alt="QR code for your authenticator app" width={168} height={168} className="size-[168px]" />
              : <div className="flex size-[168px] items-center justify-center text-brand"><Spinner className="size-6" /></div>}
          </div>

          {showKey ? (
            <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-canvas px-3.5 py-2.5">
              <code className="break-words font-mono text-[13px] font-semibold text-ink">{groupedKey}</code>
              <button type="button" onClick={() => copy(setup.secret, 'Setup key')} aria-label="Copy setup key" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink">
                <CopyIcon className="size-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setShowKey(true)} className={`${linkClass} cursor-pointer text-[13px]`}>
              Can't scan it? Enter a setup key instead
            </button>
          )}
        </div>

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
