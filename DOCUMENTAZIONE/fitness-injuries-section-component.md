# Componente: FitnessInjuriesSection

## 📋 Descrizione

Sezione modulare per infortuni pregressi. Gestisce array infortuni con form per aggiungere nuovi (tipo, data, descrizione, recuperato). Utilizzata in `AthleteFitnessTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/fitness/fitness-injuries-section.tsx`

## 🔧 Props

```typescript
interface FitnessInjuriesSectionProps {
  isEditing: boolean
  infortuni: InfortunioPregresso[]
  showInfortunioForm: boolean
  newInfortunio: Partial<InfortunioPregresso>
  fitness: { infortuni_pregressi } | null
  onShowInfortunioFormChange: (show: boolean) => void
  onNewInfortunioChange: (infortunio: Partial<InfortunioPregresso>) => void
  onInfortunioAdd: () => void
  onInfortunioRemove: (index: number) => void
}
```

## ⚙️ Funzionalità

- Lista infortuni con card (tipo, data, descrizione, badge recuperato)
- Form per aggiungere nuovo infortunio
- Bottone rimuovi per ogni infortunio
- Badge "Recuperato" per infortuni recuperati

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
