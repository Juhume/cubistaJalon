import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { series as seedSeries } from './artworks'
import { getAllArtworks } from './data'

export interface Series {
  id: string
  name: string
  nameEn: string
}

const DATA_PATH = join(process.cwd(), 'data', 'series.json')
const FALLBACK_PATH = join('/tmp', 'series.json')

let cachedData: Series[] | null = null
let cacheTime = 0
const CACHE_TTL = 5000

function readData(): Series[] {
  if (cachedData && Date.now() - cacheTime < CACHE_TTL) {
    return cachedData
  }

  if (existsSync(FALLBACK_PATH)) {
    try {
      const raw = readFileSync(FALLBACK_PATH, 'utf-8')
      cachedData = JSON.parse(raw) as Series[]
      cacheTime = Date.now()
      return cachedData
    } catch {
      // Corrupted fallback — continue to primary path
    }
  }

  if (!existsSync(DATA_PATH)) {
    cachedData = seedSeries
    cacheTime = Date.now()
    return cachedData
  }

  try {
    const raw = readFileSync(DATA_PATH, 'utf-8')
    cachedData = JSON.parse(raw) as Series[]
  } catch {
    cachedData = seedSeries
  }
  cacheTime = Date.now()
  return cachedData
}

function invalidateCache() {
  cachedData = null
  cacheTime = 0
}

function writeData(seriesList: Series[]): void {
  const json = JSON.stringify(seriesList, null, 2)
  try {
    writeFileSync(DATA_PATH, json, 'utf-8')
  } catch {
    writeFileSync(FALLBACK_PATH, json, 'utf-8')
  }
  invalidateCache()
}

export function getAllSeries(): Series[] {
  return readData()
}

export function getSeriesById(id: string): Series | undefined {
  return readData().find(s => s.id === id)
}

export function addSeries(s: Series): Series {
  const seriesList = readData()
  if (seriesList.some(x => x.id === s.id)) {
    throw new Error(`Series with id "${s.id}" already exists`)
  }
  seriesList.push(s)
  writeData(seriesList)
  return s
}

export function updateSeries(id: string, updates: Partial<Series>): Series | null {
  const seriesList = readData()
  const index = seriesList.findIndex(s => s.id === id)
  if (index === -1) return null

  const { id: _ignoredId, ...safeUpdates } = updates
  seriesList[index] = { ...seriesList[index], ...safeUpdates }
  writeData(seriesList)
  return seriesList[index]
}

/** Returns number of artworks using this series */
export function getSeriesUsageCount(seriesId: string): number {
  const series = getSeriesById(seriesId)
  if (!series) return 0
  const artworks = getAllArtworks()
  return artworks.filter(a => a.series === series.name).length
}

export function deleteSeries(id: string): { success: boolean; error?: string } {
  const seriesList = readData()
  const series = seriesList.find(s => s.id === id)
  if (!series) return { success: false, error: 'Not found' }

  // Check if any artworks use this series
  const usageCount = getSeriesUsageCount(id)
  if (usageCount > 0) {
    return {
      success: false,
      error: `Cannot delete: ${usageCount} artwork(s) use this series`,
    }
  }

  const index = seriesList.findIndex(s => s.id === id)
  seriesList.splice(index, 1)
  writeData(seriesList)
  return { success: true }
}
