import { NextResponse, type NextRequest } from 'next/server'
import {
  AUTH_SERVICE_URL,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 },
      )
    }

    const res = await fetch(`${AUTH_SERVICE_URL}/auth/email/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    // Set httpOnly cookies with the tokens
    const response = NextResponse.json({
      success: true,
      user: data.user,
    })

    response.cookies.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    })

    response.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to auth service' },
      { status: 502 },
    )
  }
}
