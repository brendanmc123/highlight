import { db, type Entry, type EntryInputMethod } from './db'

function getTodayDateKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sortNewestFirst(entries: Entry[]) {
  return [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function saveEntry(text: string, inputMethod: EntryInputMethod): Promise<Entry | null> {
  const trimmedText = text.trim()

  if (!trimmedText) {
    return null
  }

  const today = getTodayDateKey()
  const existingEntry = await db.entries.where('date').equals(today).and((entry) => !entry.isSeed).first()
  const createdAt = new Date().toISOString()

  if (!existingEntry) {
    const newEntry: Entry = {
      id: window.crypto?.randomUUID?.() ?? `${today}-${Date.now()}`,
      date: today,
      text: trimmedText,
      inputMethod,
      createdAt,
      isSeed: false,
    }

    await db.entries.add(newEntry)
    return newEntry
  }

  const updatedEntry: Entry = {
    ...existingEntry,
    text: trimmedText,
    inputMethod,
    createdAt,
    isSeed: false,
  }

  await db.entries.put(updatedEntry)
  return updatedEntry
}

export async function getAllEntries() {
  const entries = await db.entries.toArray()
  return sortNewestFirst(entries.filter((entry) => !entry.isSeed))
}

export async function getEntryByDate(date: string) {
  return db.entries.where('date').equals(date).and((entry) => !entry.isSeed).first()
}

export async function getEntriesForOnThisDay(today: string) {
  const [year, month, day] = today.split('-')
  const entries = await db.entries.toArray()

  const matchingEntries = entries.filter((entry) => {
    const [entryYear, entryMonth, entryDay] = entry.date.split('-')
    return entryMonth === month && entryDay === day && entryYear !== year
  })

  if (!matchingEntries.length) {
    return null
  }

  return [...matchingEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
}

export async function getEntryCount() {
  const entries = await db.entries.toArray()
  return entries.filter((entry) => !entry.isSeed).length
}

export async function getAllEntriesIncludingSeeds() {
  const entries = await db.entries.toArray()
  return sortNewestFirst(entries)
}

function escapeCsvValue(value: string) {
  const escaped = value.replaceAll('"', '""')
  return `"${escaped}"`
}

export async function exportToCsv() {
  const entries = await getAllEntries()
  const header = ['date', 'text', 'input_method', 'created_at']
  const rows = entries.map((entry) => [entry.date, entry.text, entry.inputMethod, entry.createdAt])
  const csvContent = [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(String(value))).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `highlight-entries-${getTodayDateKey()}.csv`
  document.body.append(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
