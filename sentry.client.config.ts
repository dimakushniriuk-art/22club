import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 0.3,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
  beforeSendTransaction(event) {
    // Filter out development transactions
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
