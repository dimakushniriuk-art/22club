import type { ReactNode } from 'react'
import { AUTH_PAGE_WRAPPER_CLASS } from '@/lib/auth-page-styles'

export function AuthPasswordPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className={AUTH_PAGE_WRAPPER_CLASS} style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-md md:max-w-lg animate-fade-in relative z-10">{children}</div>
    </div>
  )
}
