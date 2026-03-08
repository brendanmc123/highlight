import { useEffect } from 'react'
import { RecordingScreen } from './components/RecordingScreen'
import { initializeSeedEntries } from './data/seed-entries'

function App() {
  useEffect(() => {
    void initializeSeedEntries()
  }, [])

  return <RecordingScreen />
}

export default App
