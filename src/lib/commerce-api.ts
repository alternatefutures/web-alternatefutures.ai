const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.alternatefutures.ai/graphql'

// ===========================================================================
// Types
// ===========================================================================

export type ProductType = 'physical' | 'digital' | 'service'

export type ProductCategory =
  | 'merch'
  | 'sticker'
  | 'apparel'
  | 'digital-download'
  | 'course'
  | 'membership'

export type ProductStatus = 'draft' | 'active' | 'archived'

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  type: ProductType
  category: ProductCategory
  price: number
  compareAtPrice: number | null
  currency: string
  images: string[]
  variants: ProductVariant[]
  tags: string[]
  status: ProductStatus
  sku: string
  inventory: number
  fulfillmentProvider: string | null
  brandCompliant: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductInput {
  name: string
  slug: string
  description: string
  type: ProductType
  category: ProductCategory
  price: number
  compareAtPrice?: number
  currency?: string
  images?: string[]
  variants?: Omit<ProductVariant, 'id'>[]
  tags?: string[]
  status?: ProductStatus
  sku: string
  inventory?: number
  fulfillmentProvider?: string
}

export interface UpdateProductInput {
  name?: string
  slug?: string
  description?: string
  type?: ProductType
  category?: ProductCategory
  price?: number
  compareAtPrice?: number | null
  currency?: string
  images?: string[]
  variants?: ProductVariant[]
  tags?: string[]
  status?: ProductStatus
  sku?: string
  inventory?: number
  fulfillmentProvider?: string | null
  brandCompliant?: boolean
}

