# Componente: MotivationalPreferencesSection

## 📋 Descrizione

Sezione modulare per preferenze ambiente e compagnia. Gestisce toggle preferenze ambiente (palestra, casa, outdoor, misto) e preferenze compagnia (solo, partner, gruppo, misto). Utilizzata in `AthleteMotivationalTab`.

## 📁 Percorso File

`src/components/dashboard/athlete-profile/motivational/motivational-preferences-section.tsx`

## 🔧 Props

```typescript
interface MotivationalPreferencesSectionProps {
  isEditing: boolean
  formData: AthleteMotivationalDataUpdate
  motivational: { preferenze_ambiente; preferenze_compagnia } | null
  onTogglePreferenza: (field: 'preferenze_ambiente' | 'preferenze_compagnia', value: string) => void
}
```

## ⚙️ Funzionalità

- Toggle preferenze ambiente (4 opzioni)
- Toggle preferenze compagnia (4 opzioni)
- Badge per preferenze selezionate
- Grid layout 2 colonne

## ✅ Stato Componente

- ✅ **Completato**: Componente funzionante e utilizzato in produzione
