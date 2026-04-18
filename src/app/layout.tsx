import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import '../styles/sidebar-enhanced.css'
import '../styles/tablet-landscape.css'
import '../styles/app-viewport-shell.css'
import '@/lib/dom-protection' // Protezione DOM per errori className
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import SwRegister from '@/components/sw-register'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { CookieConsent } from '@/components/shared/cookie-consent'
import { WakeLockProvider } from '@/components/wake-lock-provider'
import { ConnectionStatusBanner } from '@/components/shared/connection-status-banner'
import { InstallPwaPrompt } from '@/components/shared/install-pwa-prompt'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '22Club - Fitness Management',
  description: 'Gestione completa per centri fitness: atleti, allenamenti, documenti e pagamenti',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '22Club',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: '22Club',
    title: '22Club - Fitness Management',
    description: 'Gestione completa per centri fitness: atleti, allenamenti, documenti e pagamenti',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-144x144.png', sizes: '144x144', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#02B3BF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Stili critici inline: visibili anche se il CSS esterno (es. layout.css) non si carica
  const criticalCss = `html,body{background:#0d0d0d !important;color:#EAF0F2}body{min-height:100dvh}.page-login{min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:1rem}`

  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0d0d0d' }}
        suppressHydrationWarning
      >
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <WakeLockProvider>
                  <ConnectionStatusBanner />
                  <InstallPwaPrompt />
                  {children}
                  <SwRegister />
                  <CookieConsent />
                </WakeLockProvider>
              </ToastProvider>
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
