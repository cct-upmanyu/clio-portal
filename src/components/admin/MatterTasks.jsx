import { useState } from 'react'
import Button from '../ui/Button'
import ConfirmDialog from '../ui/ConfirmDialog'
import EmptyState from '../ui/EmptyState'
import { AlertIcon, CheckCircleIcon, CircleIcon, EditIcon, ResendIcon, TaskIcon, UserXIcon } from '../ui/icons'
import RowMenu from './RowMenu'
import TaskDialog from './TaskDialog'
import { isHandledGlobally } from '../../redux/api/baseApi'
import {
  useCancelTaskMutation, useCompleteTaskMutation, useCreateTaskMutation, useGetMatterTasksQuery, useReopenTaskMutation, useUpdateTaskMutation,
} from '../../redux/api/taskApi'
import { sortTasks, taskStatus } from '../../utils/tasks'
import { toast } from '../../utils/toast'

const TONES = {
  completed: { icon: CheckCircleIcon, iconClass: 'text-success', pill: 'bg-success-soft text-success' },
  overdue: { icon: AlertIcon, iconClass: 'text-danger', pill: 'bg-danger-soft text-danger' },
  outstanding: { icon: CircleIcon, iconClass: 'text-muted', pill: 'bg-subtle text-body' },
}
const PRIORITY_PILL = {
  Highest: 'bg-danger-soft text-danger', High: 'bg-warning-soft text-warning', Normal: '', Low: 'bg-subtle text-muted', Lowest: 'bg-subtle text-muted',
}

