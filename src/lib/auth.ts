import { jwtVerify, type JWTPayload } from 'jose'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || 'https://auth.alternatefutures.ai'

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is required in production')
    }
    return 'dev-secret-DO-NOT-USE-IN-PRODUCTION'
  }
  return secret
}

export const ACCESS_TOKEN_COOKIE = 'af_access_token'
export const REFRESH_TOKEN_COOKIE = 'af_refresh_token'

export const LOGIN_PATH = '/login'
export const ADMIN_PREFIX = '/admin'

// ---------------------------------------------------------------------------
// JWT payload shape (matches service-auth)
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'approver' | 'editor' | 'viewer'

export interface AuthUser {
  userId: string
  email?: string
  sessionId: string
  role: UserRole
}

// ---------------------------------------------------------------------------
// JWT verification (Edge-compatible via jose)
// ---------------------------------------------------------------------------

export async function verifyAccessToken(
  token: string,
): Promise<(JWTPayload & AuthUser) | null> {
  try {
    const secret = new TextEncoder().encode(getJwtSecret())
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'alternatefutures-auth',
      audience: 'alternatefutures-app',
    })
    if (payload.type !== 'access') return null
    return payload as JWTPayload & AuthUser
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers (used in API route handlers)
// ---------------------------------------------------------------------------

export function accessTokenCookieOptions(): string {
  const maxAge = 15 * 60 // 15 minutes
  return `${ACCESS_TOKEN_COOKIE}={value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

export function refreshTokenCookieOptions(): string {
  const maxAge = 7 * 24 * 60 * 60 // 7 days
  return `${REFRESH_TOKEN_COOKIE}={value}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`
}

export function clearCookieHeaders(): string[] {
  return [
    `${ACCESS_TOKEN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
    `${REFRESH_TOKEN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
  ]
}

// ---------------------------------------------------------------------------
// Read user from cookies (server components / route handlers)
// ---------------------------------------------------------------------------

export async function getUserFromCookies(
  cookieStore: { get: (name: string) => { value: string } | undefined },
): Promise<AuthUser | null> {
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  const payload = await verifyAccessToken(token)
  if (!payload) return null
  return {
    userId: payload.userId,
    email: payload.email,
    sessionId: payload.sessionId,
    role: (payload as Record<string, unknown>).role as UserRole || 'editor',
  }
}
