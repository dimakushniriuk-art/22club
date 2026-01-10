# Componente: FitnessNotesSection

## 📋 Descrizione

Sezione modulare per note fitness. Textarea editabile per note aggiuntive fitness (max 2000 caratteri). Utilizzata in `AthleteFitnessTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/fitness/fitness-notes-section.tsx`

## 🔧 Props

```typescript
interface FitnessNotesSectionProps {
  isEditing: boolean
  formData: AthleteFitnessDataUpdate
  fitness: { note_fitness } | null
  onFormDataChange: (data: Partial<AthleteFitnessDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Textarea editabile quando editing
- Visualizzazione read-only quando non editing
- Sanitizzazione input (max 2000 caratteri)
- Empty state se nessuna nota

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
