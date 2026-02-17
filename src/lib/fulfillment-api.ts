const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type FulfillmentStatus =
  | 'awaiting_pick'
  | 'picking'
  | 'packing'
  | 'label_printed'
  | 'shipped'
  | 'delivered'
  | 'exception'

export type FulfillmentProvider =
  | 'printful'
  | 'gelato'
  | 'shipstation'
  | 'manual'

export type ShippingCarrier =
  | 'usps'
  | 'ups'
  | 'fedex'
  | 'dhl'
  | 'canada-post'
  | 'royal-mail'
  | 'other'

export interface FulfillmentItem {
  productName: string
  variant: string | null
  quantity: number
  sku: string
  weight: number
}

export interface FulfillmentRecord {
  id: string
  orderId: string
  orderRef: string
  customerName: string
  customerEmail: string
  provider: FulfillmentProvider
  status: FulfillmentStatus
  items: FulfillmentItem[]
  carrier: ShippingCarrier | null
  trackingNumber: string | null
  shippingLabel: string | null
  shipByDate: string
  shippedAt: string | null
  deliveredAt: string | null
  totalWeight: number
  shippingCost: number
  currency: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateFulfillmentInput {
  status?: FulfillmentStatus
  carrier?: ShippingCarrier
  trackingNumber?: string
  notes?: string
}

export interface ReturnRequest {
  id: string
  orderId: string
  orderRef: string
  fulfillmentId: string
  customerName: string
  customerEmail: string
  items: ReturnItem[]
  reason: ReturnReason
  reasonDetail: string | null
  status: ReturnStatus
  refundAmount: number
  currency: string
  rmaNumber: string
  approvedBy: string | null
  createdAt: string
  updatedAt: string
}

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'item_received'
  | 'refund_issued'
  | 'denied'
  | 'closed'

export type ReturnReason =
  | 'defective'
  | 'wrong_item'
  | 'not_as_described'
  | 'changed_mind'
  | 'arrived_late'
  | 'other'

export interface ReturnItem {
  productName: string
  variant: string | null
  quantity: number
  sku: string
  condition: 'unopened' | 'opened' | 'damaged'
}

export interface UpdateReturnInput {
  status?: ReturnStatus
  approvedBy?: string
  notes?: string
}

// ===========================================================================
// Seed data — 16 fulfillment records
// ===========================================================================

const SEED_FULFILLMENTS: FulfillmentRecord[] = [
  {
    id: 'ful-1',
    orderId: 'ord-1',
    orderRef: 'AF-1001',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@example.com',
    provider: 'printful',
    status: 'delivered',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 2, sku: 'TEE-TERRA-M', weight: 340 },
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 1, sku: 'STICK-DECENTRAL-6', weight: 30 },
    ],
    carrier: 'usps',
    trackingNumber: 'USPS9405511899223456789012',
    shippingLabel: 'label-001.pdf',
    shipByDate: '2026-02-03T00:00:00Z',
    shippedAt: '2026-02-02T14:00:00Z',
    deliveredAt: '2026-02-06T10:30:00Z',
    totalWeight: 710,
    shippingCost: 650,
    currency: 'USD',
    notes: null,
    createdAt: '2026-02-01T14:30:00Z',
    updatedAt: '2026-02-06T10:30:00Z',
  },
  {
    id: 'ful-2',
    orderId: 'ord-2',
    orderRef: 'AF-1002',
    customerName: 'Marcus Williams',
    customerEmail: 'marcus.w@example.com',
    provider: 'printful',
    status: 'shipped',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'L', quantity: 1, sku: 'HOOD-MID-L', weight: 680 },
    ],
    carrier: 'ups',
    trackingNumber: 'UPS1Z999AA10123456784',
    shippingLabel: 'label-002.pdf',
    shipByDate: '2026-02-07T00:00:00Z',
    shippedAt: '2026-02-06T11:00:00Z',
    deliveredAt: null,
    totalWeight: 680,
    shippingCost: 890,
    currency: 'USD',
    notes: null,
    createdAt: '2026-02-05T10:15:00Z',
    updatedAt: '2026-02-06T11:00:00Z',
  },
  {
    id: 'ful-3',
    orderId: 'ord-4',
    orderRef: 'AF-1003',
    customerName: 'James Park',
    customerEmail: 'jpark@example.com',
    provider: 'gelato',
    status: 'picking',
    items: [
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, sku: 'CAP-STONE', weight: 150 },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 3, sku: 'STICK-HOLO-CONST', weight: 15 },
    ],
    carrier: null,
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-10T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 195,
    shippingCost: 550,
    currency: 'USD',
    notes: 'Customer requested gift wrapping',
    createdAt: '2026-02-08T16:00:00Z',
    updatedAt: '2026-02-09T08:00:00Z',
  },
  {
    id: 'ful-4',
    orderId: 'ord-6',
    orderRef: 'PF-3001',
    customerName: 'Alex Turner',
    customerEmail: 'alex.t@example.com',
    provider: 'printful',
    status: 'shipped',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'XL', quantity: 1, sku: 'TEE-TERRA-XL', weight: 360 },
    ],
    carrier: 'canada-post',
    trackingNumber: 'CP123456789CA',
    shippingLabel: 'label-004.pdf',
    shipByDate: '2026-02-11T00:00:00Z',
    shippedAt: '2026-02-10T09:00:00Z',
    deliveredAt: null,
    totalWeight: 360,
    shippingCost: 1200,
    currency: 'USD',
    notes: null,
    createdAt: '2026-02-09T09:30:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'ful-5',
    orderId: 'ord-7',
    orderRef: 'AF-1004',
    customerName: 'Lisa Nakamura',
    customerEmail: 'lisa.n@example.com',
    provider: 'gelato',
    status: 'delivered',
    items: [
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 2, sku: 'PIN-CONST-GOLD', weight: 25 },
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 2, sku: 'STICK-DECENTRAL-6', weight: 30 },
    ],
    carrier: 'dhl',
    trackingNumber: 'DHL1234567890',
    shippingLabel: 'label-005.pdf',
    shipByDate: '2026-02-05T00:00:00Z',
    shippedAt: '2026-02-04T14:00:00Z',
    deliveredAt: '2026-02-09T07:00:00Z',
    totalWeight: 110,
    shippingCost: 1800,
    currency: 'USD',
    notes: 'International shipment — JP',
    createdAt: '2026-02-03T06:00:00Z',
    updatedAt: '2026-02-09T07:00:00Z',
  },
  {
    id: 'ful-6',
    orderId: 'ord-9',
    orderRef: 'AF-1005',
    customerName: 'Omar Hassan',
    customerEmail: 'omar.h@example.com',
    provider: 'printful',
    status: 'awaiting_pick',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'M', quantity: 1, sku: 'HOOD-MID-M', weight: 680 },
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 1, sku: 'TEE-TERRA-M', weight: 340 },
    ],
    carrier: null,
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-16T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 1020,
    shippingCost: 2400,
    currency: 'USD',
    notes: 'International — AE',
    createdAt: '2026-02-14T18:00:00Z',
    updatedAt: '2026-02-14T18:00:00Z',
  },
  {
    id: 'ful-7',
    orderId: 'ord-12',
    orderRef: 'AF-1006',
    customerName: 'Sophie Müller',
    customerEmail: 'sophie.m@example.com',
    provider: 'printful',
    status: 'shipped',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'S', quantity: 1, sku: 'HOOD-MID-S', weight: 650 },
    ],
    carrier: 'dhl',
    trackingNumber: 'DHL9876543210',
    shippingLabel: 'label-007.pdf',
    shipByDate: '2026-02-14T00:00:00Z',
    shippedAt: '2026-02-13T10:00:00Z',
    deliveredAt: null,
    totalWeight: 650,
    shippingCost: 1400,
    currency: 'USD',
    notes: null,
    createdAt: '2026-02-12T07:30:00Z',
    updatedAt: '2026-02-13T10:00:00Z',
  },
  {
    id: 'ful-8',
    orderId: 'ord-13',
    orderRef: 'AF-1007',
    customerName: "Ryan O'Brien",
    customerEmail: 'ryan.ob@example.com',
    provider: 'gelato',
    status: 'delivered',
    items: [
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 5, sku: 'STICK-DECENTRAL-6', weight: 30 },
    ],
    carrier: 'royal-mail',
    trackingNumber: 'AN123456789IE',
    shippingLabel: 'label-008.pdf',
    shipByDate: '2026-01-30T00:00:00Z',
    shippedAt: '2026-01-29T15:00:00Z',
    deliveredAt: '2026-02-02T11:00:00Z',
    totalWeight: 150,
    shippingCost: 950,
    currency: 'USD',
    notes: null,
    createdAt: '2026-01-28T15:00:00Z',
    updatedAt: '2026-02-02T11:00:00Z',
  },
  {
    id: 'ful-9',
    orderId: 'ord-15',
    orderRef: 'PF-3003',
    customerName: 'Kevin Lee',
    customerEmail: 'kevin.lee@example.com',
    provider: 'printful',
    status: 'packing',
    items: [
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, sku: 'CAP-STONE', weight: 150 },
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 1, sku: 'PIN-CONST-GOLD', weight: 25 },
    ],
    carrier: null,
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-16T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 175,
    shippingCost: 750,
    currency: 'USD',
    notes: null,
    createdAt: '2026-02-14T10:45:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'ful-10',
    orderId: 'ord-16',
    orderRef: 'AF-1008',
    customerName: 'Anna Johansson',
    customerEmail: 'anna.j@example.com',
    provider: 'gelato',
    status: 'delivered',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'L', quantity: 1, sku: 'TEE-TERRA-L', weight: 350 },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 2, sku: 'STICK-HOLO-CONST', weight: 15 },
    ],
    carrier: 'dhl',
    trackingNumber: 'PNSE12345678',
    shippingLabel: 'label-010.pdf',
    shipByDate: '2026-02-01T00:00:00Z',
    shippedAt: '2026-01-31T12:00:00Z',
    deliveredAt: '2026-02-04T09:00:00Z',
    totalWeight: 380,
    shippingCost: 1350,
    currency: 'USD',
    notes: null,
    createdAt: '2026-01-30T13:00:00Z',
    updatedAt: '2026-02-04T09:00:00Z',
  },
  {
    id: 'ful-11',
    orderId: 'ord-18',
    orderRef: 'AF-1009',
    customerName: 'Wei Zhang',
    customerEmail: 'wei.z@example.com',
    provider: 'printful',
    status: 'label_printed',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'XL', quantity: 1, sku: 'HOOD-MID-XL', weight: 700 },
      { productName: 'AF Cap — Stone', variant: null, quantity: 1, sku: 'CAP-STONE', weight: 150 },
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 3, sku: 'PIN-CONST-GOLD', weight: 25 },
    ],
    carrier: 'fedex',
    trackingNumber: 'SF1234567890',
    shippingLabel: 'label-011.pdf',
    shipByDate: '2026-02-15T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 925,
    shippingCost: 2800,
    currency: 'USD',
    notes: 'Large international — CN. Customs docs attached.',
    createdAt: '2026-02-13T04:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'ful-12',
    orderId: 'ord-19',
    orderRef: 'PF-3004',
    customerName: 'Isabella Costa',
    customerEmail: 'isabella.c@example.com',
    provider: 'printful',
    status: 'awaiting_pick',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 2, sku: 'TEE-TERRA-M', weight: 340 },
    ],
    carrier: null,
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-17T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 680,
    shippingCost: 1800,
    currency: 'USD',
    notes: 'International — BR',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'ful-13',
    orderId: 'ord-21',
    orderRef: 'AF-1010',
    customerName: 'Emily Watson',
    customerEmail: 'emily.w@example.com',
    provider: 'gelato',
    status: 'picking',
    items: [
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 3, sku: 'STICK-DECENTRAL-6', weight: 30 },
      { productName: 'AF Constellation Holographic Sticker', variant: null, quantity: 5, sku: 'STICK-HOLO-CONST', weight: 15 },
    ],
    carrier: null,
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-16T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 165,
    shippingCost: 1600,
    currency: 'USD',
    notes: 'International — AU',
    createdAt: '2026-02-14T23:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'ful-14',
    orderId: 'ord-10',
    orderRef: 'PF-3002',
    customerName: 'Mia Johnson',
    customerEmail: 'mia.j@example.com',
    provider: 'printful',
    status: 'exception',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'S', quantity: 1, sku: 'TEE-TERRA-S', weight: 320 },
    ],
    carrier: 'royal-mail',
    trackingNumber: null,
    shippingLabel: null,
    shipByDate: '2026-02-06T00:00:00Z',
    shippedAt: null,
    deliveredAt: null,
    totalWeight: 320,
    shippingCost: 1100,
    currency: 'USD',
    notes: 'Order cancelled by customer before shipment',
    createdAt: '2026-02-04T11:15:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
  },
]

