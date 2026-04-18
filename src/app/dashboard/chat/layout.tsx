import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chat | 22Club Dashboard',
  description: 'Messaggia con i tuoi atleti in tempo reale dalla dashboard 22Club.',
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>
}
