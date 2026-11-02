import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthLayout, { AuthHeading } from '../../components/auth/AuthLayout'
import { primaryButtonClass, secondaryButtonClass } from '../../components/auth/styles'
import SignOutDialog from '../../components/layout/SignOutDialog'
import Spinner from '../../components/ui/Spinner'
import { BriefcaseIcon, SignOutIcon, WarningIcon } from '../../components/ui/icons'
import { firm } from '../../data/sampleData'
import { useAcceptInvitation } from '../../hooks/useAcceptInvitation'
import { useVerifyMatterInvitationQuery } from '../../redux/api/matterApi'
import { isHandledGlobally } from '../../redux/api/baseApi'

const matterLabel = (matter) => [matter?.number, matter?.name].filter(Boolean).join(' · ')

// The link in a "You've been added to a matter" email. RequireAuth has already signed the user in
// (with MFA); the user then chooses to accept, and the portal opens on that matter.
function MatterInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading } = useVerifyMatterInvitationQuery(token)
  const { accept, acceptingId } = useAcceptInvitation()
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const signOut = (
    <>
      <button type="button" onClick={() => setConfirmSignOut(true)} className={secondaryButtonClass}>
        <SignOutIcon className="size-[18px]" />
        Sign out
      </button>
      <SignOutDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} />
    </>
  )

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center gap-3 py-6 text-brand">
          <Spinner className="size-6" />
          <span className="text-[15px] font-medium text-ink">Checking your invitation…</span>
        </div>
      </AuthLayout>
    )
  }

  if (error || !data?.matter) {
    const message = error && isHandledGlobally(error)
      ? "We couldn't check the invitation just now. Please open the link again in a moment."
      : error?.data?.message || "This invitation isn't valid. Ask your attorney's office to send a new one."
    return (
      <AuthLayout>
        <div className="flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
          <WarningIcon className="size-6" />
        </div>
        <AuthHeading title="We couldn't open this invitation">{message}</AuthHeading>
        <Link to="/" replace className={primaryButtonClass}>Go to your portal</Link>
        {signOut}
      </AuthLayout>
    )
  }

  const matter = { ...data.matter, label: matterLabel(data.matter) || 'this matter' }
  const accepting = acceptingId === String(matter.id)

  const handleAccept = async () => {
    if (await accept(matter)) navigate('/', { replace: true })
  }

  return (
    <AuthLayout>
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <BriefcaseIcon className="size-6" />
      </div>
      <AuthHeading title={data.accepted ? "You've already accepted this invitation" : "You've been invited to a matter"}>
        {data.accepted
          ? 'This matter is already in your Client Portal.'
          : `${matter.firmName || firm.name} has added you to this matter. Accept to see it in your Client Portal.`}
      </AuthHeading>

      <div className="flex flex-col gap-0.5 rounded-lg border border-line px-4 py-3">
        <span className="text-[15px] font-semibold">{matter.label}</span>
        <span className="text-[13px] text-muted">{matter.firmName || firm.name}</span>
      </div>

      <button type="button" onClick={handleAccept} disabled={accepting} className={primaryButtonClass}>
        {accepting && <Spinner />}
        {data.accepted ? 'Open this matter' : accepting ? 'Accepting…' : 'Accept invitation'}
      </button>
      {data.accepted ? signOut : <Link to="/" replace className={secondaryButtonClass}>Not now</Link>}
    </AuthLayout>
  )
}

export default MatterInvite
