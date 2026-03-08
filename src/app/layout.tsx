import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import '../styles/sidebar-enhanced.css'
import '../styles/tablet-landscape.css'
import '@/lib/dom-protection' // Protezione DOM per errori className
import { QueryProvider } from '@/providers/query-provider'
import { AuthProvider } from '@/providers/auth-provider'
import SwRegister from '@/components/sw-register'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/shared/ui/error-boundary'
import { CookieConsent } from '@/components/shared/cookie-consent'
import { WakeLockProvider } from '@/components/wake-lock-provider'

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
    statusBarStyle: 'default',
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Stili critici inline: visibili anche se il CSS esterno (es. layout.css) non si carica
  const criticalCss = `html,body{background-color:#0A0F12 !important;color:#EAF0F2}body{min-height:100vh}.page-login{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem;position:relative;overflow:hidden}.page-login .login-card{width:100%;max-width:28rem;background:#1A2024;border:1px solid #242A2E;border-radius:1rem;box-shadow:0 25px 50px -12px rgba(0,0,0,.5)}.page-login .login-card>*{padding:2rem}`

  return (
    <html lang="it">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: '#0A0F12' }}
        suppressHydrationWarning
      >
        <style dangerouslySetInnerHTML={{ __html: criticalCss }} />
        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <ToastProvider>
                <WakeLockProvider>
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
