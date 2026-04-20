import type { SocialPlatform, SocialMediaPost } from './social-api'
import type { ConnectablePlatform } from './platform-auth'
import { getValidToken } from './platform-auth'
import { checkRateLimit as persistentCheckRateLimit, trackXPost } from './rate-limit-store'
import crypto from 'crypto'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PublishResult {
  success: boolean
  platform: SocialPlatform
  postId: string | null
  url: string | null
  error: string | null
  publishedAt: string | null
}

export interface PublishRequest {
  postId: string
  platform: SocialPlatform
  content: string
  mediaUrls?: string[]
  hashtags?: string[]
  threadParts?: string[]
}

// ---------------------------------------------------------------------------
// Rate limiting — per-platform sliding window (persisted to disk)
// ---------------------------------------------------------------------------

const RATE_LIMITS: Record<ConnectablePlatform, { windowMs: number; maxRequests: number }> = {
  X: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
  BLUESKY: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
  MASTODON: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
  LINKEDIN: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 100 },
  REDDIT: { windowMs: 10 * 60 * 1000, maxRequests: 10 },
  DISCORD: { windowMs: 60 * 1000, maxRequests: 30 },
  TELEGRAM: { windowMs: 60 * 1000, maxRequests: 30 },
  THREADS: { windowMs: 15 * 60 * 1000, maxRequests: 50 },
  INSTAGRAM: { windowMs: 60 * 60 * 1000, maxRequests: 25 },
  FACEBOOK: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
  TIKTOK: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  YOUTUBE: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  MEDIUM: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 10 },
  SUBSTACK: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 5 },
  GHOST: { windowMs: 60 * 60 * 1000, maxRequests: 50 },
  FARCASTER: { windowMs: 5 * 60 * 1000, maxRequests: 30 },
}

function checkRateLimit(platform: ConnectablePlatform): { allowed: boolean; retryAfterMs: number } {
  const config = RATE_LIMITS[platform]
  return persistentCheckRateLimit(platform, config)
}

// ---------------------------------------------------------------------------
// Platform publishers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// OAuth 1.0a signing for X/Twitter API v2
// ---------------------------------------------------------------------------

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

function generateOAuth1Header(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = crypto.randomBytes(16).toString('hex')

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: '1.0',
  }

  // Build parameter string (sorted)
  const paramString = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(oauthParams[k])}`)
    .join('&')

  // Build signature base string
  const signatureBase = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`

  // Build signing key
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`

  // Generate HMAC-SHA1 signature
  const signature = crypto
    .createHmac('sha1', signingKey)
    .update(signatureBase)
    .digest('base64')

  oauthParams['oauth_signature'] = signature

  // Build Authorization header
  const headerParts = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(', ')

  return `OAuth ${headerParts}`
}

// ---------------------------------------------------------------------------
// Media upload helpers
// ---------------------------------------------------------------------------

async function uploadMediaToX(
  imageUrl: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  accessTokenSecret: string,
): Promise<string | null> {
  try {
    // Download image
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const contentType = imgRes.headers.get('content-type') || 'image/png'

    // X media upload uses v1.1 endpoint with OAuth 1.0a
    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json'

    // INIT
    const initAuth = generateOAuth1Header('POST', uploadUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret)
    const initRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: initAuth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        command: 'INIT',
        total_bytes: buffer.length.toString(),
        media_type: contentType,
      }).toString(),
    })
    if (!initRes.ok) return null
    const initData = await initRes.json()
    const mediaId = initData.media_id_string

    // APPEND
    const appendAuth = generateOAuth1Header('POST', uploadUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret)
    const formData = new FormData()
    formData.append('command', 'APPEND')
    formData.append('media_id', mediaId)
    formData.append('segment_index', '0')
    formData.append('media_data', buffer.toString('base64'))
    const appendRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: appendAuth },
      body: formData,
    })
    if (!appendRes.ok && appendRes.status !== 204) return null

    // FINALIZE
    const finalizeAuth = generateOAuth1Header('POST', uploadUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret)
    const finalizeRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: finalizeAuth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ command: 'FINALIZE', media_id: mediaId }).toString(),
    })
    if (!finalizeRes.ok) return null

    return mediaId
  } catch {
    return null
  }
}

async function uploadMediaToBluesky(
  imageUrl: string,
  accessJwt: string,
): Promise<{ blob: unknown } | null> {
  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const contentType = imgRes.headers.get('content-type') || 'image/png'

    const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessJwt}`,
        'Content-Type': contentType,
      },
      body: buffer,
    })

    if (!uploadRes.ok) return null
    const data = await uploadRes.json()
    return { blob: data.blob }
  } catch {
    return null
  }
}

