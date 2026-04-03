'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { StaffContentLayout } from '@/components/shared/dashboard/staff-content-layout'
import { Avatar } from '@/components/ui/avatar'
import { useClienti } from '@/hooks/use-clienti'
import { Database, Users, Dumbbell, ChevronRight } from 'lucide-react'

type ExercisePreviewRow = {
  id: string
  name: string
  muscle_group?: string | null
}

export default function DatabasePage() {
  const router = useRouter()
  const { clienti, total, loading: clientiLoading } = useClienti({
    page: 1,
    pageSize: 8,
    realtime: false,
  })

  const [exLoading, setExLoading] = useState(true)
  const [exError, setExError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<ExercisePreviewRow[]>([])
  const [exercisesTotal, setExercisesTotal] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setExLoading(true)
    setExError(null)
    setExercises([])
    setExercisesTotal(null)
    ;(async () => {
      try {
        const res = await fetch('/api/exercises')
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || `Errore ${res.status}`)
        }
        const body = (await res.json()) as { data?: ExercisePreviewRow[] }
        const list = Array.isArray(body?.data) ? body.data : []
        if (cancelled) return
        setExercisesTotal(list.length)
        setExercises(list.slice(0, 8))
        setExLoading(false)
      } catch (e) {
        if (cancelled) return
        setExError(e instanceof Error ? e.message : String(e))
        setExLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const clientiPreview = useMemo(() => clienti.slice(0, 8), [clienti])

  return (
    <StaffContentLayout
      title="Database"
      description="Strumenti di consultazione dati (in evoluzione)."
      theme="teal"
    >
      <div className="space-y-4 sm:space-y-6">
        <Card variant="default">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 text-text-secondary text-xs mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" aria-hidden />
                <span>Database del progetto (staff)</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-text-tertiary">
                  Clienti: {clientiLoading ? '—' : total}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-text-tertiary">
                  Esercizi: {exLoading ? '—' : (exercisesTotal ?? exercises.length)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/clienti')}
                className="group min-h-[min(52vh,460px)] rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-5 sm:p-6 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_10px_32px_-12px_rgba(0,0,0,0.6)] hover:border-white/20 hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                aria-label="Apri database Clienti"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-text-primary truncate">Clienti</p>
                    <p className="text-sm text-text-secondary truncate">
                      Database atleti del trainer
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] p-4 transition-transform duration-200 group-hover:scale-[1.03]">
                    <Users className="h-10 w-10 text-primary" aria-hidden />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary/90 mb-3">
                    Preview
                  </p>
                  {clientiLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 rounded-lg bg-white/[0.05] animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {clientiPreview.slice(0, 5).map((c) => {
                        const nome = c.nome ?? c.first_name ?? ''
                        const cognome = c.cognome ?? c.last_name ?? ''
                        const label = `${nome} ${cognome}`.trim() || 'Atleta'
                        const initials =
                          label
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2) || '?'
                        return (
                          <div
                            key={c.id}
                            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                          >
                            <Avatar
                              src={c.avatar_url?.trim() || null}
                              alt={label}
                              fallbackText={initials}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{label}</p>
                              <p className="text-xs text-text-secondary truncate">
                                {c.email || '—'}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-5 inline-flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl border border-white/[0.10] bg-white/[0.04] text-sm font-medium text-primary hover:bg-white/[0.06] transition-colors">
                  <span>Apri database Clienti</span>
                  <ChevronRight className="h-4 w-4 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </div>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/esercizi')}
                className="group min-h-[min(52vh,460px)] rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 p-5 sm:p-6 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_10px_32px_-12px_rgba(0,0,0,0.6)] hover:border-white/20 hover:bg-white/[0.02] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                aria-label="Apri database Esercizi"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-text-primary truncate">Esercizi</p>
                    <p className="text-sm text-text-secondary truncate">
                      Database esercizi per schede
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] p-4 transition-transform duration-200 group-hover:scale-[1.03]">
                    <Dumbbell className="h-10 w-10 text-primary" aria-hidden />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-secondary/90 mb-3">
                    Preview
                  </p>
                  {exLoading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-12 rounded-lg bg-white/[0.05] animate-pulse" />
                      ))}
                    </div>
                  ) : exError ? (
                    <p className="text-sm text-text-secondary">{exError}</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {exercises.slice(0, 8).map((ex) => (
                        <div
                          key={ex.id}
                          className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                          title={ex.name}
                        >
                          <p className="text-sm font-medium text-text-primary truncate">{ex.name}</p>
                          <p className="text-xs text-text-secondary truncate">
                            {ex.muscle_group?.trim() || '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 inline-flex items-center justify-center gap-2 min-h-[44px] w-full rounded-xl border border-white/[0.10] bg-white/[0.04] text-sm font-medium text-primary hover:bg-white/[0.06] transition-colors">
                  <span>Apri database Esercizi</span>
                  <ChevronRight className="h-4 w-4 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffContentLayout>
  )
}

