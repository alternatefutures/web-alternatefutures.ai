const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AssetCategory = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'BRAND' | 'PRESENTATION' | 'OTHER'
export type AssetViewMode = 'grid' | 'list'
export type PinStatus = 'UNPINNED' | 'PINNING' | 'PINNED' | 'FAILED'

export interface AssetTag {
  id: string
  name: string
  slug: string
  color: string | null
}

export interface AssetVersion {
  id: string
  assetId: string
  version: number
  filename: string
  url: string
  cid: string | null
  fileSize: number
  uploadedAt: string
  isCurrent: boolean
  changelog: string
}

export interface MarketingAsset {
  id: string
  filename: string
  originalFilename: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  duration: number | null
  url: string
  cid: string | null
  storageType: 'IPFS' | 'ARWEAVE' | 'FILECOIN'
  pinStatus: PinStatus
  thumbnailUrl: string | null
  category: AssetCategory
  folder: string | null
  tags: AssetTag[]
  altText: string | null
  description: string | null
  usageCount: number
  uploadedById: string
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  fileId: string
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface UpdateAssetInput {
  altText?: string
  description?: string
  category?: AssetCategory
  folder?: string
  tagIds?: string[]
}

export interface UploadAssetMetadata {
  category?: AssetCategory
  folder?: string
  altText?: string
  description?: string
}

// ---------------------------------------------------------------------------
// GraphQL queries & mutations
// ---------------------------------------------------------------------------

const ASSET_FIELDS = `
  id filename originalFilename mimeType size width height duration
  url cid storageType pinStatus thumbnailUrl category folder
  tags { id name slug color }
  altText description usageCount uploadedById
  createdAt updatedAt
`

const MARKETING_ASSETS_QUERY = `
  query MarketingAssets($limit: Int, $offset: Int) {
    marketingAssets(limit: $limit, offset: $offset) {
      ${ASSET_FIELDS}
    }
  }
`

const MARKETING_ASSET_BY_ID_QUERY = `
  query MarketingAssetById($id: ID!) {
    marketingAssetById(id: $id) {
      ${ASSET_FIELDS}
    }
  }
`

const MARKETING_ASSET_TAGS_QUERY = `
  query MarketingAssetTags {
    marketingAssetTags { id name slug color }
  }
`

const UPDATE_ASSET_MUTATION = `
  mutation UpdateMarketingAsset($id: ID!, $input: UpdateMarketingAssetInput!) {
    updateMarketingAsset(id: $id, input: $input) {
      ${ASSET_FIELDS}
    }
  }
`

const DELETE_ASSET_MUTATION = `
  mutation DeleteMarketingAsset($id: ID!) {
    deleteMarketingAsset(id: $id) { id }
  }
`

// ---------------------------------------------------------------------------
// Seed data — used in development when the GraphQL API is unreachable
// ---------------------------------------------------------------------------

const SEED_TAGS: AssetTag[] = [
  { id: 'atag-1', name: 'Logo', slug: 'logo', color: '#0026FF' },
  { id: 'atag-2', name: 'Social Media', slug: 'social-media', color: '#00BCD4' },
  { id: 'atag-3', name: 'Blog Header', slug: 'blog-header', color: '#E91E63' },
  { id: 'atag-4', name: 'Icon', slug: 'icon', color: '#FFD600' },
  { id: 'atag-5', name: 'Screenshot', slug: 'screenshot', color: '#4CAF50' },
  { id: 'atag-6', name: 'Pitch Deck', slug: 'pitch-deck', color: '#9C27B0' },
  { id: 'atag-7', name: 'Brand Guidelines', slug: 'brand-guidelines', color: '#FF5722' },
]

const SEED_ASSETS: MarketingAsset[] = [
  {
    id: 'seed-asset-1',
    filename: 'af-logo-blue.svg',
    originalFilename: 'AF Logo Blue.svg',
    mimeType: 'image/svg+xml',
    size: 4256,
    width: 512,
    height: 512,
    duration: null,
    url: 'https://placehold.co/512x512/0026FF/FFFFFF?text=AF',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    storageType: 'IPFS',
    pinStatus: 'PINNED',
    thumbnailUrl: 'https://placehold.co/200x200/0026FF/FFFFFF?text=AF',
    category: 'BRAND',
    folder: 'brand/logos',
    tags: [SEED_TAGS[0], SEED_TAGS[6]],
    altText: 'Alternate Futures logo in blue',
    description: 'Primary logo mark - blue variant on transparent background',
    usageCount: 12,
    uploadedById: 'mock-user-1',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'seed-asset-2',
    filename: 'af-logo-white.svg',
    originalFilename: 'AF Logo White.svg',
    mimeType: 'image/svg+xml',
    size: 4128,
    width: 512,
    height: 512,
    duration: null,
    url: 'https://placehold.co/512x512/1A1A2E/FFFFFF?text=AF',
    cid: null,
    storageType: 'IPFS',
    pinStatus: 'UNPINNED',
    thumbnailUrl: 'https://placehold.co/200x200/1A1A2E/FFFFFF?text=AF',
    category: 'BRAND',
    folder: 'brand/logos',
    tags: [SEED_TAGS[0], SEED_TAGS[6]],
    altText: 'Alternate Futures logo in white on dark',
    description: 'Logo mark - white variant for dark backgrounds',
    usageCount: 8,
    uploadedById: 'mock-user-1',
    createdAt: '2026-01-05T10:05:00Z',
    updatedAt: '2026-01-05T10:05:00Z',
  },
  {
    id: 'seed-asset-3',
    filename: 'blog-hero-decentralized-cloud.jpg',
    originalFilename: 'Decentralized Cloud Hero.jpg',
    mimeType: 'image/jpeg',
    size: 245000,
    width: 1200,
    height: 630,
    duration: null,
    url: 'https://placehold.co/1200x630/0026FF/FFFFFF?text=Decentralized+Cloud',
    cid: null,
    storageType: 'IPFS',
    pinStatus: 'UNPINNED',
    thumbnailUrl: 'https://placehold.co/300x158/0026FF/FFFFFF?text=Decentralized+Cloud',
    category: 'IMAGE',
    folder: 'blog/headers',
    tags: [SEED_TAGS[2]],
    altText: 'Abstract visualization of decentralized cloud infrastructure',
    description: 'Hero image for the "Introducing AF" blog post',
    usageCount: 1,
    uploadedById: 'mock-user-1',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'seed-asset-4',
    filename: 'af-social-banner-x.png',
    originalFilename: 'Twitter Banner.png',
    mimeType: 'image/png',
    size: 89000,
    width: 1500,
    height: 500,
    duration: null,
    url: 'https://placehold.co/1500x500/0026FF/F8F5EE?text=Alternate+Futures',
    cid: null,
    storageType: 'IPFS',
    pinStatus: 'UNPINNED',
    thumbnailUrl: 'https://placehold.co/300x100/0026FF/F8F5EE?text=AF+Banner',
    category: 'IMAGE',
    folder: 'social/banners',
    tags: [SEED_TAGS[1]],
    altText: 'Alternate Futures X/Twitter banner',
    description: 'Banner image for X/Twitter profile',
    usageCount: 1,
    uploadedById: 'mock-user-1',
    createdAt: '2026-01-12T14:00:00Z',
    updatedAt: '2026-01-12T14:00:00Z',
  },
  {
    id: 'seed-asset-5',
    filename: 'pitch-deck-q1-2026.pdf',
    originalFilename: 'AF Pitch Deck Q1 2026.pdf',
    mimeType: 'application/pdf',
    size: 2450000,
    width: null,
    height: null,
    duration: null,
    url: '#',
    cid: null,
    storageType: 'IPFS',
    pinStatus: 'PINNED',
    thumbnailUrl: 'https://placehold.co/200x260/607D8B/FFFFFF?text=PDF',
    category: 'PRESENTATION',
    folder: 'pitch-deck',
    tags: [SEED_TAGS[5]],
    altText: 'Alternate Futures Q1 2026 Pitch Deck',
    description: 'Investor pitch deck for Q1 2026 fundraising',
    usageCount: 3,
    uploadedById: 'mock-user-1',
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'seed-asset-6',
    filename: 'dashboard-screenshot-v2.png',
    originalFilename: 'Dashboard Screenshot v2.png',
    mimeType: 'image/png',
    size: 342000,
    width: 1920,
    height: 1080,
    duration: null,
    url: 'https://placehold.co/1920x1080/F8F5EE/0026FF?text=Dashboard',
    cid: null,
    storageType: 'IPFS',
    pinStatus: 'UNPINNED',
    thumbnailUrl: 'https://placehold.co/320x180/F8F5EE/0026FF?text=Dashboard',
    category: 'IMAGE',
    folder: 'screenshots',
    tags: [SEED_TAGS[4]],
    altText: 'Alternate Futures dashboard showing deployment overview',
    description: 'Latest dashboard screenshot for marketing materials',
    usageCount: 5,
    uploadedById: 'mock-user-1',
    createdAt: '2026-02-01T15:00:00Z',
    updatedAt: '2026-02-01T15:00:00Z',
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
// In-memory mock store for seed mode
// ---------------------------------------------------------------------------

let mockAssets = [...SEED_ASSETS]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

export async function fetchAllAssets(
  token: string,
  limit = 100,
  offset = 0,
): Promise<MarketingAsset[]> {
  try {
    const data = await authGraphqlFetch<{ marketingAssets: MarketingAsset[] }>(
      MARKETING_ASSETS_QUERY,
      { limit, offset },
      token,
    )
    return data.marketingAssets
  } catch {
    if (useSeedData()) return mockAssets.slice(offset, offset + limit)
    return []
  }
}

export async function fetchAssetById(
  token: string,
  id: string,
): Promise<MarketingAsset | null> {
  try {
    const data = await authGraphqlFetch<{ marketingAssetById: MarketingAsset }>(
      MARKETING_ASSET_BY_ID_QUERY,
      { id },
      token,
    )
    return data.marketingAssetById
  } catch {
    if (useSeedData()) return mockAssets.find((a) => a.id === id) || null
    return null
  }
}

export async function fetchAssetTags(
  token: string,
): Promise<AssetTag[]> {
  try {
    const data = await authGraphqlFetch<{ marketingAssetTags: AssetTag[] }>(
      MARKETING_ASSET_TAGS_QUERY,
      {},
      token,
    )
    return data.marketingAssetTags
  } catch {
    if (useSeedData()) return SEED_TAGS
    return []
  }
}

export async function updateAssetMetadata(
  token: string,
  id: string,
  input: UpdateAssetInput,
): Promise<MarketingAsset> {
  if (useSeedData()) {
    const idx = mockAssets.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Asset not found')
    const existing = mockAssets[idx]
    const updated: MarketingAsset = {
      ...existing,
      altText: input.altText !== undefined ? input.altText : existing.altText,
      description: input.description !== undefined ? input.description : existing.description,
      category: input.category !== undefined ? input.category : existing.category,
      folder: input.folder !== undefined ? input.folder : existing.folder,
      tags: input.tagIds
        ? SEED_TAGS.filter((t) => input.tagIds!.includes(t.id))
        : existing.tags,
      updatedAt: new Date().toISOString(),
    }
    mockAssets[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateMarketingAsset: MarketingAsset }>(
    UPDATE_ASSET_MUTATION,
    { id, input },
    token,
  )
  return data.updateMarketingAsset
}

export async function deleteAsset(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockAssets = mockAssets.filter((a) => a.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteMarketingAsset: { id: string } }>(
    DELETE_ASSET_MUTATION,
    { id },
    token,
  )
}

export async function uploadAsset(
  token: string,
  file: File,
  metadata: UploadAssetMetadata,
  onProgress?: (progress: UploadProgress) => void,
): Promise<MarketingAsset> {
  const fileId = `seed-asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  if (useSeedData()) {
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 10
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)

          onProgress?.({
            fileId,
            filename: file.name,
            progress: 100,
            status: 'processing',
          })

          // Simulate processing delay
          setTimeout(() => {
            const isImage = file.type.startsWith('image/')
            const objectUrl = URL.createObjectURL(file)
            const now = new Date().toISOString()

            const asset: MarketingAsset = {
              id: fileId,
              filename: file.name.toLowerCase().replace(/\s+/g, '-'),
              originalFilename: file.name,
              mimeType: file.type,
              size: file.size,
              width: isImage ? 800 : null,
              height: isImage ? 600 : null,
              duration: null,
              url: objectUrl,
              cid: null,
              storageType: 'IPFS',
              pinStatus: 'UNPINNED',
              thumbnailUrl: isImage ? objectUrl : null,
              category: metadata.category || categorizeByMimeType(file.type),
              folder: metadata.folder || null,
              tags: [],
              altText: metadata.altText || null,
              description: metadata.description || null,
              usageCount: 0,
              uploadedById: 'mock-user-1',
              createdAt: now,
              updatedAt: now,
            }

            mockAssets = [asset, ...mockAssets]

            onProgress?.({
              fileId,
              filename: file.name,
              progress: 100,
              status: 'complete',
            })

            resolve(asset)
          }, 500)
        } else {
          onProgress?.({
            fileId,
            filename: file.name,
            progress: Math.min(progress, 99),
            status: 'uploading',
          })
        }
      }, 200)
    })
  }

  // Production: multipart upload to API
  const formData = new FormData()
  formData.append('file', file)
  formData.append('metadata', JSON.stringify(metadata))

  const res = await fetch(`${API_URL.replace('/graphql', '')}/upload/asset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`)
  }

  const data = await res.json()
  return data.asset
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function categorizeByMimeType(mimeType: string): AssetCategory {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (mimeType === 'application/pdf') return 'DOCUMENT'
  if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint') ||
    mimeType.includes('keynote')
  ) return 'PRESENTATION'
  if (
    mimeType.includes('document') ||
    mimeType.includes('text/') ||
    mimeType.includes('spreadsheet')
  ) return 'DOCUMENT'
  return 'OTHER'
}

// ---------------------------------------------------------------------------
// Seed version data
// ---------------------------------------------------------------------------

const SEED_VERSIONS: AssetVersion[] = [
  // Logo — 3 versions
  {
    id: 'ver-1a',
    assetId: 'seed-asset-1',
    version: 1,
    filename: 'af-logo-blue-v1.svg',
    url: 'https://placehold.co/512x512/0026FF/FFFFFF?text=AF+v1',
    cid: 'QmRoughDraft1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    fileSize: 3800,
    uploadedAt: '2025-12-15T09:00:00Z',
    isCurrent: false,
    changelog: 'Rough draft — initial concept with geometric shapes',
  },
  {
    id: 'ver-1b',
    assetId: 'seed-asset-1',
    version: 2,
    filename: 'af-logo-blue-v2.svg',
    url: 'https://placehold.co/512x512/0026FF/FFFFFF?text=AF+v2',
    cid: 'QmRefinedV2bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    fileSize: 4100,
    uploadedAt: '2025-12-28T14:30:00Z',
    isCurrent: false,
    changelog: 'Refined proportions, updated stroke weights',
  },
  {
    id: 'ver-1c',
    assetId: 'seed-asset-1',
    version: 3,
    filename: 'af-logo-blue.svg',
    url: 'https://placehold.co/512x512/0026FF/FFFFFF?text=AF',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    fileSize: 4256,
    uploadedAt: '2026-01-05T10:00:00Z',
    isCurrent: true,
    changelog: 'Final version — approved by brand team',
  },
  // Pitch deck — 2 versions
  {
    id: 'ver-5a',
    assetId: 'seed-asset-5',
    version: 1,
    filename: 'pitch-deck-q1-2026-draft.pdf',
    url: '#',
    cid: null,
    fileSize: 1980000,
    uploadedAt: '2026-01-15T11:00:00Z',
    isCurrent: false,
    changelog: 'Initial draft for internal review',
  },
  {
    id: 'ver-5b',
    assetId: 'seed-asset-5',
    version: 2,
    filename: 'pitch-deck-q1-2026.pdf',
    url: '#',
    cid: 'QmPitchDeckV2ccccccccccccccccccccccccccccccc',
    fileSize: 2450000,
    uploadedAt: '2026-01-20T09:00:00Z',
    isCurrent: true,
    changelog: 'Investor update — added traction metrics and competitive analysis',
  },
  // Dashboard screenshot — 2 versions
  {
    id: 'ver-6a',
    assetId: 'seed-asset-6',
    version: 1,
    filename: 'dashboard-screenshot-v1.png',
    url: 'https://placehold.co/1920x1080/F8F5EE/0026FF?text=Dashboard+v1',
    cid: null,
    fileSize: 298000,
    uploadedAt: '2026-01-28T10:00:00Z',
    isCurrent: false,
    changelog: 'First dashboard capture before design refresh',
  },
  {
    id: 'ver-6b',
    assetId: 'seed-asset-6',
    version: 2,
    filename: 'dashboard-screenshot-v2.png',
    url: 'https://placehold.co/1920x1080/F8F5EE/0026FF?text=Dashboard',
    cid: null,
    fileSize: 342000,
    uploadedAt: '2026-02-01T15:00:00Z',
    isCurrent: true,
    changelog: 'Updated with soft brutalism design refresh',
  },
]

let mockVersions = [...SEED_VERSIONS]

// ---------------------------------------------------------------------------
// IPFS pinning & version control
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// IPFS Gateway configuration
// ---------------------------------------------------------------------------

export type IpfsGateway = {
  name: string
  label: string
  buildUrl: (cid: string) => string
  supportsTransforms: boolean
  transformDocs?: string
}

export const IPFS_GATEWAYS: IpfsGateway[] = [
  {
    name: 'cloudflare',
    label: 'Cloudflare IPFS',
    buildUrl: (cid) => `https://cloudflare-ipfs.com/ipfs/${cid}`,
    supportsTransforms: true,
    transformDocs: 'https://developers.cloudflare.com/images/transform-images/',
  },
  {
    name: 'cf-ipfs',
    label: 'CF-IPFS.com',
    buildUrl: (cid) => `https://cf-ipfs.com/ipfs/${cid}`,
    supportsTransforms: true,
  },
  {
    name: 'w3s',
    label: 'W3S Link',
    buildUrl: (cid) => `https://${cid}.ipfs.w3s.link`,
    supportsTransforms: false,
  },
  {
    name: 'dweb',
    label: 'dweb.link',
    buildUrl: (cid) => `https://${cid}.ipfs.dweb.link`,
    supportsTransforms: false,
  },
  {
    name: 'ipfs-io',
    label: 'ipfs.io (public)',
    buildUrl: (cid) => `https://ipfs.io/ipfs/${cid}`,
    supportsTransforms: false,
  },
]

export function getDefaultGateway(): IpfsGateway {
  return IPFS_GATEWAYS[0] // Cloudflare — supports transforms
}

export function getIpfsGatewayUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`
}

/** Build a CDN URL with optional image transforms. Only applies transforms for gateways that support them. */
export function buildIpfsCdnUrl(
  cid: string,
  gateway: IpfsGateway,
  transforms?: {
    width?: string
    height?: string
    format?: string
    quality?: string
    fit?: string
    dpr?: string
  },
): string {
  const base = gateway.buildUrl(cid)

  if (!transforms || !gateway.supportsTransforms) {
    return base
  }

  // Cloudflare-style image resizing via /cdn-cgi/image/ prefix
  const parts: string[] = []
  if (transforms.width) parts.push(`w=${transforms.width}`)
  if (transforms.height) parts.push(`h=${transforms.height}`)
  if (transforms.format && transforms.format !== 'auto') parts.push(`f=${transforms.format}`)
  if (transforms.quality && transforms.quality !== '80') parts.push(`q=${transforms.quality}`)
  if (transforms.fit && transforms.fit !== 'cover') parts.push(`fit=${transforms.fit}`)
  if (transforms.dpr && transforms.dpr !== '1') parts.push(`dpr=${transforms.dpr}`)

  if (parts.length === 0) return base

  // For Cloudflare gateways, use /cdn-cgi/image/ transform prefix
  if (gateway.name === 'cloudflare' || gateway.name === 'cf-ipfs') {
    const url = new URL(base)
    return `${url.origin}/cdn-cgi/image/${parts.join(',')}${url.pathname}`
  }

  // Fallback: append as query params (won't be processed but preserves intent)
  return `${base}?${parts.join('&')}`
}

export async function pinAssetToIpfs(
  token: string,
  id: string,
): Promise<MarketingAsset> {
  if (useSeedData()) {
    const idx = mockAssets.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Asset not found')

    // Set status to PINNING
    mockAssets[idx] = { ...mockAssets[idx], pinStatus: 'PINNING', updatedAt: new Date().toISOString() }

    // Simulate pinning delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const cid = `Qm${id.replace(/-/g, '')}${Math.random().toString(36).slice(2, 14)}`
        mockAssets[idx] = {
          ...mockAssets[idx],
          pinStatus: 'PINNED',
          cid,
          updatedAt: new Date().toISOString(),
        }
        resolve(mockAssets[idx])
      }, 1500)
    })
  }

  const data = await authGraphqlFetch<{ pinMarketingAsset: MarketingAsset }>(
    `mutation PinAsset($id: ID!) { pinMarketingAsset(id: $id) { ${ASSET_FIELDS} pinStatus } }`,
    { id },
    token,
  )
  return data.pinMarketingAsset
}

export async function fetchAssetVersions(
  token: string,
  assetId: string,
): Promise<AssetVersion[]> {
  if (useSeedData()) {
    return mockVersions
      .filter((v) => v.assetId === assetId)
      .sort((a, b) => b.version - a.version)
  }

  const data = await authGraphqlFetch<{ assetVersions: AssetVersion[] }>(
    `query AssetVersions($assetId: ID!) { assetVersions(assetId: $assetId) { id assetId version filename url cid fileSize uploadedAt isCurrent changelog } }`,
    { assetId },
    token,
  )
  return data.assetVersions
}

export async function uploadAssetVersion(
  token: string,
  assetId: string,
  file: File,
  changelog: string,
): Promise<AssetVersion> {
  if (useSeedData()) {
    const existing = mockVersions.filter((v) => v.assetId === assetId)
    const maxVersion = existing.reduce((max, v) => Math.max(max, v.version), 0)

    // Mark all existing versions as not current
    mockVersions = mockVersions.map((v) =>
      v.assetId === assetId ? { ...v, isCurrent: false } : v,
    )

    const newVersion: AssetVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      assetId,
      version: maxVersion + 1,
      filename: file.name,
      url: URL.createObjectURL(file),
      cid: null,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      isCurrent: true,
      changelog,
    }

    mockVersions = [...mockVersions, newVersion]

    // Update the main asset record
    const assetIdx = mockAssets.findIndex((a) => a.id === assetId)
    if (assetIdx !== -1) {
      mockAssets[assetIdx] = {
        ...mockAssets[assetIdx],
        filename: file.name,
        size: file.size,
        updatedAt: new Date().toISOString(),
      }
    }

    return newVersion
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('changelog', changelog)

  const res = await fetch(`${API_URL.replace('/graphql', '')}/assets/${assetId}/versions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!res.ok) throw new Error(`Version upload failed: ${res.status}`)
  const data = await res.json()
  return data.version
}

export async function setCurrentVersion(
  token: string,
  assetId: string,
  versionId: string,
): Promise<AssetVersion> {
  if (useSeedData()) {
    mockVersions = mockVersions.map((v) =>
      v.assetId === assetId
        ? { ...v, isCurrent: v.id === versionId }
        : v,
    )
    const version = mockVersions.find((v) => v.id === versionId)
    if (!version) throw new Error('Version not found')

    // Update the main asset with this version's data
    const assetIdx = mockAssets.findIndex((a) => a.id === assetId)
    if (assetIdx !== -1) {
      mockAssets[assetIdx] = {
        ...mockAssets[assetIdx],
        filename: version.filename,
        url: version.url,
        cid: version.cid,
        size: version.fileSize,
        updatedAt: new Date().toISOString(),
      }
    }

    return version
  }

  const data = await authGraphqlFetch<{ setCurrentAssetVersion: AssetVersion }>(
    `mutation SetCurrentVersion($assetId: ID!, $versionId: ID!) { setCurrentAssetVersion(assetId: $assetId, versionId: $versionId) { id assetId version filename url cid fileSize uploadedAt isCurrent changelog } }`,
    { assetId, versionId },
    token,
  )
  return data.setCurrentAssetVersion
}

// Re-export seed data for use in mock mode
export { SEED_TAGS, SEED_ASSETS }
