/**
 * @fileoverview Tab Massaggio per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati massaggi e preferenze terapeutiche
 * @module components/dashboard/athlete-profile/athlete-massage-tab
 */

'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Badge } from '@/components/ui'
import { SimpleSelect } from '@/components/ui'
import { useAthleteMassage } from '@/hooks/athlete-profile/use-athlete-massage'
import { useAthleteMassageForm } from '@/hooks/athlete-profile/use-athlete-massage-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import {
  Hand,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Activity,
  FileText,
} from 'lucide-react'
import type { TipoMassaggioEnum, IntensitaMassaggioEnum } from '@/types/athlete-profile'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

interface AthleteMassageTabProps {
  athleteId: string
}

const TIPI_MASSAGGIO: { value: TipoMassaggioEnum; label: string }[] = [
  { value: 'svedese', label: 'Svedese' },
  { value: 'sportivo', label: 'Sportivo' },
  { value: 'decontratturante', label: 'Decontratturante' },
  { value: 'rilassante', label: 'Rilassante' },
  { value: 'linfodrenante', label: 'Linfodrenante' },
  { value: 'altro', label: 'Altro' },
]

const INTENSITA_MASSAGGIO: { value: IntensitaMassaggioEnum; label: string }[] = [
  { value: 'leggera', label: 'Leggera' },
  { value: 'media', label: 'Media' },
  { value: 'intensa', label: 'Intensa' },
]

/** Chip tipo massaggio */
const CHIP_BASE =
  'min-h-[44px] shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const CHIP_SELECTED = 'bg-white/[0.06] text-primary border border-white/10'
const CHIP_UNSELECTED =
  'border border-white/10 bg-transparent text-text-secondary hover:border-primary/20 hover:bg-white/[0.04]'

