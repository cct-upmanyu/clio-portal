import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { toastAccountDisabled } from '../../utils/accountProblem'

// An emailed link opened for a disabled account: say so in a toast and go to sign in
function AccountDisabledRedirect() {
  useEffect(() => {
    toastAccountDisabled()
  }, [])
  return <Navigate to="/login" replace />
}

export default AccountDisabledRedirect
