/**
 * Seed script — generates data/artworks.json from lib/artworks.ts
 * Run with: pnpm seed
 */
import { writeFileSync } from 'fs'
import { join } from 'path'
import { artworks } from '../lib/artworks'

const OUTPUT = join(__dirname, '..', 'data', 'artworks.json')

writeFileSync(OUTPUT, JSON.stringify(artworks, null, 2), 'utf-8')
console.log(`Seeded ${artworks.length} artworks to ${OUTPUT}`)
