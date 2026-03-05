# Componente: MotivationalMainSection

## 📋 Descrizione

Sezione modulare per motivazione principale e livello motivazione. Gestisce textarea motivazione principale e slider/input livello motivazione (0-100) con progress bar. Utilizzata in `AthleteMotivationalTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/motivational/motivational-main-section.tsx`

## 🔧 Props

```typescript
interface MotivationalMainSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: { motivazione_principale; livello_motivazione } | null
  onFormDataChange: (data: Partial<AthleteMotivationalDataUpdate>) => void
}
```

## ⚙️ Funzionalità

- Textarea motivazione principale (max 1000 caratteri)
- Slider + input livello motivazione (0-100)
- Progress bar visualizzazione livello
- Grid layout 2 colonne

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
