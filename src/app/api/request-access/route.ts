import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, workType, workTypeOther, github, projectLink, socialPlatform, socialLink, source } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !workType) {
      return NextResponse.json(
        { error: 'First name, last name, email and work type are required' },
        { status: 400 }
      )
    }

    // Validate workTypeOther when workType is 'other'
    if (workType === 'other' && !workTypeOther) {
      return NextResponse.json(
        { error: 'Please specify your type of work' },
        { status: 400 }
      )
    }

    // Use workTypeOther if workType is 'other', otherwise use workType
    const displayWorkType = workType === 'other' ? workTypeOther : workType

    // Determine segment name, audience ID, and template based on source
    const segmentName = source === 'get-in-touch' ? 'Get in Touch' : 'Beta Request Access'
    const audienceId = source === 'get-in-touch'
      ? 'a997de34-7247-4925-a133-cf76f8e999d5'
      : '59f49eeb-db95-4d93-b52f-1b7042e08d96'
    const emailTemplate = source === 'get-in-touch'
      ? 'front-page-reach-out'
      : 'request-beta-access'
    const emailSubject = source === 'get-in-touch'
      ? 'Thanks for reaching out!'
      : 'Welcome to Alternate Clouds Beta'

    // Build email content
    let emailContent = `
New Access Request (${segmentName})

Name: ${firstName} ${lastName}
Email: ${email}
Type of Work: ${displayWorkType}
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

    // Add contact to Resend audience with all form data
    try {
      await resend.contacts.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
        audienceId: audienceId,
        unsubscribed: false,
        properties: {
          workType: workType,
          workTypeOther: workTypeOther || '',
          github: github || '',
          projectLink: projectLink || '',
          socialPlatform: socialPlatform || '',
          socialLink: socialLink || '',
          source: source || 'request-access'
        }
      } as any)
    } catch (contactError) {
      // Log error but don't fail the request if contact creation fails
      console.error('Error adding contact to Resend:', contactError)
    }

    // Send notification email to internal team
    await resend.emails.send({
      from: 'Access Requests <noreply@alternatefutures.ai>',
      to: process.env.ACCESS_REQUEST_EMAIL || 'system@alternatefutures.ai',
      subject: `Access Request from ${email}`,
      text: emailContent,
      replyTo: email,
    })

    // Send response email to user using template
    const data = await resend.emails.send({
      from: 'Alternate Futures <noreply@alternatefutures.ai>',
      to: email,
      subject: emailSubject,
      // @ts-ignore - Resend template reference
      template: emailTemplate,
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
