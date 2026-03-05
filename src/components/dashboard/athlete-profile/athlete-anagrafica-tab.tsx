/**
 * @fileoverview Tab Anagrafica per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati anagrafici atleta
 * @module components/dashboard/athlete-profile/athlete-anagrafica-tab
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { useAthleteAnagrafica } from '@/hooks/athlete-profile/use-athlete-anagrafica'
import { useAthleteAnagraficaForm } from '@/hooks/athlete-profile/use-athlete-anagrafica-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, AlertCircle } from 'lucide-react'
import { sanitizeString, sanitizeEmail, sanitizePhone } from '@/lib/sanitize'

const glassSurface =
  'bg-gradient-to-br from-background-secondary/38 via-background-secondary/18 to-cyan-950/22 backdrop-blur-xl'
const framePrimary = 'border border-primary/22 hover:border-primary/30 transition'
const frameSoft = 'border border-white/10 hover:border-white/14 transition'
const shadowSport = 'shadow-[0_10px_30px_rgba(0,0,0,0.45)]'

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

  // Stati locali per gestire valori come stringhe durante la digitazione
  const [altezzaCmString, setAltezzaCmString] = useState<string>('')
  const [pesoInizialeKgString, setPesoInizialeKgString] = useState<string>('')

  // Sincronizza stati locali con formData quando cambia
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
      <Card
        variant="trainer"
        className={`relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-text-tertiary mb-4" />
            <p className="text-text-secondary">Nessun dato anagrafico disponibile</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <User className="h-4 w-4 text-primary flex-shrink-0" aria-hidden />
            Dati Anagrafici
          </h2>
          <p className="text-text-secondary text-xs mt-1 line-clamp-1">
            Informazioni personali e contatti dell&apos;atleta
          </p>
          <div className="mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-primary/70 via-primary/40 to-transparent" />
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className={`flex items-center gap-1.5 h-8 text-xs rounded-full bg-background-secondary/25 text-text-primary flex-shrink-0 self-start sm:self-center ${frameSoft}`}
          >
            <Edit className="h-3 w-3" />
            Modifica
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Card
          variant="default"
          className={`group relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/6" />
          <CardHeader className="pb-3 pt-4 px-6 relative z-10 space-y-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Informazioni Personali
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 space-y-3 relative z-10">
            <div className="space-y-1">
              <Label
                htmlFor="nome"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Nome
              </Label>
              {isEditing ? (
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: sanitizeString(e.target.value, 100) || '' })
                  }
                  placeholder="Nome"
                  maxLength={100}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-text-primary text-sm font-semibold">{anagrafica.nome}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="cognome"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Cognome
              </Label>
              {isEditing ? (
                <Input
                  id="cognome"
                  value={formData.cognome || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cognome: sanitizeString(e.target.value, 100) || '' })
                  }
                  placeholder="Cognome"
                  maxLength={100}
                  className="h-9 text-xs"
                />
              ) : (
                <p className="text-text-primary text-sm font-semibold">{anagrafica.cognome}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="email"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Email
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <p className="text-text-primary text-sm">{anagrafica.email}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="telefono"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Telefono
              </Label>
              {isEditing ? (
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: sanitizePhone(e.target.value) })
                  }
                  placeholder="+39 123 456 7890"
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <p className="text-text-primary text-sm">{anagrafica.telefono}</p>
                  </div>
                )
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="data_nascita"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Data di Nascita
              </Label>
              {isEditing ? (
                <Input
                  id="data_nascita"
                  type="date"
                  value={formData.data_nascita || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, data_nascita: e.target.value || null })
                  }
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.data_nascita && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <p className="text-text-primary text-sm">
                      {new Date(anagrafica.data_nascita).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="sesso"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Sesso
              </Label>
              {isEditing ? (
                <select
                  id="sesso"
                  value={formData.sesso || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sesso: (e.target.value || null) as
                        | 'maschio'
                        | 'femmina'
                        | 'altro'
                        | 'non_specificato'
                        | null,
                    })
                  }
                  className="w-full h-9 px-2.5 text-xs bg-background-secondary border border-white/10 rounded-lg text-text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:border-primary/30"
                >
                  <option value="">Non specificato</option>
                  <option value="maschio">Maschio</option>
                  <option value="femmina">Femmina</option>
                  <option value="altro">Altro</option>
                  <option value="non_specificato">Non specificato</option>
                </select>
              ) : (
                anagrafica.sesso && (
                  <p className="text-text-primary text-sm capitalize">{anagrafica.sesso}</p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          variant="default"
          className={`group relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/6" />
          <CardHeader className="pb-3 pt-4 px-6 relative z-10 space-y-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Dettagli Aggiuntivi
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 space-y-3 relative z-10">
            <div className="space-y-1">
              <Label
                htmlFor="codice_fiscale"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Codice Fiscale
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.codice_fiscale && (
                  <p className="text-text-primary text-sm">{anagrafica.codice_fiscale}</p>
                )
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="indirizzo"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Indirizzo
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.indirizzo && (
                  <p className="text-text-primary text-sm">{anagrafica.indirizzo}</p>
                )
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="citta"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.citta && (
                    <p className="text-text-primary text-sm">{anagrafica.citta}</p>
                  )
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="provincia"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.provincia && (
                    <p className="text-text-primary text-sm">{anagrafica.provincia}</p>
                  )
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="nazione"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Nazione
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.nazione && (
                  <p className="text-text-primary text-sm">{anagrafica.nazione}</p>
                )
              )}
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="professione"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Professione
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.professione && (
                  <p className="text-text-primary text-sm">{anagrafica.professione}</p>
                )
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="altezza_cm"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
                  Altezza (cm)
                </Label>
                {isEditing ? (
                  <Input
                    id="altezza_cm"
                    type="text"
                    value={altezzaCmString}
                    onChange={(e) => {
                      const value = e.target.value
                      // Permetti solo numeri interi
                      if (value === '' || /^\d*$/.test(value)) {
                        setAltezzaCmString(value)
                        setFormData({
                          ...formData,
                          altezza_cm: value === '' ? null : value ? parseInt(value, 10) : null,
                        })
                      }
                    }}
                    onBlur={() => {
                      // Al blur, assicurati che il valore sia un numero valido
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.altezza_cm && (
                    <p className="text-text-primary text-sm">{anagrafica.altezza_cm} cm</p>
                  )
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="peso_iniziale_kg"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
                  Peso Iniziale (kg)
                </Label>
                {isEditing ? (
                  <Input
                    id="peso_iniziale_kg"
                    type="text"
                    value={pesoInizialeKgString}
                    onChange={(e) => {
                      const value = e.target.value
                      // Permetti solo numeri, punto decimale e segno negativo
                      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                        setPesoInizialeKgString(value)
                        // Converti a numero solo se il valore è completo (non termina con punto)
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
                      // Al blur, converti sempre a numero se valido
                      const num = parseFloat(pesoInizialeKgString)
                      if (
                        isNaN(num) ||
                        pesoInizialeKgString === '' ||
                        pesoInizialeKgString === '-'
                      ) {
                        setPesoInizialeKgString('')
                        setFormData({ ...formData, peso_iniziale_kg: null })
                      } else {
                        setPesoInizialeKgString(num.toString())
                        setFormData({ ...formData, peso_iniziale_kg: num })
                      }
                    }}
                    placeholder="70.5"
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.peso_iniziale_kg && (
                    <p className="text-text-primary text-sm">{anagrafica.peso_iniziale_kg} kg</p>
                  )
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="gruppo_sanguigno"
                className="text-[10px] uppercase tracking-wide text-text-tertiary"
              >
                Gruppo Sanguigno
              </Label>
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
                  className="h-9 text-xs"
                />
              ) : (
                anagrafica.gruppo_sanguigno && (
                  <p className="text-text-primary text-sm">{anagrafica.gruppo_sanguigno}</p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          variant="default"
          className={`group relative overflow-hidden rounded-3xl ${glassSurface} ${framePrimary} ${shadowSport}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/6" />
          <CardHeader className="pb-3 pt-4 px-6 relative z-10 space-y-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-text-primary">
              <AlertCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              Contatto di Emergenza
            </CardTitle>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-primary/80 to-transparent" />
          </CardHeader>
          <CardContent className="pt-2 pb-6 px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="contatto_emergenza_nome"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
                  Nome
                </Label>
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.contatto_emergenza_nome && (
                    <p className="text-text-primary text-sm">
                      {anagrafica.contatto_emergenza_nome}
                    </p>
                  )
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="contatto_emergenza_telefono"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
                  Telefono
                </Label>
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.contatto_emergenza_telefono && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <p className="text-text-primary text-sm">
                        {anagrafica.contatto_emergenza_telefono}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="contatto_emergenza_relazione"
                  className="text-[10px] uppercase tracking-wide text-text-tertiary"
                >
                  Relazione
                </Label>
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
                    className="h-9 text-xs"
                  />
                ) : (
                  anagrafica.contatto_emergenza_relazione && (
                    <p className="text-text-primary text-sm">
                      {anagrafica.contatto_emergenza_relazione}
                    </p>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditing && (
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className={`flex items-center gap-1.5 h-9 text-xs rounded-full bg-background-secondary/25 ${frameSoft}`}
          >
            <X className="h-3.5 w-3.5" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            size="sm"
            className="flex items-center gap-1.5 h-9 text-xs rounded-full px-5 font-bold bg-gradient-to-br from-primary/30 to-cyan-500/14 border border-primary/26 shadow-[0_0_24px_rgba(2,179,191,0.16)] hover:from-primary/36 hover:to-cyan-500/18 transition text-white"
          >
            <Save className="h-3.5 w-3.5" />
            {updateMutation.isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
