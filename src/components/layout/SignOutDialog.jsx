import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../ui/ConfirmDialog'
import { SignOutIcon } from '../ui/icons'

function SignOutDialog({ open, onClose }) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    // TODO: POST /auth/logout and clear auth state
    onClose()
    navigate('/login')
  }

  return (
    <ConfirmDialog
      open={open}
      icon={SignOutIcon}
      title="Sign out of the Client Portal?"
      confirmLabel="Sign out"
      onConfirm={handleSignOut}
      onCancel={onClose}
    >
      You'll need to sign in again to view your matters.
    </ConfirmDialog>
  )
}

export default SignOutDialog
