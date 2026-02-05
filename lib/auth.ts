import { timingSafeEqual } from 'crypto'
import { NextRequest } from 'next/server'

const ADMIN_SECRET = process.env.ADMIN_SECRET

if (!ADMIN_SECRET) {
  console.error('[SECURITY] ADMIN_SECRET env var is not set. Admin API will reject all requests.')
}

/**
 * Constant-time Bearer token check.
 * Returns false if ADMIN_SECRET is not configured (fail-closed).
 */
export function isAuthorized(request: NextRequest): boolean {
  if (!ADMIN_SECRET) return false

  const auth = request.headers.get('authorization')
  if (!auth) return false

  const expected = `Bearer ${ADMIN_SECRET}`

  // timingSafeEqual requires equal-length buffers
  if (auth.length !== expected.length) return false

  const a = Buffer.from(auth)
  const b = Buffer.from(expected)
  return timingSafeEqual(a, b)
}
