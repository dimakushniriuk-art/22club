'use client'

/**
 * AthleteBackground Component
 *
 * Background decorative elements for athlete account pages
 * Matches the login page design system
 */
export function AthleteBackground() {
  return (
    <>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 animate-pulse-glow" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(2, 179, 191, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 179, 191, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative Elements - sottili, dietro al contenuto */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
      <div
        className="absolute bottom-32 right-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-teal-500/5 rounded-full blur-3xl"
        style={{ animationDelay: '2s' }}
      />
    </>
  )
}
