# Componente: MotivationalNotesSection

## 📋 Descrizione

Sezione modulare per note motivazionali. Textarea editabile per note aggiuntive motivazione (max 2000 caratteri). Utilizzata in `AthleteMotivationalTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/motivational/motivational-notes-section.tsx`

## 🔧 Props

```typescript
interface MotivationalNotesSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: { note_motivazionali } | null
  onFormDataChange: (data: Partial<AthleteMotivationalDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Textarea editabile quando editing
- Visualizzazione read-only quando non editing
- Sanitizzazione input (max 2000 caratteri)
- Empty state se nessuna nota

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