// ===========================================================================
// Seed data — 12+ products
// ===========================================================================

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AF Classic Tee — Terracotta',
    slug: 'af-classic-tee-terracotta',
    description: 'Premium cotton t-shirt featuring the Alternate Futures wordmark in terracotta. Relaxed fit, pre-shrunk.',
    type: 'physical',
    category: 'apparel',
    price: 3200,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop'],
    variants: [
      { id: 'v-1a', name: 'S', sku: 'TEE-TERRA-S', price: 3200, inventory: 45 },
      { id: 'v-1b', name: 'M', sku: 'TEE-TERRA-M', price: 3200, inventory: 82 },
      { id: 'v-1c', name: 'L', sku: 'TEE-TERRA-L', price: 3200, inventory: 60 },
      { id: 'v-1d', name: 'XL', sku: 'TEE-TERRA-XL', price: 3200, inventory: 33 },
    ],
    tags: ['apparel', 'bestseller', 'unisex'],
    status: 'active',
    sku: 'TEE-TERRA',
    inventory: 220,
    fulfillmentProvider: 'Printful',
    brandCompliant: true,
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'AF Hoodie — Midnight',
    slug: 'af-hoodie-midnight',
    description: 'Heavyweight fleece hoodie in midnight navy with embroidered AF constellation logo on the chest.',
    type: 'physical',
    category: 'apparel',
    price: 6500,
    compareAtPrice: 7500,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop'],
    variants: [
      { id: 'v-2a', name: 'S', sku: 'HOOD-MID-S', price: 6500, inventory: 20 },
      { id: 'v-2b', name: 'M', sku: 'HOOD-MID-M', price: 6500, inventory: 38 },
      { id: 'v-2c', name: 'L', sku: 'HOOD-MID-L', price: 6500, inventory: 45 },
      { id: 'v-2d', name: 'XL', sku: 'HOOD-MID-XL', price: 6500, inventory: 22 },
    ],
    tags: ['apparel', 'premium', 'winter'],
    status: 'active',
    sku: 'HOOD-MID',
    inventory: 125,
    fulfillmentProvider: 'Printful',
    brandCompliant: true,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Decentralize Everything Sticker Pack',
    slug: 'decentralize-sticker-pack',
    description: 'Set of 6 die-cut vinyl stickers featuring AF branding, DePIN slogans, and geometric constellation designs. Waterproof and UV-resistant.',
    type: 'physical',
    category: 'sticker',
    price: 800,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['stickers', 'popular', 'gift'],
    status: 'active',
    sku: 'STICK-DECENTRAL-6',
    inventory: 500,
    fulfillmentProvider: 'Printful',
    brandCompliant: true,
    createdAt: '2026-01-08T08:00:00Z',
    updatedAt: '2026-02-08T09:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'AF Constellation Holographic Sticker',
    slug: 'af-constellation-holographic',
    description: 'Holographic die-cut sticker of the AF constellation logo. 3" diameter, laptop-grade adhesive.',
    type: 'physical',
    category: 'sticker',
    price: 400,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['stickers', 'holographic', 'logo'],
    status: 'active',
    sku: 'STICK-HOLO-CONST',
    inventory: 750,
    fulfillmentProvider: 'Printful',
    brandCompliant: true,
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-02-05T11:00:00Z',
  },
  {
    id: 'prod-5',
    name: 'AF Desktop Wallpaper Pack',
    slug: 'af-desktop-wallpaper-pack',
    description: 'Collection of 10 high-res desktop wallpapers featuring AF brand aesthetics — terracotta gradients, constellation patterns, and wabi-sabi textures. 4K and ultrawide included.',
    type: 'digital',
    category: 'digital-download',
    price: 0,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['free', 'wallpaper', 'brand'],
    status: 'active',
    sku: 'DIG-WALL-PACK',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'CLI Starter Templates Bundle',
    slug: 'cli-starter-templates-bundle',
    description: 'Premium starter templates for the AF CLI — includes Next.js, Astro, SvelteKit, and Vue project scaffolds with best-practice configurations, CI/CD, and deployment configs.',
    type: 'digital',
    category: 'digital-download',
    price: 1900,
    compareAtPrice: 2900,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['templates', 'developer', 'cli'],
    status: 'active',
    sku: 'DIG-TMPL-BUNDLE',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-02-09T15:00:00Z',
  },
  {
    id: 'prod-7',
    name: 'Decentralized Cloud Masterclass',
    slug: 'decloud-masterclass',
    description: '8-module video course covering IPFS, Filecoin, Arweave, and Akash deployments. Includes hands-on labs and certification.',
    type: 'digital',
    category: 'course',
    price: 9900,
    compareAtPrice: 14900,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['course', 'education', 'decloud'],
    status: 'active',
    sku: 'COURSE-DECLOUD',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'prod-8',
    name: 'AF Builder Membership — Monthly',
    slug: 'af-builder-monthly',
    description: 'Monthly membership for builders: priority support, early feature access, community office hours, and 20% compute discount.',
    type: 'service',
    category: 'membership',
    price: 2900,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['membership', 'subscription', 'builder'],
    status: 'active',
    sku: 'MEM-BUILDER-MO',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-02-03T08:00:00Z',
    updatedAt: '2026-02-13T12:00:00Z',
  },
  {
    id: 'prod-9',
    name: 'AF Builder Membership — Annual',
    slug: 'af-builder-annual',
    description: 'Annual membership (save 25%): priority support, early access, community office hours, 20% compute discount, and exclusive swag box.',
    type: 'service',
    category: 'membership',
    price: 26100,
    compareAtPrice: 34800,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['membership', 'subscription', 'annual'],
    status: 'active',
    sku: 'MEM-BUILDER-YR',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-02-03T08:00:00Z',
    updatedAt: '2026-02-13T12:00:00Z',
  },
  {
    id: 'prod-10',
    name: 'AF Cap — Stone',
    slug: 'af-cap-stone',
    description: 'Unstructured dad cap in stone wash with embroidered AF monogram. Adjustable strap, one-size-fits-most.',
    type: 'physical',
    category: 'merch',
    price: 2800,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['hat', 'accessory', 'unisex'],
    status: 'active',
    sku: 'CAP-STONE',
    inventory: 90,
    fulfillmentProvider: 'Gelato',
    brandCompliant: true,
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-02-07T11:00:00Z',
  },
  {
    id: 'prod-11',
    name: 'Constellation Enamel Pin',
    slug: 'constellation-enamel-pin',
    description: 'Gold-plated enamel pin featuring the AF constellation pattern. 1.25" with butterfly clutch backing.',
    type: 'physical',
    category: 'merch',
    price: 1200,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['pin', 'accessory', 'collector'],
    status: 'active',
    sku: 'PIN-CONST-GOLD',
    inventory: 200,
    fulfillmentProvider: 'Gelato',
    brandCompliant: true,
    createdAt: '2026-01-22T08:00:00Z',
    updatedAt: '2026-02-06T09:00:00Z',
  },
  {
    id: 'prod-12',
    name: 'AI Agent Deployment Guide (eBook)',
    slug: 'ai-agent-deployment-ebook',
    description: 'Comprehensive 120-page guide to deploying AI agents on decentralized infrastructure. Covers ElizaOS, LangChain, custom frameworks, memory systems, and scaling strategies.',
    type: 'digital',
    category: 'digital-download',
    price: 1500,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['ebook', 'ai-agents', 'guide'],
    status: 'draft',
    sku: 'DIG-EBOOK-AGENT',
    inventory: -1,
    fulfillmentProvider: null,
    brandCompliant: true,
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
  },
  {
    id: 'prod-13',
    name: 'DePIN Infrastructure Workshop',
    slug: 'depin-infrastructure-workshop',
    description: 'Live 4-hour workshop on building DePIN applications. Covers network design, token economics, and deployment on Akash.',
    type: 'service',
    category: 'course',
    price: 4900,
    compareAtPrice: null,
    currency: 'USD',
    images: ['https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=600&h=600&fit=crop'],
    variants: [],
    tags: ['workshop', 'depin', 'live'],
    status: 'draft',
    sku: 'WORK-DEPIN',
    inventory: 30,
    fulfillmentProvider: null,
    brandCompliant: false,
    createdAt: '2026-02-12T08:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
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

const PRODUCT_FIELDS = `
  id name slug description type category price compareAtPrice
  currency images variants { id name sku price inventory }
  tags status sku inventory fulfillmentProvider brandCompliant
  createdAt updatedAt
`

const ALL_PRODUCTS_QUERY = `
  query Products($limit: Int, $offset: Int) {
    products(limit: $limit, offset: $offset) {
      ${PRODUCT_FIELDS}
    }
  }
`

const PRODUCT_BY_ID_QUERY = `
  query Product($id: ID!) {
    product(id: $id) {
      ${PRODUCT_FIELDS}
    }
  }
`

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ${PRODUCT_FIELDS}
    }
  }
