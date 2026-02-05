import { NextRequest, NextResponse } from 'next/server'
import { getAllArtworks, getArtworksByStatus, addArtwork } from '@/lib/data'
import type { Artwork } from '@/lib/artworks'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cubista-jalon-admin'

function isAuthorized(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${ADMIN_SECRET}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') as 'available' | 'sold' | null

  const artworks = status ? getArtworksByStatus(status) : getAllArtworks()
  return NextResponse.json(artworks)
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Artwork

  // Validate required fields
  const required: (keyof Artwork)[] = ['id', 'title', 'titleEn', 'year', 'technique', 'techniqueEn', 'dimensions', 'series', 'seriesEn', 'status', 'description', 'descriptionEn', 'imageUrl']
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  // Set defaults
  const artwork: Artwork = {
    ...body,
    featured: body.featured ?? false,
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
