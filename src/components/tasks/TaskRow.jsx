import { AlertIcon, CheckCircleIcon, CircleIcon } from '../ui/icons'
import { taskStatus } from '../../utils/tasks'

const TONES = {
  completed: { icon: CheckCircleIcon, iconClass: 'text-success', pill: 'bg-success-soft text-success' },
  overdue: { icon: AlertIcon, iconClass: 'text-danger', pill: 'bg-danger-soft text-danger' },
  outstanding: { icon: CircleIcon, iconClass: 'text-muted', pill: 'bg-subtle text-body' },
}

function TaskRow({ task }) {
  const { tone, label } = taskStatus(task)
  const { icon: Icon, iconClass, pill } = TONES[tone]

  return (
    <li className="flex items-start gap-3 py-3.5">
      <Icon className={`mt-px size-5 shrink-0 ${iconClass}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`text-sm font-medium ${tone === 'completed' ? 'text-muted' : ''}`}>{task.title}</span>
          {task.description && <span className="text-[13px] leading-normal text-muted">{task.description}</span>}
        </div>
        <span className={`self-start whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>{label}</span>
      </div>
    </li>
  )
}

export default TaskRow
