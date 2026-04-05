'use client'

import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  ListOrdered,
  TrendingUp,
  Trophy,
  Weight,
} from 'lucide-react'

export type WorkoutInstagramShareExerciseLine = {
  name: string
  maxWeightKg: number
  isPersonalRecord: boolean
  /** URL assoluto thumb/immagine esercizio (export PNG). */
  mediaPreviewUrl: string | null
  /** Fallback se manca immagine o img fallisce (CORS): stesso URL del catalogo esercizi. */
  mediaVideoUrl: string | null
}

/** Opzioni per l’export (anteprima + PNG). */
export type InstagramShareSections = {
  topSafeZone: boolean
  logo: boolean
  dateExecution: boolean
  /** Griglia metriche: sessione (4) + sintesi (3), senza doppioni volume. */
  riepilogoCompactKpis: boolean
  /** Barra completamento, percentuale e badge stato (blocco unico). */
  completionSummary: boolean
  exerciseRows: boolean
  exercisePrBadges: boolean
}

export const DEFAULT_INSTAGRAM_SHARE_SECTIONS: InstagramShareSections = {
  topSafeZone: true,
  logo: true,
  dateExecution: true,
  riepilogoCompactKpis: true,
  completionSummary: true,
  exerciseRows: true,
  exercisePrBadges: true,
}

export function mergeInstagramShareSections(
  partial?: Partial<InstagramShareSections>,
): InstagramShareSections {
  return { ...DEFAULT_INSTAGRAM_SHARE_SECTIONS, ...partial }
}

export type WorkoutInstagramShareTargetProps = {
  /** URL assoluto del logo (stesso host) per html2canvas */
  gymLogoSrc: string
  workoutTitle: string
  completedAtLabel: string
  modeIsCoached: boolean
  completedExercises: number
  totalExercises: number
  completedSets: number
  totalSets: number
  durationLabel: string
  volumeKgFormatted: string
  completionPct: number
  completionLabel: string
  exerciseLines: WorkoutInstagramShareExerciseLine[]
  summaryAverageLoadPerSet: number
  summaryConsistencyScore: number
  summaryPersonalRecords: number
  /** Sezioni visibili nel PNG (anteprima + export). */
  sections?: Partial<InstagramShareSections>
}

/** Solo hex/rgba: html2canvas non supporta colori CSS `lab()` (Tailwind v4). */
const S = {
  bgTop: '#27272a',
  bgBottom: '#09090b',
  cardBg: 'rgba(255,255,255,0.05)',
  exercisesBoxBg: 'rgba(0,0,0,0.3)',
  border: 'rgba(255,255,255,0.1)',
  text: '#fafafa',
  muted: '#a1a1aa',
  soft: '#e4e4e7',
  cyan: '#22d3ee',
  cyanBar: '#06b6d4',
  barTrack: '#27272a',
  orange: '#fb923c',
  orangeBg: 'rgba(251,146,60,0.15)',
  orangeBorder: 'rgba(251,146,60,0.45)',
} as const

function fmtIntIt(n: number): string {
  return new Intl.NumberFormat('it-IT').format(Math.round(n))
}

function compactKpiTile(icon: ReactNode, label: string, value: ReactNode, subtitle: string) {
  return (
    <div
      style={{
        display: 'flex',
        minWidth: 0,
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        border: `1px solid ${S.border}`,
        background: S.cardBg,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: 36,
          width: 36,
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
          border: `1px solid ${S.border}`,
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: S.muted,
            lineHeight: 1.2,
          }}
        >
          {label}
        </p>
        <div
          style={{
            fontSize: 19,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: S.text,
            lineHeight: 1.1,
            wordBreak: 'break-word',
          }}
        >
          {value}
        </div>
        <p style={{ margin: 0, fontSize: 9, color: S.muted, lineHeight: 1.3 }}>{subtitle}</p>
      </div>
    </div>
  )
}

const fontStack =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/** Spazio vuoto in cima al PNG (1080×1350) per header/status e UI del feed Instagram. */
export const INSTAGRAM_SHARE_TOP_SAFE_PX = 128

const colGap = 22

