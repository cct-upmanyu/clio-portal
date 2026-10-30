import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../ui/ConfirmDialog'
import { SignOutIcon } from '../ui/icons'
import { useLogoutMutation } from '../../redux/api/authApi'
import { clearAuth } from '../../redux/slices/authSlice'
import { toast } from '../../utils/toast'

// Logout usually answers instantly; keep "Signing out…" up long enough to be seen
const MIN_LOADING_MS = 800

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function SignOutDialog({ open, onClose }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [logout] = useLogoutMutation()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await Promise.all([logout().unwrap().catch(() => {}), wait(MIN_LOADING_MS)])
    // Cleared here rather than in the mutation, or the route guard would close this dialog mid-spinner
    dispatch(clearAuth())
    setSigningOut(false)
    onClose()
    toast.success('Signed out', { description: 'You have been signed out securely.' })
    navigate('/login', { replace: true })
  }

  return (
    <ConfirmDialog
      open={open}
      icon={SignOutIcon}
      title="Sign out of the Client Portal?"
      confirmLabel="Sign out"
      loading={signingOut}
      loadingLabel="Signing out…"
      onConfirm={handleSignOut}
      onCancel={onClose}
    >
      You'll need to sign in again to view your matters.
    </ConfirmDialog>
  )
}

export default SignOutDialog
