'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const ANALYTICS_CONSENT_KEY = 'af-analytics-consent-v1'
export const ANALYTICS_CONSENT_EVENT = 'af:analytics-consent'

const MEASUREMENT_ID = 'G-2PDRFVML9M'
const SAFE_QUERY_PARAMETERS = new Set([
  'page',
  'ref',
  'tag',
  'utm_campaign',
  'utm_content',
  'utm_medium',
  'utm_source',
  'utm_term',
])

export type ConsentChoice = 'accepted' | 'declined'

declare global {
  interface Window {
    dataLayer: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

let analyticsLoadPromise: Promise<void> | null = null
let lastTrackedUrl = ''

export function isAnalyticsEligiblePath(pathname: string) {
  return !pathname.startsWith('/admin') && pathname !== '/login'
}

export function shouldEnableAnalytics(
  pathname: string,
  consent: ConsentChoice | null | undefined,
) {
  return isAnalyticsEligiblePath(pathname) && consent === 'accepted'
}

export function getAnalyticsPagePath(pathname: string, search: string) {
  const source = new URLSearchParams(search)
  const safe = new URLSearchParams()

  source.forEach((value, key) => {
    if (SAFE_QUERY_PARAMETERS.has(key)) safe.append(key, value)
  })

  const query = safe.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function readAnalyticsConsent(): ConsentChoice | null {
  try {
    const saved = window.localStorage?.getItem(ANALYTICS_CONSENT_KEY)
    if (saved === 'accepted' || saved === 'declined') return saved
  } catch {
    // Some privacy modes disable localStorage; the essential preference cookie is the fallback.
  }

  const cookieChoice = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${ANALYTICS_CONSENT_KEY}=`))
    ?.split('=')[1]

  return cookieChoice === 'accepted' || cookieChoice === 'declined' ? cookieChoice : null
}

function setAnalyticsDisabled(disabled: boolean) {
  const analyticsWindow = window as unknown as Record<string, unknown>
  analyticsWindow[`ga-disable-${MEASUREMENT_ID}`] = disabled
}

function loadGoogleAnalytics(): Promise<void> {
  if (analyticsLoadPromise) return analyticsLoadPromise

  const pendingLoad = new Promise<void>((resolve, reject) => {
    window.dataLayer = window.dataLayer || []
    window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer.push(args))

    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-af-analytics="${MEASUREMENT_ID}"]`,
    )

    const configure = () => {
      window.gtag?.('js', new Date())
      window.gtag?.('config', MEASUREMENT_ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      })
      resolve()
    }

    if (existingScript) {
      configure()
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    script.dataset.afAnalytics = MEASUREMENT_ID
    script.addEventListener('load', configure, { once: true })
    script.addEventListener(
      'error',
      () => {
        script.remove()
        reject(new Error('Google Analytics failed to load'))
      },
      { once: true },
    )
    document.head.appendChild(script)
  })

  analyticsLoadPromise = pendingLoad.catch((error) => {
    analyticsLoadPromise = null
    throw error
  })

  return analyticsLoadPromise
}

export function saveAnalyticsConsent(choice: ConsentChoice) {
  try {
    window.localStorage?.setItem(ANALYTICS_CONSENT_KEY, choice)
  } catch {
    // The cookie below keeps the choice durable when localStorage is unavailable.
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${ANALYTICS_CONSENT_KEY}=${choice}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent(ANALYTICS_CONSENT_EVENT, { detail: choice }))
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const [consent, setConsent] = useState<ConsentChoice | null | undefined>(undefined)
  const analyticsEligible = isAnalyticsEligiblePath(pathname)
  const showConsentBanner = analyticsEligible && pathname !== '/privacy'

  useEffect(() => {
    const readConsent = () => {
      setConsent(readAnalyticsConsent())
    }

    const handleConsent = (event: Event) => {
      const choice = (event as CustomEvent<ConsentChoice>).detail
      setConsent(choice)
    }

    readConsent()
    window.addEventListener('storage', readConsent)
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent)

    return () => {
      window.removeEventListener('storage', readConsent)
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent)
    }
  }, [])

  useEffect(() => {
    if (!shouldEnableAnalytics(pathname, consent)) {
      setAnalyticsDisabled(true)
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
      lastTrackedUrl = ''
      return
    }

    let cancelled = false

    void loadGoogleAnalytics()
      .then(() => {
        const latestPathname = window.location.pathname
        const latestConsent = readAnalyticsConsent()

        if (cancelled || !shouldEnableAnalytics(latestPathname, latestConsent)) {
          setAnalyticsDisabled(true)
          window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
          lastTrackedUrl = ''
          return
        }

        setAnalyticsDisabled(false)
        window.gtag?.('consent', 'update', { analytics_storage: 'granted' })

        const pagePath = getAnalyticsPagePath(window.location.pathname, window.location.search)
        if (lastTrackedUrl === pagePath) return

        lastTrackedUrl = pagePath
        window.gtag?.('event', 'page_view', {
          page_location: new URL(pagePath, window.location.origin).toString(),
          page_path: pagePath,
          page_title: document.title,
        })
      })
      .catch(() => {
        // Analytics is intentionally non-essential; the site remains fully functional if blocked.
      })

    return () => {
      cancelled = true
    }
  }, [analyticsEligible, consent, pathname, queryString])

  if (consent !== null || !showConsentBanner) return null

  return (
    <aside className="analytics-consent" aria-labelledby="analytics-consent-title">
      <div className="analytics-consent__copy">
        <p className="analytics-consent__eyebrow">YOUR PRIVACY, YOUR CHOICE</p>
        <h2 id="analytics-consent-title">Help us build what people need.</h2>
        <p>
          Optional analytics show us which pages are useful and how people find Alternate Futures.
          We do not use this data for advertising.
        </p>
        <a href="/privacy">Read our privacy policy</a>
      </div>
      <div className="analytics-consent__actions">
        <button type="button" className="analytics-consent__accept" onClick={() => saveAnalyticsConsent('accepted')}>
          Accept analytics
        </button>
        <button type="button" className="analytics-consent__decline" onClick={() => saveAnalyticsConsent('declined')}>
          No thanks
        </button>
      </div>
    </aside>
  )
}
