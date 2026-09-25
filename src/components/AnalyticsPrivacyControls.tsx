'use client'

import { useEffect, useState } from 'react'
import {
  ANALYTICS_CONSENT_EVENT,
  readAnalyticsConsent,
  saveAnalyticsConsent,
} from './GoogleAnalytics'

type ConsentChoice = 'accepted' | 'declined'

export default function AnalyticsPrivacyControls() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null)

  useEffect(() => {
    const readChoice = () => {
      setChoice(readAnalyticsConsent())
    }
    const handleChoice = (event: Event) => {
      setChoice((event as CustomEvent<ConsentChoice>).detail)
    }

    readChoice()
    window.addEventListener('storage', readChoice)
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleChoice)
    return () => {
      window.removeEventListener('storage', readChoice)
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleChoice)
    }
  }, [])

  return (
    <div className="privacy-controls" aria-live="polite">
      <p>
        Current choice: <strong>{choice === 'accepted' ? 'Analytics accepted' : choice === 'declined' ? 'Analytics declined' : 'Not chosen'}</strong>
      </p>
      <div className="privacy-controls__actions">
        <button type="button" onClick={() => saveAnalyticsConsent('accepted')}>Accept analytics</button>
        <button type="button" onClick={() => saveAnalyticsConsent('declined')}>Decline analytics</button>
      </div>
    </div>
  )
}
