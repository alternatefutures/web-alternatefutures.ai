import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { fetchPostBySlug, fetchPublishedPosts } from '@/lib/blog-api'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  try {
    const posts = await fetchPublishedPosts(100, 0)
    return posts.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt || ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alternatefutures.ai'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags.map((t) => t.name),
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630 }]
        : undefined,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const htmlContent = marked.parse(post.content)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alternatefutures.ai'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const shareText = encodeURIComponent(post.title)
  const shareUrl = encodeURIComponent(postUrl)

  return (
    <article className="blog-post-detail">
      <Link href="/blog" className="blog-post-back">
        ← Back to Blog
      </Link>

      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="blog-post-cover"
        />
      )}

      {post.tags.length > 0 && (
        <div className="blog-post-tags">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className="blog-tag-chip"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      <h1 className="blog-post-title">{post.title}</h1>

      <div className="blog-post-meta">
        {post.authorName && (
          <span className="blog-post-author">{post.authorName}</span>
        )}
        <span>{formatDate(post.publishedAt)}</span>
        {post.readingTimeMin && <span>{post.readingTimeMin} min read</span>}
      </div>

      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      <div className="blog-post-share">
        <h3>Share this post</h3>
        <div className="blog-post-share-links">
          <a
            href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-share-btn"
          >
            X / Twitter
          </a>
          <a
            href={`https://bsky.app/intent/compose?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-share-btn"
          >
            Bluesky
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-share-btn"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </article>
  )
}
