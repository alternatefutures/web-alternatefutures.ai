import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { JWT_SECRET, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/auth'

const secret = new TextEncoder().encode(JWT_SECRET)

export async function POST() {
  // Only allow in staging
  if (process.env.NEXT_PUBLIC_STAGING !== 'true') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const now = Math.floor(Date.now() / 1000)

  const accessToken = await new SignJWT({
    userId: 'staging-user-001',
    email: 'admin@alternatefutures.ai',
    sessionId: 'staging-session',
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('alternatefutures-auth')
    .setAudience('alternatefutures-app')
    .setIssuedAt(now)
    .setExpirationTime(now + 24 * 60 * 60) // 24 hours for staging
    .sign(secret)

  const response = NextResponse.json({ success: true })

  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: false, // staging may not have SSL
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  })

  response.cookies.set(REFRESH_TOKEN_COOKIE, 'staging-refresh-token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return response
}
