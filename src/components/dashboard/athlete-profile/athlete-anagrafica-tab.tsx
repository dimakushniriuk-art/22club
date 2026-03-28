/**
 * @fileoverview Tab Anagrafica per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati anagrafici atleta
 * @module components/dashboard/athlete-profile/athlete-anagrafica-tab
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { useAthleteAnagraficaForm } from '@/hooks/athlete-profile/use-athlete-anagrafica-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, AlertCircle } from 'lucide-react'
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'
import { cn } from '@/lib/utils'
import type { AthleteAnagrafica } from '@/types/athlete-profile'
import { ATHLETE_PROFILE_NESTED_CARD_CLASS } from './athlete-profile-ds'
import { AthleteProfileSectionHeading } from './athlete-profile-section-heading'

function labelSesso(s: AthleteAnagrafica['sesso']): string {
  if (!s || s === 'non_specificato') return 'Non specificato'
  const map = { maschio: 'Maschio', femmina: 'Femmina', altro: 'Altro' } as const
  return map[s as keyof typeof map] ?? s
}

/** Colonna etichette fissa così tutti i valori iniziano sulla stessa linea (sm+). */
const FIELD_GRID =
  'grid grid-cols-1 gap-1.5 sm:grid-cols-[minmax(8.5rem,11rem)_1fr] sm:items-start sm:gap-x-5'
const LABEL_CLS = 'text-[10px] uppercase tracking-wide text-text-tertiary sm:pt-1.5'
const INPUT_CLS = 'h-9 w-full min-w-0 text-xs'
/** Nessun break-words: in colonne strette spezzava “182 cm” lettera per lettera. */
const VALUE_CLS =
  'text-sm font-medium text-text-primary min-w-0 [overflow-wrap:anywhere] [word-break:normal]'
const VALUE_EMAIL_CLS =
  'text-sm font-medium text-text-primary min-w-0 break-all [word-break:break-all]'
const EMPTY_CLS = 'text-sm text-text-tertiary'

