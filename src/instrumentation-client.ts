// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { isConfiguredSentryDsn } from '@/lib/sentry/is-configured-dsn'
import { hasAnalyticsConsent } from '@/lib/cookie-consent-storage'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (isConfiguredSentryDsn(dsn)) {
  const analyticsOk = typeof window !== 'undefined' && hasAnalyticsConsent()
  const isProd = process.env.NODE_ENV === 'production'

  Sentry.init({
    dsn,

    integrations: [Sentry.replayIntegration()],

    tracesSampleRate: analyticsOk ? (isProd ? 0.12 : 1) : 0,

    enableLogs: analyticsOk,

    replaysSessionSampleRate: analyticsOk ? (isProd ? 0.04 : 0.1) : 0,

    replaysOnErrorSampleRate: analyticsOk ? (isProd ? 0.35 : 1.0) : 0,

    sendDefaultPii: analyticsOk,

    beforeSend(event) {
      if (hasAnalyticsConsent()) return event
      if (event.exception) return event
      return null
    },
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
