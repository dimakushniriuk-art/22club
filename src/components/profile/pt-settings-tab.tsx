// ============================================================
// Componente Tab Impostazioni PT (FASE C - Split File Lunghi)
// ============================================================
// Estratto da profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { useState, lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { Badge, Avatar, useAvatarInitials } from '@/components/ui'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { LoadingState } from '@/components/dashboard/loading-state'
import { usePush } from '@/hooks/use-push'
import { cn } from '@/lib/utils'
import { Mail, Phone, MapPin, User, Bell, Shield, Save, Check } from 'lucide-react'

type SettingsPersona = 'trainer' | 'client_services'

function settingsCopy(persona: SettingsPersona) {
  const client = persona === 'client_services'
  return {
    emailNewSignup: client
      ? 'Ricevi una notifica quando un nuovo cliente si iscrive'
      : 'Ricevi una notifica quando un nuovo atleta si iscrive',
    pushDocExpiry: client
      ? 'Avvisa quando i documenti dei clienti stanno per scadere'
      : 'Avvisa quando i documenti degli atleti stanno per scadere',
    privacyEmail: client
      ? 'I clienti possono vedere il tuo indirizzo email'
      : 'Gli atleti possono vedere il tuo indirizzo email',
    privacyPhone: client
      ? 'I clienti possono vedere il tuo numero di telefono'
      : 'Gli atleti possono vedere il tuo numero di telefono',
    privacyStats: client
      ? 'Permetti ai clienti di vedere le statistiche generali'
      : 'Permetti agli atleti di vedere le statistiche generali',
  }
}

function settingsSwitchClass(checked: boolean) {
  return cn(
    'relative box-border inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    checked ? 'border-brand/60 bg-brand' : 'border-white/20 bg-background-tertiary',
  )
}

/** w-11 track, w-5 thumb: corsa 20px (translate-x-5), ancoraggio esplicito (evita thumb fuori dal track). */
function settingsSwitchThumbClass(checked: boolean) {
  return cn(
    'pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform',
    checked ? 'translate-x-5' : 'translate-x-0',
  )
}

// Lazy load modali pesanti
const ChangePasswordModal = lazy(() =>
  import('@/components/settings/change-password-modal').then((mod) => ({
    default: mod.ChangePasswordModal,
  })),
)
const TwoFactorSetup = lazy(() =>
  import('@/components/settings/two-factor-setup').then((mod) => ({
    default: mod.TwoFactorSetup,
  })),
)

interface Settings {
  profile: {
    nome: string
    cognome: string
    email: string
    phone: string
    bio: string
    address: string
    avatar: string | null
  }
  notifications: {
    email_nuovi_clienti: boolean
    email_appuntamenti: boolean
    email_pagamenti: boolean
    push_nuovi_messaggi: boolean
    push_reminder_appuntamenti: boolean
    push_scadenze_documenti: boolean
    sms_conferma_appuntamenti: boolean
  }
  privacy: {
    profilo_pubblico: boolean
    mostra_email: boolean
    mostra_telefono: boolean
    condividi_statistiche: boolean
  }
}

interface PTSettingsTabProps {
  settings: Settings
  authUserId: string | null
  isSavingSettings: boolean
  saveSuccess: boolean
  onSave: () => void
  onUpdateProfile: (field: string, value: string) => void
  onToggleNotification: (key: string) => void
  onTogglePrivacy: (key: string) => void
  /** Massaggiatore / servizi: testi con «cliente» invece di «atleta». */
  settingsPersona?: SettingsPersona
}

