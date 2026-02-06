import { NextRequest, NextResponse } from 'next/server'
import { getAllSeries, addSeries, type Series } from '@/lib/data-series'
import { isAuthorized } from '@/lib/auth'

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export async function GET() {
  const series = getAllSeries()
  return NextResponse.json(series)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const ALLOWED_FIELDS = new Set(['id', 'name', 'nameEn'])
  const unknownFields = Object.keys(body).filter(k => !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  for (const field of ['id', 'name', 'nameEn']) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      return NextResponse.json({ error: `${field} is required and must be a non-empty string` }, { status: 400 })
    }
  }

  if (!SLUG_RE.test(body.id)) {
    return NextResponse.json(
      { error: 'id must be a valid slug (lowercase letters, numbers, hyphens only)' },
      { status: 400 },
    )
  }

  const series: Series = {
    id: body.id.trim(),
    name: body.name.trim(),
    nameEn: body.nameEn.trim(),
  }

  try {
    const created = addSeries(series)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 409 })
  }
}
