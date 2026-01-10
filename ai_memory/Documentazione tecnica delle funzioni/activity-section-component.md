# Componente: ActivitySection

## 📋 Descrizione

Sezione modulare per attività fisica smart tracking. Gestisce passi giornalieri, calorie bruciate, distanza percorsa (km), attività minuti con input numerici. Utilizzata in `AthleteSmartTrackingTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/smart-tracking/activity-section.tsx`

## 🔧 Props

```typescript
interface ActivitySectionProps {
  isEditing: boolean
  passiGiornalieri: number | null
  calorieBruciate: number | null
  distanzaPercorsaKm: number | null
  attivitaMinuti: number | null
  onPassiGiornalieriChange: (value: number | null) => void
  onCalorieBruciateChange: (value: number | null) => void
  onDistanzaPercorsaKmChange: (value: number | null) => void
  onAttivitaMinutiChange: (value: number | null) => void
}
```

## ⚙️ Funzionalità

- Input passi giornalieri (number)
- Input calorie bruciate (number)
- Input distanza percorsa km (number)
- Input attività minuti (number)
- Grid layout 3 colonne
- Sanitizzazione input numerici
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
