import { NextRequest, NextResponse } from 'next/server'
import { getExhibitionById, updateExhibition, deleteExhibition } from '@/lib/data-exhibitions'
import { isAuthorized } from '@/lib/auth'

const MAX_STRING_LENGTH = 5000
const STRING_FIELDS = [
  'title', 'titleEn', 'venue', 'location', 'locationEn',
  'startDate', 'endDate', 'description', 'descriptionEn', 'imageUrl',
]

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const exhibition = getExhibitionById(id)

  if (!exhibition) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(exhibition)
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

  const ALLOWED_FIELDS = new Set(STRING_FIELDS)
  const unknownFields = Object.keys(body).filter(k => k !== 'id' && !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
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

  // Validate dates if present
  if ('startDate' in body && isNaN(Date.parse(body.startDate))) {
    return NextResponse.json({ error: 'startDate must be a valid ISO date' }, { status: 400 })
  }
  if ('endDate' in body && isNaN(Date.parse(body.endDate))) {
    return NextResponse.json({ error: 'endDate must be a valid ISO date' }, { status: 400 })
  }

  const updated = updateExhibition(id, body)
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
  const deleted = deleteExhibition(id)

  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
