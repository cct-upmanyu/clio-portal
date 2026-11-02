import {
  CalendarIcon, CheckCircleIcon, DocumentsIcon, InviteIcon, ShieldIcon, TaskIcon, UsersIcon, UserXIcon,
} from '../components/ui/icons'

// How each timeline event reads, from its type and the names saved with it (event_type values: see
// activityService.TYPES on the backend). `inMatter`: shown on that matter's own timeline, so the
// matter isn't named again. `viewer`: 'client' gets the client-facing wording.
const actorName = (event) => event.actor?.name || (event.actor?.type === 'crm' ? 'Zoho CRM' : 'The system')
const subjectName = (event) => event.subject?.name || 'someone'

export function describeActivity(event, { inMatter = false, viewer = 'firm' } = {}) {
  const actor = actorName(event)
  const subject = subjectName(event)
  const onMatter = !inMatter && event.matter?.label ? ` · ${event.matter.label}` : ''
  const toMatter = !inMatter && event.matter?.label ? ` to ${event.matter.label}` : ''
  const fromMatter = !inMatter && event.matter?.label ? ` from ${event.matter.label}` : ''
  const title = event.details?.title

  switch (event.type) {
    case 'invitation.sent':
      if (!event.matter) return { icon: InviteIcon, text: `${actor} invited ${subject} as an admin` }
      return { icon: InviteIcon, text: `${actor} invited ${subject}${toMatter}` }
    case 'invitation.resent':
      return { icon: InviteIcon, text: `${actor} sent ${subject} a new invitation${onMatter}` }
    case 'invitation.accepted':
      if (!event.matter) return { icon: CheckCircleIcon, text: `${subject} accepted the invitation and activated their account` }
      if (viewer === 'client') return { icon: CheckCircleIcon, text: `${subject} joined this matter` }
      return { icon: CheckCircleIcon, text: `${subject} accepted the invitation${toMatter}` }
    case 'matter.contact_removed':
      return { icon: UserXIcon, text: `${actor} removed ${subject}${fromMatter}` }
    case 'user.access_disabled':
      return { icon: UserXIcon, text: `${actor} disabled ${subject}'s access` }
    case 'user.access_enabled':
      return { icon: UsersIcon, text: `${actor} restored ${subject}'s access` }
    case 'user.mfa_enabled':
      return { icon: ShieldIcon, text: `${subject} set up 2FA` }
    case 'user.mfa_reset':
      return { icon: ShieldIcon, text: `${actor} reset ${subject}'s 2FA` }
    case 'document.uploaded':
      return { icon: DocumentsIcon, text: `${actor} uploaded ${event.details?.documentName || 'a document'}${onMatter}` }
    case 'event.created':
      return { icon: CalendarIcon, text: `${title || 'An event'} was scheduled${onMatter}` }
    case 'event.completed':
      return { icon: CalendarIcon, text: `${title || 'An event'} was completed${onMatter}` }
    case 'task.completed':
      return { icon: TaskIcon, text: `${actor} completed ${title ? `"${title}"` : 'a task'}${onMatter}` }
    default:
      return { icon: CheckCircleIcon, text: event.type }
  }
}
