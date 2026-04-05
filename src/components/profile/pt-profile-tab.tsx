// ============================================================
// Componente Tab Profilo PT (FASE C - Split File Lunghi)
// ============================================================
// Estratto da profilo/page.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Avatar, useAvatarInitials } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Progress } from '@/components/ui'
import {
  Edit,
  Briefcase,
  Mail,
  Phone,
  Target,
  Award,
  Users,
  Save,
  X,
  Shield,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** Accenti (titoli, bottoni, avatar): le superfici usano Card default zinc come Abbonamenti / liste. */
const THEME = {
  teal: {
    title: 'from-teal-400 to-cyan-400',
    badge: 'shadow-teal-500/30',
    btn: 'border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50',
    ring: 'ring-teal-500/30',
    iconMuted: 'text-teal-400/90',
  },
  amber: {
    title: 'from-amber-400 to-orange-400',
    badge: 'shadow-amber-500/30',
    btn: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50',
    ring: 'ring-amber-500/30',
    iconMuted: 'text-amber-400/90',
  },
} as const

const PANEL_INSET_CLASS =
  'rounded-lg border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'

interface PTProfileTabProps {
  profile: {
    nome: string
    cognome: string
    email: string
    phone: string
    data_nascita: string
    data_iscrizione: string
    specializzazione: string
    certificazioni: string
    avatar: string | null
    stats: {
      clienti_attivi: number
      sessioni_mese: number
      anni_esperienza: number
      valutazione_media: number
      certificazioni_conseguite: number
      revenue_mensile: number
    }
    badge: Array<{ id: string; name: string; icon: string; unlocked: boolean }>
  }
  isEditing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onProfileChange: (field: string, value: string) => void
  isSaving?: boolean
  onViewStats?: () => void
  onViewSettings?: () => void
  onLogout?: () => void
  /** Etichetta ruolo (es. "Personal Trainer", "Massaggiatore"). Default: "Personal Trainer" */
  roleLabel?: string
  /** Tema colori: teal (PT / massaggiatore allineato), amber opzionale */
  theme?: 'teal' | 'amber'
  /** Label stat “sessioni” nel riquadro rapido (es. Trattamenti mese per massaggiatore). */
  sessioniMeseLabel?: string
}

export function PTProfileTab({
  profile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onProfileChange,
  isSaving = false,
  onViewStats,
  onViewSettings,
  onLogout,
  roleLabel = 'Personal Trainer',
  theme: themeKey = 'teal',
  sessioniMeseLabel = 'Sessioni/mese',
}: PTProfileTabProps) {
  const avatarInitials = useAvatarInitials(profile.nome || '', profile.cognome || '')
  const t = THEME[themeKey]

  const displayName = `${profile.nome} ${profile.cognome}`.trim()
  const roleNorm = roleLabel.trim().toLowerCase()
  const nomeNorm = profile.nome.trim().toLowerCase()
  const showRoleSubline =
    displayName.length > 0 &&
    roleNorm.length > 0 &&
    roleNorm !== displayName.toLowerCase() &&
    roleNorm !== nomeNorm

  const quickStatValueClass =
    themeKey === 'teal'
      ? 'bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent'

  return (
    <div className="space-y-6">
      {/* Header con avatar */}
      <Card variant="default" className="relative overflow-hidden p-6">
        <CardContent className="p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.avatar}
                alt={`${profile.nome} ${profile.cognome}`}
                fallbackText={avatarInitials}
                size="xl"
                className={`shadow-lg ring-2 ${t.ring}`}
              />
              <div>
                <h2
                  className={`text-text-primary text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
                >
                  {displayName || roleLabel}
                </h2>
                {showRoleSubline ? (
                  <p className="text-text-secondary flex items-center gap-2">
                    <Briefcase className="h-4 w-4 shrink-0" />
                    {roleLabel}
                  </p>
                ) : null}
                <Badge variant="primary" size="sm" className={`mt-1 shadow-lg ${t.badge}`}>
                  Attivo da{' '}
                  {new Date(profile.data_iscrizione).toLocaleDateString('it-IT', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </Badge>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                size="icon"
                onClick={onEdit}
                className={`${t.btn} transition-all duration-200`}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiche rapide (Card zinc come KPI Abbonamenti) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card variant="default" className="text-center">
          <CardContent className="p-0 pt-0">
            <div className={cn('mb-1 text-2xl font-bold tabular-nums', quickStatValueClass)}>
              {profile.stats.clienti_attivi}
            </div>
            <div className="text-text-secondary text-xs">Clienti Attivi</div>
          </CardContent>
        </Card>
        <Card variant="default" className="text-center">
          <CardContent className="p-0 pt-0">
            <div className={cn('mb-1 text-2xl font-bold tabular-nums', quickStatValueClass)}>
              {profile.stats.sessioni_mese}
            </div>
            <div className="text-text-secondary text-xs">{sessioniMeseLabel}</div>
          </CardContent>
        </Card>
        <Card variant="default" className="text-center">
          <CardContent className="p-0 pt-0">
            <div className={cn('mb-1 text-2xl font-bold tabular-nums', quickStatValueClass)}>
              {profile.stats.anni_esperienza}
            </div>
            <div className="text-text-secondary text-xs">Anni Esperienza</div>
          </CardContent>
        </Card>
      </div>

      {/* Informazioni personali */}
      <Card variant="default" className="relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle
              size="md"
              className={`bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
            >
              Informazioni Professionali
            </CardTitle>
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <X className="mr-1 h-4 w-4" />
                  Annulla
                </Button>
                <Button variant="primary" size="sm" onClick={onSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-4 w-4" />
                      Salva
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={profile.nome}
                  onChange={(e) => onProfileChange('nome', e.target.value)}
                />
                <Input
                  label="Cognome"
                  value={profile.cognome}
                  onChange={(e) => onProfileChange('cognome', e.target.value)}
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => onProfileChange('email', e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
              />
              <Input
                label="Telefono"
                type="tel"
                value={profile.phone}
                onChange={(e) => onProfileChange('phone', e.target.value)}
                leftIcon={<Phone className="h-4 w-4" />}
              />
              <Input
                label="Specializzazione"
                value={profile.specializzazione}
                onChange={(e) => onProfileChange('specializzazione', e.target.value)}
                leftIcon={<Target className="h-4 w-4" />}
              />
              <Input
                label="Certificazioni"
                value={profile.certificazioni}
                onChange={(e) => onProfileChange('certificazioni', e.target.value)}
                leftIcon={<Award className="h-4 w-4" />}
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Mail className="text-text-tertiary h-5 w-5" />
                <div>
                  <p className="text-text-secondary text-sm">Email</p>
                  <p className="text-text-primary font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-text-tertiary h-5 w-5" />
                <div>
                  <p className="text-text-secondary text-sm">Telefono</p>
                  <p className="text-text-primary font-medium">{profile.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="text-text-tertiary h-5 w-5" />
                <div>
                  <p className="text-text-secondary text-sm">Specializzazione</p>
                  <p className="text-text-primary font-medium">{profile.specializzazione}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="text-text-tertiary h-5 w-5" />
                <div>
                  <p className="text-text-secondary text-sm">Certificazioni</p>
                  <p className="text-text-primary font-medium">{profile.certificazioni}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* KPI Performance */}
      <Card variant="default" className="relative overflow-hidden">
        <CardHeader>
          <CardTitle
            size="md"
            className={`bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
          >
            <Users className={cn('mr-2 inline h-5 w-5', t.iconMuted)} />
            Performance Professionale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-text-secondary text-sm">Anni di Esperienza</p>
              <p
                className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
              >
                {profile.stats.anni_esperienza}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-sm">Revenue Mensile</p>
              <p
                className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
              >
                €{profile.stats.revenue_mensile.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={cn('space-y-2 p-3', PANEL_INSET_CLASS)}>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Soddisfazione Clienti</span>
              <span
                className={`text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
              >
                {profile.stats.valutazione_media}/5.0 ⭐
              </span>
            </div>
            <Progress value={(profile.stats.valutazione_media / 5) * 100} className="h-3" />
            <div className="flex items-center gap-2">
              <Users className="text-state-valid h-4 w-4" />
              <span className="text-text-secondary text-sm">
                {profile.stats.clienti_attivi} clienti attivi •{' '}
                {profile.stats.certificazioni_conseguite} certificazioni
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge */}
      <Card variant="default" className="relative overflow-hidden">
        <CardHeader>
          <CardTitle
            size="md"
            className={`bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
          >
            <Award className={cn('mr-2 inline h-5 w-5', t.iconMuted)} />
            Badge e Riconoscimenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {profile.badge.map((badge) => (
              <div
                key={badge.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border border-white/10 transition-colors duration-200',
                  badge.unlocked
                    ? 'bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-white/15'
                    : 'bg-background-tertiary/40 border-white/[0.06] opacity-60',
                )}
              >
                <div className="text-2xl">{badge.icon}</div>
                <div>
                  <p
                    className={`font-medium ${badge.unlocked ? 'text-text-primary' : 'text-text-tertiary'}`}
                  >
                    {badge.name}
                  </p>
                  <Badge
                    variant={badge.unlocked ? 'primary' : 'secondary'}
                    size="sm"
                    className="mt-1"
                  >
                    {badge.unlocked ? 'Sbloccato' : 'Bloccato'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Azioni rapide */}
      <Card variant="default" className="relative overflow-hidden">
        <CardHeader>
          <CardTitle
            size="md"
            className={`bg-gradient-to-r bg-clip-text text-transparent ${t.title}`}
          >
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {onViewStats && (
              <Button
                variant="outline"
                onClick={onViewStats}
                className={`${t.btn} transition-all duration-200`}
              >
                <Target className="mr-2 h-4 w-4" />
                Statistiche
              </Button>
            )}
            {onViewSettings && (
              <Button
                variant="outline"
                onClick={onViewSettings}
                className={`${t.btn} transition-all duration-200`}
              >
                <Shield className="mr-2 h-4 w-4" />
                Impostazioni
              </Button>
            )}
            {onLogout && (
              <Button
                variant="destructive"
                onClick={onLogout}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-200"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
