// ============================================================
// Componente Tab Profilo Impostazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da impostazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar'
import { AvatarUploader } from '@/components/settings/avatar-uploader'
import { UserCircle, Save, RefreshCw } from 'lucide-react'

interface SettingsProfileTabProps {
  profile: {
    id: string
    nome: string
    cognome: string
    email: string
    phone: string
    avatar: string | null
    avatar_url: string | null
  }
  profileLoading: boolean
  loading: boolean
  onProfileChange: (field: string, value: string) => void
  onSaveProfile: () => void
}

export function SettingsProfileTab({
  profile,
  profileLoading,
  loading,
  onProfileChange,
  onSaveProfile,
}: SettingsProfileTabProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.5)] p-4 sm:p-5 transition-all duration-200">
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-2.5 text-xl">
          <UserCircle className="h-5 w-5 text-primary shrink-0" />
          Profilo Utente
        </CardTitle>
        <CardDescription className="text-text-secondary mt-1.5">
          Modifica le tue informazioni personali e il tuo profilo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative pt-0">
        {profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-2">
              <Avatar
                src={profile.avatar_url || profile.avatar || undefined}
                alt={`${profile.nome} ${profile.cognome}`}
                fallbackText={`${profile.nome?.[0] || ''}${profile.cognome?.[0] || ''}`}
                size="xl"
                className="ring-2 ring-white/10 shrink-0"
              />
              <div className="flex-1 space-y-2 min-w-0">
                <AvatarUploader
                  userId={profile.id || null}
                  onUploaded={(url) => {
                    onProfileChange('avatar_url', url)
                    onProfileChange('avatar', url)
                  }}
                />
                <p className="text-text-tertiary text-xs">JPG, PNG o GIF. Max 25MB.</p>
              </div>
            </div>

            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nome"
                value={profile.nome}
                onChange={(e) => onProfileChange('nome', e.target.value)}
                placeholder="Mario"
                className="w-full"
              />
              <Input
                label="Cognome"
                value={profile.cognome}
                onChange={(e) => onProfileChange('cognome', e.target.value)}
                placeholder="Rossi"
                className="w-full"
              />
            </div>

            {/* Email e Telefono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => onProfileChange('email', e.target.value)}
                placeholder="email@esempio.it"
                className="w-full"
              />
              <Input
                label="Telefono"
                type="tel"
                value={profile.phone}
                onChange={(e) => onProfileChange('phone', e.target.value)}
                placeholder="+39 333 1234567"
                className="w-full"
              />
            </div>

            {/* Salva Profilo */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <Button onClick={onSaveProfile} disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva Profilo
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </div>
  )
}
