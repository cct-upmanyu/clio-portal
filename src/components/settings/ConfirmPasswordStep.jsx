import { useState } from 'react'
import PasswordInput from '../auth/PasswordInput'
import { useMfaStepUpMutation } from '../../redux/api/authApi'
import { codeErrorMessage, useStepUpFailureHandler } from '../../hooks/useStepUpErrors'
import { STEP_UP_CACHE_KEY } from './ConfirmIdentityStep'

// "Confirm it's you" with the account password, used only when turning two-step verification on
// (there's no authenticator yet to confirm with). Submitted by the dialog footer via form={formId}.
function ConfirmPasswordStep({ formId, notice, onConfirmed, onClose }) {
  const [mfaStepUp, { isLoading }] = useMfaStepUpMutation({ fixedCacheKey: STEP_UP_CACHE_KEY })
  const handleFailure = useStepUpFailureHandler(onClose)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(notice || '')

  const submit = async () => {
    if (isLoading) return
    if (!password) return setError('Enter your password')
    setError('')
    try {
      await mfaStepUp({ password }).unwrap()
      onConfirmed()
    } catch (err) {
      if (handleFailure(err)) return
      setError(codeErrorMessage(err))
      setPassword('')
    }
  }

  return (
    <form id={formId} onSubmit={(e) => { e.preventDefault(); submit() }} noValidate className="flex flex-col gap-4">
      <p className="text-sm leading-normal text-body">
        To turn on two-step verification, first confirm your password.
      </p>
      <PasswordInput
        id={`${formId}-password`}
        label="Password"
        value={password}
        onChange={(value) => { setPassword(value); setError('') }}
        autoComplete="current-password"
        placeholder="Enter your password"
        error={error}
      />
    </form>
  )
}

export default ConfirmPasswordStep
