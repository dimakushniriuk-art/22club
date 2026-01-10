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
}: PTProfileTabProps) {
  const avatarInitials = useAvatarInitials(profile.nome || '', profile.cognome || '')

  return (
    <div className="space-y-6">
      {/* Header con avatar */}
      <Card
        variant="default"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={profile.avatar}
                alt={`${profile.nome} ${profile.cognome}`}
                fallbackText={avatarInitials}
                size="xl"
                className="shadow-lg ring-2 ring-teal-500/30"
              />
              <div>
                <h2 className="text-text-primary text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  {profile.nome} {profile.cognome}
                </h2>
                <p className="text-text-secondary flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Personal Trainer
                </p>
                <Badge variant="primary" size="sm" className="mt-1 shadow-lg shadow-teal-500/30">
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
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistiche rapide */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          variant="default"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background-tertiary border-teal-500/30 shadow-lg hover:shadow-teal-500/20 hover:border-teal-400/50 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-4 text-center relative">
            <div className="text-brand mb-1 text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {profile.stats.clienti_attivi}
            </div>
            <div className="text-text-secondary text-xs">Clienti Attivi</div>
          </CardContent>
        </Card>
        <Card
          variant="default"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background-tertiary border-green-500/30 shadow-lg hover:shadow-green-500/20 hover:border-green-400/50 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-4 text-center relative">
            <div className="text-state-valid mb-1 text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {profile.stats.sessioni_mese}
            </div>
            <div className="text-text-secondary text-xs">Sessioni/mese</div>
          </CardContent>
        </Card>
        <Card
          variant="default"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary to-background-tertiary border-yellow-500/30 shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-400/50 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardContent className="p-4 text-center relative">
            <div className="text-state-warn mb-1 text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
              {profile.stats.anni_esperienza}
            </div>
            <div className="text-text-secondary text-xs">Anni Esperienza</div>
          </CardContent>
        </Card>
      </div>

      {/* Informazioni personali */}
      <Card
        variant="default"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle
              size="md"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
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
        <CardContent className="space-y-4 relative">
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
      <Card
        variant="default"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            <Users className="mr-2 inline h-5 w-5 text-teal-400" />
            Performance Professionale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-text-secondary text-sm">Anni di Esperienza</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                {profile.stats.anni_esperienza}
              </p>
            </div>
            <div className="text-center">
              <p className="text-text-secondary text-sm">Revenue Mensile</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                €{profile.stats.revenue_mensile.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-2 bg-background-tertiary/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">Soddisfazione Clienti</span>
              <span className="text-sm font-medium bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
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
      <Card
        variant="default"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            <Award className="mr-2 inline h-5 w-5 text-teal-400" />
            Badge e Riconoscimenti
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 gap-4">
            {profile.badge.map((badge) => (
              <div
                key={badge.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                  badge.unlocked
                    ? 'bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-teal-500/30 shadow-lg shadow-teal-500/10'
                    : 'bg-background-tertiary/50 border-border opacity-60'
                }`}
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
      <Card
        variant="default"
        className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
        <CardHeader className="relative">
          <CardTitle
            size="md"
            className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex flex-wrap gap-3">
            {onViewStats && (
              <Button
                variant="outline"
                onClick={onViewStats}
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
              >
                <Target className="mr-2 h-4 w-4" />
                Statistiche
              </Button>
            )}
            {onViewSettings && (
              <Button
                variant="outline"
                onClick={onViewSettings}
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
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

      {/* Azioni rapide */}
      {(onViewStats || onViewSettings || onLogout) && (
        <Card
          variant="default"
          className="relative overflow-hidden bg-gradient-to-br from-background-secondary via-background-secondary to-background-tertiary border-teal-500/30 shadow-2xl shadow-teal-500/20 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5" />
          <CardHeader className="relative">
            <CardTitle
              size="md"
              className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex flex-wrap gap-3">
              {onViewStats && (
                <Button
                  variant="outline"
                  onClick={onViewStats}
                  className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Statistiche
                </Button>
              )}
              {onViewSettings && (
                <Button
                  variant="outline"
                  onClick={onViewSettings}
                  className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50 transition-all duration-200"
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
      )}
    </div>
  )
}
