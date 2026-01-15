'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Scale, TrendingUp, Activity, BarChart3, ArrowLeft, History } from 'lucide-react'
import Link from 'next/link'

export default function ProgressiPage() {
  const router = useRouter()

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div
      className="bg-black min-w-[402px] min-h-[874px] space-y-4 px-3 py-4"
      style={{ overflow: 'auto' }}
    >
      {/* Header - Design Moderno e Uniforme */}
      <div className="relative overflow-hidden rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/5 p-3 shadow-lg shadow-teal-500/10">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <div className="relative z-10 flex items-center gap-2">
          <Link href="/home">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-teal-500/10 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent truncate">
              Progressi
            </h1>
            <p className="text-text-secondary mt-0.5 text-xs line-clamp-1">
              Monitora i tuoi progressi e le tue statistiche
            </p>
          </div>
        </div>
      </div>

      {/* Cards di navigazione - Design Moderno e Uniforme */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Misurazioni del Corpo */}
        <div
          onClick={() => handleNavigate('/home/progressi/misurazioni')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigate('/home/progressi/misurazioni')
            }
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          <Card
            variant="trainer"
            className="group relative overflow-hidden cursor-pointer border border-teal-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-teal-400/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.99] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-2 group-hover:from-teal-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                  <Scale className="h-4 w-4 text-teal-300" />
                </div>
                <CardTitle size="sm" className="text-white text-sm font-bold flex-1 min-w-0">
                  <span className="truncate">Misurazioni del Corpo</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 pb-3">
              <p className="text-text-secondary mb-2 text-xs line-clamp-3 leading-relaxed">
                Monitora peso, composizione corporea, circonferenze e misure antropometriche con
                grafici e statistiche dettagliate.
              </p>
              <div className="flex items-center gap-1.5 text-teal-300 group-hover:text-teal-200 transition-colors">
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Visualizza misurazioni
                </span>
                <TrendingUp className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiche Allenamenti */}
        <div
          onClick={() => handleNavigate('/home/progressi/allenamenti')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigate('/home/progressi/allenamenti')
            }
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          <Card
            variant="trainer"
            className="group relative overflow-hidden cursor-pointer border border-cyan-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-cyan-400/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 p-2 group-hover:from-cyan-500/30 group-hover:to-teal-500/30 transition-all duration-300">
                  <Activity className="h-4 w-4 text-cyan-300" />
                </div>
                <CardTitle size="sm" className="text-white text-sm font-bold flex-1 min-w-0">
                  <span className="truncate">Statistiche Allenamenti</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 pb-3">
              <p className="text-text-secondary mb-2 text-xs line-clamp-3 leading-relaxed">
                Analizza l&apos;andamento dei pesi utilizzati, tempi di esecuzione e progressi per
                ogni esercizio delle tue schede di allenamento.
              </p>
              <div className="flex items-center gap-1.5 text-cyan-300 group-hover:text-cyan-200 transition-colors">
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Visualizza statistiche
                </span>
                <BarChart3 className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Storico Allenamenti */}
        <div
          onClick={() => handleNavigate('/home/progressi/storico')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleNavigate('/home/progressi/storico')
            }
          }}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
        >
          <Card
            variant="trainer"
            className="group relative overflow-hidden cursor-pointer border border-purple-500/30 bg-gradient-to-br from-background-secondary/50 via-background-secondary/30 to-background-tertiary/20 hover:border-purple-400/60 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-purple-500/20 active:scale-[0.99] backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-2 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-300">
                  <History className="h-4 w-4 text-purple-300" />
                </div>
                <CardTitle size="sm" className="text-white text-sm font-bold flex-1 min-w-0">
                  <span className="truncate">Storico Allenamenti</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0 pb-3">
              <p className="text-text-secondary mb-2 text-xs line-clamp-3 leading-relaxed">
                Visualizza tutti i tuoi allenamenti completati, statistiche dettagliate e progressi
                nel tempo con grafici e report.
              </p>
              <div className="flex items-center gap-1.5 text-purple-300 group-hover:text-purple-200 transition-colors">
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Visualizza storico
                </span>
                <History className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
