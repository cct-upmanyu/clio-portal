import MessageThread from '../components/messages/MessageThread'
import { useMatters } from '../hooks/useMatters'

// Full screen: no <Page> margin or panel; the thread fills the area below the top bar
function Messages() {
  const { selectedMatter } = useMatters()
  // Keyed by matter so switching matters starts that matter's thread fresh
  return <MessageThread key={selectedMatter.id} matter={selectedMatter} />
}

export default Messages
