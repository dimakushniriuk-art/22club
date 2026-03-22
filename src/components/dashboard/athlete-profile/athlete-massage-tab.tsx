/**
 * @fileoverview Tab Massaggio per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati massaggi e preferenze terapeutiche
 * @module components/dashboard/athlete-profile/athlete-massage-tab
 */

'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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
import { Hand, Edit, Save, X, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import type { TipoMassaggioEnum, IntensitaMassaggioEnum } from '@/types/athlete-profile'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'
import { formatDate } from '@/lib/format'

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

  // Memoizza liste array
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary md:text-2xl">
            <Hand className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Dati Massaggi
          </h2>
          <p className="mt-1 text-sm text-text-secondary md:text-base">
            Preferenze e storico massaggi dell&apos;atleta
          </p>
          <div className="mt-2 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="min-h-[44px] shrink-0 gap-2 border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Preferenze Massaggio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default" className="overflow-hidden">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
              <Hand className="h-5 w-5 text-primary" />
              Preferenze Tipo Massaggio
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
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
            ) : (
              <div className="flex flex-wrap gap-3">
                {massage?.preferenze_tipo_massaggio &&
                massage.preferenze_tipo_massaggio.length > 0 ? (
                  massage.preferenze_tipo_massaggio.map((tipo, index) => (
                    <Badge key={index} variant="secondary">
                      {TIPI_MASSAGGIO.find((t) => t.value === tipo)?.label || tipo}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary">Nessuna preferenza tipo massaggio</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="default" className="overflow-hidden">
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
              <Hand className="h-5 w-5 text-primary" />
              Intensità Preferita
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
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
            ) : (
              massage?.intensita_preferita && (
                <p className="text-base capitalize text-text-primary">
                  {INTENSITA_MASSAGGIO.find((i) => i.value === massage.intensita_preferita)
                    ?.label || massage.intensita_preferita}
                </p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Zone Problematiche e Allergie Prodotti */}
      {isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" className="overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold text-text-primary">
                Zone Problematiche
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi zona"
                  value={newArrayItem.zona || ''}
                  maxLength={100}
                  className="min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  className="min-h-[44px] min-w-[44px] shrink-0 border border-white/10 hover:border-primary/20 hover:bg-white/[0.04] text-primary"
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
            </CardContent>
          </Card>

          <Card variant="default" className="overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold text-text-primary">
                Allergie Prodotti
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi allergia"
                  value={newArrayItem.allergia || ''}
                  maxLength={100}
                  className="min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  className="min-h-[44px] min-w-[44px] shrink-0 border border-white/10 hover:border-primary/20 hover:bg-white/[0.04] text-primary"
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visualizzazione Zone e Allergie (non editing) */}
      {!isEditing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="default" className="overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold text-text-primary">
                Zone Problematiche
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {massage?.zone_problematiche && massage.zone_problematiche.length > 0 ? (
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
            </CardContent>
          </Card>

          <Card variant="default" className="overflow-hidden">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-bold text-text-primary">
                Allergie Prodotti
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {massage?.allergie_prodotti && massage.allergie_prodotti.length > 0 ? (
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Storico Massaggi */}
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
              <Calendar className="h-5 w-5 text-primary" />
              Storico Massaggi
            </CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                className="min-h-[44px] shrink-0 gap-2 border border-white/10 hover:border-primary/20 hover:bg-white/[0.04] text-primary"
                onClick={() => setShowMassaggioForm(true)}
              >
                <Plus className="h-4 w-4" />
                Aggiungi Massaggio
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {massaggiList.length > 0 ? (
            <div className="space-y-3">
              {massaggiList.map((massaggio, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
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
                      className="min-h-[44px] min-w-[44px] shrink-0 rounded-lg border border-white/10 text-text-secondary hover:border-state-error/50 hover:text-state-error hover:bg-white/[0.04]"
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

          {/* Form Aggiungi Massaggio */}
          {showMassaggioForm && (
            <div className="mt-4 space-y-4 rounded-lg border border-white/10 bg-white/[0.02] p-4 min-[834px]:p-5">
              <div className="space-y-2">
                <Label htmlFor="massaggio-data" className="text-text-tertiary">
                  Data
                </Label>
                <Input
                  id="massaggio-data"
                  type="date"
                  className="min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  className="min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  className="min-h-[44px] rounded-md border border-white/10 bg-white/[0.04] text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
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
                  className="min-h-[44px] rounded-lg border border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
                  onClick={() => setShowMassaggioForm(false)}
                >
                  Annulla
                </Button>
                <Button variant="default" className="min-h-[44px]" onClick={addMassaggio}>
                  Aggiungi
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Terapeutiche */}
      <Card variant="default" className="overflow-hidden">
        <CardHeader className="relative z-10">
          <CardTitle className="text-lg font-bold text-text-primary">Note Terapeutiche</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          {isEditing ? (
            <Textarea
              value={formData.note_terapeutiche || ''}
              maxLength={2000}
              className="min-h-[44px] text-base"
              onChange={(e) => {
                const sanitized = sanitizeString(e.target.value, 2000)
                setFormData({ ...formData, note_terapeutiche: sanitized || null })
              }}
              placeholder="Note aggiuntive sui massaggi..."
              rows={4}
            />
          ) : massage?.note_terapeutiche ? (
            <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-4 text-text-primary">
              {massage.note_terapeutiche}
            </p>
          ) : (
            <p className="py-4 text-center text-sm text-text-secondary">Nessuna nota terapeutica</p>
          )}
        </CardContent>
      </Card>

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 pt-4">
          <Button
            variant="outline"
            className="min-h-[44px] gap-2 border-white/10 hover:border-primary/20 hover:bg-white/[0.04]"
            onClick={handleCancel}
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="min-h-[44px] gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
