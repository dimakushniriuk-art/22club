import type { Meta, StoryObj } from '@storybook/react'
import { MetricCard } from '@/components'

const meta: Meta<typeof MetricCard> = {
  title: 'Dashboard/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card metriche per il dashboard (variante minimal, allineata al legacy KPI).',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Titolo della metrica',
    },
    value: {
      control: 'text',
      description: 'Valore mostrato',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral', undefined],
      description: 'Tendenza',
    },
    icon: {
      control: 'text',
      description: 'Icona (ReactNode)',
    },
    variant: {
      control: 'select',
      options: ['default', 'compact', 'minimal', 'glass', 'trainer'],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MetricCard>

export const Default: Story = {
  args: {
    variant: 'minimal',
    title: 'Allenamenti',
    value: '12',
    icon: '💪',
  },
}

export const WithTrend: Story = {
  args: {
    variant: 'minimal',
    title: 'Clienti Attivi',
    value: '24',
    trend: 'up',
    icon: '👥',
  },
}

export const WithIcon: Story = {
  args: {
    variant: 'minimal',
    title: 'Fatturato',
    value: '€2,450',
    trend: 'up',
    icon: '💰',
  },
}

export const NegativeTrend: Story = {
  args: {
    variant: 'minimal',
    title: 'Appuntamenti',
    value: '8',
    trend: 'down',
    icon: '📅',
  },
}

export const NeutralTrend: Story = {
  args: {
    variant: 'minimal',
    title: 'Valutazioni',
    value: '4.8',
    trend: 'neutral',
    icon: '⭐',
  },
}

export const LongTitle: Story = {
  args: {
    variant: 'minimal',
    title: 'Appuntamenti Completati Questo Mese',
    value: '156',
    trend: 'up',
    icon: '📆',
  },
}

export const LargeValue: Story = {
  args: {
    variant: 'minimal',
    title: 'Fatturato Totale',
    value: '€125,430',
    trend: 'up',
    icon: '📈',
  },
}

export const Loading: Story = {
  args: {
    variant: 'minimal',
    title: 'Allenamenti',
    value: '—',
    icon: '💪',
    loading: true,
  },
}

export const LoadingCompact: Story = {
  args: {
    variant: 'compact',
    title: 'KPI',
    value: '0',
    icon: '📊',
    loading: true,
  },
}
