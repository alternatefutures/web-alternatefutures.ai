// @vitest-environment jsdom

import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const navigation = vi.hoisted(() => ({ pathname: '/', query: '' }))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(navigation.query),
}))

import GoogleAnalytics, {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_CONSENT_VERSION,
  readAnalyticsConsent,
  saveAnalyticsConsent,
} from './GoogleAnalytics'

const measurementDisabled = () =>
  (window as unknown as Record<string, unknown>)['ga-disable-G-2PDRFVML9M']

const analyticsCalls = () => window.dataLayer ?? []

afterEach(() => {
  cleanup()
})

describe('GoogleAnalytics state transitions', () => {
  it('stores a versioned consent receipt and removes analytics cookies on withdrawal', () => {
    const storedValues = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => storedValues.clear(),
        getItem: (key: string) => storedValues.get(key) ?? null,
        key: (index: number) => Array.from(storedValues.keys())[index] ?? null,
        get length() {
          return storedValues.size
        },
        removeItem: (key: string) => storedValues.delete(key),
        setItem: (key: string, value: string) => storedValues.set(key, value),
      } satisfies Storage,
    })

    document.cookie = '_ga=test-client; Path=/'
    document.cookie = '_ga_TEST=test-session; Path=/'

    act(() => saveAnalyticsConsent('declined'))

    expect(readAnalyticsConsent()).toBe('declined')
    expect(document.cookie).not.toContain('_ga=')
    expect(document.cookie).not.toContain('_ga_TEST=')

    const receipt = JSON.parse(
      window.localStorage.getItem(ANALYTICS_CONSENT_KEY) ?? '{}',
    ) as { choice?: string; updatedAt?: string; version?: string }
    expect(receipt.choice).toBe('declined')
    expect(receipt.version).toBe(ANALYTICS_CONSENT_VERSION)
    expect(Number.isNaN(Date.parse(receipt.updatedAt ?? ''))).toBe(false)
  })

  it('removes a failed script and never lets an in-flight load override current consent or route', async () => {
    const storedValues = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => storedValues.clear(),
        getItem: (key: string) => storedValues.get(key) ?? null,
        key: (index: number) => Array.from(storedValues.keys())[index] ?? null,
        get length() {
          return storedValues.size
        },
        removeItem: (key: string) => storedValues.delete(key),
        setItem: (key: string, value: string) => storedValues.set(key, value),
      } satisfies Storage,
    })

    window.localStorage.clear()
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, 'accepted')
    document.cookie = `${ANALYTICS_CONSENT_KEY}=accepted; Path=/`
    navigation.pathname = '/'
    navigation.query = ''
    window.history.replaceState({}, '', '/')
    window.dataLayer = []
    window.gtag = undefined

    const view = render(<GoogleAnalytics />)

    const firstScript = await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>('script[data-af-analytics]')
      expect(script).not.toBeNull()
      return script as HTMLScriptElement
    })

    act(() => firstScript.dispatchEvent(new Event('error')))
    await waitFor(() => expect(firstScript.isConnected).toBe(false))

    navigation.pathname = '/products'
    window.history.pushState({}, '', '/products')
    view.rerender(<GoogleAnalytics />)

    const retryScript = await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>('script[data-af-analytics]')
      expect(script).not.toBeNull()
      expect(script).not.toBe(firstScript)
      return script as HTMLScriptElement
    })

    act(() => saveAnalyticsConsent('declined'))
    act(() => retryScript.dispatchEvent(new Event('load')))

    await waitFor(() => expect(measurementDisabled()).toBe(true))
    expect(analyticsCalls()).not.toContainEqual([
      'consent',
      'update',
      { analytics_storage: 'granted' },
    ])
    expect(analyticsCalls().some((call) => call[0] === 'event' && call[1] === 'page_view')).toBe(
      false,
    )

    act(() => saveAnalyticsConsent('accepted'))
    await waitFor(() => expect(measurementDisabled()).toBe(false))
    await waitFor(() =>
      expect(
        analyticsCalls().some(
          (call) =>
            call[0] === 'event' &&
            call[1] === 'page_view' &&
            (call[2] as { page_path?: string }).page_path === '/products',
        ),
      ).toBe(true),
    )

    navigation.pathname = '/admin'
    window.history.pushState({}, '', '/admin')
    view.rerender(<GoogleAnalytics />)
    await waitFor(() => expect(measurementDisabled()).toBe(true))

    navigation.pathname = '/consulting'
    window.history.pushState({}, '', '/consulting')
    view.rerender(<GoogleAnalytics />)
    await waitFor(() => expect(measurementDisabled()).toBe(false))
    await waitFor(() =>
      expect(
        analyticsCalls().some(
          (call) =>
            call[0] === 'event' &&
            call[1] === 'page_view' &&
            (call[2] as { page_path?: string }).page_path === '/consulting',
        ),
      ).toBe(true),
    )

    expect(
      analyticsCalls().some(
        (call) =>
          call[0] === 'event' &&
          call[1] === 'page_view' &&
          ((call[2] as { page_path?: string }).page_path?.startsWith('/admin') ?? false),
      ),
    ).toBe(false)
  })
})
