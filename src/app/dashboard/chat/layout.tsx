import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat | 22Club Dashboard',
  description: 'Messaggia con i tuoi atleti in tempo reale dalla dashboard 22Club.',
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children
}
