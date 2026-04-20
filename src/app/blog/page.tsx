import { Metadata } from 'next'
import Link from 'next/link'
import { fetchPublishedPosts, fetchTags, type BlogPost } from '@/lib/blog-api'

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; page?: string }>
}

const POSTS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Insights on decentralized cloud, AI agents, Web3 hosting, and the future of infrastructure from the Alternate Futures team.',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="blog-post-card">
      {post.coverImage ? (
        <img
          src={post.coverImage}
          alt={post.title}
          className="blog-post-card-image"
          loading="lazy"
        />
      ) : (
        <div className="blog-post-card-image-placeholder">
          <span>AF</span>
        </div>
      )}
      <div className="blog-post-card-body">
        {post.tags.length > 0 && (
          <div className="blog-post-card-tags">
            {post.tags.map((tag) => (
              <span key={tag.id} className="blog-tag-chip">
                {tag.name}
              </span>
            ))}
          </div>
        )}
        <h2 className="blog-post-card-title">{post.title}</h2>
        {post.excerpt && (
          <p className="blog-post-card-excerpt">{post.excerpt}</p>
        )}
        <div className="blog-post-card-meta">
          <span>{formatDate(post.publishedAt)}</span>
          {post.readingTimeMin && <span>{post.readingTimeMin} min read</span>}
        </div>
      </div>
    </Link>
  )
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const activeTag = params.tag || null
  const page = Math.max(1, parseInt(params.page || '1', 10))

  let posts: BlogPost[] = []
  let tags: { id: string; name: string; slug: string }[] = []

  try {
    ;[posts, tags] = await Promise.all([
      fetchPublishedPosts(POSTS_PER_PAGE + 1, (page - 1) * POSTS_PER_PAGE),
      fetchTags(),
    ])
  } catch {
    // API unreachable — show empty state
  }

  const hasNextPage = posts.length > POSTS_PER_PAGE
  const displayPosts = hasNextPage ? posts.slice(0, POSTS_PER_PAGE) : posts

  const filteredPosts = activeTag
    ? displayPosts.filter((p) =>
        p.tags.some((t) => t.slug === activeTag),
      )
    : displayPosts

  return (
    <>
      <div className="blog-header">
        <h1>Blog</h1>
        <p>
          Insights on decentralized cloud, AI agents, and the future of
          infrastructure.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="blog-tags-filter">
          <Link
            href="/blog"
            className={`tag-filter-btn ${!activeTag ? 'active' : ''}`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className={`tag-filter-btn ${activeTag === tag.slug ? 'active' : ''}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="blog-posts-grid">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="blog-empty">
          <h2>No posts yet</h2>
          <p>Check back soon for updates from the Alternate Futures team.</p>
        </div>
      )}

      {(hasNextPage || page > 1) && !activeTag && (
        <div className="blog-load-more">
          {page > 1 && (
            <Link
              href={page === 2 ? '/blog' : `/blog?page=${page - 1}`}
              className="blog-load-more-btn"
            >
              Previous
            </Link>
          )}
          {hasNextPage && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="blog-load-more-btn"
              style={{ marginLeft: page > 1 ? 12 : 0 }}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </>
  )
}