function FieldRow({
  label,
  htmlFor,
  children,
  layout = 'split',
}: {
  label: string
  htmlFor?: string
  children: React.ReactNode
  /** `stacked`: etichetta sopra il valore (per celle in griglia a più colonne). */
  layout?: 'split' | 'stacked'
}) {
  const gridClass = layout === 'stacked' ? 'grid grid-cols-1 gap-1.5' : FIELD_GRID
  return (
    <div className={gridClass}>
      <Label htmlFor={htmlFor} className={cn(LABEL_CLS, layout === 'stacked' && 'pt-0 sm:pt-0')}>
        {label}
      </Label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function ReadValue({
  children,
  empty,
  variant = 'default',
}: {
  children: React.ReactNode
  empty?: boolean
  /** `metric`: numeri con unità, mai spezzare in verticale. */
  variant?: 'default' | 'metric' | 'email'
}) {
  if (empty) return <span className={EMPTY_CLS}>—</span>
  const cls =
    variant === 'email'
      ? VALUE_EMAIL_CLS
      : variant === 'metric'
        ? cn(VALUE_CLS, 'tabular-nums whitespace-nowrap')
        : VALUE_CLS
  return <span className={cls}>{children}</span>
}

interface AthleteAnagraficaTabProps {
  athleteId: string
}

export function AthleteAnagraficaTab({ athleteId }: AthleteAnagraficaTabProps) {
  const { data: anagrafica, isLoading, error } = useAthleteAnagrafica(athleteId)

  const {
    isEditing,
    setIsEditing,
    formData,
    setFormData,
    handleSave,
    handleCancel,
    updateMutation,
  } = useAthleteAnagraficaForm({ anagrafica: anagrafica ?? null, athleteId })

  const [altezzaCmString, setAltezzaCmString] = useState<string>('')
  const [pesoInizialeKgString, setPesoInizialeKgString] = useState<string>('')

  useEffect(() => {
    if (formData.altezza_cm !== null && formData.altezza_cm !== undefined) {
      setAltezzaCmString(formData.altezza_cm.toString())
    } else {
      setAltezzaCmString('')
    }
  }, [formData.altezza_cm])

  useEffect(() => {
    if (formData.peso_iniziale_kg !== null && formData.peso_iniziale_kg !== undefined) {
      setPesoInizialeKgString(formData.peso_iniziale_kg.toString())
    } else {
      setPesoInizialeKgString('')
    }
  }, [formData.peso_iniziale_kg])

  if (isLoading) {
    return <LoadingState message="Caricamento dati anagrafici..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati anagrafici" />
  }

  if (!anagrafica) {
    return (
      <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center justify-center py-6 text-center sm:py-8">
            <AlertCircle className="mb-4 h-12 w-12 text-text-tertiary" />
            <p className="text-text-secondary">Nessun dato anagrafico disponibile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="default" className={cn(ATHLETE_PROFILE_NESTED_CARD_CLASS, 'p-0')}>
      {/* Intestazione scheda */}
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="min-w-0 text-center sm:text-left">
          <h2 className="flex items-center justify-center gap-2 text-base font-semibold text-text-primary sm:justify-start sm:text-lg">
            <User className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden />
            Dati Anagrafici
          </h2>
          <p className="mt-1 line-clamp-2 text-xs text-text-secondary sm:line-clamp-1">
            Informazioni personali, residenza e contatto di emergenza
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
        {/* — Informazioni personali */}
        <AthleteProfileSectionHeading icon={User}>
          Informazioni personali
        </AthleteProfileSectionHeading>
        <div className="space-y-3 px-4 py-4 sm:space-y-3.5 sm:px-5 sm:py-5">
          <FieldRow label="Nome" htmlFor="nome">
            {isEditing ? (
              <Input
                id="nome"
                value={formData.nome || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nome: sanitizeString(e.target.value, 100) || '' })
                }
                placeholder="Nome"
                maxLength={100}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.nome}>{anagrafica.nome}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Cognome" htmlFor="cognome">
            {isEditing ? (
              <Input
                id="cognome"
                value={formData.cognome || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cognome: sanitizeString(e.target.value, 100) || '',
                  })
                }
                placeholder="Cognome"
                maxLength={100}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.cognome}>{anagrafica.cognome}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Email" htmlFor="email">
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => {
                  const sanitized = sanitizeEmail(e.target.value)
                  setFormData({ ...formData, email: sanitized || e.target.value.trim() })
                }}
                placeholder="email@example.com"
                className={INPUT_CLS}
              />
            ) : (
              <div className="flex min-w-0 items-start gap-1.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/90" aria-hidden />
                <ReadValue variant="email" empty={!anagrafica.email}>
                  {anagrafica.email}
                </ReadValue>
              </div>
            )}
          </FieldRow>

          <FieldRow label="Telefono" htmlFor="telefono">
            {isEditing ? (
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono || ''}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: sanitizePhone(e.target.value) })
                }
                placeholder="+39 123 456 7890"
                className={INPUT_CLS}
              />
            ) : (
              <div className="flex min-w-0 items-center gap-1.5">
                {anagrafica.telefono ? (
                  <>
                    <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-400/90" aria-hidden />
                    <span className={VALUE_CLS}>{anagrafica.telefono}</span>
                  </>
                ) : (
                  <span className={EMPTY_CLS}>—</span>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Data di nascita" htmlFor="data_nascita">
            {isEditing ? (
              <Input
                id="data_nascita"
                type="date"
                value={formData.data_nascita || ''}
                onChange={(e) => setFormData({ ...formData, data_nascita: e.target.value || null })}
                className={INPUT_CLS}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                {anagrafica.data_nascita ? (
                  <>
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-cyan-400/90" aria-hidden />
                    <span className={VALUE_CLS}>
                      {new Date(anagrafica.data_nascita).toLocaleDateString('it-IT')}
                    </span>
                  </>
                ) : (
                  <span className={EMPTY_CLS}>—</span>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Sesso" htmlFor="sesso">
            {isEditing ? (
              <select
                id="sesso"
                value={
                  !formData.sesso || formData.sesso === 'non_specificato' ? '' : formData.sesso
                }
                onChange={(e) => {
                  const v = e.target.value
                  setFormData({
                    ...formData,
                    sesso:
                      v === '' ? null : (v as 'maschio' | 'femmina' | 'altro' | 'non_specificato'),
                  })
                }}
                className="h-9 w-full min-w-0 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-text-primary focus:border-primary/30 focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Non specificato</option>
                <option value="maschio">Maschio</option>
                <option value="femmina">Femmina</option>
                <option value="altro">Altro</option>
              </select>
            ) : (
              <span className={VALUE_CLS}>{labelSesso(anagrafica.sesso)}</span>
            )}
          </FieldRow>
        </div>

        {/* — Residenza e altri dati */}
        <AthleteProfileSectionHeading icon={MapPin}>
          Residenza e altri dati
        </AthleteProfileSectionHeading>
        <div className="space-y-3 px-4 py-4 sm:space-y-3.5 sm:px-5 sm:py-5">
          <FieldRow label="Codice fiscale" htmlFor="codice_fiscale">
            {isEditing ? (
              <Input
                id="codice_fiscale"
                value={formData.codice_fiscale || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codice_fiscale: sanitizeString(e.target.value.toUpperCase(), 16) || null,
                  })
                }
                placeholder="ABCDEF12G34H567I"
                maxLength={16}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.codice_fiscale}>{anagrafica.codice_fiscale}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Indirizzo" htmlFor="indirizzo">
            {isEditing ? (
              <Input
                id="indirizzo"
                value={formData.indirizzo || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    indirizzo: sanitizeString(e.target.value, 200) || null,
                  })
                }
                maxLength={200}
                placeholder="Via, numero civico"
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.indirizzo}>{anagrafica.indirizzo}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Località">
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:gap-3 sm:gap-x-4">
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="citta" className={cn(LABEL_CLS, 'max-sm:block sm:hidden')}>
                  Città
                </Label>
                {isEditing ? (
                  <Input
                    id="citta"
                    value={formData.citta || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        citta: sanitizeString(e.target.value, 100) || null,
                      })
                    }
                    maxLength={100}
                    placeholder="Città"
                    className={INPUT_CLS}
                  />
                ) : (
                  <ReadValue empty={!anagrafica.citta}>{anagrafica.citta}</ReadValue>
                )}
              </div>
              <div className="min-w-0 space-y-1.5 sm:max-w-[6.5rem]">
                <Label htmlFor="cap" className={cn(LABEL_CLS, 'max-sm:block sm:hidden')}>
                  CAP
                </Label>
                {isEditing ? (
                  <Input
                    id="cap"
                    value={formData.cap || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cap: sanitizeString(e.target.value, 10) || null,
                      })
                    }
                    maxLength={10}
                    placeholder="CAP"
                    className={INPUT_CLS}
                  />
                ) : (
                  <ReadValue empty={!anagrafica.cap}>{anagrafica.cap}</ReadValue>
                )}
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label htmlFor="provincia" className={cn(LABEL_CLS, 'max-sm:block sm:hidden')}>
                  Provincia
                </Label>
                {isEditing ? (
                  <Input
                    id="provincia"
                    value={formData.provincia || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provincia: sanitizeString(e.target.value, 50) || null,
                      })
                    }
                    placeholder="Provincia"
                    maxLength={50}
                    className={INPUT_CLS}
                  />
                ) : (
                  <ReadValue empty={!anagrafica.provincia}>{anagrafica.provincia}</ReadValue>
                )}
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Nazione" htmlFor="nazione">
            {isEditing ? (
              <Input
                id="nazione"
                value={formData.nazione || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nazione: sanitizeString(e.target.value, 50) || null,
                  })
                }
                placeholder="Italia"
                maxLength={50}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.nazione}>{anagrafica.nazione}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Professione" htmlFor="professione">
            {isEditing ? (
              <Input
                id="professione"
                value={formData.professione || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    professione: sanitizeString(e.target.value, 100) || null,
                  })
                }
                placeholder="Professione"
                maxLength={100}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.professione}>{anagrafica.professione}</ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Altezza (cm)" htmlFor="altezza_cm">
            {isEditing ? (
              <Input
                id="altezza_cm"
                type="text"
                inputMode="numeric"
                value={altezzaCmString}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d*$/.test(value)) {
                    setAltezzaCmString(value)
                    setFormData({
                      ...formData,
                      altezza_cm: value === '' ? null : value ? parseInt(value, 10) : null,
                    })
                  }
                }}
                onBlur={() => {
                  const num = parseInt(altezzaCmString, 10)
                  if (isNaN(num)) {
                    setAltezzaCmString('')
                    setFormData({ ...formData, altezza_cm: null })
                  } else {
                    setAltezzaCmString(num.toString())
                    setFormData({ ...formData, altezza_cm: num })
                  }
                }}
                placeholder="175"
                className={cn(INPUT_CLS, 'sm:max-w-[12rem]')}
              />
            ) : (
              <ReadValue variant="metric" empty={anagrafica.altezza_cm == null}>
                {anagrafica.altezza_cm != null ? `${anagrafica.altezza_cm} cm` : null}
              </ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Peso iniziale (kg)" htmlFor="peso_iniziale_kg">
            {isEditing ? (
              <Input
                id="peso_iniziale_kg"
                type="text"
                inputMode="decimal"
                value={pesoInizialeKgString}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                    setPesoInizialeKgString(value)
                    if (value === '') {
                      setFormData({
                        ...formData,
                        peso_iniziale_kg: null,
                      })
                    } else if (!value.endsWith('.') && value !== '-') {
                      const num = parseFloat(value)
                      if (!isNaN(num)) {
                        setFormData({
                          ...formData,
                          peso_iniziale_kg: num,
                        })
                      }
                    }
                  }
                }}
                onBlur={() => {
                  const num = parseFloat(pesoInizialeKgString)
                  if (isNaN(num) || pesoInizialeKgString === '' || pesoInizialeKgString === '-') {
                    setPesoInizialeKgString('')
                    setFormData({ ...formData, peso_iniziale_kg: null })
                  } else {
                    setPesoInizialeKgString(num.toString())
                    setFormData({ ...formData, peso_iniziale_kg: num })
                  }
                }}
                placeholder="70.5"
                className={cn(INPUT_CLS, 'sm:max-w-[12rem]')}
              />
            ) : (
              <ReadValue variant="metric" empty={anagrafica.peso_iniziale_kg == null}>
                {anagrafica.peso_iniziale_kg != null ? `${anagrafica.peso_iniziale_kg} kg` : null}
              </ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Gruppo sanguigno" htmlFor="gruppo_sanguigno">
            {isEditing ? (
              <Input
                id="gruppo_sanguigno"
                value={formData.gruppo_sanguigno || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gruppo_sanguigno: sanitizeString(e.target.value.toUpperCase(), 5) || null,
                  })
                }
                placeholder="A+"
                maxLength={5}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.gruppo_sanguigno}>
                {anagrafica.gruppo_sanguigno}
              </ReadValue>
            )}
          </FieldRow>
        </div>

        {/* — Emergenza */}
        <AthleteProfileSectionHeading icon={AlertCircle}>
          Contatto di emergenza
        </AthleteProfileSectionHeading>
        <div className="space-y-3 px-4 py-4 sm:space-y-3.5 sm:px-5 sm:py-5">
          <FieldRow label="Nome" htmlFor="contatto_emergenza_nome">
            {isEditing ? (
              <Input
                id="contatto_emergenza_nome"
                value={formData.contatto_emergenza_nome || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contatto_emergenza_nome: sanitizeString(e.target.value, 200) || null,
                  })
                }
                placeholder="Nome contatto"
                maxLength={200}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.contatto_emergenza_nome}>
                {anagrafica.contatto_emergenza_nome}
              </ReadValue>
            )}
          </FieldRow>

          <FieldRow label="Telefono" htmlFor="contatto_emergenza_telefono">
            {isEditing ? (
              <Input
                id="contatto_emergenza_telefono"
                type="tel"
                value={formData.contatto_emergenza_telefono || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contatto_emergenza_telefono: sanitizePhone(e.target.value),
                  })
                }
                placeholder="+39 123 456 7890"
                className={INPUT_CLS}
              />
            ) : (
              <div className="flex min-w-0 items-center gap-1.5">
                {anagrafica.contatto_emergenza_telefono ? (
                  <>
                    <Phone className="h-3.5 w-3.5 shrink-0 text-cyan-400/90" aria-hidden />
                    <span className={VALUE_CLS}>{anagrafica.contatto_emergenza_telefono}</span>
                  </>
                ) : (
                  <span className={EMPTY_CLS}>—</span>
                )}
              </div>
            )}
          </FieldRow>

          <FieldRow label="Relazione" htmlFor="contatto_emergenza_relazione">
            {isEditing ? (
              <Input
                id="contatto_emergenza_relazione"
                value={formData.contatto_emergenza_relazione || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contatto_emergenza_relazione: sanitizeString(e.target.value, 50) || null,
                  })
                }
                placeholder="Familiare, amico, ecc."
                maxLength={50}
                className={INPUT_CLS}
              />
            ) : (
              <ReadValue empty={!anagrafica.contatto_emergenza_relazione}>
                {anagrafica.contatto_emergenza_relazione}
              </ReadValue>
            )}
          </FieldRow>
        </div>
      </CardContent>

      {isEditing && (
        <div className="flex flex-col-reverse gap-2 border-t border-white/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5 sm:px-5 sm:py-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className="h-11 w-full border-white/10 text-xs touch-manipulation hover:border-primary/20 hover:bg-white/[0.04] sm:h-9 sm:w-auto"
          >
            <X className="h-3.5 w-3.5" />
            Annulla
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
            className="h-11 w-full touch-manipulation sm:h-9 sm:w-auto"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </Card>
  )
}
