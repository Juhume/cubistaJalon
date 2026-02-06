import { NextRequest, NextResponse } from 'next/server'
import { getSeriesById, updateSeries, deleteSeries } from '@/lib/data-series'
import { isAuthorized } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const series = getSeriesById(id)

  if (!series) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(series)
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

  const ALLOWED_FIELDS = new Set(['name', 'nameEn'])
  const unknownFields = Object.keys(body).filter(k => k !== 'id' && !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  for (const field of ['name', 'nameEn']) {
    if (field in body) {
      if (typeof body[field] !== 'string' || body[field].trim() === '') {
        return NextResponse.json({ error: `${field} must be a non-empty string` }, { status: 400 })
      }
    }
  }

  const updated = updateSeries(id, body)
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
  const result = deleteSeries(id)

  if (!result.success) {
    const status = result.error === 'Not found' ? 404 : 409
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json({ success: true })
}