export function AthleteMassageTab({ athleteId }: AthleteMassageTabProps) {
  const { data: massage, isLoading, error } = useAthleteMassage(athleteId)

  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    newArrayItem,
    setNewArrayItem,
    showMassaggioForm,
    setShowMassaggioForm,
    handleSave,
    handleCancel,
    addArrayItem,
    removeArrayItem,
    toggleTipoMassaggio,
    addMassaggio,
    removeMassaggio,
    updateMutation,
  } = useAthleteMassageForm({ massage: massage ?? null, athleteId })

  const zoneList = useMemo(() => formData.zone_problematiche || [], [formData.zone_problematiche])
  const allergieList = useMemo(() => formData.allergie_prodotti || [], [formData.allergie_prodotti])
  const tipiMassaggioList = useMemo(
    () => formData.preferenze_tipo_massaggio || [],
    [formData.preferenze_tipo_massaggio],
  )
  const massaggiList = useMemo(() => formData.storico_massaggi || [], [formData.storico_massaggi])

  if (isLoading) {
    return <LoadingState message="Caricamento dati massaggi..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati massaggi" />
  }

  return (
    <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
            <Hand className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
            Dati Massaggi
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
            Preferenze e storico massaggi dell&apos;atleta
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 text-xs touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-9 sm:w-auto sm:rounded-md"
          >
            <Edit className="h-3.5 w-3.5" />
            Modifica
          </Button>
        )}
      </div>

      <CardContent className="space-y-0 p-0">
        <AthleteProfileSectionHeading icon={Hand}>Preferenze massaggio</AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Tipi preferiti
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-3">
                  {TIPI_MASSAGGIO.map((tipo) => {
                    const isSelected = tipiMassaggioList.includes(tipo.value)
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        className={`${CHIP_BASE} ${isSelected ? CHIP_SELECTED : CHIP_UNSELECTED}`}
                        onClick={() => toggleTipoMassaggio(tipo.value)}
                      >
                        {tipo.label}
                      </button>
                    )
                  })}
                </div>
              ) : massage?.preferenze_tipo_massaggio &&
                massage.preferenze_tipo_massaggio.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {massage.preferenze_tipo_massaggio.map((tipo, index) => (
                    <Badge key={index} variant="secondary">
                      {TIPI_MASSAGGIO.find((t) => t.value === tipo)?.label || tipo}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Nessuna preferenza tipo massaggio</p>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Intensità preferita
              </p>
              {isEditing ? (
                <SimpleSelect
                  value={formData.intensita_preferita || ''}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      intensita_preferita: (v || null) as IntensitaMassaggioEnum | null,
                    })
                  }
                  placeholder="Non specificato"
                  options={[
                    { value: '', label: 'Non specificato' },
                    ...[...INTENSITA_MASSAGGIO].sort((a, b) => a.label.localeCompare(b.label, 'it')),
                  ]}
                />
              ) : massage?.intensita_preferita ? (
                <p className="text-base capitalize text-text-primary">
                  {INTENSITA_MASSAGGIO.find((i) => i.value === massage.intensita_preferita)
                    ?.label || massage.intensita_preferita}
                </p>
              ) : (
                <p className="text-sm text-text-secondary">Non specificato</p>
              )}
            </div>
          </div>
        </div>

        <AthleteProfileSectionHeading icon={Activity}>
          Zone e allergie prodotti
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Zone problematiche
              </p>
              {isEditing ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Aggiungi zona"
                      value={newArrayItem.zona || ''}
                      maxLength={100}
                      className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
                      onChange={(e) => {
                        const sanitized = sanitizeString(e.target.value, 100)
                        setNewArrayItem({ ...newArrayItem, zona: sanitized || '' })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newArrayItem.zona) {
                          addArrayItem('zone_problematiche', newArrayItem.zona)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 shrink-0 border-white/10"
                      onClick={() => {
                        if (newArrayItem.zona) {
                          addArrayItem('zone_problematiche', newArrayItem.zona)
                        }
                      }}
                      aria-label="Aggiungi zona"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {zoneList.map((zona, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {zona}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeArrayItem('zone_problematiche', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </>
              ) : massage?.zone_problematiche && massage.zone_problematiche.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {massage.zone_problematiche.map((zona, index) => (
                    <Badge key={index} variant="secondary">
                      {zona}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Nessuna zona problematica</p>
              )}
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                Allergie prodotti
              </p>
              {isEditing ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Aggiungi allergia"
                      value={newArrayItem.allergia || ''}
                      maxLength={100}
                      className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
                      onChange={(e) => {
                        const sanitized = sanitizeString(e.target.value, 100)
                        setNewArrayItem({ ...newArrayItem, allergia: sanitized || '' })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newArrayItem.allergia) {
                          addArrayItem('allergie_prodotti', newArrayItem.allergia)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 shrink-0 border-white/10"
                      onClick={() => {
                        if (newArrayItem.allergia) {
                          addArrayItem('allergie_prodotti', newArrayItem.allergia)
                        }
                      }}
                      aria-label="Aggiungi allergia"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergieList.map((allergia, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {allergia}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeArrayItem('allergie_prodotti', index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </>
              ) : massage?.allergie_prodotti && massage.allergie_prodotti.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {massage.allergie_prodotti.map((allergia, index) => (
                    <Badge key={index} variant="secondary">
                      {allergia}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Nessuna allergia prodotti</p>
              )}
            </div>
          </div>
        </div>

        <AthleteProfileSectionHeading
          icon={Calendar}
          trailing={
            isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMassaggioForm(true)}
                className="flex h-9 items-center gap-2 border-white/10 text-xs hover:border-primary/20 hover:bg-white/[0.04]"
              >
                <Plus className="h-3.5 w-3.5" />
                Aggiungi massaggio
              </Button>
            ) : undefined
          }
        >
          Storico massaggi
        </AthleteProfileSectionHeading>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {massaggiList.length > 0 ? (
            <div className="space-y-3">
              {massaggiList.map((massaggio, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-text-primary">
                      {TIPI_MASSAGGIO.find((t) => t.value === massaggio.tipo)?.label ||
                        massaggio.tipo}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="h-4 w-4 shrink-0" />
                        {formatDate(massaggio.data)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock className="h-4 w-4 shrink-0" />
                        {massaggio.durata_minuti} minuti
                      </div>
                    </div>
                    {massaggio.note && (
                      <p className="mt-1 text-sm text-text-secondary">{massaggio.note}</p>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 shrink-0 border-white/10 sm:self-center"
                      onClick={() => removeMassaggio(index)}
                      aria-label="Rimuovi massaggio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-text-secondary">
              Nessun massaggio nello storico
            </p>
          )}

          {showMassaggioForm && (
            <div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 min-[834px]:p-5">
              <div className="space-y-2">
                <Label htmlFor="massaggio-data" className="text-text-tertiary">
                  Data
                </Label>
                <Input
                  id="massaggio-data"
                  type="date"
                  className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
                  value={newArrayItem.massaggio?.data || ''}
                  onChange={(e) =>
                    setNewArrayItem({
                      ...newArrayItem,
                      massaggio: { ...newArrayItem.massaggio, data: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="massaggio-tipo" className="text-text-tertiary">
                  Tipo
                </Label>
                <SimpleSelect
                  value={newArrayItem.massaggio?.tipo || ''}
                  onValueChange={(v) =>
                    setNewArrayItem({
                      ...newArrayItem,
                      massaggio: {
                        ...newArrayItem.massaggio,
                        tipo: v as TipoMassaggioEnum,
                      },
                    })
                  }
                  placeholder="Seleziona tipo"
                  options={[...TIPI_MASSAGGIO].sort((a, b) => a.label.localeCompare(b.label, 'it'))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="massaggio-durata" className="text-text-tertiary">
                  Durata (minuti)
                </Label>
                <Input
                  id="massaggio-durata"
                  type="number"
                  min={15}
                  max={180}
                  className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
                  value={newArrayItem.massaggio?.durata_minuti || ''}
                  onChange={(e) => {
                    const sanitized = sanitizeNumber(
                      e.target.value ? parseInt(e.target.value) : null,
                      15,
                      180,
                    )
                    setNewArrayItem({
                      ...newArrayItem,
                      massaggio: {
                        ...newArrayItem.massaggio,
                        durata_minuti: sanitized || undefined,
                      },
                    })
                  }}
                  placeholder="60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="massaggio-note" className="text-text-tertiary">
                  Note (opzionale)
                </Label>
                <Textarea
                  id="massaggio-note"
                  value={newArrayItem.massaggio?.note || ''}
                  maxLength={500}
                  className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
                  onChange={(e) => {
                    const sanitized = sanitizeString(e.target.value, 500)
                    setNewArrayItem({
                      ...newArrayItem,
                      massaggio: { ...newArrayItem.massaggio, note: sanitized || undefined },
                    })
                  }}
                  placeholder="Note aggiuntive sul massaggio..."
                  rows={2}
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="min-h-9 rounded-lg border border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
                  onClick={() => setShowMassaggioForm(false)}
                >
                  Annulla
                </Button>
                <Button variant="default" className="min-h-9" onClick={addMassaggio}>
                  Aggiungi
                </Button>
              </div>
            </div>
          )}
        </div>

        <AthleteProfileSectionHeading icon={FileText}>Note terapeutiche</AthleteProfileSectionHeading>
        <div className="px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          {isEditing ? (
            <Textarea
              value={formData.note_terapeutiche || ''}
              maxLength={2000}
              className="min-h-9 border-white/10 bg-white/[0.04] text-xs"
              onChange={(e) => {
                const sanitized = sanitizeString(e.target.value, 2000)
                setFormData({ ...formData, note_terapeutiche: sanitized || null })
              }}
              placeholder="Note aggiuntive sui massaggi..."
              rows={4}
            />
          ) : massage?.note_terapeutiche ? (
            <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
              {massage.note_terapeutiche}
            </p>
          ) : (
            <p className="py-4 text-center text-sm text-text-secondary">Nessuna nota terapeutica</p>
          )}
        </div>

        {isEditing && (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 pb-4 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 sm:px-5 sm:pb-5 sm:pt-5">
            <Button
              variant="outline"
              className="flex h-11 w-full items-center justify-center gap-2 border-white/10 touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-auto sm:min-h-[44px] sm:w-auto"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
              Annulla
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 touch-manipulation sm:h-auto sm:min-h-[44px] sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
