// ============================================================
// Componente Tab Overview Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Mail, Phone, User, Target, TrendingUp, CreditCard, UserCircle } from 'lucide-react'
import { useSupabaseClient } from '@/hooks/use-supabase-client'

const CARD_DS =
  'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/20 transition-all duration-200'

type TrainerProfile = {
  pt_nome: string
  pt_cognome: string
  pt_email: string | null
  pt_telefono: string | null
  pt_avatar_url: string | null
}

interface AthleteOverviewTabProps {
  user: {
    email: string
    phone?: string | null
    data_iscrizione?: string | null
    created_at?: string | null
  }
  stats: {
    peso_iniziale: number | null
    peso_attuale: number | null
    obiettivo_peso: number | null
    lezioni_rimanenti: number
  }
  calculateProgress: () => number
}

export function AthleteOverviewTab({ user: _user, stats, calculateProgress }: AthleteOverviewTabProps) {
  const supabase = useSupabaseClient()
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null)
  const [trainerLoading, setTrainerLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setTrainerLoading(true)
    supabase
      .rpc('get_my_trainer_profile')
      .then((res: { data: unknown; error: unknown }) => {
        const { data, error } = res
        if (cancelled) return
        setTrainerLoading(false)
        if (error || !Array.isArray(data) || data.length === 0) {
          setTrainer(null)
          return
        }
        const row = data[0] as TrainerProfile
        setTrainer(row)
      })
    return () => {
      cancelled = true
    }
  }, [supabase])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card variant="default" className={`${CARD_DS} sm:col-span-2`}>
          <CardHeader className="pb-2">
            <CardTitle size="md" className="flex items-center gap-2 text-sm text-text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                <User className="h-4 w-4 text-cyan-400" />
              </span>
              Il tuo trainer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {trainerLoading ? (
              <div className="flex items-center gap-3 py-2">
                <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-background-tertiary/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-background-tertiary/50" />
                  <div className="h-3 w-24 animate-pulse rounded bg-background-tertiary/30" />
                </div>
              </div>
            ) : trainer ? (
              <>
                <div className="flex items-center gap-3">
                  {trainer.pt_avatar_url ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/10">
                      <Image
                        src={trainer.pt_avatar_url}
                        alt={`${trainer.pt_nome} ${trainer.pt_cognome}`}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={trainer.pt_avatar_url.startsWith('http')}
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      <User className="h-7 w-7 text-cyan-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {trainer.pt_nome} {trainer.pt_cognome}
                    </p>
                    <p className="text-xs text-text-secondary">Personal Trainer</p>
                  </div>
                </div>
                {trainer.pt_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-text-tertiary" />
                    <div className="min-w-0">
                      <p className="text-xs text-text-secondary">Email</p>
                      <p className="truncate text-sm font-medium text-text-primary">{trainer.pt_email}</p>
                    </div>
                  </div>
                )}
                {trainer.pt_telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-text-tertiary" />
                    <div>
                      <p className="text-xs text-text-secondary">Telefono</p>
                      <p className="text-sm font-medium text-text-primary">{trainer.pt_telefono}</p>
                    </div>
                  </div>
                )}
                <Link href="/home/trainer" className="block pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-lg border border-white/10 text-text-primary hover:bg-white/5"
                  >
                    <UserCircle className="mr-1.5 h-4 w-4 shrink-0" />
                    Visualizza profilo Trainer
                  </Button>
                </Link>
              </>
            ) : (
              <p className="py-2 text-sm text-text-secondary">Nessun trainer assegnato.</p>
            )}
          </CardContent>
        </Card>

        {stats.peso_iniziale != null && stats.obiettivo_peso != null && (
          <Card variant="default" className={CARD_DS}>
            <CardHeader className="pb-2">
              <CardTitle size="md" className="flex items-center gap-2 text-sm text-text-primary">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Target className="h-4 w-4 text-cyan-400" />
                </span>
                Obiettivo peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[11px] text-text-secondary">Partenza</p>
                  <p className="text-lg font-bold tabular-nums text-text-primary">{stats.peso_iniziale} kg</p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary">Attuale</p>
                  <p className="text-lg font-bold tabular-nums text-text-primary">
                    {stats.peso_attuale != null ? `${stats.peso_attuale} kg` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-secondary">Obiettivo</p>
                  <p className="text-lg font-bold tabular-nums text-text-primary">{stats.obiettivo_peso} kg</p>
                </div>
              </div>
              {stats.peso_attuale != null && (
                <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Progresso</span>
                    <span className="font-medium text-text-primary">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                  <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0 text-state-valid" />
                    {Math.abs(stats.peso_attuale - stats.peso_iniziale).toFixed(1)} kg{' '}
                    {stats.peso_attuale < stats.peso_iniziale ? 'persi' : 'guadagnati'} · ancora{' '}
                    {Math.abs(stats.peso_attuale - stats.obiettivo_peso).toFixed(1)} kg
                    all&apos;obiettivo
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {stats.lezioni_rimanenti > 0 && (
          <Card variant="default" className={`${CARD_DS} sm:col-span-2`}>
            <CardHeader className="pb-2">
              <CardTitle size="md" className="flex items-center gap-2 text-sm text-text-primary">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                </span>
                Lezioni
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums text-text-primary">
                  {stats.lezioni_rimanenti}
                </span>
                <span className="text-sm text-text-secondary">lezioni rimanenti</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
