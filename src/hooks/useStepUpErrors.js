import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { baseApi, isHandledGlobally } from '../redux/api/baseApi'
import { clearAuth } from '../redux/slices/authSlice'
import { toast } from '../utils/toast'

// Inline message for a wrong code, including how many tries are left
export const codeErrorMessage = (err) => {
  const { message, details } = err?.data || {}
  const left = details?.attemptsRemaining
  return left === undefined ? message : `${message} ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`
}

// Errors the form itself should explain (inline, or by going back a step)
const INLINE_CODES = [
  'INVALID_MFA_CODE', 'INVALID_PASSWORD', 'PASSWORD_REQUIRED', 'VALIDATION_FAILED', 'STEP_UP_REQUIRED', 'MFA_SETUP_NOT_STARTED',
]

// For errors from the "confirm it's you" endpoints. Returns true if it dealt with `err`
// (toast, closing the flow, or signing out); false means the caller should show it inline.
export function useStepUpFailureHandler(onClose) {
  const dispatch = useDispatch()

  return useCallback((err) => {
    const { code, message } = err?.data || {}

    if (code === 'STEP_UP_LOCKED') {
      toast.error('Too many incorrect attempts', { description: 'For your security, you have been signed out.' })
      onClose()
      dispatch(baseApi.util.resetApiState())
      dispatch(clearAuth())
      return true
    }
    if (['STEP_UP_RATE_LIMITED', 'MFA_FACTOR_LIMIT', 'MFA_NOT_SET_UP', 'PASSWORD_NOT_SET'].includes(code)) {
      toast.error('Could not continue', { description: message })
      onClose()
      return true
    }
    if (isHandledGlobally(err)) return true
    if (INLINE_CODES.includes(code)) return false

    toast.error('Something went wrong', { description: message || 'Please try again.' })
    return true
  }, [dispatch, onClose])
}
