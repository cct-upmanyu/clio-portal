import { useEffect, useId, useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { InviteIcon } from '../ui/icons'
import { SALUTATIONS } from './salutations'
import { inputClass, inputErrorClass, labelClass } from '../auth/styles'
import { useGetAdminMattersQuery, useGetAdminUsersQuery } from '../../redux/api/adminApi'
import { timezoneGroups } from '../../utils/timezones'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// The backend names the matter field crmMatterId
const SERVER_FIELDS = { salutation: 'salutation', email: 'email', firstName: 'firstName', lastName: 'lastName', role: 'role', crmMatterId: 'crmMatterId', timezone: 'timezone' }

const emptyForm = (clientRoleId, crmMatterId, timezone) => ({
  salutation: '', firstName: '', lastName: '', email: '', role: clientRoleId ?? '', crmMatterId: crmMatterId ?? '', timezone: timezone ?? '', mfaRequired: true,
})

const validate = (form, isClient) => {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'Enter a first name'
  if (!form.lastName.trim()) errors.lastName = 'Enter a last name'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address'
  if (!form.role) errors.role = 'Choose a role'
  if (!form.timezone) errors.timezone = 'Choose their time zone'
  // Only clients are invited to a matter; admins see every matter in the Admin Console
  if (isClient && !form.crmMatterId) errors.crmMatterId = 'Choose the matter to invite them to'
  return errors
}

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}

// A client invitation is for one matter; an email that already has a client account gets an email
// to accept the new matter instead. An admin invitation has no matter.
// crmMatterId: preselects that matter (e.g. opened from a matter's page).
// onInvite(body) resolves { sent: true } or { fieldErrors } from the server.
function InviteUserDialog({ open, onClose, crmMatterId, onInvite }) {
  const id = useId()
  const { data: usersData } = useGetAdminUsersQuery(undefined, { skip: !open })
  const { data: matters = [], isLoading: mattersLoading } = useGetAdminMattersQuery(undefined, { skip: !open })
  const roles = usersData?.roles ?? []
  const clientRoleId = roles.find((role) => role.name === 'Client')?.id
  // The firm's own time zone (DEFAULT_TIMEZONE) unless changed: most clients are local
  const defaultTimezone = usersData?.defaultTimezone

  const [form, setForm] = useState(() => emptyForm(clientRoleId, crmMatterId, defaultTimezone))
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(emptyForm(clientRoleId, crmMatterId, defaultTimezone))
      setErrors({})
    }
  }, [open, crmMatterId, clientRoleId, defaultTimezone])

  const isClient = form.role === clientRoleId

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const fieldProps = (key) => ({
    id: `${id}-${key}`,
    value: form[key],
    onChange: set(key),
    className: errors[key] ? inputErrorClass : inputClass,
    'aria-invalid': Boolean(errors[key]) || undefined,
    'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(form, isClient)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSending(true)
    try {
      const result = await onInvite({
        email: form.email.trim().toLowerCase(),
        ...(form.salutation ? { salutation: form.salutation } : {}),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        timezone: form.timezone,
        mfaRequired: form.mfaRequired,
        ...(isClient ? { crmMatterId: form.crmMatterId } : {}),
      })
      if (result.sent) onClose()
      else if (result.fieldErrors) {
        setErrors(Object.fromEntries(Object.entries(result.fieldErrors).filter(([key]) => SERVER_FIELDS[key]).map(([key, msg]) => [SERVER_FIELDS[key], msg])))
      }
    } finally {
      setSending(false)
    }
  }

  const openMatters = matters.filter((m) => m.status !== 'Closed')

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!sending}
      title={isClient ? "Invite to the Client Portal" : "Invite to the Admin Console"}
      description="They'll get an email to accept the invitation and set up their sign-in."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button type="submit" form={`${id}-form`} icon={InviteIcon} loading={sending} disabled={!clientRoleId}>Send invitation</Button>
        </>
      )}
    >
      <form id={`${id}-form`} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)]">
          <Field id={`${id}-salutation`} label="Salutation" error={errors.salutation}>
            <select {...fieldProps('salutation')}>
              <option value="">None</option>
              {SALUTATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field id={`${id}-firstName`} label="First name" error={errors.firstName}>
            <input type="text" autoComplete="off" {...fieldProps('firstName')} />
          </Field>
          <Field id={`${id}-lastName`} label="Last name" error={errors.lastName}>
            <input type="text" autoComplete="off" {...fieldProps('lastName')} />
          </Field>
        </div>

        <Field id={`${id}-email`} label="Email" error={errors.email}>
          <input type="email" autoComplete="off" inputMode="email" {...fieldProps('email')} />
        </Field>

        <Field id={`${id}-role`} label="Role" error={errors.role}>
          <select {...fieldProps('role')}>
            {roles.length === 0 && <option value="">Loading roles…</option>}
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
        </Field>

        {isClient && (
          <Field id={`${id}-crmMatterId`} label="Matter" error={errors.crmMatterId}>
            <select {...fieldProps('crmMatterId')} disabled={mattersLoading}>
              <option value="">{mattersLoading ? 'Loading matters…' : openMatters.length === 0 ? 'No open matters synced yet' : 'Choose a matter…'}</option>
              {openMatters.map((m) => (
                <option key={m.id} value={m.crmMatterId}>{[m.number, m.name].filter(Boolean).join(' · ')}</option>
              ))}
            </select>
          </Field>
        )}

        <Field id={`${id}-timezone`} label="Time zone" error={errors.timezone}>
          <select {...fieldProps('timezone')}>
            {!form.timezone && <option value="">Loading…</option>}
            {timezoneGroups().map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
            ))}
          </select>
          <p className="text-[13px] text-muted">Messages, events and emails show times in this time zone.</p>
        </Field>

        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm font-medium">
          <input type="checkbox" checked={form.mfaRequired} onChange={set('mfaRequired')} className="size-4 accent-brand" />
          Require 2FA
        </label>
      </form>
    </Modal>
  )
}

export default InviteUserDialog
