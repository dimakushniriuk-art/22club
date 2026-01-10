// ============================================================
// Componente Tab Privacy Impostazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da impostazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Button } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Label } from '@/components/ui'
import { Shield, Save, RefreshCw } from 'lucide-react'

interface SettingsPrivacyTabProps {
  privacy: {
    profileVisible: boolean
    showEmail: boolean
    showPhone: boolean
    analytics: boolean
  }
  loading: boolean
  onPrivacyChange: (field: string, value: boolean) => void
  onSave: () => void
}

export function SettingsPrivacyTab({
  privacy,
  loading,
  onPrivacyChange,
  onSave,
}: SettingsPrivacyTabProps) {
  // Calcola se tutte le impostazioni privacy sono abilitate
  const allPrivacyEnabled =
    privacy.profileVisible && privacy.showEmail && privacy.showPhone && privacy.analytics

  // Toggle tutte le impostazioni privacy
  const toggleAllPrivacy = (enabled: boolean) => {
    onPrivacyChange('profileVisible', enabled)
    onPrivacyChange('showEmail', enabled)
    onPrivacyChange('showPhone', enabled)
    onPrivacyChange('analytics', enabled)
  }

  return (
    <Card
      variant="trainer"
      className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2.5 text-xl">
              <Shield className="h-5 w-5 text-teal-400 shrink-0" />
              Privacy e Sicurezza
            </CardTitle>
            <CardDescription className="text-text-secondary mt-1.5">
              Controlla chi può vedere le tue informazioni
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Label htmlFor="toggle-all-privacy" className="text-text-secondary text-sm font-medium">
              {allPrivacyEnabled ? 'Disabilita Tutte' : 'Abilita Tutte'}
            </Label>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="toggle-all-privacy"
                checked={allPrivacyEnabled}
                onCheckedChange={toggleAllPrivacy}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="profile-visible" className="text-text-primary font-medium text-sm">
                Profilo Pubblico
              </Label>
              <p className="text-text-secondary text-xs mt-0.5">
                Rendere il tuo profilo visibile ad altri utenti
              </p>
            </div>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="profile-visible"
                checked={privacy.profileVisible}
                onCheckedChange={(checked) => onPrivacyChange('profileVisible', checked)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="show-email" className="text-text-primary font-medium text-sm">
                Mostra Email
              </Label>
              <p className="text-text-secondary text-xs mt-0.5">
                Mostra email nel profilo pubblico
              </p>
            </div>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="show-email"
                checked={privacy.showEmail}
                onCheckedChange={(checked) => onPrivacyChange('showEmail', checked)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="show-phone" className="text-text-primary font-medium text-sm">
                Mostra Telefono
              </Label>
              <p className="text-text-secondary text-xs mt-0.5">
                Mostra telefono nel profilo pubblico
              </p>
            </div>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="show-phone"
                checked={privacy.showPhone}
                onCheckedChange={(checked) => onPrivacyChange('showPhone', checked)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
            <div className="min-w-0 flex-1">
              <Label htmlFor="analytics" className="text-text-primary font-medium text-sm">
                Condividi Analytics
              </Label>
              <p className="text-text-secondary text-xs mt-0.5">
                Permetti l&apos;uso di dati anonimi per migliorare il servizio
              </p>
            </div>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="analytics"
                checked={privacy.analytics}
                onCheckedChange={(checked) => onPrivacyChange('analytics', checked)}
              />
            </div>
          </div>
        </div>

        {/* Salva */}
        <div className="flex justify-end pt-4 border-t border-teal-500/10">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 min-w-[180px]"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva Impostazioni
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
