import type { Meta, StoryObj } from '@storybook/react'
import { AppointmentsCard } from './appointments-card'

const meta: Meta<typeof AppointmentsCard> = {
  title: 'Dashboard/Shared/AppointmentsCard',
  component: AppointmentsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card compatta per mostrare un appuntamento in evidenza.',
      },
    },
  },
  argTypes: {
    role: {
      control: 'inline-radio',
      options: ['atleta', 'staff'],
      description: 'Stile della card in base al ruolo',
    },
    data: {
      control: 'object',
      description: 'Dati sintetici da mostrare (es. data/ora)',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AppointmentsCard>

const baseData = {
  date: 'Oggi • 09:30 - Sessione Forza',
}

export const Athlete: Story = {
  args: {
    role: 'atleta',
    data: baseData,
  },
}

export const Staff: Story = {
  args: {
    role: 'staff',
    data: {
      date: 'Domani • 11:00 - Valutazione PT',
    },
  },
}
