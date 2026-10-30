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

  return useCallback((user) => {
    dispatch(setAuthUser(user))
    toast.success(user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back', {
      description: 'You are signed in to the Client Portal.',
    })
    navigate(location.state?.from?.pathname || '/', { replace: true })
  }, [dispatch, navigate, location.state])
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
