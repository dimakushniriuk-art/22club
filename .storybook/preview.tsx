import type { Preview } from '@storybook/react'
import '../src/app/globals.css'
import { designSystem } from '../src/config/design-system'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: designSystem.colors.background.DEFAULT },
        { name: 'light', value: '#FFFFFF' },
        { name: 'primary', value: designSystem.colors.primary.DEFAULT },
        { name: 'secondary', value: designSystem.colors.secondary.DEFAULT },
      ],
    },
    layout: 'centered',
    options: {
      storySort: {
        order: ['Intro', 'UI', 'Components', 'Dashboard', 'Athlete', 'Layout'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
}

export default preview
