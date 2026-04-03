import type { ReactNode } from 'react'

/** Layout minimale per viste embed (iframe da dashboard), senza shell staff/atleta. */
export default function EmbedRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-background text-text-primary antialiased">{children}</div>
}
