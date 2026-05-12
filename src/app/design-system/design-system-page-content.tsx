'use client'

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Separator } from '@/components/ui'
import { Button } from '@/components/ui'
import { Skeleton } from '@/components/shared/ui/skeleton'
import {
  getDesignSystemCss,
  getDesignSystemReact,
  downloadFile,
  buildDesignSystemPdf,
} from '@/lib/design-system-export'
import { FoundationsColors } from './_sections/foundations-colors'
import { FoundationsTypography } from './_sections/foundations-typography'
import { FoundationsSpacingRadius } from './_sections/foundations-spacing-radius'
import { FoundationsMotion } from './_sections/foundations-motion'
import { SectionIcone } from './_sections/section-icone'
import { SectionOverview } from './_sections/section-overview'
import {
  DESIGN_SYSTEM_ICON_BY_NAME,
  DESIGN_SYSTEM_ICON_SAMPLES,
} from '@/lib/design-system/icon-samples'
import {
  ACCENTI_ATLETA,
  ACCENT_HEX,
  HOME_PAGES_DESIGN,
  PATH_META,
  RADIUS_PX,
} from '@/lib/design-system-data'
import {
  Box,
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  Home,
  Layers,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  LogIn,
  Palette,
  Sparkles,
  Square,
  Type,
  Zap,
} from 'lucide-react'

const PatternsLayouts = dynamic(
  () => import('./_sections/patterns-layouts').then((m) => ({ default: m.PatternsLayouts })),
  { ssr: false },
)
const PatternsHeaders = dynamic(
  () => import('./_sections/patterns-headers').then((m) => ({ default: m.PatternsHeaders })),
  { ssr: false },
)
const PatternsComposition = dynamic(
  () =>
    import('./_sections/patterns-composition').then((m) => ({ default: m.PatternsComposition })),
  { ssr: false },
)
const SectionComponenti = dynamic(
  () => import('./_sections/section-componenti').then((m) => ({ default: m.SectionComponenti })),
  { ssr: false },
)
const SectionModuli = dynamic(
  () => import('./_sections/section-moduli').then((m) => ({ default: m.SectionModuli })),
  { ssr: false },
)
const SectionScreens = dynamic(
  () => import('./_sections/section-screens').then((m) => ({ default: m.SectionScreens })),
  { ssr: false },
)
const DesignAreeRoute = dynamic(
  () => import('./_sections/design-aree-route').then((m) => ({ default: m.DesignAreeRoute })),
  { ssr: false },
)
const DesignHomeSection = dynamic(
  () => import('./_sections/design-home').then((m) => ({ default: m.DesignHomeSection })),
  { ssr: false },
)
const PatternsAuthLogin = dynamic(
  () => import('./_sections/patterns-auth-login').then((m) => ({ default: m.PatternsAuthLogin })),
  { ssr: false },
)

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'principi', label: 'Principi', icon: Check },
  { id: 'colori', label: 'Colori', icon: Palette },
  { id: 'tipografia', label: 'Tipografia', icon: Type },
  { id: 'radius', label: 'Radius & Spacing', icon: Square },
  { id: 'motion', label: 'Motion', icon: Zap },
  { id: 'icone', label: 'Icone', icon: Sparkles },
  { id: 'layouts', label: 'Layouts', icon: Layout },
  { id: 'headers', label: 'Headers', icon: Layout },
  { id: 'patterns', label: 'Patterns', icon: Layers },
  { id: 'componenti', label: 'Componenti', icon: Box },
  { id: 'moduli', label: 'Moduli', icon: LayoutGrid },
  { id: 'screens', label: 'Screens', icon: LayoutDashboard },
  { id: 'aree-route', label: 'Aree', icon: Globe },
  { id: 'home', label: 'Area atleta', icon: Home },
  { id: 'auth', label: 'Auth', icon: LogIn },
] as const

function DesignSystemHeavySectionsSkeleton() {
  return (
    <div className="space-y-10 sm:space-y-16" aria-hidden>
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="space-y-4 rounded-lg border border-white/10 bg-zinc-900/40 p-4 sm:p-6"
        >
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ))}
    </div>
  )
}

