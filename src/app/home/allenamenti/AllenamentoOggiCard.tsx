'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Calendar, Clock, Play, Target } from 'lucide-react'

const CARD_DS =
  'rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_12px_40px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-white/20'

export interface AllenamentoOggiData {
  id: string
  titolo: string
  descrizione: string
  durata: number
  esercizi_totali: number
  esercizi_completati: number
  pt: string
  orario: string
}

export interface OggiMedia {
  video_url: string | null
  thumb_url: string | null
  image_url: string | null
}

interface AllenamentoOggiCardProps {
  oggi: AllenamentoOggiData
  oggiMedia: OggiMedia | null
  onStart: () => void
  onVideoPlay: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  onVideoPause: (e: React.SyntheticEvent<HTMLVideoElement>) => void
  onVideoError: () => void
}

export function AllenamentoOggiCard({
  oggi,
  oggiMedia,
  onStart,
  onVideoPlay,
  onVideoPause,
  onVideoError,
}: AllenamentoOggiCardProps) {
  return (
    <Card className={CARD_DS}>
      <CardHeader className="px-3 pb-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle size="sm" className="flex items-center text-sm text-text-primary sm:text-base">
            <span className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </span>
            <span className="truncate">Allenamento di Oggi</span>
          </CardTitle>
          <Badge
            variant="secondary"
            size="sm"
            className="shrink-0 text-[10px] border-white/10 text-text-secondary sm:text-xs"
          >
            {oggi.orario}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-28 sm:w-28">
            {oggiMedia?.video_url ? (
              <video
                src={oggiMedia.video_url}
                className="h-full w-full rounded-lg object-cover"
                poster={oggiMedia.thumb_url || oggiMedia.image_url || undefined}
                preload="metadata"
                muted
                playsInline
                onMouseEnter={onVideoPlay}
                onMouseLeave={onVideoPause}
                onError={onVideoError}
              />
            ) : oggiMedia?.thumb_url || oggiMedia?.image_url ? (
              <Image
                src={oggiMedia.thumb_url || oggiMedia.image_url || ''}
                alt={oggi.titolo}
                fill
                className="rounded-lg object-cover"
                unoptimized={(oggiMedia.thumb_url || oggiMedia.image_url || '').startsWith('http')}
                onError={onVideoError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Play className="h-5 w-5 text-cyan-400" />
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <h3 className="mb-1 truncate text-sm font-semibold text-text-primary">
                {oggi.titolo}
              </h3>
              <p className="line-clamp-2 text-xs text-text-secondary">{oggi.descrizione}</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-white/5 p-2 text-center sm:gap-2 sm:p-2.5">
              <div>
                <div className="mb-0.5 text-[10px] uppercase tracking-wide text-text-tertiary sm:text-xs">
                  Durata
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-text-primary sm:text-sm">
                  <Clock className="h-3 w-3 text-cyan-400 sm:h-4 sm:w-4" />
                  {oggi.durata} min
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[10px] uppercase tracking-wide text-text-tertiary sm:text-xs">
                  Esercizi
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-medium text-text-primary sm:text-sm">
                  <Target className="h-3 w-3 text-cyan-400 sm:h-4 sm:w-4" />
                  {oggi.esercizi_totali}
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[10px] uppercase tracking-wide text-text-tertiary sm:text-xs">
                  PT
                </div>
                <div className="truncate text-xs font-medium text-text-primary sm:text-sm">
                  {oggi.pt}
                </div>
              </div>
            </div>
            <Button
              onClick={onStart}
              className="h-9 min-h-[44px] w-full touch-manipulation rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:h-10 sm:text-sm"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Inizia Allenamento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
