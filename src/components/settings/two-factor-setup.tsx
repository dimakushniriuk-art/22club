'use client'

import * as React from 'react'
import Image from 'next/image'
import { createLogger } from '@/lib/logger'

const logger = createLogger('components:settings:two-factor-setup')
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { useSupabase } from '@/hooks/use-supabase'
import { useToast } from '@/components/ui/toast'
import { useUserSettings } from '@/hooks/use-user-settings'
import QRCode from 'qrcode'
import { Copy, Check, Download } from 'lucide-react'

interface TwoFactorSetupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EnrollResponse {
  id: string
  type: string
  qr_code?: string
  secret?: string
  totp?: { qr_code?: string; secret?: string; uri?: string }
}

export function TwoFactorSetup({ open, onOpenChange }: TwoFactorSetupProps) {
  const { supabase } = useSupabase()
  const { addToast } = useToast()
  const { saveTwoFactor } = useUserSettings()

  const [isLoading, setIsLoading] = React.useState(false)
  const [factorId, setFactorId] = React.useState<string>('')
  const [challengeId, setChallengeId] = React.useState<string>('')
  const [otpUri, setOtpUri] = React.useState<string>('')
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('')
  const [code, setCode] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = React.useState(false)
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null)

  // Genera backup codes (10 codici alfanumerici di 8 caratteri)
  const generateBackupCodes = React.useCallback((): string[] => {
    const codes: string[] = []
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < 10; i++) {
      let code = ''
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      codes.push(code)
    }
    return codes
  }, [])

  const reset = React.useCallback(() => {
    setIsLoading(false)
    setFactorId('')
    setChallengeId('')
    setOtpUri('')
    setQrDataUrl('')
    setCode('')
    setError('')
    setBackupCodes([])
    setShowBackupCodes(false)
    setCopiedCode(null)
  }, [])

  const close = React.useCallback(() => {
    onOpenChange(false)
    reset()
  }, [onOpenChange, reset])

  const startEnroll = React.useCallback(async () => {
    setError('')
    try {
      setIsLoading(true)
      // Enroll TOTP
      const enrollAny = await (
        supabase as unknown as {
          auth: { mfa: { enroll: (args: unknown) => Promise<{ data: unknown; error: unknown }> } }
        }
      ).auth.mfa.enroll({ factorType: 'totp' })
      const enrollData = (enrollAny?.data ?? {}) as EnrollResponse
      if (!enrollData?.id) throw new Error('Impossibile avviare la registrazione 2FA')
      setFactorId(enrollData.id)

      // Preferisci uri da totp, altrimenti da qr_code/secret
      const uri = (enrollData?.totp as { uri?: string } | undefined)?.uri
      const secret = enrollData?.secret
      let otpauth = uri || ''
      if (!otpauth && secret) {
        // Fallback generico: l'URI dipende dal provider; tentiamo una forma comune
        // Nota: il label/account verrà impostato dal client (22Club)
        otpauth = `otpauth://totp/22Club?secret=${secret}&issuer=22Club`
      }
      if (!otpauth) throw new Error('Nessun OTP URI disponibile')
      setOtpUri(otpauth)

      const qr = await QRCode.toDataURL(otpauth)
      setQrDataUrl(qr)

      // Challenge
      const challengeAny = await (
        supabase as unknown as {
          auth: {
            mfa: {
              challenge: (
                args: unknown,
              ) => Promise<{ data: { id?: string } | null; error: unknown }>
            }
          }
        }
      ).auth.mfa.challenge({ factorId: enrollData.id })
      const chId = challengeAny?.data?.id
      if (!chId) throw new Error('Impossibile generare la sfida 2FA')
      setChallengeId(chId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Errore durante l'attivazione 2FA"
      setError(msg)
      addToast({ title: 'Errore 2FA', message: msg, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, addToast])

  const verify = React.useCallback(async () => {
    setError('')
    try {
      if (!factorId || !challengeId || !code) {
        setError('Inserisci il codice di 6 cifre')
        return
      }
      setIsLoading(true)
      const verifyAny = await (
        supabase as unknown as {
          auth: {
            mfa: {
              verify: (
                args: unknown,
              ) => Promise<{ data: unknown; error: { message?: string } | null }>
            }
          }
        }
      ).auth.mfa.verify({ factorId, challengeId, code })
      if (verifyAny?.error) throw new Error(verifyAny.error.message || 'Codice non valido')

      // Genera backup codes
      const codes = generateBackupCodes()
      setBackupCodes(codes)
      setShowBackupCodes(true)

      // Estrai secret dall'URI (se disponibile)
      const secretMatch = otpUri.match(/secret=([A-Z0-9]+)/i)
      const secret = secretMatch ? secretMatch[1] : undefined

      // Salva in user_settings
      const saveResult = await saveTwoFactor(true, secret, codes)
      if (!saveResult.success) {
        logger.warn('Errore salvataggio 2FA in user_settings', undefined, {
          error: saveResult.error,
        })
        // Non blocchiamo il processo se il salvataggio fallisce
      }

      addToast({
        title: '2FA attivata',
        message: 'Autenticazione a due fattori attiva. Salva i backup codes!',
        variant: 'success',
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Verifica fallita'
      setError(msg)
      addToast({ title: 'Errore 2FA', message: msg, variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [factorId, challengeId, code, supabase, addToast, otpUri, generateBackupCodes, saveTwoFactor])

  React.useEffect(() => {
    if (open) void startEnroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="right" size="md">
      <DrawerContent onClose={close}>
        <DrawerHeader title="Configura 2FA" description="Proteggi il tuo account con codice TOTP" />
        <DrawerBody>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle size="sm">Scansiona il QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                {qrDataUrl ? (
                  <div className="rounded-lg bg-white p-3">
                    <Image
                      src={qrDataUrl}
                      alt="QR Code 2FA"
                      width={192}
                      height={192}
                      className="h-48 w-48"
                    />
                  </div>
                ) : (
                  <div className="bg-background-tertiary h-48 w-48 animate-pulse rounded-lg" />
                )}
                {otpUri && (
                  <p className="text-text-tertiary text-xs break-all text-center">
                    Se non riesci a scansionare, usa questo codice nell&apos;app: {otpUri}
                  </p>
                )}
              </CardContent>
            </Card>

            {!showBackupCodes ? (
              <>
                <div className="space-y-2">
                  <label className="text-text-primary text-sm font-medium">Codice a 6 cifre</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  />
                  {error && <p className="text-state-error text-sm">{error}</p>}
                </div>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle size="sm">Backup Codes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-text-secondary text-sm">
                    Salva questi codici in un posto sicuro. Potrai usarli per accedere se perdi
                    accesso al tuo dispositivo autenticatore.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((backupCode, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-background-tertiary border border-teal-500/20"
                      >
                        <code className="text-text-primary font-mono text-sm">{backupCode}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(backupCode)
                              setCopiedCode(backupCode)
                              setTimeout(() => setCopiedCode(null), 2000)
                            } catch (err) {
                              logger.error('Errore copia backup code', err, {
                                backupCodeIndex: index,
                              })
                            }
                          }}
                        >
                          {copiedCode === backupCode ? (
                            <Check className="h-3 w-3 text-teal-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const text = backupCodes.join('\n')
                        const blob = new Blob([text], { type: 'text/plain' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = '22club-2fa-backup-codes.txt'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        addToast({
                          title: 'Download completato',
                          message: 'Backup codes salvati',
                          variant: 'success',
                        })
                      } catch (err) {
                        logger.error('Errore download backup codes', err)
                      }
                    }}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Scarica Backup Codes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </DrawerBody>
        <DrawerFooter>
          {showBackupCodes ? (
            <Button onClick={close} className="bg-brand hover:bg-brand/90 w-full">
              Ho salvato i backup codes
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={close} disabled={isLoading}>
                Annulla
              </Button>
              <Button
                onClick={verify}
                disabled={isLoading || code.length !== 6}
                className="bg-brand hover:bg-brand/90"
              >
                {isLoading ? 'Verifica…' : 'Verifica e attiva'}
              </Button>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
