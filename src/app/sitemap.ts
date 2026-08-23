import type { MetadataRoute } from 'next'
import { fetchPublishedPosts } from '@/lib/blog-api'

const SITE_URL = 'https://www.alternatefutures.ai'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
  { url: `${SITE_URL}/products`, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${SITE_URL}/products/clouds`, changeFrequency: 'weekly', priority: 0.95 },
  { url: `${SITE_URL}/consulting`, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  { url: `${SITE_URL}/status`, changeFrequency: 'daily', priority: 0.4 },
  { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await fetchPublishedPosts(500, 0)
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt || undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticRoutes, ...postRoutes]
  } catch {
    return staticRoutes
  }
}
