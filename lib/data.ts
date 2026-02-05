import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { type Artwork, artworks as seedArtworks } from './artworks'

const DATA_PATH = join(process.cwd(), 'data', 'artworks.json')

function readData(): Artwork[] {
  if (!existsSync(DATA_PATH)) {
    // Fall back to seed data if JSON file doesn't exist
    return seedArtworks
  }
  const raw = readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as Artwork[]
}

function writeData(artworks: Artwork[]): void {
  writeFileSync(DATA_PATH, JSON.stringify(artworks, null, 2), 'utf-8')
}

export function getAllArtworks(): Artwork[] {
  return readData()
}

export function getArtworkById(id: string): Artwork | undefined {
  return readData().find(a => a.id === id)
}

export function getArtworksByStatus(status: 'available' | 'sold'): Artwork[] {
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
