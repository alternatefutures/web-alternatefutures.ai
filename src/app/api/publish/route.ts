import { NextResponse, type NextRequest } from 'next/server'
import { getUserFromCookies, type UserRole } from '@/lib/auth'
import { cookies } from 'next/headers'
import { fetchSocialPostById, updateSocialPost } from '@/lib/social-api'
import { publishPostToPlatforms } from '@/lib/publisher'
import { getXMonthlyUsage } from '@/lib/rate-limit-store'

// Roles that are allowed to publish posts they don't own
const PUBLISH_ANY_ROLES: UserRole[] = ['admin', 'approver']

export async function POST(request: NextRequest) {
  // Authenticate
  const cookieStore = await cookies()
  const user = await getUserFromCookies(cookieStore)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse request
  let body: { postId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { postId } = body
  if (!postId) {
    return NextResponse.json({ error: 'postId is required' }, { status: 400 })
  }

  // Fetch the post
  const token = cookieStore.get('af_access_token')?.value || ''
  const post = await fetchSocialPostById(token, postId)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // --- Authorization: ownership or elevated role ---
  const isOwner = post.createdBy === user.userId
  const canPublishAny = PUBLISH_ANY_ROLES.includes(user.role)
  if (!isOwner && !canPublishAny) {
    return NextResponse.json(
      { error: 'Forbidden: you do not own this post' },
      { status: 403 },
    )
  }

  // --- Approval workflow enforcement ---
  // Posts in PENDING_APPROVAL cannot be published unless the user is an approver/admin
  if (post.status === 'PENDING_APPROVAL' && !canPublishAny) {
    return NextResponse.json(
      { error: 'This post is pending approval and cannot be published yet' },
      { status: 403 },
    )
  }
  // Posts with CHANGES_REQUESTED must go back through approval before publishing
  if (post.status === 'CHANGES_REQUESTED') {
    return NextResponse.json(
      { error: 'This post has requested changes. Please address the feedback and resubmit for approval.' },
      { status: 403 },
    )
  }

  // Validate status — only SCHEDULED, DRAFT, or FAILED posts can be published manually
  if (post.status === 'PUBLISHED') {
    return NextResponse.json({ error: 'Post is already published' }, { status: 409 })
  }
  if (post.status === 'PUBLISHING') {
    return NextResponse.json({ error: 'Post is currently being published' }, { status: 409 })
  }

  // Mark as PUBLISHING
  try {
    await updateSocialPost(token, postId, { status: 'PUBLISHING' })
  } catch {
    // Continue even if status update fails — the publish itself matters
  }

  // Publish
  const result = await publishPostToPlatforms(post)

  if (result.success) {
    // Update post to PUBLISHED with platform URL
    try {
      await updateSocialPost(token, postId, { status: 'PUBLISHED' })
    } catch {
      // Log but don't fail — post was published
    }

    const response: Record<string, unknown> = {
      success: true,
      postId: result.postId,
      url: result.url,
      publishedAt: result.publishedAt,
    }

    // Include X monthly usage if publishing to X
    if (post.platform === 'X') {
      response.xMonthlyUsage = getXMonthlyUsage()
    }

    return NextResponse.json(response)
  }

  // Publish failed — update status to FAILED
  try {
    await updateSocialPost(token, postId, { status: 'FAILED' })
  } catch {
    // Best effort
  }

  return NextResponse.json(
    {
      success: false,
      error: result.error,
      platform: result.platform,
    },
    { status: 502 },
  )
}