export function DesignSystemPageContent() {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [mountHeavySections, setMountHeavySections] = useState(false)

  useEffect(() => {
    const idleId =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(() => setMountHeavySections(true))
        : undefined
    const timeoutId =
      idleId === undefined ? window.setTimeout(() => setMountHeavySections(true), 0) : undefined
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  const handleDownloadCss = useCallback(() => {
    const css = getDesignSystemCss()
    downloadFile(css, '22club-design-system.css', 'text/css')
  }, [])

  const handleDownloadReact = useCallback(() => {
    const react = getDesignSystemReact()
    downloadFile(react, '22club-design-system-tokens.ts', 'text/typescript')
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      buildDesignSystemPdf(doc)
      doc.save('22club-design-system.pdf')
    } catch (e) {
      console.error('Export PDF failed', e)
    } finally {
      setPdfLoading(false)
    }
  }, [])

  return (
    <div className="flex min-h-full min-w-0 w-full flex-1 flex-col bg-black text-text-primary">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur supports-backdrop-filter:bg-black/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 py-3 sm:px-4 sm:py-4">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-text-primary min-w-0 truncate">
            22Club <span className="text-primary">Design System</span>
          </h1>
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCss}
              className="border-white/10 bg-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary shrink-0 text-xs sm:text-sm min-h-[40px] sm:min-h-0 px-2 sm:px-3"
            >
              <FileText className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Scarica CSS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReact}
              className="border-white/10 bg-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary shrink-0 text-xs sm:text-sm min-h-[40px] sm:min-h-0 px-2 sm:px-3"
            >
              <Copy className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Scarica React
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="border-white/10 bg-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary disabled:opacity-50 shrink-0 text-xs sm:text-sm min-h-[40px] sm:min-h-0 px-2 sm:px-3"
            >
              {pdfLoading ? (
                <Loader2 className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin shrink-0" />
              ) : (
                <Download className="mr-1 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              )}
              {pdfLoading ? 'Generazione...' : 'Scarica PDF'}
            </Button>
            <Link
              href="/"
              className="shrink-0 whitespace-nowrap rounded-lg border border-white/10 px-2.5 py-2 sm:px-3 text-xs sm:text-sm text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary min-h-[40px] sm:min-h-0 flex items-center justify-center"
            >
              ← Torna
            </Link>
          </div>
        </div>

        <nav
          className="mx-auto max-w-5xl overflow-x-auto overflow-y-hidden px-3 pb-2 sm:px-4 sm:pb-3 -webkit-overflow-scrolling-touch"
          aria-label="Design system"
        >
          <ul className="flex flex-nowrap gap-1.5 sm:gap-2 py-1 min-w-max">
            {NAV.map(({ id, label, icon: Icon }) => (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  className="inline-flex items-center gap-1 sm:gap-1.5 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 px-2.5 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-text-secondary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-primary/30 hover:bg-white/5 hover:text-primary min-h-[40px] sm:min-h-0 justify-center"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl min-w-0 space-y-10 sm:space-y-16 px-3 py-6 sm:px-4 sm:py-10">
        <SectionOverview />
        <Separator className="bg-white/10" />

        <section
          id="principi"
          className="scroll-mt-24 rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-4 sm:p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)]"
        >
          <h2 className="mb-2 flex items-center gap-2 text-base sm:text-lg font-semibold text-text-primary">
            <Check className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary" />
            Principi di stile
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary break-words">
            Riempimento unico (no gradienti bicolore), bordo con sfumatura visibile (inset
            highlight), forme coerenti:{' '}
            <code className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-xs text-primary">
              rounded-md
            </code>{' '}
            per form,{' '}
            <code className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-xs text-primary">
              rounded-lg
            </code>{' '}
            per card e pulsanti.
          </p>
        </section>

        <FoundationsColors />
        <Separator className="bg-white/10" />
        <FoundationsTypography />
        <Separator className="bg-white/10" />
        <FoundationsSpacingRadius />
        <Separator className="bg-white/10" />
        <FoundationsMotion />
        <Separator className="bg-white/10" />
        <SectionIcone iconSamples={DESIGN_SYSTEM_ICON_SAMPLES} />
        <Separator className="bg-white/10" />

        {mountHeavySections ? (
          <>
            <PatternsLayouts />
            <Separator className="bg-white/10" />
            <PatternsHeaders />
            <Separator className="bg-white/10" />
            <PatternsComposition />
            <Separator className="bg-white/10" />
            <SectionComponenti />
            <Separator className="bg-white/10" />
            <SectionModuli />
            <Separator className="bg-white/10" />
            <SectionScreens />
            <Separator className="bg-white/10" />
            <DesignAreeRoute />
            <Separator className="bg-white/10" />
            <DesignHomeSection
              homePagesDesign={HOME_PAGES_DESIGN}
              pathMeta={PATH_META}
              accentiAtleta={ACCENTI_ATLETA}
              accentHex={ACCENT_HEX}
              radiusPx={RADIUS_PX}
              iconByName={DESIGN_SYSTEM_ICON_BY_NAME}
            />
            <Separator className="bg-white/10" />
            <PatternsAuthLogin />
          </>
        ) : (
          <DesignSystemHeavySectionsSkeleton />
        )}
      </main>

      <footer className="border-t border-white/10 py-4 sm:py-6 px-3 text-center text-xs sm:text-sm text-text-muted">
        <p className="max-w-xl mx-auto">
          22Club Design System · Riferimento per fondazioni, componenti e pattern ·{' '}
          <span className="text-primary/80">22club</span>
        </p>
      </footer>
    </div>
  )
}
