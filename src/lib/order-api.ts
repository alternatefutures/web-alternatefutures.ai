const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type StoreProvider =
  | 'shopify'
  | 'gumroad'
  | 'printful'
  | 'gelato'
  | 'woocommerce'
  | 'lemon-squeezy'

export interface OrderItem {
  productName: string
  variant: string | null
  quantity: number
  unitPrice: number
  sku: string
}

export interface ShippingAddress {
  name: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  storeProvider: StoreProvider
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  total: number
  currency: string
  status: OrderStatus
  shippingAddress: ShippingAddress | null
  trackingNumber: string | null
  createdAt: string
}

export interface UpdateOrderInput {
  status?: OrderStatus
  trackingNumber?: string
}

// ===========================================================================
// Seed data — 20+ orders
// ===========================================================================

const SEED_ORDERS: Order[] = [
  {
    id: 'ord-1',
    storeProvider: 'shopify',
    orderId: 'AF-1001',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 2, unitPrice: 3200, sku: 'TEE-TERRA-M' },
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 1, unitPrice: 800, sku: 'STICK-DECENTRAL-6' },
    ],
    total: 7200,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: { name: 'Sarah Chen', line1: '456 Market St', line2: 'Suite 200', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'US' },
    trackingNumber: 'USPS9405511899223456789012',
    createdAt: '2026-02-01T14:30:00Z',
  },
  {
    id: 'ord-2',
    storeProvider: 'shopify',
    orderId: 'AF-1002',
    customerName: 'Marcus Williams',
    customerEmail: 'marcus.w@example.com',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'L', quantity: 1, unitPrice: 6500, sku: 'HOOD-MID-L' },
    ],
    total: 6500,
    currency: 'USD',
    status: 'shipped',
    shippingAddress: { name: 'Marcus Williams', line1: '789 Broadway', line2: null, city: 'New York', state: 'NY', postalCode: '10003', country: 'US' },
    trackingNumber: 'UPS1Z999AA10123456784',
    createdAt: '2026-02-05T10:15:00Z',
  },
  {
    id: 'ord-3',
    storeProvider: 'gumroad',
    orderId: 'GUM-5001',
    customerName: 'Elena Rodriguez',
    customerEmail: 'elena.r@example.com',
    items: [
      { productName: 'CLI Starter Templates Bundle', variant: null, quantity: 1, unitPrice: 1900, sku: 'DIG-TMPL-BUNDLE' },
    ],
    total: 1900,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-06T08:45:00Z',
  },
  {
    id: 'ord-4',
    storeProvider: 'shopify',
    orderId: 'AF-1003',
    customerName: 'James Park',
    customerEmail: 'jpark@example.com',
    items: [
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, unitPrice: 2800, sku: 'CAP-STONE' },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 3, unitPrice: 400, sku: 'STICK-HOLO-CONST' },
    ],
    total: 4000,
    currency: 'USD',
    status: 'processing',
    shippingAddress: { name: 'James Park', line1: '222 Elm St', line2: null, city: 'Austin', state: 'TX', postalCode: '73301', country: 'US' },
    trackingNumber: null,
    createdAt: '2026-02-08T16:00:00Z',
  },
  {
    id: 'ord-5',
    storeProvider: 'gumroad',
    orderId: 'GUM-5002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    items: [
      { productName: 'Decentralized Cloud Masterclass', variant: null, quantity: 1, unitPrice: 9900, sku: 'COURSE-DECLOUD' },
    ],
    total: 9900,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-07T12:00:00Z',
  },
  {
    id: 'ord-6',
    storeProvider: 'printful',
    orderId: 'PF-3001',
    customerName: 'Alex Turner',
    customerEmail: 'alex.t@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'XL', quantity: 1, unitPrice: 3200, sku: 'TEE-TERRA-XL' },
    ],
    total: 3200,
    currency: 'USD',
    status: 'shipped',
    shippingAddress: { name: 'Alex Turner', line1: '100 Queen St W', line2: null, city: 'Toronto', state: 'ON', postalCode: 'M5H 2N2', country: 'CA' },
    trackingNumber: 'CP123456789CA',
    createdAt: '2026-02-09T09:30:00Z',
  },
  {
    id: 'ord-7',
    storeProvider: 'shopify',
    orderId: 'AF-1004',
    customerName: 'Lisa Nakamura',
    customerEmail: 'lisa.n@example.com',
    items: [
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 2, unitPrice: 1200, sku: 'PIN-CONST-GOLD' },
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 2, unitPrice: 800, sku: 'STICK-DECENTRAL-6' },
    ],
    total: 4000,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: { name: 'Lisa Nakamura', line1: '3-14-1 Shibuya', line2: null, city: 'Shibuya', state: 'Tokyo', postalCode: '150-0002', country: 'JP' },
    trackingNumber: 'DHL1234567890',
    createdAt: '2026-02-03T06:00:00Z',
  },
  {
    id: 'ord-8',
    storeProvider: 'gumroad',
    orderId: 'GUM-5003',
    customerName: 'David Kim',
    customerEmail: 'david.kim@example.com',
    items: [
      { productName: 'AF Desktop Wallpaper Pack', variant: null, quantity: 1, unitPrice: 0, sku: 'DIG-WALL-PACK' },
    ],
    total: 0,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-10T14:22:00Z',
  },
  {
    id: 'ord-9',
    storeProvider: 'shopify',
    orderId: 'AF-1005',
    customerName: 'Omar Hassan',
    customerEmail: 'omar.h@example.com',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'M', quantity: 1, unitPrice: 6500, sku: 'HOOD-MID-M' },
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 1, unitPrice: 3200, sku: 'TEE-TERRA-M' },
    ],
    total: 9700,
    currency: 'USD',
    status: 'pending',
    shippingAddress: { name: 'Omar Hassan', line1: '45 Corniche Rd', line2: null, city: 'Abu Dhabi', state: '', postalCode: '00000', country: 'AE' },
    trackingNumber: null,
    createdAt: '2026-02-14T18:00:00Z',
  },
  {
    id: 'ord-10',
    storeProvider: 'printful',
    orderId: 'PF-3002',
    customerName: 'Mia Johnson',
    customerEmail: 'mia.j@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'S', quantity: 1, unitPrice: 3200, sku: 'TEE-TERRA-S' },
    ],
    total: 3200,
    currency: 'USD',
    status: 'cancelled',
    shippingAddress: { name: 'Mia Johnson', line1: '55 Baker St', line2: null, city: 'London', state: '', postalCode: 'NW1 6XE', country: 'GB' },
    trackingNumber: null,
    createdAt: '2026-02-04T11:15:00Z',
  },
  {
    id: 'ord-11',
    storeProvider: 'gumroad',
    orderId: 'GUM-5004',
    customerName: 'Chris Anderson',
    customerEmail: 'chris.a@example.com',
    items: [
      { productName: 'CLI Starter Templates Bundle', variant: null, quantity: 1, unitPrice: 1900, sku: 'DIG-TMPL-BUNDLE' },
      { productName: 'Decentralized Cloud Masterclass', variant: null, quantity: 1, unitPrice: 9900, sku: 'COURSE-DECLOUD' },
    ],
    total: 11800,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-11T09:00:00Z',
  },
  {
    id: 'ord-12',
    storeProvider: 'shopify',
    orderId: 'AF-1006',
    customerName: 'Sophie Müller',
    customerEmail: 'sophie.m@example.com',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'S', quantity: 1, unitPrice: 6500, sku: 'HOOD-MID-S' },
    ],
    total: 6500,
    currency: 'USD',
    status: 'shipped',
    shippingAddress: { name: 'Sophie Müller', line1: 'Friedrichstr. 123', line2: null, city: 'Berlin', state: '', postalCode: '10117', country: 'DE' },
    trackingNumber: 'DHL9876543210',
    createdAt: '2026-02-12T07:30:00Z',
  },
  {
    id: 'ord-13',
    storeProvider: 'shopify',
    orderId: 'AF-1007',
    customerName: 'Ryan O\'Brien',
    customerEmail: 'ryan.ob@example.com',
    items: [
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 5, unitPrice: 800, sku: 'STICK-DECENTRAL-6' },
    ],
    total: 4000,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: { name: 'Ryan O\'Brien', line1: '10 Grafton St', line2: null, city: 'Dublin', state: '', postalCode: 'D02 VK12', country: 'IE' },
    trackingNumber: 'AN123456789IE',
    createdAt: '2026-01-28T15:00:00Z',
  },
  {
    id: 'ord-14',
    storeProvider: 'gumroad',
    orderId: 'GUM-5005',
    customerName: 'Tania Patel',
    customerEmail: 'tania.p@example.com',
    items: [
      { productName: 'AF Desktop Wallpaper Pack', variant: null, quantity: 1, unitPrice: 0, sku: 'DIG-WALL-PACK' },
    ],
    total: 0,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-13T20:00:00Z',
  },
  {
    id: 'ord-15',
    storeProvider: 'printful',
    orderId: 'PF-3003',
    customerName: 'Kevin Lee',
    customerEmail: 'kevin.lee@example.com',
    items: [
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, unitPrice: 2800, sku: 'CAP-STONE' },
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 1, unitPrice: 1200, sku: 'PIN-CONST-GOLD' },
    ],
    total: 4000,
    currency: 'USD',
    status: 'processing',
    shippingAddress: { name: 'Kevin Lee', line1: '888 Seymour St', line2: 'Unit 1204', city: 'Vancouver', state: 'BC', postalCode: 'V6B 3L6', country: 'CA' },
    trackingNumber: null,
    createdAt: '2026-02-14T10:45:00Z',
  },
  {
    id: 'ord-16',
    storeProvider: 'shopify',
    orderId: 'AF-1008',
    customerName: 'Anna Johansson',
    customerEmail: 'anna.j@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'L', quantity: 1, unitPrice: 3200, sku: 'TEE-TERRA-L' },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 2, unitPrice: 400, sku: 'STICK-HOLO-CONST' },
    ],
    total: 4000,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: { name: 'Anna Johansson', line1: 'Drottninggatan 50', line2: null, city: 'Stockholm', state: '', postalCode: '111 21', country: 'SE' },
    trackingNumber: 'PNSE12345678',
    createdAt: '2026-01-30T13:00:00Z',
  },
  {
    id: 'ord-17',
    storeProvider: 'gumroad',
    orderId: 'GUM-5006',
    customerName: 'Roberto Silva',
    customerEmail: 'roberto.s@example.com',
    items: [
      { productName: 'Decentralized Cloud Masterclass', variant: null, quantity: 1, unitPrice: 9900, sku: 'COURSE-DECLOUD' },
    ],
    total: 9900,
    currency: 'USD',
    status: 'refunded',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-02T17:30:00Z',
  },
  {
    id: 'ord-18',
    storeProvider: 'shopify',
    orderId: 'AF-1009',
    customerName: 'Wei Zhang',
    customerEmail: 'wei.z@example.com',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'XL', quantity: 1, unitPrice: 6500, sku: 'HOOD-MID-XL' },
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, unitPrice: 2800, sku: 'CAP-STONE' },
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 3, unitPrice: 1200, sku: 'PIN-CONST-GOLD' },
    ],
    total: 12900,
    currency: 'USD',
    status: 'shipped',
    shippingAddress: { name: 'Wei Zhang', line1: '100 Nanjing Rd', line2: null, city: 'Shanghai', state: '', postalCode: '200001', country: 'CN' },
    trackingNumber: 'SF1234567890',
    createdAt: '2026-02-13T04:00:00Z',
  },
  {
    id: 'ord-19',
    storeProvider: 'printful',
    orderId: 'PF-3004',
    customerName: 'Isabella Costa',
    customerEmail: 'isabella.c@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 2, unitPrice: 3200, sku: 'TEE-TERRA-M' },
    ],
    total: 6400,
    currency: 'USD',
    status: 'pending',
    shippingAddress: { name: 'Isabella Costa', line1: 'Rua Augusta 100', line2: null, city: 'São Paulo', state: 'SP', postalCode: '01310-000', country: 'BR' },
    trackingNumber: null,
    createdAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'ord-20',
    storeProvider: 'gumroad',
    orderId: 'GUM-5007',
    customerName: 'Amir Khorasani',
    customerEmail: 'amir.k@example.com',
    items: [
      { productName: 'CLI Starter Templates Bundle', variant: null, quantity: 1, unitPrice: 1900, sku: 'DIG-TMPL-BUNDLE' },
    ],
    total: 1900,
    currency: 'USD',
    status: 'delivered',
    shippingAddress: null,
    trackingNumber: null,
    createdAt: '2026-02-15T02:30:00Z',
  },
  {
    id: 'ord-21',
    storeProvider: 'shopify',
    orderId: 'AF-1010',
    customerName: 'Emily Watson',
    customerEmail: 'emily.w@example.com',
    items: [
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 3, unitPrice: 800, sku: 'STICK-DECENTRAL-6' },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 5, unitPrice: 400, sku: 'STICK-HOLO-CONST' },
    ],
    total: 4400,
    currency: 'USD',
    status: 'processing',
    shippingAddress: { name: 'Emily Watson', line1: '42 Wallaby Way', line2: null, city: 'Sydney', state: 'NSW', postalCode: '2000', country: 'AU' },
    trackingNumber: null,
    createdAt: '2026-02-14T23:00:00Z',
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

