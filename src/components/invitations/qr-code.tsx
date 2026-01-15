'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'
// Import dinamico per evitare problemi con SSR
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Download, Copy, Check } from 'lucide-react'

const logger = createLogger('components:invitations:qr-code')

interface QRCodeProps {
  invitationCode: string
  athleteName: string
  onCopy?: () => void
}

export function QRCodeComponent({ invitationCode, athleteName, onCopy }: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Production-safe: usa window.location.origin invece di NEXT_PUBLIC_APP_URL
  // Evita problemi di redirect strani su Vercel con dominio custom
  const registrationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/registrati?code=${invitationCode}`
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.22club.it'}/registrati?code=${invitationCode}`

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true)

        // Import dinamico per evitare problemi con SSR
        const QRCode = await import('qrcode')
        const qrDataUrl = await QRCode.toDataURL(registrationUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#0A0F12', // Dark background
            light: '#EAF0F2', // Light foreground
          },
        })
        setQrDataUrl(qrDataUrl)
      } catch (err) {
        logger.error('Error generating QR code', err, { invitationCode, athleteName })
      } finally {
        setLoading(false)
      }
    }

    generateQR()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(registrationUrl)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      logger.error('Error copying to clipboard', err, { invitationCode })
    }
  }

  const handleDownload = () => {
    if (!qrDataUrl) return

    const link = document.createElement('a')
    link.download = `22club-invito-${athleteName.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = qrDataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle size="sm">QR Code Invito</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="bg-background-tertiary h-64 w-64 animate-pulse rounded-lg" />
          <p className="text-text-tertiary text-sm">Generando QR code...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle size="sm">QR Code Invito</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* QR Code Image */}
        <div className="rounded-lg bg-white p-4">
          <Image
            src={qrDataUrl}
            alt={`QR Code per invito di ${athleteName}`}
            width={256}
            height={256}
            className="h-64 w-64"
          />
        </div>

        {/* Athlete Name */}
        <p className="text-text-primary text-center text-sm font-medium">Per: {athleteName}</p>

        {/* Actions */}
        <div className="flex w-full gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1">
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copiato!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copia Link
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Registration URL */}
        <div className="w-full">
          <p className="text-text-tertiary mb-2 text-xs">Link di registrazione:</p>
          <div className="bg-background-tertiary rounded p-2">
            <p className="text-text-secondary break-all text-xs">{registrationUrl}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
