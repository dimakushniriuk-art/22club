'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Calendar, Clock, Play, Target } from 'lucide-react'

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
    <Card className="border border-cyan-500/30 bg-background-secondary/50 backdrop-blur-sm">
      <CardHeader className="pb-2.5 px-3 min-[834px]:px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle size="sm" className="text-text-primary flex items-center text-sm min-[834px]:text-base">
            <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="truncate">Allenamento di Oggi</span>
          </CardTitle>
          <Badge variant="secondary" size="sm" className="border-cyan-500/30 text-cyan-400 text-[10px] min-[834px]:text-xs shrink-0">
            {oggi.orario}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 min-[834px]:px-4 pb-3 min-[834px]:pb-4">
        <div className="flex gap-3 min-[834px]:gap-4">
          <div className="relative w-24 h-24 min-[834px]:w-28 min-[834px]:h-28 shrink-0 rounded-xl overflow-hidden border border-cyan-500/30 bg-cyan-500/10">
            {oggiMedia?.video_url ? (
              <video
                src={oggiMedia.video_url}
                className="h-full w-full object-cover rounded-lg"
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
                className="object-cover rounded-lg"
                unoptimized={(oggiMedia.thumb_url || oggiMedia.image_url || '').startsWith('http')}
                onError={onVideoError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="h-8 w-8 text-cyan-400 opacity-70" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2.5">
            <div>
              <h3 className="text-text-primary mb-1 text-sm font-semibold truncate">{oggi.titolo}</h3>
              <p className="text-text-secondary text-xs line-clamp-2">{oggi.descrizione}</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5 min-[834px]:gap-2 text-center rounded-xl p-2 min-[834px]:p-2.5 bg-background/50 border border-cyan-500/20">
              <div>
                <div className="text-text-tertiary mb-0.5 text-[10px] min-[834px]:text-xs uppercase tracking-wide">Durata</div>
                <div className="text-text-primary flex items-center justify-center gap-1 text-xs min-[834px]:text-sm font-medium">
                  <Clock className="h-3 w-3 min-[834px]:h-4 min-[834px]:w-4 text-cyan-400" />
                  {oggi.durata} min
                </div>
              </div>
              <div>
                <div className="text-text-tertiary mb-0.5 text-[10px] min-[834px]:text-xs uppercase tracking-wide">Esercizi</div>
                <div className="text-text-primary flex items-center justify-center gap-1 text-xs min-[834px]:text-sm font-medium">
                  <Target className="h-3 w-3 min-[834px]:h-4 min-[834px]:w-4 text-cyan-400" />
                  {oggi.esercizi_totali}
                </div>
              </div>
              <div>
                <div className="text-text-tertiary mb-0.5 text-[10px] min-[834px]:text-xs uppercase tracking-wide">PT</div>
                <div className="text-text-primary text-xs min-[834px]:text-sm font-medium truncate">{oggi.pt}</div>
              </div>
            </div>
            <Button onClick={onStart} className="min-h-[44px] h-9 min-[834px]:h-10 text-xs min-[834px]:text-sm rounded-xl border border-cyan-400/40 bg-cyan-500 text-white hover:bg-cyan-400 font-semibold w-full">
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Inizia Allenamento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
