'use client'

import React from 'react'

export interface RangeStatusMeterProps {
  value?: number | null
  min?: number
  max?: number
  optimalMin?: number
  optimalMax?: number
  title?: string
  unit?: string
  height?: number
  showValue?: boolean
}

export function RangeStatusMeter({
  value = null,
  min = 0,
  max = 100,
  optimalMin = 20,
  optimalMax = 80,
  title,
  unit = '',
  height = 50,
  showValue = false,
}: RangeStatusMeterProps) {
  // Calcola le percentuali per la posizione dei segmenti
  const range = max - min
  const optimalRange = optimalMax - optimalMin

  // Percentuali per i segmenti di gradiente
  const bassoPercent = ((optimalMin - min) / range) * 100 // Da min a optimalMin
  const ottimalePercent = (optimalRange / range) * 100 // Da optimalMin a optimalMax
  const altoPercent = ((max - optimalMax) / range) * 100 // Da optimalMax a max

  return (
    <div className="w-full">
      {title && (
        <div className="mb-2">
          <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
          {showValue && value !== null && (
            <p className="text-text-secondary mt-0.5 text-xs">
              Valore attuale:{' '}
              <span className="font-bold text-teal-400">
                {value.toFixed(1)}
                {unit}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Meter container */}
      <div className="relative mt-4 mb-1" style={{ height: `${height}px` }}>
        {/* Valore / STATUS sopra la barra */}
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-full flex flex-col items-center pb-1.5">
          {value !== null && (
            <span className="text-xl font-bold tabular-nums text-text-primary min-[834px]:text-2xl">
              {value.toFixed(1)}
              {unit}
            </span>
          )}
          {value === null && (
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              STATUS
            </span>
          )}
          {/* Freccia verso la barra */}
          <svg
            className="mt-1 text-text-primary"
            width="20"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path d="M8 12L16 0H0L8 12Z" fill="currentColor" />
          </svg>
        </div>

        {/* Barra con gradiente */}
        <div className="relative h-full overflow-hidden rounded-full border border-white/20 shadow-inner bg-black/20">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, 
                #EF4444 0%, 
                #EF4444 ${((bassoPercent / 3) * 100) / 100}%, 
                #F97316 ${((bassoPercent / 3) * 200) / 100}%, 
                #EAB308 ${bassoPercent}%, 
                #84CC16 ${bassoPercent + ottimalePercent / 3}%, 
                #22C55E ${bassoPercent + ottimalePercent / 2}%, 
                #84CC16 ${bassoPercent + (ottimalePercent * 2) / 3}%, 
                #EAB308 ${bassoPercent + ottimalePercent}%, 
                #F97316 ${bassoPercent + ottimalePercent + (altoPercent / 3) * 2}%, 
                #EF4444 ${bassoPercent + ottimalePercent + altoPercent}%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              BASSO
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              ALTO
            </span>
          </div>
        </div>
      </div>

      {/* Range ottimale sotto la barra */}
      <div className="mt-3 flex justify-between px-0.5">
        <span className="text-sm font-medium tabular-nums text-text-secondary">
          {optimalMin}
          {unit}
        </span>
        <span className="text-sm font-medium tabular-nums text-text-secondary">
          {optimalMax}
          {unit}
        </span>
      </div>
    </div>
  )
}
