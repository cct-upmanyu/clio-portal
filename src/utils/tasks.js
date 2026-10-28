import { daysAgo, formatDate } from './dates'

// Display state for a task: tone drives icon/pill colors
export function taskStatus(task) {
  if (task.status === 'completed') {
    return { tone: 'completed', label: `Completed ${formatDate(task.completedAt)}` }
  }
  const diff = daysAgo(task.due)
  if (diff > 0) return { tone: 'overdue', label: `Overdue · due ${formatDate(task.due)}` }
  if (diff === 0) return { tone: 'outstanding', label: 'Due today' }
  if (diff === -1) return { tone: 'outstanding', label: 'Due tomorrow' }
  return { tone: 'outstanding', label: `Due ${formatDate(task.due)}` }
}

// Outstanding first (soonest due on top), then completed (most recent on top)
export function sortTasks(tasks) {
  const outstanding = tasks.filter((t) => t.status !== 'completed').sort((a, b) => new Date(a.due) - new Date(b.due))
  const completed = tasks.filter((t) => t.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
  return [...outstanding, ...completed]
}
