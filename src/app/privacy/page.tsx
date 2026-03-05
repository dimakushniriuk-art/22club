import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/ui/animations'
import { ChevronLeft } from 'lucide-react'
import { PrivacyAccordion } from './_components/privacy-accordion'

export const metadata: Metadata = {
  title: 'Privacy, Termini e Cookie | 22Club',
  description: 'Privacy Policy, Termini e Condizioni e Cookie Policy di 22Club. Documenti legali GDPR-compliant.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5 animate-pulse-glow" />
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-brand text-sm font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Torna indietro
        </Link>
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.svg"
            alt="22 Club"
            width={120}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
        <div className="w-24" aria-hidden />
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <FadeIn>
          <Card className="mx-auto max-w-3xl border-border bg-background-secondary/95 backdrop-blur-sm rounded-2xl shadow-xl">
            <CardContent className="p-6 sm:p-8">
              <PrivacyAccordion />
            </CardContent>
          </Card>
        </FadeIn>
      </main>
    </div>
  )
}
