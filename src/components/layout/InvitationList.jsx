import Button from '../ui/Button'
import { firm } from '../../data/sampleData'
import { useAcceptInvitation } from '../../hooks/useAcceptInvitation'

// Matters the client is invited to but hasn't accepted yet, each with its own Accept
function InvitationList({ invitations, onAccepted }) {
  const { accept, acceptingId } = useAcceptInvitation()

  const handleAccept = async (matter) => {
    if (await accept(matter)) onAccepted?.(matter)
  }

  return (
    <ul className="flex flex-col divide-y divide-divider">
      {invitations.map((matter) => (
        <li key={matter.id} className="flex items-center gap-3 px-3 py-2.5">
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-ink">{matter.label}</span>
            <span className="truncate text-xs text-muted">{matter.firmName || firm.name}</span>
          </span>
          <Button
            size="sm"
            onClick={() => handleAccept(matter)}
            loading={acceptingId === String(matter.id)}
            disabled={Boolean(acceptingId)}
            aria-label={`Accept invitation to ${matter.label}`}
          >
            Accept
          </Button>
        </li>
      ))}
    </ul>
  )
}

export default InvitationList