async function uploadMediaToMastodon(
  imageUrl: string,
  instanceUrl: string,
  accessToken: string,
): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) return null
    const buffer = Buffer.from(await imgRes.arrayBuffer())
    const contentType = imgRes.headers.get('content-type') || 'image/png'
    const ext = contentType.split('/')[1] || 'png'

    const baseUrl = instanceUrl.replace(/\/$/, '')
    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: contentType }), `upload.${ext}`)

    const uploadRes = await fetch(`${baseUrl}/api/v2/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    })

    if (!uploadRes.ok) return null
    const data = await uploadRes.json()
    return data.id || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Platform publishers
// ---------------------------------------------------------------------------

async function publishToX(content: string, mediaUrls: string[]): Promise<PublishResult> {
  // Check monthly limit for X Free tier (50 posts/month)
  const monthlyCheck = trackXPost()
  if (!monthlyCheck.allowed) {
    return {
      success: false, platform: 'X', postId: null, url: null,
      error: `X Free tier monthly limit reached (50/month). Remaining: ${monthlyCheck.remaining}`,
      publishedAt: null,
    }
  }

  // OAuth 1.0a requires all four credentials
  const consumerKey = process.env.X_API_KEY
  const consumerSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET

  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    return {
      success: false, platform: 'X', postId: null, url: null,
      error: 'X OAuth 1.0a credentials not configured (X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET)',
      publishedAt: null,
    }
  }

  try {
    // Upload media if provided
    const mediaIds: string[] = []
    for (const url of mediaUrls.slice(0, 4)) { // X allows max 4 images
      const mediaId = await uploadMediaToX(url, consumerKey, consumerSecret, accessToken, accessTokenSecret)
      if (mediaId) mediaIds.push(mediaId)
    }

    const tweetUrl = 'https://api.x.com/2/tweets'
    const authHeader = generateOAuth1Header('POST', tweetUrl, consumerKey, consumerSecret, accessToken, accessTokenSecret)

    const tweetBody: Record<string, unknown> = { text: content }
    if (mediaIds.length > 0) {
      tweetBody.media = { media_ids: mediaIds }
    }

    const res = await fetch(tweetUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetBody),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, platform: 'X', postId: null, url: null, error: `X API error ${res.status}: ${JSON.stringify(err)}`, publishedAt: null }
    }

    const data = await res.json()
    const postId = data.data?.id
    return {
      success: true,
      platform: 'X',
      postId,
      url: postId ? `https://x.com/i/status/${postId}` : null,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'X', postId: null, url: null, error: `X publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

// ---------------------------------------------------------------------------
// Bluesky session cache — avoids creating a new session per publish
// Sessions are valid for ~2 hours; we cache for 90 minutes and refresh.
// ---------------------------------------------------------------------------

let blueskySessionCache: {
  accessJwt: string
  refreshJwt: string
  did: string
  handle: string
  createdAt: number
} | null = null

const BLUESKY_SESSION_TTL_MS = 90 * 60 * 1000 // 90 minutes

async function getBlueskySession(): Promise<typeof blueskySessionCache> {
  const handle = process.env.BLUESKY_HANDLE
  const appPassword = await getValidToken('BLUESKY')
  if (!handle || !appPassword) return null

  const now = Date.now()

  // Try to refresh existing session if it's still within TTL
  if (blueskySessionCache && now - blueskySessionCache.createdAt < BLUESKY_SESSION_TTL_MS) {
    // Validate session is still working with a lightweight refresh
    try {
      const refreshRes = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
        method: 'POST',
        headers: { Authorization: `Bearer ${blueskySessionCache.refreshJwt}` },
      })
      if (refreshRes.ok) {
        const data = await refreshRes.json()
        blueskySessionCache = {
          accessJwt: data.accessJwt,
          refreshJwt: data.refreshJwt,
          did: data.did,
          handle: data.handle || handle,
          createdAt: now,
        }
        return blueskySessionCache
      }
    } catch {
      // Fall through to create new session
    }
  }

  // Create a fresh session
  try {
    const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    })
    if (!res.ok) {
      blueskySessionCache = null
      return null
    }
    const data = await res.json()
    blueskySessionCache = {
      accessJwt: data.accessJwt,
      refreshJwt: data.refreshJwt,
      did: data.did,
      handle: data.handle || handle,
      createdAt: now,
    }
    return blueskySessionCache
  } catch {
    blueskySessionCache = null
    return null
  }
}

