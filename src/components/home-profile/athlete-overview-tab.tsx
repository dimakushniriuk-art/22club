// ============================================================
// Componente Tab Overview Profilo Atleta Home (FASE C - Split File Lunghi)
// ============================================================
// Estratto da home/profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Progress } from '@/components/ui'
import { Mail, Phone, Calendar, User, Target, TrendingUp, CreditCard } from 'lucide-react'
import { formatSafeDate } from './utils'

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

export function AthleteOverviewTab({ user, stats, calculateProgress }: AthleteOverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Informazioni personali rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          variant="default"
          className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
        >
          <CardHeader className="relative">
            <CardTitle size="md" className="text-white flex items-center gap-2">
              <User className="h-5 w-5 text-teal-400" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative">
            <div className="flex items-center gap-3">
              <Mail className="text-text-tertiary h-5 w-5" />
              <div>
                <p className="text-text-secondary text-xs">Email</p>
                <p className="text-text-primary font-medium text-sm">{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="text-text-tertiary h-5 w-5" />
                <div>
                  <p className="text-text-secondary text-xs">Telefono</p>
                  <p className="text-text-primary font-medium text-sm">{user.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="text-text-tertiary h-5 w-5" />
              <div>
                <p className="text-text-secondary text-xs">Iscritto dal</p>
                <p className="text-text-primary font-medium text-sm">
                  {formatSafeDate(user.data_iscrizione || user.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Obiettivo peso */}
        {stats.peso_iniziale && stats.obiettivo_peso && (
          <Card
            variant="default"
            className="relative border-teal-500/30 bg-transparent [background-image:none!important]"
          >
            <CardHeader className="relative">
              <CardTitle size="md" className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-400" />
                Obiettivo Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-text-secondary text-xs">Partenza</p>
                  <p className="text-text-primary text-xl font-bold text-white">
                    {stats.peso_iniziale}kg
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Attuale</p>
                  <p className="text-xl font-bold text-white">
                    {stats.peso_attuale ? `${stats.peso_attuale}kg` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary text-xs">Obiettivo</p>
                  <p className="text-text-primary text-xl font-bold text-white">
                    {stats.obiettivo_peso}kg
                  </p>
                </div>
              </div>

              {stats.peso_attuale && (
                <div className="space-y-2 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Progresso</span>
                    <span className="text-sm font-medium text-white">{calculateProgress()}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-3" />
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-state-valid h-4 w-4" />
                    <span className="text-text-secondary text-xs">
                      {Math.abs(stats.peso_attuale - stats.peso_iniziale).toFixed(1)}kg{' '}
                      {stats.peso_attuale < stats.peso_iniziale ? 'persi' : 'guadagnati'} • Ancora{' '}
                      {Math.abs(stats.peso_attuale - stats.obiettivo_peso).toFixed(1)} kg
                      all&apos;obiettivo
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lezioni rimanenti */}
        {stats.lezioni_rimanenti > 0 && (
          <Card
            variant="default"
            className="relative border-cyan-500/30 bg-transparent [background-image:none!important]"
          >
            <CardHeader className="relative">
              <CardTitle size="md" className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                Lezioni
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-2">{stats.lezioni_rimanenti}</p>
                <p className="text-text-secondary text-sm">Lezioni rimanenti</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
