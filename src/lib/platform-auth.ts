// ---------------------------------------------------------------------------
// Platform OAuth Connection Management
// ---------------------------------------------------------------------------
// Token management, secure storage, and token refresh for social platform
// integrations. Credentials are stored server-side via the GraphQL API and
// never exposed to the client. Environment variables provide the encryption
// key and per-platform secrets needed for OAuth flows.
// ---------------------------------------------------------------------------

export type ConnectablePlatform =
  | 'X'
  | 'BLUESKY'
  | 'MASTODON'
  | 'LINKEDIN'
  | 'REDDIT'
  | 'DISCORD'
  | 'TELEGRAM'

export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED' | 'ERROR'

export interface PlatformConnection {
  platform: ConnectablePlatform
  status: ConnectionStatus
  accountName: string | null
  accountId: string | null
  connectedAt: string | null
  expiresAt: string | null
  scopes: string[]
  error: string | null
}

export interface PlatformOAuthConfig {
  platform: ConnectablePlatform
  label: string
  description: string
  authType: 'oauth2' | 'api_key' | 'bot_token'
  requiredEnvVars: string[]
  scopes: string[]
  refreshable: boolean
  tokenLifetimeMs: number | null
}

export interface TokenRefreshResult {
  accessToken: string
  refreshToken?: string
  expiresAt: string
}

// ---------------------------------------------------------------------------
// Credential field definitions per platform (used by the connect UI)
// ---------------------------------------------------------------------------

export interface CredentialField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder: string
  helpText?: string
}

