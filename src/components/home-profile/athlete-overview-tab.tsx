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

const overviewCardClass =
  'relative overflow-hidden border bg-background-secondary/80 [background-image:none!important] rounded-xl'

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
        <Card variant="default" className={`${overviewCardClass} border-teal-500/30 sm:col-span-2`}>
          <CardHeader className="pb-2">
            <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-teal-400 shrink-0" />
              Il tuo trainer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {trainerLoading ? (
              <div className="flex items-center gap-3 py-2">
                <div className="h-14 w-14 shrink-0 rounded-full bg-background-tertiary/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-background-tertiary/50 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-background-tertiary/30 rounded animate-pulse" />
                </div>
              </div>
            ) : trainer ? (
              <>
                <div className="flex items-center gap-3">
                  {trainer.pt_avatar_url ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-teal-500/40">
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
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-teal-500/40 bg-teal-500/20 text-teal-400">
                      <User className="h-7 w-7" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-semibold text-sm truncate">
                      {trainer.pt_nome} {trainer.pt_cognome}
                    </p>
                    <p className="text-text-secondary text-xs">Personal Trainer</p>
                  </div>
                </div>
                {trainer.pt_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-text-tertiary h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-text-secondary text-xs">Email</p>
                      <p className="text-text-primary font-medium text-sm truncate">{trainer.pt_email}</p>
                    </div>
                  </div>
                )}
                {trainer.pt_telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-text-tertiary h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-text-secondary text-xs">Telefono</p>
                      <p className="text-text-primary font-medium text-sm">{trainer.pt_telefono}</p>
                    </div>
                  </div>
                )}
                <Link href="/home/trainer" className="block pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400/60"
                  >
                    <UserCircle className="mr-1.5 h-4 w-4 shrink-0" />
                    Visualizza profilo Trainer
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-text-secondary text-sm py-2">Nessun trainer assegnato.</p>
            )}
          </CardContent>
        </Card>

        {stats.peso_iniziale != null && stats.obiettivo_peso != null && (
          <Card variant="default" className={`${overviewCardClass} border-teal-500/30`}>
            <CardHeader className="pb-2">
              <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-teal-400 shrink-0" />
                Obiettivo peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-text-secondary text-[11px]">Partenza</p>
                  <p className="text-lg font-bold text-white tabular-nums">{stats.peso_iniziale} kg</p>
                </div>
                <div>
                  <p className="text-text-secondary text-[11px]">Attuale</p>
                  <p className="text-lg font-bold text-white tabular-nums">
                    {stats.peso_attuale != null ? `${stats.peso_attuale} kg` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-[11px]">Obiettivo</p>
                  <p className="text-lg font-bold text-white tabular-nums">{stats.obiettivo_peso} kg</p>
                </div>
              </div>
              {stats.peso_attuale != null && (
                <div className="space-y-2 rounded-lg bg-background-tertiary/50 p-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">Progresso</span>
                    <span className="font-medium text-white">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                  <p className="text-text-secondary text-[11px] flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-state-valid shrink-0" />
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
          <Card variant="default" className={`${overviewCardClass} border-cyan-500/30 sm:col-span-2`}>
            <CardHeader className="pb-2">
              <CardTitle size="md" className="text-white flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-cyan-400 shrink-0" />
                Lezioni
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {stats.lezioni_rimanenti}
                </span>
                <span className="text-text-secondary text-sm">lezioni rimanenti</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
