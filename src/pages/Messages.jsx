import MessageThread from '../components/messages/MessageThread'
import Page from '../components/ui/Page'
import { useMatters } from '../hooks/useMatters'

function Messages() {
  const { selectedMatter } = useMatters()
  // Keyed by matter so switching matters starts that matter's thread fresh
  return (
    <Page scroll={false}>
      <MessageThread key={selectedMatter.id} matter={selectedMatter} />
    </Page>
  )
}

export default Messages
