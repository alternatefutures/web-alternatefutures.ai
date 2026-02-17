import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { fetchAllSocialPosts, updateSocialPost } from '@/lib/social-api'
import { publishPostToPlatforms } from '@/lib/publisher'
import { getXMonthlyUsage } from '@/lib/rate-limit-store'

// Cron secret — required in ALL environments (no dev bypass)
const CRON_SECRET = process.env.CRON_SECRET

/** Constant-time comparison of two strings (prevents timing attacks). */
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

// Maximum posts to process per cron run to avoid timeouts
const MAX_POSTS_PER_RUN = 10

// Vercel Cron Jobs trigger this endpoint via GET with Authorization header.
export async function GET(request: Request) {
  return handleCronPublish(request)
}

// Also allow POST for manual/external triggers.
export async function POST(request: Request) {
  return handleCronPublish(request)
}

async function handleCronPublish(request: Request) {
  // Verify cron secret — required in ALL environments
  const authHeader = request.headers.get('authorization')
  const provided = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!CRON_SECRET || !provided || !safeCompare(provided, CRON_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use a service token for internal API calls — must be configured
  const serviceToken = process.env.SERVICE_TOKEN
  if (!serviceToken) {
    return NextResponse.json({ error: 'SERVICE_TOKEN not configured' }, { status: 500 })
  }

  try {
    // Fetch all posts
    const allPosts = await fetchAllSocialPosts(serviceToken, 500, 0)

    // Filter: SCHEDULED posts whose scheduledAt is in the past
    const now = new Date()
    const scheduledPosts = allPosts.filter((post) => {
      if (post.status !== 'SCHEDULED') return false
      if (!post.scheduledAt) return false
      return new Date(post.scheduledAt) <= now
    })

    // Also retry FAILED posts (skip permanent failures)
    const failedPosts = allPosts.filter((post) => {
      if (post.status !== 'FAILED') return false
      // Skip permanent failures
      if (post.error?.includes('not configured')) return false
      if (post.error?.includes('not yet supported')) return false
      if (post.error?.includes('monthly limit reached')) return false
      return true
    })

    // Check X monthly limit before including X posts
    const xUsage = await getXMonthlyUsage()
    const postsToPublish = [...scheduledPosts, ...failedPosts]
      .filter((post) => {
        // Skip X posts if monthly limit is reached
        if (post.platform === 'X' && xUsage.remaining <= 0) return false
        return true
      })
      .slice(0, MAX_POSTS_PER_RUN)

    if (postsToPublish.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: 'No posts ready to publish',
        xMonthlyUsage: xUsage,
      })
    }

    const results: Array<{
      postId: string
      platform: string
      success: boolean
      url: string | null
      error: string | null
    }> = []

    for (const post of postsToPublish) {
      // Mark as PUBLISHING
      try {
        await updateSocialPost(serviceToken, post.id, { status: 'PUBLISHING' })
      } catch {
        // Continue
      }

      const result = await publishPostToPlatforms(post)

      if (result.success) {
        try {
          await updateSocialPost(serviceToken, post.id, { status: 'PUBLISHED' })
        } catch {
          // Best effort
        }
        results.push({
          postId: post.id,
          platform: post.platform,
          success: true,
          url: result.url,
          error: null,
        })
      } else {
        try {
          await updateSocialPost(serviceToken, post.id, { status: 'FAILED' })
        } catch {
          // Best effort
        }
        results.push({
          postId: post.id,
          platform: post.platform,
          success: false,
          url: null,
          error: result.error,
        })
      }
    }

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      processed: results.length,
      succeeded,
      failed,
      results,
      xMonthlyUsage: await getXMonthlyUsage(),
    })
  } catch (e) {
    return NextResponse.json(
      {
        error: `Cron publish failed: ${e instanceof Error ? e.message : String(e)}`,
      },
      { status: 500 },
    )
  }
}
