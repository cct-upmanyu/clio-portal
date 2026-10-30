import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import BackupCodesPanel, { SavedCodesCheckbox } from '../auth/BackupCodesPanel'
import { WarningIcon } from '../ui/icons'
import ConfirmIdentityStep, { STEP_UP_CACHE_KEY } from './ConfirmIdentityStep'
import { useMfaStepUpMutation, useRegenerateRecoveryCodesMutation } from '../../redux/api/authApi'
import { useStepUpFailureHandler } from '../../hooks/useStepUpErrors'
import { toast } from '../../utils/toast'

const FORM_ID = 'regenerate-codes-confirm'

// warn → confirm it's you → new codes (shown once). Old codes are deleted on the server.
function RegenerateBackupCodesDialog({ open, onClose, email, remaining }) {
  const [, stepUpState] = useMfaStepUpMutation({ fixedCacheKey: STEP_UP_CACHE_KEY })
  const [regenerate, regenerateState] = useRegenerateRecoveryCodesMutation()
  const handleFailure = useStepUpFailureHandler(onClose)

  const [step, setStep] = useState('warn')
  const [codes, setCodes] = useState(null)
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const busy = stepUpState.isLoading || regenerateState.isLoading

  const generate = async () => {
    try {
      const { data } = await regenerate().unwrap()
      setCodes(data.recoveryCodes)
      setStep('codes')
    } catch (err) {
      if (handleFailure(err)) return
      // Confirmation expired before generating: confirm again
      setNotice(err?.data?.message || 'Please confirm it\'s you again to continue.')
      setStep('confirm')
    }
  }

  const finish = () => {
    toast.success('New backup codes saved', { description: 'Your previous backup codes no longer work.' })
    onClose()
  }

  // Once the new codes exist, the dialog only closes through "Done" so they aren't lost by accident
  const dismissible = step !== 'codes' && !busy

  const content = {
    warn: {
      title: 'Generate new backup codes?',
      body: (
        <div className="flex gap-3 rounded-lg border border-warning/30 bg-warning-soft px-4 py-3">
          <WarningIcon className="mt-px size-5 shrink-0 text-warning" />
          <p className="text-sm leading-normal text-ink">
            You'll get a new set of codes.{' '}
            {remaining > 0 ? `Your current ${remaining} ${remaining === 1 ? 'code' : 'codes'}` : 'Any old codes'} will be
            {' '}<strong className="font-semibold">permanently deleted</strong> and stop working straight away.
          </p>
        </div>
      ),
      footer: (
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => setStep('confirm')}>Continue</Button>
        </>
      ),
    },
    confirm: {
      title: 'Confirm it\'s you',
      body: (
        <ConfirmIdentityStep
          key={notice}
          formId={FORM_ID}
          notice={notice}
          intro="To generate new backup codes, enter a code from your authenticator app."
          onConfirmed={generate}
          onClose={onClose}
        />
      ),
      footer: (
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" form={FORM_ID} loading={busy}>{busy ? 'Generating…' : 'Generate new codes'}</Button>
        </>
      ),
    },
    codes: {
      title: 'Save your new backup codes',
      body: (
        <div className="flex flex-col gap-4">
          <BackupCodesPanel codes={codes || []} email={email} />
          <SavedCodesCheckbox checked={saved} onChange={setSaved} />
        </div>
      ),
      footer: <Button onClick={finish} disabled={!saved}>Done</Button>,
    },
  }[step]

  return (
    <Modal open={open} onClose={onClose} dismissible={dismissible} title={content.title} footer={content.footer}>
      {content.body}
    </Modal>
  )
}

export default RegenerateBackupCodesDialog
