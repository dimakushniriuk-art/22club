'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/animations'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 animate-pulse-glow" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(2, 179, 191, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2, 179, 191, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <FadeIn>
        <Card className="w-full max-w-md bg-transparent border-0 relative z-10">
          <CardContent className="p-8 text-center">
            <h1 className="text-9xl font-bold text-brand mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">
              Pagina non trovata
            </h2>
            <p className="text-text-secondary mb-8">
              La pagina che stai cercando non esiste o è stata spostata.
            </p>
            <Link href="/">
              <Button className="w-full text-text-primary font-semibold py-3 rounded-lg transition-all duration-200">
                Torna alla Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