async function publishToBluesky(content: string, mediaUrls: string[]): Promise<PublishResult> {
  const handle = process.env.BLUESKY_HANDLE
  if (!handle) {
    return { success: false, platform: 'BLUESKY', postId: null, url: null, error: 'BLUESKY_HANDLE or BLUESKY_APP_PASSWORD not configured', publishedAt: null }
  }

  try {
    const session = await getBlueskySession()
    if (!session) {
      return { success: false, platform: 'BLUESKY', postId: null, url: null, error: 'Bluesky auth failed: could not establish session', publishedAt: null }
    }

    // Upload images if provided (max 4)
    const images: Array<{ alt: string; image: unknown }> = []
    for (const url of mediaUrls.slice(0, 4)) {
      const result = await uploadMediaToBluesky(url, session.accessJwt)
      if (result) {
        images.push({ alt: '', image: result.blob })
      }
    }

    // Create post record
    const now = new Date().toISOString()
    const record: Record<string, unknown> = {
      $type: 'app.bsky.feed.post',
      text: content,
      createdAt: now,
    }

    if (images.length > 0) {
      record.embed = {
        $type: 'app.bsky.embed.images',
        images,
      }
    }

    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record,
      }),
    })

    if (!postRes.ok) {
      // If auth expired, clear cache and retry once
      if (postRes.status === 401) {
        blueskySessionCache = null
        const retrySession = await getBlueskySession()
        if (retrySession) {
          const retryRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${retrySession.accessJwt}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              repo: retrySession.did,
              collection: 'app.bsky.feed.post',
              record,
            }),
          })
          if (retryRes.ok) {
            const retryData = await retryRes.json()
            const rkey = retryData.uri?.split('/').pop()
            return {
              success: true, platform: 'BLUESKY', postId: retryData.uri,
              url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : null,
              error: null, publishedAt: now,
            }
          }
        }
      }
      const err = await postRes.json().catch(() => ({}))
      return { success: false, platform: 'BLUESKY', postId: null, url: null, error: `Bluesky post failed: ${JSON.stringify(err)}`, publishedAt: null }
    }

    const postData = await postRes.json()
    const rkey = postData.uri?.split('/').pop()
    return {
      success: true,
      platform: 'BLUESKY',
      postId: postData.uri,
      url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : null,
      error: null,
      publishedAt: now,
    }
  } catch (e) {
    return { success: false, platform: 'BLUESKY', postId: null, url: null, error: `Bluesky publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

async function publishToMastodon(content: string, mediaUrls: string[]): Promise<PublishResult> {
  const instanceUrl = process.env.MASTODON_INSTANCE_URL
  const accessToken = await getValidToken('MASTODON')
  if (!instanceUrl || !accessToken) {
    return { success: false, platform: 'MASTODON', postId: null, url: null, error: 'MASTODON_INSTANCE_URL or MASTODON_ACCESS_TOKEN not configured', publishedAt: null }
  }

  try {
    const baseUrl = instanceUrl.replace(/\/$/, '')

    // Upload media if provided (max 4)
    const mediaIds: string[] = []
    for (const url of mediaUrls.slice(0, 4)) {
      const mediaId = await uploadMediaToMastodon(url, baseUrl, accessToken)
      if (mediaId) mediaIds.push(mediaId)
    }

    const body: Record<string, unknown> = { status: content }
    if (mediaIds.length > 0) {
      body.media_ids = mediaIds
    }

    const res = await fetch(`${baseUrl}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, platform: 'MASTODON', postId: null, url: null, error: `Mastodon error ${res.status}: ${JSON.stringify(err)}`, publishedAt: null }
    }

    const data = await res.json()
    return {
      success: true,
      platform: 'MASTODON',
      postId: data.id,
      url: data.url || null,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'MASTODON', postId: null, url: null, error: `Mastodon publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

async function publishToLinkedIn(content: string): Promise<PublishResult> {
  const accessToken = await getValidToken('LINKEDIN')
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN
  if (!accessToken || !authorUrn) {
    return { success: false, platform: 'LINKEDIN', postId: null, url: null, error: 'LINKEDIN_ACCESS_TOKEN or LINKEDIN_AUTHOR_URN not configured', publishedAt: null }
  }

  try {
    // Use the current LinkedIn Posts API (replaces deprecated ugcPosts)
    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401',
      },
      body: JSON.stringify({
        author: authorUrn,
        commentary: content,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, platform: 'LINKEDIN', postId: null, url: null, error: `LinkedIn error ${res.status}: ${JSON.stringify(err)}`, publishedAt: null }
    }

    // LinkedIn Posts API returns the post URN in the x-restli-id header
    const postUrn = res.headers.get('x-restli-id')
    const activityId = postUrn?.replace('urn:li:share:', '') || postUrn
    return {
      success: true,
      platform: 'LINKEDIN',
      postId: postUrn || null,
      url: activityId ? `https://www.linkedin.com/feed/update/${activityId}` : null,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'LINKEDIN', postId: null, url: null, error: `LinkedIn publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

async function publishToReddit(content: string): Promise<PublishResult> {
  const accessToken = await getValidToken('REDDIT')
  const subreddit = process.env.REDDIT_SUBREDDIT || 'alternatefutures'
  if (!accessToken) {
    return { success: false, platform: 'REDDIT', postId: null, url: null, error: 'REDDIT_ACCESS_TOKEN not configured', publishedAt: null }
  }

  try {
    const params = new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title: content.slice(0, 300),
      text: content,
    })

    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AlternateFutures/1.0',
      },
      body: params.toString(),
    })

    if (!res.ok) {
      return { success: false, platform: 'REDDIT', postId: null, url: null, error: `Reddit error ${res.status}`, publishedAt: null }
    }

    const data = await res.json()
    const postUrl = data?.json?.data?.url || null
    return {
      success: true,
      platform: 'REDDIT',
      postId: data?.json?.data?.name || null,
      url: postUrl,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'REDDIT', postId: null, url: null, error: `Reddit publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

async function publishToDiscord(content: string): Promise<PublishResult> {
  const webhookUrl = await getValidToken('DISCORD')
  if (!webhookUrl) {
    return { success: false, platform: 'DISCORD', postId: null, url: null, error: 'DISCORD_WEBHOOK_URL not configured', publishedAt: null }
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })

    if (!res.ok) {
      return { success: false, platform: 'DISCORD', postId: null, url: null, error: `Discord error ${res.status}`, publishedAt: null }
    }

    return {
      success: true,
      platform: 'DISCORD',
      postId: null,
      url: null,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'DISCORD', postId: null, url: null, error: `Discord publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

async function publishToTelegram(content: string): Promise<PublishResult> {
  const botToken = await getValidToken('TELEGRAM')
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return { success: false, platform: 'TELEGRAM', postId: null, url: null, error: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured', publishedAt: null }
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: content,
        parse_mode: 'Markdown',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, platform: 'TELEGRAM', postId: null, url: null, error: `Telegram error ${res.status}: ${JSON.stringify(err)}`, publishedAt: null }
    }

    const data = await res.json()
    const messageId = data?.result?.message_id
    return {
      success: true,
      platform: 'TELEGRAM',
      postId: messageId ? String(messageId) : null,
      url: null,
      error: null,
      publishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return { success: false, platform: 'TELEGRAM', postId: null, url: null, error: `Telegram publish failed: ${e instanceof Error ? e.message : String(e)}`, publishedAt: null }
  }
}

