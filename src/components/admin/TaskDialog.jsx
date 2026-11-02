import { useEffect, useId, useRef, useState } from 'react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import MultiSelect from '../ui/MultiSelect'
import { TaskIcon } from '../ui/icons'
import { inputClass, inputErrorClass, labelClass } from '../auth/styles'

// The same values as Zoho CRM's task priority
const PRIORITIES = ['Highest', 'High', 'Normal', 'Low', 'Lowest']

const emptyForm = { subject: '', description: '', dueDate: '', priority: 'Normal', assigneeIds: [] }
const fromTask = (task) => ({
  subject: task.title || '',
  description: task.description || '',
  dueDate: task.due || '',
  priority: task.priority || 'Normal',
  assigneeIds: task.assignees.map((a) => a.userId),
})

// Server field names → this form's
const SERVER_FIELDS = { subject: 'subject', description: 'description', dueDate: 'dueDate', priority: 'priority', assigneeIds: 'assigneeIds' }

function Field({ id, label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-[13px] text-danger">{error}</p>}
    </div>
  )
}

// New task, or editing one (`task`). Assignees: the matter's clients who've accepted it (`clients`).
// onSave(body) resolves { saved: true } or { fieldErrors } from the server.
function TaskDialog({ open, task, clients, onSave, onClose }) {
  const id = useId()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Filled only when the dialog opens: refills while it's open (e.g. as the task list re-renders during
  // the save) would wipe what's typed. It stays filled until the save succeeds and the dialog closes.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      // A new task on a matter with one client is for them
      setForm(task ? fromTask(task) : { ...emptyForm, assigneeIds: clients.length === 1 ? [clients[0].userId] : [] })
      setErrors({})
    }
    wasOpen.current = open
  }, [open, task, clients])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
    if (!form.subject.trim()) found.subject = 'Enter a subject'
    if (form.assigneeIds.length === 0) found.assigneeIds = 'Choose who should do it'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setSaving(true)
    try {
      const result = await onSave({
        subject: form.subject.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || null,
        priority: form.priority,
        assigneeIds: form.assigneeIds,
      })
      if (result.saved) onClose()
      else if (result.fieldErrors) {
        setErrors(Object.fromEntries(Object.entries(result.fieldErrors).filter(([key]) => SERVER_FIELDS[key]).map(([key, msg]) => [SERVER_FIELDS[key], msg])))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={task ? 'Edit task' : 'New task'}
      description="Clients see their tasks in the portal and mark them done there."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form={`${id}-form`} icon={TaskIcon} loading={saving}>{task ? 'Save changes' : 'Create task'}</Button>
        </>
      )}
    >
      <form id={`${id}-form`} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id={`${id}-subject`} label="Subject" error={errors.subject}>
          <input type="text" maxLength={255} autoComplete="off" {...fieldProps('subject')} />
        </Field>
        <Field id={`${id}-assignees`} label="Assign to" error={errors.assigneeIds}>
          {clients.length === 0 ? (
            <p className="text-[13px] text-muted">No client has accepted this matter yet. Tasks can be assigned once one has.</p>
          ) : (
            <MultiSelect
              id={`${id}-assignees`}
              label="Assign to"
              options={clients.map((c) => ({ value: c.userId, label: c.name }))}
              value={form.assigneeIds}
              onChange={(assigneeIds) => setForm((prev) => ({ ...prev, assigneeIds }))}
              placeholder="Choose clients"
              allLabel="All clients on this matter"
              invalid={Boolean(errors.assigneeIds)}
              describedBy={errors.assigneeIds ? `${id}-assignees-error` : undefined}
            />
          )}
        </Field>
        <Field id={`${id}-description`} label="Details (optional)" error={errors.description}>
          <textarea rows={3} maxLength={5000} {...fieldProps('description')} className={`${fieldProps('description').className} min-h-20 py-2`} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={`${id}-dueDate`} label="Due date (optional)" error={errors.dueDate}>
            <input type="date" {...fieldProps('dueDate')} />
          </Field>
          <Field id={`${id}-priority`} label="Priority" error={errors.priority}>
            <select {...fieldProps('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

      </form>
    </Modal>
  )
}

export default TaskDialog
