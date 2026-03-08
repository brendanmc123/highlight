export interface Entry {
  id: string
  date: string
  text: string
  createdAt: string
  updatedAt: string
}

const ENTRIES_STORAGE_KEY = 'highlight_entries'

function getTodayDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function loadEntries(): Entry[] {
  if (typeof window === 'undefined') {
    return []
  }

  const rawEntries = window.localStorage.getItem(ENTRIES_STORAGE_KEY)

  if (!rawEntries) {
    return []
  }

  try {
    return JSON.parse(rawEntries) as Entry[]
  } catch {
    return []
  }
}

function persistEntries(entries: Entry[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(entries))
}

function appendWithReadableSpacing(existingText: string, newText: string) {
  const trimmedExistingText = existingText.trim()
  const trimmedNewText = newText.trim()

  if (!trimmedExistingText) {
    return trimmedNewText
  }

  if (trimmedExistingText.endsWith('.')) {
    return `${trimmedExistingText} ${trimmedNewText}`
  }

  return `${trimmedExistingText}. ${trimmedNewText}`
}

export async function saveEntry(text: string): Promise<Entry | null> {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return null
  }

  const entries = loadEntries()
  const today = getTodayDateKey()
  const timestamp = new Date().toISOString()
  const existingEntryForToday = entries.find((entry) => entry.date === today)

  if (!existingEntryForToday) {
    const newEntry: Entry = {
      id: window.crypto?.randomUUID?.() ?? `${today}-${Date.now()}`,
      date: today,
      text: trimmedText,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    persistEntries([newEntry, ...entries])
    return newEntry
  }

  const updatedEntry: Entry = {
    ...existingEntryForToday,
    text: appendWithReadableSpacing(existingEntryForToday.text, trimmedText),
    updatedAt: timestamp,
  }

  const updatedEntries = entries.map((entry) => {
    if (entry.id === updatedEntry.id) {
      return updatedEntry
    }

    return entry
  })

  persistEntries(updatedEntries)
  return updatedEntry
}
