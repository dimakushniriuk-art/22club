import { NonHomeViewportShell } from '@/components/layout/non-home-viewport-shell'

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return <NonHomeViewportShell>{children}</NonHomeViewportShell>
}
