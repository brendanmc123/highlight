import { db, type Entry } from '../lib/db'

type SeedEntry = Pick<Entry, 'date' | 'text' | 'inputMethod' | 'isSeed' | 'seedAuthor' | 'seedYear' | 'seedNote'>

const seedEntries: SeedEntry[] = [
  { date: '1660-06-15', text: 'And so to bed.', isSeed: true, inputMethod: 'text', seedAuthor: 'Samuel Pepys', seedYear: '1660' },
  { date: '1831-12-15', text: 'Sat in my own corner feeling most comfortably at home.', isSeed: true, inputMethod: 'text', seedAuthor: 'Charles Darwin', seedYear: '1831' },
  { date: '1661-04-10', text: 'To the office, where we sat all the morning. A fine day, and after dinner I walked to Deptford.', isSeed: true, inputMethod: 'text', seedAuthor: 'Samuel Pepys', seedYear: '1661' },
  { date: '1498-01-01', text: 'Realise that everything connects to everything else.', isSeed: true, inputMethod: 'text', seedAuthor: 'Leonardo da Vinci', seedYear: 'c. 1490' },
  { date: '1925-05-14', text: 'Happiness is having a little string onto which things attach themselves.', isSeed: true, inputMethod: 'text', seedAuthor: 'Virginia Woolf', seedYear: '1925', seedNote: 'inspired by' },
  { date: '1968-01-01', text: 'The whole point is to remember what it was to be me.', isSeed: true, inputMethod: 'text', seedAuthor: 'Joan Didion', seedYear: '1968', seedNote: 'inspired by' },
  { date: '1914-06-01', text: 'Spent the evening alone again. Hated myself for it, as usual.', isSeed: true, inputMethod: 'text', seedAuthor: 'Franz Kafka', seedYear: 'c. 1914', seedNote: 'inspired by' },
  { date: '1953-08-01', text: 'Wanted to write a poem about the rain. Remembered what the rejection slip said.', isSeed: true, inputMethod: 'text', seedAuthor: 'Sylvia Plath', seedYear: '1953', seedNote: 'inspired by' },
  { date: '1953-01-01', text: 'Monday. Me. Tuesday. Me. Wednesday. Me. Thursday. Me.', isSeed: true, inputMethod: 'text', seedAuthor: 'Witold Gombrowicz', seedYear: '1953' },
  { date: '1940-09-15', text: 'Could not buy a new diary — all the shops nearby are cordoned off for unexploded bombs.', isSeed: true, inputMethod: 'text', seedAuthor: 'George Orwell', seedYear: '1940', seedNote: 'inspired by' },
]

export async function initializeSeedEntries() {
  const existingSeed = await db.entries.filter((entry) => entry.isSeed).first()

  if (existingSeed) {
    return
  }

  const createdAt = new Date().toISOString()
  const rows = seedEntries.map((entry) => ({
    ...entry,
    id: window.crypto?.randomUUID?.() ?? `${entry.date}-${Math.random().toString(36).slice(2)}`,
    createdAt,
  }))

  await db.entries.bulkAdd(rows)
}
