import { useEffect, useId, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import MultiSelect from '../ui/MultiSelect'
import { CalendarIcon } from '../ui/icons'
import { inputClass, inputErrorClass, labelClass } from '../auth/styles'
import { useGetAdminUsersQuery } from '../../redux/api/adminApi'

// The same values as Zoho CRM's meeting provider
const PROVIDERS = ['Microsoft Teams', 'Zoho Meeting', 'RingCentral Video', 'Zoom', 'Others']
const HOUR = 60 * 60 * 1000

// <input type="datetime-local"> works in the browser's own time: "2026-11-12T10:00"
const toLocalInput = (value) => {
  const d = new Date(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const nextHour = () => {
  const d = new Date(Date.now() + HOUR)
  d.setMinutes(0, 0, 0)
  return d
}

const emptyForm = (hostUserId) => {
  const start = nextHour()
  return {
    title: '', description: '', locationType: 'in_person', venue: '', provider: 'Zoom', meetingLink: '',
    startAt: toLocalInput(start), endAt: toLocalInput(start.getTime() + HOUR), hostUserId: hostUserId || '', participantIds: [],
  }
}
const fromEvent = (event) => ({
  title: event.title || '',
  description: event.description || '',
  locationType: event.locationType || 'in_person',
  venue: event.venue || '',
  provider: event.provider || 'Zoom',
  meetingLink: event.meetingLink || '',
  startAt: event.startAt ? toLocalInput(event.startAt) : '',
  endAt: event.endAt ? toLocalInput(event.endAt) : '',
  hostUserId: event.hostUserId || '',
  participantIds: event.participants.map((p) => p.userId),
})

const SERVER_FIELDS = ['title', 'description', 'locationType', 'venue', 'provider', 'meetingLink', 'startAt', 'endAt', 'hostUserId', 'participantIds']

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}

// New meeting, or editing one (`event`). Participants: the matter's clients who've accepted it.
// onSave(body) resolves { saved: true } or { fieldErrors } from the server.
function EventDialog({ open, event, clients, onSave, onClose }) {
  const id = useId()
  const myId = useSelector((state) => String(state.auth.user?.id ?? ''))
  const { data: usersData } = useGetAdminUsersQuery(undefined, { skip: !open })
  const hosts = (usersData?.users ?? []).filter((u) => u.roleName !== 'Client' && u.status === 'active')
  const [form, setForm] = useState(() => emptyForm(myId))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Filled only when the dialog opens, so re-renders during the save don't wipe what's typed
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      setForm(event ? fromEvent(event) : { ...emptyForm(myId), participantIds: clients.map((c) => c.userId) })
      setErrors({})
    }
    wasOpen.current = open
  }, [open, event, clients, myId])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  // Moving the start keeps the meeting's length
  const setStart = (e) => {
    const value = e.target.value
    setForm((prev) => {
      const length = new Date(prev.endAt) - new Date(prev.startAt)
      const end = value && length > 0 ? toLocalInput(new Date(value).getTime() + length) : prev.endAt
      return { ...prev, startAt: value, endAt: end }
    })
  }

  const fieldProps = (key) => ({
    id: `${id}-${key}`,
    value: form[key],
    onChange: set(key),
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
    className: errors[key] ? inputErrorClass : inputClass,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!form.title.trim()) found.title = 'Enter a title'
    if (!form.startAt) found.startAt = 'Choose when it starts'
    if (!form.endAt) found.endAt = 'Choose when it ends'
    else if (form.startAt && new Date(form.endAt) <= new Date(form.startAt)) found.endAt = 'Must be after the start'
    if (form.locationType === 'online' && form.meetingLink.trim() && !/^https?:\/\/\S+$/i.test(form.meetingLink.trim())) {
      found.meetingLink = 'Use a full link starting with https://'
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSaving(true)
    try {
      const online = form.locationType === 'online'
      const result = await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        locationType: form.locationType,
        venue: form.venue.trim(),
        ...(online ? { provider: form.provider, meetingLink: form.meetingLink.trim() } : {}),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        ...(form.hostUserId ? { hostUserId: form.hostUserId } : {}),
        participantIds: form.participantIds,
      })
      if (result.saved) onClose()
      else if (result.fieldErrors) {
        setErrors(Object.fromEntries(Object.entries(result.fieldErrors).filter(([key]) => SERVER_FIELDS.includes(key))))
      }
    } finally {
      setSaving(false)
    }
  }

  const online = form.locationType === 'online'

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={event ? 'Edit meeting' : 'New meeting'}
      description="Participants see it in the portal, with the time in their own time zone."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={`${id}-form`} icon={CalendarIcon} loading={saving}>{event ? 'Save changes' : 'Create meeting'}</Button>
        </>
      )}
    >
      <form id={`${id}-form`} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id={`${id}-title`} label="Title" error={errors.title}>
          <input type="text" maxLength={255} autoComplete="off" {...fieldProps('title')} />
        </Field>

        <Field id={`${id}-participants`} label="Participants" error={errors.participantIds}>
          {clients.length === 0 ? (
            <p className="text-[13px] text-muted">No client has accepted this matter yet, so only the firm will see this meeting.</p>
          ) : (
            <MultiSelect
              id={`${id}-participants`}
              label="Participants"
              options={clients.map((c) => ({ value: c.userId, label: c.name }))}
              value={form.participantIds}
              onChange={(participantIds) => setForm((prev) => ({ ...prev, participantIds }))}
              placeholder="Choose clients"
              allLabel="All clients on this matter"
              invalid={Boolean(errors.participantIds)}
            />
          )}
        </Field>

        <fieldset className="flex flex-col gap-1.5">
          <legend className={`${labelClass} mb-1.5`}>Where</legend>
          <div role="radiogroup" className="grid w-full grid-cols-2 rounded-lg border border-field p-1 sm:w-72">
            {[['in_person', 'In person'], ['online', 'Online']].map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={form.locationType === value}
                onClick={() => setForm((prev) => ({ ...prev, locationType: value }))}
                className={`h-9 cursor-pointer rounded-md text-sm font-medium ${form.locationType === value ? 'bg-brand text-white' : 'text-body hover:bg-subtle'}`}
              >
                {text}
              </button>
            ))}
          </div>
        </fieldset>

        {online ? (
          <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field id={`${id}-provider`} label="Provider" error={errors.provider}>
              <select {...fieldProps('provider')}>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field id={`${id}-meetingLink`} label="Meeting link (optional)" error={errors.meetingLink}>
              <input type="url" inputMode="url" autoComplete="off" placeholder="https://" {...fieldProps('meetingLink')} />
            </Field>
          </div>
        ) : (
          <Field id={`${id}-venue`} label="Venue (optional)" error={errors.venue}>
            <input type="text" maxLength={255} autoComplete="off" placeholder="Address or room" {...fieldProps('venue')} />
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${id}-startAt`} label="From" error={errors.startAt}>
            <input type="datetime-local" {...fieldProps('startAt')} onChange={setStart} />
          </Field>
          <Field id={`${id}-endAt`} label="To" error={errors.endAt}>
            <input type="datetime-local" min={form.startAt || undefined} {...fieldProps('endAt')} />
          </Field>
        </div>

        <Field id={`${id}-hostUserId`} label="Host" error={errors.hostUserId}>
          <select {...fieldProps('hostUserId')}>
            {!form.hostUserId && <option value="">Choose the host</option>}
            {hosts.map((u) => <option key={u.id} value={String(u.id)}>{[u.firstName, u.lastName].filter(Boolean).join(' ') || u.email}</option>)}
          </select>
        </Field>

        <Field id={`${id}-description`} label="Notes (optional)" error={errors.description}>
          <textarea rows={3} maxLength={5000} {...fieldProps('description')} className={`${fieldProps('description').className} min-h-20 py-2`} />
        </Field>
      </form>
    </Modal>
  )
}

export default EventDialog
