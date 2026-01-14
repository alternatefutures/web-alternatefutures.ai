import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, workType, github, projectLink, socialPlatform, socialLink } = body

    // Validate required fields
    if (!email || !workType) {
      return NextResponse.json(
        { error: 'Email and work type are required' },
        { status: 400 }
      )
    }

    // Build email content
    let emailContent = `
New Access Request

Email: ${email}
Type of Work: ${workType}
`

    if (github) {
      emailContent += `GitHub: ${github}\n`
    }

    if (projectLink) {
      emailContent += `Project Link: ${projectLink}\n`
    }

    if (socialLink) {
      emailContent += `Social (${socialPlatform}): ${socialLink}\n`
    }

    // Send email via Resend
    const data = await resend.emails.send({
      from: 'Access Requests <noreply@alternatefutures.ai>',
      to: process.env.ACCESS_REQUEST_EMAIL || 'system@alternatefutures.ai',
      subject: `Access Request from ${email}`,
      text: emailContent,
      replyTo: email,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending access request:', error)
    return NextResponse.json(
      { error: 'Failed to send access request' },
      { status: 500 }
    )
  }
}
