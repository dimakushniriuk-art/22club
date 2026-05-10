// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { isConfiguredSentryDsn } from '@/lib/sentry/is-configured-dsn'

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
const isProd = process.env.NODE_ENV === 'production'

if (isConfiguredSentryDsn(dsn)) {
  // tracesSampleRate: 1 in produzione tracciava ogni request server + middleware (runtime nodejs),
  // sommandosi a TTFB su mobile. Allineato al client (0.1 prod / 1 dev).
  Sentry.init({
    dsn,
    tracesSampleRate: isProd ? 0.1 : 1,
    enableLogs: isProd ? false : true,
    sendDefaultPii: false,
  })
}