function Assignees({ assignees }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {assignees.map((a) => (
        <span
          key={a.userId}
          title={a.status === 'completed' ? `Done${a.completedBy ? ` (marked by ${a.completedBy})` : ''}` : 'Not done yet'}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${a.status === 'completed' ? 'border-success-soft bg-success-soft text-success' : 'border-line bg-white text-body'}`}
        >
          {a.status === 'completed' ? <CheckCircleIcon className="size-3" /> : <CircleIcon className="size-3" />}
          {a.name}
        </span>
      ))}
    </span>
  )
}

function TaskItem({ task, onEdit, onComplete, onReopen, onCancel }) {
  const { tone, label } = taskStatus(task)
  const { icon: Icon, iconClass, pill } = TONES[tone]
  const open = task.status !== 'completed'
  const openAssignees = task.assignees.filter((a) => a.status !== 'completed')
  const doneCount = task.assignees.length - openAssignees.length

  const items = open
    ? [
      { label: 'Edit', icon: EditIcon, onSelect: () => onEdit(task) },
      { label: 'Mark done for everyone', icon: CheckCircleIcon, onSelect: () => onComplete(task) },
      ...(task.assignees.length > 1 ? openAssignees.map((a) => ({ label: `Mark done for ${a.name}`, icon: CheckCircleIcon, onSelect: () => onComplete(task, a) })) : []),
      ...(doneCount > 0 ? [{ label: 'Reopen for everyone', icon: ResendIcon, onSelect: () => onReopen(task) }] : []),
      { label: 'Cancel task', icon: UserXIcon, tone: 'danger', onSelect: () => onCancel(task) },
    ]
    : [
      { label: 'Reopen for everyone', icon: ResendIcon, onSelect: () => onReopen(task) },
      { label: 'Cancel task', icon: UserXIcon, tone: 'danger', onSelect: () => onCancel(task) },
    ]

  return (
    <li className="flex items-start gap-3 py-3.5">
      <Icon className={`mt-px size-5 shrink-0 ${iconClass}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-medium ${tone === 'completed' ? 'text-muted' : ''}`}>{task.title}</span>
          {PRIORITY_PILL[task.priority] && <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_PILL[task.priority]}`}>{task.priority}</span>}
        </div>
        {task.description && <span className="whitespace-pre-wrap text-[13px] leading-normal text-muted">{task.description}</span>}
        <Assignees assignees={task.assignees} />
        <span className="text-xs text-muted">
          {task.assignees.length > 1 ? `${doneCount} of ${task.assignees.length} done` : ''}
          {task.assignees.length > 1 && task.assignedBy ? ' · ' : ''}
          {task.assignedBy ? `Assigned by ${task.assignedBy}` : ''}
          {task.source === 'crm' ? ' · From Zoho CRM' : ''}
        </span>
      </div>
      <span className={`shrink-0 self-start whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>{label}</span>
      <RowMenu label={`Actions for ${task.title}`} items={items} />
    </li>
  )
}

// A matter's tasks for the firm: create them for its clients, edit, complete for them, reopen, cancel
function MatterTasks({ matter }) {
  const { data: tasks = [], isLoading, isError, refetch } = useGetMatterTasksQuery(matter.crmMatterId, { refetchOnFocus: true })
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [completeTask] = useCompleteTaskMutation()
  const [reopenTask] = useReopenTaskMutation()
  const [cancelTask, { isLoading: cancelling }] = useCancelTaskMutation()
  const [dialog, setDialog] = useState({ open: false, task: null })
  const [cancelTarget, setCancelTarget] = useState(null)

  // Only clients who've accepted can see the matter, so only they can be given tasks
  const clients = matter.contacts.filter((c) => c.invitation === 'accepted')

  const failed = (title) => (err) => {
    if (!isHandledGlobally(err)) toast.error(title, { description: err?.data?.message || 'Please try again.' })
  }

  const save = async (body) => {
    try {
      if (dialog.task) await updateTask({ taskId: dialog.task.id, ...body }).unwrap()
      else await createTask({ crmMatterId: matter.crmMatterId, ...body }).unwrap()
      toast.success(dialog.task ? 'Task updated' : 'Task created', { description: body.subject })
      return { saved: true }
    } catch (err) {
      const details = err?.data?.details
      if (details && typeof details === 'object' && Object.keys(details).length > 0) return { saved: false, fieldErrors: details }
      failed(dialog.task ? "Couldn't update the task" : "Couldn't create the task")(err)
      return { saved: false }
    }
  }

  const complete = (task, assignee) => completeTask({ taskId: task.id, userIds: assignee ? [assignee.userId] : undefined }).unwrap()
    .then(() => toast.success(assignee ? `Marked done for ${assignee.name}` : 'Task marked done', { description: task.title }))
    .catch(failed("Couldn't complete the task"))
  const reopen = (task) => reopenTask({ taskId: task.id }).unwrap()
    .then(() => toast.success('Task reopened', { description: task.title }))
    .catch(failed("Couldn't reopen the task"))
  const cancel = () => cancelTask(cancelTarget.id).unwrap()
    .then(() => {
      toast.success('Task cancelled', { description: cancelTarget.title })
      setCancelTarget(null)
    })
    .catch(failed("Couldn't cancel the task"))

  const canAdd = matter.status !== 'Closed'

  return (
    <div className="flex flex-col gap-2 py-2">
      {canAdd && (
        <div className="flex justify-end">
          <Button icon={TaskIcon} onClick={() => setDialog({ open: true, task: null })} disabled={clients.length === 0}
            title={clients.length === 0 ? 'A client needs to accept this matter first' : undefined}>
            New task
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-sm text-muted">Loading tasks…</p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted">
          Couldn&apos;t load the tasks.
          <Button variant="secondary" size="sm" onClick={refetch}>Try again</Button>
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={TaskIcon} title="No tasks">
          {clients.length === 0
            ? 'Once a client accepts this matter, you can give them tasks here.'
            : 'Create a task to ask the client for something, like signing a document or sending a file.'}
        </EmptyState>
      ) : (
        <ul aria-label="Tasks" className="flex flex-col divide-y divide-divider">
          {sortTasks(tasks).map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={(t) => setDialog({ open: true, task: t })}
              onComplete={complete}
              onReopen={reopen}
              onCancel={setCancelTarget}
            />
          ))}
        </ul>
      )}

      <TaskDialog open={dialog.open} task={dialog.task} clients={clients} onSave={save} onClose={() => setDialog({ open: false, task: null })} />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        icon={UserXIcon}
        tone="danger"
        title={cancelTarget ? `Cancel "${cancelTarget.title}"?` : ''}
        confirmLabel="Cancel task"
        cancelLabel="Keep it"
        loading={cancelling}
        loadingLabel="Cancelling…"
        onConfirm={cancel}
        onCancel={() => setCancelTarget(null)}
      >
        It disappears from the clients&apos; portal. It stays in this matter&apos;s activity.
      </ConfirmDialog>
    </div>
  )
}

export default MatterTasks
