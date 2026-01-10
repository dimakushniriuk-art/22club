# Componente: AIDataNotesSection

## 📋 Descrizione

Sezione modulare per note AI data. Textarea editabile per note aggiuntive AI (max 2000 caratteri). Utilizzata in `AthleteAIDataTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/ai-data/ai-data-notes-section.tsx`

## 🔧 Props

```typescript
interface AIDataNotesSectionProps {
  isEditing: boolean
  formData: AthleteAIDataUpdate
  aiData: { note_ai } | null
  onFormDataChange: (data: Partial<AthleteAIDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Textarea editabile quando editing
- Visualizzazione read-only quando non editing
- Sanitizzazione input (max 2000 caratteri)
- Empty state se nessuna nota

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