export const PLATFORM_CREDENTIAL_FIELDS: Record<ConnectablePlatform, CredentialField[]> = {
  X: [
    { key: 'apiKey', label: 'API Key (Consumer Key)', type: 'password', placeholder: 'Your API key', helpText: 'OAuth 1.0a consumer key from X Developer Portal' },
    { key: 'apiSecret', label: 'API Secret (Consumer Secret)', type: 'password', placeholder: 'Your API secret', helpText: 'OAuth 1.0a consumer secret' },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'User access token', helpText: 'OAuth 1.0a access token with read/write permissions' },
    { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', placeholder: 'User access token secret', helpText: 'Free tier: 50 posts/month' },
  ],
  BLUESKY: [
    { key: 'handle', label: 'Handle', type: 'text', placeholder: 'yourname.bsky.social' },
    { key: 'appPassword', label: 'App Password', type: 'password', placeholder: 'xxxx-xxxx-xxxx-xxxx', helpText: 'Generate at Settings > App Passwords' },
  ],
  MASTODON: [
    { key: 'instanceUrl', label: 'Instance URL', type: 'url', placeholder: 'https://mastodon.social' },
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Your access token', helpText: 'From Preferences > Development > Your Application' },
  ],
  LINKEDIN: [
    { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'AQV...' },
    { key: 'authorUrn', label: 'Author URN', type: 'text', placeholder: 'urn:li:organization:12345', helpText: 'Organization or person URN' },
  ],
  REDDIT: [
    { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Your app client ID' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Your app secret' },
    { key: 'refreshToken', label: 'Refresh Token', type: 'password', placeholder: 'Your refresh token' },
    { key: 'subreddit', label: 'Subreddit', type: 'text', placeholder: 'alternatefutures' },
  ],
  DISCORD: [
    { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://discord.com/api/webhooks/...', helpText: 'From channel Settings > Integrations > Webhooks' },
  ],
  TELEGRAM: [
    { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', helpText: 'From @BotFather' },
    { key: 'chatId', label: 'Chat ID', type: 'text', placeholder: '-1001234567890', helpText: 'Channel or group chat ID' },
  ],
}

// ---------------------------------------------------------------------------
// Platform configuration
// ---------------------------------------------------------------------------

export const PLATFORM_CONFIGS: PlatformOAuthConfig[] = [
  {
    platform: 'X',
    label: 'X (Twitter)',
    description: 'Post tweets and threads via X API v2 with OAuth 1.0a (Free tier: 50 posts/month)',
    authType: 'oauth2',
    requiredEnvVars: ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET'],
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    refreshable: false,
    tokenLifetimeMs: null,
  },
  {
    platform: 'BLUESKY',
    label: 'Bluesky',
    description: 'Post to Bluesky via AT Protocol using app password',
    authType: 'api_key',
    requiredEnvVars: ['BLUESKY_HANDLE', 'BLUESKY_APP_PASSWORD'],
    scopes: [],
    refreshable: false,
    tokenLifetimeMs: null,
  },
  {
    platform: 'MASTODON',
    label: 'Mastodon',
    description: 'Post to any Mastodon instance',
    authType: 'oauth2',
    requiredEnvVars: ['MASTODON_INSTANCE_URL', 'MASTODON_ACCESS_TOKEN'],
    scopes: ['read', 'write:statuses', 'write:media'],
    refreshable: false,
    tokenLifetimeMs: null,
  },
  {
    platform: 'LINKEDIN',
    label: 'LinkedIn',
    description: 'Share posts on LinkedIn company or personal page',
    authType: 'oauth2',
    requiredEnvVars: ['LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_AUTHOR_URN'],
    scopes: ['openid', 'profile', 'w_member_social'],
    refreshable: true,
    tokenLifetimeMs: 60 * 24 * 60 * 60 * 1000, // 60 days
  },
  {
    platform: 'REDDIT',
    label: 'Reddit',
    description: 'Submit posts to subreddits',
    authType: 'oauth2',
    requiredEnvVars: ['REDDIT_CLIENT_ID', 'REDDIT_CLIENT_SECRET', 'REDDIT_REFRESH_TOKEN'],
    scopes: ['submit', 'read', 'identity'],
    refreshable: true,
    tokenLifetimeMs: 60 * 60 * 1000, // 1 hour
  },
  {
    platform: 'DISCORD',
    label: 'Discord',
    description: 'Send messages via Discord webhook',
    authType: 'bot_token',
    requiredEnvVars: ['DISCORD_WEBHOOK_URL'],
    scopes: [],
    refreshable: false,
    tokenLifetimeMs: null,
  },
  {
    platform: 'TELEGRAM',
    label: 'Telegram',
    description: 'Send messages to Telegram channels via bot',
    authType: 'bot_token',
    requiredEnvVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    scopes: [],
    refreshable: false,
    tokenLifetimeMs: null,
  },
]

// ---------------------------------------------------------------------------
// Token refresh logic
// ---------------------------------------------------------------------------

const tokenCache = new Map<ConnectablePlatform, { accessToken: string; expiresAt: number }>()

export async function getValidToken(platform: ConnectablePlatform): Promise<string | null> {
  const cached = tokenCache.get(platform)
  const now = Date.now()
  const bufferMs = 5 * 60 * 1000 // refresh 5 minutes before expiry

  if (cached && cached.expiresAt - bufferMs > now) {
    return cached.accessToken
  }

  const config = PLATFORM_CONFIGS.find((c) => c.platform === platform)
  if (!config) return null

  if (!config.refreshable) {
    return getStaticToken(platform)
  }

  try {
    const result = await refreshToken(platform)
    if (result) {
      tokenCache.set(platform, {
        accessToken: result.accessToken,
        expiresAt: new Date(result.expiresAt).getTime(),
      })
      return result.accessToken
    }
  } catch {
    // Fall back to static token on refresh failure
  }

  return getStaticToken(platform)
}

function getStaticToken(platform: ConnectablePlatform): string | null {
  switch (platform) {
    case 'X':
      return process.env.X_BEARER_TOKEN || null
    case 'BLUESKY':
      return process.env.BLUESKY_APP_PASSWORD || null
    case 'MASTODON':
      return process.env.MASTODON_ACCESS_TOKEN || null
    case 'LINKEDIN':
      return process.env.LINKEDIN_ACCESS_TOKEN || null
    case 'REDDIT':
      return process.env.REDDIT_ACCESS_TOKEN || null
    case 'DISCORD':
      return process.env.DISCORD_WEBHOOK_URL || null
    case 'TELEGRAM':
      return process.env.TELEGRAM_BOT_TOKEN || null
    default:
      return null
  }
}

async function refreshToken(platform: ConnectablePlatform): Promise<TokenRefreshResult | null> {
  switch (platform) {
    case 'REDDIT':
      return refreshRedditToken()
    case 'LINKEDIN':
      return refreshLinkedInToken()
    default:
      return null
  }
}

async function refreshRedditToken(): Promise<TokenRefreshResult | null> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const refreshTokenVal = process.env.REDDIT_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshTokenVal) return null

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'AlternateFutures/1.0',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshTokenVal,
    }).toString(),
  })

  if (!res.ok) return null

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  return { accessToken: data.access_token, expiresAt }
}

async function refreshLinkedInToken(): Promise<TokenRefreshResult | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const refreshTokenVal = process.env.LINKEDIN_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshTokenVal) return null

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshTokenVal,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  })

  if (!res.ok) return null

  const data = await res.json()
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
  }
}

// ---------------------------------------------------------------------------
// URL safety helpers (SSRF prevention for user-supplied URLs)
// ---------------------------------------------------------------------------

function isPrivateOrReservedHost(hostname: string): boolean {
  if (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return true
  }
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [, a, b] = ipv4.map(Number)
    if (a === 127) return true
    if (a === 10) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    if (a === 0) return true
    if (a >= 224) return true
  }
  return false
}

