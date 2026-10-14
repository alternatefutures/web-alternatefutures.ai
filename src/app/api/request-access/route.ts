import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { MARKETING_CONSENT_VERSION } from '@/lib/consent'

// Lazy singleton: constructing `new Resend(undefined)` throws, which crashed
// `next build` during page-data collection (route modules are evaluated then,
// but RESEND_API_KEY isn't available at build time — only at runtime).
let _resend: Resend | null = null
function getResend(): Resend {
  if (_resend) return _resend
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  _resend = new Resend(key)
  return _resend
}

export async function POST(request: Request) {
  try {
    const resend = getResend()
    const body = await request.json()
    const { firstName, lastName, email, workType, workTypeOther, github, projectLink, socialPlatform, socialLink, source, marketingConsent, consentVersion } = body

    // Marketing consent must be an explicit opt-in. Anything other than a
    // literal `true` from the form counts as "no consent" - a missing field, a
    // string, or a submission from an older client all fall through to false.
    const hasMarketingConsent = marketingConsent === true
    const consentedAt = new Date().toISOString()

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
Marketing consent: ${hasMarketingConsent ? `YES (v${consentVersion || MARKETING_CONSENT_VERSION}, ${consentedAt})` : 'NO - do not add to marketing sends'}
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

    // Only enter someone into a Resend marketing audience when they have
    // actually opted in. Without consent we still reply to them and notify the
    // team - that rests on contract / legitimate interests - but they must not
    // land on a marketing list (GDPR Art. 6(1)(a), ePrivacy Art. 13).
    if (hasMarketingConsent) {
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
            source: source || 'request-access',
            // Consent evidence - Art. 7(1) requires us to be able to
            // demonstrate what was agreed to and when.
            marketingConsent: 'true',
            consentedAt: consentedAt,
            consentVersion: consentVersion || MARKETING_CONSENT_VERSION
          }
        } as any)
      } catch (contactError) {
        // Log error but don't fail the request if contact creation fails
        console.error('Error adding contact to Resend:', contactError)
      }
    }

    // Send notification email to internal team
    await resend.emails.send({
      from: 'Access Requests <noreply@updates.alternatefutures.ai>',
      to: process.env.ACCESS_REQUEST_EMAIL || 'system@alternatefutures.ai',
      subject: `Access Request from ${email}`,
      text: emailContent,
      replyTo: email,
    })

    // Send response email to user using template
    const data = await resend.emails.send({
      from: 'Alternate Futures <noreply@updates.alternatefutures.ai>',
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
