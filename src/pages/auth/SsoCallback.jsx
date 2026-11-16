import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import Spinner from '../../components/ui/Spinner'
import { useCompleteZohoSsoMutation } from '../../redux/api/authApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { useContinueSignIn } from '../../hooks/useSignInFlow'
import { toastAccountProblem } from '../../utils/accountProblem'
import { toast } from '../../utils/toast'

// Back from "Sign in with Zoho": the backend put a one-time ticket in the URL fragment. It's exchanged once
// (then removed from the address bar), and sign-in carries on like a password sign-in: the MFA step, or in.
function SsoCallback() {
  const navigate = useNavigate()
  const continueSignIn = useContinueSignIn()
  const [complete] = useCompleteZohoSsoMutation()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const params = new URLSearchParams(window.location.hash.slice(1))
    const ticket = params.get('ticket')
    const from = params.get('from') || '/'
    window.history.replaceState(null, '', window.location.pathname)
    if (!ticket) {
      navigate('/login', { replace: true })
      return
    }
    complete(ticket).unwrap()
      .then(({ data }) => continueSignIn(data, { from: from.startsWith('/') && !from.startsWith('//') ? from : '/' }))
      .catch((err) => {
        if (!toastAccountProblem(err) && !isHandledGlobally(err)) {
          toast.error('Sign in with Zoho failed', { description: err?.data?.message || 'Please try again.' })
        }
        navigate('/login', { replace: true })
      })
  }, [complete, continueSignIn, navigate])

  return (
    <AuthLayout>
      <AuthHeading title="Signing you in">Finishing your Zoho sign-in…</AuthHeading>
      <div className="flex justify-center py-4 text-brand"><Spinner /></div>
    </AuthLayout>
  )
}

export default SsoCallback
