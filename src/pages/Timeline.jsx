import ActivityFeed from '../components/activity/ActivityFeed'
import Page from '../components/ui/Page'
import PageHeader from '../components/ui/PageHeader'
import Section from '../components/ui/Section'
import { useMatters } from '../hooks/useMatters'
import { useGetMatterActivityInfiniteQuery } from '../redux/api/activityApi'

// The selected matter's history, as clients may see it (the backend leaves out firm-only events)
function MatterTimeline({ crmMatterId }) {
  const activity = useGetMatterActivityInfiniteQuery(crmMatterId, { refetchOnFocus: true })
  return <ActivityFeed result={activity} inMatter viewer="client" emptyText="Updates on this matter, like new documents and events, will show here." />
}

function Timeline() {
  const { selectedMatter: matter } = useMatters()

  return (
    <Page>
      <PageHeader title="Timeline" description="What's happened on this matter so far." />
      <Section>
        {/* Keyed by matter so switching matters starts that matter's timeline fresh */}
        <MatterTimeline key={matter.crmMatterId} crmMatterId={matter.crmMatterId} />
      </Section>
    </Page>
  )
}

export default Timeline
