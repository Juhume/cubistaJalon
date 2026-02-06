import { NextRequest, NextResponse } from 'next/server'
import { getContact, updateContact } from '@/lib/data-contact'
import { isAuthorized } from '@/lib/auth'

export async function GET() {
  const contact = getContact()
  return NextResponse.json(contact)
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const ALLOWED_FIELDS = new Set(['email', 'instagram'])
  const unknownFields = Object.keys(body).filter(k => !ALLOWED_FIELDS.has(k))
  if (unknownFields.length > 0) {
    return NextResponse.json(
      { error: `Unknown fields: ${unknownFields.join(', ')}` },
      { status: 400 },
    )
  }

  if ('email' in body) {
    if (typeof body.email !== 'string' || body.email.trim() === '') {
      return NextResponse.json({ error: 'email must be a non-empty string' }, { status: 400 })
    }
  }

  if ('instagram' in body) {
    const ig = body.instagram
    if (typeof ig !== 'object' || ig === null) {
      return NextResponse.json({ error: 'instagram must be an object' }, { status: 400 })
    }
    if ('handle' in ig && (typeof ig.handle !== 'string' || ig.handle.trim() === '')) {
      return NextResponse.json({ error: 'instagram.handle must be a non-empty string' }, { status: 400 })
    }
    if ('url' in ig && (typeof ig.url !== 'string' || ig.url.trim() === '')) {
      return NextResponse.json({ error: 'instagram.url must be a non-empty string' }, { status: 400 })
    }
  }

  const updated = updateContact(body)
  return NextResponse.json(updated)
}
