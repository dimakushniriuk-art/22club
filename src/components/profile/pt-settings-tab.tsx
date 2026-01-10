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
import { Badge } from '@/components/ui'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { LoadingState } from '@/components/dashboard/loading-state'
import { usePush } from '@/hooks/use-push'
import { Mail, Phone, MapPin, User, Bell, Shield, Palette, Save, Check } from 'lucide-react'

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
  appearance: {
    theme: 'dark' | 'light'
    accent_color: string
    sidebar_collapsed: boolean
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
  onUpdateAppearance: (field: string, value: unknown) => void
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
  onUpdateAppearance,
}: PTSettingsTabProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('profilo')
  const [openChangePassword, setOpenChangePassword] = useState(false)
  const [openTwoFactor, setOpenTwoFactor] = useState(false)
  const { subscribe, unsubscribe } = usePush()

  return (
    <div className="space-y-6">
      {/* Header Impostazioni */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
      >
        <CardContent className="p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Impostazioni</h2>
                <p className="text-gray-400">Gestisci il tuo account e le preferenze</p>
              </div>
            </div>
            <Button
              onClick={onSave}
              disabled={isSavingSettings}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200"
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
          <TabsTrigger value="aspetto" variant="pills">
            <Palette className="mr-2 h-4 w-4" />
            Aspetto
          </TabsTrigger>
        </TabsList>

        {/* Sub-tab: Profilo */}
        <TabsContent value="profilo">
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
          >
            <CardHeader className="relative">
              <CardTitle size="md">Informazioni Personali</CardTitle>
              <CardDescription>
                Aggiorna le tue informazioni di contatto e biografia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="bg-blue-500/20 text-blue-400 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold">
                  {settings.profile.nome.charAt(0)}
                  {settings.profile.cognome.charAt(0)}
                </div>
                <div className="space-y-2">
                  <AvatarUploader
                    userId={authUserId || null}
                    onUploaded={(url) => onUpdateProfile('avatar', url)}
                  />
                  <p className="text-text-tertiary mt-2 text-xs">JPG, PNG o GIF. Max 25MB.</p>
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

          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-purple-500/30 shadow-lg shadow-purple-500/10 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-violet-500/5" />
            <CardHeader className="relative">
              <CardTitle size="md">Sicurezza</CardTitle>
              <CardDescription>Gestisci password e sicurezza account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Password</p>
                  <p className="text-text-secondary text-sm">Ultima modifica: 30 giorni fa</p>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
                  onClick={() => setOpenChangePassword(true)}
                >
                  Cambia password
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">Autenticazione a due fattori</p>
                  <p className="text-text-secondary text-sm">Proteggi il tuo account con 2FA</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Non attiva</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
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
            <Card
              variant="trainer"
              className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-green-500/30 shadow-lg shadow-green-500/10 backdrop-blur-xl hover:border-green-400/50 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5" />
              <CardHeader className="relative">
                <CardTitle size="md">Notifiche Email</CardTitle>
                <CardDescription>Scegli quali notifiche ricevere via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {[
                  {
                    key: 'email_nuovi_clienti',
                    label: 'Nuovi clienti',
                    description: 'Ricevi una notifica quando un nuovo atleta si iscrive',
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
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-text-primary font-medium">{item.label}</p>
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    </div>
                    <button
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
                      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'bg-brand'
                          : 'bg-background-tertiary'
                      }`}
                      tabIndex={0}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.notifications[item.key as keyof typeof settings.notifications]
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifiche Push */}
            <Card
              variant="trainer"
              className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-blue-500/30 shadow-lg shadow-blue-500/10 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-200"
            >
              <CardHeader className="relative">
                <CardTitle size="md">Notifiche Push</CardTitle>
                <CardDescription>Notifiche in tempo reale sul tuo dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Abilita notifiche push</p>
                    <p className="text-text-secondary text-sm">Richiede permesso del browser</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
                      onClick={() => void subscribe()}
                    >
                      Abilita Push
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500/30 text-white hover:bg-blue-500/10 hover:border-blue-500/50 transition-all duration-200"
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
                    description: 'Avvisa quando i documenti degli atleti stanno per scadere',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-text-primary font-medium">{item.label}</p>
                      <p className="text-text-secondary text-sm">{item.description}</p>
                    </div>
                    <button
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
                      className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        settings.notifications[item.key as keyof typeof settings.notifications]
                          ? 'bg-brand'
                          : 'bg-background-tertiary'
                      }`}
                      tabIndex={0}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          settings.notifications[item.key as keyof typeof settings.notifications]
                            ? 'translate-x-6'
                            : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifiche SMS */}
            <Card
              variant="trainer"
              className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-yellow-500/30 shadow-lg shadow-yellow-500/10 backdrop-blur-xl hover:border-yellow-400/50 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5" />
              <CardHeader className="relative">
                <CardTitle size="md">Notifiche SMS</CardTitle>
                <CardDescription>
                  Notifiche via SMS (potrebbero essere applicate tariffe)
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary font-medium">Conferma appuntamenti</p>
                    <p className="text-text-secondary text-sm">
                      Invia SMS di conferma per gli appuntamenti
                    </p>
                  </div>
                  <button
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
                    className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      settings.notifications.sms_conferma_appuntamenti
                        ? 'bg-brand'
                        : 'bg-background-tertiary'
                    }`}
                    tabIndex={0}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.notifications.sms_conferma_appuntamenti
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sub-tab: Privacy */}
        <TabsContent value="privacy">
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-red-500/30 shadow-lg shadow-red-500/10 backdrop-blur-xl hover:border-red-400/50 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5" />
            <CardHeader className="relative">
              <CardTitle size="md">Impostazioni Privacy</CardTitle>
              <CardDescription>Controlla chi può vedere le tue informazioni</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              {[
                {
                  key: 'profilo_pubblico',
                  label: 'Profilo pubblico',
                  description: 'Il tuo profilo è visibile ad altri utenti',
                },
                {
                  key: 'mostra_email',
                  label: 'Mostra email',
                  description: 'Gli atleti possono vedere il tuo indirizzo email',
                },
                {
                  key: 'mostra_telefono',
                  label: 'Mostra telefono',
                  description: 'Gli atleti possono vedere il tuo numero di telefono',
                },
                {
                  key: 'condividi_statistiche',
                  label: 'Condividi statistiche',
                  description: 'Permetti agli atleti di vedere le statistiche generali',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-text-primary font-medium">{item.label}</p>
                    <p className="text-text-secondary text-sm">{item.description}</p>
                  </div>
                  <button
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
                    className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      settings.privacy[item.key as keyof typeof settings.privacy]
                        ? 'bg-brand'
                        : 'bg-background-tertiary'
                    }`}
                    tabIndex={0}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        settings.privacy[item.key as keyof typeof settings.privacy]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sub-tab: Aspetto */}
        <TabsContent value="aspetto">
          <Card
            variant="trainer"
            className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-indigo-500/30 shadow-lg shadow-indigo-500/10 backdrop-blur-xl hover:border-indigo-400/50 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
            <CardHeader className="relative">
              <CardTitle size="md">Personalizzazione Interfaccia</CardTitle>
              <CardDescription>Personalizza l&apos;aspetto dell&apos;applicazione</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div>
                <p className="text-text-primary mb-3 font-medium">Tema</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`border-2 p-4 rounded-lg transition-all ${
                      settings.appearance.theme === 'dark'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-background-secondary'
                    } hover:shadow-md hover:-translate-y-0.5 duration-200`}
                    onClick={() => onUpdateAppearance('theme', 'dark')}
                  >
                    <div className="bg-background mb-3 h-24 rounded border border-border" />
                    <p className="text-text-primary font-medium">Scuro</p>
                    {settings.appearance.theme === 'dark' && (
                      <Badge variant="primary" size="sm" className="mt-2">
                        Attivo
                      </Badge>
                    )}
                  </button>
                  <button
                    className={`border-2 p-4 rounded-lg transition-all ${
                      settings.appearance.theme === 'light'
                        ? 'border-brand bg-brand/10'
                        : 'border-border bg-background-secondary'
                    } hover:shadow-md hover:-translate-y-0.5 duration-200`}
                    onClick={() => onUpdateAppearance('theme', 'light')}
                  >
                    <div className="bg-white mb-3 h-24 rounded border border-gray-300" />
                    <p className="text-text-primary font-medium">Chiaro</p>
                    <Badge variant="primary" size="sm" className="mt-2 opacity-50">
                      Prossimamente
                    </Badge>
                  </button>
                </div>
              </div>

              <div>
                <p className="text-text-primary mb-3 font-medium">Colore Accent</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { key: 'brand', color: 'bg-brand', label: 'Teal' },
                    { key: 'blue', color: 'bg-state-info', label: 'Blu' },
                    { key: 'green', color: 'bg-state-valid', label: 'Verde' },
                    { key: 'orange', color: 'bg-state-warn', label: 'Arancio' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      className={`border-2 p-4 rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                        settings.appearance.accent_color === item.key
                          ? 'border-brand'
                          : 'border-border'
                      }`}
                      onClick={() => onUpdateAppearance('accent_color', item.key)}
                    >
                      <div className={`${item.color} mb-2 h-12 rounded`} />
                      <p className="text-text-secondary text-sm">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>
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
