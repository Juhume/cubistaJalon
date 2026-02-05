import { NextRequest, NextResponse } from 'next/server'
import { getAllArtworks, getArtworksByStatus, addArtwork } from '@/lib/data'
import { isAuthorized } from '@/lib/auth'
import type { Artwork } from '@/lib/artworks'

const VALID_STATUSES = new Set(['available', 'sold', 'reserved'])
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_STRING_LENGTH = 5000

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  if (status !== null && !VALID_STATUSES.has(status)) {
    return NextResponse.json(
      { error: `Invalid status "${status}". Must be: available, sold, reserved` },
      { status: 400 },
    )
  }

  const artworks = status
    ? getArtworksByStatus(status as 'available' | 'sold' | 'reserved')
    : getAllArtworks()
  return NextResponse.json(artworks)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Only allow known Artwork fields
  const ALLOWED_FIELDS = new Set([
    'id', 'title', 'titleEn', 'year', 'technique', 'techniqueEn',
    'dimensions', 'series', 'seriesEn', 'status', 'featured',
    'description', 'descriptionEn', 'imageUrl', 'gridSpan',
  ])
  const unknownFields = Object.keys(body).filter(k => !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  // Required string fields
  const requiredStrings = [
    'id', 'title', 'titleEn', 'technique', 'techniqueEn',
    'dimensions', 'series', 'seriesEn', 'description', 'descriptionEn', 'imageUrl',
  ]
  for (const field of requiredStrings) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return NextResponse.json({ error: `${field} is required and must be a non-empty string` }, { status: 400 })
    }
    if (body[field].length > MAX_STRING_LENGTH) {
      return NextResponse.json({ error: `${field} exceeds maximum length (${MAX_STRING_LENGTH})` }, { status: 400 })
    }
  }

  // id: valid slug format
  if (!SLUG_RE.test(body.id)) {
    return NextResponse.json(
      { error: 'id must be a valid slug (lowercase letters, numbers, hyphens only, e.g. "fragmentos-del-tiempo")' },
      { status: 400 },
    )
  }

  // year: required number in reasonable range
  if (typeof body.year !== 'number' || !Number.isInteger(body.year) || body.year < 1900 || body.year > 2100) {
    return NextResponse.json({ error: 'year must be an integer between 1900 and 2100' }, { status: 400 })
  }

  // status: required, must be valid
  if (!VALID_STATUSES.has(body.status)) {
    return NextResponse.json(
      { error: `Invalid status "${body.status}". Must be: available, sold, reserved` },
      { status: 400 },
    )
  }

  // featured: optional, must be boolean if present
  if ('featured' in body && typeof body.featured !== 'boolean') {
    return NextResponse.json({ error: 'featured must be a boolean' }, { status: 400 })
  }

  // gridSpan: optional, must be valid shape if present
  if ('gridSpan' in body) {
    const g = body.gridSpan
    if (typeof g !== 'object' || g === null
      || typeof g.cols !== 'number' || typeof g.rows !== 'number'
      || !Number.isInteger(g.cols) || !Number.isInteger(g.rows)
      || g.cols < 1 || g.rows < 1) {
      return NextResponse.json({ error: 'gridSpan must be { cols: number, rows: number } with positive integers' }, { status: 400 })
    }
  }

  // Build sanitized artwork object — only whitelisted fields
  const artwork: Artwork = {
    id: body.id.trim(),
    title: body.title.trim(),
    titleEn: body.titleEn.trim(),
    year: body.year,
    technique: body.technique.trim(),
    techniqueEn: body.techniqueEn.trim(),
    dimensions: body.dimensions.trim(),
    series: body.series.trim(),
    seriesEn: body.seriesEn.trim(),
    status: body.status,
    featured: body.featured ?? false,
    description: body.description.trim(),
    descriptionEn: body.descriptionEn.trim(),
    imageUrl: body.imageUrl.trim(),
    gridSpan: body.gridSpan ?? { cols: 4, rows: 1 },
  }

  try {
    const created = addArtwork(artwork)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
