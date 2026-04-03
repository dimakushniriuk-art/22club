'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Scale, Unlock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { StaffAthleteSegmentSkeleton } from '@/components/layout/route-loading-skeletons'
import { StaffAthleteSubpageHeader } from '@/components/shared/dashboard/staff-athlete-subpage-header'
import { ErrorState } from '@/components/dashboard/error-state'
import { PdfCanvasPreviewDialog } from '@/components/shared/pdf-canvas-preview-dialog'
import { useAthleteProfileData } from '@/hooks/athlete-profile/use-athlete-profile-data'
import { usePdfPreviewDialog } from '@/hooks/use-pdf-preview-dialog'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { findMisurazioneEntryByField } from '@/components/progressi/misurazioni-values-content'
import { MisurazioneValoriByDateList } from '@/components/progressi/misurazione-valori-by-date-list'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import { getValueRange } from '@/lib/constants/progress-ranges'
import {
  buildMisurazioneListItemsFromProgressLogs,
  progressLogListItemsToChartHistory,
} from '@/lib/progressi/misurazione-progress-log-row'
import { buildStandardPdfBlob } from '@/lib/pdf'
import { useNotify } from '@/lib/ui/notify'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

export default function StaffAtletaMisurazioneStoricoPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params?.id === 'string' ? params.id : null
  const rawField = typeof params?.field === 'string' ? params.field : ''
  const field = useMemo(() => {
    try {
      return decodeURIComponent(rawField)
    } catch {
      return rawField
    }
  }, [rawField])

  const { athlete, athleteUserId, loading, error, loadAthleteData } = useAthleteProfileData(id ?? '')

  const { data: progressData, isLoading: progressLoading, error: progressError } =
    useProgressAnalytics(athleteUserId ?? undefined)

  const { notify } = useNotify()
  const {
    open: pdfOpen,
    blob: pdfBlob,
    filename: pdfFilename,
    loading: pdfLoading,
    setLoading: setPdfLoading,
    openWithBlob: openPdfWithBlob,
    onOpenChange: onPdfOpenChange,
  } = usePdfPreviewDialog()

  const [editUnlocked, setEditUnlocked] = useState(false)

  const entry = field ? findMisurazioneEntryByField(field) : undefined
  const range = entry ? getValueRange(entry.category, entry.field) : undefined
  const unitSuffix = range?.unit ? ` ${range.unit}` : ''

  const listItems = useMemo(() => {
    if (!entry) return []
    return buildMisurazioneListItemsFromProgressLogs(progressData?.progressLogRows, entry.field)
  }, [progressData?.progressLogRows, entry])

  const chartHistory = useMemo(() => progressLogListItemsToChartHistory(listItems), [listItems])

  const currentValue = progressData && entry ? entry.getValue(progressData) : null

  const formatLogDate = useCallback((iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  const handleExportPDF = useCallback(async () => {
    if (!athlete || !id || !entry || !range || listItems.length === 0) return
    const safeAthlete = [athlete.nome, athlete.cognome]
      .filter(Boolean)
      .join('_')
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .trim()
      .replace(/\s+/g, '_')
    const slug = safeAthlete || 'atleta'
    const fieldSlug = entry.field.replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/_+/g, '_').slice(0, 48)
    const fileName = `misurazione-${fieldSlug}-${slug}-${new Date().toISOString().split('T')[0]}.pdf`

    setPdfLoading(true)
    try {
      const blob = await buildStandardPdfBlob({
        orientation: 'portrait',
        render: ({ doc, margin, autoTable, headStyles }) => {
          let y = margin
          doc.setFontSize(16)
          doc.setFont('helvetica', 'bold')
          doc.text('Storico misurazioni', margin, y)
          y += 7
          doc.setFontSize(11)
          doc.text(entry.label, margin, y)
          y += 6
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(`${athlete.nome} ${athlete.cognome}`.trim(), margin, y)
          y += 5
          const cv =
            currentValue != null && !Number.isNaN(currentValue)
              ? `${currentValue.toLocaleString('it-IT', { maximumFractionDigits: 2 })}${unitSuffix}`
              : '—'
          doc.text(`Valore attuale: ${cv}`, margin, y)
          y += 5
          doc.text(`Range di riferimento: ${range.min}–${range.max}${unitSuffix}`, margin, y)
          y += 5
          doc.text(`Rilevazioni incluse: ${listItems.length}`, margin, y)
          y += 5
          doc.text(`Generato: ${new Date().toLocaleString('it-IT')}`, margin, y)
          y += 8
          autoTable(doc, {
            startY: y,
            head: [['Data', `Valore${unitSuffix}`]],
            body: listItems.map((r) => [
              formatLogDate(r.date),
              r.value.toLocaleString('it-IT', { maximumFractionDigits: 2 }),
            ]),
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            headStyles,
            margin: { left: margin, right: margin },
          })
        },
      })
      openPdfWithBlob(blob, fileName)
    } catch (err) {
      console.error('Errore generazione PDF:', err)
      notify('Errore durante la generazione del PDF.', 'error', 'Errore PDF')
    } finally {
      setPdfLoading(false)
    }
  }, [
    athlete,
    id,
    entry,
    range,
    listItems,
    currentValue,
    unitSuffix,
    formatLogDate,
    setPdfLoading,
    openPdfWithBlob,
    notify,
  ])

  if (!id) {
    return (
      <div className="p-6">
        <ErrorState message="ID atleta mancante" onRetry={() => router.push('/dashboard/clienti')} />
      </div>
    )
  }

  if (loading && !athlete) {
    return <StaffAthleteSegmentSkeleton />
  }

  if (error || !athlete) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? 'Atleta non trovato'} onRetry={() => loadAthleteData()} />
      </div>
    )
  }

  const backHref = `/dashboard/atleti/${id}/progressi/misurazioni`
  const name = [athlete.nome, athlete.cognome].filter(Boolean).join(' ').trim()

  if (!entry || !range) {
    return (
      <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
        <StaffAthleteSubpageHeader
          backHref={backHref}
          backAriaLabel="Torna alle misurazioni"
          title={`Misurazione — ${name || 'Atleta'}`}
          description="Parametro non valido"
        />
        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-text-secondary text-sm">Misurazione non trovata.</p>
            <Link href={backHref}>
              <Button variant="outline" className="mt-2">
                Torna ai grafici
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canExportStoricoPdf = listItems.length > 0

  return (
    <>
    <div className="flex-1 flex flex-col min-h-0 space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6 max-w-[1800px] mx-auto w-full">
      <StaffAthleteSubpageHeader
        backHref={backHref}
        backAriaLabel="Torna alle misurazioni"
        title={`${entry.label} — ${name || 'Atleta'}`}
        description="Valori registrati per data"
      />

      <Card className={`relative overflow-hidden ${CARD_DS}`}>
        <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              <CardTitle className="text-base font-bold text-text-primary md:text-lg flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary shrink-0" />
                Storico misurazioni
              </CardTitle>
              <p className="text-text-tertiary text-xs">
                Dal più recente; solo rilevazioni con valore compilato
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => void handleExportPDF()}
                disabled={!canExportStoricoPdf || pdfLoading || progressLoading}
              >
                {pdfLoading ? 'Generazione…' : 'Esporta PDF'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-primary"
                aria-pressed={editUnlocked}
                aria-label={
                  editUnlocked
                    ? 'Blocca modifica ed eliminazione voci'
                    : 'Sblocca modifica ed eliminazione voci'
                }
                onClick={() => setEditUnlocked((v) => !v)}
              >
                {editUnlocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 p-4 pt-3 sm:p-6 sm:pt-4 space-y-6">
          {!athleteUserId ? (
            <p className="text-text-secondary text-sm py-6 text-center">
              Profilo atleta senza user collegato.
            </p>
          ) : progressLoading ? (
            <p className="text-text-secondary text-sm py-8 text-center">Caricamento dati...</p>
          ) : progressError ? (
            <p className="text-text-secondary text-sm py-8 text-center">
              {progressError instanceof Error ? progressError.message : String(progressError)}
            </p>
          ) : (
            <>
              <RangeStatusMeter
                value={currentValue}
                history={chartHistory}
                title={entry.label}
                unit={unitSuffix}
                showValue
                height={190}
                misurazioneField={entry.field}
              />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Elenco per data
                </h4>
                <MisurazioneValoriByDateList
                  rows={listItems}
                  valueSuffix={unitSuffix}
                  actionsUnlocked={editUnlocked}
                  variant="staff"
                  misurazioneField={entry.field}
                  analyticsUserId={athleteUserId ?? undefined}
                  misurazioneLabel={entry.label}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    <PdfCanvasPreviewDialog
      open={pdfOpen}
      onOpenChange={onPdfOpenChange}
      blob={pdfBlob}
      filename={pdfFilename}
      title={`Anteprima — ${entry.label}`}
    />
    </>
  )
}
