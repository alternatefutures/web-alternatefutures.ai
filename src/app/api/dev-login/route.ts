import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { getJwtSecret } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Only allow in staging/development
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.STAGING_MODE !== 'true' &&
    process.env.NEXT_PUBLIC_STAGING !== 'true'
  ) {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  const email = request.nextUrl.searchParams.get('email') || 'ceo@alternatefutures.ai'
  if (!email.endsWith('@alternatefutures.ai')) {
    return NextResponse.json({ error: 'Email must be @alternatefutures.ai' }, { status: 403 })
  }

  const secret = new TextEncoder().encode(getJwtSecret())
  const token = await new SignJWT({
    userId: `dev-${email.split('@')[0]}`,
    email,
    sessionId: `staging-${Date.now()}`,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer('alternatefutures-auth')
    .setAudience('alternatefutures-app')
    .setExpirationTime('30d')
    .sign(secret)

  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const redirectUrl = host ? `${proto}://${host}/admin` : '/admin'

  const response = NextResponse.redirect(redirectUrl, { status: 302 })
  response.cookies.set('af_access_token', token, {
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return response
}
