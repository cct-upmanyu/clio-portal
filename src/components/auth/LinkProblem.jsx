import { Link } from 'react-router-dom'
import AuthLayout, { AuthHeading } from './AuthLayout'
import { WarningIcon } from '../ui/icons'
import { linkClass, primaryButtonClass } from './styles'

// An emailed link that can't be used (invalid, already used or expired)
function LinkProblem({ title, message, action, footer }) {
  return (
    <AuthLayout footer={footer}>
      <div className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning max-sm:hidden">
        <WarningIcon className="size-6" />
      </div>
      <AuthHeading title={title}>{message}</AuthHeading>
      {action && <Link to={action.to} className={primaryButtonClass}>{action.label}</Link>}
      <Link to="/login" className={`${linkClass} self-center`}>Back to sign in</Link>
    </AuthLayout>
  )
}

export default LinkProblem
