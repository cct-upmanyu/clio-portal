import {
  CalendarIcon, CheckCircleIcon, CloseIcon, DocumentsIcon, EditIcon, InviteIcon, ResendIcon, ShieldIcon, ShieldOffIcon,
  TaskIcon, UserCheckIcon, UsersIcon, UserXIcon,
} from '../components/ui/icons'

// How each timeline event reads, from its type and the names saved with it (event_type values: see
// activityService.TYPES on the backend). `inMatter`: shown on that matter's own timeline, so the
// matter isn't named again. `viewer`: 'client' gets the client-facing wording.
// Returns { icon, module, text }: `module` picks the colour and label (ACTIVITY_MODULES); `text` is a list
// of strings and { strong } parts, the names and the task or meeting, shown in bold.
const actorName = (event) => event.actor?.name || (event.actor?.type === 'crm' ? 'Zoho CRM' : 'The system')
const subjectName = (event) => event.subject?.name || 'someone'

// Colour and label per module, light and calm so a long timeline stays readable
export const ACTIVITY_MODULES = {
  task: { label: 'Task', badge: 'bg-violet-50 text-violet-600 ring-violet-100' },
  meeting: { label: 'Meeting', badge: 'bg-sky-50 text-sky-600 ring-sky-100' },
  invitation: { label: 'Invitation', badge: 'bg-amber-50 text-amber-600 ring-amber-100' },
  access: { label: 'Access', badge: 'bg-rose-50 text-rose-600 ring-rose-100' },
  security: { label: 'Security', badge: 'bg-emerald-50 text-emerald-600 ring-emerald-100' },
  document: { label: 'Document', badge: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
  other: { label: 'Update', badge: 'bg-subtle text-body ring-line' },
}

const strong = (value) => ({ strong: value })
const named = (value, fallback) => (value ? [strong(value)] : [fallback])

export function describeActivity(event, { inMatter = false, viewer = 'firm' } = {}) {
  const actor = strong(actorName(event))
  const subject = strong(subjectName(event))
  const matter = !inMatter && event.matter?.label ? event.matter.label : null
  const onMatter = matter ? [` · ${matter}`] : []
  const toMatter = matter ? [` to ${matter}`] : []
  const fromMatter = matter ? [` from ${matter}`] : []
  const title = event.details?.title

  switch (event.type) {
    case 'invitation.sent':
      if (!event.matter) return { icon: InviteIcon, module: 'invitation', text: [actor, ' invited ', subject, ' as an admin'] }
      return { icon: InviteIcon, module: 'invitation', text: [actor, ' invited ', subject, ...toMatter] }
    case 'invitation.resent':
      return { icon: ResendIcon, module: 'invitation', text: [actor, ' sent ', subject, ' a new invitation', ...onMatter] }
    case 'invitation.accepted':
      if (!event.matter) return { icon: UserCheckIcon, module: 'invitation', text: [subject, ' accepted the invitation and activated their account'] }
      if (viewer === 'client') return { icon: UserCheckIcon, module: 'invitation', text: [subject, ' joined this matter'] }
      return { icon: UserCheckIcon, module: 'invitation', text: [subject, ' accepted the invitation', ...toMatter] }
    case 'matter.contact_removed':
      return { icon: UserXIcon, module: 'access', text: [actor, ' removed ', subject, ...fromMatter] }
    case 'user.access_disabled':
      return { icon: UserXIcon, module: 'access', text: [actor, ' disabled ', subject, '’s access'] }
    case 'user.access_enabled':
      return { icon: UsersIcon, module: 'access', text: [actor, ' restored ', subject, '’s access'] }
    case 'user.mfa_enabled':
      return { icon: ShieldIcon, module: 'security', text: [subject, ' set up 2FA'] }
    case 'user.mfa_required':
      return { icon: ShieldIcon, module: 'security', text: [actor, ' made 2FA required for ', subject] }
    case 'user.mfa_not_required':
      return { icon: ShieldOffIcon, module: 'security', text: [actor, ' stopped requiring 2FA for ', subject] }
    case 'user.mfa_reset':
      return { icon: ShieldOffIcon, module: 'security', text: [actor, ' reset ', subject, '’s 2FA'] }
    case 'document.uploaded':
      return { icon: DocumentsIcon, module: 'document', text: [actor, ' uploaded ', ...named(event.details?.documentName, 'a document'), ...onMatter] }
    case 'event.created':
      return { icon: CalendarIcon, module: 'meeting', text: [actor, ' scheduled the meeting ', ...named(title, ''), ...onMatter] }
    case 'event.updated':
      return { icon: EditIcon, module: 'meeting', text: [actor, ' updated the meeting ', ...named(title, ''), ...onMatter] }
    case 'event.completed':
      return { icon: CheckCircleIcon, module: 'meeting', text: [actor, ' marked the meeting ', ...named(title, ''), ' as held', ...onMatter] }
    case 'event.cancelled':
      return { icon: CloseIcon, module: 'meeting', text: [actor, ' cancelled the meeting ', ...named(title, ''), ...onMatter] }
    case 'task.created':
      return { icon: TaskIcon, module: 'task', text: [actor, ' created the task ', ...named(title, ''), ...onMatter] }
    case 'task.updated':
      return { icon: EditIcon, module: 'task', text: [actor, ' updated the task ', ...named(title, ''), ...onMatter] }
    case 'task.completed':
      // An admin marking it done for clients reads differently from a client finishing their own
      if (event.details?.onBehalfOf) return { icon: CheckCircleIcon, module: 'task', text: [actor, ' marked the task ', ...named(title, ''), ' as done', ...onMatter] }
      return { icon: CheckCircleIcon, module: 'task', text: [actor, ' completed the task ', ...named(title, ''), ...onMatter] }
    case 'task.reopened':
      return { icon: ResendIcon, module: 'task', text: [actor, ' reopened the task ', ...named(title, ''), ...onMatter] }
    case 'task.cancelled':
      return { icon: CloseIcon, module: 'task', text: [actor, ' cancelled the task ', ...named(title, ''), ...onMatter] }
    default:
      return { icon: CheckCircleIcon, module: 'other', text: [event.type] }
  }
}
