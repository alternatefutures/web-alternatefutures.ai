// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import RequestAccessModal from './RequestAccessModal'
import { MARKETING_CONSENT_TEXT } from '@/lib/consent'

vi.mock('@/hooks/useDialog', () => ({
  useDialog: () => ({ current: null }),
}))

// RTL's automatic cleanup only kicks in with vitest globals enabled, which
// this config doesn't use - so unmount between tests explicitly, otherwise
// each render stacks another modal into the same document.
afterEach(cleanup)

describe('RequestAccessModal — consent at point of collection', () => {
  it('offers the marketing opt-in unticked by default', () => {
    render(<RequestAccessModal isOpen onClose={() => {}} />)

    const consent = screen.getByRole('checkbox', { name: MARKETING_CONSENT_TEXT })
    expect(consent).not.toBeChecked()
  })

  it('does not make the opt-in a precondition of submitting', () => {
    render(<RequestAccessModal isOpen onClose={() => {}} />)

    // Consent has to be freely given (Art. 7(4)), so beta access must not be
    // conditioned on accepting marketing.
    expect(screen.getByRole('checkbox', { name: MARKETING_CONSENT_TEXT })).not.toBeRequired()
    expect(screen.getByRole('button', { name: /submit request/i })).toBeEnabled()
  })

  it('links to the privacy policy where the data is collected', () => {
    render(<RequestAccessModal isOpen onClose={() => {}} />)

    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy')
  })
})
