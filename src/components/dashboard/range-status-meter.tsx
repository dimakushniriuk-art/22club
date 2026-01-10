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
        <div className="mb-1.5">
          <h3 className="text-text-primary text-sm font-semibold">{title}</h3>
          {showValue && value !== null && (
            <p className="text-text-secondary mt-0.5 text-xs">
              Valore attuale:{' '}
              <span className="font-bold text-white">
                {value.toFixed(1)}
                {unit}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Meter Container */}
      <div
        className="relative"
        style={{ height: `${height}px`, marginTop: '16px', marginBottom: '6px' }}
      >
        {/* Pulsante STATUS fisso al centro sopra la barra */}
        <div
          className="absolute top-0 z-30"
          style={{
            left: '50%',
            transform: 'translate(-50%, -100%)',
            marginBottom: '8px',
            marginTop: '6px',
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Valore attuale al posto di STATUS */}
            {value !== null && (
              <div className="px-1.5 py-0.5">
                <span className="text-lg font-bold text-white">
                  {value.toFixed(1)}
                  {unit}
                </span>
              </div>
            )}
            {value === null && (
              <div className="px-1.5 py-0.5">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  STATUS
                </span>
              </div>
            )}

            {/* Freccia triangolare bianca che punta verso il basso */}
            <div className="mt-1.5 flex items-center justify-center">
              <svg
                width="20"
                height="14"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 12L16 0H0L8 12Z" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>

        {/* Barra con gradiente */}
        <div className="relative h-full overflow-hidden rounded-full border border-white/30 shadow-inner">
          {/* Gradiente simmetrico: Rosso → Arancione → Giallo → Verde (centro) → Giallo → Arancione → Rosso */}
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

          {/* Testo sulla barra in grassetto bianco maiuscolo */}
          <div className="absolute inset-0 flex items-center justify-between px-2.5">
            {/* BASSO - allineato all'estremità sinistra */}
            <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-md">
              BASSO
            </span>

            {/* ALTO - allineato all'estremità destra */}
            <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-md">
              ALTO
            </span>
          </div>
        </div>
      </div>

      {/* Valori numerici sotto la barra (min e max) */}
      <div className="mt-2 flex justify-between">
        {/* Valore minimo (BASSO) - sinistra */}
        <div className="flex flex-col items-center">
          <div className="px-1.5 py-0.5">
            <span className="text-lg font-bold text-white">
              {optimalMin}
              {unit}
            </span>
          </div>
        </div>

        {/* Valore massimo (ALTO) - destra */}
        <div className="flex flex-col items-center">
          <div className="px-1.5 py-0.5">
            <span className="text-lg font-bold text-white">
              {optimalMax}
              {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
