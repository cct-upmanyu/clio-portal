import LinkProblem from './LinkProblem'

const PROBLEMS = {
  INVALID: { title: 'This invitation isn’t valid', message: 'The link is incomplete or has been replaced by a newer invitation. Check your inbox for the latest one.' },
  USED: { title: 'Invitation already accepted', message: 'Your account is set up. Sign in with your email to continue.' },
  EXPIRED: { title: 'This invitation has expired', message: 'For your security, invitations only work for a limited time.' },
}

const FOOTER = "Need a new invitation? Contact your attorney's office and they'll send you a fresh link."

function InviteProblem({ reason }) {
  return <LinkProblem {...(PROBLEMS[reason] || PROBLEMS.INVALID)} footer={reason === 'USED' ? undefined : FOOTER} />
}

export default InviteProblem
