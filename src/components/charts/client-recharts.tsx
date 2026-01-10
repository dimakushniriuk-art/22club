'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

// Loading component per i grafici
const ChartLoading = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-text-secondary text-sm">Caricamento grafico...</div>
  </div>
)

// Error component per i grafici
const ChartError = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-center">
      <div className="text-text-secondary">Errore caricamento grafico</div>
      <div className="text-text-tertiary text-sm mt-2">Ricarica la pagina</div>
    </div>
  </div>
)

// Helper per creare dynamic import con gestione errori
const createChartComponent = <K extends keyof typeof import('recharts')>(key: K) => {
  return dynamic(
    async () => {
      try {
        const recharts = await import('recharts')
        if (!recharts || typeof recharts[key] === 'undefined') {
          console.error(`Componente Recharts "${String(key)}" non trovato nel modulo`)
          const ErrorComponent = () => <ChartError />
          ErrorComponent.displayName = `ChartError_${String(key)}`
          return ErrorComponent
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = recharts[key] as ComponentType<any>
        if (typeof Component !== 'function') {
          console.error(`Componente Recharts "${String(key)}" non è una funzione valida`)
          const ErrorComponent = () => <ChartError />
          ErrorComponent.displayName = `ChartError_${String(key)}`
          return ErrorComponent
        }
        return Component
      } catch (error) {
        console.error(`Errore caricamento componente Recharts "${String(key)}":`, error)
        const ErrorComponent = () => <ChartError />
        ErrorComponent.displayName = `ChartError_${String(key)}`
        return ErrorComponent
      }
    },
    {
      ssr: false,
      loading: () => <ChartLoading />,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as ComponentType<any>
}

// Esporta tutti i componenti Recharts con dynamic import e gestione errori
export const LineChart = createChartComponent('LineChart')
export const Line = createChartComponent('Line')
export const BarChart = createChartComponent('BarChart')
export const Bar = createChartComponent('Bar')
export const XAxis = createChartComponent('XAxis')
export const YAxis = createChartComponent('YAxis')
export const CartesianGrid = createChartComponent('CartesianGrid')
export const Tooltip = createChartComponent('Tooltip')
export const Legend = createChartComponent('Legend')
export const ResponsiveContainer = createChartComponent('ResponsiveContainer')
export const Area = createChartComponent('Area')
export const AreaChart = createChartComponent('AreaChart')
export const RadarChart = createChartComponent('RadarChart')
export const PolarGrid = createChartComponent('PolarGrid')
export const PolarAngleAxis = createChartComponent('PolarAngleAxis')
export const PolarRadiusAxis = createChartComponent('PolarRadiusAxis')
export const Radar = createChartComponent('Radar')
export const PieChart = createChartComponent('PieChart')
export const Pie = createChartComponent('Pie')
export const Cell = createChartComponent('Cell')
