import ActivityFeed from '../../components/activity/ActivityFeed'
import Page from '../../components/ui/Page'
import PageHeader from '../../components/ui/PageHeader'
import Section from '../../components/ui/Section'
import { useGetFirmActivityInfiniteQuery } from '../../redux/api/activityApi'

// Everything that happened across the firm, newest first, 50 at a time. An event on a matter opens
// that matter's Activity tab.
function Activity() {
  const activity = useGetFirmActivityInfiniteQuery({ perPage: 250 }, { refetchOnFocus: true })
  return (
    <Page>
      <PageHeader title="Activity" description="Invitations, tasks, meetings and account changes across every matter." />
      <Section>
        <ActivityFeed result={activity} linkToMatter />
      </Section>
    </Page>
  )
}

export default Activity
