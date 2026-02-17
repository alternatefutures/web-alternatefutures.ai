// ---------------------------------------------------------------------------
// Client-side cookie utilities — shared across all admin pages
// ---------------------------------------------------------------------------

/** Returns true when running on localhost (dev mode — skip auth) */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

/**
 * Read a cookie value by name from `document.cookie`.
 * On localhost, returns a dev token for auth cookies so login is bypassed.
 * Returns empty string if the cookie is not found.
 * Must only be called from client components ('use client').
 */
export function getCookieValue(name: string): string {
  if (typeof document === 'undefined') return ''
  if (name === 'af_access_token' && isLocalhost()) return 'dev-localhost-token'
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

/**
 * Read the auth access token from cookies.
 * On localhost, returns a dev token so auth is bypassed entirely.
 * Redirects to /login if the cookie is missing and `redirectOnMissing` is true.
 * Returns the token string, or empty string if missing and not redirecting.
 */
export function getAuthToken(redirectOnMissing = false): string {
  if (isLocalhost()) return 'dev-localhost-token'
  const token = getCookieValue('af_access_token')
  if (!token && redirectOnMissing && typeof window !== 'undefined') {
    window.location.href = '/login'
  }
  return token
}
