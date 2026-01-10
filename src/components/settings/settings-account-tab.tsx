// ============================================================
// Componente Tab Account Impostazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da impostazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Select,
  Label,
  Input,
  Switch,
} from '@/components/ui'
import { Globe, Save, RefreshCw, Lock, Eye, EyeOff, Shield } from 'lucide-react'
import { TwoFactorSetup } from './two-factor-setup'

interface SettingsAccountTabProps {
  account: {
    language: string
    timezone: string
    dateFormat: string
    timeFormat: string
  }
  loading: boolean
  passwords: {
    current: string
    new: string
    confirm: string
  }
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  twoFactorEnabled?: boolean
  onAccountChange: (field: string, value: string) => void
  onPasswordChange: (field: string, value: string) => void
  onTogglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void
  onSave: () => void
  onChangePassword: () => void
  onTwoFactorSetup?: () => void
  onDisableTwoFactor?: () => Promise<void>
}

export function SettingsAccountTab({
  account,
  loading,
  passwords,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  twoFactorEnabled = false,
  onAccountChange,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSave,
  onChangePassword,
  onTwoFactorSetup,
  onDisableTwoFactor,
}: SettingsAccountTabProps) {
  const [show2FADrawer, setShow2FADrawer] = React.useState(false)

  return (
    <div className="space-y-6">
      {/* Lingua e Regione */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Globe className="h-5 w-5 text-teal-400 shrink-0" />
            Lingua e Regione
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Personalizza lingua e fuso orario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="space-y-2">
            <Label htmlFor="language" className="text-text-primary font-medium text-sm">
              Lingua
            </Label>
            <Select
              id="language"
              value={account.language}
              onValueChange={(value) => onAccountChange('language', value)}
              className="w-full"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-text-primary font-medium text-sm">
              Fuso Orario
            </Label>
            <Select
              id="timezone"
              value={account.timezone}
              onValueChange={(value) => onAccountChange('timezone', value)}
              className="w-full"
            >
              <option value="Europe/Rome">Europa/Roma (GMT+1)</option>
              <option value="Europe/London">Europa/Londra (GMT+0)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Formato Data e Ora */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Globe className="h-5 w-5 text-teal-400 shrink-0" />
            Formato Data e Ora
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Personalizza come vengono visualizzate date e ore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="space-y-2">
            <Label htmlFor="date-format" className="text-text-primary font-medium text-sm">
              Formato Data
            </Label>
            <Select
              id="date-format"
              value={account.dateFormat}
              onValueChange={(value) => onAccountChange('dateFormat', value)}
              className="w-full"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time-format" className="text-text-primary font-medium text-sm">
              Formato Ora
            </Label>
            <Select
              id="time-format"
              value={account.timeFormat}
              onValueChange={(value) => onAccountChange('timeFormat', value)}
              className="w-full"
            >
              <option value="24h">24 ore</option>
              <option value="12h">12 ore (AM/PM)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Salva */}
      <div className="flex justify-end pt-2">
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

      {/* Cambio Password */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Lock className="h-5 w-5 text-teal-400 shrink-0" />
            Cambia Password
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Aggiorna la tua password per mantenere l&apos;account sicuro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-text-primary font-medium">
              Password Attuale
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => onPasswordChange('current', e.target.value)}
                placeholder="Inserisci password attuale"
                className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => onTogglePasswordVisibility('current')}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-text-primary font-medium">
              Nuova Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => onPasswordChange('new', e.target.value)}
                placeholder="Inserisci nuova password (min. 8 caratteri)"
                className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => onTogglePasswordVisibility('new')}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-text-primary font-medium">
              Conferma Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => onPasswordChange('confirm', e.target.value)}
                placeholder="Conferma nuova password"
                className="bg-background-secondary/50 border-teal-500/30 focus:border-teal-500/50"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => onTogglePasswordVisibility('confirm')}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-teal-500/10">
            <Button
              onClick={onChangePassword}
              disabled={loading || !passwords.new || !passwords.confirm}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transition-all duration-200 min-w-[160px]"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Aggiornamento...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Cambia Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Autenticazione a Due Fattori (2FA) */}
      <Card
        variant="trainer"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/20 shadow-lg shadow-teal-500/10 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative pb-4">
          <CardTitle className="flex items-center gap-2.5 text-xl">
            <Shield className="h-5 w-5 text-teal-400 shrink-0" />
            Autenticazione a Due Fattori (2FA)
          </CardTitle>
          <CardDescription className="text-text-secondary mt-1.5">
            Aggiungi un livello extra di sicurezza al tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative pt-0">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
            <div className="flex-1 min-w-0">
              <Label
                htmlFor="2fa-enabled"
                className="text-text-primary font-medium text-sm cursor-pointer"
              >
                Autenticazione a Due Fattori
              </Label>
              <p className="text-text-secondary text-xs mt-0.5">
                {twoFactorEnabled
                  ? '2FA è attualmente abilitato. Il tuo account è protetto.'
                  : 'Abilita 2FA per proteggere il tuo account con un codice temporaneo.'}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Switch
                id="2fa-enabled"
                checked={twoFactorEnabled}
                onCheckedChange={(checked) => {
                  if (checked && onTwoFactorSetup) {
                    setShow2FADrawer(true)
                    onTwoFactorSetup()
                  } else if (!checked && onDisableTwoFactor) {
                    onDisableTwoFactor()
                  }
                }}
                disabled={loading}
              />
            </div>
          </div>
          {twoFactorEnabled && (
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <p className="text-text-secondary text-sm">
                ✅ 2FA attivo. Usa un&apos;app autenticatore (Google Authenticator, Authy, ecc.) per
                generare codici di accesso.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drawer 2FA Setup */}
      {onTwoFactorSetup && <TwoFactorSetup open={show2FADrawer} onOpenChange={setShow2FADrawer} />}
    </div>
  )
}