export function PTSettingsTab({
  settings,
  authUserId,
  isSavingSettings,
  saveSuccess,
  onSave,
  onUpdateProfile,
  onToggleNotification,
  onTogglePrivacy,
  settingsPersona = 'trainer',
}: PTSettingsTabProps) {
  const avatarInitials = useAvatarInitials(
    settings.profile.nome,
    settings.profile.cognome,
    settings.profile.email,
  )
  const copy = settingsCopy(settingsPersona)
  const [activeSettingsTab, setActiveSettingsTab] = useState('profilo')
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [openTwoFactor, setOpenTwoFactor] = useState(false)
  const { subscribe, unsubscribe } = usePush()

  return (
    <div className="space-y-6">
      {/* Header Impostazioni */}
      <Card variant="default" className="relative !p-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <Shield className="h-5 w-5 text-cyan-400" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-text-primary">Impostazioni</h2>
                <p className="text-text-secondary text-sm">
                  Gestisci il tuo account e le preferenze
                </p>
              </div>
            </div>
            <Button
              onClick={onSave}
              disabled={isSavingSettings}
              variant="primary"
              className="min-h-[44px]"
            >
              {isSavingSettings ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvataggio...
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Salvato!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salva modifiche
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs per Impostazioni */}
      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
        <TabsList variant="pills">
          <TabsTrigger value="profilo" variant="pills">
            <User className="mr-2 h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="notifiche" variant="pills">
            <Bell className="mr-2 h-4 w-4" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="privacy" variant="pills">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        {/* Sub-tab: Profilo */}
        <TabsContent value="profilo">
          <Card variant="default" className="relative !p-0">
            <CardHeader>
              <CardTitle size="md">Informazioni Personali</CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni di contatto e biografia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar
                  src={settings.profile.avatar}
                  alt={`${settings.profile.nome} ${settings.profile.cognome}`.trim() || 'Profilo'}
                  fallbackText={avatarInitials}
                  size="xl"
                  className="h-24 w-24 text-3xl border border-white/10"
                />
                <div className="space-y-2 min-w-0">
                  <AvatarUploader
                    userId={authUserId || null}
                    onUploaded={(url) => onUpdateProfile('avatar', url)}
                  />
                  <p className="text-text-tertiary mt-2 text-xs">
                    Seleziona immagine JPG, PNG o GIF. Max 25MB.
                  </p>
                </div>
              </div>

              {/* Nome e Cognome */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Nome"
                  value={settings.profile.nome}
                  onChange={(e) => onUpdateProfile('nome', e.target.value)}
                  placeholder="Mario"
                />
                <Input
                  label="Cognome"
                  value={settings.profile.cognome}
                  onChange={(e) => onUpdateProfile('cognome', e.target.value)}
                  placeholder="Rossi"
                />
              </div>

              {/* Email e Telefono */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => onUpdateProfile('email', e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  placeholder="email@esempio.it"
                  aria-label="Email"
                  autoComplete="email"
                />
                <Input
                  label="Telefono"
                  type="tel"
                  value={settings.profile.phone}
                  onChange={(e) => onUpdateProfile('phone', e.target.value)}
                  leftIcon={<Phone className="h-4 w-4" />}
                  placeholder="+39 333 1234567"
                  aria-label="Telefono"
                  autoComplete="tel"
                />
              </div>

              {/* Indirizzo */}
              <Input
                label="Indirizzo"
                value={settings.profile.address}
                onChange={(e) => onUpdateProfile('address', e.target.value)}
                leftIcon={<MapPin className="h-4 w-4" />}
                placeholder="Via Roma 123, Milano"
                aria-label="Indirizzo"
                autoComplete="street-address"
              />

              {/* Bio */}
              <Textarea
                label="Biografia"
                value={settings.profile.bio}
                onChange={(e) => onUpdateProfile('bio', e.target.value)}
                placeholder="Raccontaci qualcosa di te..."
                helperText={`Massimo 500 caratteri • ${Math.min(settings.profile.bio.length, 500)}/500`}
              />
            </CardContent>
          </Card>

          <Card variant="default" className="relative !p-0">
            <CardHeader>
              <CardTitle size="md">Sicurezza</CardTitle>
              <CardDescription>Gestisci password e sicurezza account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-text-primary font-medium">Password</p>
                  <p className="text-text-secondary text-sm">Ultima modifica: 30 giorni fa</p>
                </div>
                <Button
                  variant="outline"
                  className="border-white/10 text-text-primary hover:bg-white/[0.06] min-h-[44px] shrink-0"
                  onClick={() => setOpenChangePassword(true)}
                >
                  Cambia password
                </Button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-text-primary font-medium">Autenticazione a due fattori</p>
                  <p className="text-text-secondary text-sm">Proteggi il tuo account con 2FA</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge variant="warning">Non attiva</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-text-primary hover:bg-white/[0.06] min-h-[44px]"
                    onClick={() => setOpenTwoFactor(true)}
                  >
                    Attiva
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-tab: Notifiche */}
        <TabsContent value="notifiche">
          <div className="space-y-6">
            {/* Notifiche Email */}
            <Card variant="default" className="relative !p-0">
              <CardHeader>
                <CardTitle size="md">Notifiche Email</CardTitle>
                <CardDescription>Scegli quali notifiche ricevere via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    key: 'email_nuovi_clienti',
                    label: 'Nuovi clienti',
                    description: copy.emailNewSignup,
                  },
                  {
                    key: 'email_appuntamenti',
                    label: 'Appuntamenti',
                    description: 'Conferme, modifiche e cancellazioni appuntamenti',
                  },
                  {
                    key: 'email_pagamenti',
                    label: 'Pagamenti',
                    description: 'Notifiche su nuovi pagamenti e fatture',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-text-primary font-medium">{item.label}</p>
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    </div>
                    <div className="flex min-h-[44px] w-full shrink-0 items-center justify-end sm:w-auto sm:min-h-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={
                          settings.notifications[item.key as keyof typeof settings.notifications]
                        }
                        aria-label={item.label}
                        onClick={() => onToggleNotification(item.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onToggleNotification(item.key)
                          }
                        }}
                        className={settingsSwitchClass(
                          settings.notifications[item.key as keyof typeof settings.notifications],
                        )}
                        tabIndex={0}
                      >
                        <span
                          className={settingsSwitchThumbClass(
                            settings.notifications[item.key as keyof typeof settings.notifications],
                          )}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifiche Push */}
            <Card variant="default" className="relative !p-0">
              <CardHeader>
                <CardTitle size="md">Notifiche Push</CardTitle>
                <CardDescription>Notifiche in tempo reale sul tuo dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-text-primary font-medium">Abilita notifiche push</p>
                    <p className="text-text-secondary text-sm">Richiede permesso del browser</p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 shrink-0 justify-end sm:w-auto">
                    <Button
                      size="sm"
                      variant="primary"
                      className="min-h-[44px]"
                      onClick={() => void subscribe()}
                    >
                      Abilita Push
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 min-h-[44px] hover:bg-white/[0.06]"
                      onClick={() => void unsubscribe()}
                    >
                      Disattiva
                    </Button>
                  </div>
                </div>
                {[
                  {
                    key: 'push_nuovi_messaggi',
                    label: 'Nuovi messaggi',
                    description: 'Notifica quando ricevi un nuovo messaggio in chat',
                  },
                  {
                    key: 'push_reminder_appuntamenti',
                    label: 'Promemoria appuntamenti',
                    description: 'Ricorda gli appuntamenti imminenti',
                  },
                  {
                    key: 'push_scadenze_documenti',
                    label: 'Scadenze documenti',
                    description: copy.pushDocExpiry,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-text-primary font-medium">{item.label}</p>
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    </div>
                    <div className="flex min-h-[44px] w-full shrink-0 items-center justify-end sm:w-auto sm:min-h-0">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={
                          settings.notifications[item.key as keyof typeof settings.notifications]
                        }
                        aria-label={item.label}
                        onClick={() => onToggleNotification(item.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onToggleNotification(item.key)
                          }
                        }}
                        className={settingsSwitchClass(
                          settings.notifications[item.key as keyof typeof settings.notifications],
                        )}
                        tabIndex={0}
                      >
                        <span
                          className={settingsSwitchThumbClass(
                            settings.notifications[item.key as keyof typeof settings.notifications],
                          )}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifiche SMS */}
            <Card variant="default" className="relative !p-0">
              <CardHeader>
                <CardTitle size="md">Notifiche SMS</CardTitle>
                <CardDescription>
                  Notifiche via SMS (potrebbero essere applicate tariffe)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-text-primary font-medium">Conferma appuntamenti</p>
                    <p className="text-text-secondary text-sm">
                      Invia SMS di conferma per gli appuntamenti
                    </p>
                  </div>
                  <div className="flex min-h-[44px] w-full shrink-0 items-center justify-end sm:w-auto sm:min-h-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.notifications.sms_conferma_appuntamenti}
                      aria-label="Conferma appuntamenti via SMS"
                      onClick={() => onToggleNotification('sms_conferma_appuntamenti')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onToggleNotification('sms_conferma_appuntamenti')
                        }
                      }}
                      className={settingsSwitchClass(
                        settings.notifications.sms_conferma_appuntamenti,
                      )}
                      tabIndex={0}
                    >
                      <span
                        className={settingsSwitchThumbClass(
                          settings.notifications.sms_conferma_appuntamenti,
                        )}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-tab: Privacy */}
        <TabsContent value="privacy">
          <Card variant="default" className="relative !p-0">
            <CardHeader>
              <CardTitle size="md">Impostazioni Privacy</CardTitle>
              <CardDescription>Controlla chi può vedere le tue informazioni</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  key: 'profilo_pubblico',
                  label: 'Profilo pubblico',
                  description: 'Il tuo profilo è visibile ad altri utenti',
                },
                {
                  key: 'mostra_email',
                  label: 'Mostra email',
                  description: copy.privacyEmail,
                },
                {
                  key: 'mostra_telefono',
                  label: 'Mostra telefono',
                  description: copy.privacyPhone,
                },
                {
                  key: 'condividi_statistiche',
                  label: 'Condividi statistiche',
                  description: copy.privacyStats,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-text-primary font-medium">{item.label}</p>
                    <p className="text-text-secondary text-sm">{item.description}</p>
                  </div>
                  <div className="flex min-h-[44px] w-full shrink-0 items-center justify-end sm:w-auto sm:min-h-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.privacy[item.key as keyof typeof settings.privacy]}
                      aria-label={item.label}
                      onClick={() => onTogglePrivacy(item.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onTogglePrivacy(item.key)
                        }
                      }}
                      className={settingsSwitchClass(
                        settings.privacy[item.key as keyof typeof settings.privacy],
                      )}
                      tabIndex={0}
                    >
                      <span
                        className={settingsSwitchThumbClass(
                          settings.privacy[item.key as keyof typeof settings.privacy],
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modali */}
      {openChangePassword && (
        <Suspense fallback={<LoadingState message="Caricamento..." />}>
          <ChangePasswordModal open={openChangePassword} onOpenChange={setOpenChangePassword} />
        </Suspense>
      )}
      {openTwoFactor && (
        <Suspense fallback={<LoadingState message="Caricamento..." />}>
          <TwoFactorSetup open={openTwoFactor} onOpenChange={setOpenTwoFactor} />
        </Suspense>
      )}
    </div>
  )
}