// ===========================================================================
// Seed data — 8 return requests
// ===========================================================================

const SEED_RETURNS: ReturnRequest[] = [
  {
    id: 'ret-1',
    orderId: 'ord-1',
    orderRef: 'AF-1001',
    fulfillmentId: 'ful-1',
    customerName: 'Sarah Chen',
    customerEmail: 'sarah.chen@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'M', quantity: 1, sku: 'TEE-TERRA-M', condition: 'unopened' },
    ],
    reason: 'changed_mind',
    reasonDetail: 'Ordered wrong size, wanted L instead of M.',
    status: 'refund_issued',
    refundAmount: 3200,
    currency: 'USD',
    rmaNumber: 'RMA-2026-001',
    approvedBy: 'admin@alternatefutures.ai',
    createdAt: '2026-02-07T10:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'ret-2',
    orderId: 'ord-7',
    orderRef: 'AF-1004',
    fulfillmentId: 'ful-5',
    customerName: 'Lisa Nakamura',
    customerEmail: 'lisa.n@example.com',
    items: [
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 1, sku: 'PIN-CONST-GOLD', condition: 'damaged' },
    ],
    reason: 'defective',
    reasonDetail: 'Pin clasp broken on arrival. Other pin was fine.',
    status: 'item_received',
    refundAmount: 1200,
    currency: 'USD',
    rmaNumber: 'RMA-2026-002',
    approvedBy: 'admin@alternatefutures.ai',
    createdAt: '2026-02-10T03:00:00Z',
    updatedAt: '2026-02-13T08:00:00Z',
  },
  {
    id: 'ret-3',
    orderId: 'ord-13',
    orderRef: 'AF-1007',
    fulfillmentId: 'ful-8',
    customerName: "Ryan O'Brien",
    customerEmail: 'ryan.ob@example.com',
    items: [
      { productName: 'Decentralize Everything Sticker Pack', variant: null, quantity: 2, sku: 'STICK-DECENTRAL-6', condition: 'opened' },
    ],
    reason: 'not_as_described',
    reasonDetail: 'Colors look different from product photos. Expecting refund for 2 of 5 packs.',
    status: 'approved',
    refundAmount: 1600,
    currency: 'USD',
    rmaNumber: 'RMA-2026-003',
    approvedBy: 'admin@alternatefutures.ai',
    createdAt: '2026-02-03T12:00:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
  },
  {
    id: 'ret-4',
    orderId: 'ord-16',
    orderRef: 'AF-1008',
    fulfillmentId: 'ful-10',
    customerName: 'Anna Johansson',
    customerEmail: 'anna.j@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'L', quantity: 1, sku: 'TEE-TERRA-L', condition: 'opened' },
    ],
    reason: 'wrong_item',
    reasonDetail: 'Received XL instead of L.',
    status: 'requested',
    refundAmount: 3200,
    currency: 'USD',
    rmaNumber: 'RMA-2026-004',
    approvedBy: null,
    createdAt: '2026-02-05T15:00:00Z',
    updatedAt: '2026-02-05T15:00:00Z',
  },
  {
    id: 'ret-5',
    orderId: 'ord-17',
    orderRef: 'GUM-5006',
    fulfillmentId: '',
    customerName: 'Roberto Silva',
    customerEmail: 'roberto.s@example.com',
    items: [
      { productName: 'Decentralized Cloud Masterclass', variant: null, quantity: 1, sku: 'COURSE-DECLOUD', condition: 'opened' },
    ],
    reason: 'not_as_described',
    reasonDetail: 'Course content outdated. Modules 5-8 reference deprecated APIs.',
    status: 'refund_issued',
    refundAmount: 9900,
    currency: 'USD',
    rmaNumber: 'RMA-2026-005',
    approvedBy: 'admin@alternatefutures.ai',
    createdAt: '2026-02-02T17:30:00Z',
    updatedAt: '2026-02-04T10:00:00Z',
  },
  {
    id: 'ret-6',
    orderId: 'ord-2',
    orderRef: 'AF-1002',
    fulfillmentId: 'ful-2',
    customerName: 'Marcus Williams',
    customerEmail: 'marcus.w@example.com',
    items: [
      { productName: 'AF Hoodie — Midnight', variant: 'L', quantity: 1, sku: 'HOOD-MID-L', condition: 'opened' },
    ],
    reason: 'changed_mind',
    reasonDetail: 'Decided to go with the XL instead.',
    status: 'denied',
    refundAmount: 0,
    currency: 'USD',
    rmaNumber: 'RMA-2026-006',
    approvedBy: null,
    createdAt: '2026-02-08T14:00:00Z',
    updatedAt: '2026-02-09T11:00:00Z',
  },
  {
    id: 'ret-7',
    orderId: 'ord-18',
    orderRef: 'AF-1009',
    fulfillmentId: 'ful-11',
    customerName: 'Wei Zhang',
    customerEmail: 'wei.z@example.com',
    items: [
      { productName: 'Constellation Enamel Pin', variant: null, quantity: 1, sku: 'PIN-CONST-GOLD', condition: 'damaged' },
    ],
    reason: 'defective',
    reasonDetail: 'Gold plating chipping on one pin.',
    status: 'requested',
    refundAmount: 1200,
    currency: 'USD',
    rmaNumber: 'RMA-2026-007',
    approvedBy: null,
    createdAt: '2026-02-15T06:00:00Z',
    updatedAt: '2026-02-15T06:00:00Z',
  },
  {
    id: 'ret-8',
    orderId: 'ord-6',
    orderRef: 'PF-3001',
    fulfillmentId: 'ful-4',
    customerName: 'Alex Turner',
    customerEmail: 'alex.t@example.com',
    items: [
      { productName: 'AF Classic Tee — Terracotta', variant: 'XL', quantity: 1, sku: 'TEE-TERRA-XL', condition: 'unopened' },
    ],
    reason: 'arrived_late',
    reasonDetail: 'Package arrived 10 days late, no longer needed.',
    status: 'closed',
    refundAmount: 3200,
    currency: 'USD',
    rmaNumber: 'RMA-2026-008',
    approvedBy: 'admin@alternatefutures.ai',
    createdAt: '2026-02-11T09:00:00Z',
    updatedAt: '2026-02-14T12:00:00Z',
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
// GraphQL — Fulfillments
// ===========================================================================

const FULFILLMENT_FIELDS = `
  id orderId orderRef customerName customerEmail
  provider status items { productName variant quantity sku weight }
  carrier trackingNumber shippingLabel shipByDate shippedAt deliveredAt
  totalWeight shippingCost currency notes createdAt updatedAt
`

const ALL_FULFILLMENTS_QUERY = `
  query Fulfillments($limit: Int, $offset: Int) {
    fulfillments(limit: $limit, offset: $offset) {
      ${FULFILLMENT_FIELDS}
    }
  }
`

const UPDATE_FULFILLMENT_MUTATION = `
  mutation UpdateFulfillment($id: ID!, $input: UpdateFulfillmentInput!) {
    updateFulfillment(id: $id, input: $input) {
      ${FULFILLMENT_FIELDS}
    }
  }
`

// GraphQL — Returns

const RETURN_FIELDS = `
  id orderId orderRef fulfillmentId customerName customerEmail
  items { productName variant quantity sku condition }
  reason reasonDetail status refundAmount currency
  rmaNumber approvedBy createdAt updatedAt
`

const ALL_RETURNS_QUERY = `
  query Returns($limit: Int, $offset: Int) {
    returns(limit: $limit, offset: $offset) {
      ${RETURN_FIELDS}
    }
  }
`

const UPDATE_RETURN_MUTATION = `
  mutation UpdateReturn($id: ID!, $input: UpdateReturnInput!) {
    updateReturn(id: $id, input: $input) {
      ${RETURN_FIELDS}
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
// In-memory mock stores
// ===========================================================================

let mockFulfillments = [...SEED_FULFILLMENTS]
let mockReturns = [...SEED_RETURNS]

// ===========================================================================
// Fulfillment CRUD
// ===========================================================================

export async function fetchAllFulfillments(
  token: string,
  limit = 100,
  offset = 0,
): Promise<FulfillmentRecord[]> {
  try {
    const data = await authGraphqlFetch<{ fulfillments: FulfillmentRecord[] }>(
      ALL_FULFILLMENTS_QUERY,
      { limit, offset },
      token,
    )
    return data.fulfillments
  } catch {
    if (useSeedData()) return mockFulfillments.slice(offset, offset + limit)
    return []
  }
}

export async function updateFulfillment(
  token: string,
  id: string,
  input: UpdateFulfillmentInput,
): Promise<FulfillmentRecord> {
  if (useSeedData()) {
    const idx = mockFulfillments.findIndex((f) => f.id === id)
    if (idx === -1) throw new Error('Fulfillment not found')
    const updated: FulfillmentRecord = {
      ...mockFulfillments[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as FulfillmentRecord
    mockFulfillments[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateFulfillment: FulfillmentRecord }>(
    UPDATE_FULFILLMENT_MUTATION,
    { id, input },
    token,
  )
  return data.updateFulfillment
}

// ===========================================================================
// Return CRUD
// ===========================================================================

export async function fetchAllReturns(
  token: string,
  limit = 100,
  offset = 0,
): Promise<ReturnRequest[]> {
  try {
    const data = await authGraphqlFetch<{ returns: ReturnRequest[] }>(
      ALL_RETURNS_QUERY,
      { limit, offset },
      token,
    )
    return data.returns
  } catch {
    if (useSeedData()) return mockReturns.slice(offset, offset + limit)
    return []
  }
}

export async function updateReturn(
  token: string,
  id: string,
  input: UpdateReturnInput,
): Promise<ReturnRequest> {
  if (useSeedData()) {
    const idx = mockReturns.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Return not found')
    const updated: ReturnRequest = {
      ...mockReturns[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as ReturnRequest
    mockReturns[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateReturn: ReturnRequest }>(
    UPDATE_RETURN_MUTATION,
    { id, input },
    token,
  )
  return data.updateReturn
}

// ===========================================================================
// Formatting helpers
// ===========================================================================

export function formatShippingCost(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)} kg`
  return `${grams} g`
}

