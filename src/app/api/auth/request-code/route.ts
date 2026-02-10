import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_SERVICE_URL } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const res = await fetch(`${AUTH_SERVICE_URL}/auth/email/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { error: 'Failed to connect to auth service' },
      { status: 502 },
    )
  }
}
