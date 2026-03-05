# Componente: FitnessActivitiesZonesSection

## 📋 Descrizione

Sezione modulare per attività precedenti e zone problematiche. Gestisce array attività precedenti e zone problematiche con add/remove. Utilizzata in `AthleteFitnessTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/fitness/fitness-activities-zones-section.tsx`

## 🔧 Props

```typescript
interface FitnessActivitiesZonesSectionProps {
  isEditing: boolean
  attivitaPrecedenti: string[]
  zoneProblematiche: string[]
  newAttivita: string
  newZona: string
  fitness: { attivita_precedenti; zone_problematiche } | null
  onAttivitaAdd: (value: string) => void
  onAttivitaRemove: (index: number) => void
  onZonaAdd: (value: string) => void
  onZonaRemove: (index: number) => void
  onNewAttivitaChange: (value: string) => void
  onNewZonaChange: (value: string) => void
}
```

## ⚙️ Funzionalità

- Input + bottone aggiungi per attività precedenti
- Lista badge attività con rimozione
- Input + bottone aggiungi per zone problematiche
- Lista badge zone con rimozione
- Grid layout 2 colonne quando editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