/** Anteprima cella: immagine → se errore o assente, video (frame per html2canvas) → nome. */
function InstagramExerciseShareMedia({
  imageUrl,
  videoUrl,
  name,
}: {
  imageUrl: string | null
  videoUrl: string | null
  name: string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setImgFailed(false)
    setVideoFailed(false)
  }, [imageUrl, videoUrl])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !videoUrl) return
    const bumpFrame = () => {
      try {
        if (
          el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          el.duration > 0 &&
          !Number.isNaN(el.duration)
        ) {
          el.currentTime = Math.min(0.1, Math.max(0.04, el.duration * 0.03))
        }
      } catch {
        /* ignore */
      }
    }
    el.addEventListener('loadeddata', bumpFrame)
    return () => el.removeEventListener('loadeddata', bumpFrame)
  }, [videoUrl])

  const showImg = Boolean(imageUrl && !imgFailed)
  const showVideo = Boolean(videoUrl && !showImg && !videoFailed)
  const showPlaceholder = !showImg && !showVideo

  return (
    <>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- export canvas: CORS + niente lab()
        <img
          src={imageUrl!}
          alt=""
          crossOrigin="anonymous"
          onError={() => setImgFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}
      {showVideo ? (
        <video
          ref={videoRef}
          src={videoUrl!}
          crossOrigin="anonymous"
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : null}
      {showPlaceholder ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: S.soft,
              lineHeight: 1.35,
              wordBreak: 'break-word',
            }}
          >
            {name}
          </span>
        </div>
      ) : null}
    </>
  )
}

/**
 * Template 1080×1350 px (rapporto 4:5, post feed Instagram).
 * Render off-screen e catturato con html2canvas.
 */
export const WorkoutInstagramShareTarget = forwardRef<
  HTMLDivElement,
  WorkoutInstagramShareTargetProps
