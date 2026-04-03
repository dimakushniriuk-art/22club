'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Unlock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PageHeaderFixed } from '@/components/layout'
import { isValidProfile, isValidUUID } from '@/lib/utils/type-guards'
import { useAuth } from '@/providers/auth-provider'
import { useProgressAnalytics } from '@/hooks/use-progress-analytics'
import { findMisurazioneEntryByField } from '@/components/progressi/misurazioni-values-content'
import { MisurazioneValoriByDateList } from '@/components/progressi/misurazione-valori-by-date-list'
import { RangeStatusMeter } from '@/components/dashboard/range-status-meter'
import { getValueRange } from '@/lib/constants/progress-ranges'
import {
  buildMisurazioneListItemsFromProgressLogs,
  progressLogListItemsToChartHistory,
} from '@/lib/progressi/misurazione-progress-log-row'

const CARD_DS =
  'rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

const SCROLL_CONTAINER_STYLE = { minHeight: 'calc(100dvh - var(--nav-height, 56px))' } as const

function MisurazioneStoricoContent() {
  const router = useRouter()
  const params = useParams()
  const rawField = typeof params?.field === 'string' ? params.field : ''
  const field = useMemo(() => {
    try {
      return decodeURIComponent(rawField)
    } catch {
      return rawField
    }
  }, [rawField])

  const { user, loading } = useAuth()
  const isValidUserProfile = user && isValidProfile(user)
  const isValidUser = isValidUserProfile && !loading

  const athleteId = useMemo(() => {
    if (!isValidUserProfile || !user?.user_id) {
      return undefined
    }
    return isValidUUID(user.user_id) ? user.user_id : undefined
  }, [isValidUserProfile, user])

  const { data: progressData, isLoading: progressLoading, error } = useProgressAnalytics(athleteId)

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

  const handleBack = useCallback(() => router.push('/home/progressi/misurazioni'), [router])

  useEffect(() => {
    if (!loading && !isValidUser) {
      router.push('/login')
    }
  }, [isValidUser, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6">
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-8 min-[834px]:p-12 text-center">
              <p className="text-text-secondary text-sm font-medium">Caricamento...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValidUser) {
    return null
  }

  if (!entry || !range) {
    return (
      <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
        <div
          className="min-h-0 flex-1 space-y-5 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:space-y-6 min-[834px]:px-6"
          style={SCROLL_CONTAINER_STYLE}
        >
          <PageHeaderFixed
            variant="chat"
            title="Misurazione"
            subtitle="Parametro non valido"
            onBack={handleBack}
          />
          <Card className={`relative overflow-hidden ${CARD_DS}`}>
            <CardContent className="p-6 text-center space-y-3">
              <p className="text-text-secondary text-sm">Misurazione non trovata.</p>
              <Link href="/home/progressi/misurazioni">
                <Button variant="outline" className="mt-2">
                  Torna ai grafici
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-1 flex-col bg-background">
      <div
        className="min-h-0 flex-1 space-y-4 sm:space-y-6 overflow-auto px-4 pb-24 safe-area-inset-bottom sm:px-5 min-[834px]:px-6"
        style={SCROLL_CONTAINER_STYLE}
      >
        <PageHeaderFixed
          variant="chat"
          title={entry.label}
          subtitle="Valori registrati per data"
          onBack={handleBack}
        />

        <Card className={`relative overflow-hidden ${CARD_DS}`}>
          <CardHeader className="relative z-10 border-b border-white/10 px-4 pb-3 pt-4 min-[834px]:px-5 min-[834px]:pt-5 min-[834px]:pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="text-base font-bold text-text-primary md:text-lg">
                  Storico misurazioni
                </CardTitle>
                <p className="text-text-tertiary text-xs">
                  Dal più recente; solo rilevazioni con valore compilato
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-text-secondary hover:text-primary"
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
          </CardHeader>
          <CardContent className="relative z-10 p-4 pt-3 min-[834px]:p-5 min-[834px]:pt-4 space-y-6">
            {progressLoading ? (
              <p className="text-text-secondary text-sm py-8 text-center">Caricamento dati...</p>
            ) : error ? (
              <p className="text-text-secondary text-sm py-8 text-center">
                {error instanceof Error ? error.message : String(error)}
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
                    variant="athlete"
                    misurazioneField={entry.field}
                    analyticsUserId={athleteId}
                    misurazioneLabel={entry.label}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function HomeMisurazioneStoricoPage() {
  return (
    <Suspense fallback={null}>
      <MisurazioneStoricoContent />
    </Suspense>
  )
}