`

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) { id }
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

let mockProducts = [...SEED_PRODUCTS]

// ===========================================================================
// CRUD Functions
// ===========================================================================

export async function fetchAllProducts(
  token: string,
  limit = 100,
  offset = 0,
): Promise<Product[]> {
  try {
    const data = await authGraphqlFetch<{ products: Product[] }>(
      ALL_PRODUCTS_QUERY,
      { limit, offset },
      token,
    )
    return data.products
  } catch {
    if (useSeedData()) return mockProducts.slice(offset, offset + limit)
    return []
  }
}

export async function fetchProductById(
  token: string,
  id: string,
): Promise<Product | null> {
  try {
    const data = await authGraphqlFetch<{ product: Product }>(
      PRODUCT_BY_ID_QUERY,
      { id },
      token,
    )
    return data.product
  } catch {
    if (useSeedData()) return mockProducts.find((p) => p.id === id) || null
    return null
  }
}

export async function createProduct(
  token: string,
  input: CreateProductInput,
): Promise<Product> {
  if (useSeedData()) {
    const now = new Date().toISOString()
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: input.name,
      slug: input.slug,
      description: input.description,
      type: input.type,
      category: input.category,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      currency: input.currency || 'USD',
      images: input.images || [],
      variants: (input.variants || []).map((v, i) => ({
        ...v,
        id: `v-new-${i}`,
      })),
      tags: input.tags || [],
      status: input.status || 'draft',
      sku: input.sku,
      inventory: input.inventory ?? 0,
      fulfillmentProvider: input.fulfillmentProvider ?? null,
      brandCompliant: true,
      createdAt: now,
      updatedAt: now,
    }
    mockProducts = [product, ...mockProducts]
    return product
  }

  const data = await authGraphqlFetch<{ createProduct: Product }>(
    CREATE_PRODUCT_MUTATION,
    { input },
    token,
  )
  return data.createProduct
}

export async function updateProduct(
  token: string,
  id: string,
  input: UpdateProductInput,
): Promise<Product> {
  if (useSeedData()) {
    const idx = mockProducts.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Product not found')
    const updated: Product = {
      ...mockProducts[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    } as Product
    mockProducts[idx] = updated
    return updated
  }

  const data = await authGraphqlFetch<{ updateProduct: Product }>(
    UPDATE_PRODUCT_MUTATION,
    { id, input },
    token,
  )
  return data.updateProduct
}

export async function deleteProduct(
  token: string,
  id: string,
): Promise<void> {
  if (useSeedData()) {
    mockProducts = mockProducts.filter((p) => p.id !== id)
    return
  }

  await authGraphqlFetch<{ deleteProduct: { id: string } }>(
    DELETE_PRODUCT_MUTATION,
    { id },
    token,
  )
}

// Formatting helpers
export function formatPrice(cents: number, currency = 'USD'): string {
  if (cents === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

// Re-export seed data
export { SEED_PRODUCTS }
