import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { matters } from '../data/sampleData'
import { SELECTED_MATTER_KEY, setSelectedMatter } from '../redux/slices/matterSlice'

// The client's matters and the one every page is currently showing.
// TODO: load matters from the backend (RTK Query) instead of sample data.
export function useMatters() {
  const dispatch = useDispatch()
  const selectedId = useSelector((state) => state.matter.selectedMatterId)

  const selectedMatter = matters.find((m) => m.id === selectedId) ?? matters[0]

  const selectMatter = useCallback((id) => {
    dispatch(setSelectedMatter(id))
    try {
      localStorage.setItem(SELECTED_MATTER_KEY, id)
    } catch {
      // Storage unavailable (private mode); the choice still applies for this visit
    }
  }, [dispatch])

  return { matters, selectedMatter, selectMatter }
}
