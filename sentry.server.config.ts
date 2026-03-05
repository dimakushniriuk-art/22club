import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
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
