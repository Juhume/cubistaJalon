import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { type Exhibition, exhibitions as seedExhibitions } from './artworks'

const DATA_PATH = join(process.cwd(), 'data', 'exhibitions.json')
const FALLBACK_PATH = join('/tmp', 'exhibitions.json')

let cachedData: Exhibition[] | null = null
let cacheTime = 0
const CACHE_TTL = 5000

function readData(): Exhibition[] {
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return cachedData
  }

  if (existsSync(FALLBACK_PATH)) {
    try {
      const raw = readFileSync(FALLBACK_PATH, 'utf-8')
      cachedData = JSON.parse(raw) as Exhibition[]
      cacheTime = Date.now()
      return cachedData
    } catch {
      // Corrupted fallback — continue to primary path
    }
  }

  if (!existsSync(DATA_PATH)) {
    cachedData = seedExhibitions
    cacheTime = Date.now()
    return cachedData
  }

  try {
    const raw = readFileSync(DATA_PATH, 'utf-8')
    cachedData = JSON.parse(raw) as Exhibition[]
  } catch {
    cachedData = seedExhibitions
  }
  cacheTime = Date.now()
  return cachedData
}

function invalidateCache() {
  cachedData = null
  cacheTime = 0
}

function writeData(exhibitions: Exhibition[]): void {
  const json = JSON.stringify(exhibitions, null, 2)
  try {
    writeFileSync(DATA_PATH, json, 'utf-8')
  } catch {
    writeFileSync(FALLBACK_PATH, json, 'utf-8')
  }
  invalidateCache()
}

export function getAllExhibitions(): Exhibition[] {
  return readData()
}

export function getExhibitionById(id: string): Exhibition | undefined {
  return readData().find(e => e.id === id)
}

export function addExhibition(exhibition: Exhibition): Exhibition {
  const exhibitions = readData()
  if (exhibitions.some(e => e.id === exhibition.id)) {
    throw new Error(`Exhibition with id "${exhibition.id}" already exists`)
  }
  exhibitions.push(exhibition)
  writeData(exhibitions)
  return exhibition
}

export function updateExhibition(id: string, updates: Partial<Exhibition>): Exhibition | null {
  const exhibitions = readData()
  const index = exhibitions.findIndex(e => e.id === id)
  if (index === -1) return null

  const { id: _ignoredId, ...safeUpdates } = updates
  exhibitions[index] = { ...exhibitions[index], ...safeUpdates }
  writeData(exhibitions)
  return exhibitions[index]
}

export function deleteExhibition(id: string): boolean {
  const exhibitions = readData()
  const index = exhibitions.findIndex(e => e.id === id)
  if (index === -1) return false
  exhibitions.splice(index, 1)
  writeData(exhibitions)
  return true
}
