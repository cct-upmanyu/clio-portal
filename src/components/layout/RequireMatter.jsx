import { useState } from 'react'
import AuthLayout, { AuthHeading } from '../auth/AuthLayout'
import { primaryButtonClass, secondaryButtonClass } from '../auth/styles'
import Spinner from '../ui/Spinner'
import { AlertIcon, BriefcaseIcon, RefreshIcon, SignOutIcon } from '../ui/icons'
import { useMatters } from '../../hooks/useMatters'
import InvitationList from './InvitationList'
import SignOutDialog from './SignOutDialog'

// The whole signed-in portal is about a matter: without an accepted one, only pending invitations
// (to accept) and signing out are offered
function RequireMatter({ children }) {
  const { selectedMatter, invitations, isLoading, isError, refetch, isFetching } = useMatters()
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-brand">
        <Spinner className="size-7" />
        <span className="sr-only">Loading your matters</span>
      </div>
    )
  }

  if (selectedMatter) return children

  const signOut = (
    <>
      <button type="button" onClick={() => setConfirmSignOut(true)} className={secondaryButtonClass}>
        <SignOutIcon className="size-[18px]" />
        Sign out
      </button>
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
    </>
  )

  if (isError) {
    return (
      <AuthLayout>
        <div className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
          <AlertIcon className="size-6" />
        </div>
        <AuthHeading title="We couldn't load your matters">
          This is usually temporary. Check your internet connection, then try again.
        </AuthHeading>
        <button type="button" onClick={refetch} disabled={isFetching} className={primaryButtonClass}>
          {isFetching ? <Spinner /> : <RefreshIcon className="size-[18px]" />}
          {isFetching ? 'Trying again…' : 'Try again'}
        </button>
        {signOut}
      </AuthLayout>
    )
  }

  if (invitations.length > 0) {
    return (
      <AuthLayout>
        <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <BriefcaseIcon className="size-6" />
        </div>
        <AuthHeading title={invitations.length === 1 ? "You've been invited to a matter" : "You've been invited to matters"}>
          Accept an invitation to open the matter in your Client Portal.
        </AuthHeading>
        <div className="-mx-3 rounded-lg border border-line">
          <InvitationList invitations={invitations} />
        </div>
        {signOut}
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex size-12 items-center justify-center rounded-xl bg-subtle text-body">
        <BriefcaseIcon className="size-6" />
      </div>
      <AuthHeading title="You don't have any matters">
        Contact your firm for more information.
      </AuthHeading>
      {signOut}
    </AuthLayout>
  )
}

export default RequireMatter