export function formatRefundAmount(cents: number, currency = 'USD'): string {
  if (cents === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Status display maps
export const FULFILLMENT_STATUS_STYLES: Record<
  FulfillmentStatus,
  { bg: string; color: string; label: string }
> = {
  awaiting_pick: { bg: '#FEF3C7', color: '#92400E', label: 'Awaiting Pick' },
  picking: { bg: '#DBEAFE', color: '#1E40AF', label: 'Picking' },
  packing: { bg: '#E0E7FF', color: '#3730A3', label: 'Packing' },
  label_printed: { bg: '#FDE68A', color: '#78350F', label: 'Label Printed' },
  shipped: { bg: '#D1FAE5', color: '#065F46', label: 'Shipped' },
  delivered: { bg: '#A7F3D0', color: '#064E3B', label: 'Delivered' },
  exception: { bg: '#FEE2E2', color: '#991B1B', label: 'Exception' },
}

export const RETURN_STATUS_STYLES: Record<
  ReturnStatus,
  { bg: string; color: string; label: string }
> = {
  requested: { bg: '#FEF3C7', color: '#92400E', label: 'Requested' },
  approved: { bg: '#DBEAFE', color: '#1E40AF', label: 'Approved' },
  item_received: { bg: '#E0E7FF', color: '#3730A3', label: 'Item Received' },
  refund_issued: { bg: '#D1FAE5', color: '#065F46', label: 'Refund Issued' },
  denied: { bg: '#FEE2E2', color: '#991B1B', label: 'Denied' },
  closed: { bg: '#F3F4F6', color: '#6B7280', label: 'Closed' },
}

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defective: 'Defective',
  wrong_item: 'Wrong Item',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  arrived_late: 'Arrived Late',
  other: 'Other',
}

// Re-export seed data
export { SEED_FULFILLMENTS, SEED_RETURNS }
