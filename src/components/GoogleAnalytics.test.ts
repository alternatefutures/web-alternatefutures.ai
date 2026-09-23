import { describe, expect, it } from 'vitest'
import {
  getAnalyticsPagePath,
  isAnalyticsEligiblePath,
  shouldEnableAnalytics,
} from './GoogleAnalytics'

describe('GoogleAnalytics route controls', () => {
  it('excludes login and every admin route', () => {
    expect(isAnalyticsEligiblePath('/login')).toBe(false)
    expect(isAnalyticsEligiblePath('/admin')).toBe(false)
    expect(isAnalyticsEligiblePath('/admin/growth/analytics')).toBe(false)
    expect(isAnalyticsEligiblePath('/products')).toBe(true)
  })

  it('requires both an eligible route and explicit acceptance', () => {
    expect(shouldEnableAnalytics('/products', 'accepted')).toBe(true)
    expect(shouldEnableAnalytics('/products', 'declined')).toBe(false)
    expect(shouldEnableAnalytics('/products', null)).toBe(false)
    expect(shouldEnableAnalytics('/admin', 'accepted')).toBe(false)
    expect(shouldEnableAnalytics('/login', 'accepted')).toBe(false)
  })

  it('keeps useful campaign and public-filter parameters', () => {
    expect(
      getAnalyticsPagePath(
        '/blog',
        '?tag=ai&page=2&utm_source=linkedin&utm_medium=social&utm_campaign=brains',
      ),
    ).toBe('/blog?tag=ai&page=2&utm_source=linkedin&utm_medium=social&utm_campaign=brains')
  })

  it('removes sensitive and unknown query parameters', () => {
    expect(
      getAnalyticsPagePath(
        '/login',
        '?email=person%40example.com&token=secret&code=123456&redirect=%2Fadmin&utm_source=docs',
      ),
    ).toBe('/login?utm_source=docs')
  })

  it('preserves repeated safe parameters without leaking unsafe ones', () => {
    expect(getAnalyticsPagePath('/blog', '?tag=ai&tag=hci&session_id=private')).toBe(
      '/blog?tag=ai&tag=hci',
    )
  })
})
