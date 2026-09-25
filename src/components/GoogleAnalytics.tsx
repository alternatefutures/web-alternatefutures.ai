'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export const ANALYTICS_CONSENT_KEY = 'af-analytics-consent-v2'
export const ANALYTICS_CONSENT_EVENT = 'af:analytics-consent'
export const ANALYTICS_CONSENT_VERSION = '2026-09-25'

const MEASUREMENT_ID = 'G-2PDRFVML9M'
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180
const LEGACY_CONSENT_KEY = 'af-analytics-consent-v1'
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

type ConsentRecord = {
  choice: ConsentChoice
  updatedAt: string
  version: string
}

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
    if (saved) {
      const record = JSON.parse(saved) as Partial<ConsentRecord>
      if (
        record.version === ANALYTICS_CONSENT_VERSION &&
        (record.choice === 'accepted' || record.choice === 'declined')
      ) {
        return record.choice
      }
    }
  } catch {
    // Some privacy modes disable localStorage; the essential preference cookie is the fallback.
  }

  const cookieChoice = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${ANALYTICS_CONSENT_KEY}=`))
    ?.split('=')[1]

  return cookieChoice === 'accepted' || cookieChoice === 'declined' ? cookieChoice : null
}

function analyticsCookieDomain() {
  const hostname = window.location.hostname
  return hostname === 'alternatefutures.ai' || hostname.endsWith('.alternatefutures.ai')
    ? '; Domain=.alternatefutures.ai'
    : ''
}

export function clearGoogleAnalyticsCookies() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const cookieNames = document.cookie
    .split('; ')
    .map((cookie) => cookie.split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}`
    const domain = analyticsCookieDomain()
    if (domain) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${secure}${domain}`
    }
  })
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
        anonymize_ip: true,
        cookie_expires: CONSENT_MAX_AGE_SECONDS,
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
  const record: ConsentRecord = {
    choice,
    updatedAt: new Date().toISOString(),
    version: ANALYTICS_CONSENT_VERSION,
  }

  try {
    window.localStorage?.removeItem(LEGACY_CONSENT_KEY)
    window.localStorage?.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(record))
  } catch {
    // The cookie below keeps the choice durable when localStorage is unavailable.
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${LEGACY_CONSENT_KEY}=; Max-Age=0; Path=/; SameSite=Lax${secure}`
  document.cookie = `${ANALYTICS_CONSENT_KEY}=${choice}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`
  if (choice === 'declined') clearGoogleAnalyticsCookies()
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
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      })
      if (consent === 'declined') clearGoogleAnalyticsCookies()
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
        window.gtag?.('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        })

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
          Decline analytics
        </button>
      </div>
    </aside>
  )
}
