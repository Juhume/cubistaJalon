import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { type Artwork, artworks as seedArtworks } from './artworks'

const DATA_PATH = join(process.cwd(), 'data', 'artworks.json')
const FALLBACK_PATH = join('/tmp', 'artworks.json')

// In-memory cache — avoids readFileSync on every request
let cachedData: Artwork[] | null = null
let cacheTime = 0
const CACHE_TTL = 5000 // 5 seconds

function readData(): Artwork[] {
  // Return cache if fresh
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return cachedData
  }

  // Try /tmp first (Vercel writes go here)
  if (existsSync(FALLBACK_PATH)) {
    try {
      const raw = readFileSync(FALLBACK_PATH, 'utf-8')
      cachedData = JSON.parse(raw) as Artwork[]
      cacheTime = Date.now()
      return cachedData
    } catch {
      // Corrupted fallback — continue to primary path
    }
  }

  if (!existsSync(DATA_PATH)) {
    cachedData = seedArtworks
    cacheTime = Date.now()
    return cachedData
  }
  try {
    const raw = readFileSync(DATA_PATH, 'utf-8')
    cachedData = JSON.parse(raw) as Artwork[]
  } catch {
    cachedData = seedArtworks
  }
  cacheTime = Date.now()
  return cachedData
}

function invalidateCache() {
  cachedData = null
  cacheTime = 0
}

function writeData(artworks: Artwork[]): void {
  const json = JSON.stringify(artworks, null, 2)

  try {
    writeFileSync(DATA_PATH, json, 'utf-8')
  } catch {
    // Read-only filesystem (Vercel) — write to /tmp instead
    writeFileSync(FALLBACK_PATH, json, 'utf-8')
  }
  invalidateCache()
}

export function getAllArtworks(): Artwork[] {
  return readData()
}

export function getArtworkById(id: string): Artwork | undefined {
  return readData().find(a => a.id === id)
}

export function getArtworksByStatus(status: 'available' | 'sold' | 'reserved'): Artwork[] {
  return readData().filter(a => a.status === status)
}

export function updateArtwork(id: string, updates: Partial<Artwork>): Artwork | null {
  const artworks = readData()
  const index = artworks.findIndex(a => a.id === id)
  if (index === -1) return null

  // Don't allow changing the id
  const { id: _ignoredId, ...safeUpdates } = updates
  artworks[index] = { ...artworks[index], ...safeUpdates }
  writeData(artworks)
  return artworks[index]
}

export function addArtwork(artwork: Artwork): Artwork {
  const artworks = readData()
  // Check for duplicate id
  if (artworks.some(a => a.id === artwork.id)) {
    throw new Error(`Artwork with id "${artwork.id}" already exists`)
  }
  artworks.push(artwork)
  writeData(artworks)
  return artwork
}

export function deleteArtwork(id: string): boolean {
  const artworks = readData()
  const index = artworks.findIndex(a => a.id === id)
  if (index === -1) return false
  artworks.splice(index, 1)
  writeData(artworks)
  return true
}