const ORDER_FIELDS = `
  id storeProvider orderId customerName customerEmail
  items { productName variant quantity unitPrice sku }
  total currency status
  shippingAddress { name line1 line2 city state postalCode country }
  trackingNumber createdAt
`

const ALL_ORDERS_QUERY = `
  query Orders($limit: Int, $offset: Int) {
    orders(limit: $limit, offset: $offset) {
      ${ORDER_FIELDS}
    }
  }
`

const ORDER_BY_ID_QUERY = `
  query Order($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`

const UPDATE_ORDER_MUTATION = `
  mutation UpdateOrder($id: ID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      ${ORDER_FIELDS}
    }
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

let mockOrders = [...SEED_ORDERS]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllOrders(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Order[]> {
  try {
    const data = await authGraphqlFetch<{ orders: Order[] }>(
      ALL_ORDERS_QUERY,
      { limit, offset },
      token,
    )
    return data.orders
  } catch {
    if (useSeedData()) return mockOrders.slice(offset, offset + limit)
    return []
  }
}

export async function fetchOrderById(
  token: string,
  id: string,
): Promise<Order | null> {
  try {
    const data = await authGraphqlFetch<{ order: Order }>(
      ORDER_BY_ID_QUERY,
      { id },
      token,
    )
    return data.order
  } catch {
    if (useSeedData()) return mockOrders.find((o) => o.id === id) || null
    return null
  }
}

export async function updateOrder(
  token: string,
  id: string,
  input: UpdateOrderInput,
): Promise<Order> {
  if (useSeedData()) {
    const idx = mockOrders.findIndex((o) => o.id === id)
    if (idx === -1) throw new Error('Order not found')
    const updated: Order = { ...mockOrders[idx], ...input }
    mockOrders[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateOrder: Order }>(
    UPDATE_ORDER_MUTATION,
    { id, input },
    token,
  )
  return data.updateOrder
}

// Formatting helpers
export function formatOrderTotal(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Order status display
export const ORDER_STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; color: string; label: string }
> = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  processing: { bg: '#DBEAFE', color: '#1E40AF', label: 'Processing' },
  shipped: { bg: '#E0E7FF', color: '#3730A3', label: 'Shipped' },
  delivered: { bg: '#D1FAE5', color: '#065F46', label: 'Delivered' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelled' },
  refunded: { bg: '#FEE2E2', color: '#991B1B', label: 'Refunded' },
}

// Re-export seed data
export { SEED_ORDERS }
