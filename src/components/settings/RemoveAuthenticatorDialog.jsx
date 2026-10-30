import { useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import OtpInput, { OTP_LENGTH } from '../auth/OtpInput'
import { useRemoveFactorMutation } from '../../redux/api/authApi'
import { codeErrorMessage, useStepUpFailureHandler } from '../../hooks/useStepUpErrors'
import { toast } from '../../utils/toast'

const FORM_ID = 'remove-authenticator'

const joinNames = (names) =>
  names.length > 1 ? `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}` : names[0]

// Confirmed with a code from one of the OTHER authenticators, which proves the one that stays works.
// Backup codes aren't accepted here.
function RemoveAuthenticatorDialog({ factor, otherFactors, onClose }) {
  const [removeFactor, { isLoading }] = useRemoveFactorMutation()
  const handleFailure = useStepUpFailureHandler(onClose)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  const name = factor.label || 'Authenticator app'
  const others = joinNames(otherFactors.map((f) => `"${f.label || 'Authenticator app'}"`))

  const submit = async (value = code) => {
    if (isLoading) return
    if (value.length !== OTP_LENGTH) return setError(`Enter the 6-digit code from ${others}`)
    setError('')
    try {
      await removeFactor({ factorId: factor.id, code: value }).unwrap()
      toast.success('Authenticator removed', { description: `"${name}" can no longer be used to sign in.` })
      onClose()
    } catch (err) {
      if (handleFailure(err)) return
      setError(codeErrorMessage(err))
      setCode('')
      setAttempt((n) => n + 1)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!isLoading}
      title={`Remove "${name}"?`}
      description="It will no longer be able to sign in to your account."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="danger" type="submit" form={FORM_ID} loading={isLoading}>{isLoading ? 'Removing…' : 'Remove'}</Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={(e) => { e.preventDefault(); submit() }} noValidate className="flex flex-col gap-4">
        <p className="text-sm leading-normal text-body">
          To confirm, enter the current code from <strong className="font-semibold text-ink">{others}</strong>.
          This makes sure the authenticator you keep is working.
        </p>
        <div className="flex flex-col gap-2">
          <OtpInput
            key={attempt}
            label="Code from another authenticator"
            autoFocus
            invalid={Boolean(error)}
            disabled={isLoading}
            describedBy={error ? 'remove-mfa-error' : undefined}
            onChange={setCode}
            onComplete={submit}
          />
          {error && <span id="remove-mfa-error" role="alert" className="text-[13px] text-danger">{error}</span>}
        </div>
      </form>
    </Modal>
  )
}

export default RemoveAuthenticatorDialog
