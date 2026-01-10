'use client'

import { useMemo, useState } from 'react'

export interface MeterSegment {
  label: string
  min: number
  max: number
  color: string
}

export interface ProgressMeterProps {
  value: number | null
  segments: MeterSegment[]
  title?: string
  unit?: string
  height?: number
  showValue?: boolean
  showTooltip?: boolean
}

const DEFAULT_SEGMENTS: MeterSegment[] = [
  { label: 'BAD', min: 0, max: 20, color: '#EF4444' }, // 1. Rosso (sinistra - basso)
  { label: 'POOR', min: 20, max: 40, color: '#F97316' }, // 2. Arancione
  { label: 'FAIR', min: 40, max: 60, color: '#EAB308' }, // 3. Giallo (centro - norma)
  { label: 'GOOD', min: 60, max: 80, color: '#84CC16' }, // 4. Verde chiaro
  { label: 'EXCELLENT', min: 80, max: 100, color: '#22C55E' }, // 5. Verde scuro (destra - alto)
]

export function ProgressMeter({
  value,
  segments = DEFAULT_SEGMENTS,
  title,
  unit = '%',
  height = 50,
  showValue = true,
  showTooltip = true,
}: ProgressMeterProps) {
  const [isHovered, setIsHovered] = useState(false)
  // Calcola il range totale (min e max di tutti i segmenti)
  const totalMin = segments[0]?.min ?? 0
  const totalMax = segments[segments.length - 1]?.max ?? 100
  const totalRange = totalMax - totalMin

  // Calcola la posizione dell'indicatore
  const indicatorPosition = useMemo(() => {
    if (value === null || value === undefined) return null

    // Normalizza il valore rispetto al range totale
    const normalizedValue = ((value - totalMin) / totalRange) * 100

    // Limita tra 0 e 100
    return Math.max(0, Math.min(100, normalizedValue))
  }, [value, totalMin, totalRange])

  // Trova il colore del segmento corrente
  const currentSegment = useMemo(() => {
    if (value === null || value === undefined) return null
    return segments.find((s) => value >= s.min && value < s.max) || segments[segments.length - 1]
  }, [value, segments])

  return (
    <div className="w-full">
      {title && (
        <div className="mb-6">
          <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
          {showValue && value !== null && (
            <p className="text-text-secondary mt-1 text-sm">
              Valore attuale:{' '}
              <span className="font-bold text-white">
                {value.toFixed(1)}
                {unit}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Meter Bar Container */}
      <div
        className="relative"
        style={{ height: `${height}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Valori numerici sopra la barra */}
        <div className="absolute -top-6 left-0 right-0 flex justify-between text-xs font-semibold">
          {/* Valore minimo (sinistra) */}
          <span className="text-text-secondary" style={{ color: segments[0]?.color }}>
            {totalMin}
            {unit}
          </span>

          {/* Valore norma (centro) */}
          <span
            className="text-text-secondary"
            style={{ color: segments[Math.floor(segments.length / 2)]?.color }}
          >
            Norma
          </span>

          {/* Valore massimo (destra) */}
          <span
            className="text-text-secondary"
            style={{ color: segments[segments.length - 1]?.color }}
          >
            {totalMax}
            {unit}
          </span>
        </div>

        {/* Barra con segmenti */}
        <div className="flex h-full overflow-hidden rounded-full shadow-inner border-2 border-black/10">
          {segments.map((segment, index) => {
            // Calcola la larghezza percentuale del segmento rispetto al range totale
            const segmentRange = segment.max - segment.min
            const segmentWidthPercent = (segmentRange / totalRange) * 100

            return (
              <div
                key={index}
                className="h-full transition-all duration-300 hover:brightness-110"
                style={{
                  width: `${segmentWidthPercent}%`,
                  backgroundColor: segment.color,
                  borderTopLeftRadius: index === 0 ? '9999px' : '0',
                  borderBottomLeftRadius: index === 0 ? '9999px' : '0',
                  borderTopRightRadius: index === segments.length - 1 ? '9999px' : '0',
                  borderBottomRightRadius: index === segments.length - 1 ? '9999px' : '0',
                }}
              />
            )
          })}
        </div>

        {/* Indicatore (triangoli sopra e sotto con tooltip) */}
        {indicatorPosition !== null && value !== null && (
          <>
            {/* Tooltip con valore */}
            {showTooltip && (
              <div
                className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-lg bg-black/95 px-3 py-1.5 text-xs font-semibold text-white shadow-xl transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  top: `-${height + 40}px`,
                  left: `calc(${indicatorPosition}%)`,
                  whiteSpace: 'nowrap',
                }}
              >
                {value.toFixed(1)}
                {unit}
                {/* Freccia del tooltip */}
                <div className="absolute left-1/2 top-full -translate-x-1/2">
                  <div className="border-4 border-transparent border-t-black/95" />
                </div>
              </div>
            )}

            {/* Triangolo sopra (ribaltato) */}
            <div
              className="absolute top-0 z-20 transition-all duration-500 ease-out"
              style={{
                left: `calc(${indicatorPosition}% - 10px)`,
                transform: 'translateY(-100%)',
              }}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                <path
                  d="M10 16L20 0H0L10 16Z"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="0.5"
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                  }}
                />
              </svg>
            </div>

            {/* Triangolo sotto */}
            <div
              className="absolute bottom-0 z-20 transition-all duration-500 ease-out"
              style={{
                left: `calc(${indicatorPosition}% - 10px)`,
                transform: 'translateY(100%)',
              }}
            >
              <svg
                width="20"
                height="16"
                viewBox="0 0 20 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-2xl"
              >
                <path
                  d="M10 0L20 16H0L10 0Z"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="0.5"
                  className="transition-all duration-300"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none',
                  }}
                />
              </svg>
            </div>

            {/* Linea verticale indicatore */}
            <div
              className="absolute top-0 bottom-0 left-1/2 z-10 bg-white transition-all duration-300"
              style={{
                left: `calc(${indicatorPosition}%)`,
                transform: 'translateX(-50%)',
                width: '3px', // 150% di 2px (w-0.5)
                opacity: isHovered ? 1 : 0.7,
              }}
            />
          </>
        )}
      </div>

      {/* Etichette */}
      <div className="mt-4 flex">
        {segments.map((segment, index) => {
          const segmentRange = segment.max - segment.min
          const segmentWidthPercent = (segmentRange / totalRange) * 100

          return (
            <div
              key={index}
              className="flex flex-col items-center transition-all duration-300"
              style={{ width: `${segmentWidthPercent}%` }}
            >
              <span
                className="text-xs font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: segment.color,
                  textShadow:
                    isHovered && currentSegment?.label === segment.label
                      ? '0 0 8px currentColor'
                      : 'none',
                }}
              >
                {segment.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
