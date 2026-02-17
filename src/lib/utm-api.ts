import type { SocialPlatform } from './social-api'
import type { ExpandedPlatform } from './campaign-api'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UtmPreset {
  id: string
  name: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string
  utm_content: string
  createdAt: string
  updatedAt: string
  /** Number of times this preset has been applied to posts */
  usageCount: number
}

export interface CreateUtmPresetInput {
  name: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term?: string
  utm_content?: string
}

export interface UpdateUtmPresetInput {
  name?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

// ---------------------------------------------------------------------------
// UTM parameter validation
// ---------------------------------------------------------------------------

/** Characters allowed in UTM parameter values: alphanumeric, hyphens, underscores, dots, plus signs */
const UTM_PARAM_PATTERN = /^[a-zA-Z0-9\-_.+]+$/

/** Validate a single UTM parameter value — no spaces, URL-safe chars only */
export function isValidUtmParam(value: string): boolean {
  if (!value) return true // empty is ok (optional fields)
  return UTM_PARAM_PATTERN.test(value)
}

/** Validate all UTM fields on a preset input, returning the first error found or null */
export function validateUtmInput(
  input: CreateUtmPresetInput | UpdateUtmPresetInput,
): string | null {
  const fields: { key: string; label: string; value?: string }[] = [
    { key: 'utm_source', label: 'utm_source', value: input.utm_source },
    { key: 'utm_medium', label: 'utm_medium', value: input.utm_medium },
    { key: 'utm_campaign', label: 'utm_campaign', value: input.utm_campaign },
    { key: 'utm_term', label: 'utm_term', value: input.utm_term },
    { key: 'utm_content', label: 'utm_content', value: input.utm_content },
  ]

  for (const f of fields) {
    if (f.value !== undefined && f.value !== '' && !isValidUtmParam(f.value)) {
      return `${f.label} contains invalid characters. Use only letters, numbers, hyphens, underscores, dots, and plus signs.`
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Platform defaults — auto-set utm_source per platform
// ---------------------------------------------------------------------------

export const PLATFORM_UTM_DEFAULTS: Record<ExpandedPlatform, { utm_source: string; utm_medium: string }> = {
  X: { utm_source: 'twitter', utm_medium: 'social' },
  BLUESKY: { utm_source: 'bluesky', utm_medium: 'social' },
  LINKEDIN: { utm_source: 'linkedin', utm_medium: 'social' },
  REDDIT: { utm_source: 'reddit', utm_medium: 'social' },
  DISCORD: { utm_source: 'discord', utm_medium: 'social' },
  TELEGRAM: { utm_source: 'telegram', utm_medium: 'social' },
  THREADS: { utm_source: 'threads', utm_medium: 'social' },
  INSTAGRAM: { utm_source: 'instagram', utm_medium: 'social' },
  FACEBOOK: { utm_source: 'facebook', utm_medium: 'social' },
  PINTEREST: { utm_source: 'pinterest', utm_medium: 'social' },
  TIKTOK: { utm_source: 'tiktok', utm_medium: 'social' },
  YOUTUBE: { utm_source: 'youtube', utm_medium: 'social' },
  GOOGLE_BUSINESS: { utm_source: 'google_business', utm_medium: 'social' },
  FARCASTER: { utm_source: 'farcaster', utm_medium: 'social' },
  LENS: { utm_source: 'lens', utm_medium: 'social' },
  MASTODON: { utm_source: 'mastodon', utm_medium: 'social' },
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const UTM_PRESET_FIELDS = `
  id name
  utm_source utm_medium utm_campaign utm_term utm_content
  createdAt updatedAt usageCount
`

const UTM_PRESETS_QUERY = `
  query UtmPresets {
    utmPresets {
      ${UTM_PRESET_FIELDS}
    }
  }
`

const UTM_PRESET_BY_ID_QUERY = `
  query UtmPresetById($id: ID!) {
    utmPresetById(id: $id) {
      ${UTM_PRESET_FIELDS}
    }
  }
`

const CREATE_UTM_PRESET_MUTATION = `
  mutation CreateUtmPreset($input: CreateUtmPresetInput!) {
    createUtmPreset(input: $input) {
      ${UTM_PRESET_FIELDS}
    }
  }
`

const UPDATE_UTM_PRESET_MUTATION = `
  mutation UpdateUtmPreset($id: ID!, $input: UpdateUtmPresetInput!) {
    updateUtmPreset(id: $id, input: $input) {
      ${UTM_PRESET_FIELDS}
    }
  }
`

const DELETE_UTM_PRESET_MUTATION = `
  mutation DeleteUtmPreset($id: ID!) {
    deleteUtmPreset(id: $id) { id }
  }
`

const INCREMENT_UTM_PRESET_USAGE_MUTATION = `
  mutation IncrementUtmPresetUsage($id: ID!) {
    incrementUtmPresetUsage(id: $id) { id usageCount }
  }
`

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_UTM_PRESETS: UtmPreset[] = [
  {
    id: 'utm-preset-1',
    name: 'Launch Campaign',
    utm_source: 'social',
    utm_medium: 'organic',
    utm_campaign: 'launch-2026',
    utm_term: '',
    utm_content: 'announcement',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    usageCount: 14,
  },
  {
    id: 'utm-preset-2',
    name: 'Blog Distribution',
    utm_source: 'social',
    utm_medium: 'organic',
    utm_campaign: 'blog-promo',
    utm_term: '',
    utm_content: 'blog-post',
    createdAt: '2026-01-15T12:00:00Z',
    updatedAt: '2026-01-15T12:00:00Z',
    usageCount: 8,
  },
  {
    id: 'utm-preset-3',
    name: 'Deploy Guides Promo',
    utm_source: 'social',
    utm_medium: 'organic',
    utm_campaign: 'deploy-guides',
    utm_term: 'developer',
    utm_content: 'tutorial',
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    usageCount: 5,
  },
  {
    id: 'utm-preset-4',
    name: 'Paid Ads — LinkedIn',
    utm_source: 'linkedin',
    utm_medium: 'cpc',
    utm_campaign: 'enterprise-outreach',
    utm_term: 'decentralized+cloud',
    utm_content: 'ad-v1',
    createdAt: '2026-02-05T14:00:00Z',
    updatedAt: '2026-02-05T14:00:00Z',
    usageCount: 2,
  },
]

function useSeedData(): boolean {
  return process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
}

// ---------------------------------------------------------------------------
// GraphQL client (authenticated)
// ---------------------------------------------------------------------------

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
// In-memory mock store
// ---------------------------------------------------------------------------

let mockPresets = [...SEED_UTM_PRESETS]

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

/** Build a full URL with UTM parameters appended */
export function buildUtmUrl(
  baseUrl: string,
  params: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
  },
): string {
  if (!baseUrl) return ''
  try {
    const url = new URL(baseUrl)
    if (params.utm_source) url.searchParams.set('utm_source', params.utm_source)
    if (params.utm_medium) url.searchParams.set('utm_medium', params.utm_medium)
    if (params.utm_campaign) url.searchParams.set('utm_campaign', params.utm_campaign)
    if (params.utm_term) url.searchParams.set('utm_term', params.utm_term)
    if (params.utm_content) url.searchParams.set('utm_content', params.utm_content)
    return url.toString()
  } catch {
    // If not a valid URL, just append query string
    const parts = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    if (parts.length === 0) return baseUrl
    const sep = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${sep}${parts.join('&')}`
  }
}

/** Merge a preset with platform defaults (preset values take precedence when non-empty) */
export function mergePresetWithPlatform(
  preset: UtmPreset | null,
  platform: ExpandedPlatform,
): { utm_source: string; utm_medium: string; utm_campaign: string; utm_term: string; utm_content: string } {
  const defaults = PLATFORM_UTM_DEFAULTS[platform]
  if (!preset) {
    return { utm_source: defaults.utm_source, utm_medium: defaults.utm_medium, utm_campaign: '', utm_term: '', utm_content: '' }
  }
  return {
    utm_source: preset.utm_source || defaults.utm_source,
    utm_medium: preset.utm_medium || defaults.utm_medium,
    utm_campaign: preset.utm_campaign,
    utm_term: preset.utm_term,
    utm_content: preset.utm_content,
  }
}

// ---------------------------------------------------------------------------
// CRUD functions — GraphQL with seed-data fallback
// ---------------------------------------------------------------------------

export async function fetchAllUtmPresets(token: string): Promise<UtmPreset[]> {
  if (useSeedData()) {
    return [...mockPresets].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  try {
    const data = await authGraphqlFetch<{ utmPresets: UtmPreset[] }>(
      UTM_PRESETS_QUERY,
      {},
      token,
    )
    return data.utmPresets
  } catch {
    // Fallback to seed data if GraphQL is unreachable
    if (process.env.NODE_ENV !== 'production') {
      return [...mockPresets].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    }
    return []
  }
}

export async function fetchUtmPresetById(
  token: string,
  id: string,
): Promise<UtmPreset | null> {
  if (useSeedData()) {
    return mockPresets.find((p) => p.id === id) || null
  }

  try {
    const data = await authGraphqlFetch<{ utmPresetById: UtmPreset }>(
      UTM_PRESET_BY_ID_QUERY,
      { id },
      token,
    )
    return data.utmPresetById
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      return mockPresets.find((p) => p.id === id) || null
    }
    return null
  }
}

export async function createUtmPreset(
  token: string,
  input: CreateUtmPresetInput,
): Promise<UtmPreset> {
  const validationError = validateUtmInput(input)
  if (validationError) throw new Error(validationError)

  if (useSeedData()) {
    const now = new Date().toISOString()
    const preset: UtmPreset = {
      id: `utm-preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
      utm_term: input.utm_term || '',
      utm_content: input.utm_content || '',
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    }
    mockPresets = [preset, ...mockPresets]
    return preset
  }

  const data = await authGraphqlFetch<{ createUtmPreset: UtmPreset }>(
    CREATE_UTM_PRESET_MUTATION,
    { input },
    token,
  )
  return data.createUtmPreset
}

export async function updateUtmPreset(
  token: string,
  id: string,
  input: UpdateUtmPresetInput,
): Promise<UtmPreset> {
  const validationError = validateUtmInput(input)
  if (validationError) throw new Error(validationError)

  if (useSeedData()) {
    const idx = mockPresets.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Preset not found')
    const existing = mockPresets[idx]
    const updated: UtmPreset = {
      ...existing,
      name: input.name !== undefined ? input.name : existing.name,
      utm_source: input.utm_source !== undefined ? input.utm_source : existing.utm_source,
      utm_medium: input.utm_medium !== undefined ? input.utm_medium : existing.utm_medium,
      utm_campaign: input.utm_campaign !== undefined ? input.utm_campaign : existing.utm_campaign,
      utm_term: input.utm_term !== undefined ? input.utm_term : existing.utm_term,
      utm_content: input.utm_content !== undefined ? input.utm_content : existing.utm_content,
      updatedAt: new Date().toISOString(),
    }
    mockPresets[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateUtmPreset: UtmPreset }>(
    UPDATE_UTM_PRESET_MUTATION,
    { id, input },
    token,
  )
  return data.updateUtmPreset
}

export async function deleteUtmPreset(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockPresets = mockPresets.filter((p) => p.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteUtmPreset: { id: string } }>(
    DELETE_UTM_PRESET_MUTATION,
    { id },
    token,
  )
}

export async function incrementUtmPresetUsage(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    const idx = mockPresets.findIndex((p) => p.id === id)
    if (idx !== -1) {
      mockPresets[idx] = { ...mockPresets[idx], usageCount: mockPresets[idx].usageCount + 1 }
    }
    return
  }

  await authGraphqlFetch<{ incrementUtmPresetUsage: { id: string; usageCount: number } }>(
    INCREMENT_UTM_PRESET_USAGE_MUTATION,
    { id },
    token,
  )
}

export { SEED_UTM_PRESETS }
