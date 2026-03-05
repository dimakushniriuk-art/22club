import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TrendChart, MultiTrendChart } from '@/components/shared/analytics/trend-chart'
import {
  DistributionChart,
  HorizontalBarChart,
  VerticalBarChart,
} from '@/components/shared/analytics/distribution-chart'
import { KPIMetrics, PerformanceMetrics } from '@/components/shared/analytics/kpi-metrics'

describe('Analytics Components', () => {
  const mockTrendData = [
    { day: '2024-01-01', allenamenti: 10, documenti: 2, ore_totali: 5.0 },
    { day: '2024-01-02', allenamenti: 15, documenti: 3, ore_totali: 7.5 },
  ]

  const mockDistributionData = [
    { type: 'allenamento', count: 30, percentage: 60 },
    { type: 'consulenza', count: 15, percentage: 30 },
  ]

  const mockPerformanceData = [
    {
      athlete_id: '1',
      athlete_name: 'Test Athlete',
      total_workouts: 10,
      avg_duration: 60,
      completion_rate: 90,
    },
  ]

  const mockSummary = {
    total_workouts: 100,
    total_documents: 50,
    total_hours: 200,
    active_athletes: 10,
  }

  const mockGrowth = {
    workouts_growth: 10,
    documents_growth: 5,
    hours_growth: 15,
  }

  describe('TrendChart', () => {
    it('renders trend chart', () => {
      render(<TrendChart data={mockTrendData} />)

      expect(screen.getByText('Andamento Allenamenti (ultimi 14 giorni)')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      const { container } = render(<TrendChart data={mockTrendData} />)

      // Il container principale ha classi specifiche per il design moderno
      const chartContainer = container.querySelector('.rounded-xl')
      expect(chartContainer).toBeInTheDocument()
      expect(chartContainer).toHaveClass('relative', 'overflow-hidden', 'rounded-xl', 'border-2')
    })
  })

  describe('MultiTrendChart', () => {
    it('renders multi trend chart', () => {
      render(<MultiTrendChart data={mockTrendData} />)

      expect(screen.getByText('Trend Multipli')).toBeInTheDocument()
    })
  })

  describe('DistributionChart', () => {
    it('renders distribution chart', () => {
      render(<DistributionChart data={mockDistributionData} />)

      expect(screen.getByText('Distribuzione per tipo')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      const { container } = render(<DistributionChart data={mockDistributionData} />)

      // Il container principale ha classi specifiche per il design moderno
      const chartContainer = container.querySelector('.rounded-xl')
      expect(chartContainer).toBeInTheDocument()
      expect(chartContainer).toHaveClass('relative', 'overflow-hidden', 'rounded-xl', 'border-2')
    })
  })

  describe('HorizontalBarChart', () => {
    it('renders horizontal bar chart', () => {
      render(<HorizontalBarChart data={mockDistributionData} />)

      expect(screen.getByText('Distribuzione per tipo')).toBeInTheDocument()
    })
  })

  describe('VerticalBarChart', () => {
    it('renders vertical bar chart', () => {
      render(<VerticalBarChart data={mockDistributionData} />)

      expect(screen.getByText('Distribuzione per tipo')).toBeInTheDocument()
    })
  })

  describe('KPIMetrics', () => {
    it('renders KPI metrics', () => {
      render(<KPIMetrics summary={mockSummary} growth={mockGrowth} />)

      expect(screen.getByText('Allenamenti Totali')).toBeInTheDocument()
      expect(screen.getByText('Documenti Caricati')).toBeInTheDocument()
      expect(screen.getByText('Ore Totali')).toBeInTheDocument()
      expect(screen.getByText('Atleti Attivi')).toBeInTheDocument()
    })

    it('displays correct values', () => {
      render(<KPIMetrics summary={mockSummary} growth={mockGrowth} />)

      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
      expect(screen.getByText('200.0')).toBeInTheDocument()
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      const { container } = render(<KPIMetrics summary={mockSummary} growth={mockGrowth} />)

      // KPIMetrics ha un wrapper grid, ma ogni card è separata
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('PerformanceMetrics', () => {
    it('renders performance metrics', () => {
      render(<PerformanceMetrics performance={mockPerformanceData} />)

      expect(screen.getByText(/Top Performers/)).toBeInTheDocument() // Con emoji
      expect(screen.getByText('Test Athlete')).toBeInTheDocument()
    })

    it('displays correct performance data', () => {
      render(<PerformanceMetrics performance={mockPerformanceData} />)

      // Il formato è "10 allenamenti • 60 min avg" non "Allenamenti: 10"
      expect(screen.getByText(/10.*allenamenti/)).toBeInTheDocument()
      expect(screen.getByText(/90.*%/)).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      const { container } = render(<PerformanceMetrics performance={mockPerformanceData} />)

      // Il container principale ha classi specifiche per il design moderno
      const metricsContainer = container.querySelector('.rounded-xl')
      expect(metricsContainer).toBeInTheDocument()
      expect(metricsContainer).toHaveClass('relative', 'overflow-hidden', 'rounded-xl', 'border-2')
    })
  })
})