// ---------------------------------------------------------------------------
// Dev-mode mock publisher
// ---------------------------------------------------------------------------

function mockPublish(platform: SocialPlatform, _content: string): PublishResult {
  const now = new Date().toISOString()
  const mockId = `mock-${Date.now()}`

  const urlMap: Partial<Record<SocialPlatform, string>> = {
    X: `https://x.com/altfutures/status/${mockId}`,
    BLUESKY: `https://bsky.app/profile/alternatefutures.bsky.social/post/${mockId}`,
    MASTODON: `https://mastodon.social/@alternatefutures/${mockId}`,
    LINKEDIN: `https://linkedin.com/feed/update/${mockId}`,
    REDDIT: `https://reddit.com/r/alternatefutures/comments/${mockId}`,
  }

  return {
    success: true,
    platform,
    postId: mockId,
    url: urlMap[platform] || null,
    error: null,
    publishedAt: now,
  }
}

// ---------------------------------------------------------------------------
// Main publish function
// ---------------------------------------------------------------------------

export async function publishPost(request: PublishRequest): Promise<PublishResult> {
  const platform = request.platform as ConnectablePlatform

  // Check rate limit
  if (platform in RATE_LIMITS) {
    const { allowed, retryAfterMs } = checkRateLimit(platform)
    if (!allowed) {
      return {
        success: false,
        platform: request.platform,
        postId: null,
        url: null,
        error: `Rate limited. Retry after ${Math.ceil(retryAfterMs / 1000)}s`,
        publishedAt: null,
      }
    }
  }

  // Append hashtags to content
  let fullContent = request.content
  if (request.hashtags?.length) {
    fullContent += '\n\n' + request.hashtags.join(' ')
  }

  // Dev mode: return mock result
  if (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  ) {
    // Simulate a short delay
    await new Promise((r) => setTimeout(r, 200))
    return mockPublish(request.platform, fullContent)
  }

  // Route to platform-specific publisher
  switch (request.platform) {
    case 'X':
      return publishToX(fullContent, request.mediaUrls || [])
    case 'BLUESKY':
      return publishToBluesky(fullContent, request.mediaUrls || [])
    case 'MASTODON':
      return publishToMastodon(fullContent, request.mediaUrls || [])
    case 'LINKEDIN':
      return publishToLinkedIn(fullContent)
    case 'REDDIT':
      return publishToReddit(fullContent)
    case 'DISCORD':
      return publishToDiscord(fullContent)
    case 'TELEGRAM':
      return publishToTelegram(fullContent)
    default:
      return {
        success: false,
        platform: request.platform,
        postId: null,
        url: null,
        error: `Publishing to ${request.platform} is not yet supported`,
        publishedAt: null,
      }
  }
}

// ---------------------------------------------------------------------------
// Batch publish (for multi-platform posts)
// ---------------------------------------------------------------------------

export async function publishPostToPlatforms(
  post: SocialMediaPost,
): Promise<PublishResult> {
  return publishPost({
    postId: post.id,
    platform: post.platform,
    content: post.content,
    mediaUrls: post.mediaUrls,
    hashtags: post.hashtags,
    threadParts: post.threadParts,
  })
}
