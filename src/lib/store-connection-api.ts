const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type StoreProvider =
  | 'shopify'
  | 'gumroad'
  | 'printful'
  | 'gelato'
  | 'woocommerce'
  | 'lemon-squeezy'

export type ConnectionStatus = 'connected' | 'disconnected' | 'error'

export interface StoreConnection {
  id: string
  provider: StoreProvider
  storeName: string
  storeUrl: string
  apiKey: string
  status: ConnectionStatus
  lastSyncAt: string | null
  productCount: number
}

export interface CreateStoreConnectionInput {
  provider: StoreProvider
  storeName: string
  storeUrl: string
  apiKey: string
}

export interface UpdateStoreConnectionInput {
  storeName?: string
  storeUrl?: string
  apiKey?: string
  status?: ConnectionStatus
}

// ===========================================================================
// Seed data — 3 connected stores
// ===========================================================================

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}

const SEED_CONNECTIONS: StoreConnection[] = [
  {
    id: 'store-1',
    provider: 'shopify',
    storeName: 'AF Merch Store',
    storeUrl: 'https://af-merch.myshopify.com',
    apiKey: maskApiKey('shpat_1a2b3c4d5e6f7g8h9i0j'),
    status: 'connected',
    lastSyncAt: '2026-02-15T08:30:00Z',
    productCount: 8,
  },
  {
    id: 'store-2',
    provider: 'gumroad',
    storeName: 'AF Digital Products',
    storeUrl: 'https://alternatefutures.gumroad.com',
    apiKey: maskApiKey('gumroad_live_abcdef123456789'),
    status: 'connected',
    lastSyncAt: '2026-02-15T06:00:00Z',
    productCount: 4,
  },
  {
    id: 'store-3',
    provider: 'printful',
    storeName: 'AF Print-on-Demand',
    storeUrl: 'https://www.printful.com/dashboard',
    apiKey: maskApiKey('pf_tok_xyz987654321abcdef'),
    status: 'connected',
    lastSyncAt: '2026-02-14T22:00:00Z',
    productCount: 6,
  },
]

// ===========================================================================
// Helpers
// ===========================================================================

function useSeedData(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_SEED_DATA === 'true' ||
    process.env.NODE_ENV === 'development'
  )
}

// ===========================================================================
// GraphQL
// ===========================================================================

const CONNECTION_FIELDS = `
  id provider storeName storeUrl apiKey status lastSyncAt productCount
`

const ALL_CONNECTIONS_QUERY = `
  query StoreConnections {
    storeConnections {
      ${CONNECTION_FIELDS}
    }
  }
`

const CONNECTION_BY_ID_QUERY = `
  query StoreConnection($id: ID!) {
    storeConnection(id: $id) {
      ${CONNECTION_FIELDS}
    }
  }
`

const CREATE_CONNECTION_MUTATION = `
  mutation CreateStoreConnection($input: CreateStoreConnectionInput!) {
    createStoreConnection(input: $input) {
      ${CONNECTION_FIELDS}
    }
  }
`

const UPDATE_CONNECTION_MUTATION = `
  mutation UpdateStoreConnection($id: ID!, $input: UpdateStoreConnectionInput!) {
    updateStoreConnection(id: $id, input: $input) {
      ${CONNECTION_FIELDS}
    }
  }
`

const DELETE_CONNECTION_MUTATION = `
  mutation DeleteStoreConnection($id: ID!) {
    deleteStoreConnection(id: $id) { id }
  }
`

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

// ===========================================================================
// In-memory mock store
// ===========================================================================

let mockConnections = [...SEED_CONNECTIONS]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllConnections(
  token: string,
): Promise<StoreConnection[]> {
  try {
    const data = await authGraphqlFetch<{ storeConnections: StoreConnection[] }>(
      ALL_CONNECTIONS_QUERY,
      {},
      token,
    )
    return data.storeConnections
  } catch {
    if (useSeedData()) return mockConnections
    return []
  }
}

export async function fetchConnectionById(
  token: string,
  id: string,
): Promise<StoreConnection | null> {
  try {
    const data = await authGraphqlFetch<{ storeConnection: StoreConnection }>(
      CONNECTION_BY_ID_QUERY,
      { id },
      token,
    )
    return data.storeConnection
  } catch {
    if (useSeedData()) return mockConnections.find((c) => c.id === id) || null
    return null
  }
}

export async function createConnection(
  token: string,
  input: CreateStoreConnectionInput,
): Promise<StoreConnection> {
  if (useSeedData()) {
    const conn: StoreConnection = {
      id: `store-${Date.now()}`,
      provider: input.provider,
      storeName: input.storeName,
      storeUrl: input.storeUrl,
      apiKey: maskApiKey(input.apiKey),
      status: 'connected',
      lastSyncAt: new Date().toISOString(),
      productCount: 0,
    }
    mockConnections = [conn, ...mockConnections]
    return conn
  }

  const data = await authGraphqlFetch<{ createStoreConnection: StoreConnection }>(
    CREATE_CONNECTION_MUTATION,
    { input },
    token,
  )
  return data.createStoreConnection
}

export async function updateConnection(
  token: string,
  id: string,
  input: UpdateStoreConnectionInput,
): Promise<StoreConnection> {
  if (useSeedData()) {
    const idx = mockConnections.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Connection not found')
    const updated: StoreConnection = {
      ...mockConnections[idx],
      ...input,
      apiKey: input.apiKey
        ? maskApiKey(input.apiKey)
        : mockConnections[idx].apiKey,
    }
    mockConnections[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateStoreConnection: StoreConnection }>(
    UPDATE_CONNECTION_MUTATION,
    { id, input },
    token,
  )
  return data.updateStoreConnection
}

export async function deleteConnection(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockConnections = mockConnections.filter((c) => c.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteStoreConnection: { id: string } }>(
    DELETE_CONNECTION_MUTATION,
    { id },
    token,
  )
}

// Provider display info
export const PROVIDER_INFO: Record<
  StoreProvider,
  { label: string; color: string; bg: string }
> = {
  shopify: { label: 'Shopify', color: '#5E8E3E', bg: '#E8F5E2' },
  gumroad: { label: 'Gumroad', color: '#FF90E8', bg: '#FFF0FB' },
  printful: { label: 'Printful', color: '#E44B26', bg: '#FDE8E4' },
  gelato: { label: 'Gelato', color: '#1A1A2E', bg: '#E8E8F0' },
  woocommerce: { label: 'WooCommerce', color: '#7F54B3', bg: '#F0E8F8' },
  'lemon-squeezy': { label: 'Lemon Squeezy', color: '#FFC233', bg: '#FFF8E1' },
}

// Re-export seed data
export { SEED_CONNECTIONS }
