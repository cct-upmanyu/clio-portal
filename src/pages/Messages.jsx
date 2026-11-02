import MatterChat from '../components/messages/MatterChat'
import { useMatters } from '../hooks/useMatters'

// Full screen: no <Page> margin or panel; the thread fills the area below the top bar
function Messages() {
  const { selectedMatter } = useMatters()
  if (!selectedMatter) return null
  // Keyed by matter so switching matters starts that matter's thread fresh
  return <MatterChat key={selectedMatter.crmMatterId} crmMatterId={selectedMatter.crmMatterId} viewer="client" />
}

export default Messages
