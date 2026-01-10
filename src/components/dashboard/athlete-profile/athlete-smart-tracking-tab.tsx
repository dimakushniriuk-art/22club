/**
 * @fileoverview Tab Smart Tracking per profilo atleta (vista PT)
 * @description Componente per visualizzare e modificare dati smart tracking con supporto storico
 * @module components/dashboard/athlete-profile/athlete-smart-tracking-tab
 */

'use client'

import { Button } from '@/components/ui'
import { useAthleteSmartTracking } from '@/hooks/athlete-profile/use-athlete-smart-tracking'
import { useSmartTrackingForm } from '@/hooks/athlete-profile/use-smart-tracking-form'
import { LoadingState } from '@/components/dashboard/loading-state'
import { ErrorState } from '@/components/dashboard/error-state'
import { Activity, Edit, Save, X } from 'lucide-react'
import {
  DeviceInfoSection,
  ActivitySection,
  HeartRateSection,
  SleepSection,
  CustomMetricsSection,
} from './smart-tracking'

interface AthleteSmartTrackingTabProps {
  athleteId: string
}

export function AthleteSmartTrackingTab({ athleteId }: AthleteSmartTrackingTabProps) {
  const { data: smartTracking, isLoading, error } = useAthleteSmartTracking(athleteId)
  const { isEditing, setIsEditing, formData, setFormData, handleSave, handleCancel, isPending } =
    useSmartTrackingForm({ athleteId, smartTracking })

  if (isLoading) {
    return <LoadingState message="Caricamento dati smart tracking..." />
  }

  if (error) {
    return <ErrorState message="Errore nel caricamento dei dati smart tracking" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Activity className="h-6 w-6 text-teal-400" />
            Smart Tracking
          </h2>
          <p className="text-text-secondary text-sm mt-1">
            Dati da dispositivi wearable e app fitness
            {smartTracking && (
              <span className="ml-2">
                • Ultimo aggiornamento:{' '}
                {new Date(smartTracking.data_rilevazione).toLocaleDateString('it-IT')}
              </span>
            )}
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

      {/* Data Rilevazione e Dispositivo */}
      <DeviceInfoSection
        isEditing={isEditing}
        dataRilevazione={formData.data_rilevazione}
        dispositivoTipo={formData.dispositivo_tipo ?? null}
        dispositivoMarca={formData.dispositivo_marca ?? null}
        onDataRilevazioneChange={(value) => setFormData({ ...formData, data_rilevazione: value })}
        onDispositivoTipoChange={(value) => setFormData({ ...formData, dispositivo_tipo: value })}
        onDispositivoMarcaChange={(value) => setFormData({ ...formData, dispositivo_marca: value })}
      />

      {/* Attività Fisica */}
      <ActivitySection
        isEditing={isEditing}
        passiGiornalieri={formData.passi_giornalieri ?? null}
        calorieBruciate={formData.calorie_bruciate ?? null}
        distanzaPercorsaKm={formData.distanza_percorsa_km ?? null}
        attivitaMinuti={formData.attivita_minuti ?? null}
        onPassiGiornalieriChange={(value) => setFormData({ ...formData, passi_giornalieri: value })}
        onCalorieBruciateChange={(value) => setFormData({ ...formData, calorie_bruciate: value })}
        onDistanzaPercorsaKmChange={(value) =>
          setFormData({ ...formData, distanza_percorsa_km: value })
        }
        onAttivitaMinutiChange={(value) => setFormData({ ...formData, attivita_minuti: value })}
      />

      {/* Battito Cardiaco */}
      <HeartRateSection
        isEditing={isEditing}
        battitoCardiacoMedio={formData.battito_cardiaco_medio ?? null}
        battitoCardiacoMax={formData.battito_cardiaco_max ?? null}
        battitoCardiacoMin={formData.battito_cardiaco_min ?? null}
        onBattitoCardiacoMedioChange={(value) =>
          setFormData({ ...formData, battito_cardiaco_medio: value })
        }
        onBattitoCardiacoMaxChange={(value) =>
          setFormData({ ...formData, battito_cardiaco_max: value })
        }
        onBattitoCardiacoMinChange={(value) =>
          setFormData({ ...formData, battito_cardiaco_min: value })
        }
      />

      {/* Sonno */}
      <SleepSection
        isEditing={isEditing}
        oreSonno={formData.ore_sonno ?? null}
        qualitaSonno={formData.qualita_sonno ?? null}
        onOreSonnoChange={(value) => setFormData({ ...formData, ore_sonno: value })}
        onQualitaSonnoChange={(value) => setFormData({ ...formData, qualita_sonno: value })}
      />

      {/* Metriche Custom */}
      <CustomMetricsSection metricaCustom={smartTracking?.metrica_custom || null} />

      {/* Pulsanti azione */}
      {isEditing && (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      )}
    </div>
  )
}
