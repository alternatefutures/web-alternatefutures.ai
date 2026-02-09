import { fetchPublishedPosts, type BlogPost } from '@/lib/blog-api'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://alternatefutures.ai'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  let posts: BlogPost[] = []
  try {
    posts = await fetchPublishedPosts(50, 0)
  } catch {
    // Return empty feed if API is unreachable
  }

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.excerpt || '')}</description>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
      ${post.tags.map((t) => `<category>${escapeXml(t.name)}</category>`).join('\n      ')}
    </item>`,
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Alternate Futures Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Insights on decentralized cloud, AI agents, Web3 hosting, and the future of infrastructure.</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
