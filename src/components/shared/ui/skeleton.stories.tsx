import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente per mostrare placeholder di caricamento con effetto shimmer.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Classi CSS aggiuntive',
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: {
    className: 'h-4 w-[250px]',
  },
}

export const Circle: Story = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
}

export const Rectangle: Story = {
  args: {
    className: 'h-4 w-[200px]',
  },
}

export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ),
}

export const Table: Story = {
  render: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
}

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-3 w-[60px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-3 w-[80px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[90px]" />
        <Skeleton className="h-8 w-[70px]" />
        <Skeleton className="h-3 w-[50px]" />
      </div>
    </div>
  ),
}

export const Profile: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-3 w-[150px]" />
        <Skeleton className="h-3 w-[100px]" />
      </div>
    </div>
  ),
}

export const List: Story = {
  render: () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  ),
}