>(function WorkoutInstagramShareTarget(
  {
    gymLogoSrc,
    workoutTitle: _workoutTitle,
    completedAtLabel,
    modeIsCoached: _modeIsCoached,
    completedExercises,
    totalExercises,
    completedSets,
    totalSets,
    durationLabel,
    volumeKgFormatted,
    completionPct,
    completionLabel,
    exerciseLines,
    summaryAverageLoadPerSet,
    summaryConsistencyScore,
    summaryPersonalRecords,
    sections: sectionsPartial,
  },
  ref,
) {
  const sec = mergeInstagramShareSections(sectionsPartial)
  const showExerciseBox = exerciseLines.length > 0 && sec.exerciseRows
  const showExerciseGrid = sec.exerciseRows && exerciseLines.length > 0

  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        left: -12000,
        top: 0,
        zIndex: 0,
        overflow: 'hidden',
      }}
      aria-hidden
    >
      <div
        ref={ref}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          width: 1080,
          height: 1350,
          flexDirection: 'column',
          gap: colGap,
          padding: '24px 40px 32px',
          background: `linear-gradient(to bottom, ${S.bgTop}, ${S.bgBottom})`,
          fontFamily: fontStack,
          color: S.text,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            height: sec.topSafeZone ? INSTAGRAM_SHARE_TOP_SAFE_PX : 0,
            width: '100%',
            overflow: 'hidden',
          }}
          aria-hidden
        />

        {sec.logo || sec.dateExecution ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: 28,
              justifyContent:
                sec.logo && sec.dateExecution
                  ? 'space-between'
                  : sec.dateExecution
                    ? 'flex-start'
                    : 'flex-end',
            }}
          >
            {sec.dateExecution ? (
              <div
                style={{
                  flexShrink: 0,
                  minWidth: 0,
                  flex: sec.logo ? 1 : undefined,
                  maxWidth: sec.logo ? 560 : '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}
              >
                <span
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: 36,
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: 0,
                    color: S.cyan,
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'left',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {completedAtLabel}
                </span>
              </div>
            ) : null}
            {sec.logo ? (
              <div
                style={{
                  display: 'flex',
                  height: 176,
                  width: 176,
                  flexShrink: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 22,
                  background: 'transparent',
                  padding: 8,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- export canvas: img evita lab() da Image/next */}
                <img
                  src={gymLogoSrc || '/logo.svg'}
                  alt=""
                  width={144}
                  height={144}
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {sec.riepilogoCompactKpis ? (
          <div
            style={{
              display: 'flex',
              width: '100%',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 12,
                width: '100%',
              }}
            >
              {compactKpiTile(
                <Activity size={18} color={S.cyan} aria-hidden />,
                'Esercizi',
                `${completedExercises}/${totalExercises}`,
                'completati',
              )}
              {compactKpiTile(
                <ListOrdered size={18} color={S.cyan} aria-hidden />,
                'Serie',
                `${completedSets}/${totalSets}`,
                'registrate',
              )}
              {compactKpiTile(
                <Clock size={18} color={S.cyan} aria-hidden />,
                'Durata',
                durationLabel,
                'in sala',
              )}
              {compactKpiTile(
                <Weight size={18} color={S.cyan} aria-hidden />,
                'Volume totale',
                <>
                  {volumeKgFormatted}
                  <span style={{ fontSize: 13, fontWeight: 600, color: S.muted }}> kg</span>
                </>,
                'Somma carichi delle serie registrate (kg × ripetizioni).',
              )}
            </div>
            <div
              style={{
                borderTop: `1px solid ${S.border}`,
                paddingTop: 14,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                width: '100%',
              }}
            >
              {compactKpiTile(
                <TrendingUp size={18} color={S.cyan} aria-hidden />,
                'Intensità media',
                totalSets > 0 ? (
                  <>
                    {fmtIntIt(summaryAverageLoadPerSet)}
                    <span style={{ fontSize: 13, fontWeight: 600, color: S.muted }}>
                      {' '}
                      kg/serie
                    </span>
                  </>
                ) : (
                  '—'
                ),
                'Volume diviso per il numero di serie salvate.',
              )}
              {compactKpiTile(
                <CheckCircle2 size={18} color={S.cyan} aria-hidden />,
                'Esercizi al completo',
                <>
                  {summaryConsistencyScore}
                  <span style={{ fontSize: 13, fontWeight: 600, color: S.muted }}>%</span>
                </>,
                'Quota di esercizi con tutte le serie segnate come completate.',
              )}
              {compactKpiTile(
                <Trophy size={18} color={S.cyan} aria-hidden />,
                'Record personali',
                summaryPersonalRecords > 0 ? summaryPersonalRecords : '—',
                'Confronto con lo storico in arrivo; per ora non calcolato.',
              )}
            </div>
          </div>
        ) : null}

        {sec.completionSummary ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              borderTop: `1px solid ${S.border}`,
              paddingTop: 20,
            }}
          >
            <div
              style={{
                height: 14,
                width: '100%',
                maxWidth: 560,
                overflow: 'hidden',
                borderRadius: 9999,
                background: S.barTrack,
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 9999,
                  background: S.cyanBar,
                  width: `${Math.min(100, Math.max(0, completionPct))}%`,
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                width: '100%',
                maxWidth: 560,
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 20,
              }}
            >
              <span style={{ color: S.muted }}>{completionLabel}</span>
              <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: S.text }}>
                {completionPct}%
              </span>
            </div>
          </div>
        ) : null}

        {showExerciseBox ? (
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${S.border}`,
              background: S.exercisesBoxBg,
              padding: '18px 22px',
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {showExerciseGrid ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 12,
                  width: '100%',
                }}
              >
                {exerciseLines.map((line, i) => {
                  const prRowStyle = Boolean(sec.exercisePrBadges && line.isPersonalRecord)
                  const hasMedia =
                    Boolean(line.mediaPreviewUrl) || Boolean(line.mediaVideoUrl)
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        minWidth: 0,
                        flexDirection: 'column',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: prRowStyle
                          ? `1px solid ${S.orangeBorder}`
                          : `1px solid ${S.border}`,
                        background: prRowStyle ? S.orangeBg : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16 / 9',
                          background: 'rgba(0,0,0,0.35)',
                        }}
                      >
                        <InstagramExerciseShareMedia
                          imageUrl={line.mediaPreviewUrl}
                          videoUrl={line.mediaVideoUrl}
                          name={line.name}
                        />
                        {prRowStyle ? (
                          <span
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              fontSize: 12,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                              color: S.orange,
                              background: 'rgba(251,146,60,0.85)',
                              border: `1px solid ${S.orangeBorder}`,
                              borderRadius: 8,
                              padding: '4px 8px',
                              lineHeight: 1,
                            }}
                          >
                            PR
                          </span>
                        ) : null}
                      </div>
                      {hasMedia ? (
                        <p
                          style={{
                            margin: 0,
                            padding: '8px 10px 10px',
                            fontSize: 14,
                            fontWeight: 600,
                            color: S.muted,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {line.name}
                        </p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
})
