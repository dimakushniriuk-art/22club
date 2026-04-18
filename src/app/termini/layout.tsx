import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export default function TerminiLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
