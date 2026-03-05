import type { Meta, StoryObj } from '@storybook/react'
import { KpiCard } from './kpi-card'

const meta: Meta<typeof KpiCard> = {
  title: 'Dashboard/KpiCard',
  component: KpiCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente per visualizzare metriche KPI nel dashboard PT.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Etichetta del KPI',
    },
    value: {
      control: 'text',
      description: 'Valore del KPI',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral', undefined],
      description: 'Tendenza del KPI',
    },
    icon: {
      control: 'text',
      description: 'Icona da mostrare',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof KpiCard>

export const Default: Story = {
  args: {
    label: 'Allenamenti',
    value: '12',
  },
}

export const WithTrend: Story = {
  args: {
    label: 'Clienti Attivi',
    value: '24',
    trend: 'up',
  },
}

export const WithIcon: Story = {
  args: {
    label: 'Fatturato',
    value: '€2,450',
    trend: 'up',
    icon: '💰',
  },
}

export const NegativeTrend: Story = {
  args: {
    label: 'Appuntamenti',
    value: '8',
    trend: 'down',
  },
}

export const NeutralTrend: Story = {
  args: {
    label: 'Valutazioni',
    value: '4.8',
    trend: 'neutral',
  },
}

export const LongLabel: Story = {
  args: {
    label: 'Appuntamenti Completati Questo Mese',
    value: '156',
    trend: 'up',
  },
}

export const LargeValue: Story = {
  args: {
    label: 'Fatturato Totale',
    value: '€125,430',
    trend: 'up',
    icon: '📈',
  },
}
