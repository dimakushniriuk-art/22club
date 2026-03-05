// ============================================================
// Componente Tab Notifiche Impostazioni (FASE C - Split File Lunghi)
// ============================================================
// Estratto da impostazioni/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { Button } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Label } from '@/components/ui'
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  RefreshCw,
  UserPlus,
  CreditCard,
  Calendar,
  MessageSquare,
} from 'lucide-react'

interface SettingsNotificationsTabProps {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    newClients: boolean
    payments: boolean
    appointments: boolean
    messages: boolean
  }
  loading: boolean
  onNotificationChange: (field: string, value: boolean) => void
  onNotificationsChange?: (updates: Partial<SettingsNotificationsTabProps['notifications']>) => void
  onSave: () => void
}

export function SettingsNotificationsTab({
  notifications,
  loading,
  onNotificationChange,
  onNotificationsChange,
  onSave,
}: SettingsNotificationsTabProps) {
  // Calcola se tutte le notifiche sono abilitate
  const allNotificationsEnabled =
    notifications.email &&
    notifications.push &&
    notifications.sms &&
    notifications.newClients &&
    notifications.payments &&
    notifications.appointments &&
    notifications.messages

  // Toggle tutte le notifiche
  const toggleAllNotifications = (enabled: boolean) => {
    if (onNotificationsChange) {
      // Usa la funzione batch se disponibile
      onNotificationsChange({
        email: enabled,
        push: enabled,
        sms: enabled,
        newClients: enabled,
        payments: enabled,
        appointments: enabled,
        messages: enabled,
      })
    } else {
      // Fallback: aggiorna uno alla volta
      onNotificationChange('email', enabled)
      onNotificationChange('push', enabled)
      onNotificationChange('sms', enabled)
      onNotificationChange('newClients', enabled)
      onNotificationChange('payments', enabled)
      onNotificationChange('appointments', enabled)
      onNotificationChange('messages', enabled)
    }
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
              <Bell className="h-5 w-5 text-teal-400 shrink-0" />
              Preferenze Notifiche
            </CardTitle>
            <CardDescription className="text-text-secondary mt-1.5">
              Scegli come e quando ricevere le notifiche
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Label
              htmlFor="toggle-all-notifications"
              className="text-text-secondary text-sm font-medium"
            >
              {allNotificationsEnabled ? 'Disabilita Tutte' : 'Abilita Tutte'}
            </Label>
            <div className="w-[44px] flex justify-end shrink-0">
              <Switch
                id="toggle-all-notifications"
                checked={allNotificationsEnabled}
                onCheckedChange={toggleAllNotifications}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative pt-0">
        {/* Canali notifiche */}
        <div className="space-y-3">
          <h3 className="text-text-primary font-semibold text-base mb-1">Canali di Notifica</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="notif-email" className="text-text-primary font-medium text-sm">
                    Email
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">Ricevi notifiche via email</p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-email"
                  checked={notifications.email}
                  onCheckedChange={(checked) => onNotificationChange('email', checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="notif-push" className="text-text-primary font-medium text-sm">
                    Push Notifications
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Ricevi notifiche sul dispositivo
                  </p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-push"
                  checked={notifications.push}
                  onCheckedChange={(checked) => onNotificationChange('push', checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="notif-sms" className="text-text-primary font-medium text-sm">
                    SMS
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">Ricevi notifiche via SMS</p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-sms"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => onNotificationChange('sms', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Separatore */}
        <div className="h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

        {/* Tipi di notifiche */}
        <div className="space-y-3">
          <h3 className="text-text-primary font-semibold text-base mb-1">Tipi di Notifiche</h3>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label
                    htmlFor="notif-new-clients"
                    className="text-text-primary font-medium text-sm"
                  >
                    Nuovi Clienti
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Notifiche quando un nuovo cliente si iscrive
                  </p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-new-clients"
                  checked={notifications.newClients}
                  onCheckedChange={(checked) => onNotificationChange('newClients', checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="notif-payments" className="text-text-primary font-medium text-sm">
                    Pagamenti
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Notifiche su nuovi pagamenti e fatture
                  </p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-payments"
                  checked={notifications.payments}
                  onCheckedChange={(checked) => onNotificationChange('payments', checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label
                    htmlFor="notif-appointments"
                    className="text-text-primary font-medium text-sm"
                  >
                    Appuntamenti
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Notifiche su appuntamenti e modifiche
                  </p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-appointments"
                  checked={notifications.appointments}
                  onCheckedChange={(checked) => onNotificationChange('appointments', checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-background-tertiary/30 border border-teal-500/10 hover:border-teal-500/20 transition-all duration-200 gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-teal-500/20 text-teal-400 rounded-full p-2 shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="notif-messages" className="text-text-primary font-medium text-sm">
                    Messaggi
                  </Label>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Notifiche quando ricevi nuovi messaggi
                  </p>
                </div>
              </div>
              <div className="w-[44px] flex justify-end shrink-0">
                <Switch
                  id="notif-messages"
                  checked={notifications.messages}
                  onCheckedChange={(checked) => onNotificationChange('messages', checked)}
                />
              </div>
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
