import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { isHandledGlobally } from '../redux/api/baseApi'
import { setAuthUser } from '../redux/slices/authSlice'
import { toast } from '../utils/toast'

const MFA_PATHS = { mfa_setup: '/login/mfa/setup', mfa_challenge: '/login/mfa' }

// Errors useMfaErrorHandler already navigates away for
export const MFA_NAVIGATING_CODES = ['MFA_TICKET_INVALID', 'MFA_TOO_MANY_ATTEMPTS', 'MFA_WRONG_STEP']

// Last step of every sign-in path: store the user, welcome them, go where they were headed
export function useFinishSignIn() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((user, { firstVisit = false } = {}) => {
    dispatch(setAuthUser(user))
    const greeting = firstVisit ? 'Welcome' : 'Welcome back'
    toast.success(user?.firstName ? `${greeting}, ${user.firstName}` : greeting, {
      description: 'You are signed in to the Client Portal.',
    })
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }, [dispatch, navigate, location.state])
}

// After any first factor (password, email code, accepted invitation): the MFA step, or straight in
export function useContinueSignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const finishSignIn = useFinishSignIn()

  return useCallback((data, options) => {
    if (data?.mfaRequired) {
      navigate(data.mfaSetupRequired ? '/login/mfa/setup' : '/login/mfa', { replace: true, state: { from: location.state?.from } })
      return
    }
    finishSignIn(data, options)
  }, [navigate, location.state, finishSignIn])
}

// Inline message for a wrong or expired emailed code, or '' for errors handled elsewhere
export function emailCodeErrorMessage(err) {
  const code = err?.data?.code
  if (code !== 'INVALID_EMAIL_CODE' && code !== 'EMAIL_CODE_EXPIRED') return ''
  const remaining = err.data.details?.attemptsRemaining
  return remaining > 0
    ? `${err.data.message} ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} left.`
    : err.data.message
}

// Shared handling for /auth/mfa errors. Returns the message to show under the code field, if any.
export function useMfaErrorHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((err) => {
    const code = err?.data?.code
    const backToLogin = () => navigate('/login', { replace: true, state: { from: location.state?.from } })

    if (code === 'MFA_TICKET_INVALID') {
      toast.warning('Your sign-in has timed out', { description: 'Please sign in again to continue.' })
      backToLogin()
    } else if (code === 'MFA_TOO_MANY_ATTEMPTS') {
      toast.error('Too many incorrect codes', { description: 'For your security, please sign in again.' })
      backToLogin()
    } else if (code === 'MFA_WRONG_STEP') {
      navigate(MFA_PATHS[err.data.details?.expected] || '/login', { replace: true, state: location.state })
    } else if (code === 'INVALID_MFA_CODE') {
      const remaining = err.data.details?.attemptsRemaining
      return remaining === undefined
        ? err.data.message
        : `${err.data.message} ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} left.`
    } else if (!isHandledGlobally(err)) {
      toast.error('Verification failed', { description: err?.data?.message || 'Please try again.' })
    }
    return ''
  }, [navigate, location.state])
}
