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
import { useAthleteMassage } from '@/hooks/athlete-profile/use-athlete-massage'
import { useAthleteMassageForm } from '@/hooks/athlete-profile/use-athlete-massage-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Hand, Edit, Save, X, Plus, Trash2, Calendar, Clock } from 'lucide-react'
import type { TipoMassaggioEnum, IntensitaMassaggioEnum } from '@/types/athlete-profile'
import { sanitizeString, sanitizeNumber } from '@/lib/sanitize'

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Hand className="h-6 w-6 text-teal-400" />
            Dati Massaggi
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Preferenze e storico massaggi dell&apos;atleta
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>

      {/* Preferenze Massaggio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Hand className="h-5 w-5 text-teal-400" />
              Preferenze Tipo Massaggio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {TIPI_MASSAGGIO.map((tipo) => {
                  const isSelected = tipiMassaggioList.includes(tipo.value)
                  return (
                    <Button
                      key={tipo.value}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTipoMassaggio(tipo.value)}
                    >
                      {tipo.label}
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {massage?.preferenze_tipo_massaggio &&
                massage.preferenze_tipo_massaggio.length > 0 ? (
                  massage.preferenze_tipo_massaggio.map((tipo, index) => (
                    <Badge key={index} variant="secondary">
                      {TIPI_MASSAGGIO.find((t) => t.value === tipo)?.label || tipo}
                    </Badge>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm">Nessuna preferenza tipo massaggio</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          variant="trainer"
          className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
        >
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Hand className="h-5 w-5 text-teal-400" />
              Intensità Preferita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <select
                value={formData.intensita_preferita || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    intensita_preferita: (e.target.value || null) as IntensitaMassaggioEnum | null,
                  })
                }
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
              >
                <option value="">Non specificato</option>
                {INTENSITA_MASSAGGIO.map((intensita) => (
                  <option key={intensita.value} value={intensita.value}>
                    {intensita.label}
                  </option>
                ))}
              </select>
            ) : (
              massage?.intensita_preferita && (
                <p className="text-text-primary text-base capitalize">
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
          <Card
            variant="trainer"
            className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
          >
            <CardHeader>
              <CardTitle className="text-lg">Zone Problematiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi zona"
                  value={newArrayItem.zona || ''}
                  maxLength={100}
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
                  onClick={() => {
                    if (newArrayItem.zona) {
                      addArrayItem('zone_problematiche', newArrayItem.zona)
                    }
                  }}
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

          <Card
            variant="trainer"
            className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
          >
            <CardHeader>
              <CardTitle className="text-lg">Allergie Prodotti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Aggiungi allergia"
                  value={newArrayItem.allergia || ''}
                  maxLength={100}
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
                  onClick={() => {
                    if (newArrayItem.allergia) {
                      addArrayItem('allergie_prodotti', newArrayItem.allergia)
                    }
                  }}
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
          <Card
            variant="trainer"
            className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
          >
            <CardHeader>
              <CardTitle className="text-lg">Zone Problematiche</CardTitle>
            </CardHeader>
            <CardContent>
              {massage?.zone_problematiche && massage.zone_problematiche.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {massage.zone_problematiche.map((zona, index) => (
                    <Badge key={index} variant="secondary">
                      {zona}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm">Nessuna zona problematica</p>
              )}
            </CardContent>
          </Card>

          <Card
            variant="trainer"
            className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
          >
            <CardHeader>
              <CardTitle className="text-lg">Allergie Prodotti</CardTitle>
            </CardHeader>
            <CardContent>
              {massage?.allergie_prodotti && massage.allergie_prodotti.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {massage.allergie_prodotti.map((allergia, index) => (
                    <Badge key={index} variant="secondary">
                      {allergia}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm">Nessuna allergia prodotti</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Storico Massaggi */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-400" />
              Storico Massaggi
            </CardTitle>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMassaggioForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi Massaggio
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {massaggiList.length > 0 ? (
            <div className="space-y-3">
              {massaggiList.map((massaggio, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10"
                >
                  <div>
                    <p className="text-text-primary font-semibold">
                      {TIPI_MASSAGGIO.find((t) => t.value === massaggio.tipo)?.label ||
                        massaggio.tipo}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date(massaggio.data).toLocaleDateString('it-IT')}
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <Clock className="h-4 w-4" />
                        {massaggio.durata_minuti} minuti
                      </div>
                    </div>
                    {massaggio.note && (
                      <p className="text-text-secondary text-sm mt-1">{massaggio.note}</p>
                    )}
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm" onClick={() => removeMassaggio(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-center py-4">Nessun massaggio nello storico</p>
          )}

          {/* Form Aggiungi Massaggio */}
          {showMassaggioForm && (
            <div className="mt-4 p-4 bg-background-tertiary/30 rounded-lg border border-teal-500/10 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="massaggio-data">Data</Label>
                <Input
                  id="massaggio-data"
                  type="date"
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
                <Label htmlFor="massaggio-tipo">Tipo</Label>
                <select
                  id="massaggio-tipo"
                  value={newArrayItem.massaggio?.tipo || ''}
                  onChange={(e) =>
                    setNewArrayItem({
                      ...newArrayItem,
                      massaggio: {
                        ...newArrayItem.massaggio,
                        tipo: e.target.value as TipoMassaggioEnum,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary"
                >
                  <option value="">Seleziona tipo</option>
                  {TIPI_MASSAGGIO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="massaggio-durata">Durata (minuti)</Label>
                <Input
                  id="massaggio-durata"
                  type="number"
                  min="15"
                  max="180"
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
                <Label htmlFor="massaggio-note">Note (opzionale)</Label>
                <Textarea
                  id="massaggio-note"
                  value={newArrayItem.massaggio?.note || ''}
                  maxLength={500}
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
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMassaggioForm(false)}>
                  Annulla
                </Button>
                <Button onClick={addMassaggio}>Aggiungi</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note Terapeutiche */}
      <Card
        variant="trainer"
        className="relative overflow-hidden border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-200 !bg-transparent ring-1 ring-teal-500/10"
      >
        <CardHeader>
          <CardTitle className="text-lg">Note Terapeutiche</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.note_terapeutiche || ''}
              maxLength={2000}
              onChange={(e) => {
                const sanitized = sanitizeString(e.target.value, 2000)
                setFormData({ ...formData, note_terapeutiche: sanitized || null })
              }}
              placeholder="Note aggiuntive sui massaggi..."
              rows={4}
            />
          ) : massage?.note_terapeutiche ? (
            <p className="text-text-primary whitespace-pre-wrap bg-background-tertiary/30 p-4 rounded-lg border border-teal-500/10">
              {massage.note_terapeutiche}
            </p>
          ) : (
            <p className="text-text-secondary text-center py-4">Nessuna nota terapeutica</p>
          )}
        </CardContent>
      </Card>

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
