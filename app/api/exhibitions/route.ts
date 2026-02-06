import { NextRequest, NextResponse } from 'next/server'
import { getAllExhibitions, addExhibition } from '@/lib/data-exhibitions'
import { isAuthorized } from '@/lib/auth'
import type { Exhibition } from '@/lib/artworks'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_STRING_LENGTH = 5000

export async function GET() {
  const exhibitions = getAllExhibitions()
  return NextResponse.json(exhibitions)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const ALLOWED_FIELDS = new Set([
    'id', 'title', 'titleEn', 'venue', 'location', 'locationEn',
    'startDate', 'endDate', 'description', 'descriptionEn', 'imageUrl',
  ])
  const unknownFields = Object.keys(body).filter(k => !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  const requiredStrings = [
    'id', 'title', 'titleEn', 'venue', 'location', 'locationEn',
    'startDate', 'endDate', 'description', 'descriptionEn', 'imageUrl',
  ]
  for (const field of requiredStrings) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return NextResponse.json({ error: `${field} is required and must be a non-empty string` }, { status: 400 })
    }
    if (body[field].length > MAX_STRING_LENGTH) {
      return NextResponse.json({ error: `${field} exceeds maximum length (${MAX_STRING_LENGTH})` }, { status: 400 })
    }
  }

  if (!SLUG_RE.test(body.id)) {
    return NextResponse.json(
      { error: 'id must be a valid slug (lowercase letters, numbers, hyphens only)' },
      { status: 400 },
    )
  }

  // Validate dates
  if (isNaN(Date.parse(body.startDate)) || isNaN(Date.parse(body.endDate))) {
    return NextResponse.json({ error: 'startDate and endDate must be valid ISO dates' }, { status: 400 })
  }

  const exhibition: Exhibition = {
    id: body.id.trim(),
    title: body.title.trim(),
    titleEn: body.titleEn.trim(),
    venue: body.venue.trim(),
    location: body.location.trim(),
    locationEn: body.locationEn.trim(),
    startDate: body.startDate.trim(),
    endDate: body.endDate.trim(),
    description: body.description.trim(),
    descriptionEn: body.descriptionEn.trim(),
    imageUrl: body.imageUrl.trim(),
  }

  try {
    const created = addExhibition(exhibition)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
