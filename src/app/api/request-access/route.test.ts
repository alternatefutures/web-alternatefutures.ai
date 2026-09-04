import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MARKETING_CONSENT_VERSION } from '@/lib/consent'

const contactsCreate = vi.fn().mockResolvedValue({ data: null, error: null })
const emailsSend = vi.fn().mockResolvedValue({ data: { id: 'test' }, error: null })

vi.mock('resend', () => ({
  Resend: class {
    contacts = { create: contactsCreate }
    emails = { send: emailsSend }
  },
}))

// The route builds its Resend client lazily from this, so it must be set
// before the module under test is imported.
process.env.RESEND_API_KEY = 'test-key'

const { POST } = await import('./route')

function submit(body: Record<string, unknown>) {
  return POST(
    new Request('https://alternatefutures.ai/api/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        workType: 'development',
        ...body,
      }),
    })
  )
}

describe('POST /api/request-access — marketing consent gate', () => {
  beforeEach(() => {
    contactsCreate.mockClear()
    emailsSend.mockClear()
  })

  it('does not add the person to a marketing audience without consent', async () => {
    const res = await submit({ marketingConsent: false })

    expect(res.status).toBe(200)
    expect(contactsCreate).not.toHaveBeenCalled()
  })

  it('treats an absent consent field as no consent', async () => {
    const res = await submit({})

    expect(res.status).toBe(200)
    expect(contactsCreate).not.toHaveBeenCalled()
  })

  it('does not accept a truthy non-boolean as consent', async () => {
    const res = await submit({ marketingConsent: 'yes' })

    expect(res.status).toBe(200)
    expect(contactsCreate).not.toHaveBeenCalled()
  })

  it('still replies to the person and notifies the team without consent', async () => {
    await submit({ marketingConsent: false })

    // one internal notification + one reply to the submitter
    expect(emailsSend).toHaveBeenCalledTimes(2)
    const recipients = emailsSend.mock.calls.map((call) => call[0].to)
    expect(recipients).toContain('jane@example.com')
  })

  it('records the consent decision on the internal notification', async () => {
    await submit({ marketingConsent: false })

    const notification = emailsSend.mock.calls[0][0]
    expect(notification.text).toContain('Marketing consent: NO')
  })

  it('adds the person to the audience when they opt in', async () => {
    const res = await submit({ marketingConsent: true })

    expect(res.status).toBe(200)
    expect(contactsCreate).toHaveBeenCalledTimes(1)
    expect(contactsCreate.mock.calls[0][0]).toMatchObject({
      email: 'jane@example.com',
      unsubscribed: false,
    })
  })

  it('stamps demonstrable consent evidence on the contact', async () => {
    await submit({ marketingConsent: true, consentVersion: MARKETING_CONSENT_VERSION })

    const { properties } = contactsCreate.mock.calls[0][0]
    expect(properties.marketingConsent).toBe('true')
    expect(properties.consentVersion).toBe(MARKETING_CONSENT_VERSION)
    expect(Date.parse(properties.consentedAt)).not.toBeNaN()
  })

  it('falls back to the current consent version when the client sends none', async () => {
    await submit({ marketingConsent: true })

    const { properties } = contactsCreate.mock.calls[0][0]
    expect(properties.consentVersion).toBe(MARKETING_CONSENT_VERSION)
  })

  it('rejects submissions missing required fields before touching Resend', async () => {
    const res = await submit({ email: undefined, marketingConsent: true })

    expect(res.status).toBe(400)
    expect(contactsCreate).not.toHaveBeenCalled()
    expect(emailsSend).not.toHaveBeenCalled()
  })
})
