import { useEffect, useId, useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { LockIcon } from '../ui/icons'
import { inputClass, inputErrorClass, labelClass } from '../auth/styles'
import { useUpdateUserMutation } from '../../redux/api/adminApi'
import { isHandledGlobally } from '../../redux/api/baseApi'
import { timezoneGroups } from '../../utils/timezones'
import { salutationOptions } from './salutations'
import { toast } from '../../utils/toast'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIELDS = ['salutation', 'firstName', 'lastName', 'email', 'phone', 'timezone']

const formFor = (user) => ({
  salutation: user?.salutation ?? '',
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  timezone: user?.timezone ?? '',
})

const validate = (form) => {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'Enter a first name'
  if (!form.lastName.trim()) errors.lastName = 'Enter a last name'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address'
  return errors
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {error ? <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p> : hint}
    </div>
  )
}

// Edits a user's details. `isSelf`: your own row, where the email can't be changed (the backend refuses too).
function EditUserDialog({ user, isSelf, onClose }) {
  const id = useId()
  const [updateUser, { isLoading: saving }] = useUpdateUserMutation()
  const [form, setForm] = useState(() => formFor(user))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setForm(formFor(user))
      setErrors({})
    }
  }, [user])

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
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
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // Only what changed; an empty time zone stays unset (the portal then uses their browser's)
    const original = formFor(user)
    const changes = Object.fromEntries(FIELDS
      .filter((key) => form[key].trim() !== original[key].trim())
      .filter((key) => !(key === 'email' && isSelf))
      .filter((key) => !(key === 'timezone' && !form.timezone))
      .map((key) => [key, key === 'email' ? form.email.trim().toLowerCase() : form[key].trim()]))
    if (Object.keys(changes).length === 0) return onClose()

    try {
      await updateUser({ id: user.id, ...changes }).unwrap()
      toast.success(isSelf ? 'Your details were updated' : 'User updated', {
        description: changes.email ? `${changes.email} now signs in with this address. They'll need to sign in again.` : undefined,
      })
      onClose()
    } catch (err) {
      if (isHandledGlobally(err)) return
      const details = err?.data?.details
      if (details && typeof details === 'object') {
        setErrors(Object.fromEntries(Object.entries(details).filter(([key]) => FIELDS.includes(key))))
      }
      if (err?.data?.code !== 'VALIDATION_FAILED') toast.error("Couldn't update this user", { description: err?.data?.message || 'Please try again.' })
    }
  }

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      dismissible={!saving}
      title={isSelf ? 'Edit your details' : 'Edit user details'}
      description={user?.email}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={`${id}-form`} loading={saving}>Save changes</Button>
        </>
      )}
    >
      <form id={`${id}-form`} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)_minmax(0,1fr)]">
          <Field id={`${id}-salutation`} label="Salutation" error={errors.salutation}>
            <select {...fieldProps('salutation')}>
              <option value="">None</option>
              {salutationOptions(user?.salutation).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field id={`${id}-firstName`} label="First name" error={errors.firstName}>
            <input type="text" autoComplete="off" {...fieldProps('firstName')} />
          </Field>
          <Field id={`${id}-lastName`} label="Last name" error={errors.lastName}>
            <input type="text" autoComplete="off" {...fieldProps('lastName')} />
          </Field>
        </div>

        <Field
          id={`${id}-email`}
          label="Email"
          error={errors.email}
          hint={isSelf
            ? <p className="flex items-center gap-1.5 text-[13px] text-muted"><LockIcon className="size-3.5" />You can't change your own email. Ask another admin.</p>
            : <p className="text-[13px] text-muted">Changing it signs them out; they sign in again with the new address.</p>}
        >
          <input
            type="email"
            autoComplete="off"
            inputMode="email"
            {...fieldProps('email')}
            disabled={isSelf}
            className={`${fieldProps('email').className} disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted`}
          />
        </Field>

        <Field id={`${id}-phone`} label={<>Phone <span className="font-normal text-muted">(optional)</span></>} error={errors.phone}>
          <input type="tel" autoComplete="off" {...fieldProps('phone')} />
        </Field>

        <Field id={`${id}-timezone`} label="Time zone" error={errors.timezone} hint={<p className="text-[13px] text-muted">Messages, events and emails show times in this time zone.</p>}>
          <select {...fieldProps('timezone')}>
            {!user?.timezone && <option value="">{isSelf ? "Not set (uses your browser's time zone)" : "Not set (uses their browser's time zone)"}</option>}
            {timezoneGroups(user?.timezone).map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </optgroup>
            ))}
          </select>
        </Field>
      </form>
    </Modal>
  )
}

export default EditUserDialog
