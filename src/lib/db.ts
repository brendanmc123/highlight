import Dexie, { type Table } from 'dexie'

export type EntryInputMethod = 'voice' | 'text'

export interface Entry {
  id: string
  date: string
  text: string
  inputMethod: EntryInputMethod
  createdAt: string
  isSeed: boolean
  seedAuthor?: string
  seedYear?: string
  seedNote?: string
}

class HighlightDB extends Dexie {
  entries!: Table<Entry, string>

  constructor() {
    super('HighlightDB')

    this.version(1).stores({
      entries: '&id,date',
    })
  }
}

export const db = new HighlightDB()
