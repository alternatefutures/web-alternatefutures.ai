// ---------------------------------------------------------------------------
// Marketing consent wording and version
// ---------------------------------------------------------------------------
// GDPR Art. 7(1) requires us to be able to demonstrate that a person consented,
// which means recording *what they agreed to*, not just that a box was ticked.
// The label rendered in the form and the version stamped onto the stored
// contact both come from here, so the two can never drift apart.
//
// Bump MARKETING_CONSENT_VERSION whenever MARKETING_CONSENT_TEXT changes in a
// way that alters what the person is agreeing to. Consent recorded against an
// older version stays valid for that older wording.

export const MARKETING_CONSENT_VERSION = '2026-09-04'

export const MARKETING_CONSENT_TEXT =
  'Email me occasional product updates and news about Alternate Clouds. I can unsubscribe at any time.'
