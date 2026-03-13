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
    <div className="min-h-screen min-h-dvh bg-background text-text-primary flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
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
            className="h-10 w-auto object-contain drop-shadow-[0_0_24px_rgba(255,255,255,0.08)]"
            priority
          />
        </Link>
        <div className="w-24" aria-hidden />
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <FadeIn>
          <Card className="mx-auto max-w-3xl rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
            <CardContent className="p-6 sm:p-8">
              <PrivacyAccordion />
            </CardContent>
          </Card>
        </FadeIn>
      </main>
    </div>
  )
}
