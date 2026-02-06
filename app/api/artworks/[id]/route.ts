import { NextRequest, NextResponse } from 'next/server'
import { getArtworkById, updateArtwork, deleteArtwork } from '@/lib/data'
import { isAuthorized } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const artwork = getArtworkById(id)

  if (!artwork) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(artwork)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  // Whitelist: only allow known Artwork fields (except id — handled by updateArtwork)
  const ALLOWED_FIELDS = new Set([
    'title', 'titleEn', 'year', 'technique', 'techniqueEn',
    'dimensions', 'series', 'seriesEn', 'status', 'featured',
    'description', 'descriptionEn', 'imageUrl', 'gridSpan',
  ])
  const VALID_STATUSES = new Set(['available', 'sold', 'reserved'])
  const MAX_STRING_LENGTH = 5000
  const STRING_FIELDS = ['title', 'titleEn', 'technique', 'techniqueEn', 'dimensions', 'description', 'descriptionEn', 'imageUrl']
  // series/seriesEn are optional (can be empty string)
  const OPTIONAL_STRING_FIELDS = ['series', 'seriesEn']

  const unknownFields = Object.keys(body).filter(k => k !== 'id' && !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  // Validate individual field types
  if ('status' in body && !VALID_STATUSES.has(body.status)) {
    return NextResponse.json(
      { error: `Invalid status "${body.status}". Must be: available, sold, reserved` },
      { status: 400 },
    )
  }
  if ('year' in body && (typeof body.year !== 'number' || !Number.isInteger(body.year) || body.year < 1900 || body.year > 2100)) {
    return NextResponse.json({ error: 'year must be an integer between 1900 and 2100' }, { status: 400 })
  }
  if ('featured' in body && typeof body.featured !== 'boolean') {
    return NextResponse.json({ error: 'featured must be a boolean' }, { status: 400 })
  }
  if ('gridSpan' in body) {
    const g = body.gridSpan
    if (typeof g !== 'object' || g === null
      || typeof g.cols !== 'number' || typeof g.rows !== 'number'
      || !Number.isInteger(g.cols) || !Number.isInteger(g.rows)
      || g.cols < 1 || g.rows < 1) {
      return NextResponse.json({ error: 'gridSpan must be { cols: number, rows: number } with positive integers' }, { status: 400 })
    }
  }
  for (const field of STRING_FIELDS) {
    if (field in body) {
      if (typeof body[field] !== 'string') {
        return NextResponse.json({ error: `${field} must be a string` }, { status: 400 })
      }
      if (body[field].trim() === '') {
        return NextResponse.json({ error: `${field} cannot be empty` }, { status: 400 })
      }
      if (body[field].length > MAX_STRING_LENGTH) {
        return NextResponse.json({ error: `${field} exceeds maximum length (${MAX_STRING_LENGTH})` }, { status: 400 })
      }
    }
  }
  for (const field of OPTIONAL_STRING_FIELDS) {
    if (field in body) {
      if (typeof body[field] !== 'string') {
        return NextResponse.json({ error: `${field} must be a string` }, { status: 400 })
      }
      if (body[field].length > MAX_STRING_LENGTH) {
        return NextResponse.json({ error: `${field} exceeds maximum length (${MAX_STRING_LENGTH})` }, { status: 400 })
      }
    }
  }

  const updated = updateArtwork(id, body)
  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const deleted = deleteArtwork(id)

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
