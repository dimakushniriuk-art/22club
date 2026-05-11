export function getSentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    'development'
  )
}

export function getSentryRelease(): string | undefined {
  const release =
    process.env.SENTRY_RELEASE ??
    process.env.NEXT_PUBLIC_APP_VERSION ??
    process.env.VERCEL_GIT_COMMIT_SHA

  const trimmed = release?.trim()
  return trimmed || undefined
}
