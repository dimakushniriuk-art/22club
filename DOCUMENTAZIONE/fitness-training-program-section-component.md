# Componente: FitnessTrainingProgramSection

## 📋 Descrizione

Sezione modulare per programma allenamento. Gestisce giorni settimana allenamento, durata sessione (minuti), preferenze orario (mattina, pomeriggio, sera) con toggle. Utilizzata in `AthleteFitnessTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/fitness/fitness-training-program-section.tsx`

## 🔧 Props

```typescript
interface FitnessTrainingProgramSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: { giorni_settimana_allenamento; durata_sessione_minuti; preferenze_orario } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
  onTogglePreferenzaOrario: (orario: string) => void
}
```

## ⚙️ Funzionalità

- Input giorni settimana (number)
- Input durata sessione minuti (number)
- Toggle preferenze orario (3 opzioni: mattina, pomeriggio, sera)
- Visualizzazione read-only quando non editing

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
