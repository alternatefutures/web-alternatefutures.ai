import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth'

// ---------------------------------------------------------------------------
// Private / reserved IP range blocking (SSRF prevention)
// ---------------------------------------------------------------------------

function isPrivateOrReservedHost(hostname: string): boolean {
  // Block obvious internal hostnames
  if (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true
  }

  // IPv4 checks
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [, a, b] = ipv4.map(Number)
    if (a === 127) return true                         // 127.0.0.0/8   loopback
    if (a === 10) return true                          // 10.0.0.0/8    private
    if (a === 172 && b >= 16 && b <= 31) return true   // 172.16.0.0/12 private
    if (a === 192 && b === 168) return true            // 192.168.0.0/16 private
    if (a === 169 && b === 254) return true            // 169.254.0.0/16 link-local
    if (a === 0) return true                           // 0.0.0.0/8
    if (a >= 224) return true                          // multicast & reserved
  }

  return false
}

// Maximum HTML bytes to read (prevent memory exhaustion)
const MAX_RESPONSE_BYTES = 512 * 1024 // 512 KB

export async function GET(request: NextRequest) {
  // --- Authentication: require a valid access token ---
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const user = await verifyAccessToken(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter is required' }, { status: 400 })
  }

  // --- URL validation ---
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Restrict to http(s) schemes only
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http and https URLs are allowed' }, { status: 400 })
  }

  // Block private / reserved IP ranges
  if (isPrivateOrReservedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'URL points to a private or reserved address' }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AlternateFutures-OGPreview/1.0',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(5000),
      redirect: 'follow',
    })

    // After redirect, re-check the final URL for private IPs
    if (res.url) {
      try {
        const finalUrl = new URL(res.url)
        if (isPrivateOrReservedHost(finalUrl.hostname)) {
          controller.abort()
          return NextResponse.json({ error: 'URL redirected to a private or reserved address' }, { status: 400 })
        }
      } catch {
        // If we can't parse the final URL, block it
        return NextResponse.json({ error: 'Invalid redirect target' }, { status: 400 })
      }
    }

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${res.status}` }, { status: 502 })
    }

    // Read limited amount of data
    const reader = res.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'No response body' }, { status: 502 })
    }

    const chunks: Uint8Array[] = []
    let totalBytes = 0
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > MAX_RESPONSE_BYTES) {
        reader.cancel()
        break
      }
      chunks.push(value)
    }

    const html = chunks.map((c) => decoder.decode(c, { stream: true })).join('') + decoder.decode()

    const getMetaContent = (property: string): string => {
      // Try og: prefix first, then name attribute
      const ogMatch = html.match(
        new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:)?${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      )
      if (ogMatch) return ogMatch[1]

      // Try reversed order (content before property)
      const reversedMatch = html.match(
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:)?${property}["']`, 'i'),
      )
      if (reversedMatch) return reversedMatch[1]

      return ''
    }

    const title =
      getMetaContent('title') ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim()

    const description = getMetaContent('description')
    const image = getMetaContent('image')
    const siteName = getMetaContent('site_name')

    return NextResponse.json({
      title,
      description,
      image,
      url,
      siteName,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 502 })
  }
}
