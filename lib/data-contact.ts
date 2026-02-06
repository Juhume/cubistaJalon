import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { contact as seedContact } from './contact'

export interface ContactData {
  email: string
  instagram: {
    handle: string
    url: string
  }
}

const DATA_PATH = join(process.cwd(), 'data', 'contact.json')
const FALLBACK_PATH = join('/tmp', 'contact.json')

let cachedData: ContactData | null = null
let cacheTime = 0
const CACHE_TTL = 5000

function readData(): ContactData {
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return cachedData
  }

  if (existsSync(FALLBACK_PATH)) {
    try {
      const raw = readFileSync(FALLBACK_PATH, 'utf-8')
      cachedData = JSON.parse(raw) as ContactData
      cacheTime = Date.now()
      return cachedData
    } catch {
      // Corrupted fallback — continue
    }
  }

  if (!existsSync(DATA_PATH)) {
    cachedData = seedContact
    cacheTime = Date.now()
    return cachedData
  }

  try {
    const raw = readFileSync(DATA_PATH, 'utf-8')
    cachedData = JSON.parse(raw) as ContactData
  } catch {
    cachedData = seedContact
  }
  cacheTime = Date.now()
  return cachedData
}

function invalidateCache() {
  cachedData = null
  cacheTime = 0
}

function writeData(data: ContactData): void {
  const json = JSON.stringify(data, null, 2)
  try {
    writeFileSync(DATA_PATH, json, 'utf-8')
  } catch {
    writeFileSync(FALLBACK_PATH, json, 'utf-8')
  }
  invalidateCache()
}

export function getContact(): ContactData {
  return readData()
}

export function updateContact(updates: Partial<ContactData>): ContactData {
  const current = readData()
  const updated = {
    ...current,
    ...updates,
    instagram: updates.instagram
      ? { ...current.instagram, ...updates.instagram }
      : current.instagram,
  }
  writeData(updated)
  return updated
}