/** Validate a user-supplied URL is safe for server-side fetch (https only, no private IPs). */
function validateExternalUrl(raw: string): { valid: boolean; url?: URL; error?: string } {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return { valid: false, error: 'Invalid URL' }
  }
  if (parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTPS URLs are allowed' }
  }
  if (isPrivateOrReservedHost(parsed.hostname)) {
    return { valid: false, error: 'URL points to a private or reserved address' }
  }
  return { valid: true, url: parsed }
}

// ---------------------------------------------------------------------------
// Connection health check — verifies tokens are still valid
// ---------------------------------------------------------------------------

export async function verifyConnection(platform: ConnectablePlatform): Promise<{
  valid: boolean
  accountName: string | null
  error: string | null
}> {
  switch (platform) {
    case 'BLUESKY': {
      const handle = process.env.BLUESKY_HANDLE
      const appPassword = process.env.BLUESKY_APP_PASSWORD
      if (!handle || !appPassword) return { valid: false, accountName: null, error: 'Credentials not configured' }
      try {
        const res = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: handle, password: appPassword }),
        })
        if (!res.ok) return { valid: false, accountName: handle, error: `Auth failed: ${res.status}` }
        const data = await res.json()
        return { valid: true, accountName: data.handle || handle, error: null }
      } catch (e) {
        return { valid: false, accountName: handle, error: e instanceof Error ? e.message : 'Connection failed' }
      }
    }

    case 'MASTODON': {
      const instanceUrl = process.env.MASTODON_INSTANCE_URL
      const accessToken = process.env.MASTODON_ACCESS_TOKEN
      if (!instanceUrl || !accessToken) return { valid: false, accountName: null, error: 'Credentials not configured' }

      // Validate instance URL to prevent SSRF
      const urlCheck = validateExternalUrl(instanceUrl)
      if (!urlCheck.valid) {
        return { valid: false, accountName: null, error: `Invalid instance URL: ${urlCheck.error}` }
      }

      try {
        const baseUrl = instanceUrl.replace(/\/$/, '')
        const res = await fetch(`${baseUrl}/api/v1/accounts/verify_credentials`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(10000),
        })
        if (!res.ok) return { valid: false, accountName: null, error: `Auth failed: ${res.status}` }
        const data = await res.json()
        return { valid: true, accountName: `@${data.username}@${new URL(baseUrl).hostname}`, error: null }
      } catch (e) {
        return { valid: false, accountName: null, error: e instanceof Error ? e.message : 'Connection failed' }
      }
    }

    case 'DISCORD': {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL
      if (!webhookUrl) return { valid: false, accountName: null, error: 'Webhook URL not configured' }
      try {
        const res = await fetch(webhookUrl)
        if (!res.ok) return { valid: false, accountName: null, error: `Webhook invalid: ${res.status}` }
        const data = await res.json()
        return { valid: true, accountName: `#${data.name || 'webhook'}`, error: null }
      } catch (e) {
        return { valid: false, accountName: null, error: e instanceof Error ? e.message : 'Connection failed' }
      }
    }

    case 'TELEGRAM': {
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) return { valid: false, accountName: null, error: 'Bot token not configured' }
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
        if (!res.ok) return { valid: false, accountName: null, error: `Bot auth failed: ${res.status}` }
        const data = await res.json()
        return { valid: true, accountName: `@${data.result?.username || 'bot'}`, error: null }
      } catch (e) {
        return { valid: false, accountName: null, error: e instanceof Error ? e.message : 'Connection failed' }
      }
    }

    default: {
      const token = getStaticToken(platform)
      return {
        valid: token !== null,
        accountName: null,
        error: token ? null : 'Token not configured',
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Seed connections for dev mode
// ---------------------------------------------------------------------------

const SEED_CONNECTIONS: PlatformConnection[] = [
  {
    platform: 'X',
    status: 'CONNECTED',
    accountName: '@altfutures',
    accountId: '1234567890',
    connectedAt: '2026-01-20T10:00:00Z',
    expiresAt: '2026-07-20T10:00:00Z',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    error: null,
  },
  {
    platform: 'BLUESKY',
    status: 'CONNECTED',
    accountName: 'alternatefutures.bsky.social',
    accountId: 'did:plc:abc123',
    connectedAt: '2026-01-22T14:00:00Z',
    expiresAt: null,
    scopes: [],
    error: null,
  },
  {
    platform: 'MASTODON',
    status: 'DISCONNECTED',
    accountName: null,
    accountId: null,
    connectedAt: null,
    expiresAt: null,
    scopes: [],
    error: null,
  },
  {
    platform: 'LINKEDIN',
    status: 'EXPIRED',
    accountName: 'Alternate Futures',
    accountId: 'urn:li:organization:987654',
    connectedAt: '2025-12-01T09:00:00Z',
    expiresAt: '2026-02-01T09:00:00Z',
    scopes: ['openid', 'profile', 'w_member_social'],
    error: 'Access token expired. Please reconnect.',
  },
  {
    platform: 'REDDIT',
    status: 'DISCONNECTED',
    accountName: null,
    accountId: null,
    connectedAt: null,
    expiresAt: null,
    scopes: [],
    error: null,
  },
  {
    platform: 'DISCORD',
    status: 'CONNECTED',
    accountName: '#announcements',
    accountId: 'webhook:af-announcements',
    connectedAt: '2026-01-25T16:00:00Z',
    expiresAt: null,
    scopes: [],
    error: null,
  },
  {
    platform: 'TELEGRAM',
    status: 'CONNECTED',
    accountName: '@AlternateFuturesBot',
    accountId: 'chat:-1001234567890',
    connectedAt: '2026-01-26T11:00:00Z',
    expiresAt: null,
    scopes: [],
    error: null,
  },
]

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

async function authGraphqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

// ---------------------------------------------------------------------------
// GraphQL queries
// ---------------------------------------------------------------------------

const CONNECTIONS_QUERY = `
  query PlatformConnections {
    platformConnections {
      platform status accountName accountId connectedAt expiresAt scopes error
    }
  }
`

const CONNECT_PLATFORM_MUTATION = `
  mutation ConnectPlatform($platform: String!, $credentials: JSON!) {
    connectPlatform(platform: $platform, credentials: $credentials) {
      platform status accountName accountId connectedAt expiresAt scopes error
    }
  }
`

const DISCONNECT_PLATFORM_MUTATION = `
  mutation DisconnectPlatform($platform: String!) {
    disconnectPlatform(platform: $platform) {
      platform status
    }
  }
`

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

let mockConnections = [...SEED_CONNECTIONS]

export async function fetchPlatformConnections(
  token: string,
): Promise<PlatformConnection[]> {
  try {
    const data = await authGraphqlFetch<{
      platformConnections: PlatformConnection[]
    }>(CONNECTIONS_QUERY, {}, token)
    return data.platformConnections
  } catch {
    if (useSeedData()) return mockConnections
    return PLATFORM_CONFIGS.map((c) => ({
      platform: c.platform,
      status: 'DISCONNECTED' as ConnectionStatus,
      accountName: null,
      accountId: null,
      connectedAt: null,
      expiresAt: null,
      scopes: [],
      error: null,
    }))
  }
}

export async function connectPlatform(
  token: string,
  platform: ConnectablePlatform,
  credentials: Record<string, string>,
): Promise<PlatformConnection> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const config = PLATFORM_CONFIGS.find((c) => c.platform === platform)
    const connection: PlatformConnection = {
      platform,
      status: 'CONNECTED',
      accountName: credentials.accountName || credentials.handle || platform,
      accountId: credentials.accountId || `mock-${platform}`,
      connectedAt: now,
      expiresAt: config?.tokenLifetimeMs
        ? new Date(Date.now() + config.tokenLifetimeMs).toISOString()
        : null,
      scopes: config?.scopes || [],
      error: null,
    }
    const idx = mockConnections.findIndex((c) => c.platform === platform)
    if (idx >= 0) {
      mockConnections[idx] = connection
    } else {
      mockConnections.push(connection)
    }
    return connection
  }

  const data = await authGraphqlFetch<{
    connectPlatform: PlatformConnection
  }>(CONNECT_PLATFORM_MUTATION, { platform, credentials }, token)
  return data.connectPlatform
}

export async function disconnectPlatform(
  token: string,
  platform: ConnectablePlatform,
): Promise<void> {
  // Clear cached token on disconnect
  tokenCache.delete(platform)

  if (useSeedData()) {
    const idx = mockConnections.findIndex((c) => c.platform === platform)
    if (idx >= 0) {
      mockConnections[idx] = {
        ...mockConnections[idx],
        status: 'DISCONNECTED',
        accountName: null,
        accountId: null,
        connectedAt: null,
        expiresAt: null,
        scopes: [],
        error: null,
      }
    }
    return
  }

  await authGraphqlFetch<{ disconnectPlatform: { platform: string } }>(
    DISCONNECT_PLATFORM_MUTATION,
    { platform },
    token,
  )
}

export function getConnectionForPlatform(
  connections: PlatformConnection[],
  platform: ConnectablePlatform,
): PlatformConnection | undefined {
  return connections.find((c) => c.platform === platform)
}

export function isConnected(connection: PlatformConnection): boolean {
  return connection.status === 'CONNECTED'
}

export function isExpired(connection: PlatformConnection): boolean {
  if (connection.status === 'EXPIRED') return true
  if (!connection.expiresAt) return false
  return new Date(connection.expiresAt) <= new Date()
}
