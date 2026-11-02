import { useState } from 'react'
import Button from '../components/ui/Button'
import Section from '../components/ui/Section'
import EmptyState from '../components/ui/EmptyState'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import Pagination from '../components/ui/Pagination'
import Tabs, { TabPanel } from '../components/ui/Tabs'
import TaskRow from '../components/tasks/TaskRow'
import { useMatters } from '../hooks/useMatters'
import { isHandledGlobally } from '../redux/api/baseApi'
import { useCompleteMyTaskMutation, useGetMyTasksQuery } from '../redux/api/taskApi'
import { sortTasks } from '../utils/tasks'
import { toast } from '../utils/toast'

const PAGE_SIZE = 10

const EMPTY = {
  all: { title: 'No tasks yet', text: "When your legal team needs something from you, it'll appear here." },
  completed: { title: 'Nothing completed yet', text: 'Tasks you finish will be listed here.' },
  outstanding: { title: "You're all caught up", text: "No outstanding tasks. We'll let you know when something needs your attention." },
}

function Tasks() {
  const { selectedMatter: matter } = useMatters()
  const [tab, setTab] = useState('all')
  const [page, setPage] = useState(1)
  const { data = [], isLoading } = useGetMyTasksQuery(matter.crmMatterId, { refetchOnFocus: true })
  const [completeMyTask] = useCompleteMyTaskMutation()
  const [completing, setCompleting] = useState(null)

  // The client's own part: other clients on the same task finish theirs separately
  const markDone = async (task) => {
    setCompleting(task.id)
    try {
      await completeMyTask({ crmMatterId: matter.crmMatterId, taskId: task.id }).unwrap()
      toast.success('Task done', { description: task.title })
    } catch (err) {
      if (!isHandledGlobally(err)) toast.error("Couldn't mark it done", { description: err?.data?.message || 'Please try again.' })
    } finally {
      setCompleting(null)
    }
  }

  const tasks = sortTasks(data)
  const byTab = {
    all: tasks,
    completed: tasks.filter((t) => t.status === 'completed'),
    outstanding: tasks.filter((t) => t.status !== 'completed'),
  }
  const visible = byTab[tab]
  // Stay in range if a matter switch leaves fewer tasks than the current page needs
  const currentPage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)))
  const pageTasks = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeTab = (id) => {
    setTab(id)
    setPage(1)
  }

  return (
    <Page>
      <PageHeader title="Tasks" description="Things your legal team needs from you for this matter." />
      <Section className="flex-1 gap-0 pt-2">
        <Tabs
          label="Filter tasks"
          idPrefix="tasks"
          value={tab}
          onChange={changeTab}
          tabs={[
            { id: 'all', label: 'All', count: byTab.all.length },
            { id: 'completed', label: 'Completed', count: byTab.completed.length },
            { id: 'outstanding', label: 'Outstanding', count: byTab.outstanding.length },
          ]}
        />
        <TabPanel id={tab} idPrefix="tasks">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-muted">Loading tasks…</p>
          ) : visible.length > 0 ? (
            <ul className="flex flex-col divide-y divide-divider">
              {pageTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  action={task.status !== 'completed' && (
                    <Button variant="secondary" size="sm" loading={completing === task.id} onClick={() => markDone(task)}>Mark as done</Button>
                  )}
                />
              ))}
            </ul>
          ) : (
            <EmptyState title={EMPTY[tab].title}>{EMPTY[tab].text}</EmptyState>
          )}
        </TabPanel>
        {visible.length > 0 && (
          <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={setPage} itemLabel="tasks" />
        )}
      </Section>
    </Page>
  )
}

export default Tasks
