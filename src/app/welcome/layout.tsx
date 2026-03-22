import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Benvenuto | 22Club',
  description: 'Scopri come usare 22Club e chi è il tuo Personal Trainer.',
}

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return children
}
