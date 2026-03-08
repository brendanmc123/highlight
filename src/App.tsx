import { useEffect } from 'react'
import { RecordingScreen } from './components/RecordingScreen'
import { initializeSeedEntries } from './data/seed-entries'
import { ensureDBReady } from './lib/db'

function App() {
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        await ensureDBReady()
        await initializeSeedEntries()
      } catch (error) {
        console.error('Failed to initialize HighlightDB', error)
      }
    }

    void initializeAppData()
  }, [])

  return <RecordingScreen />
}

export default App
