import type { ReactNode } from 'react'
import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

/** Layout minimale per viste embed (iframe da dashboard), senza shell staff/atleta. */
export default function EmbedRootLayout({ children }: { children: ReactNode }) {
  return (
    <NonHomeViewportShell className="bg-background text-text-primary antialiased">
      {children}
    </NonHomeViewportShell>
  )
}
